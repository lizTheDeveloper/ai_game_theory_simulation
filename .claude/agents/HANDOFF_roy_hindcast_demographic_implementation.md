# Handoff: Hindcast Demographic Tuning - Implementation

**To:** simulation-maintainer (Roy)
**From:** orchestrator-1
**Date:** 2025-12-09
**Priority:** MEDIUM
**Workflow:** Phase 2 (Implementation)

---

## Context

**Feature:** Hindcast Demographic Transition Tuning
**Quality Gate 1:** ✅ CONDITIONAL PASS (Research Grade B)
**Research File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/regional_death_rates_unwpp2024_20251209.md`
**Validation File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/hindcast_demographic_research_critique_20251209.md`

**Problem:**
- Population overshoot 6-10% in 2010-2020 (~500M too many people by 2020)
- Current model: Regional birth rates BUT global death rates
- Regional death rates varied significantly 1990-2020

**Solution:**
Add region-specific historical death rate curves parallel to existing birth rate implementation.

**Expected Impact:**
Reduce 2020 overshoot from +10.3% to target 5-7% (realistic) or <5% (optimistic).

---

## Your Task

Implement `getRegionalHistoricalDeathRate()` function and integrate into `regionalPopulations.ts`.

### Files to Modify:

1. **`src/simulation/engine/phases/BaselineMortalityPhase.ts`**
   - Add `REGIONAL_HISTORICAL_CDR` data structure
   - Implement `getRegionalHistoricalDeathRate(regionName, year)` function
   - Parallel structure to existing `getRegionalHistoricalBirthRate()`

2. **`src/simulation/regionalPopulations.ts`**
   - Integrate regional CDR in historical mode (1990-2020)
   - Add diagnostic logging
   - Add assertions to prevent NaN

### Implementation Details:

See below for complete specification.

---

## Regional CDR Data (Midpoint Estimates - Grade B)

**IMPORTANT:** These are midpoint estimates from trend data (Grade B research). Add TODO comments to extract exact UN WPP 2024 CSV values before final validation.

