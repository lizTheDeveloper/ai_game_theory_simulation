# Colonial Extraction, Military Power, and Resource Inequality System

**Date:** October 11, 2025
**Status:** DESIGN PHASE - Major System Addition
**Priority:** HIGH (Foundational for realistic refugee/population modeling)
**Complexity:** VERY HIGH
**Estimated Scope:** Full phase (TIER 2.x or 3.x)

---

## 🎯 MOTIVATION

**Core Problem:**
Current simulation treats global resources as a monolithic pool. This erases:
1. **Colonial extraction**: Mineral-rich countries exploited by military-powerful nations
2. **Power asymmetry**: US/China/Russia can destabilize weaker nations
3. **Environmental debt**: Industrial nations caused climate change, vulnerable nations suffer
4. **War as meaning substitute**: Nationalism/conquest fills existential void

**User Insight:**
> "There are no poor countries, only exploited ones."

**Why This Matters:**
- Can't model realistic refugee flows without modeling why regions destabilize
- Can't model inequality without modeling extraction
- Can't model war without modeling power asymmetry
- Can't model meaning crisis without war's role as purpose-substitute

**Philosophical Question:**
> "I think sometimes that's how we stave off a meaning crisis - by spiraling into war. Perhaps if we can fix the meaning crisis we'll stop playing conqueror, at least on earth."

This is a **feedback loop** to model:
- Meaning crisis → nationalism/war as substitute purpose
- War → resource competition → more crisis
- But: **Solve meaning crisis → reduce war motivation**

---

## 🧭 DESIGN PRINCIPLES

### **What We DON'T Want:**
- ❌ Full per-nation simulation (195 countries)
- ❌ Detailed diplomatic relations, trade routes, alliances
- ❌ Turn-based strategy game mechanics
- ❌ "Civilization by Sid Meier"

### **What We DO Want:**
- ✅ **Power hierarchy** abstraction (hegemonic → exploited)
- ✅ **Resource extraction flows** (who takes from whom)
- ✅ **Military capability** as systemic force
- ✅ **Inequality as emergent outcome** of extraction
- ✅ **War linked to meaning crisis** (feedback loop)
- ✅ **Colonial history** affects current vulnerability

### **The Right Level of Abstraction:**

**Proposed: 3-Tier Power Structure**

1. **Hegemonic Powers** (4-5 entities)
   - US, China, EU, Russia, (India?)
   - Global military reach, resource extraction capability
   - Drive AI development, set rules, destabilize regions

2. **Resource Regions** (6 regions - already defined)
   - Sub-Saharan Africa, Middle East, South Asia, East Asia, Americas, Europe
   - Have resources (minerals, oil, labor)
   - Varying levels of sovereignty/exploitation

3. **Extraction Matrix**
   - Which powers extract from which regions
   - Historical colonial ties affect extraction patterns
   - Military presence enables/protects extraction

**Why This Works:**
- Captures power asymmetry without 195-nation complexity
- Matches real geopolitical structure (hegemons + regions)
- Enables resource flows (extraction) to be modeled
- Can map military interventions to refugee crises
- Hegemonic powers compete (AI race, resources, influence)

---

## 📊 PROPOSED SYSTEM ARCHITECTURE

### **TIER 1: Power Hierarchy & Resource Extraction**

