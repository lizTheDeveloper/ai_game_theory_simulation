# Orchestration Status: Hindcast Demographic Transition Tuning

**Feature:** Region-Specific Historical Death Rates (1990-2020)
**Priority:** MEDIUM (backlog)
**Orchestrator:** orchestrator-1
**Date Started:** 2025-12-09
**Current Status:** ✅ Ready for Implementation (Roy)

---

## Workflow Progress

### ✅ Phase 1: Research (COMPLETE)
**Agent:** super-alignment-researcher (Cynthia) - orchestrator proxy
**Duration:** ~45 minutes
**Status:** COMPLETE
**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/regional_death_rates_unwpp2024_20251209.md`

**Key Findings:**
- 10 regions, 8 time points (1990-2025), ~80 data points
- Sub-Saharan Africa: 15.5 → 8.7 per 1,000 (47% decline)
- Europe: 10.5 → 11.0 per 1,000 (stable/rising, aging effect)
- Global trend: 9.4 → 7.7 per 1,000 (18% decline)
- Sources: UN WPP 2024, World Bank, WHO

**Data Quality:** Grade B (midpoint estimates from trends, not exact CSV extractions)

---

### ✅ Quality Gate 1: Research Validation (COMPLETE)
**Agent:** research-skeptic (Sylvia) - orchestrator proxy
**Duration:** ~30 minutes
**Status:** ✅ **CONDITIONAL PASS**
**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/hindcast_demographic_research_critique_20251209.md`

**Grade:** B (downgraded from B+ due to data precision issues)

**Critical Issues Identified:**
1. **Data Precision (HIGH):** Estimates vs exact values - acceptable for first iteration
2. **Expected Impact (MEDIUM):** Optimistic (5-6pp may be 3-5pp) - tempering expectations
3. **Europe Trend (LOW):** COVID artifact in 2021 data - corrected
4. **Central Asia (LOW):** Low data quality - acceptable (small population)

**Decision:** Proceed to implementation with midpoint estimates, extract exact UN WPP 2024 CSV values before final validation.

**Target Revised:** Aim for 5-7% overshoot (from 10.3%), not guaranteed <5%

---

