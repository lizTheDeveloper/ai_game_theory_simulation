# Phase 3.3: Government Agent Defensive Programming Fixes

**Date:** October 26, 2025
**Agent:** government-agent-fixer
**Task:** Replace defensive fallbacks with explicit undefined checks in governmentAgent.ts

## Overview

Fixed 16 defensive programming patterns in `governmentAgent.ts` where `state.government.resources ?? 0` was being used. These have been replaced with explicit undefined checks that throw informative errors.

## Patterns Fixed

### 1. Line 1586 - `subsidize_safety_orgs` canExecute

**Before:**
```typescript
return safetyOrgs.length > 0 && (state.government.resources ?? 0) > 2;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1586 - initialization bug');
}
return safetyOrgs.length > 0 && state.government.resources > 2;
```

### 2. Line 1624 - `subsidize_safety_orgs` execute

**Before:**
```typescript
state.government.resources = (state.government.resources ?? 0) - 2;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1624 - initialization bug');
}
state.government.resources = state.government.resources - 2;
```

### 3. Line 1658 - `emergency_amazon_protection` canExecute (first occurrence)

**Before:**
```typescript
return amazon.deforestation > 23 && !amazon.triggered && (state.government.resources ?? 0) > 5;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1658 - initialization bug');
}
return amazon.deforestation > 23 && !amazon.triggered && state.government.resources > 5;
```

### 4. Line 1678 - `emergency_amazon_protection` execute (first occurrence)

**Before:**
```typescript
state.government.resources = (state.government.resources ?? 0) - 5;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1678 - initialization bug');
}
state.government.resources = state.government.resources - 5;
```

### 5. Line 1715 - `fund_coral_restoration` canExecute (first occurrence)

**Before:**
```typescript
return coral.healthPercentage < 50 && (state.government.resources ?? 0) > 3;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1715 - initialization bug');
}
return coral.healthPercentage < 50 && state.government.resources > 3;
```

### 6. Line 1735 - `fund_coral_restoration` execute (first occurrence)

**Before:**
```typescript
state.government.resources = (state.government.resources ?? 0) - 3;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1735 - initialization bug');
}
state.government.resources = state.government.resources - 3;
```

### 7. Line 1770 - `ban_harmful_pesticides` canExecute (first occurrence)

**Before:**
```typescript
return pollinators.populationPercentage < 50 &&
       (state.government.resources ?? 0) > 1 &&
       !state.government.environmentalInterventions?.pesticideBan;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1770 - initialization bug');
}
return pollinators.populationPercentage < 50 &&
       state.government.resources > 1 &&
       !state.government.environmentalInterventions?.pesticideBan;
```

### 8. Line 1797 - `ban_harmful_pesticides` execute (first occurrence)

**Before:**
```typescript
state.government.resources = (state.government.resources ?? 0) - 1;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1797 - initialization bug');
}
state.government.resources = state.government.resources - 1;
```

### 9. Line 1827 - `deploy_environmental_tech` canExecute

**Before:**
```typescript
if (!state.techTreeState || (state.government.resources ?? 0) < 10) return false;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1827 - initialization bug');
}
if (!state.techTreeState || state.government.resources < 10) return false;
```

### 10. Line 1868 - `deploy_environmental_tech` execute

**Before:**
```typescript
state.government.resources = (state.government.resources ?? 0) - 10;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1868 - initialization bug');
}
state.government.resources = state.government.resources - 10;
```

### 11. Line 1906 - `emergency_amazon_protection` canExecute (second occurrence)

**Before:**
```typescript
if (!state.specificTippingPoints?.amazon || (state.government.resources ?? 0) < 5) return false;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1906 - initialization bug');
}
if (!state.specificTippingPoints?.amazon || state.government.resources < 5) return false;
```

### 12. Line 1933 - `emergency_amazon_protection` execute (second occurrence)

**Before:**
```typescript
state.government.resources = (state.government.resources ?? 0) - 5;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1933 - initialization bug');
}
state.government.resources = state.government.resources - 5;
```

### 13. Line 1964 - `fund_coral_restoration` canExecute (second occurrence)

**Before:**
```typescript
if (!state.specificTippingPoints?.coral || (state.government.resources ?? 0) < 3) return false;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1964 - initialization bug');
}
if (!state.specificTippingPoints?.coral || state.government.resources < 3) return false;
```

### 14. Line 1996 - `fund_coral_restoration` execute (second occurrence)

**Before:**
```typescript
state.government.resources = (state.government.resources ?? 0) - 3;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:1996 - initialization bug');
}
state.government.resources = state.government.resources - 3;
```

### 15. Line 2028 - `ban_harmful_pesticides` canExecute (second occurrence)