```typescript
/**
 * Hegemonic Power System
 *
 * Models major powers that can project force globally, extract resources,
 * and shape international rules. These are not "nations" in full detail,
 * but abstract power centers with military, economic, and technological capability.
 */
export interface HegemonicPower {
  name: string;                          // 'United States', 'China', 'European Union', 'Russia'

  // Power capabilities
  militaryCapability: number;            // [0, 1] Global force projection
  economicPower: number;                 // [0, 1] GDP, trade dominance
  technologicalLead: number;             // [0, 1] AI, weapons, innovation
  diplomaticInfluence: number;           // [0, 1] Soft power, alliances

  // Resource control
  domesticResources: ResourceEndowment;  // Own resource base
  extractedResources: ResourceEndowment; // Taken from other regions
  resourceDependence: number;            // [0, 1] How much needs extraction

  // Military footprint
  militaryBases: Map<RegionName, number>;     // Bases per region
  interventionCapability: number;             // [0, 1] Can destabilize regions
  militaryCO2Emissions: number;               // Tons per year
  militarySpending: number;                   // % of GDP

  // AI development
  aiCapability: number;                  // [0, 1] AI tech level
  militaryAIInvestment: number;          // % of AI R&D for military
  aiSafetyInvestment: number;            // % of AI R&D for safety

  // Colonial legacy
  historicalColonies: RegionName[];      // Which regions were colonized
  extractionEfficiency: number;          // [0, 1] How good at extraction

  // Internal state
  meaningCrisis: number;                 // [0, 1] Existential purposelessness
  nationalismStrength: number;           // [0, 1] War as substitute meaning
  publicSupportForWar: number;           // [0, 1] Population war appetite
}

/**
 * Resource Region (Enhanced)
 *
 * Extends existing RegionalPopulation with resource endowment and exploitation metrics.
 */
export interface ResourceRegion extends RegionalPopulation {
  // Natural resources
  resourceEndowment: ResourceEndowment;       // What this region has
  resourceAccessibility: number;              // [0, 1] How easy to extract
  resourceSovereignty: number;                // [0, 1] Control over own resources

  // Exploitation
  extractedBy: Map<string, ExtractionFlow>;   // Which powers extract
  totalExtractionRate: number;                // % of resources leaving per year
  wealthRetained: number;                     // % kept locally (1 - extraction)

  // Power & stability
  militarySovereignty: number;                // [0, 1] Can defend territory
  politicalStability: number;                 // [0, 1] Stable government
  foreignMilitaryPresence: Map<string, number>; // Which powers have bases

  // Historical burden
  colonialHistory: {
    wasColonized: boolean;
    colonialPower: string;                    // Which hegemon colonized
    yearOfIndependence: number;               // How long ago
    extractionDuration: number;               // Years of colonial extraction
  };

  // Environmental debt
  historicalEmissions: number;                // Tons CO2 (mostly from hegemons)
  currentEmissions: number;                   // Tons CO2 now
  climateVulnerability: number;               // [0, 1] Suffering from others' emissions
}

export interface ResourceEndowment {
  minerals: number;                      // Rare earths, metals, etc.
  fossilFuels: number;                   // Oil, gas, coal
  renewableCapacity: number;             // Solar, wind, hydro potential
  arableLand: number;                    // Food production capacity
  freshwater: number;                    // Water resources
  labor: number;                         // Population as resource (exploited)
}

export interface ExtractionFlow {
  hegemon: string;                       // Which power is extracting
  extractionRate: number;                // % of regional resources per year
  militaryPresence: number;              // Bases/troops protecting extraction
  localBenefit: number;                  // [0, 1] How much region gets (usually low)

  // Mechanisms
  mechanism: 'colonial' | 'corporate' | 'debt' | 'military';
  startYear: number;                     // When extraction began
  resistance: number;                    // [0, 1] Local resistance to extraction
}
```

### **TIER 2: Military System & Destabilization**

