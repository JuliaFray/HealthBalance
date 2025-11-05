import 'dotenv/config'

import path from 'path';

import cors from 'cors';
import express from 'express';
import createError from 'http-errors';
import logger from 'morgan';

import * as mongo from './src/configs/mongo.js'
import authRouter from './src/routes/auth.js';
import dialogRouter from './src/routes/dialog.js';
import dietRouter from './src/routes/diet.js';
import foodRouter from './src/routes/food.js'
import indexRouter from './src/routes/index.js';
import postsRouter from './src/routes/posts.js';
import profileRouter from './src/routes/profile.js';
import usersRouter from './src/routes/users.js';
import diaryRouter from './src/routes/diary.js';
import globalErrorHandler from './src/utils/handleErrors.js'

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
app.use('/diet', dietRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/food', foodRouter);
app.use('/diary', diaryRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(globalErrorHandler);

export default app;
