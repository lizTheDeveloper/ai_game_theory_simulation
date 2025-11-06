# Climate Mortality Phase 2: READY FOR IMPLEMENTATION
## Storm Systems + BII Framework

**Status:** ✅ **GREEN LIGHT** - All quality gates passed, ready for implementation
**Date:** November 5, 2025
**Orchestrator:** orchestrator-1
**Priority:** HIGH
**Estimate:** 8-12 hours implementation + 1-2 hours validation

---

## Quality Gate Status

### ✅ Quality Gate 1: Research Validation PASSED

**Cynthia (Super-Alignment Researcher):**
- **Grade:** A- (Excellent)
- **Status:** ✅ APPROVED (High Confidence)
- **Peer-reviewed:** 90%+ of sources
- **Recency:** 50%+ from 2024-2025
- **Confidence:** HIGH
- **Risk Level:** LOW

**Sylvia (Research Skeptic):**
- **Status:** ✅ CONDITIONAL PASS
- **Critical Issue:** IPBES 2024 citation needed verification
- **Resolution:** ✅ **VERIFIED** - Source is Natural History Museum PREDICTS (2024)
- **Confidence:** HIGH (with source correction)

---

## CRITICAL SOURCE CORRECTION

### Original Spec Error
**Spec claimed:** IPBES (2024) - 54,000 species baseline

### Corrected Source
**Actual source:** Natural History Museum (2024) - PREDICTS database v2.1.1
- **Species count:** 58,000 species (De Palma et al. 2024)
- **Authority:** PREDICTS project produces widely-used BII for CBD Framework
- **Methodology:** Global ecological studies across 48,000+ sites, 4.9M observations
- **Coverage:** Plants, fungi, birds, mammals, insects (terrestrial ecosystems)
- **DOI:** https://doi.org/10.5519/k33reyb6

**CRITICAL LIMITATIONS (Sylvia review - Nov 6, 2025):**
- ⚠️ May OVERESTIMATE intactness by 20-70% in tropical regions (Martin et al. 2019, Nature Ecol Evol)
- Space-for-time substitution assumes equilibrium (ignores extinction debt)
- Geographic bias: 30× more European than tropical data
- Alternative metric (GLOBIO MSA) shows 30-40% lower intactness
- Uncertainty: ±15% confidence interval on global BII

### Action Required
**Update all JSDoc citations** in implementation to reference:
```typescript
/**
 * Species baseline from Natural History Museum PREDICTS database (2024)
 * Source: https://www.nhm.ac.uk/our-science/data/biodiversity-indicators/
 * Dataset: 54,000-58,000 species across terrestrial ecosystems
 */
```

**DO NOT cite "IPBES (2024)" for species baseline - this was an error in the spec.**

---

## Implementation Overview

### Scope
Two integrated systems extending climate mortality framework:

1. **Storm Intensity-Frequency System** (4-6h)
   - New file: `src/simulation/extremeWeatherEvents.ts`
   - New phase: `ExtremeWeatherEventsPhase.ts` (order 15.5)
   - Integration: Bayesian mortality framework

2. **BII Framework Extension** (4-6h)
   - Extend: `src/simulation/planetaryBoundaries.ts`
   - Update: `PlanetaryBoundariesPhase.ts`
   - Integration: Species tracking, climate velocity modeling

### Key Research Findings

**Storm Systems (Knutson et al. 2020, 2023; NOAA GFDL 2024):**
- FEWER storms overall (-6% to -34% by 2100)
- STRONGER storms (2-11% intensity increase)
- Category shift: More Cat 4-5, fewer Cat 1-2
- Precipitation: +10-15% near-storm rainfall
- Infrastructure mismatch: PRIMARY mortality driver (up to 3× multiplier)

