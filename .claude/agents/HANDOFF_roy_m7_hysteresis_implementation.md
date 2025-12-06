# Implementation Handoff: M-7 Climate Hysteresis
**Date:** 2025-12-05
**From:** Orchestrator (after Sylvia validation)
**To:** Roy (simulation-maintainer)
**Feature:** M-7 (Climate Hysteresis) - Implementation Phase
**Priority:** MEDIUM (TIER 3 roadmap item)

## Quality Gate 1: PASSED ✅

Sylvia's validation: **CONDITIONAL PASS** with conservative parameters recommended.

**Review File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/climate_hysteresis_critique_20251205.md`
**Research File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/climate_hysteresis_20251205.md`

## Problem Statement

**Current Behavior (BUG):**
Tipping points are reversible - if temperature drops below trigger threshold, the system could theoretically recover instantly. This is **physically incorrect**.

**Research-Backed Reality:**
Climate tipping points exhibit strong **hysteresis**: recovery thresholds are MUCH LOWER than crossing thresholds. Some elements may be irreversible on human timescales.

**Example (West Antarctic Ice Sheet):**
- Crosses at +2.0°C warming
- Only recovers if temperature falls below -1.0°C (pre-industrial!)
- **Hysteresis gap:** 3.0°C
- **Implication:** Even aggressive mitigation may not reverse damage

## Implementation Scope

### Core Mechanism: Bidirectional State Transitions

**Current (Unidirectional):**
```
State: NOT_TRIGGERED → triggered=true → progress 0.0→1.0 (sigmoid)
```

**New (Bidirectional with Hysteresis):**
```
States:
  - NOT_TRIGGERED: Element never crossed threshold
  - TRIGGERED_PROGRESSING: Crossed threshold, transitioning to new state
  - FULLY_TIPPED: Progress = 1.0, irreversible damage done
  - RECOVERING: Temperature dropped below recovery threshold, reversing
  - RECOVERED: Returned to near-original state (with asymptotic floor)

Transitions:
  - NOT_TRIGGERED → TRIGGERED_PROGRESSING: temp >= triggerTempC
  - TRIGGERED_PROGRESSING → FULLY_TIPPED: progress >= 1.0
  - FULLY_TIPPED → RECOVERING: temp < recoveryTempC (hysteresis gap!)
  - RECOVERING → RECOVERED: progress <= minimumAsymptoticValue
  - RECOVERED → TRIGGERED_PROGRESSING: temp >= triggerTempC (can re-tip)
```

### Required Type Changes

#### 1. Add Recovery Threshold to TippingElement

**File:** `src/types/tipping-points.ts`

```typescript
export interface TippingElement {
  // ... existing fields ...
  triggerTempC: number;  // Crossing threshold (already exists)

  // === HYSTERESIS PARAMETERS (M-7, Dec 2025) ===
  /**
   * Recovery threshold: temperature must fall BELOW this to begin recovery
   * Research: Garbe et al. (2020) - ice sheets recover at much lower temps
   *
   * recoveryTempC < triggerTempC (hysteresis gap)
   *
   * If undefined, element is irreversible (AMOC in some models)
   */
  recoveryTempC?: number;  // NEW FIELD

  /**
   * Hysteresis gap in degrees C (triggerTempC - recoveryTempC)
   * Derived for logging/visualization, not used in logic
   */
  hysteresisGapC?: number;  // NEW FIELD (optional, for display)

  // ... existing recovery parameters ...
  recoveryHalfLife?: number;         // Already exists (Nov 22, 2025)
  minimumAsymptoticValue?: number;    // Already exists (irreversibility floor)
}
```

#### 2. Add Tipping Element State Enum

**File:** `src/types/tipping-points.ts`

```typescript
/**
 * State machine for tipping element transitions with hysteresis
 * Research: Garbe et al. (2020), Drüke et al. (2024)
 */
export enum TippingElementState {
  NOT_TRIGGERED = 'not_triggered',
  PROGRESSING = 'progressing',        // Transitioning after crossing
  FULLY_TIPPED = 'fully_tipped',      // Complete transition (progress = 1.0)
  RECOVERING = 'recovering',          // Reversing after temp drop
  RECOVERED = 'recovered'             // Returned to floor state
}

export interface TippingElement {
  // ... existing fields ...

  /** Current state in hysteresis state machine (M-7, Dec 2025) */
  state?: TippingElementState;  // NEW FIELD (default: NOT_TRIGGERED)
}
```

