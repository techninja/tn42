#!/usr/bin/env node

/**
 * Convert legacy Drupal 6 HTTrack'd HTML into markdown with frontmatter.
 * Outputs to _converted/ for validation before committing to src/content/.
 *
 * Usage: node scripts/convert-legacy.js [--clean]
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const LEGACY = resolve(ROOT, '_legacy-import');
const OUT = resolve(ROOT, '_converted');
const CLEAN = process.argv.includes('--clean');

if (CLEAN && existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });

// --- Helpers ---

/** Decode HTML entities. */
function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&raquo;/g, '»')
    .replace(/&laquo;/g, '«')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…');
}

/** Strip HTML tags, collapse whitespace. */
function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract title from h2title div or h2.title. */
function extractTitle(html) {
  const m = html.match(/<div id="h2title"><h2[^>]*>(.*?)<\/h2><\/div>/);
  if (m) return decodeEntities(stripTags(m[1]));
  const m2 = html.match(/<h2 class="title"><a[^>]*>(.*?)<\/a><\/h2>/);
  if (m2) return decodeEntities(stripTags(m2[1]));
  return null;
}

/** Extract submitted date + author. */
function extractMeta(html) {
  const m = html.match(/<div class="submitted">\s*(.*?)\s*<\/div>/s);
  if (!m) return { date: null, author: null };
  const text = stripTags(m[1]);
  // "Wed, 06/15/2011 - 8:51pm by TechNinja"
  const dm = text.match(/(\w+, \d{2}\/\d{2}\/\d{4} - \d+:\d+\w+)\s+by\s+(\w+)/);
  if (dm) return { date: parseDate(dm[1]), author: dm[2].toLowerCase() };
  return { date: null, author: null };
}

/** Parse Drupal date format into ISO. */
function parseDate(str) {
  // "Wed, 06/15/2011 - 8:51pm"
  const m = str.match(/(\d{2})\/(\d{2})\/(\d{4}) - (\d+):(\d+)(am|pm)/);
  if (!m) return null;
  const [, month, day, year, hourStr, min, ampm] = m;
  let hour = parseInt(hourStr);
  if (ampm === 'pm' && hour !== 12) hour += 12;
  if (ampm === 'am' && hour === 12) hour = 0;
  return `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${min}:00`;
}

/** Extract primary image — first lightbox/imagecache image in the post. */
function extractImage(html) {
  // Try teaser thumb first (that's what showed on homepage)
  let m = html.match(/imagecache[^>]*><img src="([^"]+)"/);
  if (m) return normalizeImagePath(m[1]);
  // Try first lightbox image
  m = html.match(/rel="lightbox\[field_image\][^"]*"[^>]*><img src="([^"]+)"/);
  if (m) return normalizeImagePath(m[1]);
  return null;
}

/** Extract tags from taxonomy links. */
function extractTags(html) {
  const tagSection = html.match(/<strong[^>]*>Tags:<\/strong>(.*?)(?:<\/div>|$)/s);
  if (!tagSection) return [];
  const tags = [];
  const re = /rel="tag"[^>]*>(.*?)<\/a>/g;
  let m;
  while ((m = re.exec(tagSection[1]))) tags.push(decodeEntities(stripTags(m[1])));
  return tags;
}

/** Extract main content div and convert to markdown. */
function extractContent(html) {
  // Primary: grab content div up to the links-readmore footer
  const m = html.match(
    /<div class="content">(.*?)<\/div>\s*<\/div>\s*<div class="links-readmore"/s,
  );
  if (m) return htmlToMarkdown(m[1]);

  // Fallback: content div closed by node wrapper
  const m2 = html.match(/<div class="content">(.*?)<\/div>\s*<\/div>\s*<\/div>/s);
  if (m2) return htmlToMarkdown(m2[1]);

  return '';
}

