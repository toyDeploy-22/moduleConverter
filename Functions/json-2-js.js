// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
// Local:
// 3rd Party:
import multer from "multer";
import fse from "fs-extra";

// destruct/constants/variables
const { readJson, createWriteStream } = fse;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "..", "Conversion");

const d = new Date;
let newJsonFile;

const jsStorage = multer.diskStorage({
    destination: join(conversionFolder, "UPLOAD"),
    filename: function (req, file, cb) {
      const jsonName = `New_Json-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newJsonFile = jsonName + ExtName;
      cb(null, newJsonFile)
    }
});

const JS_Folder = join(conversionFolder, "JS");
const folderCheck = multer.diskStorage({
    destination: JS_Folder
});
multer({ storage: folderCheck});

const jsonUpload = multer({
    storage: jsStorage,
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

async function Json2Js() { 
    
    let result ={};

    try{  
    const newJsName = "New_Convert-" + d.getTime() + ".js"; 
    
// await readFile(join(join(conversionFolder,"./UPLOAD"), newJsonFile), {encoding: "utf8"});
    const jsonBuffer = await readJson(join(join(conversionFolder,"UPLOAD"), newJsonFile)); 

    // const jsonBuffer = await JSON.parse(content);

    // await writeFile(join(join(conversionFolder, "./JS"), newJsName), jsonBuffer); 

    const newContent = createWriteStream(join(join(conversionFolder, "JS"), newJsName));

    const characterEntry=(v)=>{
        let value = v; 
        if(typeof value === 'object') { 
            value = JSON.stringify(value);
        } else if(value === "") { 
            value = undefined;         
        }
        return value;
    };

    newContent.write("[{"); 
        
    for(let [key, val] of Object.entries(jsonBuffer)) {
            newContent.write(`${key}: ${characterEntry(val)},\n`) 
        }
            
    newContent.write("}]");
    newContent.on("error", (err)=>{
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        console.log("JSON Writing error conversion to JS: " + errMsg)
    })

    result.error = false;
    result.code = 201;
    result.newFileName = newJsName;
    result.uploadFolder = join(conversionFolder,"UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsonFile);
    result.filePath = join(join(conversionFolder, "JS"), newJsName);
    result.msg = "JSON file successfully converted to JS. Ready for download.";
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

export { jsonUpload, jsonCheck, Json2Js };