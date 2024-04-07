// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
// Local:
// 3rd Party:
import multer from "multer";
import fse from "fs-extra";
import fsp from "fs/promises";
// destruct/constants/variables
const { readJson, createWriteStream } = fse;
// const { writeFile } = fsp;

const conversionFolder = join(dirname(fileURLToPath(import.meta.url)), "../Conversion");
const d = new Date;
let newJsonFile;

const jsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${conversionFolder}/UPLOAD`)
    },
    filename: function (req, file, cb) {
      const jsonName = `New_Json-${d.getTime()}`;
      const ExtName = extname(file.originalname).toLowerCase(); 
      newJsonFile = jsonName + ExtName;
      cb(null, newJsonFile)
    }
});

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
        result.msg = "Not converted. Please make sure that the file has a json extension."
    } else {
        result.error = false;
        result.code = 200;
        result.msg = "File authorized."
    }
    return result;
}

async function Json2Js() { 
    
    let result ={};

    try{  
    const newJsName = "New_Convert-" + d.getTime() + ".js"; 
    
// await readFile(join(join(conversionFolder,"./UPLOAD"), newJsonFile), {encoding: "utf8"});
    const jsonBuffer = await readJson(join(join(conversionFolder,"./UPLOAD"), newJsonFile)); 

    // const jsonBuffer = await JSON.parse(content);

    // await writeFile(join(join(conversionFolder, "./JS"), newJsName), jsonBuffer); 

    const newContent = createWriteStream(join(join(conversionFolder, "./JS"), newJsName));

    newContent.on("ready", (err)=>{
        if(err) {
        result.error = true; 
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsonFile);
    result.filePath = join(join(conversionFolder, "./JS"), newJsName); 
    result.msg = "Cannot start: " + err; 
    return result 
        } else {
            console.log("Starting...")
        }
    });

    newContent.write("[{")
    

    for(let [key, val] of Object.entries(jsonBuffer)) {
    newContent.write(`${key}: ${typeof val === 'object' ? JSON.stringify(val) : val},\n`)
    };

    newContent.write("}]");

    newContent.on("close", (err)=>{
        if(err){ 
            result.error = true; 
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsonFile);
         result.filePath = join(join(conversionFolder, "./JS"), newJsName); 
    result.msg = "Cannot end process: " + err; 
    return result 
        } else {
            console.log("conversion ended.")
        }
    })


    
    
    result.error = false;
    result.code = 201;
    result.newFileName = newJsName;
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsonFile);
    result.filePath = join(join(conversionFolder, "./JS"), newJsName);
    result.msg = "JSON file successfully converted to JS. Ready for download.";
    return result;
    } catch(err) { 
        console.error(err);
        result.error = true;
        result.code = 500;
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newJsonFile);
        result.msg = "The conversion process stopped due to the following issue: " + err;
        return result;
    }
} 

export { jsonUpload, jsonCheck, Json2Js };