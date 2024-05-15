import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import {getAllDialogs} from '../controllers/DialogController.js';

const router = express.Router();

router.use(checkAuth);

router.get('/', getAllDialogs);

export default router;
