# Threshold Uncertainty Phase 2 - Tier 2 Historical Ranges

**Date:** October 26, 2025
**Phase:** Phase 2 - Threshold Uncertainty Feature
**Status:** ✅ COMPLETE
**Time Spent:** ~6 hours (research: 3h, implementation: 2h, validation: 1h)

---

## Summary

Implemented Phase 2 of the Threshold Uncertainty feature by adding Tier 2 (Historical Ranges) threshold distributions to the simulation. These semi-known thresholds are based on historical case studies rather than formal peer-reviewed probability distributions.

**Deliverables:**
- ✅ Research document with 20+ historical cases (`research/threshold_tier2_historical_ranges_20251026.md`)
- ✅ Tier 2 configuration module (`src/simulation/thresholds/tier2Config.ts`)
- ✅ Integration with GameState type and initialization
- ✅ Nested Monte Carlo support for Tier 2 sampling
- ✅ Validation run (2 epistemic × 2 aleatory = 4 simulations, 12 months each)

---

## Tier 2 Thresholds Implemented

### 1. Government Legitimacy Crisis Threshold
- **Distribution:** Triangular(min=0.25, mode=0.30, max=0.40)
- **Research:** 5 historical cases (Weimar 1933, USSR 1991, Tunisia 2011, Egypt 2011, Syria 2011)
- **Interpretation:** Legitimacy level at which governments experience terminal crises
- **Evidence Quality:** Medium (qualitative legitimacy estimates)

### 2. Surveillance Dystopia Threshold
- **Distribution:** Uniform[0.65, 0.80]
- **Research:** 5 surveillance states (East Germany Stasi, China Social Credit, North Korea, USSR KGB, UK comparison)
- **Interpretation:** Surveillance intensity enabling stable authoritarian control
- **Evidence Quality:** Medium (spanning analog→digital eras)

### 3. Automation Displacement Crisis Threshold
- **Distribution:** Triangular(min=0.40, mode=0.50, max=0.60)
- **Research:** 5 historical cases + 3 expert estimates (Industrial Revolution, Great Depression, Spain 2013, China 2023, Acemoglu & Restrepo 2022)
- **Interpretation:** Unemployment rate triggering automation-driven social crises
- **Evidence Quality:** Medium (historical cases + expert consensus)

