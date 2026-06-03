/**
 * Portfolio detail — single project view.
 * Route: /portfolio/:id
 * @module pages/portfolio/portfolio-detail-view
 */

import { html, define, router } from 'hybrids';
import { formatDate } from '#utils/formatDate.js';
import '#organisms/site-header/site-header.js';
import '#molecules/breadcrumb/breadcrumb.js';
import '#atoms/app-icon/app-icon.js';

const STATUS_COLORS = {
  active: 'var(--color-success)',
  fiddling: 'var(--color-warning)',
  legacy: 'var(--color-text-muted)',
  pending: 'var(--color-info)',
};

async function loadProject(id) {
  const res = await fetch('/content/portfolio/projects.json');
  const { projects } = await res.json();
  return projects.find((p) => p.id === id) || false;
}

export default define({
  tag: 'portfolio-detail-view',
  [router.connect]: { url: '/portfolio/:id' },
  id: {
    value: '',
    observe(host, val) {
      if (val) {
        host.project = undefined;
        loadProject(val).then((p) => { host.project = p; });
      }
    },
  },
  project: undefined,
  render: {
    value: ({ project }) => html`
      <site-header active="portfolio"></site-header>

      <main class="portfolio-detail-page">
        <app-breadcrumb items='${JSON.stringify([{"label":"Home","href":"/"},{"label":"Portfolio","href":"/portfolio"},{"label":project?.name||"Project"}])}'></app-breadcrumb>

        ${project === undefined
          ? html`<p>Loading…</p>`
          : project === false
            ? html`
                <div class="not-found__content">
                  <h1>404</h1>
                  <p>Project not found.</p>
                  <a href="/portfolio" class="btn btn-primary">← Back to portfolio</a>
                </div>
              `
            : html`
                <article class="portfolio-detail">
                  <header class="portfolio-detail__header">
                    ${project.logo.wordmark
                      ? html`<img src="${project.logo.wordmark}" alt="${project.name}" class="portfolio-detail__logo" />`
                      : html`<h1>${project.name}</h1>`}
                    <span class="portfolio-card__status" style="--status-color: ${STATUS_COLORS[project.status]}">
                      ${project.status}
                    </span>
                  </header>

                  <p class="portfolio-detail__desc">${project.description}</p>

                  ${project.background
                    ? html`<p class="portfolio-detail__bg">${project.background}</p>`
                    : html``}

                  <dl class="portfolio-detail__meta">
                    <dt>Status</dt>
                    <dd>${project.statusText}</dd>
                    <dt>Started</dt>
                    <dd>${formatDate(project.started)}</dd>
                    ${project.primaryUri
                      ? html`<dt>Site</dt><dd><a href="${project.primaryUri}">${project.primaryUri.replace('https://', '')}</a></dd>`
                      : html``}
                    ${project.repo
                      ? html`<dt>Source</dt><dd><a href="${project.repo}">GitHub</a></dd>`
                      : html``}
                  </dl>

                  ${project.previewImages.length
                    ? html`
                        <section class="portfolio-detail__previews">
                          ${project.previewImages.map((img) => html`<img src="${img}" loading="lazy" />`)}
                        </section>
                      `
                    : html``}

                  ${project.videoLinks.length
                    ? html`
                        <section class="portfolio-detail__videos">
                          <h3>Videos</h3>
                          ${project.videoLinks.map((v) => html`<a href="${v}" class="btn btn-ghost">Watch →</a>`)}
                        </section>
                      `
                    : html``}

                  <a href="/portfolio" class="btn btn-ghost">← Back to portfolio</a>
                </article>
              `}
      </main>

      <footer class="site-footer">
        <p>© 1998–${new Date().getFullYear()} TechNinja. Built with <a href="https://github.com/techninja/clearstack">Clearstack</a>.</p>
      </footer>
    `,
    shadow: false,
  },
});
