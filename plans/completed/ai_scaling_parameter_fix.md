# AI Capability Scaling Parameter Implementation Specification

**Date:** 2025-11-13
**Orchestrator:** orchestrator-1
**Agent:** simulation-maintainer (Roy)
**Priority:** CRITICAL

## Research Validation Summary

**Sources (Grade A):**
- Cottier et al. (2024) - arXiv:2405.21015v2 (6 authors, Epoch AI + Stanford)
- Sevilla & Roldán (2024) - Epoch AI (14-year trend, 90% CI provided)

**Finding:** Current simulation underestimates AI capability growth by **2.8×**

## Current Implementation

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/computeInfrastructure.ts`

**Current Parameters (Lines 708, 753):**
```typescript
// Hardware (Moore's Law) - Line 708
Math.pow(2, 1/8) - 1  // 9.05% per month → doubles every 8 months → 3.3× per year

// Algorithmic - Line 753
Math.pow(1.10, 1/12) - 1  // 0.797% per month → 10% per year → 1.1× per year

// Combined: 3.3 × 1.1 = 3.63× per year
```

## Research-Backed Updates

**Conservative Implementation (using 90% CI lower bound):**

```typescript
// Hardware (Training Compute) - Line 708
// Research: 4.1× per year (90% CI: 3.7-4.6×)
// Conservative: Use 3.7× (lower bound)
Math.pow(3.7, 1/12) - 1  // 11.45% per month → 3.7× per year

// Algorithmic Efficiency - Line 753
// Research: 2.5× per year (Epoch AI 2024)
Math.pow(2.5, 1/12) - 1  // 7.73% per month → 2.5× per year

// Combined: 3.7 × 2.5 = 9.25× per year (conservative)
```

## Implementation Tasks

### Task 1: Update Hardware Growth Rate (Line ~708)

**Location:** `src/simulation/computeInfrastructure.ts:708`

**Current:**
```typescript
const MOORES_LAW_RATE = Assertions.assertFinite(
  Math.pow(2, 1/8) - 1, // 9.05% per month (doubles every 8 months)
  { location: 'applyComputeGrowth_moores', valueName: 'MOORES_LAW_RATE', month: state.currentMonth }
);
```

**Updated:**
```typescript
const MOORES_LAW_RATE = Assertions.assertFinite(
  Math.pow(3.7, 1/12) - 1, // 11.45% per month (3.7× per year, Sevilla & Roldán 2024 - 90% CI lower bound)
  { location: 'applyComputeGrowth_moores', valueName: 'MOORES_LAW_RATE', month: state.currentMonth }
);
```

**Add comment above (Line ~693):**
```typescript
// HARDWARE GROWTH RATE (Training Compute)
// Research: Sevilla & Roldán (2024) - Epoch AI
// "Training compute of frontier AI models grows by 4.1×/year (90% CI: 3.7× to 4.6×)"
// Conservative: Using 3.7× (lower bound of 90% CI)
// Source: https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year
// Math.pow(3.7, 1/12) = 1.1145 = 11.45% per month
```

### Task 2: Update Algorithmic Efficiency Rate (Line ~753)

**Location:** `src/simulation/computeInfrastructure.ts:753`

**Current:**
```typescript
let CONTINUOUS_ALGO_RATE = Math.pow(1.10, 1/12) - 1; // 10% annual → 0.797% monthly
```

**Updated:**
```typescript
let CONTINUOUS_ALGO_RATE = Math.pow(2.5, 1/12) - 1; // 2.5× annual → 7.73% monthly (Epoch AI 2024)
```

**Add comment above (Line ~749):**
```typescript
// ALGORITHMIC EFFICIENCY GROWTH RATE
// Research: Epoch AI (2024) - Algorithmic improvements
// "Algorithmic efficiency improves by 2.5× per year (2× every 9 months)"
// This is INDEPENDENT of hardware improvements (measured in compute-equivalent gains)
// Math.pow(2.5, 1/12) = 1.0773 = 7.73% per month
```

### Task 3: Update centralConfig.ts Documentation (Optional)

**File:** `src/simulation/config/centralConfig.ts`

**Lines 397, 404:** These appear unused by current implementation, but update comments for documentation:

```typescript
AI_CAPABILITY_DOUBLING_TIME: 12, // DEPRECATED - See computeInfrastructure.ts for actual implementation (9.25× per year)
...
COMPUTE_GROWTH_RATE: 1.0, // DEPRECATED - See computeInfrastructure.ts for actual implementation (3.7× hardware + 2.5× algorithmic)
```

## Validation Requirements

### Pre-Commit Checks

1. **Type Safety:** Run `npx tsc --noEmit`
2. **Unit Tests:** Run `npm test` (ensure no regressions)
3. **NaN Audit:** Verify no NaN values in compute calculations
4. **Emoji Registration:** Ensure any new log emojis are in EMOJI_EVENT_MAP.txt

### Post-Commit Validation (Coordinate with Priya)

1. **Monte Carlo Validation:** N≥10 runs with new parameters
2. **Outcome Distribution Comparison:** Before vs After
3. **Determinism Check:** CV < 0.01% for identical seeds
4. **Effectiveness Analysis:** Does faster AI growth produce expected effects?

## Expected Impact

**Simulation Dynamics:**
- ✅ Faster AI capability growth (3.63× → 9.25× per year)
- ✅ Earlier breakthrough technologies (AGI, superintelligence)
- ✅ Compressed timelines for alignment challenges
- ⚠️ Potentially higher dystopia risk (less time to align)
- ⚠️ Potentially higher utopia chance (faster problem-solving)

**Outcome Distribution Changes:**
- Expect shift toward extreme outcomes (utopia OR dystopia)
- Expect shorter time-to-resolution (AGI arrives faster)
- Expect higher variance in Monte Carlo runs (faster dynamics = more sensitivity)

## Implementation Checklist

- [ ] Update Line ~708: Hardware growth rate (3.3× → 3.7×)
- [ ] Add research citation comment (Lines ~693-700)
- [ ] Update Line ~753: Algorithmic growth rate (1.1× → 2.5×)
- [ ] Add research citation comment (Lines ~749-752)
- [ ] Update centralConfig.ts comments (mark as deprecated)
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Run unit tests: `npm test`
- [ ] Verify no NaN values introduced
- [ ] Commit changes with proper message (research citations)
- [ ] Coordinate with Priya for Monte Carlo validation

## Research Citations (For Commit Message)

**References:**
1. Sevilla, J., & Roldán, E. (2024). "Training compute of frontier AI models grows by 4-5x per year." *Epoch AI Blog*. https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year
2. Cottier, B., et al. (2024). "The Rising Costs of Training Frontier AI Models." *arXiv:2405.21015v2*.
3. Epoch AI (2024). "Algorithmic efficiency improvements" - 2.5× per year (2× every 9 months).

**Commit Message Template:**
```
fix(compute): Update AI capability growth to research-backed rates

