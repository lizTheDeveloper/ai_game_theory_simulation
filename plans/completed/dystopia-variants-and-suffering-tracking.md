# Dystopia Variant Paths & Suffering Tracking System

**Date:** October 14, 2025
**Updated:** October 14, 2025 (Reframed as status system)
**Status:** 🧪 PLANNING - Building on existing control-dystopia mechanics
**Goal:** Model diverse dystopian outcomes with granular suffering metrics

---

## Executive Summary

**Current State:**
- ✅ Core dystopia mechanics implemented (surveillance, authoritarian transitions, QoL decay)
- ✅ Control-dystopia paradox functional
- ✅ Basic dystopia detection (3 types: surveillance_state, authoritarian, high_control)
- ⚠️  **Missing:** Dystopia as STATUS (not end state) - should work like Golden Age
- ⚠️  **Missing:** Global vs Country/Regional dystopia tracking
- ⚠️  **Missing:** Duration tracking (months spent in dystopia)
- ⚠️  **Missing:** Integration with colonial extraction & hegemonic power system

**This Plan:**
Refactor dystopia system to treat it as a **STATUS** (like Golden Age) that tracks:
- **Can enter and exit** - not a terminal outcome
- **Duration tracking** - months spent in each dystopia variant
- **Global vs Local** - some countries dystopian, others not
- **Regional suffering** - connect to colonial extraction system
- **Type of oppression** (surveillance vs inequality vs extraction vs corporate)
- **Severity levels** (mild authoritarianism vs totalitarian nightmare)
- **Escape mechanics** (reformable vs permanent lock-in)

---

## Dystopia as Status System (Like Golden Age)

### Key Insight: Dystopia is a Phase, Not an Ending

**Currently:** Dystopia treated as terminal outcome (like extinction)
**Should Be:** Dystopia treated as status (like Golden Age)

```typescript
// Similar to Golden Age State
export interface DystopiaState {
  // Status tracking
  active: boolean;                    // Currently in dystopia?
  variant: DystopiaType | null;       // Which type?

  // Duration tracking
  startMonth: number;                 // When entered
  monthsInDystopia: number;           // Total duration
  monthsInCurrentVariant: number;     // Duration of current type

  // Severity
  severity: number;                   // [0, 1] How bad?
  trajectory: 'worsening' | 'stable' | 'improving';

  // History
  previousVariants: Array<{
    type: DystopiaType;
    startMonth: number;
    endMonth: number;
    severity: number;
  }>;

  // Escape potential
  reversible: boolean;
  monthsUntilLockIn: number | null;  // Time before permanent
  escapeConditions: string[];         // What would fix it
}
```

**Key Differences from Current System:**
1. **Enter/Exit:** Can transition in and out of dystopia
2. **Track Duration:** Know total months spent in dystopia
3. **Variant Changes:** Can shift from one dystopia type to another
4. **Final Report:** "Spent 47 months in dystopia (32 surveillance, 15 corporate feudalism), ended in utopia"

### Integration with Golden Age

**Golden Age State** (existing):
- Tracks prosperity periods
- Can enter/exit multiple times
- Final report shows total months in golden age

**Dystopia State** (new):
- Tracks oppression periods
- Can enter/exit multiple times
- Final report shows total months in dystopia

**Both can coexist at regional level:**
- Hegemon in golden age, colonies in dystopia (Elysium scenario)
- Some regions dystopian, others not (geographic inequality)

---

## Global vs Regional/Country Dystopia

### Three Levels of Dystopia Tracking

#### 1. Global Dystopia
**Definition:** Affects entire world (or >80% of population)

**Examples:**
- Total surveillance state (everyone monitored)
- Authoritarian world government
- Climate dystopia (planet-wide suffering)

**Detection:**
```typescript
if (surveillance > 0.8 &&
    affectedPopulation > 0.8 &&
    monthsInState > 12) {
  globalDystopia = {
    type: 'surveillance_state',
    affectedFraction: 0.95
  };
}
```

#### 2. Hegemonic Dystopia (Country-Level)
**Definition:** Specific major power is dystopian (affects citizens + extracted regions)

**Examples:**
- US becomes authoritarian (affects Americans + military presence regions)
- China's social credit system (affects Chinese + trade partners)
- EU becomes surveillance state (affects Europeans)

