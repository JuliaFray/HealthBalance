import mongoose from 'mongoose';

import CommentUserRating from './CommentUserRating.js';

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

CommentSchema.virtual('rating', {
  ref: CommentUserRating,
  localField: '_id',
  foreignField: 'commentId',
}).get(arr => {
  return Array.isArray(arr) ? arr.reduce((sum, el) => sum + el.rating, 0) : 0;
});

CommentSchema.virtual('userRating', {
  ref: CommentUserRating,
  localField: '_id',
  foreignField: 'commentId',
  justOne: true,
}).get(el => el ? el.rating : 0);

export default mongoose.model('Comment', CommentSchema);
