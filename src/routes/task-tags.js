const express = require('express');
const taskTagsRouter = express.Router({ mergeParams: true });
const { addTagToTask, removeTagFromTask } = require('../services/tags');

taskTagsRouter.post('/', (req, res, next) => {
  try {
    res.status(201).json(addTagToTask(parseInt(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

taskTagsRouter.delete('/:tagId', (req, res, next) => {
  try {
    res.json(removeTagFromTask(parseInt(req.params.id), parseInt(req.params.tagId)));
  } catch (err) {
    next(err);
  }
});

module.exports = { taskTagsRouter };
