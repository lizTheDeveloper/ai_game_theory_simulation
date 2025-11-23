# Irreversibility Framework Coordination Brief

**Date:** November 20, 2025
**Orchestrator:** orchestrator-1
**Priority:** TIER 1 CRITICAL (from MASTER_IMPLEMENTATION_ROADMAP.md)

## Objective

Implement irreversibility framework across all 9 planetary boundaries with research-backed thresholds and recovery time constants. God mode analysis shows 0% effectiveness for several boundaries - some environmental damage is permanent on human timescales.

## Current State Analysis

**Existing Implementations:**
1. **Novel Entities (✅ COMPLETE):** 90% irreversibility floor (commit 805d064)
   - Peak tracking: `boundary.peak` field
   - Asymptotic approach: Cannot clean below 90% of peak
   - File: `src/simulation/updateNovelEntitiesBoundary.ts`

2. **Tipping Points (✅ COMPLETE):** IrreversibilityTrackingPhase (commit c85e8b2)
   - Ice sheets, permafrost, AMOC, Amazon, extinction debt, coral reefs, indigenous knowledge, institutional collapse
   - File: `src/simulation/engine/phases/IrreversibilityTrackingPhase.ts`

3. **Recovery Timescales (✅ COMPLETE):** planetaryBoundaryRecovery.ts
   - 3-tier recovery system (reversible, partial, irreversible)
   - But: Only models recovery TIMESCALES, not effectiveness FLOORS

**Gap Identified:**
- Existing code models HOW LONG recovery takes
- Missing: HOW MUCH recovery is possible (effectiveness plateaus)
- Only Novel Entities has effectiveness floor (90%)
- Other boundaries need similar floors based on research

## Research Foundation

**Primary Source:** `research/planetary_boundary_reversibility_empirical_verification_20251101.md`
- **Grade:** B+ (78% verified, 3% fabricated)
- **Validation:** research-skeptic (Sylvia) verified
- **Coverage:** 9 planetary boundaries with empirical timescales

**Key Findings:**
1. **Ozone (Reversible):** Full recovery by 2066 (99% phase-out achieved)
2. **Climate (Partial):** Requires 360-680 GtCO₂ removal, 50-100 year timescale
3. **Ocean Acidification (Partial):** Surface recoverable, deep ocean 15-18% more acidic permanently
4. **Biosphere (Irreversible):** Extinction is one-way, population recovery only
5. **Novel Entities (Irreversible):** PFAS/microplastics permanent, 90% floor already implemented
6. **Freshwater (Reversible):** Aquifer recharge 10-30 years
7. **P/N Cycles (Partial):** Lake Erie 50+ years, still failing (legacy sediment)
8. **Land Use (Partial):** Tree cover 30 years, ecosystem function 100 years
9. **Aerosols (Reversible):** Days-months atmospheric residence time

## Implementation Plan

### Phase 1: Research Gap Analysis (super-alignment-researcher + research-skeptic)
**Input:** Existing research file
**Questions:**
1. Does existing research provide EFFECTIVENESS FLOORS for each boundary?
2. Are timescales sufficient or do we need irreversibility thresholds?
3. What parameters need extraction from papers?

**Expected Output:** `research/planetary_boundary_irreversibility_floors_YYYYMMDD.md`
- Table: Boundary | Irreversibility Floor | Recovery Timescale | Citations
- Gaps identified for further research

**Quality Gate 1:** Research-skeptic validation (MANDATORY)

### Phase 2: Implementation (simulation-maintainer)
**Input:** Validated research with parameters
**Tasks:**
1. Extend `src/simulation/utils/irreversibility.ts` utility functions
2. Add `irreversibilityFloor` field to each boundary type
3. Implement `asymptoteRecovery()` calls in `planetaryBoundaryRecovery.ts`
4. Update boundary recovery logic to respect floors

**Expected Changes:**
- `src/types/planetaryBoundaries.ts`: Add `irreversibilityFloor?: number` to BoundaryState
- `src/simulation/planetaryBoundaryRecovery.ts`: Apply asymptotic recovery to each boundary
- `src/simulation/utils/irreversibility.ts`: Possibly add new utility functions

**Defensive Coding:**
- RNG required (no Math.random fallbacks)
- Assertion utilities for all calculations
- No silent fallbacks (fail loudly if values missing)
- Research citations in code comments

**Quality Gate 2:** Architecture-skeptic review (MANDATORY)

### Phase 3: Monte Carlo Validation (priya)
**Input:** Implemented irreversibility mechanics
**Tasks:**
1. Run god mode scenarios (N≥10 runs)
2. Verify effectiveness plateaus at correct levels
3. Check that boundaries with irreversibility floors don't fully recover
4. Statistical validation (CV < 0.01% for determinism)

**Expected Output:** `reviews/irreversibility_monte_carlo_validation_YYYYMMDD.md`
- Effectiveness plateaus observed vs expected
- God mode no longer shows 0% effectiveness (should show asymptotic approach to floor)

**Quality Gate 3:** Priya validation (MANDATORY)

### Phase 4: Documentation (wiki-documentation-updater)
**Input:** Completed implementation + Monte Carlo validation
**Tasks:**
1. Update `docs/wiki/README.md` with irreversibility mechanics
2. Create devlog entry
3. Update COMMANDS.md if new diagnostic commands needed

### Phase 5: Archival (project-plan-manager)
**Input:** All quality gates passed
**Tasks:**
1. Archive coordination brief to `plans/completed/`
2. Update Progress Summary in MASTER_IMPLEMENTATION_ROADMAP.md
3. Mark TIER 1 CRITICAL as complete

## Workflow Sequence

```
1. orchestrator → super-alignment-researcher (research gap analysis)
2. orchestrator → research-skeptic (validate research) [GATE 1]
3. IF GATE 1 PASS → simulation-maintainer (implementation)
4. orchestrator → architecture-skeptic (review) [GATE 2]
5. IF GATE 2 PASS → priya (Monte Carlo validation) [GATE 3]
6. IF GATE 3 PASS → wiki-documentation-updater (docs)
7. orchestrator → project-plan-manager (archival)
```

## Success Criteria

- ✅ All 9 boundaries have irreversibility floors (where applicable)
- ✅ God mode effectiveness shows asymptotic plateaus, not 0%
- ✅ Research citations for every floor value
- ✅ Monte Carlo validation confirms determinism
- ✅ Architecture review passes (no performance issues)
- ✅ Wiki updated with new mechanics

## Key Files to Monitor

**Implementation:**
- `src/simulation/planetaryBoundaryRecovery.ts` (main recovery logic)
- `src/simulation/utils/irreversibility.ts` (utility functions)
- `src/types/planetaryBoundaries.ts` (type definitions)

**Validation:**
- `research/planetary_boundary_irreversibility_floors_YYYYMMDD.md` (new research)
- `reviews/irreversibility_architecture_YYYYMMDD.md` (architecture review)
- `reviews/irreversibility_monte_carlo_YYYYMMDD.md` (Priya validation)

**Documentation:**
- `docs/wiki/README.md` (system documentation)
- `devlogs/irreversibility_framework_YYYYMMDD.md` (implementation diary)

## Notes

- Existing `asymptoteRecovery()` function in `irreversibility.ts` provides template
- Novel Entities implementation (90% floor) serves as reference
- Research file already validated (B+ grade) - may only need parameter extraction
- Focus on effectiveness FLOORS, not just recovery TIMESCALES

---

**Orchestrator:** Ready to spawn super-alignment-researcher for Phase 1
**Estimated Timeline:** 4-6 hours for full workflow
**Next Action:** Research gap analysis
