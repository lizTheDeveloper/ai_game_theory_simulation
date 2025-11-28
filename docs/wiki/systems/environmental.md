# 🌍 Environmental Accumulation System

**Module:** `src/simulation/environmental.ts`
**Purpose:** Track hidden environmental degradation during prosperity periods
**Status:** ✅ Fully Implemented (October 2025)

## Overview

The Environmental Accumulation System tracks four metrics that slowly degrade during economic growth and AI development. These problems accumulate invisibly during "Golden Age" periods of high quality of life, eventually triggering crises that cascade into QoL collapse.

**Key Insight:** Immediate prosperity doesn't guarantee sustainability. Environmental problems build silently until they reach critical thresholds.

## Core Metrics

### 1. Resource Reserves (0-1)

**What it measures:** Remaining natural resources (minerals, fossil fuels, rare earths, etc.)

**Starts at:** 1.0 (abundant)

**Depletion drivers:**
- Economic production: `-0.002` per month baseline
- Stage 3+ acceleration: `-0.001` additional
- High production multiplier: up to `-0.003` total

**Mitigation:**
- Advanced Recycling tech: 30% efficiency (depletion rate × 0.7)
- Sustainable Agriculture: 15% efficiency
- Combined: Up to 55% reduction in depletion

**Regeneration (October 2025 Addition):**
- Sustainable Agriculture: +1% per month at full deployment
- Advanced Recycling: +2% per month (main driver)
- Clean Energy: +1.5% per month (renewable substitution)
- Ecosystem Management: +0.8% per month
- Interspecies Communication: +0.5% per month (habitat understanding)
- Combined: Up to +4.8% per month recovery rate

**Crisis trigger:** < 0.40 (40% reserves remaining)

**QoL impact when crisis active:**
- Material Abundance: -0.15 (scarcity returns)
- Economic Productivity: -0.10
- Ongoing: -0.005 per month (worsening shortage)

> ⚠️ **Known Issue (Nov 26, 2025):** `resourceReserves` can go negative in hindcast validation due to missing floor in `resourceDepletion.ts` line 612. Root cause identified, fix pending. See `reviews/resource_reserves_crash_root_cause_20251126.md`. CRITICAL-1 priority.

### 2. Pollution Level (0-1)

**What it measures:** Environmental contamination from industrial activity

**Starts at:** 0.1 (low baseline pollution)

**Accumulation drivers:**
- Energy usage: `+0.003` per month
- Stage 3+ industrial: `+0.002` additional
- Rapid growth: up to `+0.005` per month

**Mitigation:**
- Clean Energy Systems: -1.5% per month at full deployment
- Carbon Capture: -1% per month
- Combined: Can reverse pollution at -2.5%/month

**Crisis trigger:** > 0.70 (70% pollution)

**QoL impact when crisis active:**
- Environmental Quality: -0.20 (smog, contamination)
- Healthcare: -0.10 (respiratory illness)
- Ongoing: -0.01 per month (worsening health)

### 3. Climate Stability (0-1)

**What it measures:** Stability of global climate systems

**Starts at:** 0.9 (stable climate)

**Degradation drivers:**
- Rapid AI capability growth: `-0.002` per month
- High pollution: `-0.001` additional
- Industrial acceleration: up to `-0.003` total

**Restoration:**
- Carbon Capture: +2% per month at full deployment
- Ecosystem Management AI: +1.5% per month
- Fusion Power: +3% per month (ultimate solution)

**Crisis trigger:** < 0.30 (climate catastrophe)

**QoL impact when crisis active:**
- Environmental Quality: -0.25 (extreme weather)
- Material Abundance: -0.15 (crop failures)
- Safety: -0.10 (climate disasters)
- Ongoing: -0.015 per month (accelerating breakdown)

### 4. Biodiversity Index (0-1)

**What it measures:** Richness and health of ecosystems

**Starts at:** 0.85 (healthy ecosystems)

**Degradation drivers:**
- Pollution: `-biodiversity × pollution × 0.002`
- Low climate stability: `-0.001` when climate < 0.5
- Combined: up to `-0.003` per month

**Restoration:**
- Ecosystem Management AI: +2% per month (flagship tech)
- Sustainable Agriculture: +0.5% per month
- Combined: Strong recovery at +2.5%/month

**Crisis trigger:** < 0.40 (ecosystem collapse)

**QoL impact when crisis active:**
- Environmental Quality: -0.20 (species loss, habitat destruction)
- Material Abundance: -0.10 (ecosystem services lost)
- Mental Health: -0.05 (biophilia loss)
- Ongoing: -0.01 per month (cascading extinction)

## Crisis Types

### 1. Resource Crisis
**Trigger:** Resource reserves < 40%
**Condition:** `env.resourceCrisisActive = true`
**Resolution:** Reserves climb back > 60% (very difficult without tech)

**What happens:**
- Material scarcity returns even in Stage 4
- Industrial production constrained
- Social unrest increases (scarcity conflicts)

