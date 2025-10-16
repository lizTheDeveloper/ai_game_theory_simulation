# Scenario Parameter System (P0.7)

**Two parallel parameter sets for Monte Carlo analysis of existential risk**

## Overview

The scenario parameter system (implemented October 16, 2025) provides two distinct parameter sets for modeling crisis mortality, recovery dynamics, and environmental cascades. This dual-mode approach enables honest existential risk assessment while maintaining defensible calibration for peer review.

**Purpose:** Enable Monte Carlo simulations to show what each parameter set produces when modeling unprecedented systemic failures versus historically-documented crises.

**Location:** `/src/simulation/scenarioParameters.ts`

**Research Validation:** See `/reviews/P1_RESEARCH_VALIDATION_REPORT.md` and `/reviews/skeptical_review_after_p1.md`

## Scenario Modes

### Historical Mode

**Calibrated to worst documented crises in human history**

This mode uses parameters from the Black Death (1347-1353), Spanish Flu (1918-1920), WWII, and other major historical catastrophes. All parameters are defensible for publication based on peer-reviewed historical data.

```typescript
const historicalState = createDefaultInitialState('historical');
```

**Key Characteristics:**
- Conservative for existential risk analysis
- Based on pre-climate-change, pre-hyperconnected-systems world
- All historical crises eventually recovered
- Appropriate for baseline comparison and peer review

**Use Cases:**
- Academic publication baseline
- Comparison with historical precedent
- Demonstrating "optimistic" scenarios where human resilience matches past performance
- Validating model against known historical outcomes

### Unprecedented Mode

**Models hyperconnected systemic failures with no historical precedent**

This mode accounts for qualitatively different risks in the modern era: AI-driven optimization pressure, climate tipping points with hysteresis, global supply chain fragility, and irreversible planetary boundary breaches.

```typescript
const unprecedentedState = createDefaultInitialState('unprecedented');
```

**Key Characteristics:**
- Honest assessment of tail risks
- Accounts for climate feedbacks and tipping points
- Models hyperconnected cascade amplification
- Reflects possibility of irreversible threshold crossings

**Use Cases:**
- Honest existential risk assessment
- Tail risk analysis for decision-making
- Exploring worst-case scenarios
- Testing robustness of interventions

## Parameter Differences

### Cascade Mortality Rate

**Historical:** 0.5% monthly
- Matches Black Death: 30-60% population loss over 6 years (72 months)
- Monthly calculation: 40% decline / 72 months ≈ 0.52%
- Empirical support: Benedictow (2005), Schmid et al. (2015, PNAS)

**Unprecedented:** 1.5% monthly
- 3x historical worst-case
- Accounts for: Modern population density, global supply chain collapse, healthcare system failure, climate amplification
- Rationale: Hyperconnected systems can cascade faster than medieval plagues

**Impact:** In sustained multi-crisis scenarios, unprecedented mode produces 3x higher mortality rates

### Environmental Shock Parameters

**Historical:**
- Base probability: 2% per month
- Scales to 15% when planetary boundaries breached
- Magnitude: 2.0x (150-300% mortality spikes)
- Empirical: 2003 European heatwave (14,729 deaths in France over 20 days)

**Unprecedented:**
- Base probability: 5% per month
- Scales to 25% when boundaries breached
- Magnitude: 3.5x (250-450% spikes)
- Rationale: Climate tipping cascades can trigger compound disasters (wet-bulb events + crop failures + refugee crises)

**Impact:** Unprecedented mode shows 2.5x more frequent and 1.75x more severe environmental shocks

### Cascade Multiplier

**Historical:** 1.8x for 6 simultaneous crises
- Range: Middle of historical cascade data (1.5-3x)
- Banqiao Dam (1975): 2.69x (86K direct deaths → 231K total)
- Haiti earthquake (2010): 1.5-3.7x amplification from infrastructure collapse

