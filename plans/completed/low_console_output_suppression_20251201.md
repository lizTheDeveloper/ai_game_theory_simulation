# Console Output Suppression for Parameter Sweeps

**Date:** December 1, 2025
**Status:** PROPOSED
**Priority:** LOW
**Effort:** 2-3 hours
**Assignee:** Roy (simulation-maintainer)

## Problem Statement

Parameter sweep scripts produce excessive console output (gigabytes), making them impractical to run:

**Current Situation:**
- L-1 bifurcation threshold sweep: 60 simulations × 120 months = massive warning output
- Console.log suppressed in minimal script, but console.warn still active
- Early Warning System, AI Financial Distress, and other phases emit warnings every month
- Log files become unmanageable (>100MB for single sweep)

**Impact:**
- L-1 bifurcation threshold validation blocked
- Parameter sweep execution deferred
- Token waste reviewing truncated logs

## Root Cause

Simulation phases use `console.warn()` for legitimate warnings, but:
1. Parameter sweeps don't need real-time warning monitoring
2. Warnings accumulate across N×M iterations (60 runs × 120 months = 7,200 simulation steps)
3. No built-in way to suppress warnings during sweep mode

## Proposed Solution

**Option 1: Environment Variable (Recommended)**
```typescript
// In simulation engine or phase orchestrator
const SUPPRESS_WARNINGS = process.env.SIMULATION_QUIET_MODE === 'true';

// Wrapper function
function logWarning(message: string) {
  if (!SUPPRESS_WARNINGS) {
    console.warn(message);
  }
}
```

**Option 2: Logger Utility**
```typescript
// src/simulation/utils/logger.ts
export const logger = {
  warn: (message: string) => {
    if (process.env.NODE_ENV !== 'sweep') {
      console.warn(message);
    }
  },
  // ... other methods
};
```

**Option 3: Script-Level Suppression (Current Approach)**
```typescript
// Already implemented in bifurcationThresholdSweepMinimal.ts
console.warn = () => {};  // Nuclear option
```

## Recommendation

**Option 1 (Environment Variable)** with graceful degradation:
- Add `SIMULATION_QUIET_MODE` environment variable
- Phases check variable before warning
- Sweeps set `SIMULATION_QUIET_MODE=true`
- Normal runs unaffected (warnings still shown)

## Implementation Plan

**Phase 1: Add Logger Utility (1 hour)**
1. Create `src/simulation/utils/logger.ts` with environment-aware logging
2. Export `quietWarn()`, `quietLog()` functions
3. Add JSDoc documenting when to use vs direct console

**Phase 2: Migrate High-Volume Warnings (1 hour)**
1. Identify phases with per-month warnings:
   - EarlyWarningSystemPhase
   - AIFinancialDistressPhase
   - BifurcationLogicPhase
   - Others TBD
2. Replace `console.warn()` with `quietWarn()`
3. Keep critical errors as `console.error()` (never suppressed)

**Phase 3: Update Sweep Scripts (30 min)**
1. Set `process.env.SIMULATION_QUIET_MODE = 'true'` at script start
2. Remove hacky `console.warn = () => {}` overrides
3. Test with L-1 bifurcation threshold sweep

**Phase 4: Validation (30 min)**
1. Run sweep with quiet mode (verify minimal output)
2. Run normal simulation (verify warnings still appear)
3. Verify no errors silently swallowed

## Success Criteria

1. ✅ L-1 bifurcation sweep produces <10MB log file (vs >100MB currently)
2. ✅ Normal simulation runs still show warnings
3. ✅ Critical errors always visible (never suppressed)
4. ✅ Type checking passes, tests pass

## Non-Goals

- Don't suppress critical errors (simulation crashes, NaN detection)
- Don't suppress first-time warnings (useful for debugging)
- Don't add complex logging infrastructure (keep it simple)

## Dependencies

- None (can implement immediately)

## Impact

- **Unblocks:** L-1 bifurcation threshold validation
- **Enables:** Future parameter sweeps (climate sensitivity, carbon sink, etc.)
- **Improves:** Developer experience (manageable log files)

## Alternative Considered

**Log Rotation:** Instead of suppressing, rotate logs every N lines. **Rejected** because:
- Still generates gigabytes of data
- Doesn't solve root problem (unnecessary warnings during sweeps)
- Adds complexity

## Next Steps

1. Get approval for Option 1 approach
2. Implement Phase 1-4 (2-3 hours)
3. Execute L-1 bifurcation sweep with clean logs
4. Document pattern in CLAUDE.md for future sweeps