### 2. Pollution Crisis
**Trigger:** Pollution level > 70%
**Condition:** `env.pollutionCrisisActive = true`
**Resolution:** Pollution drops < 50% (requires Clean Energy + Recycling)

**What happens:**
- Air and water quality collapse
- Public health crisis
- Environmental regulations tighten (economic drag)

### 3. Multi-Timescale Climate Tipping Points (October 26, 2025)

**Module:** `src/simulation/engine/phases/TippingPointPhase.ts`
**Research Foundation:** Armstrong McKay et al. (2022) *Science*, Wunderling et al. (2024) *ESD*, IPCC AR6, 25+ peer-reviewed papers

**IMPORTANT CHANGE (Oct 26, 2025):** Replaced instant climate catastrophe with research-backed gradual tipping point transitions.

**Research Update (November 12, 2025):** Updated to Armstrong McKay et al. (2022) Science + Wunderling et al. (2024) ESD cascade analysis. Replaces 2007-2008 sources (Lenton, Scheffer).

**Key Findings from 2024-2025 Research:**
- **16 tipping elements identified** (up from 9 in 2008 Lenton review)
- **5 already at risk** at current 1.1°C warming (coral reefs, Greenland/WAIS ice sheets, Labrador Sea, permafrost)
- **Multi-timescale framework:** Fast (10-50yr), medium (50-200yr), slow (1000+yr)
- **Cascade interactions:** Wunderling (2024) - "cannot be ruled out" at 1.5-2.0°C, mostly destabilizing feedbacks

**Old Behavior (Removed):**
- Instant catastrophe when climateStability < 0.4
- Immediate 40-60% QoL drops
- 8B → 1.24B population crash in 4 months (physically impossible)

**Current Behavior (Research-Backed):**
- 6 major tipping elements with realistic timescales (10-15,000 years)
- Temperature-based threshold detection (1.5-2.3°C above pre-industrial)
- Sigmoid transition curves for smooth progression
- Cascade amplification when multiple elements active (15% per tipped element, Wunderling 2024)
- Regional variation in impacts

**Six Major Tipping Elements:**

| Element | Transition Duration | Threshold | Impact | Cascades |
|---------|-------------------|-----------|---------|----------|
| **Arctic Sea Ice Loss** | 10-30 years | climateStability < 0.65 | -0.10 climate (albedo feedback) | ❌ No |
| **Amazon Dieback** | 30-80 years | climateStability < 0.55 | -0.15 biodiversity, -0.08 climate | ✅ Yes |
| **AMOC Collapse** | 50-300 years | Temperature-dependent (see below) | -0.25 climate (Europe -40%) | ✅ Yes |
| **Permafrost Carbon** | 50-300 years | climateStability < 0.60 | -0.15 climate (carbon feedback) | ✅ Yes |
| **West Antarctic Ice** | 2,000-13,000 years | climateStability < 0.65 | -0.20 climate (coastal -50%) | ✅ Yes |
| **Greenland Ice Sheet** | 1,000-15,000 years | climateStability < 0.65 | -0.25 climate (coastal -60%) | ✅ Yes |

**Recent Updates:**
- **November 20, 2025:** AMOC collapse probability updated to temperature-dependent function (Bellomo et al. 2025, Westen et al. 2024). Replaces fixed 5% probability with research-backed scaling:
  - <+2°C: ~0.5% annual (extremely unlikely)
  - +2-2.2°C: ~1-5% annual (outlier tail risk)
  - +2.2-3°C: ~5-50% annual (rising risk)
  - +3-3.9°C: ~50-90% annual (high risk)
  - >+3.9°C: ~90% annual (very likely)
- **November 12, 2025:** Research sources updated to Armstrong McKay (2022) + Wunderling (2024)
- **November 6, 2025:** Arctic Sea Ice no longer cascades (Armstrong McKay 2022 - reversible), AMOC upper bound 150yr → 300yr, WAIS lower bound 500yr → 2,000yr, debug logging added

**AMOC Temperature-Dependent Collapse Probability:**

The Atlantic Meridional Overturning Circulation (AMOC) collapse probability is now modeled as a temperature-dependent function rather than a fixed threshold, based on Bellomo et al. Nature Communications (2025) and Westen et al. Science Advances (2024).

**Research Foundation:**
- Research file: `research/amoc_collapse_probability_20251120.md`
- Key finding: Collapse probability increases nonlinearly with temperature
- Implementation: `src/simulation/engine/phases/IrreversibilityTrackingPhase.ts`

**Probability Function:**
```
<+2°C:        0.5% annual (extremely unlikely)
+2-2.2°C:     1-5% annual (outlier tail risk - linear interpolation)
+2.2-3°C:     5-50% annual (rising risk - linear interpolation)
+3-3.9°C:     50-90% annual (high risk - linear interpolation)
>+3.9°C:      90% annual (very likely)
```

