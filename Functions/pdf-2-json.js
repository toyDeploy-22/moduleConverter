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

    const JSON_Folder = join(conversionFolder, "JSON");
    const folderCheck = multer.diskStorage({
        destination: JSON_Folder
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

const newJsonFile = "New_Convert-" + d.getTime() + ".json"; 
const jsonPath = join(conversionFolder,"JSON");

const contentToJson = (content, newStream) => {

        const arrContent = content.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
        
        const splittedArr = arrContent.split(" ").filter((wrd)=>wrd !== ""); 

            let i = 0;
            const newArr = splittedArr.length; 
            let mapArr = splittedArr.map((elem)=>elem); 
    
            for(i; i < newArr; i++){
                if(mapArr.length > 2) {
                    newStream.write(`${JSON.stringify(mapArr.splice(0, 1)[0])}: ${JSON.stringify(mapArr.splice(0,1)[0])},\n`);
                } else {
                    newStream.write(`${JSON.stringify(mapArr.splice(0, 1)[0])}: ${JSON.stringify(mapArr.splice(0,1)[0]) || JSON.stringify("")}`);
                    break;
                }
            }
}

const jsonMaking = (newFileName) => {

    const result = new Object();
    const pdfPath = join(join(conversionFolder,"UPLOAD"), newPdfFile);
         //Omit option to extract all text from the pdf file
        //Omit option to extract all text from the pdf file
    pdfUtil.pdfToText(pdfPath, function(err, data) {
        if (err) {
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result.error = true;
        result.msg = errMsg;
        return result
        } else {
        const newJsonDoc = createWriteStream(join(jsonPath, newFileName));
        newJsonDoc.write("[{");
        setTimeout(()=>{ 
        contentToJson(data, newJsonDoc); //print all text
        newJsonDoc.write("}]")
        result.error = false;
        newJsonDoc.on("error", (err)=>{
            const errMsg = `: ${err.message}` || ". Check object above";
            console.error(err);
            result.error = true;
            result.msg = errMsg;
            console.log("An error occured during PDF writing: " + errMsg);
            return result;
        });
        newJsonDoc.end();
        }, 950)}    
    });
}

async function Pdf2Json() { 
    
    let result ={};

    try{
       
    const createJSON = jsonMaking(newJsonFile);
    // await writeFile(join(join(conversionFolder, "./JSON"), newJsonName), jsonBuffer); 
    if(createJSON.error) {
    result = {
    error: true,
    code: 401,
    uploadFolder: join(conversionFolder,"UPLOAD"),
    msg: "Something went wrong during the JSON file creation: " + createCSV.msg
        }
    return result
    } else {
    result = {
    error: false,
    code: 201,
    newFileName: newJsonFile,
    uploadFolder: join(conversionFolder,"UPLOAD"),
    originalFilePath: join(join(conversionFolder,"UPLOAD"), newPdfFile),
    filePath: join(join(conversionFolder, "JSON"), newJsonFile),
    msg: "PDF file successfully converted to JSON. Ready for download."}
        }
    return result    
    } catch(err) { 
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result = {
        error: true,
        code: 500,  
        uploadFolder: join(conversionFolder,"UPLOAD"),
        originalFilePath: join(join(conversionFolder,"UPLOAD"), newPdfFile),
        msg: "The conversion process stopped due to the following issue: " + errMsg }
        return result;
    }
} 

export { pdfUpload, pdfCheck, Pdf2Json };