import { test, expect } from '@playwright/test';

test.describe('Terminal Window Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/test-page.html');
    await page.waitForFunction(() => customElements.get('terminal-window'));
  });

  test.describe('Basic Rendering', () => {
    test('should render terminal component', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await expect(terminal).toBeVisible();
    });

    test('should display header with title', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      const hasHeader = await terminal.evaluate(el => {
        return el.shadowRoot?.querySelector('.terminal-header') !== null;
      });
      expect(hasHeader).toBe(true);
    });

    test('should display window controls', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      const hasControls = await terminal.evaluate(el => {
        return el.shadowRoot?.querySelector('.window-controls') !== null;
      });
      expect(hasControls).toBe(true);
    });

    test('should have cursor visible', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      const hasCursor = await terminal.evaluate(el => {
        return el.shadowRoot?.querySelector('.cursor') !== null;
      });
      expect(hasCursor).toBe(true);
    });
  });

  test.describe('User Input', () => {
    test('should accept keyboard input', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await terminal.click();
      await page.keyboard.type('hello');

      const inputText = await terminal.evaluate(el => {
        const inputDisplay = el.shadowRoot?.querySelector('.input-text');
        return inputDisplay?.textContent || '';
      });
      expect(inputText).toContain('hello');
    });

    test('should execute command on Enter', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await terminal.click();
      await page.keyboard.type('echo test');
      await page.keyboard.press('Enter');

      await page.waitForTimeout(200);

      const outputText = await terminal.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });
      expect(outputText).toContain('test');
    });

    test('should execute help command', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await terminal.click();
      await page.keyboard.type('help');
      await page.keyboard.press('Enter');

      await page.waitForTimeout(200);

      const outputText = await terminal.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });
      expect(outputText).toContain('Available commands');
    });

    test('should clear terminal with clear command', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await terminal.click();

      await page.keyboard.type('echo test output');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      await page.keyboard.type('clear');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      const outputLineCount = await terminal.evaluate(el => {
        const lines = el.shadowRoot?.querySelectorAll('.output-line');
        return lines?.length || 0;
      });
      expect(outputLineCount).toBe(0);
    });

    test('should clear terminal with Ctrl+L', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await terminal.click();

      await page.keyboard.type('echo something');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      await page.keyboard.press('Control+l');
      await page.waitForTimeout(200);

      const outputLineCount = await terminal.evaluate(el => {
        const lines = el.shadowRoot?.querySelectorAll('.output-line');
        return lines?.length || 0;
      });
      expect(outputLineCount).toBe(0);
    });
  });

  test.describe('Command History', () => {
    test('should navigate history with ArrowUp', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await terminal.click();

      await page.keyboard.type('first command');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      await page.keyboard.type('second command');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      await page.keyboard.press('ArrowUp');

      const inputText = await terminal.evaluate(el => {
        const inputDisplay = el.shadowRoot?.querySelector('.input-text');
        return inputDisplay?.textContent || '';
      });
      expect(inputText).toContain('second command');
    });

    test('should navigate history with ArrowDown', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await terminal.click();

      await page.keyboard.type('first');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      await page.keyboard.type('second');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');

      const inputText = await terminal.evaluate(el => {
        const inputDisplay = el.shadowRoot?.querySelector('.input-text');
        return inputDisplay?.textContent || '';
      });
      expect(inputText).toContain('second');
    });
  });

  test.describe('Theme Switching', () => {
    test('should toggle theme when clicking theme button', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      const initialTheme = await terminal.evaluate(el => el.getAttribute('mode'));

      await terminal.evaluate(el => {
        el.shadowRoot?.querySelector('.theme-btn')?.click();
      });
      await page.waitForTimeout(100);

      const newTheme = await terminal.evaluate(el => el.getAttribute('mode'));
      expect(newTheme).not.toBe(initialTheme);
    });

    test('should apply light theme styles', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => el.setAttribute('theme', 'light'));
      await page.waitForTimeout(100);

      const themeAttr = await terminal.evaluate(el => {
        const terminalDiv = el.shadowRoot?.querySelector('.terminal');
        return terminalDiv?.getAttribute('data-theme');
      });
      expect(themeAttr).toBe('light');
    });
  });

  test.describe('Window Controls', () => {
    test('should minimize terminal when clicking minimize button', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => {
        el.shadowRoot?.querySelector('.control.minimize')?.click();
      });
      await page.waitForTimeout(100);

      const isMinimized = await terminal.evaluate(el => {
        const body = el.shadowRoot?.querySelector('.terminal-body');
        return body?.style.display === 'none';
      });
      expect(isMinimized).toBe(true);
    });

    test('should restore terminal when clicking minimize again', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => {
        el.shadowRoot?.querySelector('.control.minimize')?.click();
      });
      await page.waitForTimeout(100);

      await terminal.evaluate(el => {
        el.shadowRoot?.querySelector('.control.minimize')?.click();
      });
      await page.waitForTimeout(100);

      const isMinimized = await terminal.evaluate(el => {
        const body = el.shadowRoot?.querySelector('.terminal-body');
        return body?.style.display === 'none';
      });
      expect(isMinimized).toBe(false);
    });

    test('should toggle fullscreen when clicking maximize button', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => {
        el.shadowRoot?.querySelector('.control.maximize')?.click();
      });
      await page.waitForTimeout(100);

      const isFullscreen = await terminal.evaluate(el => {
        const terminalDiv = el.shadowRoot?.querySelector('.terminal');
        return terminalDiv?.classList.contains('fullscreen') || false;
      });
      expect(isFullscreen).toBe(true);
    });

    test('should exit fullscreen with Escape key', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => {
        el.shadowRoot?.querySelector('.control.maximize')?.click();
      });
      await page.waitForTimeout(100);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      const isFullscreen = await terminal.evaluate(el => {
        const terminalDiv = el.shadowRoot?.querySelector('.terminal');
        return terminalDiv?.classList.contains('fullscreen') || false;
      });
      expect(isFullscreen).toBe(false);
    });
  });

  test.describe('Copy Functionality', () => {
    test('should have copy button available', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      const hasCopyBtn = await terminal.evaluate(el => {
        const btn = el.shadowRoot?.querySelector('.copy-btn');
        return btn !== null;
      });
      expect(hasCopyBtn).toBe(true);
    });

    test('should copy content via API', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => el.print('Test content'));
      await page.waitForTimeout(100);

      const content = await terminal.evaluate(el => el.getContent());
      expect(content).toContain('Test content');
    });
  });

  test.describe('Accessibility', () => {
    test('should have ARIA labels on input', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      const hasAriaLabel = await terminal.evaluate(el => {
        const input = el.shadowRoot?.querySelector('.hidden-input');
        return input?.hasAttribute('aria-label') || false;
      });
      expect(hasAriaLabel).toBe(true);
    });

    test('should have ARIA labels on buttons', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      const buttonsHaveAria = await terminal.evaluate(el => {
        const closeBtn = el.shadowRoot?.querySelector('.control.close');
        const minBtn = el.shadowRoot?.querySelector('.control.minimize');
        const maxBtn = el.shadowRoot?.querySelector('.control.maximize');
        return (
          (closeBtn?.hasAttribute('aria-label') || false) &&
          (minBtn?.hasAttribute('aria-label') || false) &&
          (maxBtn?.hasAttribute('aria-label') || false)
        );
      });
      expect(buttonsHaveAria).toBe(true);
    });

    test('should have live region for announcements', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      const hasLiveRegion = await terminal.evaluate(el => {
        const liveRegion = el.shadowRoot?.querySelector('[aria-live]');
        return liveRegion !== null;
      });
      expect(hasLiveRegion).toBe(true);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should render correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/test/test-page.html');
      await page.waitForFunction(() => customElements.get('terminal-window'));

      const terminal = page.locator('terminal-window#terminal');
      await expect(terminal).toBeVisible();

      const hasBody = await terminal.evaluate(el => {
        return el.shadowRoot?.querySelector('.terminal-body') !== null;
      });
      expect(hasBody).toBe(true);
    });

    test('should render correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/test/test-page.html');
      await page.waitForFunction(() => customElements.get('terminal-window'));

      const terminal = page.locator('terminal-window#terminal');
      await expect(terminal).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should show error for unknown command', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await terminal.click();

      await page.keyboard.type('unknowncommand123');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      const outputText = await terminal.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });
      expect(outputText).toContain('Command not found');
    });
  });

  test.describe('VFS Terminal', () => {
    test('should have VFS commands available when enabled', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      const vfsEnabled = await terminal.evaluate(el => el.hasAttribute('enable-vfs'));

      if (vfsEnabled) {
        await terminal.click();
        await page.keyboard.type('ls');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);

        const outputText = await terminal.evaluate(el => {
          const output = el.shadowRoot?.querySelector('.output');
          return output?.textContent || '';
        });
        expect(outputText).not.toContain('Command not found: ls');
      }
    });

    test('should execute pwd command', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await terminal.click();

      await page.keyboard.type('pwd');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      const outputText = await terminal.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });
      expect(outputText).toContain('/home/user');
    });

    test('should execute mkdir and cd commands', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');
      await terminal.click();

      await page.keyboard.type('mkdir testdir');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      await page.keyboard.type('cd testdir');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      await page.keyboard.type('pwd');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      const outputText = await terminal.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });
      expect(outputText).toContain('/home/user/testdir');
    });
  });

  test.describe('Programmatic API', () => {
    test('should print output programmatically', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => el.print('Hello from test'));
      await page.waitForTimeout(100);

      const outputText = await terminal.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });
      expect(outputText).toContain('Hello from test');
    });

    test('should execute command programmatically', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => el.executeCommand('echo programmatic'));
      await page.waitForTimeout(200);

      const outputText = await terminal.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });
      expect(outputText).toContain('programmatic');
    });

    test('should clear terminal programmatically', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => el.print('Some output'));
      await page.waitForTimeout(100);

      await terminal.evaluate(el => el.clear());
      await page.waitForTimeout(100);

      const outputLineCount = await terminal.evaluate(el => {
        const lines = el.shadowRoot?.querySelectorAll('.output-line');
        return lines?.length || 0;
      });
      expect(outputLineCount).toBe(0);
    });

    test('should get and set history', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => {
        el.executeCommand('cmd1');
        el.executeCommand('cmd2');
      });
      await page.waitForTimeout(200);

      const history = await terminal.evaluate(el => el.getHistory());
      expect(history).toContain('cmd1');
      expect(history).toContain('cmd2');
    });

    test('should register and execute custom command', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => {
        el.registerCommand('custom', () => 'Custom command output');
      });

      await terminal.click();
      await page.keyboard.type('custom');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      const outputText = await terminal.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });
      expect(outputText).toContain('Custom command output');
    });

    test('should set theme programmatically', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => el.setTheme('light'));
      await page.waitForTimeout(100);

      const theme = await terminal.evaluate(el => el.getAttribute('theme'));
      expect(theme).toBe('light');
    });

    test('should set prompt programmatically', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => el.setPrompt('>>> '));
      await page.waitForTimeout(100);

      const prompt = await terminal.evaluate(el => el.getAttribute('prompt'));
      expect(prompt).toBe('>>> ');
    });

    test('should set cursor style programmatically', async ({ page }) => {
      const terminal = page.locator('terminal-window#terminal');

      await terminal.evaluate(el => el.setCursorStyle('bar'));
      await page.waitForTimeout(100);

      const cursorStyle = await terminal.evaluate(el => el.getAttribute('cursor-style'));
      expect(cursorStyle).toBe('bar');
    });
  });

  test.describe('Multiple Terminals', () => {
    test('should render multiple terminals independently', async ({ page }) => {
      const terminal1 = page.locator('terminal-window#terminal');
      const terminal2 = page.locator('terminal-window#terminal2');

      await expect(terminal1).toBeVisible();
      await expect(terminal2).toBeVisible();

      const theme1 = await terminal1.evaluate(el => el.getAttribute('theme'));
      const theme2 = await terminal2.evaluate(el => el.getAttribute('theme'));

      expect(theme1).toBe('dark');
      expect(theme2).toBe('light');
    });

    test('should maintain separate state per terminal', async ({ page }) => {
      const terminal1 = page.locator('terminal-window#terminal');
      const terminal2 = page.locator('terminal-window#terminal2');

      await terminal1.click();
      await page.keyboard.type('echo terminal1');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      await terminal2.click();
      await page.keyboard.type('echo terminal2');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      const output1 = await terminal1.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });
      const output2 = await terminal2.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });

      expect(output1).toContain('terminal1');
      expect(output1).not.toContain('terminal2');
      expect(output2).toContain('terminal2');
    });
  });
});

