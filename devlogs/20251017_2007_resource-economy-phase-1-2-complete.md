# Resource Economy - Phases 1 & 2 Complete!

**Date:** October 9, 2025  
**Status:** ✅ INTEGRATED & TESTING  
**Complexity:** VERY HIGH (1500+ lines of new code!)

---

## 🎯 WHAT WE BUILT

### Phase 1: Type Definitions (400+ lines)
**File:** `src/types/resources.ts`

**12 Resource Types:**
1. **Fossil Fuels:** Oil, Coal, Natural Gas (non-renewable, high CO2)
2. **Metals:** Iron, Copper, Rare Earths, Lithium (recyclable, critical)
3. **Renewables:** Food, Water, Timber (regenerate)
4. **Energy System:** Production-based (not stockpiled)
5. **Climate:** CO2, temperature, tipping points
6. **Industry Opposition:** Fossil fuel lobby, mining industry
7. **Ocean Health:** pH, oxygen, dead zones, extinction risk
8. **Geoengineering:** 4 restoration techs with termination shock

**Key Features:**
- Realistic 2023 baselines (BP, USGS, IEA, IPCC data)
- Termination shock mechanics (user insight!)
- Tipping points (permafrost, Amazon, Arctic ice)
- Point of no return (ocean anoxia)

### Phase 2: Core Mechanics (800+ lines)
**File:** `src/simulation/resourceDepletion.ts`

**Implemented Systems:**

#### 1. Fossil Fuel Depletion
- Extraction scales with economic stage & substitution
- Reserves deplete at realistic rates
- Extraction cost increases as depletes
- Market price rises with scarcity
- Oil spills (random events)

#### 2. Metal Depletion & Recycling
- Virgin extraction + recycled stock
- Circular economy boosts recycling
- **Clean Energy Paradox:** Renewables need 3x copper, 5x rare earths!
- **EV Paradox:** Electric vehicles need 5x lithium!
- Criticality increases with depletion

#### 3. Renewable Regeneration
- **Food:** Soil health, pollinators (tracks biodiversity), climate stress
- **Water:** Aquifer depletion, climate disrupts water cycle
- **Timber:** Old growth doesn't regenerate
- Overharvest damages capacity permanently

#### 4. Energy System
- Demand scales with economy (95 → 125 units)
- Fossil sources decline as fuels deplete
- Surplus/deficit tracking
- Renewable percentage, carbon intensity

#### 5. CO2 & Climate (IPCC Formula!)
```typescript
// Real IPCC climate sensitivity formula:
const co2Ratio = atmosphericCO2 / 280; // Pre-industrial baseline
const co2Doublings = Math.log2(co2Ratio);
temperatureAnomaly = co2Doublings * 3.0; // 3°C per doubling
```

**Features:**
- Emissions from fossil use (2.3-2.86 kg CO2 per kg fuel)
- Methane leakage (80x worse than CO2!)
- Natural sinks saturate (ocean + land)
- Cumulative emissions are PERMANENT!
- Tipping points: Arctic ice, permafrost (methane feedback!), Amazon dieback

#### 6. Ocean Health
- **Acidification:** CO2 → pH drops (8.2 → 7.5)
- **Thermal stress:** Warming → oxygen loss
- **Pollution:** Mining runoff, plastics
- **Phytoplankton:** Die from pH + pollution
- **Oxygen:** 70% from phytoplankton, 30% atmospheric
- **Dead zones:** Expand with low O2 + pollution
- **Fish stocks:** Decline from multiple stressors
- **Anoxic extinction:** Triggers if pH < 7.5, O2 < 20%, dead zones > 60%

#### 7. Industry Opposition
**Fossil Fuel Industry:**
- Economic share tracks fossil fuel use
- Political power = 90% of economic share
- Desperation increases with depletion + substitution
- Research resistance up to 40%
- Deployment resistance up to 50%
- Government capture (authoritarian or >75% power)
- Sabotage attempts (1% chance when desperate)
- Collapses at <10% economic share

**Mining Industry:**
- Pivots to recycling (circular economy)
- Resistance declines as pivot

### Phase 3: Integration (300+ lines)
**Files:** `src/types/game.ts`, `src/simulation/initialization.ts`, `src/simulation/engine.ts`

