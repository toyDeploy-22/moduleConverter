
import PDFParser from "pdf2json";

let promiseResult = {};


const pdfPromise = (typeRequested, file) => {
	
	const pdfParser = new PDFParser();
	if(promiseResult.hasOwnProperty('err')) { promiseResult = new Object()};

	return new Promise((resolve, reject) => {
		
		pdfParser.on("pdfParser_dataError", (err) => {
			reject({
				error: true,
				msg: err.message || "Parsing PDF Data Rejection"
			})
		});
		
		pdfParser.on("pdfParser_dataReady", (pdfData) => {
			resolve({
				error: false,
				data: typeRequested === "JSON" ? [{
					infos: [{
						...pdfData.Meta,
						...pdfData.Metadata }],
					texts: pdfData.Pages[0].Texts
				}] : pdfData.Pages[0].Texts
				})
		});

	 pdfParser.loadPDF(file)
		})
	}
	
		const promiseToCSV = async(type, filename) => {
		
		try {
		const promiseData = await pdfPromise(type, filename);
		const filePromise = await promiseData.data; // systematically type of array array
		
			promiseResult = {
			err: false,
			data: filePromise
			}
			// console.log("finally success: ", promiseResult.data)
		} catch(err) {
			promiseResult = {
			err: true,
			msg: `extraction Data error: ${err.message}` || "An error occured during data extraction."
			}
		}
		
		return promiseResult
	}
	
	export default promiseToCSV;