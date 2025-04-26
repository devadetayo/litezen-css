const fs = require('fs');
const { execSync } = require('child_process');

const outDir = 'dist';

// Utilities
const utilityFiles = [
  'src/utilities/reset.css',
  'src/utilities/normalize.css',
  'src/utilities/variables.css',
  'src/utilities/utilities.css',
  'src/utilities/responsive.css',
  'src/utilities/states.css'
];

// Components
const componentFiles = [
  'src/components/reset.css',
  'src/components/variables.css',
  'src/components/base.css',
  // Add all component files below
  'src/components/button.css',
  'src/components/card.css'
];

// Full Bundle
const litezenFiles = [...utilityFiles, ...componentFiles];

// Utility build
fs.writeFileSync(`${outDir}/utilities.css`, utilityFiles.map(f => fs.readFileSync(f)).join('\n'));

// Component build
fs.writeFileSync(`${outDir}/components.css`, componentFiles.map(f => fs.readFileSync(f)).join('\n'));

// Full build
fs.writeFileSync(`${outDir}/litezen.css`, litezenFiles.map(f => fs.readFileSync(f)).join('\n'));

// Minify using PostCSS
execSync(`npx postcss ${outDir}/litezen.css -o ${outDir}/litezen.min.css`);

console.log('✅ Build complete: utilities.css, components.css, litezen.css, litezen.min.css');
