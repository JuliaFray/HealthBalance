import Post from '../models/Post.js';
import * as ERRORS from '../utils/errors.js';
import PostUser from '../models/PostUser.js';
import Comment from '../models/Comment.js';

export const createPost = async (req, res) => {
    const tags = req.body.tags instanceof Array
        ? req.body.tags
        : req.body.tags.split(',');

    tags.forEach(tag => tag.trim());
    const doc = new Post({
        title: req.body.title,
        text: req.body.text,
        tags: tags,
        imageId: req.body.imageId,
        author: req.userId
    });

    const post = await doc.save();

    res.json({
        resultCode: 0,
        data: post
    });
};


export const getAll = async (req, res) => {
    const tags = req.query['tags'];

    const popular = await Post.findOne()
        .sort('-viewsCount');

    let where = {};

    if (tags) {
        where = {tags: {$in: tags}}
    } else {
        where = {
            _id: {
                $not: {
                    $in: popular._id
                }
            }
        }
    }

    const posts = await Post.find(where)
        .select(['-__v', '-updatedAt', '-author.__v'])
        .populate({
            path: 'likes',
            match: {'user': {$in: req.userId}}
        })
        .populate({
                path: 'author',
                populate: {
                    path: 'avatar'
                },
                select: (['-__v', '-age', '-city', '-status', '-contacts'])
            }
        )
        .exec();

    res.json({
        resultCode: 0,
        data: posts
    });
};

export const setLike = async (req, res) => {
    await PostUser.findOneAndDelete({post: req.params.id, user: req.userId})
        .then(async (rec) => {
            if (rec) {
                res.json({
                    resultCode: 0
                })
            } else {
                const doc = new PostUser({
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


export const updatePost = async (req, res) => {
    const postId = req.params.id;

    const tags = req.body.tags ? req.body.tags.split(',') : [];
    tags.forEach(tag => tag.trim());

    await Post.updateOne(
        {_id: postId},
        {
            title: req.body.title,
            text: req.body.text,
            tags: tags,
            imageId: req.body.imageId
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
        if (!post) {
            res.status(404).json({
                resultCode: 1,
                message: ERRORS.NOT_FOUND
            })
        }

        res.json({
            resultCode: 0
        })
    }).catch(err => {
        console.log(err);
        res.status(400).json({
            resultCode: 1,
            message: ERRORS.UNDEFINED_ERROR
        })
    });
}

export const getLastTags = async (req, res) => {
    const posts = await Post.find().limit(5).exec();

    const tags = posts.map(it => it.tags).flat().slice(0, 5);

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
