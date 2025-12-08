import { useEffect, useRef } from 'react';
import 'terminal-window';

export default function App() {
  const terminalRef = useRef(null);

  useEffect(() => {
    const terminal = terminalRef.current;

    // Register custom commands
    terminal.registerCommand('react', () => {
      return 'Hello from React! This terminal is rendered in a React app.';
    });

    terminal.registerCommand('useState', () => {
      return 'const [count, setCount] = useState(0);';
    });

    terminal.registerCommand('useEffect', () => {
      return "useEffect(() => {\n  terminal.registerCommand('cmd', handler);\n}, []);";
    });

    terminal.registerCommand('demo', () => {
      return 'Try these commands: react, useState, useEffect, help';
    });
  }, []);

  const handleCommand = (event) => {
    console.log('Command executed:', event.detail);
  };

  return (
    <div>
      <h1 style={{ color: '#fff', marginBottom: '1rem' }}>
        Terminal Window + React
      </h1>
      <p style={{ color: '#888', marginBottom: '1.5rem' }}>
        A web component terminal running in a React application. Type{' '}
        <code style={{ color: '#ff79c6' }}>demo</code> to see available commands.
      </p>
      <terminal-window
        ref={terminalRef}
        theme="dark"
        prompt="react> "
        welcome="React + Terminal Window Demo. Type 'demo' for commands."
        cursor-style="block"
        cursor-blink
        onCommand={handleCommand}
        autofocus
      />
    </div>
  );
}
