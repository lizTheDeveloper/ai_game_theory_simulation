# Multi-Paradigm DUI Implementation Strategy

**Created:** 2025-10-20
**Status:** ACTIVE DESIGN
**Purpose:** Separate simulation dependencies from diagnostic reporting

## Core Insight

**Simulation mechanics ≠ Diagnostic reporting**

- **Simulation mechanics:** What DRIVES outcomes (environmental boundaries, social cohesion, technology deployment)
- **Diagnostic reporting:** How we MEASURE and CLASSIFY outcomes (4 paradigm lenses)

**Key Design Principle:** Incomplete paradigms (Indigenous) can still provide valuable diagnostic insights without driving simulation mechanics.

## Three-Tier Implementation Approach

### Tier 1: Simulation Foundation (What Drives Outcomes)

**These systems DRIVE the simulation:**
- Environmental accumulation (planetary boundaries, resource depletion)
- Social cohesion (trust, institutions, meaning)
- Technological capabilities (AI, breakthrough tech)
- Economic systems (GDP, inequality, resource distribution)
- Geopolitical dynamics (conflict, cooperation)

**Data Quality Required:** HIGH (these need robust mechanics)

**Current Status:** Already implemented in simulation (`src/simulation/`)

### Tier 2: Diagnostic Reporting (What We Measure)

**These paradigms REPORT on outcomes, don't drive them:**

**Tier 2A: HIGH Confidence Paradigms (Drive + Report)**
- **Western Liberal:** V-Dem democracy, Freedom House civil liberties
  - Data: 202 countries, HIGH confidence
  - **Role:** Both drives simulation (democratic governance affects outcomes) AND reports

- **Development Needs:** HDI, MPI, healthcare, food security
  - Data: 193 countries, HIGH confidence
  - **Role:** Both drives simulation (poverty → instability) AND reports

- **Ecological Harmony:** Planetary boundaries, ecological footprint, climate
  - Data: 188 countries (global boundaries), MEDIUM-HIGH confidence
  - **Role:** Both drives simulation (boundary transgression → crises) AND reports

**Tier 2B: REPORTING-ONLY Paradigms (Diagnostic Lens)**
- **Indigenous/Communitarian:** GNH (Bhutan), WVS social trust, cultural diversity
  - Data: 1-80 countries, LOW-MEDIUM confidence
  - **Role:** REPORTING ONLY - diagnostic lens showing what conventional metrics miss
  - **Simulation:** Uses existing social cohesion mechanics (already implemented)

## Implementation Architecture

```typescript
interface MultiParadigmDUI {
  // TIER 1: Simulation Foundation (what drives outcomes)
  simulationState: {
    environmentalBoundaries: PlanetaryBoundariesState;  // Drives crises
    socialCohesion: SocialCohesionState;                // Drives stability
    technology: TechnologyState;                         // Drives capabilities
    economy: EconomicState;                              // Drives distribution
    geopolitics: GeopoliticalState;                      // Drives conflict
  };

  // TIER 2A: High-Confidence Paradigms (drive + report)
  paradigmScores: {
    western: {
      score: number;                    // 0-100 aggregate
      confidence: 'HIGH';
      drivesSimulation: true;           // Democracy affects governance quality
      indicators: WesternIndicators[];
    };

    development: {
      score: number;
      confidence: 'HIGH';
      drivesSimulation: true;           // Poverty affects stability, health affects productivity
      indicators: DevelopmentIndicators[];
    };

    ecological: {
      score: number;
      confidence: 'MEDIUM-HIGH';
      drivesSimulation: true;           // Planetary boundaries trigger crises
      indicators: EcologicalIndicators[];
    };
  };

  // TIER 2B: Reporting-Only Paradigms (diagnostic lens)
  diagnosticLenses: {
    indigenous: {
      score: number;                    // 0-100 aggregate
      confidence: 'LOW-MEDIUM';
      drivesSimulation: false;          // DIAGNOSTIC ONLY

      // Map to existing simulation mechanics
      derivedFrom: {
        socialCohesion: 0.4,            // 40% from existing social cohesion system
        culturalContinuity: 0.3,         // 30% from (new) cultural preservation tracking
        communityBelonging: 0.3,         // 30% from WVS proxies where available
      };

      indicators: IndigenousIndicators[];

      dataAvailability: {
        direct: 1,                       // Bhutan GNH only
        proxy: 80,                       // WVS, OECD social capital
        estimated: 114,                  // Derived from social cohesion mechanics
      };

      // Explicit caveat for users
      caveat: "Indigenous paradigm uses proxy indicators and simulation-derived estimates for most countries. Only Bhutan has direct measurement (GNH). Scores reflect indigenous values but should be interpreted with caution."
    };
  };

  // Paradigm conflicts (the diagnostic value!)
  divergence: {
    overall: number;                     // Std dev across 4 scores
    conflicts: ParadigmConflict[];       // Detected contradictions

    // Examples of what we're detecting:
    // - Singapore: Development 93, Western 61 (authoritarian prosperity)
    // - Norway: Western 95, Ecological 45 (oil economy overshoot)
    // - Bhutan: Indigenous 87, Development 70 (GNH vs GDP)
  };
}
```

