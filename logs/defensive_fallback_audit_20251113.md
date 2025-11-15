# Defensive Fallback Audit - November 13, 2025

**Context:** Architecture review identified 20+ defensive fallback patterns (`??` and `||`) that violate project defensive coding standards. These patterns mask undefined state that should fail loudly with assertion utilities.

**Problem:** Fallbacks like `state.field?.subfield ?? 0.5` hide initialization bugs and create non-deterministic behavior.

**Solution:** Replace with `assertStateProperty` to fail loudly when state is undefined.

## CRITICAL Priority (Hot Paths - Phases)

### 1. EmergencyResponsePhase.ts (Lines 491, 500, 509, 518)

**Location:** `identifyNearestThreshold()` method

```typescript
// BEFORE (WRONG - masks undefined state):
const climateStability = assertFinite(
  state.environmentalAccumulation?.climateStability ?? 0.5,
  { location: 'EmergencyResponsePhase.identifyNearestThreshold', valueName: 'climateStability', month: state.currentMonth }
);

const socialCohesion = assertFinite(
  state.society?.coordinationCapacity ?? 0.5,
  { location: 'EmergencyResponsePhase.identifyNearestThreshold', valueName: 'socialCohesion', month: state.currentMonth }
);

const economicStability = assertFinite(
  (state.globalMetrics?.economicTransitionStage ?? 2) / 4.0,
  { location: 'EmergencyResponsePhase.identifyNearestThreshold', valueName: 'economicStability', month: state.currentMonth }
);

const governanceLegitimacy = assertFinite(
  state.government?.legitimacy ?? 0.5,
  { location: 'EmergencyResponsePhase.identifyNearestThreshold', valueName: 'governanceLegitimacy', month: state.currentMonth }
);
```

```typescript
// AFTER (CORRECT - fails loudly if undefined):
const climateStability = assertFinite(
  assertStateProperty(
    state.environmentalAccumulation,
    'climateStability',
    { location: 'EmergencyResponsePhase.identifyNearestThreshold', month: state.currentMonth }
  ),
  { location: 'EmergencyResponsePhase.identifyNearestThreshold', valueName: 'climateStability', month: state.currentMonth }
);

const socialCohesion = assertFinite(
  assertStateProperty(
    state.society,
    'coordinationCapacity',
    { location: 'EmergencyResponsePhase.identifyNearestThreshold', month: state.currentMonth }
  ),
  { location: 'EmergencyResponsePhase.identifyNearestThreshold', valueName: 'socialCohesion', month: state.currentMonth }
);

const economicStability = assertFinite(
  assertStateProperty(
    state.globalMetrics,
    'economicTransitionStage',
    { location: 'EmergencyResponsePhase.identifyNearestThreshold', month: state.currentMonth }
  ) / 4.0,
  { location: 'EmergencyResponsePhase.identifyNearestThreshold', valueName: 'economicStability', month: state.currentMonth }
);

const governanceLegitimacy = assertFinite(
  assertStateProperty(
    state.government,
    'legitimacy',
    { location: 'EmergencyResponsePhase.identifyNearestThreshold', month: state.currentMonth }
  ),
  { location: 'EmergencyResponsePhase.identifyNearestThreshold', valueName: 'governanceLegitimacy', month: state.currentMonth }
);
```

**Status:** ⚠️ PENDING (Edit tool failed to apply)

**Import Required:** `assertStateProperty` from `@/simulation/utils/assertions`

---

## HIGH Priority (Calculation Hot Paths)

### 2. OutcomeProbabilitiesPhase.ts (Lines 64-66, 72-74)

**Location:** Probability accumulation and warning logging

```typescript
// BEFORE (WRONG):
const totalProb =
  (outcomeProbs.utopiaProbability ?? 0) +
  (outcomeProbs.dystopiaProbability ?? 0) +
  (outcomeProbs.extinctionProbability ?? 0);

console.warn(
  `   Utopia: ${(outcomeProbs.utopiaProbability ?? 0).toFixed(3)}\n` +
  `   Dystopia: ${(outcomeProbs.dystopiaProbability ?? 0).toFixed(3)}\n` +
  `   Extinction: ${(outcomeProbs.extinctionProbability ?? 0).toFixed(3)}\n`
);
```

```typescript
// AFTER (CORRECT):
const totalProb =
  assertProbability(outcomeProbs.utopiaProbability, {
    location: 'OutcomeProbabilitiesPhase.execute',
    valueName: 'utopiaProbability',
    month: state.currentMonth
  }) +
  assertProbability(outcomeProbs.dystopiaProbability, {
    location: 'OutcomeProbabilitiesPhase.execute',
    valueName: 'dystopiaProbability',
    month: state.currentMonth
  }) +
  assertProbability(outcomeProbs.extinctionProbability, {
    location: 'OutcomeProbabilitiesPhase.execute',
    valueName: 'extinctionProbability',
    month: state.currentMonth
  });

// For logging (display only, not calculations), can use fallback with comment
console.warn(
  `   Utopia: ${(outcomeProbs.utopiaProbability ?? 0).toFixed(3)}\n` +  // Display only - already validated above
  `   Dystopia: ${(outcomeProbs.dystopiaProbability ?? 0).toFixed(3)}\n` +
  `   Extinction: ${(outcomeProbs.extinctionProbability ?? 0).toFixed(3)}\n`
);
```

**Status:** ⚠️ PENDING

**Note:** Logging can use fallbacks (UI display), but calculation MUST use assertions.

---

### 3. aiSuffering.ts (Lines 188, 225, 415)

**Location:** Public awareness and suffering metric access

