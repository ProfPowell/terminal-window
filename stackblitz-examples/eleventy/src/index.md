---
layout: layouts/base.njk
title: Eleventy Demo
---

# Terminal Window + Eleventy

A web component terminal running in an Eleventy (11ty) site. Type `demo` to see available commands.

<terminal-window
  id="terminal"
  theme="dark"
  prompt="11ty> "
  welcome="Eleventy + Terminal Window Demo. Type 'demo' for commands."
  cursor-style="block"
  cursor-blink
  autofocus
></terminal-window>

<script type="module">
  const terminal = document.getElementById('terminal');

  customElements.whenDefined('terminal-window').then(() => {
    // Register custom commands
    terminal.registerCommand('11ty', () => {
      return 'Hello from Eleventy! Great for docs and tutorials.';
    });

    terminal.registerCommand('passthrough', () => {
      return "eleventyConfig.addPassthroughCopy({\n  'node_modules/terminal-window/dist': 'js/terminal-window'\n});";
    });

    terminal.registerCommand('shortcode', () => {
      return '{% terminal theme="dark", enableVfs=true %}';
    });

    terminal.registerCommand('demo', () => {
      return 'Try these commands: 11ty, passthrough, shortcode, help';
    });
  });
</script>
