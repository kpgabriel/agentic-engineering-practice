const projects = require('../db/queries/projects');
const { getTasksForProject } = require('../db/queries/tasks');
const { isNonEmptyString, createHttpError } = require('../utils');

/**
 * @description Lists all projects.
 * @returns {Object[]} The projects.
 */
function listProjects() {
  return projects.findAllProjects();
}

/**
 * @description Gets a project with its task statistics, throwing 404 if missing.
 * @param {number} id - The project ID.
 * @returns {Object} The project including a stats object.
 */
function getProjectById(id) {
  const project = projects.findProjectById(id);
  if (!project) throw createHttpError(404, 'Project not found');
  return { ...project, stats: projects.getProjectStats(id) };
}

/**
 * @description Validates input and creates a project.
 * @param {Object} [data] - The project data.
 * @param {string} data.name - The project name.
 * @param {string} [data.description] - The project description.
 * @param {number} [data.owner_id] - The ID of the owning user.
 * @returns {Object} The created project.
 */
function createProject({ name, description, owner_id } = {}) {
  if (!name || !isNonEmptyString(name)) throw createHttpError(400, 'name is required');
  return projects.insertProject(name, description || null, owner_id || null);
}

/**
 * @description Applies a partial update to a project, throwing 404 if missing.
 * @param {number} id - The project ID.
 * @param {Object} data - The fields to update.
 * @returns {Object} The updated project.
 */
function updateProject(id, data) {
  const existing = projects.findProjectById(id);
  if (!existing) throw createHttpError(404, 'Project not found');

  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const ownerId = data.owner_id !== undefined ? data.owner_id : existing.owner_id;
  return projects.updateProjectById(id, name, description, ownerId);
}

/**
 * @description Deletes a project, throwing 404 if it does not exist.
 * @param {number} id - The project ID.
 * @returns {{deleted: boolean}} The deletion result.
 */
function deleteProject(id) {
  if (projects.deleteProjectById(id) === 0) throw createHttpError(404, 'Project not found');
  return { deleted: true };
}

/**
 * @description Builds a project summary with its task count and three most recent tasks.
 * @param {Object} project - The project row.
 * @param {number} project.id - The project ID.
 * @returns {Object} The project extended with taskCount and recentTasks.
 */
function formatProjectSummary(project) {
  const tasks = getTasksForProject(project.id);
  return {
    ...project,
    taskCount: tasks.length,
    recentTasks: tasks.slice(0, 3)
  };
}

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  formatProjectSummary
};
