import { StatusCode } from '#enums/status-code.enum.ts';

import { Events, EventsType, sendMsg } from '../configs/ws.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import PostUserRating from '../models/PostUserRating.js';
import User from '../models/User.js';
import UserFriends from '../models/UserFriends.js';
import * as ERRORS from '../utils/errors.js';
import { calculateOffsetAndLimit } from '../utils/helper.js';

import { removeFile } from './FileController.js';


export const getAllUsers = async (req, res) => {

  const currentPage = req.query['currentPage'];
  const isFollowers = req.query['isFollowers'];
  const userId = req.query['userId'];

  const profile = await User.findOne({ _id: { $in: userId || req.userId } })
    .populate('followers')
    .exec();

  let count = await User.countDocuments({ _id: { $not: { $in: userId || req.userId } } });
  let offsetAndLimit = calculateOffsetAndLimit(currentPage);

  let where = { _id: { $not: { $in: userId || req.userId } } };

  let users = await User.find(where)
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
    totalCount: count,
  });
};

export const getUserById = async (req, res) => {
  const profile = req.params.id ? await User.findOne({ _id: { $in: req.params.id } })
    .populate('followers')
    .exec() : null;

  if (!profile) {
    res.status(StatusCode.NotFound).json({
      message: ERRORS.NOT_FOUND,
    });
    return;
  }

  const data = {
    isFollowed: profile.followers.map(f => f._id.toString()).includes(req.params.id.toString()),
    avatar: profile.avatar,
    createdAt: profile.createdAt,
    ...profile._doc,
  };

  res.status(StatusCode.Success).json({
    data: data,
  });
};

export const getProfileStats = async (req, res) => {
  let favorites = await Post.find()
    .populate({
      path: 'likes',
      match: { 'userId': { $in: req.params.id } },
    })
    .exec();

  let posts = await Post
    .find({ userId: { $in: req.params.id } })
    .populate('rating')
    .exec();

  let comments = await Comment
    .find({ userId: { $in: req.params.id } })
    .exec();

  let marks = await PostUserRating
    .find({ userId: { $in: req.params.id } })
    .exec();

  let profile = await User.findById(req.params.id).populate('followers').exec();
  const userId = req.userId;
  let folowsCount = await User.find({ followers: { $in: [req.params.id] } }).exec();

  res.json({
    resultCode: 0,
    data: {
      posts: posts?.length,
      favorites: req.userId === req.params.id ? favorites?.filter(it => it.likes).length : undefined,
      followers: profile?.followers.length,
      rating: posts.reduce((sum, el) => sum + el.rating, 0) || 0,
      marks: req.userId === req.params.id ? marks.filter(it => it.rating).length || 0 : undefined,
      //Комментарии
      comments: comments.length || 0,
      //Подписчики
      followersCount: profile?.followers.length,
      //Подписки
      folowsCount: folowsCount.length,
      //Посты
      postCount: posts?.length,
      isFollowed: profile.followers.map(f => f._id.toString()).includes(userId.toString()),
    },
  });
};

export const updateProfile = async (req, res) => {
  const userId = req.params.id;
  const file = req.file;

  const profile = await User.findOneAndUpdate(
    { _id: userId },
    {
      login: req.body.login,
      birthDate: req.body.birthDate,
      city: req.body.city,
      description: req.body.description,
      avatarId: file?.id,
    },
    { returnDocument: 'after' },
  )
    .exec();

  res.json({
    resultCode: 0,
    data: profile,
  });
};

export const toggleFollow = async (req, res) => {
  const userId = req.params.id;
  const friendId = req.query['userId'];
  const isFollow = req.query['isFollow'];

  let query;
  if (JSON.parse(isFollow)) {
    query = { $addToSet: { followers: userId } };
  } else {
    query = { $pull: { followers: userId } };
  }
  const fromProfile = await User.findById(userId).exec();
  await User.findOneAndUpdate({ _id: friendId }, query).exec();

  if (JSON.parse(isFollow)) {
    sendMsg(
      friendId,
      Events.FOLLOW_EVENT,
      null,
      {
        fromId: userId,
        from: `${fromProfile.login} `,
        msg: 'Пользователь %s теперь подписан на Вас!',
        type: EventsType.FOLLOW,
      },
    );
  }

  res.json({
    resultCode: 0,
  });
};

export const createFriendLink = async (req, res) => {
  const userId = req.params.id;
  const friendId = req.query['userId'];
  const isAddFriend = req.query['isAddFriend'];


  await UserFriends.findOneAndUpdate(
    { fromUserId: userId, toUserId: friendId },
    { $set: { isAgree: false } },
    { upsert: true },
  ).exec()
    .then(() => User.findOne({ _id: userId }).exec())
    .then(profile => {
      if (JSON.parse(isAddFriend)) {
        sendMsg(
          friendId,
          Events.FRIEND_EVENT,
          null,
          {
            fromId: userId,
            from: `${profile.login} `,
            msg: 'Пользователь %s хочет добавить Вас в друзья!',
            type: EventsType.FRIEND,
          });
      }

      res.json({
        resultCode: 0,
      });
    });
};

export const toggleFriend = async (req, res) => {
  const userId = req.params.id;
  const fromId = req.query['fromId'];
  const isAgree = req.query['isAgree'];

  if (isAgree && JSON.parse(isAgree)) {
    await UserFriends.findOneAndUpdate(
      { fromUserId: fromId, toUserId: userId },
      { $set: { isAgree: true } },
      { upsert: true },
    ).exec()
      .then(() => {
        res.json({
          resultCode: 0,
        });
      });
  } else {
    await UserFriends.deleteOne(
      { fromUserId: fromId, toUserId: userId },
    ).exec()
      .then(() => {
        res.json({
          resultCode: 0,
        });
      });
  }
};

export const deleteUserImage = async (req, res, next) => {
  const userId = req.params.id;
  const file = req.file;

  const profile = await User.findOne({ _id: userId }).exec();

  if (!!profile?.avatarId && (!file || profile.avatarId !== file.id)) {
    await removeFile(profile.avatarId);
  }
  next();
};

export const getFriendNotifications = async (req, res) => {
  await UserFriends.find({
    $and: [
      { isAgree: false },
      { toUserId: { $in: req.params.id } },
    ],
  })
    .populate('fromUserId')
    .exec()
    .then(ntfs => {
      ntfs.forEach(ntf => {
        sendMsg(
          req.params.id,
          Events.FRIEND_EVENT,
          null,
          {
            fromId: ntf.from._id,
            from: `${ntf.from.login} `,
            msg: 'Пользователь %s хочет добавить Вас в друзья!',
            type: EventsType.FRIEND,
          });
      });


      res.json({
        resultCode: 0,
      });
    });
};

export const changeAvatar = async (req, res) => {
  const userId = req.params.id;
  const avatarId = req.body.avatarId;

  await User.findOneAndUpdate(
    { _id: userId },
    {
      avatarId: avatarId,
    },
  ).exec().then(() => {
    res.json({
      resultCode: 0,
    });
  });
};