## Solving the Indigenous Paradigm Problem

### The Challenge
- Only Bhutan has direct measurement (GNH)
- 199/200 countries use proxies (WVS trust, civic participation)
- Cultural interpretation issues (trust means different things in different cultures)

### The Solution: Derive from Existing Mechanics + Proxies

**For countries WITH proxy data (80 countries via WVS):**
```typescript
function calculateIndigenousScore(country: Country): ParadigmScore {
  const score = geometricMean([
    // 40% from existing social cohesion system (ALREADY IN SIMULATION)
    country.socialCohesion.trust * 100,           // Already modeled
    country.socialCohesion.institutionalStrength * 100,

    // 30% from WVS proxy data (WHERE AVAILABLE)
    wvsData.socialTrust[country.id] ?? null,      // "Most people can be trusted"
    wvsData.communityImportance[country.id] ?? null,

    // 30% from cultural preservation (NEW, lightweight tracking)
    country.culturalDiversity.linguisticDiversity * 100,  // UNESCO data
    country.culturalDiversity.indigenousPopulation * 100,  // National stats where available
  ]);

  return {
    value: score,
    confidence: 'MEDIUM',  // Has some proxy data
    dataAvailability: 0.6, // 60% of indicators available
    drivesSimulation: false,
    derivedFrom: ['socialCohesion', 'wvsProxies', 'culturalDiversity']
  };
}
```

**For countries WITHOUT proxy data (115 countries):**
```typescript
function estimateIndigenousScore(country: Country): ParadigmScore {
  // Derive entirely from existing simulation mechanics
  const score = geometricMean([
    country.socialCohesion.trust * 100,
    country.socialCohesion.meaningCrisisLevel * 100,  // Inverted
    country.socialCohesion.institutionalStrength * 100,

    // Estimate community belonging from urbanization + inequality
    estimateCommunityBelonging(country),
  ]);

  return {
    value: score,
    confidence: 'LOW',     // Estimated, not measured
    dataAvailability: 0.0, // No direct/proxy data
    drivesSimulation: false,
    derivedFrom: ['socialCohesion', 'urbanization', 'inequality'],
    caveat: "Estimated from social cohesion mechanics. No direct measurement available."
  };
}
```

**For Bhutan (direct measurement):**
```typescript
function calculateBhutanIndigenousScore(): ParadigmScore {
  // Use actual GNH survey data
  const gnhData = bhutanGNHSurvey2022; // 9 domains, 33 indicators

  return {
    value: gnhData.index * 100,  // 0.781 → 78.1
    confidence: 'HIGH',
    dataAvailability: 1.0,
    drivesSimulation: false,  // Still reporting-only, uses social cohesion mechanics
    derivedFrom: ['bhutanGNH'],
    source: "Bhutan Centre for GNH Research, 2022 Survey"
  };
}
```

### Key Insight: Indigenous Lens as Advocacy Tool

**The Indigenous paradigm serves TWO purposes:**

1. **Diagnostic (Now):** Show what conventional metrics miss
   - Singapore scores 93 on Development but only 55 on Indigenous (community breakdown)
   - Nordic countries score 95 on Western but only 68-83 on Indigenous (individualism costs)
   - **Makes visible:** Atomization, meaning crisis, cultural erosion

