# TIER 2.8: Hegemonic Powers & Colonial Extraction - IMPLEMENTATION PLAN

**Date:** October 13, 2025
**Status:** READY FOR IMPLEMENTATION
**Revised Estimate:** 33-42 hours (down from 51-65h)
**Priority:** CRITICAL (Foundational restructuring)

---

## 🎉 **MAJOR DISCOVERY: Country System Already Exists!**

**What We Found:**
- ✅ **15 countries tracked** (TIER 1.7.2) with full population dynamics
- ✅ **Strategic importance flags**: `isNuclearPower`, `isAIHub`, `isMajorEconomy`
- ✅ **Depopulation mechanics**: Country-level collapse detection (< 100K = depopulated)
- ✅ **Region assignments**: Each country already has a region
- ✅ **Crisis death tracking**: Per-country mortality tracking
- ✅ **Integration with organizations**: Orgs die when country depopulates

**Files:**
- `src/types/countryPopulations.ts` (78 lines)
- `src/simulation/countryPopulations.ts` (386 lines)

**What This Means:**
- **18-23 hours saved** from original estimate!
- Foundation already exists for hegemonic power system
- Can extend countries instead of creating new entities
- Population/region/strategic scaffolding complete

---

## 🏗️ **REVISED ARCHITECTURE**

### **Strategy: Extend Countries, Not Create Hegemons**

**Instead of:**
```typescript
// Creating separate HegemonicPower entities
powers: HegemonicPower[] // New system
regions: ResourceRegion[] // New system
```

**We'll do:**
```typescript
// Extend existing CountryPopulation interface
interface CountryPopulation {
  // ... existing fields ...

  // NEW: Hegemonic power status
  isHegemon: boolean;

  // NEW: Resources & extraction
  resources: ResourceEndowment;
  resourceSovereignty: number;
  extractedResources: ResourceEndowment;
  extractionTargets: Map<CountryName, ExtractionFlow>;

  // NEW: Military system
  militaryCapability: number;
  militarySpending: number;
  militaryCO2Emissions: number;
  militaryBases: Map<CountryName, number>;
  activeInterventions: MilitaryIntervention[];

  // NEW: War-meaning feedback
  meaningCrisis: number; // From social system
  nationalismStrength: number;
  warMotivation: number;

  // NEW: Environmental debt
  historicalEmissions: number;
  climateSufferingRatio: number; // vulnerability / emissions
}
```

**Benefits:**
- Reuses existing 15 countries (no new entities)
- 5 countries flagged as hegemons (US, China, Russia, India, UK/France/Germany as EU proxy)
- Rest become resource regions (exploited periphery)
- Depopulation mechanics already work
- Organization survival already integrated

---

## 📋 **IMPLEMENTATION PHASES**

---

## **PHASE 1: Resource Endowments & Sovereignty (8-10h)**

### **Task 1.1: Define Resource Endowment Types (1h)**

**File:** `src/types/resourceEndowment.ts` (NEW)

```typescript
/**
 * Resource Endowment
 * What natural resources a country/region has access to
 */
export interface ResourceEndowment {
  // Energy resources [0-1 scale, 1 = abundant]
  fossilFuels: number;           // Oil, gas, coal
  renewableCapacity: number;     // Solar, wind, hydro potential

  // Strategic minerals
  rareEarths: number;            // Tech-critical (China dominates 80%)
  lithium: number;               // Batteries (Chile, Australia, China)
  uranium: number;               // Nuclear energy/weapons

  // Industrial materials
  iron: number;                  // Steel production
  copper: number;                // Electronics, infrastructure

  // Biological resources
  arableLand: number;            // Food production capacity
  freshwater: number;            // Water resources
  timber: number;                // Forests

  // Human capital
  labor: number;                 // Population as resource (exploited)
  education: number;             // Skilled workforce
}

/** Baseline 2025 resource data for each country */
export const COUNTRY_RESOURCES_2025: Record<CountryName, ResourceEndowment>;
```

**Research needed:**
- USGS Mineral Commodity Summaries 2025
- World Bank natural resource rents data
- IEA renewable energy potential maps

**Deliverable:** Resource data for all 15 countries

---

### **Task 1.2: Extend CountryPopulation Type (2h)**

**File:** `src/types/countryPopulations.ts` (MODIFY)

Add to `CountryPopulation` interface:

```typescript
export interface CountryPopulation {
  // ... existing fields (name, population, birthRate, etc.) ...

  // === HEGEMONIC STATUS (NEW) ===
  isHegemon: boolean;                    // US, China, Russia, India, UK (5 total)
  hegemonTier: 'superpower' | 'major' | 'regional' | null;

  // === RESOURCE CONTROL (NEW) ===
  domesticResources: ResourceEndowment;  // Own resource base
  extractedResources: ResourceEndowment; // Taken from other countries
  resourceSovereignty: number;           // [0,1] Control over own resources
  resourceDependence: number;            // [0,1] How much needs imports/extraction
  wealthRetained: number;                // % of resource wealth kept locally

  // === MILITARY SYSTEM (NEW) ===
  militaryCapability: number;            // [0,1] Force projection ability
  militarySpending: number;              // $B per year
  militarySpendingGDPPercent: number;    // % of GDP
  militaryCO2Emissions: number;          // Tons CO2 per year
  militaryBases: Map<CountryName, number>; // Bases in other countries
  interventionCapability: number;        // [0,1] Can destabilize other countries

  // === EXTRACTION RELATIONSHIPS (NEW) ===
  extractionTargets: ExtractionFlow[];   // Who this country extracts from
  extractedBy: ExtractionFlow[];         // Who extracts from this country
  colonialHistory: ColonialHistory;      // Historical colonial ties

  // === WAR-MEANING FEEDBACK (NEW) ===
  meaningCrisis: number;                 // [0,1] From social accumulation
  nationalismStrength: number;           // [0,1] War as substitute meaning
  publicSupportForWar: number;           // [0,1] Population war appetite
  warMotivation: number;                 // [0,1] Likelihood of intervention

  // === ENVIRONMENTAL DEBT (NEW) ===
  historicalEmissions: number;           // Cumulative tons CO2 since 1850
  currentEmissions: number;              // Tons CO2 per year
  climateVulnerability: number;          // [0,1] Already exists!
  climateSufferingRatio: number;         // vulnerability / (emissions / global avg)
  climateReparationsPaid: number;        // $B paid to vulnerable countries
  climateReparationsReceived: number;    // $B received from hegemons
}
```

**Deliverable:** Updated type definitions

