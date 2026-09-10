import express from 'express';

import checkAuth from '#utils/checkAuth.js';

import { getFoodById, getFoodList } from '../controllers/OpenFoodController.js';
import { enhanceHeaders } from '../utils/checkAuth.js';

const router = express.Router();

router.use(checkAuth);
router.use(enhanceHeaders);

router.get('/list', getFoodList);
router.get('/:id', getFoodById);


export default router;
