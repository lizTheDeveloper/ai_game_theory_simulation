# Phase 2: AI Coordination & Transition Mortality Implementation Specification

**Date:** 2025-11-18
**Priority:** TIER 1 CRITICAL (Implementation-ready, zero blockers)
**Owner:** simulation-maintainer (Roy)
**Research:** `research/ai_coordination_transition_mortality_20251118.md` (Grade A-, 24+ sources)
**Estimated Time:** 6-8 hours

---

## Executive Summary

Reinterpret "god mode" as **coordinated AI-managed technology deployment** vs. chaotic instant rollout. Current 30% mortality is **empirically accurate** for uncoordinated scenarios (matches post-Soviet Russia, Great Leap Forward precedents). Coordinated deployment with support systems can reduce mortality to <5% (validated by Green Revolution, Kenya UBI study).

**Key Insight:** Technology alone insufficient—coordination quality and support systems dominate outcomes.

**Expected Impact:** God mode becomes "coordinated deployment" scenario, mortality drops from 30% → 3-5% with proper support systems.

---

## 1. Research Findings Summary

### Empirical Mortality Baselines (Historical Evidence)

| Scenario | Mortality | Confidence | Primary Evidence |
|----------|-----------|------------|------------------|
| **Chaos (instant, zero coordination)** | 20-40% | High | Great Leap Forward (5%), USSR collectivization, god mode test (30%) |
| **Uncoordinated (market-driven)** | 10-25% | High | Post-Soviet Russia (+74% death rate = ~15% excess) |
| **Weakly coordinated** | 5-15% | Medium | Industrial Revolution (gradual, decades) |
| **Strongly coordinated (no support)** | 2-10% | Medium | Marshall Plan, South Korea industrialization |
| **AI-coordinated + full support** | <5% | High | Green Revolution (-33% infant mortality), Kenya UBI (-48%) |

### Support System Effectiveness (Validated Interventions)

| Intervention | Mortality Reduction | Confidence | Source |
|--------------|---------------------|------------|--------|
| **Cash transfers/UBI** | **-48%** | Very High | Kenya 2025 RCT (NBER, 100k+ births) |
| **Labor market support** | **-40%** | High | Germany Kurzarbeit 2008 (OECD) |
| **Food security** | **-33% to -38%** | Very High | Green Revolution (37-country study, PMC/NIH) |
| **Healthcare expansion** | **-20% to -30%** | Medium | UK NHS post-war (gradual effect) |
| **Active labor market** | **-30%** | Medium | Denmark Flexicurity (OECD) |

### Deployment Speed Thresholds

- **Safe:** ≤5% workforce displaced per year
- **Risky:** 10-15% workforce displaced per year
- **Crisis:** >20% workforce displaced per year

**Evidence:** Historical transitions took 40 years; compressing to 10-15 years approaches human adaptation limits. Post-Soviet shock therapy (<5 years) was catastrophic.

---

## 2. Implementation Tasks

### 2.1 Create CoordinatedDeploymentPhase

**Location:** `src/simulation/phases/ai/CoordinatedDeploymentPhase.ts`

**Purpose:** Model AI-managed technology rollout with coordination quality and support systems

**GameState Extensions Required:**

```typescript
// Add to GameState interface (src/types/game.ts)
interface TransitionManagementSystem {
  // Coordination metrics
  aiCoordinationCapability: number;    // 0-1: AI's ability to coordinate deployment
  governanceEffectiveness: number;     // 0-1: Institutional quality (World Bank index)
  infrastructureQuality: number;       // 0-1: Physical infrastructure readiness

  // Support system coverage
  ubiCoverage: number;                 // 0-1: % population with UBI/cash transfers
  retrainingProgramsCoverage: number;  // 0-1: % workforce with retraining access
  foodSecurityIndex: number;           // 0-1: Food distribution system strength
  universalHealthcareCoverage: number; // 0-1: Healthcare access

  // Deployment pacing
  workforceDisplacementRate: number;   // % workforce displaced per year (current)
  maxSafeDeploymentSpeed: number;      // Threshold (default 0.05 = 5%/year)

  // Regional heterogeneity
  regionalReadiness: {
    OECD: number;           // High-income, strong institutions
    middleIncome: number;   // Medium institutions
    lowIncome: number;      // Weak institutions
  };

  // Outcomes
  transitionMortality: number;         // Cumulative % population lost to transition
  mortalityThisMonth: number;          // Current month mortality
  coordinationQuality: number;         // 0-1: Overall coordination score
  supportSystemEffectiveness: number;  // 0-1: Combined support systems score
}
```

