/**
 * Tag view — lists posts filtered by a tag slug.
 * Route: /t/:tag
 * @module pages/tag/tag-view
 */

import { html, define, router } from 'hybrids';
import { formatDate } from '#utils/formatDate.js';

async function loadByTag(tag) {
  const res = await fetch('/content/b/manifest.json');
  const { posts } = await res.json();
  return posts.filter((p) => p.tags?.includes(tag));
}

export default define({
  tag: 'tag-view',
  [router.connect]: { url: '/t/:tagName' },
  tagName: '',
  posts: {
    value: undefined,
    connect(host) {
      const tag = host.tagName;
      if (tag) loadByTag(tag).then((p) => { host.posts = p; });
    },
  },
  render: {
    value: ({ tagName, posts }) => html`
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

      <main class="home-view">
        <section class="post-list">
          <h2 class="tag-heading">Posts tagged "${tagName}"</h2>
          ${posts
            ? posts.length
              ? posts.map(
                  (p) => html`
                    <article class="post-card">
                      <a href="/b/${p.slug}">
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
        </section>
      </main>

      <footer class="site-footer">
        <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
      </footer>
    `,
    shadow: false,
  },
});
