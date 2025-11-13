# BREAKING CHANGE: AI Scaling Parameters (Nov 11, 2025)

**Status:** IMPLEMENTED
**Priority:** CRITICAL
**Impact:** 10,000,000× correction to AI capability growth

---

## Summary

Fixed massive underestimation of AI capability growth by updating parameters to match 14-year empirical data from Epoch AI.

**Previous simulation:** 1,024× over 10 years (12-month doubling)
**Current simulation:** 12,700,000,000× over 10 years (3.6-month doubling)
**Correction factor:** ~10,000,000× (10 million times faster)

---

## What Changed

### 1. centralConfig.ts Parameters

**AI_CAPABILITY_DOUBLING_TIME:**
- **Before:** 12 months
- **After:** 3.6 months
- **Rationale:** Combined compute scaling (4.1×/yr) + algorithmic efficiency (2.5×/yr) = 10.25× per year

**COMPUTE_GROWTH_RATE:**
- **Before:** 1.0 (ln scale) → 2× per year
- **After:** 1.41 (ln scale) → 4.1× per year
- **Rationale:** Sevilla & Roldán (2024) - 14-year empirical trend (90% CI: 3.7× to 4.6×)

### 2. computeInfrastructure.ts Implementation

**Hardware growth (lines 692-739):**
- Removed hardcoded 8-month doubling (`Math.pow(2, 1/8)`)
- Now uses `RATES.COMPUTE_GROWTH_RATE` from config
- Calculation: `exp(1.41/12) - 1` = 12.47% per month → 4.1× per year

**Algorithmic efficiency (lines 765-789):**
- Removed hardcoded 10% annual (`Math.pow(1.10, 1/12)`)
- Now uses research-backed 2.5× per year (150% annual)
- Calculation: `exp(ln(2.5)/12) - 1` = 7.93% per month → 2.5× per year

### 3. Growth Verification

**Hardware (compute):**
- Monthly rate: 12.47%
- Annual multiplier: 4.10×
- 10-year growth: 1,329,083×

**Algorithmic:**
- Monthly rate: 7.93%
- Annual multiplier: 2.50×
- 10-year growth: 9,537×

**Combined:**
- Annual multiplier: 10.24×
- 10-year growth: 12,700,000,000× (1.27e+10)
- Implied doubling time: 3.6 months ✅

---

## Impact on Simulation

### Timeline Compression

Events that occurred in simulation year 10 may now occur in year 2-3.

**Example timeline shift:**
- **Before:** AGI-level capability at month 120 (10 years)
- **After:** AGI-level capability at month 36-48 (3-4 years)

### Gameplay Dynamics

1. **Alignment difficulty:** Less time for safety work between capability jumps
2. **Economic disruption:** Labor displacement happens much faster
3. **Tech concentration:** Advantages compound faster, oligopoly forms sooner
4. **Governance window:** Critical oversight period drastically shortened
5. **Crisis cascades:** AI-driven risks emerge earlier in timeline

### Save Game Compatibility

**BREAKING CHANGE:** Existing save games are incompatible with this version.

**Reason:** AI capability progression is fundamentally different. Loading an old save would result in:
- AI capabilities mismatched with actual month count
- Compute infrastructure efficiency values out of sync
- Downstream systems (research, alignment, economics) expecting wrong AI levels

**Recommendation:** Start new games after this update.

---

## Research Justification

### Compute Growth: 4.1× per year

**Source:** Sevilla & Roldán (2024), Epoch AI
**URL:** https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year
**Data:** 14-year empirical trend (2010-2024)
**Confidence:** HIGH (90% CI: 3.7× to 4.6×)

**Key findings:**
- Training compute grows 4.1× per year on average
- Language models specifically: 5× per year post-2020
- GPT-4 training cost: $40 million (2023)
- $1 billion training runs projected by 2027

### Algorithmic Efficiency: 2.5× per year

**Source:** Epoch AI (2024), "Revisiting Algorithmic Progress"
**URL:** https://epoch.ai/blog/revisiting-algorithmic-progress
**Data:** Computer vision domain (2012-2022)
**Confidence:** HIGH (95% CI provided)

**Key findings:**
- Algorithmic efficiency doubles every 9 months
- Equivalent to 2.5× per year improvement
- Independent of compute scaling (same hardware, better algorithms)
- Examples: Transformers (10-100×), Flash Attention (2-3×), MoE (2-4×)

### Combined Growth: 10.25× per year

**Calculation:** 4.1× (compute) × 2.5× (algorithmic) = 10.25× per year
**Doubling time:** 12 / (log(10.25) / log(2)) = 3.6 months
**10-year growth:** 10.25^10 = 12,700,000,000×

**Verification document:** `research/ai_scaling_verified_parameters_20251111.md` (Grade A)

---

## Implementation Details

### Defensive Coding

