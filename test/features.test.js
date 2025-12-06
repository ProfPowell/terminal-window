import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import TerminalWindow from '../src/terminal-window.js';

describe('TerminalWindow Features', () => {
  let element;

  beforeEach(() => {
    element = new TerminalWindow();
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
    // Clear persistence
    localStorage.removeItem('terminal-history');
  });

  describe('Virtual File System', () => {
    beforeEach(() => {
      element.setAttribute('enable-vfs', 'true');
    });

    it('should initialize with default structure', () => {
      expect(element.fileSystem).toBeDefined();
      expect(element.fileSystem.getcwd()).toBe('/home/user');
    });

    it('should support basic commands', async () => {
      // mkdir
      await element.executeCommand('mkdir test_dir');
      let output = element.fileSystem.ls('.');
      expect(output.some(i => i.name === 'test_dir')).toBe(true);

      // cd
      await element.executeCommand('cd test_dir');
      expect(element.fileSystem.getcwd()).toBe('/home/user/test_dir');

      // touch
      await element.executeCommand('touch newfile.txt');
      output = element.fileSystem.ls('.');
      expect(output.some(i => i.name === 'newfile.txt')).toBe(true);

      // pwd
      await element.executeCommand('pwd');
      // Verify output somehow?
    });
  });

  describe('Persistent History', () => {
    it('should save history to localStorage', async () => {
      element.setAttribute('persist-history', 'true');
      await element.executeCommand('command1');
      await element.executeCommand('command2');

      const saved = JSON.parse(localStorage.getItem('terminal-history'));
      expect(saved).toEqual(['command1', 'command2']);
    });

    it('should load history from localStorage', () => {
      localStorage.setItem('terminal-history', JSON.stringify(['saved1', 'saved2']));
      
      const newElement = new TerminalWindow();
      document.body.appendChild(newElement);
      newElement.setAttribute('persist-history', 'true');

      expect(newElement.getHistory()).toEqual(['saved1', 'saved2']);
      document.body.removeChild(newElement);
    });
  });
});
