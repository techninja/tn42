/**
 * Native navigation — links with [data-native] bypass hybrids router
 * and use standard browser navigation for proper history behavior.
 * @module utils/nativeNav
 */

document.addEventListener('click', (e) => {
  const anchor = e.composedPath().find((el) => el instanceof HTMLAnchorElement);
  if (anchor?.hasAttribute('data-native')) {
    // Let the browser handle it naturally — don't let hybrids intercept
    e.stopPropagation();
  }
}, true); // Capturing phase — runs before hybrids' handler
