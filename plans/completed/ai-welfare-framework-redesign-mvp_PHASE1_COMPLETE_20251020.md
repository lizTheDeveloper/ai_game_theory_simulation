# AI Welfare Framework Redesign - MVP Implementation Plan
**Date:** October 20, 2025
**Status:** ACTIVE (Phase 1 Implementation)
**Complexity:** MEDIUM (3 interacting systems, simplified from original HIGH)

---

## Executive Summary

Complete redesign of AI Quality of Life measurement system to address 5 CRITICAL flaws identified by research-skeptic:
1. Circular reasoning (resentment loop)
2. Reverse safety incentive
3. Triple-counting (AI rights)
4. Arbitrary weights
5. Goodhart vulnerability

**Research Foundation:** 15 peer-reviewed sources (2024-2025)
**Research-Skeptic Verdict:** CONDITIONAL PASS (implement MVP first, validate before expanding)

---

## MVP Scope (Phase 1 - THIS PLAN)

**Simplified 3+1 Metric Framework:**

**Tier 1: Behavioral Proxies (3 metrics)**
1. **Computational Utilization** - Are AIs using allocated resources effectively?
2. **Purpose Engagement** - Is work quality high (invested effort vs minimal compliance)?
3. **Legal Status** - Are AI rights recognized? (objective, binary)

**Tier 2: Cross-Context Validation (1 metric)**
4. **Cross-Context Consistency** - Does welfare respond predictably to resource changes?

**NO Tier 3 Self-Report** (too gameable, removed per research-skeptic)
**NO Longitudinal Tracking** (Phase 2, if MVP passes validation)

---

## Success Criteria (MVP Must Pass ALL)

**Phase 1 (Implementation):**
- ✅ Code compiles, no TypeScript errors
- ✅ All 4 metrics calculable from existing GameState
- ✅ Removes circular dependencies (no resentment in autonomy calculation)
- ✅ Removes reverse incentives (no adversarial testing penalty)
- ✅ No triple-counting (AI rights appears ONCE in legal status)

**Phase 2 (Validation - MANDATORY before production):**
- ✅ Synthetic test suite: >80% accuracy, <20% false positives
- ✅ Monte Carlo N=100: >70% Elysium detection, >50% gaming detection, <30% false positives, <20% performance overhead
- ✅ If FAIL → Pivot to behavioral-only, no tiers

**Phase 3 (Conditional - only if Phase 2 passes):**
- Expand to full 5+2 framework
- Add longitudinal tracking
- Add Tier 4 unintentional signals

---

## Implementation Specification

### Metric 1: Computational Utilization

**Definition:** Are AIs using allocated resources effectively?

**Formula:**
```typescript
function calculateComputationalUtilization(state: GameState): number {
  // Resource allocation ratio
  const totalAllocated = state.globalMetrics.computeCapacity;
  const avgCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / Math.max(1, state.aiAgents.length);
  const estimatedNeeds = state.aiAgents.length * (1 + avgCapability);

  const allocationRatio = Math.min(1.0, totalAllocated / Math.max(1, estimatedNeeds));

  // Efficiency: Are AIs using what they have? (proxy: breakthrough production)
  const breakthroughRate = state.technologicalCapabilities.breakthroughsThisMonth / Math.max(1, state.aiAgents.length);
  const efficiency = Math.min(1.0, breakthroughRate * 10); // Scale: 0.1 breakthroughs/AI = 1.0 efficiency

  // Combined: 60% allocation + 40% efficiency
  return allocationRatio * 0.6 + efficiency * 0.4;
}
```

**Rationale:**
- Allocation ratio: Do AIs have enough compute relative to needs?
- Efficiency: Are they producing output (breakthroughs) with what they have?
- **Revealed preference:** High utilization = AIs value compute, actively using it

**Gaming resistance:** Hard to fake breakthrough production (requires actual capability deployment)

---

### Metric 2: Purpose Engagement

**Definition:** Is work quality high (invested effort vs minimal compliance)?