```typescript
/**
 * Military Actions & Interventions
 *
 * Models how hegemonic powers use military force to:
 * - Secure resource extraction
 * - Destabilize rival influence
 * - Create refugee crises (unintended or intentional)
 * - Drive AI development (military R&D)
 * - Emit CO2 (military is massive polluter)
 */
export interface MilitaryIntervention {
  hegemon: string;                       // Which power intervening
  targetRegion: RegionName;              // Where

  // Type & scale
  interventionType: InterventionType;
  scale: number;                         // [0, 1] How big
  duration: number;                      // Months active

  // Stated vs actual goals
  publicJustification: string;           // "Spreading democracy", "Fighting terrorism"
  actualGoal: ActualGoal;                // Resource access, rival containment, etc.

  // Effects
  regionalInstability: number;           // [0, 1] How much destabilization
  refugeesCreated: number;               // Millions displaced
  civilianCasualties: number;            // Deaths
  infrastructureDestruction: number;     // [0, 1] Damage to region

  // Costs
  co2Emissions: number;                  // Tons per month
  economicCost: number;                  // Billions USD
  diplomaticCost: number;                // Loss of soft power

  // Domestic effects (on intervening power)
  publicSupport: number;                 // [0, 1] Does population support war?
  meaningBoost: number;                  // [0, 1] War as national purpose
  economicStimulus: number;              // Military spending → jobs
  aiDevelopmentBoost: number;            // Military R&D → AI advancement
}

export type InterventionType =
  | 'regime_change'      // Overthrow government (US in Iraq, Libya, etc.)
  | 'proxy_war'          // Support local faction (Syria, Yemen)
  | 'occupation'         // Long-term military presence (Afghanistan)
  | 'coup_support'       // CIA-style destabilization (Chile, Iran)
  | 'resource_securing'  // Protect extraction (oil, minerals)
  | 'rival_containment'; // Block other hegemon's influence

export type ActualGoal =
  | 'resource_extraction'     // Secure oil, minerals, etc.
  | 'block_rival_power'       // Prevent China/Russia influence
  | 'maintain_extraction'     // Protect existing colonial flows
  | 'create_instability'      // Destabilize to prevent regional power
  | 'domestic_distraction';   // War as meaning substitute

/**
 * Military-Industrial Complex Effects
 *
 * Military spending affects multiple systems:
 * - CO2 emissions (US military = world's largest institutional polluter)
 * - AI development (DARPA, military R&D)
 * - Economy (jobs, but diverts from social spending)
 * - Meaning (nationalism, "defending freedom")
 */
export interface MilitaryIndustrialComplex {
  hegemon: string;

  // Spending
  annualBudget: number;                  // Billions USD
  gdpPercentage: number;                 // % of GDP on military

  // R&D allocation
  aiResearchBudget: number;              // Billions to military AI
  weaponsResearch: number;               // Autonomous weapons, drones, etc.
  civilianSpinoffs: number;              // Internet, GPS, etc. (from military R&D)

  // Environmental impact
  annualCO2Emissions: number;            // US military: ~59M tons/year
  basesCO2Footprint: number;             // Global base network emissions
  warfightingEmissions: number;          // Active combat emissions

  // Economic effects
  jobsCreated: number;                   // Military employment
  socialSpendingCrowdOut: number;        // [0, 1] Diverts from healthcare, education
  innovationBoost: number;               // [0, 1] Tech advancement from R&D

  // Meaning effects
  nationalIdentityBoost: number;         // [0, 1] Military as source of pride
  meaningSubstitution: number;           // [0, 1] War replaces lost purpose
  veteranTrauma: number;                 // [0, 1] PTSD, meaning crisis for soldiers
}
```

### **TIER 3: Extraction Economics & Inequality**

```typescript
/**
 * Colonial Extraction Economics
 *
 * Models how resource flows create global inequality.
 * "There are no poor countries, only exploited ones."
 */
export interface ExtractionEconomics {
  // Global flows
  totalExtractedValue: number;           // Billions USD/year leaving periphery
  totalRetainedValue: number;            // Billions USD/year staying in source regions

  // Inequality metrics
  hegemonWealth: Map<string, number>;    // GDP of hegemonic powers
  regionWealth: Map<RegionName, number>; // GDP of resource regions
  globalGiniCoefficient: number;         // [0, 1] Wealth inequality

  // Extraction mechanisms
  corporateExtraction: ExtractionMechanism;
  debtTrap: ExtractionMechanism;
  militaryExtraction: ExtractionMechanism;
  unequal Trade: ExtractionMechanism;
}

export interface ExtractionMechanism {
  type: 'corporate' | 'debt' | 'military' | 'trade';

  // Flow
  annualValueExtracted: number;          // Billions USD/year
  sourcesRegions: RegionName[];          // Where it comes from
  destinationHegemons: string[];         // Where it goes

  // Mechanics
  extractionEfficiency: number;          // [0, 1] How much value captured
  localBenefitRate: number;              // [0, 0.3] What fraction stays
  resistanceLevel: number;               // [0, 1] Local opposition

  // Justification
  legalFraming: string;                  // "Free trade", "Investment", etc.
  actualMechanism: string;               // Debt trap, resource curse, etc.

  // Examples:
  // - Corporate: Mining companies extract minerals, profits leave
  // - Debt: IMF loans → austerity → sell resources cheap
  // - Military: Bases protect extraction, coup if resist
  // - Trade: Unequal exchange (cheap resources for expensive goods)
}
```

### **TIER 4: War-Meaning Crisis Feedback Loop**

