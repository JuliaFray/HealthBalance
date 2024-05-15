import express from 'express';
import checkAuth from '../utils/checkAuth.js';
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

router.use(checkAuth);

router.get('/:id', getProfile);
router.get('/:id/stats', getProfileStats);
router.post('/:id', deleteUserImage, upload.single('image'), updateProfile);

router.put('/:id/toggle-follow', toggleFollow);
router.put('/:id/create-friend', createFriendLink);
router.put('/:id/toggle-friend', toggleFriend);
router.put('/:id/friend-ntf', getFriendNotifications);

export default router;

