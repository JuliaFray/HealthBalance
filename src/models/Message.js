import mongoose from 'mongoose';

const Message = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    toUserId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    text: String,
    dialogId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Dialog',
        required: false
    },
}, {
    timestamps: true
});

export default mongoose.model('Message', Message);
