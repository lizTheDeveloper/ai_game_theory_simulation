# Error Handling Guidelines

**Research Simulation Philosophy:** Fail loudly when invalid state is detected. Invalid values indicate bugs that must be fixed at source, not masked with fallbacks.

## Core Principles

### 1. Fail-Fast with Context

**ALWAYS throw errors for critical state corruption:**
- NaN values in calculations
- Invalid state transitions
- Out-of-bounds values that indicate bugs
- Missing required state properties

**Include full diagnostic context:**
- Phase/function name (`location`)
- Variable name (`valueName`)
- Current simulation month
- Inputs that caused the problem
- Expected vs actual values

### 2. Log-and-Continue for Warnings

**Use console.log with emoji conventions for:**
- Suboptimal but valid states (threshold approaching)
- Expected edge cases (agent lifecycle transitions)
- Performance degradation alerts
- Informational state changes

**Never use console.warn or console.error** - use emoji conventions instead:
- `⚠️` for warnings (approaching thresholds)
- `❌` for errors (assertion failures, these will throw)
- `🚨` for critical alerts (emergencies, regime shifts)

### 3. Use Assertion Utilities Consistently

**Replace manual validation with assertion utilities from `src/simulation/utils/assertions.ts`:**

```typescript
// ❌ BAD - Manual check without helpful error
if (isNaN(value)) {
  throw new Error('Value is NaN');
}

// ❌ BAD - Silent fallback hides bugs
const value = state.metric ?? 0.5;

// ✅ GOOD - Assertion with full context
const value = assertFinite(calculatedValue, {
  location: 'updateEnvironmentalMetric',
  valueName: 'environmentalScore',
  month: state.currentMonth,
  additionalInfo: { inputs: { x, y, z } }
});

// ✅ GOOD - State property assertion
const pH = assertStateProperty(state.oceanHealth, 'pH', {
  location: 'applyOceanTech',
  month: state.currentMonth
});
```

## When to Throw vs When to Log

### THROW (Critical Errors)

These indicate bugs that must be fixed immediately:

1. **NaN/Infinity in calculations**
   - Use: `assertFinite(value, context)`
   - Why: NaN propagates silently, corrupting entire simulation

2. **Invalid state property access**
   - Use: `assertStateProperty(obj, 'path', context)`
   - Why: Missing properties indicate initialization bugs

3. **Out-of-bounds values**
   - Use: `assertInRange(value, min, max, context)`
   - Why: Values outside plausible ranges indicate calculation bugs

4. **Invalid probabilities**
   - Use: `assertProbability(value, context)`
   - Why: Probabilities outside [0, 1] are mathematically invalid

5. **Population changes exceeding physical limits**
   - Use: `assertPopulationChange(newValue, oldValue, context)`
   - Why: Changes >50% per month indicate mortality calculation bugs

6. **Missing required dependencies**
   - Use: `assertPhaseDependency(context, requiredPhaseId, info)`
   - Why: Phase ordering violations cause race conditions

7. **State field overwrites**
   - Use: `assertStateFieldNotModified(current, expected, info)`
   - Why: Silent overwrites corrupt authoritative state

### LOG (Warnings and Informational)

These indicate expected behavior or gradual degradation:

1. **Approaching thresholds (not yet crossed)**
   ```typescript
   if (climateStability < 0.3 && climateStability > 0.2) {
     console.log(`⚠️ Climate stability approaching critical threshold: ${(climateStability * 100).toFixed(1)}%`);
   }
   ```

2. **Expected lifecycle transitions**
   ```typescript
   console.log(`🤖 AI agent ${agent.id} transitioned: ${oldState} → ${newState}`);
   ```

3. **Emergency response activations**
   ```typescript
   console.log(`🚨 Emergency climate response deployed (severity: ${(severity * 100).toFixed(0)}%)`);
   ```

4. **Bifurcation regime changes**
   ```typescript
   console.log(`🌀 REGIME SHIFT: ${previousRegime} → ${currentRegime}`);
   ```

5. **Technology breakthroughs**
   ```typescript
   console.log(`💡 BREAKTHROUGH: ${tech.name} deployed`);
   ```

## Error Message Format

### Standard Error Template

