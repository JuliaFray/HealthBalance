import mongoose from 'mongoose';

const PostUserFavoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: true
    },
}, {
    timestamps: true
});

export default mongoose.model('PostUserFavorite', PostUserFavoriteSchema);