**Unprecedented:** 3.5x for 6 simultaneous crises
- Conservative vs Helbing (2013): 2008 financial crisis showed 10-20x amplification
- Accounts for: Network effects, supply chain fragility, information warfare coordination penalties
- Research: Rocha et al. (2018, Science) - 45% of regime shifts can interact, creating domino effects

**Impact:** Unprecedented mode produces nearly 2x stronger cascade compounding effects

### Recovery Probability

**Historical:** 10% monthly chance
- All major historical crises recovered: Black Death, WWII, Cambodia, Russia civil war
- 100 years for European population to return to pre-Black Death levels
- Empirical support: Heuveline & Poch (2007, Demography)

**Unprecedented:** 1% monthly chance
- Accounts for: Climate hysteresis (Lenton et al. 2019), irreversible tipping points, alternative stable states
- Research: Scheffer et al. (2001, Nature) - Critical transitions often lead to alternative stable states
- Rationale: If Amazon dieback or permafrost release triggered, recovery may be impossible on human timescales

**Impact:** Unprecedented mode shows 10x lower probability of post-bottleneck recovery

### Baby Boom Multiplier

**Historical:** 1.6x (60% fertility boost)
- Post-WWII: 50-60% increase (Our World in Data 2024)
- Cambodia after Khmer Rouge: 91% increase (Heuveline & Poch 2007)
- Russia 1920s: ~70% increase (historical demographic data)

**Unprecedented:** 1.2x (20% fertility boost)
- Accounts for: Fertility crashes during existential uncertainty
- Syrian refugee data: Fertility declined during peak crisis, not increased
- Rationale: Couples delay childbearing during civilizational collapse, not accelerate it

**Impact:** Unprecedented mode shows 3x weaker demographic recovery after crises

### Ecosystem Regeneration Rate

**Historical:** 2% annually (50-year recovery)
- Black Death forest regrowth: 90 years (Nature Ecol Evol 2021)
- Temperate forest succession: 50-100 years
- Empirical support: Palaeoecological data from abandoned medieval villages

**Unprecedented:** 0.5% annually (200-year recovery)
- Accounts for: Hysteresis, soil degradation, biodiversity loss, climate instability
- Research: Lenton et al. (2019) - Tipping points require going WELL BELOW original threshold to recover
- Rationale: Coral reef shifts to algae dominance don't "bounce back" (Scheffer 2001)

**Impact:** Unprecedented mode shows 4x slower ecosystem recovery

## Research Justification

### Historical Mode - Peer-Reviewed Support

**Mortality Rates:**
- Black Death: Benedictow (2005), Schmid et al. (2015, PNAS: 10.1073/pnas.1412887112)
- Spanish Flu: Ansart et al. (2009, DOI: 10.1111/j.1750-2659.2009.00080.x)
- Great Leap Forward: Yang (2008, Soc Sci Med)

**Cascade Multipliers:**
- Banqiao Dam: Koks et al. (2024, One Earth) - Infrastructure cascades 5x amplification
- Haiti earthquake: Historical records showing 1.5-3.7x amplification

**Recovery Dynamics:**
- Post-WWII baby boom: Our World in Data (2024)
- Cambodia recovery: Heuveline & Poch (2007, Demography: 44(2), 405-426)
- Medieval forest regrowth: Nature Ecol Evol (2021)

**Confidence Level:** 8/10 - Strong empirical grounding from multiple peer-reviewed sources

### Unprecedented Mode - Theoretical Justification

**Cascade Amplification:**
- Helbing (2013, Nature): "Globally networked risks" exhibit super-exponential growth
- Rocha et al. (2018, Science): 45% of regime shifts can interact, creating domino effects
- Taleb & Bar-Yam (2020, Risk Analysis): Systemic risks in hyperconnected systems follow fat-tailed distributions

**Irreversibility:**
- Lenton et al. (2019, Nature): Climate tipping points exhibit hysteresis
- Steffen et al. (2018, PNAS): Earth system feedbacks can trigger "Hothouse Earth" trajectories
- Scheffer et al. (2001, Nature): Critical transitions lead to alternative stable states

