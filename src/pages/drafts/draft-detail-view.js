/**
 * Draft detail editor — edit notes, status, images for a single draft.
 * Route: /drafts/:slug
 * @module pages/drafts/draft-detail-view
 */

import { html, define, router } from 'hybrids';
import { renderMarkdown } from '#utils/renderMarkdown.js';
import '#organisms/site-header/site-header.js';
import '#organisms/site-footer/site-footer.js';
import '#molecules/breadcrumb/breadcrumb.js';
import { setPageTitle } from '#utils/pageTitle.js';
import { STATUS_OPTIONS } from '#utils/statusColors.js';

/** @param {string} slug */
async function loadDraft(slug) {
  const res = await fetch(`/_api/drafts/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

/** @param {string} slug @param {object} patch */
async function saveDraft(slug, patch) {
  const res = await fetch(`/_api/drafts/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return res.json();
}

/**
 *
 */
function renderPostPreview(content, slug) {
  const lines = content.split('\n');
  const bodyStart = lines.findIndex((l, i) => i > 0 && l === '---');
  const body = bodyStart > -1 ? lines.slice(bodyStart + 1).join('\n') : content;
  let rendered = renderMarkdown(body);
  // Rewrite image paths to draft API for preview
  rendered = rendered.replace(
    /src="\/images\/blog\/[^/]+\/([^"]+)"/g,
    `src="/_api/drafts/${slug}/images/$1"`,
  );
  // Wrap all img tags in figure with figcaption from alt text
  rendered = rendered.replace(/<img([^>]*)src="([^"]+)"([^>]*)\/?>/gi, (match, pre, src, post) => {
    const alt = (pre + post).match(/alt="([^"]*)"/)?.[1] || '';
    // Video files get video element
    if (/\.(avi|mp4|webm|mov)$/i.test(src)) {
      const webSrc = src.replace(/\.[^.]+$/, '.mp4');
      return `<figure class="post-media-figure"><video src="${webSrc}" controls preload="metadata"></video>${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
    }
    return `<figure class="post-media-figure"><img src="${src}" alt="${alt}" />${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
  });
  return rendered;
}

// SPLIT CANDIDATE: image panel logic could extract to utils/draftImages.js

export default define({
  tag: 'draft-detail-view',
  [router.connect]: { url: '/drafts/:slug' },
  slug: '',
  draft: {
    value: undefined,
    connect(host) {
      if (host.slug)
        loadDraft(host.slug).then((d) => {
          host.draft = d || false;
          if (d) setPageTitle(`Draft: ${d.title}`);
        });
    },
  },
  saving: false,
  processResult: undefined,
  render: {
    value: ({ draft, slug, saving, processResult }) => html`
      <site-header></site-header>
      <main class="draft-editor">
        <app-breadcrumb
          items="${JSON.stringify([
            { label: 'Home', href: '/' },
            { label: 'Drafts', href: '/drafts' },
            { label: draft?.title || 'Draft' },
          ])}"
        ></app-breadcrumb>

        ${draft === undefined ? html`<p>Loading…</p>` : ''}
        ${draft === false ? html`<p>Draft not found.</p>` : ''}
        ${draft && draft.title
          ? html`
              <div class="draft-editor__layout">
                <section class="draft-editor__meta">
                  <h1
                    contenteditable="true"
                    onblur="${(host, e) => {
                      const newTitle = e.target.textContent.trim();
                      if (newTitle && newTitle !== host.draft.title) {
                        host.saving = true;
                        saveDraft(slug, { title: newTitle }).then((d) => {
                          host.draft = { ...host.draft, ...d };
                          host.saving = false;
                        });
                      }
                    }}"
                  >
                    ${draft.title}
                  </h1>
                  <label class="draft-editor__label">
                    Backdated
                    <input
                      type="date"
                      value="${draft.date}"
                      onchange="${(host, e) => {
                        host.saving = true;
                        saveDraft(slug, { date: e.target.value }).then((d) => {
                          host.draft = { ...host.draft, ...d };
                          host.saving = false;
                        });
                      }}"
                    />
                  </label>

                  <label class="draft-editor__label">
                    Slug
                    <input
                      type="text"
                      value="${slug}"
                      onchange="${(host, e) => {
                        const newSlug = e.target.value.trim();
                        if (newSlug && newSlug !== slug) {
                          host.saving = true;
                          fetch(`/_api/drafts/${slug}/rename`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ newSlug }),
                          })
                            .then((r) => r.json())
                            .then((result) => {
                              if (result.success) window.location.href = '/drafts/' + newSlug;
                              else {
                                alert(result.error || 'Rename failed');
                                host.saving = false;
                              }
                            });
                        }
                      }}"
                    />
                  </label>

                  <label class="draft-editor__label">
                    Status
                    <select
                      value="${draft.status}"
                      onchange="${(host, e) => {
                        host.saving = true;
                        saveDraft(slug, { status: e.target.value }).then((d) => {
                          host.draft = { ...host.draft, ...d };
                          host.saving = false;
                        });
                      }}"
                    >
                      ${STATUS_OPTIONS.map(
                        (s) => html`
                          <option value="${s}" selected="${draft.status === s}">${s}</option>
                        `,
                      )}
                    </select>
                  </label>

                  <label class="draft-editor__label">
                    Notes
                    <textarea
                      rows="4"
                      value="${draft.notes}"
                      onchange="${(host, e) => {
                        host.saving = true;
                        saveDraft(slug, { notes: e.target.value }).then((d) => {
                          host.draft = { ...host.draft, ...d };
                          host.saving = false;
                        });
                      }}"
                    >
