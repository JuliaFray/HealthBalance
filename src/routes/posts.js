import express from 'express';

import {
  createComment,
  createArticle,
  deleteArticle,
  deletePostImage,
  getAllArticles,
  getPopularArticles,
  getArticleById,
  getRecommendationArticles,
  getUserArticleComments,
  addArticleToFavorite,
  toggleCommentRating,
  toggleArticleRating,
  updateArticle,
} from '../controllers/PostController.ts';
import checkAuth, { enhanceHeaders } from '../utils/checkAuth.js';
import upload from '../utils/gridFsStorage.js';
import handleErrors from '../utils/handleErrors.js';
import { postCreateValidation } from '../utils/validation.js';

const router = express.Router();

router.use(enhanceHeaders);

router.get('/',checkAuth, getAllArticles);
router.get('/post-comments', checkAuth, getUserArticleComments);
router.put('/:id/like', checkAuth,addArticleToFavorite);
router.put('/:id/rating', checkAuth, toggleArticleRating);
router.get('/popular', checkAuth,getPopularArticles);
router.get('/recommendations', checkAuth,getRecommendationArticles);
router.get('/:id', checkAuth, getArticleById);
router.post('/', checkAuth, postCreateValidation, upload.single('image'), handleErrors, createArticle);
router.put('/:id', checkAuth, postCreateValidation, deletePostImage, upload.single('image'), handleErrors, updateArticle);
router.delete('/:id', checkAuth, deletePostImage, deleteArticle);

router.post('/:id/comment', checkAuth, createComment);
router.put('/:id/comment-rating', checkAuth, toggleCommentRating);

export default router;
