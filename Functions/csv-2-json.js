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
    authorizedFormat.indexOf("csv") > -1;

    if (!checkFormat) {
        result.error = true;
        result.code = 401;
        result.uploadFolder = join(conversionFolder,"./UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newCsvFile);
        result.msg = "Not converted. Please make sure that the file has a csv extension."
    } else {
        result.error = false;
        result.code = 200;
        result.uploadFolder = join(conversionFolder,"./UPLOAD");
        result.msg = "File authorized."
    }
    return result;
}

async function csv2Json() { 
    
    let result ={};

    try{  
    const newJsonName = "New_Convert-" + d.getTime() + ".json"; 
    
// await readFile(join(join(conversionFolder,"./UPLOAD"), newJsonFile), {encoding: "utf8"});
    const csvBuffer = (await readFile(join(join(conversionFolder,"./UPLOAD"), newCsvFile), { encoding: 'utf-8'})); 

    // const jsonBuffer = await JSON.parse(content);

    // await writeFile(join(join(conversionFolder, "./JS"), newJsName), jsonBuffer); 

    const newContent = createWriteStream(join(join(conversionFolder, "./JSON"), newJsonName));
    const preArr = csvBuffer.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''); 
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
                newStream.write(`${JSON.stringify(mapArr.splice(0, 1)[0])}: ${JSON.stringify(mapArr.splice(0,1)[0]) || ""}`);
                break;
            }
        }
    }


    newContent.write("[{"); 
    propVal(splittedArr, newContent);    
    newContent.write("}]");
    newContent.on("error", (err)=>{
        console.error("CSV Writing error conversion to JSON: " + err)
    });
    newContent.end();

    result.error = false;
    result.code = 201;
    result.newFileName = newJsonName;
    result.uploadFolder = join(conversionFolder,"./UPLOAD");
    result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newCsvFile);
    result.filePath = join(join(conversionFolder, "./JSON"), newJsonName);
    result.msg = "CSV file successfully converted to JSON. Ready for download.";
    return result;
    } catch(err) { 
        console.error(err);
        result.error = true;
        result.code = 500;
        result.uploadFolder = join(conversionFolder,"./UPLOAD");
        result.originalFilePath = join(join(conversionFolder,"./UPLOAD"), newCsvFile);
        result.msg = "The conversion process stopped due to the following issue: " + err;
        return result;
    }
} 

export { csvUpload, csvCheck, csv2Json };