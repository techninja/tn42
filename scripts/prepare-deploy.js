#!/usr/bin/env node

/**
 * Prepare deploy — rewrites asset paths to point to R2 CDN subdomain.
 * Run before `npm run build` for production deploy.
 *
 * Usage: node scripts/prepare-deploy.js
 *
 * This:
 * 1. Rewrites manifest.json paths from /assets-media/ → DATA_URL
 * 2. Rewrites /images/ paths → DATA_URL/images/
 * 3. Copies src/ to dist/ (minus the heavy asset folders)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = resolve(ROOT, 'dist');
const DATA_URL = process.env.DATA_URL || 'https://data.tn42.com';

console.log('\n🚀 Preparing deploy\n');
console.log(`  CDN base: ${DATA_URL}`);

// Clean and copy src to dist (excluding heavy media)
if (existsSync(DIST)) rmSync(DIST, { recursive: true });
cpSync(resolve(ROOT, 'src'), DIST, {
  recursive: true,
  filter: (src) => {
    // Skip heavy asset folders — these go to R2
    if (src.includes('/assets-media')) return false;
    if (src.includes('/images/') && !src.endsWith('/images/default.svg')) return false;
    // Skip server (not needed for static deploy)
    if (src.endsWith('/server.js')) return false;
    return true;
  },
});

// Keep default.svg for posts without images
mkdirSync(resolve(DIST, 'images'), { recursive: true });
cpSync(resolve(ROOT, 'src/images/default.svg'), resolve(DIST, 'images/default.svg'));

// Rewrite blog manifest image paths to absolute CDN URLs for OG build
const blogManifest = resolve(DIST, 'content/b/manifest.json');
const srcBlogManifest = resolve(ROOT, 'src/content/b/manifest.json');
if (existsSync(blogManifest)) {
  let json = readFileSync(blogManifest, 'utf-8');
  json = json.replace(/"image": "\/images\//g, `"image": "${DATA_URL}/images/`);
  writeFileSync(blogManifest, json);
  // Also rewrite src/ manifest so OG build picks up absolute URLs
  writeFileSync(srcBlogManifest, json);
}

// Rewrite media manifest — add absolute image URLs for OG
const mediaManifest = resolve(DIST, 'content/media/manifest.json');
const srcMediaManifest = resolve(ROOT, 'src/content/media/manifest.json');
if (existsSync(mediaManifest)) {
  const data = JSON.parse(readFileSync(mediaManifest, 'utf-8'));
  data.posts = data.posts.map((p) => ({
    ...p,
    image: p.type !== 'video' ? `${DATA_URL}/assets-media/${p.files[0]}` : null,
  }));
  const json = JSON.stringify(data, null, 2);
  writeFileSync(mediaManifest, json);
  writeFileSync(srcMediaManifest, json);
}

// Create _redirects for Cloudflare Pages to proxy assets from R2
const redirects = [`/* /index.html 200`].join('\n');

// OG metadata pages (HTML shells for crawlers)
console.log('\n→ Generating OG metadata pages...');
const { buildOG } = await import('@techninja/clearstack/lib/build-og.js');
buildOG({ projectDir: ROOT, outDir: 'dist', baseUrl: 'https://tn42.com' });

console.log('→ Generating sitemap...');
const { buildSitemap } = await import('@techninja/clearstack/lib/build-sitemap.js');
buildSitemap({ projectDir: ROOT, outDir: 'dist', baseUrl: 'https://tn42.com' });

// OG images built and synced to R2 separately via: node scripts/build-og-images.js

console.log('\n→ Injecting modulepreload hints...');
const { buildModulePreload } = await import('@techninja/clearstack/lib/build-modulepreload.js');
buildModulePreload({ projectDir: ROOT, outDir: 'dist' });

writeFileSync(resolve(DIST, '_redirects'), redirects);

// Copy CNAME for custom domain
writeFileSync(resolve(DIST, 'CNAME'), 'tn42.com');

console.log(`  Output: ${DIST}`);
console.log(`  _redirects configured for R2 proxy`);
console.log(`\n✅ Ready to deploy dist/ to Cloudflare Pages`);
console.log(`   Upload assets-media/ and images/ to R2 bucket separately\n`);
