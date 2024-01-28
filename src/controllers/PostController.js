import Post from '../models/Post.js';
import * as ERRORS from '../utils/errors.js';

export const createPost = async (req, res) => {
    try {
        const tags = req.body.tags instanceof Array
            ? req.body.tags
            : req.body.tags.split(',');

        tags.forEach(tag => tag.trim());
        const doc = new Post({
            title: req.body.title,
            text: req.body.text,
            tags: tags,
            imageUrl: req.body.imageUrl,
            author: req.userId
        });


        const post = await doc.save();

        res.json({
            resultCode: 0,
            data: post
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: ERRORS.UNDEFINED_ERROR
        })
    }

};

export const getAll = async (req, res) => {
    try {
        const posts = await Post.find()
            .select(["-__v", "-updatedAt", "-author.__v"])
            .populate({path: 'author', select: (["-__v", "-passwordHash", "-email", "-photos", "-updatedAt", "-createdAt"])})
            .exec();

        res.json({
            resultCode: 0,
            data: posts
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            resultCode: 1,
            error: ERRORS.UNDEFINED_ERROR
        })
    }

};

export const getPost = async (req, res) => {
    try {
        const postId = req.params.id;

        Post.findOneAndUpdate(
            {_id: postId},
            {$inc: {viewsCount: 1}},
            {returnDocument: 'after'}
        ).populate('author').then((post) => {
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

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: ERRORS.UNDEFINED_ERROR
        })
    }
}


export const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;

        const tags = req.body.tags ? req.body.tags.split(',') : [];
        tags.forEach(tag => tag.trim());

        await Post.updateOne(
            {_id: postId},
            {
                title: req.body.title,
                text: req.body.text,
                tags: tags,
                imageUrl: req.body.imageUrl
            }
        ).exec();

        res.json({
            resultCode: 0
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            resultCode: 1,
            message: ERRORS.UNDEFINED_ERROR
        })
    }
}

export const deletePost = async (req, res) => {
    try {
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

    } catch (err) {
        console.log(err);
        res.status(500).json({
            resultCode: 1,
            message: ERRORS.UNDEFINED_ERROR
        })
    }
}

export const getLastTags = async (req, res) => {
    try {
        const posts = await Post.find().limit(5).exec();

        const tags = posts.map(it => it.tags).flat().slice(0, 5);

        res.json(tags);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: ERRORS.UNDEFINED_ERROR
        })
    }

};