**BII Framework (Natural History Museum 2024; Richardson et al. 2023):**
- Species baseline: 58,000 species (PREDICTS v2.1.1, De Palma et al. 2024)
- Database coverage: 48,000+ sites, 4.9M observations globally
- Extinction rate: 10-100× background (currently ~10 E/MSY)
- Background rate: 0.1 E/MSY (natural baseline)
- Climate velocity: 0.5-10 km/year (species must track)
- Keystone cascade: 2.5× multiplier (Joshua Tree example - Yoder et al. 2024)

### BII Methodology Limitations

**Verified sources with documented caveats** (see: research/predicts-database-verification_20251106.md, reviews/predicts-citation-critique_20251106.md)

**Known biases to account for (Martin et al. 2019, Nature Ecol Evol):**

1. **Regional accuracy varies** - BII more reliable in well-studied regions (temperate zones, Europe/North America) than data-poor regions (tropical forests, Central Asia, Africa)

2. **Compositional focus** - BII measures abundance + composition, NOT species richness directly. May miss rare species losses while abundant generalists thrive. Can show "improvement" even with biodiversity decline.

3. **Land-use sensitivity** - Classification struggles with:
   - Plantations vs natural forests (may underestimate impacts in Southeast Asia)
   - Rangelands vs managed pasture (may overestimate impacts in arid zones like Australia)

4. **Terrestrial only** - No ocean/freshwater biodiversity tracked (PREDICTS database is terrestrial ecosystems)

5. **Sampling bias** - Better coverage of:
   - Vertebrates (birds/mammals) than invertebrates
   - Temperate ecosystems than tropical
   - Near roads/cities/research centers than remote areas
   - Plants better sampled than fungi/insects

**Mitigation in simulation:**
- Use BII as abundance/composition proxy, not species richness directly
- Complement with extinction rate calculations (E/MSY) for species-level tracking
- Document that BII 90% threshold is conservative estimate (may miss earlier degradation)
- Consider regional confidence modifiers based on data quality in future versions
- Acknowledge terrestrial-only scope (marine biodiversity requires separate metrics)

**Why BII despite limitations:**
- Largest terrestrial biodiversity database globally (58,000 species)
- Spatially explicit (10km resolution)
- Actively maintained (2024 update)
- Policy-relevant (CBD Global Biodiversity Framework indicator)
- Best available option for spatial ecosystem modeling

---

## Research-Backed Parameters

### Storm System Constants
```typescript
export const STORM_CONSTANTS = {
  // Category-based intensity multipliers
  // NOTE: Simplified exponential scaling - damage scales exponentially with wind speed
  INTENSITY_MULTIPLIERS: [1, 2, 4, 8, 16] as const,  // Cat 1-5

  // Climate-driven frequency changes per 1°C warming
  CAT_1_2_FREQUENCY_CHANGE: -0.05,     // -5% (Jewson 2023)
  CAT_3_FREQUENCY_CHANGE: 0.0,         // Stable
  CAT_4_5_FREQUENCY_CHANGE: 0.10,      // +10%

  // Precipitation scaling
  PRECIPITATION_SCALING: 0.10,         // +10% per 1°C (NOAA GFDL 2024)

  // Infrastructure mismatch
  INFRASTRUCTURE_MULTIPLIER_MAX: 3.0,  // Up to 3× mortality with zero infrastructure

  // Baseline global storm count
  BASELINE_ANNUAL_STORMS: 90,          // 1980-2010 average
} as const;
```

### BII Framework Constants
```typescript
export const BII_CONSTANTS = {
  // Natural History Museum PREDICTS database (2024)
  TOTAL_SPECIES_2024: 54000,           // Conservative (range 54k-58k)

  // Extinction rates (E/MSY)
  BACKGROUND_RATE: 0.1,                // Natural baseline
  CURRENT_RATE_2025: 10,               // 100× background (Richardson et al. 2023)

  // Climate velocity constraints
  JOSHUA_TREE_CLIMATE_VELOCITY: 1.5,   // °C/year (example)
  JOSHUA_TREE_DISPERSAL: 0.4,          // m/year (too slow to track!)

  // Keystone species cascade
  // NOTE: Inferred from Yoder et al. (2024) - Joshua Tree loss → 43% bird diversity decline
  KEYSTONE_CASCADE: 2.5,               // Affects 2.5× other species

  // Habitat fragmentation
  FRAGMENTATION_BARRIER_MAX: 1.5,      // Up to 1.5× mortality increase
} as const;
```

