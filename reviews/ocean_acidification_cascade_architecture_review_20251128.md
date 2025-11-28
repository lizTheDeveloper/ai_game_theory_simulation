# Architecture Review: RD-2 Ocean Acidification Cascades

**Date:** 2025-11-28
**Reviewer:** Architecture Skeptic Agent
**Feature:** RD-2 Ocean Acidification Cascades (TIER 2)
**Commit:** 2d109499
**Grade:** B-

---

## Executive Summary

The Ocean Acidification Cascade Phase implementation demonstrates solid defensive coding practices with comprehensive assertion utilities and proper RNG handling. However, there are **significant state propagation concerns** that risk data consistency between the new cascade phase and the existing ocean acidification system. The architecture also has a **HIGH priority issue** regarding duplicate coral health calculations that could cause inconsistent simulation results.

---

## Files Reviewed

1. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/OceanAcidificationCascadePhase.ts` (275 lines, order 21.8)
2. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/oceanAcidification.ts` (extended with regional cascades)
3. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/oceanAcidification.ts` (initialization + update logic)
4. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine.ts` (phase registration)

---

## CRITICAL ISSUES (Immediate attention required - system stability at risk)

**None identified.**

The implementation follows defensive coding patterns with proper assertion utilities and does not introduce memory leaks, unbounded loops, or data corruption risks.

---

## HIGH PRIORITY (Significant performance/maintainability concerns)

### HIGH-1: Duplicate Coral Health Calculation (State Propagation Conflict)

**File:** Multiple files in state propagation chain
**Lines:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/oceanAcidification.ts:280-291`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/OceanAcidificationCascadePhase.ts:160-196`

**Problem:** Two separate mechanisms are computing and writing to `coralReefHealth`:

1. **ResourceWaterPhase (order 20.2)** calls `updateOceanAcidificationSystem()` which:
   - Computes coral decline based on pH thresholds (lines 237-291)
   - Updates `oa.coralReefHealth` directly with species sensitivity and warming synergy

2. **OceanAcidificationCascadePhase (order 21.8)** then:
   - Computes coral health using regional model (lines 139-180)
   - OVERWRITES `ocean.coralReefHealth` (line 196)

**Impact:** The cascade phase REPLACES the calculation from `updateOceanAcidificationSystem()`, making that earlier calculation wasted work. Worse, there's no guarantee the two algorithms produce consistent results:
- `updateOceanAcidificationSystem()` uses: pH threshold bands, species sensitivity, warming synergy, restoration/MPA modifiers
- `OceanAcidificationCascadePhase` uses: regional health weighted average, compound stress multiplier

**Result:** Depending on the scenario, you could see coral health jump UP or DOWN between phases 20.2 and 21.8.

**Recommendation:** Choose ONE authoritative source for coral health calculation. Options:
1. **Option A (Recommended):** Remove coral health calculation from `updateOceanAcidificationSystem()` and let cascade phase be the sole authority. Update pH and aragonite in the update function, but skip coral calculations.
2. **Option B:** Have cascade phase READ the coral health from `updateOceanAcidificationSystem()` and only ADJUST it based on regional variation rather than recalculating from scratch.

**Effort:** MEDIUM (2-4 hours)

---

### HIGH-2: TechTree Effects Clobber Regional State

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/techTree/effectsEngine.ts`
**Lines:** 1975, 2084, 2099, 2126

**Problem:** The tech tree effects engine modifies `coralReefHealth` directly without awareness of the new regional system:

```typescript
// effectsEngine.ts:1975
gameState.oceanAcidificationSystem.coralReefHealth = assertFinite(Math.min(
  1.0,
  gameState.oceanAcidificationSystem.coralReefHealth + value * 0.01
), ...);
```

The cascade phase syncs from regional to global (line 196):
```typescript
ocean.coralReefHealth = globalAverage * 100; // Sync legacy field (0-100 scale)
```

**Impact:** Tech effects modify the global field, but the next cascade phase execution will overwrite it with the weighted regional average. Tech benefits are lost.

**Recommendation:** Tech effects should modify `regionalCoralHealth` fields proportionally, not the global `coralReefHealth`. Or add a `techBonus` field that the cascade phase incorporates.

**Effort:** MEDIUM (3-5 hours to audit and update all 4 tech effect locations)

---

## MEDIUM PRIORITY (Technical debt worth addressing between features)

### MED-1: `any` Type Annotation for Ocean State

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/OceanAcidificationCascadePhase.ts`
**Lines:** 68, 105, 199, 209, 228

