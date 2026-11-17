const { db } = require('../connection');

/**
 * @description Finds tasks matching optional filters, newest first, with pagination.
 * @param {Object} [filters] - The query filters.
 * @param {string} [filters.status] - Only tasks with this status.
 * @param {number} [filters.projectId] - Only tasks in this project.
 * @param {number} [filters.assigneeId] - Only tasks assigned to this user.
 * @param {number} [filters.limit=20] - The maximum number of rows to return.
 * @param {number} [filters.offset=0] - The number of rows to skip.
 * @returns {Object[]} The task rows.
 */
function getTasks({ status, projectId, assigneeId, limit = 20, offset = 0 } = {}) {
  let query = 'SELECT * FROM tasks';
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (projectId) {
    conditions.push('project_id = ?');
    params.push(projectId);
  }
  if (assigneeId) {
    conditions.push('assignee_id = ?');
    params.push(assigneeId);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(params);
}

/**
 * @description Finds a task by ID including its tags and comments.
 * @param {number} id - The task ID.
 * @returns {Object|null} The task with tags and comments, or null if not found.
 */
function getTaskById(id) {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return null;
  task.tags = db.prepare(
    'SELECT t.* FROM tags t JOIN task_tags tt ON tt.tag_id = t.id WHERE tt.task_id = ?'
  ).all(id);
  task.comments = db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at ASC'
  ).all(id);
  return task;
}

/**
 * @description Finds a bare task row by its ID.
 * @param {number} id - The task ID.
 * @returns {Object|undefined} The task row, or undefined if not found.
 */
function findTaskById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

/**
 * @description Inserts a new task and returns it.
 * @param {Object} task - The task data.
 * @param {string} task.title - The task title.
 * @param {string|null} task.description - The task description.
 * @param {number|null} task.projectId - The ID of the owning project.
 * @param {number|null} task.assigneeId - The ID of the assigned user.
 * @param {string|null} task.dueDate - The due date.
 * @returns {Object} The newly created task row.
 */
function insertTask({ title, description, projectId, assigneeId, dueDate }) {
  const result = db.prepare(
    'INSERT INTO tasks (title, description, project_id, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description, projectId, assigneeId, dueDate);
  return findTaskById(result.lastInsertRowid);
}

/**
 * @description Overwrites a task's fields and returns the updated row.
 * @param {number} id - The task ID.
 * @param {Object} data - The new task values.
 * @param {string} data.title - The task title.
 * @param {string|null} data.description - The task description.
 * @param {string} data.status - The task status.
 * @param {number|null} data.projectId - The ID of the owning project.
 * @param {number|null} data.assigneeId - The ID of the assigned user.
 * @param {string|null} data.dueDate - The due date.
 * @param {string|null} data.completedAt - The completion timestamp.
 * @returns {Object} The updated task row.
 */
function updateTaskById(id, { title, description, status, projectId, assigneeId, dueDate, completedAt }) {
  db.prepare(
    'UPDATE tasks SET title=?, description=?, status=?, project_id=?, assignee_id=?, due_date=?, completed_at=? WHERE id=?'
  ).run(title, description, status, projectId, assigneeId, dueDate, completedAt, id);
  return findTaskById(id);
}

/**
 * @description Deletes a task by its ID.
 * @param {number} id - The task ID.
 * @returns {number} The number of rows deleted.
 */
function deleteTaskById(id) {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes;
}

/**
 * @description Finds all tasks in a project, newest first.
 * @param {number} projectId - The project ID.
 * @returns {Object[]} The task rows.
 */
function getTasksForProject(projectId) {
  return db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC').all(projectId);
}

module.exports = {
  getTasks,
  getTaskById,
  findTaskById,
  insertTask,
  updateTaskById,
  deleteTaskById,
  getTasksForProject
};
