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
let newTxtFile;

const txtStorage = multer.diskStorage({
    destination: join(conversionFolder, "UPLOAD"),
    filename: function (req, file, cb) {
      const txtName = `New_Txt-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newTxtFile = txtName + ExtName;
      cb(null, newTxtFile)
    }
});

const txtUpload = multer({
    storage: txtStorage,
    }).single("uplFile");

    const CSV_Folder = join(conversionFolder, "CSV");
    const folderCheck = multer.diskStorage({
            destination: CSV_Folder
        });
    
    multer({ storage: folderCheck});

function txtCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.txt' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "txt").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.msg = "Not converted. Please make sure that the file has a txt extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

const contentToCsv = (content) => {
    try {

    const arrContent = content.split(",").map((wrd)=>wrd.replace(/,/g, ""));

    const csvContent = arrContent.map((str, _ind, arr)=>(arr.indexOf(str) + 1)/2 !== 0 && arr.indexOf(str) !== 1 ? (str + ",\n") : (str + ",")).join("");
    
    return csvContent;
    } catch(err){
        console.error(err);
        return undefined
    }
}

async function txt2Csv(){
    
    let result = {};
    
    try {
        const newCsvName = "New_Convert-" + d.getTime() + ".csv";
    
        const csv = await readFile(join(join(conversionFolder,"UPLOAD"), newTxtFile), { encoding: 'utf-8'}); 

        const text = await contentToCsv(csv);
    
        if(text) {

        await writeFile(join(join(conversionFolder, "CSV"), newCsvName), text);

        result.error = false;
        result.code = 201;
        result.newFileName = newCsvName;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newTxtFile);
        result.filePath = join(join(conversionFolder, "CSV"), newCsvName);
        result.msg = "TXT file successfully converted to CSV. Ready for download.";
        return result
        } else {
        const errMsg = "error occured writing TXT content: Cannot proceed further";
        result = {
        error: true,
        code: 401,
        msg: errMsg
        }
        return result
            }
        } catch(err) { 
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result = {
        error: true,
        code: 500,
        uploadFolder: join(conversionFolder,"UPLOAD"),
        originalFilePath: join(join(conversionFolder,"UPLOAD"), newTxtFile),
        msg: "TXT to CSV conversion stopped: " + errMsg}
        return result;
        }
    }
export { txtUpload, txtCheck, txt2Csv };