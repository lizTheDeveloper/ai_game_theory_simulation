# Phase 3: Research Scenarios - Execution Plan

**Created:** 2025-12-06
**Priority:** CRITICAL
**Deadline:** 2025-12-07 EOD
**Parent Plan:** plans/GAME_IMPLEMENTATION_ORCHESTRATION_SPEC.md
**Prerequisites:** Phase 2 complete

---

## Overview

Implement validated research scenarios as alternative starting conditions (baseline, optimistic, pessimistic).

**Current State:**
- ✅ Scenario types defined (src/game/types/index.ts)
- ✅ ScenarioManager skeleton exists (src/game/core/ScenarioManager.ts)
- ❌ Scenarios not parameterized with research data
- ❌ No Monte Carlo validation

---

## Task Breakdown

### Task 3.1: Extract Scenario Parameters
**Agent:** super-alignment-researcher (Cynthia)
**Duration:** 2-3 hours
**Output:** research/game_scenarios_20251206.md

**Research Requirements:**
1. **Baseline Scenario:** Median expert forecasts
   - Climate: RCP 4.5 (moderate emissions)
   - AI: Current trajectory (steady progress, no sudden leaps)
   - Governance: Existing international frameworks
   - Social: Current cohesion levels
   - Parameters from: IPCC AR6, AI Index 2024, social science forecasts

2. **Optimistic Scenario:** Upper bounds from uncertainty ranges
   - Climate: Paris targets met (1.5-2°C)
   - AI: High alignment progress, responsible development
   - Governance: Strong international cooperation
   - Social: Increasing cohesion, declining conflict
   - Parameters from: Best-case IPCC scenarios, optimistic AI forecasts

3. **Pessimistic Scenario:** Lower bounds from uncertainty ranges
   - Climate: RCP 8.5 (high emissions, tipping points)
   - AI: Fast takeoff, alignment difficulties
   - Governance: Fragmentation, competition
   - Social: Declining cohesion, rising conflict
   - Parameters from: Worst-case IPCC scenarios, rapid AI scenarios

**Parameter Extraction:**
For each scenario, extract initial state values:
- Climate system state (temperature, CO2, tipping elements)
- AI capabilities (17 dimensions)
- Governance effectiveness
- Social cohesion
- Research investment levels
- Technology unlock timelines

### Task 3.2: Validate Scenario Parameters (Quality Gate)
**Agent:** research-skeptic (Sylvia)
**Duration:** 1-2 hours
**Input:** research/game_scenarios_20251206.md
**Output:** reviews/game_scenarios_critique_20251206.md

**Validation Criteria:**
- Are scenarios empirically grounded?
- Do optimistic/pessimistic bounds reflect real uncertainty ranges?
- Are parameters internally consistent?
- Are there contradictory findings?

### Task 3.3: Implement Research Scenarios
**Agent:** simulation-maintainer (Roy)
**Duration:** 2-3 hours
**Input:** Sylvia-approved parameters
**Output:** Updated src/game/scenarios/*.ts

**Implementation:**
```typescript
// src/game/scenarios/baseline.ts
export const BASELINE_SCENARIO: ScenarioParameters = {
  id: 'baseline',
  name: 'Baseline: Current Trajectory',
  description: 'Median expert forecasts (RCP 4.5, steady AI progress)',
  initialState: {
    climate: {
      globalTemp: 1.2, // °C above pre-industrial (IPCC AR6)
      co2Concentration: 420, // ppm (2024 baseline)
      // ... more parameters
    },
    aiCapabilities: {
      physical: 0.15, // Current robotics level
      // ... 16 more dimensions
    },
    // ... governance, social, etc.
  },
  researchSources: [
    'IPCC AR6 WG1 (2021). Chapter 4.',
    'AI Index 2024. Stanford HAI.',
  ],
};
```

### Task 3.4: Monte Carlo Validation
**Agent:** priya
**Duration:** 3-4 hours
**Input:** Implemented scenarios
**Output:** reviews/game_scenario_validation_20251206.md

**Validation Protocol:**
1. Run N=100 simulations per scenario (300 total)
2. Collect outcome distributions
3. Verify baseline within ±15% of research expectations
4. Verify optimistic skews toward better outcomes
5. Verify pessimistic skews toward worse outcomes
6. Check player agency bounds (<20% shift per action)

**Metrics:**
- Outcome classification distribution (utopia → extinction)
- QoL trajectories
- Environmental health
- AI alignment status
- Coefficient of variation (determinism check)

---

## Success Criteria

1. ✅ 3 scenarios with research-backed parameters
2. ✅ Sylvia approves parameter sources
3. ✅ Monte Carlo validation passes (outcomes within 15% of baseline)
4. ✅ Player agency bounded (<20% outcome shift)
5. ✅ Determinism verified (CV < 0.01%)

---

## Token Budget: ~25-35k tokens
