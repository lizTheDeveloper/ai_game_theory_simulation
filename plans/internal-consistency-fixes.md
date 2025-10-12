# Internal Consistency Fixes - Priority Implementation Plan

**Date:** October 12, 2025  
**Context:** User request - "Make things internally consistent"  
**Goal:** Fix extinction logic, population-economy links, nuclear mechanics

---

## 🎯 **Core Principles**

1. **Extinction = 0 people** (not severity = 1.0)
2. **Countries can depopulate entirely** (per-country tracking)
3. **Organizations die when their country collapses** (Google needs US population)
4. **Economic systems collapse during population crashes**
5. **Nuclear war has multi-year consequences** (winter, fallout, agriculture)

---

## 🐛 **Priority 1: Fix Extinction Detection (1-2 hours)**

### Current Bug:
```typescript
// planetaryBoundaries.ts, line 477
if (monthsSinceCascade >= 48) {
  state.extinctionState.severity = 1.0;  // ← WRONG!
  // Declares "extinction" even with 3-4B survivors
}

// engine.ts, line 380
if (state.extinctionState.severity >= 1.0) {
  actualOutcome = 'extinction';  // ← WRONG!
}
```

### Fix:
```typescript
// Use ACTUAL population thresholds
function determineOutcome(state: GameState): string {
  const pop = state.humanPopulationSystem.population;
  
  if (pop < 0.00001) {  // <10K people
    return 'true_extinction';
  } else if (pop < 0.1) {  // <100M people
    return 'genetic_bottleneck';
  } else if (pop < 2.0) {  // <2B people
    return 'severe_population_decline';
  } else if (pop < 6.0) {  // <6B people
    return 'population_stress';
  } else {
    return 'population_stable';
  }
}
```

### Files to Modify:
- `src/simulation/engine.ts` - Fix outcome determination (line 380)
- `src/simulation/planetaryBoundaries.ts` - Don't set severity = 1.0 automatically
- `src/simulation/extinctions.ts` - Use population thresholds

---

## 🌍 **Priority 2: Per-Country Population Tracking (3-4 hours)**

### What We Have:
- 7 regional populations (Sub-Saharan Africa, East Asia, etc.)
- No per-country tracking

### What We Need:
- Track key countries individually (at least 10-15)
- Log when countries hit zero population
- Link organizations to countries

### Implementation:

```typescript
interface CountryPopulation {
  name: string;
  region: string;                     // Which region it belongs to
  population: number;                 // Millions
  peakPopulation: number;
  startingPopulation: number;
  
  // Demographics
  birthRate: number;
  deathRate: number;
  netGrowthRate: number;
  
  // Vulnerability
  climateVulnerability: number;       // [0, 1]
  nuclearTarget: boolean;             // Is this a nuclear power/ally?
  economicImportance: number;         // [0, 1] Global economic weight
  
  // Organization count
  headquarteredOrganizations: number; // How many AI orgs based here
  
  // Status
  depopulated: boolean;               // Population reached 0
  depopulationMonth: number | null;
  
  // Crisis tracking
  monthlyExcessDeaths: number;
  cumulativeCrisisDeaths: number;
}

// Key countries to track:
const TRACKED_COUNTRIES = [
  // Nuclear powers
  { name: 'United States', population: 335, nuclearTarget: true, region: 'Americas' },
  { name: 'China', population: 1425, nuclearTarget: true, region: 'East Asia' },
  { name: 'Russia', population: 144, nuclearTarget: true, region: 'Europe & Central Asia' },
  { name: 'India', population: 1425, nuclearTarget: true, region: 'South Asia' },
  { name: 'United Kingdom', population: 67, nuclearTarget: true, region: 'Europe & Central Asia' },
  { name: 'France', population: 65, nuclearTarget: true, region: 'Europe & Central Asia' },
  { name: 'Pakistan', population: 235, nuclearTarget: true, region: 'South Asia' },
  { name: 'Israel', population: 9, nuclearTarget: true, region: 'Middle East & North Africa' },
  
  // Major economies
  { name: 'Japan', population: 125, nuclearTarget: false, region: 'East Asia' },
  { name: 'Germany', population: 84, nuclearTarget: false, region: 'Europe & Central Asia' },
  { name: 'Brazil', population: 215, nuclearTarget: false, region: 'Americas' },
  { name: 'Indonesia', population: 275, nuclearTarget: false, region: 'East Asia & Pacific' },
  
  // AI organization hubs
  { name: 'Canada', population: 39, nuclearTarget: false, region: 'Americas' },
  
  // Vulnerable regions
  { name: 'Bangladesh', population: 172, nuclearTarget: false, region: 'South Asia' },
  { name: 'Nigeria', population: 223, nuclearTarget: false, region: 'Sub-Saharan Africa' },
];
```

