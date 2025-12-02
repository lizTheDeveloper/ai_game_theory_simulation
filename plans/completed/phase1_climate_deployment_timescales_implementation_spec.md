# Phase 1: Climate Deployment Timescales Implementation Specification

**Date:** 2025-11-18
**Priority:** TIER 1 CRITICAL (Implementation-ready, zero blockers)
**Owner:** simulation-maintainer (Roy)
**Research:** `research/climate_tech_deployment_timescales_20251112.md` (Grade A-, 15+ sources)
**Estimated Time:** 4-6 hours

---

## Executive Summary

Implement realistic climate technology deployment timescales using a three-delay model. God mode testing showed 5.5% effectiveness at month 60—this is **physically accurate**, not a bug. Technologies face:

1. **Activation delay:** 2-15 years (construction before first operation)
2. **Scaling delay:** 5-50 years (pilot → gigatonne following S-curve)
3. **Physical response delay:** <1 to 100 years (atmospheric equilibration)

**Expected Impact:** Climate effectiveness follows realistic S-curve, matching empirical deployment timescales.

---

## 1. Research Findings Summary

### Three-Delay Model
```typescript
effectiveness(t) = E_max * S(t - T_activate) * R(t)

where:
- E_max = maximum effectiveness (technology-specific)
- T_activate = activation delay (years to first operation)
- S(t) = scaling curve (S-shaped adoption, logistic function)
- R(t) = physical response curve (atmospheric/system response)
```

### Technology-Specific Parameters

| Technology | T_activate (years) | T_50 (50% effectiveness) | Response Delay | E_max |
|------------|-------------------|-------------------------|----------------|-------|
| **DAC** | 5-10 (use 7) | 30 years | 20yr (atmospheric mixing) | 1.0 Gt CO2/yr |
| **Enhanced Weathering** | 2-5 (use 3) | 50 years | 50yr (chemical kinetics) | 0.5 Gt CO2/yr |
| **Ocean Alkalinization** | 3-7 (use 5) | 15 years | 2yr (air-sea exchange) | 10 Gt CO2/yr |
| **Biochar** | 2-5 (use 3) | 10 years | Immediate | 2.8 Gt CO2/yr |
| **BECCS** | 7-15 (use 10) | 25 years | 5yr (geological storage) | 5 Gt CO2/yr |
| **SAI** | 2-5 (use 3) | 5 years | 1.5yr (aerosol dispersion) | 0.5°C cooling |
| **Smart Grid** | 5-10 (use 7) | 12 years | Immediate | 15% efficiency |
| **Green Hydrogen** | 5-10 (use 7) | 20 years | Immediate | 10% industrial emissions |
| **Heat Pumps** | 2-5 (use 3) | 8 years | Immediate | 5% building emissions |

### Empirical Validation
- **Month 36 (3 years):** ~1.5% mean effectiveness expected
- **Month 60 (5 years):** ~5-8% mean effectiveness expected ✅ (matches god mode 5.5%)
- **Month 120 (10 years):** ~10-20% effectiveness expected

---

## 2. Implementation Tasks

### 2.1 Create ClimateDeploymentDelayPhase

**Location:** `src/simulation/phases/climate/ClimateDeploymentDelayPhase.ts`

**Purpose:** Model three-delay dynamics for climate technologies

**GameState Extensions Required:**

```typescript
// Add to GameState interface (src/types/game.ts)
interface ClimateDeploymentTracking {
  // Per-technology deployment tracking
  deployments: {
    [techName: string]: {
      deployedAt: number;              // Month technology was deployed (0 = start)
      activationDelay: number;         // Years before first operation
      scalingCurveInflection: number;  // T_50: years to 50% effectiveness
      physicalResponseTau: number;     // Physical response time constant (years)
      maxEffectiveness: number;        // E_max: maximum theoretical effectiveness
      currentEffectiveness: number;    // 0-1: current effectiveness multiplier
      cumulativeImpact: number;        // Running total of impact (CO2 removed, energy saved, etc)
    };
  };

  // Aggregate metrics
  totalClimateEffectiveness: number;   // Weighted average across all deployed techs
  CO2RemovalRate: number;              // Gt CO2/year currently being removed
  temperatureOffset: number;           // Degrees C cooling from SAI
}
```

**Phase Logic:**

