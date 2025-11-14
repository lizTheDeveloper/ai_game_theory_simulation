# Task: Implement Climate Phased Deployment Model

**Date:** 2025-11-14
**Priority:** TIER 1 CRITICAL
**Agent:** simulation-maintainer (Roy)
**Context:** Climate effectiveness investigation - god mode shows only 5.5% effectiveness

## Research Foundation (Quality Gate 1: PASSED)

**Research Document:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/climate_deployment_timescales_20251113.md`
**Validation:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/climate_deployment_timescales_critique_20251113.md` (CONDITIONAL PASS)
**Implementation Plan:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/climate_phased_deployment_model_20251113.md`

## Problem Statement

God mode testing (all 73 technologies deployed) shows Climate Change boundary achieves only **5.5% effectiveness** despite full deployment of:
- Direct Air Capture (DAC)
- Fusion energy
- All renewable energy tech
- All climate mitigation technologies

**Root cause:** Model assumes instant deployment. Reality: 30-50 year deployment timescales, energy constraints, temperature feedbacks.

## Implementation Tasks

### Task 1: Extend Type Definitions

**File:** `src/types/technology.ts`

Add deployment phase tracking to TechnologyNode interface:

```typescript
export interface TechnologyNode {
  // Existing fields...

  // Deployment phase tracking (NEW)
  deploymentPhase?: 'none' | 'planning' | 'construction' | 'scaleUp' | 'maturity';
  phaseStartMonth?: number;
  phaseProgress?: number;  // 0-1 progress through current phase
  baseEffectiveness?: number;  // Intrinsic effectiveness before phase scaling
  effectivenessMultiplier?: number;  // Phase-based multiplier (0-1)

  // Energy requirements (NEW)
  energyRequiredTWh?: number;  // Annual at full deployment
  energyAllocatedTWh?: number;  // Actual allocation this step

  // Temperature sensitivity (NEW - optional, only for sink tech)
  temperatureSensitivity?: {
    type: 'ocean' | 'land';
    degradationRate: number;  // 0.044 ocean, 0.198 land
  };

  // Deployment parameters (NEW)
  phaseDurations?: {
    planning: number;       // Months
    construction: number;   // Months
    scaleUp: number;        // Months
    maturity: number;       // Months
  };
}
```

**File:** `src/types/game.ts`

Add energy partitioning fields (check if energySystem interface exists, add these fields):

```typescript
// Add to energySystem interface or create if doesn't exist
interface EnergySystem {
  // ... existing fields

  // Renewable surplus tracking
  renewableSurplus: number;
  renewableGeneration: number;
  baselineDemand: number;

  // Partitioning (allocated from surplus)
  partitioning: {
    adaptationTWh: number;
    industryElectrificationTWh: number;
    climateMinatigationTWh: number;
    syntheticFuelsTWh: number;
  };

