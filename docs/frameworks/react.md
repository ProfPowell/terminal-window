# React Integration

This guide shows how to use `terminal-window` in a React application.

## Live Demo

[Open in StackBlitz](https://stackblitz.com/edit/vitejs-vite-react-terminal-window)

## Installation

```bash
npm install terminal-window
```

## Basic Usage

```jsx
// App.jsx
import { useEffect, useRef } from 'react';
import 'terminal-window';

function App() {
  const terminalRef = useRef(null);

  useEffect(() => {
    const terminal = terminalRef.current;

    // Register a custom command
    terminal.registerCommand('react', () => {
      return 'Hello from React!';
    });
  }, []);

  return (
    <terminal-window
      ref={terminalRef}
      theme="dark"
      prompt="$ "
      welcome="React + Terminal Window. Type 'react' or 'help'."
      autofocus
    />
  );
}

export default App;
```

## Wrapper Component

For better reusability, create a wrapper component:

```jsx
// components/Terminal.jsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import 'terminal-window';

const Terminal = forwardRef(({ onCommand, onOutput, commands, ...props }, ref) => {
  const terminalRef = useRef(null);

  // Expose terminal methods to parent
  useImperativeHandle(ref, () => ({
    executeCommand: (cmd) => terminalRef.current?.executeCommand(cmd),
    print: (text, type) => terminalRef.current?.print(text, type),
    clear: () => terminalRef.current?.clear(),
    focus: () => terminalRef.current?.focus(),
  }));

  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) return;

    // Register custom commands
    if (commands) {
      Object.entries(commands).forEach(([name, handler]) => {
        terminal.registerCommand(name, handler);
      });
    }

    // Set up event listeners
    const handleCommand = (e) => onCommand?.(e.detail);
    const handleOutput = (e) => onOutput?.(e.detail);

    terminal.addEventListener('command', handleCommand);
    terminal.addEventListener('output', handleOutput);

    return () => {
      terminal.removeEventListener('command', handleCommand);
      terminal.removeEventListener('output', handleOutput);
    };
  }, [commands, onCommand, onOutput]);

  return <terminal-window ref={terminalRef} {...props} />;
});

Terminal.displayName = 'Terminal';

export default Terminal;
```

### Using the Wrapper

```jsx
// App.jsx
import { useRef } from 'react';
import Terminal from './components/Terminal';

function App() {
  const terminalRef = useRef(null);

  const commands = {
    greet: (args) => `Hello, ${args[0] || 'World'}!`,
    add: (args) => {
      const sum = args.reduce((a, b) => a + Number(b), 0);
      return `Sum: ${sum}`;
    },
  };

  const handleCommand = ({ command, args }) => {
    console.log('Command executed:', command, args);
  };

  return (
    <div className="app">
      <h1>React Terminal Demo</h1>
      <Terminal
        ref={terminalRef}
        theme="dark"
        prompt="react> "
        welcome="Welcome! Try 'greet World' or 'add 1 2 3'"
        commands={commands}
        onCommand={handleCommand}
        enable-vfs
        autofocus
      />
      <button onClick={() => terminalRef.current?.clear()}>
        Clear Terminal
      </button>
    </div>
  );
}

export default App;
```

## TypeScript Support

Add type declarations for the custom element:

```typescript
// types/terminal-window.d.ts
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'terminal-window': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          theme?: 'dark' | 'light';
          prompt?: string;
          title?: string;
          'cursor-style'?: 'block' | 'underline' | 'bar';
          'cursor-blink'?: boolean | string;
          'font-family'?: string;
          'font-size'?: string;
          'line-height'?: string;
          'typing-effect'?: boolean | string;
          'typing-speed'?: number | string;
          'show-header'?: boolean | string;
          'show-controls'?: boolean | string;
          'show-copy'?: boolean | string;
          'show-theme-toggle'?: boolean | string;
          readonly?: boolean | string;
          'max-lines'?: number | string;
          welcome?: string;
          'enable-vfs'?: boolean | string;
          'persist-history'?: boolean | string;
          autofocus?: boolean | string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
```

Add to your `tsconfig.json`:

```json
{
  "include": ["src", "types"]
}
```

## Next.js / App Router

For Next.js with the App Router, use dynamic imports to avoid SSR issues:

```jsx
// components/ClientTerminal.jsx
'use client';

import { useEffect, useRef } from 'react';

export default function ClientTerminal(props) {
  const terminalRef = useRef(null);

  useEffect(() => {
    // Import only on client side
    import('terminal-window');
  }, []);

  return <terminal-window ref={terminalRef} {...props} />;
}
```

```jsx
// app/page.jsx
import ClientTerminal from '@/components/ClientTerminal';

export default function Page() {
  return (
    <main>
      <h1>Next.js Terminal Demo</h1>
      <ClientTerminal
        theme="dark"
        prompt="next> "
        welcome="Welcome to Next.js!"
        autofocus
      />
    </main>
  );
}
```

## Styling

Use CSS to style the terminal:

```css
/* App.css */
terminal-window {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Style internal parts */
terminal-window::part(header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

terminal-window::part(body) {
  font-size: 16px;
}
```
