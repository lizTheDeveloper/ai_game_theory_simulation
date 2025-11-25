# Hindcast Initialization Fix (Nov 25, 2025)

## The Bug

`scripts/hindcastingValidation.ts` was using the WRONG initialization function:
- **Used:** `createDefaultInitialState(rng)` + hacky `modify1990State()`
- **Should use:** `initializeHistoricalSimulation(year, rng)`

### Why This Was a Critical Bug

The hacky `modify1990State()` function:
1. Set global population to 5.32B
2. BUT left regional populations at 2025 values (8.1B total)
3. Then `HumanPopulationPhase` aggregated regional → global
4. **OVERWROTE** the correct 5.32B with the wrong 8.1B

Result: Month 0 showed "Population: 5.32B" but Month 1+ showed 8.1B.

## The Proper Function

`initializeHistoricalSimulation()` in `src/simulation/historicalInitialization.ts`:
- Loads historical data from NOAA, UN, FAO, World Bank
- Sets temperature in BOTH required fields
- **Scales ALL regional populations** proportionally (7.4B → 5.3B for 1990)
- Applies FAO-verified food security by region
- Sets `config.startYear` for year tracking
- Comprehensive, research-backed calibrations

## The Fix

### 1. Created Synchronous Wrapper

Added `initializeHistoricalSimulation()` function to `historicalInitialization.ts`:
- Synchronous wrapper (data loaders are actually sync despite async signature)
- Can be called without await in validation scripts
- All the same calibrations as `createHistoricalInitialState()`

### 2. Updated Validation Script

`scripts/hindcastingValidation.ts` changes:
```typescript
// ❌ OLD (BROKEN)
import { createDefaultInitialState } from '../src/simulation/initialization';
...
const state = createDefaultInitialState(rng);
modify1990State(state);

// ✅ NEW (CORRECT)
import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
...
const state = initializeHistoricalSimulation(CONFIG.startYear, rng);
```

### 3. Deleted Hacky Function

Removed `modify1990State()` entirely - no longer needed.

## Verification

Created `scripts/verifyHistoricalInitialization.ts` to test:
```
--- INITIALIZATION STATE (Month 0) ---
Population (global): 5.320B
Population (regional sum): 5.320B
Deviation: 0.000000B
✅ Regional populations sum correctly

--- AFTER 1 SIMULATION STEP (Month 1) ---
Population (global): 5.320B
Population (regional sum): 5.320B
Deviation: 0.000000B
✅ Population aggregation working correctly

Population change: 0.0M
✅ Population remains stable near 5.32B

VERDICT: ✅ PASS
```

## Regional Population Scaling (1990)

The proper initialization scales each region:
```
Current total: 8136M (2025 baseline)
Target total: 5320M (1990 actual)
Scale factor: 0.654

East Asia: 1677M → 1097M
South Asia: 2048M → 1339M
Sub-Saharan Africa: 1220M → 798M
Europe: 742M → 485M
Latin America: 664M → 434M
North America: 380M → 248M
Middle East & North Africa: 583M → 381M
Southeast Asia: 698M → 456M
Central Asia: 78M → 51M
Oceania: 46M → 30M
```

Sum: 5320M = 5.32B ✅

## Why This Matters

Hindcasting validation REQUIRES correct initial conditions:
- Can't validate 1990→2024 trajectory if we start at 2025 population
- Regional scaling is critical for mortality, food security, migration
- FAO food security values (82% global, varying by region) set correct baseline
- Temperature initialization in both fields prevents climate system bugs

Without this fix, hindcast validation was **garbage data**.

## Files Changed

- ✅ `src/simulation/historicalInitialization.ts` - Added `initializeHistoricalSimulation()` wrapper
- ✅ `scripts/hindcastingValidation.ts` - Use proper function, delete hacky workaround
- ✅ `scripts/verifyHistoricalInitialization.ts` - New verification script

## Status

**FIXED.** Hindcast validation can now run with correct 1990 baseline.

Ready to run full 10-run Monte Carlo: `npx tsx scripts/hindcastingValidation.ts`
