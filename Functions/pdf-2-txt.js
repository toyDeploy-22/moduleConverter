// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fse from "fs-extra";
// Local:
// 3rd Party:
import multer from "multer";
import pdfUtil from "pdf-to-text";

// destruct/constants/variables
const { createWriteStream } = fse;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "../Conversion");
const d = new Date;
let newPdfFile;

const pdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${conversionFolder}/UPLOAD`)
    },
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
    
function pdfCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.pdf' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "pdf").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"./UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newPdfFile);
        result.msg = "Not converted. Please make sure that the file has a pdf extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"./UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

const newTxtFile = "New_Convert-" + d.getTime() + ".txt"; 
const txtPath = join(conversionFolder,"./TXT");

const txtMaking = (newFileName) => {

    const pdfPath = join(join(conversionFolder,"./UPLOAD"), newPdfFile);
    const result = new Object();
         //Omit option to extract all text from the pdf file
        //Omit option to extract all text from the pdf file
    pdfUtil.pdfToText(pdfPath, function(err, data) {
        if (err) {
        result.error = true;
        result.msg = err;
        return result
        } else {
        const newTtxtDoc = createWriteStream(join(txtPath, newFileName));
        newTtxtDoc.write(data) //print all text
        newTtxtDoc.on("error", (err)=>{
            result.error = true;
            result.msg = err;
            console.error("An error occured during txt writing: " + err);
            return result;
        });
        newTtxtDoc.end();
        }    
    });
    
    
}

async function Pdf2Txt() { 
    
    let result ={};

    try{
       
    txtMaking(newTxtFile);
    // await writeFile(join(join(conversionFolder, "./JSON"), newJsonName), jsonBuffer); 
    
    result.error = false;
    result.code = 201;
    result.newFileName = newTxtFile;
    result.uploadFolder = join(conversionFolder,"./UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newPdfFile);
    result.filePath = join(join(conversionFolder, "./TXT"), newTxtFile);
    result.msg = "PDF file successfully converted to TXT. Ready for download.";
    return result;

    } catch(err) { 
        console.error(err);
        result.error = true;
        result.code = 500;  
        result.uploadFolder = join(conversionFolder,"./UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newPdfFile);
        result.msg = "The conversion process stopped due to the following issue: " + err.msg;
        return result;
    }
} 

export { pdfUpload, pdfCheck, Pdf2Txt };