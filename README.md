# Terminal Window

[![npm version](https://badge.fury.io/js/terminal-window.svg)](https://badge.fury.io/js/terminal-window)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A vanilla JavaScript web component for simulating terminal consoles with customizable commands, themes, cursor styles, and typing effects. Perfect for tutorials, documentation, and interactive demos.

![Terminal Window Demo](https://raw.githubusercontent.com/ProfPowell/terminal-window/main/demo/screenshot.png)

## Features

- **Zero Dependencies** - Pure vanilla JavaScript web component
- **Customizable Themes** - Built-in dark and light themes, plus CSS custom properties
- **Custom Commands** - Register your own command handlers with async support
- **Typing Effect** - Typewriter-style output animation
- **ANSI Color Support** - Full support for ANSI escape codes (colors, bold, underline)
- **Virtual File System** - Optional built-in VFS with ls, cd, mkdir, touch, rm, cat
- **Persistent History** - Save command history to localStorage
- **Accessible** - ARIA labels, keyboard navigation, screen reader support
- **Copy to Clipboard** - Copy all content, commands only, or output only
- **TypeScript Support** - Full type definitions included

## Quickstart

Get running in 30 seconds:

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/terminal-window"></script>
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

[View the full Quickstart Guide](./docs/quickstart.md) | [Live Demo](https://profpowell.github.io/terminal-window/quickstart.html)

## Installation

### NPM

```bash
npm install terminal-window
```

### CDN

```html
<script type="module" src="https://unpkg.com/terminal-window"></script>
```

### Download

Download the latest release from [GitHub Releases](https://github.com/ProfPowell/terminal-window/releases).

## Framework Integration

Works with any framework! See our integration guides:

| Framework | Guide | Live Demo |
|-----------|-------|-----------|
| React | [react.md](./docs/frameworks/react.md) | [StackBlitz](https://stackblitz.com/edit/vitejs-vite-react-terminal-window) |
| Vue | [vue.md](./docs/frameworks/vue.md) | [StackBlitz](https://stackblitz.com/edit/vitejs-vite-vue-terminal-window) |
| Svelte | [svelte.md](./docs/frameworks/svelte.md) | [StackBlitz](https://stackblitz.com/edit/vitejs-vite-svelte-terminal-window) |
| Astro | [astro.md](./docs/frameworks/astro.md) | [StackBlitz](https://stackblitz.com/edit/astro-terminal-window) |
| Eleventy | [eleventy.md](./docs/frameworks/eleventy.md) | [CodeSandbox](https://codesandbox.io/s/11ty-terminal-window) |

## Basic Usage

### ES Module

```javascript
import 'terminal-window';

// The component is now registered and ready to use
```

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

// Execute a command programmatically
terminal.executeCommand('greet Developer');

// Print output
terminal.print('This is regular output');
terminal.print('This is an error', 'error');
terminal.print('This is info', 'info');
terminal.print('This is success', 'success');

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
| `font-family` | `string` | `'Consolas', 'Monaco', monospace` | Font family |
| `font-size` | `string` | `'14px'` | Font size |
| `line-height` | `string` | `'1.4'` | Line height |

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

// Command that returns null (no output)
terminal.registerCommand('silent', () => null);

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

### Content

```javascript
const content = terminal.getContent();     // Get all content as text
```

### Window Controls

```javascript
terminal.close();                          // Hide terminal
terminal.minimize();                       // Toggle minimize
terminal.toggleFullscreen();               // Toggle fullscreen
```

### Internationalization

```javascript
terminal.setI18n({
  copy: 'Copiar',
  copied: '¡Copiado!',
  commandNotFound: 'Comando no encontrado'
});
```

## Events

```javascript
// Command executed
terminal.addEventListener('command', (e) => {
  console.log('Command:', e.detail.command);
  console.log('Args:', e.detail.args);
  console.log('Input:', e.detail.input);
});

// Command completed successfully
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
  console.log('Mode:', e.detail.mode); // 'all', 'commands', 'output'
});

// Terminal closed/minimized/fullscreen
terminal.addEventListener('close', () => {});
terminal.addEventListener('minimize', (e) => {
  console.log('Minimized:', e.detail.minimized);
});
terminal.addEventListener('fullscreen', (e) => {
  console.log('Fullscreen:', e.detail.fullscreen);
});

// User pressed Ctrl+C
terminal.addEventListener('interrupt', () => {});
```

## CSS Custom Properties

Customize the appearance using CSS custom properties:

```css
terminal-window {
  /* Colors */
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-header: #0f0f23;
  --border-color: #2a2a4a;
  --text-primary: #e0e0e0;
  --text-secondary: #888;
  --prompt-color: #50fa7b;
  --cursor-color: #50fa7b;
  --command-color: #f8f8f2;
  --output-color: #e0e0e0;
  --error-color: #ff5555;
  --info-color: #8be9fd;
  --success-color: #50fa7b;

  /* Cursor */
  --cursor-width: 8px;
  --cursor-height: 1.2em;
  --cursor-blink-speed: 1s;

  /* Buttons */
  --btn-bg: #2a2a4a;
  --btn-hover: #3a3a5a;
  --btn-text: #e0e0e0;

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

Available parts: `terminal`, `header`, `controls`, `control-close`, `control-minimize`, `control-maximize`, `title`, `actions`, `theme-button`, `copy-button`, `copy-menu`, `copy-menu-item`, `body`, `output`, `input-line`, `prompt`, `input-text`, `cursor`

## Slots

```html
<terminal-window>
  <!-- Custom title -->
  <span slot="title">My Custom Terminal</span>

  <!-- Custom action buttons -->
  <button slot="actions" onclick="runScript()">Run</button>

  <!-- Content before output -->
  <div slot="before-output">
    <p>Welcome to the tutorial!</p>
  </div>
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
terminal.print('\x1b[38;5;196m256 Color\x1b[0m');
terminal.print('\x1b[38;2;255;100;0mRGB Color\x1b[0m');
```

## Browser Support

- Chrome 67+
- Firefox 63+
- Safari 13.1+
- Edge 79+

Requires support for:
- Custom Elements v1
- Shadow DOM v1
- ES Modules
- Constructable Stylesheets

## TypeScript

Type definitions are included:

```typescript
import TerminalWindow from 'terminal-window';

const terminal = document.querySelector('terminal-window') as TerminalWindow;

terminal.registerCommand('greet', (args: string[]): string => {
  return `Hello, ${args[0]}!`;
});
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Generate documentation
npm run docs
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Created by [Thomas A. Powell](https://github.com/ProfPowell)

---

**[View Demo](https://profpowell.github.io/terminal-window/)** | **[API Documentation](https://profpowell.github.io/terminal-window/docs.html)**
