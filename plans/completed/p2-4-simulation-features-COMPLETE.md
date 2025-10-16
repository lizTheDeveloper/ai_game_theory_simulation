# Simulation Features for Empirical Validation

**Plan:** P2.4 - Simulation Features for Validation
**Created:** October 16, 2025
**Status:** Active - Blocks P2.5 (Empirical Validation)
**Priority:** HIGH (required before P2.5 can be completed)
**Estimated Effort:** 2-4 hours
**Master Roadmap:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md` §Critical Fixes →P2.4
**Blocks:** `plans/completed/p2-5-empirical-validation-FRAMEWORK-COMPLETE.md` (P2.5)
**Validation Framework:** `tests/validation/` (20 tests awaiting these features)

---

## Executive Summary

The P2.5 empirical validation framework is complete (`tests/validation/`, 20 tests, comprehensive documentation). However, validation tests cannot run because the simulation is missing critical features needed to model historical crises:

**Blocking Issues:**
1. **No event trigger system** - Can't initiate pandemics or economic crises on-demand
2. **Organizational bankruptcy broken** - Currently 100% bankruptcy rate (should be 10-30%)
3. **No recovery tracking** - Can't measure time-to-recovery or track economic stages

**Impact:** Cannot validate simulation against COVID-19, 2008 financial crisis, or Black Death until these features are added.

---

## Feature 1: Event Trigger System (1-1.5h)

### Problem Statement

The simulation currently models crises as emergent phenomena that arise from accumulated conditions. However, empirical validation requires the ability to **trigger specific events at specific times** to match historical scenarios:

- **COVID-19 (2020):** Pandemic starts at month 0, spreads for 24 months
- **2008 Financial Crisis:** Economic shock starts at month 0, recovery over 18 months
- **Black Death (1347-1353):** Plague starts at month 0, 30-40% mortality over 72 months

**Current Limitation:** No way to force a pandemic to start or inject an economic shock.

### Research Grounding

**Historical Crisis Testing** is standard practice in epidemiological and economic modeling:
- **SEIR models** (Kermack-McKendrick 1927) - Initiate with infected population
- **Stress testing** (Basel III 2010) - Financial models inject specific shocks
- **Counterfactual analysis** (Comparative Historical Research) - "What if X happened at time T?"

**TRL:** 9 (Standard methodology across multiple disciplines)

### Implementation Design

**Approach:** Add optional `eventTriggers` parameter to simulation initialization:

```typescript
interface EventTrigger {
  type: 'pandemic' | 'economicCrisis' | 'nuclear' | 'environmental' | 'custom';
  startMonth: number;
  parameters: Record<string, number>;
}

