# Resource Renewal Research & Design

**Date:** October 9, 2025  
**Problem:** Resources hit 0% and never recover  
**Goal:** Design realistic resource renewal mechanics

---

## 🤔 THE CHALLENGE

### Current Behavior
- Resources deplete from 100% → 0% over 24-36 months
- Once at 0%, stay at 0% forever
- Circular Economy slows depletion but doesn't regenerate
- **Result:** Ecological Spiral blocked (need 70%)

### User Insight
> "idk some resources are non-renewable so let's think harder about resource renewal"

**This is key!** Not all resources regenerate the same way.

---

## 📊 RESOURCE TYPES

### Type 1: RENEWABLE (Can Regenerate)
**Examples:**
- Food (agriculture, aquaculture)
- Timber (forests regrow)
- Water (rain cycle)
- Solar energy (continuous)
- Wind energy (continuous)
- Biomass (regrows)

**Characteristics:**
- Natural regeneration cycles
- Can be sustainably harvested
- Tech can accelerate regeneration
- **Should recover from 0% with right tech**

**Real-World Examples:**
- Iceland: 100% renewable energy
- Costa Rica: Reforestation success (20% → 60% forest cover)
- Singapore: 100% water recycling by 2060

### Type 2: RECYCLABLE (Can Recover via Tech)
**Examples:**
- Metals (aluminum, steel, copper)
- Rare earth elements
- Plastics (with advanced tech)
- Glass
- Concrete

**Characteristics:**
- Don't regenerate naturally
- But can be recycled endlessly
- Tech (Circular Economy) enables recovery
- **Should recover from 0% with Circular Economy**

**Real-World Examples:**
- Aluminum: 75% of all aluminum ever produced still in use
- Steel: 88% recycling rate in construction
- Rare earths: Japan recovering from electronics waste

### Type 3: SUBSTITUTABLE (Tech Creates Alternatives)
**Examples:**
- Fossil fuels → Renewable energy
- Mined phosphorus → Synthetic fertilizers
- Natural rubber → Synthetic rubber
- Cotton → Lab-grown textiles
- Meat → Cultured meat

**Characteristics:**
- Original resource depletes
- Tech creates substitutes that work better
- **Should transition to alternatives, not recover original**

**Real-World Examples:**
- LED lights: 90% less energy than incandescent
- Lab-grown diamonds: Identical to mined
- Synthetic insulin: Better than animal-derived

### Type 4: NON-RENEWABLE (Truly Depleting)
**Examples:**
- Fossil fuels (coal, oil, gas)
- Uranium (fission)
- Helium (escapes atmosphere)
- Some mineral deposits

**Characteristics:**
- Millions of years to regenerate naturally
- Can't be recycled meaningfully
- Must substitute or conserve
- **Should NOT recover from 0%**

**BUT:** Can be replaced by alternatives (Type 3)

---

## 🎯 PROPOSED MECHANICS

### The "Resource Mix" Concept

**Instead of:** Single "resourceReserves" value  
**Use:** Weighted average of different resource types

```typescript
resourceReserves = (
  renewableResources * 0.4 +     // Food, water, biomass
  recyclableResources * 0.3 +    // Metals, minerals
  substitutableResources * 0.2 + // Transitioning resources
  nonRenewableResources * 0.1    // Fossil fuels, uranium
);
```

**Why these weights?**
- Modern economy: 40% renewable, 30% recyclable, 20% transitioning, 10% non-renewable
- Post-scarcity: Shifts to 70% renewable, 20% recyclable, 10% substituted, 0% non-renewable

### Renewal Mechanics by Type

#### 1. Renewable Resources (Regenerate Naturally + Tech Boost)

```typescript
// Natural regeneration (slow without tech)
const naturalRegen = 0.001; // 0.1%/month baseline

// Tech multipliers
const agricultureBoost = hasSustainableAgriculture ? 0.01 : 0;
const ecosystemBoost = hasEcosystemManagement ? 0.008 : 0;
const cleanEnergyBoost = hasCleanEnergy ? 0.015 : 0; // Solar/wind replace fossil

// Total renewable regeneration
renewableRegen = (naturalRegen + agricultureBoost + ecosystemBoost + cleanEnergyBoost);
renewableResources = Math.min(1.0, renewableResources + renewableRegen);
```

**Effect:** 
- Without tech: 0.1%/month (60 months to recover 6%)
- With all tech: 3.4%/month (30 months to recover to 100%)

#### 2. Recyclable Resources (Tech-Dependent Recovery)

```typescript
// No natural regeneration!
const circularEconomyBoost = hasCircularEconomy 
  ? 0.02 * circularEconomyDeployment  // 2%/month at full deployment
  : 0;

const nanotechMultiplier = hasNanotech 
  ? 1.5  // 50% more effective with nanotech
  : 1.0;

// Total recyclable regeneration
recyclableRegen = circularEconomyBoost * nanotechMultiplier;
recyclableResources = Math.min(1.0, recyclableResources + recyclableRegen);
```

**Effect:**
- Without tech: 0%/month (never recovers)
- With Circular Economy: 2%/month (50 months to 100%)
- With Circular + Nanotech: 3%/month (33 months to 100%)

