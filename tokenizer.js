const fs = require('fs');
const path = require('path');

const tokens = require('./tokens.json');
const existingCssFilePath = path.join(__dirname, 'global.css');

let cssVariables = '';

for (const [key, value] of Object.entries(tokens)) {
  if (value.$type === 'fontFamilies') {
    cssVariables += `  --${key}: "${value.$value}";\n`;
  } else if (value.$type === 'boxShadow') {
    let boxShadowValue = '';
    if (Array.isArray(value.$value)) {
      boxShadowValue = value.$value.map(shadow => {
        const inset = shadow.type === 'innerShadow' ? 'inset ' : '';
        return `${inset}${shadow.x} ${shadow.y} ${shadow.blur} ${shadow.spread} ${shadow.color}`;
      }).join(', ');
    } else {
      const shadow = value.$value;
      const inset = shadow.type === 'innerShadow' ? 'inset ' : '';
      boxShadowValue = `${inset}${shadow.x} ${shadow.y} ${shadow.blur} ${shadow.spread} ${shadow.color}`;
    }
    cssVariables += `  --${key}: ${boxShadowValue};\n`;
  } else {
    cssVariables += `  --${key}: ${value.$value};\n`;
  }
}

cssVariables += '\n';

// Read the existing CSS file
let existingCss = '';
if (fs.existsSync(existingCssFilePath)) {
  existingCss = fs.readFileSync(existingCssFilePath, 'utf8');
}

// Find the position of the :root { declaration
const rootStartIndex = existingCss.indexOf(':root {');
const rootOpenBraceIndex = existingCss.indexOf('{', rootStartIndex) + 1;

let updatedCss;
if (rootStartIndex !== -1 && rootOpenBraceIndex !== -1) {
  // Inject the variables one line after the opening brace of the :root { declaration
  const beforeRoot = existingCss.slice(0, rootOpenBraceIndex + 1);
  const afterRoot = existingCss.slice(rootOpenBraceIndex + 1);
  updatedCss = beforeRoot + '\n' + cssVariables + afterRoot;
} else {
  // If :root { is not found, prepend the variables
  updatedCss = ':root {\n' + cssVariables + '}\n' + existingCss;
}

// Write the combined content back to the existing CSS file
fs.writeFileSync(existingCssFilePath, updatedCss);

console.log('CSS variables injected successfully.');