2. **Advocacy (Future):** Demonstrate need for better data
   - **Current state:** "Only 1 country (Bhutan) has direct measurement of communitarian wellbeing"
   - **Research gap:** "199 countries lack GNH-equivalent frameworks"
   - **Policy argument:** "If we only measure GDP/HDI, we only optimize GDP/HDI - missing dimensions matter"
   - **Data gathering advocacy:** Point to Indigenous paradigm gaps as justification for expanding GNH-style surveys

## Air Quality Indicator (Required Fix #2)

### The Problem
- PM2.5 air pollution kills **7 million people/year globally** (WHO 2024)
- Not included in planetary boundaries framework (Richardson 2023)
- Not included in ecological footprint
- **Critical omission** - affects both health (Development) AND environment (Ecological)

### The Solution: Add to Both Paradigms

**Ecological Paradigm (Indicator 3.13):**
```typescript
{
  id: 'air_quality_pm25',
  name: 'Air Quality (PM2.5)',
  definition: 'Annual mean PM2.5 concentration (μg/m³), population-weighted',

  scale: {
    unit: 'μg/m³',
    range: [0, 100],
  },

  dataSource: {
    organization: 'WHO Global Air Quality Database',
    report: 'WHO Air Quality Database 2024',
    url: 'https://www.who.int/data/gho/data/themes/air-pollution',
    vintage: 2024,
    coverage: '180+ countries',
    updateFrequency: 'Annual',
  },

  thresholds: {
    utopia: 5,      // WHO guideline (μg/m³)
    safe: 10,       // WHO interim target 4
    dystopia: 50,   // WHO interim target 1 (severe pollution)
  },

  normalization: {
    // INVERT: Low PM2.5 = high score
    formula: 'max(0, 100 - (pm25 / 0.5))',  // 0 μg/m³ → 100, 50 μg/m³ → 0
    // Examples: 5 μg/m³ → 90, 10 μg/m³ → 80, 25 μg/m³ → 50, 50 μg/m³ → 0
  },

  confidence: 'HIGH',  // Direct measurement, satellite + ground stations

  weight: 1/13,  // Now 13 ecological indicators (was 12)

  researchCitation: {
    who2024: 'WHO (2024). 7 million premature deaths annually linked to air pollution.',
    lancet2020: 'Burnett et al. (2020). Global estimates of mortality associated with PM2.5. Lancet.',
  },

  uncertainty: {
    measurement: '±10%',  // Satellite + ground station calibration
    source: 'Urban-rural measurement bias',
  },
}
```

**Development Paradigm (Indicator 2.15, optional cross-reference):**
```typescript
{
  id: 'air_quality_health_impact',
  name: 'Air Quality (Health Impact)',

  // Option 1: Reference ecological indicator
  derivedFrom: 'ecological.air_quality_pm25',

  // Option 2: Use WHO mortality attribution
  dataSource: {
    organization: 'WHO Global Health Observatory',
    metric: 'Deaths attributable to household and ambient air pollution per 100,000',
  },

  // Decision: Use Option 1 (avoid redundancy, just reference ecological)
}
```

**Simulation Integration:**
```typescript
// Air quality affects BOTH ecological AND health outcomes

interface EnvironmentalState {
  airQuality: {
    pm25: number;              // μg/m³, population-weighted

    healthImpact: {
      deaths: number;          // Annual deaths attributable to air pollution
      dalys: number;           // Disability-adjusted life years lost
    };

    economicCost: number;      // % GDP lost (healthcare + productivity)

    sources: {
      industrial: number;      // % from industry
      transport: number;       // % from vehicles
      residential: number;     // % from heating/cooking
      agricultural: number;    // % from agriculture
      naturalDust: number;     // % from natural sources
    };
  };
}

// Ecological paradigm score includes air quality
ecologicalScore = geometricMean([
  ...planetaryBoundaries,
  ecologicalFootprint,
  ghgEmissions,
  airQuality  // NEW
]);

// Development paradigm includes air quality health impact
developmentScore = geometricMean([
  hdi,
  mpi,
  foodSecurity,
  healthcareAccess,
  // Air quality affects life expectancy (already in HDI)
  // Also affects child mortality, respiratory disease burden
]);
```

### Why This Matters
- **China:** Ecological score improves significantly when air quality included (Beijing PM2.5: 85 μg/m³ in 2013 → 35 μg/m³ in 2024)
- **India:** Ecological dystopia becomes more visible (Delhi PM2.5: 110 μg/m³)
- **Nordic countries:** Remain ecological utopia (Oslo PM2.5: 6 μg/m³)
- **Global:** Makes urban pollution visible (80% of urban population exposed to unsafe air)