test.describe('vb token integration: mode attribute', () => {
  test('setting mode="dark" reflects to inner .terminal[data-theme]', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const terminal = page.locator('terminal-window').first();
    await terminal.evaluate(el => el.setAttribute('mode', 'dark'));
    const innerTheme = await terminal.evaluate(el =>
      el.shadowRoot.querySelector('.terminal')?.getAttribute('data-theme'));
    expect(innerTheme).toBe('dark');
  });

  test('setting mode="light" reflects to inner .terminal[data-theme]', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const terminal = page.locator('terminal-window').first();
    await terminal.evaluate(el => el.setAttribute('mode', 'light'));
    const innerTheme = await terminal.evaluate(el =>
      el.shadowRoot.querySelector('.terminal')?.getAttribute('data-theme'));
    expect(innerTheme).toBe('light');
  });

  test('mode wins over theme when both set', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const terminal = page.locator('terminal-window').first();
    await terminal.evaluate(el => {
      el.setAttribute('theme', 'dark');
      el.setAttribute('mode', 'light');
    });
    const innerTheme = await terminal.evaluate(el =>
      el.shadowRoot.querySelector('.terminal')?.getAttribute('data-theme'));
    expect(innerTheme).toBe('light');
  });
});

test.describe('vb token integration: page-mode detection', () => {
  test('document-level data-theme="dark" makes a no-attribute terminal render dark', async ({ page }) => {
    await page.goto('/test/test-page.html');
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    const innerTheme = await page.evaluate(async () => {
      const tw = document.createElement('terminal-window');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      await new Promise(r => setTimeout(r, 50));
      const result = tw.shadowRoot.querySelector('.terminal')?.getAttribute('data-theme');
      tw.remove();
      document.documentElement.removeAttribute('data-theme');
      return result;
    });
    expect(innerTheme).toBe('dark');
  });

  test('explicit mode overrides page signal', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const innerTheme = await page.evaluate(async () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const tw = document.createElement('terminal-window');
      tw.setAttribute('mode', 'light');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      await new Promise(r => setTimeout(r, 50));
      const result = tw.shadowRoot.querySelector('.terminal')?.getAttribute('data-theme');
      tw.remove();
      document.documentElement.removeAttribute('data-theme');
      return result;
    });
    expect(innerTheme).toBe('light');
  });

  test('page-mode change is reactive', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const result = await page.evaluate(async () => {
      const tw = document.createElement('terminal-window');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      document.documentElement.setAttribute('data-theme', 'dark');
      await new Promise(r => setTimeout(r, 50));
      const after = tw.shadowRoot.querySelector('.terminal')?.getAttribute('data-theme');
      tw.remove();
      document.documentElement.removeAttribute('data-theme');
      return after;
    });
    expect(result).toBe('dark');
  });

  test('disconnect cleanup: no error when page mode flips after element removed', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.evaluate(async () => {
      const tw = document.createElement('terminal-window');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      tw.remove();
      document.documentElement.setAttribute('data-theme', 'dark');
      await new Promise(r => setTimeout(r, 50));
      document.documentElement.removeAttribute('data-theme');
    });
    expect(errors).toEqual([]);
  });
});

