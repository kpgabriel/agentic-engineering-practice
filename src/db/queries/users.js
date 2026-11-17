const { db } = require('../connection');

/**
 * @description Finds all users, newest first.
 * @returns {Object[]} The user rows.
 */
function findAllUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

/**
 * @description Finds a single user by ID.
 * @param {number} id - The user ID.
 * @returns {Object|undefined} The user row, or undefined if not found.
 */
function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/**
 * @description Inserts a new user and returns it.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @returns {Object} The newly created user row.
 */
function insertUser(name, email) {
  const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
  return findUserById(result.lastInsertRowid);
}

/**
 * @description Updates a user's name and email and returns the updated row.
 * @param {number} id - The user ID.
 * @param {string} name - The new name.
 * @param {string} email - The new email address.
 * @returns {Object} The updated user row.
 */
function updateUserById(id, name, email) {
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
  return findUserById(id);
}

/**
 * @description Deletes a user by ID.
 * @param {number} id - The user ID.
 * @returns {number} The number of rows deleted.
 */
function deleteUserById(id) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes;
}

module.exports = { findAllUsers, findUserById, insertUser, updateUserById, deleteUserById };
