import mongoose from 'mongoose';

const UserFriends = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    toUserId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    isAgree: {
        type: Boolean,
        required: true,
        default: false
    },
}, {
    timestamps: true
});

export default mongoose.model('UserFriends', UserFriends);