### 🔄 Phase 2: Implementation (IN PROGRESS)
**Agent:** simulation-maintainer (Roy)
**Status:** Ready for handoff
**Handoff:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/.claude/agents/HANDOFF_roy_hindcast_demographic_implementation.md`

**Tasks:**
1. Add `REGIONAL_HISTORICAL_CDR` data structure to `BaselineMortalityPhase.ts`
2. Implement `getRegionalHistoricalDeathRate(regionName, year)` function
3. Integrate into `regionalPopulations.ts` (historical mode only)
4. Add defensive assertions (no silent fallbacks)
5. Add TODO comments for exact value extraction

**Estimated Duration:** 2-3 hours

**Files to Modify:**
- `src/simulation/engine/phases/BaselineMortalityPhase.ts` (~100 lines added)
- `src/simulation/regionalPopulations.ts` (~20 lines modified)

---

### ⏳ Phase 3: Validation (PENDING)
**Agent:** priya (quantitative-validator)
**Status:** Awaiting Roy's implementation
**Expected Duration:** 2-3 hours

**Tasks:**
1. Run Monte Carlo hindcast (N≥10, 1990-2020)
2. Compare population trajectories vs historical data
3. Calculate deviation % for each checkpoint year (1990, 1995, 2000, 2005, 2010, 2015, 2020)
4. Verify determinism (CV < 0.01%)
5. Generate effectiveness report

**Success Criteria:**
- **Minimum:** 2020 overshoot <7% (3+ percentage point improvement from 10.3%)
- **Target:** 2020 overshoot 5-7% (4-5 percentage point improvement)
- **Stretch:** 2020 overshoot <5% (5+ percentage point improvement)
- **Determinism:** CV < 0.01% (non-negotiable)

**If Target Achieved:**
- Extract exact UN WPP 2024 CSV values
- Replace midpoint estimates
- Re-run validation (expect further improvement to <5%)

**If Target Missed:**
- Investigate secondary factors (birth rate precision, migration, age structure)
- May need additional research/implementation phases

---

### ⏳ Quality Gate 2: Architecture Review (PENDING)
**Agent:** architecture-skeptic
**Status:** Awaiting validation results
**Expected Duration:** 1 hour

**Review Focus:**
- Performance impact (expected minimal - single function call per region per year)
- State propagation correctness (regional CDR → deaths → population)
- Code quality (defensive coding, assertions, no silent fallbacks)
- Integration cleanliness (historical vs projection mode separation)

**Expected Issues:** LOW (straightforward feature, parallel to existing birth rate implementation)

---

### ⏳ Phase 5: Documentation (PENDING)
**Agent:** wiki-documentation-updater (historian)
**Status:** Awaiting architecture review pass
**Expected Duration:** 1 hour

**Tasks:**
1. Update `docs/wiki/README.md` with regional CDR implementation
2. Document UN WPP 2024 sources with full citations
3. Add hindcast validation results
4. Update demographic transition section

---

### ⏳ Archival (PENDING)
**Agent:** architect
**Status:** Awaiting documentation completion
**Expected Duration:** 30 minutes

**Tasks:**
1. Merge delta from `openspec/changes/hindcast-demographic-tuning/specs/simulation/spec.md` into `openspec/specs/simulation/spec.md`
2. Archive completed work to `docs/implementation-history/hindcast-demographic-tuning/`
3. Update project progress tracking
4. Clean up temporary handoff files

---

## Timeline

**Total Estimated Duration:** 6-8 hours
**Completed:** ~1.5 hours (research + validation)
**Remaining:** 4.5-6.5 hours (implementation + validation + review + docs + archival)

---

## Key Decisions Made

### Decision 1: Proceed with Midpoint Estimates (Research Grade B)
**Rationale:**
- Exact UN WPP 2024 CSV extraction blocked by interactive portal limitations
- Midpoint estimates from trend data are sufficiently accurate for first iteration
- Can refine with exact values after validation confirms hypothesis

**Trade-off:** Accept Grade B research for speed, upgrade to Grade A before final validation

---

### Decision 2: Target 5-7% Overshoot, Not <5%
**Rationale:**
- Research validation identified expected impact as optimistic (5-6pp may be 3-5pp)
- Regional CDR likely accounts for 60-80% of overshoot, not 100%
- Secondary factors (birth rate precision, migration, age structure) may contribute 20-40%

**Trade-off:** More realistic expectations, less risk of disappointment

---

### Decision 3: Use Central Asia Estimates Despite Low Data Quality
**Rationale:**
- Central Asia ~1% of global population (small impact)
- If CDR off by ±2 per 1,000, affects global population by ~0.02% (negligible)
- U-shaped pattern (Soviet collapse → recovery) is documented, if uncertain

**Trade-off:** Accept some uncertainty for comprehensive regional coverage

---

### Decision 4: Europe CDR Stable 1990-2020, Not Rising
**Rationale:**
- 2021 data (13 per 1,000) includes COVID spike, not baseline trend
- Pre-COVID Europe CDR was 10-11 per 1,000 (stable due to competing effects: aging vs improving medicine)
- Slight rise to 11 by 2020 acceptable (aging effect beginning to dominate)

**Trade-off:** More conservative estimate, reduces risk of over-adjusting

---

## Risk Assessment

### Risk 1: Validation Doesn't Hit Target (5-7% Overshoot)
**Probability:** MEDIUM (30-40%)
**Impact:** HIGH (requires additional investigation)
**Mitigation:**
- Research identified plausible secondary factors (migration, age structure)
- Can iterate with additional implementation phases if needed
- Worst case: Partial success (7-8% still better than 10.3%)

### Risk 2: Exact Value Extraction Reveals Large Errors
**Probability:** LOW (10-20%)
**Impact:** MEDIUM (requires re-implementation)
**Mitigation:**
- Midpoint estimates based on multiple sources (triangulation)
- Trends are correct even if exact values slightly off
- Validation will show if errors are systematic

### Risk 3: Implementation Introduces Bugs (NaN, Crashes)
**Probability:** LOW (10%)
**Impact:** HIGH (blocks validation)
**Mitigation:**
- Defensive coding standards (assertions, input validation)
- Roy has deep domain knowledge (simulation-maintainer)
- Quick integration test before full validation

---

## Success Metrics

### Primary Metrics:
1. **Population Overshoot Reduction:** 2020 deviation reduces from +10.3% to 5-7%
2. **Determinism:** Monte Carlo CV < 0.01% (non-negotiable)
3. **No Regressions:** Early years (1990-2005) maintain accuracy (<5%)

### Secondary Metrics:
1. **Regional Patterns:** Sub-Saharan Africa growth faster than Europe (matching reality)
2. **Code Quality:** Grade B+ or higher from architecture review
3. **Documentation:** Wiki updated, research properly cited

### Stretch Goals:
1. **Exact Value Extraction:** Upgrade research from Grade B to Grade A
2. **Overshoot <5%:** Achieve optimistic target (not guaranteed)
3. **Publication-Ready:** Research doc suitable for external validation

---

## Handoff Files Created

1. **Research Assignment:** `HANDOFF_cynthia_hindcast_demographic_tuning.md`
2. **Validation Assignment:** `HANDOFF_sylvia_hindcast_demographic_validation.md`
3. **Implementation Assignment:** `HANDOFF_roy_hindcast_demographic_implementation.md` ← **ACTIVE**

---

## Next Action

**🎯 CURRENT:** Wait for Roy (simulation-maintainer) to implement regional death rate functions.

**Expected:** Roy posts completion to `implementation` channel, then handoff to Priya for validation.

**Orchestrator Role:** Monitor progress, unblock issues, coordinate next phase transitions.

---

**Status:** ✅ Orchestration Phase 1 & 2 Complete, Ready for Implementation