```typescript
throw new Error(
  `❌ [ERROR_TYPE] in ${location}\n` +
  `   ${valueName} = ${value}\n` +
  `   Expected: ${expectedCondition}\n` +
  `   Month: ${state.currentMonth}\n` +
  `\n` +
  `   Context: ${JSON.stringify(additionalInfo, null, 2)}\n` +
  `\n` +
  `   This indicates: [root cause explanation]\n` +
  `   Fix: [actionable fix guidance]`
);
```

### Examples

**NaN in calculation:**
```typescript
throw new Error(
  `❌ Non-finite value in updateFoodSecurity\n` +
  `   foodSecurity = NaN\n` +
  `   Expected: finite number in [0, 1]\n` +
  `   Month: 145\n` +
  `\n` +
  `   Inputs: ${JSON.stringify({ cropYield, population, reserves }, null, 2)}\n` +
  `\n` +
  `   This indicates a calculation bug (likely division by zero).\n` +
  `   Fix: Check cropYield calculation for zero denominators.`
);
```

**Missing state property:**
```typescript
throw new Error(
  `❌ Missing state property: oceanHealth.pH\n` +
  `   Location: applyOceanTech\n` +
  `   Month: 67\n` +
  `   Expected initialization: initialization.ts:892\n` +
  `\n` +
  `   This indicates oceanHealth was not properly initialized.\n` +
  `   Fix: Check initialization.ts oceanHealth setup.`
);
```

**Phase dependency violation:**
```typescript
throw new Error(
  `❌ PHASE DEPENDENCY VIOLATION: regional_population_update\n` +
  `   Required phase: bayesian_mortality_resolution\n` +
  `   Reason: Must not overwrite mortality-adjusted population\n` +
  `   Month: 89\n` +
  `\n` +
  `   Executed phases so far: compute-growth, ai-lifecycle\n` +
  `\n` +
  `   Fix: Declare dependency in phase definition or adjust phase order.`
);
```

## Assertion Utility Reference

### Core Assertions

| Utility | Use Case | Example |
|---------|----------|---------|
| `assertFinite(value, context)` | All calculations | Validate metrics, scores, rates |
| `assertDefined(value, context)` | Required properties | Check object/array exists |
| `assertInRange(value, min, max, context)` | Bounded values | Temperature, indices, stages |
| `assertProbability(value, context)` | Probabilities | Trust, risk, transition odds |
| `assertNonEmpty(array, context)` | Required arrays | Active agents, deployed techs |

### State Access Assertions

| Utility | Use Case | Example |
|---------|----------|---------|
| `assertStateProperty(obj, 'path', context)` | State access | Replace `state.x?.y ?? 0` |
| `assertEconomicStage(state, location)` | Economic stage | Validate transition stage |
| `assertSurvivalFundamentals(obj, location, month)` | QoL survival tier | Validate food/water/shelter |

### Domain-Specific Assertions

| Utility | Use Case | Example |
|---------|----------|---------|
| `assertAICapability(value, context)` | AI capability levels | Physical, cognitive, social (0-5) |
| `assertAIAggregateCapability(value, context)` | AI aggregate scores | Sum of all dimensions (0-100) |
| `assertPlanetaryBoundary(value, type, context)` | Planetary boundaries | CO2, temperature, pH |
| `assertMortalityRate(rate, context)` | Death rates | Monthly mortality (0-50%) |
| `assertTemperatureDelta(delta, context)` | Temperature changes | Climate/nuclear anomalies (-20 to +10°C) |
| `assertPopulationChange(new, old, context)` | Population updates | Validate plausible deltas |
| `assertPopulationMillion(value, context)` | Regional populations | Regional population (0-1000M) |
| `assertEconomicMetric(value, type, context)` | Economic values | GDP, spending, taxation |
| `assertShockMagnitude(value, context)` | Exogenous shocks | Black/gray swan impacts |
| `assertResourceAllocation(value, context)` | Budget fractions | Budget allocations (0-1) |
| `assertRegionalConsistency(state)` | Regional-global sync | Prevent drift in bottom-up aggregation |

### Phase Ordering Assertions

