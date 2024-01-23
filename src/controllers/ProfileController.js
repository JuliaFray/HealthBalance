import * as ERRORS from '../utils/errors.js';
import Profile from './../models/Profile.js';
import Contact from "../models/Contact.js";

// export const getAll = async (req, res) => {
//     try {
//         const posts = await Post.find().populate('author').exec();
//
//         res.json({
//             posts: posts
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             error: ERRORS.UNDEFINED_ERROR
//         })
//     }
//
// };

export const getProfile = async (req, res) => {
    try {
        const profileId = req.params.id;

        Profile.findById(profileId).populate('contacts')
            .then((profile) => {
                if (!profile) {
                    res.status(404).json({
                        resultCode: 1,
                        error: ERRORS.NOT_FOUND
                    })
                }
                res.json({
                    resultCode: 0,
                    data: profile
                })
            }).catch(err => {
            console.log(err);
            res.status(400).json({
                resultCode: 1,
                error: ERRORS.UNDEFINED_ERROR
            })
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            resultCode: 1,
            error: ERRORS.UNDEFINED_ERROR
        })
    }
}

//
// export const updatePost = async (req, res) => {
//     try {
//         const postId = req.params.id;
//
//         const tags = req.body.tags ? req.body.tags.split(',') : [];
//         tags.forEach(tag => tag.trim());
//
//         await Post.updateOne(
//             {_id: postId},
//             {
//                 title: req.body.title,
//                 text: req.body.text,
//                 tags: tags,
//                 imageUrl: req.body.imageUrl
//             }
//         ).exec();
//
//         res.json({
//             status: true
//         });
//
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             error: ERRORS.UNDEFINED_ERROR
//         })
//     }
// }
//
// export const deletePost = async (req, res) => {
//     try {
//         const postId = req.params.id;
//
//         Post.findOneAndDelete(
//             {_id: postId},
//         ).then((post) => {
//             if (!post) {
//                 res.status(404).json({
//                     error: ERRORS.NOT_FOUND
//                 })
//             }
//
//             res.json({
//                 status: true
//             })
//         }).catch(err => {
//             console.log(err);
//             res.status(400).json({
//                 error: ERRORS.UNDEFINED_ERROR
//             })
//         });
//
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             error: ERRORS.UNDEFINED_ERROR
//         })
//     }
// }
//
// export const getLastTags = async (req, res) => {
//     try {
//         const posts = await Post.find().limit(5).exec();
//
//         const tags = posts.map(it => it.tags).flat().slice(0, 5);
//
//         res.json(tags);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             error: ERRORS.UNDEFINED_ERROR
//         })
//     }
//
// };
