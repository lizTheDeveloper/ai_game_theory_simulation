# Orchestration Plan: H-3 Extinction Debt Implementation

**Feature:** Model extinction lag effects (50-400 year timescales)
**Priority:** HIGH (H-3 from roadmap)
**Orchestrator:** orchestrator-1
**Date Started:** November 27, 2025
**Complexity:** Multi-system (biodiversity, planetary boundaries, food security)

---

## Problem Statement

**Current Issue:** Simulation assumes ecosystems recover immediately when stressors removed

**Research Reality:**
- Kuussaari et al. (2009): 50-400 year extinction debt in tropical forests
- Halley et al. (2016): Meta-analysis across 36 studies confirms lag effects
- Tilman et al. (1994): Original theoretical foundation
- 200+ papers document this phenomenon

**Impact:** Current model OVERESTIMATES recovery potential, UNDERESTIMATES irreversibility

---

## Existing Implementation Status

**What's Already Done (Nov 16-17, 2025):**
- ✅ Biosphere boundary has asymptotic recovery framework
- ✅ Recovery parameters set (200 year half-life, 5% floor)
- ✅ Research citations in code (Tilman, Kuussaari, Haddad, IPBES)
- ✅ Integration with habitat restoration tech

**What's Missing:**
- ❌ Explicit extinction debt tracking (committed vs realized)
- ❌ Ecosystem-specific lag timescales
- ❌ Contradiction: `irreversible: false` (line 159) blocks recovery logic
- ❌ No queuing mechanism for delayed extinctions

**Files Already Modified:**
- `/src/simulation/planetaryBoundaries.ts` (lines 129-162, 774-838)
- Irreversibility utilities exist: `/src/simulation/utils/irreversibility.ts`

---

## Workflow Phases

### Phase 1: Research & Validation ✅ IN PROGRESS

**1.1 Research (Cynthia - super-alignment-researcher)** ✅ ASSIGNED
- Task file: `.claude/agents/task_cynthia_extinction_debt_research.md`
- Output: `research/extinction_debt_YYYYMMDD.md`
- Key papers: Tilman (1994), Kuussaari (2009), Halley (2016), + 2020-2025 updates
- Parameters: Lag times by ecosystem, debt ratios, mechanisms, recovery dynamics
- Timeline: 4-6 hours

**1.2 Validation (Sylvia - research-skeptic)** ⏳ PENDING
- Task file: TBD
- Input: Cynthia's research file
- Output: `reviews/extinction_debt_critique_YYYYMMDD.md`
- Check for: Contradictory evidence, methodological issues, parameter uncertainty
- **Quality Gate 1:** MUST PASS before implementation

---

### Phase 2: Implementation & Testing ⏳ PENDING

**2.1 Fix Irreversible Flag (Roy - simulation-maintainer)**
- File: `src/simulation/planetaryBoundaries.ts` line 159
- Change: `irreversible: false` → `irreversible: true`
- Rationale: Enable asymptotic recovery logic (already implemented but disabled)

**2.2 Enhance Extinction Debt Tracking (Roy)**
- Add to GameState: `ExtinctionDebtState` interface
- Implement queuing mechanism for delayed extinctions
- Track committed vs realized extinctions by ecosystem
- Integrate with food security (pollination services)

**2.3 Test Writers (unit-test-writer, integration-test-writer)**
- Spawned by feature-implementer if needed
- Unit tests for debt accumulation/paydown
- Integration tests for biodiversity → food security pathway

**2.4 Monte Carlo Validation (Priya)**
- Run N≥10 simulations with different seeds
- Check: Recovery trajectories now appropriately slow
- Validate: Coefficient of variation < 0.01% (determinism)
- Analyze: Outcome distribution changes

---

### Phase 3: Quality Assurance ⏳ PENDING

**3.1 Architecture Review (Architecture-Skeptic)** **MANDATORY**
- Check: Performance impact of extinction queue
- Check: Integration with planetary boundaries system
- Check: State propagation correctness
- **Quality Gate 2:** Address CRITICAL/HIGH issues before merge

**3.2 Code Quality Review (Senior-Dev-Reviewer)** **MANDATORY**
- Check: Defensive coding (assertions, no silent fallbacks)
- Check: Determinism (no Math.random)
- Check: Research citations complete
- **Quality Gate 3:** Address CRITICAL issues before documentation

---

### Phase 4: Documentation & Archival ⏳ PENDING

**4.1 Wiki Update (Wiki-Documentation-Updater)**
- Add extinction debt section to biodiversity docs
- Document queuing mechanism
- Cross-reference planetary boundaries

**4.2 Plan Archival (Architect)**
- Move `proposed_extinction_debt_modeling_20251125.md` to `plans/completed/`
- Update roadmap: Mark H-3 as COMPLETED
- Update Progress Summary

---

## Decision Log

**Decision 1:** Use existing asymptotic recovery framework
- **Rationale:** Already implemented, research-backed, just needs flag fix
- **Alternative considered:** Full rewrite (rejected - unnecessary)

**Decision 2:** Enhance with explicit debt tracking
- **Rationale:** User request for "committed vs realized" tracking
- **Alternative considered:** Just fix flag (rejected - incomplete solution)

**Decision 3:** Research-first approach (not direct implementation)
- **Rationale:** 200+ papers available, need ecosystem-specific parameters
- **Alternative considered:** Use existing citations (rejected - insufficient detail)

---

## Communication Log

**Nov 27, 2025 02:55 UTC - Orchestrator**
- Entered coordination
- Created Cynthia research task
- Status: Research phase IN PROGRESS

---

## Success Criteria (Definition of Done)

- ✅ Research validated (no fatal flaws)
- ✅ Irreversible flag fixed (enables recovery)
- ✅ Extinction debt queue implemented
- ✅ Ecosystem-specific lag times applied
- ✅ Monte Carlo validation passes (deterministic, slow recovery)
- ✅ Architecture review passes (no CRITICAL/HIGH issues)
- ✅ Code quality review passes (no CRITICAL issues)
- ✅ Wiki updated with extinction debt mechanics
- ✅ Plan archived to completed/

---

## Risk Assessment

**Low Risk:**
- Asymptotic framework already exists
- Well-established science (not speculative)
- Additive (doesn't break existing mechanics)

**Medium Risk:**
- Ecosystem-specific parameters may have high uncertainty
- Performance impact of extinction queue (needs profiling)

**Mitigation:**
- Research validation catches uncertainty issues
- Architecture review catches performance issues
- Can disable feature via config flag during testing

---

## Blocking Issues

None currently. Workflow proceeding as planned.

---

## Timeline Estimate

- **Research + Validation:** 6-10 hours
- **Implementation:** 4-6 hours
- **Testing + Validation:** 3-4 hours (MC runs in background)
- **Reviews:** 2-3 hours
- **Documentation:** 1-2 hours
- **Total:** 16-25 hours over 2-3 days

---

**Status:** ✅ Phase 1.1 IN PROGRESS (Cynthia researching)
**Next Milestone:** Research validation (Sylvia)
**Last Updated:** 2025-11-27 02:55 UTC
