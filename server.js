// Core:
// Local:
// 3rd Party:
import Express from "express";

// destruct/constants/variables
const { MY_PORT } = process.env;
const myServer = Express();
const myPort = MY_PORT || 5000;

// middlewares
myServer.use(Express.json());
// server
myServer.listen(myPort, ()=>{
    console.log("Converter Module is on")
})

myServer.on("error", ()=>{
    console.error("Server crashed. Please try to relaunch.")
})