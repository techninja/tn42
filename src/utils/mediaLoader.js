/**
 * Media data loader — caches manifest and resolves posts with nav context.
 * @module utils/mediaLoader
 */

let allPosts = null;

/** Load and cache all media posts from manifest. */
export async function loadAllMedia() {
  if (allPosts) return allPosts;
  const res = await fetch('/content/media/manifest.json');
  const { posts } = await res.json();
  allPosts = posts;
  return posts;
}

/**
 * Load a single media post with prev/next/related context.
 * @param {string} slug
 */
export async function loadMediaPost(slug) {
  const posts = await loadAllMedia();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { post: false };
  const post = posts[idx];
  const prev = idx < posts.length - 1 ? posts[idx + 1] : null;
  const next = idx > 0 ? posts[idx - 1] : null;
  const related = post.tags.length
    ? posts.filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t))).slice(0, 6)
    : [];
  return { post, prev, next, related };
}
