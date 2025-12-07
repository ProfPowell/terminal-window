/**
 * Terminal Window - Main Stories
 * Interactive playground for the terminal-window web component
 */

// Helper to create terminal element with all attributes
const createTerminal = (args) => {
  const terminal = document.createElement('terminal-window');

  // Map args to attributes
  const attrMap = {
    theme: 'theme',
    prompt: 'prompt',
    title: 'title',
    cursorStyle: 'cursor-style',
    cursorBlink: 'cursor-blink',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    lineHeight: 'line-height',
    typingEffect: 'typing-effect',
    typingSpeed: 'typing-speed',
    showHeader: 'show-header',
    showControls: 'show-controls',
    showCopy: 'show-copy',
    showThemeToggle: 'show-theme-toggle',
    readonly: 'readonly',
    maxLines: 'max-lines',
    welcome: 'welcome',
    enableVfs: 'enable-vfs',
    persistHistory: 'persist-history',
    forceAnimations: 'force-animations',
  };

  Object.entries(args).forEach(([key, value]) => {
    const attrName = attrMap[key];
    if (!attrName) return;

    if (typeof value === 'boolean') {
      if (value) {
        terminal.setAttribute(attrName, '');
      }
    } else if (value !== undefined && value !== null) {
      terminal.setAttribute(attrName, String(value));
    }
  });

  return terminal;
};

