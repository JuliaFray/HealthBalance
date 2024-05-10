import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import * as ERRORS from '../utils/errors.js';
import {EXPIRES_KEY, SECRET_KEY} from '../utils/constants.js';
import Profile from '../models/Profile.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.js';

export const register = asyncErrorHandler(async (req, res) => {
    await new User({
        email: req.body.email,
        passwordHash: await bcrypt.hash(req.body.password, await bcrypt.genSalt(10))
    }).save()
        .then(resUser => new Profile({
                _id: resUser._id,
                firstName: req.body.firstName,
                secondName: req.body.secondName,
                lastName: req.body.lastName
            }).save()
        )
        .then(resProfile => {
            const token = jwt.sign(
                {_id: resProfile._id},
                SECRET_KEY,
                {expiresIn: EXPIRES_KEY}
            );

            const {passwordHash, ...userData} = resProfile._doc;

            res.json({
                resultCode: 0,
                data: userData,
                token: token
            });
        });
});

export const login = async (req, res) => {
    const user = await User.findOne({email: req.body.email});

    if (!user) {
        return res.status(404).json({
            resultCode: 1,
            message: ERRORS.NOT_FOUND_USER
        })
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
    if (!isValidPass) {
        return res.status(400).json({
            resultCode: 1,
            message: ERRORS.WRONG_LOGIN_PASS
        })
    }

    const token = jwt.sign(
        {_id: user._id},
        SECRET_KEY,
        {expiresIn: EXPIRES_KEY}
    );

    const {passwordHash, ...userData} = user._doc;

    res.json({
        resultCode: 0,
        data: userData,
        token: token
    });
};

export const status = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                resultCode: 1,
                message: ERRORS.NOT_FOUND
            })
        }

        res.json({
            resultCode: 0,
            data: req.userId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            resultCode: 1,
            error: ERRORS.ACCESS_DENIED
        })
    }
};
