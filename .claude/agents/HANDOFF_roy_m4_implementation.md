# HANDOFF: M-4 Population Demographics Implementation

**Date:** 2025-11-28
**From:** Orchestrator
**To:** Roy (simulation-maintainer)
**Task:** Implement regional demographic calibration
**Priority:** MEDIUM (Quality Gate 1 passed)

## Objective

Implement validated demographic parameters to reduce population error from **+24.5% → <10%**.

**Prerequisites:** ✅ Cynthia's research complete, ✅ Sylvia's validation passed (Quality Gate 1)

## Input Files

1. **Research:** `research/population_demographics_regional_20251128.md` (Cynthia)
2. **Validation:** `reviews/m4_demographics_research_critique_20251128.md` (Sylvia)
3. **Current Code:** `src/simulation/populationDynamics.ts` (lines 33-200)

## Current State Analysis

**File:** `src/simulation/populationDynamics.ts`
**Function:** `initializeRegionalPopulations()` (lines 33-200)

**Current Implementation:**
- 7 regions with **static** baseline birth/death rates
- Total baseline: 7540M (should be 8120M for 2024)
- Rates set at initialization, never change over time
- No demographic transition modeled (1990→2024)

**Key Variables per Region:**
```typescript
baselineBirthRate: 0.010,  // Static annual rate
baselineDeathRate: 0.008,  // Static annual rate
adjustedBirthRate: 0.010,  // Can be modified by phases
adjustedDeathRate: 0.008,  // Can be modified by phases
fertilityRate: 1.3,        // Total Fertility Rate (children per woman)
```

## Implementation Options

### Option A: One-Time Recalibration (Simpler)

Update baseline values to better 2024 snapshot:
- Adjust `baselineBirthRate` / `baselineDeathRate` per region
- Adjust `baselinePopulation` to match UN 2024 data
- Keep static rates (no time evolution)

**Pros:** Simple, low risk, easier to validate
**Cons:** Won't capture 1990→2024 transition dynamics

### Option B: Time-Varying Rates (More Accurate)

Add temporal evolution to rates over simulation lifetime:
- Store 1990 baseline rates separately
- Implement rate decline functions (demographic transition)
- Apply rates that vary by year/month

**Pros:** Captures historical transition, more realistic
**Cons:** Complex, harder to debug, requires transition models

**Decision:** Use Cynthia's research recommendation (should be in document)

## Implementation Checklist

### 1. Update Regional Baselines

For each of 7 regions, update in `initializeRegionalPopulations()`:

```typescript
{
  name: 'East Asia',
  population: [FROM RESEARCH],           // 2024 UN benchmark
  baselinePopulation: [FROM RESEARCH],   // Same as population
  baselineBirthRate: [FROM RESEARCH],    // Calibrated rate
  baselineDeathRate: [FROM RESEARCH],    // Calibrated rate
  fertilityRate: [FROM RESEARCH],        // 2024 TFR
  // ... other fields unchanged
}
```

**Source:** Cynthia's parameter recommendations (table format expected)

### 2. Add Defensive Assertions

**CRITICAL:** No silent fallbacks. Use assertion utilities.

```typescript
import { assertFinite, assertInRange, assertProbability } from './utils/assertions';

// After calculating new rates
const birthRate = assertProbability(calculatedBirthRate, {
  location: 'updateDemographicRates',
  valueName: 'birthRate',
  month: state.currentMonth,
  additionalInfo: { region: region.name }
});

const population = assertFinite(region.population, {
  location: 'initializeRegionalPopulations',
  valueName: 'population',
  additionalInfo: { region: region.name }
});
```

**Why:** Previous bugs (HIGH-7) were masked by `?? fallback` patterns. Fail loudly.

### 3. Handle Time-Varying Rates (If Applicable)

If Cynthia recommends time-varying rates, add to `populationDynamics.ts`:

```typescript
/**
 * Apply demographic transition to birth/death rates
 * Rates decline over time according to historical 1990-2024 trends
 */
function applyDemographicTransition(
  region: RegionalPopulation,
  currentYear: number,
  rng: () => number
): void {
  const baseYear = 1990;
  const yearsElapsed = currentYear - baseYear;

  // Example: Linear decline (use research-backed function)
  const birthRateDecline = BIRTH_RATE_DECLINE_PER_YEAR[region.name];
  const newBirthRate = region.baselineBirthRate - (birthRateDecline * yearsElapsed);

  region.adjustedBirthRate = assertProbability(
    Math.max(0.005, newBirthRate),  // Floor to prevent negative
    { location: 'applyDemographicTransition', valueName: 'birthRate' }
  );
}
```

**Note:** Decline functions should come from research (linear, exponential, logistic?)

