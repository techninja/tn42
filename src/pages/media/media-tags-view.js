/**
 * Media tags index — lists all media tags with first image as preview.
 * Route: /media/tags
 * @module pages/media/media-tags-view
 */

import { html, define, router } from 'hybrids';
import '#atoms/theme-toggle/theme-toggle.js';
import MediaDetailView from '#pages/media/media-detail-view.js';
import MediaTagView from '#pages/media/media-tag-view.js';

async function loadTags() {
  const res = await fetch('/content/media/manifest.json');
  const { posts } = await res.json();
  const map = {};
  for (const p of posts) {
    for (const t of p.tags) {
      if (!map[t]) map[t] = { tag: t, count: 0, preview: p.files[0], firstSlug: p.slug, isVideo: p.type === 'video' };
      map[t].count++;
    }
  }
  return Object.values(map).sort((a, b) => a.tag.localeCompare(b.tag));
}

export default define({
  tag: 'media-tags-view',
  [router.connect]: { url: '/media/tags', stack: [MediaTagView, MediaDetailView] },
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
          <a href="/media">media</a>
          <a href="/users/techninja">who is tn?</a>
          <theme-toggle></theme-toggle>
        </nav>
      </header>

      <main class="media-grid-page">
        <nav class="media-breadcrumb">
          <a href="/media">Media</a> / <span>Tags</span>
        </nav>
        <h1>Media Tags</h1>
        ${Array.isArray(tags)
          ? html`
              <div class="media-tags-grid">
                ${tags.map((t) => html`
                  <a href="${t.count === 1 ? router.url(MediaDetailView, { slug: t.firstSlug }) : router.url(MediaTagView, { tagName: t.tag })}" class="media-tag-card">
                    ${t.isVideo
                      ? html`<video src="/assets-media/${t.preview}" muted preload="metadata"></video>`
                      : html`<img src="/assets-media/${t.preview}" alt="#${t.tag}" loading="lazy" />`}
                    <span class="media-tag-card__label">#${t.tag} <small>${t.count}</small></span>
                  </a>
                `)}
              </div>
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