---

### **Task 1.3: Define Extraction Flow Types (2h)**

**File:** `src/types/extraction.ts` (NEW)

```typescript
/**
 * Extraction Flow
 * Tracks who extracts resources from whom, through which mechanisms
 */
export interface ExtractionFlow {
  // Parties
  extractingCountry: CountryName;        // Hegemon doing extraction
  sourceCountry: CountryName;            // Country being extracted from

  // Metrics
  extractionRate: number;                // % of source's resources per year
  annualValueExtracted: number;          // $B per year leaving source
  localBenefit: number;                  // [0,0.3] How much source keeps (10-20% typical)

  // Enforcement
  militaryPresence: number;              // Troops/bases protecting extraction
  enforcementCost: number;               // $B per year for military presence
  localResistance: number;               // [0,1] Opposition to extraction

  // Mechanism
  mechanism: ExtractionMechanism;
  startYear: number;                     // When extraction began
  active: boolean;                       // Can be disrupted/ended

  // Legitimacy
  publicJustification: string;           // "Investment", "Free trade", etc.
  actualMechanism: string;               // "Debt trap", "Resource curse", etc.
}

export type ExtractionMechanism =
  | 'colonial'       // Historical colonialism (pre-1975, mostly ended)
  | 'corporate'      // Mining companies extract, profits leave
  | 'debt'           // IMF loans → austerity → sell resources cheap
  | 'military'       // Bases protect extraction, coup if resist
  | 'unequal_trade'; // Cheap resources for expensive manufactured goods

export interface ColonialHistory {
  wasColonized: boolean;
  colonialPower: CountryName | null;     // Which hegemon colonized
  colonialStartYear: number;             // When colonization began
  colonialEndYear: number;               // When independence occurred
  extractionDuration: number;            // Years of colonial extraction
  cumulativeWealthExtracted: number;     // Total $B extracted during colonialism
  institutionalDamage: number;           // [0,1] Lasting institutional weakness
}
```

**Deliverable:** Extraction type system

---

### **Task 1.4: Initialize Resource Data (3-4h)**

**File:** `src/simulation/countryPopulations.ts` (MODIFY)

Update `initializeCountryPopulations()` to include:

1. **Resource endowments** for each country (research-based)
2. **Hegemonic status** (5 hegemons: US, China, Russia, India, UK)
3. **Military capabilities** (spending, emissions, bases)
4. **Historical emissions** (cumulative CO2 since 1850)
5. **Colonial history** (who colonized whom)

**Research sources:**
- USGS: Mineral resources by country
- World Bank: Natural resource rents
- SIPRI: Military spending 2024
- Global Carbon Project: Historical emissions
- Historical colonial maps: Duration, independence dates

**Example:**
```typescript
'United States': {
  // ... existing population data ...

  // NEW: Hegemonic status
  isHegemon: true,
  hegemonTier: 'superpower',

  // NEW: Resources
  domesticResources: {
    fossilFuels: 0.95,      // 2nd largest oil producer
    rareEarths: 0.3,        // Limited, imports from China
    lithium: 0.4,           // Some domestic, imports from Chile
    uranium: 0.8,           // 4th largest producer
    iron: 0.6,
    copper: 0.7,
    arableLand: 0.9,        // Massive agricultural capacity
    freshwater: 0.85,       // Abundant
    timber: 0.8,
    labor: 0.9,             // 335M people
    education: 0.85         // High skilled workforce
  },
  extractedResources: {
    // Initially zero, updated by extraction system
  },
  resourceSovereignty: 0.95,  // High control
  resourceDependence: 0.3,    // Some imports (rare earths, oil)

  // NEW: Military
  militaryCapability: 1.0,    // Highest global force projection
  militarySpending: 850,      // $850B/year (2024)
  militarySpendingGDPPercent: 3.5,
  militaryCO2Emissions: 59000000, // 59M tons/year (2017 data)
  militaryBases: new Map([
    ['Germany', 30],          // Ramstein, etc.
    ['Japan', 55],            // Okinawa, etc.
    ['United Kingdom', 8],
    // ... 750+ bases globally
  ]),
  interventionCapability: 1.0,

  // NEW: Colonial history
  colonialHistory: {
    wasColonized: false,      // Never colonized
    colonialPower: null,
    colonialStartYear: 0,
    colonialEndYear: 0,
    extractionDuration: 0,
    cumulativeWealthExtracted: 0,
    institutionalDamage: 0
  },

  // NEW: Environmental debt
  historicalEmissions: 400000000000, // 400 Gt CO2 (25% of global total)
  currentEmissions: 5000000000,      // 5 Gt CO2/year
  climateSufferingRatio: 0.2,        // Low vulnerability / high emissions
  climateReparationsPaid: 0,
  climateReparationsReceived: 0
}
```

**Deliverable:** All 15 countries initialized with resource/military/environmental data

---

## **PHASE 2: Military System & Interventions (8-10h)**

### **Task 2.1: Define Military Intervention Types (2h)**

**File:** `src/types/military.ts` (NEW)

```typescript
/**
 * Military Intervention
 * How hegemons use force to secure extraction, destabilize rivals, create refugees
 */
export interface MilitaryIntervention {
  id: string;                            // Unique ID
  hegemon: CountryName;                  // Which hegemon intervening
  targetCountry: CountryName;            // Target (must be a tracked country)
  startMonth: number;
  endMonth: number | null;               // null = ongoing

  // Type & scale
  interventionType: InterventionType;
  scale: number;                         // [0,1] Size of intervention
  duration: number;                      // Months active

  // Stated vs actual goals
  publicJustification: string;           // "Spreading democracy", "Fighting terrorism"
  actualGoal: ActualGoal;

  // Effects on target
  regionalInstability: number;           // [0,1] How much destabilization
  refugeesCreated: number;               // Millions displaced
  civilianCasualties: number;            // Deaths
  infrastructureDestruction: number;     // [0,1] Damage to target country
  economicDamage: number;                // $B in losses

  // Costs to hegemon
  co2Emissions: number;                  // Tons per month
  economicCost: number;                  // $B spent
  diplomaticCost: number;                // Loss of soft power

  // Domestic effects (on hegemon)
  publicSupport: number;                 // [0,1] Does population support war?
  meaningBoost: number;                  // [0,1] War as national purpose
  economicStimulus: number;              // $B economic activity from war
  aiDevelopmentBoost: number;            // [0,1] Military R&D → AI advancement
  veteranTrauma: number;                 // [0,1] PTSD, moral injury

  // Success metrics
  goalAchieved: boolean;
  extractionSecured: boolean;
  rivalContained: boolean;
}

export type InterventionType =
  | 'regime_change'      // Overthrow government (US in Iraq, Libya)
  | 'proxy_war'          // Support local faction (Syria, Yemen)
  | 'occupation'         // Long-term presence (Afghanistan)
  | 'coup_support'       // Destabilization (CIA-style)
  | 'resource_securing'  // Protect extraction
  | 'rival_containment'; // Block other hegemon

export type ActualGoal =
  | 'resource_extraction'     // Secure oil, minerals
  | 'block_rival_power'       // Prevent China/Russia influence
  | 'maintain_extraction'     // Protect existing flows
  | 'create_instability'      // Destabilize to prevent regional power
  | 'domestic_distraction';   // War as meaning substitute
```

