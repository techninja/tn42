/**
 * Site footer — shared across all views.
 * @module components/organisms/site-footer
 */

import { html, define } from 'hybrids';

export default define({
  tag: 'site-footer',
  render: {
    value: () => html`
      <footer class="site-footer">
        <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://clearstacks.org">Clearstack</a>.</p>
      </footer>
    `,
    shadow: false,
  },
});
