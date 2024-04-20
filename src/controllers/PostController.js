import Post from '../models/Post.js';
import * as ERRORS from '../utils/errors.js';
import PostUserFavorite from '../models/PostUserFavorite.js';
import Comment from '../models/Comment.js';
import {removeFile} from './FileController.js';
import PostUserRating from '../models/PostUserRating.js';
import Tag from '../models/Tag.js';

export const getAll = async (req, res) => {
    const tags = req.query['tags'];
    const userId = req.query['userId'];
    const isFavoriteStr = req.query['isFavorite'];
    const isBest = req.query['isBest'];
    const filter = req.query['filter'];
    const isFavorite = isFavoriteStr && JSON.parse(isFavoriteStr);

    const popular = await Post.findOne().sort('-viewsCount');

    let where;

    if (userId && !isFavorite) {
        where = {author: {$in: userId}}
    } else {
        if (tags) {
            where = {tags: {$in: tags}}
        } else {
            where = {_id: {$not: {$in: popular._id}}}
        }
    }

    if (filter) {
        where = {
            ...where,
            $or: [
                {title: {$regex: filter, $options: 'i'}},
                {text: {$regex: filter, $options: 'i'}}
            ]
        }
    }

    let posts = await Post.find(where)
        .select(['-__v', '-updatedAt', '-author.__v'])
        .populate('comments')
        .populate({
            path: 'likes',
            match: {'user': {$in: req.userId}}
        })
        .populate('rating')
        .populate({
            path: 'userRating',
            match: {'user': {$in: req.userId}}
        })
        .populate({
            path: 'tags',
            select: ['_id', 'value']
        })
        .populate({
            path: 'author',
            populate: {
                path: 'avatar'
            },
            select: (['-__v', '-age', '-city', '-status', '-contacts'])
        })
        .limit(10)
        .exec();

    if (isBest) {
        if (JSON.parse(isBest)) {
            posts.sort((a, b) => {
                return b.rating - a.rating
            })
        } else {
            posts.sort((a, b) => {
                return b.createdAt - a.createdAt
            })
        }
    }

    if (isFavoriteStr && JSON.parse(isFavoriteStr)) {
        posts = posts.filter(it => !!it.likes)
    }

    res.json({
        resultCode: 0,
        data: posts
    });
}

export const setFavorites = async (req, res) => {
    await PostUserFavorite.findOneAndDelete({post: req.params.id, user: req.userId})
        .then(async (rec) => {
            if (rec) {
                res.json({
                    resultCode: 0
                })
            } else {
                const doc = new PostUserFavorite({
                    post: req.params.id,
                    user: req.userId
                });

                try {
                    await doc.save();

                    res.json({
                        resultCode: 0
                    });
                } catch (e) {
                    console.log(e);
                    res.status(400).json({
                        resultCode: 1,
                        message: ERRORS.UNDEFINED_ERROR
                    })
                }
            }
        }).catch(err => {
            console.log(err);
            res.status(400).json({
                resultCode: 1,
                message: ERRORS.UNDEFINED_ERROR
            })
        });
}

export const toggleRating = async (req, res) => {
    const rating = req.query['rating'];
    const postId = req.params.id;

    await PostUserRating.findOneAndUpdate({
            post: postId,
            user: req.userId
        },
        {$set: {rating: rating}},
        {upsert: true}
    ).exec()

    res.json({
        resultCode: 0
    });
}

export const getPopularPost = async (req, res) => {
    Post.findOne()
        .sort('-viewsCount')
        .populate('image')
        .then((post) => {
            if (!post) {
                res.status(404).json({
                    error: ERRORS.NOT_FOUND
                })
            }
            res.json({
                data: post
            })
        }).catch(err => {
        console.log(err);
        res.status(400).json({
            error: ERRORS.UNDEFINED_ERROR
        })
    });
}

export const getPost = async (req, res) => {
    const postId = req.params.id;

    Post.findOneAndUpdate(
        {_id: postId},
        {$inc: {viewsCount: 1}},
        {returnDocument: 'after'}
    )
        .populate({
            path: 'author',
            populate: {
                path: 'avatar'
            },
        })
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                populate: {
                    path: 'avatar'
                },
            }
        })
        .populate('image')
        .populate('likes')
        .populate('rating')
        .populate({
            path: 'tags',
            select: ['_id', 'value']
        })
        .populate({
            path: 'userRating',
            match: {'user': {$in: req.userId}}
        })
        .then((post) => {
            if (!post) {
                res.status(404).json({
                    error: ERRORS.NOT_FOUND
                })
            }
            res.json({
                data: post
            })
        }).catch(err => {
        console.log(err);
        res.status(400).json({
            error: ERRORS.UNDEFINED_ERROR
        })
    });
}

