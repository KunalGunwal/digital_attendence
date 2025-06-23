import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()


const corsOptions = {
        // Allow requests from your React development server's origin
        origin: 'http://localhost:5173', // <--- IMPORTANT: Replace with your Vite/React dev server URL
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers (Authorization is crucial for JWT)
        credentials: true, // Allow sending cookies, authorization headers, etc.
        optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
    };
    app.use(cors(corsOptions)); // Use the CORS middleware


app.use(express.json({ limit: "50mb" })); // Increased limit for image data
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public")); // To serve static files, including temp if needed
app.use(cookieParser());

//routes import
import teacherRouter from "./routes/teacher.route.js"
app.use("/api/attendence_tracker",teacherRouter)

import studentRouter from "./routes/student.route.js"
app.use("/api/attendence_tracker",studentRouter)


export {app} 

