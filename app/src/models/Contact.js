import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    github: String,
    vk: String,
    facebook: String,
    Instagram: String,
    twitter: String,
    website: String,
    youtube: String,
    mainLink: String,
}, {
    timestamps: true
});

export default mongoose.model('Contact', ContactSchema);
