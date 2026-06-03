/**
 * Name correction transform — replaces deadname references in rendered HTML
 * with corrected name styled with trans flag colors + hover tooltip.
 * Also corrects alt attributes with plain text for screen readers.
 * Frontend-only: does not modify source markdown files.
 * @module utils/nameCorrection
 */

const INFO_URL = '/users/sylvia';

/**
 * Replace text only outside of HTML tags and outside of nc__tip tooltips.
 * @param {string} html
 * @param {RegExp} pattern
 * @param {string|function} replacement
 * @returns {string}
 */
function replaceTextOnly(html, pattern, replacement) {
  // Split out tooltip spans entirely — never touch their content
  const parts = html.split(/(<span class="nc__tip">.*?<\/span>)/g);
  return parts.map((chunk) => {
    // Skip tooltip content
    if (chunk.startsWith('<span class="nc__tip">')) return chunk;
    // For remaining chunks, only replace in text nodes (not inside tags)
    const segments = chunk.split(/(<[^>]+>)/);
    return segments.map((seg) => {
      if (seg.startsWith('<')) return seg;
      pattern.lastIndex = 0;
      return seg.replace(pattern, replacement);
    }).join('');
  }).join('');
}

/**
 * Replace names inside alt attributes with plain text (screen-reader friendly).
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

/** Wrap corrected name in the tooltip component markup. */
function corrected(newText) {
  return `<span class="nc" tabindex="0"><span class="nc__name">${newText}</span><span class="nc__tip">Sylvia transitioned to Zeph (he/him) in 2016 <a href="${INFO_URL}">Learn more</a></span></span>`;
}

/** @type {Array<{ pattern: RegExp, replacement: string|function }>} */
const CORRECTIONS = [
  {
    pattern: /\bSylvia's\b/g,
    replacement: () => corrected("Zeph's"),
  },
  {
    pattern: /\bSylvia\b/g,
    replacement: () => corrected('Zeph'),
  },
  {
    pattern: /\b([Mm]y) daughter\b/g,
    replacement: (_, my) => corrected(`${my} kid`),
  },
  {
    pattern: /\bher\b/g,
    replacement: () => corrected('his'),
  },
  {
    pattern: /\bHer\b/g,
    replacement: () => corrected('His'),
  },
  {
    pattern: /\bshe\b/g,
    replacement: () => corrected('he'),
  },
  {
    pattern: /\bShe\b/g,
    replacement: () => corrected('He'),
  },
];

/**
 * Apply name/pronoun corrections to rendered HTML.
 * @param {string} html - Rendered HTML string
 * @param {object} meta - Post frontmatter metadata
 * @returns {string} Corrected HTML
 */
export function applyNameCorrection(html, meta) {
  const isRelevant =
    meta?.author === 'sylvia' ||
    meta?.tags?.some((t) => t.toLowerCase().includes('sylvia')) ||
    html.includes('Sylvia');

  if (!isRelevant) return html;

  let result = html;

  // First: plain-text corrections inside alt attributes
  result = replaceInAlts(result);

  // Then: rich corrections in text nodes (skips tooltips)
  for (const { pattern, replacement } of CORRECTIONS) {
    result = replaceTextOnly(result, pattern, replacement);
  }

  return result;
}

/**
 * Correct a plain text string (for titles, tags, etc). No HTML output.
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
 * Correct a title with the tooltip markup.
 * @param {string} title
 * @param {object} meta
 * @returns {string} HTML string with corrections or plain title
 */
export function correctTitle(title, meta) {
  const isRelevant =
    meta?.author === 'sylvia' ||
    meta?.tags?.some((t) => t.toLowerCase().includes('sylvia')) ||
    title.includes('Sylvia');

  if (!isRelevant) return title;

  return title
    .replace(/\bSylvia's\b/g, corrected("Zeph's"))
    .replace(/\bSylvia\b/g, corrected('Zeph'));
}

/**
 * Correct a tag name — returns plain text for display.
 * @param {string} tag
 * @returns {string}
 */
export function correctTag(tag) {
  if (tag.toLowerCase() === 'sylvia') return 'zeph';
  if (tag.toLowerCase() === "sylvia's stuff") return "zeph's stuff";
  return tag;
}