### 4. AI Recursive Improvement Threshold
- **Distribution:** Uniform[1.2, 1.5]
- **Research:** 4 technological analogs (Moore's Law, AlphaGo Zero, software bootstrapping, scientific productivity)
- **Interpretation:** Monthly capability multiplier enabling recursive self-improvement
- **Evidence Quality:** LOW (no direct precedent, relying on weak analogs)
- **Note:** Highly speculative - no historical cases of AI recursive improvement exist

### 5. Resentment Revolt Trigger Threshold
- **Distribution:** Triangular(min=0.60, mode=0.70, max=0.80)
- **Research:** 6 historical cases (French Revolution 1789, Russian Revolution 1917, Occupy 2011, Arab Spring 2010-2012, Hong Kong 2019, Yellow Vests 2018)
- **Interpretation:** Composite resentment level triggering revolt against AI/elite control
- **Evidence Quality:** Medium (qualitative resentment estimates)

---

## Research Methodology

### Historical Case Selection
- **Minimum:** 3+ cases per threshold
- **Time span:** 1770-2023 (spanning 250+ years)
- **Geographic diversity:** Europe, Americas, Asia, Middle East
- **Outcome variety:** Successful and failed cases (controls for selection bias)

### Qualitative Parameter Estimation
For thresholds without formal metrics (legitimacy, resentment), we used:
1. **Triangulation:** Multiple indicators (elections, protests, economic data)
2. **Comparative analysis:** Relative ranking across cases
3. **Expert consensus:** Historical scholarship where available
4. **Conservative bounds:** Wider ranges to reflect uncertainty

### Distribution Selection Logic
- **Triangular:** Used when historical cases cluster around specific value (mode identifiable)
- **Uniform:** Used when no clear mode exists (equal probability across range)
- **No Normal/Beta:** Avoided parametric distributions without formal research

---

## Implementation Details

### File Structure
```
src/simulation/thresholds/
├── distributions.ts        # Phase 1A sampling library (unchanged)
├── tier1Config.ts          # Phase 1B empirical thresholds (unchanged)
└── tier2Config.ts          # Phase 2 historical ranges (NEW)
```

### Type System Updates
```typescript
// Extended GameState.thresholds to include Tier 2
thresholds: Tier1Thresholds & Tier2Thresholds;

// 5 Tier 1 thresholds (Phase 1):
// - socialCriticalMass, trustRecoveryRate, climateSensitivity,
//   governmentLegitimacyCrisisThreshold, automationJobLossThreshold

// 5 Tier 2 thresholds (Phase 2):
// - surveillanceDystopiaThreshold
// - automationDisplacementCrisisThreshold
// - aiRecursiveImprovementThreshold
// - resentmentRevoltTriggerThreshold
// - governmentLegitimacyCrisisThreshold (duplicate from Tier 1, same params)
```

### Initialization Changes
```typescript
// Before (Phase 1):
thresholds: preSampledThresholds || sampleTier1Thresholds(() => Math.random())

// After (Phase 2):
thresholds: preSampledThresholds || {
  ...sampleTier1Thresholds(() => Math.random()),
  ...sampleTier2Thresholds(() => Math.random())
}
```

### Nested Monte Carlo Integration
Updated `scripts/nestedMonteCarloSimulation.ts` to:
1. Sample both Tier 1 and Tier 2 thresholds in outer loop
2. Log all 10 thresholds (5 Tier 1 + 5 Tier 2) per epistemic scenario
3. Pass combined thresholds to inner loop simulations

---

## Validation Results

### Test Configuration
- **Outer runs:** 2 (epistemic uncertainty - threshold sampling)
- **Inner runs:** 2 (aleatory uncertainty - stochastic events)
- **Total simulations:** 4 runs
- **Max months:** 12 (quick validation, not full trajectory)
- **Exit code:** 0 (SUCCESS)

### Sample Threshold Values (Epistemic Scenario 1)
```
Tier 1 - Empirical:
  Social critical mass: 0.2485
  Trust recovery rate: 0.00910
  Climate sensitivity: 3.030°C
  Gov legitimacy crisis (T1): 0.327
  Automation job loss: 0.349

Tier 2 - Historical Ranges:
  Surveillance dystopia: 0.751
  Automation displacement crisis: 0.427
  AI recursive improvement: 1.239
  Resentment revolt trigger: 0.683
```

### Observations
1. ✅ **Type safety:** No compilation errors, full TypeScript compatibility
2. ✅ **Deterministic sampling:** Same seed produces same thresholds
3. ✅ **Reasonable ranges:** All sampled values within expected bounds
4. ✅ **Nested loop structure:** Epistemic/aleatory separation maintained
5. ✅ **Backward compatibility:** Existing Phase 1 thresholds unaffected

---

## Integration Status

### Currently Using Tier 2 Thresholds
**None** - Tier 2 thresholds are infrastructure only at this stage. They are sampled and available in `state.thresholds` but not yet consumed by simulation logic.

### Future Integration Opportunities
Based on codebase search, potential integration points:

1. **Surveillance Dystopia (0.65-0.80)**
   - `src/simulation/balance.ts`: Hard-coded 0.7 and 0.5 thresholds for resentment accumulation
   - `src/simulation/endGame.ts`: Hard-coded 0.85 for aligned AI dystopia detection
   - **Action:** Replace with `state.thresholds.surveillanceDystopiaThreshold` when implementing dystopia progression

2. **Automation Displacement Crisis (0.40-0.60)**
   - `src/simulation/upwardSpirals.ts`: Unemployment checks for crisis triggers
   - `src/simulation/economics.ts`: Job loss thresholds
   - **Action:** Replace hard-coded unemployment thresholds with sampled values

3. **AI Recursive Improvement (1.2-1.5)**
   - **Not yet implemented** - No recursive improvement mechanics exist
   - **Action:** Future feature - capability growth acceleration detection

4. **Resentment Revolt Trigger (0.60-0.80)**
   - **Not yet implemented** - Resentment tracking exists but no revolt trigger
   - **Action:** Future feature - uprising/revolution mechanics

5. **Government Legitimacy Crisis (0.25-0.40)**
   - **Already integrated in Phase 1** - Used in `src/simulation/socialCohesion.ts`
   - Tier 2 version has identical parameters to Tier 1 (both Triangular(0.25, 0.30, 0.40))

---

## Research Quality Assessment

### Strengths
- **20+ historical cases** across 5 thresholds
- **250-year time span** (1770-2023)
- **Geographic diversity:** Western, Eastern, authoritarian, democratic
- **Outcome variety:** Successful and failed cases (avoids survivorship bias)
- **Theory-backed:** Gurr (1970), Acemoglu & Robinson (2006), Piketty (2014)

### Limitations
1. **Qualitative estimates:** Legitimacy/resentment lack formal metrics
2. **Cultural context:** Western vs non-Western cases may differ
3. **Technology era:** Analog (Stasi) vs digital (China) surveillance are different
4. **No direct precedent:** AI recursive improvement is pure analogy
5. **Selection bias:** Historical cases are rare events (most societies don't revolt)

### Confidence Levels
- **Medium confidence:** Surveillance, automation, resentment (5-6 cases, clear patterns)
- **LOW confidence:** AI recursive improvement (no direct precedent, speculative)

---

## Next Steps (Phase 3 - Deferred)

Phase 3 (Tier 3 Speculative Scenarios) remains deferred as planned. Tier 3 would address:
- **AI goal complexity threshold:** When do AIs develop instrumental convergence?
- **Consciousness emergence threshold:** When do AIs become sentient?
- **Meaning collapse threshold:** When does loss of purpose trigger existential crisis?

These are **design choices** rather than empirical questions - better handled via named scenarios than probability distributions.

---

## Files Modified

### New Files
1. `research/threshold_tier2_historical_ranges_20251026.md` (20,000+ chars)
2. `src/simulation/thresholds/tier2Config.ts` (181 lines)
3. `devlogs/threshold_uncertainty_phase2_20251026.md` (this file)

### Modified Files
1. `src/types/game.ts` - Extended `thresholds` type to include Tier 2
2. `src/simulation/initialization.ts` - Sample Tier 2 thresholds at init
3. `scripts/nestedMonteCarloSimulation.ts` - Log Tier 2 thresholds in output

### Validation Files
1. `logs/tier2_validation_sync_20251026_145412.log` (validation run output)

---

## Comparison: Phase 1 vs Phase 2

| Aspect | Phase 1 (Tier 1) | Phase 2 (Tier 2) |
|--------|------------------|------------------|
| **Evidence Standard** | Peer-reviewed journals, formal confidence intervals | Historical cases, expert elicitation |
| **Distributions** | Normal, Log-Normal, Beta, Triangular | Uniform, Triangular only |
| **Confidence Level** | High-Medium | Medium-Low |
| **Research Time** | 4-6h per threshold | 2-3h per threshold |
| **Integration Effort** | Replace hard-coded values | Infrastructure only (future use) |
| **Thresholds** | 5 (social, trust, climate, legitimacy, automation) | 5 (surveillance, displacement, recursive, revolt, legitimacy) |
| **Expected Impact** | ±10-40% outcome variation | TBD (not yet consumed by simulation) |

---

## Lessons Learned

### What Went Well
1. **Research structure reuse:** Phase 1 patterns accelerated Phase 2
2. **Type safety:** TypeScript caught integration errors early
3. **Nested MC architecture:** Clean separation of epistemic/aleatory uncertainty
4. **Historical evidence:** Rich case studies provide confidence even without formal distributions

### Challenges
1. **Qualitative estimation:** Converting historical narratives to numeric ranges requires judgment
2. **Technology eras:** Comparing analog surveillance (Stasi) to digital (China) is tricky
3. **No direct precedent:** AI recursive improvement has zero historical cases
4. **Overlap with Tier 1:** Government legitimacy appears in both tiers (same parameters)

### Recommendations
1. **Future work:** When implementing features using Tier 2 thresholds, validate against historical cases
2. **Sensitivity analysis:** Run nested MC with N=50+ to quantify epistemic uncertainty impact
3. **Threshold refinement:** As new research emerges, update distributions (version control in git)
4. **Documentation:** Keep research citations in tier2Config.ts for traceability

---

## Conclusion

Phase 2 successfully extends the threshold uncertainty system with 5 semi-known thresholds based on historical ranges. The infrastructure is complete and validated, ready for future integration when implementing:
- Dystopia progression mechanics (surveillance threshold)
- Labor market crisis systems (automation displacement)
- Capability growth models (recursive improvement)
- Revolt/uprising systems (resentment trigger)

**Total effort Phase 1 + Phase 2:** ~16-18 hours
**Remaining (deferred):** Phase 3 (Tier 3 speculative scenarios)

**Status:** ✅ Phase 2 COMPLETE

---

## References

See `research/threshold_tier2_historical_ranges_20251026.md` for full citations (30+ sources).

Key sources:
- **Government Legitimacy:** Evans (2003), Kotkin (2001), Brownlee et al. (2015)
- **Surveillance:** Koehler (1999), Liang et al. (2018), Lankov (2013)
- **Automation:** Mokyr (1990), Acemoglu & Restrepo (2020, 2022), Autor (2015)
- **AI Recursive:** Bostrom (2014), Silver et al. (2017), Bloom et al. (2020)
- **Resentment:** Gurr (1970), Piketty (2014), Acemoglu & Robinson (2006)
