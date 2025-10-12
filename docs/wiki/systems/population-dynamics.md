# Population Dynamics System (TIER 1.5)

**Status**: ✅ Implemented and Merged to Main (October 2025)

## Overview

The Population Dynamics System provides concrete population tracking with differential fertility rates, regional dynamics, and crisis-driven mortality. It replaces abstract population metrics with realistic demographic modeling based on UN data and demographic transition theory.

## Core Features

### 1. Global Population Tracking

**File**: `src/simulation/populationDynamics.ts`

Tracks humanity's population in billions with concrete numbers:

```typescript
interface HumanPopulationSystem {
  population: number;                    // Current population (billions)
  peakPopulation: number;                // Highest population reached
  baselineBirthRate: number;             // Natural birth rate per year
  baselineDeathRate: number;             // Natural death rate per year
  adjustedBirthRate: number;             // After modifiers
  adjustedDeathRate: number;             // After modifiers
  netGrowthRate: number;                 // Current growth rate
  carryingCapacity: number;              // Max sustainable population
  monthlyExcessDeaths: number;           // Crisis deaths this month
  cumulativeCrisisDeaths: number;        // Total crisis deaths (billions)

  // Death tracking by category
  deathsByCategory: {
    war: number;                         // War, nuclear conflict
    famine: number;                      // Food/water scarcity
    climate: number;                     // Climate disasters
    disease: number;                     // Pandemics, healthcare collapse
    ecosystem: number;                   // Ecosystem collapse
    pollution: number;                   // Toxic environment
    ai: number;                          // AI-caused deaths
    other: number;                       // Other catastrophes
  };
}
```

**2025 Baseline**:
- Population: 8.0B
- Birth rate: 1.8% per year
- Death rate: 0.75% per year
- Net growth: 1.05% per year
- Carrying capacity: 10.0B (degrades with environmental collapse)

### 2. Differential Fertility Rates

**Research Basis**:
- UN World Population Prospects 2024
- Demographic transition theory
- Healthcare-fertility inverse relationship

**Inverse Healthcare-Fertility Relationship**:

Poor healthcare → MORE children (compensate for high child mortality):
```typescript
// Sub-Saharan Africa (healthcare: 0.3)
fertility = 2.3 * 2.0 = 4.6 children/woman
```

Good healthcare → FEWER children (family planning, career focus):
```typescript
// East Asia (healthcare: 0.85)
fertility = 2.3 * 0.4 = 0.92 children/woman (South Korea effect)
```

**Economic Development Effect**:
- Stage 0-1: No effect (traditional societies)
- Stage 2-3: -20% to -40% (urbanization, industrialization)
- Stage 4: -50% to -70% (post-industrial, career focus, high cost of living)

**Formula**:
```typescript
fertilityRate = 2.3 * // Global baseline
  healthcareFertilityModifier *      // 0.4-2.0x (dominant factor)
  developmentModifier *              // 0.3-1.0x (secondary)
  meaningModifier *                  // 0.5-1.0x (existential crisis)
  abundanceModifier;                 // 0.7-1.0x (economic stress)
```

### 3. Regional Population System (Phase 5)

**File**: `src/simulation/regionalPopulations.ts`

Tracks 7 major world regions with independent demographics:

**1. Sub-Saharan Africa** (1.2B, HIGH GROWTH)
- Fertility: 4.5 children/woman
- Healthcare: 0.3 (poor)
- Growth: +2.3% per year
- Vulnerabilities: Climate (0.7), Resources (0.6), Conflict (0.5)

**2. East Asia** (1.7B, DECLINING)
- Fertility: 1.2 children/woman (South Korea: 0.72)
- Healthcare: 0.85 (excellent)
- Growth: +0.2% per year (nearly zero)
- Vulnerabilities: Resources (0.7), Climate (0.5)

**3. South Asia** (2.0B, MODERATE GROWTH)
- Fertility: 2.2 children/woman
- Healthcare: 0.5 (improving)
- Growth: +1.1% per year
- Vulnerabilities: Climate (0.8), Resources (0.7), Conflict (0.6)

**4. Europe** (750M, DECLINING)
- Fertility: 1.5 children/woman
- Healthcare: 0.9 (excellent)
- Growth: -0.1% per year (slight decline)
- Vulnerabilities: Resources (0.5), Climate (0.4)

**5. North America** (580M, STABLE)
- Fertility: 1.7 children/woman
- Healthcare: 0.8 (good)
- Growth: +0.3% per year (immigration compensates)
- Vulnerabilities: Climate (0.5), Resources (0.3)