export const createPost = async (req, res) => {
    const file = req.file;

    const tags = JSON.parse(req.body.tags) instanceof Array
        ? JSON.parse(req.body.tags) : [];
    const tagIds = tags.map(t => t._id);

    const mergedTags = mergeTags([], tags);

    for (const tag of mergedTags.allIds) {
        let update;

        if (mergedTags.forUpdate.includes(tag)) {
            update = {value: tag.value.trim()}
        } else if (mergedTags.forCreate.includes(tag)) {
            update = {value: tag.value.trim(), $inc: {useCount: 1}};
        } else {
            update = {value: tag.value.trim(), $inc: {useCount: -1}};
        }

        await Tag.findOneAndUpdate(
            {_id: tag._id},
            update,
            {upsert: true},
        ).exec();
    }

    const doc = new Post({
        title: req.body.title,
        text: req.body.text,
        imageId: file?.id,
        author: req.userId,
        tags: tagIds
    });

    const newPost = await doc.save();

    res.json({
        resultCode: 0,
        data: newPost
    });
}

export const updatePost = async (req, res) => {
    const postId = req.params.id;
    const file = req.file;

    const tags = JSON.parse(req.body.tags) instanceof Array
        ? JSON.parse(req.body.tags) : [];
    const tagIds = tags.map(t => t._id);

    const post = await Post.findById(postId)
        .populate({
            path: 'tags',
            select: ['_id', 'value']
        })
        .exec();

    const mergedTags = mergeTags(post._doc.tags, tags);


    for (const tag of mergedTags.allIds) {
        let update;

        if (mergedTags.forUpdate.includes(tag)) {
            update = {value: tag.value.trim()}
        } else if (mergedTags.forCreate.includes(tag)) {
            update = {value: tag.value.trim(), $inc: {useCount: 1}};
        } else {
            update = {value: tag.value.trim(), $inc: {useCount: -1}};
        }

        await Tag.findOneAndUpdate(
            {_id: tag._id},
            update,
            {upsert: true},
        ).exec();
    }

    await Post.updateOne(
        {_id: postId},
        {
            title: req.body.title,
            text: req.body.text,
            imageId: file?.id,
            tags: tagIds
        }
    ).exec();

    res.json({
        resultCode: 0
    });
}

export const deletePost = async (req, res) => {
    const postId = req.params.id;

    Post.findOneAndDelete(
        {_id: postId},
    ).then((post) => {
        if (post) {
            res.json({
                resultCode: 0
            })
        } else {
            res.status(404).json({
                resultCode: 1,
                message: ERRORS.NOT_FOUND
            })
        }
    }).catch(err => {
        console.log(err);
        res.status(400).json({
            resultCode: 1,
            message: ERRORS.UNDEFINED_ERROR
        })
    });
}

export const getAllTags = async (req, res) => {
    const tags = await Tag
        .find()
        .sort('-value')
        .select(['_id', 'value'])
        .exec();

    res.json({
        resultCode: 0,
        data: tags
    })
};

export const getPopularTags = async (req, res) => {
    const tags = await Tag
        .find()
        .sort('-useCount')
        .limit(5)
        .exec();

    res.json({
        resultCode: 0,
        data: tags
    })
};

export const createComment = async (req, res) => {
    const postId = req.params.id;

    const doc = new Comment({
        text: req.body.text,
        author: req.userId,
        post: postId
    });

    const comment = await doc.save();

    res.json({
        resultCode: 0,
        data: comment
    });
}

export const deletePostImage = async (req, res, next) => {
    const postId = req.params.id;
    const file = req.file;

    const post = await Post.findOne({_id: postId})
        .populate('image').exec();

    if (!!post?.imageId && (!file || post.imageId !== file.id)) {
        await removeFile(post.imageId)
    }
    next();
}

const mergeTags = (oldTags, newTags) => {
    const forDelete = oldTags.filter(o => !newTags.includes(o));
    const forUpdate = oldTags.filter(o => newTags.includes(o));
    const forCreate = newTags.filter(n => !oldTags.includes(n));
    const allIds = [...oldTags, ...newTags];
    return {
        forDelete,
        forUpdate,
        forCreate,
        allIds
    }
}
