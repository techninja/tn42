#!/usr/bin/env node

/**
 * Build and upload OG images to R2 — only regenerates changed content.
 * Tracks last-rendered date per slug in .og-manifest.json.
 * Uploads to R2 bucket under og/ prefix, served from data.tn42.com/og/
 *
 * Usage: node scripts/build-og-images.js [--force] [--dry-run]
 */

import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const ROOT = resolve(import.meta.dirname, '..');
const FORCE = process.argv.includes('--force');
const DRY = process.argv.includes('--dry-run');
const BUCKET = 'tn42-data';
const TRACKER = resolve(ROOT, '.og-manifest.json');
const TMP = resolve(ROOT, '.og-tmp');
const DATA_URL = process.env.DATA_URL || 'https://data.tn42.com';

function loadTracker() {
  if (FORCE || !existsSync(TRACKER)) return {};
  try { return JSON.parse(readFileSync(TRACKER, 'utf-8')); } catch { return {}; }
}

function collectItems() {
  const routes = JSON.parse(readFileSync(resolve(ROOT, 'clearstack.routes.json'), 'utf-8'));
  const items = [];
  for (const [pattern, config] of Object.entries(routes)) {
    if (!pattern.includes(':') || !config.data) continue;
    const [filePart, jsonPath] = config.data.split(':');
    const filePath = resolve(ROOT, filePart);
    if (!existsSync(filePath)) continue;
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
    const data = jsonPath ? jsonPath.split('.').reduce((o, k) => o?.[k], raw) : raw;
    const arr = Array.isArray(data) ? data : Object.entries(data).map(([k, v]) => ({ slug: k, ...v }));
    const paramName = pattern.match(/:(\w+)/)?.[1] || 'id';
    for (const item of arr) {
      const slug = item.slug || item.id || item.sku;
      if (!slug) continue;
      items.push({ slug, date: item.date || '' });
    }
  }
  return items;
}

function walk(dir, base = dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full, base));
    else out.push({ full, key: `og/${relative(base, full)}` });
  }
  return out;
}

async function uploadToR2(key, filePath) {
  try {
    await execAsync(
      `npx wrangler r2 object put "${BUCKET}/${key}" --file="${filePath}" --remote`,
      { cwd: ROOT, env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } },
    );
    return true;
  } catch (e) {
    console.error(`  ✗ ${key}: ${e.message.split('\n').pop()}`);
    return false;
  }
}

console.log(`\n🖼  Building OG images${FORCE ? ' (--force)' : ''}${DRY ? ' (--dry-run)' : ''}\n`);

const tracker = loadTracker();
const items = collectItems();
const toRender = FORCE ? items : items.filter((i) => !tracker[i.slug] || i.date > tracker[i.slug]);

console.log(`  ${toRender.length} to render, ${items.length - toRender.length} up to date\n`);
if (toRender.length === 0) { console.log('✅ Nothing to do.\n'); process.exit(0); }
if (DRY) { for (const i of toRender) console.log(`  would render: ${i.slug}`); process.exit(0); }

mkdirSync(TMP, { recursive: true });

const { buildOGImages } = await import('@techninja/clearstack/lib/build-og-images.js');

const slugSet = new Set(toRender.map((i) => i.slug));
let rendered = 0;
console.log('  Launching Playwright...');
await buildOGImages({
  projectDir: ROOT, outDir: '.og-tmp', siteName: 'tn42',
  filter: (slug) => slugSet.has(slug),
  onProgress: (slug) => console.log(`  [${++rendered}/${toRender.length}] ${slug}`),
});
console.log('');

// Upload to R2
let uploaded = 0;
for (const { full, key } of walk(TMP)) {
  const ok = await uploadToR2(key, full);
  if (ok) {
    const slug = full.split('/').pop().replace('.png', '');
    const item = toRender.find((i) => i.slug === slug);
    if (item) tracker[item.slug] = item.date || new Date().toISOString();
    uploaded++;
    console.log(`  ✓ ${key}`);
  }
}

rmSync(TMP, { recursive: true });
writeFileSync(TRACKER, JSON.stringify(tracker, null, 2) + '\n');
console.log(`\n✅ Uploaded ${uploaded} OG images → ${DATA_URL}/og/\n`);
