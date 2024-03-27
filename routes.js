// Core:
// Local:
import { jsUpload, jsCheck, Js2Json } from "./Functions/js-2-json.js";
// 3rd Party:
import Express from "express";

// destruct/constants/variables
const convertPath = Express.Router();

convertPath.post("/js-2-json", jsUpload, async(req, res, next )=>{

        console.log(req.body, req.file); 
        const checker = jsCheck(req.file); 
        console.log(checker);

        switch (checker.code.toString()[0]) {
          case "4": 
          console.error(checker.msg);
          res.status(checker.code || 401).send(checker.msg); 
          break; 
          case "5":   
          console.error(err);
          res.status(500).send(checker.msg); 
          break; 
          default:
          const newFile = await Js2Json();
          console.log("new file: " + newFile.file.toString());
          res.download(newFile.file.toString());
          res.status(Js2Json.code || 201).send(Js2Json.msg);
        }
      })

export default convertPath;