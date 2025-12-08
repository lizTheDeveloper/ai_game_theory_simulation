# Threshold Lowering Mechanism: Corrective Action Plan

**Date:** December 8, 2025
**Status:** BLOCKING - Grade D (FAILED) Verification
**Commit:** cf49657
**Verification Report:** `research/verification_cf49657_20251207.md`
**Implementation:** `src/types/tipping-points.ts:517-633`

## Executive Summary

The threshold lowering mechanism for climate tipping cascades received a **Grade D (FAILED)** verification from two-layer research review (Cynthia + Sylvia). Implementation contains:

1. **CRITICAL:** AMOC → Amazon sign error (destabilizes vs stabilizes)
2. **CRITICAL:** Missing AMOC → Greenland stabilizing feedback
3. **HIGH:** sqrt(progress) scaling contradicts physics (front-loads when should accelerate)
4. **HIGH:** Quantitative magnitudes (0.10-0.30°C) not empirically validated
5. **MEDIUM:** Missing documented interactions bias toward catastrophization

**Recommendation:** Block production use → Fix blocking issues → Re-verify → Monte Carlo validation

---

## CRITICAL Issues (Must Fix Before Production)

### 1. AMOC → Amazon Sign Error ❌

**Current Implementation (lines 603-608):**
```typescript
{
  sourceId: 'amoc',
  targetId: 'amazon',
  thresholdReduction: 0.25,
  mechanism: 'Monsoon disruption: AMOC collapse shifts ITCZ southward, reducing Amazon rainfall'
}
```

**Problem:** 2023-2025 literature shows AMOC collapse **increases** Amazon rainfall, **stabilizing** rainforest.

