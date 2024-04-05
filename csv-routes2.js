// Core:
import { unlink } from "fs";
// import { pipeline } from "stream/promises";
// Local:
import { jsUpload, jsCheck, Js2CSV } from "./Functions/js-2-csv.js";
import { csvUpload, csvCheck, csv2Js } from "./Functions/csv-2-js.js";

// 3rd Party:
import cors from "cors";
import Express from "express";
// destruct/constants/variables
const csv_convertions = Express.Router();
let downloadFile = {};

csv_convertions.post("/js-2-csv", cors(), jsUpload, async(req, res, next )=>{ 
 
  try {
        if(req.file.originalname) {
          console.log(req.body, req.file); 
        const checker = jsCheck(req.file); 
        console.log("JS checker :" + checker);

        switch (checker.code.toString()[0]) {
          case "4": 
          console.error(checker.msg);
          unlink(checker.destination, (err)=>{
            if(err) {
              console.error("No file found to destroy: " + err)
            } else { 
              console.log("File destroyed.")
            }
          });
          res.status(checker.code).send(checker.msg); 
          break; 
          case "2":   
          const newJsFile = await Js2CSV();
// can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
        const { newFileName, originalFilePath, filePath, msg} = newJsFile;
        const options = {
        "Content-Type": "text/csv",
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
        setTimeout(()=>{
          Promise.all(
          [originalFilePath, filePath].map((file, _ind)=>{ 
            unlink(file, (err)=>{
              if(err){
                console.error("Cannot destroy file nº " + Number(_ind+1) + ": ", err)
              } else {
                console.log("File nº " + Number(_ind+1) + " destruction OK")
            }
            })
          })
          )}, 500);
          break;
        }} else {
          res.status(400).send("No file uploaded.")
          }
        } catch(err) { 
        const msg_2 = "An error occured during the process. Make sure that the syntax of your file is correct.";
        if(err.originalFilePath) {
        unlink(err.originalFilePath, (err)=>{
        if(err){
          console.error("Cannot destruct file uploaded: ", err)
        } else {
          console.log("File uploaded destruct OK")
        }
        })
        } else {
          console.log("No file found to destruct.")
        }
        res.status(500).send( err.msg || msg_2 )
      }
        });


        csv_convertions.post("/csv-2-js", cors(), csvUpload, async(req, res, next )=>{  
        
          try {
            if(req.file.originalname) {
            console.log(req.body, req.file); 
            const checker = csvCheck(req.file); 
            console.log("CSV checker :" + checker);
    
            switch (checker.code.toString()[0]) {
              case "4": 
              console.error(checker.msg);
              unlink(checker.destination, (err)=>{
                if(err) {
                  console.error("No file found to destroy: " + err)
                } else { 
                  console.log("File destroyed.")
                }
              });
              res.status(checker.code).send(checker.msg); 
              break; 
              case "2":   
              const newJsFile = await csv2Js();
    // can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
            const { newFileName, originalFilePath, filePath, msg} = newJsFile;
            /**
            const options = {
            "Content-Type": "text/csv",
            "Content-Source": "download",
            "Document-Name": newFileName,
            };
            
            // I) Append object key/val to Header
            
            res.writeHead(201, { options });
            
            for(let [key, val] of Object.entries(options)) {
            res.append(key, val);
            }
            **/
            // II) Set response status:
            // res.status(201); 
            res.attachment(newFileName); 
            /**
            When using res.attachment, the content-type header will be set and 
            the content-disposition to the also
            **/

            // III) Send File
            // await pipeline(createReadStream(filePath), res);
            
            downloadFile = 


            res.download(filePath, (err)=>{
            if(err){
              console.error("Download process failed: " , err);
            } else { 
              console.log(msg)
            }
            });

            // IV) Make sure remove file is AFTER the download
            setTimeout(()=>{
              Promise.all(
              [originalFilePath, filePath].map((file, _ind)=>{ 
                unlink(file, (err)=>{
                  if(err){
                    console.error("Cannot destroy file nº " + Number(_ind+1) + ": ", err)
                  } else {
                    console.log("File nº " + Number(_ind+1) + " destruction OK")
                }
                })
              })
              )}, 500);
              break;
              }} else {
                res.status(400).send("No file uploaded.")
              }
            } catch(err) { 
            
              const msg_2 = "An error occured during the process. Make sure that the syntax of your file is correct.";
            
            if(err.originalFilePath) {
            unlink(err.originalFilePath, (err)=>{
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

        csv_convertions.post("/csv-2-js/getFile", cors(), csvUpload, async(req, res, next )=>{


        })



      export default csv_convertions;