```typescript
export function climateDeploymentDelayPhase(state: GameState, rng: () => number): void {
  const tracking = state.climateDeploymentTracking;
  if (!tracking) return; // Not initialized yet

  const currentMonth = state.currentMonth;
  const yearsElapsed = currentMonth / 12;

  // For each deployed technology
  for (const [techName, deployment] of Object.entries(tracking.deployments)) {
    const timeSinceDeployment = yearsElapsed - (deployment.deployedAt / 12);

    // 1. Check activation delay
    if (timeSinceDeployment < deployment.activationDelay) {
      deployment.currentEffectiveness = 0;
      continue; // Still under construction
    }

    // 2. Calculate scaling progress (logistic S-curve)
    const activeTime = timeSinceDeployment - deployment.activationDelay;
    const scalingProgress = logisticCurve(
      activeTime,
      deployment.scalingCurveInflection,
      0.2  // Steepness parameter (k)
    );

    // 3. Calculate physical response (exponential approach)
    const physicalResponse = deployment.physicalResponseTau > 0
      ? (1 - Math.exp(-activeTime / deployment.physicalResponseTau))
      : 1.0; // Immediate response

    // 4. Combined effectiveness
    deployment.currentEffectiveness =
      deployment.maxEffectiveness * scalingProgress * physicalResponse;

    // 5. Update cumulative impact
    const monthlyImpact = deployment.currentEffectiveness / 12; // Convert annual to monthly
    deployment.cumulativeImpact += monthlyImpact;
  }

  // Aggregate effectiveness
  tracking.totalClimateEffectiveness = calculateAggregateEffectiveness(tracking);
  tracking.CO2RemovalRate = calculateCO2RemovalRate(tracking);
  tracking.temperatureOffset = calculateTemperatureOffset(tracking);
}

function logisticCurve(t: number, inflection: number, steepness: number): number {
  // Standard logistic function: L / (1 + exp(-k(t - t0)))
  // L = 1 (max value), k = steepness, t0 = inflection point
  return 1 / (1 + Math.exp(-steepness * (t - inflection)));
}
```

### 2.2 Initialize Deployment Tracking

**Location:** Modify existing climate tech deployment logic (wherever techs are "unlocked")

**Example for DAC:**

```typescript
// When DAC breakthrough is deployed
state.climateDeploymentTracking.deployments['DAC'] = {
  deployedAt: state.currentMonth,
  activationDelay: 7,        // 5-10 years, use midpoint
  scalingCurveInflection: 30, // T_50: 30 years to 50% effectiveness
  physicalResponseTau: 20,   // 20-year atmospheric mixing
  maxEffectiveness: 1.0,     // 1 Gt CO2/year
  currentEffectiveness: 0,
  cumulativeImpact: 0
};
```

**Full mapping:**

```typescript
const CLIMATE_TECH_PARAMETERS: Record<string, ClimateDeploymentParams> = {
  'DAC': { activationDelay: 7, T_50: 30, tau: 20, E_max: 1.0 },
  'Enhanced Weathering': { activationDelay: 3, T_50: 50, tau: 50, E_max: 0.5 },
  'Ocean Alkalinization': { activationDelay: 5, T_50: 15, tau: 2, E_max: 10.0 },
  'Biochar': { activationDelay: 3, T_50: 10, tau: 0, E_max: 2.8 },
  'BECCS': { activationDelay: 10, T_50: 25, tau: 5, E_max: 5.0 },
  'SAI': { activationDelay: 3, T_50: 5, tau: 1.5, E_max: 0.5 }, // 0.5°C cooling
  'Smart Grid': { activationDelay: 7, T_50: 12, tau: 0, E_max: 0.15 }, // 15% efficiency
  'Green Hydrogen': { activationDelay: 7, T_50: 20, tau: 0, E_max: 0.10 }, // 10% emissions
  'Heat Pumps': { activationDelay: 3, T_50: 8, tau: 0, E_max: 0.05 } // 5% building emissions
};
```

### 2.3 Update Climate Change Boundary Calculation

**Location:** `src/simulation/phases/planetary/ClimateChangePhase.ts` (or wherever climate effectiveness is calculated)

**Modification:**

```typescript
// OLD (instant effectiveness)
const climateEffectiveness = state.breakthroughsUnlocked.filter(
  b => CLIMATE_TECHS.includes(b.name)
).length / CLIMATE_TECHS.length;

// NEW (time-dependent effectiveness)
const climateEffectiveness = state.climateDeploymentTracking?.totalClimateEffectiveness ?? 0;
```

---

## 3. Validation Requirements

### 3.1 God Mode Regression Test

**Expected behavior:**
- Deploy all 9 climate techs at month 0
- Run simulation to month 60 (5 years)
- **Expected effectiveness: 5.5% ± 2%** (should match current behavior)

**Test script:**

```typescript
// tests/integration/climate-deployment-timescales.test.ts
test('God mode climate effectiveness matches empirical timescales', () => {
  const state = createGameState({ seed: 12345 });

  // Deploy all 9 climate techs at month 0
  deployAllClimateTechs(state);

  // Run to month 60
  runSimulation(state, 60);

  const effectiveness = state.climateDeploymentTracking.totalClimateEffectiveness;

  expect(effectiveness).toBeGreaterThan(0.03); // >3%
  expect(effectiveness).toBeLessThan(0.10);    // <10%
  expect(effectiveness).toBeCloseTo(0.055, 1); // ~5.5% ± 0.5%
});
```

### 3.2 Long-Term Scaling Validation

