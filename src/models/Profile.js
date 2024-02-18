import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    secondName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: false
    },
    avatarUrl: String,
    age: Number,
    city: String,
    aboutMe: String,
    status: {
        type: String,
        get: () => this.status.toLowerCase(),
        set: v => v.toLowerCase()
    },
    contacts: {
        type: mongoose.Schema.ObjectId,
        ref: 'Contact',
        required: false
    },
    followed: {
        type: Boolean,
        default: false
    },
    photos: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
});

export default mongoose.model('Profile', ProfileSchema);
