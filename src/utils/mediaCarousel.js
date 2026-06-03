/**
 * Media carousel render helper.
 * @module utils/mediaCarousel
 */
import { html } from 'hybrids';
import { asset } from '#config/cdn.js';

/**
 * Render media content (video, carousel, or single image).
 * @param {object} post
 * @param {number} carouselIdx
 */
export function renderMediaContent(post, carouselIdx) {
  if (post.type === 'video') {
    return html`<video
      src="${asset('/assets-media/' + post.files[0])}"
      controls
      class="media-detail__media"
    ></video>`;
  }
  if (post.files.length > 1) {
    return html`
      <div class="media-carousel">
        <img
          src="${asset('/assets-media/' + post.files[carouselIdx])}"
          class="media-detail__media"
        />
        <div class="media-carousel__nav">
          <button
            onclick="${(h) => {
              h.carouselIdx = Math.max(0, h.carouselIdx - 1);
            }}"
            disabled="${carouselIdx <= 0}"
          >
            ‹
          </button>
          <span>${carouselIdx + 1} / ${post.files.length}</span>
          <button
            onclick="${(h) => {
              h.carouselIdx = Math.min(post.files.length - 1, h.carouselIdx + 1);
            }}"
            disabled="${carouselIdx >= post.files.length - 1}"
          >
            ›
          </button>
        </div>
      </div>
    `;
  }
  return html`<img
    src="${asset('/assets-media/' + post.files[0])}"
    alt="${post.caption}"
    class="media-detail__media"
  />`;
}
