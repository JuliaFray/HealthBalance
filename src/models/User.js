import mongoose from 'mongoose';

import File from './File.js';
import Post from './Post.js';
import UserFriends from './UserFriends.js';
import UserHealthInfo from './UserHealthInfo.js';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  login: {
    type: String,
    required: true,
    unique: true,
  },
  avatarId: {
    type: mongoose.Schema.ObjectId,
  },
  birthDate: Date,
  followers: {
    type: [mongoose.Schema.ObjectId],
    ref: 'User',
    default: [],
  },
  description: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: {
    virtuals: true,
    transform: function(doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.passwordHash;
    },
  },
});


UserSchema.virtual('avatar', {
  ref: File.Chunk,
  localField: 'avatarId',
  foreignField: 'files_id',
  justOne: true,
});

UserSchema.virtual('friendsTo', {
  ref: UserFriends,
  localField: '_id',
  foreignField: 'to',
}).get(arr => {
  return Array.isArray(arr) ? arr.filter(val => val.isAgree) : [];
});

UserSchema.virtual('friends', {
  ref: UserFriends,
  localField: '_id',
  foreignField: 'from',
}).get(arr => {
  return Array.isArray(arr) ? arr.filter(val => val.isAgree) : [];
});

UserSchema.virtual('postCount', {
  ref: Post,
  localField: '_id',
  foreignField: 'author',
  count: true,
});

UserSchema.virtual('healthInfo', {
  ref: UserHealthInfo,
  localField: '_id',
  foreignField: 'author',
  justOne: true,
});

export default mongoose.model('User', UserSchema);
