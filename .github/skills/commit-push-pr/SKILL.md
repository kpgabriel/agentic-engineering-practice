---
name: commit-push-pr
description: Commit all staged changes, push to the current branch, and open a pull request
---

# /commit-push-pr

Commit all staged changes, push the current branch, and open a pull request.

## Steps

1. Run `git status` to show what will be committed.
2. Run `git diff --staged` to review the staged changes.
3. Write a commit message in [Conventional Commits](https://www.conventionalcommits.org/) format (`type(scope): description`) based on what was staged.
4. Run `git commit -m "<commit message>"` with that message.
5. Run `git push origin <current-branch>`, using the current branch name (`git branch --show-current`).
6. Run `gh pr create --fill --body "<commit message>"` to open a pull request, using the commit message as the PR body.
