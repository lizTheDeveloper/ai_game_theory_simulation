# Research Verification: Refugee Crisis Death Tracking Bounds

**Created:** 2025-11-06
**Commit:** ed597d481bb84b27650b575b12c66e109b5e4399
**System:** Refugee Crisis Death Tracking
**Verification Type:** Parameter Justification

---

## Overview

Commit ed597d4 corrected death tracking validation in the refugee crisis system from regional caps (1B) to global cumulative caps (10B). This document identifies what research verification is needed.

## Change Summary

**File:** `src/simulation/refugeeCrises.ts:220-234`

**Before:**
```typescript
assertPopulationMillion(newDeathsByCategory, {...});  // Regional cap: 1B
assertPopulationMillion(newCumulativeDeaths, {...});  // Regional cap: 1B
```

**After:**
```typescript
// Global cumulative by category across all regions and time (10B max plausible, not 1B regional cap)
assertInRange(newDeathsByCategory, 0, 10000, {...});

// Global cumulative across all regions and time (10B max plausible, not 1B regional cap)
assertInRange(newCumulativeDeaths, 0, 10000, {...});
```

**Rationale (from code comments):**
- These are **global cumulative totals** (not regional snapshots)
- Track deaths across all regions and all simulation time
- 10B chosen as "max plausible" upper bound

---

## Parameters Requiring Verification

### 1. Upper Bound: 10B (10,000 million) Deaths

**Current Value:** 10,000 million (10 billion)

**Claim (implicit in code):**
> "10B max plausible" for global cumulative deaths across all regions and time in catastrophic scenarios

**Verification Needed:**

#### Layer 1 - Citation Existence:
- [ ] Find peer-reviewed sources on maximum plausible human mortality in:
  - Global nuclear war scenarios
  - Extreme climate collapse
  - Combined cascading crises
  - Historical mass mortality events (for calibration)

#### Layer 2 - Claim Verification:
For each citation found, verify:
- [ ] **Does the paper support 10B as an upper bound?**
  - Quote specific passage
  - Note if value is direct or extrapolated
- [ ] **What scenarios reach multi-billion mortality?**
  - Nuclear winter + famine
  - Runaway climate feedback
  - Ecosystem collapse cascades
- [ ] **Is 10B conservative or aggressive?**
  - Compare to historical events (scaled)
  - Compare to other modeling studies
  - Note uncertainty ranges

**Files to Check:**
- `src/simulation/refugeeCrises.ts:220-234` - Death tracking validation
- Related: Transit mortality (2% - already validated via UNHCR data per docs/wiki/systems/refugee-crises.md:406)

---

## Related Systems (Already Validated)

### Transit Mortality: 2% (ALREADY VALIDATED)

**Source:** docs/wiki/systems/refugee-crises.md:286-299

**Research Basis:**
- Mediterranean Route: 28,000 deaths / 1.5M crossings = 1.9% mortality (2014-2023)
- Libya route: 2-3% mortality
- Sahara crossing: 5-10% mortality
- Model uses 2% as global average

**Status:** ✅ Peer-reviewed UNHCR data, Layer 2 verified

---

## Verification Checklist

**Phase 1: Literature Search**
- [ ] Search for: "nuclear winter mortality projections"
- [ ] Search for: "climate catastrophe death toll estimates"
- [ ] Search for: "global extinction risk population impacts"
- [ ] Search for: "maximum plausible human mortality scenarios"

**Phase 2: Citation Verification**
For each paper found:
- [ ] Verify paper exists and is accessible
- [ ] Extract specific mortality ranges/scenarios
- [ ] Quote supporting passages
- [ ] Note if 10B is supported, too conservative, or too aggressive

**Phase 3: Parameter Justification**
- [ ] Document why 10B was chosen (vs 5B, 8B, 12B)
- [ ] Identify uncertainty ranges
- [ ] Note any caveats or limitations

**Phase 4: Documentation Update**
- [ ] Add citations to `docs/wiki/systems/refugee-crises.md`
- [ ] Update `research/UPDATE_QUEUE.md` with new sources
- [ ] Link verification report in commit message

---

## Expected Outcome

**Goal:** Justify the 10B upper bound with peer-reviewed sources

**Success Criteria:**
- 2+ peer-reviewed sources supporting multi-billion mortality in catastrophic scenarios
- Clear explanation of why 10B chosen (vs other values)
- Documentation updated with citations

**Failure Criteria:**
- No sources support values >5B → reduce bound
- Sources suggest >10B plausible → increase bound
- High uncertainty → add comment noting uncertainty range

---

## Notes

**Why This Matters:**
- This is a **validation bound**, not a hard limit
- If exceeded, simulation throws error (preventing silent bugs)
- Too low = false positives (valid scenarios rejected)
- Too high = false negatives (unrealistic scenarios accepted)

**Current Status:**
- Value changed from 1B (regional cap, incorrect) to 10B (global cumulative, needs verification)
- 1B was **demonstrably wrong** (global total can exceed regional cap)
- 10B is **plausible but unverified**

**Next Steps:**
1. Super-alignment-researcher: Find sources
2. Research-skeptic: Layer 2 verification
3. Simulation-maintainer: Update bounds if needed
4. Wiki-documentation-updater: Add citations to docs
