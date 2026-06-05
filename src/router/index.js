/**
 * App router shell — manages view stack.
 * @module router
 */

import { html, define, router } from 'hybrids';
import HomeView from '#pages/home/home-view.js';
import NotFoundView from '#pages/not-found/not-found-view.js';
import DraftsView from '#pages/drafts/drafts-view.js';

export default define({
  tag: 'app-router',
  // @ts-ignore — dialog is a valid router option
  stack: router(HomeView, { url: '/', dialog: NotFoundView }),
  render: {
    value: ({ stack }) => html`<div class="app-router">${stack}</div>`,
    shadow: false,
  },
});
