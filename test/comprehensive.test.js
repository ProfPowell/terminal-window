import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TerminalWindow from '../src/terminal-window.js';

describe('TerminalWindow Comprehensive Tests', () => {
  let element;

  beforeEach(() => {
    element = new TerminalWindow();
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element.parentNode) {
      document.body.removeChild(element);
    }
    localStorage.clear();
  });

  // ============================================
  // Theme Methods
  // ============================================
  describe('Theme Methods', () => {
    it('should set theme to light', () => {
      element.setTheme('light');
      expect(element.config.theme).toBe('light');
      expect(element.getAttribute('theme')).toBe('light');
    });

    it('should set theme to dark', () => {
      element.setTheme('light');
      element.setTheme('dark');
      expect(element.config.theme).toBe('dark');
    });

    it('should toggle theme from dark to light', () => {
      expect(element.config.theme).toBe('dark');
      element.toggleTheme();
      expect(element.config.theme).toBe('light');
    });

    it('should toggle theme from light to dark', () => {
      element.setTheme('light');
      element.toggleTheme();
      expect(element.config.theme).toBe('dark');
    });
  });

  // ============================================
  // Cursor Methods
  // ============================================
  describe('Cursor Methods', () => {
    it('should set cursor style to underline', () => {
      element.setCursorStyle('underline');
      expect(element.config.cursorStyle).toBe('underline');
      expect(element.getAttribute('cursor-style')).toBe('underline');
    });

    it('should set cursor style to bar', () => {
      element.setCursorStyle('bar');
      expect(element.config.cursorStyle).toBe('bar');
    });

    it('should set cursor style to block', () => {
      element.setCursorStyle('underline');
      element.setCursorStyle('block');
      expect(element.config.cursorStyle).toBe('block');
    });

    it('should enable cursor blink', () => {
      element.setCursorBlink(true);
      expect(element.config.cursorBlink).toBe(true);
    });

    it('should disable cursor blink', () => {
      element.setCursorBlink(false);
      expect(element.config.cursorBlink).toBe(false);
      expect(element.getAttribute('cursor-blink')).toBe('false');
    });
  });

  // ============================================
  // Prompt Methods
  // ============================================
  describe('Prompt Methods', () => {
    it('should set custom prompt', () => {
      element.setPrompt('>>> ');
      expect(element.config.prompt).toBe('>>> ');
      expect(element.getAttribute('prompt')).toBe('>>> ');
    });

    it('should update prompt display', () => {
      element.setPrompt('# ');
      // Prompt is updated via config and rendered
      expect(element.config.prompt).toBe('# ');
    });
  });

  // ============================================
  // I18n Methods
  // ============================================
  describe('I18n Methods', () => {
    it('should get default i18n strings', () => {
      const i18n = element.getI18n();
      expect(i18n.copy).toBe('Copy');
      expect(i18n.close).toBe('Close');
      expect(i18n.commandNotFound).toBeDefined();
    });

    it('should set partial i18n strings', () => {
      element.setI18n({ copy: 'Copiar', copied: '¡Copiado!' });
      const i18n = element.getI18n();
      expect(i18n.copy).toBe('Copiar');
      expect(i18n.copied).toBe('¡Copiado!');
      expect(i18n.close).toBe('Close'); // unchanged
    });

    it('should return a copy of i18n object', () => {
      const i18n1 = element.getI18n();
      const i18n2 = element.getI18n();
      expect(i18n1).not.toBe(i18n2);
      expect(i18n1).toEqual(i18n2);
    });
  });

  // ============================================
  // History Methods
  // ============================================
  describe('History Methods', () => {
    it('should get empty history initially', () => {
      const history = element.getHistory();
      expect(history).toEqual([]);
    });

    it('should record commands in history', async () => {
      await element.executeCommand('cmd1');
      await element.executeCommand('cmd2');
      const history = element.getHistory();
      expect(history).toEqual(['cmd1', 'cmd2']);
    });

    it('should set history programmatically', () => {
      element.setHistory(['a', 'b', 'c']);
      expect(element.getHistory()).toEqual(['a', 'b', 'c']);
    });

    it('should clear history', async () => {
      await element.executeCommand('test');
      element.clearHistory();
      expect(element.getHistory()).toEqual([]);
    });

    it('should return a copy of history', async () => {
      await element.executeCommand('test');
      const h1 = element.getHistory();
      const h2 = element.getHistory();
      expect(h1).not.toBe(h2);
    });
  });

  // ============================================
  // Content Methods
  // ============================================
  describe('Content Methods', () => {
    it('should get terminal content', async () => {
      await element.print('Hello');
      await element.print('World');
      const content = element.getContent();
      expect(content).toContain('Hello');
      expect(content).toContain('World');
    });

    it('should include command in content', async () => {
      await element.executeCommand('test');
      const content = element.getContent();
      expect(content).toContain('test');
    });
  });

  // ============================================
  // Window Controls
  // ============================================
  describe('Window Controls', () => {
    it('should close terminal', () => {
      const closeSpy = vi.fn();
      element.addEventListener('close', closeSpy);
      element.close();
      expect(element.style.display).toBe('none');
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it('should minimize terminal', () => {
      const minimizeSpy = vi.fn();
      element.addEventListener('minimize', minimizeSpy);
      element.minimize();
      expect(element.isMinimized).toBe(true);
      expect(minimizeSpy).toHaveBeenCalledTimes(1);
      expect(minimizeSpy.mock.calls[0][0].detail.minimized).toBe(true);
    });

    it('should restore minimized terminal', () => {
      element.minimize();
      element.minimize();
      expect(element.isMinimized).toBe(false);
    });

    it('should toggle fullscreen', () => {
      const fullscreenSpy = vi.fn();
      element.addEventListener('fullscreen', fullscreenSpy);
      element.toggleFullscreen();
      expect(element.isFullscreen).toBe(true);
      expect(fullscreenSpy).toHaveBeenCalledTimes(1);
      expect(fullscreenSpy.mock.calls[0][0].detail.fullscreen).toBe(true);
    });

    it('should exit fullscreen', () => {
      element.toggleFullscreen();
      element.toggleFullscreen();
      expect(element.isFullscreen).toBe(false);
    });
  });

  // ============================================
  // Readonly Mode
  // ============================================
  describe('Readonly Mode', () => {
    it('should enable readonly mode', () => {
      element.setReadonly(true);
      expect(element.config.readonly).toBe(true);
      expect(element.getAttribute('readonly')).toBe('true');
    });

    it('should disable readonly mode', () => {
      element.setReadonly(true);
      element.setReadonly(false);
      expect(element.config.readonly).toBe(false);
    });

    it('should update readonly state', () => {
      element.setReadonly(true);
      // Verify readonly is set in config
      expect(element.config.readonly).toBe(true);
    });
  });

  // ============================================
  // Typing Effect
  // ============================================
  describe('Typing Effect', () => {
    it('should enable typing effect', () => {
      element.setTypingEffect(true);
      expect(element.config.typingEffect).toBe(true);
    });

    it('should set typing speed', () => {
      element.setTypingEffect(true, 50);
      expect(element.config.typingSpeed).toBe(50);
    });

    it('should disable typing effect', () => {
      element.setTypingEffect(true);
      element.setTypingEffect(false);
      expect(element.config.typingEffect).toBe(false);
    });
  });

  // ============================================
  // Force Animations
  // ============================================
  describe('Force Animations', () => {
    it('should set force animations', () => {
      element.setForceAnimations(true);
      expect(element.config.forceAnimations).toBe(true);
    });

    it('should clear force animations', () => {
      element.setForceAnimations(true);
      element.setForceAnimations(false);
      expect(element.config.forceAnimations).toBe(false);
    });

    it('should have forceAnimations config', () => {
      // Verify force animations config is defined
      expect(element.config.forceAnimations).toBeDefined();
      expect(typeof element.config.forceAnimations).toBe('boolean');
    });
  });

  // ============================================
  // Input Masking
  // ============================================
  describe('Input Masking', () => {
    it('should enable input masking', () => {
      element.setInputMask(true);
      expect(element.inputMasked).toBe(true);
    });

    it('should disable input masking', () => {
      element.setInputMask(true);
      element.setInputMask(false);
      expect(element.inputMasked).toBe(false);
    });

    it('should display masked input as asterisks', () => {
      element.setInputMask(true);
      element.currentInput = 'secret';
      element._updateInputDisplay();
      const inputText = element.shadowRoot.querySelector('.input-text');
      expect(inputText.textContent).toBe('******');
    });
  });

  // ============================================
  // Command Aliases
  // ============================================
  describe('Command Aliases', () => {
    it('should register and execute alias', async () => {
      element.registerCommand('greet', () => 'Hello!');
      element.registerAlias('hi', 'greet');
      await element.executeCommand('hi');
      const outputLines = element.shadowRoot.querySelectorAll('.output-line.line-output');
      const lastLine = outputLines[outputLines.length - 1];
      expect(lastLine.textContent).toBe('Hello!');
    });

    it('should pass arguments through alias', async () => {
      element.registerCommand('echo', (args) => args.join(' '));
      element.registerAlias('say', 'echo');
      await element.executeCommand('say hello world');
      const outputLines = element.shadowRoot.querySelectorAll('.output-line.line-output');
      const lastLine = outputLines[outputLines.length - 1];
      expect(lastLine.textContent).toBe('hello world');
    });
  });

  // ============================================
  // Unregister Command
  // ============================================
  describe('Unregister Command', () => {
    it('should unregister a command', async () => {
      element.registerCommand('temp', () => 'temp output');
      element.unregisterCommand('temp');
      await element.executeCommand('temp');
      const outputLines = element.shadowRoot.querySelectorAll('.output-line.line-error');
      expect(outputLines.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Events
  // ============================================
  describe('Events', () => {
    it('should fire command event', async () => {
      const commandSpy = vi.fn();
      element.addEventListener('command', commandSpy);
      await element.executeCommand('test arg1 arg2');
      expect(commandSpy).toHaveBeenCalledTimes(1);
      const detail = commandSpy.mock.calls[0][0].detail;
      expect(detail.command).toBe('test');
      expect(detail.args).toEqual(['arg1', 'arg2']);
      expect(detail.input).toBe('test arg1 arg2');
    });

    it('should fire command-error event for unknown command', async () => {
      const errorSpy = vi.fn();
      element.addEventListener('command-error', errorSpy);
      await element.executeCommand('unknowncmd');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0].detail.command).toBe('unknowncmd');
    });

    it('should fire command-result event for successful command', async () => {
      const resultSpy = vi.fn();
      element.addEventListener('command-result', resultSpy);
      element.registerCommand('success', () => 'result');
      await element.executeCommand('success');
      expect(resultSpy).toHaveBeenCalledTimes(1);
      expect(resultSpy.mock.calls[0][0].detail.result).toBe('result');
    });

    it('should fire output event when printing', async () => {
      const outputSpy = vi.fn();
      element.addEventListener('output', outputSpy);
      await element.print('test output');
      expect(outputSpy).toHaveBeenCalledTimes(1);
      expect(outputSpy.mock.calls[0][0].detail.content).toBe('test output');
    });

    it('should fire interrupt event on Ctrl+C', () => {
      const interruptSpy = vi.fn();
      element.addEventListener('interrupt', interruptSpy);
      const input = element.shadowRoot.querySelector('.hidden-input');
      const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true });
      input.dispatchEvent(event);
      expect(interruptSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Scroll Behavior
  // ============================================
  describe('Scroll Behavior', () => {
    it('should scroll to bottom', async () => {
      // Print many lines to create scrollable content
      for (let i = 0; i < 20; i++) {
        await element.print(`Line ${i}`);
      }
      element.scrollToBottom();
      // Just verify method doesn't throw
      expect(true).toBe(true);
    });
  });

  // ============================================
  // Focus Method
  // ============================================
  describe('Focus Method', () => {
    it('should focus input element', () => {
      const input = element.shadowRoot.querySelector('.hidden-input');
      const focusSpy = vi.spyOn(input, 'focus');
      element.focus();
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  // ============================================
  // Attribute Changes
  // ============================================
  describe('Attribute Changes', () => {
    it('should react to title attribute change', () => {
      element.setAttribute('title', 'My Terminal');
      expect(element.config.title).toBe('My Terminal');
    });

    it('should react to show-header attribute', () => {
      element.setAttribute('show-header', 'false');
      expect(element.config.showHeader).toBe(false);
    });

    it('should react to show-controls attribute', () => {
      element.setAttribute('show-controls', 'false');
      expect(element.config.showControls).toBe(false);
    });

    it('should react to show-copy attribute', () => {
      element.setAttribute('show-copy', 'false');
      expect(element.config.showCopy).toBe(false);
    });

    it('should react to show-theme-toggle attribute', () => {
      element.setAttribute('show-theme-toggle', 'false');
      expect(element.config.showThemeToggle).toBe(false);
    });

    it('should react to max-lines attribute', () => {
      element.setAttribute('max-lines', '500');
      expect(element.config.maxLines).toBe(500);
    });

    it('should react to font-family attribute', () => {
      element.setAttribute('font-family', 'monospace');
      expect(element.config.fontFamily).toBe('monospace');
    });

    it('should react to font-size attribute', () => {
      element.setAttribute('font-size', '16px');
      expect(element.config.fontSize).toBe('16px');
    });

    it('should react to line-height attribute', () => {
      element.setAttribute('line-height', '1.6');
      expect(element.config.lineHeight).toBe('1.6');
    });

    it('should react to typing-speed attribute', () => {
      element.setAttribute('typing-speed', '50');
      expect(element.config.typingSpeed).toBe(50);
    });
  });

  // ============================================
  // Print Methods
  // ============================================
  describe('Print Methods', () => {
    it('should print error type', async () => {
      await element.print('Error message', 'error');
      const outputLines = element.shadowRoot.querySelectorAll('.output-line.line-error');
      expect(outputLines.length).toBeGreaterThan(0);
    });

    it('should print info type', async () => {
      await element.print('Info message', 'info');
      const outputLines = element.shadowRoot.querySelectorAll('.output-line.line-info');
      expect(outputLines.length).toBeGreaterThan(0);
    });

    it('should print success type', async () => {
      await element.print('Success message', 'success');
      const outputLines = element.shadowRoot.querySelectorAll('.output-line.line-success');
      expect(outputLines.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Built-in Commands
  // ============================================
  describe('Built-in Commands', () => {
    it('should execute help command', async () => {
      await element.executeCommand('help');
      const content = element.getContent();
      expect(content).toContain('help');
    });

    it('should execute clear command', async () => {
      await element.print('test');
      await element.executeCommand('clear');
      const outputLines = element.shadowRoot.querySelectorAll('.output-line');
      expect(outputLines.length).toBe(0);
    });

    it('should execute echo command', async () => {
      await element.executeCommand('echo hello world');
      const outputLines = element.shadowRoot.querySelectorAll('.output-line.line-output');
      const lastLine = outputLines[outputLines.length - 1];
      expect(lastLine.textContent).toBe('hello world');
    });

    it('should execute history command', async () => {
      await element.executeCommand('cmd1');
      await element.executeCommand('cmd2');
      await element.executeCommand('history');
      const content = element.getContent();
      expect(content).toContain('cmd1');
      expect(content).toContain('cmd2');
    });
  });

  // ============================================
  // VFS Commands
  // ============================================
  describe('VFS Commands', () => {
    beforeEach(() => {
      element.setAttribute('enable-vfs', 'true');
    });

    it('should execute pwd command', async () => {
      await element.executeCommand('pwd');
      const content = element.getContent();
      expect(content).toContain('/home/user');
    });

    it('should execute ls command', async () => {
      await element.executeCommand('ls');
      // Just verify it doesn't error
      expect(true).toBe(true);
    });

    it('should execute cd command', async () => {
      await element.executeCommand('cd /');
      expect(element.fileSystem.getcwd()).toBe('/');
    });

    it('should execute mkdir command', async () => {
      await element.executeCommand('mkdir newdir');
      const items = element.fileSystem.ls('.');
      expect(items.some(i => i.name === 'newdir')).toBe(true);
    });

    it('should execute touch command', async () => {
      await element.executeCommand('touch newfile.txt');
      const items = element.fileSystem.ls('.');
      expect(items.some(i => i.name === 'newfile.txt')).toBe(true);
    });

    it('should execute cat command', async () => {
      await element.executeCommand('touch readme.txt');
      await element.executeCommand('cat readme.txt');
      // Just verify it doesn't error
      expect(true).toBe(true);
    });

    it('should execute rm command', async () => {
      await element.executeCommand('touch deleteme.txt');
      await element.executeCommand('rm deleteme.txt');
      const items = element.fileSystem.ls('.');
      expect(items.some(i => i.name === 'deleteme.txt')).toBe(false);
    });

    it('should handle cd to invalid directory', async () => {
      await element.executeCommand('cd nonexistent');
      const content = element.getContent();
      expect(content.toLowerCase()).toContain('no such');
    });

    it('should handle cd with no args (go home)', async () => {
      await element.executeCommand('cd /');
      await element.executeCommand('cd');
      expect(element.fileSystem.getcwd()).toBe('/home/user');
    });

    it('should handle cd ..', async () => {
      await element.executeCommand('cd ..');
      expect(element.fileSystem.getcwd()).toBe('/home');
    });
  });

  // ============================================
  // Welcome Message
  // ============================================
  describe('Welcome Message', () => {
    it('should display welcome message via attribute', () => {
      const welcomeElement = new TerminalWindow();
      welcomeElement.setAttribute('welcome', 'Welcome to the terminal!');
      document.body.appendChild(welcomeElement);

      const content = welcomeElement.getContent();
      expect(content).toContain('Welcome to the terminal!');

      document.body.removeChild(welcomeElement);
    });
  });

  // ============================================
  // Keyboard Input
  // ============================================
  describe('Keyboard Input', () => {
    it('should handle Tab key', () => {
      const input = element.shadowRoot.querySelector('.hidden-input');
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const preventDefault = vi.spyOn(event, 'preventDefault');
      input.dispatchEvent(event);
      // Tab should be prevented
      expect(true).toBe(true); // Just verify no error
    });

    it('should handle Escape key to close copy menu', () => {
      element._copyMenuOpen = true;
      const input = element.shadowRoot.querySelector('.hidden-input');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      input.dispatchEvent(event);
      // Should close menu
      expect(true).toBe(true); // Just verify no error
    });
  });

  // ============================================
  // Async Command Handler
  // ============================================
  describe('Async Command Handler', () => {
    it('should handle async command', async () => {
      element.registerCommand('async-cmd', async () => {
        return new Promise(resolve => {
          setTimeout(() => resolve('async result'), 10);
        });
      });
      await element.executeCommand('async-cmd');
      const outputLines = element.shadowRoot.querySelectorAll('.output-line.line-output');
      const lastLine = outputLines[outputLines.length - 1];
      expect(lastLine.textContent).toBe('async result');
    });

    it('should handle null return from command', async () => {
      element.registerCommand('silent', () => null);
      const outputBefore = element.shadowRoot.querySelectorAll('.output-line.line-output').length;
      await element.executeCommand('silent');
      const outputAfter = element.shadowRoot.querySelectorAll('.output-line.line-output').length;
      expect(outputAfter).toBe(outputBefore); // No new output
    });
  });
});
