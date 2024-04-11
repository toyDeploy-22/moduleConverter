// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fsp from "fs/promises";
// Local:
// 3rd Party:
import multer from "multer";
import fse from "fs-extra";
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

const removeBracket = (wrd)=>{
    let str = ''; 
    for(let i = 0; i < wrd.length; i++){
        if(wrd[i] !== '[' && wrd[i] !== ']') {
            str += wrd[i]
        }
    }
    return str;
}

const isObject = (buffer) => {
    if(buffer[0] === '[') { 
        const newBuffer = removeBracket(buffer);
        return newBuffer;
    } else if(typeof buffer === 'object' && buffer !== null && !Array.isArray(buffer)) { 
        let data = '';
        for(let [key, val] of Object.entries(buffer)) { 
            data += `${key}:, ${val}, `
        }
        return data;
    } else {
        return buffer;
    }
}

// Array to CSV
const CSVify = (str) => {
    const strNoComma = str.split(" ").map((wrd)=>wrd.replace(/,/g, "").replace(/;/g, ""));
    const strNoSpace = strNoComma.filter((wrd)=>wrd !== "").join();
     return strNoSpace
}

async function Js2CSV(){ 
    
    const result = new Object();

    try{
        const newCsvName = "New_Convert-" + d.getTime() + ".csv";
    
        const data = await readFile(join(join(conversionFolder,"./UPLOAD"), newJsFile), {encoding: "utf8"}); 

        const jsBuffer = await isObject(data);

        const csvBuffer = await CSVify(jsBuffer);
        
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