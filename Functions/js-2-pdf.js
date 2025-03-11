// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fse from "fs-extra";
// Local:
// 3rd Party:
import multer from "multer";
import PdfPrinter from "pdfmake";

// destruct/constants/variables
const { createReadStream, createWriteStream } = fse;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "..", "Conversion");

const d = new Date;
let newJsFile;

const jsStorage = multer.diskStorage({
    destination: join(conversionFolder, "UPLOAD"),
    filename: function (req, file, cb) {
      const JsName = `New_Js-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newJsFile = JsName + ExtName;
      cb(null, newJsFile)
    }
});

const jsUpload = multer({
    storage: jsStorage,
    }).single("uplFile");

    const JS_Folder = join(conversionFolder, "PDF");
    const folderCheck = multer.diskStorage({
                destination: JS_Folder
            });
        
    multer({ storage: folderCheck});
    
function jsCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.js' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "javascript").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsFile);
        result.msg = "Not converted. Please make sure that the file has a text extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

const newPdfFile = "New_Convert-" + d.getTime() + ".pdf"; 

const pdfMaking = async(pdfName) => {
    const result = {}    
    try {
    const fonts = {
        Roboto: {
          normal: './CONVERSION/FONTS/Roboto-Regular.ttf'
        }
      };
    
    const Printer = new PdfPrinter(fonts);
    
    const newPdfDoc = createWriteStream(join(join(conversionFolder, "PDF"), pdfName));

    // const dataContent = data; 

    const pdfContent = {
        content: [
        ],
        styles: {
        defaultStyle: {
            alignment: 'left'
          }
        }
    }; 

    let data = createReadStream(join(join(conversionFolder,"UPLOAD"), newJsFile), { encoding: 'utf-8' });

    data.on("data", (chunk)=> {
        const options = {text: `${chunk.toString()},`, style: 'defaultStyle'};
        pdfContent.content.push(options);
        result.error = false
    });

    data.on("error", (err)=>{
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.msg = errMsg 
        console.log("An error occured during reading: " + errMsg)
        return result
        });

    // console.log(pdfContent.content)

    setTimeout(()=>{
    const pdfDoc = Printer.createPdfKitDocument(pdfContent) 
    pdfDoc.pipe(newPdfDoc);
    pdfDoc.on("error", (err)=>{
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result.error = true;
        result.code = 401;
        result.msg = errMsg
        console.log("An error occured during PDF writing: " + err)
    }) 
    pdfDoc.end();
    }, 800);
    return result
    } catch(err) {
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result.error = true;
        result.code = 500;
        result.msg = errMsg
        console.log("PDF not created: " + errMsg);
        return result
    }
}

async function js2Pdf() { 
    
    let result ={};

    try{
        
    const createPDF = await pdfMaking(newPdfFile);
    // await writeFile(join(join(conversionFolder, "./JSON"), newJsonName), jsonBuffer); 
    if(createPDF.error) {
    const errMsg = `: ${err.message}` || ". Check object above";
    result.error = true;
    result.code = 401;  
    result.uploadFolder = join(conversionFolder,"UPLOAD");
    result.msg = errMsg;
        return result;
    } else {
    result.error = false;
    result.code = 201;
    result.newFileName = newPdfFile;
    result.uploadFolder = join(conversionFolder,"UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsFile);
    result.filePath = join(join(conversionFolder, "PDF"), newPdfFile);
    result.msg = "Javascript file successfully converted to PDF. Ready for download.";
    return result}

    } catch(err) { 
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result.error = true;
        result.code = 500;  
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsFile);
        result.msg = "The conversion process stopped due to the following issue: " + errMsg;
        return result;
    }
} 

export { jsUpload, jsCheck, js2Pdf };