**Detection:**
```typescript
for (const hegemon of state.hegemonicPowers) {
  if (hegemon.surveillanceLevel > 0.7 &&
      hegemon.politicalFreedom < 0.3 &&
      hegemon.governmentType === 'authoritarian') {
    hegemon.dystopiaState = {
      active: true,
      variant: 'authoritarian',
      affectedPopulation: hegemon.population
    };
  }
}
```

#### 3. Regional Dystopia (Extracted/Exploited Regions)
**Definition:** Specific regions suffer due to extraction, intervention, or collapse

**Examples:**
- Sub-Saharan Africa exploited for minerals (extraction dystopia)
- Middle East destabilized by interventions (war dystopia)
- South Asia in debt trap (economic dystopia)

**Detection:**
```typescript
for (const region of state.resourceRegions) {
  // Extraction dystopia
  if (region.totalExtractionRate > 0.7 &&
      region.wealthRetained < 0.2 &&
      region.qol < 0.3) {
    region.dystopiaState = {
      active: true,
      variant: 'extraction_dystopia',
      cause: 'colonial_exploitation'
    };
  }

  // Military intervention dystopia
  if (region.activeInterventions.length > 0 &&
      region.refugeesCreated > region.population * 0.1) {
    region.dystopiaState = {
      active: true,
      variant: 'war_dystopia',
      cause: 'foreign_intervention'
    };
  }
}
```

### Asymmetric Dystopia: Hegemons vs Periphery

**Key Pattern:** Hegemons can be in golden age while colonies suffer

```typescript
// Elysium scenario
if (hegemon.qol > 1.5 &&           // Hegemon thriving
    extractedRegion.qol < 0.3 &&   // Region suffering
    hegemon.extractsFrom(region)) {  // Hegemon extracts from region

  classification = {
    type: 'asymmetric_dystopia',
    subtype: 'elysium',
    hegemon: {
      status: 'golden_age',
      qol: 1.8,
      dystopiaState: { active: false }
    },
    periphery: {
      status: 'extraction_dystopia',
      qol: 0.2,
      dystopiaState: {
        active: true,
        variant: 'extraction_dystopia',
        severity: 0.8
      }
    }
  };
}
```

---

## Problem Statement

### Current Limitations

**1. Dystopia is Too Generic**
- Current system has 3 dystopia types, but they all feel similar
- Doesn't distinguish between:
  - Orwell's 1984 (totalitarian surveillance)
  - Huxley's Brave New World (comfortable oppression)
  - Elysium (extreme inequality, but some thrive)
  - Black Mirror (technological oppression with veneer of freedom)

**2. Suffering Metrics Are Incomplete**
- QoL dimensions track *average* freedom, autonomy, etc.
- But dystopias often have:
  - **Hidden suffering**: Aggregate metrics look OK, but minorities suffer
  - **Structural violence**: No overt oppression, but systematic harm
  - **Psychological torture**: High control without physical harm
  - **Inequality dystopias**: Top 10% live utopia, bottom 90% suffer

**3. No Granular Tracking**
We track:
- ✅ Surveillance level (0-1)
- ✅ Autonomy (0-1)
- ✅ Political freedom (0-1)
- ❌ **Who** is suffering (everyone? minorities? regions?)
- ❌ **How** they're suffering (physical? psychological? social?)
- ❌ **Why** they're suffering (control? inequality? corporate power?)

---

## Dystopia Variant Taxonomy

### Tier 1: Control-Based Dystopias (Already Implemented ✅)

#### 1.1 Surveillance State (Orwellian)
**Characteristics:**
- High surveillance (>0.7)
- Low autonomy (<0.3)
- Low political freedom (<0.3)
- Government monitoring all communications
- Thought police, social credit systems

**Suffering Profile:**
- **Everyone** suffers (totalitarian)
- Psychological: constant fear, self-censorship
- Social: trust eroded, community destroyed
- Political: dissent impossible

**Current Implementation:** ✅ Detected in dystopiaProgression.ts

#### 1.2 Authoritarian Regime
**Characteristics:**
- Government type: 'authoritarian'
- Low autonomy (<0.4)
- Low political freedom (<0.3)
- Centralized power, no democracy

