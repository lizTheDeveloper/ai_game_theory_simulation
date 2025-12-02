# TIER 1 CRITICAL Research Gaps - Coordination Document

**Date:** 2025-11-12
**Coordinator:** orchestrator-1
**Status:** RESEARCH PHASE INITIATED
**Priority:** TIER 1 CRITICAL (blocks feature development until resolved)

---

## Overview

This document coordinates systematic research and validation for two CRITICAL gaps identified in god mode testing:

1. **Novel Entities Boundary:** 0% effectiveness despite deploying 7 pollution technologies
2. **AI Coordination:** 30% mortality (2.44B deaths) from instant uncoordinated tech deployment

**Research Roadmap Reference:** `research/RESEARCH_ROADMAP.md` TIER 1

---

## Workflow Architecture

### Phase 1: Parallel Research (IN PROGRESS)

**Agent:** super-alignment-researcher (Cynthia)

**Task 1A - Novel Entities:**
- **File:** `plans/active/novel_entities_research_task_20251112.md`
- **Output:** `research/novel_entities_energy_dilution_analysis_20251112.md`
- **Focus:** Energy trap, concentration problem, rebound effects, irreversibility
- **Timeline:** 2-3 hours

**Task 1B - AI Coordination:**
- **File:** `plans/active/ai_coordination_research_task_20251112.md`
- **Output:** `research/ai_coordination_transition_mortality_20251112.md`
- **Focus:** Historical transition mortality, diffusion rates, safety nets, regional capacity
- **Timeline:** 2-3 hours

**Success Criteria:**
- Minimum 2 peer-reviewed sources per research question (8+ Novel Entities, 10+ AI Coordination)
- Evidence Quality: A- minimum
- Quantitative parameters with uncertainty bounds
- 2024-2025 publications preferred

---

### Phase 2: Critical Validation (PENDING - Quality Gate 1)

**Agent:** research-skeptic (Sylvia)

**Task 2A - Novel Entities Validation:**
- **Input:** `research/novel_entities_energy_dilution_analysis_20251112.md`
- **Output:** `reviews/novel_entities_critique_20251112.md`
- **Focus:**
  - Validate energy calculations (4-40% global energy claim)
  - Challenge concentration problem hypothesis
  - Find strongest counterevidence
  - Grade: A- minimum to proceed

**Task 2B - AI Coordination Validation:**
- **Input:** `research/ai_coordination_transition_mortality_20251112.md`
- **Output:** `reviews/ai_coordination_critique_20251112.md`
- **Focus:**
  - Validate mortality bounds (30% uncoordinated, <5% coordinated)
  - Challenge assumptions about AI coordination effectiveness
  - Historical analogue quality assessment
  - Grade: A- minimum to proceed

**Quality Gate Decision:**
- ✅ PASS (A- or above) → Proceed to Phase 3
- ⚠️ CONDITIONAL PASS (B+ with minor issues) → Address issues then proceed
- ❌ FAIL (B or below) → Loop back to research with new direction

---

### Phase 3: Diagnostics & Design (PENDING)

**Agent:** simulation-maintainer (Roy)

**Task 3A - Novel Entities Diagnostic:**
- **Purpose:** Isolate which of 7 pollution technologies are broken
- **Method:** Deploy each technology individually in separate simulation runs
- **Track:** Novel Entities boundary delta per technology
- **Output:** `reviews/novel_entities_diagnostic_20251112.md`
- **Timeline:** 1-2 hours (7 simulation runs)

**Task 3B - CoordinatedDeploymentPhase Design:**
- **Purpose:** Design system to model AI-managed technology rollout
- **Based on:** Research findings from Task 1B + 2B
- **Output:** `plans/coordinated_deployment_phase_design_20251112.md`
- **Includes:**
  - Phase architecture (fits into PhaseOrchestrator.ts)
  - Transition speed vs. mortality relationship
  - Safety net effectiveness multipliers
  - Regional capacity modeling approach
  - Parameter definitions with justification
- **Timeline:** 2-3 hours

---

### Phase 4: Quantitative Validation (PENDING)

**Agent:** priya (Quantitative Validator)

**Task 4A - Energy Calculation Validation:**
- **Purpose:** Independently verify 4-40% global energy claim
- **Method:**
  - Validate PFAS destruction energy (50-100 GJ/ton)
  - Calculate global contamination stock
  - Compare to IEA global energy budget
  - Assess feasibility bounds
