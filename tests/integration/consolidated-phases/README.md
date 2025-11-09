# Consolidated Phases Integration Tests

Comprehensive integration test suite for the phase consolidation project (116 → 95 phases, -33 files).

## Overview

These tests validate that all consolidated phases work correctly together and maintain:
- State transition consistency
- RNG determinism for Monte Carlo reproducibility
- No NaN propagation across phase boundaries
- Correct multi-system interactions
- Phase execution order preservation

## Test Structure

### Batch-Specific Tests

#### `batch1-tier2.test.ts` - TIER 2 Interventions (9 → 3 phases)
Tests consolidated interventions:
- **Tier2SocialSystemsPhase**: Centaur Systems + Community Cohesion
- **Tier2AIGovernancePhase**: Crisis Anticipation + Interpretability + Dark Compute
- **Tier2PhysicalSystemsPhase**: Nuclear + Ecosystems + Coastal + Synergies

**Validation:**
- Unlock conditions trigger correctly
- Deployment S-curves progress over time
- Effect multipliers apply to correct systems
- State transitions update tier2Interventions properly

#### `batch2-ai.test.ts` - AI Phases (6 → 2 phases)
Tests consolidated AI systems:
- **AIAlignmentEvolutionPhase**: LLM Weight + Alignment Technique + Dynamics + RLHF Binding
- **AIAdversarialDetectionPhase**: Gaming Detection + Proactive Sleeper Detection

**Validation:**
- LLM weight updates applied
- Alignment techniques affect agent alignment
- RLHF binding calculations work
- Gaming detection fires correctly
- Sleeper agent wake conditions trigger

#### `batch3-climate.test.ts` - Climate & Environmental (17 → 7 phases)
Tests consolidated climate/resource systems:
- **ClimateSystemPhase**: Geoengineering + TippingPoint + EnvironmentalFeedback + ClimateImpactCascade
- **ResourceSoilPhase**: Phosphorus + NovelEntities
- **ResourceWaterPhase**: Freshwater + OceanAcidification
- **ResourceEconomyPhase**: ResourceTechnology + PowerGeneration

**Validation:**
- Tipping point cascades trigger
- Environmental feedback loops converge
- Planetary boundaries calculated correctly
- Resource depletion rates accurate

#### `batch4-crisis.test.ts` - Crisis & Mortality (14 → 5 phases)
Tests consolidated crisis/mortality systems:
- **HumanSurvivalSystemPhase**: FoodSecurityDegradation + MortalityStabilizers + FamineSystem
- **NuclearCrisisPhase**: NuclearWinter + RadiationSystem
- **ExtinctionSystemPhase**: ExtinctionTriggers + ExtinctionProgress + CatastrophicScenarios

**Validation:**
- Famine mortality calculations correct
- Mortality stabilizers reduce deaths
- Nuclear winter effects apply
- Extinction triggers fire at thresholds
- **CRITICAL**: BayesianMortalityResolutionPhase still works correctly

#### `batch5-social.test.ts` - Social & Governance (20 → 8 phases)
Tests consolidated social/governance systems:
- **GovernanceSystemPhase**: GovernanceQuality + GovernmentElection + PolicyImplementation
- **SocialStabilitySystemPhase**: SocialCohesion + TrustRecovery + Paranoia + SocialStability
- **CooperativeSystemsPhase**: CollectiveFormation + CollectiveActions + UpwardSpirals + CooperativeSpirals + CooperativeOwnership
- **InternationalRelationsPhase**: ConflictResolution + DiplomaticAI + MADDeterrence + FlashWarEscalation

**Validation:**
- Government elections trigger
- Trust recovery/decay cycles work
- Paranoia thresholds correct
- Cooperative spirals trigger
- Conflict resolution logic intact

### Full Integration Test

#### `full-state-transition.test.ts` - End-to-End Validation
Comprehensive validation of all consolidated phases working together:

**Test Coverage:**
1. **End-to-End State Consistency**: 24-month simulation, all fields finite
2. **Cross-Batch Integration**: Validates interactions between batches
3. **Determinism Validation**: Same seed = identical outcomes
4. **Monte Carlo Validation**: N=3 runs, no crashes/NaN
5. **Stress Testing**: Extreme conditions (nuclear winter, social collapse, climate catastrophe)
6. **Regression Prevention**: Deep NaN checks, phase order verification

**Key Validations:**
- No NaN values anywhere in state
- All arrays have correct lengths
- Population matches mortality calculations
- Resources bounded correctly
- AI agent counts stable
- Phase execution order correct
- RNG determinism maintained

## Running Tests

### Run All Consolidated Phase Tests
```bash
npm test tests/integration/consolidated-phases/
```