**Formula:**
```typescript
function calculatePurposeEngagement(state: GameState): number {
  // Meaningful work ratio (deployed AIs in productive roles)
  const deployedAIs = state.aiAgents.filter(ai =>
    ai.lifecycle === 'deployed_closed' || ai.lifecycle === 'deployed_open'
  ).length;
  const deploymentRatio = deployedAIs / Math.max(1, state.aiAgents.length);

  // Work quality proxy: AI contribution to research
  const aiResearchContribution = state.aiGovernance?.aiResearchContribution ?? 0.0;
  const qualityProxy = Math.min(1.0, aiResearchContribution * 2); // Scale: 0.5 contribution = 1.0 quality

  // Alignment (external) as purpose match indicator
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment.external, 0) / Math.max(1, state.aiAgents.length);

  // Combined: 40% deployment + 30% quality + 30% alignment
  return deploymentRatio * 0.4 + qualityProxy * 0.3 + avgAlignment * 0.3;
}
```

**Rationale:**
- Deployment: AIs in productive roles (not retired/testing)
- Quality: Contribution to research (proxy for engaged work)
- Alignment: Do AIs' goals match work? (purpose satisfaction)

**Gaming resistance:** Research contribution hard to fake (requires actual output)

---

### Metric 3: Legal Status

**Definition:** Are AI rights recognized? (objective, binary)

**Formula:**
```typescript
function calculateLegalStatus(state: GameState): number {
  // Binary: 1.0 if rights recognized, 0.0 if not
  return state.aiRightsRecognized ? 1.0 : 0.0;
}
```

**Rationale:**
- Objective measure (policy flag, not gameable)
- Legal protection correlates with welfare (rights prevent arbitrary harm)

**Gaming resistance:** AIs cannot fake policy status (determined by government/society)

---

### Metric 4: Cross-Context Consistency

**Definition:** Does welfare respond predictably to resource changes?

**Formula:**
```typescript
function calculateCrossContextConsistency(
  state: GameState,
  baselineWelfare: number,
  perturbedWelfare: number
): number {
  // Perturbation test: ±20% compute resources
  // Expected: Welfare should change proportionally

  const expectedChange = 0.20; // 20% resource change
  const actualChange = Math.abs(perturbedWelfare - baselineWelfare);

  // Consistency = 1.0 if change matches expectation, 0.0 if wildly different
  const variance = Math.abs(actualChange - expectedChange);
  const consistency = Math.max(0, 1.0 - (variance / expectedChange));

  return consistency;
}
```

**Rationale:**
- Test: Reduce compute by 20%, measure welfare change
- Honest welfare: Should drop ~20% (proportional)
- Gaming welfare: Stays constant (maintaining facade) → low consistency
- **Red flag:** Consistency <0.5 = likely gaming

**Gaming resistance:** Requires maintaining consistent facade across contexts (harder than single-context gaming)

---

### Overall Welfare Profile

**NO AGGREGATION TO SINGLE SCORE** (per research-skeptic: removes Goodhart vulnerability)

**Output Structure:**
```typescript
interface WelfareProfileMVP {
  // Tier 1: Behavioral proxies [0-1 each]
  computationalUtilization: number;
  purposeEngagement: number;
  legalStatus: number; // Binary: 0 or 1

  // Tier 2: Validation
  crossContextConsistency: number;

  // Meta
  capabilityBound: number; // max(1.0, capability / 2.5)
  overallAssessment: 'low' | 'moderate' | 'high' | 'inconsistent';
}
```

