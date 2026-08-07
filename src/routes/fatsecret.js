import express from 'express';

import { getFoodById, getFoodList } from '../controllers/FatSecretController.js';
import { enhanceHeaders } from '../utils/checkAuth.js';

const router = express.Router();

router.use(enhanceHeaders);

router.get('/list', getFoodList);
router.get('/:id', getFoodById);


export default router;
