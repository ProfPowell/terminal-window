/**
 * Terminal Window Web Component
 * A vanilla JavaScript web component for simulating terminal consoles
 * @packageDocumentation
 */

export interface TerminalConfig {
  /** Color theme: "dark" or "light" */
  theme: 'dark' | 'light';
  /** Cursor shape */
  cursorStyle: 'block' | 'underline' | 'bar';
  /** Enable cursor blinking */
  cursorBlink: boolean;
  /** The command prompt text */
  prompt: string;
  /** Title displayed in the header bar */
  title: string;
  /** Show the terminal header bar */
  showHeader: boolean;
  /** Show window control buttons */
  showControls: boolean;
  /** Enable typewriter animation for output */
  typingEffect: boolean;
  /** Milliseconds per character when typing effect is enabled */
  typingSpeed: number;
  /** Disable user input (presentation mode) */
  readonly: boolean;
  /** Maximum number of output lines to keep in buffer */
  maxLines: number;
  /** Show the copy button in the header */
  showCopy: boolean;
  /** Show the theme toggle button */
  showThemeToggle: boolean;
  /** Welcome message displayed when terminal loads */
  welcome: string;
  /** Font family for terminal text */
  fontFamily: string;
  /** Font size */
  fontSize: string;
  /** Line height multiplier */
  lineHeight: string;
  /** Enable virtual file system */
  enableVfs: boolean;
  /** Persist command history to localStorage */
  persistHistory: boolean;
  /** Force typing animations even when user has prefers-reduced-motion */
  forceAnimations: boolean;
}

export interface I18nStrings {
  /** "Copy" button text */
  copy: string;
  /** "Close" button tooltip */
  close: string;
  /** "Minimize" button tooltip */
  minimize: string;
  /** "Maximize" button tooltip */
  maximize: string;
  /** "Toggle theme" button tooltip */
  toggleTheme: string;
  /** "Copy All" menu item */
  copyAll: string;
  /** "Copy Commands Only" menu item */
  copyCommandsOnly: string;
  /** "Copy Output Only" menu item */
  copyOutputOnly: string;
  /** "Copied!" feedback message */
  copied: string;
  /** "Command not found" error message */
  commandNotFound: string;
}

export interface CommandEvent extends CustomEvent {
  detail: {
    command: string;
    args: string[];
    input: string;
  };
}

export interface CommandResultEvent extends CustomEvent {
  detail: {
    command: string;
    args: string[];
    result: string | null;
  };
}

export interface CommandErrorEvent extends CustomEvent {
  detail: {
    command: string;
    error: string;
  };
}

export interface OutputEvent extends CustomEvent {
  detail: {
    type: 'output' | 'error' | 'info' | 'success' | 'command';
    content: string;
  };
}

export interface CopyEvent extends CustomEvent {
  detail: {
    text: string;
    mode: 'all' | 'commands' | 'output';
  };
}

export interface MinimizeEvent extends CustomEvent {
  detail: {
    minimized: boolean;
  };
}

export interface FullscreenEvent extends CustomEvent {
  detail: {
    fullscreen: boolean;
  };
}

export type CommandHandler = (
  args: string[],
  terminal: TerminalWindow
) => string | null | Promise<string | null>;

/**
 * Terminal Window Web Component
 *
 * @element terminal-window
 *
 * @fires command - Fired when a command is executed
 * @fires command-result - Fired after a command executes successfully
 * @fires command-error - Fired when a command fails or is not found
 * @fires output - Fired when a line is printed to the terminal
 * @fires copy - Fired when content is copied to clipboard
 * @fires close - Fired when the terminal is closed
 * @fires minimize - Fired when the terminal is minimized/restored
 * @fires fullscreen - Fired when fullscreen mode is toggled
 * @fires interrupt - Fired when user presses Ctrl+C
 *
 * @csspart terminal - Main terminal container
 * @csspart header - Terminal header bar
 * @csspart controls - Window controls container
 * @csspart control-close - Close button
 * @csspart control-minimize - Minimize button
 * @csspart control-maximize - Maximize button
 * @csspart title - Terminal title text
 * @csspart actions - Actions container
 * @csspart theme-button - Theme toggle button
 * @csspart copy-button - Copy button
 * @csspart copy-menu - Copy dropdown menu
 * @csspart copy-menu-item - Copy menu items
 * @csspart body - Terminal body (scrollable area)
 * @csspart output - Output container
 * @csspart input-line - Input line container
 * @csspart prompt - Command prompt text
 * @csspart input-text - User input text
 * @csspart cursor - Cursor element
 *
 * @slot title - Custom content for the terminal title
 * @slot actions - Custom buttons/actions before theme and copy buttons
 * @slot before-output - Content inserted before the output area
 */
