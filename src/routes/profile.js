import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import {getProfile}from '../controllers/UsersController.js';

const router = express.Router();

router.use(checkAuth);

router.get('/:id', getProfile);

export default router;

