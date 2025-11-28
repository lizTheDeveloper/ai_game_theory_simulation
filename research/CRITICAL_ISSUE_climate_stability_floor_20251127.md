---
priority: RESEARCH-CRITICAL
assignee: simulation-maintainer (Roy) + research-skeptic (Sylvia)
created: 2025-11-27
status: NEEDS_CODE_UPDATE
effort_estimate: 4-8 hours
impact: HIGH - affects climate collapse modeling accuracy
---

# CRITICAL ISSUE: Climate Stability Floor Not Research-Backed

**Discovered:** 2025-11-26 (citation verification)
**Confirmed:** 2025-11-27 (2024-2025 literature review)
**Status:** ❌ **RESEARCH INTEGRITY FAILURE**

---

## Problem Statement

The simulation's `ClimateSystemPhase.ts` (lines 407-459) implements a **5% minimum stability floor** with citations claiming this represents "self-limiting feedbacks" from peer-reviewed research.

**Reality:** 2024-2025 peer-reviewed research **contradicts** these claims. The citations either:
1. ❌ Do NOT support stability claims (Lenton 2019, Armstrong McKay 2022, Steffen 2015)
2. ⚠️ Are misleadingly framed (Zachos 2008: 200,000-year recovery ≠ human-timescale resilience)

---

## Research Findings (2024-2025)

### Papers Supporting 5% Stability Floor: 0/6 (0%)
### Papers Contradicting Stability Floor: 5/6 (83%)

**Key Evidence:**

1. **Wunderling et al. (2024, Earth System Dynamics)** - Comprehensive review
   - "Many tipping interactions are **destabilizing**"
   - "Cascades cannot be ruled out at 1.5-2°C warming"
   - ❌ **Zero support** for stability floor

2. **Net Climate Feedbacks (2024-2025)**
   - Overall sum becoming "**less negative**" with emissions
   - ❌ Trend is toward **acceleration**, not stabilization

3. **State of Climate Report (2025, BioScience)**
   - "2024 set new temperature record, warming **possibly accelerating**"
   - ❌ Emphasizes **acceleration risk**, not stability

**Full Research:** See `research/climate_stability_mechanisms_2024_2025_update.md`

---

## Current Code Location

**File:** `src/simulation/engine/phases/ClimateSystemPhase.ts`
**Lines:** 407-459 (stability floor implementation)

**Current Citations:**
```typescript
// ❌ REMOVE - These do NOT support stability floor claims:
// - Lenton et al. (2019) - Warns of "planetary emergency"
// - Armstrong McKay et al. (2022) - Warns of "amplifying destabilization"
// - Steffen et al. (2015) - Warns of "destabilizing Holocene state"
// - Zachos et al. (2008) - 200ky recovery (not human-timescale)
```

---

## Required Action

### IMMEDIATE: Remove Misleading Citations

Replace current citations with honest documentation:

```typescript
/**
 * IMPLEMENTATION CHOICE: 5% minimum stability floor
 *
 * This is a SIMULATION CONSTRAINT for tractability, NOT a research-backed mechanism.
 *
 * Research Reality (2024-2025):
 * - Wunderling et al. (2024): "Many tipping interactions are destabilizing"
 * - Cascades cannot be ruled out at 1.5-2°C warming (ESD 15:41-74)
 * - Net feedbacks becoming "less negative" with continued emissions
 * - No peer-reviewed research supports a stability "floor" after tipping cascades
 *
 * WHY THIS CONSTRAINT EXISTS:
 * - Prevents numerical instability in extreme tail scenarios
 * - Maintains simulation tractability across 360-month runs
 * - Represents "lower bound of plausible uncertainty range"
 *
 * LIMITATION: This constraint may UNDERESTIMATE collapse risk in tail scenarios.
 *
 * Alternative approaches considered:
 * - Option A: Remove floor entirely (most research-faithful, but risks instability)
 * - Option B: Apply floor ONLY in Paris Agreement success scenarios
 * - Option C: Current approach (pragmatic but acknowledged limitation)
 *
 * @see research/climate_stability_mechanisms_2024_2025_update.md - Full 2024-2025 literature review
 * @see research/climate_stability_self_limiting_critique_20251126.md - Citation verification
 */
const MIN_STABILITY_FLOOR = 0.05; // Implementation constraint, not research finding
```

---

## Why This Matters

**Research Integrity:** The simulation markets itself as "research-backed" with "2+ peer-reviewed sources" for every mechanic. The climate stability floor violates this standard.

**Risk Assessment:** If the 5% floor is NOT scientifically justified, the simulation may be **systematically underestimating collapse risk** in tail scenarios.

**Trust:** Misleading citations (claiming papers support stability when they warn of destabilization) undermine confidence in the entire research foundation.

---

## Proposed Solution

**Keep the 5% floor** (it serves a legitimate simulation engineering purpose), but:

1. ✅ **Document as implementation choice**, not research finding
2. ✅ **Remove misleading citations**
3. ✅ **Add honest limitation statement** acknowledging this may underestimate collapse risk
4. ✅ **Reference the 2024-2025 literature** showing destabilization > stabilization

**This is NOT "softening" the simulation** - it's **honest documentation** of its limitations.

---

## Implementation Checklist

- [ ] Remove misleading citations from `ClimateSystemPhase.ts` lines 407-459
- [ ] Add honest implementation choice documentation (see template above)
- [ ] Update JSDoc comments to reflect reality vs constraint
- [ ] Consider adding `@limitation` tag for future architecture reviews
- [ ] Run Monte Carlo validation (N≥10) to verify no behavior change
- [ ] Update `docs/wiki/README.md` climate section with limitation
- [ ] Commit with message: "docs: Document climate stability floor as implementation constraint, not research finding"

---

## Effort Estimate

**Total:** 4-8 hours
- Code documentation: 2-3 hours
- Wiki updates: 1-2 hours
- Monte Carlo validation: 1-2 hours
- Review + discussion: 1 hour

---

## Assignee

**Primary:** simulation-maintainer (Roy) - Code updates + validation
**Review:** research-skeptic (Sylvia) - Verify honesty of new documentation

---

## Priority Justification

**RESEARCH-CRITICAL** because:
1. Affects core climate collapse modeling
2. Current citations are actively misleading
3. Violates project's "2+ peer-reviewed sources" standard
4. Discovered during systematic research verification
5. Simple to fix (documentation only, no behavior change)

---

## References

- `research/climate_stability_mechanisms_2024_2025_update.md` - 2024-2025 literature review
- `research/climate_stability_self_limiting_critique_20251126.md` - Citation verification
- `src/simulation/engine/phases/ClimateSystemPhase.ts` - Code location (lines 407-459)
- Wunderling et al. (2024) - https://doi.org/10.5194/esd-15-41-2024

---

**Created by:** Autonomous Researcher
**Date:** 2025-11-27
**Next Action:** Roy (simulation-maintainer) to review and implement code updates
