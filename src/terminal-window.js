import { AnsiParser } from './internals/ansi-parser.js';
import { CommandRegistry } from './internals/command-registry.js';
import { HistoryManager } from './internals/history-manager.js';
import { VirtualFileSystem } from './internals/file-system.js';
import { styles } from './styles.js';

/**
 * A vanilla JavaScript web component that simulates a terminal console with
 * customizable commands, themes, cursor styles, and typing effects.
 *
 * @element terminal-window
 * @tagname terminal-window
 *
 * @attr {string} [theme=dark] - Color theme: "dark" or "light"
 * @attr {string} [prompt="$ "] - The command prompt text
 * @attr {string} [title=Terminal] - Title displayed in the header bar
 * @attr {string} [cursor-style=block] - Cursor shape: "block", "underline", or "bar"
 * @attr {boolean} [cursor-blink=true] - Enable cursor blinking
 * @attr {string} [font-family='Consolas', 'Monaco', monospace] - Font family for terminal text
 * @attr {string} [font-size=14px] - Font size (e.g., "14px", "1rem")
 * @attr {string} [line-height=1.4] - Line height multiplier
 * @attr {boolean} [typing-effect=false] - Enable typewriter animation for output
 * @attr {number} [typing-speed=30] - Milliseconds per character when typing effect is enabled
 * @attr {boolean} [show-header=true] - Show the terminal header bar
 * @attr {boolean} [show-controls=true] - Show window control buttons (close, minimize, maximize)
 * @attr {boolean} [show-copy=true] - Show the copy button in the header
 * @attr {boolean} [show-theme-toggle=true] - Show the theme toggle button
 * @attr {boolean} [readonly=false] - Disable user input (presentation mode)
 * @attr {number} [max-lines=1000] - Maximum number of output lines to keep in buffer
 * @attr {string} [welcome] - Welcome message displayed when terminal loads
 * @attr {boolean} [enable-vfs=false] - Enable virtual file system with built-in commands (ls, cd, pwd, mkdir, touch, rm, cat)
 * @attr {boolean} [persist-history=false] - Persist command history to localStorage across sessions
 * @attr {boolean} [force-animations=false] - Force typing animations even when user has prefers-reduced-motion set
 *
 * @fires {CustomEvent} command - Fired when a command is executed. Detail: { command, args, input }
 * @fires {CustomEvent} command-result - Fired after a command executes successfully. Detail: { command, args, result }
 * @fires {CustomEvent} command-error - Fired when a command fails or is not found. Detail: { command, error }
 * @fires {CustomEvent} output - Fired when a line is printed to the terminal. Detail: { type, content }
 * @fires {CustomEvent} copy - Fired when content is copied to clipboard. Detail: { text, mode }
 * @fires {CustomEvent} close - Fired when the terminal is closed via the close button
 * @fires {CustomEvent} minimize - Fired when the terminal is minimized/restored. Detail: { minimized }
 * @fires {CustomEvent} fullscreen - Fired when fullscreen mode is toggled. Detail: { fullscreen }
 * @fires {CustomEvent} interrupt - Fired when user presses Ctrl+C
 *
 * @csspart terminal - Main terminal container
 * @csspart header - Terminal header bar
 * @csspart controls - Window controls container (close, minimize, maximize)
 * @csspart control-close - Close button
 * @csspart control-minimize - Minimize button
 * @csspart control-maximize - Maximize button
 * @csspart title - Terminal title text
 * @csspart actions - Actions container (theme toggle, copy)
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
 * @slot title - Custom content for the terminal title in the header
 * @slot actions - Custom buttons/actions before the theme and copy buttons
 * @slot before-output - Content inserted before the output area in the terminal body
 *
 * @cssprop [--bg-primary=#1a1a2e] - Primary background color
 * @cssprop [--bg-secondary=#16213e] - Secondary background color
 * @cssprop [--bg-header=#0f0f23] - Header background color
 * @cssprop [--border-color=#2a2a4a] - Border color
 * @cssprop [--text-primary=#e0e0e0] - Primary text color
 * @cssprop [--text-secondary=#888] - Secondary text color
 * @cssprop [--prompt-color=#50fa7b] - Prompt color
 * @cssprop [--cursor-color=#50fa7b] - Cursor color
 * @cssprop [--command-color=#f8f8f2] - Command text color
 * @cssprop [--output-color=#e0e0e0] - Output text color
 * @cssprop [--error-color=#ff5555] - Error text color
 * @cssprop [--info-color=#8be9fd] - Info text color
 * @cssprop [--success-color=#50fa7b] - Success text color
 * @cssprop [--cursor-width=8px] - Cursor width
 * @cssprop [--cursor-height=1.2em] - Cursor height
 * @cssprop [--cursor-blink-speed=1s] - Cursor blink animation speed
 * @cssprop [--btn-bg=#2a2a4a] - Button background color
 * @cssprop [--btn-hover=#3a3a5a] - Button hover background color
 * @cssprop [--btn-text=#e0e0e0] - Button text color
 * @cssprop [--control-close=#ff5f56] - Close button color
 * @cssprop [--control-minimize=#ffbd2e] - Minimize button color
 * @cssprop [--control-maximize=#27c93f] - Maximize button color
 *
 * @example
 * <terminal-window
 *   theme="dark"
 *   prompt="$ "
 *   title="My Terminal"
 *   welcome="Welcome! Type 'help' for commands."
 * ></terminal-window>
 *
 * @example
 * // JavaScript API usage
 * const terminal = document.querySelector('terminal-window');
 * terminal.print('Hello, World!');
 * terminal.executeCommand('help');
 * terminal.registerCommand('greet', (args) => `Hello, ${args[0] || 'stranger'}!`);
 */