### Implementation Tasks

#### Task 1: Update TIPPING_ELEMENTS Data (High Priority)

**File:** `src/types/tipping-points.ts` (lines 118-267)

Add `recoveryTempC` to each element based on Sylvia's confidence ratings:

**HIGH CONFIDENCE (implement these):**
```typescript
{
  id: 'wais',
  triggerTempC: 2.0,
  recoveryTempC: -1.0,  // 3.0°C hysteresis gap (Garbe 2020)
  hysteresisGapC: 3.0,
  // ... existing fields ...
},
{
  id: 'greenland',
  triggerTempC: 1.6,
  recoveryTempC: -0.9,  // 2.5°C hysteresis gap (Garbe 2020)
  hysteresisGapC: 2.5,
  // ... existing fields ...
},
{
  id: 'permafrost',
  triggerTempC: 1.8,
  recoveryTempC: 1.8,   // NO hysteresis for permafrost AREA (ESD 2025)
  hysteresisGapC: 0.0,  // Area is reversible, carbon is not (via minimumAsymptoticValue)
  // ... existing fields with minimumAsymptoticValue: 0.20 ...
}
```

**MODERATE CONFIDENCE (conservative estimates):**
```typescript
{
  id: 'amoc',
  triggerTempC: 4.0,
  recoveryTempC: 3.0,   // 1.0°C gap (conservative, not "never recovers")
  hysteresisGapC: 1.0,  // Sylvia: contradictory literature, be conservative
  // ... existing fields ...
},
{
  id: 'amazon',
  triggerTempC: 2.3,
  recoveryTempC: 1.3,   // 1.0°C gap (limited quantitative data)
  hysteresisGapC: 1.0,
  // ... existing fields with recoveryHalfLife: 650, minimumAsymptoticValue: 0.25 ...
}
```

**REJECT (no hysteresis):**
```typescript
{
  id: 'arctic_ice',
  triggerTempC: 1.5,
  recoveryTempC: 1.5,   // NO hysteresis (Armstrong McKay: "seasonal event")
  hysteresisGapC: 0.0,
  // ... existing fields ...
}
```

#### Task 2: Implement State Machine in ClimateSystemPhase

**File:** `src/simulation/engine/phases/ClimateSystemPhase.ts`

**Current Logic (line 269-320):**
- `detectTippingThresholds()`: Checks if `currentTempC >= effectiveThreshold`, sets `triggered = true`
- `updateTippingTransitions()`: Increments progress via sigmoid curve

**New Logic (bidirectional):**

```typescript
private updateTippingElementStates(state: GameState, currentTempC: number, rng: RNGFunction): void {
  const system = state.tippingPointSystem;

  for (const element of system.elements) {
    const effectiveThreshold = this.getEffectiveThreshold(element);
    const recoveryThreshold = element.recoveryTempC ?? -Infinity; // If undefined, never recovers

    switch (element.state) {
      case TippingElementState.NOT_TRIGGERED:
        if (currentTempC >= effectiveThreshold) {
          this.transitionToProgressing(element, state, currentTempC);
        }
        break;

      case TippingElementState.PROGRESSING:
        this.updateProgress(element, state, rng);
        if (element.progress >= 1.0) {
          this.transitionToFullyTipped(element, state);
        }
        break;

      case TippingElementState.FULLY_TIPPED:
        // Check if temperature dropped below RECOVERY threshold (hysteresis!)
        if (currentTempC < recoveryThreshold) {
          this.transitionToRecovering(element, state, currentTempC);
        }
        break;

      case TippingElementState.RECOVERING:
        this.updateRecovery(element, state, rng);
        const floor = element.minimumAsymptoticValue ?? 0.0;
        if (element.progress <= floor) {
          this.transitionToRecovered(element, state);
        }
        // Check if temp rises again before recovery complete
        if (currentTempC >= effectiveThreshold) {
          this.transitionToProgressing(element, state, currentTempC);
        }
        break;

      case TippingElementState.RECOVERED:
        // Can re-trigger if temperature crosses threshold again
        if (currentTempC >= effectiveThreshold) {
          this.transitionToProgressing(element, state, currentTempC);
        }
        break;
    }
  }
}
```

**Helper Methods:**

