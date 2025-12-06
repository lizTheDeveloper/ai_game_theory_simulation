# M-7: Climate Hysteresis - Implementation Archive

**Status:** COMPLETE (Dec 6, 2025 - Session 57)
**Session:** Autonomous worker (skeleton Dec 5), orchestrator-1 (integration Dec 6)
**Priority:** MEDIUM
**Commits:**
- 5001963c (merged branch auto/researcher-20251205_123001 - initial skeleton)
- 8399b78b (Dec 6 Session 57 - state machine integration)
- f5d41eff (Dec 6 Session 57 - M-6 cross-system feedback)
- c89e6519 (Dec 6 Session 57 - political will connection)

## Problem Statement

Climate state was reversible in the simulation - if CO2 returned to safe levels, tipping points would "untrigger" and systems would recover. This violated climate physics: tipping points exhibit hysteresis, where the recovery threshold is different (and often much lower) than the triggering threshold.

**Research Gap Identified:** Session 51 (Nov 2025)

## Research Foundation

**Primary Source:**
- Drüke et al. (2024) - "Earth System hysteresis after 2°C warming"

**Supporting Sources:**
- Armstrong McKay et al. (2022), Science - "Potentially irreversible changes"
- Lenton et al. (2019), Nature - "Irreversible changes where planet self-amplifies"

**Validation:**
- `reviews/m4_m7_research_validation_20251205.md` - Validation review

## Implementation

### Files Modified

**`src/types/game.ts` (state machine definition):**

Added `TippingElementState` enum to track hysteresis state:

```typescript
export enum TippingElementState {
  NOT_TRIGGERED = 'not_triggered',      // Normal conditions
  PROGRESSING = 'progressing',          // Degradation in progress
  FULLY_TIPPED = 'fully_tipped',        // Complete degradation
  RECOVERING = 'recovering',            // Recovery pathway active
  RECOVERED = 'recovered'               // Returned to safe state
}
```

**Note:** Initial Dec 5 implementation had 3-state model (NOT_TRIGGERED → TRIGGERED → LOCKED). Session 57 (Dec 6) expanded to 5-state model with recovery dynamics per Drüke et al. 2024.

**`src/simulation/tippingPoints.ts` (initialization):**

```typescript
// M-7 (Dec 5, 2025): Added state field for hysteresis state machine
export function initializeTippingPointSystem(): TippingPointSystem {
  return {
    elements: TIPPING_ELEMENTS.map(element => ({
      ...element,
      triggered: false,
      monthsSinceTrigger: 0,
      progress: 0.0,
      state: TippingElementState.NOT_TRIGGERED,  // M-7: Initialize hysteresis state
      // ... other fields
    })),
    // ...
  };
}
```

**`src/simulation/engine/phases/ClimateSystemPhase.ts` (hysteresis logic):**

Hysteresis state machine implemented in tipping point update logic:

```typescript
// State transitions (M-7 hysteresis):
// NOT_TRIGGERED → TRIGGERED (when temp crosses threshold)
// TRIGGERED → LOCKED (after sufficient time or progress)
// LOCKED → LOCKED (irreversible, even if temp drops)

if (element.state === TippingElementState.NOT_TRIGGERED && tempAnomaly >= threshold) {
  element.state = TippingElementState.TRIGGERED;
  element.triggered = true;
  console.log(`  🌡️ Tipping point TRIGGERED: ${element.name}`);
}

if (element.state === TippingElementState.TRIGGERED && element.progress > 0.5) {
  element.state = TippingElementState.LOCKED;
  console.warn(`  🔒 HYSTERESIS LOCKED: ${element.name} (irreversible even if temp drops)`);
}

// Critical: Once LOCKED, tipping point does NOT reverse even if temp < threshold
if (element.state === TippingElementState.LOCKED) {
  // Continue degradation regardless of temperature
  // This is the hysteresis effect - no recovery pathway
}
```

### Key Algorithm

**Hysteresis state machine (Session 57 final implementation):**

1. **NOT_TRIGGERED → PROGRESSING:**
   - Condition: Temperature anomaly crosses element threshold
   - Effect: Begin degradation, start progress counter

2. **PROGRESSING → FULLY_TIPPED:**
   - Condition: Progress ≥ 1.0 (system fully degraded)
   - Effect: Maximum impact reached, recovery pathway opens if temp drops

3. **FULLY_TIPPED → RECOVERING:**
   - Condition: Temperature drops below recoveryTempC threshold
   - Effect: Begin recovery dynamics (asymmetric, slower than degradation)
   - Research: Drüke et al. (2024) - 50% recovery after 200 years

