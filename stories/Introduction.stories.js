/**
 * Introduction - Terminal Window Component Overview
 */

export default {
  title: 'Introduction',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Terminal Window Component

A vanilla JavaScript web component for simulating terminal consoles with customizable commands, themes, cursor styles, and typing effects. Perfect for tutorials, documentation, and interactive demos.

## Features

- **Zero Dependencies** - Pure vanilla JavaScript, no framework required
- **Highly Configurable** - 20+ attributes for customization
- **Rich API** - 30+ public methods for programmatic control
- **Events** - 9 custom events for integration
- **Themeable** - 24 CSS custom properties for styling
- **Accessible** - Full keyboard navigation and screen reader support
- **VFS** - Built-in virtual file system with ls, cd, mkdir, etc.
- **ANSI Colors** - Support for ANSI escape codes
        `,
      },
    },
  },
};

/**
 * Welcome to the Terminal Window component playground!
 * Explore the sidebar to see various examples and configurations.
 */
export const Welcome = {
  render: () => {
    const container = document.createElement('div');
    container.style.cssText = `
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #e0e0e0;
    `;

    container.innerHTML = `
      <h1 style="color: #50fa7b; margin-bottom: 8px;">Terminal Window Component</h1>
      <p style="color: #8b949e; font-size: 18px; margin-bottom: 32px;">
        A vanilla JavaScript web component for simulating terminal consoles
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px;">
        <div style="background: #21222c; padding: 20px; border-radius: 8px; border: 1px solid #44475a;">
          <h3 style="color: #8be9fd; margin-top: 0;">Zero Dependencies</h3>
          <p style="color: #94a3b8; margin-bottom: 0;">Pure vanilla JavaScript, no framework required</p>
        </div>
        <div style="background: #21222c; padding: 20px; border-radius: 8px; border: 1px solid #44475a;">
          <h3 style="color: #8be9fd; margin-top: 0;">Highly Configurable</h3>
          <p style="color: #94a3b8; margin-bottom: 0;">20+ attributes for customization</p>
        </div>
        <div style="background: #21222c; padding: 20px; border-radius: 8px; border: 1px solid #44475a;">
          <h3 style="color: #8be9fd; margin-top: 0;">Rich API</h3>
          <p style="color: #94a3b8; margin-bottom: 0;">30+ public methods for programmatic control</p>
        </div>
        <div style="background: #21222c; padding: 20px; border-radius: 8px; border: 1px solid #44475a;">
          <h3 style="color: #8be9fd; margin-top: 0;">Themeable</h3>
          <p style="color: #94a3b8; margin-bottom: 0;">24 CSS custom properties for styling</p>
        </div>
      </div>

      <h2 style="color: #f8f8f2;">Quick Start</h2>
      <pre style="background: #1a1a2e; padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid #2a2a4a;"><code style="color: #50fa7b;">&lt;script type="module" src="terminal-window.js"&gt;&lt;/script&gt;

&lt;terminal-window
  theme="dark"
  prompt="$ "
  welcome="Welcome! Type 'help' for available commands."
&gt;&lt;/terminal-window&gt;</code></pre>

      <h2 style="color: #f8f8f2; margin-top: 32px;">Explore the Playground</h2>
      <p style="color: #94a3b8;">Use the sidebar to navigate through different examples:</p>
      <ul style="color: #94a3b8; line-height: 1.8;">
        <li><strong style="color: #8be9fd;">Components / Terminal Window</strong> - Interactive playground with all controls</li>
        <li><strong style="color: #8be9fd;">Examples / Themes</strong> - Dark, light, and custom CSS themes</li>
        <li><strong style="color: #8be9fd;">Examples / Commands</strong> - Command execution and custom commands</li>
        <li><strong style="color: #8be9fd;">Examples / VFS</strong> - Virtual file system demo</li>
        <li><strong style="color: #8be9fd;">Examples / Events</strong> - Event handling and integration</li>
      </ul>

      <h2 style="color: #f8f8f2; margin-top: 32px;">Live Demo</h2>
    `;

    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Welcome to the playground! Type "help" for available commands.');
    terminal.setAttribute('prompt', '$ ');
    terminal.style.marginTop = '16px';

    container.appendChild(terminal);
    return container;
  },
};

/**
 * Installation guide and usage examples.
 */
export const Installation = {
  render: () => {
    const container = document.createElement('div');
    container.style.cssText = `
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #e0e0e0;
    `;

    container.innerHTML = `
      <h1 style="color: #50fa7b;">Installation</h1>

      <h2 style="color: #f8f8f2;">NPM</h2>
      <pre style="background: #1a1a2e; padding: 16px; border-radius: 8px; border: 1px solid #2a2a4a;"><code style="color: #8be9fd;">npm install terminal-window</code></pre>

      <pre style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-top: 8px; border: 1px solid #2a2a4a;"><code style="color: #50fa7b;">import 'terminal-window';</code></pre>

      <h2 style="color: #f8f8f2; margin-top: 32px;">CDN</h2>
      <pre style="background: #1a1a2e; padding: 16px; border-radius: 8px; border: 1px solid #2a2a4a;"><code style="color: #50fa7b;">&lt;script type="module" src="https://unpkg.com/terminal-window"&gt;&lt;/script&gt;</code></pre>

      <h2 style="color: #f8f8f2; margin-top: 32px;">Basic Usage</h2>
      <pre style="background: #1a1a2e; padding: 16px; border-radius: 8px; border: 1px solid #2a2a4a;"><code style="color: #50fa7b;">&lt;terminal-window
  theme="dark"
  prompt="$ "
  title="My Terminal"
  welcome="Welcome! Type 'help' for commands."
&gt;&lt;/terminal-window&gt;</code></pre>

      <h2 style="color: #f8f8f2; margin-top: 32px;">Links</h2>
      <ul style="color: #94a3b8; line-height: 2;">
        <li><a href="https://github.com/AskYourPDF/terminal-window" style="color: #8be9fd;">GitHub Repository</a></li>
        <li><a href="https://www.npmjs.com/package/terminal-window" style="color: #8be9fd;">NPM Package</a></li>
      </ul>
    `;

    return container;
  },
};
