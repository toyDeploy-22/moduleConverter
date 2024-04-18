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
let newTxtFile;

const txtStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${conversionFolder}/UPLOAD`)
    },
    filename: function (req, file, cb) {
      const txtName = `New_Txt-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newTxtFile = txtName + ExtName;
      cb(null, newCsvFile)
    }
});

const csvUpload = multer({
    storage: txtStorage,
    }).single("uplFile");

function txtCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.txt' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "txt").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"./UPLOAD");
        result.msg = "Not converted. Please make sure that the file has a txt extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"./UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

async function txt2Csv(){
    
    let result = {};
    
    try {
    const csv = await readFile((join(join(conversionFolder,"./UPLOAD"), newCsvFile)), { encoding: 'utf-8'});
    const Array2d = await csv.filter(Array.isArray).length > 0;
    const csvContent = []; // for *txt extension, use let csvContent = "" 
    const newJsName = "New_Convert-" + d.getTime() + ".js";

    if(Array2d) {
        csvContent.push(csv.map((str)=>str.join() + "\n").join(","))
    } else { 
        csvContent.map((str, _ind, arr)=>(arr.indexOf(str) + 1)/2 !== 0 && arr.indexOf(str) !== 1 ? (str + ",\n") : (str + ",")).join("")
    }; 
    
    writeFile()

    result.error = false;
    result.code = 201;
    result.newFileName = newJsName;
    result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newCsvFile);
    result.filePath = join(join(conversionFolder, "./JS"), newJsName);
    result.msg = "CSV file successfully converted to JS. Ready for download.";
    return result;
} catch(err) {

    }
}
export {};