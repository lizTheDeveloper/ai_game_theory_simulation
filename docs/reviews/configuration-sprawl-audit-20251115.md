# Configuration Sprawl Audit (MEDIUM-4 from Architecture Review)

**Date:** 2025-11-15
**Reviewer:** Roy (Simulation Maintainer)
**Issue:** Configuration sprawl - magic numbers throughout phases, config spread across multiple files, no central validation
**Status:** MEDIUM priority

---

## Executive Summary

Configuration in this codebase is PARTIALLY centralized but with significant sprawl:

✅ **GOOD:** `src/simulation/config/centralConfig.ts` exists with 1,366 lines of well-documented parameters
⚠️ **PARTIAL:** Type-specific constants live in type files (e.g., `WET_BULB_CONSTANTS`, `STORM_CONSTANTS`)
❌ **BAD:** Magic numbers scattered in system files (e.g., `MIN_RESERVE_FLOOR = 0.001` in environmental.ts)
❌ **BAD:** No runtime validation of config values (only TypeScript const assertions)
❌ **CRITICAL:** Configuration initialized in MULTIPLE places (centralConfig, type files, system files)

**Pain Points:**
1. **Duplication:** Same concept defined in multiple places (e.g., extinction rates)
2. **Discovery:** Hard to find where a parameter is defined
3. **Validation:** No runtime checks for parameter ranges (only compile-time const assertions)
4. **Migration risk:** Moving constants breaks existing imports
5. **Inconsistent patterns:** Some constants in centralConfig, some in type files, some inline

---

## Configuration Inventory

### 1. Central Configuration (`src/simulation/config/centralConfig.ts`)

**Size:** 1,366 lines
**Categories:**
- THRESHOLDS (274 lines) - Critical boundaries (AI alignment, climate, nuclear, etc.)
- RATES (474 lines) - Per-month change rates (AMR, cohesion decay, AI scaling, etc.)
- MULTIPLIERS (203 lines) - Scaling factors (crisis response, mortality, tech effects)
- BASELINES (334 lines) - Reference points (2025 values, pre-industrial, etc.)
- TOLERANCES (31 lines) - Floating point precision

**Quality:**
- ✅ All parameters have JSDoc comments with @research citations
- ✅ TypeScript const assertions for type safety
- ✅ Grouped by domain (AI, climate, economic, etc.)
- ✅ Type exports for config keys
- ⚠️ NO runtime validation (only type-level safety)

**Example (well-structured):**
```typescript
/**
 * AI Alignment threshold for "aligned" classification
 * @research Anthropic (2024) - Constitutional AI alignment benchmarks
 * @value 0.7 - 70% confidence in value alignment
 */
AI_ALIGNMENT: 0.7,
```

---

### 2. Type-Specific Constants (in `src/types/*.ts`)

**Pattern:** Constants defined alongside types for domain-specific systems

#### `src/types/wetBulbTemperature.ts`
```typescript
export const WET_BULB_CONSTANTS = {
  COEFF_1: 0.151977,  // Stull formula coefficients
  COEFF_2: 8.313659,
  // ... 10 more coefficients and thresholds
  MODERATE_THRESHOLD: 28,    // °C wet bulb
  HIGH_THRESHOLD: 29.5,
  SEVERE_THRESHOLD: 30.5,    // Empirical survivability limit
  EXTREME_THRESHOLD: 31.2,
  BASE_FREQUENCY_2025: 0.002,
  FREQUENCY_GROWTH_RATE: 0.05,
  MAX_FREQUENCY: 0.30,
} as const;
```

**Research citations:** ✅ In JSDoc
**Runtime validation:** ❌ None

#### `src/types/extremeWeather.ts`
```typescript
export const STORM_CONSTANTS = {
  INTENSITY_MULTIPLIERS: [1, 2, 4, 8, 16] as const,
  OVERALL_FREQUENCY_CHANGE: -0.20,
  CAT_1_2_FREQUENCY_CHANGE: -0.05,
  CAT_3_FREQUENCY_CHANGE: 0.0,
  CAT_4_5_FREQUENCY_CHANGE: 0.10,
  PRECIPITATION_SCALING: 0.10,
  INFRASTRUCTURE_MULTIPLIER_MAX: 3.0,
  BASELINE_ANNUAL_STORMS: 90,
  BASELINE_CATEGORY_PROPORTIONS: [0.40, 0.25, 0.20, 0.10, 0.05] as const,
  // ... 7 more constants
} as const;
```

**Research citations:** ✅ In JSDoc
**Runtime validation:** ❌ None