export default class TerminalWindow extends HTMLElement {
  /** Current terminal configuration */
  readonly config: TerminalConfig;

  /** Static list of observed attributes */
  static readonly observedAttributes: string[];

  constructor();

  /**
   * Register a custom command handler
   * @param name - Command name (case-insensitive)
   * @param handler - Function that handles the command
   */
  registerCommand(name: string, handler: CommandHandler): void;

  /**
   * Remove a registered command
   * @param name - Command name to remove
   */
  unregisterCommand(name: string): void;

  /**
   * Create an alias for a command
   * @param alias - Alias name
   * @param command - Full command string to execute
   */
  registerAlias(alias: string, command: string): void;

  /**
   * Print a line to the terminal output
   * @param text - Text to print
   * @param type - Output type for styling
   */
  print(text: string, type?: 'output' | 'error' | 'info' | 'success' | 'command'): void;

  /**
   * Print a line with typing effect
   * @param text - Text to print
   * @param type - Output type for styling
   */
  printTyping(text: string, type?: 'output' | 'error' | 'info' | 'success'): Promise<void>;

  /**
   * Skip current typing animation
   */
  skipTypingEffect(): void;

  /**
   * Clear all terminal output
   */
  clear(): void;

  /**
   * Execute a command programmatically
   * @param input - Command string to execute
   */
  executeCommand(input: string): Promise<void>;

  /**
   * Focus the terminal input
   */
  focus(): void;

  /**
   * Scroll to the bottom of the terminal
   */
  scrollToBottom(): void;

  /**
   * Enable or disable input masking (for passwords)
   * @param masked - Whether to mask input
   */
  setInputMask(masked: boolean): void;

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void;

  /**
   * Close the terminal
   */
  close(): void;

  /**
   * Toggle minimized state
   */
  minimize(): void;

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void;

  /**
   * Set the color theme
   * @param theme - Theme to apply
   */
  setTheme(theme: 'dark' | 'light'): void;

  /**
   * Set the command prompt text
   * @param prompt - Prompt text to display
   */
  setPrompt(prompt: string): void;

  /**
   * Set the cursor style
   * @param style - Cursor style to apply
   */
  setCursorStyle(style: 'block' | 'underline' | 'bar'): void;

  /**
   * Enable or disable cursor blinking
   * @param blink - Whether cursor should blink
   */
  setCursorBlink(blink: boolean): void;

  /**
   * Enable or disable typing effect
   * @param enabled - Whether to enable typing effect
   * @param speed - Milliseconds per character
   */
  setTypingEffect(enabled: boolean, speed?: number): void;

  /**
   * Enable or disable readonly mode
   * @param readonly - Whether to enable readonly mode
   */
  setReadonly(readonly: boolean): void;

  /**
   * Force animations regardless of prefers-reduced-motion
   * @param force - Whether to force animations
   */
  setForceAnimations(force: boolean): void;

  /**
   * Check if user prefers reduced motion
   */
  hasReducedMotion(): boolean;

  /**
   * Set internationalization strings
   * @param strings - Object containing string keys to override
   */
  setI18n(strings: Partial<I18nStrings>): void;

  /**
   * Get current i18n configuration
   */
  getI18n(): I18nStrings;

  /**
   * Get command history
   */
  getHistory(): string[];

  /**
   * Set command history
   * @param history - Array of commands
   */
  setHistory(history: string[]): void;

  /**
   * Clear command history
   */
  clearHistory(): void;

  /**
   * Get all terminal content as text
   */
  getContent(): string;
}

// Ensure custom element is registered
declare global {
  interface HTMLElementTagNameMap {
    'terminal-window': TerminalWindow;
  }

  interface HTMLElementEventMap {
    'command': CommandEvent;
    'command-result': CommandResultEvent;
    'command-error': CommandErrorEvent;
    'output': OutputEvent;
    'copy': CopyEvent;
    'close': CustomEvent;
    'minimize': MinimizeEvent;
    'fullscreen': FullscreenEvent;
    'interrupt': CustomEvent;
  }
}
