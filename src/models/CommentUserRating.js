import mongoose from 'mongoose';

const CommentUserRatingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  commentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('CommentUserRating', CommentUserRatingSchema);
