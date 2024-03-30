import express from 'express';
import {getLastTags} from '../controllers/PostController.js';
import checkAuth from '../utils/checkAuth.js';
import upload from './../utils/gridFsStorage.js';
import {getFileById, uploadFile} from '../controllers/FileController.js';


const router = express.Router();
router.get('/tags', checkAuth, getLastTags);

router.post('/upload', checkAuth, upload.single('image'), uploadFile);
router.get('/image/:id', checkAuth, getFileById);

export default router;

