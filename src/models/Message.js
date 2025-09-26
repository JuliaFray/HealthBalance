import mongoose from 'mongoose';

const Message = new mongoose.Schema({
    from: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    to: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    text: String,
    dialog: {
        type: mongoose.Schema.ObjectId,
        ref: 'Dialog',
        required: false
    },
}, {
    timestamps: true
});

export default mongoose.model('Message', Message);
