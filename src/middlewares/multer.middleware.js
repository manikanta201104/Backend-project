import multer from 'multer';//The multer package is imported to handle file uploads in the application.

const storage = multer.diskStorage({
    destination: function (req, file, cb){//The destination function determines where to store the uploaded files. In this case, the files are stored in the public/temp directory.
        cb(null, './public/temp');//The cb() function is used to pass control to the next middleware function. It takes an error object as the first argument and the destination directory as the second argument.
    },
    filename: function (req, file, cb){//The filename function determines the name of the uploaded files. In this case, the original name of the file is used as the filename.
        cb(null,file.originalname)//
    }
});

export const upload = multer({ storage: storage });//The upload middleware is created using multer with the specified storage configuration. It is used to handle file uploads in the application.

