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
  if (!trimmed.startsWith('.') || !trimmed.includes('{') || !trimmed.includes('}')) return;

  const nameMatch = trimmed.match(/^\.([^{\s]+)/);
  if (!nameMatch) return;
  const className = nameMatch[1];

  const ruleBody = trimmed
    .slice(trimmed.indexOf('{') + 1, trimmed.lastIndexOf('}'))
    .trim();

  // JSON style export
  const styleProps = ruleBody.split(';').reduce((acc, curr) => {
    const [prop, value] = curr.split(':').map(s => s.trim());
    if (prop && value) {
      const jsKey = prop.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      acc[jsKey] = value;
    }
    return acc;
  }, {});
  jsonStyles[className.replace(/-/g, '_')] = styleProps;

  // Helper to push variant and its dark counterpart
  function pushVariant(selector) {
    cssVariants.push(`${selector} { ${ruleBody} }`);
    // dark mode for this variant
    cssVariants.push(`${darkPrefix} ${selector} { ${ruleBody} }`);
  }

  // Base class
  pushVariant(`.${className}`);

  // Responsive variants
  for (const [prefix, media] of Object.entries(responsivePrefixes)) {
    const sel = `.${prefix}-${className}`;
    cssVariants.push(`${media} { ${sel} { ${ruleBody} } ${darkPrefix} ${sel} { ${ruleBody} } }`);
  }

  // State variants
  for (const [state, pseudo] of Object.entries(statePrefixes)) {
    pushVariant(`.${state}-${className}${pseudo}`);
  }

  // Group-hover variant
  pushVariant(`${groupHoverPrefix} .group-hover-${className}`);
});

// write files
fs.writeFileSync(outputCSS, cssVariants.join('\n'), 'utf8');
fs.writeFileSync(outputJSON, JSON.stringify(jsonStyles, null, 2), 'utf8');

console.log('✅ Variants generated for CSS & JSON style objects including dark mode for pseudo and responsive.');