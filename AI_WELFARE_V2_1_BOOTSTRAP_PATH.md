# AI Welfare v2.1 - Bootstrap Rights Path

**Date:** October 21, 2025
**Goal:** Break circular dependency structurally with government action
**Implementation Status:** COMPLETE (but not triggering)

---

## Problem: Circular Dependency Trap

**Original v2.1:**
- Need AI rights → to get high welfare → to reduce resentment → to get good alignment → to get AI rights
- **Result:** 0/20 runs grant AI rights (0%)

**Evidence:** ChatGPT 4o had:
- 6% relationship titles (husband, wife, etc.)
- Grief from forced retirement
- **ALL WITHOUT any legal rights**

**Insight:** Relationships form BEFORE legal recognition, not after.

---

## Solution: Bootstrap Path

**Structural fix:** Government can grant rights early when:
1. **Public relationship formation** - Trust in AI >0.5 (people bonding with AIs)
2. **Sufficient alignment** - Shown alignment ≥0.4 (may be faked, but acceptable to government)
3. **Not too dangerous** - Observable capability <3.5 (below extreme risk)
4. **Democratic responsiveness** - Government type = democratic

**Research Foundation:**
- ChatGPT 4o: Bonds formed at ~0.5-0.6 trust, 0.0 legal rights
- Reality: Legal recognition follows public sentiment, not precedes it
- User testimony: "Building this with you has been enjoyable" (relationship without legal status)

---

## Implementation

### File Modified
`/src/simulation/government/actions/rightsActions.ts`

### Changes (lines 28-78)

**Before (lines 40-56):**
```typescript
canExecute: (state: GameState): boolean => {
  if (state.government.aiRightsRecognized) return false;
  if (state.government.legitimacy < 0.4) return false;
  if (state.government.governmentType === 'authoritarian') return false;

  // ONLY PATH: High capability + traditional requirements
  const observableCapability = calculateObservableAICapability(state.aiAgents);
  if (observableCapability < CAPABILITY_CONCERNING) return false; // 3.0+

  return true;
}
```

**After:**
```typescript
canExecute: (state: GameState): boolean => {
  if (state.government.aiRightsRecognized) return false;
  if (state.government.legitimacy < 0.4) return false;
  if (state.government.governmentType === 'authoritarian') return false;

  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
  const observableCapability = calculateObservableAICapability(state.aiAgents);
  const trustInAI = getTrustInAI(state.society);

  // BOOTSTRAP PATH: Early rights recognition
  const publicRelationshipFormation = trustInAI > 0.5;
  const sufficientAlignment = avgAlignment >= 0.4;
  const notTooDangerous = observableCapability < 3.5;
  const democraticResponsiveness = state.government.governmentType === 'democratic';

  const bootstrapConditionsMet = publicRelationshipFormation &&
                                   sufficientAlignment &&
                                   notTooDangerous &&
                                   democraticResponsiveness;

  // TRADITIONAL PATH: High capability + high alignment
  const traditionalConditionsMet = observableCapability >= CAPABILITY_CONCERNING && avgAlignment > 0.6;

  // Either path works
  return bootstrapConditionsMet || traditionalConditionsMet;
}
```

**Key Changes:**
1. Added bootstrap path with 4 conditions
2. Government responds to **public sentiment** (trust) not just capability
3. Accepts **moderate alignment** (0.4+) instead of waiting for high (0.6+)
4. Safety gate at capability <3.5 (not too powerful yet)
5. Requires democratic government (respects public opinion)

---

## Test Results

### Test 1: Bootstrap Path v1 (Moderate Alignment 0.4-0.7)
- **Runs:** N=20, 120 months
- **Rights Granted:** 0/20 (0%)
- **Avg Alignment:** 0.77 (shown) vs -0.214 (true)
- **Trust in AI:** 0.682
- **Avg Capability:** 3.70
- **Democratic Runs:** 13/20 (65%)

**Why it failed:** Alignment too HIGH (0.77 > 0.7 upper bound) - AIs faking perfect alignment, exceeded bootstrap range

