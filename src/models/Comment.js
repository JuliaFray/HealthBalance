import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Profile',
        required: true
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Comment', CommentSchema);