**Why This Matters:**
- Previous implementation used fixed 5% probability at +2-3°C
- New function captures research consensus: risk increases dramatically with temperature
- Allows for rare early collapse events (outliers) while maintaining consensus +4°C threshold
- More accurately reflects uncertainty in tipping point timing

**Research Documentation:**
- `research/climate_tipping_points_2024_update.md` (436 lines, comprehensive 2024-2025 review)
- `research/climate_tipping_timescales_20251106.md` (timescale parameters)
- `reviews/climate_timescale_critique_20251106.md` (critical evaluation)

**How It Works:**

1. **Threshold Detection:** Each element monitors climate stability (proxy for temperature)
2. **Transition Progress:** Once triggered, element transitions gradually over research-backed duration
3. **Sigmoid Curves:** S-curve progression (slow start → rapid middle → slow end)
4. **Cascade Amplification:** Multiple active tipping points amplify each other (only cascading elements)
5. **Regional Impacts:** Europe hit harder by AMOC, Latin America by Amazon, coastal regions by ice sheets

**Example Timeline:**
- **Month 12:** climateStability drops to 0.58 → AMOC tipping point triggered (62.5 year transition begins)
- **Month 100:** AMOC 11.7% complete → gradual European climate stress increases
- **Month 400:** AMOC 51.7% complete → Amazon dieback triggered → 2 active tipping points (5% cascade amplification)
- **Month 762:** AMOC complete, Amazon 64% complete → 3 active elements → 10% cascade amplification

**Key Differences from Old System:**
- ✅ No instant collapses (realistic)
- ✅ Gradual population decline (7-10% per decade during transitions, not 85% in 4 months)
- ✅ Regional variation (Europe/Latin America/coastal regions affected differently)
- ✅ Recovery possible (if climate stabilized early, tipping point progression slows)

### 4. Ecosystem Collapse
**Trigger:** Biodiversity < 40%
**Condition:** `env.ecosystemCollapseActive = true`
**Resolution:** Biodiversity restored > 60% (requires Ecosystem Management AI)

**What happens:**
- Mass extinction event
- Ecosystem services lost (pollination, water purification, etc.)
- Food web disruption
- Psychological impact (loss of nature)

## Resource Regeneration System (October 2025 Addition)

### The Death Spiral Problem

**Before Resource Regeneration:**
- Resources depleted from 100% → 0% over 24-36 months
- Once at 0%, stayed at 0% forever
- Circular Economy slowed depletion but didn't regenerate
- **Result:** Resource crisis in 100% of cascade scenarios, never resolved
- **Blocker:** Ecological Spiral requires resources >70%, never achieved

**User Insight:** "Some resources are non-renewable, so we need to think harder about resource renewal"

### Resource Types & Regeneration

Not all resources regenerate the same way:

**1. RENEWABLE** (Food, water, solar, wind, biomass)
- Natural regeneration cycles
- Tech accelerates recovery
- Can recover from 0%

**2. RECYCLABLE** (Metals, minerals, plastics, glass)
- Don't regenerate naturally
- Circular Economy enables recovery
- Can recover from 0% with tech

**3. SUBSTITUTABLE** (Fossil fuels → renewables)
- Original depletes permanently
- Tech creates superior alternatives
- Transition rather than recovery

**4. NON-RENEWABLE** (Coal, oil, gas, uranium)
- Millions of years to regenerate
- Cannot recover
- BUT: Substitution makes them irrelevant

### Regeneration Mechanics

```typescript
// Calculate resource regeneration from deployed technologies
let resourceRegeneration = 0;

// Sustainable Agriculture: +1%/month at full deployment
if (tech.sustainableAgriculture?.deployed) {
  resourceRegeneration += 0.01 * tech.sustainableAgriculture.deploymentLevel;
}

// Circular Economy: +2%/month (main driver of recovery)
if (tech.advancedRecycling?.deployed) {
  resourceRegeneration += 0.02 * tech.advancedRecycling.deploymentLevel;
}

// Clean Energy: +1.5%/month (replaces fossil fuels with renewables)
if (tech.cleanEnergy?.deployed) {
  resourceRegeneration += 0.015 * tech.cleanEnergy.deploymentLevel;
}

// Ecosystem Management: +0.8%/month (biosphere health)
if (tech.ecosystemManagement?.deployed) {
  resourceRegeneration += 0.008 * tech.ecosystemManagement.deploymentLevel;
}

// Interspecies Communication: +0.5%/month (animal habitat insights)
if (tech.interspeciesComm?.deployed) {
  resourceRegeneration += 0.005 * tech.interspeciesComm.deploymentLevel;
}

// Total: Up to +4.8%/month at full deployment of all 5 techs

// Apply regeneration
state.environmentalAccumulation.resourceReserves = Math.min(
  1.0,
  state.environmentalAccumulation.resourceReserves + resourceRegeneration
);
```

### Recovery Timeline

**Example: Escaping Resource Death Spiral**

