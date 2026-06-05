/**
 * Parse YAML frontmatter from markdown string.
 * @module utils/parseFrontmatter
 */

/**
 * @param {string} raw
 * @returns {{ meta: Record<string, unknown>, content: string }}
 */
export function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: /** @type {Record<string, unknown>} */ ({}), content: raw };

  /** @type {Record<string, unknown>} */
  const meta = {};
  let currentKey = null;
  let arrayValues = null;

  for (const line of match[1].split('\n')) {
    const arrItem = line.match(/^\s+-\s+["']?(.+?)["']?\s*$/);
    if (arrItem && currentKey) {
      arrayValues.push(arrItem[1].replace(/^'+|'+$/g, ''));
      continue;
    }
    if (currentKey && arrayValues) {
      meta[currentKey] = arrayValues;
      arrayValues = null;
    }
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, val] = kv;
    if (!val) {
      currentKey = key;
      arrayValues = [];
    } else {
      currentKey = null;
      meta[key] = val.replace(/^["']+|["']+$/g, '');
    }
  }
  if (currentKey && arrayValues) meta[currentKey] = arrayValues;

  return { meta, content: match[2] };
}
