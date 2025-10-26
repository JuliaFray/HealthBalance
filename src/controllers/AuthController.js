import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/User.js';
import { EXPIRES_KEY, SECRET_KEY } from '../utils/constants.js';
import * as ERRORS from '../utils/errors.js';
import * as nodemailer from 'nodemailer';
import VerifyToken from '../models/VerifyToken.js';

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
          message: 'Пользователь с таким адресом электронной почты / логином уже зарегистрирован',
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
  User.findOne({ email: req.body.email }).populate('avatar')
    .exec()
    .then(user => {
      if (!user) {
        return res.status(404).json({
          resultCode: 1,
          message: ERRORS.NOT_FOUND_USER,
        });
      }

      bcrypt.compare(req.body.password, user._doc.passwordHash, (err, result) => {
        if (err) {
          return res.status(400).json({
            resultCode: 1,
            message: ERRORS.UNDEFINED_ERROR,
          });
        }
        if (result) {
          if (!user.isVerified) {
            return res
              .status(401)
              .json({
                message: 'Ваш адрес электронной почты не подтверждён. ' +
                  'Нажмите «Отправить повторно»',
              });

          } else {
            const token = jwt.sign(
              { _id: user._id },
              SECRET_KEY,
              { expiresIn: EXPIRES_KEY },
            );

            return res.json({
              resultCode: 0,
              data: user,
              token: token,
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
      if (!token) {
        return res.status(404).json({
          resultCode: 1,
          message: 'Срок действия вашей ссылки для подтверждения мог истечь. ' +
            'Нажмите «Отправить повторно», чтобы подтвердить свой адрес электронной почты.',
        });
      } else {
        User.findOne({ _id: token._userId, email: req.params.email })
          .exec()
          .then(user => {
            if (!user) {
              return res.status(404).json({
                resultCode: 1,
                message: ERRORS.NOT_FOUND_USER,
              });
            } else if (user.isVerified) {
              return res.status(200).json({
                resultCode: 1,
                message: 'Ваша почта уже подтверждена. Пожалуйста, войдите в аккаунт',
              });
            } else {
              user.isVerified = true;
              user.save()
                .then(() => {
                  res.status(200).send({ message: 'Ваш аккаунт успешно подтержден' });
                })
                .catch(err => {
                  res.status(500).send({ message: err.message });
                });
            }
          });
      }
    });
};

export const resendLink = async (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then(user => {
      if (!user) {
        return res.status(400).send({ message: NOT_FOUND_USER });
      } else if (user.isVerified) {
        // user has been already verified
        return res.status(200).send({ message: 'Ваша почта уже подтверждена. Пожалуйста, войдите в аккаунт' });
      } else {
        // send verification link
        createTokenAndSendMail(user, req.body.email, res);
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

      // Настройки письма
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: 'Подтвердите Ваш email',
        html: `
      <!DOCTYPE html>
<html style='display: flex; flex-direction: column; align-items: center'>
	<head>
		<meta charset='utf-8' />
	</head>
	<body style='display: flex; flex-direction: column; align-items: center'>
		<div style='display: flex;flex-direction: column;align-self: center; padding: 50px 40px 40px; border-radius: 20px; --width: 400px; flex-wrap: nowrap; justify-content: flex-start; align-items: flex-start; margin-top: 70px; margin-bottom: 70px; background-color: rgb(255, 255, 255); border: 1px solid rgb(206, 206, 206);'>
		<h3 style='display: flex;flex-direction: column;align-self: center; text-align: left; margin-top: 40px; margin-bottom: 0; padding: 0px; --width: 210px; font-size: 60px'>HEALTHBALANCE</h3>
			<div style='align-self: center; text-align: left; margin-top: 0px; margin-bottom: 40px; padding: 0px; --width: 60px;'>
				<img data-name='#image' draggable='false' src='https://s.cafebazaar.ir/images/icons/com.nutrigen.nutritiontracker.nutritioncounter-b66fc858-91aa-4193-95e0-545c87a1c162_512x512.png?x-img=v1/resize,h_256,w_256,lossless_false/optimize'/>
			</div>
			<div style='align-self: center; margin-top: 0px; margin-bottom: 0px; font-family: Inter; font-weight: 600; font-style: normal; color: rgb(17, 17, 17); font-size: 24px; letter-spacing: -1.2px; word-spacing: 0px; line-height: 28px; text-align: center; text-transform: none; text-decoration: none; direction: ltr; --width: 339px; padding-left: 0px; padding-right: 0px;'>
					<span id='n4zfvyDF-g2BHYplJN1t_M' data-type='TEXT_NODE' data-name='#text' style=''>Пожалуйста, подвердите Ваш email 😀</span>
			</div>
			<div style='align-self: center; margin-top: 17px; margin-bottom: 0px; font-family: Inter; font-weight: 500; font-style: normal; color: rgb(66, 64, 64); font-size: 15px; letter-spacing: -0.6px; word-spacing: 0px; line-height: 22px; text-align: center; text-transform: none; text-decoration: none; direction: ltr; --width: 308px;'>
				<span>Чтобы подтвердить Ваш аккаунт, нажмите на кнопку ниже.</span>
			</div>
			<div style='align-self: center; font-family: Inter; font-weight: 700; font-style: normal; text-align: center; text-decoration: none; font-size: 15px; line-height: 40px; color: rgb(255, 255, 255); background-color: rgb(46, 149, 140); margin-top: 40px; margin-bottom: 0px; padding: 0px; letter-spacing: -0.5px; word-spacing: 0px; direction: ltr; width: 100%; border-radius: 8px;'>
				<span><a style='text-decoration: none; color: #fff' href='${process.env.FRONTEND_URL}/confirm/${toEmail}/${t.token}'>Подтвердить email</a></span>
			</div>
			<div style='align-self: center; margin-top: 40px; margin-bottom: 0px; font-family: Inter; font-weight: 500; font-style: normal; color: rgb(66, 64, 64); font-size: 14px; letter-spacing: -0.6px; word-spacing: 0px; line-height: 22px; text-align: center; text-transform: none; text-decoration: none; direction: ltr; width: 100%;'>
				<span>Вы получили это письмо, потому что у Вас есть учетная запись в HEALTHBALANCE. Если Вы не уверены, почему Вы его получили, свяжитесь с нами, ответив на это письмо.</span>
			</div>
			<div style='align-self: center; margin-top: 30px; margin-bottom: 0px; font-weight: 500; font-style: normal; color: rgb(132, 130, 142); font-size: 12px; letter-spacing: 0px; word-spacing: 0px; line-height: 18px; text-align: center; text-transform: none; text-decoration: none; direction: ltr; width: 100%; padding: 20px 30px; background-color: rgb(242, 239, 243); border-radius: 8px;'>
				<span>Благодарим за Ваш выбор!</span>
			</div>
		</div>
	<body>
</html>`,
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
