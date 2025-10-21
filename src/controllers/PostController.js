import Comment from '../models/Comment.js';
import CommentUserRating from '../models/CommentUserRating.js';
import Post from '../models/Post.js';
import PostUserFavorite from '../models/PostUserFavorite.js';
import PostUserRating from '../models/PostUserRating.js';
import Tag from '../models/Tag.js';
import User from '../models/User.js';
import * as ERRORS from '../utils/errors.js';
import { calculateOffsetAndLimit } from '../utils/helper.js';

import { removeFile } from './FileController.js';

export const getAll = async (req, res) => {
  const userId = req.query['userId'];

  let searchValue = req.query['searchValue'];
  const tabIndex = +req.query['tabIndex'];
  const tags = req.query['tags'];
  const authors = req.query['authors'];
  const currentPage = req.query['currentPage'];
  const isFavoritePosts = !!req.query['isFavoritePosts'] && JSON.parse(req.query['isFavoritePosts']);
  const isMinePosts = !!req.query['isMinePosts'] && JSON.parse(req.query['isMinePosts']);

  const where = [];

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
    where.push({ author: { $in: JSON.parse(authors) } });
  }

  if (isMinePosts && !isFavoritePosts) {
    where.push({ author: { $in: userId } });
  }

  if (tabIndex === 0 && userId) {
    const profile = await User.findById(userId)
      .populate('followers')
      .exec();

    if (profile) {
      where.push({ author: { $in: profile.followers } });
    }
  }

  let query = where.length ? { $and: [...where] } : {};

  let count = await Post.countDocuments(query).exec();
  let offsetAndLimit = calculateOffsetAndLimit(currentPage);

  let posts;

  if (isFavoritePosts) {
    posts = await Post.find(query, {}, { sort: { createdAt: -1 } })
      .select(['-__v', '-updatedAt', '-author.__v'])
      .populate('comments')
      .populate({ path: 'likes', match: { 'user': { $in: req.userId } } })
      .populate({ path: 'rating' })
      .populate({ path: 'userRating', match: { 'user': { $in: req.userId } } })
      .populate({ path: 'tags', select: ['_id', 'value'] })
      .populate({
        path: 'author', populate: { path: 'avatar' },
        select: (['-__v', '-age', '-city', '-status', '-contacts']),
      })
      .exec();
  } else {
    posts = await Post.find(query, {}, { sort: { createdAt: -1 } })
      .select(['-__v', '-updatedAt', '-author.__v'])
      .populate('comments')
      .populate({ path: 'likes', match: { 'user': { $in: req.userId } } })
      .populate({ path: 'rating' })
      .populate({ path: 'userRating', match: { 'user': { $in: req.userId } } })
      .populate({ path: 'tags', select: ['_id', 'value'] })
      .populate({
        path: 'author', populate: { path: 'avatar' },
        select: (['-__v', '-age', '-city', '-status', '-contacts']),
      })
      .limit(offsetAndLimit.limit)
      .skip(offsetAndLimit.offset)
      .exec();
  }

  if (isFavoritePosts) {
    count = posts.filter(it => !!it.likes).length;
    posts = posts.filter(it => !!it.likes);
  }

  if (userId && tabIndex === 2 || !userId && tabIndex === 1) {
    posts.sort((a, b) => {
      return b.rating - a.rating;
    });
  }

  res.json({
    resultCode: 0,
    data: posts,
    totalCount: count,
  });
};

export const setFavorites = async (req, res) => {
  await PostUserFavorite.findOneAndDelete({ post: req.params.id, user: req.userId })
    .then(async (rec) => {
      if (rec) {
        res.json({
          resultCode: 0,
        });
      } else {
        const doc = new PostUserFavorite({
          post: req.params.id,
          user: req.userId,
        });

        try {
          await doc.save();

          res.json({
            resultCode: 0,
          });
        } catch (e) {
          console.log(e);
          res.status(400).json({
            resultCode: 1,
            message: ERRORS.UNDEFINED_ERROR,
          });
        }
      }
    }).catch(err => {
      console.error(err);
      res.status(400).json({
        resultCode: 1,
        message: ERRORS.UNDEFINED_ERROR,
      });
    });
};

export const toggleRating = async (req, res) => {
  const rating = req.query['rating'];
  const postId = req.params.id;

  await PostUserRating.findOneAndUpdate({
    post: postId,
    user: req.userId,
  },
  { $set: { rating: rating } },
  { upsert: true },
  ).exec()
    .then(() => {
      res.json({
        resultCode: 0,
      });
    });
};

export const getPopularPosts = async (req, res) => {
  Post.find()
    .sort('-viewsCount')
    .populate('image')
    .limit(5)
    .then((post) => {
      if (!post) {
        res.status(404).json({
          resultCode: 1,
          error: ERRORS.NOT_FOUND,
        });
      }
      res.json({
        data: post,
        resultCode: 0,
      });
    }).catch(err => {
      console.error(err);
      res.status(400).json({
        error: ERRORS.UNDEFINED_ERROR,
        resultCode: 1,
      });
    });
};

