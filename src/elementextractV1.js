import * as parser from '@babel/parser';
import fs from 'fs';
import path from 'path';
function componentToJSON(componentString) {
  // Parse the component string into a JavaScript object
  const componentObject = parser.parse(componentString, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  // Convert the JavaScript object into a JSON string
  const jsonString = JSON.stringify(componentObject, null, 2);

  return jsonString;
}

function extractElementsAndAttributes(ast) {
  const elements = [];
  const imports = [];

  function traverse(node) {
    if (node.type === 'JSXElement') {
      const element = {
        element: node.openingElement.name.name,
        attributes: node.openingElement.attributes.map(attr => ({
          name: attr.name.name,
          value: attr.value ? attr.value.value : null
        }))
      };
      elements.push(element);
    }

    if (node.type === 'ImportDeclaration') {
      const importDeclaration = {
        source: node.source.value,
        specifiers: node.specifiers.map(specifier => specifier.local.name)
      };
      imports.push(importDeclaration);
    }

    for (let key in node) {
      if (node[key] && typeof node[key] === 'object') {
        traverse(node[key]);
      }
    }
  }

  traverse(ast);

  return { elements, imports };
}

const folderPath = path.resolve('./repos/intui');
let dataset

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Could not list the directory.', err);
    process.exit(1);
  } 

  files.forEach((file, index) => {
    if (path.extname(file) === '.jsx') {
      const filePath = path.join(folderPath, file);
      console.log(file);
      fs.readFile(filePath, 'utf8', (err, contents) => {
        if (err) {
          console.error('Could not read the file.', err);
          process.exit(1);
        }
        const json = componentToJSON(contents);

        const componentObject = JSON.parse(json);
        const elementsAndAttributes = extractElementsAndAttributes(componentObject);

        // console.log(elementsAndAttributes);
        console.log(elementsAndAttributes.imports);
      });
    }
  });
});

// // Convert MyComponent to JSON
// const json = componentToJSON(`import React from 'react'

// export const sample2 = () => {
//   return (
//     <div shoul_ignore="help2">sample2</div>
//   )
// }
// `);

// const componentObject = JSON.parse(json);
// const elementsAndAttributes = extractElementsAndAttributes(componentObject);

// console.log(elementsAndAttributes);
// console.log(elementsAndAttributes.imports);