**6. Latin America** (660M, SLOW GROWTH)
- Fertility: 2.0 children/woman
- Healthcare: 0.6 (moderate)
- Growth: +0.8% per year
- Vulnerabilities: Climate (0.6), Conflict (0.4)

**7. Middle East & North Africa** (530M, MODERATE GROWTH)
- Fertility: 2.8 children/woman
- Healthcare: 0.55 (variable)
- Growth: +1.6% per year (youth bulge)
- Vulnerabilities: Climate (0.9), Resources (0.8), Conflict (0.7)

**Regional Updates**:
- Birth rates vary by healthcare quality and economic stage
- Death rates affected by local crises and vulnerabilities
- Carrying capacity varies by region (100M to 2.5B)
- Crisis impacts distributed by vulnerability levels

### 4. Carrying Capacity Modeling

**Multiplicative Formula**:
```typescript
carryingCapacity = baseline *
  climateStability *           // Environmental collapse dominates
  resourceModifier *           // Food/water availability
  ecosystemModifier *          // Biodiversity health
  techModifier;                // Technology can help (1.0-3.3x)
```

**Realistic But Bleak**:
- With collapsed environment (0.3 × 0.3 = 0.09), even 3.3x tech only gets 1.5B capacity (from 10B)
- Technology cannot overcome environmental devastation
- This creates realistic "Collapse with High QoL" scenarios

**Overshoot Deaths**:
When population exceeds carrying capacity:
```typescript
overshoot = population - carryingCapacity;
overshootDeaths = overshoot * 0.05; // 5% of excess dies per month
```

### 5. Death Tracking by Category

**8 Death Categories** tracked for summary statistics:

1. **War**: Nuclear conflict, conventional war casualties
2. **Famine**: Food scarcity, agricultural collapse
3. **Climate**: Extreme weather, climate disasters
4. **Disease**: Pandemics, healthcare collapse
5. **Ecosystem**: Ecosystem collapse, biodiversity loss
6. **Pollution**: Toxic environment, chemical poisoning
7. **AI**: Alignment failure, AI-caused deaths
8. **Other**: Misc catastrophes, overshoot deaths

**Crisis Death Functions**:
```typescript
// Acute crisis (nuclear war, pandemic)
addAcuteCrisisDeaths(state, mortalityRate, reason, exposedFraction, category);

// Chronic crisis (famine, pollution)
addChronicCrisisDeaths(state, monthlyMortalityRate, reason, exposedFraction, category);
```

**Summary Output**:
```
=== DEATH SUMMARY BY CATEGORY ===
Total crisis deaths: 500.7M
Population decline: 6633.1M (82.9%)

Deaths by Category:
  War:        0.4M (0.1%)
  Famine:     0.0M (0.0%)
  Climate:    0.0M (0.0%)
  Disease:    0.0M (0.0%)
  Ecosystem:  103.6M (20.7%)
  Pollution:  0.0M (0.0%)
  AI:         0.0M (0.0%)
  Other:      396.7M (79.2%)
```

### 6. Population Outcomes

**Four Outcome Categories**:

1. **Thriving** (>7B, <10% decline)
   - "Humanity thrives at 7.72B people. Civilization flourishes."
   - Genetic diversity maintained
   - Civilization intact

2. **Recovering** (3B-7B, 10-62.5% decline)
   - "Humanity recovering at 4.23B people (47% decline). Rebuilding."
   - Some regional collapse
   - Infrastructure stressed but functional

3. **Collapsed** (500M-3B, 62.5-93.75% decline)
   - "Catastrophic collapse: Only 1.37B remain (83% loss). Dark ages likely."
   - Widespread infrastructure collapse
   - Genetic bottleneck risk

4. **Near Extinction** (<500M, >93.75% decline)
   - "Near extinction: Only 234M survivors (97% loss). Humanity on the brink."
   - Civilization collapse
   - Genetic bottleneck severe
   - Recovery uncertain

**Genetic Bottleneck Threshold**: 500M people

## Integration with Other Systems

### Environmental Systems
- **Climate stability** → affects carrying capacity and mortality
- **Resource depletion** → food/water stress increases death rates
- **Ecosystem collapse** → reduces carrying capacity dramatically
- **Pollution** → chronic mortality, healthcare burden

### Social Systems
- **Quality of Life** → affected by population pressure and crises
- **Meaning crisis** → reduces fertility (existential despair)
- **Social stability** → disrupted by refugee crises and overshoot deaths

