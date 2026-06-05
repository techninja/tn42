/**
 * Dev-only drafts API — manages _drafts/drafts.json and serves draft assets.
 * Mounted at /_api/drafts in dev mode only.
 * @module server-drafts
 */

import { Router } from 'express';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
  copyFileSync,
  renameSync,
} from 'fs';
import { join, resolve } from 'path';
import { processDraftAssets } from './server-drafts-process.js';

const DRAFTS_DIR = resolve('_drafts');
const DATA_FILE = join(DRAFTS_DIR, 'drafts.json');

/** @returns {object} */
function readData() {
  if (!existsSync(DATA_FILE)) return { drafts: [] };
  return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
}

/** @param {object} data */
function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
}

const draftsRouter = Router();

// List all drafts
draftsRouter.get('/', (req, res) => {
  res.json(readData());
});

// Get single draft with post content
draftsRouter.get('/:slug', (req, res) => {
  const data = readData();
  const draft = data.drafts.find((d) => d.slug === req.params.slug);
  if (!draft) return res.status(404).json({ error: 'Not found' });

  const postPath = join(DRAFTS_DIR, draft.slug, 'post.md');
  const content = existsSync(postPath) ? readFileSync(postPath, 'utf-8') : '';

  // List available images in the draft folder
  const imgDir = join(DRAFTS_DIR, draft.slug, 'images');
  const available = existsSync(imgDir)
    ? readdirSync(imgDir).filter((f) => /\.(jpe?g|png|gif|webp|svg|mp4|webm|mov|avi)$/i.test(f))
    : [];

  res.json({ ...draft, content, availableImages: available });
});

// Update draft metadata (status, notes, images)
draftsRouter.patch('/:slug', (req, res) => {
  const data = readData();
  const idx = data.drafts.findIndex((d) => d.slug === req.params.slug);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const allowed = ['status', 'notes', 'images', 'title', 'date'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) data.drafts[idx][key] = req.body[key];
  }
  writeData(data);
  res.json(data.drafts[idx]);
});

// Upload images to draft folder
draftsRouter.post('/:slug/images', (req, res) => {
  const draftDir = join(DRAFTS_DIR, req.params.slug);
  if (!existsSync(draftDir)) return res.status(404).json({ error: 'Draft not found' });
  const imgDir = join(draftDir, 'images');
  if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });

  const boundary = req.headers['content-type']?.split('boundary=')[1];
  if (!boundary) return res.status(400).json({ error: 'No boundary' });

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const sep = `--${boundary}`;
    const parts = body.toString('binary').split(sep).slice(1, -1);
    const saved = [];

    for (const raw of parts) {
      const hdrEnd = raw.indexOf('\r\n\r\n');
      if (hdrEnd === -1) continue;
      const headers = raw.slice(0, hdrEnd);
      const fnMatch = headers.match(/filename="([^"]+)"/);
      if (!fnMatch) continue;
      const fileData = Buffer.from(raw.slice(hdrEnd + 4, -2), 'binary');
      const dest = join(imgDir, fnMatch[1]);
      writeFileSync(dest, fileData);
      saved.push(fnMatch[1]);
    }
    res.json({ uploaded: saved });
  });
});

// Rename a draft (change slug)
draftsRouter.post('/:slug/rename', (req, res) => {
  const { newSlug } = req.body;
  if (!newSlug) return res.status(400).json({ error: 'newSlug required' });

  const oldDir = join(DRAFTS_DIR, req.params.slug);
  const newDir = join(DRAFTS_DIR, newSlug);
  if (!existsSync(oldDir)) return res.status(404).json({ error: 'Draft not found' });
  if (existsSync(newDir)) return res.status(400).json({ error: 'Slug already exists' });

  // Rename folder
  renameSync(oldDir, newDir);

  // Update drafts.json
  const data = readData();
  const draft = data.drafts.find((d) => d.slug === req.params.slug);
  if (draft) draft.slug = newSlug;
  writeData(data);

  // Update slug in post.md frontmatter
  const postPath = join(newDir, 'post.md');
  if (existsSync(postPath)) {
    let post = readFileSync(postPath, 'utf-8');
    post = post.replace(/^slug:.*$/m, `slug: ${newSlug}`);
    post = post.replace(
      new RegExp(`/images/blog/${req.params.slug}/`, 'g'),
      `/images/blog/${newSlug}/`,
    );
    writeFileSync(postPath, post);
  }

  res.json({ success: true, slug: newSlug });
});

// Process raw assets into web-ready formats
draftsRouter.post('/:slug/process', async (req, res) => {
  const draftDir = join(DRAFTS_DIR, req.params.slug);
  if (!existsSync(draftDir)) return res.status(404).json({ error: 'Draft not found' });
  const result = await processDraftAssets(DRAFTS_DIR, req.params.slug);
  res.json(result);
});