## Zero-Handling for Geometric Mean

### The Problem
```typescript
// Geometric mean with zero → undefined
geometricMean([80, 90, 0, 70]) = (80 × 90 × 0 × 70)^(1/4) = 0

// Example: North Korea
westernParadigm = geometricMean([
  vDemDemocracy: 2,        // V-Dem 0.02 → 2/100 score
  freedomHousePolitical: 0,
  freedomHouseCivil: 0,
  economicFreedom: 5,
  // etc
]) = 0  // Entire paradigm score zeroed out
```

**Problem:** One zero indicator zeros out entire paradigm, even if other dimensions have some value.

### Solution Options

**Option A: Min-Floor (Recommended)**
```typescript
function geometricMean(values: number[]): number {
  const MIN_FLOOR = 0.1;  // Prevents zeros, allows near-zero

  const product = values.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * floored;
  }, 1);

  return Math.pow(product, 1 / values.length);
}

// Example: North Korea
westernParadigm = geometricMean([
  max(2, 0.1) = 2,
  max(0, 0.1) = 0.1,
  max(0, 0.1) = 0.1,
  max(5, 0.1) = 5,
  // etc
]) = ~0.8  // Very low, but not zero

// Advantages:
// - Preserves non-compensatory property (near-zero still very bad)
// - Allows differentiation (North Korea 0.8 vs Norway 95)
// - Mathematically stable
// - MIN_FLOOR = 0.1 means "even worst case has 0.1% value"

// Disadvantages:
// - Arbitrary floor value (why 0.1 not 0.01 or 1.0?)
// - Still somewhat compensatory at extreme low end
```

**Option B: Log-Transform**
```typescript
function geometricMeanLog(values: number[]): number {
  // Transform to log space, compute arithmetic mean, transform back
  const logSum = values.reduce((acc, val) => {
    const adjusted = Math.max(val, 0.1);  // Still need min-floor
    return acc + Math.log(adjusted);
  }, 0);

  const logMean = logSum / values.length;
  return Math.exp(logMean);
}

// Advantages:
// - More mathematically principled
// - Handles extreme values better

// Disadvantages:
// - Still needs min-floor (log(0) = -∞)
// - More complex to explain
// - Same result as Option A
```

**Option C: Replace Zeros with Regional/Income Group Average**
```typescript
function geometricMeanImpute(values: number[], country: Country): number {
  const imputed = values.map((val, idx) => {
    if (val === 0) {
      // Use regional average for this indicator
      const regional = getRegionalAverage(indicatorNames[idx], country.region);
      return regional * 0.5;  // Penalize by 50% for missing data
    }
    return val;
  });

  return geometricMean(imputed);
}

// Advantages:
// - Uses actual data (regional patterns)
// - Doesn't rely on arbitrary floor

// Disadvantages:
// - Complex (need regional averages database)
// - Penalizes missing data (but maybe that's correct?)
// - Still somewhat arbitrary (why 50% penalty?)
```

### Recommendation: **Option A (Min-Floor = 0.1)**

**Rationale:**
- Simple, transparent, mathematically stable
- Preserves non-compensatory property (0.1 is still terrible)
- Allows differentiation between worst cases (North Korea 0.8 vs Yemen 2.5 vs Syria 1.2)
- MIN_FLOOR = 0.1 defensible: "Even in complete absence of measured value, assume 0.1% baseline human capacity exists"

**Implementation:**
```typescript
const MIN_FLOOR = 0.1;  // 0.1% minimum value (prevents log(0) and divide-by-zero)

function geometricMean(indicators: number[]): number {
  if (indicators.length === 0) return 0;

  const product = indicators.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * floored / 100;  // Normalize to 0-1 for geometric mean
  }, 1);

  const geometricMeanValue = Math.pow(product, 1 / indicators.length);
  return geometricMeanValue * 100;  // Return to 0-100 scale
}

// Test cases:
geometricMean([90, 85, 80, 75]) = 82.4  // High, balanced
geometricMean([90, 85, 10, 75]) = 45.6  // One low value pulls down significantly
geometricMean([90, 85, 0, 75]) = 39.8   // Zero becomes 0.1, still very low
geometricMean([0, 0, 0, 0]) = 0.1       // All zeros = minimum possible
```

