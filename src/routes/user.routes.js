import { Router } from 'express';
import { registerUser,loginUser,logoutUser } from '../controllers/user.controllers.js';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = Router()

router.route('/register').post(
     upload.fields([//The upload.fields() middleware is used to handle multiple file uploads. It takes an array of objects as an argument, where each object specifies the field name and the maximum number of files allowed for that field.
        { name:"avatar", maxCount:1},
        { name:"coverImage", maxCount:1}
     ]),
    registerUser
);

router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT,logoutUser);//The logout route is protected by the verifyJWT middleware. This ensures that only authenticated users can log out. The logoutUser controller function is called when the user logs out. The user's refresh token is removed from the database, and the user is logged out. The user is then redirected to the login page. The logout route is a POST request that requires the user to be authenticated. The verifyJWT middleware is used to verify the user's access token before allowing them to log out. If the user is authenticated, the logoutUser controller function is called to log the user out. The user's refresh token is removed from the database, and the user is redirected to the login page. 

export default router;