test.describe('vb token integration: vb token consumption', () => {
  test('--color-surface flows through to terminal background', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const bg = await page.evaluate(async () => {
      const tw = document.createElement('terminal-window');
      tw.setAttribute('mode', 'dark');
      tw.style.setProperty('--color-surface', 'rgb(10, 20, 30)');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      await new Promise(r => setTimeout(r, 30));
      const inner = tw.shadowRoot.querySelector('.terminal');
      const computed = getComputedStyle(inner).backgroundColor;
      tw.remove();
      return computed;
    });
    expect(bg).toBe('rgb(10, 20, 30)');
  });

  test('--color-border flows through to terminal border', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const border = await page.evaluate(async () => {
      const tw = document.createElement('terminal-window');
      tw.setAttribute('mode', 'dark');
      tw.style.setProperty('--color-border', 'rgb(99, 88, 77)');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      await new Promise(r => setTimeout(r, 30));
      const inner = tw.shadowRoot.querySelector('.terminal');
      const computed = getComputedStyle(inner).borderColor;
      tw.remove();
      return computed;
    });
    expect(border).toBe('rgb(99, 88, 77)');
  });

  test('--terminal-window-bg public override beats vb token', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const bg = await page.evaluate(async () => {
      const tw = document.createElement('terminal-window');
      tw.setAttribute('mode', 'dark');
      tw.style.setProperty('--color-surface', 'rgb(255, 0, 0)');
      tw.style.setProperty('--terminal-window-bg', 'rgb(0, 255, 0)');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      await new Promise(r => setTimeout(r, 30));
      const inner = tw.shadowRoot.querySelector('.terminal');
      const computed = getComputedStyle(inner).backgroundColor;
      tw.remove();
      return computed;
    });
    expect(bg).toBe('rgb(0, 255, 0)');
  });
});

