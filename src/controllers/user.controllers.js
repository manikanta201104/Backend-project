import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.models.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import ApiResponse from './../utils/ApiResponse.js';


const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend but we use postman
    const { username, email, fullName, password } = req.body;
    // res.status(201).json({ username, email, fullName, password, message: "User registered successfully" });
    
    //Validation-not empty fields
    if([username,email,fullName,password].some((field)=>field?.trim()==="")){//if any of the fields is empty 
        throw new ApiError(400,"Please fill in all fields");  //throw an error message to the frontend 
    }
    //Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    })
    if(existedUser){
        throw new ApiError(400, "User already exists");
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    //Upload images to cloudinary
    const avatarLocalPath = req.files?.avatar[0]?.path; //get the path of the avatar image 
    const coverImageLocalPath = req.files?.coverImage[0]?.path; //get the path of the cover image

    if(!avatarLocalPath){
        throw new ApiError(400, "Please upload avatar");
    }

    //Upload images to cloudinary
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500, "Error in uploading images");
    }

    const user = await User.create({
        username:username.toLowerCase(),
        email,
        fullName,
        password,
        Avatar:avatar.url,
        coverImage:coverImage?.url || "",
    });
   
    const createdUser = await User.findById(user._id).select('-password -refreshToken');//select all the fields except password and refreshToken

    return res.status(200).json(
        new ApiResponse(200,createdUser,"usercreatedsuccessfully")
    )

}
);

export { registerUser };
