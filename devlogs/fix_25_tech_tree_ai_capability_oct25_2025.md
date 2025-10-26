# FIX #25: Tech Tree AI Capability Returning 0

**Date:** October 25, 2025
**Severity:** CRITICAL
**Impact:** ALL breakthrough technologies were failing to unlock due to AI capability appearing as 0.00
**Status:** FIXED

## Problem

Monte Carlo simulations showed:
- **Technologies unlocked:** 12-13 per run (only TIER 0 pre-deployed tech)
- **Technologies deployed:** 0 fully deployed
- **Tech effects:** NONE (no phosphorus recovery, no freshwater improvements, no climate tech)
- **AI Capability reading:** 0.00 (but actual Total AI Capability: 60-70)

Example from logs:
```
🔍 TECH TREE DEBUG (Month 51):
   Checking 60 locked technologies
   Unlocked: 13 technologies
   AI Capability: 0.00 (need 1.5+ for most techs)  ← BUG!
   Economic Stage: 3.5 (need 2.5+ for most techs)
   First 3 unlocked: rlhf_basic, mech_interp_basic, adversarial_eval
```

But elsewhere in same log:
```
Total AI Capability: 64.00  ← Actual value
```

## Root Cause

In `src/simulation/techTree/engine.ts:519`, the `getAverageAICapability` function used an **inline require()**:

```typescript
function getAverageAICapability(gameState: GameState): number {
  const activeAIs = gameState.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
  if (activeAIs.length === 0) return 0;

  const { calculateTotalCapabilityFromProfile } = require('../capabilities');  // ← BUG!
  const totalCapability = activeAIs.reduce(
    (sum, ai) => sum + calculateTotalCapabilityFromProfile(ai.capabilityProfile),
    0
  );

  return totalCapability / activeAIs.length;
}
```

The inline `require()` was **silently failing** during simulation execution (likely circular dependency), causing `calculateTotalCapabilityFromProfile` to be `undefined`, which made the reduce operation return 0.

This worked fine at initialization (see `scripts/testAICapability.ts` - returned 3.031 correctly), but failed during simulation runs.

## Fix

Moved the import to the top of the file:

```typescript
// At top of file
import { calculateTotalCapabilityFromProfile } from '../capabilities';

// Inside function (fixed)
function getAverageAICapability(gameState: GameState): number {
  const activeAIs = gameState.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
  if (activeAIs.length === 0) return 0;

  // FIX #25: Import at top of file instead of inline require
  const totalCapability = activeAIs.reduce(
    (sum, ai) => sum + calculateTotalCapabilityFromProfile(ai.capabilityProfile),
    0
  );

  return totalCapability / activeAIs.length;
}
```

**File:** `src/simulation/techTree/engine.ts:11,520-527`

## Impact

### Before Fix
- **TIER 1 techs unlocked:** 0% (phosphorus recovery, desalination, PFAS remediation)
- **TIER 2 techs unlocked:** 0% (enhanced UBI, scalable oversight, grid batteries)
- **TIER 3 techs unlocked:** 0% (fusion, disease elimination, vertical farming)
- **Ecological recovery:** IMPOSSIBLE (no tech deployment)
- **Climate mitigation:** IMPOSSIBLE (no clean energy deployment)
- **Resource crises:** UNMITIGATED (no freshwater/phosphorus tech)

### After Fix (Expected)
- **TIER 1 techs:** Unlock at AI capability 0.5-1.5 (months 10-30)
- **TIER 2 techs:** Unlock at AI capability 1.5-2.5 (months 30-60)
- **TIER 3 techs:** Unlock at AI capability 2.5-4.0 (months 60-100)
- **Full tech tree functioning:** All 71 technologies can now unlock based on actual AI capability

## Validation

Running Monte Carlo N=10, 120 months to verify:
1. AI capability now reads correctly (>0.00)
2. Technologies unlock based on actual AI capability thresholds
3. Technologies deploy (deployment level > 0)
4. Tech effects apply to game state (phosphorus recovery, freshwater improvement, etc.)

**Command:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 > logs/tech_fix_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

## Lesson Learned

**Never use inline require() inside hot-path functions.** Always import at the top of the file to avoid:
- Circular dependency issues
- Silent failures during runtime
- Performance overhead from repeated require() calls

Inline requires are acceptable for:
- Lazy loading of heavy modules
- Dynamic imports based on configuration
- Development/debugging code that won't run in production

But NOT for core simulation logic that runs every phase of every month.

## Related Issues

- This is why ecology recovery (FIX #14) showed minimal improvement despite tech implementation
- This is why all Monte Carlo runs showed identical outcomes (no tech differentiation)
- This is why "Deployed Tech: T0=10 T1=0 T2=0 T3=0 T4=0" logs showed only TIER 0

## Files Modified

- `src/simulation/techTree/engine.ts` (lines 11, 520-527)

## Testing Required

- [x] Create diagnostic script (`scripts/testAICapability.ts`)
- [ ] Validate fix with Monte Carlo N=10
- [ ] Check tech unlock progression in logs
- [ ] Verify tech deployment levels > 0
- [ ] Confirm tech effects visible in state changes
- [ ] Run full validation N=100, 240 months

---

**Fix Severity:** CRITICAL - This bug prevented the entire breakthrough technology system from functioning.
