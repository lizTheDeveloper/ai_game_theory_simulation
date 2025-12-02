# Full Resource Economy - Option 3 Implementation Plan

**Date:** October 9, 2025  
**Complexity:** HIGH  
**Impact:** VERY HIGH (realistic, educational, gameplay-rich)  
**Status:** 📝 PLANNING

---

## 🎯 DESIGN GOALS

1. **Realistic:** Model actual resource constraints and transitions
2. **Dynamic:** Fossil fuel industry fights substitution
3. **Coupled:** CO2 from fossil use → climate/biodiversity collapse
4. **Educational:** Show how economies transition
5. **Gameplay:** Strategic choices matter

---

## 📊 RESOURCE CATEGORIES

### 1. FOSSIL FUELS (Non-Renewable, High CO2)

#### Oil
- **Uses:** Transportation, plastics, chemicals
- **Reserves:** 100% → 0% over 60-80 months (heavy use)
- **CO2 Impact:** 0.015 pollution/month, 0.01 climate/month
- **Substitutes:**
  - Electric vehicles (Clean Energy tech)
  - Synthetic fuels (Advanced Chemistry tech)
  - Bioplastics (Biotech)
- **Industry Opposition:** Strong (ExxonMobil, Shell, etc.)
  - Resists: Clean Energy research (-20% speed)
  - Resists: EV deployment (-30% adoption)
  - Lobbies government (reduces clean energy funding)

#### Coal
- **Uses:** Electricity, steel production
- **Reserves:** 100% → 0% over 70-90 months
- **CO2 Impact:** 0.020 pollution/month, 0.015 climate/month (worst!)
- **Substitutes:**
  - Solar/wind (Clean Energy)
  - Fusion (late game)
  - Electric arc furnaces (Advanced Materials)
- **Industry Opposition:** Strong
  - Political power in key regions
  - "Jobs" argument (social pressure)

#### Natural Gas
- **Uses:** Heating, electricity, fertilizer
- **Reserves:** 100% → 0% over 80-100 months (abundant)
- **CO2 Impact:** 0.008 pollution/month, 0.006 climate/month (cleaner than coal/oil)
- **Substitutes:**
  - Heat pumps (Clean Energy)
  - Green hydrogen (Electrolysis tech)
  - Synthetic ammonia (Advanced Chemistry)
- **Industry Opposition:** Moderate (marketed as "bridge fuel")

### 2. METALS & MINERALS (Recyclable, Low CO2)

#### Iron/Steel
- **Uses:** Construction, manufacturing, infrastructure
- **Reserves:** 80% → 40% over 120 months (abundant but depleting)
- **CO2 Impact:** 0.005 pollution/month (from smelting)
- **Recovery:** Circular Economy → 90% recycling rate
- **Substitutes:** Advanced composites, graphene structures

#### Rare Earths (Neodymium, Dysprosium, etc.)
- **Uses:** Electronics, magnets, renewable tech (wind turbines!)
- **Reserves:** 70% → 20% over 60 months (critical bottleneck!)
- **CO2 Impact:** 0.003 pollution/month (mining waste)
- **Recovery:** Circular Economy → 80% recycling (hard to extract)
- **Substitutes:** Alternative magnet designs, new materials
- **Paradox:** Need rare earths to build clean energy!

#### Copper
- **Uses:** Wiring, electronics, EVs (lots!)
- **Reserves:** 75% → 30% over 80 months
- **CO2 Impact:** 0.004 pollution/month
- **Recovery:** Circular Economy → 95% recycling (easy!)
- **Bottleneck:** Clean energy transition requires 3x more copper!

#### Lithium
- **Uses:** Batteries (EVs, grid storage)
- **Reserves:** 60% → 10% over 50 months (depletes fast with EVs!)
- **CO2 Impact:** 0.003 pollution/month (mining)
- **Recovery:** Circular Economy → 70% recycling
- **Substitutes:** Sodium-ion, solid-state, flow batteries

### 3. RENEWABLE RESOURCES (Regenerate Naturally)

#### Food/Agriculture
- **Uses:** Sustenance, biofuels
- **Reserves:** 90% → 60% (soil depletion, water stress)
- **CO2 Impact:** 0.002 climate/month (methane from livestock)
- **Recovery:** Sustainable Agriculture → 1.5%/month regeneration
- **Coupling:** Biodiversity loss → pollinator decline → food crisis

#### Water
- **Uses:** Agriculture, industry, drinking
- **Reserves:** 85% → 50% (aquifer depletion, drought)
- **CO2 Impact:** None (but affected BY climate)
- **Recovery:** 
  - Natural: 0.5%/month (rain cycle)
  - Tech: Desalination, water recycling → +1%/month
