import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
    lookingForAJob: Boolean,
    lookingForAJobDescription: Boolean,
    fullName: {
        type: String,
        required: true
    },
    aboutMe: String,
    contacts: {
        type: mongoose.Schema.ObjectId,
        ref: 'Contact',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Profile', ProfileSchema);
