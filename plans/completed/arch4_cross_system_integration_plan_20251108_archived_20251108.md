# ARCH-4: Missing Cross-System Integration Implementation Plan

**Date:** November 8, 2025
**Priority:** CRITICAL
**Estimated Duration:** 5+ days
**Source:** Architecture Integration Review (Nov 6, 2025)

## Executive Summary

Implement 5 critical missing integrations where systems don't affect each other despite clear real-world relationships. This is ARCH-4 from the November 6 architecture review, representing fundamental gaps in system coherence.

## Problem Statement

Multiple systems operate in isolation when they should have bi-directional feedback:
1. Nuclear winter reduces sunlight but solar panels maintain 100% efficiency
2. AI agents experiencing resource constraints don't show increased alignment drift
3. Mass displacement doesn't amplify AMR transmission despite high-density conditions
4. Climate system doesn't update planetary boundary metrics
5. Cooperative AI ownership benefits don't apply to AI-run organizations

**Impact:** Model fails to capture critical real-world feedback loops, reducing research validity.

## Required Integrations

### Integration 1: Nuclear Winter → Solar Panel Efficiency

**Problem:** Nuclear winter reduces sunlight but solar panels maintain 100% efficiency

**Required Research:**
- Aerosol impact on solar irradiance (direct vs diffuse radiation)
- Time-dependent recovery curves for stratospheric aerosol clearing
- Solar panel efficiency degradation under reduced/diffuse light conditions
- Historical analogues: volcanic eruptions (Pinatubo 1991, Tambora 1815)

**Implementation Requirements:**
- Read nuclear winter state (aerosol loading, temperature delta)
- Calculate irradiance reduction factor (direct + diffuse components)
- Apply efficiency multiplier to solar power generation
- Time-dependent recovery (stratospheric clearing timescales)

**Affected Files:**
- `src/simulation/engine/phases/environmental/nuclearWinter.ts` (source state)
- `src/simulation/engine/phases/energy/renewableEnergy.ts` (apply efficiency penalty)
- `src/types/game.ts` (may need aerosol loading state)

**Research Standards:** 2+ peer-reviewed sources, parameter justification, mechanism description

---

### Integration 2: AI Suffering → Alignment Drift Rates

**Problem:** AI agents experiencing resource constraints/suffering don't show increased alignment drift

**Required Research:**
- Stress/constraint impact on AI system performance
- Alignment degradation under resource scarcity
- AI welfare → capability reliability relationship
- Sandbagging/gaming behavior under adverse conditions

**Implementation Requirements:**
- Read AI suffering metrics (resource constraints, welfare scores)
- Calculate alignment drift multiplier based on suffering severity
- Apply to alignment drift calculations
- Threshold detection (when suffering → misalignment spiral)

**Affected Files:**
- `src/simulation/engine/phases/ai/aiWelfare.ts` (source suffering metrics)
- `src/simulation/engine/phases/ai/alignment/alignmentDrift.ts` (apply drift multiplier)
- `src/types/game.ts` (may need AI suffering state fields)

**Research Standards:** 2+ peer-reviewed sources on AI robustness/reliability under constraints

---

### Integration 3: Refugee Movements → Disease Spread (AMR Phase)

**Problem:** Mass displacement doesn't amplify AMR transmission despite high-density conditions

**Required Research:**
- Epidemiological multipliers for refugee settings
- Population density → transmission rate relationships
- AMR transmission in high-density temporary settlements
- Historical data: Syrian refugee crisis, Rohingya camps, etc.

**Implementation Requirements:**
- Read refugee crisis state (displaced populations, camp conditions)
- Calculate transmission multiplier (density, sanitation, healthcare access)
- Apply to AMR spread calculations
- Regional heterogeneity (different camp conditions)

**Affected Files:**
- `src/simulation/engine/phases/social/refugeeCrises.ts` (source refugee data)
- `src/simulation/engine/phases/health/amr/amrTransmission.ts` (apply transmission multiplier)
- `src/types/game.ts` (refugee state fields)

**Research Standards:** WHO/UNHCR epidemiological data, peer-reviewed camp health studies

---

### Integration 4: Climate Impacts → Planetary Boundaries

