import express from 'express';

import {
  addFood,
  createPlan, deleteDietPlan,
  getAllDiets,
  getOneDiet,
  removeFood,
  updateDietPlan,
} from '../controllers/DietPlanController.js';
import checkAuth, { enhanceHeaders } from '../utils/checkAuth.js';

const router = express.Router();

router.use(enhanceHeaders);
router.use(checkAuth);

router.post('/create', createPlan);
router.get('/', getAllDiets);
router.get('/:id', getOneDiet);
router.put('/:id', updateDietPlan);
router.put('/add-food/:id', addFood);
router.put('/remove-food/:id', removeFood);
router.delete('/:id', deleteDietPlan);

export default router;