class TerminalWindow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Adopt styles
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    this.shadowRoot.adoptedStyleSheets = [sheet];

    // Initialize internal modules
    this.ansiParser = new AnsiParser();
    this.commandRegistry = new CommandRegistry();
    this.historyManager = new HistoryManager();
    this.fileSystem = new VirtualFileSystem();

    // Output lines for the terminal
    this.outputLines = [];

    // Current input value
    this.currentInput = '';

    // Input masking (for password prompts)
    this.inputMasked = false;

    // Fullscreen state
    this.isFullscreen = false;

    // Minimized state
    this.isMinimized = false;

    // Track handlers and timeouts for cleanup
    this._fullscreenEscHandler = null;
    this._copyMenuCloseHandler = null;
    this._copyFeedbackTimeout = null;
    this._announceTimeout = null;

    // Copy menu state
    this._copyMenuOpen = false;
    this._copyMenuFocusIndex = -1;

    // Auto-scroll state (smart scroll behavior)
    this._autoScroll = true;
    this._scrollThreshold = 50; // pixels from bottom to consider "at bottom"

    // Typing effect state
    this._typingInProgress = false;
    this._typingCancelled = false;
    this._typingQueue = [];

    // Configuration with defaults
    this.config = {
      theme: 'dark',
      prompt: '$ ',
      cursorStyle: 'block', // block, underline, bar
      cursorBlink: true,
      fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
      fontSize: '14px',
      lineHeight: '1.4',
      typingEffect: false,
      typingSpeed: 30, // ms per character
      // Header options
      showHeader: true,
      title: 'Terminal',
      showControls: true,
      showCopy: true,
      showThemeToggle: true,
      // Behavior options
      readonly: false,
      maxLines: 1000,
      // Features
      enableVfs: false,
      persistHistory: false,
      // Accessibility
      forceAnimations: false, // Override prefers-reduced-motion (for testing only)
    };

    // Default i18n strings (can be overridden via setI18n)
    this._i18n = {
      // Button labels
      copy: 'Copy',
      close: 'Close',
      minimize: 'Minimize',
      maximize: 'Maximize',
      exitFullscreen: 'Exit fullscreen',
      toggleFullscreen: 'Toggle fullscreen',
      toggleTheme: 'Toggle theme',
      switchToLight: 'switch to light',
      switchToDark: 'switch to dark',
      // Copy menu
      copyAll: 'Copy All',
      copyCommandsOnly: 'Copy Commands Only',
      copyOutputOnly: 'Copy Output Only',
      copyOptions: 'Copy options',
      copied: 'Copied!',
      nothingToCopy: 'Nothing to copy',
      noSelection: 'No selection',
      // Announcements
      terminalReady: 'Terminal ready',
      terminalCleared: 'Terminal cleared',
      terminalClosed: 'Terminal closed',
      terminalMinimized: 'Terminal minimized',
      terminalRestored: 'Terminal restored',
      enteredFullscreen: 'Entered fullscreen mode',
      exitedFullscreen: 'Exited fullscreen mode',
      themeChangedTo: 'Theme changed to',
      copiedToClipboard: 'copied to clipboard',
      content: 'Content',
      // Built-in commands
      availableCommands: 'Available commands:',
      noCommandsInHistory: 'No commands in history.',
      commandNotFound: 'Command not found:',
      typeHelpForCommands: "Type 'help' for available commands.",
      // Input
      terminalInputLabel: 'Terminal input. Type a command and press Enter.',
      terminalOutput: 'Terminal output',
    };

    // Register built-in commands
    this._registerBuiltInCommands();

    this.render();
  }

  connectedCallback() {
    // Apply attributes
    this._applyAttributes();
    this._setupEventListeners();

    if (this.config.enableVfs) {
      this._registerVfsCommands();
    }

    // Only auto-focus if explicitly requested via autofocus attribute
    // This prevents focus stealing in contexts like Storybook or pages with other interactive elements
    if (!this.config.readonly && this.hasAttribute('autofocus')) {
      this._focusInput();
    }

    // Show welcome message if provided
    const welcome = this.getAttribute('welcome');
    if (welcome) {
      this.print(welcome);
    }

    // Announce to screen readers
    this._announce(this._t('terminalReady'));
  }

  disconnectedCallback() {
    // Remove document-level event listeners
    if (this._fullscreenEscHandler) {
      document.removeEventListener('keydown', this._fullscreenEscHandler);
      this._fullscreenEscHandler = null;
    }

    if (this._copyMenuCloseHandler) {
      document.removeEventListener('click', this._copyMenuCloseHandler);
      this._copyMenuCloseHandler = null;
    }

    // Clear any pending timeouts
    if (this._copyFeedbackTimeout) {
      clearTimeout(this._copyFeedbackTimeout);
      this._copyFeedbackTimeout = null;
    }

    if (this._announceTimeout) {
      clearTimeout(this._announceTimeout);
      this._announceTimeout = null;
    }
  }

  static get observedAttributes() {
    return [
      'theme', 'prompt', 'cursor-style', 'cursor-blink',
      'font-family', 'font-size', 'line-height',
      'typing-effect', 'typing-speed',
      'show-header', 'title', 'show-controls', 'show-copy', 'show-theme-toggle',
      'readonly', 'max-lines', 'enable-vfs', 'persist-history', 'force-animations'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'theme':
        this.config.theme = newValue || 'dark';
        break;
      case 'prompt':
        this.config.prompt = newValue || '$ ';
        break;
      case 'cursor-style':
        this.config.cursorStyle = newValue || 'block';
        break;
      case 'cursor-blink':
        this.config.cursorBlink = newValue !== 'false';
        break;
      case 'font-family':
        this.config.fontFamily = newValue || this.config.fontFamily;
        break;
      case 'font-size':
        this.config.fontSize = newValue || '14px';
        break;
      case 'line-height':
        this.config.lineHeight = newValue || '1.4';
        break;
      case 'typing-effect':
        this.config.typingEffect = newValue === 'true';
        break;
      case 'typing-speed':
        this.config.typingSpeed = parseInt(newValue) || 30;
        break;
      case 'show-header':
        this.config.showHeader = newValue !== 'false';
        this._updateHeaderVisibility();
        break;
      case 'title':
        this.config.title = newValue || 'Terminal';
        this._updateTitle();
        break;
      case 'show-controls':
        this.config.showControls = newValue !== 'false';
        this._updateControlsVisibility();
        break;
      case 'show-copy':
        this.config.showCopy = newValue !== 'false';
        this._updateCopyVisibility();
        break;
      case 'show-theme-toggle':
        this.config.showThemeToggle = newValue !== 'false';
        this._updateThemeToggleVisibility();
        break;
      case 'readonly':
        this.config.readonly = newValue === 'true' || newValue === '';
        this._updateReadonlyState();
        break;
      case 'max-lines':
        this.config.maxLines = parseInt(newValue) || 1000;
        break;
      case 'enable-vfs':
        this.config.enableVfs = newValue === 'true' || newValue === '';
        if (this.config.enableVfs) {
          this._registerVfsCommands();
        }
        break;
      case 'persist-history':
        this.config.persistHistory = newValue === 'true' || newValue === '';
        this.historyManager.setPersistence(this.config.persistHistory);
        break;
      case 'force-animations':
        this.config.forceAnimations = newValue === 'true' || newValue === '';
        break;
    }

    this._updateStyles();
  }

  /**
   * Apply initial attributes
   */
  _applyAttributes() {
    const attrs = TerminalWindow.observedAttributes;

    attrs.forEach(attr => {
      const value = this.getAttribute(attr);
      if (value !== null) {
        this.attributeChangedCallback(attr, null, value);
      }
    });

    this._updateStyles();
  }

  /**
   * Update dynamic styles
   */
  _updateStyles() {
    const terminal = this.shadowRoot.querySelector('.terminal');
    if (terminal) {
      terminal.dataset.theme = this.config.theme;
      terminal.dataset.cursorStyle = this.config.cursorStyle;
      terminal.dataset.cursorBlink = this.config.cursorBlink;
      terminal.dataset.readonly = this.config.readonly;
      terminal.dataset.forceAnimations = this.config.forceAnimations;
      terminal.style.setProperty('--font-family', this.config.fontFamily);
      terminal.style.setProperty('--font-size', this.config.fontSize);
      terminal.style.setProperty('--line-height', this.config.lineHeight);
    }

    // Update prompt display
    const promptEl = this.shadowRoot.querySelector('.input-prompt');
    if (promptEl) {
      promptEl.textContent = this.config.prompt;
    }
  }

  /**
   * Update header visibility
   */
  _updateHeaderVisibility() {
    const header = this.shadowRoot.querySelector('.terminal-header');
    if (header) {
      header.style.display = this.config.showHeader ? 'flex' : 'none';
    }
  }

  /**
   * Update title
   */
  _updateTitle() {
    const titleEl = this.shadowRoot.querySelector('.terminal-title');
    if (titleEl) {
      titleEl.textContent = this.config.title;
    }
  }

  /**
   * Update window controls visibility
   */
  _updateControlsVisibility() {
    const controls = this.shadowRoot.querySelector('.window-controls');
    if (controls) {
      controls.style.display = this.config.showControls ? 'flex' : 'none';
    }
  }

  /**
   * Update copy button visibility
   */
  _updateCopyVisibility() {
    const copyWrapper = this.shadowRoot.querySelector('.copy-wrapper');
    if (copyWrapper) {
      copyWrapper.style.display = this.config.showCopy ? '' : 'none';
    }
  }

  /**
   * Update theme toggle visibility
   */
  _updateThemeToggleVisibility() {
    const themeBtn = this.shadowRoot.querySelector('.theme-btn');
    if (themeBtn) {
      themeBtn.style.display = this.config.showThemeToggle ? '' : 'none';
    }
  }

  /**
   * Update readonly state
   */
  _updateReadonlyState() {
    const inputLine = this.shadowRoot.querySelector('.input-line');
    if (inputLine) {
      inputLine.style.display = this.config.readonly ? 'none' : 'flex';
    }
  }

  /**
   * Register VFS commands
   */
  _registerVfsCommands() {
    // File system commands
    this.registerCommand('ls', (args) => {
      const result = this.fileSystem.ls(args[0]);
      if (typeof result === 'string') return result;
      
      // Format directory listing
      const items = result.map(item => {
        const isDir = item.type === 'dir';
        return isDir ? `\x1b[1;34m${item.name}/\x1b[0m` : item.name;
      });
      
      return items.join('  ');
    });

    this.registerCommand('cd', (args) => {
      const error = this.fileSystem.cd(args[0]);
      if (error) return error;
      this.setPrompt(`user@host:${this.fileSystem.getcwd()}$ `);
      return null;
    });

    this.registerCommand('pwd', () => {
      return this.fileSystem.getcwd();
    });

    this.registerCommand('mkdir', (args) => {
      if (!args[0]) return 'mkdir: missing operand';
      return this.fileSystem.mkdir(args[0]);
    });

    this.registerCommand('touch', (args) => {
      if (!args[0]) return 'touch: missing operand';
      return this.fileSystem.touch(args[0]);
    });

    this.registerCommand('rm', (args) => {
      if (!args[0]) return 'rm: missing operand';
      const recursive = args.includes('-r') || args.includes('-rf');
      const path = args.find(a => !a.startsWith('-'));
      if (!path) return 'rm: missing operand';
      return this.fileSystem.rm(path, recursive);
    });

    this.registerCommand('cat', (args) => {
      if (!args[0]) return 'cat: missing operand';
      return this.fileSystem.readFile(args[0]);
    });
  }

  /**
   * Register built-in commands
   */
  _registerBuiltInCommands() {
    this.registerCommand('help', () => {
      const cmds = this.commandRegistry.getNames();
      return `${this._t('availableCommands')}\n${cmds.map(c => `  ${c}`).join('\n')}`;
    });

    this.registerCommand('clear', () => {
      this.clear();
      return null; // Don't print anything
    });

    this.registerCommand('echo', (args) => {
      return args.join(' ');
    });

    this.registerCommand('history', () => {
      if (this.historyManager.isEmpty()) {
        return this._t('noCommandsInHistory');
      }
      return this.historyManager.getFormattedHistory();
    });

    this.registerCommand('date', () => {
      return new Date().toString();
    });
  }

  /**
   * Register a custom command handler.
   * The handler receives an array of arguments and the terminal instance,
   * and can return a string to print, null to suppress output, or a Promise for async commands.
   *
   * @method registerCommand
   * @param {string} name - Command name (case-insensitive)
   * @param {Function} handler - Function that receives (args: string[], terminal: TerminalWindow) and returns string|null|Promise
   * @example
   * // Simple command
   * terminal.registerCommand('hello', () => 'Hello, World!');
   *
   * // Command with arguments
   * terminal.registerCommand('greet', (args) => `Hello, ${args[0] || 'stranger'}!`);
   *
   * // Async command
   * terminal.registerCommand('fetch-data', async (args) => {
   *   const response = await fetch('/api/data');
   *   const data = await response.json();
   *   return JSON.stringify(data, null, 2);
   * });
   *
   * // Command using terminal instance
   * terminal.registerCommand('countdown', async (args, term) => {
   *   for (let i = 3; i > 0; i--) {
   *     await term.print(`${i}...`);
   *     await new Promise(r => setTimeout(r, 1000));
   *   }
   *   return 'Blast off!';
   * });
   */
  registerCommand(name, handler) {
    this.commandRegistry.register(name, handler);
  }

  /**
   * Remove a registered command.
   *
   * @method unregisterCommand
   * @param {string} name - Command name to remove
   * @example
   * terminal.unregisterCommand('greet');
   */
  unregisterCommand(name) {
    this.commandRegistry.unregister(name);
  }

  /**
   * Create an alias for a command.
   *
   * @method registerAlias
   * @param {string} alias - Alias name
   * @param {string} command - Full command string to execute when alias is used
   * @example
   * terminal.registerAlias('ll', 'ls -la');
   * terminal.registerAlias('cls', 'clear');
   */
  registerAlias(alias, command) {
    this.commandRegistry.registerAlias(alias, command);
  }

  /**
   * Execute a command string programmatically.
   *
   * @method executeCommand
   * @param {string} input - Full command string
   * @param {boolean} [addToHistory=true] - Whether to add to command history
   * @returns {Promise<void>}
   * @example
   * terminal.executeCommand('ls -la');
   * terminal.executeCommand('help', false); // Don't add to history
   */
  async executeCommand(input, addToHistory = true) {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add to history
    if (addToHistory) {
      this.historyManager.add(trimmed);
    }

    // Print the command line
    this._printCommandLine(trimmed);

    // Resolve alias
    const resolved = this.commandRegistry.resolveAlias(trimmed);

    // Parse command and arguments
    const parts = this.commandRegistry.parse(resolved);
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Find and execute command
    const handler = this.commandRegistry.get(cmdName);

    if (handler) {
      try {
        const result = await handler(args, this);
        if (result !== null && result !== undefined) {
          await this.print(String(result));
        }

        // Dispatch command-result event on success
        this.dispatchEvent(new CustomEvent('command-result', {
          detail: { command: cmdName, args, input: trimmed, result },
          bubbles: true,
          composed: true
        }));
      } catch (error) {
        await this.print(`Error: ${error.message}`, 'error');

        // Dispatch command-error event on failure
        this.dispatchEvent(new CustomEvent('command-error', {
          detail: { command: cmdName, args, input: trimmed, error },
          bubbles: true,
          composed: true
        }));
      }
    } else {
      const errorMessage = `${this._t('commandNotFound')} ${cmdName}. ${this._t('typeHelpForCommands')}`;
      await this.print(errorMessage, 'error');

      // Dispatch command-error for unknown commands
      this.dispatchEvent(new CustomEvent('command-error', {
        detail: { command: cmdName, args, input: trimmed, error: new Error(errorMessage) },
        bubbles: true,
        composed: true
      }));
    }

    // Dispatch command event (fired for all commands)
    this.dispatchEvent(new CustomEvent('command', {
      detail: { command: cmdName, args, input: trimmed },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Execute multiple commands with delays between them.
   * Useful for demos, presentations, or scripted terminal sequences.
   *
   * @method executeSequence
   * @param {Array<string|{command: string, delay?: number}>} commands - Array of command strings or objects with command and optional delay
   * @param {number} [defaultDelay=1000] - Default delay between commands in milliseconds
   * @returns {Promise<void>}
   * @example
   * // Simple array of command strings
   * await terminal.executeSequence(['pwd', 'ls', 'whoami'], 1000);
   *
   * // With custom delays per command
   * await terminal.executeSequence([
   *   { command: 'cd /home', delay: 500 },
   *   { command: 'ls -la', delay: 1500 },
   *   'pwd' // Uses default delay
   * ], 1000);
   */
  async executeSequence(commands, defaultDelay = 1000) {
    for (const item of commands) {
      const command = typeof item === 'string' ? item : item.command;
      const delay = typeof item === 'string' ? defaultDelay : (item.delay ?? defaultDelay);

      await this.executeCommand(command, false);
      await this._delay(delay);
    }
  }

  /**
   * Print command line to output
   */
  _printCommandLine(input) {
    const line = {
      type: 'command',
      prompt: this.config.prompt,
      content: input
    };
    this.outputLines.push(line);
    
    // Efficiently append to DOM
    this._appendLineToDom(line);
    this._trimOutputIfNeeded();
    this._scrollToBottom();
  }

  /**
   * Print text to the terminal.
   * Supports multiple lines (splits on \n) and ANSI color codes.
   *
   * @method print
   * @param {string} text - Text to print (can contain newlines)
   * @param {string} [type=output] - Line type for styling: "output" (default), "error" (red), "info" (cyan), "success" (green)
   * @returns {Promise<void>}
   * @example
   * terminal.print('Operation complete!', 'success');
   * terminal.print('Something went wrong', 'error');
   * terminal.print('Processing...', 'info');
   *
   * // With ANSI colors
   * terminal.print('\x1b[31mRed text\x1b[0m');
   */
  async print(text, type = 'output') {
    const lines = text.split('\n');

    for (const lineText of lines) {
      const line = {
        type: type,
        content: lineText
      };
      this.outputLines.push(line);

      // Dispatch output event for each line
      this.dispatchEvent(new CustomEvent('output', {
        detail: { type, content: lineText },
        bubbles: true,
        composed: true
      }));
      
      // Efficiently append to DOM (if not typing effect)
      if (!this.config.typingEffect || type === 'command' || this._prefersReducedMotion()) {
        this._appendLineToDom(line);
      }
    }
    
    // Check if typing effect should be used
    const useTypingEffect = this.config.typingEffect &&
                            type !== 'command' &&
                            !this._prefersReducedMotion();

    if (useTypingEffect) {
      // Queue this print if typing is already in progress
      if (this._typingInProgress) {
        await new Promise(resolve => {
          this._typingQueue.push({ lines, type, resolve });
        });
      } else {
        await this._renderWithTypingEffect(lines, type);
        // Process any queued prints
        await this._processTypingQueue();
      }
    }

    this._trimOutputIfNeeded();
    this._scrollToBottom();

    // Announce to screen readers for important output
    if (type === 'error') {
      this._announce(`Error: ${text}`);
    }
  }

  /**
   * Update the last output line in place.
   * Useful for progress bars, countdowns, and other dynamic content that
   * should update on a single line rather than adding new lines.
   *
   * @method updateLastLine
   * @param {string} text - New text content for the last line
   * @returns {boolean} True if a line was updated, false if no output lines exist
   * @example
   * // Progress bar that updates in place
   * terminal.print('[          ] 0%');
   * for (let i = 1; i <= 10; i++) {
   *   await delay(200);
   *   const bar = '█'.repeat(i) + ' '.repeat(10 - i);
   *   terminal.updateLastLine(`[${bar}] ${i * 10}%`);
   * }
   *
   * // Countdown timer
   * terminal.print('Starting in 3...');
   * await delay(1000);
   * terminal.updateLastLine('Starting in 2...');
   * await delay(1000);
   * terminal.updateLastLine('Starting in 1...');
   */
  updateLastLine(text) {
    // Find the last non-command output line
    let lastOutputIndex = -1;
    for (let i = this.outputLines.length - 1; i >= 0; i--) {
      if (this.outputLines[i].type !== 'command') {
        lastOutputIndex = i;
        break;
      }
    }

    if (lastOutputIndex === -1) {
      return false; // No output lines to update
    }

    // Update the data model
    const line = this.outputLines[lastOutputIndex];
    line.content = text;

    // Update the DOM element
    const outputContainer = this.shadowRoot.querySelector('.output');
    if (outputContainer) {
      const lineElements = outputContainer.querySelectorAll('.output-line');
      const domIndex = lastOutputIndex; // Direct mapping since we render all lines
      if (lineElements[domIndex]) {
        lineElements[domIndex].innerHTML = this._parseAnsi(text);
      }
    }

    this._scrollToBottom();
    return true;
  }

  /**
   * Check if user prefers reduced motion
   * Can be overridden with forceAnimations config for testing
   */
  _prefersReducedMotion() {
    if (this.config.forceAnimations) {
      return false; // Override: allow animations regardless of system preference
    }
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Process queued typing effect prints
   */
  async _processTypingQueue() {
    while (this._typingQueue.length > 0) {
      const { lines, type, resolve } = this._typingQueue.shift();
      await this._renderWithTypingEffect(lines, type);
      resolve();
    }
  }

  /**
   * Trim output lines if exceeding max
   */
  _trimOutputIfNeeded() {
    const outputContainer = this.shadowRoot.querySelector('.output');
    
    // Trim array
    while (this.outputLines.length > this.config.maxLines) {
      this.outputLines.shift();
      // Remove corresponding element from DOM
      if (outputContainer && outputContainer.firstElementChild) {
        outputContainer.removeChild(outputContainer.firstElementChild);
      }
    }
  }

  /**
   * Render output with typing effect
   */
  async _renderWithTypingEffect(lines, type) {
    this._typingInProgress = true;
    this._typingCancelled = false;

    const outputContainer = this.shadowRoot.querySelector('.output');
    const inputCursor = this.shadowRoot.querySelector('.input-line .cursor');

    // Hide the input cursor during typing effect
    if (inputCursor) {
      inputCursor.style.visibility = 'hidden';
    }

    // Create a typing cursor element
    const typingCursor = document.createElement('span');
    typingCursor.className = 'typing-cursor';

    for (const lineText of lines) {
      // Check if cancelled - if so, render remaining lines immediately
      if (this._typingCancelled) {
        // We need to render the remaining lines properly
        // Find the index of current line in lines array and render the rest
        const currentIndex = lines.indexOf(lineText);
        for (let i = currentIndex; i < lines.length; i++) {
            this._appendLineToDom({ type, content: lines[i] });
        }
        break;
      }

      const lineEl = document.createElement('div');
      lineEl.className = `output-line line-${type}`;
      lineEl.setAttribute('role', 'listitem');
      outputContainer.appendChild(lineEl);

      // Build up the raw text character by character, then parse ANSI at each step
      let rawText = '';
      for (let i = 0; i < lineText.length; i++) {
        // Check if cancelled mid-line
        if (this._typingCancelled) {
          // Complete this line immediately
          lineEl.innerHTML = this._parseAnsi(lineText);
          break;
        }

        rawText += lineText[i];
        lineEl.innerHTML = this._parseAnsi(rawText);
        lineEl.appendChild(typingCursor);
        this._scrollToBottom();
        await this._delay(this.config.typingSpeed);
      }
      // Remove cursor from this line when done
      if (typingCursor.parentNode === lineEl) {
        lineEl.removeChild(typingCursor);
      }
    }

    // Show the input cursor again
    if (inputCursor) {
      inputCursor.style.visibility = 'visible';
    }

    this._typingInProgress = false;
    this._typingCancelled = false;
  }

  /**
   * Skip the current typing animation and show all remaining output immediately.
   * This is also triggered when the user presses Ctrl+C or clicks the terminal during a typing effect.
   *
   * @method skipTypingEffect
   * @example
   * terminal.skipTypingEffect();
   */
  skipTypingEffect() {
    if (this._typingInProgress) {
      this._typingCancelled = true;
    }
  }

  /**
   * Delay helper for typing effect
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all terminal output.
   *
   * @method clear
   * @example
   * terminal.clear();
   */
  clear() {
    this.outputLines = [];
    const outputContainer = this.shadowRoot.querySelector('.output');
    if (outputContainer) {
      outputContainer.innerHTML = '';
    }
    this._announce(this._t('terminalCleared'));
  }

  /**
   * Parse ANSI escape codes and convert to HTML
   * @param {string} text - Text with ANSI codes
   * @returns {string} HTML string
   */
  _parseAnsi(text) {
    return this.ansiParser.parse(text, this._escapeHtml.bind(this));
  }

  /**
   * Append a single line to the DOM
   */
  _appendLineToDom(line) {
    const outputContainer = this.shadowRoot.querySelector('.output');
    if (!outputContainer) return;

    const div = document.createElement('div');
    
    if (line.type === 'command') {
      div.className = 'output-line line-command';
      div.setAttribute('role', 'listitem');
      div.innerHTML = `<span class="line-prompt">${this._escapeHtml(line.prompt)}</span>${this._escapeHtml(line.content)}`;
    } else {
      div.className = `output-line line-${line.type}`;
      div.setAttribute('role', 'listitem');
      // Parse ANSI codes for non-command lines
      div.innerHTML = this._parseAnsi(line.content);
    }
    
    outputContainer.appendChild(div);
  }

  /**
   * Render the output area
   */
  _renderOutput() {
    const outputContainer = this.shadowRoot.querySelector('.output');
    if (!outputContainer) return;

    outputContainer.innerHTML = '';
    
    this.outputLines.forEach(line => {
      this._appendLineToDom(line);
    });

    this._scrollToBottom();
  }

  /**
   * Check if terminal is scrolled near the bottom
   */
  _isNearBottom() {
    const terminal = this.shadowRoot.querySelector('.terminal-body');
    if (!terminal) return true;
    const distanceFromBottom = terminal.scrollHeight - terminal.scrollTop - terminal.clientHeight;
    return distanceFromBottom <= this._scrollThreshold;
  }

  /**
   * Handle scroll events for smart auto-scroll
   */
  _handleScroll() {
    // Re-enable auto-scroll if user scrolls to bottom
    this._autoScroll = this._isNearBottom();
  }

  /**
   * Scroll to bottom of terminal (respects auto-scroll setting)
   */
  _scrollToBottom() {
    if (!this._autoScroll) return;

    const terminal = this.shadowRoot.querySelector('.terminal-body');
    if (terminal) {
      terminal.scrollTop = terminal.scrollHeight;
    }
  }

  /**
   * Force scroll to the bottom of the terminal.
   * The terminal uses smart auto-scroll: it automatically scrolls when new output appears,
   * but stops if the user scrolls up to read previous content. This method forces a scroll
   * and re-enables auto-scroll.
   *
   * @method scrollToBottom
   * @example
   * terminal.scrollToBottom();
   */
  scrollToBottom() {
    this._autoScroll = true;
    const terminal = this.shadowRoot.querySelector('.terminal-body');
    if (terminal) {
      terminal.scrollTop = terminal.scrollHeight;
    }
  }

  /**
   * Escape HTML for safe display
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Announce message to screen readers
   */
  _announce(message) {
    const announcer = this.shadowRoot.querySelector('.sr-announcer');
    if (announcer) {
      announcer.textContent = message;
      // Clear after announcement
      if (this._announceTimeout) {
        clearTimeout(this._announceTimeout);
      }
      this._announceTimeout = setTimeout(() => {
        announcer.textContent = '';
        this._announceTimeout = null;
      }, 1000);
    }
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    const input = this.shadowRoot.querySelector('.hidden-input');
    const terminal = this.shadowRoot.querySelector('.terminal');
    const terminalBody = this.shadowRoot.querySelector('.terminal-body');

    // Smart scroll: track when user scrolls away from bottom
    if (terminalBody) {
      terminalBody.addEventListener('scroll', () => this._handleScroll());
    }

    // Focus input when clicking anywhere in terminal
    // Also skip typing effect if in progress
    // But don't steal focus if user is selecting text
    terminal.addEventListener('click', () => {
      if (this._typingInProgress) {
        this.skipTypingEffect();
      }
      if (!this.config.readonly) {
        // Check if user has selected text - if so, don't steal focus
        const selection = this.shadowRoot.getSelection ?
          this.shadowRoot.getSelection() :
          window.getSelection();
        const hasSelection = selection && selection.toString().length > 0;

        if (!hasSelection) {
          this._focusInput();
        }
      }
    });

    // Handle input
    input.addEventListener('input', (e) => {
      this.currentInput = e.target.value;
      this._updateInputDisplay();
    });

    // Handle keydown
    input.addEventListener('keydown', (e) => {
      if (this.config.readonly) return;

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          const cmd = this.currentInput;
          this.currentInput = '';
          input.value = '';
          this._updateInputDisplay();
          this.executeCommand(cmd);
          break;

        case 'ArrowUp':
          e.preventDefault();
          this._navigateHistory(-1);
          break;

        case 'ArrowDown':
          e.preventDefault();
          this._navigateHistory(1);
          break;

        case 'Tab':
          e.preventDefault();
          this._autocomplete();
          break;

        case 'c':
          if (e.ctrlKey) {
            e.preventDefault();
            // Skip typing effect if in progress
            if (this._typingInProgress) {
              this.skipTypingEffect();
            } else {
              this._printCommandLine(this.currentInput + '^C');
              this.currentInput = '';
              input.value = '';
              this._updateInputDisplay();
            }
            this.dispatchEvent(new CustomEvent('interrupt', { bubbles: true, composed: true }));
          }
          break;

        case 'l':
          if (e.ctrlKey) {
            e.preventDefault();
            this.clear();
          }
          break;
      }
    });

    // Copy button with menu
    const copyBtn = this.shadowRoot.querySelector('.copy-btn');
    const copyMenu = this.shadowRoot.querySelector('.copy-menu');
    if (copyBtn && copyMenu) {
      // Single click copies all, shows brief feedback
      copyBtn.addEventListener('click', (e) => {
        if (e.detail === 1) {
          // Single click - copy all immediately
          this.copyContent('all');
        }
      });

      // Right-click or long-press shows menu
      copyBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this._toggleCopyMenu();
      });

      // Keyboard support for copy button - Enter/Space opens menu
      copyBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          // Allow default click behavior for single action
          // But ArrowDown opens the menu
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this._openCopyMenu();
        }
      });

      // Handle menu items
      copyMenu.querySelectorAll('.copy-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const mode = item.dataset.copyMode;
          this.copyContent(mode);
          this._closeCopyMenu();
        });

        // Keyboard support for menu items
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const mode = item.dataset.copyMode;
            this.copyContent(mode);
            this._closeCopyMenu();
          } else {
            this._handleCopyMenuKeydown(e);
          }
        });
      });
    }

    // Theme toggle
    const themeBtn = this.shadowRoot.querySelector('.theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Window controls (traffic light buttons)
    const closeBtn = this.shadowRoot.querySelector('.control.close');
    const minimizeBtn = this.shadowRoot.querySelector('.control.minimize');
    const maximizeBtn = this.shadowRoot.querySelector('.control.maximize');

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    }

    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.minimize();
      });
    }

    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFullscreen();
      });
    }
  }

  /**
   * Navigate command history
   */
  _navigateHistory(direction) {
    const result = this.historyManager.navigate(direction);
    if (result !== null) {
      this.currentInput = result;
      const input = this.shadowRoot.querySelector('.hidden-input');
      input.value = this.currentInput;
      this._updateInputDisplay();
    }
  }

  /**
   * Autocomplete command
   */
  _autocomplete() {
    const parts = this.currentInput.split(' ');
    const cmdPart = parts[0].toLowerCase();

    if (parts.length === 1 && cmdPart) {
      const matches = this.commandRegistry.getNames()
        .filter(c => c.startsWith(cmdPart));

      if (matches.length === 1) {
        this.currentInput = matches[0];
        const input = this.shadowRoot.querySelector('.hidden-input');
        input.value = this.currentInput;
        this._updateInputDisplay();
      } else if (matches.length > 1) {
        this.print(matches.join('  '), 'info');
      }
    }
  }

  /**
   * Update the visible input display
   */
  _updateInputDisplay() {
    const inputText = this.shadowRoot.querySelector('.input-text');
    if (inputText) {
      if (this.inputMasked) {
        inputText.textContent = '*'.repeat(this.currentInput.length);
      } else {
        inputText.textContent = this.currentInput;
      }
    }
  }

  /**
   * Focus the hidden input
   */
  _focusInput() {
    const input = this.shadowRoot.querySelector('.hidden-input');
    if (input && !this.config.readonly) {
      input.focus();
    }
  }

  /**
   * Enable or disable input masking for password prompts.
   * When masked, input is displayed as asterisks (***) instead of the actual characters.
   *
   * @method setInputMask
   * @param {boolean} masked - Whether to mask input
   * @example
   * terminal.setInputMask(true);  // Shows *** instead of text
   * terminal.setInputMask(false); // Shows normal text
   */
  setInputMask(masked) {
    this.inputMasked = masked;
    this._updateInputDisplay();
  }

  /**
   * Copy terminal content to clipboard.
   *
   * @method copyContent
   * @param {string} [mode=all] - Copy mode: "all" (everything with prompts), "commands" (only commands entered), "output" (only output, no commands), "selection" (current text selection)
   * @returns {Promise<void>}
   * @example
   * terminal.copyContent('commands'); // Copy only commands entered
   * terminal.copyContent('output');   // Copy only output
   * terminal.copyContent('all');      // Copy everything
   */
  async copyContent(mode = 'all') {
    let text;

    switch (mode) {
      case 'commands':
        // Copy only command lines (without prompts)
        text = this.outputLines
          .filter(line => line.type === 'command')
          .map(line => line.content)
          .join('\n');
        break;
      case 'output':
        // Copy only output (no commands)
        text = this.outputLines
          .filter(line => line.type !== 'command')
          .map(line => line.content)
          .join('\n');
        break;
      case 'selection':
        // Copy current text selection
        const selection = this.shadowRoot.getSelection ?
          this.shadowRoot.getSelection() :
          window.getSelection();
        text = selection ? selection.toString() : '';
        if (!text) {
          this._showCopyFeedback(this._t('noSelection'));
          return;
        }
        break;
      case 'all':
      default:
        // Copy everything with prompts
        text = this.outputLines.map(line => {
          if (line.type === 'command') {
            return `${line.prompt}${line.content}`;
          }
          return line.content;
        }).join('\n');
    }

    if (!text) {
      this._showCopyFeedback(this._t('nothingToCopy'));
      return;
    }

    await this._copyToClipboard(text, mode);
  }

  /**
   * Internal method to copy text to clipboard
   */
  async _copyToClipboard(text, mode = 'all') {
    const modeLabel = mode === 'all' ? this._t('content') : mode.charAt(0).toUpperCase() + mode.slice(1);
    const announcement = `${modeLabel} ${this._t('copiedToClipboard')}`;

    try {
      await navigator.clipboard.writeText(text);
      this._showCopyFeedback(this._t('copied'));
      this._announce(announcement);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this._showCopyFeedback(this._t('copied'));
      this._announce(announcement);
    }

    this.dispatchEvent(new CustomEvent('copy', {
      detail: { text, mode },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Toggle copy menu visibility
   */
  _toggleCopyMenu() {
    if (this._copyMenuOpen) {
      this._closeCopyMenu();
    } else {
      this._openCopyMenu();
    }
  }

  /**
   * Open the copy menu with keyboard support
   */
  _openCopyMenu() {
    const menu = this.shadowRoot.querySelector('.copy-menu');
    const copyBtn = this.shadowRoot.querySelector('.copy-btn');
    if (!menu) return;

    menu.style.display = 'block';
    this._copyMenuOpen = true;
    this._copyMenuFocusIndex = 0;

    // Update ARIA state
    if (copyBtn) {
      copyBtn.setAttribute('aria-expanded', 'true');
    }

    // Focus first menu item
    const items = menu.querySelectorAll('.copy-menu-item');
    if (items.length > 0) {
      items[0].focus();
    }

    // Close menu when clicking outside
    this._copyMenuCloseHandler = (e) => {
      if (!e.composedPath().includes(menu) && !e.composedPath().includes(copyBtn)) {
        this._closeCopyMenu();
      }
    };
    setTimeout(() => document.addEventListener('click', this._copyMenuCloseHandler), 0);
  }

  /**
   * Close the copy menu and return focus
   */
  _closeCopyMenu() {
    const menu = this.shadowRoot.querySelector('.copy-menu');
    const copyBtn = this.shadowRoot.querySelector('.copy-btn');

    if (menu) {
      menu.style.display = 'none';
    }

    this._copyMenuOpen = false;
    this._copyMenuFocusIndex = -1;

    // Update ARIA state
    if (copyBtn) {
      copyBtn.setAttribute('aria-expanded', 'false');
      copyBtn.focus();
    }

    // Remove click handler
    if (this._copyMenuCloseHandler) {
      document.removeEventListener('click', this._copyMenuCloseHandler);
      this._copyMenuCloseHandler = null;
    }
  }

  /**
   * Handle keyboard navigation in copy menu
   */
  _handleCopyMenuKeydown(e) {
    const menu = this.shadowRoot.querySelector('.copy-menu');
    if (!menu || !this._copyMenuOpen) return;

    const items = menu.querySelectorAll('.copy-menu-item');
    if (items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._copyMenuFocusIndex = (this._copyMenuFocusIndex + 1) % items.length;
        items[this._copyMenuFocusIndex].focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this._copyMenuFocusIndex = (this._copyMenuFocusIndex - 1 + items.length) % items.length;
        items[this._copyMenuFocusIndex].focus();
        break;

      case 'Escape':
        e.preventDefault();
        this._closeCopyMenu();
        break;

      case 'Tab':
        // Close menu on tab out
        this._closeCopyMenu();
        break;

      case 'Home':
        e.preventDefault();
        this._copyMenuFocusIndex = 0;
        items[0].focus();
        break;

      case 'End':
        e.preventDefault();
        this._copyMenuFocusIndex = items.length - 1;
        items[items.length - 1].focus();
        break;
    }
  }

  /**
   * Show copy feedback
   */
  _showCopyFeedback(message) {
    const copyBtn = this.shadowRoot.querySelector('.copy-btn');
    if (!copyBtn) return;
    const originalText = copyBtn.textContent;
    copyBtn.textContent = message;
    copyBtn.classList.add('copy-success');
    if (this._copyFeedbackTimeout) {
      clearTimeout(this._copyFeedbackTimeout);
    }
    this._copyFeedbackTimeout = setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.classList.remove('copy-success');
      this._copyFeedbackTimeout = null;
      this._focusInput();
    }, 1500);
  }

  /**
   * Toggle between light and dark theme.
   * Announces the theme change to screen readers and fires no events (use attribute observation for reactivity).
   *
   * @method toggleTheme
   * @returns {void}
   * @example
   * terminal.toggleTheme(); // Switches from dark to light or vice versa
   */
  toggleTheme() {
    this.config.theme = this.config.theme === 'dark' ? 'light' : 'dark';
    this.setAttribute('theme', this.config.theme);
    this._updateStyles();
    this._announce(`${this._t('themeChangedTo')} ${this.config.theme}`);
  }

  /**
   * Close the terminal by hiding it.
   * Sets `display: none` on the element and dispatches a `close` event.
   * The terminal can be shown again by setting `display: block` or removing the style.
   *
   * @method close
   * @returns {void}
   * @fires close
   * @example
   * terminal.close();
   *
   * // Listen for close event
   * terminal.addEventListener('close', () => {
   *   console.log('Terminal was closed');
   * });
   */
  close() {
    this.style.display = 'none';
    this._announce(this._t('terminalClosed'));

    this.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Toggle the minimized state of the terminal.
   * When minimized, only the header is visible. Dispatches a `minimize` event with the new state.
   *
   * @method minimize
   * @returns {void}
   * @fires minimize
   * @example
   * terminal.minimize(); // Minimize the terminal
   * terminal.minimize(); // Restore the terminal
   *
   * // Listen for minimize event
   * terminal.addEventListener('minimize', (e) => {
   *   console.log('Minimized:', e.detail.minimized);
   * });
   */
  minimize() {
    this.isMinimized = !this.isMinimized;
    const terminalBody = this.shadowRoot.querySelector('.terminal-body');

    if (terminalBody) {
      terminalBody.style.display = this.isMinimized ? 'none' : 'block';
    }

    this._announce(this.isMinimized ? this._t('terminalMinimized') : this._t('terminalRestored'));

    this.dispatchEvent(new CustomEvent('minimize', {
      detail: { minimized: this.isMinimized },
      bubbles: true,
      composed: true
    }));

    // Return focus to input when restoring from minimized state
    if (!this.isMinimized) {
      this._focusInput();
    }
  }

  /**
   * Toggle fullscreen mode (maximize).
   * When fullscreen, the terminal fills the entire viewport. Press Escape to exit.
   * Dispatches a `fullscreen` event with the new state.
   *
   * @method toggleFullscreen
   * @returns {void}
   * @fires fullscreen
   * @example
   * terminal.toggleFullscreen(); // Enter fullscreen
   * terminal.toggleFullscreen(); // Exit fullscreen
   *
   * // Listen for fullscreen event
   * terminal.addEventListener('fullscreen', (e) => {
   *   console.log('Fullscreen:', e.detail.fullscreen);
   * });
   */
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    const terminal = this.shadowRoot.querySelector('.terminal');
    const maximizeBtn = this.shadowRoot.querySelector('.control.maximize');

    if (terminal) {
      terminal.classList.toggle('fullscreen', this.isFullscreen);
    }

    if (maximizeBtn) {
      maximizeBtn.title = this.isFullscreen ? this._t('exitFullscreen') : this._t('maximize');
      maximizeBtn.setAttribute('aria-label', this.isFullscreen ? this._t('exitFullscreen') : this._t('toggleFullscreen'));
      maximizeBtn.setAttribute('aria-pressed', this.isFullscreen ? 'true' : 'false');
    }

    // Handle escape key to exit fullscreen
    if (this.isFullscreen) {
      this._fullscreenEscHandler = (e) => {
        if (e.key === 'Escape') {
          this.toggleFullscreen();
        }
      };
      document.addEventListener('keydown', this._fullscreenEscHandler);
    } else if (this._fullscreenEscHandler) {
      document.removeEventListener('keydown', this._fullscreenEscHandler);
      this._fullscreenEscHandler = null;
    }

    this._announce(this.isFullscreen ? this._t('enteredFullscreen') : this._t('exitedFullscreen'));

    this.dispatchEvent(new CustomEvent('fullscreen', {
      detail: { fullscreen: this.isFullscreen },
      bubbles: true,
      composed: true
    }));

    this._focusInput();
  }

  /**
   * Set the color theme programmatically.
   *
   * @method setTheme
   * @param {('dark'|'light')} theme - The theme to apply
   * @returns {void}
   * @example
   * terminal.setTheme('light');
   * terminal.setTheme('dark');
   */
  setTheme(theme) {
    this.config.theme = theme;
    this.setAttribute('theme', theme);
    this._updateStyles();
  }

  /**
   * Set the command prompt text programmatically.
   *
   * @method setPrompt
   * @param {string} prompt - The prompt text to display (e.g., "$ ", "> ", "user@host:~$ ")
   * @returns {void}
   * @example
   * terminal.setPrompt('> ');
   * terminal.setPrompt('user@localhost:~$ ');
   */
  setPrompt(prompt) {
    this.config.prompt = prompt;
    this.setAttribute('prompt', prompt);
    this._updateStyles();
  }

  /**
   * Set the cursor style programmatically.
   *
   * @method setCursorStyle
   * @param {('block'|'underline'|'bar')} style - The cursor style to apply
   * @returns {void}
   * @example
   * terminal.setCursorStyle('block');     // █ (default)
   * terminal.setCursorStyle('underline'); // _
   * terminal.setCursorStyle('bar');       // |
   */
  setCursorStyle(style) {
    this.config.cursorStyle = style;
    this.setAttribute('cursor-style', style);
    this._updateStyles();
  }

  /**
   * Enable or disable cursor blinking programmatically.
   *
   * @method setCursorBlink
   * @param {boolean} blink - Whether the cursor should blink
   * @returns {void}
   * @example
   * terminal.setCursorBlink(true);  // Enable blinking
   * terminal.setCursorBlink(false); // Disable blinking (solid cursor)
   */
  setCursorBlink(blink) {
    this.config.cursorBlink = blink;
    this.setAttribute('cursor-blink', String(blink));
    this._updateStyles();
  }

  /**
   * Enable or disable the typing effect for output.
   * When enabled, printed text appears character by character like a typewriter.
   * Respects `prefers-reduced-motion` unless `force-animations` is set.
   *
   * @method setTypingEffect
   * @param {boolean} enabled - Whether to enable the typing effect
   * @param {number} [speed=30] - Milliseconds per character (lower = faster)
   * @returns {void}
   * @example
   * terminal.setTypingEffect(true);        // Enable with default speed (30ms)
   * terminal.setTypingEffect(true, 10);    // Enable with fast typing (10ms)
   * terminal.setTypingEffect(true, 100);   // Enable with slow typing (100ms)
   * terminal.setTypingEffect(false);       // Disable typing effect
   */
  setTypingEffect(enabled, speed = 30) {
    this.config.typingEffect = enabled;
    this.config.typingSpeed = speed;
    this.setAttribute('typing-effect', String(enabled));
    this.setAttribute('typing-speed', String(speed));
  }

  /**
   * Enable or disable readonly mode.
   * When readonly, the input line is hidden and users cannot type commands.
   * Useful for presentation or demonstration purposes.
   *
   * @method setReadonly
   * @param {boolean} readonly - Whether to enable readonly mode
   * @returns {void}
   * @example
   * terminal.setReadonly(true);  // Disable input
   * terminal.setReadonly(false); // Enable input
   */
  setReadonly(readonly) {
    this.config.readonly = readonly;
    this.setAttribute('readonly', String(readonly));
    this._updateReadonlyState();
  }

  /**
   * Override the user's `prefers-reduced-motion` system preference.
   * When forced, typing animations will run even if the user has reduced motion enabled.
   * Use sparingly and only for testing or when the animation is essential to the experience.
   *
   * @method setForceAnimations
   * @param {boolean} force - If true, animations will run regardless of system preference
   * @returns {void}
   * @example
   * terminal.setForceAnimations(true);  // Force animations on
   * terminal.setForceAnimations(false); // Respect system preference
   */
  setForceAnimations(force) {
    this.config.forceAnimations = force;
    this.setAttribute('force-animations', String(force));
  }

  /**
   * Check if the user has enabled `prefers-reduced-motion` in their system settings.
   * When true, the terminal will skip typing animations unless `force-animations` is set.
   *
   * @method hasReducedMotion
   * @returns {boolean} True if the user prefers reduced motion
   * @example
   * if (terminal.hasReducedMotion()) {
   *   console.log('User prefers reduced motion');
   * }
   */
  hasReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Set internationalization (i18n) strings for localization.
   * Merges the provided strings with the existing defaults.
   * Triggers a re-render to apply the new strings.
   *
   * @method setI18n
   * @param {Object} strings - Object containing string keys to override
   * @param {string} [strings.copy] - "Copy" button text
   * @param {string} [strings.close] - "Close" button tooltip
   * @param {string} [strings.minimize] - "Minimize" button tooltip
   * @param {string} [strings.maximize] - "Maximize" button tooltip
   * @param {string} [strings.toggleTheme] - "Toggle theme" button tooltip
   * @param {string} [strings.copyAll] - "Copy All" menu item
   * @param {string} [strings.copyCommandsOnly] - "Copy Commands Only" menu item
   * @param {string} [strings.copyOutputOnly] - "Copy Output Only" menu item
   * @param {string} [strings.copied] - "Copied!" feedback message
   * @param {string} [strings.commandNotFound] - "Command not found" error message
   * @returns {void}
   * @example
   * terminal.setI18n({
   *   copy: 'Copiar',
   *   copied: '¡Copiado!',
   *   commandNotFound: 'Comando no encontrado'
   * });
   */
  setI18n(strings) {
    if (strings && typeof strings === 'object') {
      this._i18n = { ...this._i18n, ...strings };
      // Re-render to apply new strings
      this.render();
      this._setupEventListeners();
      this._applyAttributes();
    }
  }

  /**
   * Get a copy of the current i18n strings configuration.
   *
   * @method getI18n
   * @returns {Object} Current i18n configuration object
   * @example
   * const strings = terminal.getI18n();
   * console.log(strings.copy); // "Copy"
   */
  getI18n() {
    return { ...this._i18n };
  }

  /**
   * Get a localized string
   * @param {string} key - The i18n key
   * @returns {string} The localized string
   */
  _t(key) {
    return this._i18n[key] || key;
  }

  /**
   * Get the command history array.
   * Returns a copy of the history, not a reference to the internal array.
   *
   * @method getHistory
   * @returns {string[]} Array of previously executed commands (newest last)
   * @example
   * const history = terminal.getHistory();
   * console.log(history); // ['ls', 'cd /home', 'cat file.txt']
   */
  getHistory() {
    return this.historyManager.getHistory();
  }

  /**
   * Replace the command history with a new array.
   * Useful for restoring history from storage or initializing with predefined commands.
   *
   * @method setHistory
   * @param {string[]} history - Array of commands to set as history
   * @returns {void}
   * @example
   * terminal.setHistory(['ls', 'pwd', 'whoami']);
   */
  setHistory(history) {
    this.historyManager.setHistory(history);
  }

  /**
   * Clear all command history.
   * If `persist-history` is enabled, also clears the localStorage entry.
   *
   * @method clearHistory
   * @returns {void}
   * @example
   * terminal.clearHistory();
   */
  clearHistory() {
    this.historyManager.clear();
  }

  /**
   * Get all terminal output as plain text.
   * Includes both commands (with prompts) and output lines.
   *
   * @method getContent
   * @returns {string} All terminal content as newline-separated text
   * @example
   * const content = terminal.getContent();
   * console.log(content);
   * // $ ls
   * // file1.txt file2.txt
   * // $ pwd
   * // /home/user
   */
  getContent() {
    return this.outputLines.map(line => {
      if (line.type === 'command') {
        return `${line.prompt}${line.content}`;
      }
      return line.content;
    }).join('\n');
  }

  /**
   * Focus the terminal's input field.
   * Useful after programmatically interacting with the terminal.
   *
   * @method focus
   * @returns {void}
   * @example
   * terminal.focus();
   */
  focus() {
    this._focusInput();
  }

  /**
   * Render the component
   */
  render() {
    this.shadowRoot.innerHTML = `
      <div class="terminal"
           data-theme="${this.config.theme}"
           data-cursor-style="${this.config.cursorStyle}"
           data-cursor-blink="${this.config.cursorBlink}"
           data-readonly="${this.config.readonly}"
           role="application"
           aria-label="Terminal emulator">

        <!-- Screen reader announcements -->
        <div class="sr-announcer" role="status" aria-live="polite" aria-atomic="true"></div>

        <div class="terminal-header" style="${this.config.showHeader ? '' : 'display: none'}">
          <div class="window-controls" style="${this.config.showControls ? '' : 'display: none'}">
            <button class="control close" title="${this._t('close')}" aria-label="${this._t('close')} terminal"></button>
            <button class="control minimize" title="${this._t('minimize')}" aria-label="${this._t('minimize')} terminal"></button>
            <button class="control maximize" title="${this._t('maximize')}" aria-label="${this._t('toggleFullscreen')}" aria-pressed="false"></button>
          </div>
          <div class="terminal-title">
            <slot name="title">${this._escapeHtml(this.config.title)}</slot>
          </div>
          <div class="terminal-actions">
            <slot name="actions"></slot>
            <button class="theme-btn"
                    title="${this._t('toggleTheme')} (${this.config.theme === 'dark' ? this._t('switchToLight') : this._t('switchToDark')})"
                    aria-label="${this._t('toggleTheme')}"
                    style="${this.config.showThemeToggle ? '' : 'display: none'}">
              <span class="theme-icon"></span>
            </button>
            <div class="copy-wrapper" style="${this.config.showCopy ? '' : 'display: none'}">
              <button class="copy-btn"
                      title="${this._t('copy')} (right-click for options)"
                      aria-label="${this._t('copy')} terminal content"
                      aria-haspopup="menu"
                      aria-expanded="false">${this._t('copy')}</button>
              <div class="copy-menu" role="menu" aria-label="${this._t('copyOptions')}">
                <button class="copy-menu-item" data-copy-mode="all" role="menuitem" tabindex="-1">${this._t('copyAll')}</button>
                <button class="copy-menu-item" data-copy-mode="commands" role="menuitem" tabindex="-1">${this._t('copyCommandsOnly')}</button>
                <button class="copy-menu-item" data-copy-mode="output" role="menuitem" tabindex="-1">${this._t('copyOutputOnly')}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="terminal-body" role="log" aria-live="polite" aria-relevant="additions">
          <slot name="before-output"></slot>
          <div class="output" role="list" aria-label="${this._t('terminalOutput')}"></div>
          <div class="input-line" style="${this.config.readonly ? 'display: none' : ''}">
            <span class="input-prompt" aria-hidden="true">${this._escapeHtml(this.config.prompt)}</span>
            <span class="input-display">
              <span class="input-text"></span>
              <span class="cursor" aria-hidden="true"></span>
            </span>
            <input type="text"
                   class="hidden-input"
                   autocomplete="off"
                   autocorrect="off"
                   autocapitalize="off"
                   spellcheck="false"
                   aria-label="${this._t('terminalInputLabel')}"
                   role="textbox" />
          </div>
        </div>
      </div>
    `;
  }
}

// Register the custom element
if (!customElements.get('terminal-window')) {
  customElements.define('terminal-window', TerminalWindow);
}

export default TerminalWindow;