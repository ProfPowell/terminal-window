// Import the terminal-window component (self-registering)
import '../src/terminal-window.js';

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Viewport presets
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1200px', height: '800px' } },
      },
    },
    // Background options
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#fafafa' },
        { name: 'neutral', value: '#808080' },
      ],
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
  },
  // Global decorators
  decorators: [
    (story) => {
      const result = story();
      // Handle both DOM elements and strings
      if (result instanceof HTMLElement) {
        const container = document.createElement('div');
        container.style.cssText = 'min-height: 450px; padding: 16px;';
        container.appendChild(result);
        return container;
      }
      // String content
      const container = document.createElement('div');
      container.style.cssText = 'min-height: 450px; padding: 16px;';
      container.innerHTML = result;
      return container;
    },
  ],
};

export default preview;