**Integration Points:**
1. Added `resourceEconomy` to GameState
2. Initialize with realistic 2023 baselines
3. Update monthly in main simulation loop
4. Runs after bilateral tensions (strategic placement!)

---

## 🔗 KEY DYNAMICS

### The Tragedy of Depletion
```
Fossil Use → CO2 Accumulates (PERMANENT!)
           ↓
    Climate Warming
           ↓
    Food/Water Stress
           ↓
    Resource Scarcity
           ↓
    Bilateral Tensions ↑
           ↓
    Nuclear War Risk ↑
```

### The Clean Tech Paradox
```
Deploy Solar/Wind → Need Rare Earths (5x!) + Copper (3x!)
                  ↓
        Rare Earths Deplete Faster
                  ↓
        Bottleneck! Can't Build More Clean Tech
                  ↓
        Stuck with Fossil Fuels
                  ↓
        CO2 Keeps Accumulating
```

### The EV Paradox
```
Replace Oil with EVs → Need Lithium (5x!)
                     ↓
           Lithium Depletes in 50 Months
                     ↓
           Battery Crisis! Can't Build More EVs
                     ↓
           Stuck with Oil
```

### The Ocean Death Spiral
```
CO2 → Ocean Acidification → Phytoplankton Die
                          ↓
                  Less Oxygen Production
                          ↓
         Warming + Less O2 → Dead Zones Expand
                          ↓
            Fish Die → Ecosystem Collapse
                          ↓
         Anoxic Ocean (Extinction Event!)
```

### Industry Opposition
```
Clean Tech Deploys → Fossil Industry Threatened
                   ↓
            Desperation Increases
                   ↓
    Research Resistance (-40%) + Deployment Resistance (-50%)
                   ↓
            Clean Tech Slows Down
                   ↓
    Fossil Use Continues → More CO2 → More Warming
                   ↓
            Sabotage Attempts (when desperate)
```

---

## 📊 REALISTIC MODELING

### Data Sources:
- **Fossil Reserves:** BP Statistical Review 2023
- **Metal Reserves:** USGS Mineral Commodities 2023
- **Climate:** IPCC AR6 (2021-2023), Keeling Curve
- **Ocean:** IPCC Ocean Report 2019, Caldeira & Wickett 2003
- **Industry:** InfluenceMap 2023, Oreskes & Conway 2010
- **Energy:** IEA Net Zero 2021, RMI

### Formulas:
```typescript
// IPCC Climate Sensitivity
T = 3.0 * log2(CO2 / 280)

// CO2 to ppm conversion
ppm = Gt_CO2 / 2.13

// Ocean pH from acidification
pH = 8.2 - acidification * 0.5

// Oxygen from phytoplankton
O2 = phytoplankton * 0.7 + 0.3
```

### Realistic Rates:
- Oil: Depletes in 67 months (50 years at current use)
- Coal: Depletes in 125 months (130 years)
- Natural Gas: Depletes in 83 months (50-60 years)
- Rare Earths: Critical at <50% (clean tech bottleneck!)
- Lithium: Critical at <40% (EV bottleneck!)

---

## 🎮 EXPECTED GAMEPLAY IMPACTS

### On Nuclear War (User Hypothesis):
**"Resource stuff may fix the multipolar thing"**

**Theory:** More realistic resource scarcity modeling will stabilize bilateral tensions.

**Mechanism:**
- Current: Tensions driven by abstract resource crisis flag
- New: Tensions driven by actual resource depletion rates
- Result: More gradual buildup, less random spikes
- Prediction: Nuclear war rate may decrease (from 70% → 30-40%?)

**But also:**
- Resource bottlenecks (rare earths, lithium) → new tensions
- Food/water crises → regional conflicts
- Industry opposition → political instability
- Could go either way!

### On Utopia:
**Blockers:**
1. **Rare Earth Bottleneck:** Can't deploy clean energy without rare earths
2. **Lithium Crisis:** Can't deploy EVs without lithium
3. **Industry Opposition:** Fossil industry slows transition by 40-50%
4. **Ocean Crisis:** Fish stocks collapse → food crisis
5. **Climate Tipping Points:** Permafrost methane, Amazon dieback