${draft.notes}</textarea
                    >
                  </label>

                  ${saving ? html`<p class="draft-editor__saving">Saving…</p>` : ''}

                  <button
                    class="btn btn-primary"
                    onclick="${(host) => {
                      host.saving = true;
                      fetch(`/_api/drafts/${slug}/process`, { method: 'POST' })
                        .then((r) => r.json())
                        .then((result) => {
                          console.log('Processed:', result);
                          host.processResult = result;
                          host.saving = false;
                        });
                    }}"
                  >
                    ⚙ Process Assets for Web
                  </button>
                  ${processResult
                    ? html`
                        <p class="draft-editor__process-result">
                          ✓ ${processResult.processed?.length || 0} files processed
                          ${processResult.errors?.length
                            ? html`<br />⚠ ${processResult.errors.join(', ')}`
                            : ''}
                        </p>
                      `
                    : ''}

                  <h3>Images (${draft.images.length})</h3>
                  <div class="draft-editor__images">
                    ${draft.images.map(
                      (img, i) => html`
                        <div class="draft-editor__img-card">
                          ${/\.(mp4|webm|mov)$/i.test(img.file)
                            ? html`<video
                                src="/_api/drafts/${slug}/images/${img.file}"
                                muted
                                preload="metadata"
                              ></video>`
                            : html`<img
                                src="/_api/drafts/${slug}/images/${img.file}"
                                alt="${img.caption}"
                              />`}
                          <input
                            type="text"
                            placeholder="Caption…"
                            value="${img.caption}"
                            onchange="${(host, e) => {
                              const images = [...host.draft.images];
                              images[i] = { ...images[i], caption: e.target.value };
                              host.saving = true;
                              saveDraft(slug, { images }).then((d) => {
                                host.draft = { ...host.draft, ...d };
                                host.saving = false;
                              });
                            }}"
                          />
                          <button
                            onclick="${(host) => {
                              const images = host.draft.images.filter((_, j) => j !== i);
                              host.saving = true;
                              saveDraft(slug, { images }).then((d) => {
                                host.draft = { ...host.draft, ...d };
                                host.saving = false;
                              });
                            }}"
                          >
                            ✕
                          </button>
                        </div>
                      `,
                    )}
                  </div>

                  <div
                    class="draft-editor__dropzone"
                    ondragover="${(host, e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('drag-over');
                    }}"
                    ondragleave="${(host, e) => {
                      e.currentTarget.classList.remove('drag-over');
                    }}"
                    ondrop="${(host, e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('drag-over');
                      const files = [...e.dataTransfer.files].filter((f) =>
                        /\.(jpe?g|png|gif|webp|svg|mp4|webm|mov|avi)$/i.test(f.name),
                      );
                      if (!files.length) return;
                      const form = new FormData();
                      files.forEach((f) => form.append('file', f, f.name));
                      host.saving = true;
                      fetch(`/_api/drafts/${slug}/images`, { method: 'POST', body: form })
                        .then((r) => r.json())
                        .then((result) => {
                          console.log('upload result:', result);
                          const uploaded = result.uploaded || files.map((f) => f.name);
                          const images = [
                            ...host.draft.images,
                            ...uploaded.map((f) => ({ file: f, caption: '' })),
                          ];
                          return saveDraft(slug, { images });
                        })
                        .then((d) => {
                          host.draft = {
                            ...host.draft,
                            ...d,
                            availableImages: [
                              ...(host.draft.availableImages || []),
                              ...files.map((f) => f.name),
                            ],
                          };
                          host.saving = false;
                        });
                    }}"
                  >
                    <p>Drop images here</p>
                  </div>

                  ${draft.availableImages?.length
                    ? html`
                        <h4>Available in /images/</h4>
                        <div class="draft-editor__available">
                          ${draft.availableImages
                            .filter((f) => !draft.images.some((img) => img.file === f))
                            .map(
                              (f) => html`
                                <button
                                  class="draft-editor__add-img"
                                  onclick="${(host) => {
                                    const images = [...host.draft.images, { file: f, caption: '' }];
                                    host.saving = true;
                                    saveDraft(slug, { images }).then((d) => {
                                      host.draft = { ...host.draft, ...d };
                                      host.saving = false;
                                    });
                                  }}"
                                >
                                  ${/\.(mp4|webm|mov)$/i.test(f)
                                    ? html`<video
                                        src="/_api/drafts/${slug}/images/${f}"
                                        muted
                                        preload="metadata"
                                      ></video>`
                                    : html`<img
                                        src="/_api/drafts/${slug}/images/${f}"
                                        alt="${f}"
                                      />`}
                                  <span>+ ${f}</span>
                                </button>
                              `,
                            )}
                        </div>
                      `
                    : ''}
                </section>

                <section class="draft-editor__preview">
                  <h2>Post Preview</h2>
                  <div
                    class="post-body"
                    innerHTML="${renderPostPreview(draft.content, slug)}"
                  ></div>
                </section>
              </div>
            `
          : ''}
      </main>
      <site-footer></site-footer>
    `,
    shadow: false,
  },
});
