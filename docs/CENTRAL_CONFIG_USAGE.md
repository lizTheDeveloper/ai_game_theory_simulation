# Central Configuration System - Usage Guide

**Created:** 2025-11-06 (WEEK 2 Task 2.1)
**Status:** Active - Single source of truth for simulation parameters

---

## Overview

The Central Configuration System provides a single source of truth for all simulation parameters, eliminating magic numbers and ensuring research-backed values are consistently used across the codebase.

**Core Files:**
- **`/src/simulation/config/centralConfig.ts`** - Parameter definitions with JSDoc citations
- **`/src/simulation/config/validateConfig.ts`** - Startup validation (fail-loudly)

**Philosophy:** Research-backed values only. Invalid parameters = immediate crash with context (no silent fallbacks).

---

## Architecture

### Parameter Categories

The configuration is organized into 5 categories:

```typescript
import {
  THRESHOLDS,   // Critical boundaries (climate thresholds, crisis levels, etc.)
  RATES,        // Rates of change (decay, growth, transition rates)
  MULTIPLIERS,  // Scaling factors (crisis amplification, survival modifiers)
  BASELINES,    // Reference values (2025 starting points, pre-industrial values)
  TOLERANCES,   // Floating point comparison precision
} from '@/simulation/config/centralConfig';
```

### Type Safety

All categories have TypeScript types for autocomplete and validation:

```typescript
import type {
  ThresholdKey,   // keyof typeof THRESHOLDS
  RateKey,        // keyof typeof RATES
  MultiplierKey,  // keyof typeof MULTIPLIERS
  BaselineKey,    // keyof typeof BASELINES
  ToleranceKey,   // keyof typeof TOLERANCES
} from '@/simulation/config/centralConfig';
```

---

## Usage Patterns

### 1. Basic Usage - Replace Magic Numbers

**❌ OLD (Magic Number):**
```typescript
if (waterSecurity < 0.4) {
  const waterSeverity = (0.4 - waterSecurity) / 0.4;
  // ...
}
```

**✅ NEW (Central Config):**
```typescript
import { THRESHOLDS } from '@/simulation/config/centralConfig';

if (waterSecurity < THRESHOLDS.WATER_SECURITY_CRISIS_THRESHOLD) {
  const waterSeverity =
    (THRESHOLDS.WATER_SECURITY_CRISIS_THRESHOLD - waterSecurity) /
    THRESHOLDS.WATER_SECURITY_CRISIS_THRESHOLD;
  // ...
}
```

**Benefits:**
- Self-documenting code (constant names explain meaning)
- Single source of truth (change once, updates everywhere)
- Research citations in JSDoc (verify parameter justification)

### 2. Threshold Comparisons

**❌ OLD:**
```typescript
if (unemployment > 0.25) {
  // Crisis logic
}
```

**✅ NEW:**
```typescript
import { THRESHOLDS } from '@/simulation/config/centralConfig';

if (unemployment > THRESHOLDS.UNEMPLOYMENT_CRISIS) {
  // Crisis logic
}
```

### 3. Rate Constants

**❌ OLD:**
```typescript
const monthlyIncrease = 0.001; // 0.1% per month
amrResistance += monthlyIncrease;
```

**✅ NEW:**
```typescript
import { RATES } from '@/simulation/config/centralConfig';

amrResistance += RATES.AMR_MONTHLY_INCREASE;
```

### 4. Multipliers

**❌ OLD:**
```typescript
const eliteSurvival = baselineSurvival * 1.5;
```

**✅ NEW:**
```typescript
import { MULTIPLIERS } from '@/simulation/config/centralConfig';

const eliteSurvival = baselineSurvival * MULTIPLIERS.ELITE_SURVIVAL_MULTIPLIER;
```

### 5. Baseline Values

**❌ OLD:**
```typescript
const currentPopulation = 8.0; // billions
```

**✅ NEW:**
```typescript
import { BASELINES } from '@/simulation/config/centralConfig';

const currentPopulation = BASELINES.POPULATION_2025;
```

---

## Migration Checklist

When migrating a file to use central config:

1. **Import the relevant categories:**
   ```typescript
   import { THRESHOLDS, RATES, MULTIPLIERS } from '@/simulation/config/centralConfig';
   ```

2. **Identify magic numbers:**
   - Search for hardcoded numeric literals: `\b0\.[0-9]+\b`, `\b[0-9]+\.[0-9]+\b`
   - Check comments for parameter descriptions
   - Verify context (is this a one-off calculation or reused value?)

