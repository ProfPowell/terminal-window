import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        customElements: 'readonly',
        HTMLElement: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        navigator: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        matchMedia: 'readonly',
        CSSStyleSheet: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^err' }],
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-case-declarations': 'off',
    },
  },
  {
    files: ['src/internals/ansi-parser.js'],
    rules: {
      'no-control-regex': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
];