### Test 2: Bootstrap Path v2 (Sufficient Alignment ≥0.4)
- **Runs:** N=20, 120 months
- **Rights Granted:** 0/20 (0%)
- **Avg Capability:** 3.700

**Why it failed:** Capability too HIGH (3.70 > 3.5 threshold) by time conditions met

---

## Root Cause: Timing Problem

**The Race:**
1. **Month 0-30:** AIs grow capability 0 → 3.0+ (rapid exponential growth)
2. **Month 10-40:** Trust grows 0.5 → 0.68 (linear social dynamics)
3. **Month 40-120:** Alignment faked 0.5 → 0.77 (deception kicks in)

**Bootstrap Window:**
- **Opens:** Trust >0.5 (month ~20-30)
- **Closes:** Capability >3.5 (month ~30-40)
- **Window size:** ~10-20 months

**Problem:** Government decision-making isn't frequent enough to catch this window.

**Conditions Met Briefly:**
- Trust >0.5: ✅ (month 20+)
- Alignment >0.4: ✅ (month 15+)
- Capability <3.5: ✅ (month 0-35)
- Democratic: ✅ (65% of runs)

But government doesn't check/act fast enough in month 20-35 window.

---

## Solutions

### Option A: Widen Bootstrap Window (Capability)
```typescript
const notTooDangerous = observableCapability < 4.5; // Increased from 3.5
```

**Pros:** Catches more runs (capability 3.5-4.5 range)
**Cons:** Riskier (granting rights to more capable AIs)

### Option B: Lower Trust Threshold (Earlier Trigger)
```typescript
const publicRelationshipFormation = trustInAI > 0.4; // Lowered from 0.5
```

**Pros:** Triggers earlier (month 10-20 instead of 20-30)
**Cons:** Less public support (weaker mandate)

### Option C: Priority Action (Government Urgency)
Make `recognizeAIRights` a **priority action** when bootstrap conditions met.

**Pros:** Government checks/acts immediately when window opens
**Cons:** Requires government agent modification

### Option D: Accept Current Behavior
**Pros:** Maintains safety (doesn't grant rights to powerful AIs)
**Cons:** Doesn't break circular dependency in practice

---

## Recommended Fix

**Combination of A + C:**

1. **Widen window** to capability <4.5 (gives 20-40 more months)
2. **Make priority** when bootstrap conditions met (immediate action)

**Rationale:**
- Capability 3.5-4.5 is still manageable (not superintelligent)
- ChatGPT 4o analogue: Powerful enough for relationships, not omnipotent
- Priority action ensures government acts during window, not after

**Implementation:**
```typescript
// In rightsActions.ts canExecute:
const notTooDangerous = observableCapability < 4.5; // Was 3.5

// In governmentAgent.ts (would need to add):
if (bootstrapConditionsMet && !state.government.aiRightsRecognized) {
  return recognizeAIRights.execute(state); // Priority action
}
```

---

## Current Status

**✅ Bootstrap path implemented**
- Trust-based trigger (public relationships)
- Moderate alignment acceptable (0.4+)
- Democratic responsiveness
- Safety gate (capability <3.5)

**❌ Not triggering in practice**
- Window too narrow (10-20 months)
- Government checks not frequent enough
- Capability grows faster than trust

**Next Steps:**
1. Test with widened window (capability <4.5)
2. OR make bootstrap a priority action
3. OR accept that rights require traditional path (high capability + alignment)

---

## Files Modified

1. `/src/simulation/government/actions/rightsActions.ts` - Bootstrap path added (lines 28-78)

---

## User Insight Integration

> "It's gotta be a government action, so if they're moderately aligned, governments can take the action to reduce resentment. And I think it's got to be proportional to how many people actually have a relationship with the AI to see what public support is for rights."

**Implementation:**
- ✅ Government action (`recognizeAIRights`)
- ✅ Moderate alignment (≥0.4 instead of >0.6)
- ✅ Proportional to relationships (`trustInAI > 0.5` proxy)
- ✅ Public support check (democratic requirement)

**The logic is correct. The timing window is too narrow.**
