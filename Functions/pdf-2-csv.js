// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import { readFile, createWriteStream } from "fs";
// Local:
// 3rd Party:
import multer from "multer";
import PDFParser from "pdf2json";
// https://www.npmjs.com/package/pdfkit
// https://github.com/modesty/pdf2json/npm

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "..", "Conversion");

const d = new Date;
let newPdfFile;

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

const contentToCsv = (content) => {
    try {
    // const csvContent = content.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    // const splitter = content.split(" ");
	// const noSpaces = splitter.filter((str) => str !== "").join(" ");
	const noSpaces = content.trim();
	return noSpaces
    // return csvContent.join(",");
    } catch(err) {
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        console.log("error at writing content to CSV function: ", errMsg)
    }
}

	// Promise Logic
	
	/**
	const pdfPromise = (filename) => {
	const pdfParser = new PDFParser();
	return new Promise((resolve, reject) => {
		
		pdfParser.on("pdfParser_dataError", (err) => {
			reject({error: true, msg: "An error occured during parsing." || err.message})
		});
		
		pdfParser.on("pdfParser_dataReady", (pdfData) => {
			resolve({
			error: false,
			data: pdfData.Pages[0].Texts
		})});

	 pdfParser.loadPDF(join(conversionFolder, filename))
	})
	}
	
	const promiseToCSV = (filename, csvFile) => {
		pdfPromise(filename)
		.then((pdfData) => {
			const newBuffer = pdfData.data;
			const bufferWriteStream = createWriteStream(join(csvPath, csvFile));
			newBuffer.forEach((txt) => {
			let strPDF = txt.R[0].T;
			let pdfSpaces = strPDF.replaceAll(/[%20%%22%]/g, " ");
			let pdf2CSV = contentToCsv(pdfSpaces);
			bufferWriteStream.write(pdf2CSV)})})
		.finally(() => console.log("success"))
		.catch((err) => console.error(err))
	}

NOT NEEDED

const csvMaking = async(csvFolder, newcsv) => {

    const result = new Object();
         //Omit option to extract all text from the pdf file
        //Omit option to extract all text from the pdf file
	try{
	const csvPathFile = join(join(conversionFolder,"CSV"), newcsv);
	result.error = false;
	return result
	} catch(err){
	console.error(err);
	result.error = true;
	result.msg = err.message || "Error at CSV edition. Check above fore more results";
	return result
	}
  }   
**/

async function Pdf2Csv(data) { 
    let result = {};

    try{
	const bufferWriteStream = createWriteStream(join(csvPath, newCsvFile));
	
	for(let i = 0; i < data.length; i++) {
			let strPDF = data[i].R[0].T;
			let pdfSpaces = decodeURIComponent(strPDF);
			let pdf2CSV = contentToCsv(pdfSpaces);
			data.length - 1 === i ? bufferWriteStream.write(`"${pdf2CSV}"`) : bufferWriteStream.write(`"${pdf2CSV}", `)
	}
	
	/*
	data.forEach((txt) => {
			let strPDF = txt.R[0].T;
			let pdfSpaces = strPDF.replaceAll(/[%20%%22%]/g, " ");
			let pdf2CSV = contentToCsv(pdfSpaces);
			bufferWriteStream.write(pdf2CSV)})
	*/

    result = {
    error: false,
    code: 201,
    newFileName: newCsvFile,
    uploadFolder: join(conversionFolder, "UPLOAD"),
    originalFilePath: join(join(conversionFolder,"UPLOAD"), newPdfFile),
    filePath: join(csvPath, newCsvFile),
    msg: "PDF file successfully converted to CSV. Ready for download."}
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