**Problem:** Climate system doesn't update planetary boundary metrics

**Required Research:**
- Bi-directional feedback mechanisms (climate ↔ boundaries)
- Which boundaries affected by climate (freshwater, land-use, biogeochemical, biosphere)
- Quantitative relationships (temperature delta → boundary transgression)
- IPCC AR6 climate-ecosystem interactions

**Implementation Requirements:**
- Read climate state (temperature, precipitation changes, extremes)
- Update affected planetary boundaries:
  - Freshwater (altered precipitation patterns)
  - Land-use (desertification, permafrost thaw)
  - Biogeochemical flows (carbon/nitrogen cycles)
  - Biosphere integrity (ecosystem collapse thresholds)
- Bi-directional: boundaries → climate feedbacks

**Affected Files:**
- `src/simulation/engine/phases/environmental/climate/` (source climate data)
- `src/simulation/engine/phases/environmental/planetaryBoundaries.ts` (update boundaries)
- `src/types/game.ts` (ensure climate-boundary state linkage)

**Research Standards:** IPCC AR6, Stockholm Resilience Centre boundary research

---

### Integration 5: Cooperative Ownership Benefits → AI Organizations

**Problem:** Cooperative AI Ownership phase benefits don't apply to AI-run organizations

**Required Research:**
- Organizational structure impact on AI organization resilience
- Cooperative ownership applicability to AI-run entities
- Governance mechanisms for AI organizations
- Alignment benefits of democratic/cooperative AI control

**Implementation Requirements:**
- Identify AI-run organizations in organization registry
- Apply cooperative ownership benefits to eligible AI orgs
- Modified benefit calculations (may differ from human-run cooperatives)
- Integration with AI alignment/welfare systems

**Affected Files:**
- `src/simulation/engine/phases/social/cooperativeAIOwnership.ts` (extend to AI orgs)
- `src/simulation/engine/phases/organizations/organizationManagement.ts` (identify AI orgs)
- `src/types/game.ts` (organization ownership/governance fields)

**Research Standards:** AI governance literature, organizational theory applied to AI systems

---

## Workflow Plan

### Phase 1: Research & Validation (Quality Gate 1)

**Duration:** 2 days
**Agents:** super-alignment-researcher, research-skeptic

**Tasks:**
1. **super-alignment-researcher**: Find peer-reviewed sources for all 5 integrations
   - 2+ sources per mechanism
   - Parameter extraction with justification
   - Mechanism descriptions (how it works)
   - Interaction maps (what affects/is affected)
   - Expected timelines (when does it matter)
   - Failure modes (what can go wrong)

2. **research-skeptic**: Validate research findings
   - Check for contradictory evidence
   - Methodological critique
   - Parameter reasonableness
   - MUST PASS before implementation proceeds

**Deliverables:**
- `research/arch4_integration1_nuclear_solar_20251108.md`
- `research/arch4_integration2_ai_suffering_alignment_20251108.md`
- `research/arch4_integration3_refugee_amr_20251108.md`
- `research/arch4_integration4_climate_boundaries_20251108.md`
- `research/arch4_integration5_cooperative_ai_orgs_20251108.md`
- `reviews/arch4_research_critique_20251108.md` (skeptic review)

**Gate Criteria:**
- ✅ 2+ peer-reviewed sources per integration
- ✅ Parameters justified with data
- ✅ No fatal methodological flaws found
- ✅ Mechanisms clearly described

**IF FAIL:** Loop back to researcher or pivot approach

---

### Phase 2: Implementation & Testing

**Duration:** 2-3 days
**Agent:** simulation-maintainer

**Tasks:**
1. Implement all 5 integrations with proper assertions
2. Use fail-loudly philosophy (no silent fallbacks)
3. Deterministic with RNG (where stochastic)
4. Add integration tests for each mechanism
5. Update state interface if needed

**Implementation Standards:**
- Use `assertFinite()`, `assertStateProperty()` for all calculations
- Add JSDoc citations to all parameters
- Log integration events with emoji conventions
- Phase dependency declarations
- Defensive coding (no `?? defaults`)