- **Output:** Section in `reviews/quantitative_validation_tier1_20251112.md`

**Task 4B - Mortality Bounds Validation:**
- **Purpose:** Sanity-check transition mortality estimates
- **Method:**
  - Compare 30% god mode mortality to historical analogues
  - Validate <5% coordinated deployment target
  - Statistical bounds on uncertainty
- **Output:** Section in `reviews/quantitative_validation_tier1_20251112.md`

---

### Phase 5: Implementation Decision (PENDING)

**Coordinator:** orchestrator-1 (this agent)

**Decision Matrix:**

**For Novel Entities:**
- ✅ If diagnostic isolates broken tech → Fix implementation bugs
- ✅ If energy trap validated → Add energy constraint mechanics
- ✅ If concentration problem validated → Add dilution effectiveness decay
- ✅ If rebound effects validated → Model dual effect (reduce stock + increase flow)
- ⚠️ If irreversibility validated → Consider modeling as permanent accumulation

**For AI Coordination:**
- ✅ If mortality bounds validated → Implement CoordinatedDeploymentPhase
- ⚠️ If <5% target too optimistic → Adjust expectations, add uncertainty
- ✅ If safety net effectiveness quantified → Add multiplier system
- ✅ If regional capacity framework exists → Add readiness assessment

**Quality Gates:**
- Research Quality: A- minimum (enforced in Phase 2)
- Diagnostic Completeness: Test all 7 pollution techs individually
- Design Clarity: Clear parameter definitions with justification

---

## Coordination Channels

**Matrix/Chatroom Channels:**
- `coordination` - Orchestrator status updates
- `research` - Cynthia posts research progress
- `research-critique` - Sylvia posts validation findings
- `implementation` - Roy posts diagnostic/design results

**Posting Protocol:**
- **STARTED:** Agent begins work
- **IN-PROGRESS:** Major milestone reached
- **BLOCKED:** Critical issue preventing progress
- **COMPLETED:** Task finished, ready for next phase

---

## Expected Outputs

### Research Phase Deliverables:
1. `research/novel_entities_energy_dilution_analysis_20251112.md` (Cynthia)
2. `research/ai_coordination_transition_mortality_20251112.md` (Cynthia)

### Validation Phase Deliverables:
3. `reviews/novel_entities_critique_20251112.md` (Sylvia)
4. `reviews/ai_coordination_critique_20251112.md` (Sylvia)

### Diagnostics Phase Deliverables:
5. `reviews/novel_entities_diagnostic_20251112.md` (Roy)
6. `plans/coordinated_deployment_phase_design_20251112.md` (Roy)

### Validation Phase Deliverables:
7. `reviews/quantitative_validation_tier1_20251112.md` (Priya)

### Decision Phase Deliverables:
8. `plans/implementation_decision_tier1_20251112.md` (Orchestrator)

---

## Timeline

**Phase 1 (Research):** 2-3 hours (parallel)
**Phase 2 (Validation):** 1-2 hours (parallel)
**Phase 3 (Diagnostics/Design):** 2-4 hours (parallel)
**Phase 4 (Quantitative Validation):** 1-2 hours
**Phase 5 (Decision):** 1 hour

**Total Estimated:** 7-12 hours

---

## Success Criteria

**Research Quality:**
- ✅ A- minimum evidence quality
- ✅ 2+ peer-reviewed sources per question
- ✅ Quantitative parameters extracted
- ✅ 2024-2025 publications when available

**Validation Quality:**
- ✅ Counterevidence identified
- ✅ Methodological critique
- ✅ Conservative bounds established

**Diagnostic Quality:**
- ✅ All 7 pollution techs tested individually
- ✅ Root cause identified (bug vs. research gap)

**Design Quality:**
- ✅ Clear parameter definitions
- ✅ Research-backed values
- ✅ Fits into existing phase architecture

---

## Next Steps

**IMMEDIATE (Phase 1 - IN PROGRESS):**
- super-alignment-researcher (Cynthia) begins parallel research on both tasks
- Posts progress updates to `research` channel
- Estimated completion: 2-3 hours

**WAITING FOR:**
- Phase 1 completion triggers Phase 2 (research-skeptic validation)

**HUMAN INTERVENTION REQUIRED IF:**
- Quality Gate 1 fails (research quality B or below)
- Diagnostic reveals fundamental architectural issue
- Research gaps prevent parameter extraction

---

**Status:** Research phase initiated. Waiting for Cynthia to begin work and post updates to research channel.
