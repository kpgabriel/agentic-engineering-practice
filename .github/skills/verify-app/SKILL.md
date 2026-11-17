---
name: verify-app
description: Run the full Taskr test suite serially and verify every API endpoint works. Use after any significant change.
---

# /verify-app

Run the full test suite after any significant change and confirm every API endpoint works.

## Steps

1. Read `.github/copilot/context/testing-standards.md` before starting.
2. Run the suite serially (single process, so the shared in-memory SQLite DB is not contended):

   ```bash
   npm test -- --runInBand
   ```

3. The suite uses supertest against the real Express app (`index.js`) and an in-memory DB, exercising all API endpoints directly (tasks, projects, users, comments, tags, `/health`). Passing tests mean the server and endpoints work correctly.
4. If any test fails:
   - Read the failing test and its error output to find the root cause.
   - Fix the **implementation** (routes → services → db/queries), not the test, unless the test itself is demonstrably wrong.
   - Respect the layering rules in `.github/copilot-instructions.md` (no SQL or validation in routes, no `db` imports outside `src/db/`).
   - Re-run `npm test -- --runInBand`. Repeat until all tests pass.
   - If a failure cannot be fixed after reasonable attempts, stop and report it.
5. If an endpoint has no test coverage, note it in the report (and add a test per the testing standards if asked).

## Report

End with a clear result, in one of two forms:

- **All tests passing:** "✅ All N tests passing across M suites. All API endpoints verified."
- **Failures remaining:** "❌ X failing tests need attention", then for each: test file, test name, the error message, and the suspected cause/file to change.

Also list any implementation files you changed while fixing failures.
