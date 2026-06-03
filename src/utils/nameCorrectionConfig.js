/**
 * Name correction config — replacement patterns and helpers.
 * @module utils/nameCorrectionConfig
 */

const INFO_URL = '/users/sylvia';

/** Wrap corrected name in the tooltip component markup. */
export function corrected(newText) {
  return `<span class="nc" tabindex="0"><span class="nc__name">${newText}</span><span class="nc__tip">Sylvia transitioned to Zeph (he/him) in 2016 <a href="${INFO_URL}">Learn more</a></span></span>`;
}

/** @type {Array<{pattern: RegExp, replacement: string | Function}>} */
export const CORRECTIONS = [
  { pattern: /\bSylvia's\b/g, replacement: () => corrected("Zeph's") },
  { pattern: /\bSylvia\b/g, replacement: () => corrected('Zeph') },
  { pattern: /\b([Mm]y) daughter\b/g, replacement: (_, my) => corrected(`${my} kid`) },
  { pattern: /\bher\b/g, replacement: () => corrected('his') },
  { pattern: /\bHer\b/g, replacement: () => corrected('His') },
  { pattern: /\bshe\b/g, replacement: () => corrected('he') },
  { pattern: /\bShe\b/g, replacement: () => corrected('He') },
];
