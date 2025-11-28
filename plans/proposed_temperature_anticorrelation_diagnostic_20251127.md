# Temperature Anticorrelation Diagnostic Plan

**Date:** November 27, 2025
**Priority:** HIGH (H-6 from implementation channel)
**Status:** DIAGNOSTIC PLAN (Implementation pending)
**Estimated Effort:** 2-4 hours (investigation + fix)

---

## Problem Statement

**Observation:** Hindcast validation shows CO2 overshoots by 19% (462.8 ppm vs 389 ppm target) but temperature UNDERSHOOTS by 26.5% (0.72°C vs 0.98°C)

**Expected:** More CO2 → More warming (basic physics)
**Actual:** More CO2 → Less warming (WRONG SIGN - anticorrelation)

**Source:** Nov 26 implementation channel, resource crash investigation
- `reviews/resource_reserves_crash_root_cause_20251126.md`
- `reviews/resource_reserves_fix_summary_20251126.md`

---

## Hypotheses

### 1. Climate Sensitivity Too Low ❌ UNLIKELY
**Check:** Verify ECS value in use
- Expected: IPCC AR6 range [2.0-5.0°C], best estimate 3.0°C
- Actual: Need to check `state.uncertaintyParameters.equilibriumClimateSensitivity`

**Investigation:**
```typescript
// In resourceDepletion.ts, line ~1335
effectiveClimateSensitivity = state.uncertaintyParameters?.equilibriumClimateSensitivity ?? co2.climateSensitivity;
```

**Why unlikely:** Even ECS=1.0 would give positive correlation, just weaker. Anticorrelation impossible from low sensitivity alone.

### 2. Thermal Inertia Overcorrection ⚠️ POSSIBLE
**Check:** Verify thermal lag/damping mechanisms
- Hindcast mode uses 75% damping blend (line ~1462)
- Post-historical: `blendedTemp = equilibriumTemp * 0.75 + LAST_HISTORICAL_TEMP * 0.25`

**Potential bug:** If `equilibriumTemp` calculation is incorrect or reads stale CO2 value, damping could amplify the error

**Investigation:**
```typescript
// Line ~1363: equilibriumTemp = co2Doublings * effectiveClimateSensitivity
// Line ~1311: co2Doublings = Math.log2(co2.atmosphericCO2 / 280)
```

**Check:** Is `co2.atmosphericCO2` the value AFTER carbon sink updates, or BEFORE?

### 3. Missing CO2-Temperature Coupling 🔴 LIKELY ROOT CAUSE
**Check:** Phase execution order
- Temperature calculation happens in `resourceDepletion.ts` (updateCO2System function)
- But CO2 might be read BEFORE carbon sinks apply

**Phase order investigation needed:**
```bash
grep -n "updateCO2System\|updateResource\|carbon" src/simulation/engine/PhaseOrchestrator.ts
```

**Potential bug:** If temperature reads CO2 at beginning of month, but carbon sinks update CO2 at end of month, temperature lags by 1 month and appears anticorrelated during rapid changes.

### 4. Aerosol Cooling Overestimate ❓ UNKNOWN
**Check:** Are aerosol forcings being applied?
- No explicit aerosol variables in `resourceDepletion.ts` CO2 temperature calculation
- Aerosols might be in separate climate phase

**Investigation:** Search for sulfate/aerosol/cooling in climate phases

### 5. Temperature Overwrite by Another Phase 🔴 VERY LIKELY
**Check:** Does any other phase modify `state.resourceEconomy.co2.temperatureAnomaly`?

**Investigation:**
```bash
grep -r "temperatureAnomaly.*=" src/simulation/**/*.ts | grep -v resourceDepletion.ts
```

**Found:**
- `techTree/effectsEngine.ts:899` - Sets temperatureAnomaly!
- `techTree/effectsEngine.ts:916` - Sets temperatureAnomaly!

**CRITICAL:** Tech effects engine is overwriting temperature. This could be the root cause if:
- Tech deployment reduces temperature (geoengineering)
- But CO2 continues rising from emissions
- Result: Anticorrelation

---

## Diagnostic Script

**Create:** `scripts/temperatureAnticorrelationDiagnostic.ts`