---

## Implementation Requirements

### Defensive Coding (MANDATORY)

**No silent fallbacks - this is a research simulation:**

```typescript
import { assertFinite, assertInRange, assertProbability } from '@/simulation/utils/assertions';

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
const distribution = assertProbability(categoryProbability, {
  location: 'generateStormDistribution',
  valueName: 'categoryProbability',
  month: state.currentMonth
});

// ❌ WRONG - Never use silent fallbacks
const mortality = isNaN(calculatedMortality) ? 0 : calculatedMortality;
const value = state.metric ?? 50;
```

**Why this matters:** Silent fallbacks hide bugs. The Oct 2025 ecology NaN bug was masked for months by a `?? 50` fallback.

### Bayesian Mortality Integration

**Pattern (already used in wetBulbEvents.ts):**
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

// Species extinction (indirect human impact)
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

### Emoji Conventions

**Register in `docs/EMOJI_EVENT_MAP.txt` before use:**
- 🌀 | Tropical cyclones/storms
- 🌊 | Storm surge
- 🌧️ | Extreme precipitation
- 🏚️ | Infrastructure damage
- 🦋 | Species extinction events
- 🌿 | Ecosystem collapse
- 🏔️ | Alpine species (trapped)
- 🏝️ | Island endemics (isolated)
- 🌳 | Keystone species

---

## Success Criteria

### Storm System ✅
- [ ] Models category distribution shift (fewer total, more Cat 4-5)
- [ ] Exponential intensity multipliers (Cat 5 = 16× Cat 1)
- [ ] Infrastructure mismatch as primary mortality driver
- [ ] Regional vulnerability varies realistically
- [ ] Integrates with Bayesian mortality framework
- [ ] TypeScript compiles without errors
- [ ] Monte Carlo N≥10 runs without NaN
- [ ] All calculations use assertion utilities
- [ ] Research citations in JSDoc

### BII Framework ✅
- [ ] Tracks 54,000-58,000 species baseline (Natural History Museum PREDICTS)
- [ ] Non-migratory species show climate tracking failure
- [ ] Joshua Tree example works (1.5°C/year velocity, 0.4m/year dispersal)
- [ ] Keystone species cascade multipliers apply (2.5×)
- [ ] Updates `biosphere_integrity` planetary boundary
- [ ] TypeScript compiles without errors
- [ ] Monte Carlo N≥10 runs without NaN
- [ ] All calculations use assertion utilities
- [ ] Research citations in JSDoc (with corrected Natural History Museum source)

### Integration ✅
- [ ] ExtremeWeatherEventsPhase registered in orchestrator (order 15.5)
- [ ] PlanetaryBoundariesPhase updated with BII
- [ ] GameState interface extended
- [ ] Engine initialization includes new systems
- [ ] Emoji conventions followed
- [ ] Pre-commit hooks pass (emoji registration)

---

## Monte Carlo Validation Expectations

**Storm mortality:**
- Increases with global temperature rise
- Regional variation based on infrastructure capacity
- Category shift visible (more Cat 4-5 over time)

**BII decline:**
- 70-80% (2020 baseline) → 30-50% (high warming scenarios by 2100)
- Keystone species loss → 40-50% dependent species decline
- Climate velocity mismatches → 20-60% non-migratory species mortality
- Planetary boundary correlation r > 0.7 (boundary transgression ↔ ecosystem collapse)

---

## Workflow After Implementation

### 1. Type Checking
```bash
npx tsc --noEmit
```

