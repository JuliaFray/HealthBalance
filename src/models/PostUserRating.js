import mongoose from 'mongoose';

const PostUserRatingSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('PostUserRating', PostUserRatingSchema);
