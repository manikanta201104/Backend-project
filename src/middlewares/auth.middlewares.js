import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import ApiError from '../utils/ApiError.js';


export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken||req.headers.authorization?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }
            const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
            const user=await User.findById(decodedToken._id).select("-password -refreshToken");
            if(!user){
                throw new ApiError(404,"Invalid Access Token");
            }
            req.user=user;
            next();
        
        
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid access token");
    }
})
//The verifyJWT middleware function is used to verify the user's access token. The function first checks if the access token is present in the request cookies or headers. If the access token is not present, an error is thrown. The function then verifies the access token using the jwt.verify method. If the access token is valid, the user object is retrieved from the database using the user ID from the access token. If the user is not found, an error is thrown. If the access token is invalid, an error is thrown. The user object is attached to the request object, and the next middleware function is called. If an error occurs during the process, an error response is returned. The function is exported to be used in the user routes. 