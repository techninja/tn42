#!/usr/bin/env node

/**
 * Convert Instagram data export into media content for tn42.
 * Handles multi-image carousels, videos, and reels.
 *
 * Usage: node scripts/convert-insta.js [--clean]
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, basename, extname } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, '_insta_source');
const POSTS_JSON = resolve(SOURCE, 'your_instagram_activity/media/posts.json');
const REELS_JSON = resolve(SOURCE, 'your_instagram_activity/media/reels.json');
const OUT_CONTENT = resolve(ROOT, 'src/content/media');
const OUT_IMAGES = resolve(ROOT, 'src/assets-media');
const CLEAN = process.argv.includes('--clean');

if (CLEAN) {
  if (existsSync(OUT_CONTENT)) rmSync(OUT_CONTENT, { recursive: true });
  if (existsSync(OUT_IMAGES)) rmSync(OUT_IMAGES, { recursive: true });
}
mkdirSync(OUT_CONTENT, { recursive: true });
mkdirSync(OUT_IMAGES, { recursive: true });

/** Decode Instagram's UTF-8 mojibake in JSON exports. */
function decodeInstaText(str) {
  if (!str) return '';
  try {
    return new TextDecoder().decode(new Uint8Array(str.split('').map((c) => c.charCodeAt(0))));
  } catch {
    return str;
  }
}

/** Extract hashtags from caption text. */
function extractTags(text) {
  const matches = text.match(/#(\w+)/g) || [];
  return matches.map((t) => t.slice(1).toLowerCase());
}

/** Copy a media file, return the output filename. Track hashes to dedup. */
const seenHashes = new Map();
/**
 *
 */
function copyMedia(uri) {
  const srcPath = resolve(SOURCE, uri);
  if (!existsSync(srcPath)) return null;
  const filename = basename(uri);
  const hash = createHash('md5').update(readFileSync(srcPath)).digest('hex');
  if (seenHashes.has(hash)) return seenHashes.get(hash);
  copyFileSync(srcPath, resolve(OUT_IMAGES, filename));
  seenHashes.set(hash, filename);
  return filename;
}

/**
 * Extract additional carousel images from nested dict structure.
 * @param {Array} labelValues
 * @returns {string[]} Additional filenames
 */
function extractCarouselMedia(labelValues) {
  const extra = [];
  for (const lv of labelValues) {
    if (lv.title === 'Media' && !lv.label && Array.isArray(lv.dict)) {
      for (const nested of lv.dict) {
        const nestedDicts = nested.dict || [];
        for (const nd of nestedDicts) {
          if (nd.label === 'Media' && nd.media) {
            for (const m of nd.media) {
              if (m.uri) {
                const f = copyMedia(m.uri);
                if (f) extra.push(f);
              }
            }
          }
        }
      }
    }
  }
  return extra;
}

// --- Main ---

console.log('\n📸 Converting Instagram export → media content\n');

const posts = JSON.parse(readFileSync(POSTS_JSON, 'utf-8'));
const manifest = [];
let copied = 0;
let skipped = 0;

for (const post of posts) {
  const labels = post.label_values || [];
  const mediaLabel = labels.find((l) => l.label === 'Media');
  if (!mediaLabel?.media?.length) {
    skipped++;
    continue;
  }

  const media = mediaLabel.media[0];
  const uri = media.uri;
  const filename = copyMedia(uri);
  if (!filename) {
    skipped++;
    continue;
  }

  const slug = basename(uri, extname(uri));
  const ext = extname(filename);
  const isVideo = ext === '.mp4';
  const caption = decodeInstaText(media.title || '');
  const tags = extractTags(caption);
  const timestamp = media.creation_timestamp || post.timestamp;
  const date = new Date(timestamp * 1000).toISOString().slice(0, 19);

  copied++;

  // Check for carousel/multi-image
  const extraFiles = extractCarouselMedia(labels);
  copied += extraFiles.length;

  const files = [filename, ...extraFiles];
  // Deduplicate by resolved filename (hash-based dedup may return same name)
  const uniqueFiles = [...new Set(files)];

  manifest.push({
    slug,
    files: uniqueFiles,
    caption: caption.replace(/#\w+/g, '').trim(),
    tags,
    date,
    type: isVideo ? 'video' : uniqueFiles.length > 1 ? 'carousel' : 'photo',
  });
}

// --- Import Reels ---

if (existsSync(REELS_JSON)) {
  const reelsData = JSON.parse(readFileSync(REELS_JSON, 'utf-8'));
  const reels = reelsData.ig_reels_media || [];

  for (const reel of reels) {
    for (const media of reel.media || []) {
      const uri = media.uri;
      const filename = copyMedia(uri);
      if (!filename) continue;

      const slug = basename(uri, extname(uri));
      const caption = decodeInstaText(media.title || '');
      const tags = extractTags(caption);
      const timestamp = media.creation_timestamp;
      const date = new Date(timestamp * 1000).toISOString().slice(0, 19);

      copied++;
      manifest.push({
        slug,
        files: [filename],
        caption: caption.replace(/#\w+/g, '').trim(),
        tags,
        date,
        type: 'video',
      });
    }
  }
}

// Sort by date descending
manifest.sort((a, b) => b.date.localeCompare(a.date));

writeFileSync(resolve(OUT_CONTENT, 'manifest.json'), JSON.stringify({ posts: manifest }, null, 2));

const videos = manifest.filter((p) => p.type === 'video').length;
const carousels = manifest.filter((p) => p.type === 'carousel').length;

console.log(`  Posts: ${manifest.length} (${videos} videos, ${carousels} carousels)`);
console.log(`  Files copied: ${copied}`);
console.log(`  Skipped: ${skipped}`);
console.log(`\n✅ Done! Assets at src/assets-media/, manifest at src/content/media/\n`);
