import { test, expect } from '@playwright/test';

test.describe('Terminal Window Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/');
    // Wait for the terminal to be defined and ready
    await page.waitForFunction(() => customElements.get('terminal-window'));
  });

  test.describe('Basic Rendering', () => {
    test('should render terminal component', async ({ page }) => {
      const terminal = page.locator('terminal-window');
      await expect(terminal).toBeVisible();
    });

    test('should display header with title', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();
      // Use evaluate to access shadow DOM
      const hasHeader = await terminal.evaluate(el => {
        return el.shadowRoot?.querySelector('.terminal-header') !== null;
      });
      expect(hasHeader).toBe(true);
    });

    test('should display window controls', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();
      const hasControls = await terminal.evaluate(el => {
        return el.shadowRoot?.querySelector('.window-controls') !== null;
      });
      expect(hasControls).toBe(true);
    });

    test('should have cursor visible', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();
      const hasCursor = await terminal.evaluate(el => {
        return el.shadowRoot?.querySelector('.cursor') !== null;
      });
      expect(hasCursor).toBe(true);
    });
  });

  test.describe('User Input', () => {
    test('should accept keyboard input', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();
      await terminal.click();
      await page.keyboard.type('hello');

      const inputText = await terminal.evaluate(el => {
        const inputDisplay = el.shadowRoot?.querySelector('.input-text');
        return inputDisplay?.textContent || '';
      });
      expect(inputText).toContain('hello');
    });

    test('should execute command on Enter', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();
      await terminal.click();
      await page.keyboard.type('echo test');
      await page.keyboard.press('Enter');

      // Wait for output
      await page.waitForTimeout(200);

      const outputText = await terminal.evaluate(el => {
        const output = el.shadowRoot?.querySelector('.output');
        return output?.textContent || '';
      });
      expect(outputText).toContain('test');
    });

    test('should execute help command', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();
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
      const terminal = page.locator('terminal-window').first();
      await terminal.click();

      // First add some output
      await page.keyboard.type('echo test output');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Then clear
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
      const terminal = page.locator('terminal-window').first();
      await terminal.click();

      // Add some output first
      await page.keyboard.type('echo something');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Clear with Ctrl+L
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
      const terminal = page.locator('terminal-window').first();
      await terminal.click();

      // Execute some commands
      await page.keyboard.type('first command');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      await page.keyboard.type('second command');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      // Navigate up
      await page.keyboard.press('ArrowUp');

      const inputText = await terminal.evaluate(el => {
        const inputDisplay = el.shadowRoot?.querySelector('.input-text');
        return inputDisplay?.textContent || '';
      });
      expect(inputText).toContain('second command');
    });

    test('should navigate history with ArrowDown', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();
      await terminal.click();

      // Execute some commands
      await page.keyboard.type('first');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      await page.keyboard.type('second');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      // Navigate up twice, then down
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
      const terminal = page.locator('terminal-window').first();

      // Get initial theme
      const initialTheme = await terminal.evaluate(el => el.getAttribute('theme'));

      // Click theme button via shadow DOM
      await terminal.evaluate(el => {
        el.shadowRoot?.querySelector('.theme-btn')?.click();
      });
      await page.waitForTimeout(100);

      // Theme should have changed
      const newTheme = await terminal.evaluate(el => el.getAttribute('theme'));
      expect(newTheme).not.toBe(initialTheme);
    });

    test('should apply light theme styles', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();

      // Set light theme
      await terminal.evaluate(el => el.setAttribute('theme', 'light'));
      await page.waitForTimeout(100);

      // Theme is applied via data-theme attribute on .terminal element
      const themeAttr = await terminal.evaluate(el => {
        const terminalDiv = el.shadowRoot?.querySelector('.terminal');
        return terminalDiv?.getAttribute('data-theme');
      });
      expect(themeAttr).toBe('light');
    });
  });

  test.describe('Window Controls', () => {
    test('should minimize terminal when clicking minimize button', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();

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
      const terminal = page.locator('terminal-window').first();

      // Minimize
      await terminal.evaluate(el => {
        el.shadowRoot?.querySelector('.control.minimize')?.click();
      });
      await page.waitForTimeout(100);

      // Restore
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
      const terminal = page.locator('terminal-window').first();

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
      const terminal = page.locator('terminal-window').first();

      // Enter fullscreen
      await terminal.evaluate(el => {
        el.shadowRoot?.querySelector('.control.maximize')?.click();
      });
      await page.waitForTimeout(100);

      // Exit with Escape
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
      const terminal = page.locator('terminal-window').first();

      const hasCopyBtn = await terminal.evaluate(el => {
        const btn = el.shadowRoot?.querySelector('.copy-btn');
        return btn !== null;
      });
      expect(hasCopyBtn).toBe(true);
    });

    test('should copy content via API', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();

      // Print some content
      await terminal.evaluate(el => el.print('Test content'));
      await page.waitForTimeout(100);

      // Content should exist
      const content = await terminal.evaluate(el => el.getContent());
      expect(content).toContain('Test content');
    });
  });

  test.describe('Accessibility', () => {
    test('should have ARIA labels on input', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();

      const hasAriaLabel = await terminal.evaluate(el => {
        const input = el.shadowRoot?.querySelector('.hidden-input');
        return input?.hasAttribute('aria-label') || false;
      });
      expect(hasAriaLabel).toBe(true);
    });

    test('should have ARIA labels on buttons', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();

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
      const terminal = page.locator('terminal-window').first();

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
      await page.goto('/demo/');
      await page.waitForFunction(() => customElements.get('terminal-window'));

      const terminal = page.locator('terminal-window').first();
      await expect(terminal).toBeVisible();

      const hasBody = await terminal.evaluate(el => {
        return el.shadowRoot?.querySelector('.terminal-body') !== null;
      });
      expect(hasBody).toBe(true);
    });

    test('should render correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/demo/');
      await page.waitForFunction(() => customElements.get('terminal-window'));

      const terminal = page.locator('terminal-window').first();
      await expect(terminal).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should show error for unknown command', async ({ page }) => {
      const terminal = page.locator('terminal-window').first();
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
});

