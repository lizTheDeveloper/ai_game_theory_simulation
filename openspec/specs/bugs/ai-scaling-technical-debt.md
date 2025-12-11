# AI Scaling Technical Debt

**Created:** December 11, 2025
**Feature:** Three-Axis AI Scaling Model
**QG2 Grade:** B- (Acceptable with HIGH priority improvements needed)
**Status:** Safe to ship, fixes scheduled between features

---

## HIGH Priority (7-11 hours total)

### HIGH-1: Performance Overhead - Dynamic Requires in Hot Paths
**Issue:** aiScalingStrategy.ts uses dynamic requires, adding ~10ms per simulation step
**Impact:** Performance overhead in phase execution
**Fix:** Convert to static imports at module level
**Effort:** 1-2 hours
**File:** `src/simulation/aiScalingStrategy.ts`

### HIGH-2: Circular Dependency Risk
**Issue:** capabilities.ts ⟷ aiScalingStrategy.ts potential circular dependency
**Impact:** Risk of initialization order issues, breaks module boundaries
**Fix:** Refactor to unidirectional dependency (aiScalingStrategy → capabilities)
**Effort:** 4-6 hours
**Files:** `src/simulation/systems/capabilities.ts`, `src/simulation/aiScalingStrategy.ts`

### HIGH-3: No State Evolution Tracking
**Issue:** No history of AI scaling component changes over time
**Impact:** Can't debug capability changes, no visibility into scaling evolution
**Fix:** Add `aiScalingHistory: Array<{month, preTraining, efficiency, testTime}>` to GameState
**Effort:** 2-3 hours
**Files:** `src/types/game.ts`, `src/simulation/aiScalingStrategy.ts`, dashboard components

---

## MEDIUM Priority

### MEDIUM-1: Test Coverage Gaps
**Issue:** No unit tests for scaling strategy functions
**Impact:** Regression risk when fixing HIGH priority items
**Fix:** Add test suite for calculateEffectiveCapability, updateScalingComponents, etc.
**Effort:** 2-3 hours

### MEDIUM-2: Magic Numbers in Scaling Formulas
**Issue:** Hard-coded constants (0.2, 0.15, 100, etc.) in scaling calculations
**Impact:** Parameter changes require code edits, not easily tunable
**Fix:** Extract to configuration object with documentation
**Effort:** 1 hour

### MEDIUM-3: No Dashboard Visualization
**Issue:** Scaling components not visible in frontend
**Impact:** Can't visually verify scaling evolution
**Fix:** Add dashboard widget showing preTraining/efficiency/testTime over time
**Effort:** 3-4 hours

---

## LOW Priority

### LOW-1: Incomplete JSDoc
**Issue:** aiScalingStrategy.ts functions lack complete documentation
**Impact:** Harder for future maintainers to understand
**Fix:** Add comprehensive JSDoc comments with parameter ranges, examples
**Effort:** 30 minutes

### LOW-2: Inconsistent Naming
**Issue:** Mix of "test-time compute" and "testTimeCompute" naming
**Impact:** Minor code clarity issue
**Fix:** Standardize on camelCase throughout
**Effort:** 30 minutes

### LOW-3: No Economic Deployment Metrics
**Issue:** deploymentFraction calculated but not exposed for analysis
**Impact:** Can't measure economic constraints impact
**Fix:** Add to GameState metrics, track over time
**Effort:** 1 hour

---

## Timeline

**Recommended schedule:**
1. Complete current sprint work
2. Address HIGH-1 (dynamic requires) - Quick win, measurable perf improvement
3. Address HIGH-2 (circular dependency) - Architectural cleanup
4. Address HIGH-3 (state tracking) - Enables debugging
5. MEDIUM/LOW items as time permits

**Total HIGH priority effort:** 7-11 hours
**Total MEDIUM priority effort:** 6-8 hours
**Total LOW priority effort:** 2 hours

---

## Risk Assessment

**Risk of NOT fixing:**
- HIGH-1: Ongoing performance overhead (minor, ~10ms/step)
- HIGH-2: Potential initialization order bugs (moderate, may cause subtle issues)
- HIGH-3: Reduced debuggability (low, workaround via logs)

**Overall risk:** LOW - System is stable, these are polish/quality improvements

**Recommendation:** Safe to ship now, schedule fixes between features

---

**Reference:**
- Architecture Review: Informal (documented in completion summary)
- Completion Summary: `docs/implementation-history/2025-12/ai_scaling_implementation_20251211.md`
- Implementation: `src/simulation/aiScalingStrategy.ts`
