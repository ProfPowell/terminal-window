import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/terminal-window.js'),
      formats: ['es'],
      fileName: () => 'terminal-window.js',
    },
    sourcemap: true,
  },
  server: {
    open: '/docs/index.html',
  },
});
