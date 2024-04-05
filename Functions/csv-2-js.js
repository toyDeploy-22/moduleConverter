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
        result.msg = "Not converted. Please make sure that the file has a csv extension."
    } else {
        result.error = false;
        result.code = 200;
        result.msg = "File authorized."
    }
    return result;
}

async function csv2Js(){
    
    let result = {};
    
    try {
    const originalFile = await readFile((join(join(conversionFolder,"./UPLOAD"), newCsvFile)), { encoding: 'utf-8'});
    const csv = [originalFile];
    const Array2d = csv.filter(Array.isArray).length > 0;
    const csvContent = []; // for *txt extension, use let csvContent = "" 
    const newJsName = "New_Convert-" + d.getTime() + ".js";

    if(Array2d) {
        csvContent.push(csv.map((str)=>str.join()).join(","))
    } else { 
        csvContent.push(csv.join(","))
    }; 
    
    await writeFile(join(join(conversionFolder, "./JS"), newJsName), csvContent); 
   // const newCSV = createWriteStream(join(join(conversionFolder, "./JS"), newJsName)); 
   // newCSV.write()


    result.error = false;
    result.code = 201;
    result.newFileName = newJsName;
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newCsvFile);
    result.filePath = join(join(conversionFolder, "./JS"), newJsName);
    result.msg = "CSV file successfully converted to JS. Ready for download.";
    return result;

} catch(err) { 
    console.error(err);
    result.error = true;
    result.code = 500;
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newCsvFile);
    result.msg = "The conversion process stopped due to the following issue: " + err;
    return result;
    }
}
export { csvUpload, csvCheck, csv2Js };