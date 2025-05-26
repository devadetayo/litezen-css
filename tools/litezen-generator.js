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

const baseVariants = [];
const responsiveVariantsMap = {}; // store per breakpoint
const jsonStyles = {};

Object.keys(responsivePrefixes).forEach(key => {
  responsiveVariantsMap[key] = [];
});

lines.forEach(line => {
  const trimmed = line.trim();
  if (!trimmed.startsWith('.') || !trimmed.includes('{') || !trimmed.includes('}')) return;

  const nameMatch = trimmed.match(/^\.([^{\s]+)/);
  if (!nameMatch) return;
  const className = nameMatch[1];

  const ruleBody = trimmed
    .slice(trimmed.indexOf('{') + 1, trimmed.lastIndexOf('}'))
    .trim();

  // JSON export
  const styleProps = ruleBody.split(';').reduce((acc, curr) => {
    const [prop, value] = curr.split(':').map(s => s.trim());
    if (prop && value) {
      const jsKey = prop.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      acc[jsKey] = value;
    }
    return acc;
  }, {});
  jsonStyles[className.replace(/-/g, '_')] = styleProps;

  // Base class + dark
  baseVariants.push(`.${className} { ${ruleBody} }`);
  baseVariants.push(`${darkPrefix} .${className} { ${ruleBody} }`);

  // State variants + dark
  for (const [state, pseudo] of Object.entries(statePrefixes)) {
    baseVariants.push(`.${state}-${className}${pseudo} { ${ruleBody} }`);
    baseVariants.push(`${darkPrefix} .${state}-${className}${pseudo} { ${ruleBody} }`);
  }

  // Group hover + dark
  baseVariants.push(`${groupHoverPrefix} .group-hover-${className} { ${ruleBody} }`);
  baseVariants.push(`${darkPrefix} ${groupHoverPrefix} .group-hover-${className} { ${ruleBody} }`);

  // Responsive variants
  for (const [prefix, media] of Object.entries(responsivePrefixes)) {
    const sel = `.${prefix}-${className}`;
    const variant = `${sel} { ${ruleBody} }\n${darkPrefix} ${sel} { ${ruleBody} }`;
    responsiveVariantsMap[prefix].push(variant);
  }
});

// Stitch together responsive CSS
const responsiveVariants = Object.entries(responsiveVariantsMap).map(
  ([prefix, rules]) => `${responsivePrefixes[prefix]} {\n${rules.join('\n')}\n}`
);

// Final output
const finalCSS = [...baseVariants, ...responsiveVariants].join('\n');

fs.writeFileSync(outputCSS, finalCSS, 'utf8');
fs.writeFileSync(outputJSON, JSON.stringify(jsonStyles, null, 2), 'utf8');

console.log('✅ Mobile-first CSS variants with proper cascade order generated.');