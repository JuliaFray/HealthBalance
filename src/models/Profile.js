import mongoose from 'mongoose';
import File from "./File.js";
import Contact from "./Contact.js";
import ProfileFriends from "./ProfileFriends.js";

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

ProfileSchema.virtual('friends1', {
    ref: ProfileFriends,
    localField: '_id',
    foreignField: 'to',
}).get(arr => {
    return Array.isArray(arr) ? arr.filter(val => val.isAgree) : []
})

ProfileSchema.virtual('friends', {
    ref: ProfileFriends,
    localField: '_id',
    foreignField: 'from',
}).get(arr => {
    return Array.isArray(arr) ? arr.filter(val => val.isAgree) : []
})

export default mongoose.model('Profile', ProfileSchema);
