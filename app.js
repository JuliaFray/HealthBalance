import 'dotenv/config'
import cors from 'cors';
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import * as mongo from './src/configs/mongo.js'
import globalErrorHandler from './src/utils/handleErrors.js'

import indexRouter from './src/routes/index.js';
import usersRouter from './src/routes/users.js';
import authRouter from './src/routes/auth.js';
import postsRouter from './src/routes/posts.js';
import profileRouter from './src/routes/profile.js';
import dialogRouter from './src/routes/dialog.js';

const __dirname = path.resolve(path.dirname(''));

const app = express();
const mongoDb = mongo;

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routing
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/profile', profileRouter);
app.use('/dialog', dialogRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use(globalErrorHandler);

export default app;
