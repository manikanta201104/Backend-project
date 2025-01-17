import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path:"./.env"
});

connectDB();


/* The second approach is simple 
    create a folder called db and create a file called index.js and write the below code about mongoose connection
    and import the file in the index.js file in the db folder to  index.js in main folder
*/

/*

this is first approach

import express from "express";
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




