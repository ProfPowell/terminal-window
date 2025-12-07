#!/usr/bin/env node
/**
 * Documentation Generator for Terminal Window Web Component
 *
 * Parses JSDoc comments from terminal-window.js and generates an HTML documentation page.
 * Supports standard JSDoc tags plus web component-specific tags:
 * - @attr - HTML attributes
 * - @fires - Custom events
 * - @csspart - CSS Shadow Parts
 * - @slot - Named slots
 * - @cssprop - CSS Custom Properties
 *
 * Usage: node scripts/generate-docs.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_FILE = join(__dirname, '../src/terminal-window.js');
const OUTPUT_FILE = join(__dirname, '../demo/docs.html');
const TEMPLATE_FILE = join(__dirname, 'docs-template.html');

/**
 * Parse JSDoc comments from source code
 */
function parseJSDoc(source) {
  const result = {
    description: '',
    element: '',
    attributes: [],
    events: [],
    cssParts: [],
    slots: [],
    cssProperties: [],
    methods: [],
    examples: []
  };

  // Find the main class JSDoc block (before "class TerminalWindow")
  const classDocMatch = source.match(/\/\*\*[\s\S]*?\*\/\s*class\s+TerminalWindow/);
  if (classDocMatch) {
    const classDoc = classDocMatch[0];
    parseClassDoc(classDoc, result);
  }

  // Find all method JSDoc blocks
  const methodPattern = /\/\*\*[\s\S]*?\*\/\s+(\w+)\s*\([^)]*\)\s*\{/g;
  let match;
  while ((match = methodPattern.exec(source)) !== null) {
    const methodName = match[1];
    // Skip private methods (starting with _)
    if (methodName.startsWith('_')) continue;
    // Skip constructor and lifecycle methods
    if (['constructor', 'connectedCallback', 'disconnectedCallback', 'attributeChangedCallback', 'render'].includes(methodName)) continue;

    const docBlock = match[0];
    const method = parseMethodDoc(docBlock, methodName);
    if (method) {
      result.methods.push(method);
    }
  }

  return result;
}

/**
 * Parse the main class JSDoc block
 */
function parseClassDoc(docBlock, result) {
  // Extract description (first paragraph before any tags)
  const descMatch = docBlock.match(/\/\*\*\s*\n\s*\*\s*(.+?)(?=\s*\*\s*@|\s*\*\/)/s);
  if (descMatch) {
    result.description = descMatch[1]
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, '').trim())
      .filter(line => line)
      .join(' ');
  }

  // Parse @element
  const elementMatch = docBlock.match(/@element\s+(\S+)/);
  if (elementMatch) {
    result.element = elementMatch[1];
  }

  // Parse @attr tags
  const attrPattern = /@attr\s+\{([^}]+)\}\s+\[?([^\]= ]+)(?:=([^\]]+))?\]?\s*-?\s*(.*)/g;
  let match;
  while ((match = attrPattern.exec(docBlock)) !== null) {
    result.attributes.push({
      type: match[1],
      name: match[2],
      default: match[3] || '',
      description: match[4].trim()
    });
  }

  // Parse @fires tags
  const firesPattern = /@fires\s+\{([^}]+)\}\s+(\S+)\s*-?\s*(.*)/g;
  while ((match = firesPattern.exec(docBlock)) !== null) {
    result.events.push({
      type: match[1],
      name: match[2],
      description: match[3].trim()
    });
  }

  // Parse @csspart tags
  const csspartPattern = /@csspart\s+(\S+)\s*-?\s*(.*)/g;
  while ((match = csspartPattern.exec(docBlock)) !== null) {
    result.cssParts.push({
      name: match[1],
      description: match[2].trim()
    });
  }

  // Parse @slot tags
  const slotPattern = /@slot\s+(\S+)\s*-?\s*(.*)/g;
  while ((match = slotPattern.exec(docBlock)) !== null) {
    result.slots.push({
      name: match[1],
      description: match[2].trim()
    });
  }

  // Parse @cssprop tags
  const csspropPattern = /@cssprop\s+\[([^\]=]+)(?:=([^\]]+))?\]\s*-?\s*(.*)/g;
  while ((match = csspropPattern.exec(docBlock)) !== null) {
    result.cssProperties.push({
      name: match[1],
      default: match[2] || '',
      description: match[3].trim()
    });
  }

  // Parse @example tags from class doc
  const examplePattern = /@example\s*\n([\s\S]*?)(?=\s*\*\s*@|\s*\*\/)/g;
  while ((match = examplePattern.exec(docBlock)) !== null) {
    const example = match[1]
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, ''))
      .join('\n')
      .trim();
    if (example) {
      result.examples.push(example);
    }
  }
}

