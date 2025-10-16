# Event Trigger System Design (P2.5 Empirical Validation)

**Created:** October 16, 2025
**Purpose:** Enable validation tests to trigger specific historical events (pandemics, economic crises)
**Status:** Design phase

## Overview

The validation framework requires the ability to trigger specific historical events (COVID-19, 2008 crisis, Black Death) to test if the simulation can reproduce known outcomes. This design creates a system for triggering and managing these events.

## Existing Crisis System Architecture

From exploration of the codebase:

1. **Environmental Crises** (`src/simulation/environmental.ts`):
   - Use accumulation state (resourceReserves, pollutionLevel, etc.)
   - Trigger when thresholds crossed (resourceReserves < 0.3)
   - Have immediate impacts + ongoing degradation
   - Use `addAcuteCrisisDeaths()` for population mortality
   - Support multi-phase progression (ecosystem collapse: declining → crisis → collapse)

2. **Crisis Choice Points** (`src/simulation/crisisPoints.ts`):
   - Strategic decision moments (recursive threshold, alignment collapse, unemployment)
   - Agent-driven responses (AI, government, society choose options)
   - Not relevant for historical validation (agents weren't involved in COVID-19)

3. **Crisis Detection** (`src/simulation/calculations.ts:detectCrisis()`):
   - Detects economic crises (displacement, transition, collapse)
   - Based on unemployment + economic stage
   - Too narrow for our needs

## Design Requirements

### 1. Pandemic Event Trigger

**Requirements from validation tests:**
- Configurable mortality rate (0.1-0.25% for COVID, 30-60% for Black Death)
- Configurable duration (6-72 months)
- Economic disruption effects
- Sector-specific organizational impact (tech more resilient)
- Recovery tracking

**Parameters:**
```typescript
interface PandemicEventParams {
  startMonth: number;          // When pandemic begins
  duration: number;            // Months until mortality returns to baseline
  baselineMortality: number;   // Additional monthly mortality rate (0-1)
  peakMortality: number;       // Peak mortality (for phased pandemics)
  affectedFraction: number;    // % of population exposed (0-1)
  economicImpact: number;      // Severity of economic disruption (0-1)
  techResilience: boolean;     // Whether tech sector is more resilient
  vaccineTimeline?: number;    // Months until vaccine available
}
```

**Mechanics:**
1. **Mortality Phase**: Spike death rate for duration
2. **Economic Phase**:
   - Increase unemployment temporarily
   - Trigger organizational stress (not 100% bankruptcy!)
   - Sector-dependent resilience (tech 95% survival, general 85%)
3. **Recovery Phase**: Gradual return to baseline over 6-18 months
4. **Tech Response**: If `vaccineTimeline` provided, accelerate recovery after that point

### 2. Economic Crisis Event Trigger

**Requirements from validation tests:**
- Organizational bankruptcy (10-30%, not 100%!)
- Sector-based resilience (tech 95%, finance 70%, general 85%)
- Unemployment spike (5% → 10%)
- Wealth inequality increase
- Government bailout responses
- Recovery timeline (24-48 months)

**Parameters:**
```typescript
interface EconomicCrisisParams {
  startMonth: number;          // When crisis begins
  duration: number;            // Months until recovery complete
  severity: number;            // Crisis severity (0-1)
  organizationalImpact: {
    tech: number;              // Tech sector bankruptcy rate (0.05 = 5%)
    finance: number;           // Finance sector bankruptcy rate
    general: number;           // General sector bankruptcy rate
  };
  unemploymentSpike: number;   // Peak unemployment increase
  wealthInequalityIncrease: number; // Gini increase
  governmentResponse: boolean; // Whether government intervenes with bailouts
}
```

**Mechanics:**
1. **Financial Shock**: Immediate capital loss for organizations (20-40%)
2. **Bankruptcy Wave**: Sector-dependent bankruptcy probability
   - CRITICAL FIX: Current simulation shows 100% bankruptcy → must implement sector resilience
3. **Unemployment Spike**: Rapid increase over 3-6 months
4. **Wealth Redistribution**: Top 1% recovers faster
5. **Government Response**: If enabled, bailouts reduce bankruptcy rate by 30-50%
6. **Recovery Phase**: Gradual return over duration

## Implementation Plan

### Phase 1: Core Event System (2h)

**File:** `/src/simulation/triggeredEvents.ts`

```typescript
/**
 * Triggered Events System (P2.5 Empirical Validation)
 *
 * Allows external triggering of specific events (pandemics, economic crises)
 * for validation testing against historical data.
 */

export interface TriggeredEvent {
  id: string;
  type: 'pandemic' | 'economic_crisis' | 'custom';
  startMonth: number;
  duration: number;
  active: boolean;
  phaseData: any; // Event-specific phase tracking
}

export interface PandemicEvent extends TriggeredEvent {
  type: 'pandemic';
  params: PandemicEventParams;
  phaseData: {
    currentPhase: 'outbreak' | 'peak' | 'decline' | 'recovery';
    monthsSinceStart: number;
    cumulativeDeaths: number;
    economicImpactApplied: boolean;
  };
}

export interface EconomicCrisisEvent extends TriggeredEvent {
  type: 'economic_crisis';
  params: EconomicCrisisParams;
  phaseData: {
    currentPhase: 'shock' | 'crisis' | 'stabilization' | 'recovery';
    monthsSinceStart: number;
    bankruptcyWaveComplete: boolean;
    peakUnemployment: number;
  };
}

// Add to GameState
export interface TriggeredEventsState {
  activeEvents: TriggeredEvent[];
  completedEvents: TriggeredEvent[];
}
```

**Functions:**
- `triggerPandemic(state: GameState, params: PandemicEventParams): void`
- `triggerEconomicCrisis(state: GameState, params: EconomicCrisisParams): void`
- `updateTriggeredEvents(state: GameState): void` - Called each month
- `processPandemicEvent(state: GameState, event: PandemicEvent): void`
- `processEconomicCrisisEvent(state: GameState, event: EconomicCrisisEvent): void`

### Phase 2: Organizational Bankruptcy Fix (2h)

**Critical Issue:** Current simulation shows 100% organizational bankruptcy during crises (seen in Monte Carlo logs).

**File:** `/src/simulation/organizationManagement.ts`

**Fixes Required:**
1. **Sector-Based Resilience**:
   ```typescript
   interface OrganizationSectorProfile {
     sector: 'tech' | 'finance' | 'general';
     baselineBankruptcyRate: number;    // Normal times: 0.01-0.03
     crisisBankruptcyMultiplier: number; // Crisis multiplier: 2-5x
     resilienceFactors: {
       cashReserves: number;            // More cash = more resilient
       diversification: number;         // Geographic/product diversity
       essentialDesignation: boolean;   // Government will bail out
     };
   }
   ```

2. **Realistic Bankruptcy Mechanics**:
   - Tech companies: 5% bankruptcy (95% survival) even in severe crisis
   - Finance companies: 30% bankruptcy (70% survival)
   - General companies: 15% bankruptcy (85% survival)
   - Capital buffer: Organizations with >6 months expenses survive
   - Geographic diversification: Multi-country operations more resilient

3. **Crisis-Specific Modifiers**:
   - Pandemic: Tech thrives (+20-40% revenue), retail/hospitality suffer
   - Economic crisis: Finance suffers most, tech resilient
   - Government bailouts: Reduce bankruptcy rate by 30-50%

### Phase 3: Recovery Tracking (1h)

**File:** `/src/simulation/recoveryTracking.ts`

**New State:**
```typescript
export interface RecoveryMetrics {
  economicStageHistory: Array<{ month: number; stage: number }>;
  populationHistory: Array<{ month: number; population: number; deaths: number }>;
  organizationCountHistory: Array<{ month: number; count: number; bankruptcies: number }>;
}
```

**Functions:**
- `trackRecovery(state: GameState): void` - Store snapshots monthly
- `getTimeToRecovery(history: any[], threshold: number): number | null`
- `calculateRecoveryMetrics(state: GameState, initialState: GameState): RecoveryMetrics`

### Phase 4: Integration with Phases (30min)

**New Phase:** `/src/simulation/engine/phases/TriggeredEventsPhase.ts`

```typescript
export class TriggeredEventsPhase implements SimulationPhase {
  readonly id = 'triggered-events';
  readonly name = 'Triggered Events';
  readonly order = 27.0; // After environmental, before crisis detection

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    updateTriggeredEvents(state);
    return { events: [], metadata: {} };
  }
}
```

Register in `PhaseOrchestrator.ts`.

### Phase 5: Test Utilities (30min)

**File:** `/tests/validation/eventTriggerUtils.ts`

```typescript
/**
 * Utilities for triggering events in validation tests
 */

export function setupCOVID19Pandemic(state: GameState): void {
  triggerPandemic(state, {
    startMonth: 3,  // March 2020
    duration: 36,   // 3 years
    baselineMortality: 0.001, // 0.1% monthly average
    peakMortality: 0.0025,    // 0.25% at peak
    affectedFraction: 1.0,    // Global pandemic
    economicImpact: 0.4,      // Moderate economic impact
    techResilience: true,     // Tech sector thrives
    vaccineTimeline: 12       // 12 months to vaccine
  });
}

export function setup2008Crisis(state: GameState): void {
  triggerEconomicCrisis(state, {
    startMonth: 9,  // September 2008
    duration: 48,   // 4 years to recovery
    severity: 0.7,  // Severe crisis
    organizationalImpact: {
      tech: 0.05,     // 5% bankruptcy
      finance: 0.30,  // 30% bankruptcy
      general: 0.15   // 15% bankruptcy
    },
    unemploymentSpike: 0.05,  // +5% unemployment
    wealthInequalityIncrease: 0.04, // Gini +0.04
    governmentResponse: true  // TARP bailouts
  });
}

export function setupBlackDeathPandemic(state: GameState): void {
  triggerPandemic(state, {
    startMonth: 0,    // 1347
    duration: 72,     // 6 years
    baselineMortality: 0.05, // 5% monthly (50% total)
    peakMortality: 0.10,     // 10% at peak
    affectedFraction: 1.0,   // Europe-wide
    economicImpact: 0.9,     // Severe disruption
    techResilience: false,   // No tech sector in 1347
    vaccineTimeline: undefined // No vaccines
  });
}
```

## Integration Points

### GameState Changes

Add to `src/types/game.ts`:
```typescript
export interface GameState {
  // ... existing fields
  triggeredEvents?: TriggeredEventsState; // P2.5: External event triggers
}
```

### Historical State Initialization

Modify `/tests/validation/historicalStates.ts` to use triggers:
```typescript
export function createCOVID19TestScenario(): {
  initialState: GameState;
  setupEvents: (state: GameState) => void;
} {
  const initialState = createCOVID19InitialState();

  return {
    initialState,
    setupEvents: (state) => {
      setupCOVID19Pandemic(state);
    }
  };
}
```

## Success Criteria

### For Pandemics
- [ ] COVID-19 mortality matches 0.1-0.25% range
- [ ] Tech sector revenue +20-40% during pandemic
- [ ] Organizational survival >90%
- [ ] Black Death mortality 30-60%, NO extinction
- [ ] Population recovery over 100 years (Black Death)

### For Economic Crises
- [ ] 2008 organizational survival 70-90%
- [ ] Tech sector survival 95%
- [ ] Unemployment spike 5% → 10%
- [ ] Recovery timeline 24-48 months
- [ ] Wealth inequality increases
- [ ] NO extinction/dystopia from economic shock

## Testing Strategy

1. **Unit Tests**: Test individual trigger functions
2. **Integration Tests**: Run validation scenarios (COVID-19, 2008, Black Death)
3. **Regression Tests**: Ensure triggers don't break existing simulation
4. **Manual Verification**: Compare outputs to historical data

## Timeline

- **Phase 1 (Core Event System):** 2 hours
- **Phase 2 (Bankruptcy Fix):** 2 hours
- **Phase 3 (Recovery Tracking):** 1 hour
- **Phase 4 (Integration):** 30 minutes
- **Phase 5 (Test Utilities):** 30 minutes

**Total:** 6 hours (matches P2.5 remaining estimate)

## Research Citations

### COVID-19
- WHO COVID-19 Dashboard (2023): 7M deaths / 7.8B people = 0.09% mortality
- Tech earnings: Google +34%, Amazon +44%, Microsoft +25% (2020-2021 10-K filings)
- Organizational survival: >90% S&P 500 survival (Fortune 500 analysis 2020-2022)

### 2008 Financial Crisis
- S&P 500 survival: ~85% corporate survival (Compustat 2008-2010)
- Tech survival: Apple, Google, Amazon, Microsoft all thrived (Yahoo Finance historical)
- BLS unemployment: 4.6% → 10.0% peak (Bureau of Labor Statistics 2007-2010)

### Black Death
- Benedictow, O. J. (2004): 50-60% European mortality
- Medieval demographics: 75M → 45M → 78M (1340-1450) - full recovery
- No extinction: Humanity recovered and entered Renaissance

## Notes

- **Key Insight:** Current 100% organizational bankruptcy is unrealistic. Historical crises show 70-95% survival depending on sector.
- **Philosophy:** Tests represent historical reality. If tests fail, simulation needs fixing, not test expectations.
- **Validation:** Once this system works, we can confidently say "our simulation reproduces COVID-19, 2008, and Black Death outcomes."