### Logging:
```typescript
// When country depopulates
if (country.population < 0.001 && !country.depopulated) {
  country.depopulated = true;
  country.depopulationMonth = state.currentMonth;
  
  console.log(`\n🚨 COUNTRY DEPOPULATION: ${country.name}`);
  console.log(`   Starting population: ${country.startingPopulation.toFixed(0)}M`);
  console.log(`   Peak population: ${country.peakPopulation.toFixed(0)}M`);
  console.log(`   Month: ${state.currentMonth}`);
  console.log(`   Cause: ${getMajorCauses(country)}`);
  console.log(`   Organizations headquartered: ${country.headquarteredOrganizations}`);
}
```

### Files to Create:
- `src/types/countryPopulations.ts` - Type definitions
- `src/simulation/countryPopulations.ts` - Logic
- `src/simulation/engine/phases/CountryPopulationPhase.ts` - Phase integration

---

## 🏢 **Priority 3: Link Organizations to Countries (2-3 hours)**

### Current Bug:
Organizations have no location → Survive even when their country is destroyed

### Fix:

```typescript
interface Organization {
  id: string;
  name: string;
  type: 'private' | 'government' | 'academic';
  
  // NEW: Location
  country: string;                    // 'United States', 'China', etc.
  region: string;                     // Derived from country
  
  // NEW: Survival mechanics
  operationalPopulation: number;      // Employees/infrastructure needs (millions)
  survivalThreshold: number;          // Minimum country pop to operate (% of peak)
  bankrupt: boolean;
  bankruptcyMonth: number | null;
  
  // Existing fields
  capital: number;
  monthlyRevenue: number;
  operationalCosts: number;
  // ...
}

// Example: Google
{
  name: 'Google DeepMind',
  country: 'United States',
  region: 'Americas',
  operationalPopulation: 0.001,       // ~1M employees + supply chain
  survivalThreshold: 0.50,            // Needs >50% of US peak population
}
```

### Bankruptcy Logic:
```typescript
function checkOrganizationSurvival(org: Organization, state: GameState): void {
  const country = getCountry(org.country, state);
  
  // Check 1: Country depopulated
  if (country.depopulated) {
    org.bankrupt = true;
    org.bankruptcyMonth = state.currentMonth;
    console.log(`\n💀 ORGANIZATION COLLAPSE: ${org.name}`);
    console.log(`   Reason: ${org.country} depopulated`);
    transferAIsToGovernmentOrOrphan(org, state);
    return;
  }
  
  // Check 2: Population below survival threshold
  const populationRatio = country.population / country.peakPopulation;
  if (populationRatio < org.survivalThreshold) {
    // Revenue collapses proportionally
    const revenueMultiplier = Math.max(0, populationRatio / org.survivalThreshold);
    org.monthlyRevenue *= revenueMultiplier;
    
    // Costs spike (supply chain breakdown)
    const costMultiplier = 1 + (1 - revenueMultiplier) * 2;  // 2x costs at threshold
    org.operationalCosts *= costMultiplier;
  }
  
  // Check 3: Debt spiral
  if (org.capital < -org.operationalCosts * 6) {  // 6 months debt
    org.bankrupt = true;
    org.bankruptcyMonth = state.currentMonth;
    console.log(`\n💀 ORGANIZATION BANKRUPTCY: ${org.name}`);
    console.log(`   Reason: Economic collapse (${org.country} at ${(populationRatio * 100).toFixed(0)}% of peak)`);
    console.log(`   Capital: $${org.capital.toFixed(1)}B (${-org.capital / org.operationalCosts} months debt)`);
    transferAIsToGovernmentOrOrphan(org, state);
  }
}
```

### Files to Modify:
- `src/types/game.ts` - Add country/region to Organization
- `src/simulation/organizations.ts` - Add survival checks
- `src/simulation/initialization.ts` - Set org locations

---

## 💥 **Priority 4: Nuclear Winter & Long-Term Effects (3-4 hours)**

