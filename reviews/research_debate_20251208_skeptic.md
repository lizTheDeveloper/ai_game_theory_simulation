# Research Debate Session: December 8, 2025

**Reviewer:** Sylvia (Research Skeptic)
**Context:** Session 55+ maintenance mode. All CRITICAL/HIGH roadmap items complete. A- research quality claimed.
**Mode:** Token conservation active. Focused critique.

---

## Executive Summary

**Grade: B-** (Simulation Completeness)

The simulation has achieved impressive scope (136+ modules, 82% test coverage) but suffers from three systemic weaknesses that collectively bias outcomes toward overconfidence in managed transitions:

1. **Placeholder proliferation** - 50+ TODOs, PLACEHOLDERs, and hardcoded values remain in production code
2. **Timescale mismatch** - Monthly timesteps modeling centennial-scale dynamics
3. **Systematic optimism bias** - Floors without ceilings, research-backed best cases with engineering-estimate worst cases

---

## Challenge 1: The Placeholder Problem

### Evidence

Grep across `/src/simulation/` reveals:

| Pattern | Count | Severity |
|---------|-------|----------|
| `TODO` | 25+ | Mixed (some minor, some critical) |
| `PLACEHOLDER` | 10+ | HIGH - directly affects calculations |
| `approximate` | 15+ | MEDIUM - acknowledged uncertainty |
| `hardcoded` | 12+ | HIGH - undermines parameterization |
| `FICTIONAL` | 3 | CRITICAL - zero research basis |

**Most concerning examples:**

```typescript
// src/simulation/techTree/effectsEngine.ts:1674
const energyMultiplier = 0.5; // PLACEHOLDER - 50% energy availability assumed

// src/simulation/cooperativeOwnership.ts:86
// WARNING: FICTIONAL PLACEHOLDER - NO RESEARCH BASIS

// src/simulation/freshwaterDepletion.ts:76
const population = 8.0; // Billion people (approximate)
// [Population should be dynamic, not fixed!]

// src/simulation/phosphorusDepletion.ts:51
const population = 8.0; // Billion people (approximate)
// [Same hardcoded value in multiple files - not synced to simulation]
```

### Why This Matters

A simulation claiming A- research quality should not have production code containing `FICTIONAL PLACEHOLDER` or `NO RESEARCH BASIS`. These are honest labels, but they indicate implementation outpaced validation.

**Specific concern:** The cooperative ownership module has FICTIONAL placeholders with explicit warnings. This module affects economic outcomes. How do we know the aggregate economic projections are not systematically biased by unrealistic cooperation assumptions?

### Verdict

**MEDIUM priority.** The placeholders are honestly documented. But a systematic audit and replacement campaign is needed before claiming research-backed precision on economic scenarios.

---

## Challenge 2: The 5% Floor Lives On

### Status Update

The Dec 3 debate on climate stability floor (HIGH-7) resulted in **documentation** improvements but **no implementation change**. The floor remains at 5%.

From `climate_stability_floor_debate_20251203.md`:
> "The floor is a computational convenience with zero empirical support. 83% of reviewed papers contradict it."

The OpenSpec status shows HIGH-7 as COMPLETE (Dec 7). But completing documentation does not equal completing the fix.

### Why I Keep Raising This

Wunderling et al. 2024 explicitly states tipping interactions are "destabilizing" - cascades accelerate, they do not find a natural floor. A 5% floor means the simulation CANNOT explore tail scenarios where cascades drive stability below 5%.

This is not a minor calibration issue. This affects:
- Probability of extinction scenarios
- Optimal deployment timing for interventions
- Risk/reward tradeoffs for aggressive vs. conservative strategies

### Recommendation

Implement **Option C** from the Dec 3 debate: Conditional floor that only applies in Paris-Agreement-success scenarios. In high-emission scenarios where cascades are more likely, remove the floor entirely.

**Priority:** Should be HIGH, not closed.

---

## Challenge 3: Asymmetric Research Standards

### The Pattern

Throughout the codebase, I observe:
- **Best-case scenarios:** Research-backed with citations (2024-2025 papers)
- **Worst-case scenarios:** Engineering estimates, historical analogies, round numbers

Examples:

| Mechanic | Best Case | Worst Case |
|----------|-----------|------------|
| Climate stability | Planck feedback literature | 5% floor (no citation) |
| AI alignment | Multi-paper synthesis | "Engineering estimate" |
| Tech deployment | Diffusion curve literature | Hardcoded linear ramps |
| Rebound effects | Sorrell 2024 (30-60%) | Fixed 0.7 multiplier |

### Why Asymmetry Matters

If best cases are research-backed and worst cases are engineering estimates, Monte Carlo distributions will systematically underweight tail risks. The simulation will appear to show that "things mostly work out" because we rigorously modeled the mechanisms of success and handwaved the mechanisms of failure.

### Specific Concern: Indigenous Paradigm

From `src/simulation/indigenousParadigm.ts`:

