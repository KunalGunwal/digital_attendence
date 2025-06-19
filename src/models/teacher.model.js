import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    teacherId:{
        type: String,
        required: true,
    },
    teacherName:{
        type: String,
        required: true,
    },
    teacherClass:{
        type: String,
        required: true,
    },
    teacherPhoneNumber:{
        type: String,
        required: true,        
    },
    teacher_attendence:[{
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['present', 'absent', 'holiday'], required: true },
    }],
    password:{
        type: String,
        required: true, 
    },
    teacherPhoto:{
        type:String
    },
    IP:{
        type:String
    }
})

export const Teacher = mongoose.model("Teacher", teacherSchema)