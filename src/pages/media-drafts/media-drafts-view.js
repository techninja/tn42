/**
 * Media drafts — batch upload, edit, merge, and publish media posts.
 * Route: /drafts/media
 * @module pages/media-drafts/media-drafts-view
 */

import { html, define, router } from 'hybrids';
import '#organisms/site-header/site-header.js';
import '#organisms/site-footer/site-footer.js';
import { setPageTitle } from '#utils/pageTitle.js';

const API = '/_api/media-drafts';

let allTags = null;
async function loadAllTags() {
  if (allTags) return allTags;
  const res = await fetch('/content/media/manifest.json');
  const { posts } = await res.json();
  const counts = {};
  posts.forEach((p) => (p.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  allTags = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  return allTags;
}

function suggestTags(caption, existing) {
  if (!caption) return [];
  const words = caption.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3);
  const stops = new Set(['this', 'that', 'with', 'from', 'they', 'their', 'have', 'been', 'were', 'will', 'just', 'some', 'than', 'them', 'then', 'also', 'into', 'over', 'very', 'about', 'first']);
  const candidates = [...new Set(words)].filter((w) => !stops.has(w) && !existing.includes(w));
  return candidates.slice(0, 6);
}

async function loadItems() {
  const res = await fetch(API);
  const { items } = await res.json();
  return items;
}

async function patchItem(slug, patch) {
  const res = await fetch(`${API}/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return res.json();
}

async function mergeItems(slugs) {
  const res = await fetch(`${API}/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slugs }),
  });
  return res.json();
}

async function publishItem(slug) {
  const res = await fetch(`${API}/${slug}/publish`, { method: 'POST' });
  return res.json();
}

function publishWithAnimation(host, slug) {
  host.publishing = { ...host.publishing, [slug]: 'publishing' };
  publishItem(slug).then((result) => {
    if (result.success) {
      host.publishing = { ...host.publishing, [slug]: 'published' };
      setTimeout(() => loadItems().then((d) => { host.items = d; }), 1200);
    } else {
      host.publishing = { ...host.publishing, [slug]: '' };
      alert(result.error || 'Publish failed');
    }
  });
}

async function deleteItem(slug) {
  await fetch(`${API}/${slug}`, { method: 'DELETE' });
}

function thumbSrc(item) {
  const file = item.proxy || item.files[0];
  return `${API}/file/${encodeURIComponent(file)}`;
}

function isVideo(file) {
  return /\.(mp4|webm|mov|avi)$/i.test(file);
}

// SPLIT CANDIDATE: drag/merge logic could extract to utils/mediaDraftDrag.js

