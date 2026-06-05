/**
 * Lightbox — click-to-expand modal with nav arrows and touch gestures.
 * @module utils/lightbox
 */

/** @param {HTMLElement} container */
export function attachLightbox(container) {
  const figures = /** @type {HTMLElement[]} */ ([
    ...container.querySelectorAll('figure.post-media-figure, .post-hero-figure'),
  ]);
  if (!figures.length) return;

  let currentIdx = -1;
  let startX = 0;
  let startY = 0;
  let scale = 1;
  let lastDist = 0;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-prev" aria-label="Previous">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <div class="lightbox-content"></div>
    <button class="lightbox-next" aria-label="Next">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <p class="lightbox-caption"></p>
  `;
  document.body.appendChild(overlay);

  const content = overlay.querySelector('.lightbox-content');
  const caption = overlay.querySelector('.lightbox-caption');
  const prevBtn = overlay.querySelector('.lightbox-prev');
  const nextBtn = overlay.querySelector('.lightbox-next');

  function getMedia(fig) {
    const img = fig.querySelector('img');
    const video = fig.querySelector('video');
    const cap = fig.querySelector('figcaption')?.textContent || img?.alt || '';
    if (video) return { type: 'video', src: video.src, caption: cap };
    if (img) return { type: 'img', src: img.src, caption: cap };
    return null;
  }

  function show(idx) {
    if (idx < 0 || idx >= figures.length) return;
    currentIdx = idx;
    scale = 1;
    const media = getMedia(figures[idx]);
    if (!media) return;

    if (media.type === 'img') {
      content.innerHTML = `<img src="${media.src}" alt="${media.caption}" />`;
    } else {
      content.innerHTML = `<video src="${media.src}" controls autoplay></video>`;
    }
    caption.textContent = media.caption;
    prevBtn.style.display = idx > 0 ? '' : 'none';
    nextBtn.style.display = idx < figures.length - 1 ? '' : 'none';
    overlay.classList.add('active');
  }

  function close() {
    overlay.classList.remove('active');
    content.innerHTML = '';
    currentIdx = -1;
  }

  function next() { if (currentIdx < figures.length - 1) show(currentIdx + 1); }
  function prev() { if (currentIdx > 0) show(currentIdx - 1); }

  // Click handlers
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (currentIdx === -1) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Touch: swipe and pinch-zoom
  overlay.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      lastDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  overlay.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale = Math.max(1, Math.min(4, scale * (dist / lastDist)));
      lastDist = dist;
      const el = content.querySelector('img, video');
      if (el) el.style.transform = `scale(${scale})`;
    }
  }, { passive: true });

  overlay.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1 && scale <= 1.1) {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
      }
    }
    if (e.touches.length === 0 && scale <= 1.1) {
      scale = 1;
      const el = content.querySelector('img, video');
      if (el) el.style.transform = '';
    }
  }, { passive: true });

  // Attach click to figures
  container.addEventListener('click', (e) => {
    const fig = e.target.closest('figure.post-media-figure, .post-hero-figure');
    if (!fig) return;
    const idx = figures.indexOf(fig);
    if (idx > -1) show(idx);
  });
}
