# HANDOFF: M-3 Parameter Injection System Implementation
**From:** Orchestrator
**To:** Roy (simulation-maintainer)
**Date:** 2025-11-30
**Priority:** MEDIUM (Last item before LOW tier)
**Estimated Effort:** 4-6 hours

## Context
Implementing parameter injection system for N=200 Latin Hypercube Sampling parameter sweep (M-3 roadmap item). This is the final blocker for quantifying model uncertainty and generating 90% confidence intervals for all simulation outputs.

## Research & Architecture Status
- ✅ **Methodology validated:** research/parameter_sweep_methodology_20251130.md (LHS/Sobol peer-reviewed)
- ✅ **Architecture approved:** reviews/parameter_sweep_architecture_review_20251130.md (Option A recommended, but see revision below)
- ✅ **Bifurcation threshold validated:** research/technology_bifurcation_threshold_validation_20251130.md (empirical 5-25%, simulation 58%)
- ✅ **Pilot framework exists:** scripts/parameterSweepPilot.ts (LHS sampler complete, parameter override TODO at line 124)

## Task: Implement ParameterSweepConfig Interface

### Grep Analysis (Already Complete)
```
climateSensitivity: src/simulation/environmental.ts (10 files found)
bifurcation threshold (0.58): src/simulation/engine/phases/BifurcationLogicPhase.ts
regimeMultipliers: src/simulation/techTree/effectsEngine.ts (0.7), src/simulation/engine/phases/SocialStabilitySystemPhase.ts (1.5)
coordination stress: src/simulation/initialization.ts + 11 other files
```

### Implementation

**File:** `src/simulation/initialization.ts`

#### 1. Create Interface
```typescript
/**
 * Parameter Sweep Configuration (M-3)
 * Allows overriding key uncertain parameters for Latin Hypercube Sampling
 *
 * Research Context:
 * - Methodology: research/parameter_sweep_methodology_20251130.md
 * - Ranges derived from peer-reviewed uncertainty bounds (IPCC AR6, meta-analyses)
 * - Used for Sobol sensitivity analysis to identify high-impact parameters
 */
export interface ParameterSweepConfig {
  /** Climate sensitivity: K/(W/m²), baseline 0.8, range [0.5, 1.1] (IPCC AR6: ±0.3) */
  climateSensitivity?: number;

  /** Carbon sink saturation multiplier, baseline 1.0, range [0.5, 1.5] (±50%) */
  carbonSinkMultiplier?: number;

  /** AI coordination stress multiplier, baseline TBD, range ±60-80% */
  aiCoordinationStress?: number;

  /** Technology adoption steepness multiplier, baseline 1.0, range [0.6, 1.4] (±40%) */
  techAdoptionSteepness?: number;

  /** Bifurcation threshold (tech deployment %), baseline 0.58, range [0.48, 0.68] (±0.10)
   * Research: technology_bifurcation_threshold_validation_20251130.md
   * Empirical tipping point 5-25%, simulation uses 58% (conservative)
   */
  bifurcationThreshold?: number;

  /** Collapse regime tech effectiveness multiplier, baseline 0.7, range [0.5, 0.9] (±0.2) */
  collapseRegimeMultiplier?: number;

  /** Social breakdown regime decay multiplier, baseline 1.5, range [1.2, 1.8] (±0.3) */
  breakdownRegimeMultiplier?: number;
}
```

