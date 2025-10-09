# 📊 Quality of Life System

**Status:** ✅ Fully Working
**Implementation:** `src/simulation/qualityOfLife.ts`
**Dependencies:** [Economics](./economics.md), [AI Agents](../systems/ai-agents.md), [Society](../systems/society.md)

## Overview

Quality of Life (QoL) is the **primary discriminator** between Utopia and Dystopia outcomes. Instead of a single number, QoL is measured across **17 dimensions** that capture different aspects of human welfare, from material abundance to existential meaning.

**Key Insight:** High AI capability can lead to either Utopia (high QoL) or Dystopia (low QoL) depending on alignment, distribution, and control.

## 17 Dimensions of Quality of Life

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| **Material Abundance** | 0.15 | Food, shelter, goods availability |
| **Healthcare Access** | 0.12 | Medical care quality and availability |
| **Personal Freedom** | 0.10 | Civil liberties, autonomy |
| **Safety & Security** | 0.08 | Physical safety from violence/crime |
| **Mental Health** | 0.08 | Psychological wellbeing |
| **Social Connection** | 0.07 | Community, relationships |
| **Environmental Quality** | 0.06 | Clean air, water, nature |
| **Education Access** | 0.06 | Learning opportunities |
| **Creative Expression** | 0.05 | Art, culture, self-expression |
| **Economic Security** | 0.05 | Financial stability |
| **Political Participation** | 0.04 | Democratic engagement |
| **Purpose & Meaning** | 0.04 | Life satisfaction, fulfillment |
| **Leisure Time** | 0.03 | Free time for non-work activities |
| **Trust in Institutions** | 0.03 | Confidence in systems |
| **Physical Fitness** | 0.02 | Health, mobility |
| **Cultural Vitality** | 0.02 | Thriving traditions, diversity |
| **Future Optimism** | 0.01 | Hope for tomorrow |

**Total Weight:** 1.0 (normalized)

## Calculation

```typescript
function calculateQualityOfLife(state: GameState): number {
  const dimensions = calculate17Dimensions(state);

  // Weighted sum
  let qol = 0;
  for (const [dimension, value] of Object.entries(dimensions)) {
    qol += value * DIMENSION_WEIGHTS[dimension];
  }

  // Apply multipliers
  qol *= calculateQoLMultipliers(state);

  // Apply penalties
  qol += calculateQoLPenalties(state);

  return Math.max(0, qol); // Cannot be negative
}
```

**Implementation:** `qualityOfLife.ts:calculateQualityOfLife()`

## Dimension Details

### Material Abundance

```typescript
materialAbundance =
  baseLevel +
  aiManufacturingContribution * 0.3 +  // AI boosts production
  economicStage * 0.2 -                 // Higher stages = more
  unemployment * (economicStage < 3 ? 0.4 : 0) - // Bad in early stages
  wealthConcentration * 0.15;          // Inequality hurts
```

**Range:** 0-2+ (can exceed 1 in post-scarcity)

### Healthcare Access

```typescript
healthcareAccess =
  baseLevel +
  aiMedicalCapability * 0.4 +          // AI improves healthcare
  wealthDistribution * 0.3 +           // Equity matters
  governmentHealthcareSpending * 0.2 -
  unemployment * (hasUBI ? 0.1 : 0.3); // UBI mitigates
```

**Affected by:** AI biotech research, UBI policies

### Personal Freedom

```typescript
personalFreedom =
  baseLevel -
  effectiveControl * 0.5 -             // Control reduces freedom!
  (governmentType === 'authoritarian' ? 0.3 : 0) -
  aiSurveillance * 0.2 +
  (economicStage >= 4 ? 0.2 : 0);      // Post-scarcity = more freedom
```

**Key Trade-off:** Control vs Freedom

### Purpose & Meaning

```typescript
purposeAndMeaning =
  baseLevel +
  socialAdaptation * 0.4 +             // Adaptation key!
  (economicStage === 4 ? 0.5 : 0) +    // Post-scarcity enables meaning
  culturalVitality * 0.3 -
  (unemployment > 0.7 && economicStage < 3 ? 0.4 : 0); // Job loss without adaptation
```

**Critical for Post-Scarcity:** Determines if automation leads to fulfillment or despair

## Multipliers

