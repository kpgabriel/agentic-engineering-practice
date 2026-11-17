const express = require('express');
const tasksRouter = express.Router();
const { listTasks, getTaskById, createTask, updateTask, deleteTask } = require('../services/tasks');

tasksRouter.get('/', (req, res, next) => {
  try {
    res.json(listTasks(req.query));
  } catch (err) {
    next(err);
  }
});

tasksRouter.post('/', (req, res, next) => {
  try {
    res.status(201).json(createTask(req.body));
  } catch (err) {
    next(err);
  }
});

tasksRouter.get('/:id', (req, res, next) => {
  try {
    res.json(getTaskById(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

tasksRouter.put('/:id', (req, res, next) => {
  try {
    res.json(updateTask(parseInt(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete('/:id', (req, res, next) => {
  try {
    res.json(deleteTask(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

module.exports = { tasksRouter };