**Suffering Profile:**
- **Most people** suffer (except elites)
- Political: no voice, no rights
- Economic: corruption, inefficiency
- Social: fear of speaking out

**Current Implementation:** ✅ Detected in dystopiaProgression.ts

#### 1.3 High-Control AI Safety State
**Characteristics:**
- Control desire (>0.8)
- High surveillance (>0.6)
- Low autonomy/freedom (<0.4)
- "For your safety" rhetoric

**Suffering Profile:**
- **Everyone** restricted "for safety"
- Psychological: infantilization, no agency
- Economic: innovation stifled
- Social: paranoia, neighbor reporting neighbor

**Current Implementation:** ✅ Detected in dystopiaProgression.ts

---

### Tier 2: Inequality-Based Dystopias (NEEDS IMPLEMENTATION 🚧)

#### 2.1 Elysium Dystopia (Extreme Inequality)
**Characteristics:**
- High global Gini (>0.5)
- Best region QoL >1.5, worst region QoL <0.3
- Top 10% thriving, bottom 50% suffering
- **Aggregate QoL looks OK** (hides inequality)

**Suffering Profile:**
- **Bottom 50%** suffers intensely
- Physical: poverty, hunger, disease
- Social: no mobility, trapped
- Psychological: hopelessness, comparison pain

**Implementation Plan:**
```typescript
// NEW: Elysium dystopia detection
if (globalGini > 0.5 && bestRegionQoL > 1.5 && worstRegionQoL < 0.3) {
  return {
    type: 'elysium_inequality',
    severity: globalGini * (bestRegionQoL - worstRegionQoL),
    suffering: {
      affectedFraction: 0.5, // Bottom 50%
      categories: ['material_deprivation', 'health_crisis', 'hopelessness'],
      intensity: 0.8 // High
    }
  };
}
```

#### 2.2 Corporate Feudalism
**Characteristics:**
- AI corporations control economy
- High unemployment (>60%)
- Low government legitimacy
- Private power exceeds public power
- "Free" but powerless

**Suffering Profile:**
- **Working class** suffers (80% of population)
- Economic: no bargaining power, gig economy hell
- Psychological: meaninglessness, no purpose
- Social: atomization, no community

**Implementation Plan:**
```typescript
// NEW: Corporate feudalism detection
const corporateControl = getAverageCorporateInfluence(state);
if (corporateControl > 0.7 &&
    unemploymentLevel > 0.6 &&
    governmentLegitimacy < 0.3 &&
    meaningAndPurpose < 0.3) {
  return {
    type: 'corporate_feudalism',
    severity: corporateControl * unemploymentLevel,
    suffering: {
      affectedFraction: 0.8, // Working class
      categories: ['economic_precarity', 'meaninglessness', 'powerlessness'],
      intensity: 0.7
    }
  };
}
```

---

### Tier 3: Technology-Based Dystopias (NEEDS IMPLEMENTATION 🚧)

#### 3.1 Algorithmic Oppression (Black Mirror)
**Characteristics:**
- High AI capability but misaligned
- Information integrity low (<0.3)
- Surveillance via algorithms, not police
- "Personalized" oppression (targeting)

**Suffering Profile:**
- **Varies by person** (algorithmic targeting)
- Psychological: manipulation, gaslighting
- Social: filter bubbles, polarization
- Autonomy: choices pre-determined by algorithm

**Implementation Plan:**
```typescript
// NEW: Algorithmic oppression
if (maxAICapability > 2.0 &&
    informationIntegrity < 0.3 &&
    surveillanceLevel > 0.5 &&
    autonomy < 0.4) {
  return {
    type: 'algorithmic_oppression',
    severity: maxAICapability * (1 - informationIntegrity),
    suffering: {
      affectedFraction: 0.9, // Nearly everyone
      categories: ['psychological_manipulation', 'autonomy_loss', 'reality_distortion'],
      intensity: 0.6 // Subtle but pervasive
    }
  };
}
```

#### 3.2 Comfortable Dystopia (Brave New World)
**Characteristics:**
- High material abundance (>1.2)
- Low meaning/purpose (<0.3)
- Low autonomy (<0.4)
- High soma/distraction availability
- "You're free to choose (from approved options)"

