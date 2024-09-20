
export function extractElementsAndAttributes(ast) {
    // Your code here

    const elements = [];
    const imports = [];
  
    function traverse(node) {

      if (node.type === 'JSXElement') {
        const element = {
          element: node.openingElement.name.name,
          attributes: node.openingElement.attributes.map(attr => ({
            name: attr.name ?attr.name.name: null,
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