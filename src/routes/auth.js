import express from 'express';

import { confirmEmail, login, register, resendLink, status } from '../controllers/AuthController.js';
import {loginValidation, registerValidation} from '../utils/validation.js';
import checkAuth from '../utils/checkAuth.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/status', checkAuth, status);
router.get('/confirmation/:email/:token', confirmEmail);
router.post('/resendLink', resendLink)

export default router;
