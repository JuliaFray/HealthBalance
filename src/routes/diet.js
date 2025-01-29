import express from 'express';
import {createPlan, getAllDiets} from '../controllers/DietPlanController.js';
import {enhanceHeaders} from '../utils/checkAuth.js';

const router = express.Router();

router.use(enhanceHeaders);

router.post('/create', createPlan);
router.get('/', getAllDiets);

export default router;
