/**
 * 404 page — shown when no route matches.
 * @module pages/not-found/not-found-view
 */

import { html, define, router } from 'hybrids';
import '#atoms/theme-toggle/theme-toggle.js';

export default define({
  tag: 'not-found-view',
  [router.connect]: { url: '/404' },
  render: {
    value: () => html`
      <header class="site-header">
        <div>
          <h1><a href="/">tn42.com</a></h1>
          <p class="site-slogan">tech ninja 42 — Enhancing your webernet since 1998</p>
        </div>
        <nav class="site-nav">
          <a href="/">home</a>
          <a href="/users/techninja">who is tn?</a>
          <theme-toggle></theme-toggle>
        </nav>
      </header>

      <main class="post-view not-found">
        <div class="not-found__content">
          <h1>404</h1>
          <p>This page has vanished into the webernet.</p>
          <a href="${router.backUrl() || '/'}" class="btn btn-primary">← Back to home</a>
        </div>
      </main>

      <footer class="site-footer">
        <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
      </footer>
    `,
    shadow: false,
  },
});
