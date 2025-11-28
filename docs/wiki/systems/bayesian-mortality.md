# Bayesian Mortality System

**Status:** ✅ Implemented (October 27, 2025)
**Research:** [/research/mortality_caps_historical_data_20251027.md](/research/mortality_caps_historical_data_20251027.md) (Updated Nov 11, 2025 - Nuclear winter sources upgraded to 2022-2023)
**Implementation:** `/src/simulation/bayesianMortality.ts`
**Types:** `/src/types/bayesianMortality.ts`

---

## Overview

The Bayesian Mortality System models death as **individual probability increases** rather than population-level percentages. This captures the realistic multi-causal nature of crisis mortality: someone weakened by starvation is much more likely to die from disease.

### Key Insight: Multi-Causal Compounding

Death is NOT "X% of population dies" (frequentist).
Death IS "each person's probability of death increases by X%" (Bayesian).

**Example:**
- Famine alone: 1% death probability
- Disease alone: 2% death probability
- Famine + Disease together: NOT 3% (additive)
- **Bayesian compound:** 1 - (1 - 0.01) × (1 - 0.02) = **2.98%**
- **With malnutrition multiplier:** 2.98% × 2.63 = **7.84%**

This is why historical famines + epidemics created catastrophic mortality (Holodomor, Irish Famine, Black Death).

### Research Backing

**21 peer-reviewed sources** establish:

1. **Malnutrition × Disease = 2.63× multiplier** (HIGH confidence)
   - WHO/UNICEF 2020-2025 studies
   - 56% of child deaths attributable to malnutrition's compounding effects

2. **Monthly mortality caps:**
   - 2.8% (Holodomor 1933 peak)
   - 1.7% (nuclear winter agricultural collapse)
   - 90-100% instant (nuclear blast zones, geographically constrained)

3. **Socioeconomic differentials:**
   - Normal times: 2-3× mortality difference (wealthy vs poor)
   - Moderate crises: Differentials persist or widen
   - Extreme crises (>10% monthly): Compress to 1.1-1.5× as systems collapse

4. **Bayesian compounding formula:**
   - P(death) = 1 - ∏(1 - p_i × v_i)
   - Where p_i = base risk, v_i = vulnerability multiplier

---

## API Documentation

### addMortalityRisk()

Add a mortality risk to the accumulation queue. Risks are resolved at month end.

```typescript
import { addMortalityRisk } from '@/simulation/bayesianMortality';

addMortalityRisk(state.humanPopulationSystem, {
  // Risk type (determines demographic vulnerability)
  type: 'famine',           // 'famine' | 'disease' | 'disaster' | 'war' | 'pollution' | 'ecosystem'

  // Base probability increase for "average" person (as fraction, NOT absolute deaths)
  baseRisk: 0.01,           // 1% base risk

  // Attribution for tracking
  proximate: 'famine',      // What killed them (medical/physical cause)
  root: 'resource',         // Why it happened (systemic driver)
  confidence: 'HIGH',       // Attribution confidence: 'HIGH' | 'MEDIUM' | 'LOW'

  // Metadata
  month: state.currentMonth,
  description: 'Extreme famine in Sub-Saharan Africa',

  // Optional: Regional scope
  scope: 'REGIONAL',        // 'GLOBAL' | 'SEMI-GLOBAL' | 'REGIONAL'
  region: 'Sub-Saharan Africa',
  exposedFraction: 0.3,     // 30% of population exposed
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | MortalityRiskType | Yes | Risk category affecting demographic vulnerability |
| `baseRisk` | number | Yes | Probability increase for average person (0-1) |
| `proximate` | ProximateCause | Yes | Medical/physical cause of death |
| `root` | RootCause | Yes | Systemic driver of mortality |
| `confidence` | string | Yes | Attribution confidence level |
| `month` | number | Yes | Simulation month when risk added |
| `description` | string | No | Human-readable description |
| `scope` | string | No | Geographic scope of risk |
| `region` | string | No | Specific region (if scope = 'REGIONAL') |
| `exposedFraction` | number | No | Fraction of population exposed (0-1) |

### resolveMortality()

Resolve all accumulated mortality risks for the month. Called by `BayesianMortalityResolutionPhase` at month end.

```typescript
import { resolveMortality } from '@/simulation/bayesianMortality';
import { aggregateGlobalPopulation } from '@/simulation/populationDynamics';