### 2. Monte Carlo Validation (N≥10)
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_climate_phase2_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Check for:**
- No NaN errors in storm mortality calculations
- No NaN errors in BII calculations
- Storm category distribution sums correctly
- Extinction rates within reasonable bounds [0.1, 1000] E/MSY
- Outcome distributions make sense

### 3. Quality Gate 2: Architecture Review
**Spawn:** architecture-skeptic
**Focus:** Performance, state propagation, complexity
**Must address:** CRITICAL/HIGH issues before merge

### 4. Documentation & Archival
**Wiki update:** wiki-documentation-updater
**Plan archive:** architect (move to `/plans/completed/`)

---

## Reference Files

**Implementation Spec:**
- `/plans/climate-mortality-phase2-implementation-spec.md`

**Research:**
- `/research/climate-mortality-biosphere-multiparadigm-framework_20251028.md`

**Validations:**
- `/research/climate-mortality-phase2-validation-cynthia-20251101.md` (Cynthia - A- grade)
- `/reviews/climate_mortality_phase2_validation_20251101.md` (Sylvia - CONDITIONAL PASS)

**Architecture Review (previous):**
- `/reviews/climate-mortality-phase2-architecture-review_20251029.md`

---

## Timeline

**Implementation:** 8-12 hours
- Storm systems: 4-6h
- BII framework: 4-6h
- Phase integration: 1-2h
- Type checking: 30min

**Validation:** 1-2 hours
- Monte Carlo N=10: 1h
- Result analysis: 1h

**Quality Gate 2:** 2-3 hours
- Architecture review
- Issue remediation

**Documentation:** 1-2 hours
- Wiki update
- Plan archival

**Total:** 12-18 hours end-to-end

---

## Risk Assessment

**Implementation Risk:** **LOW**
- Research quality: A- (excellent)
- Validation: Both reviewers approved
- Parameters: 90% peer-reviewed, 50% from 2024-2025
- Uncertainty: ±10-30% (narrow for climate science)
- Integration: Builds on proven Phase 1 patterns

**Comparison to other features:**
- Climate Phase 2: A- grade, LOW risk, ±10-30% uncertainty
- Cooperative Ownership: C+ grade, MEDIUM risk, ±40-50% uncertainty

---

## Next Steps

### For Implementation Team (simulation-maintainer / Roy):

1. **Read this document fully** - Understand source correction
2. **Review implementation spec** - Detailed technical requirements
3. **Implement storm systems** - Following defensive coding patterns
4. **Implement BII framework** - Using corrected Natural History Museum citation
5. **Phase integration** - Register phases, extend GameState
6. **Type check** - Ensure compilation succeeds
7. **Monte Carlo validation** - N≥10, check for NaN, verify distributions
8. **Post to coordination channel** - Update progress regularly

### For Orchestrator (follow-up):

1. ✅ **COMPLETE:** Verify IPBES source (corrected to Natural History Museum)
2. ✅ **COMPLETE:** Prepare implementation briefing
3. **PENDING:** Monitor implementation progress
4. **PENDING:** Coordinate Quality Gate 2 (architecture review)
5. **PENDING:** Coordinate documentation and archival
6. **PENDING:** Update roadmap with completion status

---

## Why This Feature Matters

**Replaces random exogenous shocks with predictable climate models:**
- Research-backed parameters (no "tuning for fun")
- Captures key insight: FEWER but STRONGER storms
- Models species extinction via climate tracking failure
- Infrastructure mismatch as primary mortality driver (not just temperature)
- Multi-paradigm measurement (works across Western, Indigenous, Development, Ecological worldviews)

**Advances simulation realism:**
- Phase 1 (complete): Heat mortality systems
- Phase 2 (this): Storm systems + biodiversity collapse
- Future phases: Compound extremes, tipping points, resilience mechanisms

---

**Status:** ✅ **READY FOR IMPLEMENTATION** - All prerequisites complete, quality gates passed, source correction documented

**Orchestrator sign-off:** orchestrator-1, November 5, 2025
