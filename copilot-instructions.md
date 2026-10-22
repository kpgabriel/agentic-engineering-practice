# Copilot Instructions

Taskr: a Node.js · Express 5 · SQLite (`better-sqlite3`) · Jest REST API for tasks, projects, users, comments, and tags. All paths below are relative to the repository root (the folder containing `package.json`).

## Known structural problems (planned refactor)

This codebase intentionally contains structural problems that will be addressed in a future refactor. Understand the current state, but do not copy or extend these patterns in new code:

- Route handlers in `routes.js` query the DB directly with inline validation (TODOs: split per resource, add a repository layer, shared validation middleware). Don't add more of this; prefer small separate modules for new logic, and don't grow `routes.js` beyond what's needed.
- `/users` using `UserController` is a half-finished extraction, not the standard to follow; it also mixes in email sending that belongs in a notification service.
- Query helpers in `DB.js` (`getUserById`, `getProjectById`) and misplaced helpers in `misc/constants.js` (`paginate`, `formatError`) belong elsewhere (repository layer / `utils.js`).
- Routes defined in `index.js`, the circular import between `projectHelpers.js` and `routes.js`, and duplicated schema in `db/seed.js` and `tests/schema.js` are known smells. Avoid adding new circular dependencies or schema copies.
- Inconsistent file naming (`get-tasks.js`, `DB.js`, `UserController.js`) and auth only on some DELETE routes are not conventions to emulate.
- Test file naming in `tests/` is inconsistent (`userTest.js`, `test-projects.js` vs `tasks.test.js`); this is a known problem that will be standardized. Name new test files `resource.test.js` (e.g. `comments.test.js`) and don't copy the other patterns.
- `misc/oldRoutes.js` and `misc/temp.js` are dead code slated for deletion.

When touching these areas, make the requested change without expanding the problem, and don't opportunistically refactor unless asked.

## Never Do These Things

- Never add new route logic or new routes to `routes.js`. It is already too large; any new routes belong in a dedicated route file (mounted from `index.js`).
- Never add new utility functions to `utils.js` without first checking whether they belong in a more specific module.
- Never import anything from the `misc/` directory. That code is dead and scheduled for removal.

## Context Files

Read the relevant file before starting the task:

- `.copilot/context/api-conventions.md`: for any task involving API routes or endpoints.
- `.copilot/context/testing-standards.md`: for any task involving tests or test coverage.

## Commands

```bash
npm install
npm run db:seed        # create schema + sample data in taskr.db
npm run dev            # node --watch index.js (port 3000, check /health)
npm start
npm test               # jest (no linter or build step is configured)
npx jest tests/tasks.test.js                 # single file
npx jest tests/tasks.test.js -t "filters by" # single test by name
npm run db:reset       # uses `rm -f`; on Windows PowerShell delete taskr.db manually, then db:seed
```

## Architecture

- `index.js` builds the Express app and exports it (only calls `listen` when run directly, so supertest can import it). It also defines `/` and `/webhooks/task-update` inline; everything else is mounted from `routes.js`.
- `routes.js` is one large file holding all resource routes (users, projects, tasks, comments, tags). Handlers query SQLite directly with inline validation; there is no service/repository layer. Exception: `/users` delegates to `UserController.js`, which throws errors with a `.status` property that `errorHandler` in `middleware.js` turns into HTTP responses.
- `DB.js` opens a single shared `db` connection (WAL, foreign keys ON) used by every module via `require('./DB')`. Path: `:memory:` when `NODE_ENV=test`, else `DB_PATH` or `taskr.db`.
- The schema is defined twice: `db/seed.js` (real DB) and `tests/schema.js` (`createSchema`, used by tests). Keep them in sync when changing tables. Task status is constrained to `active | completed | archived` (also `VALID_TASK_STATUSES` in `misc/constants.js`).
- `get-tasks.js` holds task list/detail queries (`getTasks` filters, `getTaskById` joins tags and comments). `projectHelpers.js` has project stats and a deliberate circular import with `routes.js` (`getTasksForProject` is attached to the router export and lazily required).
- `auth.js` is a placeholder `x-api-key` check (`API_KEY` env, default `dev-key`); currently applied only to `DELETE /users/:id` and `DELETE /projects/:id`. `sendEmail.js` is a logging stub.
- `misc/oldRoutes.js` and `misc/temp.js` are dead code; do not wire them in.

## Conventions

- CommonJS (`require`/`module.exports`) throughout; SQL uses prepared statements with `?` params.
- Tests are supertest integration tests against the real app and in-memory DB. Each test file must set `process.env.NODE_ENV = 'test'` **before** requiring `../index` or `../DB`, call `createSchema(db)` in `beforeAll`, and clear tables in `beforeEach` (`DELETE FROM task_tags; comments; tasks; projects; users; tags`).
- Jest `testMatch` (in `package.json`) lists `tests/*.test.js` plus the two legacy files `tests/userTest.js` and `tests/test-projects.js`; new `resource.test.js` files are picked up automatically.