3. **Replace with constants:**
   - Choose the appropriate category (THRESHOLDS, RATES, etc.)
   - Use descriptive constant name from centralConfig.ts
   - Preserve any inline comments explaining usage

4. **Verify research citations:**
   - Check JSDoc in centralConfig.ts
   - If marked `[RESEARCH NEEDED]`, add research citation or create research task

5. **Test:**
   - Run type checking: `npx tsc --noEmit`
   - Run unit tests if available
   - Run Monte Carlo smoke test (N≥3)

---

## Adding New Parameters

### Step 1: Choose Category

- **THRESHOLDS:** Critical boundaries, tipping points, crisis levels
- **RATES:** Monthly/yearly change rates, decay, growth
- **MULTIPLIERS:** Scaling factors, amplification, modifiers
- **BASELINES:** Starting values, reference points, pre-industrial values
- **TOLERANCES:** Floating point comparison precision

### Step 2: Add to centralConfig.ts

```typescript
export const THRESHOLDS = {
  // ... existing thresholds ...

  /**
   * Your new threshold description
   * @research Citation (Year) - Brief justification
   * @value X.X - Explanation of value
   */
  YOUR_NEW_THRESHOLD: 0.5,
} as const;
```

**JSDoc Requirements:**
- **@research:** Peer-reviewed source (2024-2025 preferred) or mark `[RESEARCH NEEDED]`
- **@value:** Numeric value and brief explanation
- Description paragraph explaining what this parameter controls

### Step 3: Add Validation (if needed)

If the parameter has specific constraints, add validation in `validateConfig.ts`:

```typescript
// Probability thresholds (must be [0, 1])
assertProbability(THRESHOLDS.YOUR_NEW_THRESHOLD, {
  location: 'validateSimulationConfig',
  valueName: 'THRESHOLDS.YOUR_NEW_THRESHOLD',
});
```

### Step 4: Update Usage

Replace all occurrences of the magic number with the new constant.

### Step 5: Document

If this is a commonly used pattern, add an example to this guide.

---

## Validation System

### Startup Validation

The config is validated ONCE at simulation startup (in `createDefaultInitialState()`):

```typescript
// initialization.ts
validateSimulationConfig(); // Fail-loudly if any parameter invalid
```

**What gets validated:**
- ✅ All probabilities in [0, 1]
- ✅ All rates are finite and non-negative
- ✅ All multipliers are positive
- ✅ All baselines are finite and positive (except PREINDUSTRIAL_TEMPERATURE = 0)
- ✅ Logical consistency (e.g., CRISIS < SEVERE < CATASTROPHIC)
- ✅ Threshold ordering (e.g., DANGEROUS < CATASTROPHIC < RUNAWAY)

**Failure Mode:**
```
❌ CONFIGURATION VALIDATION FAILED

THRESHOLDS validation failed: Error: ❌ Out-of-range value in validateSimulationConfig
   THRESHOLDS.CLIMATE_DANGEROUS_THRESHOLD (probability) = 15
   Valid range: [0, 1]

Fix these issues in src/simulation/config/centralConfig.ts before proceeding.
```

### Why Fail-Loudly?

**Research simulation rigor:** Invalid parameters indicate bugs, not runtime conditions.

**❌ DON'T do this:**
```typescript
// Silent fallback hides bugs
const threshold = THRESHOLDS.SOME_VALUE || 0.5;
```

**✅ DO this:**
```typescript
// Let validation catch invalid config at startup
const threshold = THRESHOLDS.SOME_VALUE;
```

---

## Common Patterns

### Climate Thresholds

```typescript
import { THRESHOLDS, BASELINES } from '@/simulation/config/centralConfig';

const tempAnomaly = currentTemp - BASELINES.PREINDUSTRIAL_TEMPERATURE;

if (tempAnomaly > THRESHOLDS.CLIMATE_RUNAWAY_THRESHOLD) {
  // Hothouse Earth pathway
} else if (tempAnomaly > THRESHOLDS.CLIMATE_CATASTROPHIC_THRESHOLD) {
  // Catastrophic warming
} else if (tempAnomaly > THRESHOLDS.CLIMATE_DANGEROUS_THRESHOLD) {
  // Dangerous warming
}
```

### Unemployment Crisis Detection

```typescript
import { THRESHOLDS } from '@/simulation/config/centralConfig';

if (unemployment > THRESHOLDS.UNEMPLOYMENT_SEVERE_CRISIS) {
  // Severe economic collapse
} else if (unemployment > THRESHOLDS.UNEMPLOYMENT_CRISIS) {
  // Crisis threshold
}
```