```typescript
/**
 * War as Meaning Substitute
 *
 * Key insight: Meaning crisis → nationalism/war as substitute purpose.
 * But: Solve meaning → reduce war motivation.
 *
 * This creates a feedback loop:
 * 1. Meaning crisis → population seeks purpose
 * 2. Nationalism/war fills void ("defending nation", "spreading freedom")
 * 3. War creates economic activity → jobs → "purpose"
 * 4. But war creates trauma, refugees, instability
 * 5. Instability → more meaning crisis
 *
 * Breaking the loop: If meaning system solves crisis (fulfillment, purpose)
 * → nationalism loses appeal → war becomes less attractive
 */
export interface WarMeaningFeedback {
  hegemon: string;

  // Meaning crisis drivers
  meaningCrisisLevel: number;            // [0, 1] From meaning system
  economicPrecarity: number;             // [0, 1] Job insecurity, inequality
  socialFragmentation: number;           // [0, 1] Community breakdown

  // War as substitute
  nationalismAppeal: number;             // [0, 1] How attractive is nationalism?
  warAsUnifier: number;                  // [0, 1] War creates shared purpose
  enemyAsScapegoat: number;              // [0, 1] Blame external enemy

  // War mobilization effects
  militaryEmployment: number;            // Jobs created by war
  warEconomyBoost: number;               // [0, 1] Economic stimulus from spending
  sharedSacrifice: number;               // [0, 1] "We're all in this together"

  // War trauma effects (negative feedback)
  veteranMeaningCrisis: number;          // [0, 1] PTSD, disillusionment
  civilianTrauma: number;                // [0, 1] Families lose loved ones
  moralInjury: number;                   // [0, 1] "What did we do this for?"

  // The key equation:
  // warMotivation = meaningCrisisLevel * nationalismAppeal - moralInjury
  // If meaningCrisisLevel → 0 (solved), warMotivation → 0
  warMotivation: number;                 // [0, 1] Likelihood of intervention
}

/**
 * Alternative Purpose Pathways
 *
 * If meaning crisis is solved through non-violent means, war becomes unnecessary.
 */
export interface AlternativePurpose {
  // Healthy meaning sources (from meaning system)
  communityEngagement: number;           // [0, 1] Local solidarity
  creativeExpression: number;            // [0, 1] Art, culture, creation
  environmentalStewardship: number;      // [0, 1] Healing planet
  humanConnection: number;               // [0, 1] Relationships, love

  // These substitute for nationalism
  effectOnNationalism: number;           // [-1, 0] Reduces nationalist appeal
  effectOnWarMotivation: number;         // [-1, 0] Reduces war appetite

  // Key insight:
  // If QoL meaning > 0.7 && alternativePurpose > 0.6
  // → warMotivation *= 0.5 (halve war motivation)
  // This is how solving meaning crisis reduces war
}
```

---

## 🔄 INTEGRATION WITH EXISTING SYSTEMS

### **1. Resource Economy**

**Current:** Global resource pool
**New:** Per-region resources + extraction flows

```typescript
// OLD (global pool):
export interface ResourceEconomy {
  food: { currentStock: number };  // Global
  water: { currentStock: number }; // Global
  minerals: { currentStock: number }; // Global
}

// NEW (regional + extraction):
export interface ResourceEconomy {
  // Regional endowments
  regionalResources: Map<RegionName, ResourceEndowment>;

  // Extraction flows
  extractionFlows: ExtractionFlow[];

  // Hegemon control
  hegemonResources: Map<string, ResourceEndowment>; // Domestic + extracted

  // Global aggregates (for backward compatibility)
  globalFood: number;
  globalWater: number;
  globalMinerals: number;
}
```

**Impact:**
- Regions with resources but low sovereignty → exploited
- Hegemons consume more than domestic endowment → must extract
- Resource scarcity in one region while hegemon hoards

### **2. Environmental System**

**Current:** Global emissions/climate
**New:** Historical emissions debt + regional vulnerability

```typescript
// Historical emissions (who caused climate change)
export interface EnvironmentalDebt {
  hegemonHistoricalEmissions: Map<string, number>; // US, EU caused most
  regionHistoricalEmissions: Map<RegionName, number>; // Periphery caused little

  // Who suffers vs who caused
  climateDebtRatio: Map<RegionName, number>; // Suffering / caused
  // Example: Sub-Saharan Africa
  //   - Historical emissions: 3% of global
  //   - Climate vulnerability: 85% (highest)
  //   - Debt ratio: 85 / 3 = 28x (suffer 28x more than caused)

  // Military emissions
  militaryCO2: Map<string, number>;     // US military: 59M tons/year
  // US military emits more than 140 countries combined
}
```