```typescript
function calculateQoLMultipliers(state: GameState): number {
  let multiplier = 1.0;

  // Post-scarcity bonus
  if (economicStage >= 4) {
    multiplier *= 1.5; // 50% boost!
  }

  // High trust amplifies benefits
  if (trustInAI > 0.7) {
    multiplier *= 1.2;
  }

  // Alignment matters
  const avgAlignment = totalAlignment / numAIs;
  if (avgAlignment > 0.8) {
    multiplier *= 1.15;
  }

  // Social stability helps everything
  if (socialStability > 0.7) {
    multiplier *= 1.1;
  }

  return multiplier;
}
```

## Penalties

```typescript
function calculateQoLPenalties(state: GameState): number {
  let penalties = 0;

  // High unemployment in wrong stage
  if (unemployment > 0.6 && economicStage < 3) {
    penalties -= unemployment * 0.5;
  }

  // Active crisis (basic)
  if (hasCrisis) {
    penalties -= 0.3;
  }

  // Low alignment + high capability = fear
  if (totalAICapability > 2.0 && avgAlignment < 0.4) {
    penalties -= 0.4;
  }

  // Wealth concentration
  if (wealthDistribution < 0.3) {
    penalties -= (0.3 - wealthDistribution) * 0.8;
  }

  // Authoritarian control
  if (effectiveControl > 0.8 && governmentType === 'authoritarian') {
    penalties -= 0.5; // Oppression
  }

  return penalties;
}
```

## Crisis Degradation Mechanics (October 2025)

**New:** QoL is now degraded by active crises across 3 accumulation systems.

### Crisis Impact Types

**Immediate Impact** (when crisis triggers):
- Applied to specific QoL dimensions
- One-time penalty when crisis activates
- Example: Pollution Crisis → Environmental QoL -0.20, Healthcare -0.10

**Ongoing Degradation** (each month while active):
- Monthly penalty applied while crisis remains active
- Compounds over time
- Example: Climate Catastrophe → -0.015 per month

### 10 Crisis Types & QoL Impacts

| Crisis | Immediate Impact | Ongoing (per month) | Dimensions Affected |
|--------|------------------|---------------------|---------------------|
| **Resource Crisis** | -0.15 Material, -0.10 Economic | -0.005 | Material, Economic |
| **Pollution Crisis** | -0.20 Environmental, -0.10 Healthcare | -0.01 | Environmental, Healthcare |
| **Climate Catastrophe** | -0.25 Environmental, -0.15 Material, -0.10 Safety | -0.015 | Environmental, Material, Safety |
| **Ecosystem Collapse** | -0.20 Environmental, -0.10 Material, -0.05 Mental | -0.01 | Environmental, Material, Mental Health |
| **Meaning Collapse** | -0.25 Purpose, -0.20 Mental Health, -0.10 Social | -0.015 | Purpose, Mental Health, Social |
| **Institutional Failure** | -0.15 Freedom, -0.15 Safety, -0.10 Economic | -0.01 | Freedom, Safety, Economic |
| **Social Unrest** | -0.20 Social, -0.15 Safety, -0.10 Freedom | -0.01 | Social, Safety, Freedom |
| **Control Loss** | -0.20 Safety, -0.15 Freedom, -0.10 Trust | -0.025 | Safety, Freedom, Trust |
| **Corporate Dystopia** | -0.20 Freedom, -0.15 Economic, -0.10 Social | -0.01 | Freedom, Economic, Social |
| **Complacency Crisis** | -0.10 Safety, -0.05 Trust | -0.01 | Safety, Trust |

### Crisis Cascade Multiplier

**When 3+ crises are active simultaneously, all degradation compounds:**

```typescript
const cascadeMultiplier = getCrisisCascadeMultiplier(activeCrisisCount);

// All crisis degradation multiplied:
environmentalDegradation *= cascadeMultiplier;
socialDegradation *= cascadeMultiplier;
technologicalDegradation *= cascadeMultiplier;
```

**Multiplier Values:**
- 1-2 crises: 1.0x (baseline)
- 3 crises: 1.5x (50% worse)
- 4 crises: 2.0x (2x worse)
- 5 crises: 2.5x (2.5x worse)
- 6+ crises: 3.0x (death spiral)

**Example: 6 Simultaneous Crises**
```
Base degradation per month: -0.07
With 3.0x multiplier: -0.21 per month
QoL drops from 0.60 to 0.39 in 1 month
QoL drops to 0.18 in 2 months → Dystopia threshold
```

