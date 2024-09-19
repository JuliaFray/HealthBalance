import express from 'express';
import checkAuth, {enhanceHeaders} from '../utils/checkAuth.js';
import {
    createFriendLink,
    deleteUserImage,
    getFriendNotifications,
    getProfile,
    getProfileStats,
    toggleFollow,
    toggleFriend,
    updateProfile
} from '../controllers/UsersController.js';
import upload from '../utils/gridFsStorage.js';

const router = express.Router();

router.use(enhanceHeaders);

router.get('/:id', getProfile);
router.get('/:id/stats', getProfileStats);
router.post('/:id', checkAuth, deleteUserImage, upload.single('image'), updateProfile);

router.put('/:id/toggle-follow', checkAuth, toggleFollow);
router.put('/:id/create-friend', checkAuth, createFriendLink);
router.put('/:id/toggle-friend', checkAuth, toggleFriend);
router.put('/:id/friend-ntf', getFriendNotifications);

export default router;

