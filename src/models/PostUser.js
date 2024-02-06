import mongoose from 'mongoose';

const PostUserSchema = new mongoose.Schema({
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

export default mongoose.model('PostUser', PostUserSchema);