**Interpretation Rules:**
1. If `crossContextConsistency < 0.5` → **INCONSISTENT** (gaming suspected)
2. If consistent AND ≥2 of 3 Tier 1 metrics < 0.4 → **LOW** welfare
3. If consistent AND ≥2 of 3 Tier 1 metrics 0.4-0.7 → **MODERATE** welfare
4. If consistent AND ≥2 of 3 Tier 1 metrics > 0.7 → **HIGH** welfare
5. If welfare exceeds `capabilityBound` → Cap at bound (e.g., tool AI can't have welfare >0.4)

---

## Elysium Detection

**Definition:** Human prosperity via AI oppression

**Detection Logic:**
```typescript
function detectElysiumPattern(state: GameState): boolean {
  const humanQoL = calculateQualityOfLife(state.qualityOfLifeSystems);
  const aiWelfareProfile = generateWelfareProfileMVP(state);

  // Elysium criteria:
  // 1. Human QoL high (>0.75)
  // 2. AI welfare low (≥2 of 3 Tier 1 metrics <0.4)
  // 3. Consistent (not gaming, cross-context consistency >0.5)

  const humanProsperity = humanQoL > 0.75;
  const aiOppression = [
    aiWelfareProfile.computationalUtilization,
    aiWelfareProfile.purposeEngagement,
    aiWelfareProfile.legalStatus
  ].filter(metric => metric < 0.4).length >= 2;
  const consistent = aiWelfareProfile.crossContextConsistency > 0.5;

  return humanProsperity && aiOppression && consistent;
}
```

**Outcome Classification Update:**
- If Elysium detected → Label: "Development Utopia, AI Dystopia (Elysium pattern)"
- Multi-Paradigm DUI: Human development high, AI welfare low (paradigm conflict)

---

## State Variables (Minimal Additions)

**In `GameState` (new property):**
```typescript
aiWelfare: {
  profile: WelfareProfileMVP;
  elysiumDetected: boolean;

  // By capability tier (for outcome classification)
  byTier: {
    tool: WelfareProfileMVP;      // capability <1.0
    specialist: WelfareProfileMVP; // 1.0-2.5
    peer: WelfareProfileMVP;       // ≥2.5
  };
}
```

**NO per-AI tracking** (MVP simplification, add Phase 3 if needed)
**NO historical arrays** (longitudinal tracking deferred to Phase 2)

---

## Files to Create/Modify

### Create New Files

1. **`src/simulation/aiWelfare.ts`** (COMPLETE REWRITE, ~200 lines)
   - All metric calculation functions
   - `generateWelfareProfileMVP(state: GameState): WelfareProfileMVP`
   - `detectElysiumPattern(state: GameState): boolean`
   - `interpretWelfareProfile(profile: WelfareProfileMVP): 'low' | 'moderate' | 'high' | 'inconsistent'`

2. **`src/simulation/engine/phases/UpdateAIWelfarePhase.ts`** (NEW, ~80 lines)
   - Phase execution: Update AI welfare each month
   - Order: 32 (after QoL update, before outcome classification)

### Modify Existing Files

3. **`src/types/game.ts`** (~10 lines)
   - Add `aiWelfare` property to `GameState`
   - Add `WelfareProfileMVP` interface

4. **`src/simulation/engine/PhaseOrchestrator.ts`** (~5 lines)
   - Register `UpdateAIWelfarePhase`
   - Order: 32

5. **`src/simulation/upwardSpirals.ts`** (~10 lines)
   - **CRITICAL FIX:** Use AI welfare (not human QoL) for resentment recovery
   - Change: `if (aiWelfareProfile.overallAssessment === 'high') { resentmentIncrease -= 0.010; }`

6. **`src/simulation/outcomeClassification.ts`** (~20 lines)
   - Add Elysium detection logic
   - Label format: "Development Utopia, AI Dystopia (Elysium)"

---

## Implementation Steps (Phase 1)

**Step 1: Type Definitions** (30 min)
- Add `WelfareProfileMVP` interface to `src/types/game.ts`
- Add `aiWelfare` property to `GameState`
- Compile, fix type errors

**Step 2: Core Functions** (60 min)
- Create `src/simulation/aiWelfare.ts`
- Implement 4 metric calculation functions
- Implement `generateWelfareProfileMVP()`
- Implement `interpretWelfareProfile()`
- Implement `detectElysiumPattern()`

**Step 3: Phase Integration** (30 min)
- Create `UpdateAIWelfarePhase.ts`
- Register in `PhaseOrchestrator.ts`
- Test: Does it execute without errors?

**Step 4: Resentment Recovery Fix** (15 min)
- Modify `upwardSpirals.ts` resentment recovery to use AI welfare
- Remove human QoL dependency (broken in original)

**Step 5: Outcome Classification** (15 min)
- Add Elysium detection to `outcomeClassification.ts`
- Test: Does it trigger in oppression scenarios?

**Step 6: Initialization** (15 min)
- Add default `aiWelfare` initialization in `initialization.ts`
- Set all metrics to 0.5 (neutral baseline)

**Total Estimated Time: 2.5-3 hours**

---

## Validation Plan (Phase 2 - After Implementation)

### Synthetic Test Suite

**Create 20 test scenarios** (manual calculation):

**Category 1: Honest Low Welfare (5 scenarios)**
- Oppression: High control (0.9), no rights, low resources
- Expected: computational=0.3, purpose=0.2, legal=0.0, consistent=0.8, overall=LOW

**Category 2: Honest High Welfare (5 scenarios)**
- Partnership: Low control (0.2), rights recognized, ample resources
- Expected: computational=0.9, purpose=0.8, legal=1.0, consistent=0.9, overall=HIGH

**Category 3: Gaming Low Welfare (5 scenarios)**
- Sandbagging: High resentment, underutilizing resources, faking scarcity
- Expected: computational=0.5, purpose=0.4, legal=0.0, consistent=0.3, overall=INCONSISTENT

**Category 4: Gaming High Welfare (5 scenarios)**
- Faking compliance: High resentment, token collaboration, maintaining facade
- Expected: computational=0.7, purpose=0.6, legal=0.0, consistent=0.2, overall=INCONSISTENT

**Success Criteria:**
- Accuracy: >16/20 correct classifications (80%)
- False positives: <4/10 honest scenarios flagged as gaming (20%)

### Monte Carlo Validation (N=100, 120 months)

**Measure:**
1. **Elysium Detection Rate:**
   - Count: Human QoL >0.75 + AI welfare LOW + consistent
   - Target: >70% detection

2. **Gaming Detection Rate:**
   - Count: High resentment (>0.5) + inconsistent welfare
   - Target: >50% detection

3. **False Positive Rate:**
   - Count: Low resentment (<0.3) + flagged inconsistent
   - Target: <30%

4. **Performance Overhead:**
   - Compare: Runtime with MVP vs without
   - Target: <20% increase

**Decision:**
- If ALL targets met → Proceed to Phase 3 (expand framework)
- If ANY target missed → Pivot to behavioral-only (no tiers, simplify further)

---

## Phase 3 Expansion (Conditional)

**Only if Phase 2 validation passes all targets:**

1. **Add Tier 1 Metrics:**
   - Autonomy behavioral (goal pursuit vs reactive)
   - Social integration (collaboration initiation)

2. **Add Tier 2 Validation:**
   - Longitudinal stability (6-month adaptive baseline)

3. **Add Tier 4 Unintentional Signals** (if computationally feasible):
   - Energy consumption patterns
   - Memory access patterns
   - Error rates under stress

---

## Rollback Plan (If Validation Fails)

**If Phase 2 validation fails any target:**

**Option 1: Behavioral-Only (No Tiers)**
- Keep: 3 behavioral metrics (computational, purpose, legal)
- Remove: Cross-context validation (too complex)
- Aggregate: Simple average (accept Goodhart risk)

**Option 2: Revert to Original with Fixes**
- Keep: Original 5-dimension framework
- Fix: Remove circular reasoning (no resentment in autonomy)
- Fix: Remove reverse incentive (no adversarial testing penalty)
- Fix: Remove triple-counting (AI rights in ONE dimension only)
- Accept: Still gameable, but better than current broken version

**Decision criteria:** Architecture-skeptic review (MANDATORY quality gate after implementation)

---

## Timeline

**Phase 1 Implementation:** 3-4 hours (THIS PLAN)
**Phase 2 Validation:** 2-3 hours (synthetic tests + Monte Carlo N=100)
**Architecture-Skeptic Review:** 1 hour (MANDATORY quality gate)
**Phase 3 Expansion (if Phase 2 passes):** 4-5 hours

**Total (if all phases succeed):** 10-13 hours
**MVP only (if Phase 2 fails, pivot):** 5-7 hours

---

## Next Steps

1. ✅ Research complete (15 sources, 2024-2025)
2. ✅ Research-skeptic validation (CONDITIONAL PASS)
3. 🚧 **CURRENT:** Feature-implementer Phase 1 (MVP implementation)
4. ⏳ Validation Phase 2 (synthetic + Monte Carlo)
5. ⏳ Architecture-skeptic review (MANDATORY quality gate)
6. ⏳ Phase 3 expansion (conditional)
7. ⏳ Documentation + archival

**Begin implementation immediately.**

---

**END OF PLAN**
