/**
 * Related media grid render helper.
 * @module utils/mediaRelated
 */
import { html } from 'hybrids';
import { asset } from '#config/cdn.js';

/**
 * Render related media grid section.
 * @param {Array} related
 */
export function renderRelated(related) {
  if (!related.length) return html``;
  return html`
    <section class="media-related">
      <h3>Related</h3>
      <div class="media-grid media-grid--small">
        ${related.map(
          (r) => html`
            <a href="/media/detail/${r.slug}" class="media-grid__item">
              ${r.type === 'video'
                ? html`<video
                    src="${asset('/assets-media/' + r.files[0])}"
                    muted
                    preload="metadata"
                  ></video>`
                : html`<img
                    src="${asset('/assets-media/' + r.files[0])}"
                    alt="${r.caption}"
                    loading="lazy"
                    onload="${(h, e) => {
                      e.target.classList.add('loaded');
                    }}"
                  />`}
            </a>
          `,
        )}
      </div>
    </section>
  `;
}
