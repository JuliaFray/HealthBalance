import * as ERRORS from '../utils/errors.js';
import Profile from '../models/Profile.js';
import Comment from '../models/Comment.js';
import PostUserRating from '../models/PostUserRating.js';
import {removeFile} from './FileController.js';
import Post from '../models/Post.js';
import {Events, sendMsg} from "../configs/ws.js";
import {calculateOffsetAndLimit} from "../utils/helper.js";
import ProfileFriends from "../models/ProfileFriends.js";

export const getAllUsers = async (req, res) => {

    const currentPage = req.query['currentPage'];
    const isFriends = req.query['isFriends'];
    const isFollowers = req.query['isFollowers'];
    const userId = req.query['userId'];

    const profile = await Profile.findOne({_id: {$in: userId || req.userId}})
        .populate('followers')
        .populate('friends')
        .exec();

    let count = await Profile.countDocuments({_id: {$not: {$in: userId || req.userId}}});
    let offsetAndLimit = calculateOffsetAndLimit(currentPage);

    let where = {_id: {$not: {$in: userId || req.userId}}};

    let users = await Profile.find(where)
        .populate('avatar')
        .populate('friends')
        .populate('followers')
        .skip(offsetAndLimit.offset)
        .limit(offsetAndLimit.limit)
        .exec();

    let data = [];
    users.forEach(u => {
        const user = u._doc;
        user.avatar = u.avatar;
        user.isFollowed = profile.followers.map(f => f._id.toString()).includes(u._id.toString());
        user.isFriend = profile.friends.map(f => f.to.toString()).includes(u._id.toString());
        data.push(user);
    });

    if (isFriends && JSON.parse(isFriends)) {
        data = data.filter(u => profile.friends.map(f => f.to.toString()).includes(u._id.toString()));
    }

    if (isFollowers && JSON.parse(isFollowers)) {
        data = data.filter(u => profile.followers.map(f => f._id.toString()).includes(u._id.toString()));
    }

    res.json({
        resultCode: 0,
        data: data,
        totalCount: count
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

export const toggleFollow = async (req, res) => {
    const userId = req.params.id;
    const friendId = req.query['userId'];
    const isFollow = req.query['isFollow'];

    let query;
    if (JSON.parse(isFollow)) {
        query = {$addToSet: {followers: friendId}};
    } else {
        query = {$pull: {followers: friendId}}
    }

    const profile = await Profile.findOneAndUpdate({_id: userId}, query,).exec();

    if (JSON.parse(isFollow)) {
        sendMsg({
            fromId: userId,
            from: `${profile.firstName} ${profile.secondName}`,
            msg: `Пользователь %s теперь подписан на Вас!`
        }, friendId, Events.FOLLOW_EVENT);
    }

    res.json({
        resultCode: 0,
    });
}

export const toggleFriend = async (req, res) => {
    const userId = req.params.id;
    const friendId = req.query['userId'];
    const isAddFriend = req.query['isAddFriend'];


    await ProfileFriends.findOneAndUpdate(
        {from: userId, to: friendId},
        {$set: {isAgree: false}},
        {upsert: true}
    ).exec()
        .then(() => Profile.findOne({_id: userId}).exec())
        .then(profile => {
            if (JSON.parse(isAddFriend)) {
                sendMsg({
                    fromId: userId,
                    from: `${profile.firstName} ${profile.secondName}`,
                    msg: `Пользователь %s хочет добавить Вас в друзья!`
                }, friendId, Events.FRIEND_EVENT);
            }

            res.json({
                resultCode: 0,
            });
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
