# Git Workflow Improvements - Pre-commit Hook for Merge Conflicts

**Created:** November 30, 2025
**Priority:** LOW
**Effort:** 1-2 hours

---

## Rationale

Session 21 architecture review discovered unresolved merge conflicts in `oceanAcidification.ts` that broke all tests. The conflicts included git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) that were committed to the repository, causing all 8 test files to fail with TransformError.

**Impact:** Issue persisted through multiple commits before discovery, requiring manual resolution during architecture review.

---

## Scope

Add pre-commit git hook to detect and prevent commits containing merge conflict markers.

**Hook implementation:**
- Check staged files for conflict markers
- Block commit if markers found
- Allow override with `--no-verify` when needed
- Document in `docs/DEVELOPMENT_WORKFLOW.md`

---

## Success Criteria

1. Pre-commit hook prevents commits with conflict markers
2. Hook can be bypassed with `--no-verify` when needed
3. Documentation explains hook purpose and override process
4. Hook added to `.githooks/` for team sharing

---

## Sources

- Session 21 architecture review (merge conflict discovery)
- Standard git workflow best practices
