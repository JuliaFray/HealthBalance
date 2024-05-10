import mongoose from 'mongoose';

const ProfileFriends = new mongoose.Schema({
    from: {
        type: mongoose.Schema.ObjectId,
        ref: 'Profile',
    },
    to: {
        type: mongoose.Schema.ObjectId,
        ref: 'Profile',
    },
    isAgree: {
        type: Boolean,
        required: true,
        default: false
    },
}, {
    timestamps: true
});

export default mongoose.model('ProfileFriends', ProfileFriends);
