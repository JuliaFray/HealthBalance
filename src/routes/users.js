import express from 'express';
import checkAuth, {enhanceHeaders} from '../utils/checkAuth.js';
import {getAllUsers} from '../controllers/UsersController.js';

const router = express.Router();

// router.use(checkAuth);
router.use(enhanceHeaders);

router.get('/', getAllUsers);
router.post('/', getAllUsers);

export default router;
