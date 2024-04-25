import mongoose from 'mongoose';
import File from "./File.js";
import Contact from "./Contact.js";

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
        ref: Contact,
        required: false
    },
    friends: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Profile',
        default: []
    },
    followers: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Profile',
        default: []
    },
    description: String
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

ProfileSchema.virtual('avatar', {
    ref: File.Chunk,
    localField: 'avatarId',
    foreignField: 'files_id',
    justOne: true
})

export default mongoose.model('Profile', ProfileSchema);
