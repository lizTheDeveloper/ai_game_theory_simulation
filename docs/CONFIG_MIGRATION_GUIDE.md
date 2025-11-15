# Configuration Migration Guide

**Purpose:** Guide for migrating magic numbers and scattered configuration to centralized locations

**Last updated:** 2025-11-15
**Status:** Active migration in progress

---

## Decision Tree: Where to Put New Parameters

```
START: I have a new constant/parameter

├─ Is it used ONLY in ONE domain? (e.g., only in wetBulb system)
│  ├─ YES → Put in type file (e.g., types/wetBulbTemperature.ts)
│  │         Rationale: Domain coupling is good, experts need it with types
│  │
│  └─ NO → Continue...
│
├─ Is it regional/geographic data? (e.g., population, climate baselines)
│  ├─ YES → Put in data file (e.g., data/regional-climate.json)
│  │         OR in centralConfig.REGIONAL if <20 parameters
│  │         Rationale: Large data arrays don't belong in code
│  │
│  └─ NO → Continue...
│
├─ Is it a numerical floor/ceiling to prevent calculation errors?
│  ├─ YES → Put in centralConfig.FLOORS or centralConfig.TOLERANCES
│  │         Rationale: Numerical stability constants are cross-cutting
│  │
│  └─ NO → Continue...
│
├─ Is it a technology threshold? (e.g., min AI capability for TIER 2)
│  ├─ YES → Put in thresholds/tier*Config.ts
│  │         Rationale: Technology thresholds are domain-specific
│  │
│  └─ NO → Continue...
│
└─ DEFAULT → Put in centralConfig (THRESHOLDS / RATES / MULTIPLIERS / BASELINES)
             Rationale: Cross-system parameters need central visibility
```

---

## Configuration Categories

### 1. `centralConfig.ts` - Cross-System Parameters

**When to use:** Parameters used by MULTIPLE systems or top-level simulation controls

**Categories:**
```typescript
THRESHOLDS     // Critical boundaries (AI alignment, climate danger, crisis triggers)
RATES          // Change rates (per month: growth, decay, accumulation)
MULTIPLIERS    // Scaling factors (crisis response, mortality, cascade effects)
BASELINES      // Reference values (2025 population, pre-industrial CO2)
TOLERANCES     // Floating point precision (comparison epsilons)
FLOORS         // NEW: Numerical stability minimums (geometric mean floors)
```

**Example:**
```typescript
export const THRESHOLDS = {
  /**
   * Climate threshold for dangerous warming
   * @research IPCC AR6 (2023) - 1.5°C Paris Agreement target
   * @value 1.5 - °C above pre-industrial
   */
  CLIMATE_DANGEROUS_THRESHOLD: 1.5,
} as const;
```

**Research citation REQUIRED:** Every parameter needs @research JSDoc tag

---

### 2. Type Files (`types/*.ts`) - Domain-Specific Constants

**When to use:** Constants tightly coupled to ONE domain's types and logic

**Examples:**
- `types/wetBulbTemperature.ts` → `WET_BULB_CONSTANTS`
- `types/extremeWeather.ts` → `STORM_CONSTANTS`
- `types/planetaryBoundaries.ts` → Planetary boundary thresholds

**Example:**
```typescript
export const WET_BULB_CONSTANTS = {
  // Stull formula coefficients (only used in wet bulb calculations)
  COEFF_1: 0.151977,
  COEFF_2: 8.313659,

  // Thresholds (only used in wet bulb mortality)
  SEVERE_THRESHOLD: 30.5,  // °C empirical survivability limit
} as const;
```

**Keep domain-coupled:** Don't move these to centralConfig unless used elsewhere

---

### 3. Tier Configs (`thresholds/tier*Config.ts`) - Technology Thresholds

**When to use:** Technology deployment thresholds (min AI capability, investment costs)

**Files:**
- `tier1Config.ts` - TIER 1 (Crisis Response)
- `tier2Config.ts` - TIER 2 (Transformative)
- `tier2InterventionConfig.ts` - TIER 2 interventions
- `tier3Config.ts` - TIER 3 (Clarketech)

**Example:**
```typescript
export const TIER2_THRESHOLDS = {
  MIN_AI_CAPABILITY_FOR_RESEARCH: 0.40,  // Aggregate capability threshold
  MIN_COMPUTE_FOR_DEPLOYMENT: 1000,      // FLOPS required
} as const;
```

---

