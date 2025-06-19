import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";

const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import teacherRouter from "./routes/teacher.route.js"
app.use("/api/attendence_tracker",teacherRouter)

import studentRouter from "./routes/student.route.js"
app.use("/api/attendence_tracker",studentRouter)


export {app} 