**Evidence:**
- [Nature Communications 2023](https://www.nature.com/articles/s43247-023-01123-7): "AMOC collapse may **stabilise** eastern Amazonian rainforests"
- [npj Climate 2025](https://www.nature.com/articles/s41612-025-01248-w): "**increased precipitation** over most of the Amazon"
- [JGR Atmospheres 2025](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025JD044103): Multi-model confirmation

**Impact:** Simulates non-existent cascade pathway (AMOC → Amazon dieback), missing protective effect.

**Corrective Actions:**
1. **Remove interaction** from `TIPPING_INTERACTIONS` array (lines 603-608)
2. **Add comment** explaining research uncertainty and regional heterogeneity
3. **Optional:** Add AMOC → Amazon **stabilizing** interaction (negative threshold reduction)
4. **Test:** Monte Carlo N≥10 before/after to measure cascade outcome changes

**Priority:** CRITICAL - Fix before any production runs

---

### 2. Missing AMOC → Greenland Stabilizing Feedback ❌

**Current Status:** Absent from implementation

**Research Evidence:**
- [Global Tipping Points Report 2023](https://report-2023.global-tipping-points.org/): "AMOC collapse would cause substantial cooling of the Northern Hemisphere, which could **stabilize** the GrIS"
- [Science Advances 2025](https://www.science.org/doi/10.1126/sciadv.adw3852): AMOC collapse reduces heat transport to Greenland

**Impact:** Missing stabilizing feedback creates catastrophization bias (only destabilizing interactions modeled).

**Corrective Actions:**
1. **Add stabilizing interaction:**
```typescript
{
  sourceId: 'amoc',
  targetId: 'greenland',
  thresholdReduction: -0.15, // Negative = stabilizing
  mechanism: 'Heat transport reduction: AMOC collapse reduces northward heat transport, slowing Greenland surface melt'
}
```
2. **Verify code handles negative reductions** correctly (may need `ClimateSystemPhase.ts` update)
3. **Document** as stabilizing feedback in comments
4. **Test:** Verify cascade dynamics change appropriately

**Priority:** HIGH - Needed for balanced tipping network

---

## HIGH Priority Issues (Accuracy & Physics)

### 3. sqrt(progress) Scaling Function Backwards 🔄

**Current Implementation (line 228):**
```typescript
const progressScalar = Math.sqrt(Math.max(0.1, sourceElement.progress));
```

**Problem:** Front-loads effects (strongest when first tips, diminishes over time). Physics suggests:
- **Freshwater forcing:** Accumulates and accelerates
- **Carbon release:** Accelerates as active layer deepens
- **Albedo feedback:** Compounds over time

**Evidence:**
- [Earth System Dynamics 2024](https://esd.copernicus.org/articles/15/635/2024/): "Rate-induced tipping cascades" - effects accelerate

**Impact:** Underestimates medium/long-term cascade risk.

**Corrective Actions:**

**Option 1: Linear Scaling (Conservative)**
```typescript
const progressScalar = Math.max(0.1, sourceElement.progress); // No sqrt
```

**Option 2: Sigmoid Scaling (Physical)**
```typescript
// Slow start, accelerating middle, saturation
const progressScalar = 1 / (1 + Math.exp(-5 * (sourceElement.progress - 0.5)));
```

**Option 3: Mechanism-Specific (Most Accurate)**
```typescript
const progressScalar = getProgressScalar(interaction.mechanism, sourceElement.progress);
// Different curves for freshwater (linear), carbon (quadratic), albedo (sigmoid)
```

**Recommendation:** Start with Option 1 (linear), test sensitivity, consider Option 2 if needed.

**Priority:** HIGH - Affects cascade timing across all scenarios

---

### 4. Quantitative Magnitudes Not Validated ⚠️

**Current Implementation:** 0.10-0.30°C threshold reductions (lines 566-631)

**Problem:** Values are **engineering estimates**, not empirically derived from cited papers.

**Evidence:**
- Wunderling et al. discusses 11-90% **coupling strength** reduction (network metric, not °C)
- Armstrong McKay mentions threshold lowering **concept**, not specific magnitudes
- Van Westen shows mechanism but no quantified threshold reduction

**Impact:** Parameters presented as "research-backed" when they're actually "research-informed estimates."

**Corrective Actions:**

1. **Update documentation** (lines 517-535):
```typescript
/**
 * Tipping Element Interaction Matrix (Nov 23, 2025)
 *
 * Conservative engineering estimates for threshold lowering effects when one
 * tipping element tips another. Magnitudes (0.10-0.30°C) are derived from
 * qualitative research on interaction mechanisms, pending empirical validation.
 *
 * Sources:
 * - Armstrong McKay et al. (2022) Science - Network structure, interaction concept
 * - Wunderling et al. (2024) Earth System Dynamics - Destabilizing mechanisms
 * - Van Westen et al. (2024) Science Advances - AMOC freshwater sensitivity
 *
 * UNCERTAINTY: Specific degree Celsius reductions are conservative estimates.
 * Research provides mechanism evidence but not quantitative magnitudes.
 * Sensitivity analysis (0.5x, 1.0x, 2.0x) recommended for robust conclusions.
 *
 * Format: source_id -> target_id -> threshold_reduction_C
 */
```

2. **Add sensitivity test to roadmap:**
   - Baseline: Current values (0.10-0.30°C)
   - Conservative: 0.5x scaling (0.05-0.15°C)
   - Aggressive: 2.0x scaling (0.20-0.60°C)
   - Compare outcome distributions

**Priority:** HIGH - Documentation integrity (don't overstate research backing)

---

## MEDIUM Priority Issues (Completeness)

### 5. 0.5°C Cap Misattributed 📝

**Current Issue:** Code comment attributes 0.5°C maximum cap to Wunderling et al. (2024), but not found in paper.

**Corrective Action:**
```typescript
// Maximum 0.5°C reduction per element (simulation stability cap to prevent
// over-catastrophizing, not derived from specific research citation)
```

**Priority:** MEDIUM - Documentation accuracy

---

### 6. Missing Documented Interactions 📋

**Documented but absent:**
- **AMOC → Greenland** (stabilizing) - Already addressed in Issue #2
- **WAIS → AMOC** (bidirectional, complex) - See Science Advances 2025
- **Amazon → AMOC** (evaporation/trade wind feedback)

**Action:** Consider adding after fixing CRITICAL issues. Not blocking for production.

**Priority:** MEDIUM - Enhancement opportunity

---

## Implementation Roadmap

### Phase 1: CRITICAL Fixes (Blocking)
- [ ] **Remove AMOC → Amazon interaction** (wrong sign)
- [ ] **Add AMOC → Greenland stabilizing feedback** (negative reduction)
- [ ] **Verify negative reduction handling** in ClimateSystemPhase.ts
- [ ] **Test:** Monte Carlo N≥10 to measure cascade outcome changes

### Phase 2: HIGH Priority Corrections (Accuracy)
- [ ] **Replace sqrt(progress) with linear scaling**
- [ ] **Update documentation** to clarify engineering estimates vs research-backed
- [ ] **Correct 0.5°C cap attribution**
- [ ] **Test:** Sensitivity analysis (0.5x, 1.0x, 2.0x magnitudes)

### Phase 3: Re-Verification (Quality Gate 1)
- [ ] **Submit corrected implementation** for research-skeptic review
- [ ] **Target Grade:** B or higher (A requires expert elicitation)
- [ ] **Address any new findings**

### Phase 4: Monte Carlo Validation
- [ ] **Run N≥100 with corrected parameters**
- [ ] **Compare to baseline** (pre-fix outcomes)
- [ ] **Measure cascade frequency, timing, severity changes**
- [ ] **Document in devlog**

---

## Testing Strategy

### Immediate Tests (Phase 1)

**Test 1: AMOC → Amazon Removal Impact**
- Run 10 seeds with/without interaction
- Measure: Amazon dieback frequency, cascade paths
- Expected: Reduced cascades through AMOC → Amazon pathway

**Test 2: Negative Reduction Handling**
- Verify `thresholdReduction < 0` increases effective threshold
- Check: `effectiveThresholdReduction` calculation in ClimateSystemPhase.ts
- Expected: AMOC collapse slows Greenland tipping

### Sensitivity Analysis (Phase 2)

**Test 3: Scaling Function Comparison**
```typescript
// Test configurations
const scalings = {
  sqrt: Math.sqrt(progress),           // Current (front-loaded)
  linear: progress,                    // Proposed (uniform)
  sigmoid: 1/(1+exp(-5*(progress-0.5))) // Alternative (s-curve)
};

// Run N=20 seeds per scaling
// Compare: cascade timing, severity, outcome distributions
```

**Test 4: Magnitude Sensitivity**
```typescript
// Test magnitudes
const magnitudes = [0.5, 1.0, 2.0]; // 0.5x, baseline, 2.0x
// Run N=20 seeds per magnitude
// Measure: outcome category shifts (utopia → dystopia)
```

---

## Success Criteria

### Phase 1 Complete When:
- ✅ AMOC → Amazon removed from TIPPING_INTERACTIONS
- ✅ AMOC → Greenland stabilizing added
- ✅ Monte Carlo N≥10 shows expected cascade changes
- ✅ No TypeScript errors or NaN values

### Phase 2 Complete When:
- ✅ Linear scaling implemented
- ✅ Documentation accurately reflects engineering estimates
- ✅ Sensitivity analysis shows outcome robustness (or identifies sensitivity)

### Phase 3 Complete When:
- ✅ Research-skeptic review Grade B+ achieved
- ✅ All CRITICAL/HIGH issues resolved
- ✅ Implementation approved for production

---

## Research Gaps (Future Work)

### Expert Elicitation Needed For Grade A
1. **Climate scientist survey:** Quantify interaction strengths (°C reductions)
2. **Network modelers:** Translate coupling strength → temperature thresholds
3. **Timescale analysis:** Differentiate fast (decades) vs slow (centuries) interactions

### Empirical Validation Opportunities
1. **Paleoclimate proxy data:** Past cascade events (e.g., Younger Dryas)
2. **CMIP6 model output:** Simulated interaction strengths
3. **Observational constraints:** Greenland melt → AMOC weakening rates

### Modeling Enhancements (Not Blocking)
1. **Regional heterogeneity:** Northern vs southern Amazon response to AMOC
2. **Rate-dependent interactions:** Distinguish slow vs fast forcing
3. **Stochastic uncertainty:** Sample interaction strengths from distributions

---

## References

### Verification Reports
- `research/verification_cf49657_20251207.md` - Full two-layer verification (Cynthia + Sylvia)

### Key Literature
1. **Armstrong McKay et al. (2022)** *Science* - Tipping point network
2. **Wunderling et al. (2024)** *Earth System Dynamics* - Interaction mechanisms
3. **Van Westen et al. (2024)** *Science Advances* - AMOC freshwater sensitivity
4. **Nature Communications 2023** - AMOC collapse stabilizes Amazon
5. **npj Climate 2025** - AMOC-Brazil precipitation dynamics
6. **Science Advances 2025** - WAIS-AMOC interactions
7. **Earth System Dynamics 2024** - Rate-induced cascades

### Related Research Files
- `research/climate_tipping_points_2024_2025_20251116.md` - Primary tipping points research
- `research/amoc_tipping_point_original_sources_20251120.md` - AMOC mechanisms
- `openspec/specs/research/verification-queue.md` - Active verification tracking

---

## Change History

**December 8, 2025** - Initial corrective action plan created
- Grade D verification findings documented
- 4-phase implementation roadmap defined
- Testing strategy outlined
- Success criteria established

---

## Next Actions

1. **Autonomous researcher:** Post findings to `research` Matrix channel (if available)
2. **Simulation maintainer:** Implement Phase 1 CRITICAL fixes
3. **Architect:** Update OpenSpec verification queue status
4. **Feature team:** Schedule Phase 2-4 work after Phase 1 validated

**Status:** ⚠️ BLOCKING PRODUCTION - Must fix CRITICAL issues before Monte Carlo production runs
