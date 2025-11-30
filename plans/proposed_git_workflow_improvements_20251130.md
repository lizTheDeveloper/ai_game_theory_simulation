# Git Workflow Improvements - Pre-commit Hook for Merge Conflicts

**Date:** November 30, 2025
**Status:** Proposed
**Priority:** LOW (nice-to-have, not blocking)
**Effort:** 1-2 hours

## Problem Statement

Session 21 architecture review discovered unresolved merge conflicts in `oceanAcidification.ts` that broke all tests. The conflicts included git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) that were committed to the repository.

**Impact:**
- All 8 test files failed with TransformError
- Issue persisted through multiple commits before discovery
- Required manual resolution during architecture review

## Proposed Solution

Add a pre-commit git hook to detect and prevent commits containing merge conflict markers.

### Implementation

**File:** `.git/hooks/pre-commit`

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

### Benefits

1. **Prevent broken commits** - Catch merge conflicts before they enter git history
2. **Faster feedback** - Developer knows immediately rather than after tests fail
3. **Cleaner history** - No commits with conflict markers in repository
4. **CI/CD reliability** - Fewer broken builds from merge conflicts

### Considerations

**When NOT to block:**
- Documentation files that intentionally show conflict resolution (e.g., tutorials)
- Test fixtures that use these patterns
- Generated files that might contain similar patterns

**Solution:** Use more specific pattern matching or allow override with `--no-verify` flag for special cases.

### Alternative Approaches

1. **GitHub Actions CI check** - Run same check in CI pipeline
   - Pros: Catches issues before merge to main
   - Cons: Slower feedback, wastes CI time

2. **Editor integration** - Warn in VS Code/etc when conflict markers present
   - Pros: Even earlier detection
   - Cons: Requires each developer to configure

3. **Both pre-commit hook + CI check** - Defense in depth
   - Recommended approach for production systems

## Implementation Steps

1. Create pre-commit hook script (10 min)
2. Test with intentional conflict markers (5 min)
3. Document in `docs/DEVELOPMENT_WORKFLOW.md` (10 min)
4. Add to `.git/hooks/` in repo (5 min)
5. Consider adding to `.githooks/` directory for team sharing (optional)

## Research Backing

Not applicable - this is a standard git workflow best practice.

## Success Criteria

1. Hook prevents commits with conflict markers
2. Hook can be bypassed with `--no-verify` when needed
3. Documentation explains hook purpose and override process

## Related Work

- **M-2:** Calibration coordination (oceanAcidification.ts divergence)
- **DevOps improvements:** Multi-worker git architecture
- **Session 21:** Merge conflict discovered and resolved

## Notes

**Why LOW priority:**
- Issue was caught during architecture review (safety net exists)
- Manual conflict resolution worked fine
- Not blocking current development
- Nice-to-have quality-of-life improvement

**When to implement:**
- During next infrastructure maintenance window
- After VM deployment complete
- When developer productivity improvements are prioritized
