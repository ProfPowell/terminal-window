<script>
  import { onMount } from 'svelte';
  import 'terminal-window';

  let terminal;

  onMount(() => {
    // Register custom commands
    terminal.registerCommand('svelte', () => {
      return 'Hello from Svelte! No config needed - it just works.';
    });

    terminal.registerCommand('bind', () => {
      return 'let terminal;\n// Use bind:this={terminal} to get reference';
    });

    terminal.registerCommand('onMount', () => {
      return "onMount(() => {\n  terminal.registerCommand('cmd', handler);\n});";
    });

    terminal.registerCommand('demo', () => {
      return 'Try these commands: svelte, bind, onMount, help';
    });
  });

  function handleCommand(event) {
    console.log('Command executed:', event.detail);
  }
</script>

<div>
  <h1 style="color: #fff; margin-bottom: 1rem">
    Terminal Window + Svelte
  </h1>
  <p style="color: #888; margin-bottom: 1.5rem">
    A web component terminal running in a Svelte application. Type
    <code style="color: #ff79c6">demo</code> to see available commands.
  </p>
  <terminal-window
    bind:this={terminal}
    theme="dark"
    prompt="svelte> "
    welcome="Svelte + Terminal Window Demo. Type 'demo' for commands."
    cursor-style="block"
    cursor-blink
    on:command={handleCommand}
    autofocus
  />
</div>
