// Core:
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
// import { unlink } from "fs";
import { emptyDir, remove } from "fs-extra";
// import { pipeline } from "stream/promises";
// Local:
import { pdfUpload, pdfCheck, Pdf2Csv } from "./Functions/pdf-2-csv.js";
// 3rd Party:
import cors from "cors";
import Express from "express";
import PDFParser from "pdf2json";

// destruct/constants/variables
const pdf_csv_conv = Express.Router();
let downloadFile = {};
const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "Conversion", "UPLOAD");
const pdfParser = new PDFParser();

// functions
const pdfPromise = (filename) => {

	return new Promise((resolve, reject) => {
		
		pdfParser.on("pdfParser_dataError", (err) => {
			reject({
				error: true,
				msg: err.message || "Parsing PDF Data Rejection"
			})
		});
		
		pdfParser.on("pdfParser_dataReady", (pdfData) => {
			resolve({
				error: false,
				data: pdfData.Pages[0].Texts
				})
		});

	 pdfParser.loadPDF(join(conversionFolder, filename))
		})
	}
	
	const promiseToCSV = async(filename) => {
		const promiseResult = {};
		try {
		const promiseData = await pdfPromise(filename);
		const filePromise = await promiseData.data;
			promiseResult.err = false;
			promiseResult.data = filePromise;
			// console.log("finally success: ", promiseResult)
		} catch(err) {
			promiseResult.err = true;
			promiseResult.msg = `extraction Data error: ${err.message}` || "An error occured during data extraction."
		}
		
		return promiseResult
	}


		pdf_csv_conv.options("/pdf-2-csv", cors())
        pdf_csv_conv.post("/pdf-2-csv", cors(), pdfUpload, async(req, res, next )=>{  
        
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
			  const fileToCSV = await promiseToCSV(req.file.filename);
              const newCsvFile = await Pdf2Csv(fileToCSV.data);
			  // console.log('FNAME: ', fileToCSV)
    // can use "res.download(newFile.file.toString());" but nothing can be done after it, contrary to res.writeHead.
             if(!newCsvFile.error) {
             downloadFile = { ...newCsvFile };
            res.status(201).send("file can be downloaded.")
            } else { 
                if(newCsvFile.uploadFolder) {
                emptyDir(newCsvFile.uploadFolder, (err)=>{
                if(err){
                  console.error("Cannot destroy file uploaded: ", err.message)
                } else {
                  console.log("File uploaded destruction OK")
                }
                })
                }
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
            
            res.writeHead(201, { options });
            
            for(let [key, val] of Object.entries(options)) {
            res.append(key, val);
            }
            
            // II) Set response status:
            // res.status(201); 
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

        pdf_csv_conv.get("/pdf-2-csv/getFile", cors(), async(req, res, next )=>{ 
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
          )}, 1000);
          downloadFile = {};
        } else {
          res.status(400).send("No file uploaded.")
          } 
        } catch(err) { 
            if(downloadFile.uploadFolder) {
            emptyDir(downloadFile.uploadFolder, (err)=>{
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



      export default pdf_csv_conv;