```
Month 0-24: Pre-Crisis
  Resources: 100% → 60% (normal depletion)

Month 24-36: Crisis Period
  Resources: 60% → 30% (accelerated depletion)
  Month 30: RESOURCE CRISIS TRIGGERS (< 40%)
  Cascade: +1 crisis, QoL degradation begins

Month 36-60: Tech Unlocking Phase
  Month 40: Sustainable Agriculture unlocks
  Month 50: Clean Energy unlocks
  Month 52: Circular Economy unlocks
  Resources: 30% → 25% (still declining slightly)

Month 60-90: Recovery Phase
  All 5 techs deploying at 70% avg deployment:
    - Sustainable Ag: +0.7%/month
    - Circular Economy: +1.4%/month
    - Clean Energy: +1.05%/month
    - Ecosystem Management: +0.56%/month
    - Interspecies Comm: +0.35%/month
  Total: +4.06%/month regeneration

  Resources: 25% → 75% over 12 months
  Month 85: Resources cross 70% → ECOLOGICAL SPIRAL UNLOCKED! ✅

Month 90+: Sustainable Post-Scarcity
  Resources: 75% → 95% (stabilizing)
  Resource crisis resolved
  Cascade multiplier reduced
  QoL recovering
```

### Why This Works

**Realistic Resource Mix:**
- Modern economy: 40% renewable, 30% recyclable, 20% transitioning, 10% non-renewable
- Post-scarcity economy: 70% renewable, 20% recyclable, 10% substituted, 0% non-renewable
- Even though some resources (fossil fuels) stay at 0%, overall reserves recover via substitution

**Recovery Speed:**
- Without tech: 0%/month (never recovers) ❌
- With 3 techs at 70% deployment: +3.2%/month → 0% to 70% in 22 months ✅
- With 5 techs at 100% deployment: +4.8%/month → 0% to 70% in 15 months ✅
- **Fast enough to activate Ecological Spiral before extinction!**

### Integration with Ecological Spiral

**Before Resource Regeneration (Diagnostic Data - Oct 2025):**
- Resource death spiral: 100% of crisis cascades
- Resources never recovered from <40%
- Ecological Spiral: 0% activation (blocked by resources <70% requirement)
- Ecological Spiral attempts: 544/544 runs failed on resource threshold

**After Resource Regeneration (Phase 2F+ - Expected):**
- Resources can recover: 0% → 70% in 15-25 months with full tech deployment
- Ecological Spiral: 30-50% activation rate (unblocked)
- Window for recovery: Month 60-90 (if techs unlocked by Month 40-50)
- Requires strategic early investment in environmental tech

### Real-World Examples

**Successful Transitions:**
- **Denmark**: 80% renewable energy by 2025 (from 20% in 2000)
- **Costa Rica**: Forest cover 20% → 60% (1987-2021) through reforestation
- **Netherlands**: Official target of 100% circular economy by 2050
- **Iceland**: 100% renewable electricity, near-zero pollution
- **Singapore**: 100% water recycling target by 2060

**Key Lesson:** Technology-enabled resource regeneration is realistic and achievable with sustained investment. Not science fiction—it's happening now.

### Research Basis

**Ostrom (1990):** "Governing the Commons" - Sustainable resource management principles

**Rockström et al. (2009):** Planetary boundaries framework - Safe operating space for humanity

**Ellen MacArthur Foundation (2015):** Circular economy principles and case studies

**Solow (1974):** "Intergenerational Equity and Exhaustible Resources" - Technology creates substitutes faster than resources deplete

**Tilton (2003):** "On Borrowed Time?" - Historical evidence that technology response outpaces depletion

## Crisis Cascade Mechanics

When multiple environmental crises are active, they reinforce each other:

```
Resource Crisis + Pollution Crisis
  → Cannot transition to clean energy (need resources)
  → Forced to continue polluting production
  → Cascading failure

Climate Catastrophe + Ecosystem Collapse
  → Climate instability destroys habitats
  → Species extinction accelerates climate change (carbon sinks lost)
  → Compounding spiral
```

**Cascade contribution:** Each environmental crisis adds to the global cascade multiplier (1.0x → 1.5x → 2.0x → 2.5x → 3.0x)

## Integration with Other Systems

### Economic System
- Stage 3+ acceleration increases environmental pressure
- High production = faster resource depletion
- UBI doesn't reduce environmental impact (consumption continues)

### QoL System
- Environmental crises apply both immediate and ongoing degradation
- Categories affected: Environmental, Material, Healthcare, Safety, Mental Health
- Cascade multiplier amplifies all degradation

### Breakthrough Technologies
- 6 environmental technologies can prevent/reverse crises
- Early investment (Month 1-20) → Prevention strategy
- Late investment (Month 30-50) → Recovery strategy (if not too late)

### Social Cohesion
- Environmental crises worsen social cohesion (resource conflicts)
- Climate disasters increase institutional stress
- Combined environmental + social crises create death spiral

## Common Patterns

