# Phase 3.3: Other Agent Files Defensive Programming Fixes

**Date:** October 26, 2025
**Agent:** other-agents-fixer
**Task:** Replace defensive fallbacks with explicit undefined checks in agent files

## Overview

Fixed 5 defensive programming patterns across 3 agent files, replacing silent fallbacks (`?? 0`, `|| 0`) with explicit undefined checks and error throws.

## Files Modified

### 1. `/src/simulation/agents/aiTechActions.ts` (3 fixes)

#### Fix 1: Line 225 - Defensive AI Detection Strength
**Before:**
```typescript
const defensiveAIStrength = state.defensiveAI?.threatDetection?.detectSleepers || 0;
const detectionChance = Math.min(0.9, 0.3 + defensiveAIStrength * 0.4 - socialCapability * 0.1);
```

**After:**
```typescript
if (state.defensiveAI?.threatDetection?.detectSleepers === undefined) {
  throw new Error('❌ state.defensiveAI.threatDetection.detectSleepers is undefined in aiTechActions.ts:225 - initialization bug');
}
const defensiveAIStrength = state.defensiveAI.threatDetection.detectSleepers;
const detectionChance = Math.min(0.9, 0.3 + defensiveAIStrength * 0.4 - socialCapability * 0.1);
```

**Context:** Sabotage technology action calculating detection chance. If defensive AI system is not initialized, detection calculations will be wrong.

---

#### Fix 2: Line 243 - Society Paranoia (Sabotage Detected)
**Before:**
```typescript
if (detected) {
  // Sabotage succeeded but AI was detected!
  // Increase paranoia, reduce trust, potentially trigger containment
  state.society.paranoia = Math.min(1, (state.society.paranoia ?? 0) + 0.08);
```

**After:**
```typescript
if (detected) {
  // Sabotage succeeded but AI was detected!
  // Increase paranoia, reduce trust, potentially trigger containment
  if (state.society.paranoia === undefined) {
    throw new Error('❌ state.society.paranoia is undefined in aiTechActions.ts:243 - initialization bug');
  }
  state.society.paranoia = Math.min(1, state.society.paranoia + 0.08);
```

**Context:** When sabotage is detected, paranoia should increase. If paranoia is undefined, this is a critical initialization bug (paranoia should be initialized in Phase 2C social cohesion).

---

#### Fix 3: Line 289 - Society Paranoia (Sabotage Failed & Detected)
**Before:**
```typescript
// Sabotage failed
if (detected) {
  // Failed and detected - worst case!
  state.society.paranoia = Math.min(1, (state.society.paranoia ?? 0) + 0.12);
```

**After:**
```typescript
// Sabotage failed
if (detected) {
  // Failed and detected - worst case!
  if (state.society.paranoia === undefined) {
    throw new Error('❌ state.society.paranoia is undefined in aiTechActions.ts:289 - initialization bug');
  }
  state.society.paranoia = Math.min(1, state.society.paranoia + 0.12);
```

**Context:** Failed sabotage that gets detected increases paranoia even more. Same initialization dependency as Fix 2.

---

### 2. `/src/simulation/agents/socialInfluenceActions.ts` (2 fixes)

#### Fix 4: Line 222 - Democracy Quality (Nuclear Chain Length)
**Before:**
```typescript
if (requiresChain) {
  // Nuclear launch requires 4-person chain (or 2 if democracy < 0.4)
  const requiredChainLength = (state.government.democracyQuality ?? 0.5) < 0.4 ? 2 : 4;
```

**After:**
```typescript
if (requiresChain) {
  // Nuclear launch requires 4-person chain (or 2 if democracy < 0.4)
  if (state.government.democracyQuality === undefined) {
    throw new Error('❌ state.government.democracyQuality is undefined in socialInfluenceActions.ts:222 - initialization bug');
  }
  const requiredChainLength = state.government.democracyQuality < 0.4 ? 2 : 4;
```

**Context:** Nuclear launch influence requires determining chain length based on democracy quality. This is a critical decision path - fallbacks would mask initialization bugs.

---

#### Fix 5: Line 381 - Democracy Quality (Influence Success Calculation)
**Before:**
```typescript
// Degraded institutions
if ((state.government.democracyQuality ?? 0.5) < 0.5) {
  successProb += 0.15;
}
```

**After:**
```typescript
// Degraded institutions
if (state.government.democracyQuality === undefined) {
  throw new Error('❌ state.government.democracyQuality is undefined in socialInfluenceActions.ts:381 - initialization bug');
}
if (state.government.democracyQuality < 0.5) {
  successProb += 0.15;
}
```

**Context:** Degraded democratic institutions make influence attempts easier. If democracy quality is undefined, this bonus calculation would be incorrect.

---

### 3. `/src/simulation/agents/societyAgent.ts` (0 fixes)

**Reviewed but no changes needed:**
- Line 40: `state.config.socialAdaptationRate || 1.0` - LEGITIMATE DEFAULT (config is optional)
  - This is a configuration parameter that may legitimately not exist
  - The fallback to 1.0 is intentional design (baseline rate when not configured)

---

## Pattern Analysis

### Defensive Patterns Fixed
1. **Optional chaining with fallback:** `state.defensiveAI?.threatDetection?.detectSleepers || 0`
2. **Nullish coalescing with fallback:** `state.society.paranoia ?? 0`
3. **Nullish coalescing with fallback:** `state.government.democracyQuality ?? 0.5`

### Legitimate Defaults Preserved
1. **Config parameters:** `state.config.socialAdaptationRate || 1.0` (intentional design)

---

## Impact

**Before:** 5 defensive fallbacks silently masked initialization bugs
**After:** 5 explicit checks with clear error messages

All fixes preserve the same logic but fail fast with informative error messages when state is not properly initialized.

---

## Testing Notes

**No tests run as requested** - just code fixes. These changes should be validated by:
1. Running the simulation to ensure no crashes
2. Checking that all initialization paths properly set:
   - `state.defensiveAI.threatDetection.detectSleepers`
   - `state.society.paranoia`
   - `state.government.democracyQuality`

If any crashes occur, it indicates a real initialization bug that was previously hidden by defensive fallbacks.

---

## Related Work

This is part of Phase 3: Defensive Programming Pattern Removal
- Phase 3.1: Core systems (environmental, social cohesion)
- Phase 3.2: Government agent
- **Phase 3.3: Other agents (this work)** ✅
- Phase 3.4: TODO - Additional systems

See MASTER_IMPLEMENTATION_ROADMAP.md for full context.
