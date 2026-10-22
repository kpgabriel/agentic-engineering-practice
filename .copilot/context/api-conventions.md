# API Conventions

Follow these rules whenever you add a new endpoint or resource to the Taskr API. They describe the target structure after the planned refactor; do not copy the current patterns in `routes.js`.

## 1. Routes live in a dedicated file in `src/routes/`

- Never add routes to the legacy `routes.js`.
- Create one file per resource in `src/routes/`, named after the resource in **lowercase plural**: `tasks.js`, `comments.js`, `tags.js`.
- Each route file exports a **named** Express router:

```js
// src/routes/tags.js
const express = require('express');
const tagsRouter = express.Router();

// handlers here

module.exports = { tagsRouter };
```

## 2. Handlers delegate to `src/services/`

- Route handlers contain no business logic, validation, or SQL. Each handler calls a corresponding function in `src/services/` (e.g. `src/services/tags.js`) and sends the result.
- The service layer owns validation, database access, and business rules.

```js
const { createTag } = require('../services/tags');

tagsRouter.post('/', async (req, res, next) => {
  try {
    const tag = await createTag(req.body);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});
```

## 3. Errors go through `next`

- Never build error responses inline in a handler (no `res.status(500).json(...)` in catch blocks).
- Pass errors to Express's `next` function. Errors must carry a `status` code and a `message`; services create them:

```js
const err = new Error('Tag not found');
err.status = 404;
throw err;
```

- The shared `errorHandler` in `middleware.js` turns them into the JSON response.

## 4. Register routes in `src/index.js`

- Every router is registered in `src/index.js` with `app.use`, using the resource path and the imported router:

```js
const { tagsRouter } = require('./routes/tags');

app.use('/tags', tagsRouter);
```

- Route paths inside the router file are relative to the mount path (`'/'`, `'/:id'`), not repeated resource prefixes.

## Checklist for a new endpoint

1. Add or extend the service function in `src/services/<resource>.js`.
2. Add the handler to `src/routes/<resource>.js` (new file if the resource is new) that only calls the service and forwards errors with `next`.
3. Export the router by name and register it in `src/index.js` with `app.use('/<resource>', <resource>Router)`.
4. Add tests in `tests/<resource>.test.js`.