#### 2. Add Parameter to createDefaultInitialState
```typescript
export function createDefaultInitialState(
  rng: () => number,
  scenarioMode: ScenarioMode = 'historical',
  alignmentDynamicsConfig?: any,
  climatePriorityConfig?: any,
  thresholdSliders?: import('../components/thresholds/ThresholdConfigModal').ThresholdSliders,
  speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia',
  historicalOverrides?: HistoricalOverrides,
  parameterSweepConfig?: ParameterSweepConfig  // NEW - M-3 parameter injection
): GameState {
  // ... existing initialization logic ...

  // M-3 PARAMETER SWEEP OVERRIDES (Applied AFTER default initialization)
  if (parameterSweepConfig) {
    // Climate sensitivity
    if (parameterSweepConfig.climateSensitivity !== undefined) {
      state.environmentalSystem.climateSensitivity = parameterSweepConfig.climateSensitivity;
    }

    // Carbon sink saturation
    if (parameterSweepConfig.carbonSinkMultiplier !== undefined) {
      state.planetaryBoundaries.climateChange.carbonSinkMultiplier = parameterSweepConfig.carbonSinkMultiplier;
    }

    // AI coordination stress - FIND THE FIELD NAME
    if (parameterSweepConfig.aiCoordinationStress !== undefined) {
      // TODO: Locate actual field in GameState
      // grep -r "coordination.*stress\|aiCoordination" src/types/game.ts
      // state.???. aiCoordinationStress = parameterSweepConfig.aiCoordinationStress;
    }

    // Tech adoption steepness
    if (parameterSweepConfig.techAdoptionSteepness !== undefined) {
      state.technologySystem.adoptionSteepnessMultiplier = parameterSweepConfig.techAdoptionSteepness;
    }

    // Bifurcation threshold - NEEDS INTEGRATION WITH BifurcationLogicPhase
    if (parameterSweepConfig.bifurcationThreshold !== undefined) {
      // Option 1: Add to GameState (preferred)
      // state.bifurcationState.thresholdOverride = parameterSweepConfig.bifurcationThreshold;
      //
      // Option 2: Store in config, read in BifurcationLogicPhase
      // state.simulationConfig.bifurcationThreshold = parameterSweepConfig.bifurcationThreshold;
    }

    // Regime multipliers - NEEDS INTEGRATION WITH effectsEngine.ts and SocialStabilitySystemPhase.ts
    if (parameterSweepConfig.collapseRegimeMultiplier !== undefined) {
      // Currently hardcoded as 0.7 in effectsEngine.ts line 375
      // Need to make this configurable
      // state.simulationConfig.collapseRegimeMultiplier = parameterSweepConfig.collapseRegimeMultiplier;
    }

    if (parameterSweepConfig.breakdownRegimeMultiplier !== undefined) {
      // Currently hardcoded as 1.5 in SocialStabilitySystemPhase.ts line 117
      // state.simulationConfig.breakdownRegimeMultiplier = parameterSweepConfig.breakdownRegimeMultiplier;
    }
  }

  return state;
}
```

### TODOs for Implementation
1. **Find field names:** Grep src/types/game.ts to locate:
   - AI coordination stress field (12 matches in grep, need actual GameState path)
   - Verify climateSensitivity, carbonSinkMultiplier locations

2. **Make hardcoded values configurable:**
   - BifurcationLogicPhase.ts: Replace `0.58` with `state.simulationConfig?.bifurcationThreshold ?? 0.58`
   - effectsEngine.ts line 375: Replace `0.7` with `state.simulationConfig?.collapseRegimeMultiplier ?? 0.7`
   - SocialStabilitySystemPhase.ts line 117: Replace `1.5` with `state.simulationConfig?.breakdownRegimeMultiplier ?? 1.5`

