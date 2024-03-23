import mongoose from 'mongoose';
import File from "./File.js";

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
    avatarId: {
        type: mongoose.Schema.ObjectId
    },
    age: Number,
    city: String,
    contacts: {
        type: mongoose.Schema.ObjectId,
        ref: 'Contact',
        required: false
    },
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

ProfileSchema.virtual('avatar', {
    ref: File.Chunk,
    localField: 'avatarId',
    foreignField: 'files_id'
})

export default mongoose.model('Profile', ProfileSchema);
