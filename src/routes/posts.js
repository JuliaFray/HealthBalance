import express from 'express';

import {
  addArticleToFavorite,
  createArticle,
  createComment,
  deleteArticle,
  deletePostImage,
  getAllArticles,
  getArticleById,
  getPopularArticles,
  getRecommendationArticles,
  getUserArticleComments,
  toggleArticleRating,
  toggleCommentRating,
  updateArticle,
} from '../controllers/PostController.ts';
import checkAuth, { enhanceHeaders } from '../utils/checkAuth.js';
import upload from '../utils/gridFsStorage.js';
import handleErrors from '../utils/handleErrors.js';
import { postCreateValidation } from '../utils/validation.js';

const router = express.Router();

router.use(checkAuth);
router.use(enhanceHeaders);

router.get('/', getAllArticles);
router.get('/post-comments', getUserArticleComments);
router.put('/:id/like', addArticleToFavorite);
router.put('/:id/rating', toggleArticleRating);
router.get('/popular', getPopularArticles);
router.get('/recommendations', getRecommendationArticles);
router.get('/:id', getArticleById);
router.post('/', postCreateValidation, upload.single('image'), handleErrors, createArticle);
router.put('/:id', postCreateValidation, deletePostImage, upload.single('image'), handleErrors, updateArticle);
router.delete('/:id', deletePostImage, deleteArticle);

router.post('/:id/comment', createComment);
router.put('/:id/comment-rating', toggleCommentRating);

export default router;