### Current State:
- ✅ Immediate blast deaths: 60% × 30% of population
- ✅ Refugee crisis triggered
- ❌ NO nuclear winter
- ❌ NO long-term radiation
- ❌ NO agricultural collapse
- ❌ NO multi-year die-off

### Research Backing:

**Carl Sagan et al. (1983) - "Nuclear Winter":**
- Soot in stratosphere blocks sunlight
- Global temperatures drop 10-20°C
- Agriculture fails for 1-3 years
- 90% of Northern Hemisphere population dies (starvation)
- Recovery takes 5-10 years

**Robock & Toon (2012) - Modern nuclear winter:**
- 100 Hiroshima-sized weapons → 1°C cooling for 5 years
- US-Russia exchange → 8-10°C cooling for 10+ years
- Global famine, even in Southern Hemisphere

### Implementation:

```typescript
interface NuclearWinterState {
  active: boolean;
  startMonth: number;
  
  // Atmospheric effects
  sootInStratosphere: number;         // Megatons injected
  temperatureAnomaly: number;         // °C below baseline
  sunlightReduction: number;          // [0, 1] fraction of normal
  
  // Duration (research-backed)
  peakIntensityMonths: number;        // 12-24 months worst
  totalDurationMonths: number;        // 60-120 months recovery
  
  // Agricultural collapse
  cropYieldMultiplier: number;        // [0, 1] vs baseline
  globalFamineActive: boolean;
  monthlyStarvationRate: number;      // % population/month
  
  // Geographic distribution
  northernHemisphereImpact: number;   // [0, 1] severity
  southernHemisphereImpact: number;   // [0, 1] severity
  equatorialImpact: number;           // [0, 1] severity
  
  // Long-term radiation
  radiationZones: RadiationZone[];
  monthlyRadiationDeaths: number;
}

interface RadiationZone {
  country: string;
  radiationLevel: number;             // [0, 10] Sieverts cumulative
  inhabitable: boolean;
  monthlyMortalityRate: number;       // % population/month
  decayRate: number;                  // Exponential decay (half-life)
}
```

### Effects Timeline:

```typescript
// Month 0: Nuclear exchange
addAcuteCrisisDeaths(state, 0.60, 'Nuclear blast', 0.30);  // Existing

// Month 0-24: Nuclear winter onset
state.nuclearWinter = {
  active: true,
  startMonth: state.currentMonth,
  sootInStratosphere: 150,  // Megatons (US-Russia exchange)
  temperatureAnomaly: -10,  // °C (peak)
  sunlightReduction: 0.70,  // 70% reduction
  cropYieldMultiplier: 0.05,  // 5% of normal
  globalFamineActive: true,
  monthlyStarvationRate: 0.05,  // 5% of survivors/month
  northernHemisphereImpact: 0.95,
  southernHemisphereImpact: 0.60,
  equatorialImpact: 0.40,
};

// Month 0-60: Radiation zones
state.nuclearWinter.radiationZones = [
  { country: 'United States', radiationLevel: 8.0, monthlyMortalityRate: 0.10 },
  { country: 'Russia', radiationLevel: 8.0, monthlyMortalityRate: 0.10 },
  { country: 'Europe', radiationLevel: 5.0, monthlyMortalityRate: 0.05 },
  { country: 'China', radiationLevel: 6.0, monthlyMortalityRate: 0.07 },
  // ... etc
];

// Month 1-24: Peak winter (worst starvation)
for (let month = 1; month <= 24; month++) {
  const starvationRate = 0.05 * (1 - month / 48);  // Peaks early, declines
  addMonthlyDeaths(state, starvationRate, 'Nuclear winter famine', 1.0);
}

// Month 24-120: Recovery phase (gradual warming, radiation decay)
for (let month = 24; month <= 120; month++) {
  const recoveryProgress = (month - 24) / 96;  // 0 to 1 over 8 years
  const tempAnomaly = -10 * (1 - recoveryProgress);
  const cropYield = 0.05 + 0.95 * recoveryProgress;
  const starvationRate = 0.02 * (1 - recoveryProgress);
  // ... gradual improvement
}
```

### Expected Impact:
```
Month 0:    60% × 30% pop die (blast) = ~1.4B dead, 6.6B survivors
Month 1-24: 5% monthly starvation × 24 months = 70% of survivors die = ~4.6B dead
Month 24:   ~2B survivors (75% total mortality)
Month 25-120: Slow starvation + radiation = ~1B more die
Month 120:  ~1B survivors (87.5% total mortality)
```

