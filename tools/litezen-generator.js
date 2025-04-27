const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, '../src/utilities/base.css');
const outputCSS = path.resolve(__dirname, '../src/utilities/litezen-variants.css');
const outputJSON = path.resolve(__dirname, '../src/utilities/litezen-styles.json');

const responsivePrefixes = {
  sm: '@media (min-width: 480px)',
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 1024px)',
  xl: '@media (min-width: 1280px)',
  uw: '@media (min-width: 1536px)',
};

const statePrefixes = {
  hover: ':hover',
  focus: ':focus',
  active: ':active',
  disabled: ':disabled',
};

const darkPrefix = '[data-theme="dark"]';
const groupHoverPrefix = '.group:hover';

const inputCSS = fs.readFileSync(inputPath, 'utf8');
const lines = inputCSS.split(/\r?\n/);

const cssVariants = [];
const jsonStyles = {};

lines.forEach(line => {
  const trimmed = line.trim();
  // only process simple single-line class rules
  if (!trimmed.startsWith('.') || !trimmed.includes('{') || !trimmed.includes('}')) {
    return;
  }

  // regex to pull class name up to { or whitespace
  const nameMatch = trimmed.match(/^\.([^{\s]+)/);
  if (!nameMatch) return;
  const className = nameMatch[1]; // e.g. “will-change-transform”

  // extract only the inside of the braces
  const ruleBody = trimmed
    .slice(trimmed.indexOf('{') + 1, trimmed.lastIndexOf('}'))
    .trim(); // e.g. "will-change: transform;"

  // build JSON version
  const styleProps = ruleBody.split(';').reduce((acc, curr) => {
    const [prop, value] = curr.split(':').map(s => s.trim());
    if (prop && value) {
      const jsKey = prop.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      acc[jsKey] = value;
    }
    return acc;
  }, {});
  jsonStyles[className.replace(/-/g, '_')] = styleProps;

  // responsive
  for (const [prefix, media] of Object.entries(responsivePrefixes)) {
    cssVariants.push(
      `${media} { .${prefix}-${className} { ${ruleBody} } }`
    );
  }

  // state variants
  for (const [state, pseudo] of Object.entries(statePrefixes)) {
    cssVariants.push(
      `.${state}-${className}${pseudo} { ${ruleBody} }`
    );
  }

  // dark mode
  cssVariants.push(
    `${darkPrefix} .dark-${className} { ${ruleBody} }`
  );

  // group-hover
  cssVariants.push(
    `${groupHoverPrefix} .group-hover-${className} { ${ruleBody} }`
  );
});

// write files
fs.writeFileSync(outputCSS, cssVariants.join('\n'), 'utf8');
fs.writeFileSync(outputJSON, JSON.stringify(jsonStyles, null, 2), 'utf8');

console.log('✅ Variants generated for CSS & JSON style objects.');