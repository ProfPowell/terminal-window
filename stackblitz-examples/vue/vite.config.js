import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Tell Vue that terminal-window is a custom element
          isCustomElement: (tag) => tag === 'terminal-window',
        },
      },
    }),
  ],
});
