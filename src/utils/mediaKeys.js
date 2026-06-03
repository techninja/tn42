/**
 * Media keyboard navigation — arrow/vim keys for media views.
 * @module utils/mediaKeys
 */

/**
 * Connect keyboard handler for media detail navigation.
 * @param {any} host
 * @returns {Function} Cleanup function
 */
export function connectMediaDetailKeys(host) {
  const handler = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const d = host.data;
    if (!d?.post) return;
    if ((e.key === 'ArrowLeft' || e.key === 'h') && d.next) {
      /** @type {HTMLElement|null} */ (host.querySelector('.media-nav__arrow--left'))?.click();
    } else if ((e.key === 'ArrowRight' || e.key === 'l') && d.prev) {
      /** @type {HTMLElement|null} */ (host.querySelector('.media-nav__arrow--right'))?.click();
    } else if (e.key === 'Backspace' || e.key === 'Escape' || e.key === 'q') {
      e.preventDefault();
      /** @type {HTMLElement|null} */ (host.querySelector('.media-detail__grid-link'))?.click();
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}

/**
 * Connect keyboard handler for media grid pagination.
 * @param {any} host
 * @param {number} perPage
 * @returns {Function} Cleanup function
 */
export function connectMediaGridKeys(host, perPage) {
  const handler = (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (!Array.isArray(host.posts)) return;
    const total = Math.ceil(host.posts.length / perPage);
    if ((e.key === 'ArrowLeft' || e.key === 'h') && host.page > 1) {
      host.page--;
    } else if ((e.key === 'ArrowRight' || e.key === 'l') && host.page < total) {
      host.page++;
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}