### Economic Systems
- **Economic stage** → affects fertility rates (development effect)
- **UBI** → partially mitigates meaning crisis fertility decline
- **Resource economy** → food/water availability affects mortality

### Crisis Systems
- **Nuclear war** → massive acute mortality (war category)
- **Climate disasters** → regional mortality (climate category)
- **Ecosystem collapse** → carrying capacity reduction (ecosystem category)
- **Pandemics** → acute mortality (disease category)

## Phase Integration

**Phase 1: Basic Population Tracking**
- Global population in billions
- Birth/death rates
- Carrying capacity

**Phase 2: Crisis Mortality**
- Acute crisis deaths (instant impact)
- Chronic crisis deaths (ongoing mortality)
- Integration with extinction system

**Phase 3: Quality of Life Effects**
- Population pressure affects QoL
- Overcrowding penalties
- Collapse scenarios

**Phase 4: Outcome Metrics**
- Four-tier outcome system
- Genetic bottleneck tracking
- Civilization viability assessment

**Phase 5: Regional Populations**
- 7 major world regions
- Independent demographics
- Differential growth/decline rates

## Research Sources

1. **UN World Population Prospects 2024**
   - Regional population data
   - Fertility rate trends
   - Demographic projections

2. **Demographic Transition Theory**
   - Healthcare-fertility inverse relationship
   - Economic development effects
   - Urbanization impacts

3. **UNHCR Refugee Statistics**
   - Displacement patterns (see refugee-crises.md)
   - Transit mortality rates
   - Resettlement timelines

4. **Carrying Capacity Research**
   - Environmental limits
   - Resource constraints
   - Technology amplification effects

## Files

**Core Implementation**:
- `src/simulation/populationDynamics.ts` - Global population system
- `src/simulation/regionalPopulations.ts` - Regional population tracking
- `src/simulation/refugeeCrises.ts` - Refugee displacement system

**Type Definitions**:
- `src/types/population.ts` - Population system types

**Phase Orchestration**:
- `src/simulation/engine/phases/HumanPopulationPhase.ts` - Population update phase
- `src/simulation/engine/phases/RefugeeCrisisPhase.ts` - Refugee crisis phase

**Testing**:
- `scripts/populationDynamicsMC.ts` - Monte Carlo population testing

## Configuration

**Global Population Params**:
```typescript
{
  baselineBirthRate: 0.018,     // 1.8% per year
  baselineDeathRate: 0.0075,    // 0.75% per year
  baselineCarryingCapacity: 10.0, // 10B people
}
```

**Regional Variation**:
- Healthcare quality: 0.3 (poor) to 0.9 (excellent)
- Economic stage: 0 (traditional) to 4 (post-industrial)
- Vulnerability levels: 0.1 (low) to 0.9 (extreme)

**Crisis Thresholds**:
- Overshoot mortality: 5% of excess per month
- Genetic bottleneck: 500M people
- Collapse threshold: 3B people (62.5% loss)

## Known Behaviors

**"Realistic But Bleak"**:
- Carrying capacity drops dramatically with environmental collapse
- Technology can't overcome fundamental environmental limits
- High QoL can coexist with population collapse

**Differential Fertility**:
- Poor healthcare → high fertility (Sub-Saharan Africa: 4.5)
- Excellent healthcare → low fertility (East Asia: 1.2)
- Economic development compounds effect (Stage 4: -50%)

**Regional Dynamics**:
- Some regions grow while others decline
- Climate vulnerability creates regional collapse patterns
- Resource dependence creates cascading crises

**Death Distribution**:
- "Other" category often dominates (overshoot deaths)
- Ecosystem collapse causes slow, grinding mortality
- Acute crises (war, pandemic) spike specific categories

## Future Enhancements

**Potential Additions**:
- Migration flows between regions (beyond refugee crises)
- Age structure tracking (youth bulge, aging societies)
- Urbanization dynamics (rural-urban migration)
- Healthcare capacity modeling (beds, doctors, equipment)
- Fertility policy interventions (one-child policy, pro-natalism)

**Not Yet Implemented**:
- Internal regional migration (only cross-border refugee crises)
- Age cohorts (only median age tracked)
- Sub-regional variation (e.g., North vs South China)
- City-specific population tracking

## See Also

- [Refugee Crises System](refugee-crises.md) - Displacement mechanics
- [Environmental System](environmental.md) - Climate and ecosystem impacts
- [Resource Economy](resource-economy.md) - Food and water constraints
- [Quality of Life System](quality-of-life.md) - Population pressure effects
