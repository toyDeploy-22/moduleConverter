// Core:
import  { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import fsp from "fs/promises";
import fs from "fs";
// Local:
// 3rd Party:
import multer from "multer";
// import fse from "fs-extra";

// destruct/constants/variables
const { readFile } = fsp;
const { createWriteStream } = fs;

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

    const JSON_Folder = join(conversionFolder, "JSON");
    const folderCheck = multer.diskStorage({
        destination: JSON_Folder
    });

    multer({ storage: folderCheck}); 

function txtCheck(file) {
    const extensionFormat = extname(file.originalname).toLowerCase(); // returns extension preceded by a dot "."
    const authorizedFormat = file.mimetype.split("/"); // removes the "/" in mimetype.
    const result = new Object;
    const checkFormat = extensionFormat === '.txt' || 
    authorizedFormat.indexOf("text") > -1;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newTxtFile);
        result.msg = "Not converted. Please make sure that the file has a txt extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

async function txt2Json() { 
    
    let result ={};

    try{  
    const newJsonName = "New_Convert-" + d.getTime() + ".json"; 
    
// await readFile(join(join(conversionFolder,"./UPLOAD"), newJsonFile), {encoding: "utf8"});
    const txtBuffer = (await readFile(join(join(conversionFolder,"UPLOAD"), newTxtFile), { encoding: 'utf-8'})); 

    // const jsonBuffer = await JSON.parse(content);

    // await writeFile(join(join(conversionFolder, "./JS"), newJsName), jsonBuffer); 

    const newContent = createWriteStream(join(join(conversionFolder, "JSON"), newJsonName));

    const preArr = txtBuffer.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''); 
    // all special characters to remove
    
    const splittedArr = preArr.split(" "); 
    
    const propVal=(arr, newStream)=>{
        let i = 0;
        const newArr = arr.length; 
        let mapArr = arr.map((elem)=>elem); 

        for(i; i < newArr; i++){
            if(mapArr.length > 2) {
                newStream.write(`${JSON.stringify(mapArr.splice(0, 1)[0])}: ${JSON.stringify(mapArr.splice(0,1)[0])},\n`);
            } else {
                newStream.write(`${JSON.stringify(mapArr.splice(0, 1)[0])}: ${JSON.stringify(mapArr.splice(0,1)[0]) || JSON.stringify("")}`);
                break;
            }
        }
    }


    newContent.write("[{"); 
    propVal(splittedArr, newContent);    
    newContent.write("}]");
    newContent.on("error", (err)=>{
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        console.log("TXT Writing error conversion to JSON: " + errMsg)
    });
    newContent.end();

    result.error = false;
    result.code = 201;
    result.newFileName = newJsonName;
    result.uploadFolder = join(conversionFolder,"UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newTxtFile);
    result.filePath = join(join(conversionFolder, "JSON"), newJsonName);
    result.msg = "TXT file successfully converted to JSON. Ready for download.";
    return result;
    } catch(err) { 
        const errMsg = `: ${err.message}` || ". Check object above";
        console.error(err);
        result.error = true;
        result.code = 500;
        result.uploadFolder = join(conversionFolder,"UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"UPLOAD"), newTxtFile);
        result.msg = "The conversion process stopped due to the following issue: " + errMsg;
        return result;
    }
} 

export { txtUpload, txtCheck, txt2Json };