import mongoose, { Mongoose } from "mongoose";

const studentSchema = new mongoose.Schema({
    studentId:{
        type: String,
        required: true,
    },
    studentName:{
        type: String,
        required: true,
    },
    studentClass:{
        type: String,
        required: true,
    },
    fatherName:{
        type: String,
        required: true,
    },
    motherName:{
        type: String,
        required: true,
    },
    studentPhoto:{
        type: String
    },
    studentPhoneNumber:{
        type: String,
        required: true,
    },
    stu_attendence:[{
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['present', 'absent', 'holiday'], required: true },
    }]
},{timeStamp:true})

export const Student = mongoose.model("Student", studentSchema)