- **Climate Coupling:** Warming → droughts → water crisis

#### Timber/Biomass
- **Uses:** Construction, paper, bioenergy
- **Reserves:** 80% → 50% (deforestation)
- **CO2 Impact:** -0.005 climate/month (carbon sink when managed)
- **Recovery:** Sustainable Agriculture → 2%/month (fast regrowth)
- **Biodiversity Coupling:** Deforestation → habitat loss → biodiversity -3%/month

### 4. ENERGY (Special Category - Not Stockpiled, Just Produced)

#### Solar
- **Production Rate:** 0% → 80% of total energy over 60 months (with Clean Energy)
- **CO2 Impact:** Zero ongoing, slight manufacturing cost
- **Bottleneck:** Requires rare earths, silver for panels
- **Substitutes Oil:** Yes (transport via EVs + grid)
- **Substitutes Coal:** Yes (direct replacement)

#### Wind
- **Production Rate:** 0% → 60% of total energy over 60 months
- **CO2 Impact:** Zero ongoing
- **Bottleneck:** Requires rare earths for magnets, copper for generators
- **Offshore:** Better capacity factor, needs advanced manufacturing

#### Fusion (Late Game - Clarketech)
- **Production Rate:** 0% → 100% of total energy over 40 months (once unlocked)
- **CO2 Impact:** Zero
- **Requirements:** 
  - AI Capability: 3.5+
  - Research: $200B
  - Time: 60 months to unlock
- **Fuel:** Deuterium (abundant in seawater) + Lithium (for tritium breeding)
- **Game Changer:** Unlimited clean energy, enables everything else

### 5. EXOTIC RESOURCES (Clarketech - Late Game)

#### Helium-3
- **Uses:** Fusion fuel (advanced fusion reactors)
- **Problem:** Can't make it on Earth naturally (primordial, escapes atmosphere)
- **Sources:**
  - Moon mining (requires space infrastructure)
  - Particle accelerators (VERY expensive, ~$1M per gram)
  - Tritium decay (slow, small amounts)
- **Synthesis Tech:** "Helium Synthesis" (Month 100+, AI 4.5+)
  - Uses particle physics + AI design
  - Cost: $500B research
  - Enables: Advanced fusion (10x more efficient than D-T fusion)

#### Antimatter (Extreme Late Game)
- **Uses:** Propulsion, energy storage
- **Current Cost:** $62.5 trillion per gram (2023)
- **Synthesis:** Requires superintelligent AI + massive energy
- **Not implementing this yet** - too far out!

---

## 🏭 INDUSTRY OPPOSITION MECHANICS

### Fossil Fuel Industry

**State Variables:**
```typescript
interface FossilFuelIndustry {
  politicalPower: number;      // [0,1] Lobbying influence
  economicShare: number;        // [0,1] % of economy (tracks fossil fuel reserves)
  desperation: number;          // [0,1] How threatened they feel
  sabotageAttempts: number;     // Count of active interference
}
```

**Opposition Mechanics:**

1. **Research Resistance**
   ```typescript
   // Reduces clean tech research speed
   const fossilOpposition = fossilIndustry.politicalPower * fossilIndustry.desperation;
   cleanEnergyResearchSpeed *= (1 - fossilOpposition * 0.3); // Up to 30% slower
   ```

2. **Deployment Resistance**
   ```typescript
   // Slows adoption of substitutes
   const deploymentResistance = fossilIndustry.politicalPower * 0.4;
   cleanEnergyDeploymentRate *= (1 - deploymentResistance); // Up to 40% slower
   ```

3. **Government Capture**
   ```typescript
   // Reduces government funding for clean tech
   if (government.type === 'authoritarian' || fossilIndustry.politicalPower > 0.7) {
     cleanEnergyFunding *= 0.5; // 50% reduction
   }
   ```

4. **Desperation Increases**
   ```typescript
   // As fossil fuels deplete, industry gets desperate
   fossilIndustry.desperation = 1 - (avgFossilReserves / 0.5); // Desperate below 50%
   
   // Desperate measures:
   if (fossilIndustry.desperation > 0.7) {
     // Sabotage clean energy projects (1% chance per month)
     // Media disinformation campaigns (reduces public support)
     // Political donations (increases authoritarian risk)
   }
   ```