### 4. Data Files (`data/*.json`) - Regional/Geographic Data

**When to use:** Large data arrays (>20 parameters) with regional/geographic structure

**Proposed files:**
- `data/regional-climate-baselines.json` - Regional temperature, humidity, population
- `data/regional-storm-vulnerability.json` - Coastal populations, infrastructure capacity

**Example structure:**
```json
{
  "regions": [
    {
      "id": "south-asia",
      "climate": {
        "baselineTemperature": 35,
        "baselineHumidity": 75
      },
      "demographics": {
        "population": 1900,
        "elderlyFraction": 0.08,
        "povertyFraction": 0.22
      },
      "infrastructure": {
        "airConditioningAccess": 0.12,
        "healthcareCapacity": 0.30
      }
    }
  ]
}
```

**Status:** NOT YET IMPLEMENTED (proposed for Phase 3)

---

## Migration Patterns

### Pattern 1: Move Inline Constant to centralConfig

**Before:**
```typescript
// src/simulation/environmental.ts
function calculateReserves(state: GameState) {
  const MIN_RESERVE_FLOOR = 0.001; // 0.1% minimum to prevent geometric mean collapse
  const reserves = Math.max(MIN_RESERVE_FLOOR, calculatedValue);
}
```

**After:**
```typescript
// src/simulation/config/centralConfig.ts
export const FLOORS = {
  /**
   * Geometric mean floor to prevent division by zero
   * @research Standard numerical stability practice
   * @value 0.001 - 0.1% minimum
   */
  GEOMETRIC_MEAN_FLOOR: 0.001,
} as const;

// src/simulation/environmental.ts
import { FLOORS } from './config/centralConfig';

function calculateReserves(state: GameState) {
  const reserves = Math.max(FLOORS.GEOMETRIC_MEAN_FLOOR, calculatedValue);
}
```

**Steps:**
1. Add constant to centralConfig with research citation
2. Update imports in system file
3. Run `npx tsc --noEmit` to check types
4. Run Monte Carlo N=10 to validate behavior unchanged

---

### Pattern 2: Deduplicate Constants

**Before:**
```typescript
// src/simulation/planetaryBoundaries.ts (line 489)
const MAX_EXTINCTION_RATE = 1000.0;
const MIN_EXTINCTION_RATE = 1.0;

// src/simulation/planetaryBoundaries.ts (line 1280) - DUPLICATE!
const MAX_EXTINCTION_RATE = 1000.0;
const MIN_EXTINCTION_RATE = 1.0;

// src/simulation/planetaryBoundaries.ts (line 1899) - CONFLICTING!
const SAFE_EXTINCTION_RATE = 1.0;  // Different from line 732!
```

**After:**
```typescript
// src/simulation/config/centralConfig.ts
export const FLOORS = {
  /**
   * Minimum extinction rate (background)
   * @research IPBES (2019) - ~1 E/MSY background rate
   * @value 1.0
   */
  MIN_EXTINCTION_RATE: 1.0,

  /**
   * Safe extinction rate threshold
   * @research IPBES (2019) - Planetary boundary at 10 E/MSY
   * @value 10.0 - NOT 1.0 (background) or 1000.0 (mass extinction)
   */
  SAFE_EXTINCTION_RATE: 10.0,

  /**
   * Maximum extinction rate (mass extinction)
   * @research IPBES (2019) - Upper bound
   * @value 1000.0
   */
  MAX_EXTINCTION_RATE: 1000.0,
} as const;

// src/simulation/planetaryBoundaries.ts
import { FLOORS } from './config/centralConfig';

function calculateExtinction() {
  const rate = clamp(calculatedRate, FLOORS.MIN_EXTINCTION_RATE, FLOORS.MAX_EXTINCTION_RATE);
}
```

**Steps:**
1. Identify all definitions (grep for constant name)
2. Resolve conflicts (check research, pick correct value)
3. Add single definition to centralConfig
4. Replace all usages with import from centralConfig
5. Run tests + Monte Carlo N=10

---

### Pattern 3: Re-export During Migration (Backward Compatibility)

**Problem:** Moving constants breaks existing imports

**Solution:** Re-export from old location during migration

