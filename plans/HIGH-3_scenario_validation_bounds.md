# HIGH-3: Scenario Override System Validation Boundaries

**Date Created:** November 14, 2025
**Priority:** HIGH
**Estimated Effort:** MEDIUM (3-4 days)
**Status:** 🔬 RESEARCH PHASE (Quality Gate 1)

---

## Problem Statement

The `ApplyScenarioPrioritiesPhase` allows scenario testing to override government budgets/resources without validation, creating invalid states that undermine research validity:

**Specific Issues:**
- **Line 84:** `totalBudget` set directly without resource/GDP constraints
- **Line 112:** `government.resources` accumulates monthly without upper bounds (can go infinite)
- **No validation:** Scenarios can set physically impossible values (e.g., $1T/month research on $100T GDP)

**Impact:**
- Scenario testing produces unrealistic results
- Monte Carlo analysis includes invalid parameter space
- Research conclusions may be based on impossible configurations

---

## Requirements

1. **Add validation layer** ensuring overrides respect system constraints
2. **Implement maximum bounds** based on GDP/population capacity
3. **Add warnings** when overrides create unrealistic (but not impossible) states
4. **Ensure research validity** of scenario testing results

---

## Research Questions

### 1. Government Budget Bounds
- What are realistic upper bounds for total government spending as % of GDP?
- Historical maximums during wartime, crises (WWII, COVID-19, etc.)
- Peer-reviewed sources on fiscal capacity limits

### 2. Research Investment Bounds
- Maximum feasible R&D spending as % of GDP
- Historical examples: Manhattan Project, Apollo Program, modern China
- Absorption capacity limits (can you meaningfully deploy $100B/month?)
- Peer-reviewed sources on R&D effectiveness vs. spending

### 3. Climate Spending Bounds
- Maximum climate/environmental spending as % of GDP
- Examples: Green New Deal proposals, EU climate budgets, war mobilization
- Physical constraints (workers/resources deployable monthly)

### 4. Redistribution Bounds
- Maximum sustainable redistribution as % of GDP
- Historical examples: Nordic welfare states, UBI pilot programs
- Economic sustainability limits (work incentives, inflation)

### 5. Resource Accumulation
- Should `government.resources` accumulate monthly or reset?
- Bounds for resource stockpiles (strategic reserves, emergency funds)
- Peer-reviewed sources on government fiscal buffers

---

## Workflow Phases

### Phase 1: Research & Validation (Quality Gate 1)
- **Agent:** super-alignment-researcher
- **Output:** `research/scenario_validation_bounds_YYYYMMDD.md`
- **Requirements:** 2+ peer-reviewed sources per question (2024-2025 preferred)
- **Status:** 🔄 IN PROGRESS

### Phase 2: Research Critique
- **Agent:** research-skeptic
- **Output:** `reviews/scenario_validation_bounds_critique_YYYYMMDD.md`
- **Gate:** MUST pass critique before implementation
- **Status:** ⏳ PENDING

### Phase 3: Implementation
- **Agent:** feature-implementer
- **Tasks:**
  - Add validation utilities to `src/simulation/utils/scenarioValidation.ts`
  - Update `ApplyScenarioPrioritiesPhase` with bounds checking
  - Add warning logs for unrealistic (but valid) values
  - Ensure all bounds have research citations
- **Status:** ⏳ PENDING

### Phase 4: Architecture Review (Quality Gate 2)
- **Agent:** architecture-skeptic
- **Output:** `reviews/scenario_validation_architecture_YYYYMMDD.md`
- **Gate:** MUST address CRITICAL/HIGH issues before merge
- **Status:** ⏳ PENDING

### Phase 5: Documentation
- **Agent:** wiki-documentation-updater
- **Tasks:**
  - Update scenario testing documentation
  - Document validation bounds and their sources
  - Add examples of valid vs. invalid scenario configurations
- **Status:** ⏳ PENDING

### Phase 6: Archival
- **Agent:** architect
- **Tasks:**
  - Move this plan to `plans/completed/`
  - Update MASTER_IMPLEMENTATION_ROADMAP.md
- **Status:** ⏳ PENDING

---

## Expected Validation Logic

```typescript
// Example structure (to be refined after research)
function validateScenarioBudget(
  budgetBillions: number,
  gdpTrillions: number,
  context: string
): void {
  const gdpBillions = gdpTrillions * 1000;
  const percentOfGDP = budgetBillions / gdpBillions;

  // Hard limits (physically impossible)
  const ABSOLUTE_MAX_PERCENT = 0.50; // 50% of GDP (wartime maximum)

  // Soft limits (unrealistic but not impossible)
  const WARNING_THRESHOLD = 0.30; // 30% of GDP (crisis mobilization)

  if (percentOfGDP > ABSOLUTE_MAX_PERCENT) {
    throw new Error(
      `❌ ${context}: Budget ${budgetBillions.toFixed(1)}B exceeds ` +
      `maximum ${(ABSOLUTE_MAX_PERCENT * 100).toFixed(0)}% of GDP ` +
      `(${(gdpBillions * ABSOLUTE_MAX_PERCENT).toFixed(1)}B)`
    );
  }

  if (percentOfGDP > WARNING_THRESHOLD) {
    console.log(
      `⚠️ ${context}: Budget ${budgetBillions.toFixed(1)}B is ` +
      `${(percentOfGDP * 100).toFixed(1)}% of GDP (crisis-level spending)`
    );
  }
}
```

---

## Success Criteria

- ✅ All scenario overrides have validated bounds
- ✅ Bounds are backed by 2+ peer-reviewed sources each
- ✅ Invalid configurations fail with clear error messages
- ✅ Unrealistic (but valid) configurations log warnings
- ✅ Scenario testing produces research-valid results
- ✅ Monte Carlo analysis excludes impossible parameter space

---

## Timeline

- **Day 1:** Research phase (super-alignment-researcher + research-skeptic)
- **Day 2:** Implementation (feature-implementer)
- **Day 3:** Architecture review + fixes (architecture-skeptic)
- **Day 4:** Documentation + archival (wiki-documentation-updater + architect)

**Total:** 3-4 days

---

## Notes

- This builds on existing assertion utilities (`src/simulation/utils/assertions.ts`)
- Follows "fail loudly" philosophy (no silent fallbacks)
- Ensures scenario testing remains a valid research tool
- May inform future god mode / scenario runner enhancements
