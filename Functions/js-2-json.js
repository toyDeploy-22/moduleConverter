// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
// Local:
// 3rd Party:
import fse from "fs-extra";
import multer from "multer";

// destruct/constants/variables
const { read, createWriteStream } = fse;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "../Conversion");
const d = new Date;

const jsonStorage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, `${conversionFolder}/UPLOAD`)
        },
        filename: function (req, file, cb) {
          const jsonName = `New_Json-${d.getTime()}`;
          cb(null, jsonName)
        }
});

function jsCheck(req, file, cb) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" of mimetype.
    if ( extensionFormat !== '.js' || authorizedFormat[1].toLowerCase() !== "javascript") {
        cb(null, false);
    } else {
        cb(null, true)
    }
    cb(new Error("Something goes wrong. Please try again."))
}


const jsUpload = multer({
storage: jsonStorage,
fileFilter: jsCheck
});


async function Js2Json(fullPath) {
try {
    let result ={};
    const readJsFile = await read(conversionFolder(fullPath), buffer);
 const jsonBuffer = JSON.stringify(readJsFile.buffer);
let newJson = createWriteStream(`${conversionFolder}/JSON/New_Conversion-${d.getTime()}.json`);
newJson.on("open", (err)=>{
    if(err) {
        result.error = true;
        result.code = 400;
        result.msg = "An error occured during the initialization."
        console.error(err);
    } else {
console.log("Initializing conversion...")}
});
newJson.write(jsonBuffer);
result.fileName = newJson; // to pass to the express for the download
result.code = 201;
result.msg = "JS File successfully converted to JSON !"
} catch(err) {
    result.error = true;
    result.code = 500;
    result.msg = "An error occured, please contact your administrator."
    console.error(err);
}
return result;
}


export { jsUpload, Js2Json };