#### Regional data arrays
```typescript
export const REGIONAL_VULNERABILITIES: RegionalStormVulnerability[] = [
  {
    region: 'south-asia',
    coastalPopulation: 250,
    infrastructureCapacity: 0.25,
    baselineStormFrequency: 5,
    vulnerabilityMultiplier: 1.8,
  },
  // ... 8 more regions with 4-5 parameters each
];
```

**Total regional parameters:** ~40 constants across wetBulb and storm systems

---

### 3. Inline Magic Numbers (in `src/simulation/*.ts` system files)

#### `src/simulation/environmental.ts`
```typescript
const MIN_RESERVE_FLOOR = 0.001; // Line 159 - geometric mean protection
const MIN_CLIMATE_FLOOR = 0.001; // Line 258 - geometric mean protection
```

**Pattern:** Local constants to prevent division by zero or geometric mean collapse
**Research citations:** ❌ Inline comment only
**Runtime validation:** ❌ None

#### `src/simulation/planetaryBoundaries.ts`
```typescript
const MAX_EXTINCTION_RATE = 1000.0;  // Line 489 - hard cap
const MIN_EXTINCTION_RATE = 1.0;     // Line 490 - background rate
const SAFE_EXTINCTION_RATE = 10.0;   // Line 732 - IPBES boundary
// ... duplicated again at lines 1280, 1281, 1899
```

**Problem:** Same concept defined 4+ times in same file
**Research citations:** ✅ IPBES referenced
**Runtime validation:** ❌ None

---

### 4. Tier-Specific Config (in `src/simulation/thresholds/*.ts`)

**Files:**
- `tier1Config.ts` - TIER 1 technology thresholds
- `tier2Config.ts` - TIER 2 technology thresholds
- `tier2InterventionConfig.ts` - TIER 2 intervention parameters
- `tier3Config.ts` - TIER 3 technology thresholds

**Pattern:** Technology-specific thresholds for breakthrough tech deployment

**Example (`tier2Config.ts`):**
```typescript
export const TIER2_THRESHOLDS = {
  // Minimum AI capability aggregate for TIER 2 tech research
  MIN_AI_CAPABILITY_FOR_RESEARCH: 0.40,
  // ... more tech-specific thresholds
};
```

**Quality:**
- ✅ Centralized per tier
- ⚠️ Separate from main centralConfig
- ❌ No runtime validation

---

### 5. Regional/Initialization Data (hardcoded in system modules)

#### `src/simulation/wetBulbEvents.ts` (lines 47-151)
```typescript
const regionalClimates: RegionalClimate[] = [
  {
    region: 'south-asia',
    baselineTemperature: 35,      // °C summer average
    baselineHumidity: 75,          // % summer humidity
    population: 1900,              // Millions
    vulnerabilityMultiplier: 1.3,
    elderlyFraction: 0.08,
    povertyFraction: 0.22,
    outdoorWorkerFraction: 0.42,
    airConditioningAccess: 0.12,
    coolingCenterAccess: 0.05,
    healthcareCapacity: 0.30,
  },
  // ... 11 more regions with 10+ parameters each
];
```

**Total parameters:** ~120+ regional constants across 12 regions
**Research citations:** ✅ In file header
**Runtime validation:** ❌ None
**Problem:** Should be in a data file or centralConfig, not hardcoded in system module

---

## Pain Points Analysis

### 1. Discovery Problem
**Scenario:** I want to find "what's the minimum biodiversity threshold?"

**Current search path:**
1. Check centralConfig.ts → finds `BIODIVERSITY_COLLAPSE_THRESHOLD: 0.25`
2. Check planetaryBoundaries.ts → finds different logic with `SAFE_EXTINCTION_RATE`
3. Check types/planetaryBoundaries.ts → might find more constants
4. Grep for "biodiversity" → finds 10+ usages

**Time cost:** 5-10 minutes to trace parameter origin

---

### 2. Duplication Problem
**Example:** Extinction rate thresholds

**Defined in:**
- `centralConfig.ts` - None (missing!)
- `planetaryBoundaries.ts` line 489 - `MAX_EXTINCTION_RATE = 1000.0`
- `planetaryBoundaries.ts` line 490 - `MIN_EXTINCTION_RATE = 1.0`
- `planetaryBoundaries.ts` line 732 - `SAFE_EXTINCTION_RATE = 10.0`
- `planetaryBoundaries.ts` line 1280 - `MAX_EXTINCTION_RATE = 1000.0` (duplicate!)
- `planetaryBoundaries.ts` line 1281 - `MIN_EXTINCTION_RATE = 1.0` (duplicate!)
- `planetaryBoundaries.ts` line 1899 - `SAFE_EXTINCTION_RATE = 1.0` (different value!)

