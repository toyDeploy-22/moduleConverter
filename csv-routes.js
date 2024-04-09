// Core:
//import { unlink } from "fs";
import { emptyDir, remove } from "fs-extra";
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
          emptyDir(checker.uploadFolder, (err)=>{
            if(err) {
              console.error("No file found to destroy: " + err)
            } else { 
              console.log("File destroyed.")
            }
          });
          res.status(checker.code).send(checker.msg); 
          break; 
          case "2":   
          const newCsvFile = await Js2CSV();
// can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
        if(!newCsvFile.error) {  
          downloadFile = {...newCsvFile};
          res.status(201).send("file can be downloaded.")
          } else { 
            emptyDir(newCsvFile.uploadFolder, (err)=>{
              if(err) {
                console.error("No file found to destroy: " + err)
              } else { 
                console.log("File destroyed.")
              }
            });
          res.status(500).send(newCsvFile.msg || "An error occured. Please try again.")
          }; 
          break;

           /**
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



          csv_convertions.get("/js-2-csv/getFile", cors(), csvUpload, async(req, res, next )=>{ 
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


        csv_convertions.post("/csv-2-js", cors(), csvUpload, async(req, res, next )=>{  
        
          try {
            if(req.file.originalname) {
            console.log(req.body, req.file); 
            const checker = csvCheck(req.file); 
            console.log("CSV checker :" + checker);
    
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
              res.status(checker.code).send(checker.msg); 
              break; 
              case "2":   
              const newJsFile = await csv2Js();
    // can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
             if(!newJsFile.error) {
             downloadFile = {...newJsFile};
            res.status(201).send("file can be downloaded.")
            } else { 
              if(newJsFile.uploadFolder) {
                emptyDir(newJsFile.uploadFolder, (err)=>{
                if(err){
                  console.error("Cannot destroy file uploaded: ", err)
                } else {
                  console.log("File uploaded destruction OK")
                }
                })
                }
            res.status(500).send(newJsFile.msg || "An error occured. Please try again.")
            }; 
            break;

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

        csv_convertions.get("/csv-2-js/getFile", cors(), csvUpload, async(req, res, next )=>{ 
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
          if(downloadFile.uploadFolder) {
            emptyDir(downloadFile.uploadFolder, (err)=>{
            if(err){
              console.error("Cannot destroy file uploaded: ", err)
            } else {
              console.log("File uploaded destruction OK")
            }
            })
            }
            downloadFile = {};
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
            downloadFile = {};
          res.status(500).send( err || "An error occured. Please try again." )
          }
        })



      export default csv_convertions;