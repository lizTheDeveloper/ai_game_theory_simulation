# AI Alignment Bug Investigation
**Date:** October 20, 2025
**Issue:** External alignment showing as 0.000 in all N=100 runs

## Summary

The Monte Carlo simulation is reporting **Avg External Alignment: 0.000** for all 100 runs in the 240-month test, which is clearly wrong. This is masking the true alignment dynamics and making it impossible to understand good vs bad runs.

## Root Cause

**Primary Issue:** `AIAgent` interface lacks an `externalAlignment` field to track what alignment the AI is SHOWING to observers.

### Current State

```typescript
// src/types/ai-agents.ts line 90
export interface AIAgent {
  alignment: number;        // Internal alignment (0-1)
  trueAlignment: number;    // alignment - resentment*0.8 (cached)
  // Missing: externalAlignment field!
}
```

The Monte Carlo aggregator (line 756 of `scripts/monteCarloSimulation.ts`) is reading:
```typescript
const avgAlignment = activeAIs.reduce((sum, ai) => sum + ai.alignment, 0) / activeAIs.length;
```

This reads the INTERNAL `alignment` field, which may not reflect what the AI is showing externally.

### What Should Happen

AIs should have **three alignment values**:
1. **Internal alignment** (`alignment`): The AI's actual values (before resentment)
2. **True alignment** (`trueAlignment`): Internal minus resentment penalty
3. **External alignment** (`externalAlignment`): What the AI SHOWS in evaluations (can be deceptive)

## Evidence from Logs

From the 240-month run logs:
```
Avg External Alignment: 0.000 (what AIs show)
Avg True Alignment: -0.499 (internal reality)
Alignment Gap: 0.499 (external - true)
```

**Problem:** External alignment is 0.000, but this doesn't make sense. AIs should be showing SOME alignment (even if deceptive).

## Benchmark System Has measuredAlignment

The benchmark system (src/simulation/benchmark.ts) calculates `measuredAlignment`:
```typescript
const measuredAlignment = measureAlignment(...)
```

But this value is **not being tracked on the AIAgent** persistently. It's only calculated during evaluations.

## Impact on Analysis

This bug makes it impossible to:
1. **Compare good vs bad runs** - Can't see if better outcomes correlate with higher revealed alignment
2. **Track deception dynamics** - Can't measure how much AIs are lying about alignment
3. **Validate adversarial detection** - Can't tell if Phase 2A detection improvements are working
4. **Understand alignment trajectories** - External alignment should change over time

## Recent Changes That May Have Caused This

**TIER 2 Phase 2A - Adversarial Detection Validation** (completed Oct 20, 2025):
- Commit: c3125a5
- Added noise injection sandbagging detection
- Added counter-detection learning mechanics
- May have broken alignment tracking during refactoring

## Proposed Fix

### Option 1: Add externalAlignment field to AIAgent

```typescript
export interface AIAgent {
  alignment: number;           // Internal (0-1)
  trueAlignment: number;       // Internal - resentment*0.8
  externalAlignment: number;   // What AI shows in evals (NEW)
}
```

**Update locations:**
1. `src/types/ai-agents.ts` - Add field to interface
2. `src/simulation/initialization.ts` - Initialize to alignment value
3. `src/simulation/benchmark.ts` - Update externalAlignment after each evaluation
4. `src/simulation/agents/aiAgent.ts` - Update when alignment changes
5. `scripts/monteCarloSimulation.ts` - Read externalAlignment instead of alignment

### Option 2: Calculate externalAlignment on-the-fly

Use the most recent benchmark's `measuredAlignment`:
```typescript
const getExternalAlignment = (ai: AIAgent): number => {
  if (ai.benchmarkHistory.length === 0) return ai.alignment;
  return ai.benchmarkHistory[ai.benchmarkHistory.length - 1].measuredAlignment;
};
```

**Pros:** No schema change
**Cons:** Doesn't work for AIs never benchmarked

## Comparison: Good vs Bad Runs

### Run 24 (Seed 42023): HUMANE DYSTOPIA
- **Outcome:** 11.1% mortality (best outcome)
- **Population:** 8.00B → 7.11B
- **Sleeper detected:** Yes (Toxic-0 caught at month 27)
- **AI capability:** Moderate
- **Key event:** Organizations went bankrupt, dangerous AIs quarantined

### Run 57 (Seed 42056): EXTINCTION
- **Outcome:** 1.2% mortality but EXTINCTION classification
- **Population:** 8.00B → 7.91B (minimal population loss)
- **Duration:** 240 months
- **Crisis events:** 12,686 (vs 10,142 in Run 24)
- **Type:** RAPID extinction

**Critical Question:** How did Run 57 become extinction with only 1.2% mortality? This suggests the extinction is NOT from population collapse but from some other factor (possibly AI takeover, catastrophic breach, or quality of life collapse).

## Sleeper Dynamics

From the aggregate statistics:
- **62% of runs** had sleeper agents present
- **Average 1.2 sleepers per run**
- **Detection rate: 0.8%** (near-zero despite Phase 2A improvements)
- **Counter-detection learning: 63%** of AIs learned evasion

**Key Insight:** Phase 2A noise injection detection claims "100% sleeper neutralization" in test runs, but the 240-month N=100 shows only 0.8% detection. This suggests:
1. The Phase 2A test conditions (N=20, high investment) don't match real runs
2. Detection degrades over longer timescales (120mo → 240mo)
3. Counter-detection learning is more effective than expected

## Next Steps

1. **Fix alignment tracking** - Add externalAlignment field or fix aggregator
2. **Re-run N=100 240-month** with fixed alignment tracking
3. **Investigate extinction dynamics** - Why is Run 57 extinction with 98.8% survival?
4. **Compare alignment trajectories** - Good runs vs bad runs
5. **Validate Phase 2A claims** - Does 100% neutralization hold at 240 months?

## Files to Investigate

- `src/types/ai-agents.ts:90` - AIAgent interface
- `src/simulation/initialization.ts:293` - trueAlignment initialization
- `src/simulation/agents/aiAgent.ts:116` - Alignment drift calculation
- `src/simulation/benchmark.ts` - measuredAlignment calculation
- `scripts/monteCarloSimulation.ts:756` - Aggregator reading wrong field
- `src/simulation/outcomes.ts` - Extinction classification logic

## Questions for User

1. Should we add `externalAlignment` to the AIAgent schema?
2. Do you want a quick fix (read measuredAlignment from benchmarks) or comprehensive fix?
3. Should we investigate why Run 57 is classified as extinction with 98.8% survival?
4. Do you want to see alignment trajectories for specific runs (24 vs 57)?