5. **Economic Decline**
   ```typescript
   // As substitutes deploy, fossil industry shrinks
   fossilIndustry.economicShare = avgFossilUse / totalEnergyUse;
   fossilIndustry.politicalPower = fossilIndustry.economicShare * 0.8;
   
   // Eventually becomes irrelevant
   if (fossilIndustry.economicShare < 0.1) {
     fossilIndustry.politicalPower *= 0.5; // Rapid decline
   }
   ```

**Real-World Basis:**
- ExxonMobil knew about climate change since 1977, funded denial
- Koch Brothers: $127M to anti-climate groups (2005-2018)
- Australia: Coal industry captured government, blocked clean energy
- US: Fossil fuel subsidies $20B/year vs renewable $15B/year

### Mining Industry (Less Opposition)

**State Variables:**
```typescript
interface MiningIndustry {
  recyclingAdoption: number;    // [0,1] How much they've pivoted to recycling
  resistanceLevel: number;       // [0,1] Opposition to circular economy
}
```

**Mechanics:**
- Moderate resistance to Circular Economy (cuts into mining profits)
- But can pivot to recycling (becomes part of circular economy)
- Less politically powerful than fossil fuel industry
- Opposition fades faster as reserves deplete

---

## 🌡️ CO2 COUPLING SYSTEM

### Fossil Fuel Use → CO2 Emissions

```typescript
interface CO2Emissions {
  annualEmissions: number;      // Gt CO2/year
  atmosphericCO2: number;        // ppm (parts per million)
  temperatureAnomaly: number;   // °C above pre-industrial
}

// Calculate emissions from fossil fuel use
const oilEmissions = resources.oil.monthlyUse * 2.3;    // kg CO2 per kg oil
const coalEmissions = resources.coal.monthlyUse * 2.86; // kg CO2 per kg coal
const gasEmissions = resources.gas.monthlyUse * 2.0;    // kg CO2 per kg gas

const totalEmissions = oilEmissions + coalEmissions + gasEmissions;

// Update atmospheric CO2
co2.atmosphericCO2 += totalEmissions / 2.13; // 2.13 Gt CO2 = 1 ppm

// CO2 → Temperature
// IPCC: ~3°C warming per doubling of CO2 (climate sensitivity)
const co2Doubling = Math.log2(co2.atmosphericCO2 / 280); // 280 ppm = pre-industrial
co2.temperatureAnomaly = co2Doubling * 3.0; // °C

// Temperature → Climate Stability
state.environmentalAccumulation.climateStability *= (1 - co2.temperatureAnomaly * 0.05);
```

### Climate → Biodiversity Cascade

```typescript
// Warming → Habitat Loss
const warmingImpact = co2.temperatureAnomaly * 0.02; // 2% biodiversity loss per °C
state.environmentalAccumulation.biodiversityIndex -= warmingImpact;

// Warming → Extreme Weather → Resource Loss
if (co2.temperatureAnomaly > 2.0) {
  // Crop failures, water stress
  resources.food.reserves -= 0.01 * (co2.temperatureAnomaly - 2.0);
  resources.water.reserves -= 0.015 * (co2.temperatureAnomaly - 2.0);
}

// Warming → Ocean Acidification → Fisheries Collapse
if (co2.atmosphericCO2 > 450) {
  resources.food.reserves -= 0.005; // Fish stocks decline
  state.environmentalAccumulation.biodiversityIndex -= 0.003; // Coral reefs die
}
```

### The Tragedy

**As fossil fuels deplete, CO2 accumulates:**
- Month 0: 100% reserves, 420 ppm CO2, 1.2°C warming
- Month 40: 50% reserves, 480 ppm CO2, 2.1°C warming ← CRISIS
- Month 60: 20% reserves, 520 ppm CO2, 2.8°C warming ← CATASTROPHE
- Month 80: 5% reserves, 550 ppm CO2, 3.3°C warming ← COLLAPSE

**Clean tech must deploy BEFORE reserves deplete!**

---

## 🔬 SUBSTITUTION TECHNOLOGIES

### Tech 1: Advanced Clean Energy (Replaces Oil/Coal/Gas)
**Unlocks:** Month 40-50  
**Components:**
- Solar/wind (renewable)
- Energy storage (batteries, flow batteries)
- Smart grid (AI-optimized distribution)

**Effects:**
- Reduces oil/coal/gas consumption 80%
- Increases rare earth/copper/lithium consumption 300%
- Stops new CO2 emissions (but old emissions persist)

**Industry Opposition:** SEVERE
- Research speed: -30%
- Deployment speed: -40% (until desperation >0.7)

### Tech 2: Green Hydrogen (Replaces Natural Gas)
**Unlocks:** Month 50-60  
**Requirements:** Clean Energy deployed >50%
**Process:** Electrolysis (water → H2 + O2)

