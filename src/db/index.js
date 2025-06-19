import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async ()=>{
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URL}`, {
        })
        console.log(`MongoDB connected !! DB Host: ${connectioninstance.connection.host}`);
    } catch (error) {
        console.log("error in db connection", error)
        process.exit(1)       
    }
}

export default connectDB