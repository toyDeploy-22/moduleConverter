// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fsp from "fs/promises";
// Local:
// 3rd Party:
import multer from "multer";
// import fse from "fs-extra";
// destruct/constants/variables
const { readFile, writeFile } = fsp;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "..", "Conversion");

const d = new Date;
let newJsFile;

const jsStorage = multer.diskStorage({
    destination: join(conversionFolder, "UPLOAD"),
    filename: function (req, file, cb) {
      const jsName = `New_Js-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newJsFile = jsName + ExtName;
      cb(null, newJsFile)
    }
});

const jsUpload = multer({
    storage: jsStorage,
    }).single("uplFile");

    const TXT_Folder = join(conversionFolder, "TXT");
    const folderCheck = multer.diskStorage({
        destination: TXT_Folder
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
        result.msg = "Not converted. Please make sure that the file has a javascript extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

async function Js2Txt(){ 
    
    const result = new Object();

    try{
        const newTxtName = "New_Convert-" + d.getTime() + ".txt";
    
        const jsBuffer = await readFile(join(join(conversionFolder,"UPLOAD"), newJsFile), {encoding: "utf8"}); 
    
        await writeFile(join(join(conversionFolder, "TXT"), newTxtName), jsBuffer); 
        
        result.error = false;
        result.code = 201;
        result.newFileName = newTxtName;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsFile);
        result.filePath = join(join(conversionFolder, "TXT"), newTxtName);
        result.msg = "JS file successfully converted to TXT. Ready for download.";
        return result;
  } catch(err) { 
    const errMsg = `: ${err.message}` || ". Check object above";
    console.error(err);
    result.error = true;
    result.code = 500;
    result.uploadFolder = join(conversionFolder,"UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsFile);
    result.msg = "JS to TXT conversion stopped" + errMsg;
    return result;
  }

}

export { jsUpload, jsCheck, Js2Txt }