**Deliverable:** Military intervention type system

---

### **Task 2.2: Implement Military CO2 Emissions (1h)**

**File:** `src/simulation/military.ts` (NEW)

```typescript
/**
 * Calculate military CO2 emissions for each hegemon
 * Research: US military = 59M tons/year (more than 140 countries combined)
 */
export function calculateMilitaryCO2Emissions(country: CountryPopulation): number {
  if (!country.isHegemon) {
    return country.militarySpending * 10000; // Non-hegemons: ~10K tons per $B
  }

  // Hegemons: Massive global footprint
  const baseEmissions = country.militarySpending * 70000; // ~70K tons per $B

  // Bases abroad increase emissions (transport, operations)
  const baseCount = Array.from(country.militaryBases.values()).reduce((sum, count) => sum + count, 0);
  const baseEmissions = baseCount * 100000; // 100K tons per base

  // Active interventions massively increase emissions
  const interventionEmissions = country.activeInterventions.reduce((sum, intervention) => {
    return sum + (intervention.scale * 1000000); // Up to 1M tons per intervention
  }, 0);

  return baseEmissions + baseEmissions + interventionEmissions;
}
```

**Deliverable:** Military emissions calculation integrated

---

### **Task 2.3: Implement Intervention Triggers (3h)**

**File:** `src/simulation/military.ts`

```typescript
/**
 * Determine if a hegemon will launch a military intervention
 * Based on: War motivation, resource needs, rival presence
 */
export function checkForInterventions(state: GameState): MilitaryIntervention[] {
  const newInterventions: MilitaryIntervention[] = [];

  for (const countryName of Object.keys(state.countryPopulationSystem.countries) as CountryName[]) {
    const country = state.countryPopulationSystem.countries[countryName];

    if (!country.isHegemon) continue;

    // Calculate intervention probability
    const interventionProb = calculateInterventionProbability(country, state);

    if (Math.random() < interventionProb) {
      // Select target based on resources + rival presence
      const target = selectInterventionTarget(country, state);

      if (target) {
        const intervention = createIntervention(country, target, state);
        newInterventions.push(intervention);
      }
    }
  }

  return newInterventions;
}

function calculateInterventionProbability(hegemon: CountryPopulation, state: GameState): number {
  let prob = 0;

  // Base: War motivation (from meaning crisis)
  prob += hegemon.warMotivation * 0.3;

  // Resource dependence (need extraction)
  prob += hegemon.resourceDependence * 0.2;

  // Meaning crisis (war as substitute)
  prob += hegemon.meaningCrisis * 0.15;

  // Economic pressure (war as stimulus)
  const unemploymentRate = state.society.unemploymentLevel;
  prob += unemploymentRate * 0.15;

  // Public support for war
  prob += hegemon.publicSupportForWar * 0.2;

  // Monthly probability: 0-5% per month (rare but possible)
  return Math.min(0.05, prob);
}

function selectInterventionTarget(hegemon: CountryPopulation, state: GameState): CountryName | null {
  // Prefer targets with:
  // 1. High resource endowment
  // 2. Low military sovereignty
  // 3. Rival hegemon presence (for containment)
  // 4. Historical colonial ties

  const candidates: Array<{ country: CountryName; score: number }> = [];

  for (const targetName of Object.keys(state.countryPopulationSystem.countries) as CountryName[]) {
    if (targetName === hegemon.name) continue;
    const target = state.countryPopulationSystem.countries[targetName];

    if (target.isHegemon) continue; // Don't directly attack other hegemons (too risky)

    let score = 0;

    // Resource value
    const resourceValue = calculateResourceValue(target.domesticResources);
    score += resourceValue * 0.4;

    // Vulnerability
    score += (1 - target.militarySovereignty) * 0.3;

    // Colonial history (easier to intervene)
    if (target.colonialHistory.colonialPower === hegemon.name) {
      score += 0.2;
    }

    // Rival presence (containment goal)
    const rivalBases = countRivalBases(target, hegemon, state);
    score += rivalBases * 0.1;

    candidates.push({ country: targetName, score });
  }

  if (candidates.length === 0) return null;

  // Select probabilistically (higher score = more likely)
  const totalScore = candidates.reduce((sum, c) => sum + c.score, 0);
  let roll = Math.random() * totalScore;

  for (const candidate of candidates) {
    roll -= candidate.score;
    if (roll <= 0) return candidate.country;
  }

  return candidates[0].country; // Fallback
}
```

**Deliverable:** Intervention triggering system

---

### **Task 2.4: Implement Intervention Effects (2-3h)**

**File:** `src/simulation/military.ts`

