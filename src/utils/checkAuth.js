import jwt from 'jsonwebtoken';

import { SECRET_KEY } from './constants.js';
import { ACCESS_DENIED } from './errors.js';

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);

      req.userId = decoded._id;
      req.token = token;

      next();
    } catch (err) {
      return res.status(403).json({
        message: ACCESS_DENIED,
        resultCode: 3,
      });
    }
  } else {
    return res.status(403).json({
      message: ACCESS_DENIED,
      resultCode: 3,
    });
  }
}

export const enhanceHeaders = (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);

      req.userId = decoded._id;
      req.token = token;
    } catch (err) {
      return res.status(403).json({
        message: ACCESS_DENIED,
        resultCode: 3,
      });
    }
  }
  next();
};
