import mongoose from 'mongoose';

const ChunkSchema = new mongoose.Schema({
    files_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'File'
    },
    n: {
        type: Number,
        default: 0
    },
    data: Object
});

const FileSchema = new mongoose.Schema({
    length: {
        type: Number
    },
    chunkSize: {
        type: Number
    },
    filename: {
        type: String
    },
    contentType: String,
    uploadDate: Date
});

export default {
    File: mongoose.model('File', FileSchema, 'photos.files'),
    Chunk: mongoose.model('Chunk', ChunkSchema, 'photos.chunks')
};
