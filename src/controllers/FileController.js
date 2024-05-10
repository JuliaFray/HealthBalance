import {MongoClient, ObjectId} from 'mongodb';
import {UNDEFINED_ERROR} from '../utils/errors.js';
import mongoose from 'mongoose';
import {DATABASE_NAME} from "../utils/constants.js";

const url = process.env.DB_URI_GET_FILES;
const mongoClient = new MongoClient(url);

const connect = mongoose.createConnection(url);

let gridFS;

connect.once('open', () => {
    gridFS = new mongoose.mongo.GridFSBucket(connect.db, {
        bucketName: 'photos.files'
    });
});

export const uploadFile = (req, res) => {
    const file = req.file

    res.send({
        resultCode: 0,
        id: file.id,
        name: file.filename,
        contentType: file.contentType,
    })
}

export const getFileById = async (req, res) => {
    try {
        res.send({
            resultCode: 0,
            file: getFile(req.params.id)
        });
    } catch (err) {
        console.log(err)
        res.status(500).send({
            resultCode: 1,
            message: UNDEFINED_ERROR
        })
    }
}

export const getFile = async (imageId) => {
    await mongoClient.connect()

    const chunk = mongoClient.db(DATABASE_NAME)
        .collection('photos.chunks')
        .find({'files_id': new ObjectId(imageId)}).toArray();

    const images = [];
    (await chunk).forEach(it => images.push(it));

    return images;
}

export const removeFile = async (fileId) => {
    await mongoClient.connect()

    await mongoClient.db(DATABASE_NAME)
        .collection('photos.chunks')
        .deleteOne({'files_id': new ObjectId(fileId)});
}
