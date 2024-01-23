import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import * as ERRORS from '../utils/errors.js';
import {EXPIRES_KEY, SECRET_KEY} from '../utils/constants.js';

export const register = async (req, res) => {
    try {
        const pass = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(pass, salt);

        const doc = new User({
            email: req.body.email,
            fullName: req.body.fullName,
            name: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: passHash
        });

        const user = await doc.save();

        const token = jwt.sign({_id: user._id}, SECRET_KEY, {expiresIn: EXPIRES_KEY});

        const {passwordHash, ...userData} = user._doc;

        res.json({
            status: true,
            user: userData,
            token: token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: false,
            error: ERRORS.UNDEFINED_ERROR
        })
    }

};

export const login = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});

        if (!user) {
            return res.status(404).json({
                resultCode: 1,
                message: ERRORS.NOT_FOUND
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if (!isValidPass) {
            return res.status(400).json({
                resultCode: 1,
                message: ERRORS.WRONG_LOGIN_PASS
            })
        }

        const token = jwt.sign({_id: user._id}, SECRET_KEY, {expiresIn: EXPIRES_KEY});

        const {passwordHash, ...userData} = user._doc;

        res.json({
            resultCode: 0,
            data: userData,
            token: token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            resultCode: 1,
            error: ERRORS.UNDEFINED_ERROR
        })
    }
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

        const {passwordHash, ...userData} = user._doc;

        res.json({
            data: userData,
            resultCode: 0,
            token: req.token
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            resultCode: 1,
            error: ERRORS.ACCESS_DENIED
        })
    }
};