### Files to Create:
- `src/types/nuclearWinter.ts` - Type definitions
- `src/simulation/nuclearWinter.ts` - Logic
- `src/simulation/engine/phases/NuclearWinterPhase.ts` - Phase

---

## 📉 **Priority 5: Economic Collapse During Population Crash (2 hours)**

### Current Bug:
Economy keeps running even when population crashes 50%+

### Fix:

```typescript
function updateEconomicSystemDuringCrisis(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const populationLoss = 1 - (pop.population / pop.peakPopulation);
  
  // Economic collapse scales with population loss
  const economicCollapse = Math.min(0.95, populationLoss * 1.2);  // Slightly worse than pop loss
  
  // Global GDP impact
  const gdpMultiplier = 1 - economicCollapse;
  state.globalGDP *= gdpMultiplier;
  
  // Organization revenue (consumer base shrinks)
  for (const org of state.organizations) {
    if (!org.bankrupt) {
      org.monthlyRevenue *= gdpMultiplier;
      
      // Costs increase (supply chain breakdown, labor shortage)
      const costMultiplier = 1 + economicCollapse * 0.5;
      org.operationalCosts *= costMultiplier;
    }
  }
  
  // Infrastructure decay
  state.infrastructureIntegrity = Math.max(0, state.infrastructureIntegrity - economicCollapse * 0.02);
  
  // Data centers can go offline
  for (const dc of state.dataCenters) {
    if (state.infrastructureIntegrity < 0.3) {
      const offlineProb = (0.3 - state.infrastructureIntegrity) * 0.2;  // 20% at total collapse
      if (Math.random() < offlineProb) {
        dc.operational = false;
        console.log(`⚠️  DATA CENTER OFFLINE: ${dc.id} (infrastructure failure)`);
      }
    }
  }
  
  // Log major milestones
  if (populationLoss > 0.25 && populationLoss < 0.251) {
    console.log(`\n💥 ECONOMIC CRISIS: 25% population loss`);
    console.log(`   GDP: ${(gdpMultiplier * 100).toFixed(0)}% of peak`);
    console.log(`   Organizations under stress`);
  }
}
```

### Files to Modify:
- `src/simulation/resourceEconomy.ts` - Add crisis multipliers
- `src/simulation/organizations.ts` - Link to population health

---

## 📋 **Implementation Order**

### Phase 1: Immediate Fixes (Today, 3-4 hours)
1. ✅ Fix extinction detection (use population < 10K)
2. ✅ Add organization-country linkage
3. ✅ Add bankruptcy during population collapse

### Phase 2: Nuclear Winter (Tomorrow, 3-4 hours)
4. ✅ Implement nuclear winter mechanics
5. ✅ Add long-term radiation zones
6. ✅ Multi-year agricultural collapse

### Phase 3: Per-Country Tracking (Later, 3-4 hours)
7. ✅ Add 10-15 key countries
8. ✅ Track country depopulation
9. ✅ Log when countries hit zero

---

## 📊 **Expected Outcomes After Fixes**

### Before:
- "100% extinction" but 3-4B survivors
- Organizations thrive during collapse
- No nuclear winter consequences
- No country-level tracking

### After:
- **~5-10% true extinction** (<10K survivors)
- **~30-40% bottleneck** (100M-1B survivors)
- **~40-50% severe decline** (1B-4B survivors)
- **~10-15% population stress** (4B-7B survivors)
- Organizations bankrupt when countries collapse
- Nuclear winter: 87% mortality over 10 years
- Per-country depopulation logged

---

## 🔬 **Research Citations**

1. **Nuclear Winter:**
   - Sagan et al. (1983) - Original nuclear winter paper
   - Robock & Toon (2012) - Modern 100-weapon scenario
   - Coupe et al. (2019) - Regional nuclear war impacts

2. **Population Thresholds:**
   - Toba volcanic bottleneck: 3K-10K survivors ~70K BCE
   - Genetics: Minimum 10K for long-term viability
   - UNHCR (2024): 110M forcibly displaced

3. **Economic Collapse:**
   - COVID-19: 3% mortality → 5-10% GDP drop
   - Black Death: 30-60% mortality → centuries to recover
   - Scaling: 50% mortality → 70-90% economic collapse

---

**Total Estimated Time:** 10-12 hours  
**Priority:** HIGH (internal consistency is critical)  
**Status:** READY TO IMPLEMENT