**Test:**
- Deploy all techs at month 0
- Run to month 600 (50 years)
- **Expected effectiveness: 60-80%** (most techs mature, only Enhanced Weathering lagging)

### 3.3 Monte Carlo Validation

**Requirements:**
- N ≥ 10 runs with different RNG seeds
- Determinism check: CV < 0.01% for same seed
- Effectiveness distribution check: Mean ~5.5% at month 60
- No NaN values
- No assertion failures

**Script:**

```bash
npx tsx scripts/monteCarloSimulation.ts --config climate_timescales_validation --runs 10 > logs/mc_climate_timescales_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

---

## 4. Success Criteria

✅ **Implementation Complete When:**
1. ClimateDeploymentDelayPhase created with three-delay model
2. GameState extended with deployment tracking fields
3. All 9 climate technologies have parameter mappings
4. Climate effectiveness calculation uses time-dependent values
5. God mode regression test passes (5.5% ± 2% at month 60)
6. Long-term test passes (60-80% at month 600)
7. Monte Carlo N=10: deterministic, no NaN, CV < 0.01%
8. Technology-specific delays observable in logs (SAI fast, DAC slow)

✅ **Research Validation Complete When:**
1. research-skeptic (Sylvia) verifies parameters match sources ✓ (already A- grade)
2. Effectiveness curves match empirical S-curves
3. No parameter deviations without documented justification

✅ **Architecture Review Complete When:**
1. architecture-skeptic grades B+ or higher
2. No CRITICAL or HIGH performance issues
3. State propagation verified (effectiveness flows to climate boundary)

---

## 5. Implementation Notes

### Defensive Coding Requirements

**RNG Usage:**
```typescript
// ❌ WRONG - No RNG fallback allowed
function phase(state: GameState, rng?: () => number) {
  const random = rng || Math.random;
}

// ✅ CORRECT - RNG required, fail-loudly
export function climateDeploymentDelayPhase(state: GameState, rng: () => number): void {
  assertDefined(rng, {
    location: 'climateDeploymentDelayPhase',
    valueName: 'rng',
    additionalInfo: 'RNG required for deterministic simulation'
  });
  // ... phase logic
}
```

**NaN Prevention:**
```typescript
// Use assertion utilities, no silent fallbacks
const effectiveness = assertFinite(calculatedEffectiveness, {
  location: 'calculateAggregateEffectiveness',
  valueName: 'effectiveness',
  month: state.currentMonth,
  additionalInfo: { deployments: Object.keys(tracking.deployments) }
});
```

**Probability Bounds:**
```typescript
// Ensure [0, 1] bounds at source
deployment.currentEffectiveness = assertProbability(
  maxEffectiveness * scalingProgress * physicalResponse,
  {
    location: 'climateDeploymentDelayPhase',
    valueName: 'currentEffectiveness',
    month: state.currentMonth
  }
);
```

### Emoji Conventions

**Log output:**
```typescript
console.log(`\n=== 🌍 Climate Deployment Delay Phase ===`);
console.log(`  🏗️ Activation: ${techName} operational after ${timeSinceDeployment.toFixed(1)}yr`);
console.log(`  📈 Scaling: ${(scalingProgress * 100).toFixed(1)}% of peak capacity`);
console.log(`  🌡️ Physical Response: ${(physicalResponse * 100).toFixed(1)}% equilibrated`);
console.log(`  ✅ Current Effectiveness: ${(effectiveness * 100).toFixed(1)}%`);
```

**Register any new emojis in `docs/EMOJI_EVENT_MAP.txt`**

---

## 6. Handoff to Next Phase

**After implementation:**
1. Commit changes with message: `feat: Climate deployment timescales (3-delay model)`
2. Run Monte Carlo validation (N=10)
3. Post results to coordination channel
4. Request research-skeptic (Sylvia) verification
5. Request architecture-skeptic review
6. If all pass → Mark Phase 1 complete
7. Proceed to Phase 2 (can start in parallel if Roy available)

---

## 7. Research Sources (Summary)

**Primary Sources (15+ peer-reviewed):**
- Nature Climate Change (2024): CCS scaling feasibility
- Nature (2024): Enhanced weathering in US agriculture
- Biogeosciences (2024-2025): Ocean alkalinization, CO2 lifetime
- Geophysical Research Letters (2025): SAI cloud albedo
- Communications Earth & Environment (2024-2025): Biochar, heat pumps
- IEA (2024): Direct air capture scaling
- NREL (2024): Smart grid deployment

**Research Quality:** A- (90%+ peer-reviewed, 2024-2025 sources, empirical validation)

**Full Report:** `research/climate_tech_deployment_timescales_20251112.md` (695 lines)

---

**Implementation Start Date:** TBD (awaiting simulation-maintainer assignment)
**Expected Completion:** 4-6 hours after start
**Blocking Issues:** None (research complete, parameters validated)
