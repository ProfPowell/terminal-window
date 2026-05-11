# terminal-window vanilla-breeze token integration

**Status:** Approved design, not yet implemented.
**Target version:** 2.1.0 (minor — additive).
**Sibling references:** `~/src/code-block` (uses `--cb-*`), `~/src/browser-window` (uses `--browser-window-*`). Pattern lifted from browser-window.

## Goal

Make `<terminal-window>` consume vanilla-breeze design tokens (`--color-surface`, `--color-text`, etc.) the same way `code-block` and `browser-window` do, and adopt the same three-tier theme detection (explicit attribute → page signal → OS preference). Existing API stays compatible.

## Architecture

### Three-layer CSS variable cascade

Every themable property resolves through three layers, in priority order:

```
property: var(--terminal-window-bg,        ← consumer override (highest)
            var(--_tw-bg));                ← internal, set per-theme

--_tw-bg: var(--color-surface, #1a1a2e);   ← internal pulls vb token,
                                              hardcoded as final fallback
```

- `--terminal-window-*`: public API surface. Consumers override here.
- `--_tw-*`: internal variable, set per-theme in `:host` blocks. Pulls the matching vb token with a hardcoded color as the ultimate fallback.
- The hardcoded fallback is reached only when the page has neither a `--terminal-window-*` override nor a `--color-*` vb token.

### Theme resolution

The resolved mode (`'dark' | 'light'`) is the first match in this priority order:

1. **Explicit `mode` attribute** on the element: `<terminal-window mode="dark">`
2. **Legacy `theme` attribute** (alias for `mode`): `<terminal-window theme="dark">`
3. **Page-level signal**, detected by a `MutationObserver` watching `<html>` and `<body>` for:
   - `class="dark"`
   - `data-theme="dark|light"`
   - `data-bs-theme="dark|light"` (Bootstrap 5)
   - `data-mode="dark|light"` (vanilla-breeze convention)
   - computed `color-scheme: dark|light`
4. **OS preference**: `@media (prefers-color-scheme: dark)`

Explicit attribute always wins. Page signal beats OS preference. The OS-preference branch only applies when neither `mode`, `theme`, nor a detected page signal is present.

### Attribute model

- New `mode` attribute is canonical (matches browser-window).
- Existing `theme` attribute kept as alias — both observed; `mode` wins if both set.
- `toggleTheme()` method preserved; now writes to `mode` and remains as alias of new `toggleMode()`.
- The internal `.terminal` element keeps its existing `data-theme` reflection — the JS sets it to the resolved mode (not the raw attribute), so the existing `.terminal[data-theme]` CSS rules continue to work without modification.

## Token mapping

### Structural / chrome (vb-token-aware)

| Internal `--_tw-*` | vb token consumed | dark fallback | light fallback |
|---|---|---|---|
| `--_tw-bg` | `--color-surface` | `#1a1a2e` | `#fafafa` |
| `--_tw-header-bg` | `--color-surface-raised` | `#0f0f23` | `#e8e8e8` |
| `--_tw-secondary-bg` | `--color-surface-raised` | `#16213e` | `#f0f0f0` |
| `--_tw-border-color` | `--color-border` | `#2a2a4a` | `#d0d0d0` |
| `--_tw-text-color` | `--color-text` | `#e0e0e0` | `#333` |
| `--_tw-text-muted` | `--color-text-muted` | `#888` | `#666` |

### Non-color tokens (theme-invariant)

| Public override | vb token consumed | Fallback |
|---|---|---|
| `--terminal-window-border-radius` | `--radius-m` | `8px` |
| `--terminal-window-inner-radius` | `--radius-s` | `6px` |
| `--terminal-window-font-family` | `--font-mono` | `'Consolas','Monaco','Courier New',monospace` |

### Terminal-specific (theme-aware hardcoded, no vb mapping; exposed as public override only)

- Prompt / cursor / command / output text colors
- Error / info / success output colors (treated like ANSI for consistency, not mapped to `--color-error` etc.)
- Selection background
- Scrollbar track / thumb / thumb-hover
- Button bg / hover bg / text
- The 16 ANSI colors (8 standard + 8 bright)