**Problem:** 6 definitions, 2 are duplicates, 1 contradicts others

---

### 3. Validation Gap
**Current validation:** Only TypeScript `as const` + type checking
**Missing:** Runtime validation of parameter ranges

**Example risks:**
- Temperature thresholds could be set negative
- Probabilities could exceed 1.0
- Rates could be NaN
- Multipliers could be zero (division by zero)

**Current pattern (assertion in phases):**
```typescript
assertInRange(globalTempIncrease, 0, 6, { location: 'calculateCategoryDistribution' });
```

**Problem:** Validation happens at USE time, not CONFIG time
**Better:** Validate config at initialization, fail early

---

### 4. Migration Risk
**If we move constants from types to centralConfig:**
- Breaks existing imports: `import { WET_BULB_CONSTANTS } from '@/types/wetBulbTemperature'`
- Need to update 10-20 import statements
- Risk of breaking production code mid-migration

**Mitigation needed:** Re-export from type files during migration period

---

### 5. Inconsistent Patterns
**Pattern 1:** Central config (AI alignment, climate thresholds)
**Pattern 2:** Type-specific constants (wet bulb, storms)
**Pattern 3:** Inline magic numbers (geometric mean floors)
**Pattern 4:** Regional data arrays (wetBulb, storms)
**Pattern 5:** Tier configs (tech thresholds)

**Problem:** 5 different patterns make it unclear WHERE to add new parameters

---

## Recommendations

### CRITICAL: Validate Config at Initialization

**Add runtime validation:**
```typescript
// src/simulation/config/validateConfig.ts (already exists!)
export function validateSimulationConfig(config: SimulationConfig): void {
  // Validate thresholds
  assertInRange(config.thresholds.AI_ALIGNMENT, 0, 1, {
    location: 'validateSimulationConfig',
    valueName: 'AI_ALIGNMENT'
  });

  // Validate rates are non-negative
  assertFinite(config.rates.AMR_MONTHLY_INCREASE, {
    location: 'validateSimulationConfig',
    valueName: 'AMR_MONTHLY_INCREASE'
  });

  // ... validate ALL config parameters
}

// Call at initialization
const config = getSimulationConfig();
validateSimulationConfig(config);
```

**Existing file:** `src/simulation/config/validateConfig.ts` (15KB) - already partially implements this!

---

### HIGH: Document Migration Path

**Create migration guide for moving constants:**

1. **Type-specific constants:** KEEP in type files (domain coupling is OK)
   - `WET_BULB_CONSTANTS` → Stay in `types/wetBulbTemperature.ts`
   - `STORM_CONSTANTS` → Stay in `types/extremeWeather.ts`
   - **Rationale:** Tightly coupled to domain types, domain experts need them together

2. **Cross-system thresholds:** MOVE to centralConfig
   - Extinction rate thresholds → centralConfig.THRESHOLDS
   - Geometric mean floors → centralConfig.TOLERANCES
   - **Rationale:** Used across multiple systems

3. **Regional data:** MOVE to data files or centralConfig
   - Regional climate data → `data/regional-climate-baselines.json`
   - Regional storm vulnerability → `data/regional-storm-vulnerability.json`
   - **Rationale:** Large data arrays should be in data files, not code

4. **Inline magic numbers:** MOVE to centralConfig or type-specific constants
   - `MIN_RESERVE_FLOOR` → centralConfig.TOLERANCES.GEOMETRIC_MEAN_FLOOR
   - **Rationale:** No orphan constants in system files

---

### MEDIUM: Add Config Categories

**Extend centralConfig with missing categories:**

```typescript
export const FLOORS = {
  /**
   * Geometric mean floor to prevent division by zero
   * @research Standard numerical stability practice
   * @value 0.001 - 0.1% minimum
   */
  GEOMETRIC_MEAN_FLOOR: 0.001,

  /**
   * Minimum extinction rate (background)
   * @research IPBES (2019) - ~1 E/MSY background
   * @value 1.0 - 1 extinction per million species-years
   */
  MIN_EXTINCTION_RATE: 1.0,

  /**
   * Safe extinction rate threshold
   * @research IPBES (2019) - Planetary boundary at 10 E/MSY
   * @value 10.0
   */
  SAFE_EXTINCTION_RATE: 10.0,

  /**
   * Maximum extinction rate hard cap
   * @research IPBES (2019) - Mass extinction upper bound
   * @value 1000.0 - 1000 E/MSY (mass extinction event)
   */
  MAX_EXTINCTION_RATE: 1000.0,
} as const;
```