/**
 * Parse a method JSDoc block
 */
function parseMethodDoc(docBlock, methodName) {
  const method = {
    name: methodName,
    description: '',
    params: [],
    returns: null,
    fires: [],
    examples: []
  };

  // Extract description
  const descMatch = docBlock.match(/\/\*\*\s*\n\s*\*\s*(.+?)(?=\s*\*\s*@|\s*\*\/)/s);
  if (descMatch) {
    method.description = descMatch[1]
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, '').trim())
      .filter(line => line)
      .join(' ');
  }

  // Parse @param tags
  const paramPattern = /@param\s+\{([^}]+)\}\s+\[?([^\]\s]+)\]?\s*-?\s*(.*)/g;
  let match;
  while ((match = paramPattern.exec(docBlock)) !== null) {
    method.params.push({
      type: match[1],
      name: match[2],
      description: match[3].trim()
    });
  }

  // Parse @returns tag
  const returnsMatch = docBlock.match(/@returns?\s+\{([^}]+)\}\s*(.*)/);
  if (returnsMatch) {
    method.returns = {
      type: returnsMatch[1],
      description: returnsMatch[2].trim()
    };
  }

  // Parse @fires tags
  const firesPattern = /@fires\s+(\S+)/g;
  while ((match = firesPattern.exec(docBlock)) !== null) {
    method.fires.push(match[1]);
  }

  // Parse @example tags
  const examplePattern = /@example\s*\n([\s\S]*?)(?=\s*\*\s*@|\s*\*\/|\s+\w+\s*\()/g;
  while ((match = examplePattern.exec(docBlock)) !== null) {
    const example = match[1]
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, ''))
      .join('\n')
      .trim();
    if (example) {
      method.examples.push(example);
    }
  }

  return method;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Apply syntax highlighting to code
 */
function highlightCode(code, language = 'javascript') {
  const escaped = escapeHtml(code);

  if (language === 'html') {
    return highlightHTML(escaped);
  }

  return highlightJS(escaped);
}

/**
 * Highlight JavaScript code
 */
function highlightJS(code) {
  // Process character by character to avoid replacing inside strings/comments
  let result = '';
  let i = 0;

  while (i < code.length) {
    // Check for comments
    if (code.slice(i, i + 2) === '//') {
      const endOfLine = code.indexOf('\n', i);
      const end = endOfLine === -1 ? code.length : endOfLine;
      result += `<span class="cmt">${code.slice(i, end)}</span>`;
      i = end;
      continue;
    }

    // Check for multi-line comments
    if (code.slice(i, i + 2) === '/*') {
      const end = code.indexOf('*/', i + 2);
      const closeIndex = end === -1 ? code.length : end + 2;
      result += `<span class="cmt">${code.slice(i, closeIndex)}</span>`;
      i = closeIndex;
      continue;
    }

    // Check for strings
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && (code[j] !== quote || code[j - 1] === '\\')) {
        j++;
      }
      j++; // include closing quote
      const className = quote === '`' ? 'tpl' : 'str';
      result += `<span class="${className}">${code.slice(i, j)}</span>`;
      i = j;
      continue;
    }

    // Check for numbers
    if (/\d/.test(code[i]) && (i === 0 || !/\w/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) {
        j++;
      }
      result += `<span class="num">${code.slice(i, j)}</span>`;
      i = j;
      continue;
    }

    // Check for keywords
    const keywords = ['const', 'let', 'var', 'function', 'class', 'return', 'if', 'else', 'for', 'while',
                      'async', 'await', 'new', 'this', 'true', 'false', 'null', 'undefined', 'import',
                      'export', 'from', 'default', 'extends', 'static', 'get', 'set', 'typeof', 'instanceof'];
    let matched = false;
    for (const kw of keywords) {
      if (code.slice(i, i + kw.length) === kw &&
          (i === 0 || !/\w/.test(code[i - 1])) &&
          (i + kw.length >= code.length || !/\w/.test(code[i + kw.length]))) {
        result += `<span class="kw">${kw}</span>`;
        i += kw.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check for function calls
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\w]/.test(code[j])) {
        j++;
      }
      const word = code.slice(i, j);
      // Check if followed by (
      let k = j;
      while (k < code.length && /\s/.test(code[k])) k++;
      if (code[k] === '(') {
        result += `<span class="fn">${word}</span>`;
      } else {
        result += word;
      }
      i = j;
      continue;
    }

    result += code[i];
    i++;
  }

  return result;
}