All growth rate calculations use assertion utilities:
```typescript
// Validate parameter exists and is in reasonable range
const computeGrowthRate = Assertions.assertInRange(
  RATES.COMPUTE_GROWTH_RATE,
  0.0, // Minimum (pessimistic scenario)
  5.0, // Maximum ln(148) (unrealistically fast)
  { location: 'applyComputeGrowth_hardware', valueName: 'RATES.COMPUTE_GROWTH_RATE', month: state.currentMonth }
);

// Calculate monthly rate with assertion
const HARDWARE_GROWTH_RATE = Assertions.assertFinite(
  Math.exp(computeGrowthRate / 12) - 1,
  { location: 'applyComputeGrowth_hardware', valueName: 'HARDWARE_GROWTH_RATE', month: state.currentMonth }
);
```

**No silent fallbacks.** If parameters are invalid, simulation crashes with detailed error.

### Determinism Preserved

All calculations use the RNG function passed to phases (never `Math.random`).

```typescript
// RNG is required parameter (CRITICAL-3 fix, Nov 7, 2025)
if (!rng || typeof rng !== 'function') {
  throw new Error('❌ CRITICAL: RNG function required for deterministic simulation.');
}
```

Monte Carlo reproducibility is maintained with seed values.

---

## Validation

### Type Checking
```bash
npx tsc --noEmit
```
✅ PASSED (no errors)

### Math Verification
```bash
node -e "..." # See scripts in implementation
```
✅ PASSED (3.6-month doubling verified)

### Monte Carlo Validation

**REQUIRED before merge:** Run N≥20 Monte Carlo simulations to validate:
1. No assertion errors
2. No NaN values in AI capability metrics
3. Realistic outcome distributions (utopia/dystopia/extinction)
4. System stability at extreme capability levels

```bash
npx tsx scripts/monteCarloSimulation.ts --runs=20 --max-months=120 > logs/mc_ai_scaling_20251111.log 2>&1 &
```

**Expected changes:**
- Faster AI progression (visible in logs)
- Earlier alignment challenges
- Different outcome timing (not necessarily different outcome distributions)

---

## Migration Checklist

- [x] Update `centralConfig.ts` parameters with full citations
- [x] Fix `computeInfrastructure.ts` to use config (not hardcoded)
- [x] Add assertions for all growth rate calculations
- [x] Verify math correctness (3.6-month doubling achieved)
- [x] Type checking passed
- [ ] Run Monte Carlo validation (N≥20)
- [ ] Review outcome distributions (compare old vs new)
- [ ] Update wiki documentation (AI Capability System section)
- [ ] Update `UNDERSTANDING_RESULTS.md` with new baseline expectations
- [ ] Archive old parameters (for historical comparison)

---

## Rollback Instructions

If this change causes catastrophic simulation failures:

1. **Revert config parameters:**
```typescript
// src/simulation/config/centralConfig.ts
AI_CAPABILITY_DOUBLING_TIME: 12,  // Revert to old value
COMPUTE_GROWTH_RATE: 1.0,         // Revert to old value
```

2. **Revert computeInfrastructure.ts changes:**
```bash
git checkout HEAD~1 -- src/simulation/computeInfrastructure.ts
```

3. **Run tests to verify rollback:**
```bash
npx tsc --noEmit
npm test
```

**DO NOT rollback without understanding root cause.** The new parameters are research-backed and correct.

---

## Future Work

### Sensitivity Analysis

Test parameter ranges in Monte Carlo:
- **Compute growth:** 2.5× to 5× per year (conservative to optimistic)
- **Doubling time:** 3-6 months (fast to moderate)
- **Algorithmic efficiency:** 1.5× to 3× per year (conservative to optimistic)

### Uncertainty Modeling

**Sources of uncertainty:**
1. **Algorithmic efficiency (MEDIUM):** Based on computer vision, may differ for LLMs
2. **Saturation risk (LOW-MEDIUM):** Data/energy constraints could slow post-2027
3. **Scaling laws (LOW):** Neural scaling laws are empirically robust
4. **Hardware roadmap (LOW):** Public roadmaps through 2027 are clear

### Architecture Review

Verify simulation can handle 10× annual growth:
- [ ] Check for performance bottlenecks (O(n²) scaling issues)
- [ ] Review state propagation at extreme capability levels
- [ ] Flag systems assuming slower AI growth
- [ ] Validate alignment systems under faster progression

---

## References

1. Sevilla, J., & Roldán, E. (2024). "Training compute of frontier AI models grows by 4-5x per year." Epoch AI Blog. https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year

2. Epoch AI (2024). "Revisiting Algorithmic Progress." https://epoch.ai/blog/revisiting-algorithmic-progress

3. Cottier, B., Rahman, R., Fattorini, L., Maslej, N., Besiroglu, T., & Owen, D. (2024). "The Rising Costs of Training Frontier AI Models." arXiv:2405.21015v2. https://arxiv.org/abs/2405.21015

4. Research verification: `research/ai_scaling_verified_parameters_20251111.md` (597 lines, Grade A)

---

**Implemented by:** Roy (simulation-maintainer)
**Date:** 2025-11-11
**Status:** ✅ COMPLETE - Math verified, type checking passed, ready for Monte Carlo validation
**Priority:** CRITICAL - Core simulation mechanics corrected
