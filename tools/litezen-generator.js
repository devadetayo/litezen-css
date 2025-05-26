const fs   = require('fs');
const path = require('path');

// Paths – adjust if needed
const inputPath   = path.resolve(__dirname, '../src/utilities/base.css');
const outputCSS   = path.resolve(__dirname, '../src/utilities/litezen-variants.css');
const outputJSON  = path.resolve(__dirname, '../src/utilities/litezen-styles.json');

// Breakpoints and pseudo-state maps
const responsivePrefixes = {
  sm: '@media (min-width: 480px)',
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 1024px)',
  xl: '@media (min-width: 1280px)',
  uw: '@media (min-width: 1536px)',
};

const statePrefixes = {
  hover:    ':hover',
  focus:    ':focus',
  active:   ':active',
  disabled: ':disabled',
};

const darkPrefix       = '[data-theme="dark"]';
const groupHoverPrefix = '.group:hover';

const inputCSS  = fs.readFileSync(inputPath, 'utf8');
const cssVariants = [];
const jsonStyles  = {};

// Regex that matches .className { … } including multi-line bodies
const blockRegex = /\.([^{\s]+)\s*\{([^}]+)\}/gs;
let match;

while ((match = blockRegex.exec(inputCSS))) {
  const className = match[1];           // e.g. "d-flex"
  const ruleBody  = match[2].trim();    // everything between { and }

  // Build JSON style object
  const styleProps = ruleBody
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .reduce((acc, curr) => {
      const [prop, value] = curr.split(':').map(s => s.trim());
      if (prop && value) {
        // convert kebab-case to camelCase
        const jsKey = prop.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
        acc[jsKey] = value;
      }
      return acc;
    }, {});
  jsonStyles[className.replace(/-/g, '_')] = styleProps;

  // helper to push variant + its dark mode version
  function pushVariant(selector) {
    cssVariants.push(`${selector} { ${ruleBody} }`);
    cssVariants.push(`${darkPrefix} ${selector} { ${ruleBody} }`);
  }

  // 1) Base
  pushVariant(`.${className}`);

  // 2) Responsive
  for (const [prefix, media] of Object.entries(responsivePrefixes)) {
    cssVariants.push(
`${media} {
  .${prefix}-${className} { ${ruleBody} }
  ${darkPrefix} .${prefix}-${className} { ${ruleBody} }
}`
    );
  }

  // 3) State pseudos
  for (const [state, pseudo] of Object.entries(statePrefixes)) {
    pushVariant(`.${state}-${className}${pseudo}`);
  }

  // 4) Group-hover
  pushVariant(`${groupHoverPrefix} .group-hover-${className}`);
}

// Write out files
fs.writeFileSync(outputCSS,  cssVariants.join('\n'), 'utf8');
fs.writeFileSync(outputJSON, JSON.stringify(jsonStyles, null, 2), 'utf8');

console.log('✅ Variants generated for CSS & JSON style objects including dark mode for pseudo and responsive.');