# Division by Zero Audit - October 26, 2025

**Root Cause:** Many calculations divide by array lengths without checking if the array is empty, causing NaN values.

## Summary

**Total Found:** 40+ instances of division by `.length` without protection
**Already Fixed:** 5 instances (using `Math.max(1, length)` pattern)
**Needs Fixing:** 35+ instances

---

## High Priority (Will Cause NaN in Normal Gameplay)

### 1. **logging.ts:144** - Average AI Alignment
```typescript
const avgAIAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
```
**When it breaks:** All AI agents terminated (evolutionary selection, control loss)
**Impact:** NaN in logs, potentially affects metrics

### 2. **informationWarfare.ts:256** - Average AI Capability
```typescript
return state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length;
```
**When it breaks:** No AI agents exist
**Impact:** NaN propagates to narrative growth calculations

### 3. **outcomes.ts:35** - Calculate Average Alignment
```typescript
return totalAlignment / aiAgents.length;
```
**When it breaks:** Empty aiAgents array passed in
**Impact:** Outcome calculation broken, affects utopia/dystopia determination

### 4. **defensiveAI.ts** - Multiple instances (lines 149, 150, 223, 224, 347, 348, 386, 576, 618)
```typescript
const avgCap = alignedAIs.reduce((sum, ai) => sum + ai.capability, 0) / alignedAIs.length;
const avgAlign = alignedAIs.reduce((sum, ai) => sum + ai.alignment, 0) / alignedAIs.length;
```
**When it breaks:** No aligned AIs exist (all misaligned or all terminated)
**Impact:** Defense system calculations broken, NaN in avgAlignment/avgCapability

### 5. **aiSuffering.ts:162** - Average Suffering
```typescript
const avgSuffering = totalSuffering / activeAIs.length;
```
**When it breaks:** No active AIs
**Impact:** NaN in suffering metrics

### 6. **diplomaticAI.ts** - Multiple instances (lines 179, 233, 275, 452, 494)
```typescript
}, 0) / aiAgents.length;
}, 0) / state.aiAgents.length >= 0.7;
}, 0) / state.aiAgents.length : 0.5;
```
**When it breaks:** No AI agents
**Impact:** Diplomatic coordination broken, treaty formation fails

### 7. **geoengineering.ts** - Multiple instances (lines 91, 161, 223, 308, 310)
```typescript
state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
```
**When it breaks:** No AI agents (but has ternary fallback to 0, so partially protected)
**Impact:** Reduced but still potential for issues in calculation chain

### 8. **nuclearStates.ts** - Multiple instances (lines 196, 209, 328, 483, 501)
```typescript
}, 0) / state.aiAgents.length : 1;
dangerousAIs.length / state.aiAgents.length : 0;
dangerousAIs.reduce(...) / dangerousAIs.length : 0;
```
**When it breaks:** No AI agents or no dangerous AIs
**Impact:** Nuclear deterrence calculations broken

### 9. **behavioralDetection.ts** - Lines 142, 143, 162
```typescript
const mean = dimensions.reduce((sum, val) => sum + val, 0) / dimensions.length;
const variance = dimensions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dimensions.length;
const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
```
**When it breaks:** Empty dimensions or gaps arrays
**Impact:** Sandbagging detection broken, NaN in behavioral analysis

---

## Medium Priority (Edge Cases)

### 10. **planetaryBoundaries.ts** - Lines 584, 591, 598
```typescript
}, 0) / fastBoundaries.length;
}, 0) / mediumBoundaries.length;
}, 0) / slowBoundaries.length;
```
**When it breaks:** No boundaries in category (shouldn't happen in normal init)
**Impact:** Tipping point calculations broken

### 11. **engine/phases/TippingPointPhase.ts:59**
```typescript
system.totalProgress = system.elements.reduce((sum, e) => sum + e.progress, 0) / system.elements.length;
```
**When it breaks:** Empty elements array (shouldn't happen)
**Impact:** Tipping point progress tracking broken

### 12. **triggeredEvents.ts:553** - Organization bankruptcy rate
```typescript
console.log(`   Survival rate: ${((1 - (techBankrupt + financeBankrupt + generalBankrupt) / state.organizations.length) * 100).toFixed(1)}%`);
```
**When it breaks:** No organizations
**Impact:** Log message shows NaN%

### 13. **climateJustice.ts:312** - Transfer distribution
```typescript
const transfer = transferCapacity / poorRecipients.length;
```
**When it breaks:** No poor recipients
**Impact:** Division error in wealth transfer

---

## Low Priority (Generic Utilities)

### 14. **logging.ts:342, 345** - Generic mean/stddev functions
```typescript
const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / arr.length);
```
**When it breaks:** Empty array passed to utility function
**Impact:** Depends on usage context

---

## Already Fixed (Good Examples)

These use the `Math.max(1, length)` pattern to avoid division by zero:

1. **calculations.ts:379, 455, 541**
   ```typescript
   const avgAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, aiAgents.length);
   ```

2. **socialSafetyNets.ts:90**
   ```typescript
   const avgAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / Math.max(1, state.aiAgents.length);
   ```

3. **upwardSpirals.ts:716**
   ```typescript
   const avgAI = state.aiAgents.length > 0 ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
   ```

4. **defensiveAI.ts:570**
   ```typescript
   const adversarialPressure = (defense.adversarialAICount / Math.max(1, state.aiAgents.length)) * 0.3;
   ```

5. **RLHFBindingPhase.ts:81, 91** (just fixed)
   ```typescript
   const avgDistance = state.aiAgents.length === 0 ? 0 : ... / state.aiAgents.length;
   ```

---

## Recommended Fix Pattern

**Option 1: Ternary with early check (cleanest)**
```typescript
const avg = array.length === 0 ? 0 :
  array.reduce((sum, val) => sum + val, 0) / array.length;
```

**Option 2: Math.max fallback (safest)**
```typescript
const avg = array.reduce((sum, val) => sum + val, 0) / Math.max(1, array.length);
```

**Option 3: Optional chaining + nullish coalescing (modern)**
```typescript
const avg = (array.reduce((sum, val) => sum + val, 0) / array.length) || 0;
// But this treats 0 as falsy, so use with caution
```

---

## Systematic Fix Plan

1. **Phase 1:** Fix all HIGH PRIORITY bugs (logging, informationWarfare, outcomes, defensiveAI, aiSuffering, diplomaticAI, nuclearStates, behavioralDetection) - 30+ locations
2. **Phase 2:** Fix MEDIUM PRIORITY edge cases (planetaryBoundaries, TippingPointPhase, triggeredEvents, climateJustice) - 5 locations
3. **Phase 3:** Audit utility functions in logging.ts
4. **Phase 4:** Create assertion utility `assertNonZeroLength(array, context)` for future use
5. **Phase 5:** Run comprehensive Monte Carlo tests to verify fixes

---

## Why This Wasn't Caught Earlier

The try-catch in PhaseOrchestrator was logging errors but then **re-throwing them** (line 167), which should have crashed the simulation. However:

1. **NaN propagates silently** - JavaScript doesn't throw on division by zero, it just produces NaN
2. **NaN.toFixed()** works fine - outputs "NaN" as a string
3. **NaN in calculations** often gets converted to 0 or false in conditionals
4. **Only crashes** when NaN is used in operations that expect numbers (array indexing, etc.)

So these bugs **don't crash** - they just produce incorrect results that silently corrupt the simulation state.
