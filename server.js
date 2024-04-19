// Core:
// Local:
import Json_convertions from "./json-routes.js";
import csv_convertions from "./csv-routes.js";
import pdf_convertions from "./pdf-routes.js";
import Json_csv_conv from "./json-csv-routes.js";
import txt_json_conv from "./txt-json-routes.js";
import txt_pdf_conv from "./txt-pdf-routes.js";
import csv_txt_conv from './csv-txt-routes.js';
import txt_csv_conv from './txt-csv-routes.js';
import sendError from "./Functions/errorEvents.js";
// 3rd Party:
import Express from "express";

// destruct/constants/variables
const { MY_PORT } = process.env;
const myServer = Express();
const myPort = MY_PORT || 5000;

// middlewares
myServer.use(Express.json());
myServer.use("/convert", Json_convertions);
myServer.use("/convert", csv_convertions);
myServer.use("/convert", pdf_convertions);
myServer.use("/convert", Json_csv_conv);
myServer.use("/convert", txt_json_conv);
myServer.use("/convert", txt_pdf_conv);
myServer.use("/convert", csv_txt_conv);
myServer.use("/convert", txt_csv_conv);
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