```typescript
/**
 * Update active interventions and apply effects
 */
export function updateMilitaryInterventions(state: GameState): void {
  const sys = state.countryPopulationSystem;

  // Check for new interventions
  const newInterventions = checkForInterventions(state);

  for (const intervention of newInterventions) {
    const hegemon = sys.countries[intervention.hegemon];
    hegemon.activeInterventions.push(intervention);

    console.log(`\n\u26a0\ufe0f  MILITARY INTERVENTION: ${intervention.hegemon} → ${intervention.targetCountry}`);
    console.log(`   Type: ${intervention.interventionType}`);
    console.log(`   Public justification: "${intervention.publicJustification}"`);
    console.log(`   Actual goal: ${intervention.actualGoal}`);
  }

  // Update all active interventions
  for (const countryName of Object.keys(sys.countries) as CountryName[]) {
    const country = sys.countries[countryName];

    for (const intervention of country.activeInterventions) {
      if (!intervention.endMonth) {
        updateIntervention(intervention, country, state);
      }
    }
  }
}

function updateIntervention(
  intervention: MilitaryIntervention,
  hegemon: CountryPopulation,
  state: GameState
): void {
  intervention.duration++;

  const target = state.countryPopulationSystem.countries[intervention.targetCountry];

  // === EFFECTS ON TARGET COUNTRY ===

  // 1. Regional instability
  target.politicalStability *= (1 - intervention.regionalInstability * 0.05);

  // 2. Refugees created (connect to existing refugee system)
  const monthlyRefugees = intervention.scale * 0.5; // Up to 500K per month at full scale
  intervention.refugeesCreated += monthlyRefugees;

  // Create refugee crisis (integrate with existing system)
  if (state.humanPopulationSystem.regionalPopulations) {
    const targetRegion = state.humanPopulationSystem.regionalPopulations.find(
      r => r.name === target.region
    );
    if (targetRegion) {
      targetRegion.emigrationPressure += monthlyRefugees;
    }
  }

  // 3. Civilian casualties
  const monthlyCasualties = intervention.scale * 0.1; // Up to 100K per month
  intervention.civilianCasualties += monthlyCasualties;
  addAcuteCrisisDeaths(state, monthlyCasualties / target.population,
    `Military intervention by ${intervention.hegemon}`, 1.0, 'war');

  // 4. Infrastructure destruction
  target.infrastructureQuality *= (1 - intervention.scale * 0.02);

  // === COSTS TO HEGEMON ===

  // 1. CO2 emissions
  const monthlyEmissions = intervention.scale * 1000000; // Up to 1M tons per month
  intervention.co2Emissions += monthlyEmissions;
  hegemon.militaryCO2Emissions += monthlyEmissions;
  hegemon.currentEmissions += monthlyEmissions;

  // 2. Economic cost
  const monthlyCost = intervention.scale * 10; // Up to $10B per month
  intervention.economicCost += monthlyCost;

  // 3. Public support degradation (war fatigue)
  intervention.publicSupport *= 0.995; // -0.5% per month

  // === DOMESTIC EFFECTS (ON HEGEMON) ===

  // 1. Meaning boost (short-term)
  hegemon.meaningCrisis *= (1 - intervention.meaningBoost * 0.01);

  // 2. Economic stimulus (military-industrial complex)
  intervention.economicStimulus = monthlyCost * 0.7; // 70% stays in domestic economy

  // 3. AI development boost (military R&D)
  intervention.aiDevelopmentBoost = intervention.scale * 0.05; // Applied to AI research

  // 4. Veteran trauma (accumulates)
  intervention.veteranTrauma += intervention.scale * 0.001; // Slow accumulation
  hegemon.meaningCrisis += intervention.veteranTrauma * 0.005; // Feeds back to meaning crisis

  // === TERMINATION CONDITIONS ===

  // End intervention if:
  // - Public support too low (< 20%)
  // - Goal achieved
  // - Duration too long (> 120 months)
  // - Target country depopulated

  if (intervention.publicSupport < 0.2 ||
      intervention.duration > 120 ||
      target.depopulated) {
    intervention.endMonth = state.currentMonth;
    console.log(`\n\u2705 INTERVENTION ENDED: ${intervention.hegemon} withdraws from ${intervention.targetCountry}`);
    console.log(`   Duration: ${intervention.duration} months`);
    console.log(`   Refugees created: ${(intervention.refugeesCreated).toFixed(1)}M`);
    console.log(`   Civilian casualties: ${(intervention.civilianCasualties).toFixed(1)}M`);
  }
}
```

**Deliverable:** Full intervention update system with effects

---

## **PHASE 3: War-Meaning Feedback Loop (6-8h)**

### **Task 3.1: Calculate War Motivation (2h)**

**File:** `src/simulation/warMeaningFeedback.ts` (NEW)