```typescript
/**
 * Temperature Anticorrelation Diagnostic
 *
 * Traces temperature and CO2 through a hindcast run to identify where correlation breaks.
 *
 * Expected output:
 * - Month-by-month CO2 and temperature values
 * - Phase-by-phase modifications to both
 * - Correlation coefficient calculation
 * - Identification of which phase causes anticorrelation
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';
import { setDeterministicRng } from '../src/simulation/utils/deterministicRng';

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

async function runDiagnostic() {
  console.log('\n🔬 TEMPERATURE ANTICORRELATION DIAGNOSTIC\n');

  const rng = createSeededRng(42100);
  setDeterministicRng(rng);

  const state = await initializeHistoricalSimulation(1990, rng);
  const engine = new SimulationEngine();

  console.log('Simulating 1990-2010 (240 months)...\n');
  console.log('Month | CO2 (ppm) | Temp (°C) | ΔCO2 | ΔTemp | Correlation Check');
  console.log('-'.repeat(80));

  let prevCO2 = state.resourceEconomy.co2.atmosphericCO2;
  let prevTemp = state.resourceEconomy.co2.temperatureAnomaly;

  for (let month = 1; month <= 240; month++) {
    engine.step(state, rng);

    const co2 = state.resourceEconomy.co2.atmosphericCO2;
    const temp = state.resourceEconomy.co2.temperatureAnomaly;
    const deltaCO2 = co2 - prevCO2;
    const deltaTemp = temp - prevTemp;

    // Check for anticorrelation (opposite signs)
    const anticorrelated = (deltaCO2 > 0 && deltaTemp < 0) || (deltaCO2 < 0 && deltaTemp > 0);
    const flag = anticorrelated ? ' ⚠️ ANTICORRELATION' : '';

    if (month % 12 === 0 || anticorrelated) {
      console.log(
        `${month.toString().padStart(4)} | ` +
        `${co2.toFixed(2).padStart(9)} | ` +
        `${temp.toFixed(3).padStart(9)} | ` +
        `${deltaCO2.toFixed(3).padStart(6)} | ` +
        `${deltaTemp.toFixed(4).padStart(7)}${flag}`
      );
    }

    prevCO2 = co2;
    prevTemp = temp;
  }

  console.log('\n📊 FINAL STATE (Month 240 = Year 2010):');
  console.log(`  CO2: ${state.resourceEconomy.co2.atmosphericCO2.toFixed(2)} ppm`);
  console.log(`  Temperature: ${state.resourceEconomy.co2.temperatureAnomaly.toFixed(3)}°C`);
  console.log(`  Target CO2: 389 ppm (Keeling curve)`);
  console.log(`  Target Temp: ~0.98°C (NASA GISS)`);
}

runDiagnostic().catch(console.error);
```

---

## Investigation Steps

### Step 1: Run Diagnostic Script
```bash
npx tsx scripts/temperatureAnticorrelationDiagnostic.ts > logs/temp_anticorr_diagnostic_$(date +%Y%m%d_%H%M%S).log
```

**Expected output:** Identify which months show anticorrelation and magnitude

### Step 2: Check Tech Effects Engine Overwrites
```bash
grep -A 20 "temperatureAnomaly.*=" src/simulation/techTree/effectsEngine.ts
```

**Question:** Is geoengineering tech being deployed that reduces temperature?

### Step 3: Check Phase Execution Order
```bash
grep -n "ResourceEconomy\|TechDeployment\|Climate" src/simulation/engine/PhaseOrchestrator.ts
```

**Question:** Does temperature calculation happen before or after tech deployment?

### Step 4: Verify CO2 Update Timing
Add debug logging:
```typescript
// In resourceDepletion.ts, before line 1244
console.log(`  [BEFORE CO2 UPDATE] atmosphericCO2: ${co2.atmosphericCO2}, temp: ${co2.temperatureAnomaly}`);
// After line 1511
console.log(`  [AFTER TEMP UPDATE] atmosphericCO2: ${co2.atmosphericCO2}, temp: ${co2.temperatureAnomaly}`);
```

---

## Expected Root Cause (Best Guess)

**Hypothesis:** Tech effects engine (`effectsEngine.ts:899, 916`) is overwriting temperature AFTER resourceDepletion calculates it from CO2.

**Mechanism:**
1. `resourceDepletion.ts` calculates temperature from CO2 → temp increases
2. Tech deployment phase runs later
3. Geoengineering tech (solar radiation management, aerosol injection) reduces temperature
4. Result: CO2 up, temperature down (anticorrelation)

**If correct:** Not a bug, but missing coordination between natural climate forcing and tech interventions. Temperature should be:
```
temp = naturalTemp(CO2) + techCooling(deployedGeoengineering)
```

But currently:
```
temp = techCooling(deployedGeoengineering)  // Overwrites natural temp!
```

**Fix:** Change tech effects to be ADDITIVE, not OVERWRITE:
```typescript
// effectsEngine.ts line 899 (BEFORE)
gameState.resourceEconomy.co2.temperatureAnomaly = Math.max(...);

// effectsEngine.ts line 899 (AFTER)
gameState.resourceEconomy.co2.temperatureAnomaly += coolingEffect;  // Add, don't replace
```

---

## Next Steps (For simulation-maintainer)

1. **Run diagnostic script** - Identify exact months with anticorrelation
2. **Review effectsEngine.ts** - Check if geoengineering techs overwrite temperature
3. **If overwrite confirmed:**
   - Change tech effects to be additive
   - Add assertions to ensure temperature never goes negative
   - Validate with Monte Carlo (N=10)
4. **If not an overwrite:**
   - Check phase execution order
   - Verify CO2 update timing
   - Add detailed logging to trace CO2→temp calculation

---

## Owner

**Assign to:** Roy (simulation-maintainer)
**Priority:** HIGH (blocking hindcast validation credibility)
**Blocking:** C-3, C-4 validation (can't trust temperature if it's anticorrelated with CO2)

---

## References

- Implementation channel: Nov 26, 2025 messages
- `reviews/resource_reserves_crash_root_cause_20251126.md`
- `reviews/resource_reserves_fix_summary_20251126.md`
- IPCC AR6 WG1: Equilibrium Climate Sensitivity [2.0-5.0°C]
- NASA GISS: Historical temperature data 1990-2024
