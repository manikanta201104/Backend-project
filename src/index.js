import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";


dotenv.config({
    path:"./.env"
});

connectDB()
.then(() => {
    app.on("ERROR", (error) => {
        console.error("Application error:", error);
        throw error;
    });

    // Start the server
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
})
.catch((error) => {
    console.error("MongoDB connection is failed:", error);
    process.exit(1); // Exit with failure
});

/* The second approach is simple 
    create a folder called db and create a file called index.js and write the below code about mongoose connection
    and import the file in the index.js file in the db folder to  index.js in main folder
*/

/*

this is first approach

import express from "express";
import { the } from './../node_modules/semver/internal/re';
const app=express();

(async()=>{
    try {
        await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`)
        app.on("ERROR",(error)=>{
            console.error(error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error(error);
        throw error;    
    }
})();
*/




