/**
 * Theme toggle atom — switches between light and dark mode.
 * @module components/atoms/theme-toggle
 */

import { html, define, store } from 'hybrids';
import AppState from '#store/AppState.js';
import '#atoms/app-icon/app-icon.js';

/** @param {HTMLElement & { state: any }} host */
function toggle(host) {
  if (!store.ready(host.state)) return;
  const next = host.state.theme === 'light' ? 'dark' : 'light';
  store.set(host.state, { theme: next });
  document.documentElement.setAttribute('data-theme', next);
}

export default define({
  tag: 'theme-toggle',
  state: store(AppState),
  render: {
    value: ({ state }) => {
      if (store.ready(state)) {
        document.documentElement.setAttribute('data-theme', state.theme);
      }
      return html`
        <button class="btn btn-ghost theme-toggle-btn" onclick="${toggle}" aria-label="Toggle theme">
          <app-icon name="${store.ready(state) && state.theme === 'light' ? 'moon' : 'sun'}"></app-icon>
        </button>
      `;
    },
    shadow: false,
  },
});
