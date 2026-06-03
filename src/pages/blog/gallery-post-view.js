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
import '#organisms/site-header/site-header.js';
import '#molecules/breadcrumb/breadcrumb.js';
import { setPageTitle } from '#utils/pageTitle.js';
import { CDN } from '#config/cdn.js';

/** @param {string} slug */
async function loadPost(slug) {
  const res = await fetch(`/content/g/${slug}.md`);
  if (!res.ok) return null;
  const raw = await res.text();
  const { meta, content } = parseFrontmatter(raw);
  const rendered = applyNameCorrection(renderMarkdown(content), meta);
  const html = CDN ? rendered.replace(/src="\/images\//g, `src="${CDN}/images/`) : rendered;
  return { meta, html };
}

export default define({
  tag: 'gallery-post-view',
  [router.connect]: { url: '/g/:slug' },
  slug: '',
  post: {
    value: undefined,
    connect(host) {
      if (host.slug)
        loadPost(host.slug).then((p) => {
          host.post = p || false;
          if (p) setPageTitle(/** @type {string} */ (p.meta.title));
        });
    },
  },
  render: {
    value: ({ post }) => html`
      <site-header active="blog"></site-header>

      <main class="post-view gallery-view">
        <app-breadcrumb
          items="${JSON.stringify([
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/b' },
            { label: post?.meta?.title || 'Gallery' },
          ])}"
        ></app-breadcrumb>
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
        <p>
          © 1998–${new Date().getFullYear()} TechNinja. Built with
          <a href="https://github.com/techninja/clearstack">Clearstack</a>.
        </p>
      </footer>
    `,
    shadow: false,
  },
});
