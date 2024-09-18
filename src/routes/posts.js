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
    getUserPostComments,
    setFavorites,
    toggleCommentRating,
    toggleRating,
    updatePost
} from '../controllers/PostController.js';
import upload from '../utils/gridFsStorage.js';

const router = express.Router();

router.get('/', getAll);
router.get('/post-comments', getUserPostComments);
router.put('/:id/like', setFavorites);
router.put('/:id/rating', toggleRating);
router.get('/popular', getPopularPosts);
router.get('/recommendations', getRecommendationPosts);
router.get('/:id', getPost);
router.post('/', checkAuth, postCreateValidation, upload.single('image'), handleErrors, createPost);
router.put('/:id', checkAuth, postCreateValidation, deletePostImage, upload.single('image'), handleErrors, updatePost);
router.delete('/:id', checkAuth, deletePostImage, deletePost);

router.post('/:id/comment', checkAuth, createComment);
router.put('/:id/comment-rating', checkAuth, toggleCommentRating);

export default router;