export const getRecommendationPosts = async (req, res) => {
  const postId = req.query['postId'];

  await Post.findById(postId).populate({
    path: 'tags',
    select: ['_id', 'value'],
  }).exec()
    .then(post => {

      if (!post) {
        res.status(404).json({
          resultCode: 1,
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
          path: 'author',
          populate: { path: 'avatar' },
          select: (['-__v', '-age', '-city', '-status', '-contacts']),
        })
        .limit(5)
        .exec();
    })
    .then(posts => {
      res.json({
        data: posts,
        resultCode: 0,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

export const getPost = async (req, res) => {
  const postId = req.params.id;

  Post.findOneAndUpdate(
    { _id: postId },
    { $inc: { viewsCount: 1} },
    { returnDocument: 'after' },
  )
    .populate({
      path: 'author',
      populate: { path: 'avatar' },
    })
    .populate({
      path: 'comments',
      populate: [
        {
          path: 'author',
          populate: { path: 'avatar' },
        },
        { path: 'rating' },
        { path: 'userRating' },
      ],
    })
    .populate('image')
    .populate({ path: 'likes', match: { 'user': { $in: req.userId } } })
    .populate('rating')
    .populate({
      path: 'tags',
      select: ['_id', 'value'],
    })
    .populate({
      path: 'userRating',
      match: { 'user': { $in: req.userId } },
    })
    .then((post) => {
      if (!post) {
        res.status(404).json({
          error: ERRORS.NOT_FOUND,
          resultCode: 1,
        });
        return;
      }
      res.json({
        data: post,
        resultCode: 0,
      });
    }).catch(err => {
      console.error(err);
      res.status(400).json({
        error: ERRORS.UNDEFINED_ERROR,
        resultCode: 1,
      });
    });
};

export const createPost = async (req, res) => {
  const file = req.file;

  const tags = JSON.parse(req.body.tags) instanceof Array
    ? JSON.parse(req.body.tags) : [];
  const tagIds = tags.map(t => t._id);

  const mergedTags = mergeTags([], tags);

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

  const doc = new Post({
    title: req.body.title,
    text: req.body.text,
    imageId: file?.id,
    author: req.userId,
    tags: tagIds,
  });

  const newPost = await doc.save();

  res.json({
    resultCode: 0,
    data: newPost,
  });
};

export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const file = req.file;

  const tags = JSON.parse(req.body.tags) instanceof Array
    ? JSON.parse(req.body.tags) : [];
  const tagIds = tags.map(t => t._id);

  const post = await Post.findById(postId)
    .populate({
      path: 'tags',
      select: ['_id', 'value'],
    })
    .exec();

  const mergedTags = mergeTags(post._doc.tags, tags);


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

  await Post.updateOne(
    { _id: postId },
    {
      title: req.body.title,
      text: req.body.text,
      imageId: file?.id,
      tags: tagIds,
    },
  ).exec();

  res.json({
    resultCode: 0,
  });
};

export const deletePost = async (req, res) => {
  const postId = req.params.id;

  Post.findOneAndDelete(
    { _id: postId },
  ).then((post) => {
    if (post) {
      res.json({
        resultCode: 0,
      });
    } else {
      res.status(404).json({
        resultCode: 1,
        message: ERRORS.NOT_FOUND,
      });
    }
  }).catch(err => {
    console.log(err);
    res.status(400).json({
      resultCode: 1,
      message: ERRORS.UNDEFINED_ERROR,
    });
  });
};

export const getAllTags = async (req, res) => {
  const tags = await Tag
    .find()
    .sort('-value')
    .select(['_id', 'value'])
    .exec();

  res.json({
    resultCode: 0,
    data: tags,
  });
};

export const getPopularTags = async (req, res) => {
  const tags = await Tag
    .find()
    .sort('-useCount')
    .limit(4)
    .exec();


  res.json({
    resultCode: 0,
    data: tags.filter(tag => tag.useCount > 0),
  });
};


export const getPopularAuthors = async (req, res) => {
  const authors = await User
    .find()
    .populate('postCount')
    .limit(4)
    .select(['_id', 'login', 'postCount'])
    .sort('postCount')
    .exec();


  res.json({
    resultCode: 0,
    data: authors.map(author => ({
      _id: author._id,
      value: author.login,
      useCount: author.postCount,
    })).filter(author => author.useCount > 0),
  });
};

export const createComment = async (req, res) => {
  const postId = req.params.id;

  const doc = new Comment({
    text: req.body.text,
    author: req.userId,
    post: postId,
  });

  const comment = await doc.save();

  res.json({
    resultCode: 0,
    data: comment,
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

export const toggleCommentRating = async (req, res) => {
  const rating = req.query['rating'];
  const commentId = req.params.id;

  await CommentUserRating.findOneAndUpdate({
    comment: commentId,
    user: req.userId,
  },
  { $set: { rating: rating } },
  { upsert: true },
  ).exec()
    .then(() => {
      res.json({
        resultCode: 0,
      });
    });
};

export const getUserPostComments = async (req, res) => {
  const userId = req.query['userId'];

  await Post.find()
    .populate({
      path: 'author',
      populate: { path: 'avatar' },
    })
    .populate({
      path: 'comments',
      populate: [
        {
          path: 'author',
          populate: { path: 'avatar' },
        },
        { path: 'rating' },
        { path: 'userRating' },
      ],
    })
    .exec()
    .then(data => {
      const finData = data;

      finData.forEach(post => {
        post.comments = post.comments.filter(com => com.author._id.toString() === userId);
      });

      res.json({
        data: finData.filter(it => !!it.comments.length),
        resultCode: 0,
      });
    });
};
