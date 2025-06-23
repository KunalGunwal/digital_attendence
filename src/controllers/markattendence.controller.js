import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {sendEmail} from "../utils/sendEmail.js";
//import { sendSms } from "../utils/sendEmail.js";


const markStuAttendence = asyncHandler(async (req,res)=>{
    const att = req.body;
    console.log(att)
    const attArray = Object.entries(att)
    const operations = []
    const attendanceDate = new Date()
    for(const record of attArray){       
        const studentId = record[0]
        const status = record[1]
        if(status==="absent"){
            const stu = await Student.findOne({studentId:studentId})
            console.log(stu.studentEmail)
            const to = stu.studentEmail

            //console.log(to)
            const messageBody = `Your Ward \n Name -> ${stu.studentName} \n Roll No -> ${stu.studentId} \n Class -> ${stu.studentClass} \n is absent today.`
            await sendEmail(to,"Your Ward is Absent Today", messageBody)
        }
        console.log(`${status}`)
        const stu = await Student.updateOne(
            {studentId:studentId},
            {$push :{
                stu_attendence:{
                    date: attendanceDate,
                    status : status
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

const retriveStudents = asyncHandler(async (req, res) => {
    const teacher = req.teacher;

    if (!teacher || !teacher.teacherClass) {
        throw new ApiError(401, "Teacher not authenticated or class information missing.");
    }

    const studentClass = teacher.teacherClass;

    const stu = await Student.find({ studentClass: studentClass });

    console.log(stu)
    return res.status(200).json(new ApiResponse(200, stu, "List of students retrieved successfully"));
});

export {markStuAttendence, markTeacherAttendence,retriveStudents}