#### 3. Substitutable Resources (Transition to Alternatives)

```typescript
// As substitutes deploy, original becomes less critical
const alternativesAvailable = (
  cleanEnergyDeployment +        // Replace fossil fuels
  syntheticMaterialsDeployment + // Replace mined materials
  culturedBioDeployment          // Replace agricultural land
) / 3;

// Transition reduces dependence on original
substitutableResources = Math.max(
  substitutableResources, 
  alternativesAvailable
);

// Original may deplete, but substitutes maintain "effective reserves"
```

**Effect:**
- Original depletes to 0%
- But alternatives climb to 100%
- Overall reserves maintained via substitution

#### 4. Non-Renewable Resources (Must Conserve or Replace)

```typescript
// Natural regeneration: ZERO (fossil fuels take millions of years)

// Only recovery is reduced consumption via efficiency
const efficiencyGains = (
  circularEconomyDeployment * 0.3 + // Less waste
  cleanEnergyDeployment * 0.5 +     // Replace fossil fuels
  advancedManufacturing * 0.2       // Precision manufacturing
);

// Slows depletion but doesn't regenerate
const depletionRate = baseDepletionRate * (1 - efficiencyGains);

// Eventually hits 0% and stays there
nonRenewableResources = Math.max(0, nonRenewableResources - depletionRate);

// But this is OKAY because we've transitioned to alternatives!
```

**Effect:**
- Depletes to 0% and stays there
- But total reserves maintained via renewable/recyclable/substitutable

---

## 📈 EXAMPLE TRAJECTORY

### Scenario: Successful Transition

**Month 0-24: Pre-Crisis**
```
Renewable:    100% → 80%  (agriculture pressure)
Recyclable:   100% → 60%  (mining virgin materials)
Substitutable: 50% → 30%  (heavy fossil fuel use)
Non-Renewable: 80% → 40%  (depleting)
TOTAL:         85% → 58%  (declining)
```

**Month 24-36: Crisis Period**
```
Renewable:     80% → 60%  (cascading pressure)
Recyclable:    60% → 30%  (crisis acceleration)
Substitutable: 30% → 10%  (heavy demand)
Non-Renewable: 40% → 5%   (crisis consumption)
TOTAL:         58% → 32%  (RESOURCE CRISIS at 30%)
```

**Month 36-60: Tech Unlocking**
- Month 40: Sustainable Agriculture unlocks
- Month 50: Clean Energy unlocks
- Month 52: Circular Economy unlocks

**Month 60-90: Recovery Phase**
```
Renewable:     60% → 95%  (agriculture + clean energy working)
Recyclable:    30% → 75%  (circular economy deploying)
Substitutable: 10% → 80%  (clean energy replacing fossil)
Non-Renewable: 5% → 0%    (depleted, but no longer needed)
TOTAL:         32% → 82%  (RECOVERY! Crisis resolved at Month 85)
```

**Month 90+: Post-Scarcity**
```
Renewable:    95% → 100%  (fully sustainable)
Recyclable:   75% → 95%   (closed loop)
Substitutable: 80% → 100% (full transition)
Non-Renewable: 0% → 0%    (irrelevant)
TOTAL:        82% → 97%   (ECOLOGICAL SPIRAL threshold!)
```

---

## 🎮 IMPLEMENTATION OPTIONS

### Option 1: SIMPLE (Add Regeneration to Current System)

**Pros:**
- Easy to implement
- No new state variables
- Works with existing tech

**Cons:**
- Less realistic (lumps all resources together)
- Doesn't capture substitution dynamics
- Non-renewable resources can "regenerate" (unrealistic)

**Code:**
```typescript
// In environmental.ts
let resourceRegeneration = 0;

// Tech-based regeneration
if (state.breakthroughTech.sustainableAgriculture?.deployed) {
  resourceRegeneration += 0.01 * state.breakthroughTech.sustainableAgriculture.deploymentLevel;
}
if (state.breakthroughTech.circularEconomy?.deployed) {
  resourceRegeneration += 0.02 * state.breakthroughTech.circularEconomy.deploymentLevel;
}
if (state.breakthroughTech.cleanEnergy?.deployed) {
  resourceRegeneration += 0.015 * state.breakthroughTech.cleanEnergy.deploymentLevel;
}

// Apply regeneration
state.environmentalAccumulation.resourceReserves = Math.min(
  1.0, 
  state.environmentalAccumulation.resourceReserves + resourceRegeneration
);
```

**Expected Effect:** 
- 0% → 70% in 18 months with all tech deployed
- **Fast enough to activate Ecological Spiral!**

### Option 2: MODERATE (Resource Categories)

**Pros:**
- More realistic (different types behave differently)
- Captures transition dynamics
- Educational (shows how economy evolves)

**Cons:**
- Moderate complexity
- Need new state variables
- More to balance

**New State:**
```typescript
interface ResourceBreakdown {
  renewable: number;      // 0-1 (food, water, biomass, solar, wind)
  recyclable: number;     // 0-1 (metals, minerals, plastics)
  substitutable: number;  // 0-1 (transitioning to alternatives)
  nonRenewable: number;   // 0-1 (fossil fuels, uranium)
}
```