**Problem:** The phase uses `ocean: any` instead of the proper `OceanAcidificationSystem` type:

```typescript
private calculateCompoundStress(state: GameState, ocean: any, events: GameEvent[]): void {
```

**Impact:** TypeScript cannot catch property access errors on the ocean object. Silent bugs could slip through.

**Recommendation:** Import and use the proper type:
```typescript
import { OceanAcidificationSystem } from '@/types/oceanAcidification';
private calculateCompoundStress(state: GameState, ocean: OceanAcidificationSystem, events: GameEvent[]): void {
```

**Effort:** SMALL (15 minutes)

---

### MED-2: History Array Memory Accumulation

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/OceanAcidificationCascadePhase.ts`
**Lines:** 60-63

**Problem:** History tracking uses array slice with 120-month window, but creates new arrays every month:

```typescript
ocean.pHHistory.push(ocean.pH);
ocean.coralHealthHistory.push(ocean.regionalCoralHealth.globalAverage);
if (ocean.pHHistory.length > 120) ocean.pHHistory = ocean.pHHistory.slice(-120);
if (ocean.coralHealthHistory.length > 120) ocean.coralHealthHistory = ocean.coralHealthHistory.slice(-120);
```

**Impact:** Creates garbage collection pressure. After 120 months, every step allocates 2 new arrays.

**Recommendation:** Use circular buffer pattern or in-place shift:
```typescript
if (ocean.pHHistory.length >= 120) {
  ocean.pHHistory.shift(); // O(n) but avoids allocation
}
ocean.pHHistory.push(ocean.pH);
```

Or pre-allocate fixed-size arrays with index tracking.

**Effort:** SMALL (30 minutes)

---

### MED-3: Dependency Declaration Missing ResourceWaterPhase

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/OceanAcidificationCascadePhase.ts`
**Line:** 34

**Problem:** Phase declares dependency on `planetary_boundaries` but not `resource-water`:

```typescript
readonly dependencies = ['planetary_boundaries'] as const;
```

However, the cascade phase reads `ocean.pH` and `ocean.aragoniteSaturation` which are computed by `updateOceanAcidificationSystem()` called from `ResourceWaterPhase` (order 20.2).

**Impact:** If phase ordering changes, the cascade phase could read stale pH values. Currently works by accident because order 20.2 < 21.8.

**Recommendation:** Add explicit dependency:
```typescript
readonly dependencies = ['planetary_boundaries', 'resource-water'] as const;
```

**Effort:** TRIVIAL (1 minute)

---

### MED-4: Inconsistent Scale Between Phase and Base System

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/OceanAcidificationCascadePhase.ts`
**Line:** 196

**Problem:** The cascade phase tracks `regionalCoralHealth` on 0-1 scale but converts to 0-100 for legacy field:

```typescript
ocean.coralReefHealth = globalAverage * 100; // Sync legacy field (0-100 scale)
```

But `updateOceanAcidificationSystem()` at line 44 initializes:
```typescript
coralReefHealth: 70,  // 70% (30% degradation from baseline)
```

And at line 287 also works in 0-100 scale. This is consistent, but the comment suggests uncertainty about the scale.

**Impact:** Low risk currently, but future maintainers might misinterpret the scale.

**Recommendation:** Add explicit scale documentation in the type definition and consider a constant:
```typescript
const CORAL_HEALTH_SCALE = 100; // 0-100%
ocean.coralReefHealth = globalAverage * CORAL_HEALTH_SCALE;
```

**Effort:** TRIVIAL (5 minutes)

---

## LOW PRIORITY (Future improvements, not urgent)

### LOW-1: Hard-Coded Regional Weights

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/OceanAcidificationCascadePhase.ts`
**Lines:** 182-188

**Problem:** Regional weights are hard-coded in the phase:

```typescript
ocean.regionalCoralHealth.seAsia * 0.40 +
ocean.regionalCoralHealth.pacificIslands * 0.25 +
ocean.regionalCoralHealth.caribbean * 0.20 +
ocean.regionalCoralHealth.indianOcean * 0.15,
```

