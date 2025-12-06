import { AnsiParser } from './internals/ansi-parser.js';
import { CommandRegistry } from './internals/command-registry.js';
import { HistoryManager } from './internals/history-manager.js';
import { styles } from './styles.js';

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
   * Register a command handler
   * @param {string} name - Command name
   * @param {Function} handler - Function that receives args array and returns string or null
   */
  registerCommand(name, handler) {
    this.commandRegistry.register(name, handler);
  }

  /**
   * Unregister a command
   * @param {string} name - Command name
   */
  unregisterCommand(name) {
    this.commandRegistry.unregister(name);
  }

  /**
   * Register a command alias
   * @param {string} alias - Alias name
   * @param {string} command - Command to execute
   */
  registerAlias(alias, command) {
    this.commandRegistry.registerAlias(alias, command);
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
   * Force scroll to bottom (ignores auto-scroll setting)
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
    terminal.addEventListener('click', () => {
      if (this._typingInProgress) {
        this.skipTypingEffect();
      }
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
   * Toggle between light and dark theme
   */
  toggleTheme() {
    this.config.theme = this.config.theme === 'dark' ? 'light' : 'dark';
    this.setAttribute('theme', this.config.theme);
    this._updateStyles();
    this._announce(`${this._t('themeChangedTo')} ${this.config.theme}`);
    this._focusInput();
  }

  /**
   * Close the terminal (hide it)
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
   * Minimize the terminal
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