const express = require('express');
const tagsRouter = express.Router();
const { listTags, createTag } = require('../services/tags');

tagsRouter.get('/', (req, res, next) => {
  try {
    res.json(listTags());
  } catch (err) {
    next(err);
  }
});

tagsRouter.post('/', (req, res, next) => {
  try {
    res.status(201).json(createTag(req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = { tagsRouter };
