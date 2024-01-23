import express from 'express';
import mongoose from 'mongoose';
import checkAuth from './src/utils/checkAuth.js';

import {loginValidation, postCreateValidation, registerValidation} from './src/validations/validation.js';

import {login, register, status} from './src/controllers/UserController.js';
import {createPost, deletePost, getAll, getLastTags, getPost, updatePost} from './src/controllers/PostController.js';
import multer from 'multer';
import handleErrors from "./src/utils/handleErrors.js";
import cors from "cors";
import {getProfile} from "./src/controllers/ProfileController.js";

//RXXugsdtnQeV96uu
//JoE8prZL4Mhy44Ww

mongoose.connect('mongodb+srv://admin:JoE8prZL4Mhy44Ww@dmj.vhcqjvw.mongodb.net/menu?retryWrites=true&w=majority'
).then(() => console.log('DB OK'))
    .catch((error) => console.log(error));

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage});

//==========Routing==========//

//========== auth ==========//
const auth = '/auth';

app.post(`${auth}/register`, registerValidation, handleErrors, register);
app.post(`${auth}/login`, loginValidation, handleErrors, login);
app.get(`${auth}/status`, checkAuth, status);

//========== posts ==========//
const posts = '/posts';

app.get(`${posts}`, getAll);
app.get(`${posts}/:id`, getPost);
app.post(`${posts}`, checkAuth, postCreateValidation, handleErrors, createPost);
app.put(`${posts}/:id`, checkAuth, postCreateValidation, handleErrors, updatePost);
app.delete(`${posts}/:id`, checkAuth, deletePost);

//========== tags ==========//
const tags = '/tags';

app.get(`${tags}`, getLastTags);


//========== file ==========//
app.post(`/upload`, checkAuth, upload.single('image'), (req, res) => {
    res.json({
        status: true,
        url: `/uploads/${req.file.filename}`
    });
});


//========== profile ==========//
const profile = '/profile';

app.get(`${profile}/:id`, checkAuth, getProfile);
// app.get(`${profile}/status/:id`, checkAuth, null);
// app.put(`${profile}/status`, null);
// app.put(`${profile}`, null);


//==========Start app==========//

app.listen(8000, (err) => {
    if (err) {
        return console.log(err)
    }
    return console.log('Server OK')
});