**Enablers:**
1. **Circular Economy:** Boosts recycling (solves metal bottlenecks)
2. **Clean Energy:** Stops new CO2 emissions (but old emissions persist!)
3. **Fusion:** Unlimited clean energy (unlocks everything else)
4. **Geoengineering:** Can restore ocean (but risky!)
5. **Substitution Tech:** Rare earth alternatives, advanced batteries

### On Dystopia:
**New Pressures:**
1. **Resource Scarcity:** Authoritarian rationing
2. **Climate Refugees:** Border militarization
3. **Water Wars:** Regional conflicts
4. **Industry Capture:** Fossil lobby controls government
5. **Collapse Prevention:** Emergency surveillance

---

## 🐛 TESTING STATUS

**Current Test:** Running async (PID 68304)
- Seed range: 42000-42009 (10 runs)
- Previous tests: 0-70% nuclear war (depending on trust mechanics)
- Expected: Different dynamics with resource economy active

**What to Check:**
1. ✅ Compilation (no TypeScript errors)
2. ⏳ Runtime (does it crash?)
3. ⏳ Resource depletion (do reserves actually decrease?)
4. ⏳ CO2 accumulation (does temperature rise?)
5. ⏳ Ocean health (does pH drop?)
6. ⏳ Industry opposition (does resistance appear?)
7. ⏳ Resource events (do crises trigger?)
8. ⏳ Bilateral tensions (affected by resource scarcity?)
9. ⏳ Nuclear war rate (does it change?)
10. ⏳ Utopia rate (still 0%?)

---

## 📋 NEXT PHASES

### Phase 3: Technology Integration (4-5 hours)
**Goal:** Make breakthrough techs affect resource economy

**Technologies to Update:**
1. **Clean Energy:** Increases solar/wind capacity, reduces fossil use
2. **Circular Economy (Advanced Recycling):** Boosts recycling rates
3. **Sustainable Agriculture:** Improves soil health, regeneration
4. **Fusion:** Unlocks unlimited energy, enables everything else
5. **Green Hydrogen:** Replaces natural gas
6. **Advanced Batteries:** Reduces lithium dependence
7. **Rare Earth Substitutes:** Solves clean tech bottleneck

**Implementation:**
```typescript
// In breakthroughTechnologies.ts:
function applyTechToResources(state: GameState, tech: TechnologyNode) {
  if (tech.id === 'cleanEnergy') {
    // Increase renewable capacity
    state.resourceEconomy.energy.capacity.solar += tech.deploymentLevel * 20;
    state.resourceEconomy.energy.capacity.wind += tech.deploymentLevel * 15;
    
    // Reduce fossil consumption
    state.resourceEconomy.oil.substitutionLevel += tech.deploymentLevel * 0.3;
    state.resourceEconomy.coal.substitutionLevel += tech.deploymentLevel * 0.4;
  }
  
  if (tech.id === 'advancedRecycling') {
    // Boost recycling rates
    state.resourceEconomy.iron.recyclingRate += tech.deploymentLevel * 0.3;
    state.resourceEconomy.copper.recyclingRate += tech.deploymentLevel * 0.3;
    state.resourceEconomy.rareEarths.recyclingRate += tech.deploymentLevel * 0.2;
    state.resourceEconomy.lithium.recyclingRate += tech.deploymentLevel * 0.25;
    
    // Update circularity index
    state.resourceEconomy.circularityIndex = avgRecyclingRate;
  }
}
```

### Phase 4: Geoengineering Technologies (4-5 hours)
**Goal:** Implement 4 ocean restoration techs with risk mechanics

1. **Iron Fertilization:** Early, risky (40%), cheap
2. **Ocean Alkalinity:** Mid-game, moderate risk (30%)
3. **Artificial Upwelling:** Low risk (20%), energy-intensive
4. **Bioengineered Cleaners:** Late-game, very risky (60%!), powerful

**Key Mechanic:** Termination shock!
- Ecosystems adapt to intervention
- Stopping abruptly → catastrophic climate shift
- Must ramp down gradually (1%/month)
- Permanent resource commitment

### Phase 5: Balance & Tuning (4-6 hours)
**Goal:** Make model fun and realistic