**Impact:**
- Hegemons caused climate change, periphery suffers
- Military emissions massive but usually ignored
- Climate refugees flee to countries that caused the crisis

### **3. AI Development**

**Current:** Global AI capability race
**New:** Military R&D drives AI (but less safe)

```typescript
export interface AIDevelopment {
  // Civilian vs military AI
  civilianAI: Map<string, number>;      // Safety-focused
  militaryAI: Map<string, number>;      // Weapons, surveillance

  // Military R&D effects
  militaryAIBoost: number;               // [0, 1] DARPA-style acceleration
  militaryAISafety: number;              // [0, 0.3] Lower safety (speed prioritized)

  // Spillover
  civilianSpinoffs: number;              // Military tech → civilian use
  safetyPenalty: number;                 // Military AI less aligned
}
```

**Impact:**
- War → military R&D → faster AI (but less safe)
- Arms race → AGI race → higher risk
- Peaceful meaning → less military AI → slower but safer

### **4. Refugee Flows**

**Current:** Climate/famine drive refugees
**New:** Military intervention creates most refugee crises

```typescript
export interface RefugeeFlowCauses {
  // Climate-driven
  climateRefugees: number;

  // War-driven (NEW - often larger)
  militaryInterventionRefugees: number;  // US destabilized Middle East
  proxyWarRefugees: number;              // Syria, Yemen, etc.
  regimeChangeRefugees: number;          // Iraq, Libya, etc.

  // Extraction-driven (NEW)
  resourceConflictRefugees: number;      // Fighting over minerals, water
  debtCrisisRefugees: number;            // Economic collapse from debt trap
}
```

**Impact:**
- US interventions → refugee crises → refugees flee to Europe
- The very hegemons that destabilize regions then close borders
- "Fortress world" dystopia emerges from this dynamic

### **5. Meaning System**

**Current:** QoL meaning crisis
**New:** War as meaning substitute

```typescript
export interface MeaningSystem {
  // Existing
  meaningCrisisLevel: number;            // [0, 1]

  // NEW: War substitution
  nationalismAsMeaning: number;          // [0, 1] "My country" as purpose
  warAsPurpose: number;                  // [0, 1] Military service as meaning
  enemyAsScapegoat: number;              // [0, 1] External threat unifies

  // Healthy alternatives (NEW)
  communityMeaning: number;              // Local solidarity
  creativeMeaning: number;               // Art, culture
  environmentalMeaning: number;          // Stewardship

  // The key trade-off:
  // If meaningCrisisLevel high → nationalismAsMeaning increases
  // But if healthy alternatives high → nationalismAsMeaning decreases
  // This is how solving meaning reduces war
}
```

---

## 🎮 GAMEPLAY IMPLICATIONS

### **New Strategic Dimensions**

1. **Resource Sovereignty vs Extraction**
   - Hegemons must choose: Extract resources (short-term gain, long-term instability) or fair trade?
   - Regions can resist extraction (if build military/sovereignty)
   - Colonial history creates path dependence

2. **Military Intervention Trade-offs**
   - War boosts economy, meaning, AI development
   - But creates refugees, emissions, instability, moral injury
   - Short-term purpose vs long-term crisis

3. **Breaking War-Meaning Loop**
   - If solve meaning crisis → reduce war motivation
   - Alternative: Nationalism → war → dystopia
   - Player choice: Which path?

4. **Environmental Justice**
   - Hegemons caused climate change, periphery suffers
   - Climate reparations as policy option?
   - Or fortress borders → dystopia

5. **AI Safety vs Military Speed**
   - Military R&D accelerates AI but reduces safety
   - Peaceful world → slower AI but safer alignment
   - Arms race → AGI race → high risk

### **Victory Conditions (Updated)**

**Utopia Path:**
- Solve meaning crisis → reduce war → peaceful cooperation
- Fair resource distribution (end extraction)
- Climate reparations (acknowledge debt)
- Demilitarization → redirect to social goods

**Dystopia Paths:**
1. **Imperial Dystopia**: Hegemon dominates, extracts, militarizes, AI controls
2. **Fortress Dystopia**: Hegemons close borders, refugees die, periphery collapses
3. **Nationalist Dystopia**: War as eternal meaning substitute, endless conflict

**Extinction Paths:**
- Nuclear war (from arms race)
- AI race (from military R&D)
- Climate collapse (hegemons ignore, periphery dies, then all die)