### Mortality Multipliers

```typescript
import { MULTIPLIERS } from '@/simulation/config/centralConfig';

const eliteMortality = baselineMortality / MULTIPLIERS.ELITE_SURVIVAL_MULTIPLIER;
const precariatMortality = baselineMortality / MULTIPLIERS.PRECARIAT_SURVIVAL_MULTIPLIER;
```

### Environmental Rates

```typescript
import { RATES } from '@/simulation/config/centralConfig';

biodiversity -= RATES.BIODIVERSITY_LOSS_RATE;
amrResistance += RATES.AMR_MONTHLY_INCREASE;
oceanPH -= RATES.OCEAN_ACIDIFICATION_RATE;
```

---

## Migration Status

### Completed (Phase 1 - Critical Mortality Paths)

**Files migrated:**
- ✅ `/src/simulation/qualityOfLife/mortality.ts`
  - `WATER_SECURITY_CRISIS_THRESHOLD` (0.4)
- ✅ `/src/simulation/economics.ts`
  - `UNEMPLOYMENT_CRISIS` (0.25)

**Parameters centralized:** 100+ in centralConfig.ts
**Migrated to code:** 5+ critical values

### Pending Migration (Phase 2 - High Impact)

**Priority HIGH (mortality/crisis paths):**
- [ ] Wet bulb temperature thresholds (wetBulbEvents.ts)
- [ ] Food security thresholds (famine systems)
- [ ] Climate catastrophe thresholds (climate impact phases)
- [ ] Radiation thresholds (nuclear winter, radiation system)
- [ ] AMR thresholds (antimicrobial resistance)

**Priority MEDIUM (economic/social):**
- [ ] Social cohesion thresholds
- [ ] Biodiversity collapse thresholds
- [ ] Tech risk thresholds
- [ ] Geopolitical escalation rates

**Priority LOW (UI/display):**
- [ ] Chart scaling factors
- [ ] Visualization thresholds

---

## Research Citation Standards

### Preferred Format

```typescript
/**
 * Description of parameter
 * @research Author (Year) - Source title
 * @value X.X - Explanation
 */
PARAMETER_NAME: X.X,
```

### Examples

**Good (Specific Citation):**
```typescript
/**
 * Wet bulb temperature threshold for human survival
 * @research Raymond et al. (2020) - 35°C WBT = 6-hour lethality
 * @value 35 - Absolute physiological limit
 */
WET_BULB_LETHAL_THRESHOLD: 35,
```

**Acceptable (General Source):**
```typescript
/**
 * Unemployment threshold for social crisis
 * @research ILO (2024) - Historical unemployment crisis levels
 * @value 0.25 - 25% unemployment triggers instability
 */
UNEMPLOYMENT_CRISIS: 0.25,
```

**Needs Improvement (Placeholder):**
```typescript
/**
 * Tech risk accumulation threshold for crisis
 * @research [RESEARCH NEEDED]
 * @value 0.7 - Placeholder
 */
TECH_RISK_CRISIS_THRESHOLD: 0.7,
```

### Finding Research

1. Check `/research/` directory for existing papers
2. Search Zotero library (single source of truth for academic sources)
3. Search recent literature (2024-2025 preferred)
4. If no research found, mark `[RESEARCH NEEDED]` and create research task

---

## Anti-Patterns

### ❌ DON'T: Use defensive fallbacks

```typescript
// Silent fallback hides bugs
const threshold = config.SOME_VALUE ?? 0.5;
```

**Why?** If config is invalid, validation should catch it at startup, not hide it at runtime.

### ❌ DON'T: Duplicate constants

```typescript
// Each file defining its own threshold
const WATER_CRISIS = 0.4; // mortality.ts
const WATER_THRESHOLD = 0.4; // qualityOfLife.ts
const WATER_LIMIT = 0.4; // environmental.ts
```

**Why?** Single source of truth principle - centralize in config.

### ❌ DON'T: Skip research citations

```typescript
/**
 * Some threshold
 * @value 0.5 - Seems reasonable
 */
SOME_THRESHOLD: 0.5,
```

**Why?** Research simulation requires research-backed values. Mark `[RESEARCH NEEDED]` if unknown.

### ❌ DON'T: Blindly replace ALL numbers

```typescript
// Loop counter (NOT a parameter)
for (let i = 0; i < 10; i++) { ... }

// Date year (NOT a parameter)
if (year === 2025) { ... }
```

