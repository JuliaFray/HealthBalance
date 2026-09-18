import { getAllTags, getPopularAuthors, getPopularTags } from '../controllers/PostController.js';

import express from 'express';


const router = express.Router();
router.get('/tags', getPopularTags);
router.get('/authors', getPopularAuthors);
router.get('/posts/all-tags', getAllTags);

// router.post('/upload', checkAuth, upload.single('image'), uploadFile);
// router.get('/image/:id', checkAuth, getFileById);

export default router;

