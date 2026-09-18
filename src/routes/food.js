
import { getFoodById, getFoodList } from '../controllers/FoodController.js';
import checkAuth from '../utils/checkAuth.js';
import { enhanceHeaders } from '../utils/checkAuth.js';

import express from 'express';

const router = express.Router();

router.use(checkAuth);
router.use(enhanceHeaders);

router.get('/list', getFoodList);
router.get('/:id', getFoodById);

// router.post('/:id', createFood);
// router.put('/:id', editFood);

export default router;
