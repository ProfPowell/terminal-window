# &lt;terminal-window&gt;

[![npm version](https://img.shields.io/npm/v/@profpowell/terminal-window.svg)](https://www.npmjs.com/package/@profpowell/terminal-window)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A vanilla JavaScript web component for simulating terminal interfaces with typing effects, command history, and virtual filesystem support. Perfect for tutorials, documentation, and interactive demos.

## Features

- **Zero Dependencies** - Pure vanilla JavaScript web component
- **Customizable Themes** - Built-in dark and light themes, plus CSS custom properties
- **Custom Commands** - Register your own command handlers with async support
- **Typing Effect** - Typewriter-style output animation with configurable speed
- **ANSI Color Support** - Full support for ANSI escape codes (colors, bold, italic, underline)
- **Virtual File System** - Optional built-in VFS with ls, cd, mkdir, touch, rm, cat
- **In-Place Updates** - Update the last output line for progress bars and animations
- **Persistent History** - Save command history to localStorage
- **Accessible** - ARIA labels, keyboard navigation, screen reader support
- **Copy to Clipboard** - Copy all content, commands only, or output only
- **TypeScript Support** - Full type definitions included

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@profpowell/terminal-window/dist/terminal-window.js"></script>
</head>
<body>
  <terminal-window
    theme="dark"
    prompt="$ "
    welcome="Hello! Type 'help' for commands."
    enable-vfs
    autofocus
  ></terminal-window>
</body>
</html>
```

[Live Demo](https://profpowell.github.io/terminal-window/) | [API Documentation](https://profpowell.github.io/terminal-window/api.html)

## Installation

### NPM

```bash
npm install @profpowell/terminal-window
```

```javascript
import '@profpowell/terminal-window';
```

### CDN

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@profpowell/terminal-window/dist/terminal-window.js"></script>
```

## Basic Usage

### HTML

```html
<terminal-window
  title="My Terminal"
  prompt="$ "
  welcome="Welcome! Type 'help' for available commands."
  autofocus
></terminal-window>
```

### JavaScript API

```javascript
const terminal = document.querySelector('terminal-window');

// Register a custom command
terminal.registerCommand('greet', (args) => {
  return `Hello, ${args[0] || 'World'}!`;
});

// Async command with animation
terminal.registerCommand('countdown', async (args) => {
  for (let i = 5; i > 0; i--) {
    terminal.updateLastLine(`Countdown: ${i}`);
    await new Promise(r => setTimeout(r, 1000));
  }
  return 'Blast off!';
});

// Execute a command programmatically
terminal.executeCommand('greet Developer');

// Print output
terminal.print('This is regular output');
terminal.print('This is an error', 'error');

// Clear the terminal
terminal.clear();
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `theme` | `'dark' \| 'light'` | `'dark'` | Color theme |
| `prompt` | `string` | `'$ '` | Command prompt text |
| `title` | `string` | `'Terminal'` | Header title |
| `cursor-style` | `'block' \| 'underline' \| 'bar'` | `'block'` | Cursor shape |
| `cursor-blink` | `boolean` | `true` | Enable cursor blinking |
| `typing-effect` | `boolean` | `false` | Enable typewriter animation |
| `typing-speed` | `number` | `30` | Milliseconds per character |
| `force-animations` | `boolean` | `false` | Override prefers-reduced-motion |
| `readonly` | `boolean` | `false` | Disable user input |
| `max-lines` | `number` | `1000` | Maximum output lines |
| `show-header` | `boolean` | `true` | Show terminal header |
| `show-controls` | `boolean` | `true` | Show window control buttons |
| `show-copy` | `boolean` | `true` | Show copy button |
| `show-theme-toggle` | `boolean` | `true` | Show theme toggle |
| `enable-vfs` | `boolean` | `false` | Enable virtual file system |
| `persist-history` | `boolean` | `false` | Save history to localStorage |
| `welcome` | `string` | `''` | Welcome message |
| `autofocus` | `boolean` | `false` | Auto-focus terminal on mount |

## Methods

### Command Registration

```javascript
// Register a command
terminal.registerCommand('mycommand', (args, terminal) => {
  return 'Command output';
});

// Async command
terminal.registerCommand('fetch', async (args) => {
  const response = await fetch(args[0]);
  return await response.text();
});

// Unregister a command
terminal.unregisterCommand('mycommand');

// Create an alias
terminal.registerAlias('ll', 'ls -la');
```

### Output

```javascript
terminal.print('text');                    // Regular output
terminal.print('error message', 'error');  // Error (red)
terminal.print('info message', 'info');    // Info (cyan)
terminal.print('success!', 'success');     // Success (green)
terminal.updateLastLine('Updated text');   // Update last line in-place
terminal.clear();                          // Clear output
```

### Terminal Control

```javascript
terminal.setTheme('light');                // Set theme
terminal.toggleTheme();                    // Toggle theme
terminal.setPrompt('>>> ');                // Change prompt
terminal.setCursorStyle('underline');      // Change cursor
terminal.setCursorBlink(false);            // Disable blink
terminal.setTypingEffect(true, 50);        // Enable typing effect
terminal.setForceAnimations(true);         // Override reduced motion
terminal.skipTypingEffect();               // Skip current typing animation
terminal.setReadonly(true);                // Enable readonly mode
terminal.focus();                          // Focus input
terminal.scrollToBottom();                 // Scroll to bottom
```

### History

```javascript
const history = terminal.getHistory();     // Get history array
terminal.setHistory(['cmd1', 'cmd2']);     // Set history
terminal.clearHistory();                   // Clear history
```

## Events

```javascript
// Command executed
terminal.addEventListener('command', (e) => {
  console.log('Command:', e.detail.command);
  console.log('Args:', e.detail.args);
});

// Command completed
terminal.addEventListener('command-result', (e) => {
  console.log('Result:', e.detail.result);
});

// Command failed
terminal.addEventListener('command-error', (e) => {
  console.log('Error:', e.detail.error);
});

// Content copied
terminal.addEventListener('copy', (e) => {
  console.log('Copied:', e.detail.text);
});
```

## CSS Custom Properties

Customize the appearance using CSS custom properties:

```css
terminal-window {
  /* Colors */
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --text-primary: #e0e0e0;
  --prompt-color: #50fa7b;
  --cursor-color: #50fa7b;
  --error-color: #ff5555;
  --info-color: #8be9fd;
  --success-color: #50fa7b;

  /* Cursor */
  --cursor-blink-speed: 1s;

  /* Window controls */
  --control-close: #ff5f56;
  --control-minimize: #ffbd2e;
  --control-maximize: #27c93f;
}
```

## CSS Parts

Style internal elements using `::part()`:

```css
terminal-window::part(header) {
  background: linear-gradient(90deg, #1a1a2e, #16213e);
}

terminal-window::part(prompt) {
  color: #ff79c6;
}

terminal-window::part(cursor) {
  background: #ff79c6;
}
```

Available parts: `terminal`, `header`, `controls`, `title`, `body`, `output`, `input-line`, `prompt`, `cursor`

## Vanilla Breeze integration

`<terminal-window>` is design-token-aware. When a parent page sets vanilla-breeze tokens, the terminal picks them up automatically; explicit `--terminal-window-*` overrides always win.

### Theme resolution

The color mode is resolved in priority order:

1. `mode="dark"` or `mode="light"` attribute (canonical)
2. `theme="dark"` or `theme="light"` attribute (backwards-compatible alias)
3. Page-level signal on `<html>` or `<body>`: `class="dark"`, `data-theme`, `data-bs-theme`, `data-mode`, computed `color-scheme`
4. OS `@media (prefers-color-scheme: dark)`
5. `light` as final fallback

A built-in `MutationObserver` updates the terminal reactively when any page-level signal changes.

### Tokens consumed

Set these on a parent element (e.g. `:root` or a vanilla-breeze theme scope) and the terminal picks them up:

| vb token | Used for |
|---|---|
| `--color-surface` | Terminal body background |
| `--color-surface-raised` | Header and section backgrounds |
| `--color-border` | Borders |
| `--color-text` | Primary text |
| `--color-text-muted` | Muted text (timestamps, labels) |
| `--radius-m` | Outer border radius |
| `--radius-s` | Inner element radius |
| `--font-mono` | Default monospace font family |

### Public override surface

43 CSS custom properties prefixed `--terminal-window-*` let you override any slot directly. The override always wins over the vb token. Groups:

- **Chrome:** `--terminal-window-bg`, `--terminal-window-header-bg`, `--terminal-window-secondary-bg`, `--terminal-window-border-color`, `--terminal-window-text-color`, `--terminal-window-text-muted`, `--terminal-window-text-secondary`, `--terminal-window-border-radius`, `--terminal-window-inner-radius`, `--terminal-window-font-family`
- **Terminal text:** `--terminal-window-prompt-color`, `--terminal-window-cursor-color`, `--terminal-window-command-color`, `--terminal-window-output-color`, `--terminal-window-error-color`, `--terminal-window-info-color`, `--terminal-window-success-color`, `--terminal-window-selection-bg`
- **Scrollbar:** `--terminal-window-scrollbar-{track,thumb,thumb-hover}`
- **Buttons:** `--terminal-window-btn-{bg,hover-bg,text}`
- **Window controls (theme-invariant):** `--terminal-window-control-{close,minimize,maximize}`
- **ANSI 16:** `--terminal-window-ansi-{black,red,green,yellow,blue,magenta,cyan,white}` plus `--terminal-window-ansi-bright-*`

### Example

```html
<style>
  :root {
    --color-surface: #0d1117;
    --color-text: #c9d1d9;
    --color-border: #30363d;
  }
</style>
<terminal-window mode="dark">
  $ npm test
</terminal-window>
```

## Built-in Commands

- `help` - Display available commands
- `clear` - Clear terminal output
- `echo [text]` - Print text
- `history` - Show command history

### VFS Commands (when `enable-vfs="true"`)

- `ls [path]` - List directory contents
- `cd [path]` - Change directory
- `pwd` - Print working directory
- `mkdir [name]` - Create directory
- `touch [name]` - Create file
- `rm [name]` - Remove file/directory
- `cat [file]` - Display file contents

## ANSI Color Support

The terminal supports ANSI escape codes:

```javascript
terminal.print('\x1b[31mRed text\x1b[0m');
terminal.print('\x1b[1mBold\x1b[0m');
terminal.print('\x1b[32;1mBold Green\x1b[0m');
```

## Browser Support

- Chrome 67+
- Firefox 63+
- Safari 13.1+
- Edge 79+

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## Related Components

- [&lt;browser-window&gt;](https://profpowell.github.io/browser-window/) - Browser chrome wrapper
- [&lt;code-block&gt;](https://profpowell.github.io/code-block/) - Syntax highlighted code
- [&lt;browser-console&gt;](https://profpowell.github.io/browser-console/) - DevTools console simulation

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Created by [Thomas A. Powell](https://github.com/ProfPowell)

---

**[Live Demo](https://profpowell.github.io/terminal-window/)** | **[API Documentation](https://profpowell.github.io/terminal-window/api.html)** | **[GitHub](https://github.com/ProfPowell/terminal-window)**
