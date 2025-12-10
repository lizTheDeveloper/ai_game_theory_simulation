# Git Workflow Improvements - Implementation Tasks

## Phase 1: Create Pre-commit Hook
**Duration:** 15 minutes

- [ ] Create `.githooks/pre-commit` script:
  ```bash
  #!/bin/bash

  # Check for merge conflict markers in staged files
  if git diff --cached --name-only | xargs grep -l -E '^(<{7}|={7}|>{7})' 2>/dev/null; then
    echo "❌ ERROR: Merge conflict markers detected in staged files:"
    git diff --cached --name-only | xargs grep -l -E '^(<{7}|={7}|>{7})' 2>/dev/null
    echo ""
    echo "Please resolve all merge conflicts before committing."
    exit 1
  fi

  exit 0
  ```
- [ ] Make script executable: `chmod +x .githooks/pre-commit`

## Phase 2: Test Hook
**Duration:** 10 minutes

- [ ] Create test file with intentional conflict markers
- [ ] Attempt commit (should be blocked)
- [ ] Test `--no-verify` override (should work)
- [ ] Remove test file

## Phase 3: Documentation
**Duration:** 15 minutes

- [ ] Update `docs/DEVELOPMENT_WORKFLOW.md`:
  - Explain pre-commit hook purpose
  - Document override process (`--no-verify`)
  - Note exceptions (documentation examples, test fixtures)

## Phase 4: Installation
**Duration:** 10 minutes

- [ ] Configure git to use `.githooks/`: `git config core.hooksPath .githooks`
- [ ] Add to project setup instructions
- [ ] Commit hook and documentation

## Phase 5: Optional CI Check
**Duration:** 15 minutes (optional)

- [ ] Add GitHub Actions check for conflict markers
- [ ] Defense-in-depth approach
