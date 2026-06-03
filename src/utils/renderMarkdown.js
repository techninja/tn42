/**
 * Minimal markdown → HTML renderer. No deps, handles the subset we use.
 * @module utils/renderMarkdown
 */

/**
 * @param {string} md
 * @returns {string}
 */
export function renderMarkdown(md) {
  // Normalize line endings
  md = md.replace(/\r\n/g, '\n');

  // Ensure headings are always their own block (insert blank lines around them)
  md = md.replace(/^(#{1,4} .+)$/gm, '\n\n$1\n\n');

  // Ensure iframes are their own block
  md = md.replace(/(<iframe[\s\S]*?<\/iframe>)/g, '\n\n$1\n\n');

  let html = md
    // Headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Paragraphs: split on double newlines
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|li|img|iframe|div|ul|ol)/.test(block)) return block;
      if (block.includes('<li>')) return `<ul>${block}</ul>`;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}
