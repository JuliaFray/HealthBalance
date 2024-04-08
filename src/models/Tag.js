import mongoose from 'mongoose';

const TagSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true
    },
    useCount: {
        type: Number,
        required: true,
        default: 1
    }
}, {
    timestamps: true
});

export default mongoose.model('Tag', TagSchema);
