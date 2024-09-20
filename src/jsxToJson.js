import * as parser from '@babel/parser';

export function componentToJSON(componentString) {
  const componentObject = parser.parse(componentString, {
    sourceType: 'module',
    plugins: ['jsx','jsx','typescript'],
    errorRecovery: true,
  });

  return JSON.stringify(componentObject, null, 2);
}