/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/terminal-window.js'),
      name: 'TerminalWindow',
      fileName: (format) => `terminal-window.${format}.js`,
    },
    rollupOptions: {
      output: {
        // Provide global variables to use in the UMD build
        globals: {},
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