**Phase Logic:**

```typescript
export function coordinatedDeploymentPhase(state: GameState, rng: () => number): void {
  assertDefined(rng, {
    location: 'coordinatedDeploymentPhase',
    valueName: 'rng',
    additionalInfo: 'RNG required for deterministic simulation'
  });

  const transition = state.transitionManagementSystem;
  if (!transition) return; // Not initialized yet

  // 1. Assess coordination quality (0 = chaos, 1 = perfect)
  const coordinationQuality = assessCoordinationQuality(state);
  transition.coordinationQuality = coordinationQuality;

  // 2. Assess support system effectiveness (0 = none, 1 = comprehensive)
  const supportEffectiveness = assessSupportSystems(state);
  transition.supportSystemEffectiveness = supportEffectiveness;

  // 3. Calculate base mortality by coordination tier
  let baseMortality: number;
  if (coordinationQuality < 0.3) {
    baseMortality = 0.30;  // Chaos: Great Leap Forward analogue
  } else if (coordinationQuality < 0.6) {
    baseMortality = 0.15;  // Uncoordinated: Post-Soviet Russia analogue
  } else {
    baseMortality = 0.03;  // Coordinated: Green Revolution analogue
  }

  // 4. Adjust for support systems (Kenya UBI: -48% mortality reduction)
  const supportReduction = supportEffectiveness * 0.48;
  baseMortality *= (1 - supportReduction);

  // 5. Adjust for deployment speed (>5%/year = risk multiplier)
  const speed = calculateDeploymentSpeed(state);
  transition.workforceDisplacementRate = speed;

  if (speed > transition.maxSafeDeploymentSpeed) {
    const speedMultiplier = 1 + ((speed - transition.maxSafeDeploymentSpeed) / 0.05) * 0.5;
    baseMortality *= speedMultiplier;
  }

  // 6. Apply regional heterogeneity
  const regionalMortality = applyRegionalHeterogeneity(baseMortality, transition);

  // 7. Update mortality tracking
  const monthlyMortality = regionalMortality / 12; // Annual → monthly
  transition.mortalityThisMonth = monthlyMortality;
  transition.transitionMortality += monthlyMortality;

  // 8. Update population
  const populationLost = state.humanPopulationSystem.population * monthlyMortality;
  state.humanPopulationSystem.population -= populationLost;

  // 9. Log coordination status
  if (state.currentMonth % 12 === 0) {
    logCoordinationStatus(state, coordinationQuality, supportEffectiveness, baseMortality);
  }
}

function assessCoordinationQuality(state: GameState): number {
  const transition = state.transitionManagementSystem;

  // AI coordination capability (50% weight - most important)
  const aiCoordination = transition.aiCoordinationCapability;

  // Governance effectiveness (30% weight)
  const governance = transition.governanceEffectiveness;

  // Infrastructure quality (20% weight)
  const infrastructure = transition.infrastructureQuality;

  const quality = aiCoordination * 0.5 + governance * 0.3 + infrastructure * 0.2;

  return assertProbability(quality, {
    location: 'assessCoordinationQuality',
    valueName: 'coordinationQuality',
    month: state.currentMonth
  });
}

function assessSupportSystems(state: GameState): number {
  const transition = state.transitionManagementSystem;

  // Weighted combination (not additive - diminishing returns)
  // Empirical effectiveness from research:
  // - UBI: -48% mortality (Kenya 2025)
  // - Retraining: -40% unemployment (Germany Kurzarbeit)
  // - Food security: -35% infant mortality (Green Revolution)
  // - Healthcare: -25% long-term mortality (UK NHS)

  const ubiEffect = transition.ubiCoverage * 0.48;
  const retrainingEffect = transition.retrainingProgramsCoverage * 0.40;
  const foodEffect = transition.foodSecurityIndex * 0.35;
  const healthEffect = transition.universalHealthcareCoverage * 0.25;

  // Diminishing returns: not fully additive
  const combinedEffect = Math.min(1.0,
    (ubiEffect + retrainingEffect + foodEffect + healthEffect) / 1.5
  );

  return assertProbability(combinedEffect, {
    location: 'assessSupportSystems',
    valueName: 'supportEffectiveness',
    month: state.currentMonth
  });
}

function calculateDeploymentSpeed(state: GameState): number {
  // Calculate % workforce displaced per year based on technology deployments
  // This depends on how many breakthrough technologies are being deployed simultaneously

  const recentDeployments = countRecentDeployments(state, 12); // Last 12 months
  const workforceSize = state.humanPopulationSystem.population * 0.4; // Assume 40% workforce

  // Each breakthrough affects ~1-5% of workforce
  const averageImpactPerTech = 0.03; // 3% workforce per technology
  const totalImpact = recentDeployments * averageImpactPerTech;

  return assertInRange(totalImpact, 0, 1, {
    location: 'calculateDeploymentSpeed',
    valueName: 'deploymentSpeed',
    month: state.currentMonth
  });
}

function applyRegionalHeterogeneity(baseMortality: number, transition: TransitionManagementSystem): number {
  // Post-Soviet divergence: Russia (no safety nets) vs Poland/Czech (strong policies)
  // 100% mortality difference by 2000

  const oecdMortality = baseMortality * 0.5;        // Strong institutions, existing safety nets
  const middleIncomeMortality = baseMortality * 1.0; // Base case
  const lowIncomeMortality = baseMortality * 2.0;   // Weak institutions, vulnerable

  // Weighted average by population distribution
  // Assume: 15% OECD, 50% middle-income, 35% low-income
  const weightedMortality =
    oecdMortality * 0.15 +
    middleIncomeMortality * 0.50 +
    lowIncomeMortality * 0.35;

  return weightedMortality;
}

function logCoordinationStatus(
  state: GameState,
  coordination: number,
  support: number,
  mortality: number
): void {
  console.log(`\n=== 🤖 Coordinated Deployment Phase ===`);
  console.log(`  🎯 Coordination Quality: ${(coordination * 100).toFixed(1)}%`);
  console.log(`  🛡️ Support System Effectiveness: ${(support * 100).toFixed(1)}%`);
  console.log(`  ⚠️ Projected Annual Mortality: ${(mortality * 100).toFixed(2)}%`);
  console.log(`  📊 Deployment Speed: ${(state.transitionManagementSystem.workforceDisplacementRate * 100).toFixed(1)}%/year`);

  if (coordination < 0.3) {
    console.log(`  🚨 CHAOS: Uncoordinated deployment - catastrophic mortality risk`);
  } else if (coordination < 0.6) {
    console.log(`  ⚠️ UNCOORDINATED: Weak coordination - elevated mortality risk`);
  } else {
    console.log(`  ✅ COORDINATED: Strong coordination - mortality minimized`);
  }
}
```

