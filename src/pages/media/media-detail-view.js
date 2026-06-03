/**
 * Media detail — single media item with carousel, nav, and related.
 * Route: /media/:slug
 * @module pages/media/media-detail-view
 */

import { html, define, router } from 'hybrids';
import { formatDate } from '#utils/formatDate.js';
import '#atoms/app-icon/app-icon.js';
import '#organisms/site-header/site-header.js';
import '#molecules/breadcrumb/breadcrumb.js';

let allPosts = null;

async function loadAll() {
  if (allPosts) return allPosts;
  const res = await fetch('/content/media/manifest.json');
  const { posts } = await res.json();
  allPosts = posts;
  return posts;
}

async function loadPost(slug) {
  const posts = await loadAll();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { post: false };
  const post = posts[idx];
  const prev = idx < posts.length - 1 ? posts[idx + 1] : null;
  const next = idx > 0 ? posts[idx - 1] : null;
  const related = post.tags.length
    ? posts.filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t))).slice(0, 6)
    : [];
  return { post, prev, next, related };
}

export default define({
  tag: 'media-detail-view',
  [router.connect]: { url: '/media/detail/:slug' },
  slug: {
    value: '',
    observe(host, val) {
      if (val) {
        host.data = undefined;
        host.carouselIdx = 0;
        loadPost(val).then((d) => { host.data = d; });
      }
    },
  },
  data: undefined,
  carouselIdx: 0,
  keyHandler: {
    value: undefined,
    connect(host) {
      const handler = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const d = host.data;
        if (!d?.post) return;
        if ((e.key === 'ArrowLeft' || e.key === 'h') && d.next) {
          host.querySelector('.media-nav__arrow--left')?.click();
        } else if ((e.key === 'ArrowRight' || e.key === 'l') && d.prev) {
          host.querySelector('.media-nav__arrow--right')?.click();
        } else if (e.key === 'Backspace' || e.key === 'Escape' || e.key === 'q') {
          e.preventDefault();
          host.querySelector('.media-detail__grid-link')?.click();
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    },
  },
  render: {
    value: ({ data, carouselIdx }) => {
      const post = data?.post;
      const prev = data?.prev;
      const next = data?.next;
      const related = data?.related || [];

      return html`
        <site-header active="media"></site-header>

        <main class="media-detail-page">
          <app-breadcrumb items='${JSON.stringify([{"label":"Home","href":"/"},{"label":"Media","href":"/media"},{"label":(post?.caption||"Detail").slice(0,30)+(post?.caption?.length>30?"…":"")}])}'></app-breadcrumb>
          ${post === undefined
            ? html`<p>Loading…</p>`
            : post === false
              ? html`
                  <div class="not-found__content">
                    <h1>404</h1>
                    <p>Media not found.</p>
                    <a href="/media" class="btn btn-primary">← Back to media</a>
                  </div>
                `
              : html`
                  <div class="media-detail__viewer">
                    <figure class="media-detail">
                      ${post.type === 'video'
                        ? html`<video src="/assets-media/${post.files[0]}" controls class="media-detail__media"></video>`
                        : post.files.length > 1
                          ? html`
                              <div class="media-carousel">
                                <img src="/assets-media/${post.files[carouselIdx]}" class="media-detail__media" />
                                <div class="media-carousel__nav">
                                  <button onclick="${(h) => { h.carouselIdx = Math.max(0, h.carouselIdx - 1); }}" disabled="${carouselIdx <= 0}">‹</button>
                                  <span>${carouselIdx + 1} / ${post.files.length}</span>
                                  <button onclick="${(h) => { h.carouselIdx = Math.min(post.files.length - 1, h.carouselIdx + 1); }}" disabled="${carouselIdx >= post.files.length - 1}">›</button>
                                </div>
                              </div>
                            `
                          : html`<img src="/assets-media/${post.files[0]}" alt="${post.caption}" class="media-detail__media" />`}
                    </figure>

                    <div class="media-nav__arrows">
                      ${next ? html`<a href="/media/detail/${next.slug}" class="media-nav__arrow media-nav__arrow--left"><app-icon name="chevron-left"></app-icon></a>` : html`<span></span>`}
                      ${prev ? html`<a href="/media/detail/${prev.slug}" class="media-nav__arrow media-nav__arrow--right"><app-icon name="chevron-right"></app-icon></a>` : html`<span></span>`}
                    </div>
                  </div>

                  <div class="media-detail__info">
                    ${post.caption ? html`<p class="media-detail__caption">${post.caption}</p>` : html``}
                    <div class="media-detail__meta">
                      <time class="media-detail__date">${formatDate(post.date)}</time>
                      <a href="/media" class="media-detail__grid-link" title="Back to grid (Esc)"><app-icon name="grid3"></app-icon></a>
                    </div>
                    ${post.tags.length
                      ? html`<div class="media-detail__tags">${post.tags.map((t) => html`<a href="/media/tags/${encodeURIComponent(t)}" class="tag">#${t}</a>`)}</div>`
                      : html``}
                  </div>

                  ${related.length
                    ? html`
                        <section class="media-related">
                          <h3>Related</h3>
                          <div class="media-grid media-grid--small">
                            ${related.map((r) => html`
                              <a href="/media/detail/${r.slug}" class="media-grid__item">
                                ${r.type === 'video'
                                  ? html`<video src="/assets-media/${r.files[0]}" muted preload="metadata"></video>`
                                  : html`<img src="/assets-media/${r.files[0]}" alt="${r.caption}" loading="lazy" />`}
                              </a>
                            `)}
                          </div>
                        </section>
                      `
                    : html``}
                `}
        </main>

        <footer class="site-footer">
          <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
        </footer>
      `;
    },
    shadow: false,
  },
});
