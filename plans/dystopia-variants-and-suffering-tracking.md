# Dystopia Variant Paths & Suffering Tracking System

**Date:** October 14, 2025
**Updated:** October 15, 2025 (Integrated with TIER 2.8 geopolitical system)
**Status:** 🧪 PLANNING - Building on existing control-dystopia mechanics
**Goal:** Model diverse dystopian outcomes with granular suffering metrics

---

## TIER 2.8 Integration Status ✅

**Completed:** October 15, 2025

All dystopia detection examples have been updated to use **TIER 2.8 actual data structures**:

**✅ Updated Sections:**
1. **Hegemonic Dystopia Detection** - Uses `CountryPopulation.isHegemon` field
2. **Regional Dystopia Detection** - Uses `extractedBy[]`, `activeInterventions[]`, `sovereignty`
3. **Extraction Dystopia** - Uses `ExtractionFlow[]`, `resourceValue`, `sovereignty`
4. **War Dystopia** - Uses `MilitaryIntervention[]`, `effects.refugeesCreated`, `effects.infrastructureDestruction`
5. **Asymmetric Dystopia** - Uses `extractionTargets[]` to detect Elysium scenarios
6. **Regional Tracking** - Uses `Map<CountryName, DystopiaState>` for per-country tracking

**🔧 Future Extensions Required:**
- **Debt Trap Dystopia** - Needs: `debtToGDP`, `austerityActive`, `debtHolders`
- **Fortress Dystopia** - Needs: `bordersClosed`, `refugeeAcceptanceRate`, `causedRefugeeCrisis`

All code examples now reference actual TIER 2.8 interfaces from `src/types/countryPopulations.ts`.

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

**Detection (Using TIER 2.8):**
```typescript
// Check each hegemon country: US, China, Russia, India, UK
for (const countryName of Object.keys(state.countryPopulations.countries) as CountryName[]) {
  const country = state.countryPopulations.countries[countryName];

  // Only check hegemons
  if (!country.isHegemon) continue;

  // Use global QoL systems (could be per-country in future)
  const qol = state.qualityOfLifeSystems;
  if (qol.surveillanceLevel > 0.7 &&
      qol.politicalFreedom < 0.3 &&
      qol.autonomy < 0.4) {
    // This hegemon is in dystopia
    state.regionalDystopias.set(country.name, {
      active: true,
      variant: 'authoritarian',
      level: 'hegemonic',
      startMonth: state.currentMonth,
      severity: qol.surveillanceLevel * (1 - qol.politicalFreedom),
      // ... other DystopiaState fields
    });
  }
}
```

#### 3. Regional Dystopia (Extracted/Exploited Regions)
**Definition:** Specific regions suffer due to extraction, intervention, or collapse

**Examples:**
- Sub-Saharan Africa exploited for minerals (extraction dystopia)
- Middle East destabilized by interventions (war dystopia)
- South Asia in debt trap (economic dystopia)

**Detection (Using TIER 2.8):**
```typescript
for (const countryName of Object.keys(state.countryPopulations.countries) as CountryName[]) {
  const country = state.countryPopulations.countries[countryName];

  // Skip hegemons - they extract, not extracted
  if (country.isHegemon) continue;

  // Extraction dystopia
  if (country.extractedBy.length > 0) {
    const totalExtraction = country.extractedBy.reduce((sum, flow) =>
      sum + flow.annualValueExtracted, 0);
    const extractionRate = country.resourceValue.totalValue > 0
      ? totalExtraction / country.resourceValue.totalValue
      : 0;

    if (extractionRate > 0.7 &&
        country.sovereignty.overall < 0.2) {
      state.regionalDystopias.set(country.name, {
        active: true,
        variant: 'extraction_dystopia',
        level: 'regional',
        severity: extractionRate * (1 - country.sovereignty.overall),
        // ... other DystopiaState fields
      });
    }
  }

  // Military intervention dystopia
  if (country.activeInterventions.length > 0) {
    const totalRefugees = country.activeInterventions.reduce((sum, i) =>
      sum + i.effects.refugeesCreated, 0);

    if (totalRefugees > country.population * 0.1) {
      state.regionalDystopias.set(country.name, {
        active: true,
        variant: 'war_dystopia',
        level: 'regional',
        severity: totalRefugees / country.population,
        // ... other DystopiaState fields
      });
    }
  }
}
```

### Asymmetric Dystopia: Hegemons vs Periphery

**Key Pattern:** Hegemons can be in golden age while colonies suffer

