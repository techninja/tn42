/**
 * Blog post view — renders a single markdown post by slug.
 * Route: /b/:slug
 * @module pages/blog/blog-post-view
 */

import { html, define, router } from 'hybrids';
import { parseFrontmatter } from '#utils/parseFrontmatter.js';
import { renderMarkdown } from '#utils/renderMarkdown.js';
import { formatDate } from '#utils/formatDate.js';
import authors from '#config/authors.js';
import { applyNameCorrection, correctTitle, correctTag } from '#utils/nameCorrection.js';
import '#organisms/site-header/site-header.js';
import '#molecules/breadcrumb/breadcrumb.js';

/** @param {string} slug */
async function loadPost(slug) {
  const res = await fetch(`/content/b/${slug}.md`);
  if (!res.ok) return null;
  const raw = await res.text();
  const { meta, content } = parseFrontmatter(raw);
  const rendered = applyNameCorrection(renderMarkdown(content), meta);
  return { meta, html: rendered };
}

export default define({
  tag: 'blog-post-view',
  [router.connect]: { url: '/b/:slug' },
  slug: '',
  post: {
    value: undefined,
    connect(host) {
      if (host.slug) loadPost(host.slug).then((p) => { host.post = p || false; });
    },
  },
  render: {
    value: ({ post }) => html`
      <site-header active="blog"></site-header>

      <main class="post-view">
        <app-breadcrumb items='${JSON.stringify([{"label":"Home","href":"/"},{"label":"Blog","href":"/b"},{"label":post?.meta?.title||"Post"}])}'></app-breadcrumb>
        ${post === undefined
          ? html`<p>Loading…</p>`
          : post === false
            ? html`
                <div class="not-found__content">
                  <h1>404</h1>
                  <p>This post doesn't exist.</p>
                  <a href="${router.backUrl() || '/'}" class="btn btn-primary">← Back to home</a>
                </div>
              `
            : html`
              <article>
                <header class="post-header">
                  <img class="post-hero" src="${post.meta.image || '/images/default.svg'}" alt="${post.meta.title}" />
                  <h1 innerHTML="${correctTitle(post.meta.title, post.meta)}"></h1>
                  <div class="post-meta">
                    ${authors[post.meta.author]
                      ? html`
                          <a href="${authors[post.meta.author].url}" class="post-author">
                            <img class="post-author__avatar" src="${authors[post.meta.author].avatar}" alt="${authors[post.meta.author].name}" />
                            ${authors[post.meta.author].displayHtml
                              ? html`<span innerHTML="${authors[post.meta.author].displayHtml}"></span>`
                              : html`<span>${authors[post.meta.author].name}</span>`}
                          </a>
                        `
                      : html`<span class="post-author">${post.meta.author}</span>`}
                    <time>${formatDate(post.meta.date)}</time>
                  </div>
                  ${post.meta.tags
                    ? html`
                        <div class="post-tags">
                          ${post.meta.tags.map((t) => html`<a href="/t/${encodeURIComponent(t)}" class="tag">${correctTag(t)}</a>`)}
                        </div>
                      `
                    : html``}
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
