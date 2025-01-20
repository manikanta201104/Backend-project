import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';//The fs module is used to interact with the file system in Node.js. It provides methods for reading, writing, and deleting files on the server.

cloudinary.config({//The cloudinary.config() method is used to configure the Cloudinary SDK with the required credentials. It takes an object with the cloud_name, api_key, and api
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async (localFilePath) => {//The uploadOnCloudinary function takes a local file path as input and uploads the file to Cloudinary. It returns the response object from Cloudinary if the upload is successful, or null if an error occurs.
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{//The cloudinary.uploader.upload() method is used to upload a file to Cloudinary. It takes the local file path as input and uploads the file to the specified Cloudinary account.
            resource_type:'auto',//The resource_type option specifies the type of resource being uploaded. In this case, it is set to auto, which allows Cloudinary to automatically detect the resource type based on the file content.
        });
        console.log('file is uploaded on cloudinary',response.url);
        fs.unlinkSync(localFilePath)//Delete the file from the server after it has been successfully uploaded to Cloudinary.
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //Delete the file from the server if an error occurs during the upload process.
        console.error('Error in uploading file on cloudinary',error);
        return null;
    }
}

export default uploadOnCloudinary;