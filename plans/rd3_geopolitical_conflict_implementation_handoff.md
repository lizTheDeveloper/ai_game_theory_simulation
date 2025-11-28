# Geopolitical Conflict Escalation Phase Implementation

**Agent:** simulation-maintainer (Roy)
**Date:** 2025-11-28
**Source:** Orchestrator handoff
**Research Foundation:** VALIDATED (corrections applied)

## Implementation Requirements

### Phase Creation: GeopoliticalConflictPhase

**Location:** Create `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/phases/geopolitical/GeopoliticalConflictPhase.ts`

**Phase Metadata:**
- Name: "Geopolitical Conflict"
- Category: "geopolitical"
- Order: TBD (suggest 25.0 - after GovernmentDecisionPhase, before crisis cascades)
- Dependencies: ["ai_capabilities", "economic", "climate", "social"]

### State Fields Required

Add to GameState interface (`/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/game.ts`):

```typescript
geopoliticalTension: number;  // 0-100 scale
nuclearEscalationRisk: number;  // monthly probability 0-1
regionalFlashpoints: {
  taiwan: { risk: number; triggers: string[]; active: boolean };
  ukraine: { risk: number; triggers: string[]; active: boolean };
  middleEast: { risk: number; triggers: string[]; active: boolean };
  kashmir: { risk: number; triggers: string[]; active: boolean };
};
activeConflicts: {
  conventional: number;  // count of active conventional conflicts
  nuclear: boolean;  // has nuclear exchange occurred
};
```

### Corrected Parameters (FROM VALIDATION)

**CRITICAL: Use these CORRECTED values, NOT original research values**

```typescript
// Base rate - CORRECTED
const BASE_MONTHLY_CONFLICT_PROBABILITY = 0.0005;  // 0.05% (was 0.1%)

// AI multiplier - CORRECTED
const AI_ERA_MULTIPLIER_BASE = 2.0;  // 2× (was 4×)
const AI_ERA_MULTIPLIER_RANGE = { min: 1.5, max: 3.0 };

// Social trust - REMOVED
// DO NOT IMPLEMENT socialTrustMultiplier - removed per validation

// Compound cap - NEW (prevents doom spiral)
const MAX_COMPOUND_MULTIPLIER = 4.0;

// Deterrence discount - NEW
const DETERRENCE_DISCOUNT = 0.6;  // MAD still effective

// Resource scarcity - REDUCED (50% from original)
const FOOD_INSECURITY_MULTIPLIER = 0.18;  // per 25% increase (was 0.36)
const WATER_SCARCITY_MULTIPLIER = 0.09;  // per 25% increase (was 0.18)

// Climate stress
const CLIMATE_TEMP_MULTIPLIER = 0.075;  // per °C above 1.5°C
const CLIMATE_DISASTER_SPIKE = 1.25;

// Regional flashpoints (monthly)
const TAIWAN_BASE_RISK = 0.033;  // 3.3% monthly (40% by 2030)
const UKRAINE_BASE_RISK = 0.005;  // 0.5% monthly
const MIDDLE_EAST_BASE_RISK = 0.020;  // 2.0% monthly (ongoing)
const KASHMIR_BASE_RISK = 0.008;  // 0.8% monthly (periodic)
```

### Risk Calculation Formula (CORRECTED)

```typescript
function calculateMonthlyConflictRisk(state: GameState, rng: () => number): number {
  // AI multiplier (based on AI capabilities)
  const aiCapability = getAICapabilityScore(state);  // 0-1 scale
  const aiMultiplier = aiCapability < 0.3 ? 1.0 :
                      aiCapability > 0.7 ? AI_ERA_MULTIPLIER_BASE :
                      1.0 + (aiCapability - 0.3) * (AI_ERA_MULTIPLIER_BASE - 1.0) / 0.4;

  // AI capability spike detection
  const aiSpikeMultiplier = detectAICapabilitySpike(state) ? 1.5 : 1.0;

  // Resource scarcity (CORRECTED - reduced 50%)
  const foodInsecurity = getFoodInsecurity(state);  // 0-1 scale
  const waterScarcity = getWaterScarcity(state);  // 0-1 scale
  const resourceMultiplier = 1.0 +
    (foodInsecurity / 0.25) * FOOD_INSECURITY_MULTIPLIER +
    (waterScarcity / 0.25) * WATER_SCARCITY_MULTIPLIER;

  // Climate stress
  const tempAnomaly = state.climate.globalTemperatureAnomaly;
  const tempMultiplier = 1.0 + Math.max(0, tempAnomaly - 1.5) * CLIMATE_TEMP_MULTIPLIER;
  const disasterMultiplier = hasRecentClimateDisaster(state) ? CLIMATE_DISASTER_SPIKE : 1.0;
  const climateMultiplier = tempMultiplier * disasterMultiplier;

  // Compound multiplier with CAP (prevents doom spiral)
  const compoundMultiplier = Math.min(
    aiMultiplier * aiSpikeMultiplier * resourceMultiplier * climateMultiplier,
    MAX_COMPOUND_MULTIPLIER
  );

  // Apply deterrence discount (MAD still works)
  const baseProbability = BASE_MONTHLY_CONFLICT_PROBABILITY * compoundMultiplier * DETERRENCE_DISCOUNT;

  // Regional flashpoints (additive)
  const flashpointRisk = calculateRegionalFlashpoints(state);

  // Total (capped at 15% monthly)
  return Math.min(baseProbability + flashpointRisk, 0.15);
}
```

### Defensive Coding Requirements

**CRITICAL: Follow simulation-maintainer standards**

1. **No silent fallbacks** - Use assertion utilities from `@/simulation/utils/assertions`
2. **Required RNG** - Never optional with Math.random fallback
3. **Emoji conventions** - ☢️ (nuclear), 🌍 (global), 🤖 (AI), 🏛️ (government)
4. **Research citations** - Comment with source for all parameters
5. **Fail loudly** - If required data missing, throw error with context

### Integration Points

**Read from state:**
- AI capabilities: `state.aiCapabilities` (17 dimensions)
- Economic: `state.resourceEconomy.gdpPerCapita`, unemployment
- Climate: `state.climate.globalTemperatureAnomaly`, disasters
- Social: `state.socialMetrics.polarization`, institutional trust
- Population: `state.humanPopulationSystem.population`

**Write to state:**
- Conflict events to event log
- Population impacts if nuclear exchange occurs
- Economic disruption from conventional conflicts
- Update geopoliticalTension, nuclearEscalationRisk, activeConflicts

### Testing Requirements

**Unit tests:**
- Risk calculation with various input combinations
- Multiplier interactions
- Compound cap enforcement
- Deterrence discount application
- Regional flashpoint logic

**Integration tests:**
- Phase executes without errors
- State updates correctly
- Event logging works
- Determinism (same seed → same output)

### Success Criteria

- All parameters match CORRECTED research values
- Compound cap prevents doom spiral (max 4×)
- Deterrence discount applied (0.6×)
- Defensive coding (assertions, no silent fallbacks)
- Deterministic (CV < 0.01%)
- Type check passes
- All tests pass

## Handoff Details

**Research documents:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/geopolitical_conflict_escalation_20251128.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/rd3_geopolitical_conflict_critique_20251128.md`

**Next steps after implementation:**
1. Unit tests (unit-test-writer)
2. Integration tests (integration-test-writer)
3. Monte Carlo validation (priya, N=10 runs)
4. Architecture review (architecture-skeptic)
5. Documentation (wiki-documentation-updater)
6. Roadmap update (architect)

**Expected timeline:** 2-3 hours for implementation + tests

Please proceed with implementation following all defensive coding standards.
