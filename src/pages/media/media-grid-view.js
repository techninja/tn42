/**
 * Media grid — instagram-style square grid.
 * Route: /media
 * @module pages/media/media-grid-view
 */

import { html, define, router } from 'hybrids';
import '#atoms/app-icon/app-icon.js';
import MediaDetailView from '#pages/media/media-detail-view.js';
import MediaTagsView from '#pages/media/media-tags-view.js';
import '#organisms/site-header/site-header.js';
import { asset } from '#config/cdn.js';
import '#molecules/breadcrumb/breadcrumb.js';
import { setPageTitle } from '#utils/pageTitle.js';

const PER_PAGE = 24;

/**
 *
 */
async function loadManifest() {
  const res = await fetch('/content/media/manifest.json');
  const { posts } = await res.json();
  return posts;
}

export default define({
  tag: 'media-grid-view',
  [router.connect]: { url: '/media', stack: [MediaDetailView, MediaTagsView] },
  posts: {
    value: undefined,
    connect(host) {
      loadManifest().then((p) => {
        host.posts = p;
      });
      setPageTitle('Media');
    },
  },
  page: {
    value: 1,
    observe(host) {
      const grid = host.querySelector('.media-grid');
      if (grid) {
        grid.style.animation = 'none';
        grid.offsetHeight;
        grid.style.animation = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  },
  keyHandler: {
    value: undefined,
    connect(host) {
      const handler = (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (!Array.isArray(host.posts)) return;
        const total = Math.ceil(host.posts.length / PER_PAGE);
        if ((e.key === 'ArrowLeft' || e.key === 'h') && host.page > 1) {
          host.page--;
        } else if ((e.key === 'ArrowRight' || e.key === 'l') && host.page < total) {
          host.page++;
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    },
  },
  render: {
    value: ({ posts, page }) => {
      const ready = Array.isArray(posts);
      const total = ready ? Math.ceil(posts.length / PER_PAGE) : 0;
      const visible = ready ? posts.slice((page - 1) * PER_PAGE, page * PER_PAGE) : [];

      return html`
        <site-header active="media"></site-header>

        <main class="media-grid-page">
          <app-breadcrumb
            items="${JSON.stringify([{ label: 'Home', href: '/' }, { label: 'Media' }])}"
          ></app-breadcrumb>
          <div class="media-grid-header">
            <h1>Media <span class="media-count">${ready ? posts.length : ''}</span></h1>
            <a href="${router.url(MediaTagsView)}" class="btn btn-ghost"
              ><app-icon name="tag"></app-icon> Tags</a
            >
          </div>
          <p class="media-subtitle">
            Dad of 6, nerd, and general hacker of things. These are all of my own photos and video
            with minimal editing, mostly shot on phones.
          </p>
          ${ready
            ? html`
                ${total > 1
                  ? html`
                      <nav class="pagination pagination--top">
                        <button
                          onclick="${(h) => {
                            h.page = Math.max(1, h.page - 1);
                          }}"
                          disabled="${page <= 1}"
                        >
                          ‹
                        </button>
                        <span class="pagination__info">${page} / ${total}</span>
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

                <div class="media-grid">
                  ${visible.map(
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
                        <span class="pagination__info">${page} / ${total}</span>
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
              `
            : html`<p>Loading…</p>`}
        </main>

        <footer class="site-footer">
          <p>
            © 1998–${new Date().getFullYear()} TechNinja. Built with
            <a href="https://github.com/techninja/clearstack">Clearstack</a>.
          </p>
        </footer>
      `;
    },
    shadow: false,
  },
});