const result = resolveMortality(state, rng);

// CRITICAL: Aggregate regional populations to global level
// resolveMortality() applies deaths to regional populations,
// but global population must be recalculated from regions
aggregateGlobalPopulation(state);
```

**Process:**

1. **Compound risks:** P(death) = 1 - ∏(1 - p_i × v_i)
2. **Apply demographic vulnerabilities:** Different segments have different multipliers
3. **Apply to regional populations:** Deaths reduce regional population values
4. **Aggregate to global:** `aggregateGlobalPopulation()` recalculates global total from regions (CRITICAL, Nov 21 2025)
   - **Note (Nov 24 2025):** `updateHumanPopulation()` now applies BIRTHS ONLY. All deaths are applied exclusively by `resolveMortality()` to prevent double-counting.
5. **Enforce mortality caps:** Monthly (2.8%) and instant (50%) limits
6. **Update tracking:** Automatically updates `deathsByCategory` and `deathsByRootCause`
7. **Clear queue:** Empties `mortalityRisks` array for next month

**⚠️ Historical Mode Exception (Nov 27 2025, commit 59032f2):**

In **pre-2024 hindcast mode** (`config.historicalMode = true`):
- `BaselineMortalityPhase` is **SKIPPED entirely** (returns empty events)
- Regional system applies deaths directly: `netGrowthRate = births - deaths`
- Crisis/war multipliers are **DISABLED** (set to 1.0)
- Healthcare reduction multipliers are **DISABLED** (set to 1.0)

**Rationale:** Historical CDR (crude death rate) data from UN WPP already incorporates:
- Real-world conflicts, wars, and violence from that era
- Healthcare quality as it existed in 1990
- Baseline mortality including famines, diseases, etc.

Applying simulation multipliers on top of historical CDR double-counts these effects, producing death rates 2-3× too high (83.7M/yr vs expected 49.5M/yr). The fix bypasses Bayesian mortality for historical periods, using direct CDR-based mortality in the regional population system instead.

**Returns:** `MortalityResult` with:
- `totalDeaths` - Total deaths (in billions)
- `deaths` - Per-demographic segment breakdown
- `remainingPopulation` - Population after deaths
- `cappedByMonthlyLimit` - Was monthly cap hit?
- `cappedByInstantLimit` - Was instant cap hit?
- `summary` - Aggregated statistics

---

## Demographic Tiers

Five demographic segments with differential vulnerability:

| Tier | Fraction | Baseline Death Rate | Famine | Disease | Disaster | War | Pollution | Ecosystem |
|------|----------|---------------------|--------|---------|----------|-----|-----------|-----------|
| **Elite** | 5% | 0.6% annual | 0.2× | 0.5× | 0.3× | 0.6× | 0.4× | 0.5× |
| **Professional** | 20% | 0.8% annual | 0.5× | 0.7× | 0.6× | 0.8× | 0.6× | 0.7× |
| **Working** | 40% | 1.0% annual | 1.0× | 1.0× | 1.0× | 1.0× | 1.0× | 1.0× |
| **Precariat** | 25% | 1.2% annual | 1.5× | 1.3× | 1.4× | 1.2× | 1.4× | 1.3× |
| **Informal** | 10% | 1.4% annual | 2.0× | 1.5× | 1.8× | 1.4× | 1.6× | 1.5× |

**Research Basis:**

- **Famine:** Irish Famine (1845-52) showed 2-3× higher mortality in poor vs wealthy
- **Disease:** COVID-19 (2020-22) showed 2.63× mortality with malnutrition
- **Disaster:** Elite have better shelter, infrastructure (1.5-2× differential)
- **War:** Elite can flee conflict zones (differential typically lower)

### Crisis Compression

At **>10% monthly mortality** (extreme crises), socioeconomic differentials compress to **1.1-1.5×** as:
- Healthcare systems collapse
- Food distribution breaks down
- Elite shelters become targets
- Everyone vulnerable to systemic failure

---

## Proximate vs Root Causes

### Proximate Cause (What killed them)

Medical or physical mechanism of death:

- `war` - Combat, bombing, war-related violence
- `famine` - Starvation, malnutrition deaths
- `disasters` - Climate disasters (heat, floods, storms)
- `disease` - Pandemics, epidemics, infections
- `ecosystem` - Ecosystem collapse (fisheries fail, pollinators die)
- `pollution` - Toxic pollution (PFAS, microplastics)
- `ai` - AI-caused deaths (rogue systems, accidents)
- `cascade` - Multi-crisis cascade deaths
- `other` - Miscellaneous

### Root Cause (Why it happened)

Systemic driver of mortality:

**Environmental drivers:**
- `climate` - Climate change
- `resource` - Resource depletion (water, food, phosphorus)
- `pollution` - Pollution accumulation
- `ecosystem` - Ecosystem degradation

**Social drivers:**
- `inequality` - Economic inequality
- `demographic` - Demographic collapse (aging, low birth rate)
- `social` - Social cohesion breakdown

**Technology drivers:**
- `alignment` - AI misalignment
- `disruption` - Economic/labor disruption from AI

**External shocks:**
- `conflict` - Wars, geopolitical conflict
- `pandemic` - Natural pandemics

---

## Migration Guide

### Old Way (Direct Modification)

❌ **DEPRECATED:** Direct population decrements bypass demographic vulnerability and multi-causal compounding

```typescript
// ❌ OLD WAY - Don't do this anymore!
const deaths = calculateDeaths();
state.humanPopulationSystem.population -= deaths;
state.humanPopulationSystem.deathsByCategory.famine += deaths;
state.humanPopulationSystem.deathsByRootCause.resource += deaths;
```

**Problems:**
- No demographic vulnerability tracking
- No multi-causal compounding
- No mortality caps (8-trillion population bugs!)
- Manual attribution error-prone

### New Way (Bayesian Risk Accumulation)

✅ **RECOMMENDED:** Use Bayesian risk accumulation

```typescript
// ✅ NEW WAY - Use this!
import { addMortalityRisk } from '@/simulation/bayesianMortality';

