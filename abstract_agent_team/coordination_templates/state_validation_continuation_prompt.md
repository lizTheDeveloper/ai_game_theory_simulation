# State Validation Framework - Critical Path Continuation

**Date:** November 6, 2025
**Agent:** simulation-maintainer (Roy)
**Context:** WEEK 3 Priority #1: State Validation Framework (ARCH-CRITICAL-3)
**Status:** Day 1-2 in progress - 5 phases validated, continuing with critical paths

## Situation

Work is already underway on state validation. Today (Nov 6), 5 phases have been validated:
1. ✅ ExogenousShockPhase (62 mutations, 8 shock types)
2. ✅ EmergencyResponsePhase (27 mutations, 7 response types)
3. ✅ CriticalJuncturePhase (11 mutations, 4 escape types)
4. ✅ StochasticInnovationPhase (11 mutations, 5 breakthrough types)
5. ✅ EvolutionarySelectionPhase (mutation count TBD)

**Current State:**
- 117 total phase files
- 18 phases with assertions (15.4%)
- 99 phases without assertions (84.6%)
- 601 total state mutations
- ~180 unvalidated mutations remaining

## Your Mission

Continue the state validation work by focusing on the **top 20 critical phases** as specified in the roadmap:

### Priority 1: Mortality Paths (CRITICAL - Must be 100%)
These phases directly affect human population and death calculations:

1. **BayesianMortalityResolutionPhase.ts** - Authoritative mortality resolution
   - Check for assertions around population modifications
   - Validate mortality rate calculations
   - Ensure regional-global consistency

2. **MortalityStabilizersPhase.ts** - Mortality reduction mechanisms
   - Validate stabilizer multipliers (international aid, adaptation, migration, emergency response)
   - Check survival fundamental calculations
   - Ensure all mortality reductions have bounds checking

3. **ClimateImpactCascadePhase.ts** - Climate-driven mortality
   - Validate temperature-mortality relationships
   - Check crop failure → famine calculations
   - Ensure cascade multipliers are bounded

4. **HumanPopulationPhase.ts** - Population updates
   - Validate population change assertions
   - Check birth/death rate calculations
   - Ensure carrying capacity constraints

### Priority 2: Climate Systems (CRITICAL - Must be 100%)

5. **TippingPointPhase.ts** - Climate regime shifts
   - Validate tipping point thresholds
   - Check irreversibility flags
   - Ensure bifurcation amplification integration

6. **WetBulbTemperaturePhase.ts** - Thermal habitability
   - Validate wet-bulb temperature calculations
   - Check habitability threshold assertions
   - Ensure regional impacts are bounded

7. **ClimateJusticePhase.ts** - Distributional impacts
   - Validate burden distribution calculations
   - Check inequality amplification factors
   - Ensure justice metrics are probabilities [0,1]

8. **PositiveTippingPointsPhase.ts** - Beneficial regime shifts
   - Validate positive feedback thresholds
   - Check acceleration factors
   - Ensure realistic bounds on improvements

### Priority 3: AI Capabilities (HIGH - Must be 100%)

9. **AICapabilityEvolutionPhase.ts** - AI capability advancement
   - Validate capability dimension updates (17 dimensions)
   - Check research acceleration factors
   - Ensure capabilities don't exceed physical limits

10. **AIAgentActionsPhase.ts** - AI agent decision-making
    - Validate action outcome calculations
    - Check resource allocation assertions
    - Ensure alignment drift tracking

11. **AILifecyclePhase.ts** - AI agent creation/destruction
    - Validate agent count changes
    - Check lifecycle state transitions
    - Ensure deterministic agent ID generation

12. **AISufferingPhase.ts** - AI welfare calculations
    - Validate suffering intensity calculations
    - Check welfare state updates
    - Ensure bounded suffering metrics

### Priority 4: Planetary Boundaries (CRITICAL - Must be 100%)

13. **PlanetaryBoundariesPhase.ts** (or related system)
    - Validate all 9 boundary calculations
    - Check threshold crossing detection
    - **CRITICAL:** Eliminate any remaining `?? fallback` patterns (Oct 2025 NaN bug!)
    - Ensure integration with climate/ecology systems

14. **BiosphereIntegrityPhase.ts** (or related)
    - Validate BII calculations
    - Check species extinction tracking
    - Ensure E/MSY metrics are bounded

## Implementation Guidelines

For each phase, follow this pattern:

1. **Audit Current State:**
   ```bash
   # Count mutations in phase
   grep "state\." PhaseFile.ts | grep "=" | wc -l

   # Check existing assertions
   grep "assert" PhaseFile.ts
   ```

2. **Add Assertions:**
   ```typescript
   import {
     assertFinite,
     assertProbability,
     assertInRange,
     assertStateProperty,
     assertPopulationChange,
     assertShockMagnitude,
     assertResourceAllocation
   } from '@/simulation/utils/assertions';

   // Before every state mutation:
   const validatedValue = assertFinite(calculatedValue, {
     location: 'PhaseClassName.methodName',
     valueName: 'state.system.metric',
     month: state.currentMonth,
     additionalInfo: { inputs: { x, y, z } }
   });

   state.system.metric = validatedValue;
   ```

3. **Replace Defensive Fallbacks:**
   ```typescript
   // ❌ BAD - Silent fallback
   const value = state.metric ?? 0.5;

   // ✅ GOOD - Fail loudly with context
   const value = assertStateProperty(state, 'metric', {
     location: 'ClassName.methodName',
     month: state.currentMonth
   });
   ```

4. **Domain-Specific Validators:**
   - Population changes: `assertPopulationChange(newPop, oldPop, context)`
   - Shock magnitudes: `assertShockMagnitude(delta, context)`
   - Resource allocations: `assertResourceAllocation(fraction, context)`
   - Probabilities: `assertProbability(value, context)`

## Success Criteria

For this continuation task:

1. **Coverage Target:** Validate 10-14 additional critical phases (Priority 1-4 above)
2. **Mutation Coverage:** 100% assertions in validated phases
3. **Pattern Consistency:** Follow existing validation patterns from the 5 completed phases
4. **Documentation:** Update wiki after each phase completion (historian will help)
5. **Testing:** No regressions - existing tests must pass

## What NOT to Do

1. ❌ Don't skip any state mutations (100% coverage required)
2. ❌ Don't use defensive fallbacks (`?? default`) - use assertions
3. ❌ Don't validate phases outside the critical path list (stay focused)
4. ❌ Don't commit without running type checks: `npx tsc --noEmit`
5. ❌ Don't batch commits - commit after each phase validation

## Coordination

**Orchestrator Status:** Will monitor progress via git commits and wiki updates
**Next Gate:** Architecture review when critical paths reach 100% coverage
**Estimated Effort:** 4-6 hours for 10-14 phases (30-40 min per phase average)

## Start Point

Begin with **Priority 1: Mortality Paths** since these are most critical:
1. BayesianMortalityResolutionPhase.ts
2. MortalityStabilizersPhase.ts
3. ClimateImpactCascadePhase.ts
4. HumanPopulationPhase.ts

Then proceed to Priority 2 (Climate), Priority 3 (AI), Priority 4 (Planetary Boundaries).

---

**You have deep context on:**
- Assertion utilities in `src/simulation/utils/assertions.ts`
- Fail-loudly philosophy (no silent fallbacks)
- Oct 2025 ecology NaN bug (caused by `?? 0.005` fallback)
- Defensive coding requirements for research simulations
- Pictographic event language (emoji conventions)

**Your expertise:** You know how to find bugs before they manifest, not after. Every assertion is a bug you prevent.

Go forth and validate! 🛡️
