import mongoose from 'mongoose';

const Dialog = new mongoose.Schema({
    user: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Profile',
    },
    name: {
        type: String,
        required: false
    },
}, {
    timestamps: true
});

export default mongoose.model('Dialog', Dialog);
