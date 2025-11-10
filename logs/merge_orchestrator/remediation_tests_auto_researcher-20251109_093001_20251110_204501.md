# Test Failure Remediation Task

**Branch:** auto/researcher-20251109_093001
**Merge Branch:** merge/auto/researcher-20251109_093001_20251110_204501
**Timestamp:** Mon Nov 10 20:57:06 UTC 2025

## Problem
Merge succeeded but tests are failing. Branch cannot be merged to main until tests pass.

## Your Task
1. Checkout the merge branch: `git checkout merge/auto/researcher-20251109_093001_20251110_204501`
2. Run tests to identify failures: `npm test` (or `npm run test:backend` on VM)
3. Fix all test failures:
   - Review test output
   - Fix broken code or update tests if behavior intentionally changed
   - Ensure simulation logic is correct
4. Verify all tests pass
5. Commit fixes: `git add . && git commit -m "fix: Resolve test failures"`
6. If all tests pass:
   - Merge to main: `git checkout main && git merge merge/auto/researcher-20251109_093001_20251110_204501 --no-edit`
   - Push: `git push origin main`
   - Delete worker branch: `git push origin --delete auto/researcher-20251109_093001`
7. Document resolution in logs/merge_orchestrator/

## Context
- Tests must pass before merging to main
- Ensure no regressions introduced
- Log your decision-making process

**Timeout:** 15 minutes
