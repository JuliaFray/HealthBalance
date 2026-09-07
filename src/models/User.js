import mongoose from 'mongoose';

import File from './File.js';
import Post from './Post.js';
import UserConfig from './UserConfig.js';
import UserFriends from './UserFriends.js';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  login: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  isVerified: { type: Boolean, default: false },
  avatarId: Number,
  //Подписчики
  followers: {
    type: [mongoose.Schema.ObjectId],
    ref: 'User',
    default: [],
  },
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


// UserSchema.virtual('avatar', {
//   ref: File.Chunk,
//   localField: 'avatarId',
//   foreignField: 'files_id',
//   justOne: true,
// });

UserSchema.virtual('friendsTo', {
  ref: UserFriends,
  localField: '_id',
  foreignField: 'toUserId',
}).get(arr => {
  return Array.isArray(arr) ? arr.filter(val => val.isAgree) : [];
});

UserSchema.virtual('friends', {
  ref: UserFriends,
  localField: '_id',
  foreignField: 'fromUserId',
}).get(arr => {
  return Array.isArray(arr) ? arr.filter(val => val.isAgree) : [];
});

UserSchema.virtual('postCount', {
  ref: Post,
  localField: '_id',
  foreignField: 'userId',
  count: true,
});

UserSchema.virtual('config', {
  ref: UserConfig,
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

export default mongoose.model('User', UserSchema);
