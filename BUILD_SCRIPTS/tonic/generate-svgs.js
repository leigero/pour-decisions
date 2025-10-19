const fs = require('fs');
const path = require('path');

// Source and destination directories
const sourceDir = path.join(__dirname, '../../libs/tonic/icons/svgs');
const destDir = path.join(__dirname, '../../libs/tonic/icons/dist/svgs');

if(!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true});
}

const toConstantName = fileName => {
  return fileName.replace(/-/g, '_').replace(/\.svg$/,'');
}

const addTitleToSvg = (content, title) => {
  return content.replace('<svg', `<svg title="${title}"`);
}

const index = [];

fs.readdirSync(sourceDir).forEach(file => {
  if(path.extname(file) === '.svg') {
    const filePath = path.join(sourceDir, file);
    const svgContent = fs.readFileSync(filePath, 'utf8');
    const title = path.basename(file, '.svg');
    const svgWithTitle = addTitleToSvg(svgContent, title);
    const constantName = toConstantName(title);
    const tsContent = `export const ${constantName} = \`${svgWithTitle}\`;`;
    const tsFilePath = path.join(destDir, `${constantName}.ts`);
    fs.writeFileSync(tsFilePath, tsContent, 'utf8');
    index.push(`export * from './${constantName}';`);
    console.log(`Generated ${tsFilePath}`);
  }
});

const indexPath = path.join(destDir, 'index.ts');
fs.writeFileSync(indexPath, index.join('\n'), 'utf8');
console.log(`Generated ${indexPath}`);

console.log('SVG conversion complete.');