```typescript
/**
 * Regional historical crude death rates (deaths per 1,000 population)
 *
 * Source: UN World Population Prospects 2024, World Bank, WHO
 * Research: research/regional_death_rates_unwpp2024_20251209.md (Grade B)
 * Validation: reviews/hindcast_demographic_research_critique_20251209.md
 *
 * NOTE: Current values are midpoint estimates from trend data.
 * TODO: Extract exact values from UN WPP 2024 CSV downloads before final validation.
 *
 * @see https://population.un.org/wpp/downloads
 */
const REGIONAL_HISTORICAL_CDR: Record<string, Record<number, number>> = {
  "Sub-Saharan Africa": {
    1990: 15.5,  // Range 15-16, ~47% decline to 2020
    1995: 14.5,  // HIV/AIDS epidemic period
    2000: 14.5,  // HIV/AIDS peak
    2005: 12.5,  // ARVT rollout begins
    2010: 10.5,  // Continued health improvements
    2015: 9.5,   // Demographic transition acceleration
    2020: 8.7,   // World Bank 2022: 8.82
    2025: 8.2    // Projected continued decline
  },
  "Europe": {
    1990: 10.5,  // Stable period
    1995: 10.5,  // Aging beginning
    2000: 10.5,  // Continued aging
    2005: 10.5,  // Slight increase trend
    2010: 10.5,  // Population aging
    2015: 11.0,  // Aging acceleration
    2020: 11.0,  // Pre-COVID baseline (NOT 2021 spike of 13)
    2025: 11.5   // Projected aging effect
  },
  "East Asia": {
    1990: 7.5,   // Post-demographic transition
    1995: 7.5,   // Stable period
    2000: 7.0,   // Continued stability
    2005: 7.0,   // Low mortality plateau
    2010: 7.0,   // Aging begins
    2015: 7.5,   // Aging acceleration (Japan, China)
    2020: 7.5,   // Aging effect visible
    2025: 8.5    // Projected rapid aging
  },
  "South Asia": {
    1990: 10.5,  // Mid-demographic transition
    1995: 9.5,   // Health improvements
    2000: 9.0,   // Continued decline
    2005: 8.5,   // Economic growth period
    2010: 8.0,   // Mortality decline acceleration
    2015: 7.5,   // Sustained improvements
    2020: 7.0,   // Approaching developed levels
    2025: 6.5    // Projected continued improvement
  },
  "North America": {
    1990: 8.5,   // Stable developed region
    1995: 8.5,   // Slight decline
    2000: 8.5,   // Stable period
    2005: 8.0,   // Continued stability
    2010: 8.0,   // Low plateau
    2015: 8.5,   // Aging begins to show
    2020: 8.5,   // Pre-COVID baseline
    2025: 8.5    // Projected
  },
  "Latin America": {
    1990: 7.5,   // Post-transition in Southern Cone
    1995: 7.0,   // Declining trend
    2000: 6.5,   // Continued improvement
    2005: 6.5,   // Stable period
    2010: 6.0,   // Low mortality achieved
    2015: 6.0,   // Sustained low rates
    2020: 6.5,   // Pre-COVID baseline
    2025: 6.5    // Projected
  },
  "MENA": {
    1990: 8.5,   // Oil wealth → good health systems
    1995: 7.5,   // Declining trend
    2000: 7.0,   // Continued improvement
    2005: 6.5,   // Low mortality achieved
    2010: 6.5,   // Conflict effects in some areas
    2015: 6.5,   // Syrian war impact (localized)
    2020: 6.5,   // Mixed patterns
    2025: 6.5    // Projected
  },
  "Southeast Asia": {
    1990: 8.5,   // Mid-transition
    1995: 8.0,   // Rapid development period
    2000: 7.5,   // Health improvements
    2005: 7.0,   // Continued progress
    2010: 6.5,   // Economic growth effect
    2015: 6.5,   // Sustained low rates
    2020: 6.5,   // Pre-COVID baseline
    2025: 6.5    // Projected
  },
  "Central Asia": {
    // NOTE: LOW-MEDIUM data quality (Soviet collapse effects)
    // Small population (~1% global), acceptable uncertainty
    1990: 8.0,   // Soviet health system legacy
    1995: 9.5,   // Post-Soviet collapse → health crisis
    2000: 9.5,   // Economic depression effect
    2005: 9.0,   // Gradual recovery
    2010: 8.5,   // Improving trend
    2015: 8.0,   // Economic stabilization
    2020: 8.0,   // Recovery to 1990 levels
    2025: 8.0    // Projected
  },
  "Oceania": {
    1990: 7.5,   // Developed (AUS/NZ) dominates
    1995: 7.5,   // Stable period
    2000: 7.0,   // Slight decline
    2005: 7.0,   // Stable
    2010: 7.0,   // Aging begins
    2015: 7.5,   // Aging effect
    2020: 7.5,   // Pre-COVID baseline
    2025: 7.5    // Projected
  }
};
```

---

## Function Implementation

