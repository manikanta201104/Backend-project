import express from "express";
const app=express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { Limit } from './../node_modules/mongoose/types/pipelinestage.d';

app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true
}));
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static("public"));


export default app;