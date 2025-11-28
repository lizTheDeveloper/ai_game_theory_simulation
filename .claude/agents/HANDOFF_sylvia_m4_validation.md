# HANDOFF: M-4 Population Demographics Validation

**Date:** 2025-11-28
**From:** Orchestrator
**To:** Sylvia (research-skeptic)
**Task:** Validate demographic research for M-4 implementation
**Priority:** MEDIUM (Quality Gate 1 - blocks implementation)

## Objective

Validate Cynthia's demographic research before Roy implements parameters.

**This is Quality Gate 1:** Implementation CANNOT proceed until this validation passes.

## Input

**Research Document:** `research/population_demographics_regional_20251128.md` (created by Cynthia)

## Validation Checklist

### 1. Source Quality

- ✅ 2+ peer-reviewed sources per claim?
- ✅ UN World Population Prospects 2024 revision used as primary?
- ✅ WHO Global Health Observatory for mortality data?
- ⚠️ Are sources recent (2020-2025 preferred)?
- ⚠️ Any contradictory data from equally reputable sources?

### 2. Regional Mapping Accuracy

The simulation uses **7 specific regions**. Validate mapping:

| Simulation Region | UN WPP Region(s) | Notes |
|-------------------|------------------|-------|
| East Asia | Eastern Asia | China, Japan, Koreas |
| South Asia | Southern Asia | India, Pakistan, Bangladesh |
| Sub-Saharan Africa | Sub-Saharan Africa | Direct match |
| Europe | Europe (all) | Including Russia |
| Latin America | Latin America & Caribbean | Direct match |
| North America | Northern America | US, Canada |
| Middle East & North Africa | Western Asia + Northern Africa | MENA composite |

**Key Questions:**
- Are UN regions properly aggregated to match simulation regions?
- Any population double-counting or gaps?
- Migration between regions accounted for?

### 3. Parameter Justification

For each recommended parameter change:
- ✅ Numerical target provided?
- ✅ Rationale grounded in data (not speculation)?
- ✅ Historical trend justified (1990→2024 evolution)?
- ⚠️ Time-varying decision justified with cost/benefit?

### 4. Demographic Transition Classification

- ✅ Completed transition (Europe, East Asia): TFR < 2.1, aging?
- ✅ Mid-transition (Latin America, South Asia): TFR declining?
- ✅ Pre-transition (Sub-Saharan Africa): TFR still high?
- ⚠️ Classification supported by multiple indicators (TFR, life expectancy, median age)?

### 5. Implementation Feasibility

**Critical:** Can Roy implement these recommendations?

- ✅ Concrete numerical targets (not ranges or "approximately")?
- ✅ Clear time-varying vs static decision?
- ✅ Edge cases addressed (aging Europe, young Africa)?
- ⚠️ Migration flows: significant enough to model or negligible?

### 6. Expected Improvement

- ✅ Reduction from 24.5% → <10% justified?
- ✅ Monte Carlo validation plan reasonable?
- ⚠️ Are there structural issues beyond parameters? (e.g., missing feedback loops)

## Common Pitfalls to Check

### Over-Optimistic Assumptions
- Does research assume linear trends continue? (demographic transitions are non-linear)
- COVID-19 mortality spike: treated as temporary or permanent shift?
- Migration: assumed constant or responding to crises?

### Methodological Flaws
- Mixing data vintages (2019 vs 2024 UN revisions)?
- Conflating TFR (total fertility) with CBR (crude birth rate)?
- Ignoring age structure effects on death rates?

### Implementation Gaps
- Recommending time-varying rates without decay functions?
- Providing TFR but not converting to birth rates?
- Ignoring that simulation starts 1990, not 2024?

## Decision Framework

### ✅ PASS (Proceed to Implementation)
- Sources are high-quality and recent
- Regional mappings are accurate
- Parameters are concrete and implementable
- Expected improvement is justified
- No fatal methodological flaws

### ⚠️ CONDITIONAL PASS (Minor revisions needed)
- Sources adequate but could be stronger
- Some parameters need clarification
- Migration treatment needs refinement
- Expected improvement may be optimistic but not implausible

### ❌ FAIL (Loop back to research)
- Contradictory sources with no reconciliation
- Regional mappings are incorrect
- Parameters are vague or not implementable
- Fatal methodological flaws (confounding variables, data vintage mixing)
- Structural issues require architectural changes, not just parameters

## Output Format

Create: **`reviews/m4_demographics_research_critique_20251128.md`**

Structure:
1. **Executive Summary** (PASS/CONDITIONAL/FAIL decision)
2. **Source Quality Assessment** (strengths, weaknesses)
3. **Regional Mapping Validation** (accuracy, gaps)
4. **Parameter Critique** (feasibility, concerns)
5. **Methodological Review** (flaws, best practices violated)
6. **Implementation Recommendations** (revisions needed, proceed/loop back)

## Success Criteria

- ✅ Clear PASS/CONDITIONAL/FAIL decision
- ✅ Specific actionable feedback (not vague "needs improvement")
- ✅ If CONDITIONAL: Exactly what needs revision
- ✅ If FAIL: Specific research gaps to address
- ✅ Cross-references to contradictory sources (if found)

## Next Steps

### If PASS:
1. Post to research channel: Validation complete
2. Orchestrator spawns Roy for implementation
3. Begin Phase 2: Implementation & Testing

### If CONDITIONAL PASS:
1. Post to research channel: Revisions needed
2. Cynthia addresses specific gaps
3. Re-validate (fast-track, 15 min)
4. Proceed to implementation

### If FAIL:
1. Post to research channel: Fatal flaws identified
2. Orchestrator decides: Loop back to Cynthia OR pivot approach
3. Major research revision needed

---

**Validation is critical. Take your time. Research simulations demand rigor.**
