import mongoose from "mongoose";
import Profile from "./Profile.js";

const FriendsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: Profile,
        required: true
    },
    friends: [
        {
            type: mongoose.Schema.ObjectId,
            ref: Profile
        }
    ]
})

export default mongoose.model('Friends', FriendsSchema)
