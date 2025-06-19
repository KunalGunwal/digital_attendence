import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Teacher } from "../models/teacher.model.js"; 

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ;

/**
 * Middleware to verify JWT token and attach teacher data to request.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request: Token missing.");
        }
        console.log(token)
        // console.log(ACCESS_TOKEN_SECRET)

        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

        const teacher = await Teacher.findById(decodedToken._id || decodedToken.teacherId);

        if (!teacher) {
            throw new ApiError(401, "Invalid Access Token: Teacher not found.");
        }

        req.teacher = teacher; 
        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "Access Token Expired.");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, "Invalid Access Token.");
        }
        if (error instanceof ApiError) {
            throw error; 
        }
        console.error("JWT verification error:", error);
        throw new ApiError(500, "Internal Server Error during token verification.");
    }
});