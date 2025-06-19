import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";
import {ApiResponse} from "../utils/ApiResponse.js"


const addStudent  = asyncHandler(async (req,res)=>{
    const {studentId, studentName,studentClass, fatherName, motherName, studentPhoneNumber} = req.body

    if(!studentId || !studentName || !studentClass || !fatherName || !motherName || !studentPhoneNumber){
        throw new ApiError(400, "Provide All fields")
    }
    const student = await Student.create({
        studentId,
        studentName,
        studentClass,
        fatherName,
        motherName,
        studentPhoneNumber,
    })

    await student.save()

    return res.status(200).json(
        new ApiResponse(200,student,"Student added successfully")
    )
})

export {addStudent}