import mongoose from 'mongoose';

const PostUserRatingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: true
    },
    rating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('PostUserRating', PostUserRatingSchema);
