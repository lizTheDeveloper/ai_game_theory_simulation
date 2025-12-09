# HANDOFF: Energy Budget Constraints Validation

**To:** research-skeptic (Sylvia)
**From:** orchestrator
**Date:** 2025-12-09
**Phase:** 1.2 - Research Validation (Quality Gate 1)
**Priority:** MEDIUM
**Estimated Effort:** 2-3 hours

---

## Context

Energy Budget Constraints feature prevents unrealistic technology competition (DAC + AI datacenters + hydrogen all claiming same electricity). Cynthia has completed research extraction from IEA, MIT, DOE sources.

**Proposal:** `openspec/changes/energy-budget-constraints/proposal.md`
**Research Output:** `research/energy_budget_constraints_20251209.md`

---

## Your Task

**MANDATORY Quality Gate 1 validation before implementation proceeds.**

Evaluate Cynthia's research for:
1. **Methodological rigor** - Are sources peer-reviewed, recent (2024-2025), authoritative?
2. **Parameter justification** - Are energy requirements backed by data, not assumptions?
3. **Internal consistency** - Do growth projections align with capacity constraints?
4. **Contradictory evidence** - Are there alternative estimates that conflict?
5. **Implementation readiness** - Can Roy implement from this research alone?

**Your role:** Find flaws, contradictions, overconfidence. Challenge assumptions.

---

## Required Output

**File:** `reviews/energy_budget_constraints_critique_20251209.md`

**Format:**
```markdown
# Energy Budget Constraints - Research Critique

**Date:** 2025-12-09
**Reviewer:** Sylvia (research-skeptic)
**Research File:** research/energy_budget_constraints_20251209.md
**Phase:** Quality Gate 1 Validation

---

## Executive Summary

**Grade:** [A/A-/B+/B/B-/C+/C/F]
**Recommendation:** [PASS / CONDITIONAL PASS / FAIL / REJECT]
**Confidence in research:** [High/Medium/Low]

[2-3 paragraph overview of research quality and key concerns]

---

## Section-by-Section Critique

### 1. Global Electricity Capacity Baseline

**Strengths:**
- [What was done well]

**Weaknesses:**
- [Methodological flaws, missing data, overconfidence]

**Contradictory Evidence:**
- [Alternative estimates, conflicting sources]

**Grade:** [A-F]

---

### 2. Electricity Growth Projections

[Same format as above]

---

### 3. Technology Energy Requirements

#### 3.1 DAC
[Detailed critique]

#### 3.2 AI Datacenters
[Detailed critique]

#### 3.3 Green Hydrogen
[Detailed critique]

---

### 4. Energy Competition Dynamics

[Detailed critique]

---

## Critical Issues

### CRITICAL (Must Fix Before Implementation)
1. [Issue that breaks implementation or is fundamentally flawed]
2. ...

### HIGH (Should Fix)
1. [Issue that weakens confidence but doesn't block implementation]
2. ...

### MEDIUM (Nice to Have)
1. [Issue that improves robustness but not essential]
2. ...

---

## Contradictory Evidence Analysis

[Detailed analysis of alternative estimates, conflicting methodologies, scenario dependencies]

---

## Parameter Confidence Assessment

| Parameter | Proposed Value | Confidence | Issues | Alternative Estimates |
|-----------|----------------|------------|--------|----------------------|
| Global capacity (2025) | X TWh/year | High | None | [Range from other sources] |
| DAC energy (GJ/tCO2) | Y | Medium | [Issue] | [Alternative] |
...

---

## Implementation Readiness

**Can Roy implement from this research alone?**
- [YES / NO / CONDITIONAL]

**Missing for implementation:**
- [List any gaps that would block Roy]

**Recommended additions:**
- [What would strengthen implementation]

---

## Final Recommendation

**Grade:** [A/A-/B+/B/B-/C+/C/F]

**Decision:**
- **PASS (Grade B+ or better):** Proceed to Phase 2 (implementation)
- **CONDITIONAL PASS (Grade B/B-):** Address critical issues, then proceed
- **FAIL (Grade C+ or worse):** Major rework required, loop back to research
- **REJECT:** Fundamental flaws, consider alternative approach

**Rationale:**
[2-3 paragraphs explaining grade and decision]

---

## Required Actions (If CONDITIONAL PASS or FAIL)

1. [Specific action for Cynthia to address]
2. [Specific action for Cynthia to address]
...

---

## Validation Notes

[Any additional context, edge cases, or considerations for implementation]
```

---

## Grading Rubric

**Grade A/A-:** Exemplary research, 12+ recent peer-reviewed sources, parameters ready for implementation, no significant contradictions.

**Grade B+/B (PASS threshold):** Solid research, 8+ peer-reviewed sources, minor gaps but implementation-ready, contradictions acknowledged.

**Grade B-/C+ (CONDITIONAL PASS):** Adequate research, some methodological concerns, implementation possible with caveats, needs targeted fixes.

**Grade C or below (FAIL):** Insufficient sources, major methodological flaws, contradictory evidence not addressed, not implementation-ready.

---

## Success Criteria

- ✅ Grade assigned (A-F scale)
- ✅ Recommendation (PASS/CONDITIONAL/FAIL/REJECT)
- ✅ Section-by-section critique completed
- ✅ Critical issues identified (CRITICAL/HIGH/MEDIUM)
- ✅ Contradictory evidence analyzed
- ✅ Parameter confidence assessed
- ✅ Implementation readiness evaluated
- ✅ If < B+: Specific actions for Cynthia listed

---

## Next Steps (After Your Completion)

**If PASS (Grade B+ or better):**
1. Post to `research` channel via Matrix
2. Orchestrator will invoke simulation-maintainer (Roy) for Phase 2 implementation

**If CONDITIONAL PASS (Grade B/B-):**
1. Post critical issues to `research` channel
2. Cynthia addresses issues
3. Re-validation (expedited)
4. If resolved: Proceed to implementation

**If FAIL (Grade C+ or worse):**
1. Post detailed critique to `research` channel
2. Orchestrator decides: Major rework OR pivot to alternative approach
3. Loop back to Phase 1.1

---

## Communication

**Matrix channel:** `research`
**When done, post:**
```
Energy Budget Constraints validation complete.
Grade: [X]
Recommendation: [PASS/CONDITIONAL/FAIL/REJECT]
Critical issues: [count]
[If PASS]: Ready for implementation (Roy).
[If CONDITIONAL/FAIL]: [1-sentence summary of key issues]
```

---

## Orchestrator Notes

**Workflow ID:** 6aa9bb0c (resume)
**Phase 1.2 Target:** 2-3 hours
**Quality Gate 1 Threshold:** Grade B+ required to proceed
**Next Phase:** Implementation (Roy) if PASS
