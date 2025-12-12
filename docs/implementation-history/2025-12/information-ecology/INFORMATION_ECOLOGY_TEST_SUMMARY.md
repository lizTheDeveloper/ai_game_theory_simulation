# Information Ecology Unit Tests - Summary

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/simulation/informationEcology.test.ts`

**Status:** All 49 tests passing (100% pass rate)

**Coverage:** 913 lines of comprehensive unit tests for the Information Ecology system

## Test Execution

```bash
npm test -- tests/simulation/informationEcology.test.ts
```

**Results:**
- Tests: 49
- Suites: 13
- Pass: 49
- Fail: 0
- Duration: ~700ms

## Test Organization

### 1. Initialization (4 tests)
- Default state values
- Sampling of contested parameters (fact-check half-life [5,30], R₀ [1.2,1.8])
- Determinism with same seed
- Variation with different seeds

**Coverage:** `initializeInformationEcology()`

### 2. Epidemic Dynamics - Misinformation Spread (6 tests)
- R₀ > 1 causes misinformation growth
- R₀ < 1 with strong fact-checking causes decline
- System reaches equilibrium over time
- Bounds enforcement [0, 1]
- NaN prevention with extreme values
- Fact-check decay coefficient validation

**Key Metrics:**
- SIS model: dI/dt = β*I*S - γ*I
- Beta = R₀/10 (transmission rate)
- Gamma = ln(2)/half-life (recovery rate from fact-checking)

**QG1 Context:** Epidemiological model contested (Yee 2025). Effects are upper bounds due to model simplifications.

### 3. Trust Erosion and Recovery (5 tests)
- Baseline decay over time (-1% to -3% per year)
- Polarization amplifies trust loss (1-3x multiplier)
- Trust recovery available after 180 days without shocks
- Floor at 0, ceiling at 1
- Extended decay validation

**Key Mechanisms:**
- Baseline decay: sampled from [-3%, -1%] per year
- Polarization multiplier: 1 + polarization * 2 = [1, 3]
- Recovery: +0.1% per day when daysSinceLastShock > 180

### 4. Epistemic Shocks (6 tests)
- Trust drop: [5%, 30%] based on severity
- Misinformation spike: [10%, 40%] based on severity
- Polarization spike: [5%, 20%] based on severity
- daysSinceLastShock reset to 0
- Effects scale with severity (0-1)
- Bounds enforcement after shock

**Shock Severity Mapping:**
- Severity 0 → minimal impact
- Severity 0.5 → ~17.5% trust drop, 25% misinformation spike
- Severity 1.0 → ~30% trust drop, 40% misinformation spike, 20% polarization spike

**Triggered By:**
- Nuclear detonations (30% per event)
- AI deception events (20% per event)
- Extinction-tier catastrophes (80% severity)

### 5. Coordination Capacity (5 tests)
- Modifier range [0.5, 1.0] (never zero)
- Low trust/reality reduces coordination
- Soft sigmoid threshold behavior (not hard cutoff)
- Uncertainty sampling [0.15, 0.30] per RNG
- Minimum capacity of 0.5

**Mechanism:**
```
coordinationMetric = socialTrust × sharedReality
sigmoid(coordinationMetric - threshold) mapped to [minCapacity, 1.0]
```

**QG1 Context:** Threshold from single case study (Ukraine EA Forum). Soft sigmoid approach reflects model uncertainty.

### 6. Shared Reality Dynamics (3 tests)
- Erodes with high misinformation + polarization
- Recovery mechanism available (0.5% per day when misinformation < 0.3 && trust > 0.5)
- Bounds enforcement [0, 1]

**Note:** Recovery mechanism exists but is overcome by baseline erosion in many scenarios. This is realistic model behavior.

### 7. Epistemic Health - Composite Metric (4 tests)
- High when components healthy (low misinformation, high trust, high shared reality, low polarization)
- Low when components degraded
- Uses geometric mean to balance components
- Prevents NaN with MIN_FLOOR = 0.01

**Formula:**
```
healthComponents = [
  max(0.01, 1 - misinformationLoad),
  max(0.01, sharedReality),
  max(0.01, socialTrust),
  max(0.01, 1 - polarization)
]
epistemicHealth = (product of components) ^ (1/4)
```

### 8. AI Polarization Impact (2 tests)
- High AI social capability increases polarization effects
- Impact range: [-3%, +3%] per 10 days, scaled by AI capability
- No NaN during updates with multiple AI agents

**Mechanism:**
```
baseImpact = (rng * 0.06 - 0.03) * (daysElapsed / 10)  // [-0.03, +0.03] per 10 days
capabilityScaling = max(agent.social) / 100            // [0, 1]
saturationFactor = sigmoid at extremes                 // Prevents runaway
```

### 9. State Validation and Bounds (4 tests)
- Valid state after 100 consecutive updates
- No NaN values across 60-month simulation with shocks
- Extreme initial conditions (0.99 misinformation, 0.01 trust, etc.)
- daysSinceLastShock increments correctly

**Assertion Utilities Used:**
- `assertFinite()` - rejects NaN/Infinity
- `assertInRange()` - validates [0, 1] bounds
- `assertStateProperty()` - replaces fallback patterns

### 10. Determinism - RNG Reproducibility (2 tests)
- Identical state with same seed over 24 months
- Different results with different seeds

**Implementation:** Uses seedrandom library for reproducible testing

### 11. Integration Tests (3 tests)
- Full game state updates with multiple AI agents
- Health degradation after crisis (shock causes immediate drop)
- Coordination failure threshold crossing (persistent shocks reduce coordination)

### 12. Edge Cases and Error Handling (5 tests)
- Zero daysElapsed (no changes)
- Large daysElapsed (10 years of updates)
- Shock severity boundaries (0.0, 0.5, 1.0)
- Empty AI agents list
- AI agents without capability profile (defaults to 0)

## Key Testing Patterns

### Deterministic RNG Setup
```typescript
import seedrandom from 'seedrandom';