---

### LOW: Gradual Migration (3-5 Examples)

**Priority migration targets:**

1. **Extinction rate constants** (planetaryBoundaries.ts → centralConfig.FLOORS)
   - HIGH impact: Used in multiple places, currently duplicated
   - LOW risk: Only 1 file to update

2. **Geometric mean floors** (environmental.ts → centralConfig.FLOORS)
   - MEDIUM impact: Prevents NaN bugs
   - LOW risk: Local constants, easy to migrate

3. **Regional climate data** (wetBulbEvents.ts → data file or centralConfig.REGIONAL)
   - HIGH impact: Large data set (120+ parameters)
   - MEDIUM risk: Requires data structure refactor

4. **Storm regional vulnerability** (extremeWeather.ts → data file or centralConfig.REGIONAL)
   - MEDIUM impact: 40+ parameters
   - MEDIUM risk: Similar to #3

5. **Tier thresholds** (tier*Config.ts → centralConfig.TECH_THRESHOLDS)
   - MEDIUM impact: Better organization
   - HIGH risk: Used across many phases

---

## Migration Guide (Draft)

### Phase 1: Add Runtime Validation (Week 1)
- Extend `validateConfig.ts` to validate ALL centralConfig parameters
- Call validation at initialization
- Add tests for config validation (happy path + error cases)

### Phase 2: Migrate Inline Constants (Week 2)
- Move `MIN_RESERVE_FLOOR`, `MIN_CLIMATE_FLOOR` to centralConfig.FLOORS
- Move extinction rate constants to centralConfig.FLOORS
- Update imports in system files
- Run Monte Carlo N=10 to validate

### Phase 3: Migrate Regional Data (Week 3)
- Extract regional climate data to JSON file or centralConfig.REGIONAL
- Extract regional storm vulnerability to JSON file or centralConfig.REGIONAL
- Update initialization functions to read from config
- Run Monte Carlo N=10 to validate

### Phase 4: Documentation (Week 4)
- Update wiki with config structure
- Add "where to put new parameters" guide
- Document validation patterns
- Update CLAUDE.md with config standards

---

## Examples of Good Config Management

### Example 1: Wet Bulb Thresholds (GOOD)
**Location:** `src/types/wetBulbTemperature.ts`

**Why GOOD:**
- ✅ Grouped by domain (wet bulb temperature)
- ✅ Research citations in JSDoc
- ✅ TypeScript const assertions
- ✅ Clear naming (MODERATE_THRESHOLD, SEVERE_THRESHOLD)
- ✅ Used only in wetBulb system (domain coupling is appropriate)

**Keep as-is:** Domain-specific constants are FINE in type files

---

### Example 2: Central Thresholds (GOOD)
**Location:** `src/simulation/config/centralConfig.ts`

**Why GOOD:**
- ✅ Cross-system thresholds centralized
- ✅ Research citations for EVERY parameter
- ✅ Grouped by category (AI, climate, nuclear, etc.)
- ✅ Type-safe with const assertions
- ✅ Exported types for type checking

**Improve:** Add runtime validation

---

### Example 3: Extinction Rates (BAD)
**Location:** `src/simulation/planetaryBoundaries.ts` (6 definitions)

**Why BAD:**
- ❌ Duplicated 6 times
- ❌ Conflicting values (SAFE_EXTINCTION_RATE = 10.0 vs 1.0)
- ❌ No centralization
- ❌ Inline magic numbers

**Fix:** Move to centralConfig.FLOORS with single source of truth

---

## Conclusion

**Current state:** PARTIAL centralization (60% in centralConfig, 40% sprawl)

**Effort to fix:** 4-6 hours per architecture review estimate is REASONABLE

**Priority:**
1. CRITICAL: Add runtime validation (2 hours)
2. HIGH: Migrate extinction rates + geometric mean floors (1 hour)
3. MEDIUM: Document migration patterns (1 hour)
4. LOW: Migrate regional data (2 hours, optional)

**Risk mitigation:**
- Gradual migration (not big-bang refactor)
- Re-export from old locations during transition
- Monte Carlo validation after each migration
- Keep domain-specific constants in type files (don't over-centralize)

---

**Roy's verdict:** "Not terrible, but needs cleanup. The duplication and lack of runtime validation are the real problems. Let's fix those first before moving everything around."
