import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    avatarUrl: String,
    status: String,
    followed: Boolean,
    photos: {
        type: Array,
        default: []
    }
}, {
    timestamps: true,
    toObject: {
        transform: function (doc, ret, options) {
            ret.id = ret._id,
                delete ret._id;
            delete ret.passwordHash
        }
    }
});

export default mongoose.model('User', UserSchema);