// Publish a ready draft to src/content/b/
draftsRouter.post('/:slug/publish', async (req, res) => {
  const data = readData();
  const draft = data.drafts.find((d) => d.slug === req.params.slug);
  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  if (draft.status !== 'ready') return res.status(400).json({ error: 'Draft not ready' });

  const slug = draft.slug;
  const srcDir = join(DRAFTS_DIR, slug);
  const postPath = join(srcDir, 'post.md');
  if (!existsSync(postPath)) return res.status(400).json({ error: 'No post.md' });

  // 1. Process assets if not done
  await processDraftAssets(DRAFTS_DIR, slug);

  // 2. Copy processed images to src/images/blog/[slug]/
  const imgDest = resolve('src/images/blog', slug);
  if (!existsSync(imgDest)) mkdirSync(imgDest, { recursive: true });
  const webDir = join(srcDir, 'images', 'web');
  if (existsSync(webDir)) {
    for (const f of readdirSync(webDir)) {
      copyFileSync(join(webDir, f), join(imgDest, f));
    }
  }

  // 3. Read post, rewrite image paths to final locations
  let post = readFileSync(postPath, 'utf-8');
  // Rewrite video extensions in markdown to .mp4
  post = post.replace(/(!\[[^\]]*\]\([^)]*)\.(?:AVI|MOV|avi|mov)(\))/g, '$1.mp4$2');
  // Rewrite image extensions to lowercase .jpg (sharp outputs lowercase)
  post = post.replace(
    /(!\[[^\]]*\]\([^)]*)\.(?:JPG|JPEG|PNG|GIF|WEBP)(\))/g,
    (m, pre, post) => `${pre}.jpg${post}`,
  );
  // Also fix frontmatter image: field
  post = post.replace(/(image:\s*\/[^\n]*)\.(?:JPG|JPEG|PNG|GIF|WEBP)/g, '$1.jpg');
  // Resolve hero.jpg placeholder to actual first image in post body
  const heroPlaceholder = post.match(/image:\s*\/[^\n]*hero\.jpg/);
  if (heroPlaceholder) {
    const firstImg = post.match(/!\[[^\]]*\]\(\/images\/blog\/[^)]+\)/);
    if (firstImg) {
      const imgPath = firstImg[0].match(/\(([^)]+)\)/)[1];
      post = post.replace(/image:\s*\/[^\n]*hero\.jpg/, `image: ${imgPath}`);
    }
  }
  // Ensure image path uses lowercase processed filenames
  const finalContentPath = resolve('src/content/b', `${slug}.md`);
  writeFileSync(finalContentPath, post);

  // 4. Update manifest
  const manifestPath = resolve('src/content/b/manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const existing = manifest.posts.findIndex((p) => p.slug === slug);
  const frontmatter = parseFrontmatterServer(post);
  const entry = {
    slug,
    title: frontmatter.title || draft.title,
    description: frontmatter.title || draft.title,
    date: frontmatter.date || `${draft.date}T12:00:00`,
    image: frontmatter.image || null,
    tags: frontmatter.tags || [],
    author: frontmatter.author || 'techninja',
  };
  if (existing > -1) manifest.posts[existing] = entry;
  else manifest.posts.unshift(entry);
  // Sort by date descending
  manifest.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  // 5. Mark complete
  const idx = data.drafts.findIndex((d) => d.slug === slug);
  data.drafts[idx].status = 'complete';
  writeData(data);

  res.json({ success: true, published: slug });
});

/** Simple server-side frontmatter parser */
function parseFrontmatterServer(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  let currentKey = null;
  let arrayValues = null;
  for (const line of match[1].split('\n')) {
    const arrItem = line.match(/^\s+-\s+"?(.+?)"?\s*$/);
    if (arrItem && currentKey) {
      arrayValues.push(arrItem[1]);
      continue;
    }
    if (currentKey && arrayValues) {
      meta[currentKey] = arrayValues;
      arrayValues = null;
    }
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, val] = kv;
    if (!val) {
      currentKey = key;
      arrayValues = [];
    } else {
      currentKey = null;
      meta[key] = val.replace(/^"(.*)"$/, '$1');
    }
  }
  if (currentKey && arrayValues) meta[currentKey] = arrayValues;
  return meta;
}

// Serve draft images — prefer web/ processed version, fall back to raw
draftsRouter.get('/:slug/images/:file', (req, res) => {
  const { slug, file } = req.params;
  const base = join(DRAFTS_DIR, slug, 'images');
  const webDir = join(base, 'web');
  const stem = file.replace(/\.[^.]+$/, '');

  // Try processed extension first (.AVI -> .mp4, .PNG -> .jpg)
  for (const ext of ['.mp4', '.jpg']) {
    const webAlt = join(webDir, stem + ext);
    if (existsSync(webAlt)) return res.sendFile(webAlt, { acceptRanges: true });
  }

  // Try exact match in web/
  const webExact = join(webDir, file);
  if (existsSync(webExact)) return res.sendFile(webExact, { acceptRanges: true });

  // Fall back to raw original
  const rawPath = join(base, file);
  if (existsSync(rawPath)) return res.sendFile(rawPath, { acceptRanges: true });
  res.status(404).end();
});

export default draftsRouter;