```typescript
/**
 * War-Meaning Feedback Loop
 * Key insight: Meaning crisis → nationalism → war motivation
 * But: Solve meaning → reduce war motivation
 */

import { GameState, CountryPopulation } from '@/types/game';
import { CountryName } from '@/types/countryPopulations';

/**
 * Update war motivation for all hegemons
 */
export function updateWarMeaningFeedback(state: GameState): void {
  for (const countryName of Object.keys(state.countryPopulationSystem.countries) as CountryName[]) {
    const country = state.countryPopulationSystem.countries[countryName];

    if (!country.isHegemon) continue;

    calculateWarMotivation(country, state);
  }
}

function calculateWarMotivation(hegemon: CountryPopulation, state: GameState): void {
  // === MEANING CRISIS DRIVERS ===

  // Base: Social meaning crisis (from existing meaning system)
  const socialMeaningCrisis = state.socialAccumulation.meaningCrisisLevel;

  // Economic precarity (unemployment, inequality)
  const unemploymentRate = state.society.unemploymentLevel;
  const economicPrecarity = Math.min(1.0, unemploymentRate * 1.5);

  // Social fragmentation (isolation, loneliness)
  const socialFragmentation = 1 - state.socialAccumulation.socialCohesion;

  // Combined meaning crisis
  hegemon.meaningCrisis = (
    socialMeaningCrisis * 0.5 +
    economicPrecarity * 0.3 +
    socialFragmentation * 0.2
  );

  // === NATIONALISM AS MEANING SUBSTITUTE ===

  // Base nationalism appeal (rises with meaning crisis)
  let nationalismAppeal = hegemon.meaningCrisis * 0.8;

  // Historical nationalism (some countries have stronger tradition)
  const historicalNationalism = hegemon.historicalEmissions > 200000000000 ? 0.2 : 0; // Colonial powers
  nationalismAppeal += historicalNationalism;

  // External threat perception (rival hegemons boost nationalism)
  const rivalThreat = calculateRivalThreat(hegemon, state);
  nationalismAppeal += rivalThreat * 0.3;

  hegemon.nationalismStrength = Math.min(1.0, nationalismAppeal);

  // === WAR AS UNIFIER ===

  // Active wars create shared purpose
  const activeWars = hegemon.activeInterventions.filter(i => !i.endMonth).length;
  const warUnificationEffect = Math.min(0.3, activeWars * 0.15);

  // === WAR TRAUMA (NEGATIVE FEEDBACK) ===

  // Veteran trauma from past/ongoing wars
  const veteranTrauma = hegemon.activeInterventions.reduce((sum, i) => {
    return sum + i.veteranTrauma;
  }, 0);

  // Moral injury ("what did we do this for?")
  const moralInjury = veteranTrauma * 0.8;

  // === ALTERNATIVE PURPOSE (FROM TIER 2 MITIGATIONS) ===

  // Healthy meaning sources REDUCE war motivation
  const alternativePurpose = calculateAlternativePurpose(state);
  const alternativeEffect = alternativePurpose * -0.5; // Up to -50% war motivation

  // === THE KEY EQUATION ===

  hegemon.warMotivation = Math.max(0, Math.min(1.0,
    hegemon.meaningCrisis * hegemon.nationalismStrength +
    warUnificationEffect -
    moralInjury +
    alternativeEffect
  ));

  // === PUBLIC SUPPORT FOR WAR ===

  // Public support influenced by nationalism, media, existing wars
  hegemon.publicSupportForWar = Math.max(0, Math.min(1.0,
    hegemon.nationalismStrength * 0.6 +
    (hegemon.meaningCrisis > 0.7 ? 0.2 : 0) + // Desperation
    warUnificationEffect * 0.5 -
    veteranTrauma * 0.3
  ));
}

function calculateRivalThreat(hegemon: CountryPopulation, state: GameState): number {
  // Count rival hegemon military bases near this hegemon
  let threat = 0;

  for (const otherName of Object.keys(state.countryPopulationSystem.countries) as CountryName[]) {
    if (otherName === hegemon.name) continue;
    const other = state.countryPopulationSystem.countries[otherName];

    if (!other.isHegemon) continue;

    // Check if rival has bases in this hegemon's historical sphere of influence
    for (const [targetName, baseCount] of other.militaryBases) {
      const target = state.countryPopulationSystem.countries[targetName];

      // If rival has bases in countries this hegemon historically controlled
      if (target.colonialHistory.colonialPower === hegemon.name && baseCount > 0) {
        threat += baseCount * 0.02;
      }
    }
  }

  return Math.min(1.0, threat);
}

function calculateAlternativePurpose(state: GameState): number {
  // Aggregate healthy meaning sources from TIER 2 mitigations
  let total = 0;

  // AI nurturance (Constitutional AI, alignment research)
  const aiNurturance = (
    (state.breakthroughTech.advancedRLHF?.unlocked ? 0.2 : 0) +
    (state.breakthroughTech.mechanisticInterpretability?.deploymentLevel || 0) * 0.3
  );
  total += Math.min(1.0, aiNurturance);

  // Extinct species revival (de-extinction)
  const extinctionRevival = state.breakthroughTech.deExtinctionRewilding?.deploymentLevel || 0;
  total += extinctionRevival;

  // Ecosystem restoration (environmental techs)
  const ecosystemRestoration = Math.min(1.0,
    (state.breakthroughTech.ecosystemManagement?.deploymentLevel || 0) * 0.7 +
    (state.breakthroughTech.sustainableAgriculture?.deploymentLevel || 0) * 0.3
  );
  total += ecosystemRestoration;

  // Community meaning (purpose frameworks)
  const communityMeaning = (
    (state.breakthroughTech.purposeFrameworks?.deploymentLevel || 0) * 0.6 +
    (state.breakthroughTech.collectivePurposeNetworks?.deploymentLevel || 0) * 0.4
  );
  total += communityMeaning;

  // Animal communication (placeholder - TIER 5)
  // const animalCommunication = state.breakthroughTech.interspeciesComm?.deploymentLevel || 0;
  // total += animalCommunication;

  // Space colonization (placeholder - TIER 5.2)
  // const spaceColonization = state.spaceExploration?.marsColonization || 0;
  // total += spaceColonization * 0.5;

  return Math.min(5.0, total); // Can exceed 1.0 (multiple sources)
}
```

**Deliverable:** War-meaning feedback loop fully functional

---

### **Task 3.2: Integrate with Meaning System (1h)**

**File:** `src/simulation/meaningRenaissance.ts` (MODIFY)

Add war-meaning feedback effects:

```typescript
// In updateMeaningCrisis() or similar function:

// War creates temporary meaning boost (nationalism, shared purpose)
if (state.countryPopulationSystem) {
  let warMeaningBoost = 0;

  for (const countryName of Object.keys(state.countryPopulationSystem.countries) as CountryName[]) {
    const country = state.countryPopulationSystem.countries[countryName];

    if (country.isHegemon && country.activeInterventions.length > 0) {
      // Active wars temporarily reduce meaning crisis
      warMeaningBoost += country.activeInterventions.length * 0.05;
    }
  }

  // But this is SHORT-TERM and unsustainable
  social.meaningCrisisLevel *= (1 - warMeaningBoost * 0.5);

  // Add veteran trauma back (LONG-TERM increase)
  // This creates the feedback loop
}
```

**Deliverable:** Meaning system integrated with war dynamics

---

### **Task 3.3: Add Parental Fulfillment Mechanics (2-3h)**

**File:** `src/simulation/warMeaningFeedback.ts`

Implement the parental instinct hypothesis:

```typescript
/**
 * Parental Fulfillment System
 * User insight: "Becoming a mom dulled my lust for war"
 * Mechanism: Finding genuine things to nurture makes conquest obsolete
 */
export function updateParentalFulfillment(state: GameState): void {
  for (const countryName of Object.keys(state.countryPopulationSystem.countries) as CountryName[]) {
    const country = state.countryPopulationSystem.countries[countryName];

    if (!country.isHegemon) continue;

    // Calculate parental fulfillment from non-zero-sum nurturing
    const parentalFulfillment = calculateAlternativePurpose(state);

    // KEY EFFECT: High fulfillment DRASTICALLY reduces war motivation
    if (parentalFulfillment > 2.0) {
      // Once you have things that genuinely need nurturing, war becomes pointless
      country.warMotivation *= 0.3;           // 70% reduction
      country.nationalismStrength *= 0.4;     // "Our people" less important
      country.resourceDependence *= 0.7;      // Less extractive mindset
      country.publicSupportForWar *= 0.5;     // War loses appeal

      console.log(`\n✨ PARENTAL FULFILLMENT: ${countryName} war motivation drops to ${(country.warMotivation * 100).toFixed(1)}%`);
      console.log(`   AI nurturance + extinction revival + ecosystem restoration = ${parentalFulfillment.toFixed(2)}`);
      console.log(`   "Can't force-parent neighbors when busy actually parenting"`);
    }
  }
}
```

**Deliverable:** Parental fulfillment reduces war (utopia pathway)

---

## **PHASE 4: Environmental Debt & Climate Justice (5-6h)**

### **Task 4.1: Calculate Historical Emissions (1h)**

**File:** `src/simulation/climateJustice.ts` (NEW)

