import express from 'express';

import upload from '#utils/gridFsStorage.js';

import {
  changeAvatar, createFriendLink,
  deleteUserImage,
  getAllUsers, getFriendNotifications,
  getProfileStats,
  getUserById, toggleFollow, toggleFriend, updateProfile,
} from '../controllers/UsersController.js';
import checkAuth, {enhanceHeaders} from '../utils/checkAuth.js';

const router = express.Router();

router.use(checkAuth);
router.use(enhanceHeaders);

router.get('/', getAllUsers);
router.post('/', getAllUsers);
router.put('/:id/change-avatar', changeAvatar)

router.get('/:id', getUserById);
router.get('/:id/stats', getProfileStats);
router.post('/:id', deleteUserImage, upload.single('image'), updateProfile);

router.put('/:id/toggle-follow', toggleFollow);
router.put('/:id/create-friend', createFriendLink);
router.put('/:id/toggle-friend', toggleFriend);
router.put('/:id/friend-ntf', getFriendNotifications);

export default router;
