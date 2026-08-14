import type { FilterQuery } from 'mongoose';

import Comment from '#models/Comment.js';
import CommentUserRating from '#models/CommentUserRating.js';
import Post from '#models/Post.js';
import PostUserFavorite from '#models/PostUserFavorite.js';
import PostUserRating from '#models/PostUserRating.js';
import Tag from '#models/Tag.js';
import User from '#models/User.js';

import { StatusCode } from '#enums/status-code.enum.ts';

import * as ERRORS from '#utils/errors.js';
import { calculateOffsetAndLimit } from '#utils/helper.js';


import { removeFile } from './FileController.js';

// -----Articles-----

export const getAllArticles = async (req, res) => {
  const userId = req.query['userId'];

  let searchValue = req.query['searchValue'];
  const tabIndex = req.query['tabIndex'];
  const tags = req.query['tags'];
  const authors = req.query['authors'];
  const currentPage = req.query['currentPage'];
  const isFavoriteArticles = !!req.query['isFavoritePosts'] && JSON.parse(req.query['isFavoritePosts']);
  const isMineArticles = !!req.query['isMinePosts'] && JSON.parse(req.query['isMinePosts']);

  const where: FilterQuery<any>[] = [];

  if (searchValue) {
    searchValue = searchValue.replaceAll('.', '\\.');
    where.push({
      $or: [
        { title: { $regex: searchValue, $options: 'i' } },
        { text: { $regex: searchValue, $options: 'i' } },
      ],
    });
  }

  if (tags && JSON.parse(tags)) {
    JSON.parse(tags).forEach(tag => where.push({ tags: { $in: tag } }));
  }

  if (authors && JSON.parse(authors)) {
    where.push({ userId: { $in: JSON.parse(authors) } });
  }

  if (isMineArticles && !isFavoriteArticles) {
    where.push({ userId: { $in: userId } });
  }

  if (tabIndex === 'mine' && userId) {
    const profile = await User.findById(userId)
      .populate('followers')
      .exec();

    if (profile) {
      where.push({ userId: { $in: profile.followers } });
    }
  }

  let query: FilterQuery<any> = where.length ? { $and: [...where] } : {};

  let count = await Post.countDocuments(query).exec();
  let offsetAndLimit = calculateOffsetAndLimit(currentPage);

  let articles;

  const articlesFindRequest = Post.find(query, {}, { sort: { createdAt: -1 } })
    .select(['-__v', '-updatedAt', '-userId.__v'])
    .populate('comments')
    .populate({ path: 'likes', match: { 'userId': { $in: req.userId } } })
    .populate({ path: 'rating' })
    .populate({ path: 'userRating', match: { 'userId': { $in: req.userId } } })
    .populate({ path: 'tags', select: ['_id', 'value'] })
    .populate({
      path: 'userId',
      select: (['-__v', '-age', '-city', '-status', '-contacts']),
    });

  if (isFavoriteArticles) {
    articles = await articlesFindRequest
      .exec();
  } else {
    articles = await articlesFindRequest
      .limit(offsetAndLimit.limit)
      .skip(offsetAndLimit.offset)
      .exec();
  }

  if (isFavoriteArticles) {
    count = articles.filter(it => !!it.likes).length;
    articles = articles.filter(it => !!it.likes);
  }

  res.status(StatusCode.Success).json({
    data: articles,
    totalCount: count,
  });
};

export const getPopularArticles = async (req, res) => {
  Post.find()
    .sort('-viewsCount')
    .populate('image')
    .limit(5)
    .then((post) => {
      if (!post) {
        res.status(StatusCode.NotFound).json({
          error: ERRORS.NOT_FOUND,
        });
      }
      res.status(StatusCode.Success).json({
        data: post,
      });
    }).catch(err => {
      console.error(err);
      res.status(StatusCode.UndefinedError).json({
        error: ERRORS.UNDEFINED_ERROR,
      });
    });
};

