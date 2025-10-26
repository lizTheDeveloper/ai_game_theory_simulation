# Phase 3.1 Defensive Programming Audit

**Date:** October 25, 2025
**Scope:** Core state calculation files
**Approach:** Manual fix (no automated scripts per user request)

## Files Audited

1. `src/simulation/environmental.ts` - Environmental accumulation
2. `src/simulation/socialCohesion.ts` - Social systems
3. `src/simulation/technologicalRisk.ts` - Tech risk accumulation
4. `src/simulation/populationDynamics.ts` - Population modeling

## Defensive Patterns Found: 13 Total

### socialCohesion.ts - 9 patterns

**Line 419:** Trust comparison
```typescript
// ❌ CURRENT
} else if ((state.society.trust || 0.5) < 0.3) {

// ✅ FIX
} else if (state.society.trust < 0.3) {
```

**Line 652:** Previous QoL fallback
```typescript
// ❌ CURRENT
const previousQoL = state.globalMetrics.previousQoL || 0.5;

// ✅ FIX
if (!state.globalMetrics.previousQoL) {
  throw new Error('❌ state.globalMetrics.previousQoL is undefined in socialCohesion - initialization bug');
}
const previousQoL = state.globalMetrics.previousQoL;
```

**Line 707:** Previous AI capability
```typescript
// ❌ CURRENT
const previousCapability = (state as any).previousAICapability || 0;

// ✅ FIX
if (!('previousAICapability' in state)) {
  throw new Error('❌ state.previousAICapability is undefined in socialCohesion - initialization bug');
}
const previousCapability = (state as any).previousAICapability;
```

**Line 799:** QoL trend calculation
```typescript
// ❌ CURRENT
const qolTrend = state.globalMetrics.qualityOfLife - (state.globalMetrics.previousQoL || 0.5);

// ✅ FIX
if (!state.globalMetrics.previousQoL) {
  throw new Error('❌ state.globalMetrics.previousQoL is undefined in socialCohesion qolTrend - initialization bug');
}
const qolTrend = state.globalMetrics.qualityOfLife - state.globalMetrics.previousQoL;
```

**Line 837:** Previous misaligned count
```typescript
// ❌ CURRENT
const previousMisaligned = (state as any).previousMisalignedCount || 0;

// ✅ FIX
if (!('previousMisalignedCount' in state)) {
  throw new Error('❌ state.previousMisalignedCount is undefined in socialCohesion - initialization bug');
}
const previousMisaligned = (state as any).previousMisalignedCount;
```

**Line 737:** Paranoia level (LEGITIMATE - has comment explaining default)
```typescript
// ✅ KEEP - This is a legitimate default with explanation
const paranoia = society.paranoiaLevel ?? 0.15; // Default to 15% baseline paranoia
```

**Lines 897-898:** Logging only (KEEP - UI display, not calculation)
```typescript
// ✅ KEEP - Logging/display only, not used in calculations
console.log(`   Elite-mass gap: ${((state.society.eliteMassGap || 0) * 100).toFixed(1)}%`);
console.log(`   Polarization: ${((state.society.polarizationIndex || 0) * 100).toFixed(1)}%`);
```

### populationDynamics.ts - 4 patterns

**Line 327:** Active conflicts
```typescript
// ❌ CURRENT
const activeConflicts = state.conflictResolution?.activeConflicts || 0;

// ✅ FIX
if (!state.conflictResolution?.activeConflicts) {
  throw new Error('❌ state.conflictResolution.activeConflicts is undefined in populationDynamics - initialization bug');
}
const activeConflicts = state.conflictResolution.activeConflicts;
```

**Line 820:** Monthly death cap tracking
```typescript
// ❌ CURRENT
const remainingCapacity = Math.max(0, monthlyDeathCap - (pop.monthlyDeathsApplied || 0));

// ✅ FIX
if (pop.monthlyDeathsApplied === undefined) {
  throw new Error('❌ pop.monthlyDeathsApplied is undefined in populationDynamics - initialization bug');
}
const remainingCapacity = Math.max(0, monthlyDeathCap - pop.monthlyDeathsApplied);
```

**Line 838:** Accumulating monthly deaths
```typescript
// ❌ CURRENT
pop.monthlyDeathsApplied = (pop.monthlyDeathsApplied || 0) + totalDeathsApplied;

// ✅ FIX
if (pop.monthlyDeathsApplied === undefined) {
  throw new Error('❌ pop.monthlyDeathsApplied is undefined in populationDynamics line 838 - initialization bug');
}
pop.monthlyDeathsApplied = pop.monthlyDeathsApplied + totalDeathsApplied;
```

**Line 943:** Accumulating monthly deaths (duplicate pattern)
```typescript
// ❌ CURRENT
pop.monthlyDeathsApplied = (pop.monthlyDeathsApplied || 0) + deathsInBillions;

// ✅ FIX
if (pop.monthlyDeathsApplied === undefined) {
  throw new Error('❌ pop.monthlyDeathsApplied is undefined in populationDynamics line 943 - initialization bug');
}
pop.monthlyDeathsApplied = pop.monthlyDeathsApplied + deathsInBillions;
```

### technologicalRisk.ts - 1 pattern

**Line 50:** Alignment research investment (LEGITIMATE - government may not have invested yet)
```typescript
// ✅ KEEP - Government alignment investment starts at 0, this is a legitimate default
const alignmentResearch = state.government.alignmentResearchInvestment ?? 0;
```

### environmental.ts - 0 patterns

No defensive patterns found - file is clean! ✅

## Summary

**Total patterns:** 13
**To fix:** 8 (removing 2 legitimate defaults, 3 logging-only)
**To keep:** 5 (3 logging, 2 legitimate defaults)

### Patterns to Fix (Priority Order):

1. **socialCohesion.ts** - 5 fixes needed
   - Lines 419, 652, 707, 799, 837

2. **populationDynamics.ts** - 4 fixes needed (critical - death tracking)
   - Lines 327, 820, 838, 943

3. **technologicalRisk.ts** - 0 fixes needed
4. **environmental.ts** - 0 fixes needed

### Next Steps

1. Fix socialCohesion.ts (5 patterns)
2. Fix populationDynamics.ts (4 patterns - CRITICAL, affects mortality calculations)
3. Test with Monte Carlo (N=10, 120 months)
4. Update roadmap

**Estimated effort:** 30-45 minutes for manual fixes + validation
