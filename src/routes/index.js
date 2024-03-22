import express from 'express';
import {getLastTags} from "../controllers/PostController.js";
import checkAuth from "../utils/checkAuth.js";
import upload from './../utils/gridFsStorage.js';
import {getFileById, uploadFile} from "../controllers/FileController.js";


const router = express.Router();
router.get('/tags', checkAuth, getLastTags);

router.post('/upload', checkAuth, upload.single('image'), uploadFile);
router.get("/image/:id", checkAuth, getFileById);

// router.get("/images", async (req, res) => {
//     try {
//         await mongoClient.connect()
//
//         const database = mongoClient.db("dmj")
//         const images = database.collection("photos.files")
//         const cursor = images.find({})
//         const count = await cursor.count()
//         if (count === 0) {
//             return res.status(404).send({
//                 message: "Error: No Images found",
//             })
//         }
//
//         const allImages = []
//
//         await cursor.forEach(item => {
//             allImages.push(item)
//         })
//
//         res.send({files: allImages})
//     } catch (error) {
//         console.log(error)
//         res.status(500).send({
//             message: "Error Something went wrong",
//             error,
//         })
//     }
// })
//
// router.get("/download/:filename", async (req, res) => {
//     try {
//         await mongoClient.connect()
//
//         const database = mongoClient.db("dmj")
//
//         const imageBucket = new GridFSBucket(database, {
//             bucketName: "photos",
//         })
//
//         let downloadStream = imageBucket.openDownloadStreamByName(
//             req.params.filename
//         )
//
//         downloadStream.on("data", function (data) {
//             return res.status(200).write(data)
//         })
//
//         downloadStream.on("error", function (data) {
//             return res.status(404).send({error: "Image not found"})
//         })
//
//         downloadStream.on("end", () => {
//             return res.end()
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(500).send({
//             message: "Error Something went wrong",
//             error,
//         })
//     }
// })

export default router;

