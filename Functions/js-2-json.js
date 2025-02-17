// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fsp from "fs/promises";
// Local:
// 3rd Party:
import multer from "multer";
import fse from "fs-extra";

// destruct/constants/variables
const { readFile } = fsp;
const { createWriteStream } = fse;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "..", "Conversion");

const d = new Date;
let newJsFile;

const jsonStorage = multer.diskStorage({
    destination: join(conversionFolder, "UPLOAD"),
    filename: function (req, file, cb) {
      const jsonName = `New_Json-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newJsFile = jsonName + ExtName;
      cb(null, newJsFile)
    }
});

const jsUpload = multer({
    storage: jsonStorage,
    }).single("uplFile");

    const JSON_Folder = join(conversionFolder, "JSON");
    const folderCheck = multer.diskStorage({
        destination: JSON_Folder
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
        result.uploadFolder = join(join(conversionFolder,"UPLOAD"));
        result.originalFilePath = join(join(conversionFolder,"UPLOAD"));
        result.msg = "Not converted. Please make sure that the file has a javascript extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(join(conversionFolder,"UPLOAD"));
        result.msg = "File authorized."
    }
    return result;
}

async function Js2Json() { 
    
    let result ={};

    try{
    const newJsonName = "New_Convert-" + d.getTime() + ".json"; 
    
    let data = await readFile(join(join(conversionFolder,"UPLOAD"), newJsFile), {encoding: "utf8"});

    const newContent = createWriteStream(join(join(conversionFolder, "JSON"), newJsonName));

    const preArr = data.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''); 
    // all special characters to remove
    
    const splittedArr = preArr.split(" "); 

    const propVal=(arr, newStream)=>{
        let i = 0;
        const newArr = arr.length; 
        let mapArr = arr.map((elem)=>elem).filter((wrd)=>wrd !== ""); 

        for(i; i < newArr; i++){
            if(mapArr.length > 2) {
                newStream.write(`${JSON.stringify(mapArr.splice(0, 1)[0])}: ${JSON.stringify(mapArr.splice(0,1)[0])},\n`);
            } else {
                newStream.write(`${JSON.stringify(mapArr.splice(0, 1)[0])}: ${JSON.stringify(mapArr.splice(0,1)[0]) || JSON.stringify("")}`);
                break;
            }
        }
    }
    
    // const jsonBuffer = JSON.stringify(content);
    
    newContent.write("[");
    propVal(splittedArr, newContent);
    newContent.write("]")
    newContent.on("error", (err)=>{
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        console.log("Oooopsie: " + errMsg)})
    // await writeFile(join(join(conversionFolder, "./JSON"), newJsonName), jsonBuffer); 
    

    result.error = false;
    result.code = 201;
    result.newFileName = newJsonName;
    result.uploadFolder = join(conversionFolder,"UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsFile);
    result.filePath = join(join(conversionFolder, "JSON"), newJsonName);
    result.msg = "JS file successfully converted to JSON. Ready for download.";
    return result;

    } catch(err) { 
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result.error = true;
        result.code = 500;  
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newJsFile);
        result.msg = "The conversion process stopped due to the following issue" + errMsg;
        return result;
    }
} 

export { jsUpload, jsCheck, Js2Json };