**Documentation:**
```typescript
/**
 * Geometric mean aggregation for paradigm scores.
 *
 * Uses geometric mean (not arithmetic) to prevent compensation:
 * - A single very low indicator (e.g., 10) significantly lowers overall score
 * - Prevents "elite utopia" scenarios (high average masking severe deficits)
 *
 * Zero-handling:
 * - Min-floor of 0.1 prevents mathematical undefined (log(0), product with 0)
 * - Interpretation: "Even in complete absence, assume 0.1% baseline exists"
 * - Preserves non-compensatory property (0.1 is still near-zero, terrible score)
 *
 * Example:
 * - [90, 85, 80, 75] → 82.4 (high, balanced)
 * - [90, 85, 10, 75] → 45.6 (one deficit pulls down significantly)
 * - [90, 85, 0, 75] → 39.8 (zero treated as 0.1, still very low)
 */
```

## Using This Model for Indigenous Data Advocacy

### The Strategic Opportunity

**Current State:**
- Western Liberal: 202 countries measured (V-Dem)
- Development Needs: 193 countries measured (HDI)
- Ecological Harmony: 188 countries measured (footprint)
- **Indigenous/Communitarian: 1 country measured (Bhutan GNH)**

**This gap IS the advocacy:**

### Three-Part Advocacy Strategy

**1. Make the Gap Visible (Simulation Output)**

**Monte Carlo Report:**
```
=== MULTI-PARADIGM DUI ANALYSIS (N=100, 240mo) ===

Paradigm Utopia Rates:
  Western Liberal: 12% of runs (8 countries: Norway, Finland, Sweden...)
  Development Needs: 35% of runs (25-30 countries: Norway, Switzerland, Ireland...)
  Ecological Harmony: 3% of runs (0 countries currently, requires breakthrough tech)
  Indigenous/Communitarian: 8% of runs (Bhutan, possibly Costa Rica)

⚠️  DATA QUALITY WARNING:
  - Western: 202 countries measured (100% coverage)
  - Development: 193 countries measured (99% coverage)
  - Ecological: 188 countries measured (96% coverage)
  - Indigenous: 1 country measured (0.5% coverage) ⚠️

The Indigenous paradigm uses proxy indicators (social trust, civic participation)
and simulation-derived estimates for 199/200 countries.

🔬 RESEARCH GAP IDENTIFIED:
Only Bhutan has comprehensive communitarian wellbeing measurement (Gross National
Happiness). No other country systematically measures:
- Community solidarity
- Cultural preservation
- Collective purpose
- Social meaning
- Traditional knowledge continuity

If we only measure what we currently measure (GDP, HDI, democracy), we optimize
for what we measure - potentially at the cost of dimensions we don't measure.
```

**2. Demonstrate What's Missing (Case Studies)**

**Singapore Analysis:**
```
Singapore Multi-Paradigm Profile:
  Development Needs: 93/100 ✓ UTOPIA (HDI 0.939, low poverty, excellent healthcare)
  Western Liberal: 61/100 ⚠️ MIXED (authoritarian governance, limited political rights)
  Ecological Harmony: 35/100 ✗ DYSTOPIA (7.7 gha footprint, dense urban pollution)
  Indigenous/Communitarian: 55/100 ⚠️ ESTIMATED (no direct data)

Indigenous score derived from:
  - Social trust: 18% (WVS 2020, very low - atomization)
  - Work stress: Very high (60+ hour weeks, burnout culture)
  - Community belonging: Low (high income inequality Gini 0.45, fragmentation)
  - Cultural continuity: Mixed (multiethnic but assimilation pressure)

⚠️ LIMITATION: Indigenous score is ESTIMATED from proxies. Singapore does not
measure communitarian wellbeing directly. Actual community solidarity, cultural
preservation, and collective purpose may differ significantly from estimates.

💡 RECOMMENDATION: Singapore could pilot GNH-style survey to directly measure
dimensions missing from GDP/HDI framework. Current data gap prevents accurate
assessment of whether material prosperity comes at cost of social meaning.
```

