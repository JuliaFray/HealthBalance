import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    GitHub: String,
    Website: String,
    phone: String
}, {
    timestamps: true
});

export default mongoose.model('Contact', ContactSchema);
