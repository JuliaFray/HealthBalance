import express from 'express';
import checkAuth, { enhanceHeaders } from '../utils/checkAuth.js';
import { getDiaryByDate } from '../controllers/DiaryController.js';

const router = express.Router();

router.use(enhanceHeaders);
router.use(checkAuth);

router.get('/', getDiaryByDate);

export default router;
