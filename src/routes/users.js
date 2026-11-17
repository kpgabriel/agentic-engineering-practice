const express = require('express');
const usersRouter = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { listUsers, getUserById, createUser, updateUser, deleteUser } = require('../services/users');

usersRouter.get('/', (req, res, next) => {
  try {
    res.json(listUsers());
  } catch (err) {
    next(err);
  }
});

usersRouter.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await createUser(req.body));
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/:id', (req, res, next) => {
  try {
    res.json(getUserById(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

usersRouter.put('/:id', (req, res, next) => {
  try {
    res.json(updateUser(parseInt(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

usersRouter.delete('/:id', authenticate, (req, res, next) => {
  try {
    res.json(deleteUser(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

module.exports = { usersRouter };