### Theme-invariant (macOS palette, no vb mapping)

- `--terminal-window-control-close: #ff5f56`
- `--terminal-window-control-minimize: #ffbd2e`
- `--terminal-window-control-maximize: #27c93f`

## CSS structure

New `:host`-level rules sit at the top of `src/styles.js` and own the cascade. The existing `.terminal[data-theme]` rules stay — they continue to provide the rich set of internal variables the rest of the stylesheet consumes. The new `:host` rules bridge in the vb tokens and expose the public override surface.

```css
:host {
  /* Public non-color overrides */
  --terminal-window-border-radius: var(--radius-m, 8px);
  --terminal-window-inner-radius:  var(--radius-s, 6px);
  --terminal-window-font-family:   var(--font-mono, 'Consolas','Monaco','Courier New',monospace);

  /* Default to light palette; overridden below */
  --_tw-bg:           var(--color-surface,         #fafafa);
  --_tw-header-bg:    var(--color-surface-raised,  #e8e8e8);
  --_tw-secondary-bg: var(--color-surface-raised,  #f0f0f0);
  --_tw-border-color: var(--color-border,          #d0d0d0);
  --_tw-text-color:   var(--color-text,            #333);
  --_tw-text-muted:   var(--color-text-muted,      #666);
  color-scheme: light;
}

:host([mode="dark"]),
:host([theme="dark"]),
:host([data-page-mode="dark"]:not([mode]):not([theme])) {
  --_tw-bg:           var(--color-surface,         #1a1a2e);
  --_tw-header-bg:    var(--color-surface-raised,  #0f0f23);
  --_tw-secondary-bg: var(--color-surface-raised,  #16213e);
  --_tw-border-color: var(--color-border,          #2a2a4a);
  --_tw-text-color:   var(--color-text,            #e0e0e0);
  --_tw-text-muted:   var(--color-text-muted,      #888);
  color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
  :host(:not([mode]):not([theme]):not([data-page-mode])) {
    /* same dark block — repeated, not @apply-style aliased */
  }
}
```

Inside the existing `.terminal[data-theme="dark|light"]` blocks, the six mapped internal variables (`--bg-primary`, `--bg-header`, `--bg-secondary`, `--border-color`, `--text-primary`, `--text-secondary`/`--text-muted`) are rewritten to consume the new bridge:

```css
.terminal[data-theme="dark"] {
  --bg-primary:    var(--terminal-window-bg,           var(--_tw-bg,           #1a1a2e));
  --bg-header:     var(--terminal-window-header-bg,    var(--_tw-header-bg,    #0f0f23));
  --bg-secondary:  var(--terminal-window-secondary-bg, var(--_tw-secondary-bg, #16213e));
  --border-color:  var(--terminal-window-border-color, var(--_tw-border-color, #2a2a4a));
  --text-primary:  var(--terminal-window-text-color,   var(--_tw-text-color,   #e0e0e0));
  --text-muted:    var(--terminal-window-text-muted,   var(--_tw-text-muted,   #888));
  /* unchanged internals: prompt, cursor, ansi, etc. — get --terminal-window-* override only */
  --prompt-color: var(--terminal-window-prompt-color, #50fa7b);
  /* …same pattern for all other slots… */
}
```

The same rewrite applies to `.terminal[data-theme="light"]` with the light fallbacks. Slots that don't map to vb tokens (prompt, cursor, output colors, ANSI, etc.) gain a `--terminal-window-*` override layer but no `--_tw-*` indirection.

## JS changes

### New file: `src/internals/page-mode-detect.js`

Lift the page-mode detection helper from `~/src/browser-window/src/browser-window.js` (approximately lines 60–140). Module-scoped singleton `MutationObserver` watches `<html>` and `<body>` for `class`, `data-theme`, `data-bs-theme`, `data-mode`, and `style` (computed `color-scheme`). Exports:

```js
export function registerInstance(el)    // call from connectedCallback
export function unregisterInstance(el)  // call from disconnectedCallback
```

Each registered element receives `el._onPageModeChange(isDark)` callbacks (where `isDark` is `true`, `false`, or `null` if no page signal). The observer starts when the first instance registers and stops when the last unregisters.

