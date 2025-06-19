import { error } from "console";
import { Teacher } from "../models/teacher.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


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


const saveIP = asyncHandler(async (req,res)=>{
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const teacher = req.teacher
    const teacherId = teacher.teacherId
    if (!teacherId) {
        throw new ApiError(400, "Teacher ID is required to save IP address.");
    }
    if (!clientIp) {
        throw new ApiError(500, "Could not determine client IP address.");
    }

    const updatedTeacher = await Teacher.findOneAndUpdate(
        {
            teacherId:teacherId
        },
        {
            IP:clientIp
        },
        {
            new:true, runValidators:true
        }
    )

    if(!updatedTeacher){
        throw new ApiError(404, "Teacher not found.");
    }

    return res.status(200).json(
        new ApiResponse(200,updatedTeacher,"IP saved successfully")
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


export {addTeacher,loginTeacher,saveIP,getCurrentTeacher}