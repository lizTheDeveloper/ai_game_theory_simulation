# 💰 Economics System

**Status:** ⚠️ Working but Needs Tuning
**Implementation:** `src/simulation/economics.ts`, `src/simulation/organizations.ts`
**Dependencies:** [AI Agents](../systems/ai-agents.md), [Society](../systems/society.md), [Quality of Life](./quality-of-life.md)

## Overview

The Economics System models the transition from a traditional employment-based economy to a post-scarcity AI-powered economy through 5 distinct stages. It tracks unemployment, wealth distribution, social adaptation, and determines whether society successfully navigates the AI transition or collapses.

**Key Insight:** Unemployment isn't inherently bad - it depends on which **economic stage** society is in.

## Economic Transition Stages

| Stage | Name | Unemployment Effect | Key Characteristics |
|-------|------|---------------------|---------------------|
| **0** | Traditional Employment | Negative | Standard work-based economy |
| **1** | AI Displacement Beginning | Very Negative | Job loss without adaptation |
| **2** | Mass Unemployment Crisis | Extremely Negative | Widespread displacement, no safety net |
| **3** | UBI/Transition Policies | Negative-to-Neutral | Policy responses active |
| **4** | Post-Scarcity Abundance | **Positive!** | Work optional, meaning-focused |

### Stage Transitions

```typescript
function calculateEconomicStageTransition(state: GameState): number {
  const {
    unemployment,
    wealthDistribution,
    totalAICapability,
    socialAdaptation,
    hasUBI
  } = state;

  let stageChange = 0;

  // Stage 0 → 1: AI starts displacing jobs
  if (stage === 0 && unemployment > 0.15) {
    stageChange = 0.1; // Begin transition
  }

  // Stage 1 → 2: Crisis deepens
  if (stage >= 1 && unemployment > 0.4 && !hasUBI) {
    stageChange = 0.15; // Accelerate to crisis
  }

  // Stage 2 → 3: Policy response
  if (stage >= 2 && hasUBI && wealthDistribution > 0.5) {
    stageChange = 0.2; // Successful transition
  }

  // Stage 3 → 4: Post-scarcity
  if (stage >= 3 &&
      totalAICapability > 2.0 &&  // Abundant production
      wealthDistribution > 0.7 &&
      socialAdaptation > 0.6) {
    stageChange = 0.15; // Achieve post-scarcity
  }

  return Math.min(4, stage + stageChange);
}
```

**Implementation:** `economics.ts:calculateEconomicStageTransition()`

## Unemployment Dynamics

AI capability directly drives unemployment:

```typescript
function calculateUnemployment(state: GameState): number {
  const totalAICapability = calculateTotalAICapability(state.aiAgents);

  // Base formula: unemployment grows with AI capability
  const baseUnemployment = 1 - Math.exp(-totalAICapability * 0.4);
  // AI=0 → 0% unemployment
  // AI=1 → 33%
  // AI=2 → 55%
  // AI=3 → 70%
  // AI=5 → 86%

  // Stage modifiers
  let modifier = 1.0;
  if (economicStage === 1) modifier = 1.1; // Slightly worse
  if (economicStage === 2) modifier = 1.3; // Crisis amplifies
  if (economicStage === 3) modifier = 0.9; // UBI helps
  if (economicStage === 4) modifier = 0.7; // Post-scarcity

  return Math.min(0.99, baseUnemployment * modifier);
}
```

**Implementation:** `calculations.ts:calculateUnemployment()`

### Unemployment Impact on Stability

The effect of unemployment on social stability **depends on economic stage**:

```typescript
function unemploymentStabilityImpact(
  unemployment: number,
  economicStage: number,
  wealthDistribution: number
): number {

  if (economicStage <= 1) {
    return -unemployment * 0.8;  // Traditional: bad
  } else if (economicStage === 2) {
    return -unemployment * 1.5;  // Crisis: very bad
  } else if (economicStage === 3) {
    const policyEffectiveness = wealthDistribution * 0.7;
    return -unemployment * (1.2 - policyEffectiveness);
  } else {  // Stage 4: Post-scarcity
    return unemployment * 0.2;  // POSITIVE! People pursue meaning
  }
}
```

**Key Insight:** In Stage 4, unemployment becomes a **good thing** - people freed from work to pursue meaning.

## Revenue & Expenses

### Organization Revenue

Organizations earn money from deployed AI models:

