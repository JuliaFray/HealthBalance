import mongoose from 'mongoose';
import Message from './Message.js';

const Dialog = new mongoose.Schema({
    users: {
        type: [mongoose.Schema.ObjectId],
        ref: 'User',
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
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

Dialog.virtual('lastMsg', {
    ref: Message,
    localField: '_id',
    foreignField: 'dialog',
    justOne: true,
    options: {sort: {createdAt: -1}}
}).get(msg => msg)

export default mongoose.model('Dialog', Dialog);
