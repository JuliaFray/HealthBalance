import mongoose from 'mongoose';

const dbURI = process.env.DB_URI;

if (!dbURI) {
  throw new Error('Пожалуйста, добавьте DB_URI в переменные окружения Vercel');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const dbOptions = {
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
      w: 'majority',
      retryWrites: true,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000
    };

    cached.promise = mongoose.connect(dbURI, dbOptions).then((mongoose) => {
      console.log('MongoDB OK');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
