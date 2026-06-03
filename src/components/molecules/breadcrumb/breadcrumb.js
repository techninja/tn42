/**
 * Breadcrumb navigation — renders a path from a JSON items attribute.
 * Usage: <app-breadcrumb items='[{"label":"Blog","href":"/b"},{"label":"Post Title"}]'></app-breadcrumb>
 * @module components/molecules/breadcrumb
 */

import { html, define } from 'hybrids';
import '#atoms/app-icon/app-icon.js';

export default define({
  tag: 'app-breadcrumb',
  items: {
    value: [],
    connect(host, key) {
      // Parse from attribute if string
      const attr = host.getAttribute('items');
      if (attr) {
        try {
          host[key] = JSON.parse(attr);
        } catch {
          /* ignore */
        }
      }
    },
    observe(host, val) {
      if (typeof val === 'string') {
        try {
          host.items = JSON.parse(val);
        } catch {
          /* ignore */
        }
      }
    },
  },
  render: {
    value: ({ items }) => {
      if (!Array.isArray(items) || !items.length) return html``;
      const icons = ['chevron-right', 'dot'];

      return html`
        <nav class="breadcrumb">
          ${items.map(
            (item, i) => html`
              ${i > 0
                ? html`<span class="breadcrumb__sep"
                    ><app-icon name="${icons[Math.min(i - 1, icons.length - 1)]}"></app-icon
                  ></span>`
                : html``}
              ${item.href
                ? html`<a href="${item.href}">${item.label}</a>`
                : html`<span class="breadcrumb__current">${item.label}</span>`}
            `,
          )}
        </nav>
      `;
    },
    shadow: false,
  },
});
