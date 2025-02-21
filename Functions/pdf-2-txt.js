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

    const TXT_Folder = join(conversionFolder, "TXT");
    const folderCheck = multer.diskStorage({
                destination: TXT_Folder
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

const newTxtFile = "New_Convert-" + d.getTime() + ".txt"; 
const txtPath = join(conversionFolder,"TXT");

const txtMaking = (newFileName) => {

    const pdfPath = join(join(conversionFolder,"UPLOAD"), newPdfFile);

    let result = {};
         //Omit option to extract all text from the pdf file
        //Omit option to extract all text from the pdf file

        /**
    pdfUtil.pdfToText(pdfPath, function(err, data) {
        if (err) {
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result = {
        error: true,
        msg: errMsg 
            }
        } else {
        const newTtxtDoc = createWriteStream(join(txtPath, newFileName));
        newTtxtDoc.write(data) //print all text
        newTtxtDoc.on("error", (err)=>{
            const errMsg = `: ${err.message}` || ". Check object above";
            console.error(err);
            result = {
            error: true,
            msg: errMsg,
            }
            console.log("An error occured during txt writing: " + errMsg);
        });
        newTtxtDoc.end();
        }    
    });
    */
    return result
}

async function Pdf2Txt() { 
    
    let result = {};

    try{
       
    const createTXT = txtMaking(newTxtFile);
    // await writeFile(join(join(conversionFolder, "./JSON"), newJsonName), jsonBuffer); 
    if(createTXT.error) {
    result = {
    error: true,
    code: 401,
    uploadFolder: join(conversionFolder,"UPLOAD"),
    msg: "Something went wrong during the TXT creation: " + createTXT.msg
        }
    return result
    } else {
    result = {
    error: false,
    code: 201,
    newFileName: newTxtFile,
    uploadFolder: join(conversionFolder,"UPLOAD"),
    originalFilePath: join(join(conversionFolder,"UPLOAD"), newPdfFile),
    filePath: join(join(conversionFolder, "TXT"), newTxtFile),
    msg: "PDF file successfully converted to TXT. Ready for download."}
    return result
    }} catch(err) { 
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result = {
        error: true,
        code: 500, 
        uploadFolder: join(conversionFolder,"UPLOAD"),
        originalFilePath: join(join(conversionFolder,"UPLOAD"), newPdfFile),
        msg: "The conversion process stopped due to the following issue: " + errMsg}
        return result;
    }
} 

export { pdfUpload, pdfCheck, Pdf2Txt };