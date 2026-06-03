/**
 * Tag view — lists posts filtered by a tag slug.
 * Route: /t/:tagName
 * @module pages/tag/tag-view
 */

import { html, define, router } from 'hybrids';
import { formatDate } from '#utils/formatDate.js';
import BlogPostView from '#pages/blog/blog-post-view.js';
import '#organisms/site-header/site-header.js';
import '#molecules/breadcrumb/breadcrumb.js';
import { setPageTitle } from '#utils/pageTitle.js';

async function loadByTag(tag) {
  const decoded = decodeURIComponent(tag);
  const res = await fetch('/content/b/manifest.json');
  const { posts } = await res.json();
  return posts.filter((p) => p.tags?.includes(decoded));
}

export default define({
  tag: 'tag-view',
  [router.connect]: { url: '/t/:tagName', stack: [BlogPostView] },
  tagName: '',
  posts: {
    value: undefined,
    connect(host) {
      const tag = host.tagName;
      if (tag) {
        loadByTag(tag).then((p) => { host.posts = p; });
        setPageTitle('Posts tagged "' + decodeURIComponent(tag) + '"');
      }
    },
  },
  render: {
    value: ({ tagName, posts }) => html`
      <site-header active="blog"></site-header>

      <main class="home-view">
        <section class="post-list">
          <app-breadcrumb items='${JSON.stringify([{"label":"Home","href":"/"},{"label":"Blog","href":"/b"},{"label":"Tags","href":"/t"},{"label":decodeURIComponent(tagName)}])}'></app-breadcrumb>
          <h2 class="tag-heading">Posts tagged "${decodeURIComponent(tagName)}"</h2>
          ${Array.isArray(posts)
            ? posts.length
              ? posts.map(
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
              : html`<p>No posts found for this tag.</p>`
            : html`<p>Loading…</p>`}

          <nav class="tag-nav">
            <a href="${router.backUrl() || '/'}" class="btn btn-ghost">← Back to posts</a>
            <a href="/t" class="btn btn-ghost">All tags</a>
          </nav>
        </section>
      </main>

      <footer class="site-footer">
        <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
      </footer>
    `,
    shadow: false,
  },
});