  adaptationBaselineTWh: number;
  adaptationMultiplier: number;  // Scales with temperature
}
```

### Task 2: Create Climate Phased Deployment Phase

**File:** `src/simulation/engine/phases/ClimateDeploymentPhase.ts` (NEW)

Create a new phase that implements:

1. **Calculate renewable surplus:**
   - surplus = renewableGeneration - baselineDemand

2. **Update adaptation demand (temperature feedback):**
   - adaptationMultiplier = 1 + 0.10 × temperatureDeltaC
   - adaptationTWh = adaptationBaselineTWh × adaptationMultiplier

3. **Partition renewable energy (priority-based):**
   - Adaptation (highest priority)
   - Industry electrification
   - Climate mitigation (DAC, CCUS)
   - Synthetic fuels (lowest)

4. **Allocate mitigation energy to technologies:**
   - Calculate each tech's energy requirement
   - Allocate from climateMinatigationTWh pool

5. **Update carbon sink effectiveness (temperature feedback):**
   - Ocean: effectiveness = exp(-0.044 × temperatureDeltaC)
   - Land: effectiveness = exp(-0.198 × temperatureDeltaC)

6. **Update technology deployment phases:**
   - Progress through: none → planning → construction → scaleUp → maturity
   - Track phaseProgress (0-1)
   - Update effectivenessMultiplier based on phase

7. **Apply accelerator effects:**
   - Automated construction: 3× speedup for construction phase
   - AI R&D: 1.5× speedup for planning phase

**Research-backed parameters from plan:**

Deployment timescales:
- Gigatonne-scale DAC: planning 24mo, construction 36mo, scaleUp 120mo, maturity 120mo
- Advanced nuclear: planning 60mo, construction 84mo, scaleUp 120mo, maturity 60mo
- Perovskite solar: planning 12mo, construction 24mo, scaleUp 48mo, maturity 60mo
- Enhanced weathering: planning 18mo, construction 24mo, scaleUp 60mo, maturity 120mo

Energy requirements:
- Gigatonne DAC: 10,000 TWh/year at full deployment
- BECCS: 2,000 TWh/year
- Ocean alkalinization: 500 TWh/year

Temperature degradation:
- Ocean sink: -4.4% per °C (degradationRate: 0.044)
- Land sink: -19.8% per °C (degradationRate: 0.198)

### Task 3: Update Technology Definitions

**File:** `src/simulation/techTree/technologies.ts` (or wherever tech tree is defined)

Add deployment parameters to climate technologies. Example for DAC:

```typescript
{
  id: 'gigatonne-dac',
  name: 'Gigatonne-Scale Direct Air Capture',
  // ... existing fields

  // NEW deployment fields
  deploymentPhase: 'none',
  phaseStartMonth: 0,
  phaseProgress: 0,
  baseEffectiveness: 0.80,  // 80% at full deployment
  effectivenessMultiplier: 0,  // Starts at 0

  energyRequiredTWh: 10000,
  energyAllocatedTWh: 0,

  temperatureSensitivity: {
    type: 'land',  // DAC uses land-based processes
    degradationRate: 0.198
  },

  phaseDurations: {
    planning: 24,
    construction: 36,
    scaleUp: 120,
    maturity: 120
  }
}
```

Apply to all climate technologies listed in the plan (Section 4).

### Task 4: Update Initialization

**File:** `src/simulation/utils/initialization.ts`

Initialize new energy system fields:

```typescript
// In energy system initialization
renewableSurplus: 0,
renewableGeneration: 25000,  // TWh/year global 2024
baselineDemand: 28000,       // TWh/year global demand

partitioning: {
  adaptationTWh: 0,
  industryElectrificationTWh: 0,
  climateMinatigationTWh: 0,
  syntheticFuelsTWh: 0
},

adaptationBaselineTWh: 100,
adaptationMultiplier: 1.0
```

### Task 5: Integrate Phase into PhaseOrchestrator

**File:** `src/simulation/engine/PhaseOrchestrator.ts`

Add ClimateDeploymentPhase after energy phases, before end-of-step logging.

## Implementation Guidelines

### CRITICAL Requirements

1. **No silent fallbacks:** Use assertion utilities for all calculations
2. **Deterministic RNG:** All random operations must use provided `rng` function
3. **Fail loudly:** Invalid states should throw with clear error messages
4. **Defensive coding:** Guard against NaN, undefined, division by zero
5. **Emoji conventions:** Use 🌍 for climate, ⚡ for energy, ⏱️ for deployment progress

### Testing Requirements

After implementation:
1. Run type checker: `npx tsc --noEmit`
2. Run unit tests: `npm test`
3. Create simple test script to verify:
   - Deployment phases progress correctly
   - Energy partitioning works
   - Temperature feedbacks apply
   - Effectiveness improves over time

### Success Criteria

- ✅ All type definitions compile without errors
- ✅ ClimateDeploymentPhase created with all 7 steps
- ✅ Climate technologies have deployment parameters
- ✅ Initialization sets up energy system correctly
- ✅ Phase integrated into orchestrator
- ✅ Simple test shows deployment progression
- ✅ No NaN, no silent fallbacks, no defensive `?? defaults`

## After Implementation

Post update to coordination channel (or create log file):
- Implementation complete
- Files modified
- Ready for Monte Carlo validation (Priya)

Then this orchestrator will:
1. Spawn Priya for Monte Carlo validation (N=10-30)
2. Check effectiveness improvement (5.5% → target 30-50%)
3. Continue to architecture review if validation passes

## Questions or Blockers?

If you encounter issues:
- Research foundation incomplete → escalate to orchestrator
- Type conflicts → check game.ts for existing patterns
- Phase integration unclear → check PhaseOrchestrator.ts structure
- Parameter uncertainty → cite specific line from research doc

Proceed with implementation. Good luck, Roy!
