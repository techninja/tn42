/**
 * Media tags index — lists all media tags with first image as preview.
 * Route: /media/tags
 * @module pages/media/media-tags-view
 */

import { html, define, router } from 'hybrids';
import MediaDetailView from '#pages/media/media-detail-view.js';
import MediaTagView from '#pages/media/media-tag-view.js';
import '#organisms/site-header/site-header.js';
import { asset } from '#config/cdn.js';
import '#molecules/breadcrumb/breadcrumb.js';
import { setPageTitle } from '#utils/pageTitle.js';
import '#organisms/site-footer/site-footer.js';

/**
 *
 */
async function loadTags() {
  const res = await fetch('/content/media/manifest.json');
  const { posts } = await res.json();
  const map = {};
  for (const p of posts) {
    for (const t of p.tags) {
      if (!map[t])
        map[t] = {
          tag: t,
          count: 0,
          preview: p.files[0],
          firstSlug: p.slug,
          isVideo: p.type === 'video',
        };
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
      loadTags().then((t) => {
        host.tags = t;
      });
      setPageTitle('Media Tags');
    },
  },
  render: {
    value: ({ tags }) => html`
      <site-header active="media"></site-header>

      <main class="media-grid-page">
        <app-breadcrumb
          items="${JSON.stringify([
            { label: 'Home', href: '/' },
            { label: 'Media', href: '/media' },
            { label: 'Tags' },
          ])}"
        ></app-breadcrumb>
        <h1>Media Tags</h1>
        ${Array.isArray(tags)
          ? html`
              <div class="media-tags-grid">
                ${tags.map(
                  (t) => html`
                    <a
                      href="${t.count === 1
                        ? router.url(MediaDetailView, { slug: t.firstSlug })
                        : router.url(MediaTagView, { tagName: t.tag })}"
                      class="media-tag-card"
                    >
                      ${t.isVideo
                        ? html`<video
                            src="${asset('/assets-media/' + t.preview)}"
                            muted
                            preload="metadata"
                          ></video>`
                        : html`<img
                            src="${asset('/assets-media/' + t.preview)}"
                            alt="#${t.tag}"
                            loading="lazy"
                          />`}
                      <span class="media-tag-card__label">#${t.tag} <small>${t.count}</small></span>
                    </a>
                  `,
                )}
              </div>
            `
          : html`<p>Loading…</p>`}
      </main>

      <site-footer></site-footer>
    `,
    shadow: false,
  },
});
