import express from "express";
const app=express();
import cors from "cors"; //Imports cors for enabling Cross-Origin Resource Sharing.
import cookieParser from "cookie-parser"; //Imports cookieParser for handling cookies.


app.use(cors({
    origin:process.env.CORS_ORIGIN,//This option specifies the origin that is allowed to access the server. In this case, it is set to the CLIENT_URL environment variable.
    credentials:true //This option allows the server to send cookies to the client.credentials: true enables cookies to be sent with cross-origin requests.
}));
app.use(express.json());//This middleware parses incoming requests with JSON payloads. It limits the payload size to 5MB.
app.use(express.urlencoded({extended:true}));//This middleware parses incoming requests with URL-encoded payloads. It allows for nested objects in the URL-encoded data.
app.use(cookieParser());//This middleware parses cookies attached to the client request. It populates the req.cookies object with the parsed cookies.
app.use(express.static("public"));//This middleware serves static files from the public directory. It allows access to files in the public directory from the client side.

import userRouter from './routes/user.routes.js';//Imports the userRouter from the user.routes.js file.
app.use("/api/v1/users",userRouter);//This middleware uses the userRouter for routes starting with /api/users.


export default app;//Exports the app instance for use in other files.