const { findTaskById } = require('../db/queries/tasks');
const tags = require('../db/queries/tags');
const { isNonEmptyString, createHttpError, isUniqueViolation } = require('../utils');

/**
 * @description Lists all tags.
 * @returns {Object[]} The tags.
 */
function listTags() {
  return tags.findAllTags();
}

/**
 * @description Validates input and creates a normalized tag, throwing 409 on duplicates.
 * @param {Object} [data] - The tag data.
 * @param {string} data.name - The tag name.
 * @returns {Object} The created tag.
 */
function createTag({ name } = {}) {
  if (!name || !isNonEmptyString(name)) throw createHttpError(400, 'name is required');
  try {
    return tags.insertTag(name.toLowerCase().trim());
  } catch (err) {
    if (isUniqueViolation(err)) throw createHttpError(409, 'tag already exists');
    throw err;
  }
}

/**
 * @description Applies an existing tag to an existing task, throwing 409 if already applied.
 * @param {number} taskId - The task ID.
 * @param {Object} [data] - The request data.
 * @param {number|string} data.tag_id - The ID of the tag to apply.
 * @returns {{task_id: number, tag_id: number}} The created association.
 */
function addTagToTask(taskId, { tag_id } = {}) {
  if (!findTaskById(taskId)) throw createHttpError(404, 'Task not found');
  if (!tag_id) throw createHttpError(400, 'tag_id is required');
  const tagId = parseInt(tag_id);
  if (!tags.findTagById(tagId)) throw createHttpError(404, 'Tag not found');

  try {
    tags.insertTaskTag(taskId, tagId);
  } catch (err) {
    if (isUniqueViolation(err)) throw createHttpError(409, 'tag already applied to this task');
    throw err;
  }
  return { task_id: taskId, tag_id: tagId };
}

/**
 * @description Removes a tag from a task, throwing 404 if it was not applied.
 * @param {number} taskId - The task ID.
 * @param {number} tagId - The tag ID.
 * @returns {{deleted: boolean}} The deletion result.
 */
function removeTagFromTask(taskId, tagId) {
  if (tags.deleteTaskTag(taskId, tagId) === 0) {
    throw createHttpError(404, 'Tag not applied to this task');
  }
  return { deleted: true };
}

module.exports = { listTags, createTag, addTagToTask, removeTagFromTask };
