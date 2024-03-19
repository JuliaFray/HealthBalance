import mongoose from 'mongoose';
import 'dotenv/config'

const dbURI = process.env.DB_URI;
const dbOptions = {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    w: 'majority',
    retryWrites: true
};
mongoose
    .connect(dbURI, dbOptions)
    .then(() => console.log('DB OK'))
    .catch((error) => console.log(error));

export default mongoose;
