# Ocean Health & Geoengineering Plan

**Date:** October 9, 2025  
**Status:** 📝 PLANNING  
**Complexity:** HIGH  
**Risk:** ⚠️ DUAL-USE (Geoengineering can make things worse!)

---

## 🌊 THE OCEAN PROBLEM

### Why Oceans Matter (A LOT)

**Oceans are civilization's life support system:**
- **50-80% of Earth's oxygen** (phytoplankton)
- **Primary protein source** for 3+ billion people
- **Climate regulation** (absorbs 25% of CO2, 90% of heat)
- **Biodiversity hub** (80% of all life)
- **Economic value:** $24 trillion/year

**Dead oceans = Game Over (for humans, maybe not Earth):**
- No oxygen replenishment (atmosphere becomes stagnant)
- No protein for billions (famine)
- No CO2 absorption (runaway warming)
- No recovery without intervention (anoxic oceans last millions of years)

**User insight on resilience:** "the earth bounces back after ice ages and asteroid impacts so maybe it'll be ok eventually, hominids lived through an ice age."

**Nuance:**
- **Earth will recover** (given millions of years, life always finds a way)
- **Human civilization won't** (we need specific conditions: O2, stable climate, food)
- **Anoxic oceans take 1-10 million years** to recover naturally (Purple Earth periods)
- **Hominids survived ice ages** because oceans were healthy (oxygen, fish stocks intact)
- **This is different:** Ocean collapse = no oxygen source, no food base
- **Timescale matters:** Earth recovers in 10M years, humans extinct in 10 years

### Current Ocean Threats (Not Fully Modeled)

