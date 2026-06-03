/**
 * 404 page — shown when no route matches.
 * @module pages/not-found/not-found-view
 */

import { html, define, router } from 'hybrids';
import '#organisms/site-header/site-header.js';
import '#organisms/site-footer/site-footer.js';

export default define({
  tag: 'not-found-view',
  [router.connect]: { url: '/404' },
  render: {
    value: () => html`
      <site-header></site-header>

      <main class="post-view not-found">
        <div class="not-found__content">
          <h1>404</h1>
          <p>This page has vanished into the webernet.</p>
          <a href="${router.backUrl() || '/'}" class="btn btn-primary">← Back to home</a>
        </div>
      </main>

      <site-footer></site-footer>
    `,
    shadow: false,
  },
});
