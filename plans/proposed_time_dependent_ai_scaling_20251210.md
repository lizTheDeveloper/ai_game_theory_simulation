# Plan: Time-Dependent AI Capability Scaling Model

**Created:** December 10, 2025 (Session 65)
**Priority:** CRITICAL (blocks Issue #747 resolution)
**Effort Estimate:** SMALL (2-3 hours)
**Related Issue:** #747 - AI capability doubling time parameter mismatch

---

## Problem Statement

**Current Implementation:**
- Fixed 8-month doubling time for AI capabilities
- Conservative estimate citing "diminishing returns"
- Results in ~32,768× growth over 10 years

**Research Finding:**
- 3.6-month doubling time (Sevilla & Roldán 2024, Epoch AI 2024)
- Empirical trend from 2010-2024
- Results in ~10,000,000,000× growth over 10 years

**Discrepancy:**
- 327,800× difference between implementation and research over 10 years
- Affects ALL breakthrough timelines, alignment difficulty, economic disruption

**Research Debate Outcome (reviews/ai_capability_scaling_debate_20251210.md):**
- **Grade A** evidence for 3.6-month trend (2010-2024)
- **Grade C-D** evidence for 8-month slowdown
- **Six concerns identified:** Historical extrapolation risk, measurement uncertainty, energy constraints, chip bottlenecks, diminishing returns evidence, test-time compute unknowns
- **Recommendation:** Time-dependent model (NOT fixed constant)

---

## Proposed Solution

Implement a **time-dependent AI capability doubling model** that reflects:
1. Historical trend continuation (2024-2027): 3.6 months
2. Emerging constraints (2027-2030): 3.6 → 8 months transition
3. Constrained regime (2030+): 8 months

### Mathematical Model

```typescript
/**
 * Calculate AI capability doubling time based on simulation month
 *
 * Research foundation:
 * - 2010-2024 trend: 3.6 months (Sevilla & Roldán 2024, Epoch AI 2024)
 * - Constraints emerge: Energy infrastructure, chip production, diminishing returns
 * - Time-dependent model balances empirical trend vs physical limits
 *
 * @param month Current simulation month (0 = Jan 2024)
 * @returns Doubling time in months
 */
function getAICapabilityDoublingTime(month: number): number {
  // Phase 1: Historical trend continuation (0-36 months = 2024-2027)
  if (month < 36) {
    return 3.6; // Empirical trend
  }

  // Phase 2: Constraint transition (36-72 months = 2027-2030)
  if (month < 72) {
    const progress = (month - 36) / 36; // 0 to 1
    return 3.6 + (8.0 - 3.6) * progress; // Linear interpolation
  }

  // Phase 3: Constrained regime (72+ months = 2030+)
  return 8.0; // Energy/chip/algorithmic constraints dominate
}
```

### Alternative: Uncertainty Range Model

If time-dependent is too complex, use **uncertainty sampling:**

```typescript
function getAICapabilityDoublingTime(rng: RNGFunction): number {
  // Sample from triangular distribution
  // Mode: 5.0 (compromise between 3.6 and 8.0)
  // Min: 3.6 (optimistic, historical trend)
  // Max: 8.0 (pessimistic, constraints dominate)
  return sampleTriangular(3.6, 5.0, 8.0, rng);
}
```

---

## Implementation Steps

### Phase 1: Research Validation (Quality Gate 1)
1. **Review 2024-2025 slowdown evidence:**
   - Energy infrastructure constraints (Goldman Sachs, IEA reports)
   - Chip production bottlenecks (Bain, TSMC capacity)
   - Diminishing returns studies (PNAS 2025, arXiv preprints)
2. **Grade the evidence:**
   - Fast scaling (3.6mo): Grade A (14-year empirical trend)
   - Slow scaling (8mo): Grade C-D (journalism, unverified rumors)
   - Constraint evidence: Grade B (industry reports, peer-reviewed)
3. **Decision:** Time-dependent model balances all evidence

### Phase 2: Implementation
1. **Update centralConfig.ts:**
   - Replace fixed `AI_CAPABILITY_DOUBLING_TIME` with function
   - Add transition milestones (36mo, 72mo)
   - Document research justification
2. **Update research.ts:**
   - Pass `state.currentMonth` to doubling time function
   - Ensure deterministic (no RNG unless uncertainty sampling)
3. **Add assertion:**
   - Validate doubling time in range [3.6, 8.0]
   - Fail loudly if out of bounds

### Phase 3: Testing
1. **Unit tests:**
   - Test phase transitions (month 35, 36, 37)
   - Test boundary conditions (month 0, 71, 72, 120)
   - Test monotonic increase (later months = slower or equal doubling)
2. **Integration tests:**
   - Run 3 scenarios: month 20, 50, 90
   - Verify capability growth rates differ appropriately
3. **Monte Carlo validation (N≥10):**
   - Compare outcome distributions vs fixed 8-month baseline
   - Check if utopia rates change significantly
   - Validate determinism (same seed = same results)

### Phase 4: Architecture Review (Quality Gate 2)
1. **Check for integration issues:**
   - Does this affect breakthrough unlock timelines?
   - Does alignment difficulty scale appropriately?
   - Are economic disruption cascades realistic?
2. **Performance check:**
   - Function call overhead negligible (O(1) conditional)
   - No deep cloning introduced
3. **Address CRITICAL/HIGH issues before merge**

### Phase 5: Documentation
1. **Update docs/wiki/README.md:**
   - Document time-dependent model in AI Capabilities section
   - Link to research debate (reviews/ai_capability_scaling_debate_20251210.md)
   - Add uncertainty rationale
2. **Update research/ directory:**
   - Create research/ai_capability_scaling_20251210.md
   - Archive debate findings
   - Link Epoch AI, Sevilla papers
3. **Close Issue #747:**
   - Link commits
   - Summarize decision (time-dependent model chosen)
   - Note Monte Carlo validation results

---

## Expected Timeline

- Early phase (2024-2027): Rapid AI progress, fast breakthrough unlocks
- Transition (2027-2030): Constraints emerge, slower but still significant growth
- Late phase (2030+): Mature technology, focus shifts to deployment/coordination

This models the **realistic trajectory** where empirical trends hold initially but physical/economic constraints eventually dominate.

---

## Interaction Map

**Affected Systems:**
1. **research.ts:** AI capability growth calculations
2. **techTree.ts:** Breakthrough unlock timing
3. **alignment.ts:** Difficulty scaling
4. **economicSystem.ts:** Disruption and automation timelines
5. **socialCohesion.ts:** Trust erosion from rapid AI advances
6. **existentialRisk.ts:** Misalignment probability over time

**All systems** that depend on AI capability levels will be affected.

---

## Failure Modes

1. **Transition too abrupt:** 36-month cutoff feels arbitrary
   - Mitigation: Use smooth interpolation (already in model)
2. **Constrained phase too pessimistic:** 8 months may underestimate future innovation
   - Mitigation: Monte Carlo shows range, not single prediction
3. **Uncertainty not captured:** Model uses point estimates per phase
   - Mitigation: Alternative uncertainty sampling approach available

---

## Research Citations

**Primary Sources:**
- Sevilla, J., & Roldán, L. (2024). Compute Trends Across Three Eras of Machine Learning. arXiv:2405.11431
- Epoch AI (2024). Algorithmic Progress in Computer Vision. https://epochai.org/blog/algorithmic-progress-in-computer-vision
- Goldman Sachs (2024). AI to Drive 165% Increase in Data Center Power Demand by 2030
- IEA (2024). Energy and AI Report
- Bain (2024). Prepare for the Coming AI Chip Shortage

**Debate:**
- reviews/ai_capability_scaling_debate_20251210.md (Sylvia + Cynthia)

**Validation:**
- reviews/research_source_validation_20251210.md (Grade A evidence for 3.6mo, Grade C-D for 8mo)

---

## Success Criteria

1. **Monte Carlo N≥10:** Deterministic runs with same seed produce identical results
2. **Outcome distributions:** Show reasonable variance (not all utopia, not all collapse)
3. **Alignment difficulty:** Scales appropriately with faster early AI growth
4. **Economic disruption:** Earlier automation waves in rapid phase vs constrained phase
5. **Quality Gate 2:** Architecture review Grade B or higher (no CRITICAL/HIGH issues)

---

## Next Steps

1. **Decision:** Choose time-dependent vs uncertainty sampling model
2. **Assign:** simulation-maintainer (Roy) for implementation
3. **Coordinate:** super-alignment-researcher (Cynthia) for research file creation
4. **Review:** architecture-skeptic post-implementation
5. **Validate:** priya (Monte Carlo N=20 with coefficient of variation analysis)

---

**Status:** PROPOSED (awaiting PM/user decision on time-dependent vs uncertainty approach)
**Priority:** CRITICAL (Issue #747 blocks understanding of AI timeline compression)
**Estimated Effort:** 2-3 hours (small change, well-defined)