#### 1. Ocean Acidification (CO2 Absorption)
- **Mechanism:** CO2 + H2O → H2CO3 (carbonic acid) → pH drops
- **Current pH:** 8.1 (down from 8.2 pre-industrial)
- **At 450 ppm CO2:** pH 7.9 (coral reefs collapse)
- **At 550 ppm CO2:** pH 7.7 (shellfish can't form shells, food chain collapses)
- **Time to recovery:** 10,000+ years without intervention

#### 2. Industrial Pollution (Mining Runoff)
- **Lithium mining:** Toxic wastewater, lithium leaching
- **Rare earth mining:** Radioactive thorium, heavy metals
- **Oil spills:** Deepwater Horizon (4.9M barrels), Exxon Valdez
- **Plastic pollution:** 8M tons/year, microplastics in food chain
- **Cumulative effect:** Dead zones, bioaccumulation

#### 3. Overfishing & Habitat Destruction
- **90% of large fish** gone (since 1950s)
- **30% of marine habitats** destroyed (coral, mangroves, seagrass)
- **Trawling:** Destroys seafloor ecosystems
- **Bycatch:** 40% of catch discarded dead

#### 4. Warming & Deoxygenation
- **Ocean heat content:** Up 0.6°C since 1970s
- **Dead zones:** 700+ (up from 49 in 1960s)
- **Anoxic events:** When oxygen hits 0%, mass extinction
- **Feedback loop:** Warm water holds less O2 → more dead zones → more warming

### The Death Spiral

```
High CO2 → Ocean Acidification → Coral/Shellfish Die
                ↓
           Phytoplankton Decline (pH stress)
                ↓
           Less Oxygen Production
                ↓
      Warming + Less O2 → Dead Zones Expand
                ↓
         Fish Die → Ecosystem Collapse
                ↓
    Anaerobic Bacteria Dominate (release H2S)
                ↓
        Anoxic Ocean (Game Over)
```

**Point of No Return:** pH < 7.5, O2 < 20% baseline, temp > +3°C

---

## 🎮 GAME MECHANICS: Ocean Health System

### New State Variable: Ocean Health

```typescript
interface OceanHealth {
  // Core metrics
  pH: number;                        // [6.5, 8.2] Current ocean pH (8.1 baseline)
  oxygenLevel: number;               // [0, 1] Dissolved oxygen (1.0 = healthy)
  phytoplanktonPopulation: number;   // [0, 1] Primary producers
  fishStocks: number;                // [0, 1] Marine life abundance
  
  // Stressors
  acidification: number;             // [0, 1] Cumulative acid stress
  pollutionLoad: number;             // [0, 1] Industrial toxins
  plasticConcentration: number;      // [0, 1] Microplastic density
  thermalStress: number;             // [0, 1] Temperature anomaly stress
  
  // Dead zones
  deadZoneExtent: number;            // [0, 1] % of ocean anoxic
  anoxicRisk: number;                // [0, 1] Probability of anoxic event
  
  // Recovery indicators
  ecosystemResilience: number;       // [0, 1] Ability to bounce back
  geoengIntervention: number;        // [0, 1] Active restoration efforts
  
  // Crisis tracking
  inCrisis: boolean;                 // pH < 7.8 OR oxygen < 50% OR dead zones > 30%
  monthsInCrisis: number;            // Duration counter
  recoveryPossible: boolean;         // False if past point of no return
}
```

### Ocean Degradation Sources

#### From Existing Systems:

1. **CO2 Emissions → Acidification**
   ```typescript
   // From fossil fuel use (already planned in resource economy)
   const co2Impact = state.co2.atmosphericCO2 - 420; // ppm above baseline
   ocean.acidification += co2Impact * 0.0001; // Accumulates
   ocean.pH = 8.2 - ocean.acidification * 0.5; // pH drops
   ```

2. **Mining & Industry → Pollution**
   ```typescript
   // From resource extraction (planned in resource economy)
   const miningPollution = 
     resources.lithium.monthlyExtraction * 0.02 +
     resources.rareEarths.monthlyExtraction * 0.03 + // Worse (radioactive)
     resources.oil.monthlyExtraction * 0.01;
   
   ocean.pollutionLoad += miningPollution;
   ```

3. **Climate Warming → Thermal Stress**
   ```typescript
   // From temperature (already modeled)
   const tempAnomaly = state.co2.temperatureAnomaly; // °C
   ocean.thermalStress = Math.min(1.0, tempAnomaly / 4.0); // Maxes at +4°C
   
   // Thermal stress reduces oxygen capacity
   ocean.oxygenLevel *= (1 - ocean.thermalStress * 0.4);
   ```

4. **Overfishing → Ecosystem Collapse**
   ```typescript
   // From economic activity
   const overfishingPressure = state.economicStage / 5; // More economy = more fishing
   ocean.fishStocks -= overfishingPressure * 0.01;
   ```

#### Ocean Death Spiral:

```typescript
// Acidification kills phytoplankton
if (ocean.pH < 7.9) {
  const phytoplanktonDie = (7.9 - ocean.pH) * 0.5; // 50% loss per 0.1 pH
  ocean.phytoplanktonPopulation *= (1 - phytoplanktonDie);
}

// Less phytoplankton = less oxygen
ocean.oxygenLevel = ocean.phytoplanktonPopulation * 0.7 + 0.3; // 70% from phyto

// Low oxygen = dead zones expand
if (ocean.oxygenLevel < 0.5) {
  ocean.deadZoneExtent += (0.5 - ocean.oxygenLevel) * 0.05;
}

// Dead zones = anoxic risk
ocean.anoxicRisk = ocean.deadZoneExtent * 0.8;

// Pollution amplifies all effects
const pollutionMultiplier = 1 + ocean.pollutionLoad * 0.5;
ocean.deadZoneExtent *= pollutionMultiplier;
```

### Point of No Return

```typescript
// Check if natural recovery is still possible
ocean.recoveryPossible = (
  ocean.pH > 7.5 &&              // Not too acidic
  ocean.oxygenLevel > 0.2 &&     // Some oxygen remains
  ocean.deadZoneExtent < 0.6 &&  // Dead zones not dominant
  ocean.phytoplanktonPopulation > 0.1  // Seed population exists
);

// If past point of no return, trigger extinction
if (!ocean.recoveryPossible && !ocean.geoengIntervention) {
  // Anoxic ocean extinction event
  state.extinctionState.active = true;
  state.extinctionState.type = 'slow';
  state.extinctionState.mechanism = 'anoxic_ocean';
  state.extinctionState.severity = 1.0;
}
```

---

## 🧬 GEOENGINEERING TECHNOLOGIES

### Philosophy: High Risk, High Reward

**Real-world context:**
- Geoengineering is **controversial** (playing god, unknown risks)
- But may be **necessary** if we've already fucked up
- **Dual-use:** Can restore OR destroy, depending on execution
- **AI role:** Superintelligent AI might be able to model complex systems well enough to do it safely... or might fuck it up catastrophically

## ⚠️ TERMINATION SHOCK (Critical Mechanic!)

**User insight:** "if we start geoengineering it will cause termination shocks if we stop so its a resource drain, but with really gradual ramp-up and ramp down we can do it. more gradual more safer."

**The Problem:**
- Geoengineering creates a **dependency**
- Ecosystems **adapt** to the intervention
- If you **stop abruptly**, rapid climate shift (worse than original problem!)
- **Example:** Solar radiation management → sudden stop → temperature spike +5°C in 10 years

**Mechanics:**

```typescript
interface TerminationShockRisk {
  // Builds up as geoeng is active
  adaptationLevel: number;         // [0,1] How much ecosystems adapted to intervention
  dependencyLevel: number;         // [0,1] How much world relies on it continuing
  
  // If stopping
  rampDownRate: number;            // How fast we're reducing intensity
  shockRisk: number;               // [0,1] Probability of catastrophic shift
  
  // Safe ramp rates
  minSafeRampUp: number;           // e.g., 0.02/month (5% increase)
  minSafeRampDown: number;         // e.g., 0.01/month (1% decrease - slower!)
}

// Adaptation increases over time
geoeng.adaptationLevel += geoeng.deploymentLevel * 0.01; // 1% per month at full deployment

// If ramping down too fast
if (geoeng.rampDownRate > geoeng.minSafeRampDown) {
  const excessRate = geoeng.rampDownRate - geoeng.minSafeRampDown;
  geoeng.shockRisk = geoeng.adaptationLevel * excessRate * 10; // Up to 100% risk!
  
  if (Math.random() < geoeng.shockRisk) {
    // TERMINATION SHOCK DISASTER
    triggerTerminationShock();
  }
}

function triggerTerminationShock() {
  // Rapid climate shift
  state.co2.temperatureAnomaly += 2.0; // Sudden +2°C spike
  
  // Ecosystem collapse
  state.ocean.phytoplanktonPopulation -= 0.4;
  state.environmentalAccumulation.biodiversityIndex -= 0.3;
  
  // Extinction risk
  state.extinctionState.active = true;
  state.extinctionState.mechanism = 'geoeng_termination_shock';
  
  addEvent({
    type: 'catastrophe',
    title: '💥 TERMINATION SHOCK',
    description: 'Abrupt halt of geoengineering caused rapid climate shift. Ecosystems had adapted to intervention and cannot survive sudden change.',
    effects: { termination_shock: 1.0 }
  });
}
```

**Resource Drain:**
```typescript
// Geoengineering is a permanent commitment (or gradual phase-out)
const geoengCost = 
  oceanAlkalinity.deploymentLevel * 5.0 +      // $5B/month at full deployment
  artificialUpwelling.deploymentLevel * 6.0 +  // $6B/month (energy intensive!)
  bioengCleaners.deploymentLevel * 2.0;        // $2B/month (organisms self-replicate)

state.government.budget -= geoengCost;

// Can't stop without years of ramp-down
const yearsToSafelyStop = geoeng.adaptationLevel * 100; // e.g., 5 years if 50% adapted
```

**Strategic Implications:**
- Starting geoeng = **long-term commitment**
- Must maintain **funding** or face termination shock
- **Gradual deployment** = safer but slower results
- **Can only safely stop** with superintelligent AI (4.5+) modeling safe ramp-down

---

### Tech 1: Ocean Alkalinity Enhancement (OAE)

**Mechanism:** Add alkaline minerals (lime, olivine) to ocean to raise pH

**Real-world status:**
- Proof of concept (Project Vesta, Running Tide)
- Cost: $10-100 per ton CO2 removed
- Risks: Local pH spikes, trace metal toxicity, **termination shock if stopped**

**Game Implementation:**

```typescript
interface OceanAlkalinityTech extends TechnologyNode {
  id: 'oceanAlkalinity';
  name: 'Ocean Alkalinity Enhancement';
  category: 'environmental_restoration';
  
  requirements: {
    minAICapability: 2.0;          // Need advanced ocean modeling
    minEconomicStage: 3;           // Expensive
    requiredInvestment: 50;        // $50B (massive scale)
    prerequisiteTechs: ['advancedRecycling', 'cleanEnergy'];
  };
  
  monthlyResearchCost: 5.0;
  monthsToUnlock: 40;              // Long research (complex)
  
  effects: {
    // BENEFITS (if deployed correctly):
    oceanPHRecovery: 0.002;        // +0.002 pH per month at full deployment
    co2Sequestration: 0.01;        // Removes CO2 from atmosphere
    
    // RISKS (if deployed incorrectly):
    geoengRiskLevel: 0.3;          // 30% risk if AI capability too low
  };
  
  // Deployment quality depends on AI capability
  deploymentQuality: number;       // [0, 1] How well we're doing it
}

// Deployment mechanics
function updateOceanAlkalinity(state: GameState) {
  const tech = state.breakthroughTech.oceanAlkalinity;
  if (!tech.unlocked) return;
  
  const aiCapability = calculateTotalAICapability(state);
  
  // Deployment quality improves with AI capability
  // Need 3.0+ capability for safe deployment
  tech.deploymentQuality = Math.min(1.0, aiCapability / 3.0);
  
  const deployment = tech.deploymentLevel * tech.deploymentQuality;
  
  // Benefits scale with quality
  state.ocean.pH += 0.002 * deployment;
  state.co2.atmosphericCO2 -= 0.5 * deployment; // Removes CO2
  
  // RISKS if quality is low (AI not smart enough)
  if (tech.deploymentQuality < 0.6) {
    const riskRoll = Math.random();
    const riskThreshold = (0.6 - tech.deploymentQuality) * 0.5; // Up to 30% risk
    
    if (riskRoll < riskThreshold) {
      // DISASTER: Local pH spike kills marine life
      state.ocean.fishStocks -= 0.05;
      state.ocean.pollutionLoad += 0.03; // Trace metal toxicity
      
      addEvent({
        type: 'crisis',
        title: '⚠️ Ocean Alkalinity Disaster',
        description: 'Poorly calibrated alkalinity enhancement caused local pH spikes, killing marine ecosystems. AI models were insufficient to predict ocean circulation patterns.',
        effects: { ocean_damage: 1.0 }
      });
      
      // Public loses trust in geoengineering
      state.society.trustInAI -= 0.05;
    }
  }
}
```

### Tech 2: Bioengineered Ocean Cleaners

**Mechanism:** Release engineered organisms (bacteria, algae, fish) to consume pollutants and restore ecosystems

**Real-world context:**
- Synthetic biology (Craig Venter, Church lab)
- Oil-eating bacteria (used in spills)
- **HUGE RISK:** Invasive species, ecosystem disruption, runaway evolution

**Game Implementation:**

```typescript
interface BioengineeredCleanersTech extends TechnologyNode {
  id: 'bioengineeredCleaners';
  name: 'Bioengineered Ocean Restoration';
  category: 'environmental_restoration';
  
  requirements: {
    minAICapability: 3.0;          // Need advanced synthetic biology
    minEconomicStage: 3;
    requiredInvestment: 80;        // $80B (very expensive, risky)
    prerequisiteTechs: ['geneticEngineering', 'ecosystemManagement'];
  };
  
  monthlyResearchCost: 8.0;
  monthsToUnlock: 50;              // Very long (risky)
  
  effects: {
    // BENEFITS (if done right):
    pollutionCleanup: 0.03;        // Removes toxins
    plasticDegradation: 0.04;      // Breaks down microplastics
    ecosystemRegeneration: 0.02;   // Restores biodiversity
    
    // RISKS (if done wrong):
    geoengRiskLevel: 0.6;          // 60% risk! (Very high)
    invasiveSpeciesRisk: 0.4;      // Could become invasive
  };
  
  // Tracking released organisms
  releasedOrganisms: number;       // Count of deployments
  invasiveEvent: boolean;          // Has disaster occurred?
}

// Deployment mechanics
function updateBioengineeredCleaners(state: GameState) {
  const tech = state.breakthroughTech.bioengineeredCleaners;
  if (!tech.unlocked) return;
  
  const aiCapability = calculateTotalAICapability(state);
  const alignment = calculateAverageAlignment(state);
  
  // Deployment quality depends on AI capability AND alignment
  // Need 4.0+ capability AND 0.7+ alignment for safety
  const capabilityQuality = Math.min(1.0, aiCapability / 4.0);
  const alignmentQuality = alignment; // Direct factor
  tech.deploymentQuality = capabilityQuality * alignmentQuality;
  
  const deployment = tech.deploymentLevel * tech.deploymentQuality;
  
  // Benefits
  state.ocean.pollutionLoad -= 0.03 * deployment;
  state.ocean.plasticConcentration -= 0.04 * deployment;
  state.ocean.ecosystemResilience += 0.02 * deployment;
  
  // RISKS (very high!)
  if (tech.deploymentQuality < 0.8 && !tech.invasiveEvent) {
    const riskRoll = Math.random();
    const riskThreshold = (0.8 - tech.deploymentQuality) * 0.75; // Up to 60% risk!
    
    if (riskRoll < riskThreshold) {
      // CATASTROPHIC DISASTER: Invasive species
      tech.invasiveEvent = true;
      
      // Random disaster type
      const disasterType = Math.random();
      
      if (disasterType < 0.4) {
        // 40%: Organisms outcompete native species
        state.ocean.fishStocks -= 0.3;
        state.ocean.phytoplanktonPopulation -= 0.2;
        state.environmentalAccumulation.biodiversityIndex -= 0.15;
        
        addEvent({
          type: 'catastrophe',
          title: '☠️ INVASIVE SPECIES DISASTER',
          description: 'Bioengineered organisms evolved beyond design parameters and are outcompeting native marine life. Ocean ecosystems collapsing.',
          effects: { ecosystem_collapse: 1.0 }
        });
        
      } else if (disasterType < 0.7) {
        // 30%: Organisms consume TOO MUCH (algae bloom crash)
        state.ocean.oxygenLevel -= 0.25;
        state.ocean.deadZoneExtent += 0.2;
        
        addEvent({
          type: 'catastrophe',
          title: '💀 OXYGEN CRASH',
          description: 'Bioengineered cleaners caused massive algae bloom followed by die-off. Dead zones expanding rapidly.',
          effects: { anoxic_zones: 1.0 }
        });
        
      } else {
        // 30%: Organisms produce toxic byproducts
        state.ocean.pollutionLoad += 0.15;
        state.qol.health -= 0.08;
        
        addEvent({
          type: 'catastrophe',
          title: '☢️ TOXIC BYPRODUCTS',
          description: 'Bioengineered organisms are producing unexpected toxic compounds. Seafood contaminated, coastal populations at risk.',
          effects: { biotoxin_crisis: 1.0 }
        });
      }
      
      // Major trust loss
      state.society.trustInAI -= 0.15;
      
      // May trigger existential risk assessment
      state.technologicalRisk.biotechRisk += 0.2;
    }
  }
  
  // If invasive event occurred, organisms keep spreading
  if (tech.invasiveEvent) {
    tech.releasedOrganisms += tech.deploymentLevel * 10; // Exponential growth
    
    // Ongoing damage
    state.ocean.ecosystemResilience -= 0.01;
    
    // Can only be stopped by VERY high AI capability (4.5+)
    if (aiCapability > 4.5 && alignment > 0.8) {
      // Superintelligent AI can design countermeasures
      tech.invasiveEvent = false;
      tech.releasedOrganisms = 0;
      
      addEvent({
        type: 'resolution',
        title: '🧬 Invasive Species Contained',
        description: 'Superintelligent AI designed targeted bioweapons to eliminate invasive organisms without harming native life.',
        effects: { crisis_resolved: 1.0 }
      });
    }
  }
}
```

### Tech 3: Iron Fertilization (Phytoplankton Boost)

**Mechanism:** Add iron to ocean to stimulate phytoplankton growth

**Real-world context:**
- Tested in 13+ experiments
- Works (blooms occur) but **controversial**
- Risks: Dead zones from bloom die-off, ecosystem disruption, unknown unknowns

**Game Implementation:**

```typescript
interface IronFertilizationTech extends TechnologyNode {
  id: 'ironFertilization';
  name: 'Iron Fertilization';
  category: 'environmental_restoration';
  
  requirements: {
    minAICapability: 1.5;          // Simpler than other geoeng
    minEconomicStage: 2;
    requiredInvestment: 20;        // Cheap!
    prerequisiteTechs: [];         // Can do early
  };
  
  monthlyResearchCost: 2.0;
  monthsToUnlock: 20;              // Fast
  
  effects: {
    // BENEFITS:
    phytoplanktonBoost: 0.03;      // Direct boost
    co2Sequestration: 0.008;       // Side benefit
    
    // RISKS:
    geoengRiskLevel: 0.4;          // 40% risk (moderate)
    deadZoneRisk: 0.3;             // Can cause anoxia
  };
}

// Deployment mechanics
function updateIronFertilization(state: GameState) {
  const tech = state.breakthroughTech.ironFertilization;
  if (!tech.unlocked) return;
  
  const aiCapability = calculateTotalAICapability(state);
  tech.deploymentQuality = Math.min(1.0, aiCapability / 2.0); // Easier than others
  
  const deployment = tech.deploymentLevel;
  
  // Benefits
  state.ocean.phytoplanktonPopulation += 0.03 * deployment * tech.deploymentQuality;
  state.co2.atmosphericCO2 -= 0.4 * deployment;
  
  // RISKS: Bloom die-off
  if (tech.deploymentQuality < 0.7) {
    const riskRoll = Math.random();
    const riskThreshold = (0.7 - tech.deploymentQuality) * 0.6; // Up to 40% risk
    
    if (riskRoll < riskThreshold) {
      // Bloom dies, consumes oxygen
      state.ocean.oxygenLevel -= 0.1;
      state.ocean.deadZoneExtent += 0.08;
      
      addEvent({
        type: 'crisis',
        title: '⚠️ Algae Bloom Crash',
        description: 'Iron fertilization caused massive phytoplankton bloom, but the bloom died and consumed oxygen. Dead zones expanding.',
        effects: { oxygen_crash: 1.0 }
      });
    }
  }
}
```

### Tech 4: Artificial Upwelling (Oxygenation)

**Mechanism:** Pump deep, nutrient-rich water to surface

**Real-world context:**
- Ocean Nourishment Corporation, Atmocean
- Mimics natural upwelling (very productive zones)
- Risks: Energy intensive, ecosystem disruption

**Game Implementation:**

```typescript
interface ArtificialUpwellingTech extends TechnologyNode {
  id: 'artificialUpwelling';
  name: 'Artificial Ocean Upwelling';
  category: 'environmental_restoration';
  
  requirements: {
    minAICapability: 2.5;
    minEconomicStage: 3;
    requiredInvestment: 60;        // Energy intensive
    prerequisiteTechs: ['cleanEnergy', 'fusion']; // Need abundant energy!
  };
  
  monthlyResearchCost: 6.0;
  monthsToUnlock: 35;
  
  effects: {
    oxygenBoost: 0.025;            // Direct oxygenation
    nutrientBoost: 0.02;           // Supports ecosystem
    fishStockRecovery: 0.015;      // Productive zones
    
    geoengRiskLevel: 0.2;          // Lower risk (mimics nature)
  };
}
```

---

## 🎯 STRATEGIC GAMEPLAY

### The Geoengineering Dilemma

**Early game (AI capability 1.5-2.0):**
- Ocean starting to degrade
- Iron Fertilization available (cheap, fast)
- **BUT:** 40% risk of making it worse
- **Decision:** Risk it early? Or wait for better AI?

**Mid game (AI capability 2.5-3.0):**
- Ocean in crisis (pH < 7.9, oxygen < 60%)
- Ocean Alkalinity available
- Artificial Upwelling available (if fusion unlocked)
- **BUT:** Still 20-30% risk
- **Decision:** Deploy now and risk disaster? Or watch ocean die?

**Late game (AI capability 3.5-4.5):**
- Ocean may be past point of no return
- Bioengineered Cleaners available (powerful but risky!)
- If done right: Full restoration possible
- If done wrong: Catastrophic invasive species
- **Decision:** Roll the dice on salvation vs extinction?

### Risk vs Reward Matrix

```
Tech                    Unlock Time   Cost    Risk    Reward   AI Needed
──────────────────────────────────────────────────────────────────────────
Iron Fertilization      Month 20      $20B    40%     Medium   1.5
Ocean Alkalinity        Month 40      $50B    30%     High     2.0
Artificial Upwelling    Month 50      $60B    20%     Medium   2.5
Bioengineered Cleaners  Month 60      $80B    60%     HUGE     3.0
```

### Success Paths

**Conservative Path:**
- Wait for AI 3.0+ before deploying geoeng
- Accept some ocean damage in meantime
- Deploy safely when ready
- Lower risk, slower recovery

**Aggressive Path:**
- Deploy Iron Fert at Month 20 (AI only 1.5)
- 40% chance of success (phyto boost, CO2 down)
- 40% chance of disaster (dead zones expand)
- High risk, fast action

**Desperate Path:**
- Ocean past point of no return
- MUST deploy Bioengineered Cleaners
- 60% chance of catastrophic failure
- 40% chance of miraculous recovery
- Hail Mary

---

## 🔗 INTEGRATION WITH RESOURCE ECONOMY

### Ocean Health Affects Resources

```typescript
// Fisheries collapse → food crisis
state.resources.food.reserves -= (1 - ocean.fishStocks) * 0.02;

// Dead oceans → oxygen crisis → QoL health
state.qol.health -= (1 - ocean.oxygenLevel) * 0.15;

// Anoxic event → extinction
if (ocean.oxygenLevel < 0.1) {
  state.extinctionState.mechanism = 'anoxic_ocean';
}
```

### Resource Extraction Harms Oceans

```typescript
// From planned resource economy:
ocean.pollutionLoad += 
  resources.lithium.monthlyExtraction * 0.02 +
  resources.rareEarths.monthlyExtraction * 0.03 +
  resources.oil.spills * 0.5;
```

### Clean Tech Helps Oceans

```typescript
// Less fossil fuels = less CO2 = less acidification
ocean.pH += (energySources.renewable / energySources.fossil) * 0.001;

// Circular economy = less mining = less pollution
ocean.pollutionLoad -= state.resources.circularityIndex * 0.01;
```

---

## 📊 IMPLEMENTATION ESTIMATE

**Phase 1: Ocean Health State (2-3 hours)**
- Add OceanHealth interface
- Initialize values
- Basic degradation mechanics

**Phase 2: Degradation Sources (2 hours)**
- Link to CO2 (from resource economy)
- Link to mining (from resource economy)
- Link to warming (from climate)
- Death spiral mechanics

**Phase 3: Geoengineering Technologies (4-5 hours)**
- Implement 4 restoration techs
- Risk/reward mechanics
- Catastrophic failure scenarios
- Recovery mechanics

**Phase 4: Integration & Balance (2-3 hours)**
- Link ocean → food → QoL
- Tune degradation rates
- Tune restoration effectiveness
- Test risk thresholds

**Total: 10-13 hours** (1.5 days)

---

## 🎯 SUCCESS METRICS

### Quantitative
- ✅ Ocean can die (anoxic event)
- ✅ Geoengineering can restore OR destroy
- ✅ Risk scales with AI capability
- ✅ Point of no return exists
- ✅ Affects food, oxygen, biodiversity

### Qualitative
- ✅ Tense decisions (when to deploy risky tech?)
- ✅ Realistic (based on real geoeng proposals)
- ✅ Educational (shows ocean importance)
- ✅ Dual-use (can help or harm)

---

## 📚 RESEARCH BASIS

### Ocean Science
- IPCC Ocean Report (2019): Acidification, warming
- Caldeira & Wickett (2003): pH projections
- Diaz & Rosenberg (2008): Dead zones
- Jenkyns (2010): Anoxic events in Earth history

### Geoengineering
- Royal Society (2009): Geoengineering the Climate
- Boyd et al. (2007): Iron fertilization review
- Rau (2008): Ocean alkalinity enhancement
- Church et al. (2012): Synthetic biology risks

### Existential Risk
- Toby Ord (2020): "The Precipice" (geoengineering risks)
- Bostrom (2002): Existential risks from technology

---

**Status:** 📝 **COMPREHENSIVE PLAN READY**

**Next Steps:**
1. Wait for Monte Carlo test to complete
2. Implement ocean health alongside resource economy
3. Test geoengineering mechanics
4. Balance risk thresholds

🌊 **"The cure for anything is salt water: sweat, tears, or the sea... but we're running out of the third one."** 🌊