**Aggregation:**
```typescript
// Weighted average for overall reserves
const economicStage = state.globalMetrics.economicTransitionStage;

// Weights shift toward renewables as economy advances
const weights = {
  renewable: 0.3 + economicStage * 0.1,    // 30% → 70%
  recyclable: 0.3 - economicStage * 0.05,  // 30% → 20%
  substitutable: 0.3 - economicStage * 0.05, // 30% → 10%
  nonRenewable: 0.1 - economicStage * 0.05  // 10% → 0%
};

resourceReserves = 
  breakdown.renewable * weights.renewable +
  breakdown.recyclable * weights.recyclable +
  breakdown.substitutable * weights.substitutable +
  breakdown.nonRenewable * weights.nonRenewable;
```

### Option 3: COMPLEX (Full Resource Economy)

**Pros:**
- Most realistic
- Rich simulation
- Captures all dynamics

**Cons:**
- High complexity
- Many new variables
- Hard to balance
- Overkill for current scope

**Components:**
- Individual resources (oil, coal, iron, copper, etc.)
- Supply chains
- Trade dynamics
- Price signals
- Substitution elasticity

**Verdict:** TOO COMPLEX for now. Save for v2.0.

---

## 🎯 RECOMMENDATION

### **Go with Option 1 (Simple) NOW**

**Why:**
1. **Unblocks Ecological Spiral immediately**
2. **Easy to implement (30 minutes)**
3. **Easy to test and balance**
4. **Good enough for gameplay**

**Simple Implementation:**
```typescript
// In breakthroughTechnologies.ts or environmental.ts

export function calculateResourceRegeneration(state: GameState): number {
  let regen = 0;
  
  const tech = state.breakthroughTech;
  
  // Sustainable Agriculture: +1%/month at full deployment
  if (tech.sustainableAgriculture?.unlocked) {
    regen += 0.01 * tech.sustainableAgriculture.deploymentLevel;
  }
  
  // Circular Economy: +2%/month (main driver)
  if (tech.advancedRecycling?.unlocked) {
    regen += 0.02 * tech.advancedRecycling.deploymentLevel;
  }
  
  // Clean Energy: +1.5%/month (replaces fossil fuels)
  if (tech.cleanEnergy?.unlocked) {
    regen += 0.015 * tech.cleanEnergy.deploymentLevel;
  }
  
  // Ecosystem Management: +0.8%/month (biosphere health)
  if (tech.ecosystemManagement?.unlocked) {
    regen += 0.008 * tech.ecosystemManagement.deploymentLevel;
  }
  
  // Nanotech Synergy: +50% if nanotech exists (in future)
  // if (tech.nanotech?.unlocked) {
  //   regen *= (1 + 0.5 * tech.nanotech.deploymentLevel);
  // }
  
  return regen;
}

// In updateEnvironmentalAccumulation:
const resourceRegen = calculateResourceRegeneration(state);
state.environmentalAccumulation.resourceReserves = Math.min(
  1.0,
  Math.max(0, state.environmentalAccumulation.resourceReserves + resourceRegen)
);
```

**Expected Timeline:**
- Month 0-24: Resources 100% → 60%
- Month 24-36: Crisis (60% → 30%) ← TRIGGER
- Month 36-60: Tech unlocking
- Month 60-80: Tech deploying, regeneration starting
- Month 80-100: Full regeneration (30% → 75%)
- Month 100: Ecological Spiral threshold (70%)! ✅

### **Later: Upgrade to Option 2 (Categories)**

When we have time:
- Add resource breakdown for more realism
- Show economic transition visually
- Educational value

---

## 📚 RESEARCH BASIS

### Renewable Resource Management
- **Ostrom (1990):** "Governing the Commons" - Sustainable resource use
- **Rockström et al. (2009):** Planetary boundaries - Safe operating space
- **Ellen MacArthur Foundation (2015):** Circular economy principles

### Substitution & Technology
- **Solow (1974):** "Intergenerational Equity and Exhaustible Resources"
- **Tilton (2003):** "On Borrowed Time? - Assessing Resource Depletion"
- **Key Finding:** Technology creates substitutes faster than resources deplete

### Real-World Examples
- **Denmark:** 80% renewable energy by 2025
- **Netherlands:** 100% circular by 2050 (official policy)
- **Japan:** "Society 5.0" - Resource circulation + innovation

---

## 🎯 SUCCESS METRICS

### Quantitative
- ✅ Resources recover from 0% → 70% (Ecological Spiral threshold)
- ✅ Recovery time: 40-60 months with full tech deployment
- ✅ Ecological Spiral activation: 0% → 30-40%

### Qualitative
- ✅ Realistic (matches real-world transition timelines)
- ✅ Tech-dependent (requires player investment)
- ✅ Hopeful (recovery is possible!)
- ✅ Educational (shows how circular economy works)

---

**Status:** 📝 **RESEARCH COMPLETE - READY TO IMPLEMENT (Option 1)**

**Next:** Implement simple resource regeneration (30 min) while trust mechanics test runs!

