import { Router } from 'express';
import { registerUser } from '../controllers/user.controllers.js';
import {upload} from './../middlewares/multer.middleware.js';

const router = Router()

router.route('/register').post(
     upload.fields([//The upload.fields() middleware is used to handle multiple file uploads. It takes an array of objects as an argument, where each object specifies the field name and the maximum number of files allowed for that field.
        { name:"Avatar", maxCount:1},
        { name:"coverImage", maxCount:1}
     ]),
    registerUser
);

export default router;
