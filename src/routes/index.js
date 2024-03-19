import express from 'express';
import path from 'path';
import {getLastTags} from "../controllers/PostController.js";
import checkAuth from "../utils/checkAuth.js";
import multer from "multer";

const router = express.Router();
const __dirname = path.resolve(path.dirname(''));

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage});

// router.use(checkAuth);

router.get('/tags', checkAuth, getLastTags);

router.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        status: true,
        url: `/uploads/${req.file.filename}`
    });
});

export default router;