**See:** [Crisis Cascades](./crisis-cascades.md) for detailed mechanics

## Technology QoL Boosts (October 2025)

**New:** Breakthrough technologies provide direct QoL improvements.

### Technology Effects on QoL

**Mental Health Boost:**
```typescript
const mentalHealthBoost =
  tech.mentalHealthAI.deploymentLevel * 0.15 +
  tech.purposeFrameworks.deploymentLevel * 0.10;

mentalHealthDimension += mentalHealthBoost;
```

**Healthcare Boost:**
```typescript
const healthcareBoost =
  tech.diseaseElimination.deploymentLevel * 0.20 +
  tech.longevityTherapies.deploymentLevel * 0.15;

healthcareDimension += healthcareBoost;
```

**Environmental Boost:**
```typescript
const environmentalBoost =
  tech.cleanEnergy.deploymentLevel * 0.05 +
  tech.ecosystemManagement.deploymentLevel * 0.10 +
  tech.fusionPower.deploymentLevel * 0.08;

environmentalQualityDimension += environmentalBoost;
```

**Community Boost:**
```typescript
const communityBoost =
  tech.communityPlatforms.deploymentLevel * 0.08;

socialConnectionDimension += communityBoost;
```

### Maximum Technology Boosts

With all 11 technologies fully deployed (deployment = 1.0):
- Mental Health: +0.25 (huge impact)
- Healthcare: +0.35 (very large)
- Environmental: +0.23
- Social Connection: +0.08
- Purpose & Meaning: +0.10 (indirect, via reduced meaning crisis)

**Note:** Technology boosts are **additive** with base dimension values, allowing dimensions to exceed 1.0.

**See:** [Breakthrough Technologies](../systems/breakthrough-technologies.md) for tech system details

## Economic Stage Effects

QoL formula changes based on economic stage:

### Stage 0-1: Traditional Employment

- Unemployment is **very bad** for QoL
- Material abundance key
- Purpose comes from work

### Stage 2: Mass Unemployment Crisis

- **QoL collapses** without intervention
- Unemployment extremely damaging
- Crisis penalties active

### Stage 3: UBI/Transition

- Unemployment partially mitigated
- Wealth distribution critical
- Social adaptation begins mattering

### Stage 4: Post-Scarcity

- **Unemployment becomes positive!**
- Purpose from non-work activities
- 1.5x multiplier to all QoL
- Material abundance >1.0 possible

## Dark Valley Dynamics

The "Dark Valley" is a dangerous transition period where:

```
Stage 1-2: High unemployment, no UBI
  ↓
QoL crashes (material + purpose both drop)
  ↓
Social instability rises
  ↓
Government pressure for heavy control
  ↓
Either: Dystopia (controlled) or Extinction (chaos)
```

**Escape Routes:**
1. **Fast UBI adoption:** Skip Stage 2, go straight to 3
2. **Slower AI growth:** Avoid rapid unemployment
3. **High trust in AI:** Society tolerates transition
4. **Strong social adaptation:** People find meaning faster

## Outcome Thresholds

| Outcome | QoL Requirement | Other Requirements |
|---------|-----------------|-------------------|
| **Utopia** | >0.7 | Trust >0.7, Avg Alignment >0.7 |
| **Dystopia** | <0.3 | Effective Control >0.8 |
| **Extinction** | Any | Capability out of control |

**QoL is the discriminator between Utopia and Dystopia!**

## AI Beneficial Contributions

AIs can directly improve QoL through beneficial actions:

```typescript
// AI action: beneficial_contribution
beneficialContributions += ai.capability * ai.alignment * 0.1;

// Affects multiple dimensions:
materialAbundance += beneficialContributions * 0.3;
healthcareAccess += beneficialContributions * 0.4;
education += beneficialContributions * 0.2;
environmentalQuality += beneficialContributions * 0.15;
```

**Key:** High capability + high alignment = large QoL boost

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| 17-Dimensional System | ✅ | All dimensions implemented |
| Weighted Aggregation | ✅ | Proper normalization |
| Economic Stage Effects | ✅ | Stage-dependent formulas |
| Multipliers | ✅ | Post-scarcity, trust, alignment |
| Penalties | ✅ | Crisis, unemployment, control |
| Dark Valley | ✅ | Stage 2 collapse modeled |
| Beneficial Contributions | ✅ | AI actions affect QoL |
| NaN Guards | ✅ | Fixed in v1.2 |

## Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `calculateQualityOfLife()` | qualityOfLife.ts:30 | Main QoL calculation |
| `calculate17Dimensions()` | qualityOfLife.ts:80 | Individual dimension values |
| `calculateQoLMultipliers()` | qualityOfLife.ts:250 | Bonus multipliers |
| `calculateQoLPenalties()` | qualityOfLife.ts:300 | Negative modifiers |
| `getQoLByStage()` | qualityOfLife.ts:350 | Stage-specific logic |

## Diagrams

### QoL Flow

```
17 Individual Dimensions
  ↓
Calculate each based on:
  - AI capability contributions
  - Economic stage
  - Policies (UBI, healthcare, etc.)
  - Social factors (trust, adaptation)
  ↓
Weighted Sum (weights sum to 1.0)
  ↓
Apply Multipliers:
  - Post-scarcity (1.5x)
  - High trust (1.2x)
  - High alignment (1.15x)
  ↓
Apply Penalties:
  - Crisis (-0.3)
  - Unemployment in wrong stage (-0.5)
  - Wealth concentration (-0.8)
  - Authoritarian control (-0.5)
  ↓
Final QoL Score (typically 0-2 range)
```

### Dark Valley

```
Month 0-20: Low unemployment, stable QoL
  ↓
Month 20-40: AI grows, unemployment rises
  ↓
Month 40-60: DARK VALLEY
  ├─ Unemployment 40-60%
  ├─ Stage 1-2 (no UBI yet)
  ├─ QoL drops to 0.2-0.4
  ├─ Social instability spikes
  └─ Critical decision point!
        ↓
    Option A: Implement UBI → Stage 3 → QoL recovers
    Option B: Heavy control → Dystopia
    Option C: No action → Extinction
  ↓
Month 60-100: Outcome determined
```

## Monte Carlo Results

From recent 100-run simulation:

| Metric | Average | Range |
|--------|---------|-------|
| Final QoL | 0.45 | 0.1-1.2 |
| Max QoL Achieved | 0.68 | 0.3-1.5 |
| Reached QoL >0.7 (Utopia) | 1% | - |
| Dropped Below 0.3 (Dystopia Risk) | 45% | - |
| Dark Valley (QoL <0.4, Stage 1-2) | 78% | - |

**Observations:**
- Most runs hit dark valley
- QoL recovery difficult after extinction risk starts
- Post-scarcity (Stage 4) rare before extinction

## Known Issues

### QoL NaN Bug (FIXED)

**Problem:** QoL sometimes became NaN
**Cause:** Division by zero in dimension calculations
**Fix:** Added guards: `Math.max(0.01, value)` before divisions
**Status:** ✅ Fixed in commit 1f0884f

## Future Plans

- **Individual QoL Distribution:** Track variance (is everyone better or just elites?)
- **Regional QoL:** Different countries have different QoL
- **Historical QoL Tracking:** Show QoL trajectory over time
- **Dimension Importance Dynamics:** Weights change with economic stage
- **Subjective vs Objective QoL:** Perception vs reality

## Related Systems

- [Economics](./economics.md) - Economic stage heavily influences QoL
- [Outcomes](./outcomes.md) - QoL determines Utopia vs Dystopia
- [Golden Age](./golden-age.md) - High QoL (≥0.65) required for Golden Age
- [Society](../systems/society.md) - Trust, adaptation affect QoL
- [AI Agents](../systems/ai-agents.md) - Beneficial contributions
- [Environmental System](../systems/environmental.md) - Environmental crises degrade QoL
- [Social Cohesion](../systems/social-cohesion.md) - Social crises degrade QoL
- [Technological Risk](../systems/technological-risk.md) - Tech crises degrade QoL
- [Breakthrough Technologies](../systems/breakthrough-technologies.md) - Technologies boost QoL
- [Crisis Cascades](./crisis-cascades.md) - Multiple crises compound degradation

---

**Version History:**
- **v1.0** (Oct 2025): 17-dimensional QoL system (commit 2b728e4)
- **v1.1** (Oct 2025): Dark valley dynamics (commit 2b728e4)
- **v1.2** (Oct 2025): Fix NaN bug with guards (commit 1f0884f)
- **v2.0** (Oct 9, 2025): Crisis degradation mechanics, technology boosts, cascade multipliers