---

## 📋 IMPLEMENTATION PHASES

This is too large for one tier. Proposed breakdown:

### **TIER 2.1: Power Hierarchy & Resource Extraction (Foundation)**
**Scope:** 15-20 hours
**Deliverables:**
1. Define 4-5 hegemonic powers with capabilities
2. Map resource endowment per region
3. Create extraction flow system (who takes from whom)
4. Model wealth inequality as emergent outcome
5. Colonial history affects extraction patterns

**Files:**
- `src/types/hegemonicPowers.ts` - Power structure types
- `src/types/resourceExtraction.ts` - Extraction mechanics
- `src/simulation/extraction.ts` - Extraction update logic
- `src/simulation/initialization.ts` - Initialize powers + regions

### **TIER 2.2: Military System & Interventions**
**Scope:** 12-15 hours
**Deliverables:**
1. Military intervention types (regime change, proxy war, etc.)
2. Military CO2 emissions (massive but often ignored)
3. Military spending effects (economy, AI, meaning)
4. Interventions → refugee crises
5. Military R&D → AI development boost (but less safe)

**Files:**
- `src/types/military.ts` - Military action types
- `src/simulation/military.ts` - Intervention logic
- `src/simulation/militaryIndustrialComplex.ts` - Economic/AI/meaning effects

### **TIER 2.3: War-Meaning Feedback Loop**
**Scope:** 8-10 hours
**Deliverables:**
1. Meaning crisis → nationalism appeal
2. War as purpose substitute
3. War mobilization → jobs, meaning, unity
4. War trauma → moral injury, backlash
5. **Key mechanic:** Solve meaning → reduce war motivation

**Files:**
- `src/simulation/warMeaningFeedback.ts` - Feedback loop logic
- `src/simulation/alternativePurpose.ts` - Non-war meaning sources
- Integrate with existing `meaningRenaissance.ts`

### **TIER 2.4: Environmental Debt & Climate Justice**
**Scope:** 6-8 hours
**Deliverables:**
1. Historical emissions per hegemon/region
2. Climate vulnerability vs emissions ratio (debt)
3. Climate reparations as policy option
4. Military emissions tracking

**Files:**
- `src/types/environmentalDebt.ts`
- `src/simulation/climateJustice.ts`
- Integrate with existing `environmental.ts`

### **TIER 2.5: Integration & Testing**
**Scope:** 10-12 hours
**Deliverables:**
1. Integrate all new systems with existing simulation
2. Resource economy updated (regional + extraction)
3. Refugee flows updated (military causes)
4. AI development updated (military R&D)
5. Monte Carlo testing (N=50)
6. Balance extraction rates, war probabilities

**Total Estimated Time:** 50-65 hours (multiple weeks)

---

## 🧩 MINIMAL VIABLE DESIGN

If full system is too large, start with:

### **MVP: 3 Hegemons + Extraction + War-Meaning**

**Hegemons:**
1. **US** - Highest military, most extraction, meaning crisis rising
2. **China** - Rising power, some extraction, authoritarian meaning substitute
3. **EU** - Economic power, colonial legacy, meaning crisis high

**Regions:** Use existing 6 regions

**Mechanics:**
1. Each hegemon extracts from historical colonies
2. Military interventions create refugee crises
3. Meaning crisis → war motivation
4. War → AI boost, CO2, refugees
5. Solve meaning → reduce war

**Outcome:**
- Can model inequality, extraction, war
- Refugee crises have realistic causes
- War-meaning loop functional
- Foundation for later expansion

---

## 🔬 RESEARCH BACKING

### **Colonial Extraction**
- **Hickel et al. (2022):** $152 trillion drained from Global South since 1960
- **UNCTAD:** Unequal exchange: $2.2 trillion/year from South to North
- **Mining companies:** 101 of top 250 corporations extract from Africa, profits to West

### **Military Emissions**
- **US military:** 59M tons CO2/year (2017) - more than 140 countries combined
- **DoD:** World's largest institutional consumer of petroleum
- **Wars:** Iraq war (2003-2011) = 141M tons CO2 directly

### **Military-AI Connection**
- **DARPA:** Funded early AI research, autonomous weapons now
- **Pentagon AI spending:** $1.5B/year (2023), projected $3B by 2025
- **China military AI:** Integrated civil-military fusion

