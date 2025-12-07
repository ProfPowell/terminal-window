# Vue Integration

This guide shows how to use `terminal-window` in a Vue 3 application.

## Live Demo

[Open in StackBlitz](https://stackblitz.com/edit/vitejs-vite-vue-terminal-window)

## Installation

```bash
npm install terminal-window
```

## Configuration

Tell Vue that `terminal-window` is a custom element:

### Vite (vite.config.js)

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'terminal-window',
        },
      },
    }),
  ],
});
```

### Vue CLI (vue.config.js)

```javascript
module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => ({
        ...options,
        compilerOptions: {
          isCustomElement: (tag) => tag === 'terminal-window',
        },
      }));
  },
};
```

## Basic Usage

```vue
<!-- App.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import 'terminal-window';

const terminalRef = ref(null);

onMounted(() => {
  const terminal = terminalRef.value;

  // Register custom commands
  terminal.registerCommand('vue', () => {
    return 'Hello from Vue!';
  });
});

const handleCommand = (event) => {
  console.log('Command:', event.detail.command);
  console.log('Args:', event.detail.args);
};
</script>

<template>
  <terminal-window
    ref="terminalRef"
    theme="dark"
    prompt="vue> "
    welcome="Vue + Terminal Window. Type 'vue' or 'help'."
    autofocus
    @command="handleCommand"
  />
</template>

<style>
terminal-window {
  width: 100%;
  height: 400px;
}
</style>
```

## Composable

Create a reusable composable for terminal functionality:

```javascript
// composables/useTerminal.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useTerminal(terminalRef, options = {}) {
  const history = ref([]);

  onMounted(() => {
    const terminal = terminalRef.value;
    if (!terminal) return;

    // Register commands from options
    if (options.commands) {
      Object.entries(options.commands).forEach(([name, handler]) => {
        terminal.registerCommand(name, handler);
      });
    }

    // Track command history
    const handleCommand = (e) => {
      history.value.push({
        command: e.detail.command,
        args: e.detail.args,
        timestamp: new Date(),
      });
    };

    terminal.addEventListener('command', handleCommand);

    onUnmounted(() => {
      terminal.removeEventListener('command', handleCommand);
    });
  });

  // Exposed methods
  const executeCommand = (cmd) => {
    terminalRef.value?.executeCommand(cmd);
  };

  const print = (text, type) => {
    terminalRef.value?.print(text, type);
  };

  const clear = () => {
    terminalRef.value?.clear();
    history.value = [];
  };

  return {
    history,
    executeCommand,
    print,
    clear,
  };
}
```

### Using the Composable

```vue
<!-- Terminal.vue -->
<script setup>
import { ref } from 'vue';
import 'terminal-window';
import { useTerminal } from '@/composables/useTerminal';

const terminalRef = ref(null);

const { history, executeCommand, clear } = useTerminal(terminalRef, {
  commands: {
    greet: (args) => `Hello, ${args[0] || 'World'}!`,
    time: () => new Date().toLocaleTimeString(),
  },
});
</script>

<template>
  <div class="terminal-container">
    <terminal-window
      ref="terminalRef"
      theme="dark"
      prompt="$ "
      enable-vfs
      autofocus
    />

    <div class="controls">
      <button @click="executeCommand('help')">Show Help</button>
      <button @click="clear()">Clear</button>
    </div>

    <div class="history">
      <h3>Command History</h3>
      <ul>
        <li v-for="(item, i) in history" :key="i">
          {{ item.command }} {{ item.args.join(' ') }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

## TypeScript Support

Create a type declaration file:

```typescript
// src/types/terminal-window.d.ts
declare module 'terminal-window' {}

declare namespace JSX {
  interface IntrinsicElements {
    'terminal-window': TerminalWindowAttributes;
  }
}

interface TerminalWindowAttributes {
  ref?: any;
  theme?: 'dark' | 'light';
  prompt?: string;
  title?: string;
  'cursor-style'?: 'block' | 'underline' | 'bar';
  'cursor-blink'?: boolean;
  'typing-effect'?: boolean;
  'typing-speed'?: number;
  'show-header'?: boolean;
  'show-controls'?: boolean;
  'show-copy'?: boolean;
  'show-theme-toggle'?: boolean;
  readonly?: boolean;
  'max-lines'?: number;
  welcome?: string;
  'enable-vfs'?: boolean;
  'persist-history'?: boolean;
  autofocus?: boolean;
  onCommand?: (event: CustomEvent) => void;
  'onCommand-result'?: (event: CustomEvent) => void;
  'onCommand-error'?: (event: CustomEvent) => void;
}
```

## Nuxt 3

For Nuxt 3, create a client-only component:

```vue
<!-- components/Terminal.client.vue -->
<script setup>
import { ref, onMounted } from 'vue';

const terminalRef = ref(null);

onMounted(async () => {
  await import('terminal-window');
});

defineProps({
  theme: { type: String, default: 'dark' },
  prompt: { type: String, default: '$ ' },
  welcome: { type: String, default: '' },
});
</script>

<template>
  <terminal-window
    ref="terminalRef"
    :theme="theme"
    :prompt="prompt"
    :welcome="welcome"
    autofocus
  />
</template>
```

Use in pages:

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>Nuxt Terminal Demo</h1>
    <ClientOnly>
      <Terminal
        theme="dark"
        prompt="nuxt> "
        welcome="Welcome to Nuxt 3!"
      />
    </ClientOnly>
  </div>
</template>
```

## Event Handling

Vue supports custom element events with the `@` syntax:

```vue
<terminal-window
  @command="onCommand"
  @command-result="onResult"
  @command-error="onError"
  @output="onOutput"
  @copy="onCopy"
  @close="onClose"
  @minimize="onMinimize"
  @fullscreen="onFullscreen"
/>
```

Access event data via `event.detail`:

```javascript
const onCommand = (event) => {
  const { command, args, input } = event.detail;
  console.log(`Executed: ${command} with args:`, args);
};
```
