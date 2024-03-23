import * as ERRORS from '../utils/errors.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import {getFile} from './FileController.js';
import {ObjectId} from 'mongodb';

export const getAllUsers = async (req, res) => {
    const users = await User.find().exec();

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
    try {
        await Profile.updateOne(
            {_id: req.params.id},
            {
                firstName: req.body.firstName,
                secondName: req.body.secondName,
                lastName: req.body.lastName,
                age: req.body.age,
                city: req.body.city
            }
        ).exec();

        res.json({
            status: true
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: ERRORS.UNDEFINED_ERROR
        })
    }
}

export const updateProfilePhoto = async (req, res) => {
    try {
        const profileId = req.params.id;
        const file = req.file;

        await Profile.findOneAndUpdate(
            {_id: profileId},
            {avatarId: file.id,}
        ).populate('avatar')
        .then(profile => {
            if (profile) {
                res.send({
                    resultCode: 0,
                    data: {
                        id: file.id,
                        name: file.filename,
                        contentType: file.contentType,
                        data: profile.avatar[0].data
                    }
                })
                // if (file) {
                //     getFile(file.id)
                //         .then(fileRes => {
                //             res.send({
                //                 resultCode: 0,
                //                 data: {
                //                     id: file.id,
                //                     name: file.filename,
                //                     contentType: file.contentType,
                //                     data: fileRes[0].data
                //                 }
                //             })
                //         })
                // } else {
                //     res.send({
                //         resultCode: 0
                //     })
                // }
            } else {
                res.status(404).json({
                    resultCode: 1,
                    error: ERRORS.NOT_FOUND
                })
            }

        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: ERRORS.UNDEFINED_ERROR
        })
    }
}