interface SimulationConfig {
  seed: number;
  maxMonths: number;
  eventTriggers?: EventTrigger[]; // Optional - for validation scenarios only
}
```

**Example Usage:**

```typescript
// COVID-19 validation scenario
const config = {
  seed: 42000,
  maxMonths: 36,
  eventTriggers: [
    {
      type: 'pandemic',
      startMonth: 0,
      parameters: {
        mortalityRate: 0.01,     // 1% IFR
        infectionRate: 0.60,     // 60% eventual infection
        peakMonth: 6,            // Peak at month 6
        durationMonths: 24       // 2 years
      }
    }
  ]
};
```

### Implementation Tasks

1. **Add EventTrigger types** (15 min)
   - Define interfaces in `src/types/game.ts`
   - Add to `SimulationConfig` interface
   - Document usage in JSDoc comments

2. **Create event trigger phase** (30 min)
   - New phase: `processEventTriggers.ts` (order: 1.5, after time advancement)
   - Check if current month matches any trigger `startMonth`
   - Apply trigger effects to state (mortality, economic shock, etc.)
   - Log trigger activation

3. **Implement trigger handlers** (15 min)
   - `applyPandemicTrigger(state, params)` - Set mortality, spread rates
   - `applyEconomicCrisisTrigger(state, params)` - Inject economic shock
   - Use existing crisis systems, just force activation

4. **Testing** (15 min)
   - Unit test: Trigger fires at correct month
   - Integration test: COVID-19 scenario produces expected mortality
   - Verify normal simulations unaffected (no triggers = current behavior)

**Files Modified:**
- `src/types/game.ts` - Add interfaces
- `src/simulation/engine/phases/processEventTriggers.ts` - New phase
- `src/simulation/initialization.ts` - Accept eventTriggers in config
- `tests/validation/` - Use triggers in historical scenarios

**Deliverables:**
- Event trigger system (3 trigger types: pandemic, economic, environmental)
- Documentation in validation README
- Example scenarios for each trigger type

---

## Feature 2: Fix Organizational Bankruptcy (0.5-1h)

### Problem Statement

Organizations currently have **100% bankruptcy rate** in most scenarios. This breaks empirical validation because:

- **2008 Financial Crisis:** ~10-15% of firms failed (not 100%)
- **COVID-19:** ~20-30% small business closures (not 100%)
- **Normal conditions:** ~8-10% annual business failure rate (not 100%)

**Root Cause:** Likely overly aggressive bankruptcy conditions or missing recovery mechanisms.

### Research Grounding

**Empirical Bankruptcy Rates:**
- **Normal economy:** 8-10% annual (U.S. BLS 2019)
- **Recession (2008-2009):** 15-20% over 2 years (BEA data)
- **Pandemic (2020-2021):** 25-30% small businesses (OECD 2021)

**TRL:** 9 (Extensively documented, BLS/BEA/OECD data)

### Implementation Tasks

1. **Diagnose current bankruptcy logic** (15 min)
   - Review `src/simulation/organizations.ts` bankruptcy conditions
   - Run diagnostic script to identify trigger frequency
   - Check if organizations can recover from negative revenue

2. **Calibrate bankruptcy thresholds** (15 min)
   - Adjust bankruptcy trigger (e.g., "3 consecutive months negative revenue" instead of "1 month")
   - Add stochastic element (not deterministic failure)
   - Model bailouts/support (government can prop up orgs during crisis)

3. **Add recovery mechanics** (15 min)
   - Organizations can recover if conditions improve
   - Government support reduces bankruptcy probability
   - Access to credit/reserves extends survival time

4. **Validation testing** (15 min)
   - Run 10 baseline simulations, measure bankruptcy rate (should be ~8-10%)
   - Run 2008 crisis scenario, measure bankruptcy rate (should be ~15-20%)
   - Run COVID scenario, measure bankruptcy rate (should be ~25-30%)

**Files Modified:**
- `src/simulation/organizations.ts` - Bankruptcy logic
- `src/simulation/agents/governmentAgent.ts` - Add bailout support
- `tests/validation/` - Add bankruptcy rate assertions

**Deliverables:**
- Calibrated bankruptcy rates matching historical data
- Documentation of bankruptcy mechanics
- Validation tests with historical comparisons

---

## Feature 3: Recovery Tracking (0.5-1h)

### Problem Statement

Empirical validation requires measuring **time-to-recovery** from crises:

- **COVID-19:** GDP recovery took ~18 months (trough Q2 2020, recovery Q4 2021)
- **2008 Financial Crisis:** GDP recovery took ~48 months (trough Q2 2009, recovery Q2 2013)
- **Black Death:** Population recovery took ~200+ years

**Current Limitation:** No tracking of economic stages, no time-to-recovery calculation.

### Research Grounding

**Economic Stage Modeling:**
- **NBER Business Cycle Dating** - Peak, contraction, trough, expansion
- **Recovery Metrics** - Return to pre-crisis GDP, employment, income levels
- **Historical Epidemiology** - Population recovery trajectories (McEvedy & Jones 1978)

**TRL:** 9 (Standard economic methodology, NBER official framework)

### Implementation Design

**Add Economic Stage Tracking to GameState:**

```typescript
interface EconomicStageHistory {
  month: number;
  stage: 'expansion' | 'peak' | 'contraction' | 'trough' | 'recovery';
  gdpLevel: number;      // For measuring recovery progress
  baselineGDP: number;   // Pre-crisis level (for recovery target)
}

