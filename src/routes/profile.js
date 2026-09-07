import express from 'express';

import {
  changeAvatar,
  createFriendLink,
  deleteUserImage,
  getFriendNotifications,
  getUserById,
  getProfileStats,
  toggleFollow,
  toggleFriend,
  updateProfile,
} from '../controllers/UsersController.js';
import checkAuth, {enhanceHeaders} from '../utils/checkAuth.js';
import upload from '../utils/gridFsStorage.js';

const router = express.Router();

router.use(enhanceHeaders);




export default router;