export default {
  title: 'Components/Terminal Window',
  tags: ['autodocs'],
  render: createTerminal,
  parameters: {
    docs: {
      description: {
        component: `
A vanilla JavaScript web component for simulating terminal consoles with customizable commands, themes, cursor styles, and typing effects.

## Features
- Zero dependencies
- 20+ configurable attributes
- 30+ public methods
- Built-in VFS (Virtual File System)
- ANSI color code support
- Full keyboard accessibility

## Installation
\`\`\`html
<script type="module" src="terminal-window.js"></script>
<terminal-window theme="dark" prompt="$ "></terminal-window>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    // Theme & Appearance
    theme: {
      control: 'select',
      options: ['dark', 'light'],
      description: 'Color theme',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'dark' },
      },
    },
    cursorStyle: {
      control: 'select',
      options: ['block', 'underline', 'bar'],
      description: 'Cursor shape',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'block' },
      },
    },
    cursorBlink: {
      control: 'boolean',
      description: 'Enable cursor blinking',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'true' },
      },
    },
    fontFamily: {
      control: 'text',
      description: 'Font family for terminal text',
      table: {
        category: 'Appearance',
        defaultValue: { summary: "'Consolas', 'Monaco', monospace" },
      },
    },
    fontSize: {
      control: 'text',
      description: 'Font size',
      table: {
        category: 'Appearance',
        defaultValue: { summary: '14px' },
      },
    },
    lineHeight: {
      control: 'text',
      description: 'Line height multiplier',
      table: {
        category: 'Appearance',
        defaultValue: { summary: '1.4' },
      },
    },

    // Content
    prompt: {
      control: 'text',
      description: 'Command prompt text',
      table: {
        category: 'Content',
        defaultValue: { summary: '$ ' },
      },
    },
    title: {
      control: 'text',
      description: 'Terminal title in header',
      table: {
        category: 'Content',
        defaultValue: { summary: 'Terminal' },
      },
    },
    welcome: {
      control: 'text',
      description: 'Welcome message displayed on load',
      table: {
        category: 'Content',
        defaultValue: { summary: '' },
      },
    },

    // Typing Effect
    typingEffect: {
      control: 'boolean',
      description: 'Enable typewriter animation for output',
      table: {
        category: 'Animation',
        defaultValue: { summary: 'false' },
      },
    },
    typingSpeed: {
      control: { type: 'range', min: 10, max: 200, step: 10 },
      description: 'Milliseconds per character',
      table: {
        category: 'Animation',
        defaultValue: { summary: '30' },
      },
    },
    forceAnimations: {
      control: 'boolean',
      description: 'Override prefers-reduced-motion',
      table: {
        category: 'Animation',
        defaultValue: { summary: 'false' },
      },
    },

    // Header Options
    showHeader: {
      control: 'boolean',
      description: 'Show terminal header bar',
      table: {
        category: 'Header',
        defaultValue: { summary: 'true' },
      },
    },
    showControls: {
      control: 'boolean',
      description: 'Show window control buttons (close, minimize, maximize)',
      table: {
        category: 'Header',
        defaultValue: { summary: 'true' },
      },
    },
    showCopy: {
      control: 'boolean',
      description: 'Show copy button',
      table: {
        category: 'Header',
        defaultValue: { summary: 'true' },
      },
    },
    showThemeToggle: {
      control: 'boolean',
      description: 'Show theme toggle button',
      table: {
        category: 'Header',
        defaultValue: { summary: 'true' },
      },
    },

    // Behavior
    readonly: {
      control: 'boolean',
      description: 'Disable user input (presentation mode)',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'false' },
      },
    },
    maxLines: {
      control: { type: 'number', min: 100, max: 10000, step: 100 },
      description: 'Maximum output lines to keep',
      table: {
        category: 'Behavior',
        defaultValue: { summary: '1000' },
      },
    },

    // Features
    enableVfs: {
      control: 'boolean',
      description: 'Enable virtual file system (ls, cd, mkdir, etc.)',
      table: {
        category: 'Features',
        defaultValue: { summary: 'false' },
      },
    },
    persistHistory: {
      control: 'boolean',
      description: 'Persist command history to localStorage',
      table: {
        category: 'Features',
        defaultValue: { summary: 'false' },
      },
    },
  },
  args: {
    theme: 'dark',
    prompt: '$ ',
    title: 'Terminal',
    cursorStyle: 'block',
    cursorBlink: true,
    fontSize: '14px',
    lineHeight: '1.4',
    typingEffect: false,
    typingSpeed: 30,
    showHeader: true,
    showControls: true,
    showCopy: true,
    showThemeToggle: true,
    readonly: false,
    maxLines: 1000,
    welcome: "Welcome to Terminal Window! Type 'help' for available commands.",
    enableVfs: false,
    persistHistory: false,
    forceAnimations: false,
  },
};

// ============================================
// STORIES
// ============================================

/**
 * Default terminal with all standard settings.
 * Use the Controls panel to experiment with different configurations.
 */
export const Default = {};

/**
 * Terminal with dark theme (default).
 */
export const DarkTheme = {
  args: {
    theme: 'dark',
    welcome: 'Dark theme - the default terminal appearance.',
  },
};

/**
 * Terminal with light theme for better visibility in bright environments.
 */
export const LightTheme = {
  args: {
    theme: 'light',
    welcome: 'Light theme - great for documentation and tutorials.',
  },
};

/**
 * Block cursor (default) - classic terminal look.
 */
export const BlockCursor = {
  args: {
    cursorStyle: 'block',
    welcome: 'Block cursor style - classic terminal look.',
  },
};

/**
 * Underline cursor - subtle and modern.
 */
export const UnderlineCursor = {
  args: {
    cursorStyle: 'underline',
    welcome: 'Underline cursor style.',
  },
};

/**
 * Bar cursor - thin vertical line like modern editors.
 */
export const BarCursor = {
  args: {
    cursorStyle: 'bar',
    welcome: 'Bar cursor style - like modern code editors.',
  },
};

/**
 * Terminal with typing effect enabled.
 * Output appears character by character for a realistic terminal feel.
 */
export const WithTypingEffect = {
  args: {
    typingEffect: true,
    typingSpeed: 30,
    forceAnimations: true,
    welcome: 'Watch this message type out character by character...',
  },
};

/**
 * Terminal with Virtual File System enabled.
 * Supports ls, cd, pwd, mkdir, touch, rm, cat commands.
 */
export const WithVirtualFileSystem = {
  args: {
    enableVfs: true,
    welcome: "VFS enabled! Try commands: ls, cd, pwd, mkdir test, touch file.txt, cat file.txt",
  },
};

/**
 * Read-only terminal for presentations and documentation.
 * Users cannot type - only view output.
 */
export const ReadonlyMode = {
  args: {
    readonly: true,
    welcome: 'This terminal is in read-only mode.\nPerfect for presentations and documentation.',
  },
};

/**
 * Minimal terminal without header - just the terminal content.
 */
export const MinimalNoHeader = {
  args: {
    showHeader: false,
    welcome: 'Minimal terminal without header bar.',
  },
};

/**
 * Custom prompt styles - user@host format.
 */
export const CustomPrompt = {
  args: {
    prompt: 'user@host:~$ ',
    welcome: 'Custom prompt style like a real Linux terminal.',
  },
};

/**
 * Python-style prompt with >>>.
 */
export const PythonPrompt = {
  args: {
    prompt: '>>> ',
    title: 'Python REPL',
    welcome: 'Python-style REPL prompt.',
  },
};

/**
 * Terminal with larger font for presentations.
 */
export const LargeFont = {
  args: {
    fontSize: '18px',
    lineHeight: '1.6',
    welcome: 'Larger font size - great for presentations and demos.',
  },
};
