import { error } from "console";
import { Teacher } from "../models/teacher.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";


const addTeacher = asyncHandler(async (req,res)=>{
    console.log(req.body)
    const {teacherId,teacherName,teacherClass,teacherPhoneNumber,password} = req.body

    if(!teacherId || !teacherName || !teacherClass || !teacherPhoneNumber || !password){
        throw new ApiError(400,"Provide all necessary fields")
    }

    const teacher = await Teacher.create({
        teacherId,
        teacherName,
        teacherClass,
        teacherPhoneNumber,
        password
    })
    await teacher.save()

    return res.status(200).json(
        new ApiResponse(200,teacher,"teacher added successfully")
    )

})


const loginTeacher = asyncHandler(async (req,res)=>{
    const {teacherId,password} = req.body
    if(!teacherId || !password){
        throw new ApiError(400,'fill all fields properly', error)
    }
    const teacher = await Teacher.findOne({teacherId:teacherId})

    if(!teacher){
        throw new ApiError(400, 'teacher not found')
    }

    if(teacher.password !== password){
        throw new ApiError(400, 'wrong password')
    }

    const token = jwt.sign(
        { teacherId: teacher.teacherId, _id: teacher._id }, 
        process.env.ACCESS_TOKEN_SECRET,                              
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }                
    );

    const teacherResponse = teacher.toObject(); 
    delete teacherResponse.password;

    console.log(teacherResponse)
    return res.status(200).json(new ApiResponse(200, {teacher : teacherResponse, token : token}, "login successfull"))
})


const getCurrentTeacher = asyncHandler(async (req, res) => {
    const teacherProfile = req.teacher.toObject(); 
    delete teacherProfile.password;

    return res.status(200).json(
        new ApiResponse(200, teacherProfile, "Teacher profile fetched successfully.")
    );
});


const uploadTeacherPhoto = asyncHandler(async (req, res) => {
    // Multer places the file info on req.file
    const photoLocalPath = req.file?.path; // Get the temporary path of the uploaded file

    // req.teacher is populated by verifyJWT middleware
    const teacherId = req.teacher._id; // Use Mongoose _id for update

    if (!photoLocalPath) {
        throw new ApiError(400, "Photo file is missing. Please select an image to upload.");
    }

    // Upload the file to Cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(photoLocalPath);

    if (!cloudinaryResponse || !cloudinaryResponse.url) {
        // uploadOnCloudinary already handles deleting the local file and throws ApiError for severe issues.
        throw new ApiError(500, "Failed to upload photo to Cloudinary. Please try again.");
    }

    // Find the teacher and update their photo URL in the database
    const teacher = await Teacher.findByIdAndUpdate(
        teacherId,
        {
            $set: {
                teacherPhotoUrl: cloudinaryResponse.url,
                // If you stored public ID for deletion:
                // teacherPhotoPublicId: cloudinaryResponse.public_id,
            }
        },
        { new: true, runValidators: true } // Return updated doc, run schema validators
    );

    if (!teacher) {
        throw new ApiError(404, "Teacher not found after photo upload (unexpected).");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            teacherId: teacher.teacherId,
            teacherPhotoUrl: teacher.teacherPhotoUrl,
            message: "Teacher photo uploaded successfully!"
        }, "Photo updated.")
    );
});



export {addTeacher,loginTeacher,uploadTeacherPhoto,getCurrentTeacher}