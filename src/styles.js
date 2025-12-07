/**
 * Terminal Window Styles
 */
export const styles = `
  :host {
    display: block;
    height: 100%;
  }

  * {
    box-sizing: border-box;
  }

  /* Screen reader only content */
  .sr-announcer {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* ===== CSS Custom Properties (User Customizable) ===== */
  .terminal {
    /* Font settings */
    --font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    --font-size: 14px;
    --line-height: 1.4;

    /* Cursor settings */
    --cursor-width: 8px;
    --cursor-height: 1.2em;
    --cursor-blink-speed: 1s;
  }

  /* ===== DARK THEME ===== */
  .terminal[data-theme="dark"] {
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --bg-header: #0f0f23;
    --border-color: #2a2a4a;
    --text-primary: #e0e0e0;
    --text-secondary: #888;
    --text-muted: #666;

    --prompt-color: #50fa7b;
    --cursor-color: #50fa7b;
    --command-color: #f8f8f2;
    --output-color: #e0e0e0;
    --error-color: #ff5555;
    --info-color: #8be9fd;
    --success-color: #50fa7b;

    --selection-bg: rgba(80, 250, 123, 0.3);

    --btn-bg: #2a2a4a;
    --btn-hover: #3a3a5a;
    --btn-text: #e0e0e0;

    --scrollbar-track: #1a1a2e;
    --scrollbar-thumb: #3a3a5a;
    --scrollbar-thumb-hover: #4a4a6a;

    --control-close: #ff5f56;
    --control-minimize: #ffbd2e;
    --control-maximize: #27c93f;

    --theme-icon: "\\263E"; /* Moon */

    /* ANSI colors */
    --ansi-black: #21222c;
    --ansi-red: #ff5555;
    --ansi-green: #50fa7b;
    --ansi-yellow: #f1fa8c;
    --ansi-blue: #bd93f9;
    --ansi-magenta: #ff79c6;
    --ansi-cyan: #8be9fd;
    --ansi-white: #f8f8f2;
    --ansi-bright-black: #6272a4;
    --ansi-bright-red: #ff6e6e;
    --ansi-bright-green: #69ff94;
    --ansi-bright-yellow: #ffffa5;
    --ansi-bright-blue: #d6acff;
    --ansi-bright-magenta: #ff92df;
    --ansi-bright-cyan: #a4ffff;
    --ansi-bright-white: #ffffff;
  }

  /* ===== LIGHT THEME ===== */
  .terminal[data-theme="light"] {
    --bg-primary: #fafafa;
    --bg-secondary: #f0f0f0;
    --bg-header: #e8e8e8;
    --border-color: #d0d0d0;
    --text-primary: #333;
    --text-secondary: #666;
    --text-muted: #999;

    --prompt-color: #16a34a;
    --cursor-color: #16a34a;
    --command-color: #1a1a1a;
    --output-color: #333;
    --error-color: #dc2626;
    --info-color: #0284c7;
    --success-color: #16a34a;

    --selection-bg: rgba(22, 163, 74, 0.2);

    --btn-bg: #e0e0e0;
    --btn-hover: #d0d0d0;
    --btn-text: #333;

    --scrollbar-track: #f0f0f0;
    --scrollbar-thumb: #c0c0c0;
    --scrollbar-thumb-hover: #a0a0a0;

    --control-close: #ff5f56;
    --control-minimize: #ffbd2e;
    --control-maximize: #27c93f;

    --theme-icon: "\\2600"; /* Sun */

    /* ANSI colors (adjusted for light theme) */
    --ansi-black: #000000;
    --ansi-red: #c41a16;
    --ansi-green: #007400;
    --ansi-yellow: #826b28;
    --ansi-blue: #0000ff;
    --ansi-magenta: #a90d91;
    --ansi-cyan: #318495;
    --ansi-white: #666666;
    --ansi-bright-black: #666666;
    --ansi-bright-red: #eb3223;
    --ansi-bright-green: #1cdc23;
    --ansi-bright-yellow: #cdcd00;
    --ansi-bright-blue: #5c5cff;
    --ansi-bright-magenta: #eb3eb3;
    --ansi-bright-cyan: #23cece;
    --ansi-bright-white: #c7c7c7;
  }

  /* ANSI color classes */
  .ansi-black { color: var(--ansi-black); }
  .ansi-red { color: var(--ansi-red); }
  .ansi-green { color: var(--ansi-green); }
  .ansi-yellow { color: var(--ansi-yellow); }
  .ansi-blue { color: var(--ansi-blue); }
  .ansi-magenta { color: var(--ansi-magenta); }
  .ansi-cyan { color: var(--ansi-cyan); }
  .ansi-white { color: var(--ansi-white); }
  .ansi-bright-black { color: var(--ansi-bright-black); }
  .ansi-bright-red { color: var(--ansi-bright-red); }
  .ansi-bright-green { color: var(--ansi-bright-green); }
  .ansi-bright-yellow { color: var(--ansi-bright-yellow); }
  .ansi-bright-blue { color: var(--ansi-bright-blue); }
  .ansi-bright-magenta { color: var(--ansi-bright-magenta); }
  .ansi-bright-cyan { color: var(--ansi-bright-cyan); }
  .ansi-bright-white { color: var(--ansi-bright-white); }
  .ansi-bold { font-weight: bold; }
  .ansi-italic { font-style: italic; }
  .ansi-underline { text-decoration: underline; }
  .ansi-bg-black { background-color: var(--ansi-black); }
  .ansi-bg-red { background-color: var(--ansi-red); }
  .ansi-bg-green { background-color: var(--ansi-green); }
  .ansi-bg-yellow { background-color: var(--ansi-yellow); }
  .ansi-bg-blue { background-color: var(--ansi-blue); }
  .ansi-bg-magenta { background-color: var(--ansi-magenta); }
  .ansi-bg-cyan { background-color: var(--ansi-cyan); }
  .ansi-bg-white { background-color: var(--ansi-white); }

  /* ===== Terminal Container ===== */
  .terminal {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    font-family: var(--font-family);
    font-size: var(--font-size);
    line-height: var(--line-height);
    color: var(--text-primary);
  }

  /* Focus outline for accessibility */
  .terminal:focus-within {
    outline: 2px solid var(--prompt-color);
    outline-offset: 2px;
  }

  /* ===== Terminal Header ===== */
  .terminal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--bg-header);
    border-bottom: 1px solid var(--border-color);
    user-select: none;
  }

  .window-controls {
    display: flex;
    gap: 8px;
  }

  .control {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  .control:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }

  .control:active {
    transform: scale(0.95);
  }

  .control.close {
    background: var(--control-close);
  }

  .control.minimize {
    background: var(--control-minimize);
  }

  .control.maximize {
    background: var(--control-maximize);
  }

  .terminal-title {
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
  }

  .terminal-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* Slot styling */
  ::slotted([slot="title"]) {
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
  }

  ::slotted([slot="actions"]) {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  ::slotted([slot="before-output"]) {
    display: block;
    margin-bottom: 8px;
  }

  .theme-btn,
  .copy-btn {
    padding: 4px 10px;
    background: var(--btn-bg);
    color: var(--btn-text);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    transition: background 0.2s;
  }

  .theme-btn {
    padding: 4px 8px;
    font-size: 14px;
  }

  .theme-btn::before {
    content: var(--theme-icon);
  }

  .theme-btn:hover,
  .copy-btn:hover {
    background: var(--btn-hover);
  }

  .theme-btn:focus,
  .copy-btn:focus {
    outline: 2px solid var(--prompt-color);
    outline-offset: 2px;
  }

  /* Copy button success state */
  .copy-btn.copy-success {
    background: var(--success-color, #50fa7b);
    color: var(--bg-primary);
  }

  /* Copy menu wrapper and dropdown */
  .copy-wrapper {
    position: relative;
  }

  .copy-menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    min-width: 160px;
    overflow: hidden;
  }

  .copy-menu-item {
    display: block;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 12px;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s;
  }

  .copy-menu-item:hover {
    background: var(--btn-hover);
  }

  .copy-menu-item:focus {
    background: var(--btn-hover);
    outline: none;
  }

  /* ===== Terminal Body ===== */
  .terminal-body {
    flex: 1;
    min-height: 0; /* Critical: allows flex item to shrink below content size */
    padding: 16px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .terminal-body::-webkit-scrollbar {
    width: 8px;
  }

  .terminal-body::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
  }

  .terminal-body::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 4px;
  }

  .terminal-body::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-thumb-hover);
  }

  /* ===== Output ===== */
  .output {
    margin-bottom: 4px;
  }

  .output-line {
    padding: 2px 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .output-line::selection, 
  .output-line *::selection {
    background: var(--selection-bg);
  }

  .line-command {
    color: var(--command-color);
  }

  .line-command .line-prompt {
    color: var(--prompt-color);
    font-weight: bold;
  }

  .line-output {
    color: var(--output-color);
  }

  .line-error {
    color: var(--error-color);
  }

  .line-info {
    color: var(--info-color);
  }

  .line-success {
    color: var(--success-color);
  }

  /* ===== Input Line ===== */
  .input-line {
    display: flex;
    align-items: center;
  }

  .terminal[data-readonly="true"] .input-line {
    display: none;
  }

  .input-prompt {
    color: var(--prompt-color);
    font-weight: bold;
    flex-shrink: 0;
    white-space: pre;
  }

  .input-display {
    display: flex;
    align-items: center;
    flex: 1;
    min-height: 1.4em;
  }

  .input-text {
    color: var(--command-color);
    white-space: pre;
  }

  .hidden-input {
    position: absolute;
    left: -9999px;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  /* ===== Cursor Styles ===== */
  .cursor {
    display: inline-block;
    background: var(--cursor-color);
    margin-left: 1px;
  }

  /* Block cursor */
  .terminal[data-cursor-style="block"] .cursor {
    width: var(--cursor-width);
    height: var(--cursor-height);
  }

  /* Underline cursor */
  .terminal[data-cursor-style="underline"] .cursor {
    width: var(--cursor-width);
    height: 2px;
    align-self: flex-end;
    margin-bottom: 3px;
  }

  /* Bar cursor */
  .terminal[data-cursor-style="bar"] .cursor {
    width: 2px;
    height: var(--cursor-height);
  }

  /* Blinking cursor animation */
  @keyframes terminal-blink {
    0%, 49% {
      opacity: 1;
    }
    50%, 100% {
      opacity: 0;
    }
  }

  .terminal[data-cursor-blink="true"] .cursor {
    animation: terminal-blink var(--cursor-blink-speed) step-start infinite;
  }

  /* Typing cursor (shown during typing effect) */
  .typing-cursor {
    display: inline-block;
    width: var(--cursor-width);
    height: var(--cursor-height);
    background: var(--cursor-color);
    margin-left: 1px;
    animation: terminal-blink var(--cursor-blink-speed) step-start infinite;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .terminal {
      border-width: 2px;
    }
    .terminal:focus-within {
      outline-width: 3px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .terminal[data-cursor-blink="true"] .cursor {
      animation: none;
      opacity: 1;
    }
    .theme-btn,
    .copy-btn,
    .control {
      transition: none;
    }
  }

  /* ===== Fullscreen Mode ===== */
  .terminal.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99999;
    border-radius: 0;
    border: none;
  }

  .terminal.fullscreen .terminal-header {
    border-radius: 0;
  }
`
