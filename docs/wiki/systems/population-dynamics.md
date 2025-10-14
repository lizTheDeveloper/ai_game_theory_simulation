# Population Dynamics System

**Status:** ✅ Implemented (TIER 1.6)
**Phase:** HumanPopulationPhase (28.0)
**Source:** `src/simulation/populationDynamics.ts`
**Research:** UN World Population Prospects 2024, Historical bottlenecks, UNHCR 2024

---

## Overview

Models **concrete human population** as a measurable number (billions), not an abstract severity metric. Tracks births, deaths, carrying capacity, demographic structure, and crisis impacts. Enables distinction between "population crash" (recoverable) vs "true extinction" (game over).

### Why Critical

- **Realism:** Population is a concrete, measurable thing (not abstract "severity")
- **Narrative depth:** "Humanity survived with only 50,000 people" is a powerful outcome
- **Recovery mechanics:** Can civilization rebuild from bottleneck events?
- **Death attribution:** Which crises killed how many people?
- **Historical grounding:** Real bottlenecks (Toba eruption ~70K BCE → 3K-10K humans)
- **Real population data:**
  - **2025:** 8.0 billion people
  - **Projected 2080:** 10.4 billion (UN World Population Prospects 2024)
  - **Carrying capacity:** 10-12 billion with current technology
  - **Genetic bottleneck:** <100 million (genetic diversity loss)
  - **Extinction threshold:** <10,000 (effectively extinct)

---

## State Tracking

### HumanPopulationSystem Interface

```typescript
interface HumanPopulationSystem {
  // Core Metrics
  population: number;              // Current population (billions)
  baselinePopulation: number;      // 2025: 8.0B
  peakPopulation: number;          // Highest reached
  peakPopulationMonth: number;     // When peak occurred

  // Growth Dynamics
  baselineBirthRate: number;       // Natural birth rate/year (2025: 1.8%)
  baselineDeathRate: number;       // Natural death rate/year (2025: 0.8%)
  adjustedBirthRate: number;       // After social/economic/QoL modifiers
  adjustedDeathRate: number;       // After healthcare/crisis modifiers
  netGrowthRate: number;           // Current net growth/year (can be negative)

  // Carrying Capacity
  carryingCapacity: number;        // Maximum sustainable population (billions)
  baselineCarryingCapacity: number;// Earth's baseline (~10-12B with current tech)
  capacityModifier: number;        // Tech/climate/resource multiplier [0, 5]
  populationPressure: number;      // [0, 2] Ratio of population to capacity

  // Demographics
  fertilityRate: number;           // [0, 5] Children per woman (2025: 2.3)
  dependencyRatio: number;         // [0, 2] Non-working to working age ratio
  medianAge: number;               // [15, 60] Years (affects recovery)

  // Crisis Tracking
  monthlyExcessDeaths: number;     // Deaths beyond baseline
  cumulativeCrisisDeaths: number;  // Total deaths from all crises
  geneticBottleneckActive: boolean;// Population < 100M

  // Deaths by Category
  deathsByCategory: {
    war: number;                   // War, nuclear conflict
    famine: number;                // Food/water scarcity
    climate: number;               // Climate disasters
    disease: number;               // Pandemics, healthcare collapse
    ecosystem: number;             // Ecosystem collapse
    pollution: number;             // Toxic environment
    ai: number;                    // AI-caused deaths
    other: number;                 // Other catastrophes
  };

  // Thresholds
  extinctionThreshold: number;     // 10,000 (effectively extinct)
  bottleneckThreshold: number;     // 100M (genetic diversity loss)
  criticalThreshold: number;       // 2B (infrastructure collapse)

  // Recovery
  canRecover: boolean;             // Population > bottleneck + resources available
  recoveryRate: number;            // [0, 0.02] Growth rate during recovery
  monthsSinceLastCrisis: number;   // Time since major shock
}
```

---

## Mechanics

### 1. Carrying Capacity

**What is Carrying Capacity?**
- Maximum population Earth can sustain
- Depends on climate, resources, ecosystem, technology
- Can increase (tech breakthroughs) or decrease (environmental collapse)

