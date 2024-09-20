import fs from 'fs';
import path from 'path';

function readJsonFiles(directoryPath) {
    return fs.readdirSync(directoryPath)
        .filter(file => path.extname(file) === '.json')
        .map(file => ({
            name: file,
            content: JSON.parse(fs.readFileSync(path.join(directoryPath, file), 'utf8'))
        }));
}

function readCombinedFuseUI(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function getDatatest() {
    const intui = readJsonFiles('./intiooutput');
    const fuseUI = readCombinedFuseUI('./fuioutput/combined.json');
    const results = [];

    intui.forEach(({ name, content }) => {
        content.forEach(item => {
            if (item.elementsAndAttributes && item.elementsAndAttributes.elements) {
                item.elementsAndAttributes.elements.forEach(element => {
                    const hasDataTest = element.attributes.some(attr => attr.name === 'data-test');
                    if (!hasDataTest) {
                        const result = {
                            fileName: name,
                            componentName: item.file,
                            element: element.element,
                            missingInIntegratorUI: true,
                            missingInFuseUI: true,
                            fuseUIPath: null
                        };

                        // Check if this element exists in the Fuse UI combined data
                        const fuseComponent = fuseUI.find(c => c.file === item.file);
                        
                        // Traverse all fuseUI components and log data-test attributes
                        fuseUI.forEach(component => {
                            if (component.elementsAndAttributes && component.elementsAndAttributes.elements) {
                                component.elementsAndAttributes.elements.forEach(elem => {
                                    const dataTestAttr = elem.attributes.find(attr => attr.name === 'data-test');
                                    if (dataTestAttr) {
                                        console.log(`data-test attribute found in ${component.file}/${elem.element}: ${dataTestAttr.value}`);
                                    }
                                });
                            }
                        });

                        if (fuseComponent) {
                            const fuseElement = fuseComponent.elementsAndAttributes.elements.find(e => e.element === element.element);
                            if (fuseElement) {
                                const fuseDataTest = fuseElement.attributes.find(attr => attr.name === 'data-test');
                                if (fuseDataTest) {
                                    result.missingInFuseUI = false;
                                    result.fuseUIPath = `${fuseComponent.file}/${fuseElement.element}`;
                                }
                            }
                        }

                        results.push(result);
                    }
                });
            }
        });
    });

    // Write results to a JSON file
    fs.writeFileSync('report/data.json', JSON.stringify(results, null, 2));
    console.log('Results have been written to data-test-results.json');
}