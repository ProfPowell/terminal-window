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
});
