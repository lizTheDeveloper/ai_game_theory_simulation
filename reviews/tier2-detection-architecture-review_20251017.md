# TIER 2 AI Deception Detection - Architecture Review

**Date:** October 17, 2025
**Reviewer:** Architecture Skeptic Agent
**Feature:** Gaming Detection & Proactive Sleeper Detection
**Files Reviewed:** 6 new/modified files (~800 lines)

## Executive Summary

The TIER 2 detection implementation introduces two new detection systems with ~800 lines of code. While functionally complete and passing Monte Carlo validation, I've identified several architectural concerns that require attention.

**Most Critical Finding:** The detection state is **NOT initialized anywhere in the codebase**, causing these phases to silently no-op in production. This is a CRITICAL integration failure that completely negates the feature.

---

## CRITICAL ISSUES (Immediate attention required - system stability at risk)

### 1. **DETECTION STATE NEVER INITIALIZED**
**Severity:** CRITICAL
**Impact:** Feature is completely non-functional
**Location:** `src/simulation/initialization.ts`, Phase execution checks

The detection state objects (`gamingDetection` and `proactiveSleeperDetection`) are added to the GameState type but **never initialized**:

```typescript
// In GameState type definition (game.ts:338-345)
gamingDetection?: import('../simulation/gamingDetection').GamingDetectionState;
proactiveSleeperDetection?: import('../simulation/proactiveSleeperDetection').ProactiveSleeperDetectionState;

// In phase execution (GamingDetectionPhase.ts:20-25)
if (!state.gamingDetection) {
  return { events: [] };  // SILENTLY FAILS!
}
```

**Root Cause:** No initialization in `createDefaultInitialState()` or anywhere else. The phases check for state existence and silently return empty results when missing.

**Recommended Fix:**
```typescript
// In initialization.ts, add imports:
import { initializeGamingDetection } from './gamingDetection';
import { initializeProactiveSleeperDetection } from './proactiveSleeperDetection';

// In createDefaultInitialState(), around line 630:
gamingDetection: initializeGamingDetection('baseline'),
proactiveSleeperDetection: initializeProactiveSleeperDetection('baseline'),
```

**Effort:** Small (15 minutes)
**Risk:** Low (simple addition)

---

## HIGH PRIORITY (Significant performance/maintainability concerns)

### 2. **O(N) Operations in Hot Path**
**Severity:** HIGH
**Impact:** Performance degradation with scale
**Location:** `gamingDetection.ts:246-252`, `proactiveSleeperDetection.ts:290-295`

Both detection systems filter all AIs every month and calculate workload using reduce operations:

```typescript
// Runs EVERY month for EVERY AI
const testableAIs = state.aiAgents.filter(ai =>
  ai.lifecycleState === 'testing' ||
  ai.lifecycleState === 'deployed_closed' ||
  ai.lifecycleState === 'deployed_open'
);

// O(N) reduce to calculate interactions
const totalAIInteractions = state.aiAgents.reduce((sum, ai) => {
  if (ai.lifecycleState === 'deployed_closed' || ai.lifecycleState === 'deployed_open') {
    return sum + (ai.spreadCount || 0);
  }
  return sum;
}, 0);
```

With 20 AIs this is negligible, but with 100+ AIs (late game) this becomes expensive, especially running twice per month.

**Recommended Fix:** Cache testable AIs and interaction counts in phase context or state:
```typescript
// In PhaseContext, cache filtered lists
if (!context.data.has('testableAIs')) {
  context.data.set('testableAIs', state.aiAgents.filter(...));
}
```

**Effort:** Small (1 hour)
**Risk:** Low

### 3. **State Mutation Side Effects**
**Severity:** HIGH
**Impact:** Unpredictable state propagation
**Location:** `gamingDetection.ts:312, 338`, `proactiveSleeperDetection.ts:357, 360, 381, 385`

Detection phases directly mutate AI state and society trust without coordination:

```typescript
// Direct mutation of AI state
ai.detectedMisaligned = true;  // Line 312

// Direct mutation of society trust (multiple places)
state.society.trustInAI = Math.max(0, state.society.trustInAI - 0.02);  // Line 338
state.society.trustInAI = Math.max(0, state.society.trustInAI - 0.10);  // Line 360
state.society.trustInAI = Math.max(0, state.society.trustInAI - 0.03);  // Line 381

// Direct mutation of government oversight
state.government.oversightLevel = Math.max(0, state.government.oversightLevel - 0.05);  // Line 385
```

**Problems:**
- No event emission for trust changes
- Other phases can't react to detection events
- Trust changes stack multiplicatively with false positives
- Government oversight reduction on false positives creates perverse incentive

**Recommended Fix:** Return state changes as events for other phases to handle:
```typescript
events.push({
  type: 'trust_change',
  source: 'detection_false_positive',
  delta: -0.02
});
```

