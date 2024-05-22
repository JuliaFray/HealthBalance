import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import {getAllDialogs, getMessagesByDialog} from '../controllers/DialogController.js';

const router = express.Router();

router.use(checkAuth);

router.get('/', getAllDialogs);
router.get('/messages/:id', getMessagesByDialog);

export default router;
