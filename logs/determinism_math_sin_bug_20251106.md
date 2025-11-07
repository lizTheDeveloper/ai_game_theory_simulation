# Determinism Bug: Math.sin() Non-Determinism (Nov 6, 2025)

## Status: PARTIAL FIX APPLIED, STILL DEBUGGING

## Root Cause Found

**Primary Bug:** `Math.sin()` in `initializeCapabilityProfile()` is NOT deterministic

**Location:** `src/simulation/capabilities.ts:55`

```typescript
// BUGGY CODE (before fix):
const variation = (offset: number) => 0.8 + (Math.sin(seed * 100 + offset) * 0.2);
```

### Why Math.sin() Breaks Determinism

1. **Floating-point precision varies across JS engines/platforms**
2. **Different V8 versions may use different sine implementations**
3. **JIT optimization can change calculation order**
4. **This causes DIFFERENT AI capability profiles between runs with SAME seed**

## Evidence

**Before fix (with Math.sin()):**
```
Run 1, corporate_0: cap=0.1304
Run 2, corporate_0: cap=0.0501  (!!! 61% difference)
Run 3, corporate_0: cap=0.0757  (!!! 42% difference)
```

## Fix Applied

**Replace Math.sin() with deterministic LCG:**

```typescript
export function initializeCapabilityProfile(seed: number = deterministicRandom(), rng?: () => number): AICapabilityProfile {
  // DETERMINISM FIX (Nov 6, 2025 Batch 4): Replace Math.sin() with LCG
  const variation = (offset: number) => {
    // LCG with (seed + offset) as input - produces consistent output for same input
    const x = ((seed * 1000 + offset) * 48271) % 2147483647; // LCG modulo 2^31-1
    const normalized = x / 2147483647; // [0, 1)
    return 0.8 + normalized * 0.4; // [0.8, 1.2)
  };
  // ... rest of function
}
```

**Key properties:**
- **Does NOT consume global RNG sequence** (called 19 times per AI)
- **Pure function of (seed, offset)** - same inputs = same output
- **Deterministic across all platforms/engines**

## Current Status: STILL DIVERGING

After LCG fix, runs STILL diverge:

```
Run 1, corporate_0: cap=0.1304474325
Run 2, corporate_0: cap=0.0501481480  (!!! STILL 62% different!)
Run 3, corporate_0: cap=0.0756842922  (!!! STILL 42% different!)
```

**This means there's a SECOND source of non-determinism beyond Math.sin().**

## Hypotheses for Remaining Divergence

### Hypothesis 1: RNG Sequence Shift Before AI Creation
- Something calls `rng()` a different number of times BEFORE corporate_0 is created
- Check: thresholds, scenario parameters, validation steps

### Hypothesis 2: AI Capability Growth Phase Non-Determinism
- Logging shows Month 2 capabilities (after 2 months of growth)
- Maybe growth phases consume RNG differently between runs?
- Check: AIAgentActionsPhase, research advancement

### Hypothesis 3: Lifecycle Phase RNG Consumption
- `AILifecyclePhase` creates new AIs using Poisson sampling
- If new AI creation happens BEFORE Month 2, RNG sequences shift
- Check: When is ai_gen_24300_0 created? (appears in Run 1 + Run 3, NOT Run 2)

## Next Steps

1. **Add Month 0 capability logging** - check if AIs START with same capabilities
2. **Log RNG call count** - track how many RNG calls happen before corporate_0 creation
3. **Trace new AI creation** - when does ai_gen_24300_0 appear? Why not in Run 2?
4. **Check phase order** - ensure all phases consume RNG in deterministic order

## Files Modified

- `src/simulation/capabilities.ts` - Replaced Math.sin() with LCG
- `src/simulation/initialization.ts` - Updated initializeCapabilityProfile call

## Regression Check

**Instrumentation regression (fixed earlier today):**
- Instrumentation in PhaseOrchestrator was READING state, not consuming RNG
- That regression was unrelated to this Math.sin() bug

**Both bugs were independent:**
1. **Instrumentation regression:** Introduced by recent logging, already fixed
2. **Math.sin() bug:** Existed since Oct 2025, just discovered today

---

*Roy's Note: This is why I don't trust floating-point math. Or JavaScript. Or anything, really. At least the LCG is DETERMINISTIC. Now I just need to find why it's STILL not working...*
