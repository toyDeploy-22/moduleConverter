// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
// Local:
// 3rd Party:
import multer from "multer";
import fse from "fs-extra";
import fsp from "fs/promises";
// destruct/constants/variables
const { readJson } = fse;
const { writeFile } = fsp;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "../Conversion");
const d = new Date;
let newJsonFile;

const jsStorage = multer.diskStorage({
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
    storage: jsStorage,
    }).single("uplFile");

function jsonCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.json' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "json").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.msg = "Not converted. Please make sure that the file has a json extension."
    } else {
        result.error = false;
        result.code = 200;
        result.msg = "File authorized."
    }
    return result;
}

async function Json2Js() {

    try{
    let result ={};  
    const newJsName = "New_Convert-" + d.getTime() + ".js"; 
    const content = new Object;
// await readFile(join(join(conversionFolder,"./UPLOAD"), newJsonFile), {encoding: "utf8"});
    content.data = await readJson(join(join(conversionFolder,"./UPLOAD"), newJsonFile));
    const jsonBuffer = JSON.parse(content);
    
    await writeFile(join(join(conversionFolder, "./JS"), newJsName), jsonBuffer); 
    
    result.error = false;
    result.code = 201;
    result.newFileName = newJsName;
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsonFile);
    result.filePath = join(join(conversionFolder, "./JS"), newJsName);
    result.msg = "JSON file successfully converted to JS. Ready for download.";
    return result;

    } catch(err) { 
        console.error(err);
        result.error = true;
        result.code = 500;
        result.msg = "The conversion process stopped due to the following issue: " + err;
        return result;
    }
} 

export { jsonUpload, jsonCheck, Json2Js };