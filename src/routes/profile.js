import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import {deleteUserImage, getProfile, getProfileStats, toggleFollow, toggleFriend, updateProfile} from '../controllers/UsersController.js';
import upload from '../utils/gridFsStorage.js';

const router = express.Router();

router.use(checkAuth);

router.get('/:id', getProfile);
router.get('/:id/stats', getProfileStats);
router.post('/:id', deleteUserImage, upload.single('image'), updateProfile);

router.put('/:id/toggle-follow', toggleFollow);
router.put('/:id/toggle-friend', toggleFriend);

export default router;

