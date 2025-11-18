# High-Risk Defensive Fallbacks - Targeted Fix List
**Date:** November 17, 2025
**Purpose:** Specific fallbacks that could hide bugs in calculation paths

## CRITICAL: Must Fix (5 instances)

These fallbacks occur in calculation contexts where undefined/NaN could propagate:

### 1. Golden Age Duration Calculations
**File:** `src/simulation/outcomes.ts`
**Lines:** 268, 277
```typescript
// Line 268 - Exit calculation
const duration = currentMonth - (state.goldenAgeState.entryMonth || 0);

// Line 277 - Ongoing calculation
state.goldenAgeState.duration = currentMonth - (state.goldenAgeState.entryMonth || 0);
```
**Risk:** If `entryMonth` is undefined, duration calculation is incorrect
**Fix:** Assert that `entryMonth` exists when `active` is true

### 2. Event Counting Accumulator
**File:** `src/simulation/logging.ts`
**Line:** 289
```typescript
eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
```
**Risk:** Hides initialization issues with event tracking
**Fix:** Initialize `eventsByType` properly, use Map with proper get/set

### 3. Outcome Counting Accumulator
**File:** `src/simulation/logging.ts`
**Line:** 311
```typescript
outcomes[log.metadata.outcome] = (outcomes[log.metadata.outcome] || 0) + 1;
```
**Risk:** Same as above - accumulator pattern
**Fix:** Proper initialization of outcomes map

### 4. Event Frequency Accumulator
**File:** `src/simulation/logging.ts`
**Line:** 319
```typescript
eventFrequencies[type] = (eventFrequencies[type] || 0) + count;
```
**Risk:** Accumulator pattern in statistics
**Fix:** Initialize map before use

### 5. Current Month Fallback
**File:** `src/simulation/planetaryBoundaries.ts`
**Line:** (search for `state.currentMonth || 0`)
```typescript
month: state.currentMonth || 0,
```
**Risk:** Month 0 is semantically different from "unknown month"
**Fix:** Assert currentMonth is always defined

## MEDIUM: Consider Fixing (3 instances)

Less critical but worth addressing:

### 6. Regional Overuse Default
**File:** `src/simulation/nitrogenFoodCoupling.ts`
**Line:** 80
```typescript
const regionalOveruse = REGIONAL_OVERUSE[region] ?? 0.20;
```
**Note:** Has comment explaining default, but could use explicit handling

### 7. Deployment Acceleration Default
**File:** `src/simulation/techTree/deploymentTimescales.ts`
**Line:** 283
```typescript
const emergencyAcceleration = techTreeState.deploymentAcceleration[deployment.techId] ?? 1.0;
```
**Note:** Default of 1.0 (no acceleration) is reasonable but could be explicit

## Fix Strategy

For each high-risk fallback:

1. **Add assertion before calculation:**
```typescript
// BEFORE
const duration = currentMonth - (state.goldenAgeState.entryMonth || 0);

// AFTER
if (state.goldenAgeState.active && state.goldenAgeState.entryMonth === undefined) {
  throw new Error('CRITICAL: Golden Age active but entryMonth undefined');
}
const duration = currentMonth - state.goldenAgeState.entryMonth;
```

2. **For accumulators, initialize properly:**
```typescript
// BEFORE
eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

// AFTER (at function start)
const eventsByType: Record<string, number> = {};
// ... later ...
eventsByType[event.type] = (eventsByType[event.type] ?? 0) + 1; // Now ?? is for type safety only
```

## Estimated Effort

- **High-Risk Fixes:** 1-2 hours (including testing)
- **Testing:** Run Monte Carlo N=10 to verify no regressions
- **Total:** 2-3 hours max

## DO NOT FIX

The following patterns are CORRECT and should not be changed:

1. **Boolean conditions with ||**
2. **Display/logging fallbacks** (`|| 'N/A'`, `|| 'Unknown'`)
3. **Config initialization** (`?? DEFAULT_CONFIG`)
4. **Map.get() fallbacks** in effect accumulation (documented as valid)

---
*This targeted approach addresses real risks without over-engineering*