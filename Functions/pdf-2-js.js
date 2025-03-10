// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fse from "fs-extra";
// Local:
// 3rd Party:
import multer from "multer";
// import pdfUtil from "pdf-to-text";

// destruct/constants/variables
const { createWriteStream } = fse;

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

    const JS_Folder = join(conversionFolder, "JS");
    const folderCheck = multer.diskStorage({
                destination: JS_Folder
        });
        
    multer({ storage: folderCheck});
    
function pdfCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object();
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

const newJsFile = "New_Convert-" + d.getTime() + ".js"; 
const JsPath = join(conversionFolder,"JS");


const JSMaking = (content) => {
	// console.log(content)
	let result = {data: []};
	try {

    const pdfPath = join(join(conversionFolder,"UPLOAD"), newPdfFile);
	
	for(let i = 0; i < content.length; i++) {
			let strPDF = content[i].R[0].T;
			// let splitter = strPDF.split(/[%20%%22%]/g);
			let splitter = decodeURIComponent(strPDF);
			// let noSpace = splitter.filter((wrd) => wrd !== "");
			let noSpace = splitter.trim();
			// let pdfSpaces = noSpace.join(" ");
			result.data.push(noSpace)
	}
	result.error = false;
	return result
	} catch(err) {
		console.error(err);
		const ErrMsg = "An error occured during TEXT creation: " + err.message || "An error occured: Please check error object above";
		result.error = true;
		result.msg = ErrMsg;
		return result		
	}
			
         //Omit option to extract all text from the pdf file
        //Omit option to extract all text from the pdf file


    return result
}

// creating a promise of stream
function writeArray(streamFile, content) {
	let result;
	let message = "";
	
	const writePromise = new Promise((resolve, reject) => {
		streamFile.write("const PdfToJS = [");
		content.forEach((line) => {
			const noArr = line.replace(/^\[/g, "");
			const noArr2 = noArr.replace(/\]$/g, "");
			const str = noArr2.trim(); 
			streamFile.write(str)
			});
		streamFile.write("]");
		resolve({
		error: false
		})
	})
	
	writePromise
	.then(() => {return result})
	.catch((err) => {
		result = {
			error: true,
			msg: err.message || "An error occured during data writing. Please check object above."
		}
		return result
	})
	
}


async function Pdf2JS(content) { 
    
    let result = {};

    try{
    
    const createCont = await JSMaking(content);
    
    if(createCont.error) {
    result = {
    error: true,
    code: 401,
    uploadFolder: join(conversionFolder,"UPLOAD"),
    msg: "Something went wrong during the TXT creation: " + createCont.msg
        }
    return result
    } else {
	const JSFile = createWriteStream(join(JsPath, newJsFile)); 
	const JScontent = await writeArray(JSFile, createCont.data);
	
    result = {
    error: false,
    code: 201,
    newFileName: newJsFile,
    uploadFolder: join(conversionFolder,"UPLOAD"),
    originalFilePath: join(conversionFolder,"UPLOAD", newPdfFile),
    filePath: join(JsPath, newJsFile),
    msg: "PDF file successfully converted to Javascript. Ready for download."}
    return result
    }} catch(err) { 
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result = {
        error: true,
        code: 500, 
        uploadFolder: join(conversionFolder,"UPLOAD"),
        originalFilePath: join(conversionFolder,"UPLOAD", newPdfFile),
        msg: "The conversion process stopped due to the following issue: " + errMsg}
        return result;
    }
} 

export { pdfUpload, pdfCheck, Pdf2JS };