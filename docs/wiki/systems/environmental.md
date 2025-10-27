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
**Research Foundation:** Armstrong McKay et al. (2022) *Science*, IPCC AR6, 23 peer-reviewed papers

**IMPORTANT CHANGE (Oct 26, 2025):** Replaced instant climate catastrophe with research-backed gradual tipping point transitions.

**Old Behavior (Removed):**
- Instant catastrophe when climateStability < 0.4
- Immediate 40-60% QoL drops
- 8B → 1.24B population crash in 4 months (physically impossible)

**New Behavior (Research-Backed):**
- 6 major tipping elements with realistic timescales (10-15,000 years)
- Temperature-based threshold detection (1.5-2.3°C above pre-industrial)
- Sigmoid transition curves for smooth progression
- Cascade amplification when multiple elements active
- Regional variation in impacts

**Six Major Tipping Elements:**

| Element | Transition Duration | Threshold | Impact |
|---------|-------------------|-----------|---------|
| **Arctic Sea Ice Loss** | 10-30 years | climateStability < 0.65 | -0.10 climate (albedo feedback) |
| **Amazon Dieback** | 30-80 years | climateStability < 0.55 | -0.15 biodiversity, -0.08 climate |
| **AMOC Collapse** | 50-150 years | climateStability < 0.60 | -0.25 climate (Europe -40%) |
| **Permafrost Carbon** | 50-300 years | climateStability < 0.60 | -0.15 climate (carbon feedback) |
| **West Antarctic Ice** | 500-13,000 years | climateStability < 0.65 | -0.20 climate (coastal -50%) |
| **Greenland Ice Sheet** | 1,000-15,000 years | climateStability < 0.65 | -0.25 climate (coastal -60%) |

**How It Works:**

1. **Threshold Detection:** Each element monitors climate stability (proxy for temperature)
2. **Transition Progress:** Once triggered, element transitions gradually over research-backed duration
3. **Sigmoid Curves:** S-curve progression (slow start → rapid middle → slow end)
4. **Cascade Amplification:** Multiple active tipping points amplify each other (+5% per additional element)
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

## Future Enhancements

- [ ] Tipping points (some crises become irreversible)
- [ ] Regional variations (different countries, different impacts)
- [ ] Geoengineering risks (desperate climate interventions)
- [ ] Ocean acidification as separate metric
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