/**
 * Highlight HTML code (token-based approach)
 */
function highlightHTML(code) {
  let result = '';
  let i = 0;

  while (i < code.length) {
    // Check for HTML tags (starting with &lt;)
    if (code.slice(i, i + 4) === '&lt;') {
      // Find the end of the tag
      const tagEnd = code.indexOf('&gt;', i);
      if (tagEnd === -1) {
        result += code.slice(i);
        break;
      }

      const tagContent = code.slice(i + 4, tagEnd); // Content between &lt; and &gt;
      let tagResult = '&lt;';

      // Check if it's a closing tag
      const isClosing = tagContent.startsWith('/');
      const tagStart = isClosing ? 1 : 0;

      // Extract tag name
      let j = tagStart;
      while (j < tagContent.length && /[\w-]/.test(tagContent[j])) {
        j++;
      }
      const tagName = tagContent.slice(tagStart, j);

      if (isClosing) {
        tagResult += '/';
      }
      tagResult += `<span class="tag">${tagName}</span>`;

      // Process attributes
      let attrPart = tagContent.slice(j);
      // Match attributes: name="value" or name='value'
      attrPart = attrPart.replace(/([\w-]+)(=)(&quot;[^&]*&quot;|&#39;[^&]*&#39;)/g,
        '<span class="attr">$1</span>$2<span class="val">$3</span>');
      // Match attributes without quotes: name=value
      attrPart = attrPart.replace(/([\w-]+)(=)([\w-]+)(?=\s|$)/g,
        '<span class="attr">$1</span>$2<span class="val">$3</span>');

      tagResult += attrPart;
      tagResult += '&gt;';

      result += tagResult;
      i = tagEnd + 4; // Move past &gt;
      continue;
    }

    result += code[i];
    i++;
  }

  return result;
}

/**
 * Generate HTML for attributes table
 */
function generateAttributesTable(attributes, category) {
  if (attributes.length === 0) return '';

  const categoryAttrs = attributes.filter(attr => {
    if (category === 'appearance') {
      return ['theme', 'cursor-style', 'cursor-blink', 'font-family', 'font-size', 'line-height'].includes(attr.name);
    } else if (category === 'header') {
      return ['title', 'show-header', 'show-controls', 'show-copy', 'show-theme-toggle'].includes(attr.name);
    } else if (category === 'behavior') {
      return ['prompt', 'typing-effect', 'typing-speed', 'readonly', 'max-lines', 'welcome', 'enable-vfs', 'persist-history', 'force-animations'].includes(attr.name);
    }
    return false;
  });

  if (categoryAttrs.length === 0) return '';

  let html = `<table class="attr-table">
  <thead>
    <tr>
      <th>Attribute</th>
      <th>Description</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>`;

  for (const attr of categoryAttrs) {
    html += `
    <tr>
      <td>${escapeHtml(attr.name)}</td>
      <td>${escapeHtml(attr.description)}</td>
      <td><code>${escapeHtml(attr.default || '—')}</code></td>
    </tr>`;
  }

  html += `
  </tbody>
</table>`;

  return html;
}

/**
 * Generate HTML for events section
 */
function generateEventsSection(events) {
  if (events.length === 0) return '';

  let html = '';
  for (const event of events) {
    html += `
<h3 id="event-${event.name}">${event.name}</h3>
<div class="event-name">${event.name}</div>
<p>${escapeHtml(event.description)}</p>
`;
  }

  return html;
}

/**
 * Generate HTML for methods section
 */
function generateMethodsSection(methods) {
  if (methods.length === 0) return '';

  let html = '';
  for (const method of methods) {
    const params = method.params.map(p => p.name).join(', ');
    const signature = `${method.name}(${params})`;

    html += `
<h3 id="method-${method.name}">${method.name}()</h3>
<div class="method-signature">${escapeHtml(signature)}</div>
<p>${escapeHtml(method.description)}</p>
`;

    if (method.params.length > 0) {
      html += `<p><strong>Parameters:</strong></p>
<ul>`;
      for (const param of method.params) {
        html += `
  <li><code>${escapeHtml(param.name)}</code> <em>(${escapeHtml(param.type)})</em> - ${escapeHtml(param.description)}</li>`;
      }
      html += `
</ul>`;
    }

    if (method.returns && method.returns.type !== 'void') {
      html += `<p><strong>Returns:</strong> <em>${escapeHtml(method.returns.type)}</em>${method.returns.description ? ' - ' + escapeHtml(method.returns.description) : ''}</p>`;
    }

    if (method.examples.length > 0) {
      for (const example of method.examples) {
        const lang = example.includes('<') ? 'html' : 'javascript';
        html += `
<div class="code-block" data-lang="${lang === 'html' ? 'HTML' : 'JS'}">
  <code>${highlightCode(example, lang)}</code>
</div>`;
      }
    }
  }

  return html;
}

/**
 * Generate HTML for CSS parts section
 */
function generateCssPartsSection(cssParts) {
  if (cssParts.length === 0) return '';

  let html = `<table class="attr-table">
  <thead>
    <tr>
      <th>Part Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>`;

  for (const part of cssParts) {
    html += `
    <tr>
      <td>${escapeHtml(part.name)}</td>
      <td>${escapeHtml(part.description)}</td>
    </tr>`;
  }

  html += `
  </tbody>
</table>`;

  return html;
}

/**
 * Generate HTML for slots section
 */
function generateSlotsSection(slots) {
  if (slots.length === 0) return '';

  let html = `<table class="attr-table">
  <thead>
    <tr>
      <th>Slot Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>`;

  for (const slot of slots) {
    html += `
    <tr>
      <td>${escapeHtml(slot.name)}</td>
      <td>${escapeHtml(slot.description)}</td>
    </tr>`;
  }

  html += `
  </tbody>
</table>`;

  return html;
}

/**
 * Generate HTML for CSS custom properties section
 */
function generateCssPropertiesSection(cssProperties) {
  if (cssProperties.length === 0) return '';

  let html = `<table class="attr-table">
  <thead>
    <tr>
      <th>Property</th>
      <th>Description</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>`;

  for (const prop of cssProperties) {
    html += `
    <tr>
      <td><code>${escapeHtml(prop.name)}</code></td>
      <td>${escapeHtml(prop.description)}</td>
      <td><code>${escapeHtml(prop.default || '—')}</code></td>
    </tr>`;
  }

  html += `
  </tbody>
</table>`;

  return html;
}

/**
 * Generate the complete documentation HTML
 */
function generateDocsHTML(docs) {
  const toc = generateTOC(docs);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Reference - Terminal Window</title>
  <link rel="stylesheet" href="styles/base.css">
  <link rel="stylesheet" href="styles/syntax.css">
</head>
<body>
  <header class="site-header">
    <div class="site-header__brand">
      <span class="site-header__title">&lt;terminal-window&gt;</span>
      <span class="site-header__tagline">API Reference</span>
    </div>
    <nav class="site-header__nav">
      <a href="index.html">Home</a>
      <a href="docs.html" class="active">Docs</a>
      <div class="nav-dropdown">
        <button class="nav-dropdown__trigger" aria-expanded="false" aria-haspopup="true">
          Examples
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </button>
        <div class="nav-dropdown__menu">
          <a href="examples/unix.html">Unix</a>
          <a href="examples/git.html">Git</a>
          <a href="examples/curl.html">cURL</a>
          <a href="examples/apache.html">Apache</a>
        </div>
      </div>
    </nav>
  </header>

  <main class="docs-main">
    <div class="content">
      <article class="panel panel--docs">
        <h1>API Reference</h1>
        <p>${escapeHtml(docs.description)}</p>

        <!-- Table of Contents -->
        <nav class="toc">
          <h4>Contents</h4>
          ${toc}
        </nav>

        <!-- Attributes -->
        <section class="syntax-section" id="attributes">
          <h2>Attributes</h2>
          <p>Configure the terminal using HTML attributes. All attributes can also be set via JavaScript properties.</p>

          <h3 id="attr-appearance">Appearance</h3>
          ${generateAttributesTable(docs.attributes, 'appearance')}

          <h3 id="attr-header">Header</h3>
          ${generateAttributesTable(docs.attributes, 'header')}

          <h3 id="attr-behavior">Behavior</h3>
          ${generateAttributesTable(docs.attributes, 'behavior')}
        </section>

        <!-- Events -->
        <section class="syntax-section" id="events">
          <h2>Events</h2>
          <p>Listen for these custom events to respond to terminal activity.</p>
          ${generateEventsSection(docs.events)}
        </section>

        <!-- Methods -->
        <section class="syntax-section" id="methods">
          <h2>Methods</h2>
          <p>Control the terminal programmatically using these public methods.</p>
          ${generateMethodsSection(docs.methods)}
        </section>

        <!-- CSS Parts -->
        <section class="syntax-section" id="css-parts">
          <h2>CSS Parts</h2>
          <p>Style internal elements using the <code>::part()</code> selector.</p>
          ${generateCssPartsSection(docs.cssParts)}

          <div class="code-block" data-lang="CSS">
            <code>${highlightCode(`/* Example: Style the terminal header */
terminal-window::part(header) {
  background: #2d2d2d;
  border-bottom: 2px solid #50fa7b;
}

/* Style the prompt */
terminal-window::part(prompt) {
  color: #ff79c6;
}`)}</code>
          </div>
        </section>

        <!-- Slots -->
        <section class="syntax-section" id="slots">
          <h2>Slots</h2>
          <p>Customize content using named slots.</p>
          ${generateSlotsSection(docs.slots)}

          <div class="code-block" data-lang="HTML">
            <code>${highlightCode(`<terminal-window>
  <span slot="title">My Custom Terminal</span>
  <button slot="actions" onclick="runScript()">Run</button>
  <div slot="before-output">
    <p>Welcome to the interactive tutorial!</p>
  </div>
</terminal-window>`, 'html')}</code>
          </div>
        </section>

        <!-- CSS Custom Properties -->
        <section class="syntax-section" id="css-properties">
          <h2>CSS Custom Properties</h2>
          <p>Customize colors and styling using CSS custom properties.</p>
          ${generateCssPropertiesSection(docs.cssProperties)}
        </section>

        <!-- Built-in Commands -->
        <section class="syntax-section" id="built-in-commands">
          <h2>Built-in Commands</h2>
          <p>These commands are available by default:</p>
          <ul>
            <li><strong>help</strong> - Display available commands</li>
            <li><strong>clear</strong> - Clear the terminal output</li>
            <li><strong>echo [text]</strong> - Print text to the terminal</li>
            <li><strong>history</strong> - Show command history</li>
          </ul>

          <h3>VFS Commands</h3>
          <p>When <code>enable-vfs="true"</code> is set, these additional commands are available:</p>
          <ul>
            <li><strong>ls [path]</strong> - List directory contents</li>
            <li><strong>cd [path]</strong> - Change current directory</li>
            <li><strong>pwd</strong> - Print working directory</li>
            <li><strong>mkdir [name]</strong> - Create a directory</li>
            <li><strong>touch [name]</strong> - Create an empty file</li>
            <li><strong>rm [name]</strong> - Remove a file or directory</li>
            <li><strong>cat [file]</strong> - Display file contents</li>
          </ul>
        </section>

      </article>
    </div>
  </main>

  <footer class="site-footer">
    <span>Terminal Window Web Component</span>
    <a href="https://github.com/ProfPowell/terminal-window" target="_blank" rel="noopener">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
      GitHub
    </a>
  </footer>

  <script>
    // Dropdown menu toggle
    document.querySelectorAll('.nav-dropdown__trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = trigger.closest('.nav-dropdown');
        dropdown.classList.toggle('open');
        trigger.setAttribute('aria-expanded', dropdown.classList.contains('open'));
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
        dropdown.classList.remove('open');
        dropdown.querySelector('.nav-dropdown__trigger').setAttribute('aria-expanded', 'false');
      });
    });
  </script>
