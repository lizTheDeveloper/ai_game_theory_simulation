# Git Hooks

This directory contains git hooks that are committed to the repository.

## Available Hooks

### pre-commit
Runs before each commit:
- TypeScript type checking (`npx tsc --noEmit`)
- ESLint (`npm run lint`)

### pre-push
Runs before each push:
- Regression tests (`npx tsx tests/refactoring/runRegressionTests.ts`)

## Setup

To enable these hooks, run:

```bash
npm run setup-hooks
```

Or manually:

```bash
bash scripts/setup-hooks.sh
```

This configures git to use `.githooks/` instead of `.git/hooks/`.

## Skipping Hooks

To temporarily skip hooks:

```bash
# Skip pre-commit
git commit --no-verify

# Skip pre-push
git push --no-verify
```

## Adding New Hooks

1. Create a new file in `.githooks/` (e.g., `post-commit`)
2. Make it executable: `chmod +x .githooks/post-commit`
3. Commit it to the repository
4. Team members will get it automatically on next pull

## Hook Lifecycle

- `pre-commit`: Before commit message editor
- `prepare-commit-msg`: Before commit message, can modify it
- `commit-msg`: After commit message, can validate it
- `post-commit`: After commit is created
- `pre-push`: Before pushing to remote
- `post-checkout`: After checking out a branch
- `post-merge`: After merging

See [git hooks documentation](https://git-scm.com/docs/githooks) for all available hooks.
