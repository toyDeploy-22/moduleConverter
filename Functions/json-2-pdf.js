// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fse from "fs-extra";
// Local:
// 3rd Party:
import multer from "multer";
import pdfPrinter from "pdfmake";
import PdfPrinter from "pdfmake";

// destruct/constants/variables
const { readJSON, createWriteStream } = fse;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "../Conversion");
const d = new Date;
let newJsonFile;

const jsonStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${conversionFolder}/UPLOAD`)
    },
    filename: function (req, file, cb) {
      const jsonName = `New_Json-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newJsonFile = jsonName + ExtName;
      cb(null, newJsonFile)
    }
});

const jsonUpload = multer({
    storage: jsonStorage,
    }).single("uplFile");
    
function pdfCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.json' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "json").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"));
        result.msg = "Not converted. Please make sure that the file has a json extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
        result.msg = "File authorized."
    }
    return result;
}

const newPdfFile = "New_Convert-" + d.getTime() + ".pdf"; 

const pdfMaking = async(pdfName) => {
    
    try {
    const fonts = {
        Roboto: {
          normal: './CONVERSION/FONTS/Roboto-Regular.ttf'
        }
      };
    
    const Printer = new PdfPrinter(fonts);
    
    const newPdfDoc = createWriteStream(join(join(conversionFolder, "./PDF"), pdfName));

    let data = await readJSON(join(join(conversionFolder,"./UPLOAD"), newJsonFile), {encoding: "utf8"}); 
    const dataContent = Array.isArray(data) ? data[0] : data; 

    const pdfContent = {
        content: [
        ]
    }; 

    for(let [key, value] of Object.entries(dataContent)) {
     pdfContent.content.push({text: `${key}: ${value},`})   
    }

    const pdfDoc = Printer.createPdfKitDocument(pdfContent) 
    pdfDoc.pipe(newPdfDoc); 
    pdfDoc.end();
    } catch(err) {
        console.error("PDF not created: " + err)
    }
}

async function Json2Pdf() { 
    
    let result ={};

    try{
        
    await pdfMaking(newPdfFile);
    // await writeFile(join(join(conversionFolder, "./JSON"), newJsonName), jsonBuffer); 
    
    result.error = false;
    result.code = 201;
    result.newFileName = newPdfFile;
    result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsonFile);
    result.filePath = join(join(conversionFolder, "./PDF"), newPdfFile);
    result.msg = "JSON file successfully converted to PDF. Ready for download.";
    return result;

    } catch(err) { 
        console.error(err);
        result.error = true;
        result.code = 500;  
        result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsonFile);
        result.msg = "The conversion process stopped due to the following issue: " + err;
        return result;
    }
} 

export { jsonUpload, pdfCheck, Json2Pdf };