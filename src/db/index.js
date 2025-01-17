import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";


const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        console.log(`MongoDB is connected to ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MangoDB connection is FAILED :",error);
        process.exit(1);
    }
}

export default connectDB;