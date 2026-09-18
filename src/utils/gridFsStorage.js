import {gf} from '../config.js'

import multer from 'multer';
import {GridFsStorage} from 'multer-gridfs-storage';

const storage = new GridFsStorage({
  url: gf || 'mongodb+srv://admin',
  options: { useNewUrlParser: true },
  file: (req, file) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      return {
        bucketName: 'photos',
        filename: `${Date.now()}_${file.originalname}`,
      }
    } else {
      return `${Date.now()}_${file.originalname}`
    }
  }
});

const uploadFilesMiddleware = multer({storage});

export default uploadFilesMiddleware;

