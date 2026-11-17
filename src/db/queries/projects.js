const { db } = require('../connection');

/**
 * @description Finds all projects, newest first.
 * @returns {Object[]} The project rows.
 */
function findAllProjects() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

/**
 * @description Finds a single project by its ID.
 * @param {number} id - The project ID.
 * @returns {Object|undefined} The project row, or undefined if not found.
 */
function findProjectById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

/**
 * @description Inserts a new project and returns it.
 * @param {string} name - The project name.
 * @param {string|null} description - The project description.
 * @param {number|null} ownerId - The ID of the owning user.
 * @returns {Object} The newly created project row.
 */
function insertProject(name, description, ownerId) {
  const result = db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description, ownerId);
  return findProjectById(result.lastInsertRowid);
}

/**
 * @description Updates a project's fields and returns the updated row.
 * @param {number} id - The project ID.
 * @param {string} name - The new project name.
 * @param {string|null} description - The new description.
 * @param {number|null} ownerId - The new owner's user ID.
 * @returns {Object} The updated project row.
 */
function updateProjectById(id, name, description, ownerId) {
  db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, ownerId, id);
  return findProjectById(id);
}

/**
 * @description Deletes a project by its ID.
 * @param {number} id - The project ID.
 * @returns {number} The number of rows deleted.
 */
function deleteProjectById(id) {
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes;
}

/**
 * @description Counts a project's tasks in total and by status.
 * @param {number} projectId - The project ID.
 * @returns {{total: number, active: number, completed: number, archived: number}} The task counts.
 */
function getProjectStats(projectId) {
  const rows = db.prepare(
    'SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status'
  ).all(projectId);
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

/**
 * @description Checks whether a user owns a project.
 * @param {number} projectId - The project ID.
 * @param {number} userId - The user ID.
 * @returns {boolean} True if the project exists and is owned by the user, otherwise false.
 */
function isProjectOwner(projectId, userId) {
  const project = db.prepare('SELECT owner_id FROM projects WHERE id = ?').get(projectId);
  return Boolean(project) && project.owner_id === userId;
}

module.exports = {
  findAllProjects,
  findProjectById,
  insertProject,
  updateProjectById,
  deleteProjectById,
  getProjectStats,
  isProjectOwner
};
