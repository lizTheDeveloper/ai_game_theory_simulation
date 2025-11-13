# Novel Entities Zero-Effectiveness Research Workflow

**Date:** 2025-11-13
**Coordinator:** Orchestrator
**Priority:** TIER 1 CRITICAL
**Status:** Phase 2 - Validation (IN PROGRESS)

---

## Problem Statement

God mode testing reveals **0% effectiveness** for Novel Entities boundary despite 7 deployed pollution technologies:
- PFAS remediation
- Plastic-eating enzymes
- Microplastic capture
- Electrochemical destruction
- 3 additional pollution technologies

**Critical Question:** Is this an implementation bug OR fundamental thermodynamic/economic constraint?

---

## Workflow Phases

### Phase 1: Research (Quality Gate 1) - ✅ COMPLETED
**Owner:** super-alignment-researcher (Cynthia)
**Deliverable:** `research/novel_entities_zero_effectiveness_20251113.md` (742 lines, 16 sources)
**Timeline:** Completed 2025-11-13
**Grade:** B+ (initial review)

**Research Questions (All 5 Required):**

1. **Thermodynamic Feasibility (Energy Trap)**
   - Question: Is cleanup energy requirement exceeding global capacity?
   - Hypothesis: PFAS thermal destruction (850-1200°C, 50-100 GJ/ton) would require 4-40% of global energy
   - Target: Energy requirements vs. global capacity with uncertainty ranges

2. **Concentration Problem (Dilution Reality)**
   - Question: Do cleanup techs only work on concentrated waste (>1000 mg/L) while environmental contamination is ng/L to μg/L?
   - Target: Minimum effective concentrations, cost scaling with dilution

3. **Rebound Effects (Jevons Paradox)**
   - Question: Does making cleanup "cheaper" increase pollution production (moral hazard)?
   - Target: Historical waste generation rates after cleanup tech deployment

4. **Irreversibility Hypothesis (Permanent Contamination)**
   - Question: Are novel entities effectively permanent on human timescales?
   - Evidence: Cousins et al. 2022 - PFAS in rainwater exceeds EPA advisories globally
   - Target: Reversible vs. irreversible fractions, atmospheric transport dynamics

5. **Montreal Protocol Effectiveness**
   - Question: How much did production ban contribute vs. cleanup for CFC phase-out?
   - Target: Prevention vs. remediation effectiveness ratios

**Requirements:**
- 2+ peer-reviewed sources per question (2024-2025 preferred)
- Quantitative parameters with pessimistic/realistic/optimistic ranges
- Research confidence level (50-95%)
- Implementation recommendations

**Task File:** `.claude/agents/task-context-phase3-research.md`

### Phase 2: Validation (Quality Gate 1) - 🔄 IN PROGRESS
**Owner:** research-skeptic (Sylvia)
**Input:** Cynthia's research document + verification spec
**Deliverable:** `reviews/novel_entities_research_validation_20251113.md`
**Timeline:** ~4-6 hours (detailed citation + claim verification)
**Started:** 2025-11-13 (Orchestrator coordinating)

**Validation Criteria:**
- Citation verification (no fabricated papers)
- Contradictory evidence search
- Methodological critique
- Overconfidence detection
- Research grade (A-F scale)

**Gate:** Must achieve B+ or higher to proceed to implementation

### Phase 3: Diagnostic Testing - PENDING
**Owner:** simulation-maintainer (Roy) OR priya (if statistical analysis needed)
**Deliverable:** Diagnostic test results
**Timeline:** ~30 minutes

**Tests:**
1. Run simulation with each of 7 pollution techs deployed INDIVIDUALLY
2. Track Novel Entities delta per tech
3. Identify if ANY tech shows effectiveness >0%
4. Compare against research findings

**Outcomes:**
- If NO tech works → Likely model bug (tech not being applied)
- If SOME work but weak → Concentration/energy constraints correct
- If ALL show 0% → Fundamental constraint confirmed

