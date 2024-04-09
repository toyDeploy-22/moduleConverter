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
let newJsFile;

const jsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${conversionFolder}/UPLOAD`)
    },
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


function jsCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.js' || 
    authorizedFormat.filter((fmt)=>fmt.toLowerCase() === "javascript").length > 0;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
        result.msg = "Not converted. Please make sure that the file has a javascript extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
        result.msg = "File authorized."
    }
    return result;
}

// Array to CSV
const CSVify = (str) => { 

let csv = []; 
let pointer = 0; 
let c = null; 
let quote = 0; 
let col = ''; 
let row = [];


while (c = str.charAt(pointer)) {
    pointer++;
    if (c == '"') {
        quote++;
        // first and even numbered quotes are parsed, not used
        if (quote == 1 || quote%2 == 0) {
            continue;
        }
    } else if ([',','\r\n','\n','\r'].includes(c)) {
        // even quotes means a completed col and potential row
        if (quote%2 == 0) {
            row.push(col);
            col = '';
            quote = 0;
            // if delimiter is not a comma, also a completed row
            if (c != ',') {
                // handle edge case of \r\n being two separate characters
                if (c == '\r' && str.charAt(pointer) == '\n') {
                    pointer++;
                }
                csv.push(row);
                row = [];
            }
            continue;
        }
    }
    col += c;
}
return csv;
}

async function Js2CSV(){ 
    
    const result = new Object();

    try{
        const newCsvName = "New_Convert-" + d.getTime() + ".js"; 
        let content = "";
    
        const data = await readFile(join(join(conversionFolder,"./UPLOAD"), newJsFile), {encoding: "utf8"});
        content = `"${ data }"`;
        const csvBuffer = CSVify(content);
        
        await writeFile(join(join(conversionFolder, "./CSV"), newCsvName), csvBuffer); 
        
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
    result.code = 500;
    result.uploadFolder = join(join(conversionFolder,"./UPLOAD"));
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsFile);
    result.msg = "JS to CSV conversion stopped: " + err;
    return result;

  }

}

export { jsUpload, jsCheck, Js2CSV }