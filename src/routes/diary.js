import express from 'express';

import { addFoodToDiary, getDayStat, getDiaryByDate, getFilledDates, removeFood } from '../controllers/DiaryController.js';
import checkAuth, { enhanceHeaders } from '../utils/checkAuth.js';

const router = express.Router();

router.use(enhanceHeaders);
router.use(checkAuth);


router.get('/', getDiaryByDate);
router.post('/add-food', addFoodToDiary);
router.get('/dates', getFilledDates)
router.get('/day-stats', getDayStat)
router.put('/remove-food', removeFood);

export default router;