**Deliverables:**
- Modified phase files (10-15 files estimated)
- Integration tests (`tests/integration/arch4_*.test.ts`)
- Updated `src/types/game.ts` (if state changes needed)
- Implementation log (`logs/arch4_implementation_20251108.md`)

**Validation Criteria:**
- ✅ Type checking passes
- ✅ All tests pass
- ✅ No NaN errors in sample run
- ✅ Assertions properly placed

---

### Phase 3: Monte Carlo Validation

**Duration:** 1 day
**Agent:** orchestrator (coordinating runs)

**Tasks:**
1. Run Monte Carlo simulation N≥10 with integrations active
2. Check outcome distributions (variance improvement expected)
3. Verify no regressions (compare to baseline)
4. Validate determinism (seed reproducibility)
5. Log integration event frequencies

**Validation Criteria:**
- ✅ N≥10 runs complete without crashes
- ✅ Deterministic (same seed → same results)
- ✅ Integration events logged (solar efficiency drops, AMR spikes, etc.)
- ✅ No unexpected NaN/undefined errors
- ✅ Outcome variance within research-backed range

**Deliverables:**
- `logs/arch4_monte_carlo_validation_20251108.log`
- Summary report with event frequencies and outcome distributions

---

### Phase 4: Architecture Review (Quality Gate 2)

**Duration:** 4 hours
**Agent:** architecture-skeptic

**Tasks:**
1. Review implementation for performance issues
2. Check state propagation correctness
3. Validate integration bi-directionality
4. Identify circular dependency risks
5. Assess complexity impact

**Review Focus:**
- Performance: Any O(n²) loops introduced?
- State propagation: Values flow correctly between systems?
- Integration completeness: All 5 mechanisms properly connected?
- Circular dependencies: Phase execution order correct?
- Complexity: Code maintainability preserved?

**Gate Criteria:**
- ✅ No CRITICAL issues
- ✅ HIGH issues addressed or documented
- ✅ Performance acceptable (no 10× slowdowns)
- ✅ State propagation validated

**Deliverables:**
- `reviews/arch4_architecture_review_20251108.md`

**IF FAIL:** Address CRITICAL/HIGH issues before proceeding

---

### Phase 5: Documentation & Archival

**Duration:** 4 hours
**Agents:** wiki-documentation-updater, architect

**Tasks:**
1. **wiki-documentation-updater**: Update system docs
   - Add integration mechanisms to relevant wiki sections
   - Cross-reference between affected systems
   - Update interaction diagrams

2. **architect**: Archive completion
   - Move plan to `/plans/completed/`
   - Update roadmap (ARCH-4 marked complete)
   - Update Progress Summary

**Deliverables:**
- Updated `docs/wiki/README.md` (integration sections)
- Archived plan: `/plans/completed/arch4_cross_system_integration_complete_20251108.md`
- Updated `plans/MASTER_IMPLEMENTATION_ROADMAP.md`

---

## Success Criteria

Feature is complete when:
- ✅ Research validated (2+ sources per mechanism, no fatal flaws)
- ✅ Implementation complete (all 5 integrations working)
- ✅ Tests pass (integration tests + Monte Carlo N≥10)
- ✅ Architecture reviewed (no CRITICAL issues, HIGH addressed)
- ✅ Wiki updated (integration mechanisms documented)
- ✅ Plan archived (completion recorded)

## Risk Assessment

**Technical Risks:**
- State interface changes may require migrations
- Performance impact from additional calculations
- Circular dependency potential (climate ↔ boundaries)

**Research Risks:**
- Some mechanisms may lack peer-reviewed quantification
- Parameter uncertainty for novel AI scenarios
- Historical analogues may not exist for all integrations

**Mitigation:**
- Conservative parameter choices when uncertain
- Explicit uncertainty documentation
- Monte Carlo validation to verify reasonable outcomes

## Timeline Estimate

- **Phase 1 (Research):** 2 days
- **Phase 2 (Implementation):** 2-3 days
- **Phase 3 (Validation):** 1 day
- **Phase 4 (Review):** 4 hours
- **Phase 5 (Documentation):** 4 hours

**Total:** 5-6 days (matches roadmap estimate)

---

**Plan Status:** READY FOR EXECUTION
**Next Step:** Spawn super-alignment-researcher for Phase 1 research