test.describe('VFS Terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/');
    await page.waitForFunction(() => customElements.get('terminal-window'));
  });

  test('should have VFS commands available when enabled', async ({ page }) => {
    // The main demo terminal has VFS enabled
    const terminal = page.locator('terminal-window').first();

    // Check if VFS is enabled
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
      // Should not show "Command not found"
      expect(outputText).not.toContain('Command not found: ls');
    }
  });
});

test.describe('Programmatic API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/');
    await page.waitForFunction(() => customElements.get('terminal-window'));
  });

  test('should print output programmatically', async ({ page }) => {
    const terminal = page.locator('terminal-window').first();

    await terminal.evaluate(el => el.print('Hello from test'));
    await page.waitForTimeout(100);

    const outputText = await terminal.evaluate(el => {
      const output = el.shadowRoot?.querySelector('.output');
      return output?.textContent || '';
    });
    expect(outputText).toContain('Hello from test');
  });

  test('should execute command programmatically', async ({ page }) => {
    const terminal = page.locator('terminal-window').first();

    await terminal.evaluate(el => el.executeCommand('echo programmatic'));
    await page.waitForTimeout(200);

    const outputText = await terminal.evaluate(el => {
      const output = el.shadowRoot?.querySelector('.output');
      return output?.textContent || '';
    });
    expect(outputText).toContain('programmatic');
  });

  test('should clear terminal programmatically', async ({ page }) => {
    const terminal = page.locator('terminal-window').first();

    // Add output first
    await terminal.evaluate(el => el.print('Some output'));
    await page.waitForTimeout(100);

    // Clear
    await terminal.evaluate(el => el.clear());
    await page.waitForTimeout(100);

    const outputLineCount = await terminal.evaluate(el => {
      const lines = el.shadowRoot?.querySelectorAll('.output-line');
      return lines?.length || 0;
    });
    expect(outputLineCount).toBe(0);
  });

  test('should get and set history', async ({ page }) => {
    const terminal = page.locator('terminal-window').first();

    // Execute some commands
    await terminal.evaluate(el => {
      el.executeCommand('cmd1');
      el.executeCommand('cmd2');
    });
    await page.waitForTimeout(200);

    const history = await terminal.evaluate(el => el.getHistory());
    expect(history).toContain('cmd1');
    expect(history).toContain('cmd2');
  });
});
