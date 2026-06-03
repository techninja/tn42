/**
 * Author metadata for post bylines.
 * @module config/authors
 */

import { asset } from '#config/cdn.js';

export default {
  techninja: {
    name: 'TechNinja',
    avatar: asset('/images/picture-1/index.jpg'),
    url: '/users/techninja',
  },
  sylvia: {
    name: 'Zeph',
    displayHtml:
      '<span class="nc" tabindex="0"><span class="nc__name">Zeph</span><span class="nc__tip">Sylvia transitioned to Zeph (he/him) in 2016 <a href="/users/sylvia">Learn more</a></span></span>',
    avatar: asset('/images/picture-3/index.jpg'),
    url: '/users/sylvia',
  },
};