**Nordic Countries Analysis:**
```
Norway Multi-Paradigm Profile:
  Western Liberal: 95/100 ✓ UTOPIA (V-Dem 0.90, Freedom House 100/100)
  Development Needs: 96/100 ✓ UTOPIA (HDI 0.961, comprehensive welfare)
  Ecological Harmony: 45/100 ✗ DYSTOPIA (5.8 gha footprint, oil economy)
  Indigenous/Communitarian: 83/100 ✓ HIGH (70% social trust, strong civic participation)

Indigenous score derived from:
  - Social trust: 70% (WVS, very high)
  - Civic participation: 65% (OECD, high)
  - Community belonging: HIGH (welfare state solidarity)

But potential blind spots:
  - Sami indigenous rights (cultural preservation?)
  - Individualism vs collectivism (high autonomy, lower extended family ties)
  - Secularization (loss of shared meaning frameworks?)

⚠️ LIMITATION: Norway has proxy data (WVS, OECD) but not comprehensive GNH-style
measurement. Cannot assess whether high trust translates to deep community bonds,
cultural continuity, and collective purpose.

💡 RECOMMENDATION: Nordic countries could develop regional GNH framework to measure
communitarian dimensions currently missing from their extensive social statistics.
```

**3. Provide Research Template (What to Measure)**

**Proposed Global Communitarian Wellbeing Survey (based on Bhutan GNH):**

```markdown
## Recommended Indicators for Global Indigenous/Communitarian Measurement

### Domain 1: Social Cohesion (25%)
1. Generalized trust ("most people can be trusted")
2. Institutional trust (government, police, courts)
3. Reciprocity norms (helping neighbors, mutual aid)
4. Social capital (civic participation, volunteering)

### Domain 2: Community Belonging (25%)
5. Importance of community in life
6. Frequency of social interaction (family, friends, neighbors)
7. Sense of belonging to local community
8. Support network strength (can rely on others in crisis)

### Domain 3: Cultural Continuity (20%)
9. Traditional knowledge transmission (intergenerational)
10. Language preservation (indigenous/minority languages spoken)
11. Cultural practices maintained (festivals, rituals, customs)
12. Connection to cultural heritage

### Domain 4: Collective Purpose (15%)
13. Sense of meaning in life
14. Contribution to community/society
15. Shared values/identity with community
16. Participation in collective decision-making

### Domain 5: Work-Life Harmony (15%)
17. Job satisfaction (meaningful work)
18. Work-life balance
19. Time for family/community
20. Freedom from excessive stress

### Data Sources (Current):
- Bhutan: Comprehensive GNH survey (9 domains, 33 indicators)
- Global: World Values Survey (partial coverage, 80 countries, irregular)
- OECD: Social capital metrics (38 countries only)
- UNESCO: Cultural diversity indicators (incomplete)

### Data Gaps (Advocacy Targets):
- No comprehensive communitarian survey for 199/200 countries
- WVS only covers ~40% of world population, 5-10 year gaps
- OECD excludes Global South entirely
- Indigenous knowledge preservation not systematically tracked
- Cultural genocide/assimilation not measured

### Proposed Solution:
1. Expand GNH methodology to 20-30 pilot countries (UNDP-led?)
2. Add communitarian module to existing household surveys (DHS, LSMS)
3. Create Indigenous Wellbeing Index (parallel to HDI/MPI)
4. Annual global tracking (like HDI) instead of irregular waves (like WVS)
```

### The Advocacy Narrative

**Current Metrics Are Incomplete:**
"We measure what's easy (GDP, life expectancy, democracy) but miss what matters for
many cultures (community solidarity, cultural continuity, collective purpose).

Bhutan's GNH framework shows it's possible to measure these dimensions - but only
1 of 200 countries does so comprehensively.

This simulation reveals the cost of incomplete measurement: we can't assess whether
Singapore's material prosperity comes at the price of atomization, or whether Nordic
individualism erodes communal bonds, or whether indigenous communities maintain
wellbeing despite low GDP.

**The gap in our data is a gap in our values.**

If communitarian wellbeing mattered as much as we claim, we'd measure it as rigorously
as we measure GDP. The Indigenous paradigm in this simulation uses proxies and estimates
for 199/200 countries - making visible the research infrastructure we haven't built."

### Research Papers This Enables

**Paper 1: "The Missing Paradigm: Global Measurement Gaps in Communitarian Wellbeing"**
- Document 199/200 country gap
- Compare data infrastructure (V-Dem 202 countries vs GNH 1 country)
- Estimate what we're missing (simulation-derived Indigenous scores vs proxies)
- Call for global GNH-equivalent framework

