import express from 'express';

import { getFoodById, getFoodList } from '../controllers/FoodController.js';
import { enhanceHeaders } from '../utils/checkAuth.js';

const router = express.Router();

router.use(enhanceHeaders);

router.get('/list', getFoodList);
router.get('/:id', getFoodById);


export default router;