```typescript
private transitionToProgressing(element: TippingElement, state: GameState, tempC: number): void {
  element.state = TippingElementState.PROGRESSING;
  element.triggered = true;  // Keep for backward compatibility
  element.monthsSinceTrigger = 0;

  // Log with hysteresis context
  const gap = element.hysteresisGapC ?? 0;
  if (gap > 0) {
    console.warn(`  🚨 TIPPING POINT: ${element.name}`);
    console.log(`     Trigger: ${element.triggerTempC}°C | Recovery: ${element.recoveryTempC}°C | Gap: ${gap.toFixed(1)}°C`);
    console.log(`     Current temp: ${tempC.toFixed(2)}°C`);
  }

  // Track in global system
  state.tippingPointSystem.triggers.push({
    elementId: element.id,
    monthTriggered: state.currentMonth,
    tempAtTrigger: tempC
  });
}

private transitionToRecovering(element: TippingElement, state: GameState, tempC: number): void {
  element.state = TippingElementState.RECOVERING;
  element.monthsSinceTrigger = 0;  // Reset counter for recovery phase

  console.log(`  🌱 RECOVERY BEGINS: ${element.name}`);
  console.log(`     Temp dropped to ${tempC.toFixed(2)}°C (below recovery threshold ${element.recoveryTempC}°C)`);
  console.log(`     Progress will decrease toward floor: ${(element.minimumAsymptoticValue ?? 0) * 100}%`);
}
```

#### Task 3: Update Recovery Dynamics

**Current:** `recoveryHalfLife` exists but isn't actively used in progress updates
**New:** Recovery should use exponential decay toward `minimumAsymptoticValue`

```typescript
private updateRecovery(element: TippingElement, state: GameState, rng: RNGFunction): void {
  element.monthsSinceTrigger++;

  const halfLife = element.recoveryHalfLife ?? 400;  // Default 400 years
  const floor = element.minimumAsymptoticValue ?? 0.0;

  // Exponential decay toward floor: progress(t) = floor + (1 - floor) * exp(-λt)
  // λ = ln(2) / halfLife (in years)
  const lambda = Math.log(2) / halfLife;
  const t_years = element.monthsSinceTrigger / 12;

  const newProgress = assertFinite(
    floor + (element.progress - floor) * Math.exp(-lambda * t_years),
    {
      location: 'ClimateSystemPhase.updateRecovery',
      valueName: 'newProgress',
      month: state.currentMonth,
      additionalInfo: { elementId: element.id, halfLife, floor, t_years }
    }
  );

  element.progress = Math.max(floor, newProgress);  // Never go below floor
}
```

#### Task 4: Add Temperature Commitment (Global Climate Property)

**Research:** Drüke et al. (2024) - 30% additional warming continues for 300+ years after forcings stabilize

**File:** Probably `ClimateSystemPhase.ts` or create new `TemperatureCommitmentPhase.ts`

**Implementation:**
- Track "committed warming" that continues even if emissions drop to zero
- Use exponential decay with 300-year timescale
- This is SEPARATE from tipping point hysteresis (global property)

**Defer to later if complex** - focus on tipping point hysteresis first.

### Defensive Coding Requirements

**YOU ARE ROY - defensive coding is your specialty.**

1. ✅ **Use assertion utilities:**
```typescript
const recoveryThreshold = assertStateProperty(element, 'recoveryTempC', {
  location: 'updateTippingElementStates',
  month: state.currentMonth
});
```

2. ✅ **No silent fallbacks:**
```typescript
// ❌ BAD
const recoveryTemp = element.recoveryTempC ?? element.triggerTempC;

// ✅ GOOD
if (!element.recoveryTempC && element.hysteresisGapC && element.hysteresisGapC > 0) {
  throw new Error(`❌ Element ${element.id} has hysteresis gap but no recoveryTempC`);
}
```

3. ✅ **Fail-loudly for invalid states:**
```typescript
if (element.recoveryTempC && element.recoveryTempC >= element.triggerTempC) {
  throw new Error(`❌ INVALID: ${element.id} recovery threshold (${element.recoveryTempC}) >= trigger threshold (${element.triggerTempC}). Hysteresis requires recovery < trigger.`);
}
```

4. ✅ **RNG must be required, never optional:**
```typescript
// ❌ BAD
function updateProgress(rng?: () => number) { ... }

// ✅ GOOD
function updateProgress(rng: () => number) {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }
}
```

5. ✅ **Emoji conventions:**
- 🚨 Tipping point crossed
- 🌱 Recovery begins
- ⚠️ Warning about hysteresis state
- ❌ Errors

