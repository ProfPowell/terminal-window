/**
 * Events Examples - Event handling and integration
 * Demonstrates all custom events fired by the terminal
 */

export default {
  title: 'Examples/Events',
  parameters: {
    docs: {
      description: {
        component: `
The terminal fires several custom events for integration with your application.

## Available Events

### Command Events
- \`command\` - Fired when a command is executed. Detail: \`{ command, args, input }\`
- \`command-result\` - Fired after successful execution. Detail: \`{ command, args, result }\`
- \`command-error\` - Fired when a command fails. Detail: \`{ command, error }\`

### Output Events
- \`output\` - Fired when text is printed. Detail: \`{ type, content }\`
- \`copy\` - Fired when content is copied. Detail: \`{ text, mode }\`

### UI Events
- \`interrupt\` - Fired when Ctrl+C is pressed
- \`close\` - Fired when close button is clicked
- \`minimize\` - Fired when minimized/restored. Detail: \`{ minimized }\`
- \`fullscreen\` - Fired when fullscreen toggled. Detail: \`{ fullscreen }\`

## Usage
\`\`\`javascript
terminal.addEventListener('command', (e) => {
  console.log('Command:', e.detail.command);
  console.log('Args:', e.detail.args);
});
\`\`\`
        `,
      },
    },
  },
};

// Helper to create an event logger panel
const createEventLogger = () => {
  const container = document.createElement('div');
  container.style.cssText = 'display: grid; grid-template-columns: 1fr 300px; gap: 16px; height: 100%;';

  const terminal = document.createElement('terminal-window');
  terminal.setAttribute('welcome', 'Type commands and watch events in the log panel →');

  const logPanel = document.createElement('div');
  logPanel.style.cssText = `
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 8px;
    padding: 12px;
    font-family: 'Consolas', monospace;
    font-size: 12px;
    color: #e0e0e0;
    overflow-y: auto;
  `;
  logPanel.innerHTML = '<div style="color: #888; margin-bottom: 8px;">Event Log:</div>';

  const logEvent = (name, detail) => {
    const entry = document.createElement('div');
    entry.style.cssText = 'margin-bottom: 8px; padding: 6px; background: rgba(255,255,255,0.05); border-radius: 4px;';
    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `
      <div style="color: #50fa7b;">${name}</div>
      <div style="color: #888; font-size: 10px;">${timestamp}</div>
      <pre style="color: #8be9fd; font-size: 11px; margin: 4px 0 0; white-space: pre-wrap;">${JSON.stringify(detail, null, 2)}</pre>
    `;
    logPanel.appendChild(entry);
    logPanel.scrollTop = logPanel.scrollHeight;
  };

  // Add event listeners
  terminal.addEventListener('command', (e) => logEvent('command', e.detail));
  terminal.addEventListener('command-result', (e) => logEvent('command-result', e.detail));
  terminal.addEventListener('command-error', (e) => logEvent('command-error', e.detail));
  terminal.addEventListener('output', (e) => logEvent('output', e.detail));
  terminal.addEventListener('copy', (e) => logEvent('copy', e.detail));
  terminal.addEventListener('interrupt', () => logEvent('interrupt', {}));
  terminal.addEventListener('close', () => logEvent('close', {}));
  terminal.addEventListener('minimize', (e) => logEvent('minimize', e.detail));
  terminal.addEventListener('fullscreen', (e) => logEvent('fullscreen', e.detail));

  container.appendChild(terminal);
  container.appendChild(logPanel);

  return container;
};

/**
 * Event logger - see all events as you interact with the terminal.
 */
export const EventLogger = {
  render: createEventLogger,
  parameters: {
    layout: 'fullscreen',
  },
};

/**
 * Command event - fired when any command is executed.
 */
export const CommandEvent = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Type any command to see the "command" event in console');

    terminal.addEventListener('command', (e) => {
      console.log('Command Event:', e.detail);
      terminal.print(`[Event] command: "${e.detail.command}" with args: [${e.detail.args.join(', ')}]`, 'info');
    });

    return terminal;
  },
};

/**
 * Command result event - fired after successful command execution.
 */
export const CommandResultEvent = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Try "help" or "date" to see command-result event');

    terminal.addEventListener('command-result', (e) => {
      console.log('Command Result:', e.detail);
      terminal.print(`[Event] command-result: success`, 'success');
    });

    return terminal;
  },
};

/**
 * Command error event - fired when command fails.
 */
export const CommandErrorEvent = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Type an unknown command to trigger error event');

    terminal.addEventListener('command-error', (e) => {
      console.log('Command Error:', e.detail);
      terminal.print(`[Event] command-error caught`, 'info');
    });

    return terminal;
  },
};

/**
 * Output event - fired whenever text is printed.
 */
export const OutputEvent = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Every line printed triggers the "output" event');

    let outputCount = 0;
    terminal.addEventListener('output', (e) => {
      outputCount++;
      console.log(`Output #${outputCount}:`, e.detail);
    });

    return terminal;
  },
};

/**
 * Copy event - fired when content is copied to clipboard.
 */
export const CopyEvent = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Use the copy button to trigger the "copy" event');

    terminal.addEventListener('copy', (e) => {
      console.log('Copy Event:', e.detail);
      terminal.print(`[Event] Copied ${e.detail.text.length} characters (mode: ${e.detail.mode})`, 'info');
    });

    return terminal;
  },
};

/**
 * Interrupt event - fired when Ctrl+C is pressed.
 */
export const InterruptEvent = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Press Ctrl+C to trigger the "interrupt" event');

    terminal.addEventListener('interrupt', () => {
      console.log('Interrupt Event');
      terminal.print('[Event] Interrupt signal received (Ctrl+C)', 'info');
    });

    return terminal;
  },
};

/**
 * Window control events - close, minimize, fullscreen.
 */
export const WindowControlEvents = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Click window controls to see events');

    terminal.addEventListener('close', () => {
      console.log('Close Event');
      // Prevent actual close for demo
      terminal.style.display = 'block';
      setTimeout(() => {
        terminal.print('[Event] close - terminal would be hidden', 'info');
      }, 100);
    });

    terminal.addEventListener('minimize', (e) => {
      console.log('Minimize Event:', e.detail);
      terminal.print(`[Event] minimize - minimized: ${e.detail.minimized}`, 'info');
    });

    terminal.addEventListener('fullscreen', (e) => {
      console.log('Fullscreen Event:', e.detail);
      terminal.print(`[Event] fullscreen - fullscreen: ${e.detail.fullscreen}`, 'info');
    });

    return terminal;
  },
};
