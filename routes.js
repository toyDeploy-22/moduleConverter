// Core:
// Local:
import { jsUpload, jsCheck, Js2Json } from "./Functions/js-2-json.js";
// 3rd Party:
import Express from "express";

// destruct/constants/variables
const convertPath = Express.Router();

convertPath.post("/js-2-json", jsUpload, async(req, res, next )=>{
try {
        console.log(req.body, req.file); 
        const checker = jsCheck(req.file); 
        if(checker.error) {
          res.status(checker.code || 400).send(checker.msg)
        } else {
          Js2Json();
          res.download(Js2Json.file);
          res.status(201).send(Js2Json.msg)
        }
      }
catch(err){
  console.error(err);
  res.status(500).send(err.message)
}
})

export default convertPath;