// Calculate base risk as fraction, not absolute deaths
const baseRisk = deaths / state.humanPopulationSystem.population;

addMortalityRisk(state.humanPopulationSystem, {
  type: 'famine',
  baseRisk: baseRisk,
  proximate: 'famine',
  root: 'resource',
  confidence: 'HIGH',
  month: state.currentMonth,
});

// Death tracking happens automatically at month end!
// No need to manually update deathsByCategory or deathsByRootCause
```

**Benefits:**
- Demographic vulnerability applied automatically
- Multi-causal compounding works correctly
- Mortality caps enforced (no 8-trillion bugs)
- Attribution tracking automated
- Research-backed realism

### Migration Checklist

For each phase that applies deaths:

- [ ] Find all `state.humanPopulationSystem.population -= deaths` lines
- [ ] Calculate `baseRisk = deaths / population`
- [ ] Replace with `addMortalityRisk()` call
- [ ] Choose appropriate `type` (famine/disease/disaster/war/pollution/ecosystem)
- [ ] Set `proximate` cause (what killed them)
- [ ] Set `root` cause (why it happened)
- [ ] Set `confidence` level (HIGH/MEDIUM/LOW)
- [ ] Remove manual `deathsByCategory` updates (automatic now)
- [ ] Remove manual `deathsByRootCause` updates (automatic now)
- [ ] Test with Monte Carlo (N=10 minimum)

---

## Benefits

### 1. Multi-Causal Attribution

Traditional systems assign each death to a single cause. Bayesian system tracks which risks contributed:

```typescript
// Result shows contribution fractions
result.deaths[0].causes = [
  { proximate: 'famine', root: 'resource', contributionFraction: 0.35, confidence: 'HIGH' },
  { proximate: 'disease', root: 'pandemic', contributionFraction: 0.65, confidence: 'HIGH' },
];
```

This answers: "Did they die from famine or disease?" Answer: **Both** (65% disease, but wouldn't have died without 35% famine contribution).

### 2. Demographic Vulnerability Tracking

Know **who** is dying, not just how many:

```typescript
result.summary.peakSegmentMortality = {
  segment: 'Informal',
  mortality: 0.084,  // 8.4% of informal sector died
};
```

Detect "Elysium" scenarios where elite prosper while masses suffer.

### 3. Research-Backed Mortality Caps

Prevent unrealistic population spikes:

```typescript
if (result.cappedByMonthlyLimit) {
  console.log('⚠️ Monthly mortality capped at 2.8% (Holodomor limit)');
}
```

No more 8-trillion population corruption bugs!

### 4. Bayesian Compounding

Realistic multi-crisis interactions:

```typescript
// Famine (1%) + Disease (2%) + Pollution (0.5%)
// Naive additive: 3.5%
// Bayesian compound: 1 - (0.99)(0.98)(0.995) = 3.45%
// With vulnerabilities for precariat (1.5×, 1.3×, 1.4×): 6.7%
```

Matches historical data where crises compound catastrophically.

---

## Testing

The system includes comprehensive test coverage:

```bash
# Run Bayesian mortality tests
npx tsx scripts/testBayesianMortality.ts
```

**Test cases:**
- Single risk (verify formula)
- Multiple risks (verify compounding)
- Demographic vulnerability (verify multipliers)
- Monthly cap (verify 2.8% limit)
- Instant cap (verify 50% limit)
- Crisis compression (verify >10% threshold)
- Multi-causal attribution (verify contribution fractions)

All tests pass ✅

---

## Implementation Files

**Core Implementation:**
- `/src/simulation/bayesianMortality.ts` - Main logic
- `/src/types/bayesianMortality.ts` - Type definitions
- `/src/simulation/engine/phases/BayesianMortalityResolutionPhase.ts` - Phase orchestrator integration

**Research:**
- `/research/mortality_caps_historical_data_20251027.md` - 21 peer-reviewed sources
- `/plans/bayesian-mortality-migration-inventory.md` - Migration plan

**Tests:**
- `/scripts/testBayesianMortality.ts` - Unit tests
- `/scripts/monteCarloSimulation.ts` - Integration validation

---

## Example: Famine + Pandemic Scenario

```typescript
// Month 1: Famine begins (regional)
addMortalityRisk(state.humanPopulationSystem, {
  type: 'famine',
  baseRisk: 0.005,  // 0.5% base risk
  proximate: 'famine',
  root: 'resource',
  confidence: 'HIGH',
  month: 1,
  scope: 'REGIONAL',
  region: 'Sub-Saharan Africa',
  exposedFraction: 0.4,  // 40% of population affected
});

