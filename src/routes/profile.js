import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import {follow, deleteUserImage, getProfile, getProfileStats, updateProfile} from '../controllers/UsersController.js';
import upload from '../utils/gridFsStorage.js';

const router = express.Router();

router.use(checkAuth);

router.get('/:id', getProfile);
router.get('/:id/stats', getProfileStats);
router.post('/:id', deleteUserImage, upload.single('image'), updateProfile);

router.put('/:id/follow', follow);
router.put('/:id/unfollow', follow);

export default router;

