/**
 * Command Examples - Command execution and custom commands
 * Includes interaction tests for verifying command behavior
 */

import { expect } from 'storybook/test';

export default {
  title: 'Examples/Commands',
  parameters: {
    docs: {
      description: {
        component: `
Demonstrates command execution and custom command registration.

## Built-in Commands
- \`help\` - List available commands
- \`clear\` - Clear terminal output
- \`echo <text>\` - Print text to output
- \`history\` - Show command history
- \`date\` - Show current date/time

## Custom Commands
Use \`registerCommand(name, handler)\` to add custom commands.
The handler receives \`(args, terminal)\` and can return a string or Promise.
        `,
      },
    },
  },
};

/**
 * Execute the built-in help command.
 * This story includes an interaction test to verify the command works.
 */
export const ExecuteHelp = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Type "help" or click play to see available commands');
    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');

    // Wait for component to initialize
    await new Promise((r) => setTimeout(r, 200));

    // Execute help command
    await terminal.executeCommand('help');

    // Verify output contains expected text
    await new Promise((r) => setTimeout(r, 100));
    const content = terminal.getContent();
    expect(content).toContain('Available commands');
  },
};

/**
 * Execute the echo command to print text.
 */
export const ExecuteEcho = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Try: echo Hello, World!');
    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');
    await new Promise((r) => setTimeout(r, 200));

    await terminal.executeCommand('echo Hello from Storybook!');

    await new Promise((r) => setTimeout(r, 100));
    const content = terminal.getContent();
    expect(content).toContain('Hello from Storybook!');
  },
};

/**
 * Register and execute a custom command.
 */
export const CustomCommand = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Custom "greet" command registered. Try: greet World');

    // Register custom command after element is in DOM
    setTimeout(() => {
      terminal.registerCommand('greet', (args) => {
        const name = args[0] || 'Stranger';
        return `Hello, ${name}! Welcome to the terminal.`;
      });
    }, 0);

    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');
    await new Promise((r) => setTimeout(r, 300));

    await terminal.executeCommand('greet Storybook');

    await new Promise((r) => setTimeout(r, 100));
    const content = terminal.getContent();
    expect(content).toContain('Hello, Storybook!');
  },
};

/**
 * Async command example - simulates a loading/processing command.
 */
export const AsyncCommand = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Try the "fetch" command - it simulates an async operation');

    setTimeout(() => {
      terminal.registerCommand('fetch', async (args) => {
        const url = args[0] || 'https://api.example.com';
        terminal.print(`Fetching ${url}...`, 'info');

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 1000));

        return `Response from ${url}:\n{ "status": "ok", "data": "..." }`;
      });
    }, 0);

    return terminal;
  },
};

/**
 * Command with ANSI color output.
 */
export const ANSIColors = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Try the "colors" command to see ANSI color support');

    setTimeout(() => {
      terminal.registerCommand('colors', () => {
        return [
          '\x1b[31mRed text\x1b[0m',
          '\x1b[32mGreen text\x1b[0m',
          '\x1b[33mYellow text\x1b[0m',
          '\x1b[34mBlue text\x1b[0m',
          '\x1b[35mMagenta text\x1b[0m',
          '\x1b[36mCyan text\x1b[0m',
          '\x1b[1mBold text\x1b[0m',
          '\x1b[4mUnderlined text\x1b[0m',
        ].join('\n');
      });
    }, 0);

    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');
    await new Promise((r) => setTimeout(r, 200));
    await terminal.executeCommand('colors');
  },
};

/**
 * Execute a sequence of commands with delays.
 */
export const CommandSequence = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Watch a demo sequence of commands...');
    terminal.setAttribute('readonly', '');

    setTimeout(async () => {
      await terminal.executeSequence(
        [
          { command: 'echo Step 1: Initialize', delay: 500 },
          { command: 'echo Step 2: Process', delay: 500 },
          { command: 'echo Step 3: Complete!', delay: 500 },
          { command: 'date', delay: 300 },
        ],
        800
      );
    }, 500);

    return terminal;
  },
};

/**
 * Command aliases - create shortcuts for common commands.
 */
export const CommandAliases = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Aliases registered: "h" for help, "c" for clear');

    setTimeout(() => {
      terminal.registerAlias('h', 'help');
      terminal.registerAlias('c', 'clear');
      terminal.registerAlias('hi', 'echo Hello!');
    }, 0);

    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');
    await new Promise((r) => setTimeout(r, 200));

    await terminal.executeCommand('hi');

    await new Promise((r) => setTimeout(r, 100));
    const content = terminal.getContent();
    expect(content).toContain('Hello!');
  },
};

/**
 * Error handling - unknown command.
 */
export const UnknownCommand = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('welcome', 'Try typing an unknown command like "foobar"');
    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');
    await new Promise((r) => setTimeout(r, 200));

    await terminal.executeCommand('unknowncommand');

    await new Promise((r) => setTimeout(r, 100));
    const content = terminal.getContent();
    expect(content).toContain('Command not found');
  },
};
