/**
 * Landing page — intro + latest from each content section.
 * Route: /
 * @module pages/home/home-view
 */

import { html, define, router } from 'hybrids';
import { formatDate } from '#utils/formatDate.js';
import BlogListView from '#pages/blog-list/blog-list-view.js';
import MediaGridView from '#pages/media/media-grid-view.js';
import PortfolioView from '#pages/portfolio/portfolio-view.js';
import UserView from '#pages/user/user-view.js';
import DraftsView from '#pages/drafts/drafts-view.js';
import '#atoms/app-icon/app-icon.js';
import '#organisms/site-header/site-header.js';
import { asset } from '#config/cdn.js';
import { setPageTitle } from '#utils/pageTitle.js';
import '#organisms/site-footer/site-footer.js';

/**
 *
 */
async function loadLatest() {
  const [blogRes, mediaRes] = await Promise.all([
    fetch('/content/b/manifest.json'),
    fetch('/content/media/manifest.json'),
  ]);
  const { posts: blog } = await blogRes.json();
  const { posts: media } = await mediaRes.json();
  return { blog: blog.slice(0, 4), media: media.slice(0, 9) };
}

export default define({
  tag: 'home-view',
  [router.connect]: { stack: [BlogListView, MediaGridView, PortfolioView, UserView, DraftsView] },
  data: {
    value: undefined,
    connect(host) {
      loadLatest().then((d) => {
        host.data = d;
      });
      setPageTitle();
    },
  },
  render: {
    value: ({ data }) => {
      const ready = data !== undefined && data !== null;

      return html`
        <site-header active="home"></site-header>

        <main class="landing">
          <section class="landing__hero">
            <h2>Hey, I'm James.</h2>
            <p>
              Dad of 6, nerd, maker, and general hacker of things. This is my corner of the web — a
              place for old blog posts, photos, videos, and whatever else I feel like putting here.
            </p>
          </section>

          ${ready
            ? html`
                <section class="landing__section">
                  <div class="landing__section-header">
                    <h3><app-icon name="image"></app-icon> Latest Media</h3>
                    <a href="${router.url(MediaGridView)}">View all →</a>
                  </div>
                  <div class="media-grid media-grid--landing">
                    ${data.media.map(
                      (p) => html`
                        <a href="/media/detail/${p.slug}" class="media-grid__item">
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
                          ${p.type === 'video'
                            ? html`<span class="media-grid__video">▶</span>`
                            : html``}
                        </a>
                      `,
                    )}
                  </div>
                </section>

                <section class="landing__section">
                  <div class="landing__section-header">
                    <h3><app-icon name="rss"></app-icon> Latest Blog Posts</h3>
                    <a href="${router.url(BlogListView)}">View all →</a>
                  </div>
                  <div class="landing__blog-list">
                    ${data.blog.map(
                      (p) => html`
                        <article class="post-card">
                          <a href="/b/${p.slug}">
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
                    )}
                  </div>
                </section>
              `
            : html`<p>Loading…</p>`}
        </main>

        <site-footer></site-footer>
      `;
    },
    shadow: false,
  },
});
