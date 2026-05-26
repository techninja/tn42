/**
 * User profile view — renders a user profile from markdown.
 * Route: /users/:slug
 * @module pages/user/user-view
 */

import { html, define, router } from 'hybrids';
import { parseFrontmatter } from '#utils/parseFrontmatter.js';
import { renderMarkdown } from '#utils/renderMarkdown.js';

/** @param {string} slug */
async function loadProfile(slug) {
  const res = await fetch(`/content/users/${slug}.md`);
  if (!res.ok) return null;
  const raw = await res.text();
  const { meta, content } = parseFrontmatter(raw);
  return { meta, html: renderMarkdown(content) };
}

export default define({
  tag: 'user-view',
  [router.connect]: { url: '/users/:slug' },
  slug: '',
  profile: {
    value: undefined,
    connect(host) {
      if (host.slug) loadProfile(host.slug).then((p) => { host.profile = p; });
    },
  },
  render: {
    value: ({ profile }) => html`
      <header class="site-header">
        <div>
          <h1><a href="/">tn42.com</a></h1>
          <p class="site-slogan">tech ninja 42 — Enhancing your webernet since 1998</p>
        </div>
        <nav class="site-nav">
          <a href="/">home</a>
          <a href="/users/techninja/">who is tn?</a>
        </nav>
      </header>

      <main class="post-view user-profile">
        ${profile
          ? html`
              <article>
                <h1>${profile.meta.title}</h1>
                <div class="post-body" innerHTML="${profile.html}"></div>
                <a href="/" class="btn btn-ghost">← Back to posts</a>
              </article>
            `
          : html`<p>Loading…</p>`}
      </main>

      <footer class="site-footer">
        <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
      </footer>
    `,
    shadow: false,
  },
});