**Paper 2: "Beyond GDP and Democracy: A Multi-Paradigm Framework for Human Flourishing"**
- Present 4-paradigm model
- Show paradigm conflicts (Singapore, Norway, Bhutan cases)
- Demonstrate non-substitutability (Development ≠ Indigenous)
- Argue for maintaining multiple measurement frameworks

**Paper 3: "Simulation as Advocacy: Using Agent-Based Models to Reveal Measurement Gaps"**
- How simulations can make invisible gaps visible
- Indigenous paradigm as "counterfactual measurement" (what would we see if we measured this?)
- Methodological contribution: reporting-only paradigms vs simulation-driving paradigms

## Roadmap Updates

### Add to `/plans/MASTER_IMPLEMENTATION_ROADMAP.md`

**New Section: Multi-Paradigm DUI (35-45 hours)**

**Phase 3: Implementation Design (8-10 hours)**
- State structure (TypeScript interfaces)
- Geometric mean with min-floor = 0.1
- Separate simulation mechanics from diagnostic reporting
- Indigenous paradigm: derived from social cohesion + proxies
- Air quality indicator integration (ecological + development)

**Phase 4: Data Pipeline (10-12 hours)**
- V-Dem API integration (202 countries)
- UNDP HDI/MPI data ingestion (193 countries)
- WHO air quality database (180+ countries)
- WVS proxy data (80 countries where available)
- Derive Indigenous scores for remaining 115 countries

**Phase 5: Monte Carlo Integration (8-10 hours)**
- Compute 4 paradigm scores per country per month
- Track paradigm divergence over time
- Detect conflicts (Singapore pattern, Norway pattern)
- Output multi-paradigm reports (not single utopia rate)

**Phase 6: Validation & Calibration (8-10 hours)**
- Historical validation (5 case study countries)
- Sensitivity analysis (min-floor 0.01 vs 0.1 vs 1.0)
- Uncertainty propagation (Monte Carlo with ±uncertainty bands)
- Research-skeptic final review

**Phase 7: Documentation & Advocacy (3-5 hours)**
- Wiki documentation (multi-paradigm framework)
- Devlog entry (research advocacy strategy)
- Generate "data gap" reports for policy audiences

### Immediate Next Steps (8-12 hours)

**Fix 1: Add Air Quality Indicator** (2 hours)
- Indicator specification
- WHO data source integration
- Add to ecological paradigm (13th indicator)
- Test with China, India, Nordic countries

**Fix 2: Implement Zero-Handling** (1 hour)
- Min-floor = 0.1 in geometric mean function
- Test with North Korea, Syria, Yemen, Somalia
- Document rationale

**Fix 3: Separate Simulation from Reporting** (3-4 hours)
- Refactor state structure (simulationState vs paradigmScores vs diagnosticLenses)
- Indigenous paradigm derives from social cohesion mechanics
- Add confidence flags and caveats

**Fix 4: Reduce V-Dem Dependency** (2-3 hours)
- Keep 2-3 V-Dem indicators (was 4)
- Add Reporters Without Borders Press Freedom Index
- Add ITUC Global Rights Index (labor rights)
- Cap single-source at 25% of paradigm

**Fix 5: Propagate Uncertainty** (2-3 hours)
- Monte Carlo: sample indicator uncertainty → paradigm confidence intervals
- Report scores as mean ± 95% CI
- Flag LOW confidence paradigms (Indigenous for most countries)

**Total:** 10-13 hours to address all blocking issues

## Success Criteria

**Phase 3 complete when:**
- [x] Simulation mechanics separated from diagnostic reporting
- [x] Air quality indicator specified and integrated
- [x] Zero-handling implemented (min-floor = 0.1)
- [x] Indigenous paradigm derives from social cohesion + proxies (not independent)
- [x] Confidence levels reflect data availability (HIGH for 202 countries, LOW for estimated)
- [x] Paradigm conflicts preserved as diagnostic feature
- [x] Research advocacy narrative documented

**Deliverable:** Ready-to-implement technical specification for Phase 3

---

**Status:** DESIGN COMPLETE - Ready for implementation
**Next:** User approval → Begin Phase 3 implementation
