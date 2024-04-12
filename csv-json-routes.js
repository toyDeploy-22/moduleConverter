// Core:
import { emptyDir, remove } from "fs-extra";
//import { pipeline } from "stream/promises";
// Local:
import { jsonUpload, jsonCheck, Json2CSV } from "./Functions/json-2-csv.js";
// 3rd Party:
import cors from "cors";
import Express from "express";

// destruct/constants/variables
const Json_csv_conv = Express.Router();
let downloadFile = {};

Json_csv_conv.post("/json-2-csv", cors(), jsonUpload, async(req, res, next )=>{ 
  
  try {
    if(req.file.originalname) {
        console.log(req.body, req.file); 
        const checker = jsonCheck(req.file); 
        console.log("JSON checker :" + checker);

        switch (checker.code.toString()[0]) {
          case "4": 
          console.error(checker.msg);
          emptyDir(checker.uploadFolder, (err)=>{
            if(err) {
              console.error("No file found to destroy: " + err)
            } else { 
              console.log("File destroyed.")
            }
          });
          res.status(checker.code).send(checker); 
          break; 
          case "2":   
          const newJsonFile = await Json2CSV();
// can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
          if(!newJsonFile.error) {  
          downloadFile = {...newJsonFile};
          res.status(201).send("file can be downloaded.")
          } else { 
            if(newJsonFile.uploadFolder) {
              emptyDir(err.uploadFolder, (err)=>{
              if(err){
                console.error("Cannot destroy file uploaded: ", err)
              } else {
                console.log("File uploaded destruction OK")
              }
              })
              }
          res.status(500).send(newJsonFile.msg || "An error occured. Please try again.")
          }; 
          break;

          /**
          const options = {
            "Content-Type": "application/json",
            "Content-Source": "download",
            "Document-Name": newFileName,
          };
          
          // I) Append object key/val to Header
         // res.writeHead(201, { options });
         for(let [key, val] of Object.entries(options)) {
          res.append(key, val);
         }
         // II) Set response status:
         res.status(201);
         **/

        } 
      } else{
        res.status(400).send("No file uploaded.")
      } } catch(err) { 
        
          const msg_2 = "An error occured during the process. Make sure that the syntax of your file is correct.";

          if(err.uploadFolder) {
            emptyDir(err.uploadFolder, (err)=>{
            if(err){
              console.error("Cannot destroy file uploaded: ", err)
            } else {
              console.log("File uploaded destruction OK")
            }
            })
            }

          res.status(500).send( err.msg || msg_2 )
        }
      });


      Json_csv_conv.get("/json-2-csv/getFile", async(req, res, next )=>{ 
        try {

        if(downloadFile.newFileName) {

          let { newFileName, originalFilePath, filePath, msg} = downloadFile; 
        
        res.attachment(newFileName)
        res.status(201);
      // III) Send File
      // await pipeline(createReadStream(filePath), res);
      res.download(filePath, (err)=>{
      if(err){
        console.error("Download process failed: " , err);
      } else { 
        console.log(msg)
      }
      })

      // IV) Remove file
      setTimeout(async()=>{
        await Promise.all(
         [originalFilePath, filePath].map((file, _ind)=>{ 
          remove(file, (err)=>{
            if(err){
              console.error("Cannot destroy file nº " + Number(_ind+1) + ": ", err)
            } else {
              console.log("File nº " + Number(_ind+1) + " destruction OK")
          }
          });
        })
        )}, 100);
        
        downloadFile = {};
      } else {
        res.status(400).send("No file uploaded.")
        } 
      } catch(err) { 
        if(err.uploadFolder) {
            emptyDir(err.uploadFolder, (err)=>{
            if(err){
              console.error("Cannot destroy file uploaded: ", err)
            } else {
              console.log("File uploaded destruction OK")
            }
            })
            }
        res.status(500).send( err || "An error occured. Please try again." )
        }
      })


export default Json_csv_conv;