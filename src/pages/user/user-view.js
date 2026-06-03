/**
 * User profile view — renders a user profile from markdown.
 * Route: /users/:slug
 * @module pages/user/user-view
 */

import { html, define, router } from 'hybrids';
import { parseFrontmatter } from '#utils/parseFrontmatter.js';
import { renderMarkdown } from '#utils/renderMarkdown.js';
import '#organisms/site-header/site-header.js';
import '#molecules/breadcrumb/breadcrumb.js';

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
      if (host.slug) loadProfile(host.slug).then((p) => { host.profile = p || false; });
    },
  },
  render: {
    value: ({ profile }) => html`
      <site-header active="about"></site-header>

      <main class="post-view user-profile">
        <app-breadcrumb items='${JSON.stringify([{"label":"Home","href":"/"},{"label":profile?.meta?.title||"Profile"}])}'></app-breadcrumb>
        ${profile === undefined
          ? html`<p>Loading…</p>`
          : profile === false
            ? html`
                <div class="not-found__content">
                  <h1>404</h1>
                  <p>User not found.</p>
                  <a href="${router.backUrl() || '/'}" class="btn btn-primary">← Back to home</a>
                </div>
              `
            : html`
              <article>
                <h1>${profile.meta.title}</h1>
                <div class="post-body" innerHTML="${profile.html}"></div>
                <a href="${router.backUrl() || '/'}" class="btn btn-ghost">← Back</a>
              </article>
            `}
      </main>

      <footer class="site-footer">
        <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
      </footer>
    `,
    shadow: false,
  },
});