```typescript
// Elysium scenario (using TIER 2.8)
// Check if a hegemon is thriving while extracted countries suffer

for (const hegemonName of Object.keys(state.countryPopulations.countries) as CountryName[]) {
  const hegemon = state.countryPopulations.countries[hegemonName];

  if (!hegemon.isHegemon) continue;

  // Check if hegemon is in golden age
  const hegemonQoL = calculateCountryQoL(hegemon, state);
  const hegemonGoldenAge = hegemonQoL > 1.5;

  if (hegemonGoldenAge && hegemon.extractionTargets.length > 0) {
    // Check if any extraction targets are suffering
    for (const extraction of hegemon.extractionTargets) {
      const targetCountry = state.countryPopulations.countries[extraction.target];
      const targetQoL = calculateCountryQoL(targetCountry, state);

      if (targetQoL < 0.3 && extraction.annualValueExtracted > 0) {
        // Asymmetric dystopia detected!
        return {
          type: 'asymmetric_dystopia',
          subtype: 'elysium',
          level: 'global', // Affects both hegemon and periphery
          hegemon: {
            name: hegemon.name,
            status: 'golden_age',
            qol: hegemonQoL,
            dystopiaState: { active: false }
          },
          periphery: {
            name: targetCountry.name,
            status: 'extraction_dystopia',
            qol: targetQoL,
            dystopiaState: {
              active: true,
              variant: 'extraction_dystopia',
              severity: extraction.annualValueExtracted / targetCountry.resourceValue.totalValue
            }
          }
        };
      }
    }
  }
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

**Integration with TIER 2.8:**
```typescript
// Uses TIER 2.8 CountryPopulation fields:
// - extractedBy: ExtractionFlow[] (who extracts from this country)
// - sovereignty.overall: number (control over own resources)
// - resourceValue.totalValue: number (total resource wealth)

