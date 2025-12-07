/**
 * Virtual File System Examples
 * Demonstrates the built-in VFS with ls, cd, mkdir, touch, cat, rm commands
 */

import { expect } from 'storybook/test';

export default {
  title: 'Examples/VFS',
  parameters: {
    docs: {
      description: {
        component: `
The Virtual File System (VFS) provides a simulated file system within the terminal.

## Enable VFS
\`\`\`html
<terminal-window enable-vfs></terminal-window>
\`\`\`

## Available Commands
- \`ls [path]\` - List directory contents
- \`cd <path>\` - Change directory
- \`pwd\` - Print working directory
- \`mkdir <name>\` - Create directory
- \`touch <file>\` - Create empty file
- \`cat <file>\` - Display file contents
- \`rm <path>\` - Remove file or directory

## Initial Structure
\`\`\`
/
├── home/
│   └── user/
│       └── documents/
├── var/
│   └── log/
└── tmp/
\`\`\`
        `,
      },
    },
  },
};

/**
 * VFS enabled terminal with default file structure.
 */
export const Default = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('enable-vfs', '');
    terminal.setAttribute('welcome', 'VFS enabled! Try: ls, cd home, pwd, mkdir test');
    return terminal;
  },
};

/**
 * List directory contents with ls command.
 */
export const ListDirectory = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('enable-vfs', '');
    terminal.setAttribute('welcome', 'Listing root directory contents...');
    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');
    await new Promise((r) => setTimeout(r, 200));

    await terminal.executeCommand('ls');

    await new Promise((r) => setTimeout(r, 100));
    const content = terminal.getContent();
    expect(content).toContain('home');
    expect(content).toContain('var');
    expect(content).toContain('tmp');
  },
};

/**
 * Navigate directories with cd and pwd.
 */
export const NavigateDirectories = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('enable-vfs', '');
    terminal.setAttribute('welcome', 'Navigate using cd and pwd...');
    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');
    await new Promise((r) => setTimeout(r, 200));

    // Show current directory
    await terminal.executeCommand('pwd');
    await new Promise((r) => setTimeout(r, 50));

    // Change to home
    await terminal.executeCommand('cd home/user');
    await new Promise((r) => setTimeout(r, 50));

    // Show new directory
    await terminal.executeCommand('pwd');
    await new Promise((r) => setTimeout(r, 50));

    // Go back
    await terminal.executeCommand('cd ..');
    await terminal.executeCommand('pwd');

    await new Promise((r) => setTimeout(r, 100));
    const content = terminal.getContent();
    expect(content).toContain('/home/user');
    expect(content).toContain('/home');
  },
};

/**
 * Create directories with mkdir.
 */
export const CreateDirectory = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('enable-vfs', '');
    terminal.setAttribute('welcome', 'Creating a new directory...');
    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');
    await new Promise((r) => setTimeout(r, 200));

    // Create directory
    await terminal.executeCommand('mkdir projects');
    await new Promise((r) => setTimeout(r, 50));

    // Verify it exists
    await terminal.executeCommand('ls');

    await new Promise((r) => setTimeout(r, 100));
    const content = terminal.getContent();
    expect(content).toContain('projects');
  },
};

/**
 * Create and read files with touch and cat.
 */
export const CreateAndReadFiles = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('enable-vfs', '');
    terminal.setAttribute('welcome', 'Creating and reading files...');
    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');
    await new Promise((r) => setTimeout(r, 200));

    // Create a file
    await terminal.executeCommand('touch readme.txt');
    await new Promise((r) => setTimeout(r, 50));

    // List to see file
    await terminal.executeCommand('ls');
    await new Promise((r) => setTimeout(r, 50));

    // Read file (will be empty)
    await terminal.executeCommand('cat readme.txt');

    await new Promise((r) => setTimeout(r, 100));
    const content = terminal.getContent();
    expect(content).toContain('readme.txt');
  },
};

/**
 * Remove files and directories with rm.
 */
export const RemoveFiles = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('enable-vfs', '');
    terminal.setAttribute('welcome', 'Creating then removing files...');
    return terminal;
  },
  play: async ({ canvasElement }) => {
    const terminal = canvasElement.querySelector('terminal-window');
    await new Promise((r) => setTimeout(r, 200));

    // Create a file
    await terminal.executeCommand('touch temp.txt');
    await new Promise((r) => setTimeout(r, 50));

    // Verify it exists
    await terminal.executeCommand('ls');
    await new Promise((r) => setTimeout(r, 50));

    // Remove it
    await terminal.executeCommand('rm temp.txt');
    await new Promise((r) => setTimeout(r, 50));

    // Verify it's gone
    await terminal.executeCommand('ls');

    await new Promise((r) => setTimeout(r, 100));
    // After rm, temp.txt should not appear in the last ls output
  },
};

/**
 * Full workflow - navigate, create, and manage files.
 */
export const FullWorkflow = {
  render: () => {
    const terminal = document.createElement('terminal-window');
    terminal.setAttribute('enable-vfs', '');
    terminal.setAttribute('welcome', 'Watch a complete file management workflow...');
    terminal.setAttribute('readonly', '');

    setTimeout(async () => {
      await terminal.executeSequence(
        [
          { command: 'pwd', delay: 300 },
          { command: 'ls', delay: 400 },
          { command: 'cd home/user', delay: 300 },
          { command: 'pwd', delay: 300 },
          { command: 'mkdir projects', delay: 400 },
          { command: 'cd projects', delay: 300 },
          { command: 'touch app.js', delay: 400 },
          { command: 'touch readme.md', delay: 400 },
          { command: 'ls', delay: 400 },
          { command: 'cat readme.md', delay: 300 },
          { command: 'cd /', delay: 300 },
          { command: 'pwd', delay: 300 },
        ],
        600
      );
    }, 500);

    return terminal;
  },
};
