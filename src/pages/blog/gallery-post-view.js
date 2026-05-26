/**
 * Gallery post view — renders a single gallery post by slug.
 * Route: /g/:slug
 * @module pages/blog/gallery-post-view
 */

import { html, define, router } from 'hybrids';
import { parseFrontmatter } from '#utils/parseFrontmatter.js';
import { renderMarkdown } from '#utils/renderMarkdown.js';
import { formatDate } from '#utils/formatDate.js';

/** @param {string} slug */
async function loadPost(slug) {
  const res = await fetch(`/content/g/${slug}.md`);
  if (!res.ok) return null;
  const raw = await res.text();
  const { meta, content } = parseFrontmatter(raw);
  return { meta, html: renderMarkdown(content) };
}

export default define({
  tag: 'gallery-post-view',
  [router.connect]: { url: '/g/:slug' },
  slug: '',
  post: {
    value: undefined,
    connect(host) {
      if (host.slug) loadPost(host.slug).then((p) => { host.post = p; });
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
          <a href="/users/techninja/">who is tn?</a>
        </nav>
      </header>

      <main class="post-view gallery-view">
        ${post
          ? html`
              <article>
                <header class="post-header">
                  <h1>${post.meta.title}</h1>
                  <div class="post-meta">
                    <span class="post-author">${post.meta.author}</span>
                    <time>${formatDate(post.meta.date)}</time>
                  </div>
                </header>
                <div class="post-body" innerHTML="${post.html}"></div>
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