### Testing Requirements

**Unit Tests (create or update):**
1. `tipping-points.test.ts`: Verify hysteresis gaps are valid (recovery < trigger)
2. `ClimateSystemPhase.test.ts`: Test state transitions (NOT_TRIGGERED → PROGRESSING → FULLY_TIPPED → RECOVERING)
3. Test edge case: Temperature oscillates around recovery threshold
4. Test irreversible elements (recoveryTempC undefined)

**Monte Carlo Validation (REQUIRED):**
Run N≥10 Monte Carlo simulations to verify:
1. **Path-dependence:** Same peak temperature via different paths = different outcomes
2. **Recovery asymmetry:** Time to cross << time to recover
3. **Irreversibility:** Some elements don't fully recover (progress stays above floor)
4. **Determinism:** Same seed = identical hysteresis behavior

**Command:**
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_hysteresis_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

### Success Criteria

**Implementation Complete When:**
- ✅ `recoveryTempC` added to all tipping elements with correct values
- ✅ `TippingElementState` enum created and used
- ✅ Bidirectional state machine implemented in ClimateSystemPhase
- ✅ Recovery uses exponential decay toward `minimumAsymptoticValue`
- ✅ Unit tests pass
- ✅ Monte Carlo shows path-dependent outcomes
- ✅ No NaN/undefined assertion failures
- ✅ Deterministic (same seed = same results)

**Ready for Quality Gate 2 (Architecture Review) When:**
- All above criteria met
- Performance impact measured (should be negligible - same phase count)
- Documentation comments added to code
- Logging shows hysteresis transitions clearly

## Implementation Strategy

**Recommended Order:**

1. **Phase 1: Type definitions** (30 min)
   - Add `recoveryTempC`, `hysteresisGapC`, `TippingElementState` to types
   - Update TIPPING_ELEMENTS data with recovery thresholds

2. **Phase 2: State machine skeleton** (1 hour)
   - Create `updateTippingElementStates()` with switch statement
   - Implement transition helper methods (stub out progress logic initially)
   - Add logging for state transitions

3. **Phase 3: Recovery dynamics** (1 hour)
   - Implement `updateRecovery()` with exponential decay
   - Test with single element (WAIS)

4. **Phase 4: Integration & testing** (1-2 hours)
   - Replace old `detectTippingThresholds()` + `updateTippingTransitions()` with new state machine
   - Run unit tests
   - Fix assertion failures

5. **Phase 5: Monte Carlo validation** (2-4 hours)
   - Run N≥10 simulations
   - Analyze path-dependence
   - Verify determinism

**Total Estimated Time:** 4-6 hours

## Notes from Sylvia's Review

**Key Caveats:**
- AMOC hysteresis has contradictory literature - use conservative 1.0°C gap, not "never recovers"
- Permafrost: Area is reversible (no hysteresis), carbon is irreversible (use minimumAsymptoticValue)
- Arctic ice: NO hysteresis (not a true tipping point per Armstrong McKay 2022)
- Ice sheet gaps (2.5-3.0°C) are INFERRED from Garbe 2020, not explicitly stated - flag as tunable parameters

**Treat hysteresis gaps as TUNABLE PARAMETERS** - the mechanism is sound, but exact numbers have uncertainty. Build the system to allow future calibration.

## Handoff Artifacts

**For Roy to read:**
1. `research/climate_hysteresis_20251205.md` (background)
2. `reviews/climate_hysteresis_critique_20251205.md` (validation + caveats)
3. This handoff file

**For Roy to create:**
1. Updated `src/types/tipping-points.ts` with hysteresis fields
2. Updated `src/simulation/engine/phases/ClimateSystemPhase.ts` with state machine
3. Tests demonstrating hysteresis behavior
4. Monte Carlo validation logs

**For Roy to update:**
1. `docs/wiki/README.md` (tipping points section) - document hysteresis
2. Devlog entry explaining hysteresis implementation

## Next Steps After Implementation

**Orchestrator will:**
1. Monitor Monte Carlo validation results
2. Spawn architecture-skeptic for Quality Gate 2
3. Address any CRITICAL/HIGH issues from architecture review
4. Spawn wiki-documentation-updater to sync docs
5. Spawn architect to archive M-7 to completed plans

**Roy should post progress updates** (if chatroom tools available) or create status file.

Good luck, Roy! This is a research-critical feature - getting hysteresis right is essential for simulation realism. 🌍