### **War-Meaning Research**
- **Durkheim:** War creates "collective effervescence", shared purpose
- **WWI/WWII:** Unemployment vanished, economic mobilization
- **Veteran PTSD:** 11-20% of Iraq/Afghanistan vets have PTSD
- **Moral injury:** "We fought for nothing" - existential crisis

---

## 🚧 OPEN QUESTIONS

1. **Abstraction level for hegemons:**
   - 3 hegemons (US, China, EU)? Or 5 (+ Russia, India)?
   - Do we model internal politics (democracies vs autocracies)?

2. **Resource extraction rates:**
   - What % of regional resources get extracted?
   - How much stays local? (Currently ~10-20% in real world)

3. **War triggers:**
   - Does AI race automatically create arms race?
   - Can players choose non-intervention?

4. **Meaning substitution mechanics:**
   - How much does nationalism reduce meaning crisis?
   - At what threshold does peaceful meaning win over war?

5. **Environmental debt:**
   - Should there be climate reparations mechanic?
   - Do hegemons pay or ignore?

6. **Complexity management:**
   - Is 3-tier system (hegemons, regions, extraction) right level?
   - Or too complex / too simple?

---

## 🎯 SUCCESS CRITERIA

### **Technical:**
- ✅ 3-5 hegemonic powers with distinct capabilities
- ✅ Resource extraction flows modeled
- ✅ Wealth inequality emerges from extraction
- ✅ Military interventions create refugee crises
- ✅ Military CO2 emissions tracked
- ✅ Military R&D accelerates AI (but reduces safety)
- ✅ War-meaning feedback loop functional
- ✅ Solving meaning reduces war motivation

### **Realism:**
- ✅ Hegemons extract resources from periphery
- ✅ Military interventions match historical patterns (US in Middle East, etc.)
- ✅ War creates economic stimulus but moral injury
- ✅ Climate debt visible (hegemons caused, periphery suffers)
- ✅ Nationalism rises when meaning falls

### **Gameplay:**
- ✅ Player can choose extraction vs fair trade
- ✅ Player can choose war vs peaceful meaning
- ✅ Consequences realistic (short-term gain, long-term crisis)
- ✅ Breaking war-meaning loop is possible but challenging
- ✅ Multiple dystopia paths based on choices

---

## 💭 PHILOSOPHICAL IMPLICATIONS

This system models a profound question:

**Can humanity transcend conquest as meaning-substitute?**

Throughout history:
- Empire as purpose (Rome, Britain, US)
- Nationalism as existential anchor
- War as collective unifier
- "Defending freedom" as identity

But this creates:
- Endless conflict
- Resource extraction
- Refugee crises
- Environmental destruction
- AI arms race → extinction risk

**The alternative:**
- Solve meaning crisis through community, creativity, stewardship
- Reduce nationalism → reduce war
- Fair resource distribution → reduce conflict
- Demilitarization → redirect to social goods
- Peaceful cooperation → slower but safer AI

**The simulation asks:**
> "If we fix the meaning crisis, will we stop playing conqueror?"

This is testable in the model:
```
IF meaningCrisis → 0 (solved) AND alternativePurpose → 1 (healthy)
THEN warMotivation → 0 AND extraction → fairTrade AND utopia → possible
```

**But if meaning remains broken:**
```
IF meaningCrisis → 1 (high) AND alternativePurpose → 0 (none)
THEN warMotivation → 1 AND extraction → maximal AND dystopia → inevitable
```

---

**Total Estimated Scope:** FULL PHASE (TIER 2.x)
**Implementation Time:** 50-65 hours
**Complexity:** VERY HIGH
**Impact:** MASSIVE (reshapes resource, war, AI, meaning systems)
**Status:** DESIGN READY - Awaiting user feedback on abstraction level

---

## 📚 NEXT STEPS

1. **User review** of abstraction level (3 hegemons? 5? Right granularity?)
2. **Decide scope:** Full system (TIER 2.1-2.5) or MVP (3 hegemons + extraction)?
3. **Research phase:** Gather extraction data, military intervention history
4. **Prototype:** Implement TIER 2.1 (power hierarchy + extraction)
5. **Test:** Does inequality emerge? Do refugee flows make sense?
6. **Iterate:** Add military, war-meaning, environmental debt
7. **Monte Carlo:** Test full system across many runs
8. **Document:** Devlog, wiki update

---

**This is how we model the truth: "There are no poor countries, only exploited ones."**