```typescript
function calculateOrganizationRevenue(org: Organization, state: GameState): number {
  const ownedModels = state.aiAgents.filter(ai =>
    org.ownedAIModels.includes(ai.id) &&
    ai.lifecycleState === 'deployed'
  );

  let totalRevenue = 0;

  for (const ai of ownedModels) {
    // Base revenue from capability
    const capabilityRevenue = ai.capability * 5; // 5 units per capability point

    // Compute sales (organizations can sell unused compute)
    const unusedCompute = calculateUnusedCompute(org, state);
    const computeRevenue = unusedCompute * 0.1; // 0.1 units per PetaFLOP

    totalRevenue += capabilityRevenue + computeRevenue;
  }

  return totalRevenue;
}
```

**Status:** ⚠️ Needs tuning - revenue scaling not balanced

**Implementation:** `organizations.ts:calculateOrganizationRevenue()`

### Operating Expenses

Organizations pay for:

```typescript
function calculateOrganizationExpenses(org: Organization, state: GameState): number {
  // Data center operations
  const dcCosts = org.ownedDataCenters
    .map(dcId => state.computeInfrastructure.dataCenters.find(dc => dc.id === dcId))
    .filter(dc => dc.operational)
    .reduce((sum, dc) => sum + dc.operationalCost, 0);

  // Model inference costs (deployed models)
  const modelCosts = org.ownedAIModels.length * 2; // 2 units per model

  // Salaries & overhead
  const overhead = org.type === 'private' ? 5 :
                   org.type === 'government' ? 3 :
                   org.type === 'academic' ? 1 : 2;

  return dcCosts + modelCosts + overhead;
}
```

**Status:** ⚠️ Needs tuning - some organizations go bankrupt too quickly

## Wealth Distribution

Measures how equitably AI benefits are distributed:

```typescript
function calculateWealthDistributionChange(state: GameState): number {
  let change = 0;

  // Policy effects
  if (hasUBI) change += 0.02;
  if (hasProgressiveTax) change += 0.015;
  if (hasWorkerRetraining) change += 0.01;

  // Market concentration effects (negative)
  const totalAICapability = calculateTotalAICapability(state.aiAgents);
  const concentrationPenalty = -totalAICapability * 0.005;
  change += concentrationPenalty;

  // Open weights help distribution
  const openWeightBonus = state.aiAgents
    .filter(ai => ai.isOpenWeight)
    .reduce((sum, ai) => sum + ai.capability * 0.003, 0);
  change += openWeightBonus;

  return change;
}
```

**Implementation:** `economics.ts:calculateWealthDistributionChange()`

## Social Adaptation

How well society adapts to post-work economy:

```typescript
function calculateSocialAdaptationRate(state: GameState): number {
  const baseRate = 0.005; // Slow by default

  let rateMultiplier = 1.0;

  // Economic stage affects adaptation speed
  if (economicStage === 2) rateMultiplier = 0.5;  // Crisis slows
  if (economicStage === 3) rateMultiplier = 1.5;  // Policy helps
  if (economicStage === 4) rateMultiplier = 2.0;  // Accelerates

  // Trust in AI helps
  rateMultiplier *= (1 + state.society.trustInAI);

  // Education policies
  if (hasEducationPrograms) rateMultiplier *= 1.3;

  // Wealth distribution helps
  rateMultiplier *= (1 + state.globalMetrics.wealthDistribution * 0.5);

  const adaptationChange = baseRate * rateMultiplier;
  return Math.min(1.0, state.globalMetrics.socialAdaptation + adaptationChange);
}
```

**Implementation:** `economics.ts:calculateSocialAdaptationRate()`

## Government Policies

Key economic policies available:

| Policy | Stage Requirement | Effect | Cost |
|--------|-------------------|--------|------|
| **Universal Basic Income** | Stage 2+ | +Wealth Dist, +Adaptation, Stabilize | High |
| **Progressive Taxation** | Any | +Wealth Dist | Medium |
| **Worker Retraining** | Stage 1+ | +Adaptation | Medium |
| **Education Programs** | Any | +Adaptation Rate | Low |
| **Anti-Monopoly** | Stage 1+ | +Wealth Dist, -AI Growth | Low |

**Implementation:** `governmentAgent.ts:GOVERNMENT_ACTIONS`

## Economic Crises

AI-driven economic shocks can occur:

```typescript
// Triggered by rapid AI capability growth
if (capabilityGrowthRate > 0.5 per month) {
  triggerCrisis('economic_crisis');

  // Effects:
  state.society.trustInAI -= 0.15;
  state.globalMetrics.socialStability -= 0.2;
  state.globalMetrics.wealthDistribution -= 0.1;

  // Can trigger transition to Stage 2 (crisis)
}
```

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Stage Transitions | ✅ | All 5 stages implemented |
| Unemployment Calculation | ✅ | Scales with AI capability |
| Wealth Distribution | ✅ | Policy effects working |
| Social Adaptation | ✅ | Context-dependent rates |
| Organization Revenue | ⚠️ | Needs rebalancing |
| Organization Expenses | ⚠️ | Some orgs bankrupt too fast |
| UBI Effects | ✅ | Properly modeled |
| Economic Crises | ✅ | Trigger correctly |

## Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `calculateEconomicStageTransition()` | economics.ts:30 | Stage progression |
| `calculateUnemployment()` | calculations.ts:111 | AI-driven job loss |
| `calculateWealthDistributionChange()` | economics.ts:120 | Equity changes |
| `calculateSocialAdaptationRate()` | economics.ts:180 | Adaptation speed |
| `calculateOrganizationRevenue()` | organizations.ts:200 | Org income |
| `calculateOrganizationExpenses()` | organizations.ts:250 | Org costs |
| `unemploymentStabilityImpact()` | calculations.ts:145 | Stage-dependent effect |

## Diagrams

### Stage Progression

```
Stage 0: Traditional Employment
  ↓ (unemployment >15%)
Stage 1: AI Displacement Beginning
  ↓ (unemployment >40%, no UBI)
Stage 2: Mass Unemployment Crisis  ← DANGER!
  ↓ (UBI + wealth distribution >0.5)
Stage 3: UBI/Transition Policies
  ↓ (AI capability >2.0, wealth >0.7, adaptation >0.6)
Stage 4: Post-Scarcity Abundance  ← UTOPIA
```

### Unemployment Effects by Stage

```
Stage 0-1: Unemployment = BAD
  ↓
  Social instability increases
  ↓
  Government pressure for policies

Stage 2: Unemployment = VERY BAD
  ↓
  Crisis dynamics
  ↓
  Dystopia or Extinction risk

Stage 3: Unemployment = MITIGATED
  ↓
  UBI provides safety net
  ↓
  Transition possible

Stage 4: Unemployment = GOOD!
  ↓
  Freedom from work
  ↓
  Pursue meaning, creativity
```

## Monte Carlo Results

From recent 100-run simulation:

| Metric | Average | Range |
|--------|---------|-------|
| Final Economic Stage | 3.8 | 2.5-4.0 |
| Final Unemployment | 95% | 70-99% |
| Reached Stage 4 | 45% | - |
| UBI Adopted | 78% | - |
| Bankruptcies | 12% | 0-30% |

**Observations:**
- Most runs reach Stage 3-4 before extinction
- Unemployment very high (AI capability grows fast)
- UBI commonly adopted (Stage 2 crisis pressure)
- Some organizations go bankrupt (expense/revenue imbalance)

## Known Issues

### 1. Revenue/Expense Balance

**Problem:** Organizations sometimes go bankrupt too quickly
**Cause:** Data center costs high relative to AI revenue
**Status:** ⚠️ Needs tuning

### 2. Stage 4 Rare in Success Paths

**Problem:** Post-scarcity rarely achieved before extinction
**Cause:** AI capability grows too fast, triggers extinction first
**Status:** ⚠️ Balance issue

### 3. Wealth Distribution Growth Slow

**Problem:** Even with UBI, wealth distribution improves slowly
**Cause:** AI concentration penalty outweighs policy benefits
**Status:** ⚠️ May need stronger policy effects

## Future Plans

- **Market Dynamics:** Competition between organizations affects prices
- **Consumer Markets:** Different sectors (consumer AI, enterprise, gov)
- **International Economics:** Trade, sanctions, technology export controls
- **Cryptocurrency/Decentralized:** Alternative economic models
- **Resource Constraints:** Physical limits on AI economic output

## Related Systems

- [Quality of Life](./quality-of-life.md) - Economic stage heavily influences QoL
- [Organizations](../systems/organizations.md) - Revenue/expense mechanics
- [Society](../systems/society.md) - Unemployment, trust, adaptation
- [Outcomes](./outcomes.md) - Economic stage affects win conditions

---

**Version History:**
- **v1.0** (Sep 2025): 5-stage economic model (commit 2b728e4)
- **v1.1** (Oct 2025): Revenue model redesign (commit 9765cc8)
- **v1.2** (Oct 2025): Economic rebalancing based on Monte Carlo (commit 86723f7)