**Example:**
```typescript
// src/types/wetBulbTemperature.ts (BEFORE migration)
export const WET_BULB_CONSTANTS = {
  SEVERE_THRESHOLD: 30.5,
} as const;

// src/simulation/config/centralConfig.ts (AFTER migration)
export const THRESHOLDS = {
  WET_BULB_SEVERE: 30.5,
} as const;

// src/types/wetBulbTemperature.ts (DURING migration - re-export for compatibility)
import { THRESHOLDS } from '@/simulation/config/centralConfig';

/** @deprecated Use THRESHOLDS.WET_BULB_SEVERE from centralConfig */
export const WET_BULB_CONSTANTS = {
  SEVERE_THRESHOLD: THRESHOLDS.WET_BULB_SEVERE,
} as const;
```

**Deprecation timeline:**
1. Week 1: Add to centralConfig, re-export from type file
2. Week 2-3: Update imports gradually (file by file)
3. Week 4: Remove re-export, verify no remaining usages

---

## Validation Patterns

### Pattern 1: Config-Time Validation (CRITICAL)

**Add runtime validation at initialization:**

```typescript
// src/simulation/config/validateConfig.ts
import { assertInRange, assertFinite, assertProbability } from '../utils/assertions';

export function validateSimulationConfig(config: SimulationConfig): void {
  // Validate thresholds are in valid ranges
  assertProbability(config.thresholds.AI_ALIGNMENT, {
    location: 'validateSimulationConfig',
    valueName: 'AI_ALIGNMENT'
  });

  assertInRange(config.thresholds.CLIMATE_DANGEROUS_THRESHOLD, 0, 10, {
    location: 'validateSimulationConfig',
    valueName: 'CLIMATE_DANGEROUS_THRESHOLD'
  });

  // Validate rates are non-negative
  assertFinite(config.rates.AMR_MONTHLY_INCREASE, {
    location: 'validateSimulationConfig',
    valueName: 'AMR_MONTHLY_INCREASE'
  });

  if (config.rates.AMR_MONTHLY_INCREASE < 0) {
    throw new Error('❌ AMR_MONTHLY_INCREASE cannot be negative');
  }

  // Validate multipliers are positive
  if (config.multipliers.EXISTENTIAL_THREAT_INVESTMENT <= 0) {
    throw new Error('❌ EXISTENTIAL_THREAT_INVESTMENT must be positive');
  }
}

// src/simulation/initialization.ts
import { getSimulationConfig } from './config/centralConfig';
import { validateSimulationConfig } from './config/validateConfig';

export function initializeGameState(): GameState {
  const config = getSimulationConfig();
  validateSimulationConfig(config);  // ← Validate BEFORE using config

  // ... rest of initialization
}
```

**Why critical:** Catches config errors at startup, not during simulation

---

### Pattern 2: Type-Safe Config Access

**Use TypeScript types to prevent typos:**

```typescript
// centralConfig.ts
export type ThresholdKey = keyof typeof THRESHOLDS;
export type RateKey = keyof typeof RATES;

// Usage in code
import { THRESHOLDS, ThresholdKey } from './config/centralConfig';

function getThreshold(key: ThresholdKey): number {
  return THRESHOLDS[key];  // Type-safe, autocomplete works
}

// This will fail at compile time:
getThreshold('TYPO_KEY');  // ❌ TypeScript error
```

---

## Migration Checklist

### Before Migration
- [ ] Read this guide
- [ ] Identify all usages of constant (grep)
- [ ] Check for duplicates/conflicts
- [ ] Verify research citations exist
- [ ] Plan backward-compatible re-exports if needed

### During Migration
- [ ] Add constant to centralConfig with JSDoc + @research
- [ ] Add runtime validation in validateConfig.ts
- [ ] Update imports in system files
- [ ] Add re-exports for backward compatibility
- [ ] Run `npx tsc --noEmit` (no type errors)
- [ ] Run `npm test` (all tests pass)
- [ ] Run Monte Carlo N=10 (outcomes stable)

### After Migration
- [ ] Remove old constant definitions
- [ ] Remove re-exports (after deprecation period)
- [ ] Update wiki documentation
- [ ] Update this guide with lessons learned

---

## Examples of Completed Migrations

### Example 1: Wet Bulb Empirical Limit (Nov 7, 2025)

**Before:** Scattered thresholds in wetBulbEvents.ts
**After:** Centralized in centralConfig.THRESHOLDS

**Migration:**
```typescript
// centralConfig.ts
WET_BULB_EMPIRICAL_LIMIT: 30.5,  // Vecellio et al. (2022)
WET_BULB_STRESS_THRESHOLD: 28,   // Raymond et al. (2020)
```

