/**
 * Tag index — lists all tags with post counts.
 * Single-post tags link directly to the post.
 * Route: /t
 * @module pages/tag/tag-index-view
 */

import { html, define, router } from 'hybrids';
import '#atoms/theme-toggle/theme-toggle.js';
import BlogPostView from '#pages/blog/blog-post-view.js';
import TagView from '#pages/tag/tag-view.js';

async function loadTags() {
  const res = await fetch('/content/b/manifest.json');
  const { posts } = await res.json();
  const map = {};
  for (const p of posts) {
    if (!p.tags) continue;
    for (const t of p.tags) {
      if (!map[t]) map[t] = [];
      map[t].push(p);
    }
  }
  return Object.entries(map)
    .map(([tag, tagPosts]) => ({ tag, count: tagPosts.length, slug: tagPosts.length === 1 ? tagPosts[0].slug : null }))
    .sort((a, b) => b.count - a.count);
}

export default define({
  tag: 'tag-index-view',
  [router.connect]: { url: '/t', stack: [BlogPostView, TagView] },
  tags: {
    value: undefined,
    connect(host) {
      loadTags().then((t) => { host.tags = t; });
    },
  },
  render: {
    value: ({ tags }) => html`
      <header class="site-header">
        <div>
          <h1><a href="/">tn42.com</a></h1>
          <p class="site-slogan">tech ninja 42 — Enhancing your webernet since 1998</p>
        </div>
        <nav class="site-nav">
          <a href="/">home</a>
            <a href="/b">blog</a>
          <a href="/users/techninja">who is tn?</a>
          <theme-toggle></theme-toggle>
        </nav>
      </header>

      <main class="post-view">
        <section class="tag-index">
          <h1>All Tags</h1>
          ${Array.isArray(tags)
            ? html`
                <div class="tag-cloud">
                  ${tags.map((t) => html`
                    <a
                      href="${t.slug ? router.url(BlogPostView, { slug: t.slug }) : router.url(TagView, { tagName: t.tag })}"
                      class="tag tag-cloud__item"
                      style="--count: ${t.count}"
                    >
                      ${t.tag} <span class="tag-count">${t.count}</span>
                    </a>
                  `)}
                </div>
              `
            : html`<p>Loading…</p>`}
          <a href="${router.backUrl() || '/'}" class="btn btn-ghost">← Back to posts</a>
        </section>
      </main>

      <footer class="site-footer">
        <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
      </footer>
    `,
    shadow: false,
  },
});
