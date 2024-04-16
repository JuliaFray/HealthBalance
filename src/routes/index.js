import express from 'express';
import {getAllTags, getPopularTags} from '../controllers/PostController.js';
import checkAuth from '../utils/checkAuth.js';
import upload from './../utils/gridFsStorage.js';
import {getFileById, uploadFile} from '../controllers/FileController.js';


const router = express.Router();
router.get('/tags', checkAuth, getPopularTags);
router.get('/all-tags', checkAuth, getAllTags);

router.post('/upload', checkAuth, upload.single('image'), uploadFile);
router.get('/image/:id', checkAuth, getFileById);

export default router;

