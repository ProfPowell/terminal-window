# Suggestions for `terminal-window` Improvement

This document outlines suggested improvements for the `terminal-window` web component, prioritized by impact on performance, maintainability, and feature completeness.

## Todo List

### 🚀 Critical Performance & Architecture

- [x] **Optimize Output Rendering (Critical)**
  - **Current State:** `_renderOutput()` completely rewrites `outputContainer.innerHTML` on every update. This is O(N) and causes performance degradation as output grows.
  - **Suggestion:** Refactor to append new lines to the DOM (`appendChild` or `insertAdjacentHTML`). Only clear/redraw when `clear()` is called or max lines are exceeded.
  
- [x] **Refactor Monolithic Class**
  - **Current State:** `TerminalWindow` handles everything: rendering, input, command parsing, history, and configuration (~2000 lines).
  - **Suggestion:** Extract logic into internal helper classes or modules:
    - `CommandRegistry`: Handle registration, aliasing, and lookup.
    - `HistoryManager`: Handle storage and navigation of command history.
    - `AnsiParser`: Isolate the ANSI escape code parsing logic.
    - `InputHandler`: Manage the hidden input and key events.

- [x] **Efficient ANSI Parsing**
  - **Current State:** `_parseAnsi` is regex-heavy and runs on every render.
  - **Suggestion:** If sticking to the current render method (not recommended), memoize parsed results. With the append-only fix, this becomes less critical but still good practice. Consider using a small, specialized library or a more robust state-machine parser if ANSI support expands.

### 🛠 Code Quality & Maintainability

- [x] **Add Unit Tests**
  - **Current State:** No automated tests found.
  - **Suggestion:** implement a testing framework (e.g., Web Test Runner, Jest, or Vitest).
    - Test `_parseAnsi` for correct HTML generation from ANSI codes.
    - Test command parsing (handling quotes, arguments).
    - Test history navigation logic.
  
- [ ] **TypeScript / Type Definitions**
  - **Current State:** Plain JavaScript.
  - **Suggestion:** Port to TypeScript or generate a `index.d.ts` file to provide type safety and IntelliSense for consumers.

- [x] **Styles Management**
  - **Current State:** Styles are injected via a massive template string in `getStyles()`.
  - **Suggestion:**
    - **Option A (Modern):** Use [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) (`adoptedStyleSheets`) for better performance and memory usage.
    - **Option B (Dev Experience):** Move CSS to a separate `.css` file and inline it during a build step if a build process is added.

### ✨ Features & Enhancements

- [ ] **Virtual File System (VFS)**
  - **Suggestion:** Implement a basic in-memory file system. Currently, commands like `ls` or `cd` would have to be "faked" by static returns. A VFS would allow stateful navigation.

- [ ] **Persistent History**
  - **Suggestion:** Add an option to save command history to `localStorage` so it survives page reloads.

- [ ] **Improved Mobile Experience**
  - **Suggestion:** The hidden input trick works, but consider better handling for mobile virtual keyboards, perhaps ensuring the input view stays in view or using a `contenteditable` approach (though that has its own complexity).

- [ ] **Accessibility (A11y) Verification**
  - **Suggestion:** Ensure the `aria-live` region announces correctly when using the "append-only" rendering approach. Validate color contrast ratios for the default themes.

### 📦 Tooling & Build

- [x] **Add a Build Step (Optional but Recommended)**
  - **Suggestion:** While "no-build" is nice, adding a lightweight build (Vite/Rollup) allows:
    - Minification.
    - Separate CSS/JS files during dev.
    - TypeScript support.
    - Automated testing.
