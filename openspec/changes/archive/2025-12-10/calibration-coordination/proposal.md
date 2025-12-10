# Calibration Coordination Protocol

**Created:** November 30, 2025
**Priority:** MEDIUM
**Effort:** 2-3 hours

---

## Rationale

Session 21 architecture review discovered calibration divergence in `oceanAcidification.ts`:
- Two competing calibrations existed: "Updated upstream" (70% reduction, pH=8.0) vs "Stashed changes" (50% reduction, pH=7.95)
- Suggests multiple autonomous workers calibrating same parameters independently

**Impact:**
- Wasted effort (duplicate calibration work)
- Research inconsistency (which calibration is "correct"?)
- Merge conflicts requiring manual resolution
- Loss of calibration rationale (which research backing applies?)

**Root cause:** Multi-worker git architecture enables parallel work, but lacks coordination mechanism for calibration.

---

## Scope

Create calibration coordination system with three components:

1. **Calibration Ownership Registry** (`docs/CALIBRATION_OWNERSHIP.md`)
   - Track active calibrations to prevent conflicts
   - Status: STABLE (available) vs ACTIVE (being worked on)
   - Document research backing for each calibration

2. **Pre-calibration Check** (autonomous worker scripts)
   - Check ownership before starting calibration
   - Block if calibration already in progress
   - Prevent duplicate work

3. **Calibration Documentation Template** (`research/calibration_template.md`)
   - Standardize calibration rationale documentation
   - Ensure research backing is preserved
   - Track hindcast/Monte Carlo validation

---

## Success Criteria

1. **Functional:**
   - Zero calibration conflicts in next 30 days
   - Workers successfully coordinate via ownership registry
   - All calibrations have documented research backing

2. **Documentation:**
   - `docs/CALIBRATION_OWNERSHIP.md` created and maintained
   - `research/calibration_template.md` exists
   - Protocol documented in `docs/DEVELOPMENT_WORKFLOW.md`
   - Ocean pH calibration backfilled with rationale

3. **Process:**
   - Autonomous workers check ownership before calibration
   - Calibration rationale survives in git history

---

## Sources

- Session 21 architecture review (ocean pH divergence discovery)
- Multi-worker git architecture (HIGH-3)
- Research integrity standards (parameter justification Grade A-)