for (const countryName of Object.keys(state.countryPopulations.countries) as CountryName[]) {
  const country = state.countryPopulations.countries[countryName];

  // Skip hegemons (they extract, not extracted)
  if (country.isHegemon) continue;

  if (country.extractedBy.length > 0) {
    // Calculate total extraction from all hegemons
    const totalExtraction = country.extractedBy.reduce((sum, flow) =>
      sum + flow.annualValueExtracted, 0);
    const extractionRate = country.resourceValue.totalValue > 0
      ? totalExtraction / country.resourceValue.totalValue
      : 0;

    if (extractionRate > 0.7 &&
        country.sovereignty.overall < 0.3 &&
        country.resourceValue.totalValue > 100) {
      return {
        type: 'extraction_dystopia',
        severity: extractionRate * (1 - country.sovereignty.overall),
        suffering: {
          affectedFraction: country.population / state.population,
          categories: ['poverty', 'powerlessness', 'environmental_destruction'],
          intensity: 0.8,
          cause: 'colonial_extraction',
          extractors: country.extractedBy.map(f => f.hegemon) // Which hegemons
        },
        regionId: country.name
      };
    }
  }
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

**Integration with TIER 2.8:**
```typescript
// Uses TIER 2.8 CountryPopulation fields:
// - activeInterventions: MilitaryIntervention[] (foreign military operations)
// - population: number (country population in millions)

for (const countryName of Object.keys(state.countryPopulations.countries) as CountryName[]) {
  const country = state.countryPopulations.countries[countryName];

  if (country.activeInterventions.length > 0) {
    // Sum effects from all interventions
    const totalRefugees = country.activeInterventions.reduce((sum, intervention) =>
      sum + intervention.effects.refugeesCreated, 0);
    const avgInfraDestruction = country.activeInterventions.reduce((sum, intervention) =>
      sum + intervention.effects.infrastructureDestruction, 0) / country.activeInterventions.length;

    if (totalRefugees > country.population * 0.1 || avgInfraDestruction > 0.5) {
      return {
        type: 'war_dystopia',
        severity: avgInfraDestruction + (totalRefugees / country.population),
        suffering: {
          affectedFraction: country.population / state.population,
          categories: ['violence', 'displacement', 'trauma', 'poverty'],
          intensity: 0.9,
          cause: 'foreign_intervention',
          interventions: country.activeInterventions.map(i => ({
            hegemon: i.hegemon,
            justification: i.publicJustification,
            actualGoals: i.actualGoals
          }))
        },
        regionId: country.name
      };
    }
  }
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

**Implementation Plan (Requires TIER 2.8 Extension):**
```typescript
// NOTE: These fields need to be added to CountryPopulation:
// - debtToGDP: number (external debt as % of GDP)
// - austerityActive: boolean (IMF/World Bank imposed austerity)
// - austerityLevel: number [0, 1] (severity of spending cuts)
// - resourceSoldToServiceDebt: number [0, 1] (% of resources sold to pay debt)
// - debtHolders: Record<CountryName | 'IMF' | 'WorldBank', number> (who owns the debt)

if (country.debtToGDP > 0.8 &&
    country.austerityActive &&
    country.resourceSoldToServiceDebt > 0.5) {
  return {
    type: 'debt_trap_dystopia',
    severity: country.debtToGDP * country.austerityLevel,
    suffering: {
      affectedFraction: 0.9, // Most citizens
      categories: ['economic_precarity', 'service_collapse', 'powerlessness'],
      intensity: 0.7,
      cause: 'debt_trap',
      creditors: Object.keys(country.debtHolders) // Who holds the debt
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

**Implementation Plan (Requires TIER 2.8 Extension):**
```typescript
// NOTE: These fields need to be added to CountryPopulation (hegemons only):
// - bordersClosed: boolean (closed to refugees/immigrants)
// - refugeeAcceptanceRate: number (% of refugees accepted vs applying)
// - causedRefugeeCrisis: number (refugees created by this hegemon's interventions)
// - acceptedRefugees: number (refugees actually admitted)
// - publicRhetoric: number [0, 1] (humanitarian claims in speeches)
// - actualAcceptance: number [0, 1] (actual refugee admissions)

// Could partially use existing TIER 2.8 fields:
// - climateMigrationPressure: number (climate refugees trying to enter)
// - activeInterventions[].effects.refugeesCreated: number (war refugees caused)

for (const countryName of Object.keys(state.countryPopulations.countries) as CountryName[]) {
  const hegemon = state.countryPopulations.countries[countryName];

  if (!hegemon.isHegemon) continue;

  if (hegemon.bordersClosed &&
      hegemon.refugeeAcceptanceRate < 0.1 &&
      hegemon.causedRefugeeCrisis > hegemon.acceptedRefugees * 10) {
    return {
      type: 'fortress_dystopia',
      severity: (hegemon.causedRefugeeCrisis / Math.max(1, hegemon.acceptedRefugees)),
      suffering: {
        affectedFraction: hegemon.causedRefugeeCrisis / state.population,
        categories: ['abandonment', 'violence', 'drowning', 'moral_injury'],
        intensity: 0.9,
        subcategories: {
          hegemonCitizens: 0.2,    // Moral injury, propaganda
          refugeesAtBorder: 0.9,   // Extreme suffering
          peripheryCollapsed: 0.8  // Regions in crisis
        }
      },
      hegemonId: hegemon.name
    };
  }
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

### Phase 1: Add DystopiaState Tracking (Status System Foundation) ⭐ HIGHEST PRIORITY

**Goal:** Refactor dystopia to be a STATUS (like Golden Age), not a terminal outcome

**Key Principle:** Dystopia should work like Golden Age - can enter, exit, and track duration.

**Files to Modify:**
1. `src/types/game.ts` - Add DystopiaState interface to GameState
2. `src/simulation/dystopiaProgression.ts` - Refactor to use status tracking
3. `src/simulation/outcomes.ts` - Update to report duration, not just binary state

**New Interfaces (game.ts):**
```typescript
export interface DystopiaState {
  // Status tracking
  active: boolean;                    // Currently in dystopia?
  variant: DystopiaType | null;       // Which type (surveillance, elysium, etc.)?
  level: 'global' | 'hegemonic' | 'regional' | null; // Which level?

  // Duration tracking
  startMonth: number | null;          // When entered current dystopia
  totalMonthsInDystopia: number;      // Cumulative across all dystopias
  monthsInCurrentVariant: number;     // Duration of current type

  // Severity
  severity: number;                   // [0, 1] How bad?
  trajectory: 'worsening' | 'stable' | 'improving';

  // History
  previousVariants: Array<{
    type: DystopiaType;
    level: 'global' | 'hegemonic' | 'regional';
    startMonth: number;
    endMonth: number;
    severity: number;
  }>;

  // Escape potential
  reversible: boolean;
  monthsUntilLockIn: number | null;
  escapeConditions: string[];
}

// Add to GameState
export interface GameState {
  // ... existing fields ...

  // NEW: Status tracking (like goldenAgeState)
  dystopiaState: DystopiaState;

  // NEW: Regional tracking
  regionalDystopias: Map<string, DystopiaState>; // Per hegemon/region
}
```

**Entry/Exit Logic (dystopiaProgression.ts):**
```typescript
export function updateDystopiaStatus(state: GameState): void {
  const classification = classifyDystopiaVariant(state);

  if (classification) {
    // ENTERING or CONTINUING dystopia
    if (!state.dystopiaState.active) {
      // ENTRY: Log transition
      state.dystopiaState.active = true;
      state.dystopiaState.variant = classification.type;
      state.dystopiaState.level = classification.level;
      state.dystopiaState.startMonth = state.currentMonth;
      state.dystopiaState.severity = classification.severity;

      console.log(`🚨 ENTERING DYSTOPIA: ${classification.type} (${classification.level})`);
    } else if (state.dystopiaState.variant !== classification.type) {
      // VARIANT CHANGE: One dystopia type to another
      state.dystopiaState.previousVariants.push({
        type: state.dystopiaState.variant!,
        level: state.dystopiaState.level!,
        startMonth: state.dystopiaState.startMonth!,
        endMonth: state.currentMonth,
        severity: state.dystopiaState.severity
      });

      state.dystopiaState.variant = classification.type;
      state.dystopiaState.level = classification.level;
      state.dystopiaState.startMonth = state.currentMonth;
      state.dystopiaState.monthsInCurrentVariant = 0;

      console.log(`🔄 DYSTOPIA VARIANT CHANGE: → ${classification.type}`);
    }

    // Update duration
    state.dystopiaState.totalMonthsInDystopia++;
    state.dystopiaState.monthsInCurrentVariant++;
    state.dystopiaState.severity = classification.severity;

  } else {
    // EXITING dystopia
    if (state.dystopiaState.active) {
      state.dystopiaState.previousVariants.push({
        type: state.dystopiaState.variant!,
        level: state.dystopiaState.level!,
        startMonth: state.dystopiaState.startMonth!,
        endMonth: state.currentMonth,
        severity: state.dystopiaState.severity
      });

      console.log(`✅ EXITING DYSTOPIA: ${state.dystopiaState.variant} (lasted ${state.dystopiaState.monthsInCurrentVariant} months)`);

      state.dystopiaState.active = false;
      state.dystopiaState.variant = null;
      state.dystopiaState.level = null;
      state.dystopiaState.startMonth = null;
      state.dystopiaState.monthsInCurrentVariant = 0;
    }
  }
}
```

**Acceptance Criteria:**
- [ ] DystopiaState added to GameState (mirrors GoldenAgeState pattern)
- [ ] Entry/exit transitions logged
- [ ] Duration tracking works (totalMonthsInDystopia increments)
- [ ] Can transition from one dystopia type to another
- [ ] Final outcome reports: "Spent 47 months in dystopia" or "Ended in dystopia (surveillance, 18 months)"

---

### Phase 2: Three-Level Dystopia Detection (Global/Hegemonic/Regional)

**Goal:** Detect dystopia at three levels simultaneously

**Key Insight:** Multiple dystopias can coexist:
- Global: Entire world suffering (>80% population)
- Hegemonic: Specific major power dystopian (US, China, EU)
- Regional: Extracted/exploited regions suffering (Sub-Saharan Africa, Middle East)

**Files to Modify:**
1. `src/simulation/dystopiaProgression.ts` - Add three-level classification
2. `src/types/game.ts` - Add hegemonic/regional dystopia tracking
3. (Future) `src/simulation/hegemonicPowers.ts` - Integrate with colonial system

**Detection Architecture:**
```typescript
export interface DystopiaClassification {
  type: DystopiaType;
  level: 'global' | 'hegemonic' | 'regional';
  severity: number;
  suffering: SufferingProfile;
  reason: string;

  // Level-specific details
  affectedPopulation?: number;      // Global
  hegemonId?: string;               // Hegemonic
  regionId?: string;                // Regional
}

export function classifyDystopiaVariant(state: GameState): DystopiaClassification | null {
  // Priority 1: Check global dystopia (affects everyone)
  const globalDystopia = checkGlobalDystopia(state);
  if (globalDystopia) return { ...globalDystopia, level: 'global' };

  // Priority 2: Check hegemonic dystopia (major powers)
  const hegemonicDystopia = checkHegemonicDystopias(state);
  if (hegemonicDystopia) return { ...hegemonicDystopia, level: 'hegemonic' };

  // Priority 3: Check regional dystopia (exploitation/extraction)
  const regionalDystopia = checkRegionalDystopias(state);
  if (regionalDystopia) return { ...regionalDystopia, level: 'regional' };

  return null;
}

function checkGlobalDystopia(state: GameState): Partial<DystopiaClassification> | null {
  const qol = state.qualityOfLifeSystems;

  // Surveillance state (global)
  if (qol.surveillanceLevel > 0.8 && qol.politicalFreedom < 0.2 && qol.autonomy < 0.3) {
    return {
      type: 'surveillance_state',
      severity: qol.surveillanceLevel * (1 - qol.autonomy),
      suffering: {
        affectedFraction: 0.95,
        categories: ['control_loss', 'fear', 'oppression'],
        intensity: 0.8
      },
      reason: 'Total surveillance, global control',
      affectedPopulation: state.population * 0.95
    };
  }

  // Comfortable dystopia (global)
  if (qol.materialAbundance > 1.2 && qol.meaningAndPurpose < 0.3 && qol.autonomy < 0.4) {
    return {
      type: 'comfortable_dystopia',
      severity: qol.materialAbundance * (1 - qol.meaningAndPurpose),
      suffering: {
        affectedFraction: 0.95,
        categories: ['existential_emptiness', 'manufactured_consent'],
        intensity: 0.4,
        hidden: true
      },
      reason: 'Materially abundant but existentially empty',
      affectedPopulation: state.population * 0.95
    };
  }

  return null;
}

function checkHegemonicDystopias(state: GameState): Partial<DystopiaClassification> | null {
  // Check each major power using TIER 2.8 country system
  // Hegemons: US, China, Russia, India, UK
  for (const countryName of Object.keys(state.countryPopulations.countries) as CountryName[]) {
    const country = state.countryPopulations.countries[countryName];

    // Only check hegemons
    if (!country.isHegemon) continue;

    // Authoritarian hegemon (using QoL systems)
    const qol = state.qualityOfLifeSystems;
    if (qol.surveillanceLevel > 0.7 && qol.politicalFreedom < 0.3) {
      return {
        type: 'authoritarian',
        severity: qol.surveillanceLevel * (1 - qol.politicalFreedom),
        suffering: {
          affectedFraction: country.population / state.population,
          categories: ['oppression', 'control_loss', 'fear'],
          intensity: 0.7
        },
        reason: `${country.name} authoritarian regime`,
        hegemonId: country.name
      };
    }
  }
  return null;
}

function checkRegionalDystopias(state: GameState): Partial<DystopiaClassification> | null {
  // Check countries using TIER 2.8 extraction and intervention tracking
  for (const countryName of Object.keys(state.countryPopulations.countries) as CountryName[]) {
    const country = state.countryPopulations.countries[countryName];

    // Skip hegemons (they're extractors, not extracted)
    if (country.isHegemon) continue;

    // EXTRACTION DYSTOPIA: Country being extracted from
    // Uses TIER 2.8: extractedBy, sovereignty, resourceValue
    if (country.extractedBy.length > 0) {
      // Calculate total extraction rate
      const totalExtraction = country.extractedBy.reduce((sum, flow) =>
        sum + flow.annualValueExtracted, 0);
      const extractionRate = country.resourceValue.totalValue > 0
        ? totalExtraction / country.resourceValue.totalValue
        : 0;

      // High extraction + low sovereignty + poverty = extraction dystopia
      if (extractionRate > 0.5 &&
          country.sovereignty.overall < 0.4 &&
          country.resourceValue.totalValue > 100) { // Significant resources

        return {
          type: 'extraction_dystopia',
          severity: extractionRate * (1 - country.sovereignty.overall),
          suffering: {
            affectedFraction: country.population / state.population,
            categories: ['poverty', 'powerlessness', 'environmental_destruction'],
            intensity: 0.8
          },
          reason: `${country.name}: resource extraction by ${country.extractedBy.map(f => f.hegemon).join(', ')}`,
          regionId: country.name
        };
      }
    }

    // WAR DYSTOPIA: Country under military intervention
    // Uses TIER 2.8: activeInterventions[]
    if (country.activeInterventions.length > 0) {
      // Sum up all intervention effects
      const totalRefugees = country.activeInterventions.reduce((sum, intervention) =>
        sum + intervention.effects.refugeesCreated, 0);
      const avgInfrastructureDestruction = country.activeInterventions.reduce((sum, intervention) =>
        sum + intervention.effects.infrastructureDestruction, 0) / country.activeInterventions.length;

      // Active war with significant humanitarian crisis
      if (totalRefugees > country.population * 0.05 || avgInfrastructureDestruction > 0.3) {
        return {
          type: 'war_dystopia',
          severity: Math.max(avgInfrastructureDestruction, totalRefugees / country.population),
          suffering: {
            affectedFraction: Math.min(1.0, country.population / state.population),
            categories: ['violence', 'displacement', 'trauma'],
            intensity: 0.9
          },
          reason: `${country.name}: military interventions by ${country.activeInterventions.map(i => i.hegemon).join(', ')}`,
          regionId: country.name
        };
      }
    }
  }
  return null;
}
```

**Regional Dystopia Tracking:**
```typescript
// In GameState
regionalDystopias: Map<CountryName, DystopiaState>; // countryName → state

// Update each country's dystopia status (using TIER 2.8 country tracking)
for (const countryName of Object.keys(state.countryPopulations.countries) as CountryName[]) {
  const country = state.countryPopulations.countries[countryName];

  // Check if this country is in regional dystopia
  const regionalClassification = checkSpecificCountryDystopia(country, state);
  if (regionalClassification) {
    if (!state.regionalDystopias.has(countryName)) {
      state.regionalDystopias.set(countryName, createDystopiaState(regionalClassification));
    } else {
      updateRegionalDystopiaState(state.regionalDystopias.get(countryName)!, regionalClassification);
    }
  } else {
    // Country escaped dystopia
    if (state.regionalDystopias.has(countryName)) {
      const dystopiaState = state.regionalDystopias.get(countryName)!;
      dystopiaState.active = false;
      // Could also remove from map if desired
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Global dystopia detection working (surveillance, comfortable)
- [ ] Hegemonic dystopia detection per major power
- [ ] Regional dystopia detection per extracted region
- [ ] Asymmetric dystopia detection (hegemon golden age + region dystopia)
- [ ] Multiple dystopias can coexist (e.g., China authoritarian + Africa extraction)

---

### Phase 3: Implement New Dystopia Variants (Tiers 2-4)

**Goal:** Add 6 new dystopia types with status integration

**Tier 2: Inequality Dystopias**

1. **Elysium Dystopia** - Extreme inequality (top 10% thriving, bottom 50% suffering)
2. **Corporate Feudalism** - Corporate control, high unemployment, no government legitimacy

**Tier 3: Technology Dystopias**

3. **Algorithmic Oppression** - AI-driven manipulation, filter bubbles, personalized control
4. **Comfortable Dystopia** - Materially abundant but existentially empty (Brave New World)

**Tier 4: Regional/Extraction Dystopias**

5. **Extraction Dystopia** - Colonial resource extraction (connects to colonial system)
6. **War Dystopia** - Military intervention zones (Iraq, Libya, Yemen patterns)
7. **Debt Trap Dystopia** - IMF/austerity cycles (Greece, Argentina patterns)
8. **Geographic Dystopia** - Climate collapse in specific regions
9. **Fortress Dystopia** - Closed borders + extraction (causes refugee crisis, refuses entry)

**Files to Modify:**
1. `src/simulation/dystopiaProgression.ts` - Add detection for 6 new types
2. `src/types/dystopia.ts` (NEW) - DystopiaType enum with all 9 types
3. `src/simulation/dystopiaVariants.ts` (NEW) - Detection functions for each tier

**Implementation Pattern (each variant):**
```typescript
function checkElysiumDystopia(state: GameState): DystopiaClassification | null {
  const qol = state.qualityOfLifeSystems;
  const dist = qol.distribution;

  if (dist.globalGini > 0.5 &&
      dist.worstRegionQoL < 0.3 &&
      qol.materialAbundance > 1.0) { // Aggregate looks OK, but hides suffering

    return {
      type: 'elysium_inequality',
      level: 'global', // Affects whole world (asymmetrically)
      severity: dist.globalGini * (1 - dist.worstRegionQoL),
      suffering: {
        affectedFraction: 0.5, // Bottom 50%
        categories: ['poverty', 'hopelessness', 'powerlessness'],
        intensity: 0.8,
        hidden: false // Suffering is visible, just normalized
      },
      reason: 'Extreme inequality: top 10% thriving, bottom 50% suffering',
      affectedPopulation: state.population * 0.5
    };
  }
  return null;
}
```

**Integration with Status System:**
```typescript
// In dystopiaProgression.ts
export function updateDystopiaStatus(state: GameState): void {
  // Check all tiers
  const classification =
    checkGlobalDystopia(state) ||
    checkHegemonicDystopias(state) ||
    checkRegionalDystopias(state) ||
    checkElysiumDystopia(state) ||      // Tier 2
    checkCorporateFeudalism(state) ||   // Tier 2
    checkAlgorithmicOppression(state) || // Tier 3
    checkComfortableDystopia(state) ||  // Tier 3
    null;

  // Update DystopiaState (entry/exit/variant change logic from Phase 1)
  if (classification) {
    updateOrEnterDystopia(state, classification);
  } else {
    exitDystopiaIfActive(state);
  }
}
```

**Acceptance Criteria:**
- [ ] All 9 dystopia types detected correctly
- [ ] Each variant has unique suffering profile
- [ ] Tier 4 dystopias integrate with colonial extraction system
- [ ] Status tracking works for all variants (can enter/exit each type)
- [ ] Monte Carlo shows diverse dystopia types (not just surveillance)

---

### Phase 4: Final Reporting & Duration Tracking

**Goal:** Report dystopia duration and status in final outcomes

**Key Requirements:**
1. Final outcome should report: "Spent X months in dystopia" or "Ended in dystopia"
2. Show breakdown by dystopia type (e.g., "32 months surveillance, 15 months corporate feudalism")
3. Distinguish "spent time but escaped" vs "ended in dystopia"

**Files to Modify:**
1. `src/simulation/outcomes.ts` - Add duration reporting
2. `scripts/monteCarloSimulation.ts` - Track dystopia patterns across runs

**Final Outcome Reporting (outcomes.ts):**
```typescript
export function determineOutcome(state: GameState): OutcomeResult {
  const { dystopiaState } = state;

  // Check if ended in dystopia (still active)
  if (dystopiaState.active) {
    return {
      outcome: 'dystopia',
      subtype: dystopiaState.variant!,
      level: dystopiaState.level!,
      severity: dystopiaState.severity,
      duration: {
        totalMonths: dystopiaState.totalMonthsInDystopia,
        currentVariantMonths: dystopiaState.monthsInCurrentVariant,
        breakdown: [
          ...dystopiaState.previousVariants,
          {
            type: dystopiaState.variant!,
            level: dystopiaState.level!,
            startMonth: dystopiaState.startMonth!,
            endMonth: state.currentMonth,
            severity: dystopiaState.severity
          }
        ]
      },
      message: `Ended in ${dystopiaState.variant} dystopia after ${dystopiaState.totalMonthsInDystopia} months`
    };
  }

  // Spent time in dystopia but escaped
  if (dystopiaState.totalMonthsInDystopia > 0) {
    return {
      outcome: 'escaped_dystopia',
      dystopiaHistory: {
        totalMonths: dystopiaState.totalMonthsInDystopia,
        variants: dystopiaState.previousVariants
      },
      finalState: determineNonDystopiaOutcome(state), // utopia, golden age, etc.
      message: `Spent ${dystopiaState.totalMonthsInDystopia} months in dystopia, then escaped to ${finalState}`
    };
  }

  // Never entered dystopia
  return determineNonDystopiaOutcome(state);
}
```

**Monte Carlo Summary with Duration:**
```
================================================================================
🏛️ DYSTOPIA STATUS TRACKING
================================================================================

DYSTOPIA OUTCOMES:
  Ended in dystopia:        18/100 runs (18.0%)
  Escaped dystopia:         24/100 runs (24.0%)
  Never entered dystopia:   58/100 runs (58.0%)

DYSTOPIA VARIANTS (runs that ended in dystopia):
  Surveillance State:       8 runs (44.4% of dystopias)
  Extraction Dystopia:      4 runs (22.2% of dystopias)
  Corporate Feudalism:      3 runs (16.7% of dystopias)
  Elysium Inequality:       2 runs (11.1% of dystopias)
  War Dystopia:             1 run  ( 5.6% of dystopias)

DURATION ANALYSIS:
  Runs that ended in dystopia:
    - Avg duration: 47 months (min: 12, max: 120)
    - Median: 38 months

  Runs that escaped dystopia:
    - Avg time in dystopia: 18 months (min: 3, max: 52)
    - Avg escape time: 24 months after entry

LEVEL BREAKDOWN:
  Global dystopia:    12 runs (e.g., surveillance, comfortable)
  Hegemonic dystopia: 5 runs (e.g., US/China authoritarian)
  Regional dystopia:  10 runs (e.g., Africa extraction, Middle East war)

VARIANT TRANSITIONS:
  6 runs changed dystopia type mid-simulation:
    - Surveillance → Corporate Feudalism: 3 runs
    - Extraction → War Dystopia: 2 runs
    - Elysium → Comfortable Dystopia: 1 run

================================================================================
```

**Acceptance Criteria:**
- [ ] Final outcome reports total months in dystopia
- [ ] Distinguishes "ended in dystopia" vs "escaped dystopia"
- [ ] Shows breakdown by variant (e.g., "32 surveillance + 15 corporate")
- [ ] Monte Carlo tracks duration statistics (min/max/median)
- [ ] Can see variant transitions (surveillance → corporate)

---

### Phase 5: Escape Mechanics & Lock-In (Optional - Polish)

**Goal:** Model which dystopias are escapable vs permanent

**Key Insight:** Some dystopias have reform pathways, others lock in permanently.

**Escape Difficulty by Type:**

**Easy to Escape (if caught early):**
- Authoritarian: Democratic reforms, civil society support
- Surveillance State: Privacy protections, government transparency

**Medium Difficulty:**
- Corporate Feudalism: UBI, labor organizing, antitrust
- Algorithmic Oppression: AI regulation, data rights

**Hard to Escape:**
- Comfortable Dystopia: Population doesn't want to leave (soma addiction)
- Elysium Inequality: Elites have no incentive to change

**Nearly Impossible:**
- Extraction Dystopia: Requires decolonization, reparations
- War Dystopia: Hegemon must end intervention voluntarily

**Implementation:**
```typescript
export interface EscapePotential {
  reversible: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'impossible';
  escapeActions: string[];        // Government actions that help
  lockInMechanisms: string[];     // Why it's hard to escape
  timeWindowMonths: number | null; // Months before permanent lock-in (null if always reversible)
}

function calculateEscapePotential(dystopiaState: DystopiaState, state: GameState): EscapePotential {
  switch (dystopiaState.variant) {
    case 'authoritarian':
      // Can escape if caught within 24 months
      return {
        reversible: dystopiaState.monthsInCurrentVariant < 24,
        difficulty: 'easy',
        escapeActions: ['democratic_reforms', 'free_elections', 'civil_society_support'],
        lockInMechanisms: ['power_concentration', 'media_control', 'opposition_suppression'],
        timeWindowMonths: 24 - dystopiaState.monthsInCurrentVariant
      };

    case 'comfortable_dystopia':
      // Nearly impossible: people like it
      return {
        reversible: false,
        difficulty: 'impossible',
        escapeActions: [], // No clear path
        lockInMechanisms: ['population_consent', 'manufactured_desire', 'soma_addiction'],
        timeWindowMonths: null // Already locked in
      };

    case 'extraction_dystopia':
      // Hard: requires hegemon to voluntarily stop extraction
      return {
        reversible: true, // Theoretically possible
        difficulty: 'hard',
        escapeActions: ['resource_nationalization', 'debt_forgiveness', 'reparations'],
        lockInMechanisms: ['hegemon_military', 'debt_trap', 'puppet_government'],
        timeWindowMonths: null // No time limit, just difficult
      };

    // ... other types
  }
}
```

**Trajectory Tracking:**
```typescript
// Update dystopiaState.trajectory each month
function updateTrajectory(dystopiaState: DystopiaState, previousSeverity: number): void {
  const currentSeverity = dystopiaState.severity;
  const delta = currentSeverity - previousSeverity;

  if (delta > 0.05) {
    dystopiaState.trajectory = 'worsening';
  } else if (delta < -0.05) {
    dystopiaState.trajectory = 'improving';
  } else {
    dystopiaState.trajectory = 'stable';
  }

  // Calculate escape potential
  const escape = calculateEscapePotential(dystopiaState, state);
  dystopiaState.reversible = escape.reversible;
  dystopiaState.monthsUntilLockIn = escape.timeWindowMonths;
  dystopiaState.escapeConditions = escape.escapeActions;
}
```

**Acceptance Criteria:**
- [ ] Each dystopia variant has escape difficulty rating
- [ ] Time-based lock-in (e.g., authoritarian locks in after 24 months)
- [ ] Trajectory tracking (worsening/stable/improving)
- [ ] Government actions can trigger escape (democratic reforms help authoritarian exit)
- [ ] Some dystopias permanently locked in (comfortable dystopia)

---

## Success Criteria

### Before (Current State)
- 3 generic dystopia types (surveillance, authoritarian, high_control)
- Dystopia treated as terminal outcome (like extinction)
- Binary dystopia detection (yes/no)
- No duration tracking
- No granular suffering metrics
- Dystopia feels monotone

### After (Target - Status System)

**Phase 1: Status System ✅**
- [x] Dystopia is a STATUS (like Golden Age), not terminal outcome
- [x] Can enter and exit dystopia
- [x] Duration tracking (total months, months per variant)
- [x] Final report: "Spent 47 months in dystopia" or "Ended in dystopia (surveillance, 18 months)"

**Phase 2: Three-Level Detection ✅**
- [x] Global dystopia (>80% population affected)
- [x] Hegemonic dystopia (country-level: US, China, EU)
- [x] Regional dystopia (extraction, war zones)
- [x] Asymmetric dystopia (hegemon golden age + periphery suffering)

**Phase 3: Dystopia Variants ✅**
- [x] 9 distinct dystopia types:
  - Tier 1 (control): surveillance, authoritarian, high_control ✅
  - Tier 2 (inequality): elysium, corporate_feudalism
  - Tier 3 (technology): algorithmic_oppression, comfortable_dystopia
  - Tier 4 (extraction): extraction_dystopia, war_dystopia, debt_trap, geographic, fortress
- [x] Each variant has unique suffering profile
- [x] Distinguish between:
  - Everyone suffering (totalitarian)
  - Hidden suffering (comfortable dystopia)
  - Inequality suffering (Elysium)
  - Regional suffering (extraction, war)

**Phase 4: Final Reporting ✅**
- [x] Duration statistics (min/max/median months in dystopia)
- [x] Variant transitions tracked (surveillance → corporate)
- [x] Distinguish "ended in dystopia" vs "escaped dystopia"

**Phase 5: Escape Mechanics (Optional) 🔧**
- [ ] Escape difficulty by dystopia type
- [ ] Time-based lock-in (e.g., authoritarian locks in after 24 months)
- [ ] Trajectory tracking (worsening/stable/improving)

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
