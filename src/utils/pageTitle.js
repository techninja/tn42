/**
 * Page title helper — updates document.title with consistent format.
 * @module utils/pageTitle
 */

const SITE_NAME = 'tn42.com';

/**
 * Set the page title. Appends site name automatically.
 * @param {string} [title] - Page-specific title. Omit for just site name.
 */
export function setPageTitle(title) {
  document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
}
