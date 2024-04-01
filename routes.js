// Core:
import { unlink, createReadStream } from "fs";
import { pipeline } from "stream/promises";
// Local:
import { jsUpload, jsCheck, Js2Json } from "./Functions/js-2-json.js";
import { jsonUpload, jsonCheck, Json2Js } from "./Functions/json-2-js.js";
// 3rd Party:
import cors from "cors";
import Express from "express";
// destruct/constants/variables
const convertPath = Express.Router();

convertPath.post("/js-2-json", cors(), jsUpload, async(req, res, next )=>{ 
  
  try {
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
          const newJsFile = await Js2Json();
// can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
          const { newFileName, originalFilePath, filePath} = newJsFile;
          const options = {
            "Content-Type": "text/javascript",
            "Content-Source": "upload",
            "Document-Name": newFileName,
            "Transmission": "download"
          };
         // res.writeHead(201, { options });
         for(let [key, val] of Object.entries(options)) {
          res.append(key, val);
         }
          await pipeline(createReadStream(filePath), res);
          res.status(201);
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
        }
      } catch(err) { 
        const msg = "An error occured during the process. Make sure that the syntax of your file is correct.";
        err.originalFilePath.unlink(file, (err)=>{
          if(err){
            console.error("Cannot destruct file uploaded: ", err)
          } else {
            console.log("File uploaded destruct OK")
          }
        })
        res.status( 500 ).send( err.msg || msg )}
      })


      convertPath.post("/json-2-js", cors(), jsonUpload, async(req, res, next )=>{ 
        
        try {

        console.log(req.body, req.file); 
        const checker = jsonCheck(req.file); 
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
          const newJsFile = await Json2Js();
// can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
          const { newFileName, originalFilePath, filePath} = newJsFile;
          const options = {
            "Content-Type": "text/javascript",
            "Content-Source": "upload",
            "Document-Name": newFileName,
            "Transmission": "download"
          };
         // res.writeHead(201, { options });
         for(let [key, val] of Object.entries(options)) {
          res.append(key, val);
         }
          await pipeline(createReadStream(filePath), res);
          res.status(201);
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
        }
      } catch(err) { 
        const msg = "An error occured during the process. Make sure that the syntax of your file is correct."
        err.originalFilePath.unlink(file, (err)=>{
          if(err){
            console.error("Cannot destruct file uploaded: ", err)
          } else {
            console.log("File uploaded destruct OK")
          }
        })
        res.status( 500 ).send( err.msg || msg )}
      })


export default convertPath;