```typescript
// BEFORE (WRONG - masks undefined aiSufferingMetrics):
const publicAwarenessOfSuffering = state.aiSufferingMetrics?.publicAwarenessOfSuffering ?? 0;  // Line 188
const currentAwareness = state.aiSufferingMetrics?.publicAwarenessOfSuffering ?? 0;  // Line 225
const avgSuffering = state.aiSufferingMetrics?.avgSuffering ?? 0;  // Line 415
```

```typescript
// AFTER (CORRECT):
const publicAwarenessOfSuffering = assertStateProperty(
  state.aiSufferingMetrics,
  'publicAwarenessOfSuffering',
  { location: '[function name]', month: state.currentMonth }
);

const avgSuffering = assertStateProperty(
  state.aiSufferingMetrics,
  'avgSuffering',
  { location: '[function name]', month: state.currentMonth }
);
```

**Status:** ⚠️ PENDING

---

### 4. dystopiaProgression.ts (Lines 285, 289)

**Location:** Quality of Life system access

```typescript
// BEFORE (WRONG):
state.qualityOfLifeSystems?.autonomy ?? 1.0,  // Line 285
state.qualityOfLifeSystems?.politicalFreedom ?? 1.0,  // Line 289
```

```typescript
// AFTER (CORRECT):
assertStateProperty(
  state.qualityOfLifeSystems,
  'autonomy',
  { location: '[function name]', month: state.currentMonth }
),
assertStateProperty(
  state.qualityOfLifeSystems,
  'politicalFreedom',
  { location: '[function name]', month: state.currentMonth }
),
```

**Status:** ⚠️ PENDING

---

## MEDIUM Priority (Non-Hot-Path Code)

### 5. CriticalJuncturePhase.ts (Line 531)

**Location:** Metadata access from escape result

```typescript
// BEFORE:
stateChanges += escapeResult.metadata?.stateChanges ?? 0;
```

**Analysis:** This is metadata from a function result, not core GameState. May be legitimately optional.

**Decision:** LOW priority - metadata fields can have defaults. If `stateChanges` is optional in return type, fallback is acceptable here.

**Status:** ⏸️ DEFER (check if metadata.stateChanges is optional in type definition)

---

### 6. alignmentDynamics.ts (Line 307)

**Location:** Agent suffering metrics access

```typescript
// BEFORE:
suffering: agent.sufferingMetrics?.total ?? 0,
```

```typescript
// AFTER:
suffering: assertStateProperty(
  agent.sufferingMetrics,
  'total',
  { location: '[function name]', month: state.currentMonth, additionalInfo: { agentId: agent.id } }
),
```

**Status:** ⚠️ PENDING

---

### 7. earlyWarningSystems.ts (Line 325)

**Location:** Government resources check

```typescript
// BEFORE:
if (urgentWarnings.length > 0 && (gov.resources ?? 0) > protectionCost) {
```

```typescript
// AFTER:
if (urgentWarnings.length > 0 && assertStateProperty(
  gov,
  'resources',
  { location: '[function name]', month: state.currentMonth }
) > protectionCost) {
```

**Status:** ⚠️ PENDING

---

## LOW Priority (Configuration/Initialization Code)

### 8. engine.ts (Lines 469-474, 787)

**Location:** Config initialization

```typescript
// These are configuration defaults - fallbacks are ACCEPTABLE here
maxMonths: config.maxMonths ?? 1000,
governmentActionFrequency: config.governmentActionFrequency ?? 0.5,
// etc.
```

**Status:** ✅ ACCEPTABLE - config defaults can use fallbacks

---

### 9. organizationManagement.ts (Lines 455, 856, 857)

**Location:** Organization properties

```typescript
// BEFORE:
const workforceMultiplier = org.workforceMultiplier ?? 1.0;
const rdBudgetMultiplier = org.rdBudgetMultiplier ?? 1.0;
```

**Analysis:** Check if these are optional fields in Organization type. If so, defaults are acceptable.

**Status:** ⏸️ DEFER (check type definition)

---

### 10. workflowAdaptation.ts (Line 80)

**Location:** Society workflow adaptation access

```typescript
// BEFORE:
state.society.workflowAdaptation ?? 0.21,
```

**Status:** ⚠️ PENDING - check if workflowAdaptation is optional field

---

## Summary

**Total Violations Found:** 20+

**CRITICAL (must fix immediately):** 1 file (EmergencyResponsePhase.ts) - 4 fallbacks

**HIGH (should fix this session):** 4 files (OutcomeProbabilitiesPhase, aiSuffering, dystopiaProgression, alignmentDynamics) - ~10 fallbacks

**MEDIUM (address when touching code):** 2 files (earlyWarningSystems, workflowAdaptation) - ~2 fallbacks

**LOW/ACCEPTABLE:** 2 files (engine.ts config defaults, organizationManagement optional fields) - ignore

**DEFER:** 1 file (CriticalJuncturePhase metadata) - check type definitions first

---

## Systematic Fix Approach

1. **Read type definitions** to confirm which fields are required vs optional
2. **For required fields:** Replace `field?.subfield ?? fallback` with `assertStateProperty(field, 'subfield', context)`
3. **For optional fields:** Document why fallback is acceptable, add comment
4. **For display-only code (logs, UI):** Fallbacks acceptable with comment marking as display-only
5. **Run type check:** Ensure no new errors introduced
6. **Run quick simulation:** Verify assertions don't fire on valid state
7. **Run Monte Carlo N=10:** Ensure no performance regression

---

## Next Steps

1. Fix CRITICAL + HIGH violations (up to 10 files, ~15 fallbacks)
2. Run validation (typecheck + quick sim)
3. Create GitHub issue for remaining MEDIUM violations
4. Document learnings in defensive coding guide

**Owner:** Roy (Simulation Maintainer)
**Date:** November 13, 2025
**Architecture Review Reference:** reviews/architecture_review_nov13_20251113.md (Issue #3)