| Utility | Use Case | Example |
|---------|----------|---------|
| `assertPhaseDependency(context, phaseId, info)` | Required phase executed | Mortality before population |
| `assertPhaseNotExecuted(context, phaseId, info)` | Phase hasn't run yet | Prevent race conditions |
| `assertStateFieldNotModified(current, expected, info)` | Detect overwrites | Catch silent data corruption |

## Common Anti-Patterns

### ❌ Silent Fallbacks

```typescript
// ❌ BAD - Hides initialization bugs
const value = state.metric ?? 50;

// ❌ BAD - Masks NaN propagation
const score = isNaN(calculated) ? 0.5 : calculated;

// ❌ BAD - Silent undefined
const agents = state.aiAgents || [];
```

### ✅ Explicit Assertions

```typescript
// ✅ GOOD - Fails loudly with context
const value = assertStateProperty(state, 'metric', {
  location: 'updateSystem',
  month: state.currentMonth
});

// ✅ GOOD - Exposes calculation bugs
const score = assertProbability(calculated, {
  location: 'calculateRisk',
  valueName: 'riskScore',
  month: state.currentMonth,
  additionalInfo: { inputs: { x, y, z } }
});

// ✅ GOOD - Validates array exists
const agents = assertNonEmpty(state.aiAgents, {
  location: 'calculateAggregateCapability',
  valueName: 'aiAgents',
  month: state.currentMonth
});
```

### ❌ Manual Validation Without Context

```typescript
// ❌ BAD - Unhelpful error message
if (value < 0 || value > 1) {
  throw new Error('Invalid value');
}

// ❌ BAD - No diagnostic info
if (!state.oceanHealth) {
  console.error('Missing oceanHealth');
  return;
}
```

### ✅ Assertion Utilities with Context

```typescript
// ✅ GOOD - Clear error with debugging info
const value = assertProbability(value, {
  location: 'updateTrust',
  valueName: 'trustLevel',
  month: state.currentMonth
});

// ✅ GOOD - Detailed missing property error
const pH = assertStateProperty(state.oceanHealth, 'pH', {
  location: 'applyOceanTech',
  month: state.currentMonth,
  expectedSource: 'initialization.ts:892'
});
```

### ❌ Try-Catch for Expected Failures

```typescript
// ❌ BAD - Swallows errors that should propagate
try {
  updatePlanetaryBoundaries(state);
} catch (err) {
  console.error('Boundary update failed');
  // Silent failure continues simulation with corrupt state
}
```

### ✅ Let Assertions Throw

```typescript
// ✅ GOOD - Let phase fail loudly, orchestrator handles
function execute(state: GameState, rng: RNGFunction): PhaseResult {
  // Assertions throw with full context - don't catch
  updatePlanetaryBoundaries(state);
  return { events: [] };
}
```

## Phase-Specific Patterns

### Critical Phases (Must Validate Thoroughly)

These phases handle core state mutation and must use assertions extensively:

1. **PlanetaryBoundariesPhase**
   - Validate all boundary values with `assertPlanetaryBoundary`
   - Check temperature deltas with `assertTemperatureDelta`
   - Validate ocean pH, CO2, biodiversity indices

2. **AILifecyclePhase**
   - Validate all AI capabilities with `assertAICapability`
   - Round capabilities to integers before assertions
   - Check aggregate capabilities with `assertAIAggregateCapability`

3. **EmergencyResponsePhase**
   - Validate all resource allocations with `assertResourceAllocation`
   - Check probability values with `assertProbability`
   - Validate effectiveness deltas with `assertInRange`

4. **BifurcationDetectionPhase**
   - Validate regime thresholds with `assertProbability`
   - Check distance calculations with `assertFinite`
   - Validate variance amplification with `assertInRange`

5. **BayesianMortalityResolutionPhase**
   - Validate mortality rates with `assertMortalityRate`
   - Check population changes with `assertPopulationChange`
   - Assert phase dependencies to prevent race conditions
   - Validate regional consistency with `assertRegionalConsistency`

### Validation Checkpoints

**Before critical operations:**
```typescript
// Validate inputs before calculation
const temperature = assertStateProperty(state.resourceEconomy.co2, 'temperatureAnomaly', {
  location: 'calculateHeatStress',
  month: state.currentMonth
});

const population = assertPopulationMillion(region.population, {
  location: 'calculateRegionalMortality',
  valueName: 'population',
  month: state.currentMonth,
  region: region.name
});
```

