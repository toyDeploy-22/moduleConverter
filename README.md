
# ModuleConverter #

### Purpose ###

_This is an experiment app that converts ```.js```, ```.txt```, ```.json```, ```.csv```, and ```.pdf``` file extensions._

###### How to Convert ######

1. Upload a listed extension file
2. Select the extension source and target on the list
3. Click on ```Done```
4. If successful, a hyperlink will appear just below the ```Done``` button: click on that link to download your file
5. You can also make a right click on the hyperlink and select ```Save as...``` in order to download your file
6. Finished! Now check the converted file in your local storage

<br/>

### Technologies used ###

1 - Frontend
   * HTML
   * CSS
   * Javascript

2 - Backend
   * NodeJS 
   * NPM/Core modules

### How it works ###

- The type of the file source and the extension source selected in the list **have to be the same** _(a MIME type check is launched during each conversion)_ 
- A copy of the uploaded file will appear in ```Conversion\UPLOAD``` path of this project during the upload and download process. However: 

   * Once the new file is downloaded, its copy, and additionally the copy of the uploaded file, are automatically deleted
   * In case of error during the process, the copy of the uploaded file is also destroyed

- The new converted file will be created in ```Conversion``` folder in this project, inside the folder that has the name of the target extension file
- The new created file will have a name that starts with ```New_Convert-```
<br />

