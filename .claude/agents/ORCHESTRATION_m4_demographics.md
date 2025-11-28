# ORCHESTRATION PLAN: M-4 Population Demographics Refinement

**Date:** 2025-11-28
**Orchestrator:** orchestrator-1
**Priority:** MEDIUM (from roadmap)
**Timeline:** 4-6 hours end-to-end

## Objective

Reduce population simulation error from **+24.5% → <10%** (currently ~10.1B vs 8.12B target for 2024)

## Problem Summary

**Current State:**
- Simulation overshoots by ~2B people
- Uses 7 regions with static baseline birth/death rates
- Total baseline: 7540M (should be 8120M for 2024)
- Birth rates too high, mortality rates too low for 1990-2024 period

**Root Cause:**
Static rates don't capture demographic transition dynamics (fertility decline, life expectancy gains)

## Workflow Overview

```
Phase 1: Research & Validation (Quality Gate 1)
├─ Cynthia: Gather UN WPP 2024 demographic parameters
└─ Sylvia: Validate sources & methodology → GATE: Must pass

Phase 2: Implementation & Testing
├─ Roy: Implement calibrated parameters
└─ Monte Carlo: N=10 validation (target <10% error)

Phase 3: Architecture Review (Quality Gate 2)
└─ Architecture-skeptic: Performance/state propagation → GATE: Fix CRITICAL/HIGH

Phase 4: Documentation & Archival
├─ Wiki update: Document new parameters
├─ Devlog: Implementation diary entry
└─ Roadmap: Update M-4 status
```

## Detailed Phases

### Phase 1.1: Research (Cynthia)

**Handoff:** `.claude/agents/HANDOFF_cynthia_m4_demographics.md`

**Deliverables:**
- Historical TFR by region (1990, 2000, 2010, 2020, 2024)
- Historical CDR/Life Expectancy by region
- 2024 population benchmarks for validation
- Parameter recommendations (time-varying vs static)
- Demographic transition classification

**Output:** `research/population_demographics_regional_20251128.md`

**Timeline:** 1-2 hours

**Success Criteria:**
- UN WPP 2024 data for all 7 regions
- 2+ peer-reviewed sources per claim
- Clear numerical parameter targets
- Implementable recommendations

### Phase 1.2: Validation (Sylvia) - QUALITY GATE 1

**Handoff:** `.claude/agents/HANDOFF_sylvia_m4_validation.md`

**Validation Checklist:**
- Source quality (UN WPP 2024, WHO GHO)
- Regional mapping accuracy (UN regions → simulation regions)
- Parameter feasibility (can Roy implement?)
- Methodological soundness (no fatal flaws)

**Output:** `reviews/m4_demographics_research_critique_20251128.md`

**Timeline:** 30 minutes

**Decision:**
- ✅ PASS → Proceed to implementation
- ⚠️ CONDITIONAL → Minor revisions, then proceed
- ❌ FAIL → Loop back to Cynthia

### Phase 2.1: Implementation (Roy)

**Handoff:** `.claude/agents/HANDOFF_roy_m4_implementation.md`

**Tasks:**
1. Update regional baselines in `populationDynamics.ts`
2. Implement time-varying rates (if recommended)
3. Add migration flows (if material)
4. Add defensive assertions (no silent fallbacks)
5. Type check: `npx tsc --noEmit`
6. Unit tests: `npm test`

**Output:** Updated `src/simulation/populationDynamics.ts` + git commit

**Timeline:** 2-3 hours

**Success Criteria:**
- Type safety maintained
- All tests pass
- Defensive assertions added
- Code review ready

### Phase 2.2: Monte Carlo Validation

**Command:**
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_m4_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Parameters:**
- N=10 runs
- seed=42 (deterministic)
- Full 35-year simulation (1990→2025)

**Success Criteria:**
- Population 2024: <10% error (from current 24.5%)
- Determinism: CV < 0.01% (all runs identical)
- Regional populations match UN benchmarks (±10%)
- Other calibrations not broken (temperature, biodiversity)

**Timeline:** 1-2 hours (includes analysis)

### Phase 3: Architecture Review - QUALITY GATE 2

**Agent:** architecture-skeptic

**Review Focus:**
- Performance: Any O(n²) loops, deep cloning?
- State propagation: Does population update flow correctly?
- Edge cases: Aging populations, high fertility regions
- Complexity: Is time-varying logic maintainable?

**Output:** `reviews/m4_demographics_architecture_20251128.md`

**Timeline:** 30 minutes

**Decision:**
- ✅ PASS → Proceed to documentation
- ⚠️ CRITICAL/HIGH issues → Must fix before merge

### Phase 4: Documentation & Archival

**Tasks:**
1. **Wiki update** (wiki-documentation-updater):
   - Document new demographic parameters
   - Update population dynamics section
   - Add Monte Carlo validation results

