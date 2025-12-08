# Proposed: Expand Distribution Sampling to Radiation & Recovery Parameters

**Date:** 2025-12-08
**Priority:** LOW → MEDIUM (quality improvement)
**Complexity:** Moderate (4-6 hours)
**Source:** Architecture Integration Review (MEDIUM-1)

---

## Problem Statement

The distribution sampling library (M-5) is well-designed but underutilized:
- **Current usage:** Only tipping point threshold uncertainty
- **Missing integrations:** Radiation LD50 ranges, recovery timescale ranges

**Examples of missed opportunities:**
1. **Radiation modeling:** LD50 defined as `{min: 3.0, default: 3.5, max: 4.0}` but only uses `default`
2. **Decay exponent:** `{min: 1.0, default: 1.2, max: 1.4}` but only uses `default`
3. **Recovery half-lives:** Point estimates (e.g., 450 years for WAIS) when research provides ranges (100-800 years)

**Research basis:**
- Hiroshima/Nagasaki data shows LD50 variance 2.3-4.5 Gy (research_radiation_modeling_20251208.md)
- Druke et al. (2024): WAIS recovery 100-800 years depending on temperature pathway
- BEIR VII: Cancer risk has log-normal uncertainty

---

## Proposed Solution

### 1. Radiation LD50 Uncertainty

Use triangular distribution for LD50 ranges:

```typescript
// In addRadiationZonesEnhanced()
import { sampleTriangular } from '@/simulation/utils/distributionSampling';

const ld50NoTreatment = sampleTriangular(
  3.0,   // min (Hiroshima data with combined injury)
  3.5,   // mode (REMM consensus)
  4.0,   // max (PNNL upper estimate)
  rng    // Deterministic RNG
);
```

**Impact:** Each Monte Carlo run samples different LD50 from research-backed range, capturing epistemic uncertainty.

### 2. Decay Exponent Variance

Use uniform distribution for 7-10 rule exponent:

```typescript
import { sampleUniform } from '@/simulation/utils/distributionSampling';

const decayExponent = sampleUniform(
  1.0,   // min (slower decay)
  1.4,   // max (faster decay)
  rng    // Deterministic RNG
);
```

**Impact:** Captures uncertainty in fallout decay rates (7-10 rule has documented variance).

### 3. Recovery Timescale Uncertainty

Use log-normal distribution for recovery half-lives (many centuries-scale processes are log-normal):

```typescript
import { sampleLogNormal } from '@/simulation/utils/distributionSampling';

const waisRecoveryHalfLife = sampleLogNormal(
  Math.log(450),   // mean in log-space (median = 450 years)
  0.5,             // sigma (captures 100-800 year range at ~95% CI)
  rng              // Deterministic RNG
);
```

**Impact:** More realistic uncertainty in tipping point recovery timescales.

---

## Research Needed

1. **LD50 variance justification:**
   - Validate triangular distribution is appropriate
   - Confirm min/max bounds from literature (already in radiation_modeling_20251208.md)

2. **Recovery timescale distributions:**
   - Extract uncertainty ranges from Druke et al. (2024)
   - Determine appropriate distribution (log-normal vs triangular vs beta)

3. **Monte Carlo impact assessment:**
   - Does adding these uncertainties increase outcome variance?
   - Are any parameters disproportionately influential?

**Estimated research time:** 2-3 hours (mostly literature review)

---

## Effort Estimate

**Total: 4-6 hours**
- Research (validate distributions): 2-3 hours
- Implementation (3 integration points): 1-2 hours
- Testing (verify determinism): 1 hour
- Monte Carlo validation (N=10): 1 hour

---

## Success Criteria

1. ✅ LD50 values sampled from triangular distribution (deterministic with seed)
2. ✅ Decay exponent sampled from uniform distribution
3. ✅ Recovery half-lives sampled from log-normal distribution
4. ✅ Monte Carlo runs remain deterministic (CV < 0.01%, N=10)
5. ✅ Tests pass (including new distribution sampling tests)
6. ✅ Research validation (sources justify distributions)

---

## Next Steps

1. Research validation (super-alignment-researcher)
2. Implementation (simulation-maintainer)
3. Monte Carlo validation (priya)
4. Documentation update (wiki-documentation-updater)

**Trigger:** Address after CRITICAL/HIGH priority work complete (system in maintenance mode).
