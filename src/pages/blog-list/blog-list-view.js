/**
 * Blog listing — paginated post list with sidebar.
 * Route: /b
 * @module pages/blog-list/blog-list-view
 */
import { html, define, router } from 'hybrids';
import { formatDate } from '#utils/formatDate.js';
import BlogPostView from '#pages/blog/blog-post-view.js';
import GalleryPostView from '#pages/blog/gallery-post-view.js';
import TagView from '#pages/tag/tag-view.js';
import TagIndexView from '#pages/tag/tag-index-view.js';
import '#organisms/site-header/site-header.js';
import { asset } from '#config/cdn.js';
import '#molecules/breadcrumb/breadcrumb.js';
import { setPageTitle } from '#utils/pageTitle.js';
import '#organisms/site-footer/site-footer.js';
const PER_PAGE = 10;
/**
 *
 */
async function loadManifest() {
  const res = await fetch('/content/b/manifest.json');
  const { posts } = await res.json();
  return posts;
}
/**
 *
 */
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
  tag: 'blog-list-view',
  [router.connect]: { url: '/b', stack: [BlogPostView, GalleryPostView, TagView, TagIndexView] },
  posts: {
    value: undefined,
    connect(host) {
      loadManifest().then((p) => {
        host.posts = p;
      });
      setPageTitle('Blog');
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
        <site-header active="blog"></site-header>
        <main class="home-view">
          <section class="post-list">
            <app-breadcrumb
              items="${JSON.stringify([{ label: 'Home', href: '/' }, { label: 'Blog' }])}"
            ></app-breadcrumb>
            <h1>Blog <span class="media-count">${ready ? posts.length : ''} posts</span></h1>
            ${ready
              ? visible.map(
                  (p) => html`
                    <article class="post-card">
                      <a href="${router.url(BlogPostView, { slug: p.slug })}">
                        <img
                          class="post-card__img"
                          src="${p.image ? asset(p.image) : '/images/default.svg'}"
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
                    <button
                      onclick="${(h) => {
                        h.page = Math.max(1, h.page - 1);
                      }}"
                      disabled="${page <= 1}"
                    >
                      ‹
                    </button>
                    ${Array.from(
                      { length: total },
                      (_, i) => html`
                        <span
                          class="page-num ${page === i + 1 ? 'active' : ''}"
                          onclick="${(h) => {
                            h.page = i + 1;
                          }}"
                          >${i + 1}</span
                        >
                      `,
                    )}
                    <button
                      onclick="${(h) => {
                        h.page = Math.min(total, h.page + 1);
                      }}"
                      disabled="${page >= total}"
                    >
                      ›
                    </button>
                  </nav>
                `
              : html``}
          </section>
          ${tags.length
            ? html`
                <aside class="site-sidebar">
                  <h3>Tags</h3>
                  <ul class="tag-list">
                    ${tags.map(
                      ([t, count]) =>
                        html`<li>
                          <a href="/t/${encodeURIComponent(t)}" class="tag">${t} (${count})</a>
                        </li>`,
                    )}
                  </ul>
                  <a href="/t" class="sidebar-more">View all tags →</a>
                </aside>
              `
            : html``}
        </main>
        <site-footer></site-footer>
      `;
    },
    shadow: false,
  },
});
