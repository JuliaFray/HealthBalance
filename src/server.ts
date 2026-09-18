import cors from 'cors';
import 'dotenv/config';

import dbConnect from './dbConnection.js';
import authRouter from './routes/auth.js';
import dialogRouter from './routes/dialog.js';
import diaryRouter from './routes/diary.js';
import dietRouter from './routes/diet.js';
import fatsecretRouter from './routes/fatsecret.js';
import foodRouter from './routes/food.js';
import indexRouter from './routes/index.js';
import openFoodRouter from './routes/openFood.js';
import postsRouter from './routes/posts.js';
import usersRouter from './routes/users.js';
import globalErrorHandler from './utils/handleErrors.js';
import { connectWebSocket } from './webSocketServer.js';

import http from 'http';
import path from 'path';

import express, { type Response } from 'express';
import logger from 'morgan';

const __dirname = path.resolve(path.dirname(''));

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    console.error(' requires elevated privileges');
    process.exit(1);
    break;
  case 'EADDRINUSE':
    console.error(' is already in use');
    process.exit(1);
    break;
  default:
    throw error;
  }
}

/**
 * Normalize a port into a number, string, or false.
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

await dbConnect();

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'HR Dashboard API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routing
app.use('/api', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);
app.use('/api/dialog', dialogRouter);
app.use('/api/diet', dietRouter);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/diary', diaryRouter);
app.use('/api/v1/food', openFoodRouter);
app.use('/api/v2/food', fatsecretRouter);
app.use('/api/v3/food', foodRouter);

// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

// error handler
app.use(globalErrorHandler);

export const server = http.createServer();

// for local dev
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8000;

  // server.on('error', onError);
  server.on('request', app);
  server.on('listening', () => {
    console.log('Server OK');
  });

  server.listen(normalizePort(PORT));
}

connectWebSocket(server);
// Export the app for Vercel
export default app;