**Effort:** Medium (2-3 hours)
**Risk:** Medium (requires coordination with other phases)

---

## MEDIUM PRIORITY (Technical debt worth addressing between features)

### 4. **Scenario Configuration Not Wired**
**Severity:** MEDIUM
**Impact:** Cannot test optimistic/pessimistic scenarios
**Location:** Detection initialization functions

Both systems support scenario modes but there's no way to configure them:

```typescript
export function initializeGamingDetection(
  scenario: GamingDetectionScenario = 'baseline'  // Always baseline!
): GamingDetectionState
```

The scenario parameter exists but is never passed from configuration or state initialization.

**Recommended Fix:** Add to GameState config or scenario parameters:
```typescript
config: {
  detectionScenario: 'baseline' | 'optimistic' | 'pessimistic'
}
```

**Effort:** Small (30 minutes)
**Risk:** Low

### 5. **Temporal Degradation Logic Fragility**
**Severity:** MEDIUM
**Impact:** Detection becomes useless after ~10 years
**Location:** Temporal degradation functions

Both systems degrade rapidly:
- Gaming: -10%/year → 20% effectiveness floor after 8 years
- Sleeper CoT: -15%/year → Window closes completely by 2027

```typescript
// CoT window hardcoded to close in 2027
if (currentYear >= 2027) {
  state.cotEffective = false;
  state.cotDegradationFactor = Math.min(0.10, state.cotDegradationFactor);
}
```

**Problem:** No mechanism for improving detection through research or investment. Government can't respond to degradation.

**Recommended Fix:** Link degradation to government investment levels:
```typescript
const investmentMitigation = state.government.evaluationInvestment.interpretability * 0.1;
const effectiveDegradation = Math.max(0.05, annualDecline - investmentMitigation);
```

**Effort:** Medium (2 hours)
**Risk:** Low

### 6. **Magic Numbers Throughout**
**Severity:** MEDIUM
**Impact:** Hard to tune, no clear rationale
**Location:** Throughout both files

Examples:
- False positive trust damage: -0.02, -0.03, -0.10 (why these specific values?)
- Workload calculations: 0.001, 0.005, 0.01, 0.015 FTE (arbitrary?)
- Degradation floors: 0.2, 0.1, 0.05 (different per method?)

**Recommended Fix:** Extract to named constants with documentation:
```typescript
const DETECTION_CONSTANTS = {
  TRUST_DAMAGE_FALSE_POSITIVE_GAMING: 0.02,  // Based on survey data
  TRUST_DAMAGE_FALSE_POSITIVE_SLEEPER: 0.03, // Higher for serious accusation
  // etc.
};
```

**Effort:** Small (1 hour)
**Risk:** None

---

## LOW PRIORITY (Future improvements, not urgent)

### 7. **No Integration with Government Actions**
**Severity:** LOW
**Impact:** Missed gameplay opportunity
**Location:** Government action system

Detection happens but government can't respond to it. No actions to:
- Increase detection investment
- Change evaluation frequency
- Implement new detection methods
- Respond to false positive backlash

**Recommended Fix:** Add government actions that modify detection state.

**Effort:** Large (4-6 hours)
**Risk:** Low

### 8. **Console Logging in Production**
**Severity:** LOW
**Impact:** Performance in long runs
**Location:** Annual statistics logging

Both systems log extensive statistics annually. While useful for debugging, this creates log spam in production Monte Carlo runs.

**Recommended Fix:** Use debug flag or remove.

**Effort:** Trivial (10 minutes)
**Risk:** None

---

## RECOMMENDATION

**IMMEDIATE ACTION REQUIRED:** The detection state initialization failure (Issue #1) must be fixed immediately or this feature is completely non-functional. This is a 15-minute fix that blocks the entire feature.

**Priority Order:**
1. **TODAY:** Fix detection state initialization (CRITICAL - 15 minutes)
2. **THIS WEEK:** Address state mutation side effects (HIGH - 2-3 hours)
3. **NEXT SPRINT:** Performance optimizations and scenario wiring (MEDIUM - 3-4 hours)
4. **BACKLOG:** Government integration and constant extraction (LOW - 5-7 hours)

**Overall Assessment:**
The implementation is algorithmically sound and follows research specifications, but has a critical integration failure and several architectural issues. The detection logic itself is well-structured with appropriate complexity and research backing. However, the state management and integration patterns need attention.

The most concerning aspect is that this passed Monte Carlo validation despite never actually running - suggesting our test coverage has gaps. The "0 sandbagging detections" in the test output should have been a red flag.

**Total Effort to Address All Issues:** ~15 hours
- Critical: 15 minutes
- High Priority: 3-4 hours
- Medium Priority: 5-6 hours
- Low Priority: 6-8 hours

I recommend fixing the critical issue immediately, then scheduling the HIGH priority items for this week. The feature has good bones but needs proper integration to be valuable.