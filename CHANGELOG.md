# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
