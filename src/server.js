/**
 * Static dev server — serves src/ for the browser with SPA fallback.
 * @module server
 */

import express from 'express';
import draftsRouter from './server-drafts.js';
import mediaRouter from './server-media-drafts.js';

/** @type {any} */
const app = express();

app.use(express.json());
app.use('/_api/drafts', draftsRouter);
app.use('/_api/media-drafts', mediaRouter);
app.use(express.static('src'));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('.')) {
    return res.sendFile('index.html', { root: 'src' });
  }
  next();
});

/** @param {number} [port] */
export function start(port = 3000) {
  const server = app.listen(port, () => console.log(`http://localhost:${port}`));
  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start(parseInt(process.env.PORT) || 3000);
}

export default app;