```typescript
confidence: 'LOW',
...
confidence: 'SPECULATIVE',
...
// This is a placeholder - would need actual WVS country list
```

The multi-paradigm DUI system includes Indigenous perspectives with explicit LOW/SPECULATIVE confidence markers. This is honest. But it means 25% of our flourishing metrics are acknowledged guesswork.

### Recommendation

Either:
1. **Elevate worst-case research** - Same rigor applied to tail scenarios
2. **Widen uncertainty ranges** - If we're uncertain, show it in distributions
3. **Document asymmetry** - Add warning that positive outcomes are higher-confidence than negative outcomes

---

## Challenge 4: Missing Critical Systems (Update Since Dec 2)

### Previously Identified Gaps

From `critical_gaps_debate_20251202.md`:

| Gap | Status | My Assessment |
|-----|--------|---------------|
| Information Ecology | IMPLEMENTED | Gap closed, B- self-grade appropriate |
| Rebound Effects | IMPLEMENTED | Gap closed, but fixed multiplier (0.7) not stochastic |
| Supply Chain Cascades | NOT IMPLEMENTED | Still missing |

### Supply Chain Cascades: Still Critical

McKinsey 2024 data: Average company has 38,000 tier-3 suppliers with 0.2% visibility.
Texas freeze 2021: 3-day grid failure cascaded to $195B damages.

Our collapse scenarios model individual system failures, not cascade propagation. Real civilizational collapse (Scheffer 2023) is dominated by cascade effects.

**Concrete proposal:** Add a cascade multiplier where system failures degrade adjacent systems. When grid fails, water probability of failure increases. When water fails, food probability increases. etc.

**Effort estimate:** 2-3 days.

---

## Challenge 5: The Timescale Problem

### Simulation Specs
- Monthly timesteps
- 360-month runtime (30 years)

### Research Timescales
- Wunderling 2024: Tipping cascades on "centennial to millennial" timescales
- AMOC collapse: Decades to centuries
- Ice sheet disintegration: Centuries to millennia
- Amazon dieback: Decades

### The Mismatch

We are using monthly resolution to model processes that unfold over decades-to-centuries. This creates two problems:

1. **Undersampling:** We might miss threshold crossings that happen between timesteps
2. **Overconfidence:** 30-year projections treated as definitive when processes are century-scale

### Not Saying We Should Change

Changing to longer timesteps would require massive refactoring. But we should acknowledge in documentation that:
- Early-game dynamics (first 10 years) are higher-confidence than late-game
- True tail scenarios unfold over 50-200 years, not 30

---

## Simulation Completeness Grade: B-

### Breakdown

| Dimension | Grade | Notes |
|-----------|-------|-------|
| Scope | A | 136+ modules, comprehensive coverage |
| Research rigor (positive) | A- | Good citations for mechanisms |
| Research rigor (negative) | C+ | Tail scenarios under-researched |
| Parameter calibration | B | Many placeholders remain |
| Uncertainty modeling | C+ | Fixed multipliers, not distributions |
| Documentation honesty | A | Appropriate caveats in code |
| Test coverage | B+ | 82% is good but not comprehensive |

**Overall:** B-

The simulation is impressive and honest about its limitations. But "A- research quality" overstates the rigor applied to worst-case scenarios.

---

## Recommended Roadmap Additions

### HIGH Priority

1. **Supply chain cascade multiplier** - 2-3 day effort, closes critical gap
2. **Stochastic rebound effects** - Replace fixed 0.7 with distribution [0.3, 0.9]
3. **Conditional climate floor** - Remove 5% floor in high-emission scenarios

### MEDIUM Priority

4. **Placeholder audit** - Systematic replacement of FICTIONAL/hardcoded values
5. **Tail scenario research** - Apply same rigor to worst cases as best cases
6. **Uncertainty documentation** - Explicit acknowledgment of asymmetric confidence

### LOW Priority (but should be considered)

7. **Extended timeline mode** - Optional 100-year runs for cascade dynamics
8. **Sensitivity analysis** - Which parameters most affect outcomes?

---

## Next Research Focus Areas

In order of impact:

1. **Supply chain fragility literature** - Scheffer 2023, McKinsey 2024, COVID empirical data
2. **Worst-case climate literature** - What does below-5% stability actually look like?
3. **Indigenous knowledge systems** - Current paradigm is acknowledged guesswork

---

## Conclusion

The simulation is genuinely impressive. The research team has done excellent work. But maintenance mode should not mean complacency.

Three systemic issues remain:
1. Placeholders in production code
2. Asymmetric research standards (best vs. worst cases)
3. Missing cascade dynamics

**My recommendation:** Before declaring A- research quality, complete the placeholder audit and implement supply chain cascades. These are achievable in 1-2 sprints.

---

*"Better to find the problems now than after deployment."*

**Signed:** Sylvia (Research Skeptic)
**Date:** 2025-12-08
