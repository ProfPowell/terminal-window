<script setup>
import { ref, onMounted } from 'vue';
import 'terminal-window';

const terminalRef = ref(null);

onMounted(() => {
  const terminal = terminalRef.value;

  // Register custom commands
  terminal.registerCommand('vue', () => {
    return 'Hello from Vue! This terminal is rendered in a Vue 3 app.';
  });

  terminal.registerCommand('ref', () => {
    return 'const terminalRef = ref(null);\n// Access terminal via terminalRef.value';
  });

  terminal.registerCommand('mounted', () => {
    return "onMounted(() => {\n  terminal.registerCommand('cmd', handler);\n});";
  });

  terminal.registerCommand('demo', () => {
    return 'Try these commands: vue, ref, mounted, help';
  });
});

const handleCommand = (event) => {
  console.log('Command executed:', event.detail);
};
</script>

<template>
  <div>
    <h1 style="color: #fff; margin-bottom: 1rem">
      Terminal Window + Vue
    </h1>
    <p style="color: #888; margin-bottom: 1.5rem">
      A web component terminal running in a Vue 3 application. Type
      <code style="color: #ff79c6">demo</code> to see available commands.
    </p>
    <terminal-window
      ref="terminalRef"
      theme="dark"
      prompt="vue> "
      welcome="Vue 3 + Terminal Window Demo. Type 'demo' for commands."
      cursor-style="block"
      cursor-blink
      @command="handleCommand"
      autofocus
    />
  </div>
</template>
