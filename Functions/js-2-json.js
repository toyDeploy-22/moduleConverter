// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
// Local:
// 3rd Party:
import multer from "multer";
import fs from "fs";

// destruct/constants/variables
const { createReadStream, createWriteStream } = fs;

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
    }
    return result;
}

const jsUpload = multer({
storage: jsonStorage,
}).single("jsFile");

function Js2Json() {
    let result ={}; 
    
    try {
   const reader = createReadStream(conversionFolder + newJsFile);
    if(!reader){
            result.error = true;
            result.code = 401;
            result.msg = "Cannot read the file.";
            console.error(err);
            return result;
        } 

        const jsonBuffer = JSON.stringify(reader); 

        if(!jsonBuffer){
            result.error = true;
            result.code = 401;
            result.msg = "Cannot identify the file content.";
            console.error(err);
            return result;
        } 
        
        const newJsonName = "New_Convert-" + d.getTime() + ".json";
        let newJson = createWriteStream(`${conversionFolder}/JSON/${newJsonName}`); 
        
        jsonBuffer.pipe(newJson);

        newJson.on("finish", (err)=>{
            if(err) {
        result.error = true;
        result.code = 500;
        result.msg = "An eror occured during the end of the process: Please try again."
        console.error(err);
        return result
    } else { 
        console.log("JSON conversion succesful.");
        result.file = `${conversionFolder}/JSON/${newJsonName}`;
        result.code = 201;
        result.msg = "JSON conversion succesful! You can download the file.";
        return result;
    }
});  

} catch(err) { 
    
        console.error(err);
        result.error = true;
        result.code = 500;
        result.msg = "An error occured, please contact your administrator."
        return result;
}
}


export { jsUpload, jsCheck, Js2Json };