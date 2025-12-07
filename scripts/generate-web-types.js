#!/usr/bin/env node
/**
 * Generate web-types.json for JetBrains IDE support
 * Converts custom-elements.json to web-types format
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read custom-elements.json
const cemPath = join(rootDir, 'custom-elements.json');
const cem = JSON.parse(readFileSync(cemPath, 'utf8'));

// Read package.json for version
const pkgPath = join(rootDir, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

// Convert CEM to web-types
function convertToWebTypes(cem, pkg) {
  const webTypes = {
    $schema: 'https://raw.githubusercontent.com/ArkadyKonoplya/Web-Types/refs/heads/master/schema.json',
    name: pkg.name,
    version: pkg.version,
    'js-types-syntax': 'typescript',
    'description-markup': 'markdown',
    contributions: {
      html: {
        elements: [],
      },
    },
  };

  // Process each module
  for (const module of cem.modules || []) {
    for (const declaration of module.declarations || []) {
      if (declaration.customElement && declaration.tagName) {
        const element = convertElement(declaration);
        webTypes.contributions.html.elements.push(element);
      }
    }
  }

  return webTypes;
}

function convertElement(declaration) {
  const element = {
    name: declaration.tagName,
    description: declaration.description,
    'doc-url': `https://github.com/ProfPowell/terminal-window#readme`,
    attributes: [],
    slots: [],
    events: [],
    'css-properties': [],
    'css-parts': [],
    js: {
      properties: [],
      events: [],
    },
  };

  // Convert attributes
  for (const attr of declaration.attributes || []) {
    element.attributes.push({
      name: attr.name,
      description: attr.description,
      default: attr.default,
      value: attr.type
        ? {
            type: convertType(attr.type.text),
          }
        : undefined,
    });
  }

  // Convert slots
  for (const slot of declaration.slots || []) {
    element.slots.push({
      name: slot.name || '',
      description: slot.description,
    });
  }

  // Convert events
  for (const event of declaration.events || []) {
    element.events.push({
      name: event.name,
      description: event.description,
    });
    element.js.events.push({
      name: event.name,
      description: event.description,
    });
  }

  // Convert CSS custom properties
  for (const prop of declaration.cssProperties || []) {
    element['css-properties'].push({
      name: prop.name,
      description: prop.description,
      default: prop.default,
    });
  }

  // Convert CSS parts
  for (const part of declaration.cssParts || []) {
    element['css-parts'].push({
      name: part.name,
      description: part.description,
    });
  }

  // Convert public methods and properties
  for (const member of declaration.members || []) {
    // Skip private members
    if (member.name.startsWith('_') || member.privacy === 'private') {
      continue;
    }

    if (member.kind === 'method') {
      element.js.properties.push({
        name: member.name,
        description: member.description,
        type: 'Function',
      });
    } else if (member.kind === 'field') {
      element.js.properties.push({
        name: member.name,
        description: member.description,
        type: member.type?.text || 'any',
      });
    }
  }

  return element;
}

function convertType(typeText) {
  if (!typeText) return 'string';

  // Handle union types
  if (typeText.includes('|')) {
    return typeText;
  }

  // Map common types
  const typeMap = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    array: 'Array',
    object: 'Object',
    Function: 'Function',
  };

  return typeMap[typeText] || typeText;
}

// Generate and write web-types.json
const webTypes = convertToWebTypes(cem, pkg);
const outputPath = join(rootDir, 'web-types.json');
writeFileSync(outputPath, JSON.stringify(webTypes, null, 2));

console.log(`Generated web-types.json (v${pkg.version})`);
console.log(`  - ${webTypes.contributions.html.elements.length} element(s)`);

const element = webTypes.contributions.html.elements[0];
if (element) {
  console.log(`  - ${element.attributes.length} attributes`);
  console.log(`  - ${element.slots.length} slots`);
  console.log(`  - ${element.events.length} events`);
  console.log(`  - ${element['css-properties'].length} CSS properties`);
  console.log(`  - ${element['css-parts'].length} CSS parts`);
}