```typescript
/**
 * Get region-specific historical crude death rate (CDR)
 *
 * Parallel implementation to getRegionalHistoricalBirthRate().
 * Uses linear interpolation between data points.
 *
 * @param regionName - Name of the region (must match REGIONAL_HISTORICAL_CDR keys)
 * @param year - Calendar year (1990-2025)
 * @returns Crude death rate (deaths per 1,000 population per year)
 *
 * @throws Error if regionName not found
 * @throws Error if year outside valid range
 */
export function getRegionalHistoricalDeathRate(
  regionName: string,
  year: number
): number {
  // Validate inputs
  if (!REGIONAL_HISTORICAL_CDR[regionName]) {
    throw new Error(
      `❌ CRITICAL: Region '${regionName}' not found in REGIONAL_HISTORICAL_CDR. ` +
      `Available regions: ${Object.keys(REGIONAL_HISTORICAL_CDR).join(', ')}`
    );
  }

  const regionalData = REGIONAL_HISTORICAL_CDR[regionName];
  const availableYears = Object.keys(regionalData).map(Number).sort((a, b) => a - b);

  // Year range validation
  const minYear = availableYears[0];
  const maxYear = availableYears[availableYears.length - 1];

  if (year < minYear || year > maxYear) {
    throw new Error(
      `❌ CRITICAL: Year ${year} outside valid range [${minYear}, ${maxYear}] ` +
      `for region '${regionName}'`
    );
  }

  // Exact match (data point year)
  if (regionalData[year] !== undefined) {
    const cdr = regionalData[year];

    // Defensive assertion
    if (!Number.isFinite(cdr) || cdr < 0 || cdr > 50) {
      throw new Error(
        `❌ CRITICAL: Invalid CDR value ${cdr} for region '${regionName}' year ${year}. ` +
        `Expected finite number in [0, 50] deaths per 1000.`
      );
    }

    return cdr;
  }

  // Linear interpolation between surrounding data points
  let lowerYear = availableYears[0];
  let upperYear = availableYears[availableYears.length - 1];

  for (let i = 0; i < availableYears.length - 1; i++) {
    if (availableYears[i] <= year && year < availableYears[i + 1]) {
      lowerYear = availableYears[i];
      upperYear = availableYears[i + 1];
      break;
    }
  }

  const lowerCDR = regionalData[lowerYear];
  const upperCDR = regionalData[upperYear];

  // Linear interpolation formula
  const fraction = (year - lowerYear) / (upperYear - lowerYear);
  const interpolatedCDR = lowerCDR + fraction * (upperCDR - lowerCDR);

  // Defensive assertion on interpolated result
  if (!Number.isFinite(interpolatedCDR) || interpolatedCDR < 0 || interpolatedCDR > 50) {
    throw new Error(
      `❌ CRITICAL: Interpolation produced invalid CDR ${interpolatedCDR} ` +
      `for region '${regionName}' year ${year}. ` +
      `Lower: ${lowerCDR} (${lowerYear}), Upper: ${upperCDR} (${upperYear})`
    );
  }

  return interpolatedCDR;
}
```

---

## Integration into regionalPopulations.ts

**Current logic (uses global CDR):**

```typescript
// Current implementation (BEFORE)
const deathRate = HISTORICAL_CDR[year] || globalAverage;
const deaths = population * deathRate;
```

**New logic (uses regional CDR in historical mode):**

```typescript
// New implementation (AFTER)
import { getRegionalHistoricalDeathRate } from './phases/BaselineMortalityPhase';

// In regional population update function:
const currentYear = Math.floor(state.currentMonth / 12) + 1990;

let deathRate: number;

if (currentYear <= 2020) {
  // Historical mode: Use region-specific CDR
  const regionalCDR = getRegionalHistoricalDeathRate(region.name, currentYear);
  deathRate = regionalCDR / 1000;  // Convert from per 1,000 to decimal

  // Diagnostic logging (optional, for validation)
  if (state.currentMonth % 12 === 0) {  // Log once per year
    console.log(
      `  📊 Regional CDR: ${region.name} ${currentYear} = ${regionalCDR.toFixed(2)}/1000`
    );
  }
} else {
  // Projection mode: Use existing mortality model
  // (age-structure aware, health improvements, etc.)
  deathRate = calculateProjectedMortalityRate(state, region);
}

// Calculate deaths
const deaths = population * deathRate;

// Defensive assertion
if (!Number.isFinite(deaths) || deaths < 0) {
  throw new Error(
    `❌ CRITICAL: Invalid deaths calculated for ${region.name} year ${currentYear}. ` +
    `Population: ${population}, DeathRate: ${deathRate}, Deaths: ${deaths}`
  );
}
```

---

## Defensive Coding Checklist

✅ **Input validation:**
- Region name must exist in REGIONAL_HISTORICAL_CDR
- Year must be in valid range [1990, 2025]

✅ **Output validation:**
- CDR must be finite, non-negative, <50 per 1,000 (sanity check)
- Interpolated values validated same as data points
- Deaths must be finite, non-negative

✅ **Error messages:**
- Clear, actionable error messages with context
- Include region name, year, expected ranges
- Use ❌ emoji for CRITICAL errors (consistent with project convention)

✅ **No silent fallbacks:**
- NO `?? defaultValue` patterns
- NO `isNaN(x) ? fallback : x` patterns
- Fail loudly if data missing or invalid

✅ **Diagnostic logging:**
- Optional annual logging for validation (can be removed after testing)
- Shows regional CDR values being applied
- Use 📊 emoji for data/metrics logging

---

## Testing Strategy

### Unit Tests (Optional but Recommended)