**Before:**
```typescript
if (!state.specificTippingPoints?.pollinators || (state.government.resources ?? 0) < 1) return false;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:2028 - initialization bug');
}
if (!state.specificTippingPoints?.pollinators || state.government.resources < 1) return false;
```

### 16. Line 2066 - `ban_harmful_pesticides` execute (second occurrence)

**Before:**
```typescript
state.government.resources = (state.government.resources ?? 0) - 1;
```

**After:**
```typescript
if (state.government.resources === undefined) {
  throw new Error('❌ state.government.resources is undefined in governmentAgent:2066 - initialization bug');
}
state.government.resources = state.government.resources - 1;
```

## Additional Fixes: Required Properties Without Fallbacks

### 17. Line 2684 - MAD deterrence strength (required property)

**Before:**
```typescript
madStrength: state.madDeterrence?.madStrength || 1.0,
```

**After:**
```typescript
madStrength: state.madDeterrence.madStrength,
```

**Reason:** `state.madDeterrence` is a required property, and `madStrength` is a required property within it.

### 18. Line 2687 - Nuclear command control safeguard strength (required property)

**Before:**
```typescript
currentCoverage: state.nuclearCommandControlState?.totalSafeguardStrength || 0
```

**After:**
```typescript
currentCoverage: state.nuclearCommandControlState.totalSafeguardStrength
```

**Reason:** `state.nuclearCommandControlState` is a required property, and `totalSafeguardStrength` is a required property within it.

### 19. Line 2720 - AI erosion factor (required property)

**Before:**
```typescript
const aiIntegration = state.madDeterrence?.aiErosionFactor || 0;
```

**After:**
```typescript
const aiIntegration = state.madDeterrence.aiErosionFactor;
```

**Reason:** `state.madDeterrence` is a required property, and `aiErosionFactor` is a required property within it.

### 20. Line 2772 - Biodiversity index (required property)

**Before:**
```typescript
const biodiversityLevel = state.environmentalAccumulation?.biodiversityIndex || 1.0;
```

**After:**
```typescript
const biodiversityLevel = state.environmentalAccumulation.biodiversityIndex;
```

**Reason:** `state.environmentalAccumulation` is a required property, and `biodiversityIndex` is a required property within it.

## Patterns KEPT (Legitimate Defaults)

### Line 524 - Economic cost from lookup

```typescript
economic_cost: levelEffects?.economicCost || 0
```

**Kept because:** `levelEffects` is the result of a lookup and may legitimately be undefined for some governance levels.

### Line 2674 - Bilateral tensions length

```typescript
highTensions: state.bilateralTensions?.filter(t =>
  t.tensionLevel > 0.7 || t.nuclearThreats
).length || 0,
```

**Kept because:** Filter may return undefined, and `|| 0` is a legitimate default for counting array length. Added comment for clarity.

### Lines 2774-2776 - Tipping point properties

```typescript
const amazonThreat = (state.specificTippingPoints?.amazon?.deforestation ?? 0) > 23;
const coralThreat = (state.specificTippingPoints?.coral?.healthPercentage ?? 100) < 40;
const pollinatorThreat = (state.specificTippingPoints?.pollinators?.populationPercentage ?? 100) < 45;
```

**Kept because:** These are optional nested properties - the tipping points may not exist. Added comment for clarity.

## Summary

- **Total patterns fixed:** 20
- **state.government.resources patterns:** 16 (all occurrences)
- **Required MAD/nuclear properties:** 3
- **Required environmental properties:** 1
- **Legitimate defaults kept:** 5

## Type Safety Notes

From type definitions:
- `state.government.resources` is **optional** (`resources?: number`) but should be initialized
- `state.madDeterrence` is **required** (no `?` in type definition)
- `state.nuclearCommandControlState` is **required** (no `?` in type definition)
- `state.environmentalAccumulation` is **required** (no `?` in type definition)

If `state.government.resources` is undefined, it indicates an initialization bug that should be caught early rather than silently defaulting to 0.

## Impact

These changes will:
1. **Catch initialization bugs early** - If `state.government.resources` is not properly initialized, we'll get a clear error message
2. **Improve debugging** - Error messages include exact line numbers where the bug occurred
3. **Remove silent failures** - No more defaulting to 0 and continuing with invalid state
4. **Maintain type safety** - Properties that should always be defined are no longer treated as potentially undefined

## Testing Notes

No tests were run as per instructions. The code changes are purely defensive programming improvements that:
- Replace `?? 0` with explicit undefined checks for required/initialized properties
- Keep legitimate defaults for truly optional values (lookups, array operations)
- Add clear error messages for debugging initialization bugs
