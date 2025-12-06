/**
 * TerminalWindow Web Component
 * A vanilla JavaScript web component that simulates a terminal console
 * with customizable commands, themes, cursor styles, and typing effects.
 *
 * @version 2.0.0
 * @license MIT
 */

class TerminalWindow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Command registry - users can register functions that return strings
    this.commands = new Map();

    // Command aliases
    this.aliases = new Map();

    // Command history for up/down navigation
    this.commandHistory = [];
    this.historyIndex = -1;

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

    if (!this.config.readonly) {
      this._focusInput();
    }

    // Show welcome message if provided
    const welcome = this.getAttribute('welcome');
    if (welcome) {
      this.print(welcome);
    }

    // Announce to screen readers
    this._announce('Terminal ready');
  }

  disconnectedCallback() {
    // Cleanup if needed
  }

  static get observedAttributes() {
    return [
      'theme', 'prompt', 'cursor-style', 'cursor-blink',
      'font-family', 'font-size', 'line-height',
      'typing-effect', 'typing-speed',
      'show-header', 'title', 'show-controls', 'show-copy', 'show-theme-toggle',
      'readonly', 'max-lines'
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
    const copyBtn = this.shadowRoot.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.style.display = this.config.showCopy ? 'inline-block' : 'none';
    }
  }

  /**
   * Update theme toggle visibility
   */
  _updateThemeToggleVisibility() {
    const themeBtn = this.shadowRoot.querySelector('.theme-btn');
    if (themeBtn) {
      themeBtn.style.display = this.config.showThemeToggle ? 'inline-block' : 'none';
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
   * Register built-in commands
   */
  _registerBuiltInCommands() {
    this.registerCommand('help', () => {
      const cmds = Array.from(this.commands.keys()).sort();
      return `Available commands:\n${cmds.map(c => `  ${c}`).join('\n')}`;
    });

    this.registerCommand('clear', () => {
      this.clear();
      return null; // Don't print anything
    });

    this.registerCommand('echo', (args) => {
      return args.join(' ');
    });

    this.registerCommand('history', () => {
      if (this.commandHistory.length === 0) {
        return 'No commands in history.';
      }
      return this.commandHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n');
    });

    this.registerCommand('date', () => {
      return new Date().toString();
    });
  }

  /**
   * Register a command handler
   * @param {string} name - Command name
   * @param {Function} handler - Function that receives args array and returns string or null
   */
  registerCommand(name, handler) {
    this.commands.set(name.toLowerCase(), handler);
  }

  /**
   * Unregister a command
   * @param {string} name - Command name
   */
  unregisterCommand(name) {
    this.commands.delete(name.toLowerCase());
  }

  /**
   * Register a command alias
   * @param {string} alias - Alias name
   * @param {string} command - Command to execute
   */
  registerAlias(alias, command) {
    this.aliases.set(alias.toLowerCase(), command);
  }

  /**
   * Execute a command
   * @param {string} input - Full command string
   * @param {boolean} addToHistory - Whether to add to history (default true)
   */
  async executeCommand(input, addToHistory = true) {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add to history
    if (addToHistory) {
      this.commandHistory.push(trimmed);
      this.historyIndex = this.commandHistory.length;
    }

    // Print the command line
    this._printCommandLine(trimmed);

    // Check for alias
    let resolved = trimmed;
    const firstWord = trimmed.split(' ')[0].toLowerCase();
    if (this.aliases.has(firstWord)) {
      resolved = this.aliases.get(firstWord) + trimmed.slice(firstWord.length);
    }

    // Parse command and arguments
    const parts = this._parseCommand(resolved);
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Find and execute command
    const handler = this.commands.get(cmdName);

    if (handler) {
      try {
        const result = await handler(args, this);
        if (result !== null && result !== undefined) {
          await this.print(String(result));
        }
      } catch (error) {
        await this.print(`Error: ${error.message}`, 'error');
      }
    } else {
      await this.print(`Command not found: ${cmdName}. Type 'help' for available commands.`, 'error');
    }

    // Dispatch command event
    this.dispatchEvent(new CustomEvent('command', {
      detail: { command: cmdName, args, input: trimmed },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Execute multiple commands with delays (for demos/presentations)
   * @param {Array} commands - Array of {command, delay} objects or strings
   * @param {number} defaultDelay - Default delay between commands in ms
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
   * Parse command string into parts (handles quotes)
   */
  _parseCommand(input) {
    const parts = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (!inQuote && (char === '"' || char === "'")) {
        inQuote = true;
        quoteChar = char;
      } else if (inQuote && char === quoteChar) {
        inQuote = false;
        quoteChar = '';
      } else if (!inQuote && char === ' ') {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
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
   * Print text to the terminal
   * @param {string} text - Text to print
   * @param {string} type - Line type (output, error, info, success)
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
   * Check if user prefers reduced motion
   */
  _prefersReducedMotion() {
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
   * Cancel the current typing effect and show all remaining text immediately
   */
  skipTypingEffect() {
    if (this._typingInProgress) {
      this._typingCancelled = true;
    }
  }

  /**
   * Delay helper for typing effect
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear the terminal
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
    // ANSI color code mappings
    const ansiColors = {
      '30': 'ansi-black',
      '31': 'ansi-red',
      '32': 'ansi-green',
      '33': 'ansi-yellow',
      '34': 'ansi-blue',
      '35': 'ansi-magenta',
      '36': 'ansi-cyan',
      '37': 'ansi-white',
      '90': 'ansi-bright-black',
      '91': 'ansi-bright-red',
      '92': 'ansi-bright-green',
      '93': 'ansi-bright-yellow',
      '94': 'ansi-bright-blue',
      '95': 'ansi-bright-magenta',
      '96': 'ansi-bright-cyan',
      '97': 'ansi-bright-white',
    };

    const ansiBgColors = {
      '40': 'ansi-bg-black',
      '41': 'ansi-bg-red',
      '42': 'ansi-bg-green',
      '43': 'ansi-bg-yellow',
      '44': 'ansi-bg-blue',
      '45': 'ansi-bg-magenta',
      '46': 'ansi-bg-cyan',
      '47': 'ansi-bg-white',
    };

    // Match ANSI escape sequences
    const ansiRegex = /\x1b\[([0-9;]+)m/g;
    let result = '';
    let lastIndex = 0;
    let currentClasses = [];
    let match;

    while ((match = ansiRegex.exec(text)) !== null) {
      // Add text before this match
      if (match.index > lastIndex) {
        const textBefore = this._escapeHtml(text.slice(lastIndex, match.index));
        if (currentClasses.length > 0) {
          result += `<span class="${currentClasses.join(' ')}">${textBefore}</span>`;
        } else {
          result += textBefore;
        }
      }

      // Parse the codes
      const codes = match[1].split(';');
      for (const code of codes) {
        if (code === '0') {
          // Reset
          currentClasses = [];
        } else if (code === '1') {
          currentClasses.push('ansi-bold');
        } else if (code === '3') {
          currentClasses.push('ansi-italic');
        } else if (code === '4') {
          currentClasses.push('ansi-underline');
        } else if (ansiColors[code]) {
          // Remove any existing color class
          currentClasses = currentClasses.filter(c => !c.startsWith('ansi-') || c.startsWith('ansi-bg-') || c.startsWith('ansi-bold') || c.startsWith('ansi-italic') || c.startsWith('ansi-underline'));
          currentClasses.push(ansiColors[code]);
        } else if (ansiBgColors[code]) {
          currentClasses = currentClasses.filter(c => !c.startsWith('ansi-bg-'));
          currentClasses.push(ansiBgColors[code]);
        }
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remaining = this._escapeHtml(text.slice(lastIndex));
      if (currentClasses.length > 0) {
        result += `<span class="${currentClasses.join(' ')}">${remaining}</span>`;
      } else {
        result += remaining;
      }
    }

    return result || this._escapeHtml(text);
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
   * Render the output area (full re-render)
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
   * Scroll to bottom of terminal
   */
  _scrollToBottom() {
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
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    const input = this.shadowRoot.querySelector('.hidden-input');
    const terminal = this.shadowRoot.querySelector('.terminal');

    // Focus input when clicking anywhere in terminal
    terminal.addEventListener('click', () => {
      if (!this.config.readonly) {
        this._focusInput();
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
            this._printCommandLine(this.currentInput + '^C');
            this.currentInput = '';
            input.value = '';
            this._updateInputDisplay();
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

      // Handle menu items
      copyMenu.querySelectorAll('.copy-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const mode = item.dataset.copyMode;
          this.copyContent(mode);
          copyMenu.style.display = 'none';
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
    const newIndex = this.historyIndex + direction;

    if (newIndex < 0) return;
    if (newIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length;
      this.currentInput = '';
    } else {
      this.historyIndex = newIndex;
      this.currentInput = this.commandHistory[this.historyIndex];
    }

    const input = this.shadowRoot.querySelector('.hidden-input');
    input.value = this.currentInput;
    this._updateInputDisplay();
  }

  /**
   * Autocomplete command
   */
  _autocomplete() {
    const parts = this.currentInput.split(' ');
    const cmdPart = parts[0].toLowerCase();

    if (parts.length === 1 && cmdPart) {
      const matches = Array.from(this.commands.keys())
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
   * Set input masking (for password prompts)
   */
  setInputMask(masked) {
    this.inputMasked = masked;
    this._updateInputDisplay();
  }

  /**
   * Copy terminal content to clipboard
   * @param {string} mode - Copy mode: 'all', 'commands', 'output', 'selection'
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
          this._showCopyFeedback('No selection');
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
      this._showCopyFeedback('Nothing to copy');
      return;
    }

    await this._copyToClipboard(text, mode);
  }

  /**
   * Internal method to copy text to clipboard
   */
  async _copyToClipboard(text, mode = 'all') {
    try {
      await navigator.clipboard.writeText(text);
      this._showCopyFeedback('Copied!');
      this._announce(`${mode === 'all' ? 'Content' : mode.charAt(0).toUpperCase() + mode.slice(1)} copied to clipboard`);
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
      this._showCopyFeedback('Copied!');
      this._announce(`${mode === 'all' ? 'Content' : mode.charAt(0).toUpperCase() + mode.slice(1)} copied to clipboard`);
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
    const menu = this.shadowRoot.querySelector('.copy-menu');
    if (menu) {
      const isVisible = menu.style.display === 'block';
      menu.style.display = isVisible ? 'none' : 'block';

      // Close menu when clicking outside
      if (!isVisible) {
        const closeHandler = (e) => {
          if (!e.composedPath().includes(menu) && !e.composedPath().includes(this.shadowRoot.querySelector('.copy-btn'))) {
            menu.style.display = 'none';
            document.removeEventListener('click', closeHandler);
          }
        };
        setTimeout(() => document.addEventListener('click', closeHandler), 0);
      }
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
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.classList.remove('copy-success');
    }, 1500);
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    this.config.theme = this.config.theme === 'dark' ? 'light' : 'dark';
    this.setAttribute('theme', this.config.theme);
    this._updateStyles();
    this._announce(`Theme changed to ${this.config.theme}`);
  }

  /**
   * Close the terminal (hide it)
   */
  close() {
    this.style.display = 'none';
    this._announce('Terminal closed');

    this.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Minimize the terminal
   */
  minimize() {
    this.isMinimized = !this.isMinimized;
    const terminalBody = this.shadowRoot.querySelector('.terminal-body');

    if (terminalBody) {
      terminalBody.style.display = this.isMinimized ? 'none' : 'block';
    }

    this._announce(this.isMinimized ? 'Terminal minimized' : 'Terminal restored');

    this.dispatchEvent(new CustomEvent('minimize', {
      detail: { minimized: this.isMinimized },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Toggle fullscreen mode (maximize)
   */
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    const terminal = this.shadowRoot.querySelector('.terminal');
    const maximizeBtn = this.shadowRoot.querySelector('.control.maximize');

    if (terminal) {
      terminal.classList.toggle('fullscreen', this.isFullscreen);
    }

    if (maximizeBtn) {
      maximizeBtn.title = this.isFullscreen ? 'Exit fullscreen' : 'Maximize';
      maximizeBtn.setAttribute('aria-label', this.isFullscreen ? 'Exit fullscreen' : 'Toggle fullscreen');
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

    this._announce(this.isFullscreen ? 'Entered fullscreen mode' : 'Exited fullscreen mode');

    this.dispatchEvent(new CustomEvent('fullscreen', {
      detail: { fullscreen: this.isFullscreen },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Set theme programmatically
   */
  setTheme(theme) {
    this.config.theme = theme;
    this.setAttribute('theme', theme);
    this._updateStyles();
  }

  /**
   * Set prompt programmatically
   */
  setPrompt(prompt) {
    this.config.prompt = prompt;
    this.setAttribute('prompt', prompt);
    this._updateStyles();
  }

  /**
   * Set cursor style programmatically
   */
  setCursorStyle(style) {
    this.config.cursorStyle = style;
    this.setAttribute('cursor-style', style);
    this._updateStyles();
  }

  /**
   * Set cursor blink programmatically
   */
  setCursorBlink(blink) {
    this.config.cursorBlink = blink;
    this.setAttribute('cursor-blink', String(blink));
    this._updateStyles();
  }

  /**
   * Enable/disable typing effect
   */
  setTypingEffect(enabled, speed = 30) {
    this.config.typingEffect = enabled;
    this.config.typingSpeed = speed;
    this.setAttribute('typing-effect', String(enabled));
    this.setAttribute('typing-speed', String(speed));
  }

  /**
   * Set readonly mode
   */
  setReadonly(readonly) {
    this.config.readonly = readonly;
    this.setAttribute('readonly', String(readonly));
    this._updateReadonlyState();
  }

  /**
   * Set i18n strings for localization
   * @param {Object} strings - Object with string keys to override
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
   * Get current i18n strings
   * @returns {Object} Current i18n configuration
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
   * Get command history
   * @returns {string[]} Array of previously executed commands
   */
  getHistory() {
    return [...this.commandHistory];
  }

  /**
   * Set command history
   * @param {string[]} history - Array of commands to set as history
   */
  setHistory(history) {
    if (Array.isArray(history)) {
      this.commandHistory = history.map(cmd => String(cmd));
      this.historyIndex = this.commandHistory.length;
    }
  }

  /**
   * Clear command history
   */
  clearHistory() {
    this.commandHistory = [];
    this.historyIndex = -1;
  }

  /**
   * Get all output as text
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
   * Focus the terminal
   */
  focus() {
    this._focusInput();
  }

  /**
   * Render the component
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
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
            <button class="control close" title="Close" aria-label="Close terminal"></button>
            <button class="control minimize" title="Minimize" aria-label="Minimize terminal"></button>
            <button class="control maximize" title="Maximize" aria-label="Toggle fullscreen"></button>
          </div>
          <div class="terminal-title">${this._escapeHtml(this.config.title)}</div>
          <div class="terminal-actions">
            <button class="theme-btn"
                    title="Toggle theme (${this.config.theme === 'dark' ? 'switch to light' : 'switch to dark'})"
                    aria-label="Toggle theme"
                    style="${this.config.showThemeToggle ? '' : 'display: none'}">
              <span class="theme-icon"></span>
            </button>
            <div class="copy-wrapper" style="${this.config.showCopy ? '' : 'display: none'}">
              <button class="copy-btn"
                      title="Copy terminal content (click for options)"
                      aria-label="Copy terminal content"
                      aria-haspopup="menu">Copy</button>
              <div class="copy-menu" role="menu" aria-label="Copy options">
                <button class="copy-menu-item" data-copy-mode="all" role="menuitem">Copy All</button>
                <button class="copy-menu-item" data-copy-mode="commands" role="menuitem">Copy Commands Only</button>
                <button class="copy-menu-item" data-copy-mode="output" role="menuitem">Copy Output Only</button>
              </div>
            </div>
          </div>
        </div>
        <div class="terminal-body" role="log" aria-live="polite" aria-relevant="additions">
          <div class="output" role="list" aria-label="Terminal output"></div>
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
                   aria-label="Terminal input. Type a command and press Enter."
                   role="textbox" />
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get component styles
   */
  getStyles() {
    return `
      :host {
        display: block;
        height: 100%;
      }

      * {
        box-sizing: border-box;
      }

      /* Screen reader only content */
      .sr-announcer {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* ===== CSS Custom Properties (User Customizable) ===== */
      .terminal {
        /* Font settings */
        --font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        --font-size: 14px;
        --line-height: 1.4;

        /* Cursor settings */
        --cursor-width: 8px;
        --cursor-height: 1.2em;
        --cursor-blink-speed: 1s;
      }

      /* ===== DARK THEME ===== */
      .terminal[data-theme="dark"] {
        --bg-primary: #1a1a2e;
        --bg-secondary: #16213e;
        --bg-header: #0f0f23;
        --border-color: #2a2a4a;
        --text-primary: #e0e0e0;
        --text-secondary: #888;
        --text-muted: #666;

        --prompt-color: #50fa7b;
        --cursor-color: #50fa7b;
        --command-color: #f8f8f2;
        --output-color: #e0e0e0;
        --error-color: #ff5555;
        --info-color: #8be9fd;
        --success-color: #50fa7b;

        --selection-bg: rgba(80, 250, 123, 0.3);

        --btn-bg: #2a2a4a;
        --btn-hover: #3a3a5a;
        --btn-text: #e0e0e0;

        --scrollbar-track: #1a1a2e;
        --scrollbar-thumb: #3a3a5a;
        --scrollbar-thumb-hover: #4a4a6a;

        --control-close: #ff5f56;
        --control-minimize: #ffbd2e;
        --control-maximize: #27c93f;

        --theme-icon: "\\263E"; /* Moon */

        /* ANSI colors */
        --ansi-black: #21222c;
        --ansi-red: #ff5555;
        --ansi-green: #50fa7b;
        --ansi-yellow: #f1fa8c;
        --ansi-blue: #bd93f9;
        --ansi-magenta: #ff79c6;
        --ansi-cyan: #8be9fd;
        --ansi-white: #f8f8f2;
        --ansi-bright-black: #6272a4;
        --ansi-bright-red: #ff6e6e;
        --ansi-bright-green: #69ff94;
        --ansi-bright-yellow: #ffffa5;
        --ansi-bright-blue: #d6acff;
        --ansi-bright-magenta: #ff92df;
        --ansi-bright-cyan: #a4ffff;
        --ansi-bright-white: #ffffff;
      }

      /* ===== LIGHT THEME ===== */
      .terminal[data-theme="light"] {
        --bg-primary: #fafafa;
        --bg-secondary: #f0f0f0;
        --bg-header: #e8e8e8;
        --border-color: #d0d0d0;
        --text-primary: #333;
        --text-secondary: #666;
        --text-muted: #999;

        --prompt-color: #16a34a;
        --cursor-color: #16a34a;
        --command-color: #1a1a1a;
        --output-color: #333;
        --error-color: #dc2626;
        --info-color: #0284c7;
        --success-color: #16a34a;

        --selection-bg: rgba(22, 163, 74, 0.2);

        --btn-bg: #e0e0e0;
        --btn-hover: #d0d0d0;
        --btn-text: #333;

        --scrollbar-track: #f0f0f0;
        --scrollbar-thumb: #c0c0c0;
        --scrollbar-thumb-hover: #a0a0a0;

        --control-close: #ff5f56;
        --control-minimize: #ffbd2e;
        --control-maximize: #27c93f;

        --theme-icon: "\\2600"; /* Sun */

        /* ANSI colors (adjusted for light theme) */
        --ansi-black: #000000;
        --ansi-red: #c41a16;
        --ansi-green: #007400;
        --ansi-yellow: #826b28;
        --ansi-blue: #0000ff;
        --ansi-magenta: #a90d91;
        --ansi-cyan: #318495;
        --ansi-white: #666666;
        --ansi-bright-black: #666666;
        --ansi-bright-red: #eb3223;
        --ansi-bright-green: #1cdc23;
        --ansi-bright-yellow: #cdcd00;
        --ansi-bright-blue: #5c5cff;
        --ansi-bright-magenta: #eb3eb3;
        --ansi-bright-cyan: #23cece;
        --ansi-bright-white: #c7c7c7;
      }

      /* ANSI color classes */
      .ansi-black { color: var(--ansi-black); }
      .ansi-red { color: var(--ansi-red); }
      .ansi-green { color: var(--ansi-green); }
      .ansi-yellow { color: var(--ansi-yellow); }
      .ansi-blue { color: var(--ansi-blue); }
      .ansi-magenta { color: var(--ansi-magenta); }
      .ansi-cyan { color: var(--ansi-cyan); }
      .ansi-white { color: var(--ansi-white); }
      .ansi-bright-black { color: var(--ansi-bright-black); }
      .ansi-bright-red { color: var(--ansi-bright-red); }
      .ansi-bright-green { color: var(--ansi-bright-green); }
      .ansi-bright-yellow { color: var(--ansi-bright-yellow); }
      .ansi-bright-blue { color: var(--ansi-bright-blue); }
      .ansi-bright-magenta { color: var(--ansi-bright-magenta); }
      .ansi-bright-cyan { color: var(--ansi-bright-cyan); }
      .ansi-bright-white { color: var(--ansi-bright-white); }
      .ansi-bold { font-weight: bold; }
      .ansi-italic { font-style: italic; }
      .ansi-underline { text-decoration: underline; }
      .ansi-bg-black { background-color: var(--ansi-black); }
      .ansi-bg-red { background-color: var(--ansi-red); }
      .ansi-bg-green { background-color: var(--ansi-green); }
      .ansi-bg-yellow { background-color: var(--ansi-yellow); }
      .ansi-bg-blue { background-color: var(--ansi-blue); }
      .ansi-bg-magenta { background-color: var(--ansi-magenta); }
      .ansi-bg-cyan { background-color: var(--ansi-cyan); }
      .ansi-bg-white { background-color: var(--ansi-white); }

      /* ===== Terminal Container ===== */
      .terminal {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;
        font-family: var(--font-family);
        font-size: var(--font-size);
        line-height: var(--line-height);
        color: var(--text-primary);
      }

      /* Focus outline for accessibility */
      .terminal:focus-within {
        outline: 2px solid var(--prompt-color);
        outline-offset: 2px;
      }

      /* ===== Terminal Header ===== */
      .terminal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        background: var(--bg-header);
        border-bottom: 1px solid var(--border-color);
        user-select: none;
      }

      .window-controls {
        display: flex;
        gap: 8px;
      }

      .control {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: opacity 0.15s ease, transform 0.15s ease;
      }

      .control:hover {
        opacity: 0.8;
        transform: scale(1.1);
      }

      .control:active {
        transform: scale(0.95);
      }

      .control.close {
        background: var(--control-close);
      }

      .control.minimize {
        background: var(--control-minimize);
      }

      .control.maximize {
        background: var(--control-maximize);
      }

      .terminal-title {
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 500;
      }

      .terminal-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .theme-btn,
      .copy-btn {
        padding: 4px 10px;
        background: var(--btn-bg);
        color: var(--btn-text);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-family: inherit;
        transition: background 0.2s;
      }

      .theme-btn {
        padding: 4px 8px;
        font-size: 14px;
      }

      .theme-btn::before {
        content: var(--theme-icon);
      }

      .theme-btn:hover,
      .copy-btn:hover {
        background: var(--btn-hover);
      }

      .theme-btn:focus,
      .copy-btn:focus {
        outline: 2px solid var(--prompt-color);
        outline-offset: 2px;
      }

      /* Copy button success state */
      .copy-btn.copy-success {
        background: var(--success-color, #50fa7b);
        color: var(--bg-primary);
      }

      /* Copy menu wrapper and dropdown */
      .copy-wrapper {
        position: relative;
      }

      .copy-menu {
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 4px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        min-width: 160px;
        overflow: hidden;
      }

      .copy-menu-item {
        display: block;
        width: 100%;
        padding: 8px 12px;
        background: transparent;
        border: none;
        color: var(--text-primary);
        font-size: 12px;
        font-family: inherit;
        text-align: left;
        cursor: pointer;
        transition: background 0.15s;
      }

      .copy-menu-item:hover {
        background: var(--btn-hover);
      }

      .copy-menu-item:focus {
        background: var(--btn-hover);
        outline: none;
      }

      /* ===== Terminal Body ===== */
      .terminal-body {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .terminal-body::-webkit-scrollbar {
        width: 8px;
      }

      .terminal-body::-webkit-scrollbar-track {
        background: var(--scrollbar-track);
      }

      .terminal-body::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb);
        border-radius: 4px;
      }

      .terminal-body::-webkit-scrollbar-thumb:hover {
        background: var(--scrollbar-thumb-hover);
      }

      /* ===== Output ===== */
      .output {
        margin-bottom: 4px;
      }

      .output-line {
        padding: 2px 0;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .output-line::selection,
      .output-line *::selection {
        background: var(--selection-bg);
      }

      .line-command {
        color: var(--command-color);
      }

      .line-command .line-prompt {
        color: var(--prompt-color);
        font-weight: bold;
      }

      .line-output {
        color: var(--output-color);
      }

      .line-error {
        color: var(--error-color);
      }

      .line-info {
        color: var(--info-color);
      }

      .line-success {
        color: var(--success-color);
      }

      /* ===== Input Line ===== */
      .input-line {
        display: flex;
        align-items: center;
      }

      .terminal[data-readonly="true"] .input-line {
        display: none;
      }

      .input-prompt {
        color: var(--prompt-color);
        font-weight: bold;
        flex-shrink: 0;
        white-space: pre;
      }

      .input-display {
        display: flex;
        align-items: center;
        flex: 1;
        min-height: 1.4em;
      }

      .input-text {
        color: var(--command-color);
        white-space: pre;
      }

      .hidden-input {
        position: absolute;
        left: -9999px;
        opacity: 0;
        width: 1px;
        height: 1px;
      }

      /* ===== Cursor Styles ===== */
      .cursor {
        display: inline-block;
        background: var(--cursor-color);
        margin-left: 1px;
      }

      /* Block cursor */
      .terminal[data-cursor-style="block"] .cursor {
        width: var(--cursor-width);
        height: var(--cursor-height);
      }

      /* Underline cursor */
      .terminal[data-cursor-style="underline"] .cursor {
        width: var(--cursor-width);
        height: 2px;
        align-self: flex-end;
        margin-bottom: 3px;
      }

      /* Bar cursor */
      .terminal[data-cursor-style="bar"] .cursor {
        width: 2px;
        height: var(--cursor-height);
      }

      /* Blinking cursor animation */
      @keyframes blink {
        0%, 49% {
          opacity: 1;
        }
        50%, 100% {
          opacity: 0;
        }
      }

      .terminal[data-cursor-blink="true"] .cursor {
        animation: blink var(--cursor-blink-speed) step-start infinite;
      }

      /* Typing cursor (shown during typing effect) */
      .typing-cursor {
        display: inline-block;
        width: var(--cursor-width);
        height: var(--cursor-height);
        background: var(--cursor-color);
        margin-left: 1px;
        animation: blink var(--cursor-blink-speed) step-start infinite;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .terminal {
          border-width: 2px;
        }
        .terminal:focus-within {
          outline-width: 3px;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .terminal[data-cursor-blink="true"] .cursor {
          animation: none;
          opacity: 1;
        }
        .theme-btn,
        .copy-btn,
        .control {
          transition: none;
        }
      }

      /* ===== Fullscreen Mode ===== */
      .terminal.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        z-index: 99999;
        border-radius: 0;
        border: none;
      }

      .terminal.fullscreen .terminal-header {
        border-radius: 0;
      }
    `;
  }
}

// Register the custom element
if (!customElements.get('terminal-window')) {
  customElements.define('terminal-window', TerminalWindow);
}

export default TerminalWindow;

