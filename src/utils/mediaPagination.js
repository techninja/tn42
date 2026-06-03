/**
 * Pagination template helper for media grid.
 * @module utils/mediaPagination
 */

import { html } from 'hybrids';

/**
 * Render pagination controls.
 * @param {number} page
 * @param {number} total
 * @param {string} [cls]
 */
export function renderPagination(page, total, cls = '') {
  if (total <= 1) return html``;
  return html`
    <nav class="pagination ${cls}">
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
  `;
}
