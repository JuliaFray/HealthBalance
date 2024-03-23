import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import {getProfile, updateProfile, updateProfilePhoto} from '../controllers/UsersController.js';
import upload from '../utils/gridFsStorage.js';

const router = express.Router();

router.use(checkAuth);

router.get('/:id', getProfile);
router.post('/:id', updateProfile);
router.post('/:id/photo', upload.single('image'), updateProfilePhoto);

export default router;

