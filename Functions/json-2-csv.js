// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
// import fsp from "fs/promises";
// Local:
// 3rd Party:
import multer from "multer";
import fse from "fs-extra";
import e from "express";
import { createWriteStream } from "fs";
// destruct/constants/variables
// const { readFile, writeFile } = fsp;
const { readJson } = fse;

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


function jsonCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.json' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "json").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
        result.msg = "Not converted. Please make sure that the file has a json extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
        result.msg = "File authorized."
    }
    return result;
}

const oneLineObject = (obj)=>{ 
    let wrd = '';
    for(let [key, val] of Object.entries(obj)) { 
        wrd += `${key}, ${val},`;
    }
    return wrd.slice(0, Number(wrd.length - 1)) // removes last comma
}

const isObject = (buffer) => { 
    let newBuffer = '';
    if(Array.isArray(buffer)) { 
        newBuffer = oneLineObject(buffer[0]);
        return newBuffer;
    } else if(typeof buffer === 'object' && buffer !== null && !Array.isArray(buffer)) { 
        newBuffer = oneLineObject(buffer);
        return newBuffer;
    } else { 
        const result = {
        error: true,
        code: 401,
        msg: "Conversion stopped: Your file should be an array containing an json Object or just a json Object.",
        }
        newBuffer = false;
        const err = new Error;
        err.code = result.code;
        err.name = "JSON Syntax Error";
        err.message = result.msg;
        throw err;
    }
}

// Array to CSV
const CSVify = (str) => {
    const strNoComma = str.split(" ").map((wrd)=>wrd.replace(/,/g, "").replace(/;/g, ""));
    const strNoSpace = strNoComma.filter((wrd)=>wrd !== "").join();
     return strNoSpace
}

async function Json2CSV(){ 
    
    const result = new Object();

    try{
        const newCsvName = "New_Convert-" + d.getTime() + ".csv";
    
        const data = await readJson(join(join(conversionFolder,"./UPLOAD"), newJsonFile));

        const jsonBuffer = isObject(data);

        const csvBuffer = await CSVify(jsonBuffer);
        
        const newCsvFile = createWriteStream(join(join(conversionFolder, "./CSV"), newCsvName));  
        newCsvFile.write(csvBuffer);
        
        result.error = false;
        result.code = 201;
        result.newFileName = newCsvName;
        result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsFile);
        result.filePath = join(join(conversionFolder, "./CSV"), newCsvName);
        result.msg = "JS file successfully converted to CSV. Ready for download.";
        return result;
  } catch(err) { 
    
    console.error(err);
    result.error = true;
    result.code = err.code || 500;
    result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsonFile);
    result.msg = err.message || "JS to CSV conversion stopped: " + err;
    return result;

  }

}

export { jsonUpload, jsonCheck, Json2CSV }