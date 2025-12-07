/**
 * Theme Examples - CSS Custom Properties Playground
 * Demonstrates customizing the terminal using CSS custom properties
 */

export default {
  title: 'Examples/Themes',
  parameters: {
    docs: {
      description: {
        component: `
The terminal can be fully customized using CSS custom properties.
These examples show various theme configurations.

## Available CSS Custom Properties

### Colors
- \`--bg-primary\` - Primary background
- \`--bg-secondary\` - Secondary background
- \`--bg-header\` - Header background
- \`--border-color\` - Border color
- \`--text-primary\` - Primary text
- \`--text-secondary\` - Secondary text
- \`--prompt-color\` - Prompt color
- \`--cursor-color\` - Cursor color
- \`--error-color\` - Error text
- \`--success-color\` - Success text
- \`--info-color\` - Info text

### Window Controls
- \`--control-close\` - Close button color
- \`--control-minimize\` - Minimize button color
- \`--control-maximize\` - Maximize button color
        `,
      },
    },
  },
};

/**
 * GitHub Dark theme using CSS custom properties.
 */
export const GitHubDark = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        #github-terminal {
          --bg-primary: #0d1117;
          --bg-secondary: #161b22;
          --bg-header: #010409;
          --border-color: #30363d;
          --text-primary: #c9d1d9;
          --text-secondary: #8b949e;
          --prompt-color: #58a6ff;
          --cursor-color: #58a6ff;
          --error-color: #f85149;
          --success-color: #3fb950;
          --info-color: #58a6ff;
        }
      </style>
      <terminal-window
        id="github-terminal"
        welcome="GitHub Dark theme - using CSS custom properties"
        prompt="gh:~$ "
      ></terminal-window>
    `;
    return container;
  },
};

/**
 * Dracula theme - popular dark theme with purple accents.
 */
export const Dracula = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        #dracula-terminal {
          --bg-primary: #282a36;
          --bg-secondary: #21222c;
          --bg-header: #191a21;
          --border-color: #44475a;
          --text-primary: #f8f8f2;
          --text-secondary: #6272a4;
          --prompt-color: #50fa7b;
          --cursor-color: #f8f8f2;
          --command-color: #f8f8f2;
          --error-color: #ff5555;
          --success-color: #50fa7b;
          --info-color: #8be9fd;
          --control-close: #ff5555;
          --control-minimize: #f1fa8c;
          --control-maximize: #50fa7b;
        }
      </style>
      <terminal-window
        id="dracula-terminal"
        welcome="Dracula theme - a popular dark theme"
        prompt="dracula:~$ "
      ></terminal-window>
    `;
    return container;
  },
};

/**
 * Nord theme - arctic, north-bluish color palette.
 */
export const Nord = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        #nord-terminal {
          --bg-primary: #2e3440;
          --bg-secondary: #3b4252;
          --bg-header: #242933;
          --border-color: #4c566a;
          --text-primary: #eceff4;
          --text-secondary: #d8dee9;
          --prompt-color: #88c0d0;
          --cursor-color: #d8dee9;
          --error-color: #bf616a;
          --success-color: #a3be8c;
          --info-color: #81a1c1;
        }
      </style>
      <terminal-window
        id="nord-terminal"
        welcome="Nord theme - arctic color palette"
        prompt="nord:~$ "
      ></terminal-window>
    `;
    return container;
  },
};

/**
 * Monokai theme - vibrant colors on dark background.
 */
export const Monokai = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        #monokai-terminal {
          --bg-primary: #272822;
          --bg-secondary: #3e3d32;
          --bg-header: #1e1f1c;
          --border-color: #49483e;
          --text-primary: #f8f8f2;
          --text-secondary: #75715e;
          --prompt-color: #a6e22e;
          --cursor-color: #f8f8f2;
          --error-color: #f92672;
          --success-color: #a6e22e;
          --info-color: #66d9ef;
        }
      </style>
      <terminal-window
        id="monokai-terminal"
        welcome="Monokai theme - vibrant classic"
        prompt="monokai:~$ "
      ></terminal-window>
    `;
    return container;
  },
};

/**
 * Solarized Dark theme - precision colors for machines and people.
 */
export const SolarizedDark = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        #solarized-terminal {
          --bg-primary: #002b36;
          --bg-secondary: #073642;
          --bg-header: #001e26;
          --border-color: #586e75;
          --text-primary: #839496;
          --text-secondary: #657b83;
          --prompt-color: #859900;
          --cursor-color: #93a1a1;
          --error-color: #dc322f;
          --success-color: #859900;
          --info-color: #268bd2;
        }
      </style>
      <terminal-window
        id="solarized-terminal"
        welcome="Solarized Dark theme"
        prompt="solarized:~$ "
      ></terminal-window>
    `;
    return container;
  },
};

/**
 * Retro Green - classic green-on-black CRT look.
 */
export const RetroGreen = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        #retro-terminal {
          --bg-primary: #0a0a0a;
          --bg-secondary: #111111;
          --bg-header: #050505;
          --border-color: #1a3a1a;
          --text-primary: #33ff33;
          --text-secondary: #228b22;
          --prompt-color: #33ff33;
          --cursor-color: #33ff33;
          --command-color: #33ff33;
          --output-color: #33ff33;
          --error-color: #ff3333;
          --success-color: #33ff33;
          --info-color: #33ff99;
        }
      </style>
      <terminal-window
        id="retro-terminal"
        welcome="Retro green CRT terminal"
        prompt="> "
        title="MAINFRAME"
      ></terminal-window>
    `;
    return container;
  },
};

/**
 * Retro Amber - classic amber phosphor CRT look.
 */
export const RetroAmber = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        #amber-terminal {
          --bg-primary: #0a0800;
          --bg-secondary: #111008;
          --bg-header: #050400;
          --border-color: #3a2a0a;
          --text-primary: #ffb000;
          --text-secondary: #cc8800;
          --prompt-color: #ffb000;
          --cursor-color: #ffb000;
          --command-color: #ffb000;
          --output-color: #ffb000;
          --error-color: #ff4400;
          --success-color: #ffcc00;
          --info-color: #ffd700;
        }
      </style>
      <terminal-window
        id="amber-terminal"
        welcome="Retro amber phosphor CRT"
        prompt="> "
        title="VT100"
      ></terminal-window>
    `;
    return container;
  },
};
