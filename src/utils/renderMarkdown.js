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

  // YouTube embeds: ![youtube](VIDEO_ID) or ![youtube](full_url)
  md = md.replace(
    /!\[youtube\]\((?:https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/))?([\w-]+)\)/g,
    '\n\n<iframe src="https://www.youtube.com/embed/$1" width="100%" height="400" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border:none; border-radius:8px;"></iframe>\n\n',
  );

  const html = md
    // Headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      if (/\.(mp4|webm|mov|avi)$/i.test(src)) {
        const webSrc = src.replace(/\.[^.]+$/, '.mp4');
        return `<figure class="post-media-figure"><video src="${webSrc}" controls preload="metadata"></video>${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
      }
      if (alt) {
        return `<figure class="post-media-figure"><img src="${src}" alt="${alt}" loading="lazy" /><figcaption>${alt}</figcaption></figure>`;
      }
      return `<img src="${src}" alt="" loading="lazy" />`;
    })
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/(?<![\w])_(.+?)_(?![\w])/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Unordered lists — wrap consecutive items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m.trim()}</ul>`)
    // Paragraphs: split on double newlines
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|li|img|iframe|div|ul|ol|figure)/.test(block)) return block;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}
