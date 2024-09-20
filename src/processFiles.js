import fs from 'fs/promises';
import path from 'path';
import { componentToJSON } from './jsxToJson.js';
import { extractElementsAndAttributes } from './extractElementsAndAttributes.js';

export async function processFiles(directory, pathName, outputpath) {
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