**Effects:**
- Replaces gas for heating, industry
- Requires 3x electricity (must have clean energy first!)
- Enables green steel, green ammonia

**Industry Opposition:** Moderate (gas industry can pivot)

### Tech 3: Synthetic Materials (Replaces Oil for Plastics)
**Unlocks:** Month 55-65  
**Requirements:** Advanced Chemistry + Clean Energy

**Effects:**
- Bioplastics from biomass
- Carbon-neutral production
- Reduces oil consumption 15% (plastics are 10-15% of oil use)

### Tech 4: Advanced Battery Tech (Reduces Lithium Dependence)
**Unlocks:** Month 60-70  
**Types:**
- Sodium-ion (abundant, cheap)
- Solid-state (safer, higher density)
- Flow batteries (grid storage)

**Effects:**
- Substitutes lithium → sodium/other
- Enables mass EV adoption
- Resolves lithium bottleneck

### Tech 5: Rare Earth Substitutes (Critical!)
**Unlocks:** Month 65-75  
**Requirements:** AI Capability 2.5+, Materials Science

**Effects:**
- Alternative magnet designs (no neodymium)
- Synthetic rare earths (expensive but possible)
- Resolves clean energy bottleneck

**Paradox:** Need rare earths to build clean energy to power rare earth synthesis!

### Tech 6: Fusion Power (Game Changer)
**Unlocks:** Month 80-100  
**Requirements:** AI Capability 3.5+, $200B research

**Effects:**
- Unlimited clean energy
- No CO2, no resource depletion
- Fuel: Deuterium (seawater) + Lithium (for tritium)
- Enables: Carbon capture, desalination, helium synthesis

**Industry Opposition:** None (fossil industry already dead by this point)

### Tech 7: Helium Synthesis (Clarketech)
**Unlocks:** Month 100-120  
**Requirements:** AI Capability 4.5+, Fusion deployed, $500B

**Mechanism:**
- Particle accelerators + AI design
- Transmute hydrogen or convert from other isotopes
- Energy-intensive but technically possible

**Effects:**
- Unlimited helium (no more "helium shortage")
- Enables advanced fusion (He-3 reactors)
- Prestige tech (shows post-scarcity achieved)

**Real-World Basis:**
- Theoretical: Proton bombardment of lithium
- Current cost: Prohibitive (~$1M per gram)
- With fusion + superintelligent AI: Maybe feasible?

---

## 🎮 GAMEPLAY IMPLICATIONS

### Strategic Choices

1. **Timing:**
   - Start clean energy research early (before industry opposition peaks)
   - But not TOO early (AI capability insufficient, expensive)
   - Sweet spot: Month 20-30

2. **Rare Earth Bottleneck:**
   - Clean energy needs rare earths
   - But rare earths deplete fast with clean energy rollout
   - Must research rare earth substitutes IN PARALLEL

3. **Lithium Crisis:**
   - EVs need massive lithium
   - Lithium depletes in 50 months with aggressive EV rollout
   - Must research alternative batteries before crisis

4. **Industry Opposition:**
   - Fossil industry fights until desperate
   - Desperation makes them dangerous (sabotage, authoritarianism)
   - But also makes them politically weaker
   - Trade-off: Fast transition (high opposition) vs slow (CO2 accumulates)

5. **CO2 Race:**
   - Every month of fossil use adds CO2 (permanent!)
   - Must transition before cumulative CO2 causes collapse
   - But rushing causes economic disruption

### Victory Conditions

**Ecological Spiral Activation:**
- Resources > 70% (mix of renewable + recyclable + substituted)
- CO2 < 450 ppm (avoided worst warming)
- Biodiversity > 70% (prevented collapse)
- Climate stability > 70% (system still functional)

**Post-Scarcity:**
- Fusion deployed 100%
- Circular economy deployed 100%
- Fossil fuels phased out
- Resource base transitioned to renewable/recyclable

---

## 📊 NEW STATE STRUCTURES

### ResourceEconomy Interface