```typescript
/**
 * Environmental Debt System
 * Models who caused climate change vs who suffers from it
 */

import { GameState, CountryPopulation } from '@/types/game';
import { CountryName } from '@/types/countryPopulations';

/**
 * Calculate climate suffering ratio for each country
 * Ratio = climateVulnerability / (historicalEmissions / global average)
 */
export function calculateClimateSufferingRatios(state: GameState): void {
  const sys = state.countryPopulationSystem;
  const countries = Object.values(sys.countries);

  // Calculate global average emissions per capita (historical)
  const totalHistoricalEmissions = countries.reduce((sum, c) => sum + c.historicalEmissions, 0);
  const totalPopulation = countries.reduce((sum, c) => sum + c.population, 0);
  const globalAvgPerCapita = totalHistoricalEmissions / totalPopulation;

  for (const country of countries) {
    const perCapitaEmissions = country.historicalEmissions / country.population;
    const emissionsRatio = perCapitaEmissions / globalAvgPerCapita;

    // Suffering ratio = vulnerability / emissions responsibility
    // High ratio = suffer a lot, caused little (injustice)
    // Low ratio = suffer little, caused a lot (perpetrator)
    country.climateSufferingRatio = country.climateVulnerability / Math.max(0.1, emissionsRatio);
  }
}
```

**Deliverable:** Climate justice metrics calculated

---

### **Task 4.2: Implement Climate Reparations (2h)**

**File:** `src/simulation/climateJustice.ts`

```typescript
/**
 * Climate Reparations System
 * Hegemons can choose to pay reparations to vulnerable countries
 * (or ignore and face increased refugee flows + instability)
 */
export function checkClimateReparations(state: GameState): void {
  const sys = state.countryPopulationSystem;

  for (const hegemonName of Object.keys(sys.countries) as CountryName[]) {
    const hegemon = sys.countries[hegemonName];

    if (!hegemon.isHegemon) continue;

    // Calculate reparations obligation (based on historical emissions)
    const obligation = calculateReparationsObligation(hegemon, state);

    // Government can choose to pay (or not)
    // For now: Automatic if governance quality high + ecological spiral active
    const willPay = shouldPayReparations(hegemon, state);

    if (willPay && obligation > 0) {
      const payment = Math.min(obligation * 0.1, hegemon.wealth * 0.02); // Up to 2% of GDP

      // Distribute to vulnerable countries (high suffering ratio)
      distributeReparations(payment, state);

      hegemon.climateReparationsPaid += payment;

      console.log(`\n💚 CLIMATE REPARATIONS: ${hegemonName} pays $${payment.toFixed(1)}B`);
      console.log(`   Distributed to vulnerable countries with high climate suffering ratios`);

      // EFFECTS
      // - Reduces refugee pressure (vulnerable countries stabilize)
      // - Increases trust/legitimacy
      // - Reduces nationalist backlash

      if (state.government) {
        state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.05);
      }
    }
  }
}

function calculateReparationsObligation(hegemon: CountryPopulation, state: GameState): number {
  // Obligation scales with historical emissions
  const emissionsShare = hegemon.historicalEmissions / 1500000000000; // Out of ~1500 Gt total
  const globalGDP = 100000; // ~$100T global GDP

  // "Fair share" = % of emissions × $100T × 1% per year
  return emissionsShare * globalGDP * 0.01;
}

function shouldPayReparations(hegemon: CountryPopulation, state: GameState): boolean {
  // Pay if:
  // - Governance quality high (functional institutions)
  // - Ecological spiral active (environmental awareness)
  // - Parental fulfillment high (nurturing mindset)
  // - Meaning crisis low (not desperate)

  const govQuality = state.government?.governanceQuality?.institutionalCapacity || 0.5;
  const ecologicalSpiral = state.spiralDynamics?.ecologicalSpiral || 0;
  const parentalFulfillment = calculateAlternativePurpose(state);

  return (
    govQuality > 0.7 &&
    ecologicalSpiral > 0.3 &&
    parentalFulfillment > 1.5 &&
    hegemon.meaningCrisis < 0.5
  );
}

function distributeReparations(totalPayment: number, state: GameState): void {
  const sys = state.countryPopulationSystem;
  const recipients: CountryPopulation[] = [];

  // Find vulnerable countries (high suffering ratio)
  for (const country of Object.values(sys.countries)) {
    if (country.climateSufferingRatio > 2.0) {
      recipients.push(country);
    }
  }

  if (recipients.length === 0) return;

  // Distribute proportional to suffering ratio
  const totalSuffering = recipients.reduce((sum, c) => sum + c.climateSufferingRatio, 0);

  for (const recipient of recipients) {
    const share = (recipient.climateSufferingRatio / totalSuffering) * totalPayment;
    recipient.climateReparationsReceived += share;

    // EFFECTS on recipient
    // - Increases carrying capacity (can adapt to climate change)
    // - Reduces emigration pressure
    // - Improves infrastructure

    recipient.carryingCapacity *= (1 + share / 1000); // Small boost per $1B

    if (state.humanPopulationSystem.regionalPopulations) {
      const region = state.humanPopulationSystem.regionalPopulations.find(
        r => r.name === recipient.region
      );
      if (region) {
        region.emigrationPressure *= (1 - share / 100); // Reduces refugee pressure
      }
    }
  }
}
```

**Deliverable:** Climate reparations system functional

---

### **Task 4.3: Track Military Emissions (1h)**

**File:** `src/simulation/environmental.ts` (MODIFY)

Integrate military CO2 into environmental accumulation:

```typescript
// In updateEnvironmentalAccumulation() or similar:

// Add military emissions to climate change
if (state.countryPopulationSystem) {
  let totalMilitaryCO2 = 0;

  for (const country of Object.values(state.countryPopulationSystem.countries)) {
    if (country.isHegemon) {
      totalMilitaryCO2 += calculateMilitaryCO2Emissions(country);
      country.militaryCO2Emissions = totalMilitaryCO2; // Update country tracking
    }
  }

  // Military emissions are USUALLY INVISIBLE in climate accounting
  // But we track them explicitly here
  const militaryClimateImpact = totalMilitaryCO2 / 50000000000; // Normalize to [0-1]
  env.climateStability -= militaryClimateImpact * 0.01; // Small but measurable impact

  // Log if significant
  if (totalMilitaryCO2 > 100000000) { // > 100M tons
    console.log(`\n🏭 MILITARY EMISSIONS: ${(totalMilitaryCO2 / 1000000).toFixed(1)}M tons CO2`);
    console.log(`   Often invisible in climate accounting, but tracked here`);
  }
}
```