</body>
</html>`;
}

/**
 * Generate Table of Contents
 */
function generateTOC(docs) {
  const sections = [
    { id: 'attributes', label: 'Attributes' },
    { id: 'events', label: 'Events' },
    { id: 'methods', label: 'Methods' },
    { id: 'css-parts', label: 'CSS Parts' },
    { id: 'slots', label: 'Slots' },
    { id: 'css-properties', label: 'CSS Custom Properties' },
    { id: 'built-in-commands', label: 'Built-in Commands' }
  ];

  return `<ul>
${sections.map(s => `    <li><a href="#${s.id}">${s.label}</a></li>`).join('\n')}
  </ul>`;
}

// Main execution
try {
  console.log('Reading source file...');
  const source = readFileSync(SOURCE_FILE, 'utf-8');

  console.log('Parsing JSDoc comments...');
  const docs = parseJSDoc(source);

  console.log(`Found:`);
  console.log(`  - ${docs.attributes.length} attributes`);
  console.log(`  - ${docs.events.length} events`);
  console.log(`  - ${docs.methods.length} methods`);
  console.log(`  - ${docs.cssParts.length} CSS parts`);
  console.log(`  - ${docs.slots.length} slots`);
  console.log(`  - ${docs.cssProperties.length} CSS properties`);

  console.log('Generating HTML...');
  const html = generateDocsHTML(docs);

  console.log(`Writing to ${OUTPUT_FILE}...`);
  writeFileSync(OUTPUT_FILE, html, 'utf-8');

  console.log('Documentation generated successfully!');
} catch (error) {
  console.error('Error generating documentation:', error);
  process.exit(1);
}
