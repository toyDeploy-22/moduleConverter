
# ModuleConverter #

### Purpose ###

_This is an experiment app that converts ```.js```, ```.txt```, ```.json```, ```.csv```, and ```.pdf``` file extensions._

###### How to Convert ######

- Upload a listed extension file
- Select the extension source and target on the list
- Click on ```Done```
- If successful, a hyperlink will appear just below the ```Done``` button: click on that link to download your file
- You can also make a right click on the hyperlink and select ```Save as...``` in order to download your file

<br/>

### Technologies used ###

- Html (used for the Frontend)
- NodeJS (used for the backend)
- Core modules for the backend

### Characteristics ###

- The extension type source has to be the same as the one selected in the list (a MIME type check is implemented for that) 
- A copy of the uploaded file will appear in the ```Conversion\UPLOAD``` path during the upload and download process
- The new converted file will be created in ```Conversion``` folder, inside the folder that has the name of the target extension file
- The new created file will have a name that starts with ```New_Convert-```
- Once the new file is downloaded, its copy, plus the copy of the uploaded file, are automatically deleted
<br />