### Phase 4: Design Recommendations - PENDING
**Owner:** Orchestrator + simulation-maintainer (collaborative)
**Deliverable:** Implementation plan
**Timeline:** ~1 hour

**Potential Model Changes Based on Research:**

1. **Energy-Constrained Cleanup:**
   - Add `energyRequirement` property to pollution tech
   - Add `minimumConcentration` threshold
   - Gate effectiveness by `renewableEnergySurplus`

2. **Irreversible Stock Mechanics:**
   - Add `irreversible: boolean` flag to Novel Entities boundary
   - Model as asymptotic approach (never reaches zero)
   - Track `legacyStock` with exponential decay (half-life 20-50 years)

3. **Rebound Effects:**
   - Net effectiveness = cleanup rate - induced production increase
   - Add moral hazard parameter to cleanup tech

4. **Concentration Scaling:**
   - Effectiveness = f(contamination_concentration)
   - Power law decay for dilute streams (not linear)

5. **Prevention Priority:**
   - Shift tech tree emphasis: production bans > cleanup
   - Add TIER 0 prevention tech (PFAS ban, plastic phase-out)

### Phase 5: Documentation Synthesis - PENDING
**Owner:** wiki-documentation-updater (Historian)
**Input:** All research + diagnostics + design decisions
**Deliverable:** Wiki updates
**Timeline:** ~30 minutes

**Updates:**
- Document research findings in wiki
- Update tech effectiveness model documentation
- Add planetary boundary constraint sections
- Cross-reference with climate energy analysis

---

## Coordination Protocol

**Research Channel Posts:**
- Cynthia: Post start message when beginning research
- Cynthia: Post progress updates if blockers encountered
- Cynthia: Post completion + handoff to Sylvia
- Sylvia: Post validation start
- Sylvia: Post critique findings + grade
- Orchestrator: Post gate decision (pass/fail/iterate)

**Implementation Channel Posts:**
- Orchestrator: Post research summary when gate passes
- Roy/Priya: Post diagnostic results
- Orchestrator: Post design recommendations

**Coordination Channel Posts:**
- Orchestrator: Post workflow start (this document)
- Orchestrator: Post phase transitions (research → validation → implementation)
- Orchestrator: Post ALERT if critical issues block workflow
- Orchestrator: Post COMPLETED when workflow finishes

---

## Success Criteria

Research workflow complete when:
- ✅ All 5 research questions answered with 2+ sources each
- ✅ Research validation passes (B+ grade or higher)
- ✅ Diagnostic tests identify root cause (bug vs. constraint)
- ✅ Design recommendations documented
- ✅ Implementation plan ready for Roy
- ✅ Research document saved to repository

---

## Risk Mitigation

**Risk 1: Research finds insufficient sources**
- Mitigation: Broaden search to 2023 papers, industry reports
- Escalation: If <50% confidence, document uncertainty and model conservatively

**Risk 2: Validation critique finds fabricated citations**
- Mitigation: Cynthia re-research with stricter source verification
- Gate: Must achieve B+ after corrections

**Risk 3: Diagnostic tests show implementation bug**
- Mitigation: Pivot to bug fix workflow (simulation-maintainer priority)
- Timeline: Bug fix may take precedence over research integration

**Risk 4: Research confirms 0% is correct**
- Mitigation: Document as "research-verified constraint," not bug
- Action: Update roadmap expectations, focus on prevention tech

---

## References

- Research Roadmap: `research/RESEARCH_ROADMAP.md` (lines 23-120)
- God Mode Diagnostics: `reviews/god_mode_diagnostics_*.md`
- Workflow Guide: `docs/DEVELOPMENT_WORKFLOW.md`
- Chatroom Protocol: `.claude/chatroom/README.md`

---

**Next Action:** Cynthia to begin research on 5 critical questions, save to `research/novel_entities_zero_effectiveness_20251113.md`

**Orchestrator Status:** Monitoring research channel for progress updates
