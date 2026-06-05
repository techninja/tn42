/**
 * Maps entity status/priority values to badge colors and display titles.
 * @module utils/statusColors
 */

/** @type {string[]} */
export const STATUS_OPTIONS = ['draft', 'needs-images', 'review', 're-review', 'ready', 'complete'];

/** @type {Record<string, string>} */
const DRAFT_COLORS = {
  draft: '#888',
  'needs-images': '#e67e22',
  review: '#3498db',
  're-review': '#e74c3c',
  ready: '#9b59b6',
  complete: '#27ae60',
};

/** @type {Record<string, 'info'|'success'|'warning'|'danger'>} */
const STATUS_COLORS = {
  active: 'success',
  archived: 'info',
  todo: 'info',
  doing: 'warning',
  done: 'success',
};

/** @type {Record<string, string>} */
const STATUS_TITLES = {
  active: 'Active',
  archived: 'Archived',
  todo: 'To Do',
  doing: 'In Progress',
  done: 'Done',
};

/** @type {Record<string, 'info'|'success'|'warning'|'danger'>} */
const PRIORITY_COLORS = {
  low: 'info',
  med: 'warning',
  high: 'danger',
};

/** @type {Record<string, string>} */
const PRIORITY_TITLES = {
  low: 'Low',
  med: 'Medium',
  high: 'High',
};

/**
 * @param {string} status
 * @returns {'info'|'success'|'warning'|'danger'}
 */
export const statusColor = (status) => DRAFT_COLORS[status] || STATUS_COLORS[status] || 'info';

/**
 * @param {string} status
 * @returns {string}
 */
export const statusTitle = (status) => STATUS_TITLES[status] || status;

/**
 * @param {string} priority
 * @returns {'info'|'success'|'warning'|'danger'}
 */
export const priorityColor = (priority) => PRIORITY_COLORS[priority] || 'info';

/**
 * @param {string} priority
 * @returns {string}
 */
export const priorityTitle = (priority) => PRIORITY_TITLES[priority] || priority;
