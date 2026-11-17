const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../config/constants');

/**
 * @description Converts a date string to an ISO 8601 string.
 *
 * @param {string} dateStr - The date string to convert.
 * @returns {string|null} The ISO 8601 string, or null if the input is empty or invalid.
 */
function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * @description Converts a string to a lowercase, hyphen-separated URL slug.
 *
 * @param {string} str - The string to slugify.
 * @returns {string} The slugified string.
 */
function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

/**
 * @description Truncates a string to a maximum length, appending an ellipsis if shortened.
 *
 * @param {string} str - The string to truncate.
 * @param {number} len - The maximum number of characters to keep before the ellipsis.
 * @returns {string} The original value if falsy or within length, otherwise the truncated string with '...' appended.
 */
function truncate(str, len) {
  if (!str || str.length <= len) return str;
  return str.slice(0, len) + '...';
}

/**
 * @description Checks whether a value looks like a valid email address.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email matches the expected format, otherwise false.
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * @description Checks whether a value is a string containing non-whitespace characters.
 *
 * @param {*} val - The value to check.
 * @returns {boolean} True if the value is a non-empty, non-blank string, otherwise false.
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * @description Builds pagination metadata for a paged response.
 *
 * @param {number} total - The total number of items.
 * @param {number} page - The current page number.
 * @param {number} pageSize - The number of items per page.
 * @returns {{total: number, page: number, pageSize: number, totalPages: number}} The pagination metadata.
 */
function buildPaginationMeta(total, page, pageSize) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * @description Parses a base-10 integer, returning a fallback when parsing fails.
 *
 * @param {*} val - The value to parse.
 * @param {number} fallback - The value to return if parsing yields NaN.
 * @returns {number} The parsed integer, or the fallback.
 */
function parseIntSafe(val, fallback) {
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}

/**
 * @description Builds a standard error response body.
 *
 * @param {string} message - The error message.
 * @param {string|number} code - The error code.
 * @returns {{error: string, code: (string|number)}} The error object.
 */
function formatError(message, code) {
  return { error: message, code };
}

/**
 * @description Converts page and page size inputs into SQL limit and offset values, defaulting the page to 1 and capping the size at MAX_PAGE_SIZE.
 *
 * @param {number|string} page - The 1-based page number.
 * @param {number|string} pageSize - The requested number of items per page.
 * @returns {{limit: number, offset: number}} The limit and offset to use in a query.
 */
function paginate(page, pageSize) {
  const p = Math.max(1, parseInt(page) || 1);
  const ps = Math.min(MAX_PAGE_SIZE, parseInt(pageSize) || DEFAULT_PAGE_SIZE);
  return { limit: ps, offset: (p - 1) * ps };
}

/**
 * @description Creates an Error carrying an HTTP status code.
 *
 * @param {number} status - The HTTP status code.
 * @param {string} message - The error message.
 * @returns {Error & {status: number}} The error with a status property.
 */
function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * @description Checks whether an error is a database UNIQUE constraint violation.
 *
 * @param {Error} err - The error to inspect.
 * @returns {boolean} True if the error message indicates a UNIQUE violation, otherwise false.
 */
function isUniqueViolation(err) {
  return Boolean(err && err.message && err.message.includes('UNIQUE'));
}

module.exports = {
  formatDate,
  slugify,
  truncate,
  validateEmail,
  isNonEmptyString,
  buildPaginationMeta,
  parseIntSafe,
  formatError,
  paginate,
  createHttpError,
  isUniqueViolation
};
