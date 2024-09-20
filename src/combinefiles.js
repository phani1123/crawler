import fs from 'fs/promises';
import path from 'path';
import { componentToJSON } from './jsxToJson.js';
import { extractElementsAndAttributes } from './extractElementsAndAttributes.js';

async function processExternalFiles(directory, pathName, outputpath) {
  try {
    const folderPath = path.resolve(directory);
    const files = await fs.readdir(folderPath);
    let allOutputs = [];

    for (const file of files) {
      if ((path.extname(file) === '.jsx' || path.extname(file) === '.tsx') && !file.includes('.stories')) {
        const filePath = path.join(folderPath, file);
        const contents = await fs.readFile(filePath, 'utf8');
        const json = componentToJSON(contents);
        const componentObject = JSON.parse(json);
        const elementsAndAttributes = extractElementsAndAttributes(componentObject);

        const output = {
          file: file,
          elementsAndAttributes: elementsAndAttributes,
        };

        allOutputs.push(output);
      }
    }

    const lastPart = path.basename(directory);
    await fs.writeFile(`./${outputpath}/${lastPart}.json`, JSON.stringify(allOutputs));

  

  } catch (err) {
    console.error('An error occurred:', err.message);
    throw err; // Rethrow the error after logging it
  }
}
export async function combineJsonFiles(directories, outputPath) {
  try {
    let combinedData = [];
    console.log("inside")
    for (const directory of directories) {
      const data = await processExternalFiles(directory, outputPath);
      combinedData = combinedData.concat(data);
      console.log("inside")
    }

    const combinedJsonString = JSON.stringify(combinedData, null, 2);
    await fs.writeFile(path.join(outputPath, 'combined.json'), combinedJsonString);

    console.log('All JSON data has been combined into combined.json');
  } catch (err) {
    console.error('An error occurred:', err.message);
  }
}

// // Usage


// combineJsonFiles(directories, outputPath);