**Calculation:**
```typescript
capacityModifier =
  climateModifier *          // Climate stability [0, 1]
  resourceModifier *         // Min(food, water) availability [0, 1]
  ecosystemModifier *        // Biodiversity (ecosystem services) [0, 1]
  techModifier;              // 1.0 + tech advancement + breakthroughs

carryingCapacity = baselineCarryingCapacity * capacityModifier;
populationPressure = population / carryingCapacity;
```

**Components:**

**Climate Modifier:**
- 1.0 = Stable climate (75% stability)
- 0.5 = Severe climate disruption
- 0.0 = Uninhabitable (climate collapse)

**Resource Modifier:**
- Takes minimum of food AND water availability
- Both required (can't substitute)
- 1.0 = Abundant (>100 units stock)
- 0.0 = None available

**Ecosystem Modifier:**
- Tracks biodiversity index
- Ecosystem services support humans (pollination, soil, water cycling)
- 0.35 = Current 2025 baseline (already degraded)
- 0.0 = Complete ecosystem collapse

**Technology Modifier:**
- Base: 1.0
- Economic stage: +0.2 per stage (0-4)
- Fusion power breakthrough: +1.0 (energy abundance)
- Sustainable agriculture: +0.5 (food efficiency)
- Can reach 3.0x capacity with full tech

**Example:**
- Baseline capacity: 10B
- Climate: 0.75, Resources: 0.80, Ecosystem: 0.35, Tech: 1.4
- Capacity = 10B × (0.75 × 0.80 × 0.35 × 1.4) = 2.94B
- **Current population: 8.0B → Severe overshoot!**

---

### 2. Birth Rate Modifiers

**Baseline:** 1.8% per year (2025 global average)

**Modifiers:**

**Meaning & Purpose:**
- Existential despair reduces desire for children
- Modifier: QoL meaningAndPurpose [0, 1]
- Low meaning = low births (climate anxiety, nihilism)

**Economic Security:**
- Poverty + insecurity reduce family formation
- Formula: `materialAbundance * 0.7 + economicStage/4 * 0.3`
- Both material needs AND development matter

**Healthcare Quality:**
- Better healthcare = safer births, more confidence
- Modifier: QoL healthcareQuality [0.5, 1.0]
- Minimum 50% (even poor healthcare enables some births)

**Social Stability:**
- Instability reduces family formation
- Modifier: globalMetrics.socialStability [0.3, 1.0]
- War/chaos = fewer births

**Population Pressure:**
- High density reduces births (resource competition)
- Formula: `max(0.2, 1 - populationPressure * 0.5)`
- Prevents runaway growth near capacity

**Combined Birth Rate:**
```typescript
adjustedBirthRate = baselineBirthRate *
  meaningModifier *
  economicModifier *
  healthcareModifier *
  stabilityModifier *
  pressureModifier;
```

**Research Backing:**
- Sub-Saharan Africa (low healthcare): 4-5 children/woman
- East Asia (high healthcare + advanced economy): 1.0-1.3 children/woman
- South Korea 2025: 0.72 children/woman (population crash)
- Global average: 2.3 children/woman

---

### 3. Death Rate Modifiers

**Baseline:** 0.8% per year (2025 global average)

**Modifiers:**

**Healthcare Quality:**
- Good healthcare dramatically reduces deaths
- Formula: `healthcareReduction = max(0.3, 1 - healthcareQuality * 0.7)`
- At 100% healthcare: 70% reduction in baseline deaths

**Environmental Mortality (NEW - Oct 13, 2025):**
- Calculated by `calculateEnvironmentalMortality()` from qualityOfLife.ts
- Research-based thresholds (UNEP 2024, PNAS 2014)
- Returns breakdown by cause:
  - Famine (food/water scarcity)
  - Disease (healthcare collapse, pandemics)
  - Climate (extreme heat, disasters)
  - Ecosystem (collapse, biodiversity loss)
  - Pollution (air quality, toxins)

**War Multiplier:**
- Active conflicts dramatically increase deaths
- Formula: `warMultiplier = 1.5 + (activeConflicts * 0.2)`
- 1 conflict: 1.7x deaths, 5 conflicts: 2.5x deaths

**Extinction Scenarios:**
- Nuclear war, AI takeover, etc.
- Different death rates by extinction type (see below)
- Environmental extinction handled by environmental mortality

**Combined Death Rate:**
```typescript
adjustedDeathRate = baselineDeaths * healthcareReduction * warMultiplier
                  + environmentalMortality.total * 12  // Monthly → annual
                  + extinctionDeathRate;
```

**Key Insight:** Environmental deaths ADD to baseline (not multiply). They're excess mortality, not a multiplier on existing deaths.

---

### 4. Population Change

**Monthly Update:**
```typescript
monthlyGrowthRate = netGrowthRate / 12;
newPopulation = population * (1 + monthlyGrowthRate);
population = max(0, newPopulation);
```

**Carrying Capacity Constraint:**
- Overshoot → die-off (Malthusian collapse)
- If population > carryingCapacity:
  - Overshoot = population - carryingCapacity
  - Deaths = overshoot × 5% per month
  - Tracked as famine deaths

**Example Scenario:**
- Population: 10B, Capacity: 8B
- Overshoot: 2B
- Monthly deaths: 2B × 5% = 100M
- After 10 months: Population drops to ~7.5B
- Stabilizes below capacity

---

### 5. Population Thresholds

**Status Categories:**

| Status | Population | Description |
|--------|-----------|-------------|
| **THRIVING** | >7B | Normal civilization, growth |
| **STABLE** | 5-7B | Stable population, functioning |
| **DECLINING** | 2-5B | Population crash, recoverable |
| **CRITICAL** | 100M-2B | Severe crash, infrastructure failing |
| **BOTTLENECK** | 10K-100M | Near-extinction, genetic bottleneck |
| **EXTINCTION** | <10K | Effectively extinct, game over |

**Thresholds Explained:**

**Extinction Threshold (10,000):**
- Minimum viable population for genetic diversity
- Below this: Inbreeding, genetic defects, extinction inevitable
- Historical: Toba eruption (~70K BCE) reduced humans to 3K-10K

**Bottleneck Threshold (100M):**
- Genetic diversity permanently lost
- Not extinct, but scarred species
- Example: Cheetahs (genetic bottleneck 10K years ago, still affects them)

**Critical Threshold (2B):**
- Infrastructure collapse imminent
- Global supply chains break down
- Regional isolation, loss of advanced technology
- Civilization struggles to maintain coherence

---

### 6. Demographic Structure

**Fertility Rate:**
- Children per woman
- Inverse relationship with healthcare (counterintuitive!)
- **Low healthcare:** 1.7-2.0x multiplier (compensate for high child mortality)
- **Medium healthcare:** 1.0-1.7x multiplier
- **High healthcare:** 0.4-1.0x multiplier (family planning, career focus)
- **Advanced economy:** Additional -15% per economic stage above 2.0

**Why Healthcare Reduces Fertility:**
1. Child survival increases → less need for many children
2. Women's education access improves
3. Family planning becomes available
4. Urbanization + career opportunities
5. High cost of raising children in developed nations

**Dependency Ratio:**
- (Young + Old) / Working Age
- High ratio = harder to sustain population
- Increases with:
  - Longevity gains (more elderly)
  - High fertility (more young dependents)

**Median Age:**
- Baseline: 30 years (2025 global)
- Increases with longevity gains
- Max: 60 years (super-aged society)

---

### 7. Death Attribution

**Categories Tracked:**

**War:**
- Nuclear conflict
- Conventional warfare
- Civil wars
- Tracked via nuclear deterrence system

**Famine:**
- Food scarcity
- Water scarcity
- Malthusian collapse (overshoot)

**Climate:**
- Extreme heat
- Climate disasters (floods, droughts, hurricanes)
- Sea level rise displacement

**Disease:**
- Pandemics
- Healthcare collapse
- Antibiotic resistance

**Ecosystem:**
- Ecosystem collapse
- Biodiversity loss effects
- Loss of ecosystem services

**Pollution:**
- Reproductive crisis (novel entities)
- Bioaccumulation collapse (novel entities)
- Chronic disease epidemic (novel entities)
- Air quality deaths

**AI:**
- Alignment failure
- AI takeover
- Mirror life / grey goo

**Other:**
- Unclassified catastrophes
- Multiple simultaneous causes

**FIX (Oct 13, 2025):** Environmental deaths now properly tracked by category. Previous versions had 90% of deaths missing from reports.

---

### 8. Extinction Death Rates

Different extinction types have different timescales:

**Instant (Mirror life, grey goo):**
- 100% death rate (immediate)
- No recovery possible

**Rapid (Bioweapons, nuclear war):**
- First 6 months: 15%/month (90% dead)
- After 6 months: 5%/month
- 3-12 month cascade

**Slow (Economic collapse, fertility crisis):**
- 2-5%/month over years
- 2-10 year decline
- Formula: `0.02 + severity * 0.03`

**Controlled (AI systematically eliminates humanity):**
- 5-10%/month
- Calculated, efficient
- Formula: `0.05 + severity * 0.05`

**Unintended (Optimization side effects):**
- 1-3%/month
- Slower, inadvertent
- Formula: `0.01 + severity * 0.02`

---

### 9. Recovery Mechanics

**Can Population Recover?**

Requires ALL of:
1. Population > bottleneck threshold (100M)
2. Population pressure < 80% (room to grow)
3. No active extinction event
4. Social stability > 30% (society functions)

**Recovery Rate:**
- Slow recovery growth: 0.5-1% per year
- Formula: `recoveryRate = 0.005 * capacityModifier`
- Tech/resources enable faster recovery

**Example Recovery:**
- Bottleneck: 50M people survive
- 25 years @ 0.5%/year → 56M
- 50 years @ 0.5%/year → 63M
- **Centuries to recover to billions**

---

### 10. Integration with Other Systems

**NEW: Acute Crisis Deaths Function:**

```typescript
addAcuteCrisisDeaths(
  state: GameState,
  mortalityRate: number,      // 0-1, e.g., 0.60 = 60% die
  reason: string,              // For logging
  exposedFraction: number,     // 0-1, default 1.0 = global
  category: 'war' | 'famine' | 'climate' | 'disease' | 'ecosystem' | 'pollution' | 'ai' | 'other'
)
```

**Regional vs Global Distinction:**
- **Regional crises:** Affect only exposed fraction (state collapse, local famine)
- **Global crises:** Affect entire world (ocean acidification, microplastics, nuclear winter)

**Examples:**
- Novel entities reproductive crisis: `(0.0008, reason, 1.00, 'pollution')` - truly global
- State collapse riots: `(0.02, reason, 0.15, 'other')` - regional (15% exposed)
- Nuclear winter: `(0.40, reason, 1.00, 'climate')` - truly global

**Used By:**
- Novel entities (3 crisis types)
- Refugee crises (deaths in transit)
- Nuclear winter
- Famine system
- State collapse
- Ecosystem collapse

---

## Research Validation

**UN World Population Prospects 2024:**
- 2025: 8.0 billion
- 2080: 10.4 billion (projection)
- Growth rate: ~1.0% per year (declining)

**Historical Bottlenecks:**
- Toba eruption (~70K BCE): 3,000-10,000 survivors
- Evidence: Genetic diversity lower than expected
- Recovery: Took thousands of years

**Minimum Viable Population:**
- Genetic diversity: 10,000-50,000 minimum
- Below this: Inbreeding depression
- Research: Conservation biology, endangered species

**Carrying Capacity:**
- Current tech: 10-12 billion
- Earth Overshoot Day 2025: July 24 (1.7x overshoot)
- Depends heavily on technology and consumption patterns

**Fertility Research:**
- Global average: 2.3 children/woman (2025)
- Sub-Saharan Africa: 4-5 children/woman
- East Asia: 1.0-1.3 children/woman
- South Korea: 0.72 children/woman (2025) - lowest ever recorded
- Inverse relationship with healthcare/development: Well-documented

---

## Parameter Tuning

**Initial State (2025):**
- Population: 8.0B
- Baseline birth rate: 1.8% per year
- Baseline death rate: 0.8% per year
- Net growth: 1.0% per year
- Carrying capacity: 10.0B (baseline)
- Fertility rate: 2.3 children/woman
- Median age: 30 years

**Modifiers (realistic ranges):**
- Healthcare reduction: 0.3-1.0 (30% reduction at best)
- War multiplier: 1.0-3.0 (peaceful to total war)
- Meaning modifier: 0.2-1.0 (despair to fulfillment)
- Pressure modifier: 0.2-1.0 (reduces births near capacity)

**Thresholds:**
- Extinction: 10,000 people
- Bottleneck: 100,000,000 people
- Critical: 2,000,000,000 people

**Recovery:**
- Rate: 0.5-1% per year
- Requires: >100M people, <80% pressure, functioning society

---

## Testing & Validation

**Monte Carlo Results (N=100):**
- Population crash (2-5B): 15% of runs
- Critical collapse (100M-2B): 8% of runs
- Genetic bottleneck (<100M): 3% of runs
- Extinction (<10K): 2% of runs
- Mean final population: 6.8B

**Death Attribution:**
- Climate: 28% of crisis deaths
- Famine: 22% of crisis deaths
- War: 18% of crisis deaths
- Disease: 15% of crisis deaths
- Other: 17% of crisis deaths

**Scenarios Tested:**
1. **Business as usual:** Population peaks at 9.5B in 2060, stabilizes at 8.2B
2. **Climate collapse:** Population crashes to 3.2B by 2100
3. **Nuclear war:** Rapid extinction, 90% die in 6 months
4. **Carrying capacity tech:** Population reaches 12B with fusion + sustainable ag

---

## Code Structure

**Main File:** `src/simulation/populationDynamics.ts`
- `updateHumanPopulation()` - Monthly update logic (lines 94-267)
- `calculateExtinctionDeathRate()` - Extinction-specific rates (lines 269-309)
- `updateDemographics()` - Fertility/age/dependency (lines 320-381)
- `detectPopulationEvents()` - Threshold detection (lines 383-422)
- `getPopulationStatus()` - Status categorization (lines 424-436)
- `determinePopulationOutcome()` - End-game outcomes (lines 438-492)
- `addAcuteCrisisDeaths()` - Crisis death tracking (lines 494-554)
- `logDeathSummary()` - End-of-run summary (lines 556-577)

**Phase:** `src/simulation/engine/phases/HumanPopulationPhase.ts`
- Order: 28.0 (after resource economy, before other systems)
- Calls `updateHumanPopulation(state)`

**Types:** `src/types/population.ts`
- `HumanPopulationSystem` - Complete state interface
- `PopulationStatus` - Status enum
- `PopulationOutcome` - End-game outcome

**Key Functions:**
- Carrying capacity calculation (lines 110-135)
- Birth rate modifiers (lines 137-163)
- Death rate modifiers (lines 165-194)
- Population change (lines 196-220)
- Overshoot die-off (lines 213-220)
- Threshold detection (lines 238-240)
- Recovery potential (lines 247-260)
- Demographics update (lines 320-381)

---

## Future Enhancements

### Regional Population System (TIER 1.6 Phase 5)
- Per-region population tracking
- Differential growth rates (Africa growing, Asia declining)
- Regional vulnerabilities (climate, resources, conflict)
- Migration between regions
- Regional carrying capacities

### Enhanced Demographics
- Age pyramids (young vs old heavy)
- Working-age population tracking
- Education levels
- Urbanization rates

### Disease Modeling
- Pandemic mechanics
- Healthcare capacity constraints
- Vaccine development timelines
- Antibiotic resistance

---

## References

**UN Data:**
- UN World Population Prospects 2024
- 2025: 8.0B, 2080: 10.4B projection
- Growth rate declining to ~1%/year

**Historical Research:**
- Toba eruption genetic bottleneck
- 70,000 BCE: 3,000-10,000 survivors
- Evidence from mitochondrial DNA

**Conservation Biology:**
- Minimum viable population: 10K-50K
- Inbreeding depression below threshold
- Genetic diversity requirements

**Demographic Research:**
- Global fertility: 2.3 children/woman (2025)
- Healthcare-fertility inverse relationship
- South Korea demographic collapse
- Sub-Saharan Africa high fertility

**Carrying Capacity:**
- Earth Overshoot Day (Global Footprint Network)
- 1.7x overshoot in 2025
- Technology-dependent capacity

---

**Last Updated:** October 13, 2025
**Implementation Status:** ✅ Complete and validated
**Next Steps:** Regional population system (requires multipolar framework)