**After critical operations:**
```typescript
// Validate outputs after calculation
const newScore = calculateEnvironmentalScore(state);
const validatedScore = assertProbability(newScore, {
  location: 'PlanetaryBoundariesPhase.execute (post-calculation)',
  valueName: 'environmentalScore',
  month: state.currentMonth,
  additionalInfo: { inputs: { temp, pH, biodiversity } }
});
state.environmentalScore = validatedScore;
```

**Phase execution boundaries:**
```typescript
// At phase start - validate dependencies
if (this.dependencies) {
  for (const depId of this.dependencies) {
    assertPhaseDependency(context, depId, {
      currentPhase: this.id,
      reason: 'Requires updated compute allocation',
      month: state.currentMonth
    });
  }
}

// At phase end - validate state consistency
if (state.humanPopulationSystem.regionalPopulations) {
  assertRegionalConsistency(state);
}
```

## Migration Guide

### Converting Existing Code

**Step 1: Identify manual validation**
```typescript
// Before
if (isNaN(value) || !isFinite(value)) {
  throw new Error('Invalid value');
}
```

**Step 2: Replace with assertion utility**
```typescript
// After
const validValue = assertFinite(value, {
  location: 'updateMetric',
  valueName: 'metricValue',
  month: state.currentMonth
});
```

**Step 3: Remove silent fallbacks**
```typescript
// Before
const score = state.environmentalScore ?? 0.5;

// After
const score = assertStateProperty(state, 'environmentalScore', {
  location: 'calculateImpact',
  month: state.currentMonth,
  expectedSource: 'initialization.ts:1234'
});
```

**Step 4: Add context to existing throws**
```typescript
// Before
if (rate < 0 || rate > 1) {
  throw new Error('Invalid rate');
}

// After
const validRate = assertProbability(rate, {
  location: 'calculateTransition',
  valueName: 'transitionRate',
  month: state.currentMonth,
  additionalInfo: { factors: { trust, stability, capability } }
});
```

## Testing Error Handling

### Unit Tests Should Verify Error Messages

```typescript
describe('updateFoodSecurity', () => {
  it('throws with context when population is zero', () => {
    const state = createTestState({ population: 0 });

    expect(() => updateFoodSecurity(state)).toThrow(
      /❌ Non-finite value in updateFoodSecurity.*foodSecurity = NaN/
    );
  });

  it('throws with month context', () => {
    const state = createTestState({ currentMonth: 145, population: 0 });

    expect(() => updateFoodSecurity(state)).toThrow(/Month: 145/);
  });
});
```

### Monte Carlo Validation

After changes, always run Monte Carlo validation:

```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Check for:**
- No assertion errors (`grep "❌" logs/mc_*.log`)
- No NaN values (`grep "NaN" logs/mc_*.log`)
- No Infinity values (`grep "Infinity" logs/mc_*.log`)
- Outcome distributions look plausible

## References

- **Assertion utilities implementation:** `src/simulation/utils/assertions.ts`
- **Emoji conventions:** `docs/EMOJI_QUICK_REFERENCE.md`, `docs/EMOJI_SEMANTIC_MAP.md`
- **Phase architecture:** `src/simulation/engine/PhaseOrchestrator.ts`
- **Monte Carlo validation:** `scripts/monteCarloSimulation.ts`
- **Research simulation philosophy:** `CLAUDE.md` (NaN and Invalid Value Handling section)

## Quick Decision Tree

```
Is this an invalid state that indicates a bug?
├─ YES → THROW with assertion utility
│  ├─ NaN/Infinity? → assertFinite
│  ├─ Missing property? → assertStateProperty
│  ├─ Out of bounds? → assertInRange / assertProbability
│  └─ Invalid transition? → Custom assertion with detailed context
│
└─ NO → Is this important to track?
   ├─ YES → LOG with emoji conventions
   │  ├─ Warning? → ⚠️
   │  ├─ Critical? → 🚨
   │  ├─ Success? → ✅
   │  └─ Info? → Domain emoji (🤖🌍💡)
   │
   └─ NO → Don't log (avoid noise)
```

---

**Last updated:** November 15, 2025 (MEDIUM-1 standardization)
