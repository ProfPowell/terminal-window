class m {
  constructor() {
    this.ansiColors = {
      30: "ansi-black",
      31: "ansi-red",
      32: "ansi-green",
      33: "ansi-yellow",
      34: "ansi-blue",
      35: "ansi-magenta",
      36: "ansi-cyan",
      37: "ansi-white",
      90: "ansi-bright-black",
      91: "ansi-bright-red",
      92: "ansi-bright-green",
      93: "ansi-bright-yellow",
      94: "ansi-bright-blue",
      95: "ansi-bright-magenta",
      96: "ansi-bright-cyan",
      97: "ansi-bright-white"
    }, this.ansiBgColors = {
      40: "ansi-bg-black",
      41: "ansi-bg-red",
      42: "ansi-bg-green",
      43: "ansi-bg-yellow",
      44: "ansi-bg-blue",
      45: "ansi-bg-magenta",
      46: "ansi-bg-cyan",
      47: "ansi-bg-white"
    };
  }
  /**
   * Parse ANSI escape codes and convert to HTML
   * @param {string} text - Text with ANSI codes
   * @param {Function} escapeHtml - Function to escape HTML
   * @returns {string} HTML string
   */
  parse(t, e) {
    const i = /\x1b\[([0-9;]+)m/g;
    let s = "", r = 0, n = [], a;
    for (; (a = i.exec(t)) !== null; ) {
      if (a.index > r) {
        const l = e(t.slice(r, a.index));
        n.length > 0 ? s += `<span class="${n.join(" ")}">${l}</span>` : s += l;
      }
      const c = a[1].split(";");
      for (const l of c)
        l === "0" ? n = [] : l === "1" ? n.push("ansi-bold") : l === "3" ? n.push("ansi-italic") : l === "4" ? n.push("ansi-underline") : this.ansiColors[l] ? (n = n.filter((o) => !o.startsWith("ansi-") || o.startsWith("ansi-bg-") || o.startsWith("ansi-bold") || o.startsWith("ansi-italic") || o.startsWith("ansi-underline")), n.push(this.ansiColors[l])) : this.ansiBgColors[l] && (n = n.filter((o) => !o.startsWith("ansi-bg-")), n.push(this.ansiBgColors[l]));
      r = a.index + a[0].length;
    }
    if (r < t.length) {
      const c = e(t.slice(r));
      n.length > 0 ? s += `<span class="${n.join(" ")}">${c}</span>` : s += c;
    }
    return s || e(t);
  }
}
class f {
  constructor() {
    this.commands = /* @__PURE__ */ new Map(), this.aliases = /* @__PURE__ */ new Map();
  }
  /**
   * Register a command handler
   * @param {string} name - Command name
   * @param {Function} handler - Function that receives args array and returns string or null
   */
  register(t, e) {
    this.commands.set(t.toLowerCase(), e);
  }
  /**
   * Unregister a command
   * @param {string} name - Command name
   */
  unregister(t) {
    this.commands.delete(t.toLowerCase());
  }
  /**
   * Register a command alias
   * @param {string} alias - Alias name
   * @param {string} command - Command to execute
   */
  registerAlias(t, e) {
    this.aliases.set(t.toLowerCase(), e);
  }
  /**
   * Check if command exists
   * @param {string} name - Command name
   * @returns {boolean}
   */
  has(t) {
    return this.commands.has(t.toLowerCase());
  }
  /**
   * Get a command handler
   * @param {string} name - Command name
   * @returns {Function|undefined}
   */
  get(t) {
    return this.commands.get(t.toLowerCase());
  }
  /**
   * Get all command names
   * @returns {string[]}
   */
  getNames() {
    return Array.from(this.commands.keys()).sort();
  }
  /**
   * Resolve a potential alias
   * @param {string} input - Input string
   * @returns {string} Resolved command string
   */
  resolveAlias(t) {
    const e = t.split(" ")[0].toLowerCase();
    return this.aliases.has(e) ? this.aliases.get(e) + t.slice(e.length) : t;
  }
  /**
   * Parse command string into parts (handles quotes)
   * @param {string} input - Command input
   * @returns {string[]} Array of command parts
   */
  parse(t) {
    const e = [];
    let i = "", s = !1, r = "";
    for (let n = 0; n < t.length; n++) {
      const a = t[n];
      !s && (a === '"' || a === "'") ? (s = !0, r = a) : s && a === r ? (s = !1, r = "") : !s && a === " " ? i && (e.push(i), i = "") : i += a;
    }
    return i && e.push(i), e;
  }
}
class y {
  constructor() {
    this.history = [], this.index = -1, this.storageKey = "terminal-history";
  }
  /**
   * Add a command to history
   * @param {string} command - Command to add
   */
  add(t) {
    if (!t || this.history.length > 0 && this.history[this.history.length - 1] === t) {
      this.index = this.history.length;
      return;
    }
    this.history.push(t), this.index = this.history.length, this._persist();
  }
  /**
   * Navigate history
   * @param {number} direction - Direction (-1 for up/back, 1 for down/forward)
   * @returns {string|null} The command at the new index, or null if out of bounds (or empty string if new line)
   */
  navigate(t) {
    const e = this.index + t;
    return e < 0 ? null : e >= this.history.length ? (this.index = this.history.length, "") : (this.index = e, this.history[this.index]);
  }
  /**
   * Get the current history array (copy)
   * @returns {string[]}
   */
  getHistory() {
    return [...this.history];
  }
  /**
   * Set the history array
   * @param {string[]} history 
   */
  setHistory(t) {
    Array.isArray(t) && (this.history = t.map((e) => String(e)), this.index = this.history.length, this._persist());
  }
  /**
   * Clear history
   */
  clear() {
    this.history = [], this.index = -1, this._persist();
  }
  /**
   * Get formatted history for display
   * @returns {string} Formatted history string
   */
  getFormattedHistory() {
    return this.history.map((t, e) => `  ${e + 1}  ${t}`).join(`
`);
  }
  /**
   * Check if history is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.history.length === 0;
  }
  /**
   * Enable/Disable persistence
   * @param {boolean} enabled 
   */
  setPersistence(t) {
    this.persistenceEnabled = t, t ? this._load() : localStorage.removeItem(this.storageKey);
  }
  _persist() {
    if (this.persistenceEnabled)
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.history));
      } catch (t) {
        console.warn("Failed to save history to localStorage", t);
      }
  }
  _load() {
    try {
      const t = localStorage.getItem(this.storageKey);
      t && (this.history = JSON.parse(t), this.index = this.history.length);
    } catch (t) {
      console.warn("Failed to load history from localStorage", t);
    }
  }
}
class g {
  constructor() {
    this.root = {
      type: "dir",
      name: "/",
      children: /* @__PURE__ */ new Map(),
      parent: null
    }, this.cwd = this.root, this.currentPath = "/", this._initDefaultStructure();
  }
  /**
   * Initialize default file system structure
   */
  _initDefaultStructure() {
    this.mkdir("/home"), this.mkdir("/home/user"), this.mkdir("/bin"), this.mkdir("/etc"), this.mkdir("/tmp"), this.mkdir("/var"), this.cwd = this.resolvePathObject("/home/user"), this.currentPath = "/home/user", this.writeFile("/home/user/README.md", `# Welcome

This is a virtual file system.`);
  }
  /**
   * Get current working directory path
   * @returns {string}
   */
  getcwd() {
    return this.currentPath;
  }
  /**
   * Change directory
   * @param {string} path 
   * @returns {string|null} Error message or null if success
   */
  cd(t) {
    if (!t || t === "~")
      return this.cd("/home/user");
    const e = this.resolvePathObject(t);
    return e ? e.type !== "dir" ? `cd: ${t}: Not a directory` : (this.cwd = e, this.currentPath = this._getAbsolutePath(e), null) : `cd: ${t}: No such file or directory`;
  }
  /**
   * List directory contents
   * @param {string} path (optional)
   * @returns {Array} List of file objects or error string
   */
  ls(t = ".") {
    const e = this.resolvePathObject(t);
    return e ? e.type !== "dir" ? [e] : Array.from(e.children.values()) : `ls: cannot access '${t}': No such file or directory`;
  }
  /**
   * Create a directory
   * @param {string} path 
   * @returns {string|null} Error message or null if success
   */
  mkdir(t) {
    const e = t.substring(0, t.lastIndexOf("/")) || (t.startsWith("/") ? "/" : "."), i = t.split("/").pop(), s = this.resolvePathObject(e);
    if (!s)
      return `mkdir: cannot create directory '${t}': No such file or directory`;
    if (s.type !== "dir")
      return `mkdir: cannot create directory '${t}': Not a directory`;
    if (s.children.has(i))
      return `mkdir: cannot create directory '${t}': File exists`;
    const r = {
      type: "dir",
      name: i,
      children: /* @__PURE__ */ new Map(),
      parent: s
    };
    return s.children.set(i, r), null;
  }
  /**
   * Create an empty file or update timestamp
   * @param {string} path 
   */
  touch(t) {
    const e = t.substring(0, t.lastIndexOf("/")) || (t.startsWith("/") ? "/" : "."), i = t.split("/").pop(), s = this.resolvePathObject(e);
    return !s || s.type !== "dir" ? `touch: cannot touch '${t}': No such file or directory` : (s.children.has(i) || this.writeFile(t, ""), null);
  }
  /**
   * Write content to a file
   * @param {string} path 
   * @param {string} content 
   */
  writeFile(t, e) {
    const i = t.substring(0, t.lastIndexOf("/")) || (t.startsWith("/") ? "/" : "."), s = t.split("/").pop(), r = this.resolvePathObject(i);
    if (!r || r.type !== "dir") return !1;
    const n = {
      type: "file",
      name: s,
      content: e,
      parent: r,
      size: e.length,
      lastModified: /* @__PURE__ */ new Date()
    };
    return r.children.set(s, n), !0;
  }
  /**
   * Read file content
   * @param {string} path 
   * @returns {string} Content or error message
   */
  readFile(t) {
    const e = this.resolvePathObject(t);
    return e ? e.type === "dir" ? `cat: ${t}: Is a directory` : e.content : `cat: ${t}: No such file or directory`;
  }
  /**
   * Remove a file or directory
   * @param {string} path 
   * @param {boolean} recursive 
   */
  rm(t, e = !1) {
    const i = this.resolvePathObject(t);
    if (!i) return `rm: cannot remove '${t}': No such file or directory`;
    if (i.type === "dir" && !e)
      return `rm: cannot remove '${t}': Is a directory`;
    if (i === this.root)
      return "rm: it is dangerous to operate recursively on /";
    const s = i.parent;
    return s && s.children.delete(i.name), null;
  }
  /**
   * Helper: Resolve path string to object
   */
  resolvePathObject(t) {
    if (!t || t === ".") return this.cwd;
    if (t === "..") return this.cwd.parent || this.root;
    if (t === "/") return this.root;
    if (t === "~") return this.resolvePathObject("/home/user");
    let e = t.startsWith("/") ? this.root : this.cwd;
    const i = t.split("/").filter((s) => s && s !== ".");
    for (const s of i)
      if (s === "..")
        e = e.parent || this.root;
      else if (e.type === "dir" && e.children.has(s))
        e = e.children.get(s);
      else
        return null;
    return e;
  }
  /**
   * Helper: Get absolute path string from object
   */
  _getAbsolutePath(t) {
    if (t === this.root) return "/";
    const e = [];
    let i = t;
    for (; i !== this.root; )
      e.unshift(i.name), i = i.parent;
    return "/" + e.join("/");
  }
}
const b = `
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
`;
class p extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" });
    const t = new CSSStyleSheet();
    t.replaceSync(b), this.shadowRoot.adoptedStyleSheets = [t], this.ansiParser = new m(), this.commandRegistry = new f(), this.historyManager = new y(), this.fileSystem = new g(), this.outputLines = [], this.currentInput = "", this.inputMasked = !1, this.isFullscreen = !1, this.isMinimized = !1, this._fullscreenEscHandler = null, this._copyMenuCloseHandler = null, this._copyFeedbackTimeout = null, this._announceTimeout = null, this._copyMenuOpen = !1, this._copyMenuFocusIndex = -1, this._autoScroll = !0, this._scrollThreshold = 50, this._typingInProgress = !1, this._typingCancelled = !1, this._typingQueue = [], this.config = {
      theme: "dark",
      prompt: "$ ",
      cursorStyle: "block",
      // block, underline, bar
      cursorBlink: !0,
      fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
      fontSize: "14px",
      lineHeight: "1.4",
      typingEffect: !1,
      typingSpeed: 30,
      // ms per character
      // Header options
      showHeader: !0,
      title: "Terminal",
      showControls: !0,
      showCopy: !0,
      showThemeToggle: !0,
      // Behavior options
      readonly: !1,
      maxLines: 1e3,
      // Features
      enableVfs: !1,
      persistHistory: !1,
      // Accessibility
      forceAnimations: !1
      // Override prefers-reduced-motion (for testing only)
    }, this._i18n = {
      // Button labels
      copy: "Copy",
      close: "Close",
      minimize: "Minimize",
      maximize: "Maximize",
      exitFullscreen: "Exit fullscreen",
      toggleFullscreen: "Toggle fullscreen",
      toggleTheme: "Toggle theme",
      switchToLight: "switch to light",
      switchToDark: "switch to dark",
      // Copy menu
      copyAll: "Copy All",
      copyCommandsOnly: "Copy Commands Only",
      copyOutputOnly: "Copy Output Only",
      copyOptions: "Copy options",
      copied: "Copied!",
      nothingToCopy: "Nothing to copy",
      noSelection: "No selection",
      // Announcements
      terminalReady: "Terminal ready",
      terminalCleared: "Terminal cleared",
      terminalClosed: "Terminal closed",
      terminalMinimized: "Terminal minimized",
      terminalRestored: "Terminal restored",
      enteredFullscreen: "Entered fullscreen mode",
      exitedFullscreen: "Exited fullscreen mode",
      themeChangedTo: "Theme changed to",
      copiedToClipboard: "copied to clipboard",
      content: "Content",
      // Built-in commands
      availableCommands: "Available commands:",
      noCommandsInHistory: "No commands in history.",
      commandNotFound: "Command not found:",
      typeHelpForCommands: "Type 'help' for available commands.",
      // Input
      terminalInputLabel: "Terminal input. Type a command and press Enter.",
      terminalOutput: "Terminal output"
    }, this._registerBuiltInCommands(), this.render();
  }
  connectedCallback() {
    this._applyAttributes(), this._setupEventListeners(), this.config.enableVfs && this._registerVfsCommands(), !this.config.readonly && this.hasAttribute("autofocus") && this._focusInput();
    const t = this.getAttribute("welcome");
    t && this.print(t), this._announce(this._t("terminalReady"));
  }
  disconnectedCallback() {
    this._fullscreenEscHandler && (document.removeEventListener("keydown", this._fullscreenEscHandler), this._fullscreenEscHandler = null), this._copyMenuCloseHandler && (document.removeEventListener("click", this._copyMenuCloseHandler), this._copyMenuCloseHandler = null), this._copyFeedbackTimeout && (clearTimeout(this._copyFeedbackTimeout), this._copyFeedbackTimeout = null), this._announceTimeout && (clearTimeout(this._announceTimeout), this._announceTimeout = null);
  }
  static get observedAttributes() {
    return [
      "theme",
      "prompt",
      "cursor-style",
      "cursor-blink",
      "font-family",
      "font-size",
      "line-height",
      "typing-effect",
      "typing-speed",
      "show-header",
      "title",
      "show-controls",
      "show-copy",
      "show-theme-toggle",
      "readonly",
      "max-lines",
      "enable-vfs",
      "persist-history",
      "force-animations"
    ];
  }
  attributeChangedCallback(t, e, i) {
    if (e !== i) {
      switch (t) {
        case "theme":
          this.config.theme = i || "dark";
          break;
        case "prompt":
          this.config.prompt = i || "$ ";
          break;
        case "cursor-style":
          this.config.cursorStyle = i || "block";
          break;
        case "cursor-blink":
          this.config.cursorBlink = i !== "false";
          break;
        case "font-family":
          this.config.fontFamily = i || this.config.fontFamily;
          break;
        case "font-size":
          this.config.fontSize = i || "14px";
          break;
        case "line-height":
          this.config.lineHeight = i || "1.4";
          break;
        case "typing-effect":
          this.config.typingEffect = i === "true";
          break;
        case "typing-speed":
          this.config.typingSpeed = parseInt(i) || 30;
          break;
        case "show-header":
          this.config.showHeader = i !== "false", this._updateHeaderVisibility();
          break;
        case "title":
          this.config.title = i || "Terminal", this._updateTitle();
          break;
        case "show-controls":
          this.config.showControls = i !== "false", this._updateControlsVisibility();
          break;
        case "show-copy":
          this.config.showCopy = i !== "false", this._updateCopyVisibility();
          break;
        case "show-theme-toggle":
          this.config.showThemeToggle = i !== "false", this._updateThemeToggleVisibility();
          break;
        case "readonly":
          this.config.readonly = i === "true" || i === "", this._updateReadonlyState();
          break;
        case "max-lines":
          this.config.maxLines = parseInt(i) || 1e3;
          break;
        case "enable-vfs":
          this.config.enableVfs = i === "true" || i === "", this.config.enableVfs && this._registerVfsCommands();
          break;
        case "persist-history":
          this.config.persistHistory = i === "true" || i === "", this.historyManager.setPersistence(this.config.persistHistory);
          break;
        case "force-animations":
          this.config.forceAnimations = i === "true" || i === "";
          break;
      }
      this._updateStyles();
    }
  }
  /**
   * Apply initial attributes
   */
  _applyAttributes() {
    p.observedAttributes.forEach((e) => {
      const i = this.getAttribute(e);
      i !== null && this.attributeChangedCallback(e, null, i);
    }), this._updateStyles();
  }
  /**
   * Update dynamic styles
   */
  _updateStyles() {
    const t = this.shadowRoot.querySelector(".terminal");
    t && (t.dataset.theme = this.config.theme, t.dataset.cursorStyle = this.config.cursorStyle, t.dataset.cursorBlink = this.config.cursorBlink, t.dataset.readonly = this.config.readonly, t.style.setProperty("--font-family", this.config.fontFamily), t.style.setProperty("--font-size", this.config.fontSize), t.style.setProperty("--line-height", this.config.lineHeight));
    const e = this.shadowRoot.querySelector(".input-prompt");
    e && (e.textContent = this.config.prompt);
  }
  /**
   * Update header visibility
   */
  _updateHeaderVisibility() {
    const t = this.shadowRoot.querySelector(".terminal-header");
    t && (t.style.display = this.config.showHeader ? "flex" : "none");
  }
  /**
   * Update title
   */
  _updateTitle() {
    const t = this.shadowRoot.querySelector(".terminal-title");
    t && (t.textContent = this.config.title);
  }
  /**
   * Update window controls visibility
   */
  _updateControlsVisibility() {
    const t = this.shadowRoot.querySelector(".window-controls");
    t && (t.style.display = this.config.showControls ? "flex" : "none");
  }
  /**
   * Update copy button visibility
   */
  _updateCopyVisibility() {
    const t = this.shadowRoot.querySelector(".copy-wrapper");
    t && (t.style.display = this.config.showCopy ? "" : "none");
  }
  /**
   * Update theme toggle visibility
   */
  _updateThemeToggleVisibility() {
    const t = this.shadowRoot.querySelector(".theme-btn");
    t && (t.style.display = this.config.showThemeToggle ? "" : "none");
  }
  /**
   * Update readonly state
   */
  _updateReadonlyState() {
    const t = this.shadowRoot.querySelector(".input-line");
    t && (t.style.display = this.config.readonly ? "none" : "flex");
  }
  /**
   * Register VFS commands
   */
  _registerVfsCommands() {
    this.registerCommand("ls", (t) => {
      const e = this.fileSystem.ls(t[0]);
      return typeof e == "string" ? e : e.map((s) => s.type === "dir" ? `\x1B[1;34m${s.name}/\x1B[0m` : s.name).join("  ");
    }), this.registerCommand("cd", (t) => {
      const e = this.fileSystem.cd(t[0]);
      return e || (this.setPrompt(`user@host:${this.fileSystem.getcwd()}$ `), null);
    }), this.registerCommand("pwd", () => this.fileSystem.getcwd()), this.registerCommand("mkdir", (t) => t[0] ? this.fileSystem.mkdir(t[0]) : "mkdir: missing operand"), this.registerCommand("touch", (t) => t[0] ? this.fileSystem.touch(t[0]) : "touch: missing operand"), this.registerCommand("rm", (t) => {
      if (!t[0]) return "rm: missing operand";
      const e = t.includes("-r") || t.includes("-rf"), i = t.find((s) => !s.startsWith("-"));
      return i ? this.fileSystem.rm(i, e) : "rm: missing operand";
    }), this.registerCommand("cat", (t) => t[0] ? this.fileSystem.readFile(t[0]) : "cat: missing operand");
  }
  /**
   * Register built-in commands
   */
  _registerBuiltInCommands() {
    this.registerCommand("help", () => {
      const t = this.commandRegistry.getNames();
      return `${this._t("availableCommands")}
${t.map((e) => `  ${e}`).join(`
`)}`;
    }), this.registerCommand("clear", () => (this.clear(), null)), this.registerCommand("echo", (t) => t.join(" ")), this.registerCommand("history", () => this.historyManager.isEmpty() ? this._t("noCommandsInHistory") : this.historyManager.getFormattedHistory()), this.registerCommand("date", () => (/* @__PURE__ */ new Date()).toString());
  }
  /**
   * Register a custom command handler.
   * The handler receives an array of arguments and the terminal instance,
   * and can return a string to print, null to suppress output, or a Promise for async commands.
   *
   * @method registerCommand
   * @param {string} name - Command name (case-insensitive)
   * @param {Function} handler - Function that receives (args: string[], terminal: TerminalWindow) and returns string|null|Promise
   * @example
   * // Simple command
   * terminal.registerCommand('hello', () => 'Hello, World!');
   *
   * // Command with arguments
   * terminal.registerCommand('greet', (args) => `Hello, ${args[0] || 'stranger'}!`);
   *
   * // Async command
   * terminal.registerCommand('fetch-data', async (args) => {
   *   const response = await fetch('/api/data');
   *   const data = await response.json();
   *   return JSON.stringify(data, null, 2);
   * });
   *
   * // Command using terminal instance
   * terminal.registerCommand('countdown', async (args, term) => {
   *   for (let i = 3; i > 0; i--) {
   *     await term.print(`${i}...`);
   *     await new Promise(r => setTimeout(r, 1000));
   *   }
   *   return 'Blast off!';
   * });
   */
  registerCommand(t, e) {
    this.commandRegistry.register(t, e);
  }
  /**
   * Remove a registered command.
   *
   * @method unregisterCommand
   * @param {string} name - Command name to remove
   * @example
   * terminal.unregisterCommand('greet');
   */
  unregisterCommand(t) {
    this.commandRegistry.unregister(t);
  }
  /**
   * Create an alias for a command.
   *
   * @method registerAlias
   * @param {string} alias - Alias name
   * @param {string} command - Full command string to execute when alias is used
   * @example
   * terminal.registerAlias('ll', 'ls -la');
   * terminal.registerAlias('cls', 'clear');
   */
  registerAlias(t, e) {
    this.commandRegistry.registerAlias(t, e);
  }
  /**
   * Execute a command string programmatically.
   *
   * @method executeCommand
   * @param {string} input - Full command string
   * @param {boolean} [addToHistory=true] - Whether to add to command history
   * @returns {Promise<void>}
   * @example
   * terminal.executeCommand('ls -la');
   * terminal.executeCommand('help', false); // Don't add to history
   */
  async executeCommand(t, e = !0) {
    const i = t.trim();
    if (!i) return;
    e && this.historyManager.add(i), this._printCommandLine(i);
    const s = this.commandRegistry.resolveAlias(i), r = this.commandRegistry.parse(s), n = r[0].toLowerCase(), a = r.slice(1), c = this.commandRegistry.get(n);
    if (c)
      try {
        const l = await c(a, this);
        l != null && await this.print(String(l)), this.dispatchEvent(new CustomEvent("command-result", {
          detail: { command: n, args: a, input: i, result: l },
          bubbles: !0,
          composed: !0
        }));
      } catch (l) {
        await this.print(`Error: ${l.message}`, "error"), this.dispatchEvent(new CustomEvent("command-error", {
          detail: { command: n, args: a, input: i, error: l },
          bubbles: !0,
          composed: !0
        }));
      }
    else {
      const l = `${this._t("commandNotFound")} ${n}. ${this._t("typeHelpForCommands")}`;
      await this.print(l, "error"), this.dispatchEvent(new CustomEvent("command-error", {
        detail: { command: n, args: a, input: i, error: new Error(l) },
        bubbles: !0,
        composed: !0
      }));
    }
    this.dispatchEvent(new CustomEvent("command", {
      detail: { command: n, args: a, input: i },
      bubbles: !0,
      composed: !0
    }));
  }
  /**
   * Execute multiple commands with delays between them.
   * Useful for demos, presentations, or scripted terminal sequences.
   *
   * @method executeSequence
   * @param {Array<string|{command: string, delay?: number}>} commands - Array of command strings or objects with command and optional delay
   * @param {number} [defaultDelay=1000] - Default delay between commands in milliseconds
   * @returns {Promise<void>}
   * @example
   * // Simple array of command strings
   * await terminal.executeSequence(['pwd', 'ls', 'whoami'], 1000);
   *
   * // With custom delays per command
   * await terminal.executeSequence([
   *   { command: 'cd /home', delay: 500 },
   *   { command: 'ls -la', delay: 1500 },
   *   'pwd' // Uses default delay
   * ], 1000);
   */
  async executeSequence(t, e = 1e3) {
    for (const i of t) {
      const s = typeof i == "string" ? i : i.command, r = typeof i == "string" ? e : i.delay ?? e;
      await this.executeCommand(s, !1), await this._delay(r);
    }
  }
  /**
   * Print command line to output
   */
  _printCommandLine(t) {
    const e = {
      type: "command",
      prompt: this.config.prompt,
      content: t
    };
    this.outputLines.push(e), this._appendLineToDom(e), this._trimOutputIfNeeded(), this._scrollToBottom();
  }
  /**
   * Print text to the terminal.
   * Supports multiple lines (splits on \n) and ANSI color codes.
   *
   * @method print
   * @param {string} text - Text to print (can contain newlines)
   * @param {string} [type=output] - Line type for styling: "output" (default), "error" (red), "info" (cyan), "success" (green)
   * @returns {Promise<void>}
   * @example
   * terminal.print('Operation complete!', 'success');
   * terminal.print('Something went wrong', 'error');
   * terminal.print('Processing...', 'info');
   *
   * // With ANSI colors
   * terminal.print('\x1b[31mRed text\x1b[0m');
   */
  async print(t, e = "output") {
    const i = t.split(`
`);
    for (const r of i) {
      const n = {
        type: e,
        content: r
      };
      this.outputLines.push(n), this.dispatchEvent(new CustomEvent("output", {
        detail: { type: e, content: r },
        bubbles: !0,
        composed: !0
      })), (!this.config.typingEffect || e === "command" || this._prefersReducedMotion()) && this._appendLineToDom(n);
    }
    this.config.typingEffect && e !== "command" && !this._prefersReducedMotion() && (this._typingInProgress ? await new Promise((r) => {
      this._typingQueue.push({ lines: i, type: e, resolve: r });
    }) : (await this._renderWithTypingEffect(i, e), await this._processTypingQueue())), this._trimOutputIfNeeded(), this._scrollToBottom(), e === "error" && this._announce(`Error: ${t}`);
  }
  /**
   * Check if user prefers reduced motion
   * Can be overridden with forceAnimations config for testing
   */
  _prefersReducedMotion() {
    return this.config.forceAnimations ? !1 : window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  /**
   * Process queued typing effect prints
   */
  async _processTypingQueue() {
    for (; this._typingQueue.length > 0; ) {
      const { lines: t, type: e, resolve: i } = this._typingQueue.shift();
      await this._renderWithTypingEffect(t, e), i();
    }
  }
  /**
   * Trim output lines if exceeding max
   */
  _trimOutputIfNeeded() {
    const t = this.shadowRoot.querySelector(".output");
    for (; this.outputLines.length > this.config.maxLines; )
      this.outputLines.shift(), t && t.firstElementChild && t.removeChild(t.firstElementChild);
  }
  /**
   * Render output with typing effect
   */
  async _renderWithTypingEffect(t, e) {
    this._typingInProgress = !0, this._typingCancelled = !1;
    const i = this.shadowRoot.querySelector(".output"), s = this.shadowRoot.querySelector(".input-line .cursor");
    s && (s.style.visibility = "hidden");
    const r = document.createElement("span");
    r.className = "typing-cursor";
    for (const n of t) {
      if (this._typingCancelled) {
        const l = t.indexOf(n);
        for (let o = l; o < t.length; o++)
          this._appendLineToDom({ type: e, content: t[o] });
        break;
      }
      const a = document.createElement("div");
      a.className = `output-line line-${e}`, a.setAttribute("role", "listitem"), i.appendChild(a);
      let c = "";
      for (let l = 0; l < n.length; l++) {
        if (this._typingCancelled) {
          a.innerHTML = this._parseAnsi(n);
          break;
        }
        c += n[l], a.innerHTML = this._parseAnsi(c), a.appendChild(r), this._scrollToBottom(), await this._delay(this.config.typingSpeed);
      }
      r.parentNode === a && a.removeChild(r);
    }
    s && (s.style.visibility = "visible"), this._typingInProgress = !1, this._typingCancelled = !1;
  }
  /**
   * Skip the current typing animation and show all remaining output immediately.
   * This is also triggered when the user presses Ctrl+C or clicks the terminal during a typing effect.
   *
   * @method skipTypingEffect
   * @example
   * terminal.skipTypingEffect();
   */
  skipTypingEffect() {
    this._typingInProgress && (this._typingCancelled = !0);
  }
  /**
   * Delay helper for typing effect
   * @private
   */
  _delay(t) {
    return new Promise((e) => setTimeout(e, t));
  }
  /**
   * Clear all terminal output.
   *
   * @method clear
   * @example
   * terminal.clear();
   */
  clear() {
    this.outputLines = [];
    const t = this.shadowRoot.querySelector(".output");
    t && (t.innerHTML = ""), this._announce(this._t("terminalCleared"));
  }
  /**
   * Parse ANSI escape codes and convert to HTML
   * @param {string} text - Text with ANSI codes
   * @returns {string} HTML string
   */
  _parseAnsi(t) {
    return this.ansiParser.parse(t, this._escapeHtml.bind(this));
  }
  /**
   * Append a single line to the DOM
   */
  _appendLineToDom(t) {
    const e = this.shadowRoot.querySelector(".output");
    if (!e) return;
    const i = document.createElement("div");
    t.type === "command" ? (i.className = "output-line line-command", i.setAttribute("role", "listitem"), i.innerHTML = `<span class="line-prompt">${this._escapeHtml(t.prompt)}</span>${this._escapeHtml(t.content)}`) : (i.className = `output-line line-${t.type}`, i.setAttribute("role", "listitem"), i.innerHTML = this._parseAnsi(t.content)), e.appendChild(i);
  }
  /**
   * Render the output area
   */
  _renderOutput() {
    const t = this.shadowRoot.querySelector(".output");
    t && (t.innerHTML = "", this.outputLines.forEach((e) => {
      this._appendLineToDom(e);
    }), this._scrollToBottom());
  }
  /**
   * Check if terminal is scrolled near the bottom
   */
  _isNearBottom() {
    const t = this.shadowRoot.querySelector(".terminal-body");
    return t ? t.scrollHeight - t.scrollTop - t.clientHeight <= this._scrollThreshold : !0;
  }
  /**
   * Handle scroll events for smart auto-scroll
   */
  _handleScroll() {
    this._autoScroll = this._isNearBottom();
  }
  /**
   * Scroll to bottom of terminal (respects auto-scroll setting)
   */
  _scrollToBottom() {
    if (!this._autoScroll) return;
    const t = this.shadowRoot.querySelector(".terminal-body");
    t && (t.scrollTop = t.scrollHeight);
  }
  /**
   * Force scroll to the bottom of the terminal.
   * The terminal uses smart auto-scroll: it automatically scrolls when new output appears,
   * but stops if the user scrolls up to read previous content. This method forces a scroll
   * and re-enables auto-scroll.
   *
   * @method scrollToBottom
   * @example
   * terminal.scrollToBottom();
   */
  scrollToBottom() {
    this._autoScroll = !0;
    const t = this.shadowRoot.querySelector(".terminal-body");
    t && (t.scrollTop = t.scrollHeight);
  }
  /**
   * Escape HTML for safe display
   */
  _escapeHtml(t) {
    const e = document.createElement("div");
    return e.textContent = t, e.innerHTML;
  }
  /**
   * Announce message to screen readers
   */
  _announce(t) {
    const e = this.shadowRoot.querySelector(".sr-announcer");
    e && (e.textContent = t, this._announceTimeout && clearTimeout(this._announceTimeout), this._announceTimeout = setTimeout(() => {
      e.textContent = "", this._announceTimeout = null;
    }, 1e3));
  }
  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    const t = this.shadowRoot.querySelector(".hidden-input"), e = this.shadowRoot.querySelector(".terminal"), i = this.shadowRoot.querySelector(".terminal-body");
    i && i.addEventListener("scroll", () => this._handleScroll()), e.addEventListener("click", () => {
      if (this._typingInProgress && this.skipTypingEffect(), !this.config.readonly) {
        const o = this.shadowRoot.getSelection ? this.shadowRoot.getSelection() : window.getSelection();
        o && o.toString().length > 0 || this._focusInput();
      }
    }), t.addEventListener("input", (o) => {
      this.currentInput = o.target.value, this._updateInputDisplay();
    }), t.addEventListener("keydown", (o) => {
      if (!this.config.readonly)
        switch (o.key) {
          case "Enter":
            o.preventDefault();
            const h = this.currentInput;
            this.currentInput = "", t.value = "", this._updateInputDisplay(), this.executeCommand(h);
            break;
          case "ArrowUp":
            o.preventDefault(), this._navigateHistory(-1);
            break;
          case "ArrowDown":
            o.preventDefault(), this._navigateHistory(1);
            break;
          case "Tab":
            o.preventDefault(), this._autocomplete();
            break;
          case "c":
            o.ctrlKey && (o.preventDefault(), this._typingInProgress ? this.skipTypingEffect() : (this._printCommandLine(this.currentInput + "^C"), this.currentInput = "", t.value = "", this._updateInputDisplay()), this.dispatchEvent(new CustomEvent("interrupt", { bubbles: !0, composed: !0 })));
            break;
          case "l":
            o.ctrlKey && (o.preventDefault(), this.clear());
            break;
        }
    });
    const s = this.shadowRoot.querySelector(".copy-btn"), r = this.shadowRoot.querySelector(".copy-menu");
    s && r && (s.addEventListener("click", (o) => {
      o.detail === 1 && this.copyContent("all");
    }), s.addEventListener("contextmenu", (o) => {
      o.preventDefault(), this._toggleCopyMenu();
    }), s.addEventListener("keydown", (o) => {
      o.key === "Enter" || o.key === " " || o.key === "ArrowDown" && (o.preventDefault(), this._openCopyMenu());
    }), r.querySelectorAll(".copy-menu-item").forEach((o) => {
      o.addEventListener("click", (h) => {
        h.stopPropagation();
        const d = o.dataset.copyMode;
        this.copyContent(d), this._closeCopyMenu();
      }), o.addEventListener("keydown", (h) => {
        if (h.key === "Enter" || h.key === " ") {
          h.preventDefault();
          const d = o.dataset.copyMode;
          this.copyContent(d), this._closeCopyMenu();
        } else
          this._handleCopyMenuKeydown(h);
      });
    }));
    const n = this.shadowRoot.querySelector(".theme-btn");
    n && n.addEventListener("click", () => this.toggleTheme());
    const a = this.shadowRoot.querySelector(".control.close"), c = this.shadowRoot.querySelector(".control.minimize"), l = this.shadowRoot.querySelector(".control.maximize");
    a && a.addEventListener("click", (o) => {
      o.stopPropagation(), this.close();
    }), c && c.addEventListener("click", (o) => {
      o.stopPropagation(), this.minimize();
    }), l && l.addEventListener("click", (o) => {
      o.stopPropagation(), this.toggleFullscreen();
    });
  }
  /**
   * Navigate command history
   */
  _navigateHistory(t) {
    const e = this.historyManager.navigate(t);
    if (e !== null) {
      this.currentInput = e;
      const i = this.shadowRoot.querySelector(".hidden-input");
      i.value = this.currentInput, this._updateInputDisplay();
    }
  }
  /**
   * Autocomplete command
   */
  _autocomplete() {
    const t = this.currentInput.split(" "), e = t[0].toLowerCase();
    if (t.length === 1 && e) {
      const i = this.commandRegistry.getNames().filter((s) => s.startsWith(e));
      if (i.length === 1) {
        this.currentInput = i[0];
        const s = this.shadowRoot.querySelector(".hidden-input");
        s.value = this.currentInput, this._updateInputDisplay();
      } else i.length > 1 && this.print(i.join("  "), "info");
    }
  }
  /**
   * Update the visible input display
   */
  _updateInputDisplay() {
    const t = this.shadowRoot.querySelector(".input-text");
    t && (this.inputMasked ? t.textContent = "*".repeat(this.currentInput.length) : t.textContent = this.currentInput);
  }
  /**
   * Focus the hidden input
   */
  _focusInput() {
    const t = this.shadowRoot.querySelector(".hidden-input");
    t && !this.config.readonly && t.focus();
  }
  /**
   * Enable or disable input masking for password prompts.
   * When masked, input is displayed as asterisks (***) instead of the actual characters.
   *
   * @method setInputMask
   * @param {boolean} masked - Whether to mask input
   * @example
   * terminal.setInputMask(true);  // Shows *** instead of text
   * terminal.setInputMask(false); // Shows normal text
   */
  setInputMask(t) {
    this.inputMasked = t, this._updateInputDisplay();
  }
  /**
   * Copy terminal content to clipboard.
   *
   * @method copyContent
   * @param {string} [mode=all] - Copy mode: "all" (everything with prompts), "commands" (only commands entered), "output" (only output, no commands), "selection" (current text selection)
   * @returns {Promise<void>}
   * @example
   * terminal.copyContent('commands'); // Copy only commands entered
   * terminal.copyContent('output');   // Copy only output
   * terminal.copyContent('all');      // Copy everything
   */
  async copyContent(t = "all") {
    let e;
    switch (t) {
      case "commands":
        e = this.outputLines.filter((s) => s.type === "command").map((s) => s.content).join(`
`);
        break;
      case "output":
        e = this.outputLines.filter((s) => s.type !== "command").map((s) => s.content).join(`
`);
        break;
      case "selection":
        const i = this.shadowRoot.getSelection ? this.shadowRoot.getSelection() : window.getSelection();
        if (e = i ? i.toString() : "", !e) {
          this._showCopyFeedback(this._t("noSelection"));
          return;
        }
        break;
      default:
        e = this.outputLines.map((s) => s.type === "command" ? `${s.prompt}${s.content}` : s.content).join(`
`);
    }
    if (!e) {
      this._showCopyFeedback(this._t("nothingToCopy"));
      return;
    }
    await this._copyToClipboard(e, t);
  }
  /**
   * Internal method to copy text to clipboard
   */
  async _copyToClipboard(t, e = "all") {
    const s = `${e === "all" ? this._t("content") : e.charAt(0).toUpperCase() + e.slice(1)} ${this._t("copiedToClipboard")}`;
    try {
      await navigator.clipboard.writeText(t), this._showCopyFeedback(this._t("copied")), this._announce(s);
    } catch {
      const n = document.createElement("textarea");
      n.value = t, n.style.position = "fixed", n.style.opacity = "0", document.body.appendChild(n), n.select(), document.execCommand("copy"), document.body.removeChild(n), this._showCopyFeedback(this._t("copied")), this._announce(s);
    }
    this.dispatchEvent(new CustomEvent("copy", {
      detail: { text: t, mode: e },
      bubbles: !0,
      composed: !0
    }));
  }
  /**
   * Toggle copy menu visibility
   */
  _toggleCopyMenu() {
    this._copyMenuOpen ? this._closeCopyMenu() : this._openCopyMenu();
  }
  /**
   * Open the copy menu with keyboard support
   */
  _openCopyMenu() {
    const t = this.shadowRoot.querySelector(".copy-menu"), e = this.shadowRoot.querySelector(".copy-btn");
    if (!t) return;
    t.style.display = "block", this._copyMenuOpen = !0, this._copyMenuFocusIndex = 0, e && e.setAttribute("aria-expanded", "true");
    const i = t.querySelectorAll(".copy-menu-item");
    i.length > 0 && i[0].focus(), this._copyMenuCloseHandler = (s) => {
      !s.composedPath().includes(t) && !s.composedPath().includes(e) && this._closeCopyMenu();
    }, setTimeout(() => document.addEventListener("click", this._copyMenuCloseHandler), 0);
  }
  /**
   * Close the copy menu and return focus
   */
  _closeCopyMenu() {
    const t = this.shadowRoot.querySelector(".copy-menu"), e = this.shadowRoot.querySelector(".copy-btn");
    t && (t.style.display = "none"), this._copyMenuOpen = !1, this._copyMenuFocusIndex = -1, e && (e.setAttribute("aria-expanded", "false"), e.focus()), this._copyMenuCloseHandler && (document.removeEventListener("click", this._copyMenuCloseHandler), this._copyMenuCloseHandler = null);
  }
  /**
   * Handle keyboard navigation in copy menu
   */
  _handleCopyMenuKeydown(t) {
    const e = this.shadowRoot.querySelector(".copy-menu");
    if (!e || !this._copyMenuOpen) return;
    const i = e.querySelectorAll(".copy-menu-item");
    if (i.length !== 0)
      switch (t.key) {
        case "ArrowDown":
          t.preventDefault(), this._copyMenuFocusIndex = (this._copyMenuFocusIndex + 1) % i.length, i[this._copyMenuFocusIndex].focus();
          break;
        case "ArrowUp":
          t.preventDefault(), this._copyMenuFocusIndex = (this._copyMenuFocusIndex - 1 + i.length) % i.length, i[this._copyMenuFocusIndex].focus();
          break;
        case "Escape":
          t.preventDefault(), this._closeCopyMenu();
          break;
        case "Tab":
          this._closeCopyMenu();
          break;
        case "Home":
          t.preventDefault(), this._copyMenuFocusIndex = 0, i[0].focus();
          break;
        case "End":
          t.preventDefault(), this._copyMenuFocusIndex = i.length - 1, i[i.length - 1].focus();
          break;
      }
  }
  /**
   * Show copy feedback
   */
  _showCopyFeedback(t) {
    const e = this.shadowRoot.querySelector(".copy-btn");
    if (!e) return;
    const i = e.textContent;
    e.textContent = t, e.classList.add("copy-success"), this._copyFeedbackTimeout && clearTimeout(this._copyFeedbackTimeout), this._copyFeedbackTimeout = setTimeout(() => {
      e.textContent = i, e.classList.remove("copy-success"), this._copyFeedbackTimeout = null, this._focusInput();
    }, 1500);
  }
  /**
   * Toggle between light and dark theme.
   * Announces the theme change to screen readers and fires no events (use attribute observation for reactivity).
   *
   * @method toggleTheme
   * @returns {void}
   * @example
   * terminal.toggleTheme(); // Switches from dark to light or vice versa
   */
  toggleTheme() {
    this.config.theme = this.config.theme === "dark" ? "light" : "dark", this.setAttribute("theme", this.config.theme), this._updateStyles(), this._announce(`${this._t("themeChangedTo")} ${this.config.theme}`);
  }
  /**
   * Close the terminal by hiding it.
   * Sets `display: none` on the element and dispatches a `close` event.
   * The terminal can be shown again by setting `display: block` or removing the style.
   *
   * @method close
   * @returns {void}
   * @fires close
   * @example
   * terminal.close();
   *
   * // Listen for close event
   * terminal.addEventListener('close', () => {
   *   console.log('Terminal was closed');
   * });
   */
  close() {
    this.style.display = "none", this._announce(this._t("terminalClosed")), this.dispatchEvent(new CustomEvent("close", {
      bubbles: !0,
      composed: !0
    }));
  }
  /**
   * Toggle the minimized state of the terminal.
   * When minimized, only the header is visible. Dispatches a `minimize` event with the new state.
   *
   * @method minimize
   * @returns {void}
   * @fires minimize
   * @example
   * terminal.minimize(); // Minimize the terminal
   * terminal.minimize(); // Restore the terminal
   *
   * // Listen for minimize event
   * terminal.addEventListener('minimize', (e) => {
   *   console.log('Minimized:', e.detail.minimized);
   * });
   */
  minimize() {
    this.isMinimized = !this.isMinimized;
    const t = this.shadowRoot.querySelector(".terminal-body");
    t && (t.style.display = this.isMinimized ? "none" : "block"), this._announce(this.isMinimized ? this._t("terminalMinimized") : this._t("terminalRestored")), this.dispatchEvent(new CustomEvent("minimize", {
      detail: { minimized: this.isMinimized },
      bubbles: !0,
      composed: !0
    })), this.isMinimized || this._focusInput();
  }
  /**
   * Toggle fullscreen mode (maximize).
   * When fullscreen, the terminal fills the entire viewport. Press Escape to exit.
   * Dispatches a `fullscreen` event with the new state.
   *
   * @method toggleFullscreen
   * @returns {void}
   * @fires fullscreen
   * @example
   * terminal.toggleFullscreen(); // Enter fullscreen
   * terminal.toggleFullscreen(); // Exit fullscreen
   *
   * // Listen for fullscreen event
   * terminal.addEventListener('fullscreen', (e) => {
   *   console.log('Fullscreen:', e.detail.fullscreen);
   * });
   */
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    const t = this.shadowRoot.querySelector(".terminal"), e = this.shadowRoot.querySelector(".control.maximize");
    t && t.classList.toggle("fullscreen", this.isFullscreen), e && (e.title = this.isFullscreen ? this._t("exitFullscreen") : this._t("maximize"), e.setAttribute("aria-label", this.isFullscreen ? this._t("exitFullscreen") : this._t("toggleFullscreen")), e.setAttribute("aria-pressed", this.isFullscreen ? "true" : "false")), this.isFullscreen ? (this._fullscreenEscHandler = (i) => {
      i.key === "Escape" && this.toggleFullscreen();
    }, document.addEventListener("keydown", this._fullscreenEscHandler)) : this._fullscreenEscHandler && (document.removeEventListener("keydown", this._fullscreenEscHandler), this._fullscreenEscHandler = null), this._announce(this.isFullscreen ? this._t("enteredFullscreen") : this._t("exitedFullscreen")), this.dispatchEvent(new CustomEvent("fullscreen", {
      detail: { fullscreen: this.isFullscreen },
      bubbles: !0,
      composed: !0
    })), this._focusInput();
  }
  /**
   * Set the color theme programmatically.
   *
   * @method setTheme
   * @param {('dark'|'light')} theme - The theme to apply
   * @returns {void}
   * @example
   * terminal.setTheme('light');
   * terminal.setTheme('dark');
   */
  setTheme(t) {
    this.config.theme = t, this.setAttribute("theme", t), this._updateStyles();
  }
  /**
   * Set the command prompt text programmatically.
   *
   * @method setPrompt
   * @param {string} prompt - The prompt text to display (e.g., "$ ", "> ", "user@host:~$ ")
   * @returns {void}
   * @example
   * terminal.setPrompt('> ');
   * terminal.setPrompt('user@localhost:~$ ');
   */
  setPrompt(t) {
    this.config.prompt = t, this.setAttribute("prompt", t), this._updateStyles();
  }
  /**
   * Set the cursor style programmatically.
   *
   * @method setCursorStyle
   * @param {('block'|'underline'|'bar')} style - The cursor style to apply
   * @returns {void}
   * @example
   * terminal.setCursorStyle('block');     // █ (default)
   * terminal.setCursorStyle('underline'); // _
   * terminal.setCursorStyle('bar');       // |
   */
  setCursorStyle(t) {
    this.config.cursorStyle = t, this.setAttribute("cursor-style", t), this._updateStyles();
  }
  /**
   * Enable or disable cursor blinking programmatically.
   *
   * @method setCursorBlink
   * @param {boolean} blink - Whether the cursor should blink
   * @returns {void}
   * @example
   * terminal.setCursorBlink(true);  // Enable blinking
   * terminal.setCursorBlink(false); // Disable blinking (solid cursor)
   */
  setCursorBlink(t) {
    this.config.cursorBlink = t, this.setAttribute("cursor-blink", String(t)), this._updateStyles();
  }
  /**
   * Enable or disable the typing effect for output.
   * When enabled, printed text appears character by character like a typewriter.
   * Respects `prefers-reduced-motion` unless `force-animations` is set.
   *
   * @method setTypingEffect
   * @param {boolean} enabled - Whether to enable the typing effect
   * @param {number} [speed=30] - Milliseconds per character (lower = faster)
   * @returns {void}
   * @example
   * terminal.setTypingEffect(true);        // Enable with default speed (30ms)
   * terminal.setTypingEffect(true, 10);    // Enable with fast typing (10ms)
   * terminal.setTypingEffect(true, 100);   // Enable with slow typing (100ms)
   * terminal.setTypingEffect(false);       // Disable typing effect
   */
  setTypingEffect(t, e = 30) {
    this.config.typingEffect = t, this.config.typingSpeed = e, this.setAttribute("typing-effect", String(t)), this.setAttribute("typing-speed", String(e));
  }
  /**
   * Enable or disable readonly mode.
   * When readonly, the input line is hidden and users cannot type commands.
   * Useful for presentation or demonstration purposes.
   *
   * @method setReadonly
   * @param {boolean} readonly - Whether to enable readonly mode
   * @returns {void}
   * @example
   * terminal.setReadonly(true);  // Disable input
   * terminal.setReadonly(false); // Enable input
   */
  setReadonly(t) {
    this.config.readonly = t, this.setAttribute("readonly", String(t)), this._updateReadonlyState();
  }
  /**
   * Override the user's `prefers-reduced-motion` system preference.
   * When forced, typing animations will run even if the user has reduced motion enabled.
   * Use sparingly and only for testing or when the animation is essential to the experience.
   *
   * @method setForceAnimations
   * @param {boolean} force - If true, animations will run regardless of system preference
   * @returns {void}
   * @example
   * terminal.setForceAnimations(true);  // Force animations on
   * terminal.setForceAnimations(false); // Respect system preference
   */
  setForceAnimations(t) {
    this.config.forceAnimations = t, this.setAttribute("force-animations", String(t));
  }
  /**
   * Check if the user has enabled `prefers-reduced-motion` in their system settings.
   * When true, the terminal will skip typing animations unless `force-animations` is set.
   *
   * @method hasReducedMotion
   * @returns {boolean} True if the user prefers reduced motion
   * @example
   * if (terminal.hasReducedMotion()) {
   *   console.log('User prefers reduced motion');
   * }
   */
  hasReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  /**
   * Set internationalization (i18n) strings for localization.
   * Merges the provided strings with the existing defaults.
   * Triggers a re-render to apply the new strings.
   *
   * @method setI18n
   * @param {Object} strings - Object containing string keys to override
   * @param {string} [strings.copy] - "Copy" button text
   * @param {string} [strings.close] - "Close" button tooltip
   * @param {string} [strings.minimize] - "Minimize" button tooltip
   * @param {string} [strings.maximize] - "Maximize" button tooltip
   * @param {string} [strings.toggleTheme] - "Toggle theme" button tooltip
   * @param {string} [strings.copyAll] - "Copy All" menu item
   * @param {string} [strings.copyCommandsOnly] - "Copy Commands Only" menu item
   * @param {string} [strings.copyOutputOnly] - "Copy Output Only" menu item
   * @param {string} [strings.copied] - "Copied!" feedback message
   * @param {string} [strings.commandNotFound] - "Command not found" error message
   * @returns {void}
   * @example
   * terminal.setI18n({
   *   copy: 'Copiar',
   *   copied: '¡Copiado!',
   *   commandNotFound: 'Comando no encontrado'
   * });
   */
  setI18n(t) {
    t && typeof t == "object" && (this._i18n = { ...this._i18n, ...t }, this.render(), this._setupEventListeners(), this._applyAttributes());
  }
  /**
   * Get a copy of the current i18n strings configuration.
   *
   * @method getI18n
   * @returns {Object} Current i18n configuration object
   * @example
   * const strings = terminal.getI18n();
   * console.log(strings.copy); // "Copy"
   */
  getI18n() {
    return { ...this._i18n };
  }
  /**
   * Get a localized string
   * @param {string} key - The i18n key
   * @returns {string} The localized string
   */
  _t(t) {
    return this._i18n[t] || t;
  }
  /**
   * Get the command history array.
   * Returns a copy of the history, not a reference to the internal array.
   *
   * @method getHistory
   * @returns {string[]} Array of previously executed commands (newest last)
   * @example
   * const history = terminal.getHistory();
   * console.log(history); // ['ls', 'cd /home', 'cat file.txt']
   */
  getHistory() {
    return this.historyManager.getHistory();
  }
  /**
   * Replace the command history with a new array.
   * Useful for restoring history from storage or initializing with predefined commands.
   *
   * @method setHistory
   * @param {string[]} history - Array of commands to set as history
   * @returns {void}
   * @example
   * terminal.setHistory(['ls', 'pwd', 'whoami']);
   */
  setHistory(t) {
    this.historyManager.setHistory(t);
  }
  /**
   * Clear all command history.
   * If `persist-history` is enabled, also clears the localStorage entry.
   *
   * @method clearHistory
   * @returns {void}
   * @example
   * terminal.clearHistory();
   */
  clearHistory() {
    this.historyManager.clear();
  }
  /**
   * Get all terminal output as plain text.
   * Includes both commands (with prompts) and output lines.
   *
   * @method getContent
   * @returns {string} All terminal content as newline-separated text
   * @example
   * const content = terminal.getContent();
   * console.log(content);
   * // $ ls
   * // file1.txt file2.txt
   * // $ pwd
   * // /home/user
   */
  getContent() {
    return this.outputLines.map((t) => t.type === "command" ? `${t.prompt}${t.content}` : t.content).join(`
`);
  }
  /**
   * Focus the terminal's input field.
   * Useful after programmatically interacting with the terminal.
   *
   * @method focus
   * @returns {void}
   * @example
   * terminal.focus();
   */
  focus() {
    this._focusInput();
  }
  /**
   * Render the component
   */
  render() {
    this.shadowRoot.innerHTML = `
      <div class="terminal"
           data-theme="${this.config.theme}"
           data-cursor-style="${this.config.cursorStyle}"
           data-cursor-blink="${this.config.cursorBlink}"
           data-readonly="${this.config.readonly}"
           role="application"
           aria-label="Terminal emulator">

        <!-- Screen reader announcements -->
        <div class="sr-announcer" role="status" aria-live="polite" aria-atomic="true"></div>

        <div class="terminal-header" style="${this.config.showHeader ? "" : "display: none"}">
          <div class="window-controls" style="${this.config.showControls ? "" : "display: none"}">
            <button class="control close" title="${this._t("close")}" aria-label="${this._t("close")} terminal"></button>
            <button class="control minimize" title="${this._t("minimize")}" aria-label="${this._t("minimize")} terminal"></button>
            <button class="control maximize" title="${this._t("maximize")}" aria-label="${this._t("toggleFullscreen")}" aria-pressed="false"></button>
          </div>
          <div class="terminal-title">
            <slot name="title">${this._escapeHtml(this.config.title)}</slot>
          </div>
          <div class="terminal-actions">
            <slot name="actions"></slot>
            <button class="theme-btn"
                    title="${this._t("toggleTheme")} (${this.config.theme === "dark" ? this._t("switchToLight") : this._t("switchToDark")})"
                    aria-label="${this._t("toggleTheme")}"
                    style="${this.config.showThemeToggle ? "" : "display: none"}">
              <span class="theme-icon"></span>
            </button>
            <div class="copy-wrapper" style="${this.config.showCopy ? "" : "display: none"}">
              <button class="copy-btn"
                      title="${this._t("copy")} (right-click for options)"
                      aria-label="${this._t("copy")} terminal content"
                      aria-haspopup="menu"
                      aria-expanded="false">${this._t("copy")}</button>
              <div class="copy-menu" role="menu" aria-label="${this._t("copyOptions")}">
                <button class="copy-menu-item" data-copy-mode="all" role="menuitem" tabindex="-1">${this._t("copyAll")}</button>
                <button class="copy-menu-item" data-copy-mode="commands" role="menuitem" tabindex="-1">${this._t("copyCommandsOnly")}</button>
                <button class="copy-menu-item" data-copy-mode="output" role="menuitem" tabindex="-1">${this._t("copyOutputOnly")}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="terminal-body" role="log" aria-live="polite" aria-relevant="additions">
          <slot name="before-output"></slot>
          <div class="output" role="list" aria-label="${this._t("terminalOutput")}"></div>
          <div class="input-line" style="${this.config.readonly ? "display: none" : ""}">
            <span class="input-prompt" aria-hidden="true">${this._escapeHtml(this.config.prompt)}</span>
            <span class="input-display">
              <span class="input-text"></span>
              <span class="cursor" aria-hidden="true"></span>
            </span>
            <input type="text"
                   class="hidden-input"
                   autocomplete="off"
                   autocorrect="off"
                   autocapitalize="off"
                   spellcheck="false"
                   aria-label="${this._t("terminalInputLabel")}"
                   role="textbox" />
          </div>
        </div>
      </div>
    `;
  }
}
customElements.get("terminal-window") || customElements.define("terminal-window", p);
export {
  p as default
};
//# sourceMappingURL=terminal-window.js.map
