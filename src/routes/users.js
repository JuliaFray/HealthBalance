
import {
  changeAvatar,
  createFriendLink,
  getAllUsers,
  getFriendNotifications,
  getProfileStats,
  getUserById,
  toggleFollow,
  toggleFriend,
  updateProfile,
} from '../controllers/UsersController.js';
import checkAuth, { enhanceHeaders } from '../utils/checkAuth.js';

import express from 'express';

const router = express.Router();

router.use(checkAuth);
router.use(enhanceHeaders);

router.get('/', getAllUsers);
router.post('/', getAllUsers);
router.put('/:id/change-avatar', changeAvatar);

router.get('/:id', getUserById);
router.get('/:id/stats', getProfileStats);
router.put('/:id/change-profile', updateProfile);

router.put('/:id/toggle-follow', toggleFollow);
router.put('/:id/create-friend', createFriendLink);
router.put('/:id/toggle-friend', toggleFriend);
router.put('/:id/friend-ntf', getFriendNotifications);

export default router;
