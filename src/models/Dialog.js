import mongoose from 'mongoose';

const Dialog = new mongoose.Schema({
    users: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Profile',
    },
    name: {
        type: String,
        required: false
    },
    isPrivate: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Dialog', Dialog);
