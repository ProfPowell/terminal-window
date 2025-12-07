# Framework Integration Guides

`terminal-window` is a vanilla web component that works with any JavaScript framework. This directory contains integration guides and examples for popular frameworks.

## Guides

| Framework | Guide | Live Demo |
|-----------|-------|-----------|
| React | [react.md](./react.md) | [StackBlitz](https://stackblitz.com/edit/vitejs-vite-react-terminal-window) |
| Vue | [vue.md](./vue.md) | [StackBlitz](https://stackblitz.com/edit/vitejs-vite-vue-terminal-window) |
| Svelte | [svelte.md](./svelte.md) | [StackBlitz](https://stackblitz.com/edit/vitejs-vite-svelte-terminal-window) |
| Astro | [astro.md](./astro.md) | [StackBlitz](https://stackblitz.com/edit/astro-terminal-window) |
| Eleventy (11ty) | [eleventy.md](./eleventy.md) | [CodeSandbox](https://codesandbox.io/s/11ty-terminal-window) |

## Quick Overview

### Why Web Components Work Everywhere

Web components are native browser APIs, so they work in any framework:

- **React**: Use refs and `useEffect` for event handling
- **Vue**: Native support, just add to `compilerOptions.isCustomElement`
- **Svelte**: Works out of the box
- **Astro**: Perfect for static sites with optional hydration
- **11ty**: Use with passthrough copy for static builds

### Basic Pattern

All frameworks follow a similar pattern:

1. **Install**: `npm install terminal-window`
2. **Import**: `import 'terminal-window'`
3. **Use**: `<terminal-window>` in your template
4. **Configure**: Use attributes for settings
5. **Interact**: Use refs/selectors for method calls

### Common Gotchas

1. **TypeScript**: Add type declarations for the custom element
2. **SSR**: The component requires the browser - use client-side loading
3. **Events**: Custom events use `event.detail` for data
4. **Attributes vs Properties**: Use attributes in HTML, properties in JS