```typescript
interface ResourceEconomy {
  // Fossil Fuels
  oil: FossilFuelResource;
  coal: FossilFuelResource;
  naturalGas: FossilFuelResource;
  
  // Metals & Minerals
  iron: MetalResource;
  copper: MetalResource;
  rareEarths: MetalResource;
  lithium: MetalResource;
  
  // Renewable Resources
  food: RenewableResource;
  water: RenewableResource;
  timber: RenewableResource;
  
  // Energy Production
  energy: EnergySystem;
  
  // Industry
  fossilIndustry: FossilFuelIndustry;
  miningIndustry: MiningIndustry;
  
  // Climate
  co2: CO2Emissions;
  
  // Aggregates
  totalResourceSecurity: number; // [0,1] Overall resource availability
  energyIndependence: number;    // [0,1] % from renewable sources
  circularityIndex: number;      // [0,1] % of materials recycled
}

interface FossilFuelResource {
  reserves: number;              // [0,1] Remaining stockpile
  monthlyExtraction: number;     // Rate of use
  monthlyUse: number;            // Actual consumption
  co2PerUnit: number;            // Emissions coefficient
  substitutionProgress: number;  // [0,1] How much replaced by alternatives
}

interface MetalResource {
  reserves: number;              // [0,1] Virgin material available
  monthlyExtraction: number;     // Mining rate
  monthlyUse: number;            // Consumption
  recycledStock: number;         // [0,1] Available recycled material
  recyclingRate: number;         // [0,1] % of use that's recycled
  criticality: number;           // [0,1] Bottleneck severity
}

interface RenewableResource {
  reserves: number;              // [0,1] Current stock/health
  monthlyRegeneration: number;   // Natural recovery rate
  monthlyHarvest: number;        // Human extraction
  sustainabilityIndex: number;   // [0,1] Harvest vs regeneration balance
}

interface EnergySystem {
  totalProduction: number;       // Total energy/month
  sources: {
    fossil: number;              // % from oil/coal/gas
    renewable: number;           // % from solar/wind
    nuclear: number;             // % from fission
    fusion: number;              // % from fusion (late game)
  };
  demand: number;                // Total energy needed
  surplus: number;               // Production - demand
}
```

---

## 🔧 IMPLEMENTATION PHASES

### Phase 1: Data Structures (2-3 hours)
- Create ResourceEconomy interface
- Add to GameState
- Initialize with realistic values

### Phase 2: Basic Mechanics (3-4 hours)
- Resource depletion per type
- Consumption based on economic stage
- Aggregation for overall reserves

### Phase 3: CO2 Coupling (2 hours)
- Fossil use → CO2 → temperature → climate
- Climate → biodiversity feedback
- Tipping points

### Phase 4: Industry Opposition (2-3 hours)
- Fossil industry state
- Research/deployment resistance
- Desperation mechanics

### Phase 5: Substitution Technologies (3-4 hours)
- Update existing techs (Clean Energy, etc.)
- Add new techs (Hydrogen, Battery Alt, Rare Earth Sub)
- Deployment affects resource mix

### Phase 6: Integration & Balance (4-5 hours)
- Test full system
- Balance depletion rates
- Tune opposition strength
- Verify CO2 trajectory matches IPCC

### Phase 7: UI & Visualization (Future)
- Resource breakdown chart
- CO2 trajectory graph
- Industry power meter
- Substitution progress

**Total Estimate:** 16-24 hours (2-3 full days)

---

## 🎯 SUCCESS METRICS

### Quantitative
- ✅ Resources can deplete to 0% per type (realistic)
- ✅ CO2 accumulates from fossil use (1 ppm per X Gt)
- ✅ Warming causes biodiversity loss (2% per °C)
- ✅ Industry opposition slows clean tech (measurable)
- ✅ Substitution reduces fossil dependence (trackable)
- ✅ Ecological Spiral activates at 30-40% (up from 0%)

### Qualitative
- ✅ Educational (teaches real resource economics)
- ✅ Strategic (choices matter, timing critical)
- ✅ Tense (race against CO2 accumulation)
- ✅ Realistic (matches IPCC scenarios)
- ✅ Hopeful (shows transition IS possible)

---

## 📚 RESEARCH BASIS

### Resource Depletion
- BP Statistical Review (2023): Oil/gas/coal reserves
- USGS Mineral Commodities (2023): Metal reserves
- Hubbert (1956): Peak oil curve

### CO2 & Climate
- IPCC AR6 (2021-2023): Climate sensitivity, tipping points
- Keeling Curve: CO2 atmospheric concentration
- Hansen et al. (2013): 2°C threshold

### Industry Opposition
- Oreskes & Conway (2010): "Merchants of Doubt"
- Brulle (2014): Climate change counter-movement
- InfluenceMap (2023): Corporate lobbying data

### Resource Transition
- RMI (Rocky Mountain Institute): Clean energy economics
- IEA Net Zero (2021): Energy transition pathways
- Jacobson et al. (2017): 100% renewable feasibility

---

**Status:** 📝 **COMPREHENSIVE PLAN READY**  
**Next:** Start Phase 1 (Data Structures) while Monte Carlo runs!

**This will be AMAZING!** 🚀

