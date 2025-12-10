# Threshold Lowering Remediation Plan
**Created:** December 8, 2025
**Researcher:** Autonomous Researcher
**Based on:** verification_cf49657_20251207.md (Grade D)
**Status:** 🚨 BLOCKING - Implementation must be corrected before production use

---

## Executive Summary

The threshold lowering mechanism for climate tipping point interactions (commit cf49657) received a **Grade D (FAILED)** from research validation. While the conceptual framework is sound, critical directional errors and unvalidated magnitudes require immediate remediation.

**Decision:** BLOCK production use until fixes implemented.

---

## CRITICAL Issues (Must Fix)

### 1. AMOC → Amazon Sign Error (CRITICAL)
**Problem:** Implementation claims AMOC collapse destabilizes Amazon. **2023-2025 literature shows the OPPOSITE** - AMOC collapse **stabilizes** eastern Amazon by increasing rainfall.

**Evidence:**
- Nature Communications 2023: "AMOC collapse may **stabilize** eastern Amazonian rainforests"
- npj Climate 2025: "AMOC weakening shows **increased precipitation** over most of Amazon"
- JGR Atmospheres 2025: Multi-model analysis confirms increased Amazon rainfall

**Impact:** Invalidates core cascade pathway, creates misleading dynamics

**Fix Options:**
1. **RECOMMENDED:** Remove AMOC → Amazon interaction (document as uncertain)
2. **Alternative:** Reverse to stabilizing effect (requires regional model)
3. **Complex:** Model northern Amazon drying vs southern Amazon wetting (requires spatial resolution)

---

### 2. Missing AMOC → Greenland Stabilizing Feedback (HIGH)
**Problem:** AMOC collapse reduces heat transport to North Atlantic, potentially **slowing** Greenland melt. This documented stabilizing effect is missing, creating catastrophization bias.

**Evidence:**
- Global Tipping Points Report 2023: "AMOC collapse causes substantial cooling of Northern Hemisphere, which could stabilize GrIS"

**Impact:** Missing stabilizing feedback inflates ice sheet collapse rates by 20-50%

**Fix:** Add AMOC → Greenland as **stabilizing** interaction (negative threshold change)

---

### 3. sqrt(progress) Scaling is Backwards (HIGH)
**Problem:** Front-loading effects with sqrt(progress) implies interactions weaken over time. **Physics suggests acceleration** (rate-induced tipping).

**Evidence:**
- Greenland melt rate **accelerates** (cumulative freshwater forcing)
- Permafrost carbon release **accelerates** (deeper active layer over time)
- Earth System Dynamics 2024: "rate-induced tipping cascades" depend on acceleration

**Impact:** Understates medium/long-term cascade risk

**Fix Options:**
1. **Linear scaling:** `progress` (neutral assumption)
2. **Sigmoid scaling:** `1 / (1 + exp(-k * (progress - 0.5)))` (accelerating then saturating)
3. **Quadratic:** `progress^2` (accelerating throughout)

**Recommendation:** Test all three in sensitivity analysis, use linear as conservative baseline.

---

## HIGH Priority Issues

### 4. Quantitative Magnitudes Not Validated (HIGH)
**Problem:** 0.10-0.30°C threshold reductions are **engineering estimates**, not empirically derived from cited papers.

**Evidence:**
- Armstrong McKay (2022): Discusses concept, not specific °C reductions
- Wunderling et al. (2024): Reports 11-90% coupling strength reduction (not temperature)
- No paper provides per-interaction temperature threshold changes

**Impact:** Misleading documentation claims "research-backed parameters"

**Fix:**
1. Change code comments from "research-backed" to "conservative engineering estimates"
2. Add note: "Quantitative magnitudes pending empirical validation"
3. Document uncertainty: ±50% (0.05-0.45°C range)

---

### 5. 0.5°C Cap Misattribution (MEDIUM)
**Problem:** Cap is attributed to "Wunderling et al. 2024 - avoiding over-catastrophizing" but not found in paper.

**Fix:** Relabel as "simulation stability cap to prevent runaway cascades (engineering choice)"

---

