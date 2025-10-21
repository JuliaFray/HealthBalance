import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.js';
import {EXPIRES_KEY, SECRET_KEY} from '../utils/constants.js';
import * as ERRORS from '../utils/errors.js';
import {UNDEFINED_ERROR} from '../utils/errors.js';

export const register = asyncErrorHandler(async (req, res) => {
  await new User({
    email: req.body.email,
    passwordHash: await bcrypt.hash(req.body.password, await bcrypt.genSalt(10)),
    login: req.body.login
  }).save()
    .then(user => {
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
    });
});

export const login = async (req, res) => {
  User.findOne({email: req.body.email}).populate('avatar').exec()
    .then(user => {
      if (!user) {
        return res.status(404).json({
          resultCode: 1,
          message: ERRORS.NOT_FOUND_USER
        })
      }

      bcrypt.compare(req.body.password, user._doc.passwordHash, (err, result) => {
        if (err) {
          return res.status(400).json({
            resultCode: 1,
            message: ERRORS.UNDEFINED_ERROR
          })
        }
        if (result) {
          const token = jwt.sign(
            {_id: user._id},
            SECRET_KEY,
            {expiresIn: EXPIRES_KEY}
          );

          return res.json({
            resultCode: 0,
            data: user,
            token: token
          });
        } else {
          return res.status(400).json({
            resultCode: 1,
            message: ERRORS.WRONG_LOGIN_PASS
          })
        }
      });
    });
};

export const status = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('avatar');

    if (!user) {
      return res.status(404).json({
        resultCode: 1,
        message: ERRORS.NOT_FOUND
      })
    }

    res.json({
      resultCode: 0,
      data: user,
      token: jwt.sign(
        {_id: req.userId},
        SECRET_KEY,
        {expiresIn: EXPIRES_KEY}
      )
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({
      resultCode: 1,
      error: ERRORS.ACCESS_DENIED
    })
  }
};
