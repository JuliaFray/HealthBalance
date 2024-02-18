import mongoose from 'mongoose';

const dbURI = 'mongodb+srv://dmj.vhcqjvw.mongodb.net/dmj';
const dbOptions = {
    user: 'admin',
    pass: 'JoE8prZL4Mhy44Ww',
    w: 'majority',
    retryWrites: true
};
mongoose
    .connect(dbURI, dbOptions)
    .then(() => console.log('DB OK'))
    .catch((error) => console.log(error));

export default mongoose;
