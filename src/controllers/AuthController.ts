import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';

import User from '#models/User.js';
import VerifyToken from '#models/VerifyToken.js';

import type { ILoginResponse } from '#types/user.interface.ts';

import { StatusCode } from '#enums/status-code.enum.ts';

import {
  ACCOUNT_IS_VERIFIED,
  CONFIRM_EMAIL,
  EMAIL_IS_NOT_VERIFIED,
  EMAIL_IS_VERIFIED,
  LINK_IS_EXPIRED,
  USER_EXISTS,
} from '#constants/text.ts';

import { EXPIRES_KEY, SECRET_KEY } from '#utils/constants.js';
import * as ERRORS from '#utils/errors.js';
import { NOT_FOUND_USER } from '#utils/errors.js';

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
        return res.status(StatusCode.ValidationError).json({
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
              return res.status(StatusCode.UndefinedError).json({
                message: err.message,
              });
            }
          });
      }
    })
    .catch(err => {
      if (err) {
        return res.status(StatusCode.UndefinedError).json({
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
  })
    .select('_id, login email avatarId passwordHash isVerified')
    .exec()
    .then(data => {
      const user = data as unknown as ILoginResponse;
      if (!user) {
        return res.status(StatusCode.NotFound).json({
          message: ERRORS.NOT_FOUND_USER,
        });
      }

      bcrypt.compare(req.body.password, user.passwordHash, (err, result) => {
        if (err) {
          return res.status(StatusCode.ValidationError).json({
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

            return res.status(StatusCode.Success).json({
              data: { _id: user._id, login: user.login, email: user.email, avatarId: user.avatarId },
              token: token,
            });
          } else {
            return res
              .status(StatusCode.ValidationError)
              .json({
                message: EMAIL_IS_NOT_VERIFIED,
              });

          }
        } else {
          return res.status(StatusCode.ValidationError).json({
            message: ERRORS.WRONG_LOGIN_PASS,
          });
        }
      });
    })
    .catch(err => {
      if (err) {
        return res.status(StatusCode.UndefinedError).json({
          message: err.message,
        });
      }
    });
};

export const status = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(StatusCode.NotFound).json({
        message: ERRORS.NOT_FOUND,
      });
    }

    res.status(StatusCode.Success).json({
      data: user,
      token: jwt.sign(
        { _id: req.userId },
        SECRET_KEY,
        { expiresIn: EXPIRES_KEY },
      ),
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCode.UndefinedError).json({
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
                return res.status(StatusCode.Success).json({
                  message: EMAIL_IS_VERIFIED,
                });
              } else {
                user.isVerified = true;
                user.save()
                  .then(() => {
                    res.status(StatusCode.Success).json({
                      message: ACCOUNT_IS_VERIFIED,
                    });
                  })
                  .catch(err => {
                    res.status(StatusCode.UndefinedError).json({
                      message: err.message,
                    });
                  });
              }
            } else {
              return res.status(StatusCode.NotFound).json({
                message: ERRORS.NOT_FOUND_USER,
              });
            }
          });
      } else {
        return res.status(StatusCode.NotFound).json({
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
          return res.status(StatusCode.Success).json({ message: EMAIL_IS_VERIFIED });
        } else {
          // send verification link
          createTokenAndSendMail(user, req.body.email, res);
        }
      } else {
        return res.status(StatusCode.NotFound).json({ message: NOT_FOUND_USER });
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
          res.status(StatusCode.UndefinedError).json({
            message: error.response,
          });
        } else {
          console.log('Письмо отправлено:', info.messageId);
          res.status(StatusCode.Success).json();
        }
      });
    });
};
