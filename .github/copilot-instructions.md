# Copilot Instructions

Taskr: a Node.js · Express 5 · SQLite (`better-sqlite3`) · Jest REST API for tasks, projects, users, comments, and tags. All paths below are relative to the repository root (the folder containing `package.json`).

## Project structure

```
index.js                 builds the Express app, mounts routers, exports app
src/config/constants.js  PORT, page sizes, VALID_TASK_STATUSES, EMAIL_FROM
src/db/connection.js     shared better-sqlite3 `db`
src/db/schema.js         createSchema(db), the single schema definition
src/db/seed.js           sample data (`npm run db:seed`)
src/db/queries/          SQL only, one file per resource
src/services/            validation, business rules, errors (+ notifications.js)
src/routes/              one Express router per resource, mounted in index.js
src/middleware/          logger.js, error-handler.js, authenticate.js
src/utils/index.js       shared helpers
tests/                   resource.test.js files (supertest + Jest)
```

Layering: **routes → services → db/queries → db/connection**. Routes never touch SQL; queries never validate.

## Never Do These Things

- Never put SQL or validation in a route handler, or add routes outside `src/routes/`.
- Never import `db` outside `src/db/`; services call `src/db/queries/*`.
- Never add a second copy of the schema; use `createSchema` from `src/db/schema.js`.
- Never add utilities to `src/utils/index.js` without first checking whether they belong in a more specific module.
- All file names are kebab-case; test files are `resource.test.js`.
- Deny rule: never run `shell(rm -rf *)` (recursive forced deletion).

## Context Files

Read the relevant file before starting the task:

- `.github/copilot/context/api-conventions.md`: for any task involving API routes or endpoints.
- `.github/copilot/context/testing-standards.md`: for any task involving tests or test coverage.

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

- `index.js` (repo root) builds the Express app and exports it (only calls `listen` when run directly, so supertest can import it). It mounts every router from `src/routes/`; nested resources use `mergeParams` (`/tasks/:id/comments`, `/tasks/:id/tags`) and are mounted before `/tasks`.
- Services throw errors with a `.status` (via `createHttpError` in `src/utils`); route handlers forward them with `next(err)` and `errorHandler` in `src/middleware/error-handler.js` turns them into JSON responses.
- `src/db/connection.js` opens a single shared `db` connection (WAL, foreign keys ON). Path: `:memory:` when `NODE_ENV=test`, else `DB_PATH` or `taskr.db`.
- The schema lives once in `src/db/schema.js` (`createSchema`), used by `src/db/seed.js` and tests. Task status is constrained to `active | completed | archived` (also `VALID_TASK_STATUSES` in `src/config/constants.js`).
- `src/middleware/authenticate.js` is a placeholder `x-api-key` check (`API_KEY` env, default `dev-key`); currently applied only to `DELETE /users/:id` and `DELETE /projects/:id`. `src/services/notifications.js` is a logging email stub; user creation sends the welcome email through it.

## Conventions

- CommonJS (`require`/`module.exports`) throughout; SQL uses prepared statements with `?` params.
- Tests are supertest integration tests against the real app and in-memory DB. Each test file must set `process.env.NODE_ENV = 'test'` **before** requiring `../index` or `../src/db/connection`, call `createSchema(db)` (from `../src/db/schema`) in `beforeAll`, and clear tables in `beforeEach` (`DELETE FROM task_tags; comments; tasks; projects; users; tags`).
- Jest `testMatch` (in `package.json`) is `**/tests/**/*.test.js`; new `resource.test.js` files are picked up automatically.

## Verification

After completing any significant change and before committing, run the full test suite (use the `/verify-app` skill, or `npm test -- --runInBand`). **Do not commit if any tests are failing.**

The suite uses supertest and covers all API endpoints, so a passing run confirms the full application is working correctly.