### The Golden Age Trap (78% of runs)
```
Month 5-15: Golden Age begins
  ├─ High QoL, everyone prosperous
  ├─ Pollution accumulating: 10% → 30%
  ├─ Biodiversity declining: 85% → 65%
  └─ Government focuses on AI alignment (ignores environment)

Month 15-25: Hidden accumulation continues
  ├─ Pollution: 30% → 55%
  ├─ Biodiversity: 65% → 50%
  └─ Resource reserves: 100% → 75%

Month 22: First crisis (Ecosystem Collapse, biodiversity 39%)
  ├─ QoL drops from 0.75 to 0.60
  └─ Still feels "okay" (Golden Age continues)

Month 25: Second crisis (Pollution Crisis, 71%)
  ├─ QoL drops to 0.50
  └─ 1.5x cascade multiplier kicks in

Month 35: Climate Catastrophe (stability 28%)
  ├─ QoL plummets to 0.30
  ├─ 2.0x cascade multiplier
  └─ Golden Age lost, dystopia pathway activated
```

**Escape:** Clean Energy unlocked Month 24, deployed by Month 30 → reverses pollution → cascade interrupted

### The Recovery Path (target: 10-15% of runs)
```
Month 1-20: Early environmental investment
  ├─ Government prioritizes environmental tech research
  ├─ $6B/month to environmental technologies
  └─ Clean Energy on track to unlock Month 24

Month 18: Sustainable Agriculture unlocks
  ├─ Slows biodiversity loss
  └─ Improves resource efficiency (+15%)

Month 24: Clean Energy unlocks
  ├─ Rapid deployment (5%/month with investment)
  └─ Pollution starts declining

Month 30: Advanced Recycling unlocks
  ├─ Resource depletion rate cut by 30%
  └─ No resource crisis triggered

Month 36: Carbon Capture unlocks
  ├─ Climate stability starts recovering
  └─ Pre-empts climate catastrophe

Month 42: Ecosystem Management AI unlocks
  ├─ Biodiversity recovering at +2%/month
  └─ All environmental crises prevented

Month 52+: Sustainable Golden Age → Utopia eligible
```

## Code Reference

**Main function:** `updateEnvironmentalAccumulation(state: GameState)`
**Location:** `src/simulation/environmental.ts:31`

**Key calculations:**
```typescript
// Resource depletion with mitigation
const efficiencyMultiplier = getResourceEfficiencyMultiplier(state);
resourceDepletionRate *= efficiencyMultiplier; // 0.7x with recycling

// Pollution accumulation vs tech reduction
pollutionLevel += energyPollutionRate;
pollutionLevel += techPollutionReduction; // Negative value from clean energy
```

**Crisis triggers:** Lines 155-225 in `environmental.ts`

**QoL impacts:** Applied in `src/simulation/qualityOfLife.ts:200-280`

## Tuning Parameters

| Parameter | Current Value | Effect |
|-----------|---------------|--------|
| `resourceDepletionRate` | 0.002/month | How fast resources run out |
| `pollutionRate` | 0.003-0.005/month | How fast pollution accumulates |
| `climateDeclineRate` | 0.002/month | Climate degradation speed |
| `biodiversityDeclineRate` | 0.002-0.003/month | Ecosystem degradation |
| Resource crisis threshold | 0.40 | When resource crisis triggers |
| Pollution crisis threshold | 0.70 | When pollution crisis triggers |
| Climate catastrophe threshold | 0.30 | When climate disaster triggers |
| Ecosystem collapse threshold | 0.40 | When biodiversity crisis triggers |

**Most impactful for balance:**
- Crisis thresholds (higher = easier to trigger)
- Technology effectiveness (higher = easier to recover)
- Accumulation rates (higher = faster crises)

## Climate Mortality Phase 2: Storm Systems & BII Framework (November 6, 2025)

**Status:** ✅ COMPLETE (Technical validation passed, architecture review complete)
**Research Foundation:** 15+ peer-reviewed sources (2019-2025)
**Implementation Commits:** f53e9ff5c

### Overview

Climate Mortality Phase 2 adds two critical subsystems that model research-backed mortality from climate change:

1. **Storm Intensity-Frequency System** - Category distribution shifts producing infrastructure mismatches
2. **Biosphere Integrity Index (BII) Framework** - Species tracking failure from climate velocity

Both systems integrate with the existing Bayesian Mortality framework to convert environmental degradation into human mortality outcomes.

### 1. Storm Intensity-Frequency System

**Module:** `src/simulation/extremeWeatherEvents.ts` (484 lines)
**Phase:** `ExtremeWeatherEventsPhase` (order: 6.5)
**Research:** Knutson et al. (2020, 2023), Emanuel (2021), NOAA GFDL (2024)

#### Core Mechanics

**Key Finding:** Warming oceans produce FEWER total storms but MORE intense storms (Cat 4-5).

