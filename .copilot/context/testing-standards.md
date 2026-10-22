# Testing Standards

Follow these rules whenever you write tests for the Taskr API.

## File naming

- Test files live in `tests/` and are named `resource.test.js`, lowercase (e.g. `tasks.test.js`, `comments.test.js`).
- Do not copy the legacy names `userTest.js` or `test-projects.js`; they will be standardized.

## Tooling

- Use Jest and supertest against the Express app exported from `index.js`.
- Tests run against an in-memory SQLite database, so no external setup is needed. `DB.js` uses `:memory:` when `NODE_ENV=test`, so set it before requiring the app:

```js
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');
const { db } = require('../DB');
const { createSchema } = require('./schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
});
```

- Seed any data a test needs inside the test or `beforeEach`; never depend on `taskr.db` or on state from another test.

## Coverage per endpoint

Each endpoint must have tests for:

1. The happy path (correct status code and response body).
2. **At least two** error cases, e.g. invalid or missing input (400), nonexistent resource (404), unauthorized (401) where auth applies.

## Test descriptions

Write descriptions in plain English describing what the endpoint does, not how it is implemented.

- Good: `returns 404 when the task does not exist`, `creates a task and returns it`
- Bad: `calls getTaskById and returns null`, `runs INSERT query`

Group tests with `describe('METHOD /path', ...)`.

## Running

- The whole suite must pass with `npm test` and no other setup (no seeded database, no env vars, no running server).
- Run a single file with `npx jest tests/<resource>.test.js`.
