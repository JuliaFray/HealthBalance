import * as ERRORS from '../utils/errors.js';
import Profile from '../models/Profile.js';
import {removeFile} from "./FileController.js";

export const getAllUsers = async (req, res) => {
    const users = await Profile.find({_id: {$not: {$in: req.userId}}})
        .populate('avatar')
        .exec();

    res.json({
        resultCode: 0,
        data: users,
        totalCount: users.length
    });
};

export const getProfile = async (req, res) => {
    const profile = await Profile
        .findById(req.params.id)
        .populate('avatar')
        .populate({
            path: 'contacts',
            select: ['-_id']
        })
        .exec();


    if (profile) {
        res.json({
            resultCode: 0,
            data: profile
        })
    } else {
        res.status(404).json({
            resultCode: 1,
            error: ERRORS.NOT_FOUND
        })
    }
}


export const updateProfile = async (req, res) => {
    const userId = req.params.id;
    const file = req.file;

    const profile = await Profile.findOneAndUpdate(
        {_id: userId},
        {
            firstName: req.body.firstName,
            secondName: req.body.secondName,
            lastName: req.body.lastName,
            age: req.body.age,
            city: req.body.city,
            description: req.body.description,
            avatarId: file?.id
        },
        {returnDocument: 'after'}
    )
        .populate('avatar')
        .populate({
            path: 'contacts',
            select: ['-_id']
        })
        .exec();

    res.json({
        resultCode: 0,
        data: profile
    });
}

// export const updateProfilePhoto = async (req, res) => {
//     try {
//         const profileId = req.params.id;
//         const file = req.file;
//
//         await Profile.findOneAndUpdate(
//             {_id: profileId},
//             {avatarId: file.id}
//         ).populate('avatar')
//             .then(profile => {
//                 if (profile) {
//                     res.send({
//                         resultCode: 0,
//                         data: {
//                             id: file.id,
//                             name: file.filename,
//                             contentType: file.contentType,
//                             data: profile.avatar[0].data
//                         }
//                     })
//                 } else {
//                     res.status(404).json({
//                         resultCode: 1,
//                         error: ERRORS.NOT_FOUND
//                     })
//                 }
//
//             });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             error: ERRORS.UNDEFINED_ERROR
//         })
//     }
// }

export const deleteUserImage = async (req, res, next) => {
    const userId = req.params.id;
    const file = req.file;

    const profile = await Profile.findOne({_id: userId})
        .populate('avatar').exec();

    if (!!profile?.avatarId && (!file || profile.avatarId !== file.id)) {
        await removeFile(profile.avatarId)
    }
    next();
}
