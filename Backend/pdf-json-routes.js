// Core:
// import { unlink } from "fs";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url'; 
import { emptyDir, remove } from "fs-extra";
// import { pipeline } from "stream/promises";
// Local:
import { pdfUpload, pdfCheck, Pdf2Json } from "./Functions/pdf-2-json.js";
import promiseToCSV from './Functions/pdfPromise.js'; // promiseToCSV is the pdf load document Promise
// 3rd Party:
import cors from "cors";
import Express from "express";

// destruct/constants/variables
const pdf_json_conv = Express.Router();
let downloadFile = {};
const typeRequired = "JSON";
const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "Conversion", "UPLOAD");



pdf_json_conv.post("/pdf-2-json", cors(), pdfUpload, async(req, res, next )=>{ 
 
  try {
        if(req.file.originalname) {
          console.log(req.body, req.file); 
        const checker = pdfCheck(req.file); 
        console.log("PDF checker :" + checker);

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
		  const pdfLoader = join(conversionFolder, req.file.filename);
		  const fileToCSV = await promiseToCSV(typeRequired, pdfLoader);
		  const JsonContent = await fileToCSV.data;
          const newJsonFile = await Pdf2Json(JsonContent);
// can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
        if(!newJsonFile.error) {  
          downloadFile = { ...newJsonFile };
          res.status(201).send("file can be downloaded.")
          } else { 
            if(newJsonFile.uploadFolder) {
              emptyDir(newJsonFile.uploadFolder, (err)=>{
              if(err){
                console.error("Cannot destroy file uploaded: ", err.message)
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



          pdf_json_conv.get("/pdf-2-json/getFile", cors(), async(req, res, next )=>{ 
            try {
  
            if(downloadFile.newFileName) {
            
              let { newFileName, originalFilePath, filePath, msg } = downloadFile; 
            
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

          export default pdf_json_conv;