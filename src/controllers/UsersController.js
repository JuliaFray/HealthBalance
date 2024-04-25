import * as ERRORS from '../utils/errors.js';
import Profile from '../models/Profile.js';
import Comment from '../models/Comment.js';
import PostUserRating from '../models/PostUserRating.js';
import {removeFile} from './FileController.js';
import Post from '../models/Post.js';

export const getAllUsers = async (req, res) => {
    const profile = await Profile.findOne({_id: {$in: req.userId}})
        .populate('followers')
        .exec();


    let users = await Profile.find({_id: {$not: {$in: req.userId}}})
        .populate('avatar')
        .exec();

    const data = users.map(u => {
        u.isFollowed = profile.followers.map(f => f._id).includes(u._id);
        return u;
    });

    res.json({
        resultCode: 0,
        data: data,
        totalCount: data.length
    });
};

export const getProfile = async (req, res) => {
    const profile = await Profile
        .findById(req.params.id)
        .populate('avatar')
        .populate({
            path: 'contacts',
            select: ['-_id']
        })
        .exec();


    if (profile) {
        res.json({
            resultCode: 0,
            data: profile
        })
    } else {
        res.status(404).json({
            resultCode: 1,
            error: ERRORS.NOT_FOUND
        })
    }
}

export const getProfileStats = async (req, res) => {
    let favorites = await Post.find()
        .populate({
            path: 'likes',
            match: {'user': {$in: req.params.id}}
        })
        .exec();

    let posts = await Post
        .find({author: {$in: req.params.id}})
        .populate('rating')
        .exec();

    let comments = await Comment
        .find({author: {$in: req.params.id}})
        .exec();

    let marks = await PostUserRating
        .find({user: {$in: req.params.id}})
        .exec();

    res.json({
        resultCode: 0,
        data: {
            posts: posts.length,
            favorites: favorites.filter(it => it.likes).length,
            friends: 0,
            rating: posts.reduce((sum, el) => sum + el.rating, 0) || 0,
            marks: marks.filter(it => it.rating).length || 0,
            comments: comments.length || 0
        }
    })
}

export const updateProfile = async (req, res) => {
    const userId = req.params.id;
    const file = req.file;

    const profile = await Profile.findOneAndUpdate(
        {_id: userId},
        {
            firstName: req.body.firstName,
            secondName: req.body.secondName,
            lastName: req.body.lastName,
            age: req.body.age,
            city: req.body.city,
            description: req.body.description,
            avatarId: file?.id
        },
        {returnDocument: 'after'}
    )
        .populate('avatar')
        .populate({
            path: 'contacts',
            select: ['-_id']
        })
        .exec();

    res.json({
        resultCode: 0,
        data: profile
    });
}

export const follow = async (req, res) => {
    const userId = req.params.id;
    const friendId = req.query['friendId'];

    await Profile.findOneAndUpdate(
        {_id: userId},
        {$push: {followers: [friendId]}},
    ).exec();

    res.json({
        resultCode: 0,
    });

}

export const unfollow = async (req, res) => {
    const userId = req.params.id;
    const friendId = req.query['friendId'];

    await Profile.findOneAndUpdate(
        {_id: userId},
        {$push: {friends: [friendId]}},
    ).exec();

    res.json({
        resultCode: 0,
    });

}

export const deleteUserImage = async (req, res, next) => {
    const userId = req.params.id;
    const file = req.file;

    const profile = await Profile.findOne({_id: userId})
        .populate('avatar').exec();

    if (!!profile?.avatarId && (!file || profile.avatarId !== file.id)) {
        await removeFile(profile.avatarId)
    }
    next();
}