### 2.2 Initialize Transition Management System

**Location:** `src/simulation/initialization/initializeGameState.ts`

**Initialization:**

```typescript
// Add to initialization logic
state.transitionManagementSystem = {
  // Start with modest AI coordination capability (grows with AI breakthroughs)
  aiCoordinationCapability: 0.3,

  // Governance effectiveness (World Bank index baseline ~0.5 global average)
  governanceEffectiveness: 0.5,

  // Infrastructure quality (moderate baseline)
  infrastructureQuality: 0.5,

  // Support system coverage (start low, increase with policy choices)
  ubiCoverage: 0.1,                    // 10% coverage initially
  retrainingProgramsCoverage: 0.2,     // 20% access
  foodSecurityIndex: 0.7,              // 70% food security baseline
  universalHealthcareCoverage: 0.4,    // 40% healthcare access

  // Deployment pacing
  workforceDisplacementRate: 0.02,     // 2%/year baseline
  maxSafeDeploymentSpeed: 0.05,        // 5%/year threshold (research-backed)

  // Regional readiness (World Bank governance indicators)
  regionalReadiness: {
    OECD: 0.85,
    middleIncome: 0.50,
    lowIncome: 0.25
  },

  // Outcomes (start at zero)
  transitionMortality: 0,
  mortalityThisMonth: 0,
  coordinationQuality: 0,
  supportSystemEffectiveness: 0
};
```

