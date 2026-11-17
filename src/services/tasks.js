const taskQueries = require('../db/queries/tasks');
const { findProjectById } = require('../db/queries/projects');
const { findUserById } = require('../db/queries/users');
const { VALID_TASK_STATUSES } = require('../config/constants');
const { isNonEmptyString, createHttpError } = require('../utils');

/**
 * @description Throws a 400 error if a status is provided and is not a valid task status.
 * @param {string} [status] - The status to check.
 * @returns {void} Nothing.
 */
function assertValidStatus(status) {
  if (status && !VALID_TASK_STATUSES.includes(status)) {
    throw createHttpError(400, `status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
  }
}

/**
 * @description Lists tasks filtered by status, project, and assignee with pagination.
 * @param {Object} [query] - The query parameters.
 * @param {string} [query.status] - Only tasks with this status.
 * @param {number|string} [query.project_id] - Only tasks in this project.
 * @param {number|string} [query.assignee_id] - Only tasks assigned to this user.
 * @param {number|string} [query.page] - The 1-based page number.
 * @param {number|string} [query.page_size] - The page size, capped at 100.
 * @returns {Object[]} The matching tasks.
 */
function listTasks({ status, project_id, assignee_id, page, page_size } = {}) {
  assertValidStatus(status);

  const limit = Math.min(100, parseInt(page_size) || 20);
  const offset = ((parseInt(page) || 1) - 1) * limit;

  return taskQueries.getTasks({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
}

/**
 * @description Gets a task with its tags and comments, throwing 404 if missing.
 * @param {number} id - The task ID.
 * @returns {Object} The task.
 */
function getTaskById(id) {
  const task = taskQueries.getTaskById(id);
  if (!task) throw createHttpError(404, 'Task not found');
  return task;
}

/**
 * @description Validates input and creates a task.
 * @param {Object} [data] - The task data.
 * @param {string} data.title - The task title.
 * @param {string} [data.description] - The task description.
 * @param {number|string} [data.project_id] - The ID of the owning project.
 * @param {number|string} [data.assignee_id] - The ID of the assigned user.
 * @param {string} [data.due_date] - The due date.
 * @returns {Object} The created task.
 */
function createTask({ title, description, project_id, assignee_id, due_date } = {}) {
  if (!title || !isNonEmptyString(title)) throw createHttpError(400, 'title is required');
  if (project_id && !findProjectById(parseInt(project_id))) {
    throw createHttpError(400, 'project not found');
  }
  if (assignee_id && !findUserById(parseInt(assignee_id))) {
    throw createHttpError(400, 'assignee not found');
  }
  return taskQueries.insertTask({
    title,
    description: description || null,
    projectId: project_id ? parseInt(project_id) : null,
    assigneeId: assignee_id ? parseInt(assignee_id) : null,
    dueDate: due_date || null
  });
}

/**
 * @description Applies a partial update to a task and maintains its completion timestamp.
 * @param {number} id - The task ID.
 * @param {Object} data - The fields to update.
 * @returns {Object} The updated task.
 */
function updateTask(id, data) {
  const existing = taskQueries.findTaskById(id);
  if (!existing) throw createHttpError(404, 'Task not found');

  const { title, description, status, project_id, assignee_id, due_date } = data;
  assertValidStatus(status);

  const updatedStatus = status !== undefined ? status : existing.status;
  const completedAt = updatedStatus === 'completed' && existing.status !== 'completed'
    ? new Date().toISOString()
    : (updatedStatus !== 'completed' ? null : existing.completed_at);

  return taskQueries.updateTaskById(id, {
    title: title !== undefined ? title : existing.title,
    description: description !== undefined ? description : existing.description,
    status: updatedStatus,
    projectId: project_id !== undefined ? project_id : existing.project_id,
    assigneeId: assignee_id !== undefined ? assignee_id : existing.assignee_id,
    dueDate: due_date !== undefined ? due_date : existing.due_date,
    completedAt
  });
}

/**
 * @description Deletes a task, throwing 404 if it does not exist.
 * @param {number} id - The task ID.
 * @returns {{deleted: boolean}} The deletion result.
 */
function deleteTask(id) {
  if (taskQueries.deleteTaskById(id) === 0) throw createHttpError(404, 'Task not found');
  return { deleted: true };
}

module.exports = { listTasks, getTaskById, createTask, updateTask, deleteTask };