test.describe('vb token integration: public overrides for terminal slots', () => {
  test('--terminal-window-prompt-color overrides default', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const color = await page.evaluate(async () => {
      const tw = document.createElement('terminal-window');
      tw.setAttribute('mode', 'dark');
      tw.style.setProperty('--terminal-window-prompt-color', 'rgb(123, 45, 67)');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      await new Promise(r => setTimeout(r, 30));
      const prompt = tw.shadowRoot.querySelector('.input-prompt');
      if (!prompt) { tw.remove(); return null; }
      const computed = getComputedStyle(prompt).color;
      tw.remove();
      return computed;
    });
    expect(color).toBe('rgb(123, 45, 67)');
  });

  test('--terminal-window-control-close overrides traffic light', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const color = await page.evaluate(async () => {
      const tw = document.createElement('terminal-window');
      tw.style.setProperty('--terminal-window-control-close', 'rgb(11, 22, 33)');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      await new Promise(r => setTimeout(r, 30));
      const dot = tw.shadowRoot.querySelector('.control.close');
      if (!dot) { tw.remove(); return null; }
      const computed = getComputedStyle(dot).backgroundColor;
      tw.remove();
      return computed;
    });
    expect(color).toBe('rgb(11, 22, 33)');
  });
});

test.describe('vb token integration: toggle behavior', () => {
  test('toggleTheme() writes to mode attribute, not theme', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const result = await page.evaluate(async () => {
      const tw = document.createElement('terminal-window');
      tw.setAttribute('mode', 'dark');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      tw.toggleTheme();
      await new Promise(r => setTimeout(r, 20));
      const out = {
        mode: tw.getAttribute('mode'),
        theme: tw.getAttribute('theme'),
      };
      tw.remove();
      return out;
    });
    expect(result.mode).toBe('light');
    expect(result.theme).toBeNull();
  });

  test('toggleMode() is the canonical method', async ({ page }) => {
    await page.goto('/test/test-page.html');
    const result = await page.evaluate(async () => {
      const tw = document.createElement('terminal-window');
      tw.setAttribute('mode', 'light');
      document.body.appendChild(tw);
      await customElements.whenDefined('terminal-window');
      tw.toggleMode();
      await new Promise(r => setTimeout(r, 20));
      const out = tw.getAttribute('mode');
      tw.remove();
      return out;
    });
    expect(result).toBe('dark');
  });
});
