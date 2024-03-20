// Core:
// Local:
import { jsUpload, Js2Json } from "./Functions/js-2-json.js";
// 3rd Party:
import Express from "express";

// destruct/constants/variables
const convertPath = Express.Router();

convertPath.post("/js-2-json", jsUpload.single("jsonFile"), async(req, res, next )=>{
try {}
catch(err){}
})

export default convertPath;