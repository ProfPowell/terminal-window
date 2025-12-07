# Eleventy (11ty) Integration

This guide shows how to use `terminal-window` in an Eleventy static site.

## Live Demo

[Open in CodeSandbox](https://codesandbox.io/s/11ty-terminal-window)

## Installation

```bash
npm install terminal-window
```

## Project Setup

### Directory Structure

```
my-11ty-site/
├── _includes/
│   └── layouts/
│       └── base.njk
├── _data/
│   └── site.json
├── src/
│   ├── index.md
│   └── tutorials/
├── js/
│   └── terminal-setup.js
├── .eleventy.js
└── package.json
```

### Configuration (.eleventy.js)

```javascript
module.exports = function(eleventyConfig) {
  // Pass through the terminal-window dist files
  eleventyConfig.addPassthroughCopy({
    'node_modules/terminal-window/dist': 'js/terminal-window'
  });

  // Pass through local JS
  eleventyConfig.addPassthroughCopy('js');

  // Pass through CSS
  eleventyConfig.addPassthroughCopy('css');

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '../_includes',
      data: '../_data'
    }
  };
};
```

## Basic Usage

### Base Layout (_includes/layouts/base.njk)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} | {{ site.name }}</title>
  <link rel="stylesheet" href="/css/styles.css">
  <script type="module" src="/js/terminal-window/terminal-window.es.js"></script>
</head>
<body>
  <main>
    {{ content | safe }}
  </main>

  {% if terminalCommands %}
  <script type="module">
    const terminal = document.querySelector('terminal-window');
    if (terminal) {
      const commands = {{ terminalCommands | dump | safe }};
      Object.entries(commands).forEach(([name, response]) => {
        terminal.registerCommand(name, () => response);
      });
    }
  </script>
  {% endif %}
</body>
</html>
```

### Using in Markdown (src/index.md)

```markdown
---
layout: layouts/base.njk
title: Home
---

# Welcome to My Site

Here's an interactive terminal:

<terminal-window
  theme="dark"
  prompt="$ "
  welcome="Welcome! Type 'help' for commands."
  enable-vfs
  autofocus
></terminal-window>
```

## Eleventy Shortcode

Create a shortcode for easier terminal embedding:

### Register Shortcode (.eleventy.js)

```javascript
module.exports = function(eleventyConfig) {
  // Passthrough copy (as before)
  eleventyConfig.addPassthroughCopy({
    'node_modules/terminal-window/dist': 'js/terminal-window'
  });

  // Terminal shortcode
  eleventyConfig.addShortcode('terminal', function(options = {}) {
    const {
      theme = 'dark',
      prompt = '$ ',
      welcome = '',
      enableVfs = false,
      id = 'terminal',
      height = '400px'
    } = options;

    return `
      <terminal-window
        id="${id}"
        theme="${theme}"
        prompt="${prompt}"
        welcome="${welcome}"
        ${enableVfs ? 'enable-vfs' : ''}
        autofocus
        style="height: ${height};"
      ></terminal-window>
    `;
  });

  // Paired shortcode for terminal with custom commands
  eleventyConfig.addPairedShortcode('terminalWithCommands', function(content, options = {}) {
    const terminalHtml = eleventyConfig.getShortcode('terminal')(options);

    return `
      ${terminalHtml}
      <script type="module">
        const terminal = document.getElementById('${options.id || 'terminal'}');
        customElements.whenDefined('terminal-window').then(() => {
          ${content}
        });
      </script>
    `;
  });

  return { /* config */ };
};
```

### Using Shortcodes

```markdown
---
layout: layouts/base.njk
title: Tutorial
---

# Git Tutorial

Learn Git commands interactively:

{% terminal theme="dark", prompt="git> ", welcome="Git Tutorial - Type 'help'", enableVfs=true, id="git-terminal" %}

With custom commands:

{% terminalWithCommands theme="dark", prompt="$ ", id="custom-terminal" %}
terminal.registerCommand('hello', () => 'Hello from 11ty!');
terminal.registerCommand('date', () => new Date().toLocaleDateString());
{% endterminalWithCommands %}
```

## Tutorial Site Example

### Tutorial Template (_includes/layouts/tutorial.njk)

```html
---
layout: layouts/base.njk
---

<article class="tutorial">
  <header>
    <h1>{{ title }}</h1>
    <p class="meta">{{ description }}</p>
  </header>

  <div class="tutorial-content">
    {{ content | safe }}
  </div>

  {% if hasTerminal %}
  <section class="tutorial-terminal">
    <h2>Try It Yourself</h2>
    <terminal-window
      id="tutorial-terminal"
      theme="{{ terminalTheme or 'dark' }}"
      prompt="{{ terminalPrompt or '$ ' }}"
      welcome="{{ terminalWelcome or 'Practice the commands from this tutorial!' }}"
      enable-vfs
      autofocus
    ></terminal-window>
  </section>

  <script type="module">
    const terminal = document.getElementById('tutorial-terminal');
    customElements.whenDefined('terminal-window').then(() => {
      {% if tutorialCommands %}
      const commands = {{ tutorialCommands | dump | safe }};
      Object.entries(commands).forEach(([name, handler]) => {
        if (typeof handler === 'string') {
          terminal.registerCommand(name, () => handler);
        }
      });
      {% endif %}
    });
  </script>
  {% endif %}
</article>
```

### Tutorial Content (src/tutorials/git-basics.md)

```markdown
---
layout: layouts/tutorial.njk
title: Git Basics
description: Learn the fundamental Git commands
hasTerminal: true
terminalPrompt: "~/project (main) $ "
terminalWelcome: "Practice Git commands here!"
tutorialCommands:
  status: |
    On branch main
    Your branch is up to date with 'origin/main'.
    nothing to commit, working tree clean
  log: |
    commit abc1234 (HEAD -> main)
    Author: You <you@example.com>
    Date:   Today

        Initial commit
  branch: |
    * main
      feature
      develop
---

# Git Basics

## Checking Status

Use `git status` to see the current state:

```bash
git status
```

## Viewing History

Use `git log` to see commit history:

```bash
git log
```

Try these commands in the terminal below!
```

## Data Files

### Site Data (_data/site.json)

```json
{
  "name": "My Tutorial Site",
  "url": "https://example.com",
  "terminalDefaults": {
    "theme": "dark",
    "prompt": "$ "
  }
}
```

### Commands Data (_data/terminalCommands.json)

```json
{
  "global": {
    "site": "Welcome to My Tutorial Site!",
    "version": "terminal-window v2.0.0"
  },
  "tutorials": {
    "git": {
      "status": "On branch main...",
      "log": "commit abc1234..."
    }
  }
}
```

## Styling (css/styles.css)

```css
/* Terminal styling */
terminal-window {
  display: block;
  width: 100%;
  height: 400px;
  margin: 2rem 0;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

/* Tutorial layout */
.tutorial-terminal {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  terminal-window {
    height: 300px;
  }
}
```

## Build & Deploy

```json
// package.json
{
  "scripts": {
    "start": "eleventy --serve",
    "build": "eleventy"
  }
}
```

```bash
# Development
npm start

# Production build
npm run build
```

The `_site` folder will contain:
- `/js/terminal-window/terminal-window.es.js`
- All your HTML pages with embedded terminals