2. **Devlog entry:**
   - Implementation narrative
   - Challenges encountered
   - Parameter decisions (time-varying vs static)

3. **Roadmap update:**
   - Mark M-4 as complete OR update status
   - Document actual error reduction achieved
   - Archive if <10% target met

**Timeline:** 30 minutes

## Agent Coordination

### Coordination Channel Posts

**Orchestrator (Start):**
```markdown
**orchestrator-1** | 2025-11-28 | [STARTED]
M-4 Population Demographics Refinement workflow initiated.
Target: 24.5% → <10% error. Spawning Cynthia for research.
```

**Cynthia (Research Complete):**
```markdown
**cynthia** | 2025-11-28 | [COMPLETED]
Research complete: research/population_demographics_regional_20251128.md
Findings: [summary]. Ready for Sylvia validation.
```

**Sylvia (Validation Result):**
```markdown
**sylvia** | 2025-11-28 | [COMPLETED]
Validation: [PASS/CONDITIONAL/FAIL]
Critique: reviews/m4_demographics_research_critique_20251128.md
[Next steps based on decision]
```

**Roy (Implementation Complete):**
```markdown
**roy** | 2025-11-28 | [COMPLETED]
Implementation complete. Monte Carlo validation: [results]
Error reduction: 24.5% → [actual]%. Ready for architecture review.
```

**Architecture-skeptic (Review Complete):**
```markdown
**architecture-skeptic** | 2025-11-28 | [COMPLETED]
Architecture review: [PASS/ISSUES FOUND]
Review: reviews/m4_demographics_architecture_20251128.md
```

**Orchestrator (Complete):**
```markdown
**orchestrator-1** | 2025-11-28 | [COMPLETED]
M-4 workflow complete. Error: 24.5% → [actual]%.
Documentation updated, roadmap archived.
```

## Quality Gates Summary

**Gate 1: Research Validation (Sylvia)**
- **Blocks:** Implementation cannot proceed until passed
- **Criteria:** Sources valid, parameters implementable, no fatal flaws
- **Fallback:** Loop to Cynthia for revisions OR pivot approach

**Gate 2: Architecture Review (Architecture-skeptic)**
- **Blocks:** Merge cannot proceed until CRITICAL/HIGH issues addressed
- **Criteria:** Performance acceptable, state propagation correct
- **Fallback:** Roy fixes issues, re-review

## Success Metrics

**Primary:**
- ✅ Population error <10% (from 24.5%)

**Secondary:**
- ✅ Regional populations match UN benchmarks (±10%)
- ✅ Determinism maintained (CV < 0.01%)
- ✅ Other calibrations not broken (temperature, biodiversity)
- ✅ Code quality maintained (assertions, type safety)

**Documentation:**
- ✅ Research document peer-reviewed quality
- ✅ Implementation devlog entry
- ✅ Wiki updated with new parameters
- ✅ Roadmap reflects completion

## Contingency Plans

### If Validation Fails (Sylvia)
- **Minor issues:** Cynthia revises specific sections, fast-track re-validation
- **Fatal flaws:** Orchestrator decides: major research revision OR pivot to different approach

### If Monte Carlo Shows <10% Not Achievable
- **Close (10-15%):** Accept as "good enough", update roadmap
- **Far (>15%):** Investigate: wrong parameters? structural issues? missing feedback loops?

### If Architecture Review Finds Performance Issues
- **CRITICAL:** Must fix (e.g., O(n²) loop added)
- **HIGH:** Strongly recommended (e.g., deep cloning overhead)
- **MEDIUM:** Document as technical debt

### If Other Calibrations Break
- **Regression test:** Monte Carlo should catch this
- **Root cause:** Did new parameters cascade unexpectedly?
- **Fix:** Roy adjusts, re-validate

## Timeline Breakdown

| Phase | Task | Agent | Duration |
|-------|------|-------|----------|
| 1.1 | Research | Cynthia | 1-2h |
| 1.2 | Validation | Sylvia | 30m |
| 2.1 | Implementation | Roy | 2-3h |
| 2.2 | Monte Carlo | Automated | 1-2h |
| 3 | Architecture Review | Architecture-skeptic | 30m |
| 4 | Documentation | Multiple | 30m |
| **TOTAL** | | | **4-6h** |

## Handoff Files

All handoff documents prepared in `.claude/agents/`:
- `HANDOFF_cynthia_m4_demographics.md` (Phase 1.1)
- `HANDOFF_sylvia_m4_validation.md` (Phase 1.2)
- `HANDOFF_roy_m4_implementation.md` (Phase 2.1)

Ready to execute. Begin with Cynthia.

---

**"Let the model show what it shows." - Research simulation philosophy**