### 2.3 Link AI Coordination to AI Capabilities

**Location:** Modify AI capability phases to update coordination capability

**Example:**

```typescript
// In AI capability advancement logic
if (state.aiCapabilities.coordinationCapability > 0.8) {
  // High AI coordination unlocked
  state.transitionManagementSystem.aiCoordinationCapability = 0.9;
}
```

### 2.4 Link Support Systems to Policy Choices

**Location:** Policy/breakthrough phases that enable support systems

**Example:**

```typescript
// When UBI breakthrough deployed
state.transitionManagementSystem.ubiCoverage = 0.8; // 80% coverage

// When healthcare expansion breakthrough deployed
state.transitionManagementSystem.universalHealthcareCoverage = 0.9; // 90% coverage
```

---

## 3. Validation Requirements

### 3.1 God Mode Regression Test

**Expected behavior:**
- God mode (all techs deployed instantly, no coordination) → 20-30% mortality
- Coordinated god mode (high AI coordination, full support) → 3-5% mortality

**Test script:**

```typescript
test('God mode mortality matches empirical baseline (chaos scenario)', () => {
  const state = createGameState({ seed: 12345 });

  // Deploy all techs instantly at month 0 (chaos scenario)
  state.transitionManagementSystem.aiCoordinationCapability = 0.2; // Low coordination
  state.transitionManagementSystem.ubiCoverage = 0.1;              // Minimal support
  deployAllTechnologies(state);

  runSimulation(state, 120); // 10 years

  const mortality = state.transitionManagementSystem.transitionMortality;

  expect(mortality).toBeGreaterThan(0.20); // >20%
  expect(mortality).toBeLessThan(0.40);    // <40%
  expect(mortality).toBeCloseTo(0.30, 1);  // ~30% ± 5%
});

test('Coordinated deployment reduces mortality to <5%', () => {
  const state = createGameState({ seed: 12345 });

  // High coordination + full support systems
  state.transitionManagementSystem.aiCoordinationCapability = 0.9;
  state.transitionManagementSystem.ubiCoverage = 0.8;
  state.transitionManagementSystem.retrainingProgramsCoverage = 0.8;
  state.transitionManagementSystem.foodSecurityIndex = 0.95;
  state.transitionManagementSystem.universalHealthcareCoverage = 0.9;

  deployAllTechnologies(state);
  runSimulation(state, 120); // 10 years

  const mortality = state.transitionManagementSystem.transitionMortality;

  expect(mortality).toBeLessThan(0.05); // <5%
  expect(mortality).toBeGreaterThan(0.01); // >1% (not zero)
});
```

### 3.2 Support System Effectiveness Validation

**Test:**
- Compare scenarios with/without UBI
- **Expected:** -48% mortality reduction with UBI (Kenya study validation)

### 3.3 Monte Carlo Validation

**Requirements:**
- N ≥ 10 runs
- Mortality distributions match empirical ranges:
  - Chaos: 20-40%
  - Uncoordinated: 10-25%
  - Coordinated: <5%
- Determinism check: CV < 0.01%
- No NaN values

---

## 4. Success Criteria