### 4. Update Population Provider

If baseline populations change, verify `src/simulation/populationProvider.ts` syncs correctly:

```typescript
// This should auto-sync from state.humanPopulationSystem.regionalPopulations
// Verify no hardcoded population values elsewhere
```

**Check:** Are there any hardcoded population constants? (grep for "7540" or "8120")

### 5. Add Migration (If Recommended)

If research says migration is material:

```typescript
interface RegionalPopulation {
  // ... existing fields
  netMigration: number;  // Annual net migration (millions, can be negative)
}

function applyMigration(region: RegionalPopulation, year: number): void {
  // Apply research-backed migration flows
  // Example: Europe +2M/yr refugees, US +1M/yr immigration
  region.population += region.netMigration / 12;  // Monthly
}
```

**Source:** Cynthia's migration flow table (if provided)

## Testing Strategy

### Phase 1: Type Safety
```bash
npx tsc --noEmit
```
✅ No type errors

### Phase 2: Unit Test
```bash
npm test -- populationDynamics.test.ts
```
✅ All existing tests pass
⚠️ Add new test: Population 2024 matches UN benchmarks

### Phase 3: Monte Carlo Validation
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_m4_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**N=10 runs, seed=42 (deterministic)**

**Success Criteria:**
- Population 2024: <10% error (from current 24.5%)
- Determinism: CV < 0.01% (all runs identical)
- Regional populations match UN benchmarks (±10%)

**Analysis Script:**
```bash
npx tsx scripts/analyzeMonteCarloResults.ts logs/mc_m4_validation_*.log
```

### Phase 4: Regression Check
```bash
# Ensure other calibrations not broken
npm test
```

✅ Temperature, biodiversity, other metrics still calibrated

## Edge Cases to Handle

### 1. Aging Populations (Europe, East Asia)
- Death rate increases over time (aging demographics)
- Birth rate already at floor (can't decline further)
- Handle population decline gracefully

### 2. High Fertility Regions (Sub-Saharan Africa)
- Birth rate still high in 2024
- Demographic transition incomplete
- Carrying capacity constraints

### 3. COVID-19 Mortality Spike (2020-2021)
- Should this be modeled as temporary or structural shift?
- Use research guidance (likely temporary)

### 4. Migration Flows
- If modeled: Ensure zero-sum (migration out of one region = into another)
- Avoid creating/destroying population via migration

## Common Pitfalls

### ❌ Silent Fallbacks
```typescript
// WRONG
const pop = region.population ?? 1000;  // Hides missing data

// CORRECT
const pop = assertFinite(region.population, {
  location: 'updatePopulation',
  valueName: 'population'
});
```

### ❌ TFR vs Birth Rate Confusion
- **TFR:** Children per woman (2.1 = replacement)
- **Birth Rate:** Annual births per 1000 people (~0.010 - 0.034)
- Don't confuse them!

### ❌ Age Structure Ignored
- Young population (Africa): Low death rate despite poor healthcare
- Old population (Europe): High death rate despite good healthcare
- Median age matters!

### ❌ Non-Determinism
- Avoid `Math.random()` - use RNG function
- Ensure iteration order is deterministic (no `for...in` on objects)

## Output

### 1. Code Changes
- `src/simulation/populationDynamics.ts` (updated regional baselines)
- Add tests if new logic (time-varying rates, migration)

### 2. Git Commit
```bash
git add src/simulation/populationDynamics.ts
git commit -m "$(cat <<'EOF'
feat(M-4): Regional demographic calibration (24.5% → <10% error target)

Implemented validated demographic parameters from UN WPP 2024:
- Updated regional baseline populations (7540M → 8120M)
- Calibrated birth/death rates for 7 regions
- [Time-varying rates added] OR [One-time recalibration]
- [Migration flows added if applicable]

Research: research/population_demographics_regional_20251128.md
Validation: reviews/m4_demographics_research_critique_20251128.md

Monte Carlo validation: [N=10, error TBD]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 3. Post to Implementation Channel
```markdown
**roy** | 2025-11-28 | [COMPLETED]

M-4 implementation complete:
- Regional baselines updated (7 regions)
- Birth/death rates calibrated
- [Time-varying/static decision]
- Monte Carlo validation: [results]
- Error reduction: 24.5% → [actual]%

Ready for architecture review (Quality Gate 2).
```

## Next Steps

1. **Roy:** Implement changes, run Monte Carlo validation
2. **Orchestrator:** Spawn architecture-skeptic (Quality Gate 2)
3. **Architecture Review:** Performance, state propagation check
4. **Documentation:** Wiki update, devlog entry

---

**Let the model show what it shows. No tuning for "fun", only research-backed values.**
