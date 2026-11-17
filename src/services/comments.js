const { findTaskById } = require('../db/queries/tasks');
const { findUserById } = require('../db/queries/users');
const { findCommentsByTaskId, insertComment } = require('../db/queries/comments');
const { isNonEmptyString, createHttpError } = require('../utils');

/**
 * @description Throws a 404 error if the task does not exist.
 * @param {number} taskId - The task ID.
 * @returns {void} Nothing.
 */
function assertTaskExists(taskId) {
  if (!findTaskById(taskId)) throw createHttpError(404, 'Task not found');
}

/**
 * @description Lists the comments on an existing task.
 * @param {number} taskId - The task ID.
 * @returns {Object[]} The task's comments.
 */
function listComments(taskId) {
  assertTaskExists(taskId);
  return findCommentsByTaskId(taskId);
}

/**
 * @description Validates input and creates a comment on an existing task.
 * @param {number} taskId - The task ID.
 * @param {Object} [data] - The comment data.
 * @param {number|string} data.user_id - The ID of the commenting user.
 * @param {string} data.body - The comment text.
 * @returns {Object} The created comment.
 */
function createComment(taskId, { user_id, body } = {}) {
  assertTaskExists(taskId);
  if (!body || !isNonEmptyString(body)) throw createHttpError(400, 'body is required');
  if (!user_id) throw createHttpError(400, 'user_id is required');
  if (!findUserById(parseInt(user_id))) throw createHttpError(400, 'user not found');
  return insertComment(taskId, parseInt(user_id), body);
}

module.exports = { listComments, createComment };
