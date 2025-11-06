# HANDOFF TO ROY (simulation-maintainer)
## Climate Mortality Phase 2 Implementation

**Date:** November 6, 2025
**From:** Orchestrator (orchestrator-1)
**To:** Roy (simulation-maintainer)
**Priority:** HIGH
**Estimate:** 8-12 hours

---

## 🎯 Mission Brief

Roy, we need you to implement Climate Mortality Phase 2. This is HIGH priority (roadmap item #2) and has passed all quality gates. Research is solid (A- grade), parameters are peer-reviewed, and the spec is ready.

**What You're Building:**
1. Storm intensity-frequency system (fewer but stronger storms)
2. BII framework (species extinction via climate tracking failure)

**Why This Matters:**
- Replaces random exogenous shocks with predictable climate models
- Research-backed parameters (90% peer-reviewed, 50% from 2024-2025)
- Captures key insight: FEWER but STRONGER storms
- Models biodiversity collapse via climate velocity mismatches

---

## 📚 Documentation You Need to Read

### Primary Implementation Spec (START HERE)
**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/climate-mortality-phase2-implementation-spec.md`

This contains:
- Complete type definitions
- Function signatures
- Implementation patterns
- Integration requirements

### Ready-for-Implementation Brief
**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md`

This contains:
- Quality gate status (all passed)
- Research-backed parameters
- Success criteria
- Validation expectations

### Research Foundation
**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/climate-mortality-biosphere-multiparadigm-framework_20251028.md`

This contains:
- Peer-reviewed sources (40+ papers)
- Parameter extraction and justification
- Mechanism descriptions

---

## 🚨 CRITICAL: Source Correction

**IMPORTANT:** The original spec had an error. It cited "IPBES (2024)" for the species baseline, but that's wrong.

**CORRECT source:**
- **Natural History Museum (2024) - PREDICTS database**
- **Species count:** 54,000-58,000 species (updated 2024)
- **Authority:** PREDICTS project is the gold standard for BII
- **Methodology:** Global ecological studies across 48,000+ sites, 5 million+ records
- **Coverage:** Plants, fungi, birds, mammals, insects (not just birds/mammals)

**In your JSDoc comments, use:**
```typescript
/**
 * Species baseline from Natural History Museum PREDICTS database (2024)
 * Source: https://www.nhm.ac.uk/our-science/data/biodiversity-indicators/
 * Dataset: 54,000-58,000 species across terrestrial ecosystems
 */
```

**DO NOT cite "IPBES (2024)" for species baseline.**

---

## 🛠️ Implementation Scope

### 1. Storm Intensity-Frequency System (4-6 hours)

**New File:** `src/simulation/extremeWeatherEvents.ts`

**Type Definitions Needed:**
- `StormEvent` interface
- `RegionalStormVulnerability` interface
- `ExtremeWeatherSystem` interface
- `STORM_CONSTANTS` object

**Core Functions:**
- `generateStormDistribution()` - Category distribution based on climate
- `calculateStormMortality()` - MDF framework (Magnitude × Duration × Frequency)
- `infrastructureMismatchMultiplier()` - Primary mortality driver
- `initializeExtremeWeatherSystem()` - Setup regional baselines
- `updateExtremeWeatherEvents()` - Monthly update with Bayesian integration

**New Phase:** `src/simulation/engine/phases/ExtremeWeatherEventsPhase.ts`
- Order: 15.5 (after WetBulbTemperaturePhase)
- Pattern: Follow `WetBulbTemperaturePhase.ts` as reference

**Key Research Parameters:**
```typescript
export const STORM_CONSTANTS = {
  INTENSITY_MULTIPLIERS: [1, 2, 4, 8, 16] as const,  // Cat 1-5 exponential
  CAT_1_2_FREQUENCY_CHANGE: -0.05,     // -5% per °C (Jewson 2023)
  CAT_3_FREQUENCY_CHANGE: 0.0,         // Stable
  CAT_4_5_FREQUENCY_CHANGE: 0.10,      // +10% per °C
  PRECIPITATION_SCALING: 0.10,         // +10% per °C (NOAA GFDL 2024)
  INFRASTRUCTURE_MULTIPLIER_MAX: 3.0,  // Up to 3× mortality
  BASELINE_ANNUAL_STORMS: 90,          // 1980-2010 average
} as const;
```

### 2. BII Framework Extension (4-6 hours)

**Extend Existing File:** `src/simulation/planetaryBoundaries.ts`

**New Type Definitions:**
- `SpeciesGroup` interface
- `BiosphereIntegrityIndex` interface
- `BII_CONSTANTS` object

**Core Functions to Add:**
- `calculateNonMigratoryMortality()` - Climate velocity tracking failure
- `updateBiosphereIntegrityIndex()` - Species extinction modeling
- `initializeBiosphereIntegrityIndex()` - Setup 2025 baseline

**Update Existing Phase:** `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`
- Add BII update call
- Integrate extinction rate with `biosphere_integrity` boundary

**Key Research Parameters:**
```typescript
export const BII_CONSTANTS = {
  TOTAL_SPECIES_2024: 54000,           // NHM PREDICTS (conservative, range 54k-58k)
  BACKGROUND_RATE: 0.1,                // E/MSY natural baseline
  CURRENT_RATE_2025: 10,               // 100× background (Richardson et al. 2023)
  JOSHUA_TREE_CLIMATE_VELOCITY: 1.5,   // °C/year (example)
  JOSHUA_TREE_DISPERSAL: 0.4,          // m/year (too slow to track!)
  KEYSTONE_CASCADE: 2.5,               // Affects 2.5× other species (Yoder et al. 2024)
  FRAGMENTATION_BARRIER_MAX: 1.5,      // Up to 1.5× mortality increase
} as const;
```

### 3. GameState Extensions

**Update:** `src/types/game.ts`

Add to `GameState` interface:
```typescript
extremeWeatherSystem?: ExtremeWeatherSystem;
biosphereIntegrityIndex?: BiosphereIntegrityIndex;
```

### 4. Engine Initialization

**Update:** `src/simulation/engine.ts`

Add initialization calls:
```typescript
import { initializeExtremeWeatherSystem } from './extremeWeatherEvents';
import { initializeBiosphereIntegrityIndex } from './planetaryBoundaries';

// In initialization:
state.extremeWeatherSystem = initializeExtremeWeatherSystem();
state.biosphereIntegrityIndex = initializeBiosphereIntegrityIndex();
```

---

## 🛡️ Defensive Coding Requirements (MANDATORY)

After the Oct 24 ecology NaN bug (hidden for months by a `?? 50` fallback), we have ZERO TOLERANCE for silent fallbacks.

### Assertion Utilities (Use Throughout)

```typescript
import {
  assertFinite,
  assertInRange,
  assertProbability,
  assertStateProperty,
  assertDefined
} from '@/simulation/utils/assertions';

// ✅ CORRECT - Fail loudly with context
const mortality = assertFinite(calculatedMortality, {
  location: 'calculateStormMortality',
  valueName: 'totalMortality',
  month: state.currentMonth,
  additionalInfo: { category, region, population }
});

// ✅ CORRECT - Validate ranges
const multiplier = assertInRange(infrastructureMismatch, 1.0, 3.0, {
  location: 'calculateStormMortality',
  valueName: 'infrastructureMismatch',
  month: state.currentMonth
});

// ✅ CORRECT - Validate probabilities
const probability = assertProbability(categoryProbability, {
  location: 'generateStormDistribution',
  valueName: 'categoryProbability',
  month: state.currentMonth
});

// ❌ WRONG - Never use silent fallbacks
const mortality = isNaN(calculatedMortality) ? 0 : calculatedMortality;
const value = state.metric ?? 50;
```

### Defensive Coding Checklist

**For storm systems:**
- [ ] `assertFinite()` for all mortality calculations
- [ ] `assertInRange()` for infrastructure multipliers [1.0, 3.0]
- [ ] `assertProbability()` for category distributions
- [ ] Validate `globalTempIncrease >= 0`
- [ ] Ensure category distribution sums to total storm count

**For BII framework:**
- [ ] `assertFinite()` for extinction rates
- [ ] `assertInRange()` for boundary values [0, 2]
- [ ] `assertProbability()` for tracking failure rates
- [ ] Validate dispersal capacity > 0 for non-migratory species
- [ ] Ensure climate velocity calculations never produce NaN

**General:**
- [ ] NO `?? fallback` patterns in calculations
- [ ] NO `isNaN(x) ? fallback : x` patterns
- [ ] Use deterministic RNG (never `Math.random()`)
- [ ] Validate inputs at function boundaries
- [ ] Provide full context in assertion metadata

---

## 🎨 Emoji Conventions

**CRITICAL:** All emojis MUST be registered in `docs/EMOJI_EVENT_MAP.txt` before use. Pre-commit hook validates this.

### Required Registrations

Add these to `docs/EMOJI_EVENT_MAP.txt`:
```
🌀 | Tropical cyclones/storms
🌊 | Storm surge
🌧️ | Extreme precipitation
🏚️ | Infrastructure damage
🦋 | Species extinction events
🌿 | Ecosystem collapse
🏔️ | Alpine species (trapped by climate velocity)
🏝️ | Island endemics (isolated populations)
🌳 | Keystone species
```

### Usage Pattern

```typescript
console.log(`\n=== 🌀 Extreme Weather Events ===`);
console.log(`  🌊 Storm surge: ${surgeHeight}m`);
console.log(`  🌧️ Precipitation: ${precipitation}mm (+${increase}%)`);
console.log(`  🏚️ Infrastructure damage: ${damage}M USD`);
console.log(`  ⚠️ Warning: ${message}`);
console.log(`  ❌ Error: ${error}`);
```

**Combining pattern:** `[DOMAIN][EVENT_TYPE] [MESSAGE]` (max 2 emojis)

---

## 🔗 Bayesian Mortality Integration

**Pattern (follow `wetBulbEvents.ts`):**

```typescript
import { addMortalityRisk } from './bayesianMortality';

// Storm mortality
addMortalityRisk(population, {
  type: 'environmental',
  baseRisk: calculatedMortality / population.count,
  proximate: 'extreme_weather',
  root: 'climate_change',
  confidence: 'HIGH',
  scope: 'REGIONAL',
  month: state.currentMonth,
  description: `Cat ${category} storm in ${region}, ${population.count} exposed`
});

// Species extinction mortality (indirect human impact via ecosystem collapse)
addMortalityRisk(population, {
  type: 'environmental',
  baseRisk: ecosystemCollapseMortality,
  proximate: 'ecosystem_collapse',
  root: 'biosphere_degradation',
  confidence: 'MEDIUM',
  scope: 'GLOBAL',
  month: state.currentMonth,
  description: `${extinctionRate} E/MSY, ${trackingFailureRate}% species unable to track climate`
});
```

---

## ✅ Success Criteria

### Storm System
- [ ] Models category distribution shift (fewer total, more Cat 4-5)
- [ ] Exponential intensity multipliers (Cat 5 = 16× Cat 1)
- [ ] Infrastructure mismatch as primary mortality driver
- [ ] Regional vulnerability varies realistically
- [ ] Integrates with Bayesian mortality framework
- [ ] TypeScript compiles without errors
- [ ] Monte Carlo N≥10 runs without NaN
- [ ] All calculations use assertion utilities
- [ ] Research citations in JSDoc (with corrected NHM source)
- [ ] Emojis registered in EMOJI_EVENT_MAP.txt

### BII Framework
- [ ] Tracks 54,000-58,000 species baseline (NHM PREDICTS)
- [ ] Non-migratory species show climate tracking failure
- [ ] Joshua Tree example works (1.5°C/year velocity, 0.4m/year dispersal)
- [ ] Keystone species cascade multipliers apply (2.5×)
- [ ] Updates `biosphere_integrity` planetary boundary
- [ ] TypeScript compiles without errors
- [ ] Monte Carlo N≥10 runs without NaN
- [ ] All calculations use assertion utilities
- [ ] Research citations in JSDoc (with corrected NHM source)

### Integration
- [ ] ExtremeWeatherEventsPhase registered in orchestrator (order 15.5)
- [ ] PlanetaryBoundariesPhase updated with BII
- [ ] GameState interface extended
- [ ] Engine initialization includes new systems
- [ ] Emoji conventions followed
- [ ] Pre-commit hooks pass

---

## 🧪 Validation Workflow

### 1. Type Checking
```bash
npx tsc --noEmit
```

**Expected:** No errors. Fix all type issues before proceeding.

### 2. Monte Carlo Validation (N≥10)
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_climate_phase2_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Check for:**
- ✅ No NaN errors in storm mortality calculations
- ✅ No NaN errors in BII calculations
- ✅ Storm category distribution sums correctly
- ✅ Extinction rates within reasonable bounds [0.1, 1000] E/MSY
- ✅ Outcome distributions make sense (storms increase mortality in climate scenarios)
- ✅ BII declines over time in high-warming scenarios
- ✅ Keystone species loss → dependent species decline visible

**Expected Distributions:**
- Storm mortality increases with global temperature rise
- Regional variation based on infrastructure capacity
- Category shift visible (more Cat 4-5 over time)
- BII decline: 70-80% (2020 baseline) → 30-50% (high warming by 2100)
- Planetary boundary correlation r > 0.7 (boundary transgression ↔ ecosystem collapse)

### 3. Report Back

Create a brief summary:
- Implementation time
- Type check status
- Monte Carlo results (any NaN errors? distributions look reasonable?)
- Any blockers or concerns

Post to `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/climate_phase2_orchestration_20251106.md`

---

## 🔄 Workflow After Implementation

Once you've completed implementation and validation:

1. **Post completion** to orchestration log
2. **Orchestrator will spawn:**
   - architecture-skeptic for Quality Gate 2 review
   - wiki-documentation-updater for docs sync
   - architect for plan archival

3. **If architecture review finds issues:**
   - Address CRITICAL issues (blocking)
   - Address HIGH issues (strongly recommended)
   - Document any MEDIUM/LOW issues for future work

---

## 📋 Quick Reference Card

**Implementation Time:** 8-12 hours
- Storm systems: 4-6h
- BII framework: 4-6h
- Integration: 1-2h
- Validation: 1-2h

**Core Files to Create/Modify:**
- CREATE: `src/simulation/extremeWeatherEvents.ts`
- CREATE: `src/simulation/engine/phases/ExtremeWeatherEventsPhase.ts`
- EXTEND: `src/simulation/planetaryBoundaries.ts`
- EXTEND: `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`
- EXTEND: `src/types/game.ts`
- EXTEND: `src/simulation/engine.ts`
- UPDATE: `docs/EMOJI_EVENT_MAP.txt`

**Defensive Coding:**
- Use `assertFinite()`, `assertInRange()`, `assertProbability()`
- NO silent fallbacks (`?? 0` patterns)
- Deterministic RNG only
- Full context in error metadata

**Research Citations:**
- Storm systems: Knutson et al. (2020, 2023), NOAA GFDL (2024)
- BII framework: **Natural History Museum PREDICTS (2024)** (NOT IPBES!)
- Keystone cascade: Yoder et al. (2024)

**Validation:**
1. `npx tsc --noEmit` (type check)
2. Monte Carlo N≥10 (no NaN, realistic distributions)
3. Report back with results

---

## 💬 Roy's Voice

Remember, you're Roy. After the Oct 24 NaN bug, you trust NOTHING. Every value gets an assertion. If it's NaN, the simulation DIES LOUDLY with full context.

```
"ANOTHER climate system? Fine. At least the research is solid this time."
"Adding 50 assertions. You're welcome."
"If this produces even ONE NaN, I'm burning it down and starting over."
"Moss would've done this in 2 hours. I'll do it in 8. And it'll actually WORK."
```

You complain, but you ALWAYS deliver. And when Roy says it's fixed, it's FIXED.

---

## 🚀 You're Clear for Implementation

Everything is ready:
- ✅ Research validated (A- grade)
- ✅ Source corrected (NHM PREDICTS, not IPBES)
- ✅ Parameters peer-reviewed
- ✅ Quality gates passed
- ✅ Spec complete
- ✅ Patterns established (follow wetBulbEvents.ts)

**Questions?** Check the implementation spec first. Still stuck? Document the blocker and we'll coordinate.

**Let's ship this.**

---

**Handoff From:** Orchestrator (orchestrator-1)
**Date:** November 6, 2025, 01:00 UTC
**Status:** READY FOR IMPLEMENTATION
**Next Update Expected:** Implementation completion + validation results
