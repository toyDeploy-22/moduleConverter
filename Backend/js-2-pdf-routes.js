// Core:
// import { unlink } from "fs";
import { emptyDir, remove } from "fs-extra";
// import { pipeline } from "stream/promises";
// Local:
import { jsUpload, jsCheck, js2Pdf } from "./Functions/js-2-pdf.js";
// 3rd Party:
import cors from "cors";
import Express from "express";
// destruct/constants/variables
const js_pdf_conv = Express.Router();
let downloadFile = {};

js_pdf_conv.post("/js-2-pdf", cors(), jsUpload, async(req, res, next )=>{ 
 
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
              console.error("No file found to destroy: " + err.message)
            } else { 
              console.log("File destroyed.")
            }
          });
          res.status(checker.code).send(checker.msg); 
          break; 
          case "2":   
          const newPdfFile = await js2Pdf();
// can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
        if(!newPdfFile.error) {  
          downloadFile = {...newPdfFile};
          res.status(201).send("file can be downloaded.")
          } else { 
            if(newPdfFile.uploadFolder) {
              emptyDir(newPdfFile.uploadFolder, (err)=>{
              if(err){
                console.error("Cannot destroy file uploaded: ", err.message)
              } else {
                console.log("File uploaded destruction OK")
              }
              })
              }
          res.status(500).send(newPdfFile.msg || "An error occured. Please try again.")
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
                  console.error("Cannot destroy file uploaded: ", err.message)
                } else {
                  console.log("File uploaded destruction OK")
                }
                })
              }
              res.status(500).send( err.message || msg_2 )
            }
          });



          js_pdf_conv.get("/js-2-pdf/getFile", cors(), async(req, res, next )=>{ 
            try {
  
            if(downloadFile.newFileName) {
            
              let { newFileName, originalFilePath, filePath, msg} = downloadFile; 
            
            res.attachment(newFileName)
            res.status(201);
          // III) Send File
          // await pipeline(createReadStream(filePath), res);
          res.download(filePath, (err)=>{
          if(err){
            console.error("Download process failed: " , err.message);
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
                  console.error("Cannot destroy file nº " + Number(_ind+1) + ": ", err.message)
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
                console.error("Cannot destroy file uploaded: ", err.message)
              } else {
                console.log("File uploaded destruction OK")
              }
              })
              }
            res.status(500).send( err.message || "An error occured. Please try again." )
            }
          })

          export default js_pdf_conv;
