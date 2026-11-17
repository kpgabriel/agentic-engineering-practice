const users = require('../db/queries/users');
const { sendWelcomeEmail } = require('./notifications');
const { validateEmail, isNonEmptyString, createHttpError, isUniqueViolation } = require('../utils');

/**
 * @description Lists all users.
 * @returns {Object[]} The users.
 */
function listUsers() {
  return users.findAllUsers();
}

/**
 * @description Gets a user by ID, throwing 404 if missing.
 * @param {number} id - The user ID.
 * @returns {Object} The user.
 */
function getUserById(id) {
  const user = users.findUserById(id);
  if (!user) throw createHttpError(404, 'User not found');
  return user;
}

/**
 * @description Validates input, creates a user, and sends them a welcome email.
 * @param {Object} [data] - The user data.
 * @param {string} data.name - The user's name.
 * @param {string} data.email - The user's email address.
 * @returns {Promise<Object>} A promise resolving to the created user.
 */
async function createUser({ name, email } = {}) {
  if (!name || !isNonEmptyString(name)) throw createHttpError(400, 'name is required');
  if (!email || !isNonEmptyString(email)) throw createHttpError(400, 'email is required');
  if (!validateEmail(email)) throw createHttpError(400, 'Invalid email address');

  let user;
  try {
    user = users.insertUser(name, email);
  } catch (err) {
    if (isUniqueViolation(err)) throw createHttpError(409, 'email already exists');
    throw err;
  }

  await sendWelcomeEmail(user);
  return user;
}

/**
 * @description Applies a partial update to a user, throwing 404 if missing.
 * @param {number} id - The user ID.
 * @param {Object} data - The fields to update.
 * @returns {Object} The updated user.
 */
function updateUser(id, data) {
  const existing = getUserById(id);
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  return users.updateUserById(id, name, email);
}

/**
 * @description Deletes a user, throwing 404 if they do not exist.
 * @param {number} id - The user ID.
 * @returns {{deleted: boolean}} The deletion result.
 */
function deleteUser(id) {
  if (users.deleteUserById(id) === 0) throw createHttpError(404, 'User not found');
  return { deleted: true };
}

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