**Impact:** Fixed 40-60% mortality underestimation bug (was using 35°C theoretical instead of 30.5°C empirical)

**Validation:** Monte Carlo N=10, checked mortality rates vs empirical data

---

### Example 2: AI Capability Doubling Time (Nov 11, 2025)

**Before:** 12 months (wrong, based on outdated assumption)
**After:** 3.6 months (correct, based on 2024 Epoch AI data)

**Migration:**
```typescript
// centralConfig.ts
/**
 * @research Sevilla & Roldán (2024) - 4.1× training compute per year
 * @research Epoch AI (2024) - 2.5× algorithmic efficiency per year
 * @value 3.6 - Capabilities double every 3.6 months
 */
AI_CAPABILITY_DOUBLING_TIME: 3.6,
```

**Impact:** 10,000,000× correction in 10-year scaling projections

**Validation:** Monte Carlo N=100, verified against empirical Epoch AI trends

---

## Anti-Patterns (Don't Do This)

### ❌ Anti-Pattern 1: Config in UI Code
```typescript
// ❌ BAD: Don't put simulation config in UI components
// src/lib/components/Dashboard.tsx
const TEMPERATURE_THRESHOLD = 1.5;  // Paris Agreement
```

**Why bad:** Simulation should NEVER depend on UI code

**Fix:** Put in centralConfig, UI imports from there

---

### ❌ Anti-Pattern 2: Duplicate Constants
```typescript
// ❌ BAD: Same constant in multiple files
// environmental.ts
const MIN_FLOOR = 0.001;

// planetaryBoundaries.ts
const MIN_FLOOR = 0.001;
```

**Why bad:** Changes require updating multiple places, risk of divergence

**Fix:** Single definition in centralConfig.FLOORS

---

### ❌ Anti-Pattern 3: Magic Numbers Without Citations
```typescript
// ❌ BAD: No research justification
const MORTALITY_MULTIPLIER = 2.5;  // Seems about right?
```

**Why bad:** Can't validate correctness, can't update when better research emerges

**Fix:** Add @research citation or mark [RESEARCH NEEDED]

---

### ❌ Anti-Pattern 4: No Runtime Validation
```typescript
// ❌ BAD: Only type-level safety
export const THRESHOLDS = {
  PROBABILITY: 1.5,  // Invalid! Probabilities must be [0, 1]
} as const;
```

**Why bad:** TypeScript won't catch out-of-range values

**Fix:** Add runtime validation in validateConfig.ts

---

## Questions & Answers

### Q: Should I move ALL constants to centralConfig?
**A:** NO. Domain-specific constants (used in only 1 system) can stay in type files. Only move cross-system parameters.

### Q: What if I have 100+ regional parameters?
**A:** Extract to data file (JSON/CSV). Don't hardcode large data sets.

### Q: Can I have uncertainty ranges in config?
**A:** YES! Add min/max/default:
```typescript
CLIMATE_SENSITIVITY: {
  min: 2.0,    // IPCC AR6 lower bound
  default: 3.0, // Best estimate
  max: 4.5,    // IPCC AR6 upper bound
}
```

### Q: How do I know if a constant needs a research citation?
**A:** If it's a SIMULATION parameter (affects outcomes), it REQUIRES research. If it's a UI constant (colors, sizes), it doesn't.

### Q: What if research is conflicting?
**A:** Document the conflict, pick the most conservative/recent estimate, add UNCERTAINTY comment:
```typescript
/**
 * @research Knutson et al. (2023) - -6% to -34% range
 * @value -0.20 - Middle estimate (HIGH UNCERTAINTY: ±70%)
 */
STORM_FREQUENCY_CHANGE: -0.20,
```

---

## Summary

**Golden Rules:**
1. **Domain-coupled constants** → Keep in type files
2. **Cross-system parameters** → Move to centralConfig
3. **Large data sets** → Extract to data files
4. **ALL parameters** → Require @research citations
5. **ALL config** → Add runtime validation
6. **Gradual migration** → Don't break everything at once

**Priority migrations:**
1. CRITICAL: Add runtime validation (Phase 1)
2. HIGH: Deduplicate extinction rates + geometric mean floors (Phase 2)
3. MEDIUM: Extract regional data (Phase 3)
4. LOW: Consolidate tier configs (Phase 4)

---

**Roy's note:** "This is a living document. Update it when you find new patterns or footguns."
