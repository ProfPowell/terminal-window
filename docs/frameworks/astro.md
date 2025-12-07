# Astro Integration

This guide shows how to use `terminal-window` in an Astro site.

## Live Demo

[Open in StackBlitz](https://stackblitz.com/edit/astro-terminal-window)

## Installation

```bash
npm install terminal-window
```

## Basic Usage

Astro is perfect for web components - they work without any hydration for static content!

```astro
---
// src/pages/index.astro
---

<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Astro Terminal Demo</title>
</head>
<body>
  <h1>Astro Terminal Demo</h1>

  <terminal-window
    theme="dark"
    prompt="astro> "
    welcome="Welcome to Astro! Type 'help' for commands."
    enable-vfs
    autofocus
  />

  <script>
    import 'terminal-window';

    const terminal = document.querySelector('terminal-window');

    // Register custom commands
    terminal.registerCommand('astro', () => {
      return 'Hello from Astro!';
    });

    terminal.registerCommand('build', () => {
      return 'Building your Astro site...';
    });
  </script>
</body>
</html>

<style>
  terminal-window {
    width: 100%;
    max-width: 800px;
    height: 400px;
    margin: 2rem auto;
  }
</style>
```

## Component Approach

Create a reusable Astro component:

```astro
---
// src/components/Terminal.astro
interface Props {
  theme?: 'dark' | 'light';
  prompt?: string;
  welcome?: string;
  enableVfs?: boolean;
  id?: string;
}

const {
  theme = 'dark',
  prompt = '$ ',
  welcome = '',
  enableVfs = false,
  id = 'terminal'
} = Astro.props;
---

<terminal-window
  id={id}
  theme={theme}
  prompt={prompt}
  welcome={welcome}
  enable-vfs={enableVfs}
  autofocus
/>

<script>
  import 'terminal-window';
</script>

<style>
  terminal-window {
    display: block;
    width: 100%;
    height: 400px;
  }
</style>
```

### Using the Component

```astro
---
// src/pages/index.astro
import Terminal from '../components/Terminal.astro';
import Layout from '../layouts/Layout.astro';
---

<Layout title="Terminal Demo">
  <h1>My Terminal</h1>

  <Terminal
    theme="dark"
    prompt="dev> "
    welcome="Welcome! Type 'help' to get started."
    enableVfs
  />
</Layout>
```

## Interactive Terminal with Client Scripts

For terminals that need JavaScript interactivity:

```astro
---
// src/components/InteractiveTerminal.astro
interface Props {
  commands?: Record<string, string>;
}

const { commands = {} } = Astro.props;
---

<div class="terminal-wrapper">
  <terminal-window
    id="interactive-terminal"
    theme="dark"
    prompt="$ "
    enable-vfs
    autofocus
  />

  <div class="controls">
    <button data-cmd="help">Help</button>
    <button data-cmd="clear">Clear</button>
    <button data-cmd="ls">List Files</button>
  </div>
</div>

<script define:vars={{ commands }}>
  import 'terminal-window';

  const terminal = document.getElementById('interactive-terminal');

  // Wait for custom element to be defined
  customElements.whenDefined('terminal-window').then(() => {
    // Register custom commands from props
    Object.entries(commands).forEach(([name, response]) => {
      terminal.registerCommand(name, () => response);
    });
  });

  // Handle button clicks
  document.querySelectorAll('[data-cmd]').forEach(button => {
    button.addEventListener('click', () => {
      const cmd = button.dataset.cmd;
      terminal.executeCommand(cmd);
    });
  });
</script>

<style>
  .terminal-wrapper {
    max-width: 800px;
    margin: 0 auto;
  }

  .controls {
    margin-top: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  .controls button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #4f46e5;
    color: white;
    cursor: pointer;
  }

  .controls button:hover {
    background: #4338ca;
  }
</style>
```

## With Framework Components

Use with React, Vue, or Svelte islands:

```astro
---
// src/pages/hybrid.astro
import Layout from '../layouts/Layout.astro';
import ReactTerminal from '../components/ReactTerminal';
---

<Layout title="Hybrid Demo">
  <h1>Framework Islands</h1>

  <!-- Static Astro terminal -->
  <section>
    <h2>Static Terminal</h2>
    <terminal-window
      theme="dark"
      prompt="static> "
      welcome="This is a static terminal"
    />
  </section>

  <!-- React island with client:load -->
  <section>
    <h2>React Terminal</h2>
    <ReactTerminal client:load />
  </section>
</Layout>

<script>
  import 'terminal-window';
</script>
```

React component:

```jsx
// src/components/ReactTerminal.jsx
import { useEffect, useRef } from 'react';
import 'terminal-window';

export default function ReactTerminal() {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.registerCommand('react', () => 'Hello from React island!');
  }, []);

  return (
    <terminal-window
      ref={ref}
      theme="light"
      prompt="react> "
      welcome="This is a React island"
      autofocus
    />
  );
}
```

## Content Collections Integration

Use with Astro's content collections for tutorial sites:

```astro
---
// src/pages/tutorials/[...slug].astro
import { getCollection, getEntry } from 'astro:content';
import Terminal from '../../components/Terminal.astro';

export async function getStaticPaths() {
  const tutorials = await getCollection('tutorials');
  return tutorials.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<article>
  <h1>{entry.data.title}</h1>

  <Content />

  <!-- Interactive terminal for the tutorial -->
  {entry.data.commands && (
    <Terminal
      theme="dark"
      prompt={entry.data.prompt || '$ '}
      welcome={`Tutorial: ${entry.data.title}`}
      enableVfs
    />
  )}
</article>

<script define:vars={{ commands: entry.data.commands }}>
  import 'terminal-window';

  const terminal = document.querySelector('terminal-window');
  if (terminal && commands) {
    Object.entries(commands).forEach(([name, response]) => {
      terminal.registerCommand(name, () => response);
    });
  }
</script>
```

## SSG Considerations

Since `terminal-window` requires the browser:

1. Import in `<script>` tags (client-side only)
2. Don't use in frontmatter or server-side code
3. For prerendered pages, the HTML renders but JS activates on load

```astro
---
// This runs on the server - NO terminal-window here!
const title = "My Terminal";
---

<!-- Terminal renders as HTML, hydrates on client -->
<terminal-window
  theme="dark"
  prompt="$ "
  welcome={`Welcome to ${title}`}
/>

<script>
  // This runs in the browser
  import 'terminal-window';
</script>
```

## Styling

```css
/* Global styles in src/styles/global.css */
terminal-window {
  --bg-primary: #1a1a2e;
  --prompt-color: #00d9ff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

terminal-window::part(header) {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}
```