**Knobs to Tune:**
1. Depletion rates (too fast? too slow?)
2. CO2 accumulation (matches IPCC?)
3. Industry opposition strength (realistic?)
4. Substitution tech effectiveness (can we actually transition?)
5. Ocean resilience (too fragile? too robust?)
6. Rare earth bottleneck severity (blocks clean tech too much?)

### Phase 6: UI Integration (Future)
**Goal:** Visualize resource economy in game UI

**New Tabs:**
1. **Resources Tab:** Show reserves, depletion rates, crises
2. **Climate Tab:** CO2, temperature, tipping points
3. **Ocean Tab:** pH, oxygen, dead zones, fish stocks
4. **Industry Tab:** Opposition strength, capture status

**Charts:**
1. Resource reserves over time (stacked area)
2. CO2 trajectory (line chart with tipping points)
3. Ocean health (multi-metric dashboard)
4. Energy mix (pie chart changing over time)

---

## 💡 KEY INSIGHTS

### 1. "Earth Bounces Back" (User Insight)
**Quote:** "the earth bounces back after ice ages and asteroid impacts so maybe it'll be ok eventually, hominids lived through an ice age"

**Nuance Added:**
- **Earth WILL recover** (given 10 million years)
- **Human civilization WON'T** (need specific conditions)
- **Anoxic oceans:** 1-10M year recovery (Purple Earth periods)
- **Hominids survived ice ages:** Because oceans were healthy!
- **This is different:** Ocean collapse = no oxygen source
- **Timescale matters:** Earth 10M years, humans 10 years

### 2. "Termination Shock" (User Insight)
**Quote:** "if we start geoengineering it will cause termination shocks if we stop so its a resource drain, but with really gradual ramp-up and ramp down we can do it. more gradual more safer."

**Implementation:**
- Geoengineering creates dependency
- Ecosystems adapt to intervention
- Stopping abruptly → rapid climate shift (worse than original!)
- Must ramp down slowly (1%/month vs 2%/month up)
- Permanent funding commitment
- Can only safely stop with superintelligent AI (4.5+)

### 3. "Resource Stuff May Fix Multipolar Thing" (User Hypothesis)
**Theory:** Realistic resource modeling → more stable bilateral tensions

**Testing:** Running now! Will we see:
- Nuclear war rate decrease?
- More gradual tension buildup?
- Resource crises as new flashpoints?
- Industry opposition as new threat?

---

## 🎯 SUCCESS CRITERIA

### Technical:
- ✅ No TypeScript errors (compiles)
- ⏳ No runtime crashes (simulation completes)
- ⏳ Resources deplete realistically
- ⏳ CO2 accumulates correctly
- ⏳ Ocean degrades with CO2
- ⏳ Industry opposes clean tech
- ⏳ Events trigger appropriately

### Gameplay:
- ⏳ Resource scarcity affects bilateral tensions
- ⏳ Clean tech bottlenecks are real challenges
- ⏳ CO2 accumulation creates urgency
- ⏳ Ocean crisis is meaningful threat
- ⏳ Industry opposition feels realistic
- ⏳ Geoengineering is risky but necessary

### Research:
- ⏳ Model matches IPCC projections
- ⏳ Depletion rates match BP/USGS data
- ⏳ Industry opposition matches historical behavior
- ⏳ Ocean chemistry is accurate
- ⏳ Tipping points are scientifically defensible

---

## 📊 STATISTICS

**Code Written:** 1500+ lines  
**Time Spent:** ~4 hours  
**Files Created:** 3  
**Files Modified:** 3  
**Commits:** 5  
**Documentation:** 4 major docs  

**Lines by Module:**
- Type definitions: 400+ lines
- Core mechanics: 800+ lines
- Integration: 300+ lines

**Complexity:** VERY HIGH  
**Impact:** MASSIVE (changes entire game dynamics)

---

**Status:** ✅ **PHASES 1 & 2 COMPLETE, TESTING IN PROGRESS**

**Next:** Check test results, then proceed to Phase 3 (tech integration) or debug if issues found.

🌍🔥💧⚡ **The resource economy is ALIVE!** 🌊☢️🌡️🏭

