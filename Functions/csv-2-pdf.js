// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
// import fsp from "fs/promises";
// Local:
// 3rd Party:
import fse from 'fs-extra';
import multer from "multer";
import PdfPrinter from "pdfmake";

// destruct/constants/variables
const { createReadStream, createWriteStream } = fse;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "../Conversion");
const d = new Date;
let newCsvFile;

const csvStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${conversionFolder}/UPLOAD`)
    },
    filename: function (req, file, cb) {
      const csvName = `New_Csv-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newCsvFile = csvName + ExtName;
      cb(null, newCsvFile)
    }
});

const csvUpload = multer({
    storage: csvStorage,
    }).single("uplFile");

function csvCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.csv' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "csv").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"./UPLOAD");
        result.msg = "Not converted. Please make sure that the file has a csv extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"./UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

async function Csv2Pdf(){
    
    let result = {};
    
    try { 

        const fonts = {
            Roboto: {
              normal: './CONVERSION/FONTS/Roboto-Regular.ttf'
            }
          }; 

          const Printer = new PdfPrinter(fonts);
          const newPdfName = "New_Convert-" + d.getTime() + ".pdf";
          const newPdfDoc = createWriteStream(join(join(conversionFolder, "./PDF"), newPdfName)); 
          
          const pdfContent = {
        content: [
        ],
        styles: {
        defaultStyle: {
            alignment: 'center'
          }
        }
    }; 

    const csv = createReadStream((join(join(conversionFolder,"./UPLOAD"), newCsvFile)), { encoding: 'utf-8'});

    csv.on("data", (chunk)=>{
        const newContent = {text: chunk, style: 'defaultStyle'};
        pdfContent.content.push(newContent);
    })

    csv.on("error", (err)=>{
        console.error("Error on reading file, " + err)
    });

    setTimeout(()=>{
        const pdfDoc = Printer.createPdfKitDocument(pdfContent) 
        pdfDoc.pipe(newPdfDoc);
        pdfDoc.on("error", (err)=>{
            console.error("An error occured during PDF writing: " + err)
        }) 
        pdfDoc.end();
        }, 800)

    result.error = false;
    result.code = 201;
    result.newFileName = newPdfName;
    result.uploadFolder = join(conversionFolder,"./UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newCsvFile);
    result.filePath = join(join(conversionFolder, "./PDF"), newPdfName);
    result.msg = "CSV file successfully converted to PDF. Ready for download.";
    return result;
} catch(err) { 
    console.error(err);
    result.error = true;
    result.code = err.code || 500;
    result.uploadFolder = join(conversionFolder,"./UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newCsvFile);
    result.msg = err.message || "CSV to PDF conversion stopped: " + err;
    return result;
    }
}

export { csvUpload, csvCheck, Csv2Pdf };