interface GameState {
  // ... existing fields
  economicStageHistory: EconomicStageHistory[];
  currentEconomicStage: 'expansion' | 'peak' | 'contraction' | 'trough' | 'recovery';
}
```

### Implementation Tasks

1. **Add stage tracking to state** (15 min)
   - Update `src/types/game.ts` with interfaces
   - Initialize in `src/simulation/initialization.ts`
   - Add to history tracking

2. **Implement stage detection phase** (20 min)
   - New phase: `updateEconomicStage.ts` (order: 32, after metrics update)
   - Detect transitions based on GDP/QoL trends:
     - **Expansion:** GDP growing ≥2 consecutive months
     - **Peak:** GDP growth slows, high absolute value
     - **Contraction:** GDP declining ≥2 consecutive months
     - **Trough:** GDP stops declining, low absolute value
     - **Recovery:** GDP growing but below pre-crisis baseline
   - Log stage transitions

3. **Add recovery calculation utilities** (15 min)
   - `calculateTimeToRecovery(history, crisisStartMonth)` - Months from trough to recovery
   - `getRecoveryProgress(current, baseline)` - Percentage recovered (0-100%)
   - Export for use in validation tests

4. **Integration with validation tests** (10 min)
   - Update `tests/validation/historicalStates.ts` with expected recovery times
   - Add assertions: `expect(timeToRecovery).toBeCloseTo(18, tolerance)`
   - Document expected ranges for each historical scenario

**Files Modified:**
- `src/types/game.ts` - Add interfaces
- `src/simulation/engine/phases/updateEconomicStage.ts` - New phase
- `src/simulation/initialization.ts` - Initialize tracking
- `src/simulation/utils/recoveryCalculations.ts` - New utility functions
- `tests/validation/historicalStates.ts` - Add recovery assertions

**Deliverables:**
- Economic stage tracking (5 stages, historical record)
- Recovery calculation utilities
- Validation test integration

---

## Implementation Order

**Recommended sequence:**

1. **Feature 2: Fix Organizational Bankruptcy** (0.5-1h)
   - Highest ROI: Fixes broken baseline behavior
   - Required before other features can be validated
   - No dependencies

2. **Feature 1: Event Trigger System** (1-1.5h)
   - Enables historical scenario testing
   - Required for Features 3 to be useful
   - Depends on: Feature 2 (need working baseline)

3. **Feature 3: Recovery Tracking** (0.5-1h)
   - Enables time-to-recovery measurements
   - Completes empirical validation framework
   - Depends on: Features 1 & 2 (need crises and recovery to measure)

**Total Effort:** 2-4 hours (optimistic 2h, realistic 3h, pessimistic 4h)

---

## Testing Strategy

**After all features complete:**

1. **Baseline validation** (10 min)
   - Run 10 simulations with no triggers
   - Verify bankruptcy rate ~8-10%
   - Verify economic stage transitions occur naturally

2. **Historical scenario validation** (20 min)
   - COVID-19: Mortality ~1%, recovery ~18 months
   - 2008 Crisis: Bankruptcy ~15%, recovery ~48 months
   - Black Death: Mortality ~35%, recovery >200 years

3. **Edge case testing** (10 min)
   - Multiple simultaneous triggers
   - Triggers during existing crisis (compound effects)
   - Recovery interrupted by second crisis

**Total Testing Time:** ~40 minutes

**Acceptance Criteria:**
- ✅ Event triggers fire at correct months
- ✅ Bankruptcy rates match historical ranges (±5%)
- ✅ Recovery times match historical ranges (±20%)
- ✅ Economic stages transition correctly
- ✅ All validation tests pass

---

## Integration Points

**Connects to:**
- **P2.5 Empirical Validation** - Unblocks validation tests
- **Crisis systems** - Uses existing environmental, social, tech risk accumulation
- **Organizations** - Fixes bankruptcy mechanics
- **Government agent** - Bailout/support responses
- **QoL/GDP calculations** - Recovery target metrics
- **Monte Carlo simulations** - Event triggers useful for scenario testing

**Files Created:**
- `src/simulation/engine/phases/processEventTriggers.ts`
- `src/simulation/engine/phases/updateEconomicStage.ts`
- `src/simulation/utils/recoveryCalculations.ts`

**Files Modified:**
- `src/types/game.ts`
- `src/simulation/initialization.ts`
- `src/simulation/organizations.ts`
- `src/simulation/agents/governmentAgent.ts`
- `tests/validation/historicalStates.ts`

---

## Research Citations

1. **Kermack, W. O., & McKendrick, A. G. (1927).** "A Contribution to the Mathematical Theory of Epidemics." *Proceedings of the Royal Society A*, 115(772), 700-721.

2. **Basel Committee on Banking Supervision (2010).** "Basel III: A global regulatory framework for more resilient banks and banking systems." *Bank for International Settlements*.

3. **U.S. Bureau of Labor Statistics (2019).** "Business Employment Dynamics." Annual business failure rates 2000-2019.

4. **Bureau of Economic Analysis (2009).** "GDP and Corporate Profits." Recession bankruptcy data 2008-2009.

5. **OECD (2021).** "OECD SME and Entrepreneurship Outlook 2021." Small business survival rates during COVID-19.

6. **National Bureau of Economic Research (NBER).** "Business Cycle Dating Procedure." Methodology for identifying economic stages.

7. **McEvedy, C., & Jones, R. (1978).** *Atlas of World Population History*. Penguin Books. Population recovery from Black Death.

---

## Notes

**Why these features were deprioritized initially:**
- Event triggers weren't needed for emergent crisis modeling
- Bankruptcy mechanics worked "well enough" for baseline scenarios
- Recovery tracking wasn't critical for understanding long-term outcomes

**Why they're critical now:**
- Empirical validation requires matching specific historical events
- Validation framework is complete but cannot run tests
- These features are narrow in scope (2-4h) and high ROI (unblock major milestone)

**After completion:**
- P2.5 can move from BLOCKED to IN PROGRESS
- Historical validation tests can run
- Model credibility significantly improved with empirical backing
