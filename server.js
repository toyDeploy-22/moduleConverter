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
import Csv_json_conv from './csv-json-routes.js';
import Js_Txt_conv from './js-txt-routes.js';
import js_pdf_conv from './js-2-pdf-routes.js';
import csv_pdf_conv from './csv-pdf-routes.js';
import pdf_csv_conv from './pdf-csv-routes.js';
import pdf_json_conv from './pdf-json-routes.js';
import pdf_Js_conv from './pdf-js-routes.js';
import Json_txt_conv from './json-txt-routes.js';
import sendError from "./Functions/errorEvents.js";
// 3rd Party:
import Express from "express";

// destruct/constants/variables
const { MY_PORT } = process.env;
const myServer = Express();
const myPort = MY_PORT || 5000;
const convertions = [
    Js_Txt_conv,
	js_pdf_conv,
    Json_convertions,
    Json_csv_conv,
    Json_txt_conv,
    csv_convertions,
    Csv_json_conv , 
    csv_txt_conv,
    csv_pdf_conv,
    pdf_convertions, 
    txt_json_conv,
    txt_pdf_conv,
    txt_csv_conv,
    pdf_csv_conv,
    pdf_json_conv,
	pdf_Js_conv
]
// middlewares
myServer.use(Express.json());
convertions.forEach((convert)=>myServer.use("/convert", convert))

myServer.use(sendError);
// server
myServer.listen(myPort, ()=>{
    console.log("Converter Module is on")
})

myServer.on("error", (err)=>{
    console.error({
        err: true,
        type: "Server crashing",
        msg: err.message})
})