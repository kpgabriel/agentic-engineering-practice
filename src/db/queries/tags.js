const { db } = require('../connection');

/**
 * @description Finds all tags ordered by name.
 * @returns {Object[]} The tag rows.
 */
function findAllTags() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

/**
 * @description Finds a single tag by its ID.
 * @param {number} id - The tag ID.
 * @returns {Object|undefined} The tag row, or undefined if not found.
 */
function findTagById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

/**
 * @description Inserts a new tag and returns it.
 * @param {string} name - The tag name.
 * @returns {Object} The newly created tag row.
 */
function insertTag(name) {
  const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
  return findTagById(result.lastInsertRowid);
}

/**
 * @description Associates a tag with a task.
 * @param {number} taskId - The task ID.
 * @param {number} tagId - The tag ID.
 * @returns {void} Nothing.
 */
function insertTaskTag(taskId, tagId) {
  db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
}

/**
 * @description Removes a tag association from a task.
 * @param {number} taskId - The task ID.
 * @param {number} tagId - The tag ID.
 * @returns {number} The number of rows deleted.
 */
function deleteTaskTag(taskId, tagId) {
  return db.prepare('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?').run(taskId, tagId).changes;
}

module.exports = { findAllTags, findTagById, insertTag, insertTaskTag, deleteTaskTag };
