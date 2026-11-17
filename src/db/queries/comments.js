const { db } = require('../connection');

const COMMENT_WITH_USER = 'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id';

/**
 * @description Finds all comments on a task, oldest first, including commenter names.
 * @param {number} taskId - The ID of the task.
 * @returns {Object[]} The comment rows.
 */
function findCommentsByTaskId(taskId) {
  return db.prepare(`${COMMENT_WITH_USER} WHERE c.task_id = ? ORDER BY c.created_at ASC`).all(taskId);
}

/**
 * @description Inserts a comment and returns it with the commenter's name.
 * @param {number} taskId - The ID of the task being commented on.
 * @param {number} userId - The ID of the commenting user.
 * @param {string} body - The comment text.
 * @returns {Object} The newly created comment row.
 */
function insertComment(taskId, userId, body) {
  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, userId, body);
  return db.prepare(`${COMMENT_WITH_USER} WHERE c.id = ?`).get(result.lastInsertRowid);
}

module.exports = { findCommentsByTaskId, insertComment };
