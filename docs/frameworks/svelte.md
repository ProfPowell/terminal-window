# Svelte Integration

This guide shows how to use `terminal-window` in a Svelte application.

## Live Demo

[Open in StackBlitz](https://stackblitz.com/edit/vitejs-vite-svelte-terminal-window)

## Installation

```bash
npm install terminal-window
```

## Basic Usage

Svelte has excellent native web component support - no configuration needed!

```svelte
<!-- App.svelte -->
<script>
  import { onMount } from 'svelte';
  import 'terminal-window';

  let terminal;

  onMount(() => {
    // Register custom commands
    terminal.registerCommand('svelte', () => {
      return 'Hello from Svelte!';
    });

    terminal.registerCommand('greet', (args) => {
      return `Hello, ${args[0] || 'World'}!`;
    });
  });

  function handleCommand(event) {
    console.log('Command:', event.detail.command);
    console.log('Args:', event.detail.args);
  }
</script>

<terminal-window
  bind:this={terminal}
  theme="dark"
  prompt="svelte> "
  welcome="Svelte + Terminal Window. Type 'svelte' or 'help'."
  autofocus
  on:command={handleCommand}
/>

<style>
  terminal-window {
    width: 100%;
    height: 400px;
  }
</style>
```

## Svelte 5 (Runes)

Using Svelte 5's new runes syntax:

```svelte
<!-- App.svelte -->
<script>
  import { onMount } from 'svelte';
  import 'terminal-window';

  let terminal = $state(null);
  let commandHistory = $state([]);

  onMount(() => {
    terminal.registerCommand('count', () => {
      return `Commands executed: ${commandHistory.length}`;
    });
  });

  function handleCommand(event) {
    commandHistory = [...commandHistory, event.detail];
  }
</script>

<terminal-window
  bind:this={terminal}
  theme="dark"
  prompt="$ "
  autofocus
  oncommand={handleCommand}
/>

<div class="history">
  <h3>History ({commandHistory.length})</h3>
  {#each commandHistory as item}
    <p>{item.command} {item.args.join(' ')}</p>
  {/each}
</div>
```

## Reusable Component

Create a wrapper component for reusability:

```svelte
<!-- lib/Terminal.svelte -->
<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import 'terminal-window';

  export let theme = 'dark';
  export let prompt = '$ ';
  export let welcome = '';
  export let enableVfs = false;
  export let commands = {};

  let terminal;
  const dispatch = createEventDispatcher();

  onMount(() => {
    // Register custom commands
    Object.entries(commands).forEach(([name, handler]) => {
      terminal.registerCommand(name, handler);
    });
  });

  // Expose methods
  export function executeCommand(cmd) {
    terminal?.executeCommand(cmd);
  }

  export function print(text, type) {
    terminal?.print(text, type);
  }

  export function clear() {
    terminal?.clear();
  }

  function handleCommand(event) {
    dispatch('command', event.detail);
  }

  function handleOutput(event) {
    dispatch('output', event.detail);
  }
</script>

<terminal-window
  bind:this={terminal}
  {theme}
  {prompt}
  {welcome}
  enable-vfs={enableVfs}
  autofocus
  on:command={handleCommand}
  on:output={handleOutput}
/>

<style>
  terminal-window {
    width: 100%;
    height: 100%;
  }
</style>
```

### Using the Component

```svelte
<!-- App.svelte -->
<script>
  import Terminal from '$lib/Terminal.svelte';

  let terminalComponent;

  const myCommands = {
    hello: () => 'Hello, Svelte!',
    add: (args) => {
      const sum = args.reduce((a, b) => a + Number(b), 0);
      return `Sum: ${sum}`;
    },
    random: () => Math.random().toString(),
  };

  function handleCommand(event) {
    console.log('Executed:', event.detail);
  }
</script>

<main>
  <h1>Svelte Terminal Demo</h1>

  <Terminal
    bind:this={terminalComponent}
    theme="dark"
    prompt="svelte> "
    welcome="Try: hello, add 1 2 3, random"
    commands={myCommands}
    enableVfs
    on:command={handleCommand}
  />

  <div class="controls">
    <button on:click={() => terminalComponent.clear()}>Clear</button>
    <button on:click={() => terminalComponent.executeCommand('help')}>
      Help
    </button>
  </div>
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .controls {
    margin-top: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #4f46e5;
    color: white;
    cursor: pointer;
  }
</style>
```

## TypeScript Support

Create type declarations:

```typescript
// src/types/terminal-window.d.ts
declare namespace svelteHTML {
  interface IntrinsicElements {
    'terminal-window': {
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
      'on:command'?: (e: CustomEvent) => void;
      'on:command-result'?: (e: CustomEvent) => void;
      'on:output'?: (e: CustomEvent) => void;
    };
  }
}
```

## SvelteKit

For SvelteKit, use dynamic imports for client-side loading:

```svelte
<!-- routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let terminal;

  onMount(async () => {
    if (browser) {
      await import('terminal-window');
    }
  });
</script>

{#if browser}
  <terminal-window
    bind:this={terminal}
    theme="dark"
    prompt="kit> "
    welcome="Welcome to SvelteKit!"
    autofocus
  />
{/if}
```

Or use the `{#await}` block:

```svelte
<script>
  import { browser } from '$app/environment';

  const loadTerminal = browser ? import('terminal-window') : Promise.resolve();
</script>

{#await loadTerminal then _}
  <terminal-window theme="dark" prompt="$ " autofocus />
{/await}
```

## Styling

Style with standard CSS:

```svelte
<style>
  terminal-window {
    width: 100%;
    height: 400px;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  /* Style shadow DOM parts */
  terminal-window::part(header) {
    background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
  }

  terminal-window::part(prompt) {
    color: #feca57;
  }
</style>
```
