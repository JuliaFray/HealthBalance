import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';

import User from '#models/User.js';
import VerifyToken from '#models/VerifyToken.js';

import type { ILoginResponse } from '#types/user.interface.js';

import { EXPIRES_KEY, SECRET_KEY } from '#utils/constants.js';
import * as ERRORS from '#utils/errors.js';
import { NOT_FOUND_USER } from '#utils/errors.js';

import {
  ACCOUNT_IS_VERIFIED,
  CONFIRM_EMAIL,
  EMAIL_IS_NOT_VERIFIED,
  EMAIL_IS_VERIFIED,
  LINK_IS_EXPIRED, USER_EXISTS,
} from '#constants/text.ts';

const __dirname = path.resolve(path.dirname(''));

export const register = async (req, res) => {
  User.findOne({
    $or: [
      { email: req.body.email },
      { login: req.body.login },
    ],
  })
    .exec()
    .then(async (user) => {
      if (user) {
        // if email is exist into database i.e. email is associated with another user.
        return res.status(400).json({
          resultCode: 1,
          message: USER_EXISTS,
        });
      } else {
        // if user is not exist into database then save the user into database for register account
        await new User({
          login: req.body.login,
          email: req.body.email,
          passwordHash: await bcrypt.hash(req.body.password, await bcrypt.genSalt(10)),
        })
          .save()
          .then(async (u) => {
            createTokenAndSendMail(u, req.body.email, res);
          },
          )
          .catch(err => {
            if (err) {
              return res.status(500).json({ message: err.message });
            }
          });
      }
    })
    .catch(err => {
      if (err) {
        return res.status(500).json({
          resultCode: 1,
          message: err.message,
        });
      }
    });
};

export const login = async (req, res) => {
  User.findOne({
    $or: [
      { email: req.body.email },
      { login: req.body.email },
    ],
  }).populate('avatar')
    .select('_id, login email avatar passwordHash isVerified')
    .lean()
    .then(data => {
      const user = data as unknown as ILoginResponse;
      if (!user) {
        return res.status(404).json({
          resultCode: 1,
          message: ERRORS.NOT_FOUND_USER,
        });
      }

      bcrypt.compare(req.body.password, user.passwordHash, (err, result) => {
        if (err) {
          return res.status(400).json({
            resultCode: 1,
            message: ERRORS.UNDEFINED_ERROR,
          });
        }
        if (result) {
          if (user.isVerified) {
            const token = jwt.sign(
              { _id: user._id },
              SECRET_KEY,
              { expiresIn: EXPIRES_KEY },
            );

            return res.json({
              resultCode: 0,
              data: { _id: user._id, name: user.login, email: user.email, avatar: user.avatar },
              token: token,
            });
          } else {
            return res
              .status(401)
              .json({
                message: EMAIL_IS_NOT_VERIFIED,
              });

          }
        } else {
          return res.status(400).json({
            resultCode: 1,
            message: ERRORS.WRONG_LOGIN_PASS,
          });
        }
      });
    })
    .catch(err => {
      if (err) {
        return res.status(500).json({ resultCode: 1, message: err.message });
      }
    });
};

export const status = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('avatar');

    if (!user) {
      return res.status(404).json({
        resultCode: 1,
        message: ERRORS.NOT_FOUND,
      });
    }

    res.json({
      resultCode: 0,
      data: user,
      token: jwt.sign(
        { _id: req.userId },
        SECRET_KEY,
        { expiresIn: EXPIRES_KEY },
      ),
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({
      resultCode: 1,
      error: ERRORS.ACCESS_DENIED,
    });
  }
};

export const confirmEmail = async (req, res) => {
  VerifyToken.findOne({ token: req.params.token })
    .exec()
    .then(token => {
      if (token) {
        User.findOne({ _id: token._userId, email: req.params.email })
          .exec()
          .then(user => {
            if (user) {
              if (user.isVerified) {
                return res.status(200).json({
                  resultCode: 1,
                  message: EMAIL_IS_VERIFIED,
                });
              } else {
                user.isVerified = true;
                user.save()
                  .then(() => {
                    res.status(200).send({ message: ACCOUNT_IS_VERIFIED });
                  })
                  .catch(err => {
                    res.status(500).send({ message: err.message });
                  });
              }
            } else {
              return res.status(404).json({
                resultCode: 1,
                message: ERRORS.NOT_FOUND_USER,
              });
            }
          });
      } else {
        return res.status(404).json({
          resultCode: 1,
          message: LINK_IS_EXPIRED,
        });
      }
    });
};

export const resendLink = async (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then(user => {
      if (user) {
        if (user.isVerified) {
          // user has been already verified
          return res.status(200).send({ message: EMAIL_IS_VERIFIED });
        } else {
          // send verification link
          createTokenAndSendMail(user, req.body.email, res);
        }
      } else {
        return res.status(400).send({ message: NOT_FOUND_USER });
      }
    });
};

const createTokenAndSendMail = (user, toEmail, res) => {
  const verifyToken = new VerifyToken({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
  verifyToken
    .save()
    .then(async (t) => {
      // Создаем транспорт для подключения к SMTP Яндекса
      const transporter = nodemailer.createTransport({
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Read the HTML file as a UTF-8 string
      const htmlString = fs.readFileSync(path.join(__dirname, 'src', 'constants', 'email.html'), 'utf8')
        .replace('__HREF__', `${process.env.FRONTEND_URL}/confirm/${toEmail}/${t.token}`);

      // Настройки письма
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: CONFIRM_EMAIL,
        html: htmlString,
      };

      // Отправляем письмо
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Ошибка отправки:', error);
          res.status(500).json({
            resultCode: 1,
            message: error.response,
          });
        } else {
          console.log('Письмо отправлено:', info.messageId);
          res.json({
            resultCode: 0,
          });
        }
      });
    });
};