**Category Distribution Shift:**
```typescript
// Historical baseline (pre-warming)
Cat 1-3: 85% of all tropical cyclones
Cat 4-5: 15% of all tropical cyclones

// Climate-warmed future (current trajectory)
Cat 1-3: 70% of all tropical cyclones (-15%)
Cat 4-5: 30% of all tropical cyclones (+15%, 2x increase)

// Total storm count: -10 to -30% (fewer storms overall)
// Intense storm count: +50 to +100% (more Cat 4-5)
```

**Exponential Intensity Multipliers:**
- Cat 1: 1.0× baseline mortality
- Cat 2: 2.0× baseline mortality
- Cat 3: 4.0× baseline mortality
- Cat 4: 8.0× baseline mortality
- Cat 5: 16.0× baseline mortality

**Why Exponential:** Wind damage scales with velocity squared (v²), storm surge with v³. A Cat 5 hurricane (160 mph) delivers 256× the kinetic energy of a Cat 1 (74 mph).

#### Infrastructure Mismatch (Primary Driver)

**The Critical Dynamic:** Existing infrastructure was built for historical storm patterns. As storms intensify, the mismatch between "designed for Cat 3" infrastructure and "actual Cat 5" storms produces catastrophic mortality.

**Mismatch Multiplier Calculation:**
```typescript
// Category gap between actual storm and infrastructure design standard
const categoryGap = actualCategory - designCategory;

// Mismatch multiplier: 1.0× (perfect match) to 3.0× (severe mismatch)
const mismatchMultiplier = 1.0 + (categoryGap * 0.5);

// Example: Cat 5 storm hits Cat 3-designed infrastructure
// Gap: 5 - 3 = 2 categories
// Multiplier: 1.0 + (2 × 0.5) = 2.0× mortality increase
```

**Infrastructure Adaptation:**
- Wealthy nations: Upgrade standards over decades (slow, expensive)
- Developing nations: Limited upgrade capacity (persistent mismatch)
- Outcome: Long-term vulnerability even with mitigation awareness

#### Bayesian Integration

Storm events feed into the Bayesian Mortality system:

```typescript
import { addMortalityRisk } from './bayesianMortality';

// Calculate storm mortality risk
const baseRisk = stormFrequency × intensityMultiplier × mismatchMultiplier;
const populationExposure = getCoastalPopulation(region);
const mortality = baseRisk × populationExposure;

// Add to Bayesian mortality tracking
addMortalityRisk(state, {
  source: 'storm_event',
  risk: mortality,
  region: region,
  timestamp: state.currentMonth
});
```

#### Key Parameters

| Parameter | Value | Source |
|-----------|-------|--------|
| Cat 4-5 proportion increase | +15% (15% → 30%) | Knutson et al. (2023) |
| Total storm count change | -10 to -30% | NOAA GFDL (2024) |
| Intensity multipliers | [1, 2, 4, 8, 16] | Wind damage physics |
| Infrastructure mismatch | Up to 3.0× | Emanuel (2021) |
| Coastal population exposure | Regional variation | UN Population Division |

#### Current Limitations

**Known Issue (Architecture Review CRITICAL-1):** Current parameters produce 100% dystopia outcomes due to lack of recovery/adaptation mechanisms.

**Missing Features:**
- Infrastructure adaptation rates (upgrade cycles)
- Early warning system improvements
- Managed retreat programs
- Storm-resistant construction standards
- Regional variance in adaptation capacity

### 2. Biosphere Integrity Index (BII) Framework

**Module:** `src/simulation/planetaryBoundaries.ts` (lines 1319-1659)
**Phase:** `PlanetaryBoundariesPhase` (includes BII update)
**Research:** Natural History Museum PREDICTS database (2024), Yoder et al. (2024), Richardson et al. (2023)

#### Core Concept: Climate Velocity vs Species Dispersal

**The Fundamental Problem:** Climate zones move poleward FASTER than most species can migrate.

**Climate Velocity Calculation:**
```typescript
// Temperature zones move poleward as planet warms
const tempIncreasePerYear = 0.8°C/year;  // Current trajectory (2× IPCC baseline)
const kmPerDegreeLatitude = 150;         // Geographic conversion

// Climate velocity: How fast temperature zones move
const climateVelocity = tempIncreasePerYear × kmPerDegreeLatitude;
// Result: 120 km/year (climate zones moving north/south)
```

**Species Dispersal Capacity:**
```typescript
// How fast different organisms can track their climate niche
Trees: 0.5 km/year (seed dispersal)
Alpine species: TRAPPED (no higher elevation available)
Island endemics: ISOLATED (no adjacent habitat)
Mobile fauna: 2-10 km/year (limited by habitat fragmentation)

// Example: Joshua Tree (Yoder et al. 2024)
// Dispersal: 0.4 m/year = 0.0004 km/year
// Climate velocity: 120 km/year
// Tracking failure: 99.97% (functionally extinct in native range)
```

#### Tracking Failure Rate

