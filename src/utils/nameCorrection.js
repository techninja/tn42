/**
 * Name correction transform — applies corrections to rendered HTML.
 * @module utils/nameCorrection
 */

import { CORRECTIONS, corrected } from '#utils/nameCorrectionConfig.js';

/**
 * @param {string} html
 * @param {RegExp} pattern
 * @param {string | Function} replacement
 * @returns {string}
 */
function replaceTextOnly(html, pattern, replacement) {
  const parts = html.split(/(<span class="nc__tip">.*?<\/span>)/g);
  return parts
    .map((chunk) => {
      if (chunk.startsWith('<span class="nc__tip">')) return chunk;
      const segments = chunk.split(/(<[^>]+>)/);
      return segments
        .map((seg) => {
          if (seg.startsWith('<')) return seg;
          pattern.lastIndex = 0;
          return seg.replace(pattern, /** @type {any} */ (replacement));
        })
        .join('');
    })
    .join('');
}

/**
 * Replace names inside alt attributes with plain text.
 * @param {string} html
 * @returns {string}
 */
function replaceInAlts(html) {
  return html.replace(/alt="([^"]*)"/g, (match, alt) => {
    const fixed = alt
      .replace(/\bSylvia's\b/g, "Zeph's")
      .replace(/\bSylvia\b/g, 'Zeph')
      .replace(/\bher\b/g, 'his')
      .replace(/\bHer\b/g, 'His')
      .replace(/\bshe\b/g, 'he')
      .replace(/\bShe\b/g, 'He')
      .replace(/\b[Mm]y daughter\b/g, 'my kid');
    return `alt="${fixed}"`;
  });
}

/** Check if content is relevant for correction. */
function isRelevant(html, meta) {
  return (
    meta?.author === 'sylvia' ||
    meta?.tags?.some((t) => t.toLowerCase().includes('sylvia')) ||
    html.includes('Sylvia')
  );
}

/**
 * Apply name/pronoun corrections to rendered HTML.
 * @param {string} html
 * @param {object} meta
 * @returns {string}
 */
export function applyNameCorrection(html, meta) {
  if (!isRelevant(html, meta)) return html;
  let result = replaceInAlts(html);
  for (const { pattern, replacement } of CORRECTIONS) {
    result = replaceTextOnly(result, pattern, replacement);
  }
  return result;
}

/**
 * Correct a plain text string (titles, tags). No HTML.
 * @param {string} text
 * @returns {string}
 */
export function correctPlainText(text) {
  return text
    .replace(/\bSylvia's\b/g, "Zeph's")
    .replace(/\bSylvia\b/g, 'Zeph')
    .replace(/\bher\b/g, 'his')
    .replace(/\bHer\b/g, 'His')
    .replace(/\bshe\b/g, 'he')
    .replace(/\bShe\b/g, 'He')
    .replace(/\b[Mm]y daughter\b/g, 'my kid');
}

/**
 * Correct a title with tooltip markup.
 * @param {string} title
 * @param {object} meta
 * @returns {string}
 */
export function correctTitle(title, meta) {
  if (!isRelevant(title, meta)) return title;
  return title
    .replace(/\bSylvia's\b/g, corrected("Zeph's"))
    .replace(/\bSylvia\b/g, corrected('Zeph'));
}

/**
 * Correct a tag name — plain text.
 * @param {string} tag
 * @returns {string}
 */
export function correctTag(tag) {
  if (tag.toLowerCase() === 'sylvia') return 'zeph';
  if (tag.toLowerCase() === "sylvia's stuff") return "zeph's stuff";
  return tag;
}
