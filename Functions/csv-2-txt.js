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

async function Csv2Txt(){
    
    let result = {};
    
    try {

    const newTxtName = "New_Convert-" + d.getTime() + ".txt";
    
    const csv = await readFile((join(join(conversionFolder,"./UPLOAD"), newCsvFile)), { encoding: 'utf-8'});
    
     // for *txt extension, use let csvContent = "" 
    
    await writeFile(join(join(conversionFolder, './TXT'), newTxtName), csv)

    result.error = false;
    result.code = 201;
    result.newFileName = newTxtName;
    result.uploadFolder = join(conversionFolder,"./UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newCsvFile);
    result.filePath = join(join(conversionFolder, "./TXT"), newTxtName);
    result.msg = "CSV file successfully converted to TXT. Ready for download.";
    return result;
} catch(err) { 
    console.error(err);
    result.error = true;
    result.code = err.code || 500;
    result.uploadFolder = join(conversionFolder,"./UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newCsvFile);
    result.msg = err.message || "CSV to TXT conversion stopped: " + err;
    return result;
    }
}
export { csvUpload, csvCheck, Csv2Txt };