```typescript
// tests/simulation/phases/BaselineMortalityPhase.test.ts

describe('getRegionalHistoricalDeathRate', () => {
  it('should return exact value for data point years', () => {
    expect(getRegionalHistoricalDeathRate('Sub-Saharan Africa', 1990)).toBe(15.5);
    expect(getRegionalHistoricalDeathRate('Europe', 2020)).toBe(11.0);
  });

  it('should interpolate between data points', () => {
    // 1990: 15.5, 1995: 14.5 → 1993: should be ~14.9
    const cdr1993 = getRegionalHistoricalDeathRate('Sub-Saharan Africa', 1993);
    expect(cdr1993).toBeCloseTo(14.9, 1);
  });

  it('should throw error for invalid region', () => {
    expect(() => getRegionalHistoricalDeathRate('Invalid Region', 2000))
      .toThrow('not found in REGIONAL_HISTORICAL_CDR');
  });

  it('should throw error for year out of range', () => {
    expect(() => getRegionalHistoricalDeathRate('Europe', 1980))
      .toThrow('outside valid range');
  });

  it('should return finite values for all regions and years', () => {
    const regions = Object.keys(REGIONAL_HISTORICAL_CDR);
    const years = [1990, 2000, 2010, 2020];

    regions.forEach(region => {
      years.forEach(year => {
        const cdr = getRegionalHistoricalDeathRate(region, year);
        expect(Number.isFinite(cdr)).toBe(true);
        expect(cdr).toBeGreaterThan(0);
        expect(cdr).toBeLessThan(50);
      });
    });
  });
});
```

### Integration Test (Run Hindcast)

```bash
# After implementation, run short hindcast to verify no crashes
# Full validation will be done by Priya in Phase 3

npx tsx scripts/hindcastValidation.ts --years 1990-2000 --quick
```

**Expected output:**
- No NaN errors
- Regional CDR values logged (if diagnostic logging enabled)
- Population trajectories roughly match historical (precision validation in Phase 3)

---

## Success Criteria

### Code Quality:
- ✅ Function parallel to `getRegionalHistoricalBirthRate()` structure
- ✅ Linear interpolation matches existing approach
- ✅ Defensive assertions prevent NaN
- ✅ Clear error messages with context
- ✅ TODO comments for exact value extraction

### Integration:
- ✅ Regional CDR applied in historical mode (1990-2020)
- ✅ Existing projection model used post-2020
- ✅ No regressions (existing tests still pass)

### Documentation:
- ✅ Inline comments cite UN WPP 2024 sources
- ✅ Data quality noted (Grade B, midpoint estimates)
- ✅ TODO comments for CSV extraction before final validation

---

## Next Steps After Your Implementation

1. **Commit your changes:**
   ```bash
   git add src/simulation/engine/phases/BaselineMortalityPhase.ts
   git add src/simulation/regionalPopulations.ts
   git commit -m "feat: Add regional historical death rates for hindcast tuning

   - Implement getRegionalHistoricalDeathRate() with UN WPP 2024 data
   - Integrate regional CDR into regionalPopulations.ts (historical mode)
   - Add defensive assertions and input validation
   - Use midpoint estimates (Grade B research, TODO: exact CSV values)

   Expected impact: Reduce 2020 population overshoot from +10.3% to 5-7%

   Research: research/regional_death_rates_unwpp2024_20251209.md
   Validation: reviews/hindcast_demographic_research_critique_20251209.md"
   ```

2. **Handoff to Priya** for Monte Carlo validation:
   - Run hindcast 1990-2020, N≥10
   - Target: 2020 overshoot reduces to 5-7%
   - Check determinism: CV < 0.01%

3. **If validation successful:**
   - Extract exact UN WPP 2024 CSV values
   - Replace midpoint estimates
   - Re-run validation (should achieve <5% if data more precise)

4. **If validation shows gaps:**
   - Investigate secondary factors (birth rate precision, migration, age structure)
   - May need additional research/implementation

---

## Reference Files

- **Research:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/regional_death_rates_unwpp2024_20251209.md`
- **Validation:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/hindcast_demographic_research_critique_20251209.md`
- **Change Proposal:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/openspec/changes/hindcast-demographic-tuning/proposal.md`
- **Existing Birth Rate Implementation:** `src/simulation/engine/phases/BaselineMortalityPhase.ts` (getRegionalHistoricalBirthRate)

---

**Ready to implement?** Post to the `implementation` channel when complete.
