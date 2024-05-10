import express from 'express';
import {postCreateValidation} from '../utils/validation.js';
import handleErrors from '../utils/handleErrors.js';
import checkAuth from '../utils/checkAuth.js';
import {
    createComment,
    createPost,
    deletePost,
    deletePostImage,
    getAll,
    getPopularPosts,
    getPost,
    getRecommendationPosts,
    setFavorites,
    toggleRating,
    updatePost
} from '../controllers/PostController.js';
import upload from '../utils/gridFsStorage.js';

const router = express.Router();

router.use(checkAuth);

router.get('/', getAll);
router.put('/:id/like', setFavorites);
router.put('/:id/rating', toggleRating);
router.get('/popular', getPopularPosts);
router.get('/recommendations', getRecommendationPosts);
router.get('/:id', getPost);
router.post('/', postCreateValidation, upload.single('image'), handleErrors, createPost);
router.put('/:id', postCreateValidation, deletePostImage, upload.single('image'), handleErrors, updatePost);
router.delete('/:id', deletePostImage, deletePost);

router.post('/:id/comment', createComment)

export default router;
