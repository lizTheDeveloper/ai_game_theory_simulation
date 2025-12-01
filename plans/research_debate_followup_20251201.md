# Research Debate Follow-up Actions

**Date:** December 1, 2025
**Source:** Session 24 Research Debate (`reviews/research_debate_session_20251201.md`)
**Status:** PLANNING
**Priority:** MEDIUM (follow-up to completed MEDIUM work)

---

## Executive Summary

Research debate session identified 4 actionable recommendations:
1. **IMMEDIATE:** Fix bifurcation threshold docs ✅ **COMPLETE**
2. **HIGH (when budget allows):** Execute parameter sweep N=50 minimum
3. **MEDIUM:** Audit positive tipping thresholds
4. **MEDIUM:** Validate cross-system interactions

This plan documents the remaining 3 items for future roadmap prioritization.

---

## 1. Parameter Sweep Execution (HIGH when budget allows)

### Problem
M-3 infrastructure complete but execution indefinitely deferred. Without sensitivity analysis, all simulation results are conditionally valid (true only if parameters are correct).

### Current Status
- ParameterSweepConfig interface: ✅ Complete (7 parameters)
- Parameter injection: ✅ Complete (all hardcoded values refactored)
- LHS methodology: ✅ Validated (research-backed)
- Pilot test: ✅ Passed (N=3 runs, no NaN)
- **Execution:** ❌ Deferred (indefinitely)

### Recommendation
Execute N=50 minimum sweep (not full N=200) to:
- Validate parameter assumptions (7 parameters tested)
- Generate 90% confidence intervals for key outputs
- Identify which parameters drive outcome variance
- Test bifurcation threshold sensitivity (58% ± 10%)

### Effort
- **Compute:** 2-4 hours (N=50 runs @ 2-5 minutes each)
- **Analysis:** 1-2 hours (Sobol indices, CI generation)
- **Report:** 1-2 hours (document findings)
- **Total:** 4-8 hours

### Dependencies
- Token budget restored (current: conservation mode)
- OR VM deployment complete (parallel workers speed up execution)

### Priority Justification
**HIGH when budget allows** - Without this, we don't know if our results are robust or artifacts of specific parameter choices. M-3 infrastructure was built for this purpose; execution should follow.

---

## 2. Audit Positive Tipping Thresholds (MEDIUM)

### Problem
Bifurcation threshold documentation revealed that 58% may be conflated with diffusion tipping points (5-25%). This suggests other positive tipping point thresholds may have similar issues.

### Audit Scope
**Systems to check:**
1. **Technology bifurcation** (BifurcationLogicPhase.ts)
   - Current: 58% deployment triggers regime shift
   - Question: Is this regime classification or diffusion threshold?
   - Status: ✅ Documented correctly (regime shift, not diffusion)

2. **Positive tipping cascades** (thresholds/distributions.ts, thresholds/index.ts)
   - Social cohesion thresholds
   - Trust threshold crossing
   - Cooperation emergence
   - Question: Are these using empirical diffusion thresholds incorrectly?

3. **Upward spiral triggers** (upwardSpirals.ts)
   - Environmental recovery thresholds
   - Social stability recovery
   - Question: Grounded in research or phenomenological?

### Investigation Steps
1. Grep for threshold definitions in positive systems
2. Trace citations for each threshold value
3. Compare with diffusion theory (Rogers 5-25%) vs regime shift theory
4. Identify miscategorizations (if any)
5. Document findings in review report

### Effort
- **Grep + trace:** 1 hour
- **Citation validation:** 1-2 hours
- **Report:** 1 hour
- **Total:** 2-4 hours

### Deliverables
- `reviews/positive_tipping_threshold_audit_YYYYMMDD.md`
- List of thresholds requiring citation/recalibration
- Recommendations for fixes (if needed)

### Priority Justification
**MEDIUM** - Positive tipping points are less critical than collapse dynamics. However, if 58% was miscategorized, other thresholds may have similar issues. Low-effort audit with potentially high impact.

---

## 3. Validate Cross-System Interactions (MEDIUM)

### Problem
Debate identified 0.7× time scaling factor (collapse regime tech effectiveness) as potentially curve-fitting rather than mechanistically grounded.

### Investigation Scope
**Regime multipliers to validate:**
1. **Breakdown regime** (1.5× mortality amplification)
   - Current: Phenomenological, bounded [1.2, 1.8]
   - Question: Is 1.5× grounded in research or calibrated?
   - Status: Documented as phenomenological

2. **Collapse regime** (0.7× tech effectiveness)
   - Current: Phenomenological, bounded [0.5, 0.9]
   - Question: Does this represent real mechanism or curve-fitting?
   - Status: **Lacks citation**

3. **Cross-system validation** (multiple systems)
   - Climate stability → tech effectiveness
   - Social cohesion → deployment speed
   - Environmental health → recovery timescales
   - Question: Are interaction effects grounded or emergent?

### Investigation Steps
1. Search literature for crisis scenarios and technology effectiveness
   - War-time innovation (accelerated vs degraded)
   - Disaster response (coordination breakdown effects)
   - System collapse precedents (Rome, Maya, Bronze Age)
2. Compare 0.7× with empirical evidence
3. If unsupported: Mark as phenomenological assumption
4. If supported: Add citations to codebase
5. Document interaction effects validation

### Effort
- **Literature search:** 2-3 hours
- **Cross-system tracing:** 1-2 hours
- **Report + citations:** 1-2 hours
- **Total:** 4-8 hours

### Deliverables
- `research/regime_multiplier_validation_YYYYMMDD.md`
- Citations for 0.7× (if found)
- OR documentation as phenomenological assumption (if not found)
- Cross-system interaction map

### Priority Justification
**MEDIUM** - Regime multipliers are bounded and tested in M-3 parameter sweep. However, lack of citation for 0.7× is a research quality gap. This should be addressed when research budget allows.

---

## Prioritization Summary

| Item | Priority | Effort | Blocked By | Value |
|------|----------|--------|------------|-------|
| 1. Parameter sweep (N=50) | HIGH* | 4-8h | Token budget OR VM | Validates all assumptions |
| 2. Positive tipping audit | MEDIUM | 2-4h | None | Catches potential miscategorizations |
| 3. Cross-system validation | MEDIUM | 4-8h | None | Fills research quality gap |

*HIGH when budget allows (currently: conservation mode)

---

## Next Steps

1. **Add to roadmap:** Create MEDIUM items for #2 and #3
2. **Promote #1 to HIGH:** When token budget restored or VM deployed
3. **Research channel:** Post requests for regime multiplier literature
4. **Archive this plan:** When all 3 items complete

---

## Success Criteria

**Item 1 (Parameter Sweep):**
- N=50 runs complete without crashes
- 90% confidence intervals generated for 5+ key outputs
- Sobol indices calculated (which parameters matter most?)
- Bifurcation threshold sensitivity tested

**Item 2 (Tipping Audit):**
- All positive tipping thresholds catalogued
- Citations traced or documented as phenomenological
- No miscategorizations found (or fixed if found)

**Item 3 (Cross-System Validation):**
- 0.7× collapse multiplier cited OR marked as assumption
- Interaction effects mapped and documented
- Research quality gap filled

---

## Related Documents

- **Source:** `reviews/research_debate_session_20251201.md`
- **M-3 Infrastructure:** `plans/completed/m3_parameter_injection_infrastructure_20251130.md`
- **Bifurcation Fix:** `research/technology_bifurcation_threshold_validation_20251130.md`
- **Architecture Review:** `reviews/architecture_integration_review_20251201.md`
- **Research Validation:** `reviews/research_source_validation_20251201.md`
