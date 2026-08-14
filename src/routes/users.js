import express from 'express';

import { changeAvatar, getAllUsers } from '../controllers/UsersController.js';
import checkAuth, {enhanceHeaders} from '../utils/checkAuth.js';

const router = express.Router();

// router.use(checkAuth);
router.use(enhanceHeaders);

router.get('/', getAllUsers);
router.post('/', getAllUsers);
router.put('/:id/change-avatar', changeAvatar)

export default router;
