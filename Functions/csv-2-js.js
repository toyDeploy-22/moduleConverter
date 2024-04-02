// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fsp from "fs/promises";
// Local:
// 3rd Party:
import multer from "multer";

// destruct/constants/variables
const { readFile, writeFile } = fsp;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "../Conversion");
const d = new Date;
let newJsFile;

const jsonStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${conversionFolder}/UPLOAD`)
    },
    filename: function (req, file, cb) {
      const jsonName = `New_Json-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newJsFile = jsonName + ExtName;
      cb(null, newJsFile)
    }
});

const jsUpload = multer({
    storage: jsonStorage,
    }).single("uplFile");

function jsCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.js' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "javascript").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.msg = "Not converted. Please make sure that the file has a javascript extension."
    } else {
        result.error = false;
        result.code = 200;
        result.msg = "File authorized."
    }
    return result;
}

function Csv2Js(){
    const Array2d = csv.filter(Array.isArray).length > 0;
    let csvContent = [];

    if(Array2d) {
        csvContent = csv.map((str)=>str.join()).join(", ")
    } else { 
        csvContent = csv.join(", ")
    }
    
    return csvContent;
}

export {};