3. **Add simulationConfig to GameState** (if doesn't exist):
   ```typescript
   // In src/types/game.ts
   export interface GameState {
     // ... existing fields ...
     simulationConfig?: {
       bifurcationThreshold?: number;
       collapseRegimeMultiplier?: number;
       breakdownRegimeMultiplier?: number;
     };
   }
   ```

4. **Update parameterSweepPilot.ts:**
   ```typescript
   async function runHindcast(
     parameters: Record<string, number>,
     runId: number,
     rng: () => number
   ): Promise<RunResult> {
     // Create initial state with parameter overrides
     const state = createDefaultInitialState(
       rng,
       'historical',
       undefined, // alignmentDynamicsConfig
       undefined, // climatePriorityConfig
       undefined, // thresholdSliders
       undefined, // speculativeScenario
       { startYear: 1990 }, // historicalOverrides
       {  // parameterSweepConfig (NEW)
         climateSensitivity: parameters.climateSensitivity,
         carbonSinkMultiplier: parameters.carbonSinkSaturation,
         techAdoptionSteepness: parameters.techAdoptionSteepness,
         bifurcationThreshold: parameters.bifurcationThreshold,
         collapseRegimeMultiplier: parameters.regimeMultiplier1,
         breakdownRegimeMultiplier: parameters.regimeMultiplier2
       }
     );

     const engine = new SimulationEngine();
     const targetMonth = (2024 - 1990) * 12;

     while (state.currentMonth < targetMonth) {
       engine.step(state, rng);
     }

     return {
       runId,
       parameters,
       temperature2024: state.environmentalSystem.temperature,
       population2024: state.humanPopulationSystem.population,
       biodiversity2024: state.planetaryBoundaries.biosphereIntegrity.overshootPercentage
     };
   }
   ```

5. **Update PARAMETERS config in pilot script:**
   ```typescript
   const PARAMETERS: ParameterConfig[] = [
     {
       name: 'climateSensitivity',
       baseline: 0.8,
       min: 0.5,
       max: 1.1,
       location: 'environmentalSystem.climateSensitivity'
     },
     {
       name: 'carbonSinkSaturation',
       baseline: 1.0,
       min: 0.5,
       max: 1.5,
       location: 'planetaryBoundaries.climateChange.carbonSinkMultiplier'
     },
     {
       name: 'techAdoptionSteepness',
       baseline: 1.0,
       min: 0.6,
       max: 1.4,
       location: 'technologySystem.adoptionSteepnessMultiplier'
     },
     {
       name: 'bifurcationThreshold',  // NEW
       baseline: 0.58,
       min: 0.48,
       max: 0.68,
       location: 'bifurcationState.thresholdOverride'
     },
     {
       name: 'regimeMultiplier1',  // NEW
       baseline: 0.7,
       min: 0.5,
       max: 0.9,
       location: 'simulationConfig.collapseRegimeMultiplier'
     },
     {
       name: 'regimeMultiplier2',  // NEW
       baseline: 1.5,
       min: 1.2,
       max: 1.8,
       location: 'simulationConfig.breakdownRegimeMultiplier'
     }
     // TODO: Add aiCoordinationStress once field located
   ];
   ```

### Validation Checklist
- [ ] Type checking passes: `npx tsc --noEmit`
- [ ] Quick pilot test (N=3): `npx tsx scripts/parameterSweepPilot.ts`
- [ ] Verify parameters actually vary between runs (check output JSON)
- [ ] Verify backward compatibility (existing code without overrides still works)
- [ ] All 7 parameters successfully applied

### Success Criteria
- ✅ ParameterSweepConfig interface created
- ✅ createDefaultInitialState accepts and applies overrides
- ✅ All 7 parameters integrated
- ✅ parameterSweepPilot.ts uses new interface (line 124 comment removed)
- ✅ Type checking passes
- ✅ N=3 validation run succeeds

### Architecture Constraints (Roy's Expertise)
- **NO silent fallbacks** - Use `??` with baseline values, document clearly
- **Fail loudly** - If field doesn't exist, let TypeScript catch it
- **Type safe** - Strict TypeScript, no `any` except existing params
- **Deterministic** - RNG seed still controls stochastic elements
- **Backward compatible** - All parameters optional, defaults unchanged

### Token Conservation Strategy
1. Grep field names first (don't read entire files)
2. Make minimal changes (add interface + apply logic)
3. Quick validation (N=3 test, not full N=200)
4. Exit after type check passes + pilot runs
5. Leave full N=200 execution to feature-implementer

## Handoff to Next Phase
After Roy completes:
1. **feature-implementer:** Execute N=200 sweep (13 minutes runtime)
2. **priya:** Calculate Sobol sensitivity indices (2 hours)
3. **architecture-skeptic:** Review implementation (MANDATORY quality gate 2)
4. **wiki-documentation-updater:** Document parameter sweep methodology
5. **architect:** Archive M-3 to /plans/completed/

## References
- **Roadmap:** plans/MASTER_IMPLEMENTATION_ROADMAP.md lines 419-445 (M-3 definition)
- **Methodology:** research/parameter_sweep_methodology_20251130.md
- **Architecture:** reviews/parameter_sweep_architecture_review_20251130.md
- **Pilot script:** scripts/parameterSweepPilot.ts
- **Bifurcation research:** research/technology_bifurcation_threshold_validation_20251130.md

## Estimated Timeline
- Implementation: 4-6 hours (field location + integration + validation)
- Execution: 13 minutes (N=200 sweep)
- Analysis: 2 hours (Sobol indices)
- **Total:** ~7-9 hours for complete M-3 delivery

---

**Orchestrator Note:** This is the last MEDIUM priority item before LOW tier work. Token conservation mode active - implement efficiently, validate minimally, hand off to next specialist.
