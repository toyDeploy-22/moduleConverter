// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fsp from "fs/promises";
// Local:
// 3rd Party:
import multer from "multer";

// destruct/constants/variables
const { readFile, writeFile } = fsp;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "..", "Conversion");

const d = new Date;
let newCsvFile;

const csvStorage = multer.diskStorage({
    destination: join(conversionFolder, "UPLOAD"),
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

const JS_Folder = join(conversionFolder, "JS");
const folderCheck = multer.diskStorage({
    destination: JS_Folder
});
multer({ storage: folderCheck});

function csvCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.csv' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "csv").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.msg = "Not converted. Please make sure that the file has a csv extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

const jsVify = (str) => {
    const strNoComma = str.split(" ").map((wrd)=>wrd.replace(/;/g, "").replace(/,/g, ""));
    return strNoComma;
}

async function csv2Js(){
    
    let result = {};
    
    try {
    const originalFile = await readFile((join(join(conversionFolder,"UPLOAD"), newCsvFile)), { encoding: 'utf-8'});
    
    const jsBuffer = await jsVify(originalFile);

    const newJsName = "New_Convert-" + d.getTime() + ".js";
    
    await writeFile(join(join(conversionFolder, "JS"), newJsName), jsBuffer); 
   // const newCSV = createWriteStream(join(join(conversionFolder, "./JS"), newJsName)); 
   // newCSV.write()


    result.error = false;
    result.code = 201;
    result.newFileName = newJsName;
    result.uploadFolder = join(conversionFolder,"UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newCsvFile);
    result.filePath = join(join(conversionFolder, "JS"), newJsName);
    result.msg = "CSV file successfully converted to JS. Ready for download.";
    return result;

} catch(err) { 
    const errMsg = `: ${err.message}` || ". Check object above."
    console.error(err);
    result.error = true;
    result.code = 500;
    result.uploadFolder = join(conversionFolder,"UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newCsvFile);
    result.msg = "The conversion process stopped" + errMsg;
    return result;
    }
}
export { csvUpload, csvCheck, csv2Js };