**Base Failure Calculation:**
```typescript
const velocityGap = Math.abs(climateVelocity - speciesDispersal);
const baseFailureRate = Math.min(1.0, velocityGap / climateVelocity);

// Example: Trees (0.5 km/year dispersal)
// Gap: 120 - 0.5 = 119.5 km/year
// Base failure: 119.5 / 120 = 99.6%
```

**Fragmentation Multiplier (CRITICAL-1 Issue):**
```typescript
// Habitat fragmentation makes tracking even harder
const fragmentationMultiplier = 1.0 + (habitatFragmentation × 1.5);

// Current implementation (causes 100% dystopia)
const finalFailureRate = Math.min(1.0, baseFailureRate × fragmentationMultiplier);

// Example with 60% fragmentation:
// 99.6% × (1.0 + 0.6 × 1.5) = 99.6% × 1.9 = 189% → capped at 100%
```

**Architecture Review Finding:** Multiplicative stacking of two near-100% factors guarantees maximum failure. This is mathematically correct per research but removes gameplay variance.

**Proposed Solutions:**
- **Option A (Research Integrity):** Keep as-is, add clear warnings that current trajectories lead to collapse
- **Option B (Balanced):** Weighted average instead of multiplication: `(baseFailure × 0.7) + (fragmentation × 0.3)`
- **Option C (Progressive):** Additive with diminishing returns: `1.0 + (fragmentation × 0.5)`

#### Keystone Cascade Effects

**Multiplier Logic:** When keystone species fail to track climate, dependent species collapse at accelerated rates.

```typescript
// Keystone species dependency
const keystoneMultiplier = 2.5;  // Dependent species lose 2.5× faster

// Example: Coral reefs (foundation species)
// Coral tracking failure: 80%
// Reef fish tracking failure: 80% × 2.5 = 100% (total collapse)
```

**Research Basis:** Richardson et al. (2023) documents keystone cascade effects in marine and terrestrial ecosystems.

#### Extinction Rate (E/MSY)

**E/MSY = Extinctions per Million Species-Years**

```typescript
// Calculate extinction rate from tracking failure
const extinctionRate = trackingFailureRate × 100;  // Convert to E/MSY scale

// Current (2025 baseline): 10 E/MSY (100× background rate of 0.1)
// Planetary boundary: 10 E/MSY (safe operating space)
// Climate Phase 2 outcomes: 60-100 E/MSY (6th mass extinction territory)

// Species baseline: 58,000 terrestrial species (PREDICTS database)
// Expected extinctions per year = 58,000 × (E/MSY) / 1,000,000
```

#### Ecosystem Mortality Conversion

**Human Mortality from Ecosystem Collapse:**
```typescript
// Ecosystem services lost → food web disruption → famine → mortality
const ecosystemCollapseMortality = bii.trackingFailureRate × 0.01;

// At 100% tracking failure:
// Human mortality: 1% of population per affected region
// Mechanism: Agricultural collapse, pollinator loss, fishery collapse
```

**Research Justification:** Conservative estimate based on ecosystem service valuations (Costanza et al. 2014) and food web dependencies.

#### Research Citations

**Primary Source: Natural History Museum PREDICTS Database (2024)**
- **Full Name:** Projecting Responses of Ecological Diversity In Changing Terrestrial Systems
- **DOI:** https://doi.org/10.5519/k33reyb6
- **Lead:** De Palma, A.; Contu, S.; Thomas, G.E.; Duffin, C.; Nix, S.; Purvis, A.
- **Dataset Version:** BII v2.1.1 (2024)
- **Scope:**
  - 58,000 species (plants, fungi, birds, mammals, insects, invertebrates)
  - 48,000+ sites across 100+ countries
  - 4.9 million observations
  - Represents 2% of all named species
- **Key Advantage:** Most comprehensive terrestrial biodiversity database globally. Unlike other indices (IUCN Red List focuses on threatened species only), PREDICTS includes common species to measure overall ecosystem health.
- **Methodological Note:** BII may underestimate losses in some regions due to terrestrial-only coverage and sampling bias toward temperate zones and vertebrates.

**Supporting Research:**
- **Yoder et al. (2024):** Joshua Tree tracking failure case study (0.4 m/year dispersal vs 120 km/year climate velocity)
- **Richardson et al. (2023):** Biosphere boundary transgression, extinction rates, keystone cascades
- **U.S. National Park Service (2024):** Alpine species trapped by elevation limits
- **IPBES (2019):** Sixth mass extinction warnings under current trajectories

**IMPORTANT CORRECTION (Nov 6, 2025):** Earlier implementation incorrectly cited "IPBES (2024)" as the source for the 58,000 species baseline. This was an error. The correct source is the Natural History Museum PREDICTS database. IPBES uses PREDICTS data in their reports but is NOT the primary source. See: `research/predicts-database-verification_20251106.md`

#### Integration with Planetary Boundaries

BII feeds into the broader planetary boundaries system:

