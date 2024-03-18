import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import {getAllUsers} from '../controllers/UsersController.js';

const router = express.Router();

router.use(checkAuth);

router.get('/', getAllUsers);
router.post('/', getAllUsers);

export default router;
