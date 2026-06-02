/**
 * Media tag view — grid filtered by a specific tag.
 * Route: /media/tags/:tag
 * @module pages/media/media-tag-view
 */

import { html, define, router } from 'hybrids';
import '#atoms/theme-toggle/theme-toggle.js';
import MediaDetailView from '#pages/media/media-detail-view.js';

async function loadByTag(tag) {
  const decoded = decodeURIComponent(tag);
  const res = await fetch('/content/media/manifest.json');
  const { posts } = await res.json();
  return posts.filter((p) => p.tags.includes(decoded));
}

export default define({
  tag: 'media-tag-view',
  [router.connect]: { url: '/media/tags/:tagName', stack: [MediaDetailView] },
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
            <a href="/b">blog</a>
          <a href="/media">media</a>
          <a href="/users/techninja">who is tn?</a>
          <theme-toggle></theme-toggle>
        </nav>
      </header>

      <main class="media-grid-page">
        <nav class="media-breadcrumb">
          <a href="/media">Media</a> / <a href="/media/tags">Tags</a> / <span>#${decodeURIComponent(tagName)}</span>
        </nav>
        <h1>#${decodeURIComponent(tagName)}</h1>
        ${Array.isArray(posts)
          ? posts.length
            ? html`
                <div class="media-grid">
                  ${posts.map((p) => html`
                    <a href="${router.url(MediaDetailView, { slug: p.slug })}" class="media-grid__item">
                      ${p.type === 'video'
                        ? html`<video src="/assets-media/${p.files[0]}" muted preload="metadata"></video>`
                        : html`<img src="/assets-media/${p.files[0]}" alt="${p.caption}" loading="lazy" onload="${(h, e) => { e.target.classList.add('loaded'); }}" />`}
                      ${p.type === 'carousel' ? html`<span class="media-grid__multi">⊞</span>` : html``}
                      ${p.type === 'video' ? html`<span class="media-grid__video">▶</span>` : html``}
                    </a>
                  `)}
                </div>
              `
            : html`<p>No media found for this tag.</p>`
          : html`<p>Loading…</p>`}
      </main>

      <footer class="site-footer">
        <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
      </footer>
    `,
    shadow: false,
  },
});
