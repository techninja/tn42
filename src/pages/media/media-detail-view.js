/**
 * Media detail — single media item with carousel, nav, and related.
 * Route: /media/detail/:slug
 * @module pages/media/media-detail-view
 */
import { html, define, router } from 'hybrids';
import { formatDate } from '#utils/formatDate.js';
import { loadMediaPost } from '#utils/mediaLoader.js';
import { connectMediaDetailKeys } from '#utils/mediaKeys.js';
import { renderRelated } from '#utils/mediaRelated.js';
import { renderMediaContent } from '#utils/mediaCarousel.js';
import { setPageTitle } from '#utils/pageTitle.js';
import '#atoms/app-icon/app-icon.js';
import '#organisms/site-header/site-header.js';
import '#molecules/breadcrumb/breadcrumb.js';
import '#organisms/site-footer/site-footer.js';

export default define({
  tag: 'media-detail-view',
  [router.connect]: { url: '/media/detail/:slug' },
  slug: {
    value: '',
    observe(host, val) {
      if (val) {
        host.data = undefined;
        host.carouselIdx = 0;
        loadMediaPost(val).then((d) => {
          host.data = d;
          if (d?.post) setPageTitle(d.post.caption || 'Media');
        });
      }
    },
  },
  data: undefined,
  carouselIdx: 0,
  keyHandler: {
    value: undefined,
    connect(host) {
      return connectMediaDetailKeys(host);
    },
  },
  render: {
    value: ({ data, carouselIdx }) => {
      const post = data?.post;
      const prev = data?.prev;
      const next = data?.next;
      const related = data?.related || [];
      const crumb = JSON.stringify([
        { label: 'Home', href: '/' },
        { label: 'Media', href: '/media' },
        {
          label: (post?.caption || 'Detail').slice(0, 30) + (post?.caption?.length > 30 ? '…' : ''),
        },
      ]);
      return html`
        <site-header active="media"></site-header>
        <main class="media-detail-page">
          <app-breadcrumb items="${crumb}"></app-breadcrumb>
          ${post === undefined
            ? html`<p>Loading…</p>`
            : post === false
              ? html` <div class="not-found__content">
                  <h1>404</h1>
                  <p>Media not found.</p>
                  <a href="/media" class="btn btn-primary">← Back to media</a>
                </div>`
              : html`
                  <div class="media-detail__viewer">
                    <figure class="media-detail">${renderMediaContent(post, carouselIdx)}</figure>
                    <div class="media-nav__arrows">
                      ${next
                        ? html`<a
                            href="/media/detail/${next.slug}"
                            class="media-nav__arrow media-nav__arrow--left"
                            ><app-icon name="chevron-left"></app-icon
                          ></a>`
                        : html`<span></span>`}
                      ${prev
                        ? html`<a
                            href="/media/detail/${prev.slug}"
                            class="media-nav__arrow media-nav__arrow--right"
                            ><app-icon name="chevron-right"></app-icon
                          ></a>`
                        : html`<span></span>`}
                    </div>
                  </div>
                  <div class="media-detail__info">
                    ${post.caption
                      ? html`<p class="media-detail__caption">${post.caption}</p>`
                      : html``}
                    <div class="media-detail__meta">
                      <time class="media-detail__date">${formatDate(post.date)}</time>
                      <a href="/media" class="media-detail__grid-link" title="Back to grid (Esc)"
                        ><app-icon name="grid3"></app-icon
                      ></a>
                    </div>
                    ${post.tags.length
                      ? html`<div class="media-detail__tags">
                          ${post.tags.map(
                            (t) =>
                              html`<a href="/media/tags/${encodeURIComponent(t)}" class="tag"
                                >#${t}</a
                              >`,
                          )}
                        </div>`
                      : html``}
                  </div>
                  ${renderRelated(related)}
                `}
        </main>
        <site-footer></site-footer>
      `;
    },
    shadow: false,
  },
});
