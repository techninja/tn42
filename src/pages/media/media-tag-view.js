/**
 * Media tag view — grid filtered by a specific tag.
 * Route: /media/tags/:tag
 * @module pages/media/media-tag-view
 */

import { html, define, router } from 'hybrids';
import MediaDetailView from '#pages/media/media-detail-view.js';
import '#organisms/site-header/site-header.js';
import { asset } from '#config/cdn.js';
import '#molecules/breadcrumb/breadcrumb.js';
import { setPageTitle } from '#utils/pageTitle.js';

/**
 *
 */
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
      if (tag) {
        loadByTag(tag).then((p) => {
          host.posts = p;
        });
        setPageTitle('#' + decodeURIComponent(tag));
      }
    },
  },
  render: {
    value: ({ tagName, posts }) => html`
      <site-header active="media"></site-header>

      <main class="media-grid-page">
        <app-breadcrumb
          items="${JSON.stringify([
            { label: 'Home', href: '/' },
            { label: 'Media', href: '/media' },
            { label: 'Tags', href: '/media/tags' },
            { label: '#' + decodeURIComponent(tagName) },
          ])}"
        ></app-breadcrumb>
        <h1>#${decodeURIComponent(tagName)}</h1>
        ${Array.isArray(posts)
          ? posts.length
            ? html`
                <div class="media-grid">
                  ${posts.map(
                    (p) => html`
                      <a
                        href="${router.url(MediaDetailView, { slug: p.slug })}"
                        class="media-grid__item"
                      >
                        ${p.type === 'video'
                          ? html`<video
                              src="${asset('/assets-media/' + p.files[0])}"
                              muted
                              preload="metadata"
                            ></video>`
                          : html`<img
                              src="${asset('/assets-media/' + p.files[0])}"
                              alt="${p.caption}"
                              loading="lazy"
                              onload="${(h, e) => {
                                e.target.classList.add('loaded');
                              }}"
                            />`}
                        ${p.type === 'carousel'
                          ? html`<span class="media-grid__multi">⊞</span>`
                          : html``}
                        ${p.type === 'video'
                          ? html`<span class="media-grid__video">▶</span>`
                          : html``}
                      </a>
                    `,
                  )}
                </div>
              `
            : html`<p>No media found for this tag.</p>`
          : html`<p>Loading…</p>`}
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
