import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log("Received Token:", token); // Debugging line

        if (!token) {
            throw new ApiError(401, "Unauthorized request - Token Missing");
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded Token:", decodedToken); // Debugging line

        // Find user in DB
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        console.log("User Found:", user); // Debugging line

        if (!user) {
            throw new ApiError(401, "User no longer exists or token is invalid");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Error:", error.message); // Debugging line

        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Token expired. Please log in again.");
        } else if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid access token");
        } else {
            throw new ApiError(401, error?.message || "Unauthorized request");
        }
    }
});
