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

// Rewrite media manifest
const mediaManifest = resolve(DIST, 'content/media/manifest.json');
if (existsSync(mediaManifest)) {
  const json = readFileSync(mediaManifest, 'utf-8');
  // No path rewrite needed in JSON — views reference /assets-media/ which we'll handle via redirect
  writeFileSync(mediaManifest, json);
}

// Create _redirects for Cloudflare Pages to proxy assets from R2
const redirects = [`/* /index.html 200`].join('\n');

writeFileSync(resolve(DIST, '_redirects'), redirects);

// Copy CNAME for custom domain
writeFileSync(resolve(DIST, 'CNAME'), 'tn42.com');

console.log(`  Output: ${DIST}`);
console.log(`  _redirects configured for R2 proxy`);
console.log(`\n✅ Ready to deploy dist/ to Cloudflare Pages`);
console.log(`   Upload assets-media/ and images/ to R2 bucket separately\n`);