CRITICAL parameter fix: Current simulation underestimates AI capability
growth by 2.8× (3.63× vs 9.25× per year).

Changes:
- Hardware growth: 3.3× → 3.7× per year (Sevilla & Roldán 2024, 90% CI lower)
- Algorithmic growth: 1.1× → 2.5× per year (Epoch AI 2024)
- Combined: 3.63× → 9.25× per year (conservative estimate)

Research:
- Sevilla & Roldán (2024): Training compute grows 4.1×/yr (90% CI: 3.7-4.6×)
- Epoch AI (2024): Algorithmic efficiency grows 2.5×/yr
- Cottier et al. (2024): arXiv:2405.21015v2

Impact: Faster AI capability growth → compressed timelines → more realistic
dynamics for alignment challenges and breakthrough technologies.

Verification: research/verification_0a1e5b8_20251107.md
Requires: Monte Carlo validation (N≥10) to verify outcome distributions
```

## Safety Notes

**Why Conservative (3.7× vs 4.1×)?**
- Using lower bound of 90% CI reduces risk of overestimation
- Research simulation should bias toward conservative parameters
- Can update to 4.1× after Monte Carlo validation if stable

**Rollback Plan:**
If Monte Carlo validation shows instabilities:
1. Revert to current parameters (3.3× hardware, 1.1× algorithmic)
2. Implement gradual increase (e.g., 3.3× → 3.5× → 3.7×)
3. Investigate architectural bottlenecks preventing faster growth

**Next Agent:** Priya (priya) for Monte Carlo validation after implementation

---

**Orchestrator Note:** This is a well-researched, conservative implementation of a critical parameter fix. Proceed with confidence, but coordinate with Priya for validation before considering this complete.
