// Core:
import { unlink, createReadStream } from "fs";
import { pipeline } from "stream/promises";
// Local:
import { jsUpload, jsCheck, Js2Json } from "./Functions/js-2-json.js";
// 3rd Party:
import Express from "express";
// destruct/constants/variables
const convertPath = Express.Router();

convertPath.post("/js-2-json", jsUpload, async(req, res, next )=>{

        console.log(req.body, req.file); 
        const checker = jsCheck(req.file); 
        console.log("checker :" + checker);

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
// can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
          const { newFileName, originalFilePath, filePath} = newFile;
          const options = {
            "Content-Type": "application/json",
            "Content-Source": "upload",
            "Document-Name": newFileName,
            "Transmission": "download"
          };
          res.writeHead(201, { options });
          await pipeline(createReadStream(filePath), res);
          await Promise.all(
            [originalFilePath, filePath].map((file, _ind)=>{ 
              unlink(file, (err)=>{
                if(err){
                  console.error("Cannot destruct file nº " + Number(_ind+1) + ": ", err)
                } else {
                  console.log("File nº " + Number(_ind+1) + " destruction OK")
                }
              })
            })
            );
            return true;
        }
      })

export default convertPath;