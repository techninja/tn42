#!/usr/bin/env node

/**
 * Upload media assets to Cloudflare R2 bucket — skips previously uploaded files.
 * Tracks uploads in .r2-uploaded.json (key → size).
 * Requires: wrangler CLI authenticated.
 *
 * Usage: node scripts/upload-r2.js [--bucket=tn42-data] [--force]
 */

import { exec } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const BUCKET = process.argv.find((a) => a.startsWith('--bucket='))?.split('=')[1] || 'tn42-data';
const FORCE = process.argv.includes('--force');
const CONCURRENCY = 10;
const TRACKER = resolve(ROOT, '.r2-uploaded.json');

const folders = [
  { local: 'src/assets-media', remote: 'assets-media' },
  { local: 'src/images', remote: 'images' },
];

/** Load upload tracker. */
function loadTracker() {
  if (FORCE || !existsSync(TRACKER)) return {};
  try {
    return JSON.parse(readFileSync(TRACKER, 'utf-8'));
  } catch {
    return {};
  }
}

/** Save upload tracker. */
function saveTracker(data) {
  writeFileSync(TRACKER, JSON.stringify(data, null, 2) + '\n');
}

/** Recursively collect all files in a directory. */
function walkFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkFiles(full));
    else results.push(full);
  }
  return results;
}

/** Upload a single file. */
function uploadFile(key, filePath) {
  return new Promise((res) => {
    exec(
      `npx wrangler r2 object put "${BUCKET}/${key}" --file="${filePath}" --remote`,
      { cwd: ROOT, env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } },
      (err, stdout, stderr) => {
        if (err) console.error(`    ✗ ${key}: ${stderr.trim().split('\n').pop()}`);
        res(!err);
      },
    );
  });
}

/** Process array in batches. */
async function batch(items, fn, n) {
  let done = 0;
  for (let i = 0; i < items.length; i += n) {
    await Promise.all(items.slice(i, i + n).map(fn));
    done += Math.min(n, items.length - i);
    if (done % 50 === 0 || done === items.length) console.log(`    ${done}/${items.length}`);
  }
}

console.log(`\n☁️  Uploading to R2 bucket: ${BUCKET}${FORCE ? ' (--force)' : ''}\n`);

const tracker = loadTracker();
let uploaded = 0;
let skipped = 0;

for (const { local, remote } of folders) {
  const src = resolve(ROOT, local);
  const files = walkFiles(src);

  const toUpload = [];
  for (const filePath of files) {
    const key = `${remote}/${relative(src, filePath)}`;
    const size = statSync(filePath).size;
    if (!FORCE && tracker[key] === size) {
      skipped++;
    } else {
      toUpload.push({ key, filePath, size });
    }
  }

  console.log(
    `  ${local}/ → ${remote}/ (${toUpload.length} new, ${files.length - toUpload.length} skipped)`,
  );

  if (toUpload.length) {
    await batch(
      toUpload,
      async ({ key, filePath, size }) => {
        const ok = await uploadFile(key, filePath);
        if (ok) tracker[key] = size;
      },
      CONCURRENCY,
    );
    uploaded += toUpload.length;
  }
}

saveTracker(tracker);

console.log(`\n✅ Uploaded ${uploaded} files, skipped ${skipped} unchanged`);
if (FORCE) console.log('   (--force used, all files re-uploaded)');
console.log(`   Tracker saved to .r2-uploaded.json\n`);