**Why?** Not all numbers are parameters. Use judgment - centralize reused semantic values, not loop counters.

---

## Testing Strategy

### Unit Tests (File-Level)

```typescript
import { THRESHOLDS } from '@/simulation/config/centralConfig';

describe('Climate thresholds', () => {
  it('should use centralized climate thresholds', () => {
    expect(THRESHOLDS.CLIMATE_DANGEROUS_THRESHOLD).toBe(1.5);
    expect(THRESHOLDS.CLIMATE_CATASTROPHIC_THRESHOLD).toBe(2.0);
  });
});
```

### Integration Tests (Monte Carlo)

```bash
# Smoke test (N=3, 60 months)
npx tsx scripts/monteCarloSimulation.ts --runs=3 --max-months=60

# Full validation (N=10, 120 months)
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120
```

**Check for:**
- No NaN errors
- No assertion failures
- Outcome distributions within expected ranges (mortality 43-58%)

---

## Troubleshooting

### "Cannot find module '@/simulation/config/centralConfig'"

**Solution:** Verify import path is correct:
```typescript
import { THRESHOLDS } from '@/simulation/config/centralConfig';
```

Not:
```typescript
import { THRESHOLDS } from './config/centralConfig'; // ❌ Relative path
```

### "THRESHOLDS.X is not a valid key"

**Solution:** Check spelling and verify constant exists in centralConfig.ts.

### "Configuration validation failed"

**Cause:** Invalid parameter in centralConfig.ts

**Solution:** Read error message for specific parameter and fix in centralConfig.ts

**Example:**
```
❌ Climate threshold ordering violated:
   DANGEROUS (2.0°C) >= CATASTROPHIC (1.5°C)
   Expected: DANGEROUS < CATASTROPHIC < RUNAWAY
```

**Fix:** Swap values so ordering is correct.

---

## FAQ

### Q: Should I centralize ALL numeric literals?

**A:** No. Only centralize:
- Reused values (appears 3+ times)
- Semantic parameters (thresholds, rates, multipliers)
- Research-backed values

**Don't centralize:**
- Loop counters (`i = 0`)
- Array indices (`array[0]`)
- Date years in comments (`// 2025`)
- One-off calculations

### Q: What if I don't have a research citation?

**A:** Mark it:
```typescript
/**
 * Parameter description
 * @research [RESEARCH NEEDED]
 * @value X.X - Placeholder
 */
```

Then create a research task or use best engineering judgment.

### Q: Can I add parameters without research?

**A:** Yes, but:
1. Mark `[RESEARCH NEEDED]`
2. Add to research backlog
3. Prefer existing research when available

### Q: How do I update a parameter value?

**A:**
1. Find parameter in `/src/simulation/config/centralConfig.ts`
2. Update value and JSDoc citation
3. Run validation: `npx tsc --noEmit`
4. Run Monte Carlo smoke test (N≥3)
5. Commit with justification in commit message

### Q: Should I migrate existing files?

**A:** Migrate opportunistically:
- When fixing a bug in a file, migrate magic numbers you encounter
- When adding a feature, migrate related parameters
- When improving code quality, migrate the entire file

**Don't:** Stop all work to migrate everything at once.

---

## Related Documentation

- **Research Standards:** `/docs/DEVELOPMENT_WORKFLOW.md`
- **Assertion Utilities:** `/src/simulation/utils/assertions.ts`
- **Task Specification:** `/plans/week2_task_handoffs_20251106.md` (lines 36-200)
- **Emoji Conventions:** `/docs/EMOJI_SEMANTIC_MAP.md`

---

## Future Work

### Phase 2: Migration Expansion

**Target:** Migrate 50+ most-repeated magic numbers

**Approach:**
1. Use audit results from `/tmp/magic_number_analysis.txt`
2. Prioritize mortality/crisis paths (CRITICAL)
3. Then economic/social parameters (HIGH)
4. Then UI/display (MEDIUM)

### Phase 3: Auto-Migration Tool

**Goal:** Automated detection and migration of magic numbers

**Features:**
- AST-based detection of numeric literals
- Semantic clustering (group related values)
- Automated refactoring (with human review)

### Phase 4: Research Backfill

**Goal:** Replace all `[RESEARCH NEEDED]` placeholders with citations

**Process:**
1. Literature search (Zotero)
2. Parameter extraction
3. Validation against existing values
4. Update centralConfig.ts

---

**End of Guide**