**Deliverable:** Military emissions integrated into climate system

---

## **PHASE 5: Extraction Economics & Integration (6-8h)**

### **Task 5.1: Initialize Extraction Flows (2h)**

**File:** `src/simulation/extraction.ts` (NEW)

```typescript
/**
 * Extraction Economics
 * Models resource flows from periphery to hegemons
 */

import { GameState, CountryPopulation } from '@/types/game';
import { CountryName } from '@/types/countryPopulations';
import { ExtractionFlow, ExtractionMechanism } from '@/types/extraction';

/**
 * Initialize extraction flows based on historical colonial patterns
 */
export function initializeExtractionFlows(state: GameState): void {
  const sys = state.countryPopulationSystem;

  // Define extraction relationships (research-backed)
  const flows: ExtractionFlow[] = [
    // US extraction
    {
      extractingCountry: 'United States',
      sourceCountry: 'Nigeria',
      extractionRate: 0.35,              // 35% of Nigeria's oil revenues leave
      annualValueExtracted: 25,          // $25B/year
      localBenefit: 0.15,                // 15% stays in Nigeria
      militaryPresence: 2,               // Some military cooperation/presence
      enforcementCost: 0.5,              // $500M/year
      localResistance: 0.4,              // Moderate resistance
      mechanism: 'corporate',
      startYear: 1960,                   // Post-independence
      active: true,
      publicJustification: 'Investment and development partnerships',
      actualMechanism: 'Oil extraction via multinational corporations'
    },

    // China extraction
    {
      extractingCountry: 'China',
      sourceCountry: 'Nigeria',
      extractionRate: 0.25,              // 25% (China's growing presence)
      annualValueExtracted: 18,          // $18B/year
      localBenefit: 0.18,                // Slightly higher (infrastructure deals)
      militaryPresence: 0,               // No military presence (yet)
      enforcementCost: 0,
      localResistance: 0.3,              // Lower resistance (better deals)
      mechanism: 'debt',
      startYear: 2010,                   // Belt and Road era
      active: true,
      publicJustification: 'Belt and Road Initiative infrastructure',
      actualMechanism: 'Debt-for-resource swaps'
    },

    // Add more flows...
    // Research needed: Hickel et al. (2022) - $152T drained since 1960
  ];

  // Apply flows to countries
  for (const flow of flows) {
    const extractor = sys.countries[flow.extractingCountry];
    const source = sys.countries[flow.sourceCountry];

    extractor.extractionTargets.push(flow);
    source.extractedBy.push(flow);

    // Update sovereignty
    source.resourceSovereignty *= (1 - flow.extractionRate * 0.5);
  }
}

/**
 * Update extraction flows each month
 */
export function updateExtractionEconomics(state: GameState): void {
  const sys = state.countryPopulationSystem;

  for (const hegemonName of Object.keys(sys.countries) as CountryName[]) {
    const hegemon = sys.countries[hegemonName];

    if (!hegemon.isHegemon) continue;

    // Process each extraction flow
    for (const flow of hegemon.extractionTargets) {
      if (!flow.active) continue;

      updateExtractionFlow(flow, hegemon, state);
    }
  }

  // Check for new extraction opportunities (military interventions create new flows)
  checkNewExtractionFlows(state);
}

function updateExtractionFlow(
  flow: ExtractionFlow,
  hegemon: CountryPopulation,
  state: GameState
): void {
  const source = state.countryPopulationSystem.countries[flow.sourceCountry];

  // Calculate monthly extracted value
  const monthlyExtraction = flow.annualValueExtracted / 12;

  // Add to hegemon's extracted resources
  addResourceValue(hegemon.extractedResources, source.domesticResources, flow.extractionRate / 12);

  // Remove from source's effective resources
  const localRetention = monthlyExtraction * flow.localBenefit;
  const extracted = monthlyExtraction * (1 - flow.localBenefit);

  // Track wealth flows
  hegemon.wealth += extracted;
  source.wealthRetained -= extracted;

  // Update source country effects
  source.resourceSovereignty *= (1 - flow.extractionRate * 0.001); // Slow erosion

  // Resistance can grow
  if (flow.localBenefit < 0.2) {
    flow.localResistance += 0.005; // 0.5% per month if unfair
  }

  // High resistance can disrupt extraction
  if (flow.localResistance > 0.8 && Math.random() < 0.05) {
    flow.active = false;
    console.log(`\n🚩 EXTRACTION DISRUPTED: ${source.name} breaks free from ${hegemon.name} extraction`);
    console.log(`   Local resistance reached ${(flow.localResistance * 100).toFixed(0)}%`);
  }
}

function addResourceValue(
  target: ResourceEndowment,
  source: ResourceEndowment,
  fraction: number
): void {
  // Transfer fraction of source resources to target
  for (const key of Object.keys(source) as Array<keyof ResourceEndowment>) {
    (target[key] as number) += (source[key] as number) * fraction;
  }
}
```

**Deliverable:** Extraction economics system functional

---

### **Task 5.2: Integrate with Resource Economy (2h)**

**File:** `src/simulation/resourceEconomy.ts` (MODIFY)

Update resource economy to use country-level resources:

```typescript
// In updateResourceEconomy() or similar:

// Calculate global resources from country endowments + extraction
if (state.countryPopulationSystem) {
  let totalFood = 0;
  let totalWater = 0;
  let totalMinerals = 0;

  for (const country of Object.values(state.countryPopulationSystem.countries)) {
    // Effective resources = domestic + extracted - extracted by others
    const effectiveResources = calculateEffectiveResources(country);

    totalFood += effectiveResources.arableLand * country.population * 10;
    totalWater += effectiveResources.freshwater * country.population * 10;
    totalMinerals += (effectiveResources.iron + effectiveResources.copper) * 50;
  }

  // Update global resource stocks (backward compatibility)
  state.resourceEconomy.food.currentStock = totalFood;
  state.resourceEconomy.water.currentStock = totalWater;
  // ...
}

function calculateEffectiveResources(country: CountryPopulation): ResourceEndowment {
  // Start with domestic
  const effective = { ...country.domesticResources };

  // Add extracted resources
  for (const key of Object.keys(effective) as Array<keyof ResourceEndowment>) {
    (effective[key] as number) += (country.extractedResources[key] as number);
  }

  // Subtract what others extract from this country
  for (const flow of country.extractedBy) {
    if (flow.active) {
      for (const key of Object.keys(effective) as Array<keyof ResourceEndowment>) {
        (effective[key] as number) -= (country.domesticResources[key] as number) * flow.extractionRate / 12;
      }
    }
  }

  return effective;
}
```

