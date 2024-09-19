import * as ERRORS from '../utils/errors.js';
import Profile from '../models/Profile.js';
import Comment from '../models/Comment.js';
import PostUserRating from '../models/PostUserRating.js';
import {removeFile} from './FileController.js';
import Post from '../models/Post.js';
import {Events, EventsType, sendMsg} from "../configs/ws.js";
import {calculateOffsetAndLimit} from "../utils/helper.js";
import ProfileFriends from "../models/ProfileFriends.js";
import User from "../models/User.js";

export const getAllUsers = async (req, res) => {

    const currentPage = req.query['currentPage'];
    const isFollowers = req.query['isFollowers'];
    const userId = req.query['userId'];

    const profile = await Profile.findOne({_id: {$in: userId || req.userId}})
        .populate('followers')
        .exec();

    let count = await Profile.countDocuments({_id: {$not: {$in: userId || req.userId}}});
    let offsetAndLimit = calculateOffsetAndLimit(currentPage);

    let where = {_id: {$not: {$in: userId || req.userId}}};

    let users = await Profile.find(where)
        .populate('avatar')
        .populate('followers')
        .skip(offsetAndLimit.offset)
        .limit(offsetAndLimit.limit)
        .exec();

    let data = [];
    users.forEach(u => {
        const user = u._doc;
        user.avatar = u.avatar;
        user.isFollowed = profile.followers.map(f => f._id.toString()).includes(u._id.toString());
        data.push(user);
    });

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
    const my = req.userId ? await Profile.findOne({_id: {$in: req.userId}})
        .populate('followers')
        .exec() : null;

    const profile = await Profile
        .findById(req.params.id)
        .populate('avatar')
        .exec();


    const user = await User
        .findById(req.params.id)

    const data = {
        isFollowed: my ? my.followers.map(f => f._id.toString()).includes(profile._id.toString()) : false,
        avatar: profile.avatar,
        createdAt: user.createdAt,
        ...profile._doc
    }

    if (profile) {
        res.json({
            resultCode: 0,
            data: data
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

    let followers = await Profile.findById(req.params.id).populate('followers').exec();

    res.json({
        resultCode: 0,
        data: {
            posts: posts.length,
            favorites: req.userId === req.params.id ? favorites.filter(it => it.likes).length : undefined,
            followers: followers.followers.length,
            rating: posts.reduce((sum, el) => sum + el.rating, 0) || 0,
            marks: req.userId === req.params.id ? marks.filter(it => it.rating).length || 0 : undefined,
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
        sendMsg(
            friendId,
            Events.FOLLOW_EVENT,
            null,
            {
                fromId: userId,
                from: `${profile.firstName} ${profile.secondName}`,
                msg: `Пользователь %s теперь подписан на Вас!`,
                type: EventsType.FOLLOW
            }
        );
    }

    res.json({
        resultCode: 0,
    });
}

export const createFriendLink = async (req, res) => {
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
                sendMsg(
                    friendId,
                    Events.FRIEND_EVENT,
                    null,
                    {
                        fromId: userId,
                        from: `${profile.firstName} ${profile.secondName}`,
                        msg: `Пользователь %s хочет добавить Вас в друзья!`,
                        type: EventsType.FRIEND
                    });
            }

            res.json({
                resultCode: 0,
            });
        });
}

export const toggleFriend = async (req, res) => {
    const userId = req.params.id;
    const fromId = req.query['fromId'];
    const isAgree = req.query['isAgree'];

    if (isAgree && JSON.parse(isAgree)) {
        await ProfileFriends.findOneAndUpdate(
            {from: fromId, to: userId},
            {$set: {isAgree: true}},
            {upsert: true}
        ).exec()
            .then(() => {
                res.json({
                    resultCode: 0,
                });
            });
    } else {
        await ProfileFriends.deleteOne(
            {from: fromId, to: userId}
        ).exec()
            .then(() => {
                res.json({
                    resultCode: 0,
                });
            });
    }
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

export const getFriendNotifications = async (req, res) => {
    await ProfileFriends.find({
        $and: [
            {isAgree: false},
            {to: {$in: req.params.id}}
        ]
    })
        .populate('from')
        .exec()
        .then(ntfs => {
            ntfs.forEach(ntf => {
                sendMsg(
                    req.params.id,
                    Events.FRIEND_EVENT,
                    null,
                    {
                        fromId: ntf.from._id,
                        from: `${ntf.from.firstName} ${ntf.from.secondName}`,
                        msg: `Пользователь %s хочет добавить Вас в друзья!`,
                        type: EventsType.FRIEND
                    });
            })


            res.json({
                resultCode: 0,
            });
        });
}
