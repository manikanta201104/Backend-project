import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.models.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';

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

export { registerUser };
