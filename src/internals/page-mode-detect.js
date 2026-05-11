/**
 * Page-level dark mode observer (shared singleton).
 *
 * A single MutationObserver watches <html> and <body> for theme signals
 * (Tailwind `.dark` class, `data-theme`, `data-bs-theme`, vb `data-mode`,
 * computed `color-scheme`). When the resolved page mode changes, every
 * registered element gets `_onPageModeChange(isDark)` called with
 * `true | false | null` (null = no page-level signal detected).
 *
 * Lifted verbatim from ~/src/browser-window/src/browser-window.js
 * (lines ~62–155) so behavior is identical across the component family.
 */

const _registeredInstances = new Set();
let _pageObserver = null;
let _currentPageDark = null;

function _detectPageDarkMode() {
  const html = document.documentElement;
  const body = document.body;
  if (!html || !body) return null;

  // Class-based signals (Tailwind, docs sites)
  if (html.classList.contains('dark') || body.classList.contains('dark')) return true;

  // data-theme attribute
  if (html.getAttribute('data-theme') === 'dark' || body.getAttribute('data-theme') === 'dark')
    return true;
  if (html.getAttribute('data-theme') === 'light' || body.getAttribute('data-theme') === 'light')
    return false;

  // Bootstrap 5 data-bs-theme
  if (
    html.getAttribute('data-bs-theme') === 'dark' ||
    body.getAttribute('data-bs-theme') === 'dark'
  )
    return true;
  if (
    html.getAttribute('data-bs-theme') === 'light' ||
    body.getAttribute('data-bs-theme') === 'light'
  )
    return false;

  // Vanilla Breeze data-mode attribute
  if (html.getAttribute('data-mode') === 'dark') return true;
  if (html.getAttribute('data-mode') === 'light') return false;

  // Computed color-scheme
  const colorScheme = getComputedStyle(html).colorScheme;
  if (colorScheme === 'dark') return true;
  if (colorScheme === 'light') return false;

  return null;
}

function _notifyInstances() {
  const newState = _detectPageDarkMode();
  if (newState === _currentPageDark) return;
  _currentPageDark = newState;
  for (const instance of _registeredInstances) {
    instance._onPageModeChange(newState);
  }
}

function _startObserving() {
  if (_pageObserver) return;
  _pageObserver = new MutationObserver(_notifyInstances);
  const observeOptions = {
    attributes: true,
    attributeFilter: ['class', 'data-theme', 'data-bs-theme', 'data-mode', 'style'],
  };
  _pageObserver.observe(document.documentElement, observeOptions);
  if (document.body) {
    _pageObserver.observe(document.body, observeOptions);
  }
}

function _stopObserving() {
  if (_pageObserver) {
    _pageObserver.disconnect();
    _pageObserver = null;
  }
}

export function registerInstance(instance) {
  _registeredInstances.add(instance);
  if (_registeredInstances.size === 1) {
    _startObserving();
  }
  // Apply current state immediately
  const state = _detectPageDarkMode();
  _currentPageDark = state;
  instance._onPageModeChange(state);
}

export function unregisterInstance(instance) {
  _registeredInstances.delete(instance);
  if (_registeredInstances.size === 0) {
    _stopObserving();
    _currentPageDark = null;
  }
}
