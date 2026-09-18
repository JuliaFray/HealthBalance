
import { getFoodById, getFoodList } from '../controllers/FatSecretController.js';
import checkAuth from '../utils/checkAuth.js';
import { enhanceHeaders } from '../utils/checkAuth.js';

import express from 'express';

const router = express.Router();

router.use(checkAuth);
router.use(enhanceHeaders);

router.get('/list', getFoodList);
router.get('/:id', getFoodById);


export default router;
