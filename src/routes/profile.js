import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import {deleteUserImage, getProfile, updateProfile} from '../controllers/UsersController.js';
import upload from '../utils/gridFsStorage.js';

const router = express.Router();

router.use(checkAuth);

router.get('/:id', getProfile);
router.post('/:id', deleteUserImage, upload.single('image'), updateProfile);

export default router;

