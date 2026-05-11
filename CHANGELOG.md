# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-05-11

### Added

- **Vanilla Breeze integration.** `<terminal-window>` now consumes vb design tokens (`--color-surface`, `--color-surface-raised`, `--color-border`, `--color-text`, `--color-text-muted`, `--radius-m`, `--radius-s`, `--font-mono`) with the existing hardcoded palette as fallback.
- **`mode` attribute** as the canonical way to set color mode (`mode="dark"` / `mode="light"`). The existing `theme` attribute continues to work as a backwards-compatible alias.
- **Page-level theme detection.** A built-in `MutationObserver` watches `<html>` and `<body>` for `class="dark"`, `data-theme`, `data-bs-theme`, `data-mode`, and computed `color-scheme`. Terminals without an explicit `mode`/`theme` attribute follow the page signal automatically.
- **`prefers-color-scheme` fallback.** When no attribute or page signal is set, the OS preference is used.
- **`toggleMode()`** method. `toggleTheme()` is preserved as a deprecated alias.
- **43 public CSS custom properties** prefixed `--terminal-window-*` for fine-grained styling. See README "Vanilla Breeze integration" section.

### Changed

- **Default color mode behavior.** Previously, a `<terminal-window>` with no explicit `theme` attribute defaulted to `dark` unconditionally. It now resolves through page signal → `prefers-color-scheme` → `light`. To preserve the old behavior, set `mode="dark"` (or `theme="dark"`) explicitly.
- **Theme-toggle button** now writes to the `mode` attribute (was `theme`). Both attributes continue to work.

### Compatibility

- The `theme` attribute, `toggleTheme()` method, and `data-theme` reflection on the inner element are all preserved.

## [2.0.0] - 2024-12-07

### Added

- **Virtual File System (VFS)** - Built-in VFS with `ls`, `cd`, `pwd`, `mkdir`, `touch`, `rm`, `cat` commands
- **Persistent History** - Save command history to localStorage with `persist-history` attribute
- **ANSI Color Support** - Full support for ANSI escape codes (256 colors, RGB, bold, underline, dim)
- **Typing Effect** - Typewriter-style output animation with configurable speed
- **Copy Menu** - Copy all content, commands only, or output only
- **Theme Toggle** - Built-in light/dark theme toggle button
- **Window Controls** - Close, minimize, and fullscreen controls with keyboard support
- **Internationalization** - `setI18n()` method for custom translations
- **Accessibility** - ARIA labels, keyboard navigation, screen reader announcements
- **TypeScript Definitions** - Full `.d.ts` type declarations included
- **Custom Elements Manifest** - `custom-elements.json` for IDE autocomplete

### Changed

- **Constructable Stylesheets** - Migrated to modern CSS adoption for better performance
- **ES Modules** - Full ES module support with UMD fallback
- **Improved Event System** - Better event bubbling with `composed: true`

### Fixed

- Terminal scroll behavior now properly auto-scrolls on new output
- Focus management improved for better keyboard navigation
- Cursor positioning in various edge cases

## [1.0.0] - 2024-01-01

### Added

- Initial release
- Basic terminal simulation
- Custom command registration
- Dark and light themes
- Cursor styles (block, underline, bar)
- Command history navigation
- Built-in `help`, `clear`, `echo`, `history` commands

---

[2.0.0]: https://github.com/ProfPowell/terminal-window/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/ProfPowell/terminal-window/releases/tag/v1.0.0