✅ **Implementation Complete When:**
1. CoordinatedDeploymentPhase created with mortality calculations
2. GameState extended with TransitionManagementSystem
3. Coordination quality assessment functional (AI + governance + infrastructure)
4. Support system effectiveness functional (UBI, retraining, food, healthcare)
5. Regional heterogeneity applied (OECD vs low-income 2× mortality difference)
6. Deployment speed threshold enforced (>5%/year increases risk)
7. God mode chaos test passes (20-30% mortality)
8. Coordinated god mode test passes (<5% mortality)
9. Monte Carlo N=10: mortality distributions match empirical ranges

✅ **Research Validation Complete When:**
1. research-skeptic (Sylvia) verifies parameters match sources ✓ (already A- grade)
2. Mortality ranges match historical evidence (post-Soviet, Great Leap Forward, Green Revolution)
3. Support system multipliers validated (Kenya UBI -48%, etc.)

✅ **Architecture Review Complete When:**
1. architecture-skeptic grades B+ or higher
2. No CRITICAL or HIGH performance issues
3. State propagation verified (mortality → population → downstream systems)

---

## 5. Implementation Notes

### Defensive Coding Requirements

**Population Access (Nov 2025 fix):**
```typescript
// ❌ WRONG - This field doesn't exist
const pop = state.population;

// ✅ CORRECT - Access from humanPopulationSystem
const pop = state.humanPopulationSystem.population;

// ✅ DEFENSIVE (test scripts only)
const pop = state.humanPopulationSystem?.population ?? 0;
```

**Assertion Utilities:**
```typescript
const mortality = assertProbability(calculatedMortality, {
  location: 'coordinatedDeploymentPhase',
  valueName: 'mortality',
  month: state.currentMonth
});

const coordination = assertInRange(coordinationScore, 0, 1, {
  location: 'assessCoordinationQuality',
  valueName: 'coordinationQuality',
  month: state.currentMonth
});
```

### Emoji Conventions

**Log output:**
```typescript
console.log(`🤖 AI Coordination: ${(capability * 100).toFixed(1)}%`);
console.log(`🛡️ Support Systems: ${(support * 100).toFixed(1)}%`);
console.log(`⚠️ Mortality: ${(mortality * 100).toFixed(2)}%`);
console.log(`🚨 ALERT: Speed threshold exceeded (${speed.toFixed(2)} > 0.05)`);
console.log(`✅ Coordination effective`);
```

---

## 6. Handoff to Next Phase

**After implementation:**
1. Commit changes: `feat: AI coordination & transition mortality (empirical baselines)`
2. Run Monte Carlo validation (N=10)
3. Post results to coordination channel
4. Request research-skeptic (Sylvia) verification
5. Request architecture-skeptic review
6. If all pass → Mark Phase 2 complete
7. Proceed to Phase 3 (or parallel with Phase 1 if bandwidth available)

---

## 7. Research Sources (Summary)

**Primary Sources (24+ peer-reviewed):**
- NBER Working Paper #34152 (2025): Kenya cash transfer RCT (-48% infant mortality)
- IZA World of Labor: Post-Soviet mortality (+74% Russia vs stable Poland/Czech)
- PMC/NIH: Green Revolution (-33% infant mortality, 3M lives saved/year by 2000)
- OECD (2009): Germany Kurzarbeit (500k jobs saved)
- Quarterly Journal of Economics (2025): South Korea industrialization (coordination → +100% output)
- IMF Working Paper (2024): Industrialization and the Big Push
- arXiv (2024-2025): Multi-agent coordination protocols, social choice for AI alignment

**Research Quality:** A- (90%+ peer-reviewed, empirical mortality baselines, 2024-2025 sources)

**Full Report:** `research/ai_coordination_transition_mortality_20251118.md` (745 lines)

---

**Implementation Start Date:** TBD (can start in parallel with Phase 1)
**Expected Completion:** 6-8 hours after start
**Blocking Issues:** None (research complete, parameters validated)
