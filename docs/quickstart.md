# Quickstart Guide

Get `terminal-window` running in under 2 minutes.

## 1. Include the Component

### Option A: CDN (Fastest)

```html
<script type="module" src="https://unpkg.com/terminal-window"></script>
```

### Option B: npm

```bash
npm install terminal-window
```

```javascript
import 'terminal-window';
```

## 2. Add to Your Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>Terminal Window Demo</title>
  <script type="module" src="https://unpkg.com/terminal-window"></script>
</head>
<body>
  <terminal-window
    title="Hello Terminal"
    welcome="Ready to run commands!"
    enable-vfs="true"
    autofocus
  ></terminal-window>

  <script type="module">
    const terminal = document.querySelector('terminal-window');

    // Wait for component to be defined
    await customElements.whenDefined('terminal-window');

    // Pre-populate the VFS with a greeting file
    terminal.fileSystem.writeFile('/greeting.txt',
      'Hopefully I am useful web component for you if you are building educational materials or demos!');

    // Execute the demo commands
    terminal.executeCommand('echo "hello world I am a fun terminal simulator"');
    terminal.executeCommand('cat /greeting.txt');
  </script>
</body>
</html>
```

## 3. Try It Out

Type `help` to see available commands, or try:

- `ls` - List files in the virtual file system
- `cat /greeting.txt` - Read the greeting file
- `echo "Hello!"` - Print text to the terminal
- `clear` - Clear the terminal

## Next Steps

- [API Reference](https://profpowell.github.io/terminal-window/docs.html) - Full attribute and method documentation
- [Examples](https://profpowell.github.io/terminal-window/examples/unix.html) - Real-world usage examples
- [Storybook Playground](https://profpowell.github.io/terminal-window/storybook/) - Interactive component explorer
- [Framework Guides](./frameworks/README.md) - React, Vue, Svelte, Astro, 11ty integration

## Common Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `theme` | Color theme: "dark" or "light" | `dark` |
| `prompt` | Command prompt text | `$ ` |
| `title` | Header title | `Terminal` |
| `enable-vfs` | Enable virtual file system | `false` |
| `readonly` | Disable user input | `false` |
| `autofocus` | Auto-focus on mount | `false` |
| `typing-effect` | Typewriter animation | `false` |

## Register Custom Commands

```javascript
const terminal = document.querySelector('terminal-window');

// Simple command
terminal.registerCommand('hello', () => 'Hello, World!');

// Command with arguments
terminal.registerCommand('greet', (args) => `Hello, ${args[0] || 'stranger'}!`);

// Async command
terminal.registerCommand('fetch-data', async () => {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  return JSON.stringify(data, null, 2);
});
```