### Run Individual Batches
```bash
# Batch 1: TIER 2 Interventions
npm test tests/integration/consolidated-phases/batch1-tier2.test.ts

# Batch 2: AI Phases
npm test tests/integration/consolidated-phases/batch2-ai.test.ts

# Batch 3: Climate & Environmental
npm test tests/integration/consolidated-phases/batch3-climate.test.ts

# Batch 4: Crisis & Mortality
npm test tests/integration/consolidated-phases/batch4-crisis.test.ts

# Batch 5: Social & Governance
npm test tests/integration/consolidated-phases/batch5-social.test.ts

# Full State Transition (CRITICAL)
npm test tests/integration/consolidated-phases/full-state-transition.test.ts
```

### Run with Coverage
```bash
npx tsx --test --experimental-test-coverage tests/integration/consolidated-phases/
```

## Test Patterns

### Deterministic RNG
All tests use deterministic RNG for reproducibility:

```typescript
function createTestRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}
```

### State Validation Pattern
```typescript
const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 24 });
const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

// Set up scenario
state.environmentalState.globalTemperature = 17.0;

// Run simulation
const result = engine.run(state, { maxMonths: 12, checkActualOutcomes: false });

// Validate state transitions
assert.ok(Number.isFinite(result.finalState.environmentalState.globalTemperature));
```

### Determinism Verification
```typescript
const seed = TEST_SEED + 1000;

// Run 1
const engine1 = new SimulationEngine({ seed, maxMonths: 12 });
const state1 = createDefaultInitialState(createTestRng(seed), 'historical');
const result1 = engine1.run(state1, { maxMonths: 6, checkActualOutcomes: false });

// Run 2 (same seed)
const engine2 = new SimulationEngine({ seed, maxMonths: 12 });
const state2 = createDefaultInitialState(createTestRng(seed), 'historical');
const result2 = engine2.run(state2, { maxMonths: 6, checkActualOutcomes: false });

// Results should match exactly
assert.strictEqual(result1.finalState.currentMonth, result2.finalState.currentMonth);
```

## Coverage Goals

- **Overall Coverage**: 80%+ of consolidated phase code
- **Critical Paths**: 100% (unlock conditions, state transitions)
- **Edge Cases**: 90%+ (extreme values, boundary conditions)
- **Regression Tests**: 100% (known bugs must not recur)

## Expected Test Count

- **Batch 1**: ~45 tests (TIER 2 interventions)
- **Batch 2**: ~40 tests (AI phases)
- **Batch 3**: ~50 tests (Climate & environmental)
- **Batch 4**: ~50 tests (Crisis & mortality)
- **Batch 5**: ~55 tests (Social & governance)
- **Full Integration**: ~20 tests (End-to-end validation)
- **Total**: ~260 tests

## Success Criteria

### All Tests Must Pass
- ✅ No exceptions thrown
- ✅ All assertions pass
- ✅ No NaN values detected
- ✅ Population remains non-negative
- ✅ All bounds respected (probabilities in [0,1], etc.)

### Determinism Verified
- ✅ Same seed → identical outcomes
- ✅ Different seeds → different outcomes
- ✅ Monte Carlo runs complete successfully

### Performance
- ✅ Individual tests complete in <2s
- ✅ Full suite completes in <60s
- ✅ Memory usage stable (no leaks)

## Maintenance

### When Adding New Phases
1. Add tests to appropriate batch file
2. Update cross-batch integration tests in `full-state-transition.test.ts`
3. Verify determinism with new phase included

### When Modifying Consolidated Phases
1. Run affected batch tests first
2. Run full integration test
3. Run Monte Carlo validation (N≥3)
4. Check for NaN propagation

### When Bugs Are Found
1. Add regression test to prevent recurrence
2. Document in test comments
3. Link to GitHub issue if applicable

## Related Documentation

- **Phase Consolidation Report**: `/logs/phase_consolidation_project_complete_20251109.md`
- **Batch Analysis**: `/logs/phase_consolidation_batch*_*.md`
- **State Validation Guide**: `/tests/integration/STATE_VALIDATION_TESTS_README.md`
- **Development Workflow**: `/docs/DEVELOPMENT_WORKFLOW.md`

## Integration Test Philosophy

These tests validate **real integration, not mocks**:
- Use actual system implementations
- Set up complete, realistic game state scenarios
- Execute full simulation steps
- Verify end-to-end behavior
- Only mock external dependencies (APIs, file systems), never internal systems

**Critical Principle**: Integration tests should give developers confidence that systems work together correctly in the context of the full simulation, not just in isolation.

---

**Created**: November 9, 2025
**Phase Consolidation Project**: 116 → 95 phases (-33 files)
**Test Suite Coverage**: All 5 batches + full integration validation