**Modern Context:**
- Ord (2020, "The Precipice"): AI risks differ qualitatively from historical catastrophes
- Diamond (2005, "Collapse"): Societal collapses from environmental degradation showed NO recovery
- Motesharrei et al. (2014, Ecological Economics): HANDY model - collapse can be irreversible

**Confidence Level:** 5/10 - Theoretically justified but no empirical precedent (by definition)

### Research Skeptic Critique

**From `/reviews/skeptical_review_after_p1.md`:**

Key criticisms of historical mode calibration:
1. "Comparing AI/environmental cascades to Black Death assumes similar recovery dynamics" - fails to account for irreversibility
2. "1.8x multiplier contradicts network cascade theory" - research suggests 5-20x amplification in hyperconnected systems
3. "Ignores hysteresis and lock-in" - climate tipping points don't simply "recover"
4. "Cherry-picks recovery examples while ignoring permanent collapses" - Easter Island, Maya, Greenland Norse never recovered

**Unprecedented mode addresses these critiques** by:
- Using 3.5x cascade multiplier (conservative vs 10-20x Helbing data)
- 1% recovery probability (accounts for irreversibility)
- 3x higher mortality rates (accounts for modern amplification)
- Slower ecosystem regeneration (accounts for alternative stable states)

## Usage

### Creating Simulation State

```typescript
import { createDefaultInitialState } from './simulation/initialization';

// Historical calibration (defensible for publication)
const historicalState = createDefaultInitialState('historical');

// Unprecedented tail risk assessment
const unprecedentedState = createDefaultInitialState('unprecedented');
```

### Monte Carlo Analysis

**Recommended approach:** Run 50% historical, 50% unprecedented to show range of outcomes

```typescript
// Example Monte Carlo setup
const runs = [];

for (let i = 0; i < 100; i++) {
  const mode = i < 50 ? 'historical' : 'unprecedented';
  const initialState = createDefaultInitialState(mode);
  const outcome = runSimulation(initialState);
  runs.push({ mode, outcome });
}

// Analyze differences
const historicalExtinction = runs.filter(r => r.mode === 'historical' && r.outcome === 'extinction').length / 50;
const unprecedentedExtinction = runs.filter(r => r.mode === 'unprecedented' && r.outcome === 'extinction').length / 50;

console.log(`Historical mode: ${historicalExtinction * 100}% extinction rate`);
console.log(`Unprecedented mode: ${unprecedentedExtinction * 100}% extinction rate`);
```

### Accessing Parameters

```typescript
import { getScenarioParameters, getScenarioDescription, validateScenarioParameters } from './simulation/scenarioParameters';

// Get parameters for a mode
const params = getScenarioParameters('historical');
console.log(params.cascadeMortalityRate); // 0.005 (0.5% monthly)

// Get human-readable description
const description = getScenarioDescription('unprecedented');
// "Unprecedented Tail Risk: Parameters model hyperconnected systemic failures with no historical precedent. Honest existential risk assessment."

// Validate custom parameters
const customParams = { /* ... */ };
const errors = validateScenarioParameters(customParams);
if (errors.length > 0) {
  console.error('Invalid parameters:', errors);
}
```

## Module API

### `getScenarioParameters(mode: ScenarioMode): ScenarioParameters`

Returns parameter set for specified mode.

**Parameters:**
- `mode`: 'historical' | 'unprecedented'

**Returns:**
```typescript
{
  cascadeMortalityRate: number;           // Monthly mortality rate during cascades
  environmentalShockProbability: number;  // Base probability of environmental shock
  environmentalShockMagnitude: number;    // Mortality spike magnitude
  cascadeMultiplier: number;              // Amplification for 6 simultaneous crises
  recoveryProbability: number;            // Monthly chance of post-bottleneck recovery
  babyBoomMultiplier: number;             // Fertility spike after crisis resolution
  ecosystemRegenerationRate: number;      // Annual ecosystem recovery rate
}
```

