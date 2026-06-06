/**
 * Drafts dashboard — dev-only list of all draft posts with status.
 * Route: /drafts
 * @module pages/drafts/drafts-view
 */

import { html, define, router } from 'hybrids';
import DraftDetailView from './draft-detail-view.js';
import '#organisms/site-header/site-header.js';
import '#organisms/site-footer/site-footer.js';
import { setPageTitle } from '#utils/pageTitle.js';
import { statusColor, STATUS_OPTIONS } from '#utils/statusColors.js';

/**
 *
 */
async function loadDrafts() {
  const res = await fetch('/_api/drafts/');
  if (!res.ok) return [];
  const { drafts } = await res.json();
  return drafts;
}

/**
 *
 */
async function publishDraft(slug) {
  const res = await fetch(`/_api/drafts/${slug}/publish`, { method: 'POST' });
  return res.json();
}

/**
 *
 */
function filteredDrafts(drafts, filter, hideComplete) {
  if (!Array.isArray(drafts)) return [];
  return drafts.filter((d) => {
    if (hideComplete && d.status === 'complete') return false;
    if (filter && filter !== 'all') return d.status === filter;
    return true;
  });
}

export default define({
  tag: 'drafts-view',
  [router.connect]: { url: '/drafts', stack: [DraftDetailView] },
  drafts: {
    value: undefined,
    connect(host) {
      loadDrafts().then((d) => {
        host.drafts = d;
      });
      setPageTitle('Drafts');
    },
  },
  publishing: { value: {} },
  filter: 'all',
  hideComplete: true,
  render: {
    value: ({ drafts, filter, hideComplete, publishing }) => {
      const visible = filteredDrafts(drafts, filter, hideComplete);
      const counts = {};
      if (Array.isArray(drafts))
        drafts.forEach((d) => {
          counts[d.status] = (counts[d.status] || 0) + 1;
        });

      return html`
        <site-header></site-header>
        <main class="drafts-page">
          <h1>📝 Draft Manager</h1>
          <p><a href="/media-drafts">📷 Media Drafts →</a></p>

          ${drafts === undefined
            ? html`<p>Loading…</p>`
            : html`
                <div class="drafts-toolbar">
                  <div class="drafts-toolbar__filters">
                    <button
                      class="${{ 'drafts-filter': true, active: filter === 'all' }}"
                      onclick="${(host) => {
                        host.filter = 'all';
                      }}"
                    >
                      All (${drafts.length})
                    </button>
                    ${STATUS_OPTIONS.map(
                      (s) => html`
                        <button
                          class="${{ 'drafts-filter': true, active: filter === s }}"
                          style="${{ '--dot-color': statusColor(s) }}"
                          onclick="${(host) => {
                            host.filter = s;
                          }}"
                        >
                          <span class="status-dot" style="${{ background: statusColor(s) }}"></span
                          >${s} (${counts[s] || 0})
                        </button>
                      `,
                    )}
                  </div>
                  <label class="drafts-toolbar__toggle">
                    <input
                      type="checkbox"
                      checked="${hideComplete}"
                      onchange="${(host, e) => {
                        host.hideComplete = e.target.checked;
                      }}"
                    />
                    Hide complete
                  </label>
                </div>

                <table class="drafts-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Images</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${visible.map(
                      (d) => html`
                        <tr>
                          <td>
                            <span
                              class="status-dot"
                              style="${{
                                background: statusColor(d.status),
                              }}"
                            ></span>
                            ${d.status}
                          </td>
                          <td class="drafts-table__date">${d.date}</td>
                          <td>
                            <a href="${router.url(DraftDetailView, { slug: d.slug })}"
                              >${d.title}</a
                            >
                          </td>
                          <td>${d.images.length}</td>
                          <td>
                            ${d.status === 'ready'
                              ? html`
                                  <button
                                    class="btn btn-small btn-primary btn-publish ${publishing[
                                      d.slug
                                    ] || ''}"
                                    disabled="${!!publishing[d.slug]}"
                                    onclick="${(host) => {
                                      host.publishing = {
                                        ...host.publishing,
                                        [d.slug]: 'publishing',
                                      };
                                      publishDraft(d.slug).then((result) => {
                                        if (result.success) {
                                          host.publishing = {
                                            ...host.publishing,
                                            [d.slug]: 'published',
                                          };
                                          setTimeout(
                                            () =>
                                              loadDrafts().then((all) => {
                                                host.drafts = all;
                                              }),
                                            1200,
                                          );
                                        } else {
                                          host.publishing = { ...host.publishing, [d.slug]: '' };
                                          alert(result.error || 'Publish failed');
                                        }
                                      });
                                    }}"
                                  >
                                    ${publishing[d.slug] === 'publishing'
                                      ? 'Publishing…'
                                      : publishing[d.slug] === 'published'
                                        ? '✓ Published'
                                        : 'Publish'}
                                  </button>
                                `
                              : ''}
                          </td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>

                ${visible.length === 0
                  ? html`<p class="drafts-page__empty">No drafts matching filter.</p>`
                  : ''}
              `}
        </main>
        <site-footer></site-footer>
      `;
    },
    shadow: false,
  },
});
