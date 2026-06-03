/**
 * Portfolio — open source project showcase.
 * Route: /portfolio
 * @module pages/portfolio/portfolio-view
 */

import { html, define, router } from 'hybrids';
import '#organisms/site-header/site-header.js';
import '#molecules/breadcrumb/breadcrumb.js';
import '#atoms/app-icon/app-icon.js';
import PortfolioDetailView from '#pages/portfolio/portfolio-detail-view.js';
import { setPageTitle } from '#utils/pageTitle.js';

const STATUS_COLORS = {
  active: 'var(--color-success)',
  fiddling: 'var(--color-warning)',
  legacy: 'var(--color-text-muted)',
  pending: 'var(--color-info)',
};

async function loadProjects() {
  const res = await fetch('/content/portfolio/projects.json');
  const { projects } = await res.json();
  return projects;
}

export default define({
  tag: 'portfolio-view',
  [router.connect]: { url: '/portfolio', stack: [PortfolioDetailView] },
  projects: {
    value: undefined,
    connect(host) {
      loadProjects().then((p) => { host.projects = p; });
      setPageTitle('Portfolio');
    },
  },
  render: {
    value: ({ projects }) => {
      const ready = Array.isArray(projects);

      return html`
        <site-header active="portfolio"></site-header>

        <main class="portfolio-page">
          <app-breadcrumb items='${JSON.stringify([{"label":"Home","href":"/"},{"label":"Portfolio"}])}'></app-breadcrumb>
          <h1>Portfolio</h1>
          <p class="portfolio-subtitle">Open source projects I'm currently building or maintaining.</p>

          ${ready
            ? html`
                <div class="portfolio-grid">
                  ${projects.map((p) => html`
                    <a href="${router.url(PortfolioDetailView, { id: p.id })}" class="portfolio-card">
                      <div class="portfolio-card__header">
                        ${p.logo.wordmark
                          ? html`<img src="${p.logo.wordmark}" alt="${p.name}" class="portfolio-card__logo" />`
                          : html`<h2 class="portfolio-card__name">${p.name}</h2>`}
                        <span class="portfolio-card__status" style="--status-color: ${STATUS_COLORS[p.status] || 'var(--color-text-muted)'}">
                          ${p.status}
                        </span>
                      </div>
                      <p class="portfolio-card__desc">${p.description}</p>
                    </a>
                  `)}
                </div>
              `
            : html`<p>Loading…</p>`}
        </main>

        <footer class="site-footer">
          <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
        </footer>
      `;
    },
    shadow: false,
  },
});
