/**
 * Gallery post view — renders a single gallery post by slug.
 * Route: /g/:slug
 * @module pages/blog/gallery-post-view
 */

import { html, define, router } from 'hybrids';
import { parseFrontmatter } from '#utils/parseFrontmatter.js';
import { renderMarkdown } from '#utils/renderMarkdown.js';
import { formatDate } from '#utils/formatDate.js';
import { applyNameCorrection } from '#utils/nameCorrection.js';
import '#atoms/theme-toggle/theme-toggle.js';

/** @param {string} slug */
async function loadPost(slug) {
  const res = await fetch(`/content/g/${slug}.md`);
  if (!res.ok) return null;
  const raw = await res.text();
  const { meta, content } = parseFrontmatter(raw);
  const rendered = applyNameCorrection(renderMarkdown(content), meta);
  return { meta, html: rendered };
}

export default define({
  tag: 'gallery-post-view',
  [router.connect]: { url: '/g/:slug' },
  slug: '',
  post: {
    value: undefined,
    connect(host) {
      if (host.slug) loadPost(host.slug).then((p) => { host.post = p || false; });
    },
  },
  render: {
    value: ({ post }) => html`
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

      <main class="post-view gallery-view">
        ${post === undefined
          ? html`<p>Loading…</p>`
          : post === false
            ? html`
                <div class="not-found__content">
                  <h1>404</h1>
                  <p>This gallery post doesn't exist.</p>
                  <a href="${router.backUrl() || '/'}" class="btn btn-primary">← Back to home</a>
                </div>
              `
            : html`
              <article>
                <header class="post-header">
                  <h1>${post.meta.title}</h1>
                  <div class="post-meta">
                    <span class="post-author">${post.meta.author}</span>
                    <time>${formatDate(post.meta.date)}</time>
                  </div>
                </header>
                <div class="post-body" innerHTML="${post.html}"></div>
                <a href="${router.backUrl() || '/'}" class="btn btn-ghost">← Back to posts</a>
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