**Impact:** Weights cannot be configured for scenario testing. Duplicated from type documentation.

**Recommendation:** Define weights in the type or config file:
```typescript
const REGIONAL_WEIGHTS = {
  seAsia: 0.40,
  pacificIslands: 0.25,
  caribbean: 0.20,
  indianOcean: 0.15
} as const;
```

**Effort:** SMALL (15 minutes)

---

### LOW-2: Magic Numbers in Threshold Logic

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/OceanAcidificationCascadePhase.ts`
**Lines:** 112-116, 233-261

**Problem:** pH and aragonite thresholds are scattered as magic numbers:

```typescript
if (pH < 7.7 || omega < 2.0) baseStress = 1.0;
else if (pH < 7.8 || omega < 2.5) baseStress = 0.7;
else if (pH < 7.9 || omega < 3.0) baseStress = 0.4;
```

**Impact:** Difficult to adjust for sensitivity analysis. Duplicated from type documentation.

**Recommendation:** Extract to named constants matching the research citations:

```typescript
const THRESHOLDS = {
  // IPCC AR6 thresholds
  COLLAPSE: { pH: 7.7, omega: 2.0 },
  SEVERE:   { pH: 7.8, omega: 2.5 },
  MODERATE: { pH: 7.9, omega: 3.0 }
} as const;
```

**Effort:** SMALL (20 minutes)

---

### LOW-3: Event ID Generation Could Collide

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/OceanAcidificationCascadePhase.ts`
**Lines:** 236, 249, 264

**Problem:** Event IDs use pattern `ocean_X_stress_${state.currentMonth}`:

```typescript
id: `ocean_moderate_stress_${state.currentMonth}`,
```

**Impact:** If multiple runs start at same month, IDs would collide in aggregated analysis.

**Recommendation:** Add seed or run ID:
```typescript
id: `ocean_moderate_stress_${state.config.seed}_${state.currentMonth}`,
```

**Effort:** TRIVIAL (5 minutes)

---

## Performance Analysis

**No O(n^2) patterns detected.** The phase iterates over a fixed set of 4 regions (O(1)).

**Deep cloning:** None in the phase. State mutation is direct.

**Memory:** Two history arrays grow to 120 elements then stabilize (acceptable).

**Estimated per-step overhead:** < 0.1ms (negligible)

---

## Positive Observations

1. **Excellent defensive coding:** Every calculation uses assertion utilities (`assertFinite`, `assertProbability`, `assertInRange`) with full context.

2. **RNG validation:** Explicit check at phase entry with fail-loudly error.

3. **Research-backed thresholds:** Comments reference specific papers (IPCC AR6, Anthony et al., Jiang et al.).

4. **Proper phase structure:** Implements `SimulationPhase` interface correctly with explicit order and dependencies.

5. **Clear method decomposition:** Main `execute()` delegates to focused private methods.

6. **Event generation:** Threshold crossing events provide rich diagnostic information.

---

## RECOMMENDATION

**Priority fixes before merge:**

1. **HIGH-1 (Required):** Resolve the duplicate coral health calculation between `updateOceanAcidificationSystem()` and `OceanAcidificationCascadePhase`. The current state will produce inconsistent results where the cascade phase completely overwrites calculations from the base system.

2. **HIGH-2 (Required):** Update tech tree effects to work with regional system or add tech bonus accumulator field.

**Defer to next sprint:**

3. MED-1, MED-2, MED-3 - These are maintainability improvements that don't affect correctness.

**Total estimated effort for required fixes:** 4-6 hours

---

## Issue Severity Summary

| Severity | Count | Issues |
|----------|-------|--------|
| CRITICAL | 0 | - |
| HIGH | 2 | Duplicate coral calculation, TechTree clobbers regional state |
| MEDIUM | 4 | `any` types, memory allocation, missing dependency, scale docs |
| LOW | 3 | Hard-coded weights, magic numbers, event ID collision |

---

**Architecture Skeptic Assessment:** The implementation is fundamentally sound with excellent defensive coding practices. However, the state propagation conflict with the existing ocean acidification system (HIGH-1) must be resolved before this can be considered production-ready. The feature should not be merged until the coral health calculation authority is consolidated.