### `src/terminal-window.js`

**1. `observedAttributes`** (around line 284): add `'mode'`. `'theme'` already present.

**2. `attributeChangedCallback`** (around line 296): add a `'mode'` case that calls `this._updateStyles()`. Keep the `'theme'` case — it also calls `this._updateStyles()`. No explicit mirroring between the two attributes is needed because `_resolveMode()` already reads `mode` first, then `theme`, on every style update.

**3. New `_resolveMode()` method:**

```js
_resolveMode() {
  if (this.hasAttribute('mode'))  return this.getAttribute('mode');
  if (this.hasAttribute('theme')) return this.getAttribute('theme');
  if (this._pageMode === true)    return 'dark';
  if (this._pageMode === false)   return 'light';
  return (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    ? 'dark' : 'light';
}
```

**4. Lifecycle:**

```js
connectedCallback() {
  // …existing logic…
  registerInstance(this);
}
disconnectedCallback() {
  unregisterInstance(this);
}
_onPageModeChange(isDark) {
  this._pageMode = isDark; // true | false | null
  if (isDark === true)      this.setAttribute('data-page-mode', 'dark');
  else if (isDark === false) this.setAttribute('data-page-mode', 'light');
  else                       this.removeAttribute('data-page-mode');
  this._updateStyles();
}
```

**5. `_updateStyles()`** (around line 386): replace

```js
terminal.dataset.theme = this.config.theme;
```

with

```js
terminal.dataset.theme = this._resolveMode();
```

This keeps the existing `.terminal[data-theme]` stylesheet working untouched.

**6. Toggle behavior:** rename internal flow to `toggleMode()`. `toggleTheme()` becomes an alias that calls `toggleMode()`. The toggle writes to the `mode` attribute (not `theme`), giving explicit user-toggle precedence over page/OS detection.

```js
toggleMode() {
  const next = this._resolveMode() === 'dark' ? 'light' : 'dark';
  this.setAttribute('mode', next);
  this._announce(`${this._t('themeChangedTo')} ${next}`);
}
toggleTheme() { this.toggleMode(); }
```

User-facing strings (`"Toggle theme"`, `"Theme changed to"`) stay as "theme" — the rename is internal only.

## Public API surface

All 42 public CSS custom properties consumers may override:

**Structural / chrome (vb-token-aware):** `--terminal-window-bg`, `--terminal-window-header-bg`, `--terminal-window-secondary-bg`, `--terminal-window-border-color`, `--terminal-window-text-color`, `--terminal-window-text-muted`, `--terminal-window-border-radius`, `--terminal-window-inner-radius`, `--terminal-window-font-family`

(`font-size` and `line-height` remain configurable via element attributes `font-size` / `line-height` only. They are set as inline styles on the inner `.terminal` element by the existing JS path; promoting them to public CSS custom properties is out of scope for this work.)

**Terminal text colors:** `--terminal-window-prompt-color`, `--terminal-window-cursor-color`, `--terminal-window-command-color`, `--terminal-window-output-color`, `--terminal-window-error-color`, `--terminal-window-info-color`, `--terminal-window-success-color`, `--terminal-window-selection-bg`

**Scrollbar:** `--terminal-window-scrollbar-track`, `--terminal-window-scrollbar-thumb`, `--terminal-window-scrollbar-thumb-hover`

**Buttons:** `--terminal-window-btn-bg`, `--terminal-window-btn-hover-bg`, `--terminal-window-btn-text`

**Window controls (theme-invariant):** `--terminal-window-control-close`, `--terminal-window-control-minimize`, `--terminal-window-control-maximize`

**ANSI 16:** `--terminal-window-ansi-{black,red,green,yellow,blue,magenta,cyan,white}` plus `--terminal-window-ansi-bright-{black,red,green,yellow,blue,magenta,cyan,white}`

## Testing

Existing 64 tests in `test/terminal-window.spec.js` must continue to pass. New tests added to the same file:

1. **`mode` attribute parity with `theme`** — both produce identical visual result; both reflect into inner `.terminal[data-theme]`.
2. **`mode` wins over `theme`** — element with both set resolves to `mode`'s value.
3. **`toggleTheme()` writes to `mode`** — after one toggle, host has `mode="…"` (not `theme="…"`); legacy method works as alias.
4. **Page-level detection** — setting `document.documentElement.dataset.theme = 'dark'` reflects to `data-page-mode="dark"` on a terminal with no explicit attribute, and inner `.terminal[data-theme="dark"]` follows.
5. **Explicit `mode` overrides page signal** — `mode="light"` stays light even when page signal says dark.
6. **`prefers-color-scheme` fallback** — via Playwright's `emulateMedia({ colorScheme: 'dark' })`, no-attribute no-page-signal terminal renders dark; emulating light flips it.
7. **vb token consumption** — set `--color-surface: rgb(255,0,0)` on a parent; computed terminal background equals that value. Repeat for `--color-border`, `--color-text`, `--color-surface-raised`, `--color-text-muted`, `--radius-m`, `--font-mono`.
8. **Public override wins over vb token** — `--terminal-window-bg` beats `--color-surface` when both set.
9. **Public override wins over internal default** — when no vb token is set, `--terminal-window-bg` still takes effect.
10. **Page-mode change is reactive** — flipping `document.documentElement.dataset.theme` mid-test updates the terminal without a reload.
11. **Disconnect cleanup** — after element removal, page-mode flips don't error or notify a dead instance.

**Manual smoke test before merging:** open the dev server, drop a `<terminal-window>` onto a vanilla-breeze docs page, confirm it picks up the page's theme automatically.

## Migration & rollout

**Version:** 2.1.0 (minor, additive).

**Backwards-compat guarantees:**
- All existing `theme="dark"` / `theme="light"` usages render identically when no vb tokens are in scope.
- `toggleTheme()` method, `data-theme` reflection on the inner element, and the theme-toggle button keep working.
- No CSS class names change.
- All 64 existing tests pass unchanged.

**One behavior change to call out in CHANGELOG:**

Previously, a `<terminal-window>` with no explicit `theme` attribute defaulted to `'dark'` unconditionally. Now it resolves through `mode` attribute → `theme` attribute → page signal → OS `prefers-color-scheme` → `'light'` (final fallback, matching the family pattern). This means:

- On a vanilla-breeze docs page in light mode, a default terminal-window renders light.
- On a user system with `prefers-color-scheme: dark` and no page signal, a default terminal-window renders dark.
- On a user system with `prefers-color-scheme: light` and no page signal, a default terminal-window now renders **light** (previously dark).

Consumers who relied on "default = always dark" must write `mode="dark"` (or the legacy `theme="dark"`) explicitly. This is the intended outcome of the integration work.

**Documentation updates:**
- `README.md` — new "Vanilla Breeze integration" section explaining the three-layer cascade, listing structural overrides and vb tokens consumed.
- `CHANGELOG.md` — additive entry for the `mode` attribute, ~42 public custom properties, page detection, vb token integration. Migration callout for the default-mode change.
- `terminal-window.d.ts` — add `mode` to the attribute typings.
- `custom-elements.json` — regenerated via `npm run analyze`.
- `docs/api.html` and `docs/index.html` — add the new attribute and CSS custom property tables matching the existing docs structure.

**Rollout order (single PR):**
1. New file `src/internals/page-mode-detect.js`.
2. Patch `src/styles.js` — add `:host` rules and bridge the six mapped slots inside `.terminal[data-theme]`.
3. Patch `src/terminal-window.js` — add `mode` attribute, `_resolveMode()`, register with page observer, update toggle behavior.
4. Add new tests to `test/terminal-window.spec.js`.
5. Run `npm run analyze` to refresh `custom-elements.json`.
6. Update `README.md`, `CHANGELOG.md`, `terminal-window.d.ts`, `docs/`.

**Integration page (out of scope for this PR):** once 2.1.0 ships, the vanilla-breeze documentation site at `vb.test/docs/integrations/web-components/terminal-window/` will be authored by a vanilla-breeze agent, mirroring the existing `code-block` integration page. It will consume the new README section and CHANGELOG entry as source material.
