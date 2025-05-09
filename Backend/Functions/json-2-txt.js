// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
// import fsp from "fs/promises";
// Local:
// 3rd Party:
import multer from "multer";
import fse from "fs-extra";

// destruct/constants/variables

const { readJson, createWriteStream } = fse;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "..", "Conversion");

const d = new Date;
let newJsonFile;

const jsonStorage = multer.diskStorage({
    destination: join(conversionFolder, "UPLOAD"),
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

    const TXT_Folder = join(conversionFolder, "TXT");
    const folderCheck = multer.diskStorage({
            destination: TXT_Folder
    });
    
    multer({ storage: folderCheck});

function jsonCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.json' || 
    authorizedFormat.indexOf("json") > -1;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsonFile);
        result.msg = "Not converted. Please make sure that the file has a json extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

async function Json2Txt() { 
    
    let result ={};

    try{  
    const newTxtName = "New_Convert-" + d.getTime() + ".txt"; 
    
    const newTxtContent = createWriteStream(join(join(conversionFolder, "TXT"), newTxtName));

// await readFile(join(join(conversionFolder,"./UPLOAD"), newJsonFile), {encoding: "utf8"});
    const jsonBuffer = (await readJson(join(join(conversionFolder,"UPLOAD"), newJsonFile), { encoding: 'utf-8' }));

    const data = JSON.stringify(jsonBuffer);

    newTxtContent.write(data);

    newTxtContent.on("error", (err)=>{
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        console.log("JSON Writing error conversion to TXT: " + errMsg)
    });
    newTxtContent.end();

    result.error = false;
    result.code = 201;
    result.newFileName = newTxtName;
    result.uploadFolder = join(conversionFolder,"UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsonFile);
    result.filePath = join(join(conversionFolder, "TXT"), newTxtName);
    result.msg = "JSON file successfully converted to TXT. Ready for download.";
    return result;
    } catch(err) { 
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result.error = true;
        result.code = 500;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsonFile);
        result.msg = "The conversion process stopped due to the following issue: " + errMsg;
        return result;
    }
} 

export { jsonUpload, jsonCheck, Json2Txt };