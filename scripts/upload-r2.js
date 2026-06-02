#!/usr/bin/env node

/**
 * Upload media assets to Cloudflare R2 bucket.
 * Requires: wrangler CLI authenticated.
 *
 * Usage: node scripts/upload-r2.js [--bucket=tn42-data]
 */

import { execSync, exec } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const BUCKET = process.argv.find((a) => a.startsWith('--bucket='))?.split('=')[1] || 'tn42-data';
const CONCURRENCY = 10;

const folders = [
  { local: 'src/assets-media', remote: 'assets-media' },
  { local: 'src/images', remote: 'images' },
];

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

/** Upload a single file, returns a promise. */
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

/** Process array in batches of N concurrency. */
async function batch(items, fn, n) {
  let done = 0;
  for (let i = 0; i < items.length; i += n) {
    await Promise.all(items.slice(i, i + n).map(fn));
    done += Math.min(n, items.length - i);
    if (done % 50 === 0 || done === items.length) console.log(`    ${done}/${items.length}`);
  }
}

console.log(`\n☁️  Uploading to R2 bucket: ${BUCKET}\n`);

let total = 0;

for (const { local, remote } of folders) {
  const src = resolve(ROOT, local);
  const files = walkFiles(src);
  console.log(`  ${local}/ → ${remote}/ (${files.length} files, ${CONCURRENCY} concurrent)`);

  const uploads = files.map((filePath) => {
    const key = `${remote}/${relative(src, filePath)}`;
    return { key, filePath };
  });

  await batch(uploads, ({ key, filePath }) => uploadFile(key, filePath), CONCURRENCY);
  total += files.length;
}

console.log(`\n✅ Uploaded ${total} files to ${BUCKET}`);
console.log(`   Configure custom domain: data.tn42.com → ${BUCKET}\n`);
