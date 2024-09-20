import fs from 'fs/promises';
import path from 'path';
import { processFiles } from './processFiles.js';
import { getDatatest } from './getDatatest.js';
import { componentToJSON } from './jsxToJson.js';
import { extractElementsAndAttributes } from './extractElementsAndAttributes.js';

async function containsJsxOrTsxFiles(directory) {
  let hasJsxTsx = false;
  
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const dirent of entries) {
      const fullPath = path.join(directory, dirent.name);
      
      if (dirent.isFile() && (dirent.name.endsWith('.jsx') || dirent.name.endsWith('.tsx'))) {
        hasJsxTsx = true;
      }
      
      if (dirent.isDirectory()) {
        const subDirHasJsxTsx = await containsJsxOrTsxFiles(fullPath);
        hasJsxTsx = hasJsxTsx || subDirHasJsxTsx;
      }
    }
    
    return hasJsxTsx;
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
    return false;
  }
}

async function getSubfolderNames(folderPath) {
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    const folderPromises = entries.filter(dirent => dirent.isDirectory()).map(async (dirent) => {
      const subFolderPath = path.join(folderPath, dirent.name);
      const hasJsxOrTsx = await containsJsxOrTsxFiles(subFolderPath);
      return hasJsxOrTsx ? subFolderPath : null;
    });
    const folders = await Promise.all(folderPromises);
    return folders.filter(Boolean);
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

async function processExternalFiles(directory, pathName, outputPath) {
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
    await fs.writeFile(path.join(outputPath, `${lastPart}.json`), JSON.stringify(allOutputs, null, 2));

    return allOutputs;
  } catch (err) {
    console.error('An error occurred:', err.message);
    throw err;
  }
}

async function combineJsonFiles(directories, outputPath) {
  try {
    let combinedData = [];

    for (const directory of directories) {
      const data = await processExternalFiles(directory, directory, outputPath);
      combinedData = combinedData.concat(data);
    }

    const combinedJsonString = JSON.stringify(combinedData, null, 2);
    await fs.writeFile(path.join(outputPath, 'combined.json'), combinedJsonString);

    console.log('All JSON data has been combined into combined.json');
  } catch (err) {
    console.error('An error occurred:', err.message);
  }
}

async function main() {
  try {
    // Process integrator-ui files
    let integratorPath = './new_folder/integrator-ui/src/components/';
    let integratorFolders = await getSubfolderNames(integratorPath);
    
    for (let folder of integratorFolders) {
      console.log(`Processing ${folder}`);
      await processFiles(folder, folder, "intiooutput");
      console.log("Done");
    }

    // Process fuse-ui files
    let fusePath = './new_folder/fuse-ui/src/components/';
    let fuseFolders = await getSubfolderNames(fusePath);
    
    console.log(fuseFolders);
    
    for (let folder of fuseFolders) {
      if (!folder.includes("icons")) {
        console.log(`Processing ${folder}`);
        await processExternalFiles(folder, folder, "fuioutput");
      }
    }

    // Combine all fuse-ui JSON files
    await combineJsonFiles(fuseFolders.filter(folder => !folder.includes("icons")), "fuioutput");

    getDatatest();
  } catch (error) {
    console.error(error);
  }
}

main();