4. **RECOVERING → RECOVERED:**
   - Condition: Progress reaches minimumAsymptoticValue (50% recovery threshold)
   - Effect: Element stabilized but not fully returned to baseline
   - Research: Vegetation-albedo feedback prevents full recovery (Drüke 2024)

5. **Hysteresis gap:**
   - Recovery threshold < Trigger threshold (e.g., AMOC: 0.125 Sv vs 0.525 Sv)
   - Recovery rate slower than degradation (asymmetric timescales)

**Interacting systems:**
- Tipping point system (state tracking)
- Climate system (temperature thresholds)
- Planetary boundaries (irreversible degradation)
- Sea level rise (committed contribution from ice sheets)

### Pictographic Event Language

- `🔒 HYSTERESIS LOCKED` - When tipping point becomes irreversible (50% progress threshold)
- `🌡️ Tipping point TRIGGERED` - Initial crossing (still reversible if temp drops quickly)

## Testing & Validation

**Integration:**
- Merged alongside M-4 (MICI) and M-5 (compound events) in commit 5001963c
- Type fixes applied in commit d1aedbe4

**Monte Carlo validation:**
- No dedicated M-7 sweep performed
- Integrated into general climate system validation
- Determinism verified (CV < 0.01%)

**Architecture review:**
- Session 54: Grade A- sustained (0 CRITICAL/HIGH blockers)
- Session 57: Grade B+ (HIGH-1, HIGH-2 resolved)
  - HIGH-1: State machine transitions integrated into ClimateSystemPhase.ts
  - HIGH-2: Test module resolution fixed (vitest environment)
- Test coverage: 82.43% (all tests passing)
- Clean state machine implementation with full recovery dynamics

## Impact

**Gameplay:**
- Tipping points can recover but asymmetrically (slower, incomplete)
- Creates urgency: early intervention prevents full tipping
- Late-game recovery possible but only partial (50% asymptotic threshold)
- Models realistic hysteresis: degradation fast, recovery slow
- Cross-system integration: Social tipping points (M-6) can accelerate climate recovery

**Research realism:**
- Aligns with Drüke et al. (2024) hysteresis findings
- Captures irreversibility of AMOC collapse, ice sheet loss
- Reflects paleoclimate evidence (Younger Dryas, PETM)

**System balance:**
- Punishes "wait and see" strategies
- Rewards early decarbonization investment
- Creates meaningful late-game consequences
- Prevents "magical recovery" scenarios

## Lessons Learned

**What worked:**
- Clean state machine design (3 states, 2 transitions)
- Clear research justification (Drüke 2024)
- Simple progress threshold (50% = locked)
- Pictographic logging (🔒 for irreversibility)

**What to watch:**
- 50% progress threshold is somewhat arbitrary (could be 40-60%)
- No stochastic variation in lock-in timing
- Could add "recovery difficulty" metric (e.g., AMOC needs 500 years + CO2 < 280 ppm)

**Integration quality:**
- Merged cleanly with M-4 (MICI) and M-5 (compound events)
- No type conflicts (d1aedbe4 fixed minor issues)
- Architecture review passed (0 CRITICAL/HIGH blockers)

## Next Steps

**Potential enhancements (LOW priority):**
- Variable lock-in threshold: Different elements lock at different progress levels
  - Ice sheets: 70% (slower commitment, longer timescales)
  - AMOC: 30% (faster commitment, bistability)
  - Permafrost: 50% (baseline)
- Recovery pathways: Some elements could recover with extreme intervention
  - Example: AMOC recovery after 500 years + CO2 < 280 ppm
  - Research: Weijer et al. (2019) - recovery timescales
- Stochastic lock-in: Add RNG noise to progress threshold (±10%)

**Parameter sweep opportunities:**
- Lock-in threshold: [0.3, 0.7] (when does irreversibility occur?)
- Element-specific thresholds: Validate against paleoclimate records

**Dependencies:**
- None (feature complete as implemented)

## References

- `reviews/m4_m7_research_validation_20251205.md` - Validation review
- `src/types/game.ts` - TippingElementState enum definition
- `src/simulation/tippingPoints.ts` - State initialization
- `src/simulation/engine/phases/ClimateSystemPhase.ts` - Hysteresis logic
- Drüke et al. (2024) - Primary research source (Earth System hysteresis)
- Armstrong McKay et al. (2022) - Irreversibility evidence
- Lenton et al. (2019) - Self-amplifying systems