export default define({
  tag: 'media-drafts-view',
  [router.connect]: { url: '/media-drafts', stack: [] },
  items: {
    value: undefined,
    connect(host) {
      loadItems().then((d) => { host.items = d; host.selected = []; });
      loadAllTags().then((t) => { host.existingTags = t; });
      setPageTitle('Media Drafts');
    },
  },
  existingTags: { value: [] },
  selected: { value: [] },
  publishing: { value: {} },
  cropTarget: { value: null },
  render: {
    value: ({ items, selected, cropTarget, existingTags, publishing }) => {
      const pending = Array.isArray(items)
        ? items.filter((i) => i.status !== 'complete') : [];

      return html`
        <site-header></site-header>
        <main class="media-drafts-page">
          <h1>📷 Media Drafts</h1>

          <div
            class="media-drafts__dropzone"
            ondragover="${(host, e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}"
            ondragleave="${(host, e) => { e.currentTarget.classList.remove('drag-over'); }}"
            ondrop="${(host, e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('drag-over');
              const files = [...e.dataTransfer.files].filter((f) => /\.(jpe?g|png|gif|webp|svg|mp4|webm|mov|avi|nef|cr2|arw|dng|raf|rw2)$/i.test(f.name));
              if (!files.length) return;
              const form = new FormData();
              files.forEach((f) => form.append('file', f, f.name));
              fetch(`${API}/upload`, { method: 'POST', body: form })
                .then((r) => r.json())
                .then(() => loadItems().then((d) => { host.items = d; }));
            }}"
          >
            <p>Drop media files here to create drafts</p>
          </div>

          ${selected.length >= 2 && pending.some((i) => selected.includes(i.slug)) ? html`
            <div class="media-drafts__actions">
              <button class="btn btn-primary btn-small" onclick="${(host) => {
                mergeItems(selected).then(() => {
                  host.selected = [];
                  loadItems().then((d) => { host.items = d; });
                });
              }}">Merge ${selected.length} into carousel</button>
              <button class="btn btn-small" onclick="${(host) => { host.selected = []; }}">Clear selection</button>
            </div>
          ` : ''}

          ${items === undefined ? html`<p>Loading…</p>` : ''}
          ${pending.length === 0 && items !== undefined ? html`<p class="media-drafts__empty">No media drafts. Drop files above to start.</p>` : ''}

          <div class="media-drafts__grid">
            ${pending.map((item) => html`
              <div
                class="${{ 'media-drafts__card': true, selected: selected.includes(item.slug), publishing: publishing[item.slug] === 'publishing', published: publishing[item.slug] === 'published' }}"
                onclick="${(host, e) => {
                  if (e.target.closest('input, textarea, button, select')) return;
                  const sel = [...host.selected];
                  const idx = sel.indexOf(item.slug);
                  if (idx > -1) sel.splice(idx, 1);
                  else sel.push(item.slug);
                  host.selected = sel;
                }}"
              >
                <div class="media-drafts__thumb">
                  ${item.files.length > 1
                    ? html`<span class="media-drafts__count">${item.files.length}</span>`
                    : ''}
                  ${isVideo(item.files[0]) && item.proxy
                    ? html`<img src="${thumbSrc(item)}" alt="" /><span class="media-drafts__play">▶</span>`
                    : isVideo(item.files[0])
                      ? html`<video src="${API}/file/${encodeURIComponent(item.files[0])}" muted preload="metadata"></video>`
                      : html`<img src="${thumbSrc(item)}" alt="" />`}
                </div>
                <div class="media-drafts__meta">
                  <textarea
                    placeholder="Caption…"
                    rows="2"
                    onchange="${(host, e) => {
                      patchItem(item.slug, { caption: e.target.value });
                      item.caption = e.target.value;
                    }}"
                  >${item.caption}</textarea>
                  <input
                    type="datetime-local"
                    value="${item.date.slice(0, 16)}"
                    onchange="${(host, e) => {
                      patchItem(item.slug, { date: e.target.value + ':00' });
                    }}"
                  />
                  <input
                    type="text"
                    placeholder="Tags (comma-separated)"
                    value="${item.tags.join(', ')}"
                    onchange="${(host, e) => {
                      const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                      patchItem(item.slug, { tags });
                      item.tags = tags;
                    }}"
                  />
                  <div class="media-drafts__tag-suggest">
                    ${suggestTags(item.caption, item.tags).map((t) => html`
                      <button class="tag-pill tag-pill--suggest" onclick="${(host) => {
                        const tags = [...item.tags, t];
                        patchItem(item.slug, { tags });
                        item.tags = tags;
                        loadItems().then((d) => { host.items = d; });
                      }}">${t}</button>
                    `)}
                    ${existingTags.filter((t) => !item.tags.includes(t)).slice(0, 8).map((t) => html`
                      <button class="tag-pill tag-pill--existing" onclick="${(host) => {
                        const tags = [...item.tags, t];
                        patchItem(item.slug, { tags });
                        item.tags = tags;
                        loadItems().then((d) => { host.items = d; });
                      }}">${t}</button>
                    `)}
                  </div>
                  <div class="media-drafts__card-actions">
                    <button class="btn btn-small" onclick="${(host) => {
                      host.cropTarget = item;
                    }}">${isVideo(item.files[0]) ? 'Crop' : 'Edit'}</button>
                    <button
                      class="btn btn-small btn-primary"
                      disabled="${!!publishing[item.slug]}"
                      onclick="${(host) => { publishWithAnimation(host, item.slug); }}"
                    >${publishing[item.slug] === 'publishing' ? 'Publishing…' : publishing[item.slug] === 'published' ? '✓' : 'Publish'}</button>
                    <button class="btn btn-small" onclick="${(host) => {
                      deleteItem(item.slug).then(() => loadItems().then((d) => { host.items = d; }));
                    }}">✕</button>
                  </div>
                </div>
              </div>
            `)}
          </div>

          ${cropTarget ? html`
            <div class="crop-modal" onclick="${(host, e) => {
              if (e.target.classList.contains('crop-modal')) host.cropTarget = null;
            }}">
              <div class="crop-modal__inner">
                <h3>Edit: ${cropTarget.files[0]}</h3>

                <div class="crop-modal__preview">
                  <img
                    src="${cropTarget.filters || cropTarget.crop
                      ? `${API}/${cropTarget.slug}/preview?w=500&t=${cropTarget._t || 0}`
                      : thumbSrc(cropTarget)}"
                    alt=""
                    onclick="${(host, e) => {
                      if (!host.cropTarget.crop) return;
                      const rect = e.target.getBoundingClientRect();
                      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                      const crop = { ...host.cropTarget.crop, x, y };
                      patchItem(host.cropTarget.slug, { crop }).then(() => {
                        host.cropTarget = { ...host.cropTarget, crop };
                      });
                    }}"
                  />
                </div>

                <details open>
                  <summary>Crop</summary>
                  <div class="crop-modal__ratios">
                    ${['1:1', '4:5', '16:9', '3:2'].map((r) => html`
                      <button
                        class="${{ 'btn btn-small': true, 'btn-primary': cropTarget.crop?.ratio === r }}"
                        onclick="${(host) => {
                          const crop = { ratio: r, x: 0.5, y: 0.5 };
                          patchItem(cropTarget.slug, { crop }).then(() => {
                            host.cropTarget = { ...host.cropTarget, crop, _t: Date.now() };
                          });
                        }}"
                      >${r}</button>
                    `)}
                    <button class="btn btn-small" onclick="${(host) => {
                      patchItem(cropTarget.slug, { crop: null }).then(() => {
                        host.cropTarget = { ...host.cropTarget, crop: null, _t: Date.now() };
                      });
                    }}">None</button>
                  </div>
                  ${cropTarget.crop ? html`<p class="crop-modal__hint">Click image to set focal point</p>` : ''}
                </details>

                ${!isVideo(cropTarget.files[0]) ? html`
                <details>
                  <summary>Adjust</summary>
                  <div class="crop-modal__sliders">
                    ${[['brightness', -50, 50, 1], ['contrast', -50, 50, 1], ['saturation', -100, 100, 1], ['warmth', -50, 50, 1], ['sharpen', 0, 20, 1]].map(([name, min, max, step]) => html`
                      <label class="crop-modal__slider">
                        <span>${name}</span>
                        <input
                          type="range"
                          min="${min}" max="${max}" step="${step}"
                          value="${cropTarget.filters?.[name] || 0}"
                          oninput="${(host, e) => {
                            const filters = { ...(host.cropTarget.filters || { brightness: 0, contrast: 0, saturation: 0, warmth: 0, sharpen: 0, bw: false }), [name]: parseFloat(e.target.value) };
                            host.cropTarget = { ...host.cropTarget, filters };
                            clearTimeout(host._filterDebounce);
                            host._filterDebounce = setTimeout(() => {
                              patchItem(host.cropTarget.slug, { filters }).then(() => {
                                host.cropTarget = { ...host.cropTarget, filters, _t: Date.now() };
                              });
                            }, 300);
                          }}"
                        />
                        <span class="crop-modal__slider-val">${cropTarget.filters?.[name] || 0}</span>
                      </label>
                    `)}
                    <label class="crop-modal__slider">
                      <span>B&W</span>
                      <input
                        type="checkbox"
                        checked="${cropTarget.filters?.bw || false}"
                        onchange="${(host, e) => {
                          const filters = { ...(host.cropTarget.filters || { brightness: 0, contrast: 0, saturation: 0, warmth: 0, sharpen: 0, bw: false }), bw: e.target.checked };
                          patchItem(host.cropTarget.slug, { filters }).then(() => {
                            host.cropTarget = { ...host.cropTarget, filters };
                          });
                        }}"
                      />
                    </label>
                    <button class="btn btn-small" onclick="${(host) => {
                      const filters = { brightness: 0, contrast: 0, saturation: 0, warmth: 0, sharpen: 0, bw: false };
                      patchItem(host.cropTarget.slug, { filters }).then(() => {
                        host.cropTarget = { ...host.cropTarget, filters };
                      });
                    }}">Reset all</button>
                  </div>
                </details>
                ` : ''}

                <button class="btn btn-primary" onclick="${(host) => {
                  host.cropTarget = null;
                  loadItems().then((d) => { host.items = d; });
                }}">Done</button>
              </div>
            </div>
          ` : ''}
        </main>
        <site-footer></site-footer>
      `;
    },
    shadow: false,
  },
});
