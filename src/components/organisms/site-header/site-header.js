/**
 * Site header — shared navigation across all views.
 * @module components/organisms/site-header
 */

import { html, define } from 'hybrids';
import '#atoms/theme-toggle/theme-toggle.js';

export default define({
  tag: 'site-header',
  active: '',
  render: {
    value: ({ active }) => html`
      <header class="site-header">
        <div>
          <h1><a href="/">tn42.com</a></h1>
          <p class="site-slogan">tech ninja 42 — Enhancing your webernet since 1998</p>
        </div>
        <nav class="site-nav">
          <a href="/" class="${active === 'home' ? 'active' : ''}">home</a>
          <a href="/b" class="${active === 'blog' ? 'active' : ''}">blog</a>
          <a href="/media" class="${active === 'media' ? 'active' : ''}">media</a>
          <a href="/portfolio" class="${active === 'portfolio' ? 'active' : ''}">portfolio</a>
          <a href="/users/techninja" class="${active === 'about' ? 'active' : ''}">who is tn?</a>
          <theme-toggle></theme-toggle>
        </nav>
      </header>
    `,
    shadow: false,
  },
});
