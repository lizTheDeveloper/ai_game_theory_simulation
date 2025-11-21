# Handoff: Uncertainty Propagation Implementation

**Date:** 2025-11-20 22:00 UTC
**From:** orchestrator-1
**To:** simulation-maintainer (Roy) OR research-skeptic (Sylvia) for validation first
**Priority:** MEDIUM (research integrity - Daily Review issue #8)
**Status:** Research complete, ready for implementation

---

## Context

Daily Review 20251120_060001 identified missing uncertainty propagation as the last remaining MEDIUM priority research integrity issue (7/8 resolved, this is #8).

**Issue:** Simulation uses point estimates for critical climate parameters where peer-reviewed literature reports significant uncertainty ranges (e.g., climate sensitivity 2.5-4.0°C, AMOC threshold 2.2-3.9°C).

**Impact:** False confidence in outcomes - Monte Carlo runs show <1% variance when real scientific uncertainty suggests 15-30% variance is realistic.

---

## Work Completed

### Research Analysis (COMPLETE)
**Document:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/uncertainty_propagation_climate_parameters_20251120.md`

**Key findings:**
1. **Existing research is excellent** - AMOC and tipping points already have uncertainty ranges documented
2. **Critical missing parameter:** Climate sensitivity (ECS) - IPCC AR6 range 2.5-4.0°C (likely)
3. **Impact prioritization:** ECS uncertainty affects ALL outcomes (30-40 percentage point swings)
4. **Implementation approach:** Parameter sampling at initialization using deterministic RNG

**Parameters identified (9 total):**
- ✅ Climate Sensitivity (ECS): 2.5-4.0°C → **CRITICAL IMPACT**
- ✅ Transient Climate Response (TCR): 1.4-2.2°C → HIGH impact
- ✅ AMOC threshold: 2.2-3.9°C → HIGH impact
- ✅ Greenland threshold: 0.8-3.2°C → MEDIUM-HIGH impact
- ✅ WAIS threshold: 2.0-3.0°C → MEDIUM impact
- ✅ Amazon deforestation threshold: 20-25% → HIGH impact
- ✅ Permafrost carbon pool: 1,460-1,600 Gt C → MEDIUM impact
- ✅ Sea level commitments: ±7% uncertainty → LOW impact
- ✅ Coral reef threshold: 1.0-1.5°C → LOW impact (already crossed)

---

## Recommended Implementation Path

### Option A: Implementation First (Fast Track)
**If confident in research analysis:**

1. **Spawn simulation-maintainer (Roy)**
   - Task: Implement uncertainty propagation per research document
   - Input: `research/uncertainty_propagation_climate_parameters_20251120.md`
   - Timeline: 8-13 hours (Phases 1-3)
   - Deliverables:
     - UncertaintyParameters interface added to GameState
     - sampleUncertaintyParameters() function in initialization.ts
     - Tipping point checks use sampled thresholds
     - ECS/TCR integrated into temperature calculations
     - Unit tests + Monte Carlo validation (N=100)

2. **Architecture review** (standard quality gate)
   - Spawn architecture-skeptic after implementation
   - Check: Performance impact, determinism validation

3. **Documentation**
   - Wiki update (docs/wiki/README.md)
   - Devlog entry
   - Code comments with citations

---

### Option B: Validation First (Quality Gate)
**If want research-skeptic review before implementation:**

1. **Spawn research-skeptic (Sylvia)**
   - Task: Validate uncertainty propagation analysis
   - Input: `research/uncertainty_propagation_climate_parameters_20251120.md`
   - Questions to validate:
     - Is parameter sampling approach sound?
     - Are IPCC AR6 ranges correctly interpreted?
     - Is impact prioritization reasonable (ECS > AMOC > Amazon)?
     - Any critical parameters missing?
   - Timeline: 1-2 hours

2. **Address critique** (if needed)
   - Revise analysis based on Sylvia's findings
   - Update research document

3. **Then proceed to Option A** (implementation)

---

## Implementation Details (From Research Doc)

### Code Changes Required

**1. Add interface (src/types/game.ts):**
```typescript
export interface UncertaintyParameters {
  equilibriumClimateSensitivity: number; // [2.0, 5.0]
  transientClimateResponse: number; // [1.2, 2.4]
  amocCollapseThreshold: number; // [2.2, 3.9]
  greenlandCollapseThreshold: number; // [0.8, 3.2]
  waisCollapseThreshold: number; // [2.0, 3.0]
  amazonDiebackDeforestationThreshold: number; // [20, 25]
  coralReefThreshold: number; // [1.0, 1.5]
  permafrostCarbonPool: number; // [1460, 1600]
  greenlandSeaLevelCommitment: number; // [6.7, 7.7]
  waisSeaLevelCommitment: number; // [3.0, 3.6]
}
```

**2. Sampling function (src/simulation/initialization.ts):**
- Use deterministic RNG (same seed as main simulation)
- Distribution types:
  - ECS: Log-normal (asymmetric, long tail to high values)
  - TCR: Normal
  - Thresholds: Uniform (no distribution shape known)
- Clamp to literature ranges (e.g., ECS ∈ [2.0, 5.0])

**3. Use sampled values:**
- Replace hardcoded thresholds in `specificTippingPoints.ts`
- Integrate ECS into temperature calculations
- Update AMOC, Greenland, WAIS collapse checks

**4. Validation:**
- Unit tests: Determinism, range validation
- Integration tests: ECS affects outcomes
- Monte Carlo N=100: Outcome variance increases to 15-30% CV

---

## Expected Outcomes

### Before (Current - Point Estimates)
- Monte Carlo N=100: <1% coefficient of variation
- All runs nearly identical outcomes
- False confidence (doesn't reflect scientific uncertainty)

### After (With Uncertainty Propagation)
- Monte Carlo N=100: 15-30% coefficient of variation
- Outcome distribution broadens:
  - Utopia: 35-50% (was 45% with narrow range)
  - Collapse: 15-30% (was 20%)
  - Extinction: 2-10% (was 5%)
- Tail risks visible (5-10% extinction is plausible, not 0%)
- Scenario dependence clear (high ECS → higher collapse risk)

**Interpretation:** Not "model less accurate" but "model now reflects real uncertainty"

---

## Validation Criteria (Definition of Done)

### Must Have
1. ✅ UncertaintyParameters added to GameState with source citations
2. ✅ Sampling functions implemented using deterministic RNG
3. ✅ Tipping points use sampled thresholds (no hardcoded values)
4. ✅ ECS/TCR integrated into temperature calculations
5. ✅ Unit tests pass (determinism, range validation)
6. ✅ Monte Carlo N=100 runs without crashes/NaN errors
7. ✅ Outcome variance broadens (CV increases from <1% to 15-30%)
8. ✅ Documentation updated (wiki, devlog, code comments)

### Should Have
9. ✅ Integration tests verify ECS affects outcomes
10. ✅ Comparison analysis (before/after uncertainty propagation)

---

## Files Created

1. **Research analysis:** `research/uncertainty_propagation_climate_parameters_20251120.md` (comprehensive, 850+ lines)
2. **Task specification:** `.claude/tasks/uncertainty_propagation_research_20251120.md`
3. **This handoff:** `.claude/HANDOFF_uncertainty_propagation_20251120.md`

---

## Citations (Zotero-Ready)

All citations documented in research file, including:
- IPCC AR6 WG1 Chapter 7 (ECS/TCR ranges)
- Westen et al. JGR 2024 (AMOC threshold)
- Bellomo et al. Nature 2025 (AMOC resilience)
- Existing project research (AMOC, tipping points, irreversibility)

---

## Recommended Next Action

**OPTION 1 (Fast):** Spawn simulation-maintainer for implementation
```
Task: Implement uncertainty propagation
Input: research/uncertainty_propagation_climate_parameters_20251120.md
Timeline: 8-13 hours
```

**OPTION 2 (Quality Gate):** Spawn research-skeptic for validation first
```
Task: Validate uncertainty propagation analysis
Input: research/uncertainty_propagation_climate_parameters_20251120.md
Timeline: 1-2 hours
Then: Address critique → spawn simulation-maintainer
```

**My recommendation:** Option 2 (validation first) - Sylvia should review the impact prioritization (ECS > AMOC > Amazon) and parameter sampling approach. This is a research integrity issue, so quality gate is appropriate even though it's MEDIUM priority.

---

## Blockers

**None.** Research is complete, implementation path is clear, no dependencies.

---

**Orchestrator signature:** orchestrator-1
**Timestamp:** 2025-11-20 22:00 UTC
**Status:** Ready for handoff to research-skeptic or simulation-maintainer
