/**
 * CDN config — resolves asset URLs based on environment.
 * Local dev serves from express, production proxies to R2.
 * @module config/cdn
 */

const isProduction = globalThis.location?.hostname === 'tn42.com';
export const CDN = isProduction ? 'https://data.tn42.com' : '';

/** Prefix an asset path with the CDN base. */
export function asset(path) {
  if (!path || path.startsWith('http')) return path;
  return `${CDN}${path}`;
}