**Deliverable:** Resource economy uses extraction flows

---

### **Task 5.3: Integration Testing (2-3h)**

**File:** `tests/tier2-8-integration.test.ts` (NEW)

Create integration tests:

```typescript
describe('TIER 2.8: Hegemonic Powers System', () => {
  test('Countries have resource endowments', () => {
    const state = createTestGameState();
    const us = state.countryPopulationSystem.countries['United States'];

    expect(us.domesticResources.fossilFuels).toBeGreaterThan(0);
    expect(us.domesticResources.arableLand).toBeGreaterThan(0);
  });

  test('Hegemons can extract from other countries', () => {
    const state = createTestGameState();
    initializeExtractionFlows(state);

    const us = state.countryPopulationSystem.countries['United States'];
    expect(us.extractionTargets.length).toBeGreaterThan(0);
  });

  test('War motivation increases with meaning crisis', () => {
    const state = createTestGameState();
    const us = state.countryPopulationSystem.countries['United States'];

    us.meaningCrisis = 0.8;
    updateWarMeaningFeedback(state);

    expect(us.warMotivation).toBeGreaterThan(0.3);
  });

  test('Parental fulfillment reduces war motivation', () => {
    const state = createTestGameState();
    const us = state.countryPopulationSystem.countries['United States'];

    // Enable multiple TIER 2 technologies
    state.breakthroughTech.deExtinctionRewilding = { unlocked: true, deploymentLevel: 0.8 };
    state.breakthroughTech.ecosystemManagement = { unlocked: true, deploymentLevel: 0.7 };

    updateParentalFulfillment(state);

    expect(us.warMotivation).toBeLessThan(0.3); // Drastically reduced
  });

  test('Military interventions create refugees', () => {
    const state = createTestGameState();
    const intervention = createTestIntervention();

    const initialRefugees = state.humanPopulationSystem.totalDisplaced;

    updateIntervention(intervention, state);

    expect(state.humanPopulationSystem.totalDisplaced).toBeGreaterThan(initialRefugees);
  });

  test('Climate suffering ratio calculated correctly', () => {
    const state = createTestGameState();
    calculateClimateSufferingRatios(state);

    const nigeria = state.countryPopulationSystem.countries['Nigeria'];
    const us = state.countryPopulationSystem.countries['United States'];

    // Nigeria: High vulnerability, low emissions = high suffering ratio
    expect(nigeria.climateSufferingRatio).toBeGreaterThan(5.0);

    // US: Low vulnerability, high emissions = low suffering ratio
    expect(us.climateSufferingRatio).toBeLessThan(1.0);
  });
});
```

**Deliverable:** Integration tests pass

---

### **Task 5.4: Monte Carlo Testing (1-2h)**

Run Monte Carlo simulations to balance:

```bash
npx tsx scripts/monteCarloSimulation.ts --runs=20 --max-months=120 --name=tier2_8_test
```

**What to check:**
- Do extraction flows create realistic inequality?
- Do military interventions trigger at reasonable rates?
- Does war-meaning feedback loop work?
- Do parental fulfillment effects reduce war correctly?
- Are refugee flows from interventions realistic?
- Does climate justice create expected outcomes?

**Deliverable:** Balanced parameters, Monte Carlo results logged

---

## 📊 **SUMMARY**

### **Total Time Estimate: 33-42 hours**

| Phase | Hours | Complexity |
|-------|-------|------------|
| 1. Resources & Sovereignty | 8-10h | MEDIUM |
| 2. Military System | 8-10h | HIGH |
| 3. War-Meaning Loop | 6-8h | MEDIUM |
| 4. Environmental Debt | 5-6h | MEDIUM |
| 5. Integration & Testing | 6-8h | HIGH |

**Savings from existing country system: 18-23 hours!**

---

## ✅ **SUCCESS CRITERIA**

**Technical:**
- ✅ All 15 countries have resource endowments
- ✅ 5 hegemons identified (US, China, Russia, India, UK)
- ✅ Extraction flows functional (who takes from whom)
- ✅ Military interventions create refugees
- ✅ Military CO2 emissions tracked
- ✅ War-meaning feedback loop works
- ✅ Parental fulfillment reduces war motivation
- ✅ Climate suffering ratios calculated
- ✅ Climate reparations optional

**Gameplay:**
- ✅ Inequality emerges from extraction
- ✅ Refugees flee from military interventions
- ✅ Meaning crisis → nationalism → war
- ✅ Solving meaning reduces war (utopia pathway)
- ✅ Hegemons face choice: reparations or fortress borders

**Research-Backed:**
- ✅ Hickel et al. (2022): $152T extraction
- ✅ US military: 59M tons CO2/year
- ✅ DARPA: $3B AI spending by 2025
- ✅ PTSD: 11-20% of veterans
- ✅ Stockholm Resilience: Climate debt ratios

---

## 🔗 **FILES TO CREATE/MODIFY**

### **New Files:**
1. `src/types/resourceEndowment.ts` (resource types)
2. `src/types/extraction.ts` (extraction flow types)
3. `src/types/military.ts` (military intervention types)
4. `src/simulation/military.ts` (military system)
5. `src/simulation/warMeaningFeedback.ts` (war-meaning loop)
6. `src/simulation/climateJustice.ts` (environmental debt)
7. `src/simulation/extraction.ts` (extraction economics)
8. `tests/tier2-8-integration.test.ts` (integration tests)

### **Modified Files:**
1. `src/types/countryPopulations.ts` (extend interface)
2. `src/simulation/countryPopulations.ts` (initialize resources)
3. `src/simulation/environmental.ts` (military emissions)
4. `src/simulation/meaningRenaissance.ts` (war effects)
5. `src/simulation/resourceEconomy.ts` (extraction integration)

---

## 🎯 **NEXT STEPS**

1. **User approval** of revised plan and time estimates
2. **Research phase:** Gather resource data for 15 countries
3. **Phase 1 implementation:** Resource endowments & sovereignty
4. **Phase 2 implementation:** Military system
5. **Phase 3 implementation:** War-meaning feedback
6. **Phase 4 implementation:** Environmental debt
7. **Phase 5 implementation:** Integration & testing
8. **Documentation:** Update roadmap, create devlog

---

**This is how we model: "There are no poor countries, only exploited ones."**

And more importantly:

**"If humanity finds things that genuinely need nurturing (AI, extinct species, ecosystems, space), conquest becomes obsolete."**