/** Convert HTML content to markdown. */
function htmlToMarkdown(html) {
  let md = html;

  // Images with lightbox → markdown images
  md = md.replace(
    /<div class="blog_img_[rlc]">\s*<a[^>]*href="([^"]*)"[^>]*rel="lightbox\[field_image\]\[([^\]]*)\]"[^>]*>.*?<\/a>\s*<\/div>/gs,
    (_, href, alt) => {
      const src = normalizeImagePath(href);
      return `\n\n![${decodeEntities(alt)}](${src})\n\n`;
    },
  );

  // Gallery image fields
  md = md.replace(
    /<a[^>]*href="([^"]*)"[^>]*rel="lightbox\[field_image\]\[([^\]]*)\]"[^>]*>.*?<\/a>/gs,
    (_, href, alt) => {
      const src = normalizeImagePath(href);
      return `![${decodeEntities(alt)}](${src})`;
    },
  );

  // Standalone images
  md = md.replace(
    /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]* ?\/?>/g,
    (_, src, alt) => `![${decodeEntities(alt)}](${normalizeImagePath(src)})`,
  );

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gs, (_, href, text) => {
    const t = stripTags(text);
    if (!t) return '';
    return `[${t}](${href})`;
  });

  // Bold / italic / em / strong
  md = md.replace(/<(strong|b)>(.*?)<\/\1>/gs, '**$2**');
  md = md.replace(/<(em|i)>(.*?)<\/\1>/gs, '*$2*');

  // Paragraphs
  md = md.replace(/<p>/g, '\n\n');
  md = md.replace(/<\/p>/g, '');

  // Line breaks
  md = md.replace(/<br\s*\/?>/g, '\n');

  // Lists
  md = md.replace(/<li[^>]*>/g, '- ');
  md = md.replace(/<\/li>/g, '\n');
  md = md.replace(/<\/?[ou]l[^>]*>/g, '\n');

  // Headings
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1');

  // iframes (preserve as HTML)
  // already fine as-is

  // Strip field wrappers (gallery image containers)
  md = md.replace(/<div class="field[^>]*>\s*/g, '');
  md = md.replace(/<div[^>]*>/g, '');
  md = md.replace(/<\/div>/g, '');
  md = md.replace(/<span[^>]*>(.*?)<\/span>/gs, '$1');
  md = md.replace(/<\/?[^>]+>/g, '');

  // Clean up leading/trailing whitespace on image lines
  md = md.replace(/^[ \t]+(!\[)/gm, '$1');

  // Decode entities
  md = decodeEntities(md);

  // Collapse excessive newlines
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

/** Normalize image paths to serve from /images/. */
function normalizeImagePath(href) {
  // Strip ../../ prefixes
  let path = href.replace(/^(\.\.\/)+/, '/');
  // Map imagecache paths to full-size originals in /images/
  path = path.replace(/\/sites\/default\/files\/imagecache\/[^/]+\/content_images\//, '/images/');
  // Map direct content_images paths
  path = path.replace(/\/sites\/default\/files\/content_images\//, '/images/');
  return path;
}

/** Build YAML frontmatter. */
function frontmatter(data) {
  const lines = ['---'];
  lines.push(`title: "${data.title.replace(/"/g, '\\"')}"`);
  if (data.date) lines.push(`date: ${data.date}`);
  if (data.author) lines.push(`author: ${data.author}`);
  if (data.slug) lines.push(`slug: ${data.slug}`);
  if (data.type) lines.push(`type: ${data.type}`);
  if (data.image) lines.push(`image: ${data.image}`);
  if (data.tags?.length) {
    lines.push(`tags:`);
    data.tags.forEach((t) => lines.push(`  - "${t}"`));
  }
  lines.push('---');
  return lines.join('\n');
}

// --- Convert blog posts (b/) ---

/**
 *
 */
function convertBlogPosts() {
  const blogDir = resolve(LEGACY, 'b');
  if (!existsSync(blogDir)) return;

  const outDir = resolve(OUT, 'b');
  mkdirSync(outDir, { recursive: true });

  const slugs = readdirSync(blogDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let converted = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const htmlPath = resolve(blogDir, slug, 'index.html');
    if (!existsSync(htmlPath)) {
      skipped++;
      continue;
    }

    const html = readFileSync(htmlPath, 'utf-8');
    const title = extractTitle(html) || slug;
    const { date, author } = extractMeta(html);
    const tags = extractTags(html);
    const image = extractImage(html);
    const content = extractContent(html);

    if (!content && !title) {
      skipped++;
      continue;
    }

    const fm = frontmatter({ title, date, author, slug, type: 'blog', tags, image });
    const md = `${fm}\n\n${content}\n`;

    writeFileSync(resolve(outDir, `${slug}.md`), md);
    converted++;
  }

  console.log(`  blog posts: ${converted} converted, ${skipped} skipped`);
}

// --- Convert gallery posts (g/) ---

/**
 *
 */
function convertGalleryPosts() {
  const galDir = resolve(LEGACY, 'g');
  if (!existsSync(galDir)) return;

  const outDir = resolve(OUT, 'g');
  mkdirSync(outDir, { recursive: true });

  const slugs = readdirSync(galDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let converted = 0;

  for (const slug of slugs) {
    const htmlPath = resolve(galDir, slug, 'index.html');
    if (!existsSync(htmlPath)) continue;

    const html = readFileSync(htmlPath, 'utf-8');
    const title = extractTitle(html) || slug;
    const { date, author } = extractMeta(html);
    const tags = extractTags(html);
    const image = extractImage(html);
    const content = extractContent(html);

    const fm = frontmatter({ title, date, author, slug, type: 'gallery', tags, image });
    const md = `${fm}\n\n${content}\n`;

    writeFileSync(resolve(outDir, `${slug}.md`), md);
    converted++;
  }

  console.log(`  gallery posts: ${converted} converted`);
}

// --- Convert user profiles (users/) ---

/**
 *
 */
function convertUserProfiles() {
  const usersDir = resolve(LEGACY, 'users');
  if (!existsSync(usersDir)) return;

  const outDir = resolve(OUT, 'users');
  mkdirSync(outDir, { recursive: true });

  const users = readdirSync(usersDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const user of users) {
    const htmlPath = resolve(usersDir, user, 'index.html');
    if (!existsSync(htmlPath)) continue;

    const html = readFileSync(htmlPath, 'utf-8');
    const title = extractTitle(html) || user;

    // Extract profile bio
    const profileMatch = html.match(/<div class="profile">(.*?)<\/div>\s*<\/div>/s);
    const bio = profileMatch ? htmlToMarkdown(profileMatch[1]) : '';

    const fm = frontmatter({ title, slug: user, type: 'user', tags: [] });
    const md = `${fm}\n\n${bio}\n`;

    writeFileSync(resolve(outDir, `${user}.md`), md);
  }

  console.log(`  user profiles: ${users.length} converted`);
}

// --- Generate URI map ---

/**
 *
 */
function generateUriMap() {
  // Map old URIs to new content paths for routing validation
  const map = {};

  // Blog posts: /b/slug → /b/slug
  const blogDir = resolve(OUT, 'b');
  if (existsSync(blogDir)) {
    for (const f of readdirSync(blogDir)) {
      const slug = f.replace('.md', '');
      map[`/b/${slug}/`] = `b/${slug}.md`;
    }
  }

  // Gallery: /g/slug → /g/slug
  const galDir = resolve(OUT, 'g');
  if (existsSync(galDir)) {
    for (const f of readdirSync(galDir)) {
      const slug = f.replace('.md', '');
      map[`/g/${slug}/`] = `g/${slug}.md`;
    }
  }

  // Users: /users/name → /users/name
  const usersDir = resolve(OUT, 'users');
  if (existsSync(usersDir)) {
    for (const f of readdirSync(usersDir)) {
      const slug = f.replace('.md', '');
      map[`/users/${slug}/`] = `users/${slug}.md`;
    }
  }

  // Programmatic pages we skip (tag listings, taxonomy, pagination)
  const skipped = [];
  if (existsSync(resolve(LEGACY, 't'))) {
    for (const d of readdirSync(resolve(LEGACY, 't'), { withFileTypes: true })) {
      if (d.isDirectory()) skipped.push(`/t/${d.name}/`);
    }
  }
  if (existsSync(resolve(LEGACY, 'category'))) skipped.push('/category/tags/*');
  if (existsSync(resolve(LEGACY, 'taxonomy'))) skipped.push('/taxonomy/term/*');
  if (existsSync(resolve(LEGACY, 'blogs'))) skipped.push('/blogs/*');

  const output = {
    contentRoutes: map,
    programmaticSkipped: skipped,
    stats: {
      contentPages: Object.keys(map).length,
      skippedProgrammatic: skipped.length,
    },
  };

  writeFileSync(resolve(OUT, 'uri-map.json'), JSON.stringify(output, null, 2));
  console.log(
    `  URI map: ${output.stats.contentPages} routes, ${output.stats.skippedProgrammatic} programmatic skipped`,
  );
}

// --- Main ---

console.log('\n🔄 Converting legacy Drupal content → markdown\n');
console.log(`  Source: ${LEGACY}`);
console.log(`  Output: ${OUT}\n`);

convertBlogPosts();
convertGalleryPosts();
convertUserProfiles();
generateUriMap();

console.log(`\n✅ Done! Check _converted/ for output.\n`);