### `getScenarioDescription(mode: ScenarioMode): string`

Returns human-readable description of scenario mode.

**Example output:**
- Historical: "Historical Calibration: Parameters match worst documented crises (Black Death, Spanish Flu, WWII). Defensible for publication."
- Unprecedented: "Unprecedented Tail Risk: Parameters model hyperconnected systemic failures with no historical precedent. Honest existential risk assessment."

### `validateScenarioParameters(params: ScenarioParameters): string[]`

Validates parameters are within reasonable bounds.

**Returns:** Array of error messages (empty if valid)

**Validation bounds:**
- `cascadeMortalityRate`: [0, 0.05] (0-5% monthly)
- `environmentalShockProbability`: [0, 0.2] (0-20%)
- `cascadeMultiplier`: [1.0, 10.0]
- `recoveryProbability`: [0, 1.0]

## Integration with Simulation Systems

### Planetary Boundaries (`planetaryBoundaries.ts`)

Uses scenario-specific cascade mortality rates when calculating crisis deaths:

```typescript
// Historical mode: 0.5% monthly during multi-crisis cascades
// Unprecedented mode: 1.5% monthly during multi-crisis cascades
const mortalityRate = state.scenarioParameters.cascadeMortalityRate;
const crisisDeaths = state.population * mortalityRate * activeCrises.length;
```

### Quality of Life (`qualityOfLife.ts`)

Uses scenario-specific environmental shock parameters:

```typescript
// Check for environmental shocks
const shockProbability = state.scenarioParameters.environmentalShockProbability;
if (Math.random() < shockProbability) {
  const magnitude = state.scenarioParameters.environmentalShockMagnitude;
  // Apply shock effects
}
```

### Initialization (`initialization.ts`)

Accepts scenarioMode parameter, sets appropriate parameters:

```typescript
export function createDefaultInitialState(scenarioMode: ScenarioMode = 'historical'): GameState {
  // ...
  scenarioMode,
  scenarioParameters: getScenarioParameters(scenarioMode),
  // ...
}
```

## Expected Outcome Differences

### Historical Mode (Expected Distribution)

Based on Black Death calibration:
- **50-70% Dystopia:** Civilization survives but degraded (2-4B survivors)
- **20-40% Extinction:** Cascade mortality exceeds recovery capacity
- **5-15% Utopia:** Technologies deployed in time, recovery successful

**Rationale:** Historical crises had 100% recovery rate, but modern context adds risks

### Unprecedented Mode (Expected Distribution)

Based on tail risk analysis:
- **10-30% Dystopia:** Some runs avoid irreversible tipping points
- **60-80% Extinction:** Cascade amplification + irreversibility = high extinction rate
- **0-10% Utopia:** Very narrow path through unprecedented risks

**Rationale:** No historical precedent for recovery from climate overshoot + AI risk + ecosystem collapse

### Key Differences

| Metric | Historical | Unprecedented | Ratio |
|--------|-----------|---------------|-------|
| Extinction rate | 20-40% | 60-80% | 2-3x |
| Average cascade mortality | 0.5%/month | 1.5%/month | 3x |
| Recovery probability | 10%/month | 1%/month | 0.1x |
| Time to recovery | 50 years | 200 years | 4x |
| Cascade multiplier | 1.8x | 3.5x | 1.9x |

## Sensitivity Analysis Recommendations

**Critical parameters to test:**

1. **Cascade mortality rate:** Test 0.3%, 0.5%, 0.8%, 1.5%
   - Measure: Extinction rate, time to extinction, bottleneck severity

2. **Cascade multiplier:** Test 1.5x, 1.8x, 2.2x, 3.5x, 5.0x
   - Measure: Crisis compounding effects, dystopia lock-in rate

