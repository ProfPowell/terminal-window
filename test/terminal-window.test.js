import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import TerminalWindow from '../src/terminal-window.js';

describe('TerminalWindow', () => {
  let element;

  beforeEach(() => {
    element = new TerminalWindow();
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should be defined', () => {
    expect(element).toBeInstanceOf(TerminalWindow);
    expect(customElements.get('terminal-window')).toBe(TerminalWindow);
  });

  it('should render the shadow root', () => {
    expect(element.shadowRoot).toBeDefined();
    const terminal = element.shadowRoot.querySelector('.terminal');
    expect(terminal).toBeDefined();
  });

  it('should apply default config', () => {
    expect(element.config.theme).toBe('dark');
    expect(element.config.prompt).toBe('$ ');
  });

  it('should reflect attributes to config', () => {
    element.setAttribute('theme', 'light');
    element.setAttribute('prompt', '> ');
    expect(element.config.theme).toBe('light');
    expect(element.config.prompt).toBe('> ');
  });

  describe('Command Execution', () => {
    it('should register and execute commands', async () => {
      element.registerCommand('hello', () => 'world');
      await element.executeCommand('hello');
      
      const outputLines = element.shadowRoot.querySelectorAll('.output-line.line-output');
      const lastLine = outputLines[outputLines.length - 1];
      expect(lastLine.textContent).toBe('world');
    });

    it('should handle unknown commands', async () => {
      await element.executeCommand('unknown');
      const outputLines = element.shadowRoot.querySelectorAll('.output-line.line-error');
      const lastLine = outputLines[outputLines.length - 1];
      expect(lastLine.textContent).toContain('Command not found');
    });

    it('should handle history navigation', async () => {
      await element.executeCommand('first');
      await element.executeCommand('second');
      
      const input = element.shadowRoot.querySelector('.hidden-input');
      
      // Simulate ArrowUp
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      input.dispatchEvent(upEvent);
      expect(element.currentInput).toBe('second');
      
      input.dispatchEvent(upEvent);
      expect(element.currentInput).toBe('first');
      
      // Simulate ArrowDown
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      input.dispatchEvent(downEvent);
      expect(element.currentInput).toBe('second');
    });
  });

  describe('ANSI Parsing', () => {
    it('should parse basic colors', () => {
      const redText = '\x1b[31mError\x1b[0m';
      const parsed = element._parseAnsi(redText);
      expect(parsed).toContain('<span class="ansi-red">Error</span>');
    });

    it('should parse bold text', () => {
      const boldText = '\x1b[1mBold\x1b[0m';
      const parsed = element._parseAnsi(boldText);
      expect(parsed).toContain('<span class="ansi-bold">Bold</span>');
    });
    
    it('should parse background colors', () => {
      const bgBlueText = '\x1b[44mBlueBG\x1b[0m';
      const parsed = element._parseAnsi(bgBlueText);
      expect(parsed).toContain('<span class="ansi-bg-blue">BlueBG</span>');
    });

    it('should handle mixed styles', () => {
        // Red and Bold
        const mixed = '\x1b[31;1mMixed\x1b[0m';
        const parsed = element._parseAnsi(mixed);
        // The order of classes might vary slightly depending on implementation detail, but checking both is safe if implementation is consistent
        expect(parsed).toMatch(/class=".*ansi-red.*ansi-bold.*"|class=".*ansi-bold.*ansi-red.*"/);
    });
  });

  describe('Output Rendering', () => {
     it('should append lines to DOM without clearing existing ones', async () => {
        await element.print('Line 1');
        const outputContainer = element.shadowRoot.querySelector('.output');
        const firstChild = outputContainer.firstElementChild;
        
        await element.print('Line 2');
        expect(outputContainer.firstElementChild).toBe(firstChild); // Reference equality check
        expect(outputContainer.children.length).toBe(2);
     });

     it('should trim lines when exceeding maxLines', async () => {
         element.setAttribute('max-lines', '2');
         await element.print('1');
         await element.print('2');
         await element.print('3');
         
         const outputContainer = element.shadowRoot.querySelector('.output');
         expect(outputContainer.children.length).toBe(2);
         expect(outputContainer.firstElementChild.textContent).toBe('2');
         expect(outputContainer.lastElementChild.textContent).toBe('3');
     });
     
     it('should clear the output', async () => {
         await element.print('test');
         element.clear();
         const outputContainer = element.shadowRoot.querySelector('.output');
         expect(outputContainer.children.length).toBe(0);
     });
  });
});