export const getRecommendationArticles = async (req, res) => {
  const postId = req.query['postId'];

  await Post.findById(postId).populate({
    path: 'tags',
    select: ['_id', 'value'],
  }).exec()
    .then(post => {

      if (!post) {
        res.status(StatusCode.NotFound).json({
          message: ERRORS.NOT_FOUND,
        });
        return;
      }

      return Post
        .find({
          $and: [
            { tags: { $in: post.tags } },
            { _id: { $not: { $in: post._id } } },
          ],
        })
        .populate({
          path: 'tags',
          select: ['_id', 'value'],
        })
        .populate({
          path: 'userId',
          select: (['-__v', '-age', '-city', '-status', '-contacts']),
        })
        .limit(5)
        .exec();
    })
    .then(posts => {
      res.status(StatusCode.Success).json({
        data: posts,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

export const getArticleById = async (req, res) => {
  const postId = req.params.id;

  Post.findOneAndUpdate(
    { _id: postId },
    { $inc: { viewsCount: 1 } },
    { returnDocument: 'after' },
  )
    .populate({
      path: 'userId',
    })
    .populate({
      path: 'comments',
      populate: [
        {
          path: 'userId',
        },
        { path: 'rating' },
        { path: 'userRating' },
      ],
    })
    .populate('image')
    .populate({ path: 'likes', match: { 'userId': { $in: req.userId } } })
    .populate('rating')
    .populate({
      path: 'tags',
      select: ['_id', 'value'],
    })
    .populate({
      path: 'userRating',
      match: { 'userId': { $in: req.userId } },
    })
    .then((post) => {
      if (!post) {
        res.status(StatusCode.NotFound).json({
          message: ERRORS.NOT_FOUND,
        });
        return;
      }
      res.status(StatusCode.Success).json({
        data: post,
      });
    }).catch(err => {
      console.error(err);
      res.status(StatusCode.UndefinedError).json({
        message: ERRORS.UNDEFINED_ERROR,
      });
    });
};

export const addArticleToFavorite = async (req, res) => {
  await PostUserFavorite.findOneAndDelete({ postId: req.params.id, userId: req.userId })
    .then(async (rec) => {
      if (rec) {
        res.json({});
      } else {
        const doc = new PostUserFavorite({
          postId: req.params.id,
          userId: req.userId,
        });

        try {
          await doc.save();

          res.status(StatusCode.Success);
        } catch (e) {
          console.log(e);
          res.status(StatusCode.UndefinedError).json({
            message: ERRORS.UNDEFINED_ERROR,
          });
        }
      }
    }).catch(err => {
      console.error(err);
      res.status(StatusCode.UndefinedError).json({
        message: ERRORS.UNDEFINED_ERROR,
      });
    });
};

export const toggleArticleRating = async (req, res) => {
  const rating = req.query['rating'];
  const postId = req.params.id;

  await PostUserRating.findOneAndUpdate({
    postId: postId,
    userId: req.userId,
  },
  { $set: { rating: rating } },
  { upsert: true },
  ).exec()
    .then(() => {
      res.status(StatusCode.Success).json({});
    });
};


const updateTag = async (mergedTags) => {
  for (const tag of mergedTags.allIds) {
    let update;

    if (mergedTags.forUpdate.includes(tag)) {
      update = { value: tag.value.trim() };
    } else if (mergedTags.forCreate.includes(tag)) {
      update = { value: tag.value.trim(), $inc: { useCount: 1 } };
    } else {
      update = { value: tag.value.trim(), $inc: { useCount: -1 } };
    }

    await Tag.findOneAndUpdate(
      { _id: tag._id },
      update,
      { upsert: true },
    ).exec();
  }
};

const mergeTags = (oldTags, newTags) => {
  const forDelete = oldTags.filter(o => !newTags.includes(o));
  const forUpdate = oldTags.filter(o => newTags.includes(o));
  const forCreate = newTags.filter(n => !oldTags.includes(n));
  const allIds = [...oldTags, ...newTags];
  return {
    forDelete,
    forUpdate,
    forCreate,
    allIds,
  };
};

export const createArticle = async (req, res) => {
  const file = req.file;

  const tags = JSON.parse(req.body.tags) instanceof Array
    ? JSON.parse(req.body.tags) : [];
  const tagIds = tags.map(t => t._id);

  const mergedTags = mergeTags([], tags);

  await updateTag(mergedTags);

  const doc = new Post({
    title: req.body.title,
    text: req.body.text,
    imageId: file?.id,
    userId: req.userId,
    tags: tagIds,
  });

  const newPost = await doc.save();

  res.status(StatusCode.Success).json({
    data: newPost,
  });
};

export const updateArticle = async (req, res) => {
  const postId = req.params.id;
  const file = req.file;

  const tags = JSON.parse(req.body.tags) instanceof Array
    ? JSON.parse(req.body.tags) : [];
  const tagIds = tags.map(t => t._id);

  await Post.findById(postId)
    .populate({
      path: 'tags',
      select: ['_id', 'value'],
    })
    .exec().then(async post => {
      if (!post) {
        return res.status(StatusCode.UndefinedError).json({
          message: ERRORS.UNDEFINED_ERROR,
        });
      }

      const mergedTags = mergeTags(post.tags, tags);

      await updateTag(mergedTags);

      await Post.updateOne(
        { _id: postId },
        {
          title: req.body.title,
          text: req.body.text,
          imageId: file?.id,
          tags: tagIds,
        },
      ).exec();

      res.status(StatusCode.Success);

    });
};

export const deleteArticle = async (req, res) => {
  const postId = req.params.id;

  Post.findOneAndDelete(
    { _id: postId },
  ).then((post) => {
    if (post) {
      res.json({});
    } else {
      res.status(StatusCode.NotFound).json({
        message: ERRORS.NOT_FOUND,
      });
    }
  }).catch(err => {
    console.log(err);
    res.status(StatusCode.UndefinedError).json({
      message: ERRORS.UNDEFINED_ERROR,
    });
  });
};

export const deletePostImage = async (req, res, next) => {
  const postId = req.params.id;
  const file = req.file;

  const post = await Post.findOne({ _id: postId })
    .populate('image').exec();

  if (!!post?.imageId && (!file || post.imageId !== file.id)) {
    await removeFile(post.imageId);
  }
  next();
};

// -----Tags-----

export const getAllTags = async (req, res) => {
  const tags = await Tag
    .find()
    .sort('-value')
    .select(['_id', 'value'])
    .exec();

  res.status(StatusCode.Success).json({
    data: tags,
  });
};

export const getPopularTags = async (req, res) => {
  const tags = await Tag
    .find()
    .sort('-useCount')
    .limit(4)
    .exec();


  res.status(StatusCode.Success).json({
    data: tags.filter(tag => tag.useCount > 0),
  });
};


// -----Authors-----

export const getPopularAuthors = async (req, res) => {
  const authors = await User
    .find()
    .populate('postCount')
    .limit(4)
    .select(['_id', 'login', 'postCount'])
    .sort('postCount')
    .exec();


  res.status(StatusCode.Success).json({
    data: authors.map(author => ({
      _id: author._id,
      value: author.login,
      useCount: author.postCount,
    })).filter(author => author.useCount > 0),
  });
};

// -----Comments-----

export const createComment = async (req, res) => {
  const postId = req.params.id;

  const doc = new Comment({
    text: req.body.text,
    userId: req.userId,
    postId: postId,
  });

  const comment = await doc.save();

  res.status(StatusCode.Success).json({
    data: comment,
  });
};

export const toggleCommentRating = async (req, res) => {
  const rating = req.query['rating'];
  const commentId = req.params.id;

  await CommentUserRating.findOneAndUpdate({
    commentId: commentId,
    userId: req.userId,
  },
  { $set: { rating: rating } },
  { upsert: true },
  ).exec()
    .then(() => {
      res.status(StatusCode.Success).json({});
    });
};

export const getUserArticleComments = async (req, res) => {
  const userId = req.query['userId'];

  await Post.find()
    .populate({
      path: 'userId',
    })
    .populate({
      path: 'comments',
      populate: [
        {
          path: 'userId',
        },
        { path: 'rating' },
        { path: 'userRating' },
      ],
    })
    .exec()
    .then(data => {
      const finData = data;

      finData.forEach(post => {
        post.comments = post.comments.filter(com => com.userId._id.toString() === userId);
      });

      res.status(StatusCode.Success).json({
        data: finData.filter(it => !!it.comments.length),
      });
    });
};