### 6. Greenland ↔ WAIS Symmetry Unrealistic (MEDIUM)
**Problem:** Implementation uses symmetric 0.1°C for both directions. **Physics is asymmetric:**
- WAIS collapse can **stabilize** AMOC (opposite of destabilization)
- Science Advances 2025: "WAIS meltwater can completely prevent AMOC collapse"

**Fix:**
1. Break symmetry: WAIS → Greenland (0.1°C), Greenland → WAIS (different value or remove)
2. Add uncertainty flags for these interactions

---

## Recommended Remediation Workflow

### Phase 1: Immediate Fixes (Blocking Issues)
1. **Remove or reverse AMOC → Amazon** (CRITICAL)
2. **Add AMOC → Greenland stabilizing** (HIGH)
3. **Replace sqrt(progress) with linear scaling** (HIGH)
4. **Update documentation** - remove "research-backed parameters" claims
5. **Add 0.5°C cap engineering note**

**Estimate:** 2-3 hours implementation + testing

### Phase 2: Parameter Documentation
1. Document all magnitudes as "conservative estimates ±50%"
2. Add sensitivity analysis plan to README
3. Create research gap documentation for future validation

**Estimate:** 1 hour

### Phase 3: Sensitivity Analysis (Quality Gate)
Run Monte Carlo N≥30 with parameter variations:
- Baseline: Linear scaling, 0.10-0.30°C (fixed interactions)
- Conservative: 0.5x scaling (0.05-0.15°C)
- Aggressive: 2.0x scaling (0.20-0.60°C)
- No cap: Remove 0.5°C maximum
- Quadratic: `progress^2` scaling

**Acceptance Criteria:** Outcome distributions should show <30% variation across parameter sets (cascade timing may shift, but extinction/utopia probabilities shouldn't flip)

**Estimate:** 4-6 hours (Monte Carlo runtime)

---

## Future Research Needs

### Expert Elicitation Study
- Survey 10-20 climate scientists for interaction magnitude estimates
- Use Delphi method to reach consensus
- Document uncertainty ranges

**Justification:** Current literature lacks temperature-space coupling magnitudes

### Network Modeling Validation
- Collaborate with tipping points research groups (PIK, Exeter)
- Request network model runs with temperature-based coupling
- Validate against published interaction matrices

### Regional Heterogeneity
- AMOC effects differ by Amazon region (north vs south)
- Arctic amplification varies seasonally
- Ice sheet interactions operate on different timescales

---

## Implementation Status Tracking

| Issue | Priority | Status | Assigned | ETA |
|-------|----------|--------|----------|-----|
| AMOC → Amazon sign error | CRITICAL | ❌ BLOCKING | TBD | - |
| AMOC → Greenland missing | HIGH | ❌ BLOCKING | TBD | - |
| sqrt(progress) backwards | HIGH | ❌ BLOCKING | TBD | - |
| Documentation update | HIGH | ⚠️ READY | TBD | - |
| 0.5°C cap relabel | MEDIUM | ⚠️ READY | TBD | - |
| GrIS ↔ WAIS asymmetry | MEDIUM | 📋 PLANNED | TBD | - |
| Sensitivity analysis | HIGH | 📋 PLANNED | TBD | - |

---

## Next Steps

1. **Notify implementation team** - simulation-maintainer agent
2. **Block production runs** - Add warning to Monte Carlo scripts
3. **Create GitHub issue** - Track remediation progress
4. **Schedule expert consultation** - Contact climate scientists for validation

**Owner:** Simulation Maintainer (Roy)
**Quality Gate:** Must pass re-verification (Grade B or higher) before unblocking

---

## References

**Verification Report:** `research/verification_cf49657_20251207.md`
**Implementation File:** `src/types/tipping-points.ts:517-633`
**Commit:** cf49657

**Key Sources:**
- Nature Communications 2023: AMOC-Amazon stabilization
- Science Advances 2025: WAIS-AMOC interactions
- Earth System Dynamics 2024: Rate-induced cascades
- Global Tipping Points Report 2023: Comprehensive interaction assessment

---

**Report completed:** December 8, 2025
**Researcher:** Autonomous Researcher (researcher-001)
**Status:** Ready for implementation team review
