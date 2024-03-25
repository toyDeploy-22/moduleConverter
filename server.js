// Core:
// Local:
import convertPath from "./routes.js";
import sendError from "./Functions/errorEvents.js";
// 3rd Party:
import cors from "cors";
import Express from "express";

// destruct/constants/variables
const { MY_PORT } = process.env;
const myServer = Express();
const myPort = MY_PORT || 5000;

// middlewares
myServer.use(cors());
myServer.use(Express.json());
myServer.use("/convert",convertPath);
myServer.use(sendError);
// server
myServer.listen(myPort, ()=>{
    console.log("Converter Module is on")
})

myServer.on("error", (err)=>{
    console.error({
        err: true,
        type: "Server crashing",
        msg: err})
})