3. **Recovery probability:** Test 1%, 5%, 10%, 25%
   - Measure: Post-bottleneck outcomes, utopia possibility

4. **Environmental shock frequency:** Test base probabilities 1%, 2%, 5%, 10%
   - Measure: Acute crisis frequency, population stability

**Expected findings:**
- Cascade multiplier has highest impact on dystopia vs extinction distinction
- Recovery probability determines whether bottlenecks lead to extinction or dystopia
- Mortality rate controls speed of population decline, not just magnitude

## Limitations and Caveats

### Historical Mode Limitations

1. **No modern precedent:** Black Death occurred in pre-industrial world without:
   - Global supply chains
   - Nuclear weapons
   - Climate change amplification
   - AI optimization pressure

2. **Recovery bias:** All historical crises recovered because we're here to study them (survivorship bias)

3. **Regional heterogeneity ignored:** Applies global mortality rates, but reality shows 10-100x variation by region/wealth

4. **Time-step granularity:** Monthly updates too coarse for fast cascades (nuclear war), too fine for slow ones (climate tipping)

### Unprecedented Mode Limitations

1. **No empirical validation:** By definition, unprecedented scenarios have no historical data

2. **Parameter uncertainty:** Cascade multipliers, recovery probabilities estimated from theory, not observation

3. **May be conservative:** Helbing (2013) suggests 10-20x multipliers; using 3.5x may still underestimate

4. **Missing heterogeneity:** Doesn't model how wealthy nations might survive while poor nations collapse

### Both Modes

1. **Linear assumptions:** Assumes mortality scales linearly, but reality may show threshold effects

2. **Missing feedback loops:** Doesn't model how healthcare system collapse amplifies all other mortality

3. **Behavioral mortality absent:** No suicide, violence, or fertility collapse from meaning crisis

4. **Infrastructure decay:** Doesn't model supply chain breakdown, medical system failure, water treatment collapse

## Future Enhancements

**Planned improvements:**

1. **Regional heterogeneity:** Model 10-20 population cohorts with different vulnerability profiles
2. **Asymmetric tipping points:** Recovery thresholds 2-3x harder than collapse thresholds
3. **Infrastructure decay functions:** Medical, food, water system failure curves
4. **Behavioral mortality:** Suicide rates, violence, fertility collapse
5. **Wave structure:** 3-6 month mortality waves with 1-3 month lulls (not constant rates)
6. **Age stratification:** Elderly 5-10x higher mortality (all historical crises show this)

## Related Documentation

- **[Crisis Cascades](./crisis-cascades.md)** - How multiple crises compound
- **[Planetary Boundaries](../systems/planetary-boundaries.md)** - Environmental crisis triggers
- **[Population Dynamics](../systems/population-dynamics.md)** - Concrete population tracking
- **[Quality of Life](./quality-of-life.md)** - 17-dimensional welfare measurement
- **[Outcomes](./outcomes.md)** - Utopia, Dystopia, Extinction attractors

**Research Documentation:**
- `/reviews/P1_RESEARCH_VALIDATION_REPORT.md` - Comprehensive empirical validation (25+ papers)
- `/reviews/skeptical_review_after_p1.md` - Critical evaluation and tail risk arguments

**Code References:**
- `/src/simulation/scenarioParameters.ts` - Parameter definitions
- `/src/types/game.ts` - ScenarioMode and ScenarioParameters types
- `/src/simulation/initialization.ts` - State initialization
- `/src/simulation/planetaryBoundaries.ts` - Cascade mortality implementation
- `/src/simulation/qualityOfLife.ts` - Environmental shock implementation

---

**Implemented:** October 16, 2025 (P0.7)
**Status:** Complete - Ready for Monte Carlo validation
**Research Hours:** 8+ hours (P1 research validation)
**Confidence:** Historical (8/10), Unprecedented (5/10)
**Next Steps:** Run N=50-100 Monte Carlo analysis to measure outcome distribution differences
