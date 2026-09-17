import express from 'express';

import { getFoodById, getFoodList } from '../controllers/FoodController.ts';
import checkAuth from '../utils/checkAuth.js';
import { enhanceHeaders } from '../utils/checkAuth.js';

const router = express.Router();

router.use(checkAuth);
router.use(enhanceHeaders);

router.get('/list', getFoodList);
router.get('/:id', getFoodById);

// router.post('/:id', createFood);
// router.put('/:id', editFood);

export default router;
