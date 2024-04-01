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

async function Js2Json() { 
    
    let result ={};

    try{
    const newJsonName = "New_Convert-" + d.getTime() + ".json"; 
    const content = new Object;

    content.data = await readFile(join(join(conversionFolder,"./UPLOAD"), newJsFile), {encoding: "utf8"});
    const jsonBuffer = JSON.stringify(content);
    
    await writeFile(join(join(conversionFolder, "./JSON"), newJsonName), jsonBuffer); 
    
    result.error = false;
    result.code = 201;
    result.newFileName = newJsonName;
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsFile);
    result.filePath = join(join(conversionFolder, "./JSON"), newJsonName);
    result.msg = "JS file successfully converted to JSON. Ready for download.";
    return result;

    } catch(err) { 
        console.error(err);
        result.error = true;
        result.code = 500;
        result.msg = "The conversion process stopped due to the following issue: " + err;
        return result;
    }
} 

export { jsUpload, jsCheck, Js2Json };