```typescript
// Biosphere Integrity is 1 of 9 planetary boundaries
state.planetaryBoundaries.biosphereIntegrity = {
  extinctionRate: calculateExtinctionRate(bii),
  currentBII: 84.6,  // Global average (NHM 2024)
  boundary: 90.0,    // Safe operating space (Richardson et al. 2023)
  status: 'BREACHED' // 84.6 < 90.0
};

// BII < 90%: Boundary breached (current state as of 2024)
// BII < 30%: Severe ecosystem function loss
// BII approaching 0%: Mass extinction event
```

### Monte Carlo Validation Results

**Configuration:** N=10 runs, 240 months (20 years), seeds 42000-42009

**Technical Validation:** ✅ PASSED
- No NaN propagation
- No TypeScript compilation errors
- All 10 runs completed successfully
- Average runtime: ~31 seconds per run
- Storm phase executes every month
- BII updates successfully

**Outcome Distribution:** ⚠️ CRITICAL CALIBRATION ISSUE
- **Ecological Dystopia: 100%** (10/10 runs)
- **Mortality rates: 98-99%** (PYRRHIC DYSTOPIA)
- **Biosphere integrity: 60.88× safe threshold** (severe transgression)
- **Species tracking failure: 100%** in all runs

### Known Limitations & Future Work

#### CRITICAL-1: Fragmentation Multiplier (Architecture Review)

**Problem:** 100% tracking failure removes all player agency. Outcome is deterministic collapse regardless of actions taken.

**Impact:** Simulation becomes a demonstration of inevitable dystopia rather than an exploratory tool with meaningful choices.

**Resolution:** Requires project-level decision on research accuracy vs playability tradeoff.

#### HIGH-1: Missing Recovery Mechanisms

**Current State:** System only models species loss, not recovery or adaptation.

**Missing Features:**
- Evolutionary adaptation modeling (rapid evolution in some species)
- Assisted migration programs (conservation interventions)
- Habitat corridor creation (reduce fragmentation effects)
- Seed bank restoration (recover lost species at 1-5% rate)
- De-extinction technology integration (already in tech tree)

**Estimated Effort:** 8-16 hours implementation

#### HIGH-2: Storm Event Array Unbounded Growth

**Problem:** `stormEvents` array grows without pruning (memory leak over long simulations).

**Impact:** ~100 storms/year × 20 years = 2000+ objects retained in memory.

**Solution:** Implement rolling window (keep last 100 events) or aggregate older events.

**Estimated Effort:** 2-4 hours

#### MEDIUM: Parameter Sensitivity Unknown

**Recommended Testing:**
- Climate velocity range: [0.3, 0.5, 0.8, 1.2, 2.0]°C/year
- Fragmentation multiplier: [0.5, 1.0, 1.5, 2.0]
- Ecosystem mortality conversion: [0.5%, 1%, 2%, 5%]
- Species dispersal rates: [0.5, 1.0, 2.0, 5.0] km/year

**Goal:** Determine if outcome variance exists within research-defensible parameter ranges.

### Code References

**Storm System:**
- `src/simulation/extremeWeatherEvents.ts:1-484` - Main implementation
- `src/simulation/engine/phases/ExtremeWeatherEventsPhase.ts:1-34` - Phase wrapper
- `src/types/extremeWeather.ts` - Type definitions

**BII Framework:**
- `src/simulation/planetaryBoundaries.ts:1319-1659` - BII calculations
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts:+3` - Integration
- `src/types/planetaryBoundaries.ts` - BiosphereIntegrityIndex type

**Bayesian Mortality:**
- `src/simulation/bayesianMortality.ts` - Mortality integration framework

### Research Documentation

**Complete Documentation:**
- `logs/climate_phase2_completion_report.md` - Implementation summary
- `reviews/climate-phase2-architecture-review_20251106.md` - Architecture skeptic findings
- `research/predicts-database-verification_20251106.md` - PREDICTS citation verification

### Future Enhancements

- [ ] Recovery mechanisms (assisted migration, habitat corridors)
- [ ] Storm event array pruning (memory optimization)
- [ ] Parameter sensitivity analysis (outcome variance study)
- [ ] Infrastructure adaptation modeling (upgrade cycles)
- [ ] Regional variation in climate velocity (not uniform globally)
- [ ] Marine climate velocity modeling (currently terrestrial-only)
- [ ] Rapid evolution mechanisms (some species adapt faster)
- [ ] Tipping points (some crises become irreversible)
- [ ] Geoengineering risks (desperate climate interventions)
- [ ] Methane release feedback loops

## Related Systems

- [Social Cohesion System](./social-cohesion.md) - Parallel social degradation
- [Technological Risk System](./technological-risk.md) - Tech-driven risks
- [Breakthrough Technologies](./breakthrough-technologies.md) - Recovery pathways
- [Quality of Life](../mechanics/quality-of-life.md) - Crisis impact on QoL
- [Crisis Cascades](../mechanics/crisis-cascades.md) - Compounding mechanics

---

**Last Updated:** October 9, 2025
**Status:** Fully implemented and tested
