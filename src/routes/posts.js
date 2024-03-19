import express from 'express';
import {postCreateValidation} from "../utils/validation.js";
import handleErrors from "../utils/handleErrors.js";
import checkAuth from "../utils/checkAuth.js";
import {getAll, setLikes, getPopularPost, getPost, createPost, updatePost, deletePost, createComment} from "../controllers/PostController.js";

const router = express.Router();

router.use(checkAuth);

router.get('/', getAll);
router.put('/:id/like', setLikes);
router.get('/popular', getPopularPost);
router.get('/:id', getPost);
router.post('/', postCreateValidation, handleErrors, createPost);
router.put('/:id', postCreateValidation, handleErrors, updatePost);
router.delete('/:id', deletePost);

router.post('/:id/comment', createComment)

export default router;
