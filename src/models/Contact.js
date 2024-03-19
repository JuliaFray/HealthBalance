import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    github: String,
    website: String,
    phone: String
}, {
    timestamps: true
});

export default mongoose.model('Contact', ContactSchema);