// Month 1: Pandemic begins (global)
addMortalityRisk(state.humanPopulationSystem, {
  type: 'disease',
  baseRisk: 0.015,  // 1.5% base risk
  proximate: 'disease',
  root: 'pandemic',
  confidence: 'MEDIUM',
  month: 1,
  scope: 'GLOBAL',
});

// Month end: Resolution phase calculates
const result = resolveMortality(state, rng);

// Elite (5% of population):
// - Famine: 0.5% × 0.2 (vulnerability) = 0.1%
// - Disease: 1.5% × 0.5 (vulnerability) = 0.75%
// - Compound: 1 - (0.999)(0.9925) = 0.845%
// - Deaths: 8B × 0.05 × 0.00845 = 3.38M

// Informal (10% of population):
// - Famine: 0.5% × 2.0 (vulnerability) = 1.0%
// - Disease: 1.5% × 1.5 (vulnerability) = 2.25%
// - Compound: 1 - (0.99)(0.9775) = 3.23%
// - With malnutrition multiplier: 3.23% × 2.63 = 8.49%
// - Capped at 2.8% (monthly limit)
// - Deaths: 8B × 0.10 × 0.028 = 22.4M

// Total: ~50M deaths (Elite: 7%, Informal: 45%)
```

This shows how **multi-causal compounding × demographic vulnerability** creates realistic crisis mortality patterns matching historical data.

---

## See Also

- [Population Dynamics](./population-dynamics.md) - Overall population system
- [Crisis Cascades](../mechanics/crisis-cascades.md) - How multiple crises compound
- [Environmental](./environmental.md) - Resource depletion and pollution
- [Breakthrough Technologies](./breakthrough-technologies.md) - Technologies that reduce mortality risk
