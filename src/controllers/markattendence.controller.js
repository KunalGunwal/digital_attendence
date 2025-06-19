import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import mongoose from "mongoose";

const markStuAttendence = asyncHandler(async (req,res)=>{
    const att = req.body.att;
    //console.log(att)
    //const attArray = Object.entries(att);
    const operations = []
    const attendanceDate = new Date()
    for(const record of att){       
        const studentId = record[0]
        const studentatt = record[1]
        //console.log(`${studentatt}`)
        const stu = await Student.updateOne(
            {studentId:studentId},
            {$push :{
                stu_attendence:{
                    date: attendanceDate,
                    status : studentatt
                }
            }}
        )
        operations.push(stu)
    }


    return res.status(200).json(
        new ApiResponse(
            200,
            operations,
            "Attendance marked successfully!"
        )
    );
    
})


const markTeacherAttendence = asyncHandler(async (req,res)=>{
    const teacher = req.teacher
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if(!teacher){
        throw new ApiError(400,"Teacher can't be fetch")
    }
    const teacherId = teacher.teacherId
    if(teacher.IP != clientIp){
        throw new ApiError(400,"Bad request, IP addresses can't be matched, This incident will be reported.")
    }
    const attendanceDate = new Date()
    const result = await Teacher.updateOne(
        {teacherId:teacherId},
        {$push : {
            teacher_attendence:{
                date: attendanceDate,
                status: "present"
            }
        }}
    )
    console.log(attendanceDate)
    return res.status(200).json(
        new ApiResponse(200,{ acknowledged: result.acknowledged,
                modifiedCount: result.modifiedCount,},"Attendence marked successfully")
    )

})

const retriveStudents = asyncHandler(async (req,res)=>{
    const teacher = req.teacher
    const class_ = teacher.teacherClass

    const stu = await Student.find({studentClass:class_})

    const studentIds = stu.map(student => student.studentId);

    return res.status(200).json( new ApiResponse(200, studentIds, "List of students"))
})

export {markStuAttendence, markTeacherAttendence,retriveStudents}