import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.models.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from './../utils/ApiError';
import jwt  from 'jsonwebtoken';
import ApiResponse from './../utils/ApiResponse';

const generateAccessandRefreshTokens=async (userId) => {//The generateAccessandRefreshTokens function takes the user ID as an argument and returns the access and refresh tokens for the user. The function first finds the user in the database using the user ID. It then generates the access and refresh tokens for the user using the generateAccessToken and generateRefreshToken methods on the user object. The refresh token is saved to the database and the access and refresh tokens are returned.
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();//The generateAccessToken and generateRefreshToken methods are defined in the user model. The generateAccessToken method generates a JWT access token for the user, which contains the user's ID, email, username, and full name. The generateRefreshToken method generates a JWT refresh token for the user, which contains only the user's ID.
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });//The refresh token is saved to the database by updating the user object with the new refresh token. The validateBeforeSave option is set to false to skip validation before saving the user object.
        
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    

    const { username, email, fullName, password } = req.body;

    // Validation: Check for empty fields
    if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Please fill in all fields");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(400, "User already exists");
    }
    // console.log(req.files);
    
    // Validate and upload avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload avatar");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // Validate and upload cover image (if provided)
    let coverImage;
    if (req.files?.coverImage?.[0]?.path) {//The cover image is uploaded to Cloudinary if it exists. The coverImage field is set to the Cloudinary URL of the uploaded image. If the cover image does not exist, the coverImage field is set to an empty string.
        const coverImageLocalPath = req.files.coverImage[0].path;
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    // Ensure avatar was uploaded successfully
    if (!avatar) {
        throw new ApiError(500, "Error uploading avatar image");
    }

    // Create new user
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Error creating user");
    }

    // Return success response
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User created successfully")
    );
});


const loginUser=asyncHandler(async (req,res)=>{//read Readme.md

    const {email,username,password}=req.body;//The login controller function is similar to the registerUser controller function. It takes the email or username and password from the request body.

    if(!(email||username)){//The email or username is required to login. If the email or username is not provided, an error is thrown.
        throw new ApiError(400,"Please provide email or username");
    }

    const user=await User.findOne({//The user is found in the database using the email or username provided in the request body.
        $or:[{email},{username}]
    })

    if(!user){//If the user is not found, an error is thrown.
        throw new ApiError(404,"User not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password);//The isPasswordCorrect method is called on the user object to check if the password provided in the request body is correct.

    if(!isPasswordValid){//If the password is incorrect, an error is thrown.
        throw new ApiError(401,"Invalid credentials")
    }

    const {accessToken,refreshToken}=await generateAccessandRefreshTokens(user._id);//The generateAccessandRefreshTokens function is called to generate the access and refresh tokens for the user.
    
    const userLoggedIn=await User.findById(user._id).select('-password -refreshToken');//The user object is retrieved from the database, excluding the password and refresh token fields.

    //
    const options={//The options object is used to set the HTTPOnly and Secure flags for the refresh token cookie.
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .cookie('AccessToken',accessToken,options)
    .cookie('RefreshToken',refreshToken,options)
    .json(
        new ApiResponse(200,{user:userLoggedIn,accessToken,refreshToken},"User logged in successfully")
    )

})

const logoutUser = asyncHandler(async (req, res) => {//The logoutUser controller function is used to log out the user by clearing the access and refresh tokens from the cookies and setting the refresh token to undefined in the database. The function first finds the user in the database using the user ID from the request object. It then updates the user object to set the refresh token to undefined. Finally, it clears the access and refresh tokens from the cookies and returns a success response. If an error occurs during the process, an error response is returned. The function is exported to be used in the user routes. 
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined
        }
    },
    {
        new:true
    }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("AccessToken", options)
        .clearCookie("RefreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));

});

const refreshAccessToken=asyncHandler (async (req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
    
    if (!incomingRefreshToken) {
        throw new ApiError(400,"Unothrized request");
    }

    try {
        const decodedToken=jwt.verify(incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user=await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
        const options={
            httpOnly:true,
            secure:true
        }

        const{accessToken,newRefreshToken}=await generateAccessandRefreshTokens(user._id)

        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken:new RefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid refresh token");
        
    }
})

const changeCurrentPassowrd=asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword}=req.body
    const user=await User.findById(req.user._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (isPasswordCorrect) {
        throw new ApiError(400,'Invalid old password')
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,{},'password is changes successfully'))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiResponse(200,req.user,"user fecthed successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const{fullName,email}=req.body

    if(!fullName||!email){
        throw new ApiError(400,"All fields are required")
    }

    const user=User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullName,
            email,
        }},
        {
            new: true,
        }
    ).select('-password')

    return res.status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,'Error while uploading on avatar')
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:avatar.url
        }
    },{new:true}).select('-password')

    return res.status(200)
    .json(new ApiResponse(200,user,"Avatar updated successfully"))
})

const updateCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage file is missing");
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            coverImage:coverImage.url
        }
    },{new:true}).select('-password')

    return res.status(200)
    .json(new ApiResponse(200,'updated coverimage successfully'))
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const{username}=req.params

    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }

    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:'subscriptions',
                localField:'_id',
                foreignField:'channel',
                as:'subscribers',
            }
        },
        {
            $lookup:{
                from:'subscriptions',
                localField:'_id',
                foreignField:'subscriber',
                as:'subscribedTo'
            }
        },
        {
            $addFields:{
                subscibersCount:{
                    $size:'$subscribers'
                },
                channelSubscribedToCount:{
                    $size:'subscribedTo'
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,'subscribers.subscriber']}
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                email:1,
                coverImage:1,
                avatar:1,
                subscibersCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
            }
        }
    ])
    
    if(!channel?.length){
        throw new ApiError(400,"Channel doesnot exists");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],'User channel fecthed successfully'))
})



export { registerUser, loginUser, logoutUser,refreshAccessToken, changeCurrentPassowrd, getCurrentUser, updateAccountDetails, updateUserAvatar, updateCoverImage , getUserChannelProfile};




