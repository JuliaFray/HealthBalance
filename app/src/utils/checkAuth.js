import jwt from 'jsonwebtoken';
import {ACCESS_DENIED} from './errors.js';
import {SECRET_KEY} from './constants.js';

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
                message: ACCESS_DENIED
            })
        }
    } else {
        return res.status(403).json({
            message: ACCESS_DENIED
        })
    }
}