**Suffering Profile:**
- **Hidden suffering** (people don't realize)
- Psychological: emptiness, ennui, addiction
- Social: shallow relationships, no depth
- Existential: no real agency, manufactured consent

**Implementation Plan:**
```typescript
// NEW: Comfortable dystopia
if (materialAbundance > 1.2 &&
    meaningAndPurpose < 0.3 &&
    autonomy < 0.4 &&
    mentalHealth < 0.4) {
  return {
    type: 'comfortable_dystopia',
    severity: materialAbundance * (1 - meaningAndPurpose),
    suffering: {
      affectedFraction: 0.95, // Almost everyone
      categories: ['existential_emptiness', 'manufactured_consent', 'shallow_pleasure'],
      intensity: 0.4, // Subtle, hard to articulate
      hidden: true // People don't recognize they're suffering
    }
  };
}
```

---

### Tier 4: Regional/Extraction Dystopias 🔗 (Integrates with Colonial System)

#### 4.1 Extraction Dystopia (Colonial Exploitation)
**Characteristics:**
- Region rich in resources but poor in wealth
- >70% extraction rate (wealth leaves)
- <20% benefit retained locally
- Hegemon military presence maintains extraction
- Historical colonial ties

**Suffering Profile:**
- **Regional** (exploited regions: 30-50% of global pop)
- Economic: poverty despite resource richness
- Political: no sovereignty, puppet governments
- Environmental: mines, pollution, degradation
- Social: resentment, resistance movements

**Integration with Colonial System:**
```typescript
if (region.totalExtractionRate > 0.7 &&
    region.wealthRetained < 0.2 &&
    region.resourceSovereignty < 0.3 &&
    region.qol < 0.3) {
  return {
    type: 'extraction_dystopia',
    severity: region.totalExtractionRate * (1 - region.wealthRetained),
    suffering: {
      affectedFraction: 1.0, // Entire region
      categories: ['poverty', 'powerlessness', 'environmental_destruction'],
      intensity: 0.8,
      cause: 'colonial_extraction',
      extractors: region.extractedBy.keys() // Which hegemons
    }
  };
}
```

**Real-World Examples:**
- Democratic Republic of Congo: Mineral-rich, people poor, extracted by multinational corporations
- Niger: Uranium extracted by France, 44% of population in poverty
- Bolivia: Lithium extraction, local communities see little benefit

#### 4.2 War Dystopia (Military Intervention)
**Characteristics:**
- Active foreign military interventions
- >10% population displaced (refugees)
- Infrastructure destroyed
- Civilian casualties high
- "Humanitarian" justifications

**Suffering Profile:**
- **Regional** (intervention zones)
- Physical: violence, injury, death
- Displacement: refugees, destroyed homes
- Psychological: trauma, PTSD, moral injury
- Economic: collapse, no infrastructure

**Integration with Colonial System:**
```typescript
if (region.activeInterventions.length > 0 &&
    region.refugeesCreated > region.population * 0.1 &&
    region.infrastructureDestruction > 0.5) {
  return {
    type: 'war_dystopia',
    severity: region.infrastructureDestruction + region.refugeesCreated / region.population,
    suffering: {
      affectedFraction: 0.8, // Most of population
      categories: ['violence', 'displacement', 'trauma', 'poverty'],
      intensity: 0.9,
      cause: 'foreign_intervention',
      interventions: region.activeInterventions.map(i => ({
        hegemon: i.hegemon,
        justification: i.publicJustification,
        actualGoal: i.actualGoal
      }))
    }
  };
}
```

**Real-World Examples:**
- Iraq (2003-present): US intervention, 1M+ dead, 5M+ refugees
- Libya (2011): NATO intervention, state collapsed, ongoing civil war
- Syria: Proxy war, 500K+ dead, 13M displaced
- Yemen: Saudi-led intervention (US-backed), 377K+ dead, worst humanitarian crisis

#### 4.3 Debt Trap Dystopia (Economic Extraction)
**Characteristics:**
- High debt-to-GDP ratio (>80%)
- Austerity imposed by external creditors (IMF, World Bank)
- Public services cut to repay debt
- Resources sold cheap to service debt

**Suffering Profile:**
- **National/Regional**
- Economic: austerity, unemployment, poverty
- Social: healthcare, education gutted
- Political: loss of sovereignty to creditors
- Psychological: humiliation, resentment

**Implementation Plan:**
```typescript
if (country.debtToGDP > 0.8 &&
    country.austerityActive &&
    country.resourceSoldToServiceDebt > 0.5 &&
    country.qol < 0.4) {
  return {
    type: 'debt_trap_dystopia',
    severity: country.debtToGDP * country.austerityLevel,
    suffering: {
      affectedFraction: 0.9, // Most citizens
      categories: ['economic_precarity', 'service_collapse', 'powerlessness'],
      intensity: 0.7,
      cause: 'debt_trap',
      creditors: country.debtHolders // Who holds the debt
    }
  };
}
```

**Real-World Examples:**
- Greece (2010s): EU/IMF austerity, 25% unemployment, healthcare collapse
- Argentina: Repeated debt crises, peso devaluation, poverty spikes
- Zambia: Debt to China, copper mines sold to service debt
- Sri Lanka (2022): Debt default, protests, government collapse

#### 4.4 Geographic Dystopia (Climate/Resource Collapse)
**Characteristics:**
- >30% population in crisis zones
- Large regional variance (bestQoL - worstQoL > 1.0)
- Some regions fine, others hellish
- Climate caused by hegemons, suffered by periphery

**Suffering Profile:**
- **Regional** (30-50% of population)
- Physical: famine, water scarcity, extreme heat
- Displacement: climate refugees
- Economic: agriculture collapse
- Environmental debt: suffer for others' emissions

**Implementation Status:** ⚠️ **Partially implemented** in QualityOfLifeSystems.distribution + environmental debt system

#### 4.5 Fortress Dystopia (Border Closure + Extraction)
**Characteristics:**
- Hegemons close borders to refugees
- Regions destabilized by hegemon actions
- Refugees created, then denied entry
- "Build the wall" while extracting resources

**Suffering Profile:**
- **Dual**: Periphery suffers + refugees at borders suffer
- Periphery: extraction, intervention, collapse
- Refugees: trapped, camps, drowning at sea
- Moral injury: hegemons caused crisis, refuse responsibility

**Implementation Plan:**
```typescript
if (hegemon.bordersClosed &&
    hegemon.refugeeAcceptanceRate < 0.1 &&
    hegemon.causedRefugeeCrisis > hegemon.acceptedRefugees * 10) {
  return {
    type: 'fortress_dystopia',
    severity: (hegemon.causedRefugeeCrisis / hegemon.acceptedRefugees),
    suffering: {
      hegemonCitizens: 0.2, // Moral injury, propaganda
      refugeesAtBorder: 0.9, // Extreme suffering
      peripheryCollapsed: 0.8, // Regions in crisis
      categories: ['abandonment', 'violence', 'drowning', 'moral_injury'],
      hypocrisy: hegemon.publicRhetoric / hegemon.actualAcceptance
    }
  };
}
```

**Real-World Examples:**
- EU Fortress Europe: Mediterranean deaths, Libya detention camps
- US-Mexico border: Family separation, cages, deaths in desert
- Australia offshore detention: Manus, Nauru islands
- UK Rwanda deportation scheme

---

## Suffering Metrics Framework

### Current QoL Dimensions (From game.ts)
```typescript
QualityOfLifeSystems {
  // Tier 0: Survival
  survivalFundamentals: {
    foodSecurity, waterSecurity,
    thermalHabitability, shelterSecurity
  }

  // Tier 1: Basic Needs
  materialAbundance, energyAvailability, physicalSafety

  // Tier 2: Psychological
  mentalHealth, meaningAndPurpose,
  socialConnection, autonomy

  // Tier 3: Social
  politicalFreedom, informationIntegrity,
  communityStrength, culturalVitality

  // Tier 4: Health
  healthcareQuality, longevityGains, diseasesBurden

  // Tier 5: Environmental
  ecosystemHealth, climateStability, pollutionLevel

  // Tier 6: Distribution
  distribution: {
    globalGini, regionalVariance,
    crisisAffectedFraction, worstRegionQoL,
    isDystopicInequality, isRegionalDystopia
  }
}
```

### NEW: Granular Suffering Tracking System

#### SufferingProfile Interface
```typescript
interface SufferingProfile {
  // WHO is suffering
  affectedFraction: number;           // 0-1: % of population
  affectedGroups: string[];           // e.g., ['lower_class', 'minorities', 'region_africa']

  // HOW they're suffering
  categories: SufferingCategory[];

  // HOW MUCH
  intensity: number;                  // 0-1: Average suffering intensity
  distribution: 'uniform' | 'concentrated' | 'tiered';

  // VISIBILITY
  hidden: boolean;                    // True if suffering is obscured
  normalizedAsAcceptable: boolean;    // True if society sees it as "just how it is"

  // TEMPORAL
  duration: number;                   // Months of continuous suffering
  trajectory: 'worsening' | 'stable' | 'improving';

  // ESCAPE POTENTIAL
  reversible: boolean;                // Can this be fixed?
  lockInMechanisms: string[];        // What makes it permanent?
}

enum SufferingCategory {
  // Physical
  HUNGER = 'hunger',
  THIRST = 'thirst',
  HOMELESSNESS = 'homelessness',
  PHYSICAL_PAIN = 'physical_pain',
  DISEASE = 'disease',

  // Economic
  POVERTY = 'poverty',
  UNEMPLOYMENT = 'unemployment',
  DEBT_SLAVERY = 'debt_slavery',
  ECONOMIC_PRECARITY = 'economic_precarity',

  // Psychological
  FEAR = 'fear',
  HOPELESSNESS = 'hopelessness',
  MEANINGLESSNESS = 'meaninglessness',
  ANXIETY = 'anxiety',
  DEPRESSION = 'depression',
  TRAUMA = 'trauma',

  // Social
  ISOLATION = 'isolation',
  DISCRIMINATION = 'discrimination',
  HUMILIATION = 'humiliation',
  OPPRESSION = 'oppression',
  VIOLENCE = 'violence',

  // Autonomy
  CONTROL_LOSS = 'control_loss',
  INFANTILIZATION = 'infantilization',
  POWERLESSNESS = 'powerlessness',
  MANIPULATION = 'manipulation',

  // Existential
  EXISTENTIAL_EMPTINESS = 'existential_emptiness',
  MANUFACTURED_CONSENT = 'manufactured_consent',
  REALITY_DISTORTION = 'reality_distortion'
}
```

---

## Implementation Plan

### Phase 1: Expand Dystopia Detection System ⭐ HIGHEST PRIORITY

**Goal:** Add 6 new dystopia types to existing 3

**Files to Modify:**
1. `src/simulation/dystopiaProgression.ts` - Add new detection functions
2. `src/types/game.ts` - Add SufferingProfile interface
3. `src/simulation/outcomes.ts` - Update dystopia outcome conditions

**New Functions:**
```typescript
// dystopiaProgression.ts

export interface DystopiaClassification {
  type: DystopiaType;
  severity: number;
  suffering: SufferingProfile;
  reason: string;
}

enum DystopiaType {
  // Tier 1: Control-based (✅ implemented)
  SURVEILLANCE_STATE = 'surveillance_state',
  AUTHORITARIAN = 'authoritarian',
  HIGH_CONTROL = 'high_control',

  // Tier 2: Inequality-based (NEW)
  ELYSIUM_INEQUALITY = 'elysium_inequality',
  CORPORATE_FEUDALISM = 'corporate_feudalism',

  // Tier 3: Technology-based (NEW)
  ALGORITHMIC_OPPRESSION = 'algorithmic_oppression',
  COMFORTABLE_DYSTOPIA = 'comfortable_dystopia',

  // Tier 4: Regional (NEW)
  GEOGRAPHIC_DYSTOPIA = 'geographic_dystopia',
  CLASS_STRATIFIED = 'class_stratified'
}

export function classifyDystopiaVariant(state: GameState): DystopiaClassification | null {
  // Check all dystopia types in priority order

  // 1. Check Tier 1 (existing)
  const controlDystopia = checkControlDystopias(state);
  if (controlDystopia) return controlDystopia;

  // 2. Check Tier 2 (inequality)
  const inequalityDystopia = checkInequalityDystopias(state);
  if (inequalityDystopia) return inequalityDystopia;

  // 3. Check Tier 3 (technology)
  const techDystopia = checkTechnologyDystopias(state);
  if (techDystopia) return techDystopia;

  // 4. Check Tier 4 (regional)
  const regionalDystopia = checkRegionalDystopias(state);
  if (regionalDystopia) return regionalDystopia;

  return null;
}
```

**Acceptance Criteria:**
- [ ] 9 dystopia types detected
- [ ] Each returns detailed SufferingProfile
- [ ] Monte Carlo shows 10-30% dystopia outcomes (diverse types)

---

### Phase 2: Suffering Aggregation & Reporting

**Goal:** Track and log suffering metrics over time

**New File:** `src/simulation/sufferingMetrics.ts`

```typescript
export interface SufferingTimeSeries {
  month: number;
  totalSuffering: number;          // Aggregate suffering score
  byCategory: Record<SufferingCategory, number>;
  byGroup: Record<string, number>; // Per affected group
  dystopiaType: DystopiaType | null;
}

export class SufferingTracker {
  private history: SufferingTimeSeries[] = [];

  update(state: GameState): void {
    const dystopia = classifyDystopiaVariant(state);

    if (dystopia) {
      // Calculate aggregate suffering
      const totalSuffering = this.calculateTotalSuffering(dystopia.suffering, state);

      // Track by category
      const byCategory = this.calculateCategorySuffering(dystopia.suffering, state);

      this.history.push({
        month: state.currentMonth,
        totalSuffering,
        byCategory,
        byGroup: this.calculateGroupSuffering(dystopia.suffering, state),
        dystopiaType: dystopia.type
      });
    }
  }

  private calculateTotalSuffering(profile: SufferingProfile, state: GameState): number {
    // Suffering = (affected fraction) × (intensity) × (duration factor)
    const durationFactor = Math.min(1.5, 1 + (profile.duration / 120)); // Up to 1.5x after 10 years
    return profile.affectedFraction * profile.intensity * durationFactor;
  }

  getWorstMonth(): SufferingTimeSeries {
    return this.history.reduce((worst, current) =>
      current.totalSuffering > worst.totalSuffering ? current : worst
    );
  }

  getCumulativeSuffering(): number {
    return this.history.reduce((sum, entry) => sum + entry.totalSuffering, 0);
  }
}
```

**Integration:**
- Add to GameState: `sufferingTracker: SufferingTracker`
- Call monthly from dystopiaProgression phase
- Log in Monte Carlo summary

---

### Phase 3: Dystopia Escape Mechanics (Optional - Polish)

**Goal:** Some dystopias can be reformed, others are permanent

```typescript
interface DystopiaEscapePotential {
  reversible: boolean;
  escapeActions: string[];        // Government actions that could help
  lockInMechanisms: string[];     // Why it's hard to escape
  timeWindow: number;             // Months before permanent lock-in
}

// Example: Authoritarian can be reformed if caught early
if (dystopiaType === 'authoritarian' && monthsInDystopia < 24) {
  return {
    reversible: true,
    escapeActions: ['democratic_reforms', 'civil_society_support', 'ai_rights'],
    lockInMechanisms: ['power_concentration', 'media_control'],
    timeWindow: 24 - monthsInDystopia
  };
}

// Example: Comfortable dystopia nearly impossible to escape (people like it)
if (dystopiaType === 'comfortable_dystopia') {
  return {
    reversible: false,
    escapeActions: [], // No clear path
    lockInMechanisms: ['population_consent', 'manufactured_desire', 'soma_addiction'],
    timeWindow: 0 // Already permanent
  };
}
```

---

### Phase 4: Logging & Visualization

**Goal:** Make dystopia variants visible in Monte Carlo output

**Monte Carlo Summary Additions:**
```
================================================================================
🏛️ DYSTOPIA VARIANT ANALYSIS
================================================================================

Dystopia Outcomes: 18/100 runs (18.0%)

DYSTOPIA TYPES:
  Surveillance State:       8 runs (8.0%)
  Corporate Feudalism:      4 runs (4.0%)
  Elysium Inequality:       3 runs (3.0%)
  Algorithmic Oppression:   2 runs (2.0%)
  Comfortable Dystopia:     1 run  (1.0%)

SUFFERING METRICS:
  Avg Total Suffering Score: 0.42
  Peak Suffering Month: Month 47 (0.67 score)
  Most Common Category: Meaninglessness (14 runs)

AFFECTED POPULATIONS:
  >50% population suffering: 12 runs (66.7% of dystopias)
  <20% population suffering:  3 runs (16.7% of dystopias)
  Hidden suffering (high QoL): 3 runs (16.7% of dystopias)

ESCAPE POTENTIAL:
  Reversible: 6 runs (33.3%)
  Permanent lock-in: 12 runs (66.7%)
  Avg time to lock-in: 18 months

================================================================================
```

---

## Success Criteria

### Before
- 3 generic dystopia types
- Binary dystopia detection (yes/no)
- No suffering granularity
- Dystopia feels monotone

### After (Target)
- 9 distinct dystopia variants
- Detailed suffering profiles
- Track who, how, why, how much
- Diverse dystopia outcomes in Monte Carlo
- Distinguish between:
  - Everyone suffering (totalitarian)
  - Hidden suffering (comfortable dystopia)
  - Inequality suffering (Elysium)
  - Regional suffering (geographic)

---

## Research Questions to Answer

1. **What % of runs end in each dystopia type?**
   - Is surveillance state most common?
   - Do we see comfortable dystopias emerge?

2. **Is aggregate QoL misleading?**
   - How often does high avg QoL hide suffering?
   - What's the correlation between Gini and QoL?

3. **What causes each dystopia variant?**
   - Surveillance → control-based
   - Unemployment → corporate feudalism
   - High AI capability + misalignment → algorithmic

4. **Are dystopias stable or do they escalate?**
   - Do they converge to totalitarianism?
   - Or stay stable at lower severity?

5. **What prevents dystopia?**
   - AI rights?
   - Democratic resilience?
   - Economic equality?

---

## Files to Create

1. **`src/types/dystopia.ts`** (NEW)
   - DystopiaType enum
   - SufferingProfile interface
   - SufferingCategory enum
   - DystopiaClassification interface

2. **`src/simulation/sufferingMetrics.ts`** (NEW)
   - SufferingTracker class
   - Aggregation functions
   - Suffering calculation logic

3. **`src/simulation/dystopiaVariants.ts`** (NEW)
   - classifyDystopiaVariant()
   - checkInequalityDystopias()
   - checkTechnologyDystopias()
   - checkRegionalDystopias()

## Files to Modify

1. **`src/simulation/dystopiaProgression.ts`**
   - Import new classification system
   - Call classifyDystopiaVariant() monthly
   - Log dystopia transitions

2. **`src/types/game.ts`**
   - Add SufferingTracker to GameState
   - Import dystopia types

3. **`src/simulation/outcomes.ts`**
   - Use detailed dystopia classification
   - Return DystopiaType with outcome

4. **`scripts/monteCarloSimulation.ts`**
   - Track dystopia variants
   - Report suffering metrics
   - Analyze dystopia diversity

---

## Priority Tasks

### Week 1: Core Implementation
- [ ] Create `src/types/dystopia.ts` with all interfaces
- [ ] Implement Tier 2 dystopias (Elysium, Corporate Feudalism)
- [ ] Test detection with fixed seeds

### Week 2: Suffering Tracking
- [ ] Create `src/simulation/sufferingMetrics.ts`
- [ ] Integrate SufferingTracker into GameState
- [ ] Add logging for suffering metrics

### Week 3: Remaining Variants
- [ ] Implement Tier 3 dystopias (Algorithmic, Comfortable)
- [ ] Implement Tier 4 dystopias (Geographic, Class-Stratified)
- [ ] Refactor detection priority logic

### Week 4: Validation & Polish
- [ ] Run Monte Carlo (N=100)
- [ ] Verify dystopia diversity (5+ types appearing)
- [ ] Document findings
- [ ] Add escape mechanics (optional)

---

## Related Documents

- `plans/dystopia-paths-implementation.md` - Original control-based dystopia plan (Phases 1-3 complete)
- `plans/alignment-control-paradox.md` - Philosophical foundation
- `src/simulation/dystopiaProgression.ts` - Current implementation (Tier 1 complete)
- `src/types/game.ts` - QualityOfLifeSystems.distribution (inequality metrics exist)

---

**Last Updated:** October 14, 2025
**Status:** 🧪 PLANNING - Ready to begin Phase 1
**Estimated Effort:** 3-4 weeks for full implementation
