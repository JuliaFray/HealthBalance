import mongoose from 'mongoose';

import Comment from './Comment.js';
import File from './File.js';
import PostUserFavorite from './PostUserFavorite.js';
import PostUserRating from './PostUserRating.js';
import Tag from './Tag.js';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  tags: {
    type: [mongoose.Schema.ObjectId],
    ref: Tag,
    default: [],
  },
  imageId: {
    type: mongoose.Schema.ObjectId,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

PostSchema.virtual('likes', {
  ref: PostUserFavorite,
  localField: '_id',
  foreignField: 'post',
  count: true,
});

PostSchema.virtual('rating', {
  ref: PostUserRating,
  localField: '_id',
  foreignField: 'post',
}).get(arr => {
  return Array.isArray(arr) ? arr.reduce((sum, el) => sum + el.rating, 0) : 0;
});

PostSchema.virtual('userRating', {
  ref: PostUserRating,
  localField: '_id',
  foreignField: 'post',
  justOne: true,
}).get(el => el ? el.rating : 0);

PostSchema.virtual('comments', {
  ref: Comment,
  localField: '_id',
  foreignField: 'post',
});

PostSchema.virtual('image', {
  ref: File.Chunk,
  localField: 'imageId',
  foreignField: 'files_id',
  justOne: true,
});

PostSchema.pre('findOneAndDelete',
  { document: true, errorHandler: true },
  async (error, post, next,
  ) => {
    try {
      await PostUserFavorite.deleteMany({ post: post._id }).exec();
      await PostUserRating.deleteMany({ post: post._id }).exec();
      await Comment.deleteMany({ post: post._id }).exec();
    } catch (e) {
      next(new Error(e));
    }
  });

export default mongoose.model('Post', PostSchema);
