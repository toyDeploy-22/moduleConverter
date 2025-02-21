// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
// Local:
// 3rd Party:
import multer from "multer";
import PDFParser from "pdf2json";
// https://www.npmjs.com/package/pdfkit
// https://github.com/modesty/pdf2json/npm

// destruct/constants/variables
const { createWriteStream } = fs;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "..", "Conversion");

const d = new Date;
let newPdfFile;
const pdfParser = new PDFParser();

const pdfStorage = multer.diskStorage({
    destination: join(conversionFolder, "UPLOAD"),
    filename: function (req, file, cb) {
      const pdfName = `New_Pdf-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newPdfFile = pdfName + ExtName;
      cb(null, newPdfFile)
    }
});

const pdfUpload = multer({
    storage: pdfStorage,
    }).single("uplFile");

    const CSV_Folder = join(conversionFolder, "CSV");
    const folderCheck = multer.diskStorage({
            destination: CSV_Folder
        });
    
    multer({ storage: folderCheck});
    
function pdfCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.pdf' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "pdf").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newPdfFile);
        result.msg = "Not converted. Please make sure that the file has a pdf extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

const newCsvFile = "New_Convert-" + d.getTime() + ".csv"; 
const csvPath = join(conversionFolder,"CSV");

const extractContent = (pdfFile) => {

    const pdfFilePath =  join(join(conversionFolder,"UPLOAD"), pdfFile);
    let result = new Object();
    
    pdfParser.on("pdfParser_dataReady", (pdfBuffer) => {
    result = {
        error: false,
        data: JSON.stringify(pdfBuffer)
    }
    
    return result
 })

  pdfParser.on("pdfParser_dataError", (err)=>{
    console.error(err);
    result = {
        error: true,
        msg: 'Could not access to PDF content.',
        ...err
        }
    return result
    })

    pdfParser.loadPDF(pdfFilePath)

 }

const contentToCsv = (content) => {
    try {
    const csvContent = content.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').split(" ");
    
    return csvContent.join(",");
    } catch(err) {
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        console.log("error at writing content to CSV function: ", errMsg)
    }
}

const csvMaking = async(newFileName) => {

try {
    const result = new Object();
         //Omit option to extract all text from the pdf file
        //Omit option to extract all text from the pdf file
    const pdfData = extractContent(newPdfFile);

    if(pdfData.error) {
        result.error = true;
        result.msg = pdfData.msg;
        return result
    } else {
        const pdfBuffer = await pdfData.data;
        const PDFToCSV = await contentToCsv(pdfBuffer);
        
        const csvContent = createWriteStream(join(csvPath, newFileName));
        csvContent.write(PDFToCSV);

        result.error = false;
        result.msg = "success";
        return result        
        }
    } catch(err) {
    const errMsg = `: ${err.message}` || ". Check object above";
    console.error(err);
    console.log("An error occured during writing conversion: ", errMsg)
    result.error = true;
    result.msg = errMsg;
    return result
    }        
}

async function Pdf2Csv() { 
    
    let result = {};

    try{
       
    const createCSV = await csvMaking(newCsvFile);
    // await writeFile(join(join(conversionFolder, "./JSON"), newJsonName), jsonBuffer); 
    if(createCSV.error) {
    result = {
    error: true,
    code: 401,
    uploadFolder: join(conversionFolder,"UPLOAD"),
    msg: "Something went wrong during the CSV creation: " + createCSV.msg
        }
    return result
    } else {
    result = {
    error: false,
    code: 201,
    newFileName: newCsvFile,
    uploadFolder: join(conversionFolder,"UPLOAD"),
    originalFilePath: join(join(conversionFolder,"UPLOAD"), newPdfFile),
    filePath: join(join(conversionFolder, "CSV"), newCsvFile),
    msg: "PDF file successfully converted to CSV. Ready for download."}}
    return result
    } catch(err) { 
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result = {
        error: true,
        code: 500,  
        uploadFolder: join(conversionFolder,"UPLOAD"),
        originalFilePath: join(join(conversionFolder,"UPLOAD"), newPdfFile),
        msg: "The conversion process stopped due to the following issue: " + errMsg
        }
        return result
    }
} 

export { pdfUpload, pdfCheck, Pdf2Csv };