function seedRng(seed: string): RNGFunction {
  return seedrandom(seed) as RNGFunction;
}
```

### State Validation Helper
```typescript
function assertValidState(state: InformationEcologyState): void {
  assertInBounds(state.epistemicHealth, 'epistemicHealth');
  assertInBounds(state.polarization, 'polarization');
  assertInBounds(state.socialTrust, 'socialTrust');
  assertInBounds(state.sharedReality, 'sharedReality');
  assertInBounds(state.misinformationLoad, 'misinformationLoad');
  // ... parameter range checks
}
```

### Arrange-Act-Assert Pattern
Every test follows:
1. **Arrange:** Create RNG, state, and game state
2. **Act:** Call function under test
3. **Assert:** Verify expected behavior with specific assertions

## QG1 Validation Context

**Research Grade:** B- (Research Skeptic assessment, Dec 12, 2025)

**Key Uncertainties:**
1. **Epidemiological Model:** Contested by Yee (2025, Synthese)
   - Biological analogies may be fundamentally flawed
   - Constant transmission rates unrealistic
   - Semantic mutation and agency not captured
   - Tests document this as upper bounds

2. **Coordination Threshold:** Single case study (Ukraine EA Forum)
   - Not peer-reviewed
   - n=1 country
   - No quantitative measurement
   - Implementation uses soft sigmoid, not hard cutoff

3. **Trust Erosion Rates:** Estimates only
   - Historical data shows stepwise drops, not linear
   - Range [-3%, -1%] per year is editorial choice
   - Recovery threshold (180 days) not empirically validated

4. **Fact-Check Decay:** Range [5, 30] days from mixed literature
   - Pessimistic: Capewell et al. (2024) shows rapid decay
   - Optimistic: PNAS 2022 shows effects after 2+ weeks
   - Implementation samples per run for sensitivity analysis

**Test Philosophy:**
- Tests verify implementation correctness despite uncertainties
- Comments document QG1 caveats and model assumptions
- No silent fallbacks - assertion utilities catch invalid states
- Determinism enforced for Monte Carlo reproducibility

## Coverage Analysis

**Lines of Test Code:** 913
**Test Cases:** 49
**Branch Coverage:** Estimated 85%+

**High Coverage:**
- All state update functions
- All parameter calculations
- Bounds checking
- Error conditions

**Potential Gaps:**
- Shock detection in InformationEcologyPhase (phase-level integration)
- Event log filtering for nuclear/deception events (requires game state events)
- Government coordination capacity modulation (requires full phase orchestration)

## Helper Functions for Future Tests

```typescript
// Create deterministic RNG
seedRng(seed: string): RNGFunction

// Validate state bounds
assertValidState(state: InformationEcologyState): void
assertInBounds(value: number, fieldName: string, allowNegative?: boolean): void

// Create test fixtures
createMockGameState(): GameState
createMockGameStateWithAIs(numAIs: number): GameState
```

## Performance Notes

- Full test suite completes in ~700ms
- Individual test execution: 0.1-10ms
- No performance bottlenecks identified
- RNG seeding adds negligible overhead

## Integration with Project

**Related Files:**
- Source: `/src/simulation/informationEcology.ts` (461 lines)
- Phase: `/src/simulation/engine/phases/InformationEcologyPhase.ts` (172 lines)
- Types: `/src/types/game.ts` (InformationEcologyState interface)
- Assertions: `/src/simulation/utils/assertions.ts` (utility functions)

**Test Framework:** Node.js native test runner (tsx --test)
**Dependencies:** seedrandom for deterministic RNG
**Mocking:** Mock game states from test helpers

## Future Enhancements

1. **Phase-Level Tests:** Add tests for InformationEcologyPhase.execute()
2. **Event Log Integration:** Test shock detection with realistic event logs
3. **Parameter Sensitivity:** Quantify impact of contested parameter ranges
4. **Monte Carlo Validation:** Validate distribution of outcomes across runs
5. **Cascade Effects:** Test downstream effects on government effectiveness
6. **Historical Validation:** Compare model outputs to known historical crises

## Running Individual Test Suites

```bash
# Run only initialization tests
npx tsx --test tests/simulation/informationEcology.test.ts --grep "Initialization"

# Run only epidemic dynamics tests
npx tsx --test tests/simulation/informationEcology.test.ts --grep "Epidemic"

# Run only determinism tests
npx tsx --test tests/simulation/informationEcology.test.ts --grep "Determinism"
```

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| Total Tests | 49 | 100% Pass |
| Test Suites | 13 | All Green |
| Lines of Code | 913 | Clear |
| Functions Tested | 6 | Complete |
| Edge Cases | 5 | Covered |
| Integration Scenarios | 3 | Validated |
| NaN Prevention | 4 specific tests | All Pass |
| Bounds Validation | 8+ tests | Enforced |
| Determinism Checks | 2 full runs | Verified |

---

**Test File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/simulation/informationEcology.test.ts`

**Last Updated:** December 12, 2025

**Status:** Ready for integration testing and Monte Carlo validation

