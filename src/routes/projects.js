const express = require('express');
const projectsRouter = express.Router();
const { authenticate } = require('../middleware/authenticate');
const {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../services/projects');

projectsRouter.get('/', (req, res, next) => {
  try {
    res.json(listProjects());
  } catch (err) {
    next(err);
  }
});

projectsRouter.post('/', (req, res, next) => {
  try {
    res.status(201).json(createProject(req.body));
  } catch (err) {
    next(err);
  }
});

projectsRouter.get('/:id', (req, res, next) => {
  try {
    res.json(getProjectById(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

projectsRouter.put('/:id', (req, res, next) => {
  try {
    res.json(updateProject(parseInt(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

projectsRouter.delete('/:id', authenticate, (req, res, next) => {
  try {
    res.json(deleteProject(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

module.exports = { projectsRouter };
