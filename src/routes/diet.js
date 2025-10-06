import express from 'express';
import {createPlan, getAllDiets, getOneDiet} from '../controllers/DietPlanController.js';
import {enhanceHeaders} from '../utils/checkAuth.js';

const router = express.Router();

router.use(enhanceHeaders);

router.post('/create', createPlan);
router.get('/', getAllDiets);
router.get('/:id', getOneDiet)

export default router;
