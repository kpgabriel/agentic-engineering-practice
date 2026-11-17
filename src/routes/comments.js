const express = require('express');
const commentsRouter = express.Router({ mergeParams: true });
const { listComments, createComment } = require('../services/comments');

commentsRouter.get('/', (req, res, next) => {
  try {
    res.json(listComments(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

commentsRouter.post('/', (req, res, next) => {
  try {
    res.status(201).json(createComment(parseInt(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = { commentsRouter };
