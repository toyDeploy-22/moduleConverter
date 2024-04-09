// Core:
import { emptyDir, remove } from "fs-extra";
//import { pipeline } from "stream/promises";
// Local:
import { jsUpload, jsCheck, Js2Json } from "./Functions/js-2-json.js";
import { jsonUpload, jsonCheck, Json2Js } from "./Functions/json-2-js.js";
// 3rd Party:
import cors from "cors";
import Express from "express";

// destruct/constants/variables
const Json_convertions = Express.Router();
let downloadFile = {};

Json_convertions.post("/js-2-json", cors(), jsUpload, async(req, res, next )=>{ 
  
  try {
    if(req.file.originalname) {
        console.log(req.body, req.file); 
        const checker = jsCheck(req.file); 
        console.log("checker :" + checker);

        switch (checker.code.toString()[0]) {
          case "4": 
          console.error(checker.msg);
          emptyDir(checker.originalFilePath, (err)=>{
            if(err) {
              console.error("No file found to destroy: " + err)
            } else { 
              console.log("File destroyed.")
            }
          });
          res.status(checker.code).send(checker.msg); 
          break; 
          case "2":   
          const newJsonFile = await Js2Json();
// can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
          if(!newJsonFile.error) {  
          downloadFile = {...newJsonFile};
          res.status(201).send("file can be downloaded.")
          } else { 
            emptyDir(newJsonFile.originalFilePath, (err)=>{
              if(err) {
                console.error("No file found to destroy: " + err)
              } else { 
                console.log("File destroyed.")
              }
            });
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

          if(err.originalFilePath) {
            emptyDir(err.originalFilePath, (err)=>{
            if(err){
              console.error("Cannot destroy file uploaded: ", err)
            } else {
              console.log("File uploaded destruction OK")
            }
            })
          } else {
            console.log("No file found to destroy.")
          }
          res.status(500).send( err.msg || msg_2 )
        }
      });


      Json_convertions.get("/js-2-json/getFile", cors(), async(req, res, next )=>{ 
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
        emptyDir(err.originalFilePath, (err)=>{
          if(err) {
            console.error("No file found to destroy: " + err)
          } else { 
            console.log("File destroyed.")
          }
        });
        res.status(500).send( err || "An error occured. Please try again." )
        }
      })


      Json_convertions.post("/json-2-js", cors(), jsonUpload, async(req, res, next )=>{ 
        
        try { 
          if(req.file.originalname) {
        console.log(req.body, req.file); 
        const checker = jsonCheck(req.file); 
        console.log("JSON checker :" + checker);

        switch (checker.code.toString()[0]) {
          case "4": 
          console.error(checker.msg);
          emptyDir(checker.destination, (err)=>{
            if(err) {
              console.error("No file found to destroy: " + err)
            } else { 
              console.log("File destroyed.")
            }
          });
          res.status(checker.code).send(checker.msg); 
          break;
          case "2":   
          const newJsFile = await Json2Js();
// can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
            if(!newJsFile.error) {
             downloadFile = {...newJsFile};
            res.status(201).send("file can be downloaded.")
            } else { 
              emptyDir(newJsFile.originalFilePath, (err)=>{
                if(err) {
                  console.error("No file found to destroy: " + err)
                } else { 
                  console.log("File destroyed.")
                }
              });
            res.status(500).send(newJsFile.msg || "An error occured. Please try again.")
            }; 
            break;
          
            /**
      const options = {
  "Content-Type": "text/javascript",
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
            
            if(err.originalFilePath) {
            emptyDir(err.originalFilePath, (err)=>{
            if(err){
              console.error("Cannot destroy file uploaded: ", err)
            } else {
              console.log("File uploaded destruction OK")
            }
            })
            } else {
              console.log("No file found to destroy.")
            }
            res.status(500).send( err.msg || msg_2 )
          }
        });


        Json_convertions.get("/json-2-js/getFile", cors(), async(req, res, next )=>{ 
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
            })
          })
          )}, 500);
          downloadFile = {};
        } else {
          res.status(400).send("No file uploaded.")
          } 
        } catch(err) { 
          emptyDir(err.originalFilePath, (err)=>{
            if(err) {
              console.error("No file found to destroy: " + err)
            } else { 
              console.log("File destroyed.")
            }
          });
          res.status(500).send( err || "An error occured. Please try again." )
          }
        });

export default Json_convertions;