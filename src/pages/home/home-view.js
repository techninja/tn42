/**
 * Home page — paginated blog listing with sidebar.
 * @module pages/home
 */

import { html, define, router } from 'hybrids';
import { formatDate } from '#utils/formatDate.js';
import BlogPostView from '#pages/blog/blog-post-view.js';
import GalleryPostView from '#pages/blog/gallery-post-view.js';
import TagView from '#pages/tag/tag-view.js';
import TagIndexView from '#pages/tag/tag-index-view.js';
import MediaGridView from '#pages/media/media-grid-view.js';
import UserView from '#pages/user/user-view.js';
import '#atoms/theme-toggle/theme-toggle.js';

const PER_PAGE = 10;

async function loadManifest() {
  const res = await fetch('/content/b/manifest.json');
  const { posts } = await res.json();
  return posts;
}

/** Collect unique tags from all posts. */
function collectTags(posts) {
  const counts = {};
  for (const p of posts) {
    if (!p.tags) continue;
    for (const t of p.tags) counts[t] = (counts[t] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
}

export default define({
  tag: 'home-view',
  [router.connect]: { stack: [BlogPostView, GalleryPostView, TagView, TagIndexView, UserView, MediaGridView] },
  posts: {
    value: undefined,
    connect(host) {
      loadManifest().then((p) => { host.posts = p; });
    },
  },
  page: 1,
  render: {
    value: ({ posts, page }) => {
      const ready = Array.isArray(posts);
      const total = ready ? Math.ceil(posts.length / PER_PAGE) : 0;
      const visible = ready ? posts.slice((page - 1) * PER_PAGE, page * PER_PAGE) : [];
      const tags = ready ? collectTags(posts) : [];

      return html`
        <header class="site-header">
          <div>
            <h1><a href="/">tn42.com</a></h1>
            <p class="site-slogan">tech ninja 42 — Enhancing your webernet since 1998</p>
          </div>
          <nav class="site-nav">
            <a href="/" class="active">home</a>
            <a href="/media">media</a>
            <a href="/users/techninja">who is tn?</a>
            <theme-toggle></theme-toggle>
          </nav>
        </header>

        <main class="home-view">
          <section class="post-list">
            ${ready
              ? visible.map(
                  (p) => html`
                    <article class="post-card">
                      <a href="${router.url(BlogPostView, { slug: p.slug })}">
                        <img
                          class="post-card__img"
                          src="${p.image || '/images/default.svg'}"
                          alt="${p.title}"
                          loading="lazy"
                        />
                        <h2>${p.title}</h2>
                      </a>
                      <time>${formatDate(p.date)}</time>
                    </article>
                  `,
                )
              : html`<p>Loading…</p>`}

            ${total > 1
              ? html`
                  <nav class="pagination">
                    <button onclick="${(h) => { h.page = Math.max(1, h.page - 1); }}" disabled="${page <= 1}">‹</button>
                    ${Array.from({ length: total }, (_, i) => html`
                      <span
                        class="page-num ${page === i + 1 ? 'active' : ''}"
                        onclick="${(h) => { h.page = i + 1; }}"
                      >${i + 1}</span>
                    `)}
                    <button onclick="${(h) => { h.page = Math.min(total, h.page + 1); }}" disabled="${page >= total}">›</button>
                  </nav>
                `
              : html``}
          </section>

          ${tags.length
            ? html`
                <aside class="site-sidebar">
                  <h3>Tags</h3>
                  <ul class="tag-list">
                    ${tags.map(([t, count]) => html`<li><a href="/t/${encodeURIComponent(t)}" class="tag">${t} (${count})</a></li>`)}
                  </ul>
                  <a href="/t" class="sidebar-more">View all tags →</a>
                </aside>
              `
            : html``}
        </main>

        <footer class="site-footer">
          <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
        </footer>
      `;
    },
    shadow: false,
  },
});
