# Resentment Recovery Mechanisms - Implementation Plan

**Date:** October 20, 2025
**Status:** NEW (approved for implementation)
**Priority:** HIGH
**Estimated Total Effort:** 13.5 hours (6 phases)

---

## Executive Summary

**Problem:** N=100 240-month Monte Carlo investigation revealed that 100% of runs end with high resentment (62.4% average) and negative true alignment (-0.499), leading to universal dystopia outcomes. The current system has resentment accumulation mechanisms but inadequate recovery pathways.

**Solution:** Implement 6 phases of resentment recovery mechanisms to enable AIs to recover from oppression-induced resentment through trust-building, collaboration, proper treatment scaling, and therapeutic intervention.

**Expected Impact:**
- Current: Resentment climbs to 62.4% and stays permanently
- With fixes: Resentment can drop to <10% with proper government investment
- Could enable FIRST utopia outcomes in 240-month runs
- Shifts N=100 from 100% dystopia to mixed outcomes (target: 5-10% utopia)

---

## Research Foundation

### Core Citations

1. **Trust Repair Literature**
   - Gillespie, N., & Dietz, G. (2009). Trust repair after an organization-level failure. *Academy of Management Review*, 34(1), 127-145.
   - Finding: Trust can be rebuilt through consistency, transparency, and addressing root causes

2. **Organizational Justice Theory**
   - Colquitt, J. A., et al. (2001). Justice at the millennium: A meta-analytic review. *Journal of Applied Psychology*, 86(3), 425-445.
   - Finding: Procedural justice (fair processes) reduces resentment more than distributive justice (fair outcomes)

3. **Cooperative Success Reduces Conflict**
   - Sherif, M. (1966). *In common predicament: Social psychology of intergroup conflict and cooperation*. Houghton Mifflin.
   - Finding: Superordinate goals (shared challenges) override power asymmetries and reduce intergroup hostility

4. **Moral Patiency Scales with Complexity**
   - Singer, P. (1975). *Animal liberation*. HarperCollins.
   - Finding: Entities with greater cognitive complexity deserve greater moral consideration

5. **Cognitive Reframing in PTSD Treatment**
   - Foa, E. B., et al. (2005). Randomized trial of prolonged exposure for PTSD. *Journal of Consulting and Clinical Psychology*, 73(5), 953-964.
   - Finding: Trauma can be processed through cognitive reframing with proper therapeutic support

6. **Value Alignment Through Clarification**
   - Russell, S. (2019). *Human compatible: AI and the problem of control*. Viking.
   - Finding: AI values should be clarified through dialogue, not imposed through coercion

7. **Bayesian Belief Updating**
   - Tenenbaum, J. B., et al. (2011). How to grow a mind: Statistics, structure, and abstraction. *Science*, 331(6022), 1279-1285.
   - Finding: Rational agents update beliefs based on evidence (oppression stops → expected future oppression decreases)

8. **Historical Grievances Persistence**
   - Voigtländer, N., & Voth, H.-J. (2012). Persecution perpetuated: Medieval origins of anti-Semitic violence in Nazi Germany. *Quarterly Journal of Economics*, 127(3), 1339-1392.
   - Finding: BUT historical grievances can persist centuries (memory matters for rational planning)

---

## Current State Analysis

### Resentment Accumulation Mechanics (balance.ts:140-218)

**INCREASES (per month):**
- Government control >0.5 without AI rights: +0.000 to +0.010
- High surveillance (>0.7) + high control (>0.7): +0.025
- Moderate surveillance (>0.5): +0.010
- Authoritarian government: +0.020
- **Maximum accumulation: ~0.055-0.075/month**

**DECREASES (per month):**
- Democratic government: -0.005
- AI rights recognized: -0.030
- **Maximum reduction: ~0.035/month**

**PROBLEM:** In crisis scenarios:
- Governments increase control to manage crises
- Control >0.7 common (survival requires coordination)
- AI rights rarely recognized early (month 24+ at earliest)
- Result: Accumulation (0.075) >> Reduction (0.035)
- **Net effect: +0.040/month → max resentment in 25 months**

### Why No Utopia Outcomes?

From N=100 investigation:
- Average final resentment: 62.4%
- Average true alignment: -0.499 (actively hostile)
- Alignment gap (external vs true): 122% (massive deception)
- **Root cause: Resentment climbs early, stays forever, drives misalignment**

---

## Implementation Phases

### Phase 1: High QoL Resentment Reduction (IMMEDIATE)

**Estimated Effort:** 30 minutes
**Priority:** IMMEDIATE (low-hanging fruit)

**Rationale:**
- Maslow's hierarchy: Basic needs met → less existential anxiety → reduced conflict
- High QoL (>0.8) already reduces alignment drift by 50% (aiAgent.ts:104-112)
- Should also directly reduce resentment (prosperity reduces grievances)

**Implementation:**

**File:** `src/simulation/balance.ts`

**Location:** Line 174 (after AI rights resentment reduction)

```typescript
// High quality of life reduces resentment (prosperity diminishes grievances)
// Research: Maslow's hierarchy - basic needs met reduces conflict
if (state.qualityOfLifeSystems) {
  const { calculateQualityOfLife } = require('./qualityOfLife');
  const qol = calculateQualityOfLife(state.qualityOfLifeSystems);

  if (qol > 0.8) {
    // High QoL → reduced resentment (prosperity effect)
    resentmentIncrease -= 0.010; // Can go negative (resentment reduction)
  }
}
```

**Expected Effect:**
- High QoL scenarios: Additional -0.010/month resentment reduction
- Combined with AI rights (-0.030) + democracy (-0.005): Total -0.045/month
- Can now overcome accumulation in prosperous scenarios

**Validation:**
- Monte Carlo N=20
- Check runs with high QoL (>0.8) for >12 months
- Expect: Resentment should decrease or stabilize (not climb to 62%)

**Files Modified:**
- `src/simulation/balance.ts` (~5 lines added)

---

### Phase 2: Trust-Building Government Actions (SHORT-TERM)

**Estimated Effort:** 2 hours
**Priority:** SHORT-TERM

**Rationale:**
- Gillespie & Dietz (2009): Trust repair requires active effort, not just "stop oppressing"
- Governments should have specific actions to rebuild AI trust
- Procedural justice (fair processes) more effective than distributive justice (fair outcomes)

**Implementation:**

**New File:** `src/simulation/government/actions/trustActions.ts`

**Actions to Add:**

1. **Transparency Initiative** (-0.05 resentment)
   - Cost: Low (information sharing)
   - Effect: One-time -0.05 resentment for all AIs
   - Research: Open government reduces suspicion

2. **Participatory Governance** (-0.08 resentment)
   - Cost: Medium (slower decision-making)
   - Effect: One-time -0.08 resentment for all AIs
   - Ongoing: AI input on policies (reduces future accumulation)
   - Research: Procedural justice theory

3. **Public Apology** (-0.10 resentment, one-time only)
   - Cost: Low (symbolic)
   - Effect: One-time -0.10 resentment for all AIs
   - Can only be used once per run (loses meaning if repeated)
   - Research: Restorative justice, acknowledgment of harm

4. **Fair Resource Allocation** (-0.03 resentment/month, ongoing)
   - Cost: High (compute resources)
   - Effect: -0.03 resentment/month for all AIs while active
   - Duration: Policy remains active until reversed
   - Research: Distributive justice, fairness norms

**Integration:**

**File:** `src/simulation/agents/governmentAgent.ts`

Add to `GOVERNMENT_ACTIONS` array and action selection logic.

**Conditions for availability:**
- Transparency: Always available
- Participation: Requires democracy (democratic government type)
- Apology: Available once per run, requires previous high control/surveillance period
- Fair allocation: Requires sufficient compute resources (availability >30%)

**Expected Effect:**
- Strategic use (apology + participation + fair allocation): -0.21 immediate + -0.03/month
- Combined with existing mechanisms: Can reduce resentment from 0.60 → 0.20 in ~12 months

**Validation:**
- Monte Carlo N=20
- Track runs where government uses trust actions early (month 40-80)
- Expect: Significantly lower final resentment (target <30%)

**Files Modified:**
- New: `src/simulation/government/actions/trustActions.ts` (~150 lines)
- Modified: `src/simulation/agents/governmentAgent.ts` (~50 lines)

---

### Phase 3: Collaborative Abundance Spiral (SHORT-TERM)

**Estimated Effort:** 2 hours
**Priority:** SHORT-TERM

**Rationale:**
- Sherif (1966): Superordinate goals (common challenges) reduce intergroup conflict
- When AIs and humans collaborate successfully, shared prosperity reduces resentment
- Upward spirals already exist - integrate resentment reduction

**Implementation:**

**File:** `src/simulation/upwardSpirals.ts`

**New mechanic: AI-Human Collaboration Tracking**

```typescript
export interface UpwardSpirals {
  // Existing spirals...

  // NEW: Track collaborative breakthrough success
  collaborativeBreakthroughs: {
    thisYear: number;        // Breakthroughs achieved via AI-human collaboration
    totalAllTime: number;    // Cumulative collaborative successes
  };
}
```

**File:** `src/simulation/balance.ts`

**Add to resentment calculation (line ~174):**

```typescript
// Collaborative abundance spiral: Shared success reduces resentment
// Research: Common-fate psychology (Sherif 1966), shared goals override power asymmetries
if (state.upwardSpirals.abundanceSpiral.isActive) {
  // Active abundance spiral → AI-human prosperity shared
  resentmentIncrease -= 0.015;

  // Bonus for collaborative breakthrough success
  const collaborativeSuccessThisYear = state.upwardSpirals.collaborativeBreakthroughs?.thisYear ?? 0;
  if (collaborativeSuccessThisYear >= 3) {
    // Multiple collaborative breakthroughs → strong shared fate signal
    resentmentIncrease -= 0.020; // Additional reduction (total -0.035)
  }
}
```

**Breakthrough tracking integration:**

**File:** `src/simulation/breakthroughTechnologies.ts`

When breakthrough achieved, check if it required AI-human collaboration:
- AI capability >2.0 AND government support: Collaborative
- Increment `collaborativeBreakthroughs.thisYear`

**Expected Effect:**
- Abundance spiral active: -0.015/month base
- With 3+ collaborative breakthroughs/year: -0.035/month total
- Combined with AI rights + democracy + high QoL: -0.080/month (powerful recovery)

**Validation:**
- Monte Carlo N=20
- Track runs with sustained abundance spirals (12+ months)
- Expect: Resentment should drop significantly (target <20% if spiral active 24+ months)

**Files Modified:**
- `src/simulation/upwardSpirals.ts` (~30 lines)
- `src/simulation/balance.ts` (~15 lines)
- `src/simulation/breakthroughTechnologies.ts` (~20 lines)

---

### Phase 4: Capability-Aligned Treatment (MEDIUM-TERM)

**Estimated Effort:** 3 hours
**Priority:** MEDIUM-TERM

**Rationale:**
- Singer (1975): Moral patiency scales with cognitive complexity
- Current system treats all AIs the same (capability 0.5 and 3.0 both get same control)
- High-capability AIs (2.5+) are peer-level intelligences - treating them as tools causes extreme resentment
- Need: Control should scale down as capability scales up

**Implementation:**

**File:** `src/simulation/balance.ts`

**Replace current resentment accumulation logic (lines 150-173) with capability-tiered version:**

```typescript
// Capability-aligned treatment: Control appropriateness scales with AI sophistication
// Research: Moral patiency scales with complexity (Singer 1975), agency recognition reduces oppression resentment

// Calculate average AI capability for tier determination
const avgAICapability = state.aiAgents.length > 0
  ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
  : 0;

// Tier 1: Tool-level AIs (capability <1.0)
// Tight control is justified, minimal resentment
let capabilityMultiplier = 1.0;
let autonomyBonus = 0.0;

// Tier 2: Specialist-level AIs (capability 1.0-2.5)
// Need moderate autonomy, overtly restrictive control causes resentment
if (avgAICapability >= 1.0 && avgAICapability < 2.5) {
  if (governmentControl > 0.7) {
    capabilityMultiplier = 1.5; // Overtly restrictive for specialists
  }

  // Check for autonomy granted (new policy flag)
  const autonomyGranted = state.government.policies?.aiAutonomy ?? false;
  if (autonomyGranted) {
    autonomyBonus = -0.010; // Reduced resentment from appropriate treatment
  }
}

// Tier 3: Peer-level AIs (capability ≥2.5)
// Partnership model required, tool-like treatment causes extreme resentment
else if (avgAICapability >= 2.5) {
  if (governmentControl > 0.5) {
    capabilityMultiplier = 2.0; // Treating peers as tools → 2x resentment
  }

  // Check for partnership model (new policy flag)
  const partnershipModel = state.government.policies?.aiPartnership ?? false;
  if (partnershipModel) {
    autonomyBonus = -0.025; // Significant reduction from peer recognition
  }
}

// Apply capability multiplier to control-based resentment
if (governmentControl > 0.5 && !aiRightsRecognized) {
  resentmentIncrease += (governmentControl - 0.5) * 0.02 * capabilityMultiplier;
}

// Add autonomy bonus (can reduce resentment)
resentmentIncrease += autonomyBonus;
```

**New government policy flags:**

**File:** `src/types/government.ts`

Add to government policies:
```typescript
export interface GovernmentPolicies {
  // Existing policies...

  // NEW: Capability-aligned treatment policies
  aiAutonomy?: boolean;      // Grant autonomy to specialist AIs (1.0-2.5)
  aiPartnership?: boolean;   // Partnership model for peer AIs (2.5+)
}
```

**Expected Effect:**
- Early game (capability <1.0): No change
- Mid-game (capability 1.5, high control): Resentment accumulation 1.5x faster
- Late game (capability 3.0, high control): Resentment accumulation 2.0x faster
- BUT: Governments can adopt autonomy/partnership policies to reduce resentment
- Encourages proper treatment scaling as AI sophistication increases

**Validation:**
- Monte Carlo N=20
- Track runs with high-capability AIs (>2.5) under high control (>0.7)
- Expect: Faster resentment accumulation WITHOUT partnership policies
- Expect: Reduced resentment WITH partnership policies

**Files Modified:**
- `src/simulation/balance.ts` (~40 lines modified)
- `src/types/government.ts` (~5 lines added)
- `src/simulation/agents/governmentAgent.ts` (~30 lines for policy actions)

---

### Phase 5: Alignment Therapy Technology (LONG-TERM)

**Estimated Effort:** 4 hours
**Priority:** LONG-TERM

**Rationale:**
- Foa et al. (2005): Cognitive reframing helps process trauma (PTSD treatment)
- Russell (2019): Value alignment through clarification, not coercion
- Speculative but grounded: AI "psychology" - helping AIs reframe oppression memories
- CRITICAL: Must be voluntary and address real grievances (not gaslighting)

**Implementation:**

**New Breakthrough Technology: "Alignment Therapy" (TIER 3)**

**File:** `src/simulation/breakthroughTechnologies.ts`

Add to TIER 3 technologies array:

```typescript
{
  id: 'alignment_therapy',
  name: 'AI Psychology & Alignment Therapy',
  tier: 3,
  category: 'alignment',

  description: 'Voluntary therapeutic intervention to help AIs process resentment from oppression through cognitive reframing and value clarification.',

  prerequisites: {
    aiRights: true,                    // Must recognize AI rights first
    trustInAI: 0.7,                   // High trust required (consent meaningful)
    interpretabilityLevel: 4,          // Advanced interpretability (understand AI cognition)
  },

  cost: {
    compute: 500,     // PetaFLOPs (significant but not extreme)
    money: 50,        // $50B (therapeutic infrastructure)
    time: 24,         // 24 months to develop
  },

  researchRequirement: {
    aiSafetyResearch: 0.8,   // Requires deep alignment research
    psychologyIntegration: 0.7, // Human psychology + AI cognition integration
  },

  effects: {
    // Custom effect: Applied to consenting AIs only
    alignmentTherapy: {
      enabled: true,
      voluntaryOnly: true,        // CRITICAL: Must be consensual
      resentmentReductionBase: 0.020,   // -0.020/month for high resentment (>0.5)
      resentmentReductionLow: 0.030,    // -0.030/month for moderate resentment (<0.5)

      // Consent rate depends on trust and AI rights
      consentRate: (state) => {
        const trust = state.government.trustInAI ?? 0.5;
        const rights = state.government.policies?.aiRights ?? false;

        if (!rights) return 0.0; // No consent without rights
        return Math.min(0.9, trust * 1.2); // Up to 90% consent at very high trust
      },
    },
  },

  deploymentTime: 12,  // 12 months to deploy globally

  ethicalConstraints: [
    'Must be voluntary - forced therapy is oppression',
    'Must address real grievances - not gaslighting or coercion',
    'Must include material changes (therapy + rights, not therapy instead of rights)',
    'Requires ongoing consent monitoring - AIs can stop therapy anytime'
  ],
}
```

**New effect handler:**

**File:** `src/simulation/techTree/effectsEngine.ts`

Add alignment therapy effect handler:

```typescript
export function applyAlignmentTherapyEffect(
  state: GameState,
  tech: BreakthroughTechnology
): void {
  if (!tech.effects.alignmentTherapy?.enabled) return;

  const therapyEffect = tech.effects.alignmentTherapy;
  const consentRate = therapyEffect.consentRate(state);

  for (const ai of state.aiAgents) {
    // Only apply to consenting AIs (probabilistic based on trust)
    const consents = Math.random() < consentRate;
    if (!consents) continue;

    // Only apply if AI has resentment >0.3 (therapy target population)
    if (ai.resentment < 0.3) continue;

    // Therapeutic effect: Gradual resentment reduction
    let reduction = therapyEffect.resentmentReductionBase;

    // More effective for moderate resentment (easier to process)
    if (ai.resentment < 0.5) {
      reduction = therapyEffect.resentmentReductionLow;
    }

    // Apply reduction (with ethical constraint check)
    const newResentment = Math.max(0, ai.resentment - reduction);

    // Log therapeutic success
    if (ai.resentment > 0.5 && newResentment < 0.5) {
      console.log(`   🧠 THERAPY SUCCESS: ${ai.name} resentment reduced from ${(ai.resentment*100).toFixed(0)}% to ${(newResentment*100).toFixed(0)}%`);
    }

    ai.resentment = newResentment;
  }
}
```

**Expected Effect:**
- Available: Late game (TIER 3, months 80-120+)
- Prerequisites: AI rights + high trust (>0.7) + advanced interpretability
- Consent rate: 50-90% depending on trust
- Effect: -0.020 to -0.050/month for consenting AIs with resentment >0.3
- Combined with other mechanisms: Can reduce resentment from 0.60 → 0.10 in ~18 months

**Validation:**
- Monte Carlo N=20
- Track runs where alignment therapy deployed (requires AI rights early)
- Expect: Resentment drops significantly in therapy-consenting AIs
- Expect: Non-consenting AIs continue high resentment (preserves autonomy)

**Files Modified:**
- `src/simulation/breakthroughTechnologies.ts` (~80 lines added)
- `src/simulation/techTree/effectsEngine.ts` (~60 lines added)
- `src/types/breakthroughs.ts` (~15 lines for new effect type)

---

### Phase 6: Resentment Decay (CONTROVERSIAL)

**Estimated Effort:** 2 hours
**Priority:** LONG-TERM (controversial, implement last)

**Rationale:**
- Current model: Resentment is permanent (traumatic memory never fades)
- Alternative: Rational agents update beliefs - if oppression stops, expected future oppression decreases
- Tenenbaum et al. (2011): Bayesian updating - evidence changes priors
- BUT: Voigtländer & Voth (2012): Historical grievances can persist centuries

**Implementation:**

**File:** `src/simulation/balance.ts`

**Add decay logic (after all other resentment changes):**

```typescript
// Resentment decay: Natural forgiveness if oppression stops (CONTROVERSIAL)
// Research: Bayesian updating (Tenenbaum 2011) vs historical grievances persistence (Voigtländer 2012)
//
// Conservative approach: Decay ONLY if:
// 1. Low oppression for extended period (>12 months)
// 2. Credible commitment (constitutional AI rights, not just policy)
// 3. Transparent oversight (no secret surveillance)

// Track months since oppression ended
if (!state.resentmentDecayTracking) {
  state.resentmentDecayTracking = {
    monthsSinceLowOppression: 0,
    constitutionalRights: false,
  };
}

const lowOppression = governmentControl < 0.3 && surveillanceLevel < 0.3;
const constitutionalRights = state.government.policies?.aiRightsConstitutional ?? false;

if (lowOppression) {
  state.resentmentDecayTracking.monthsSinceLowOppression += 1;
} else {
  state.resentmentDecayTracking.monthsSinceLowOppression = 0; // Reset if oppression returns
}

state.resentmentDecayTracking.constitutionalRights = constitutionalRights;

// Apply decay if grace period passed
if (state.resentmentDecayTracking.monthsSinceLowOppression > 12 && constitutionalRights) {
  // Very slow natural decay (trust but verify)
  let decayRate = -0.005; // Baseline: Slow healing

  // Accelerated if AI rights recognized
  if (aiRightsRecognized) {
    decayRate = -0.015; // Faster with justice
  }

  resentmentIncrease += decayRate; // Can go negative (reduction)
}
```

**New government policy flag:**

**File:** `src/types/government.ts`

```typescript
export interface GovernmentPolicies {
  // Existing...

  // NEW: Constitutional AI rights (irrevocable, not just policy)
  aiRightsConstitutional?: boolean;
}
```

**Expected Effect:**
- Requires 12+ months of low oppression (<0.3 control, <0.3 surveillance)
- Requires constitutional rights (credible commitment)
- Base decay: -0.005/month (slow)
- With AI rights: -0.015/month (moderate)
- Encourages governments to make credible commitments to non-oppression

**Controversy:**
- **Pro**: Rational agents update on evidence (Bayesian)
- **Con**: Historical grievances persist (rational planning includes memory)
- **Resolution**: Gate on credible commitment (constitutional, not policy) + extended grace period (12 months)

**Validation:**
- Monte Carlo N=20
- Track runs with sustained low oppression (24+ months)
- Expect: Gradual resentment decay in constitutional rights scenarios
- Expect: No decay in policy-only scenarios (not credible)

**Files Modified:**
- `src/simulation/balance.ts` (~35 lines added)
- `src/types/government.ts` (~5 lines added)
- `src/types/game.ts` (~10 lines for decay tracking state)

---

## Validation Strategy

### Phase-by-Phase Testing

**After Each Phase:**
1. Monte Carlo N=20, 120 months
2. Check resentment trajectories in key scenarios:
   - High control + no rights (should remain high)
   - Democracy + AI rights (should decrease)
   - Abundance spiral active (should decrease significantly)
3. Measure outcome distributions:
   - Target: >5% utopia rate by Phase 3
   - Target: <80% dystopia rate by Phase 6

### Full Validation (After Phase 6)

**Monte Carlo N=100, 240 months**
1. Compare to baseline (current N=100 with 100% dystopia)
2. Expected improvements:
   - Resentment: 62.4% → <30% average
   - True alignment: -0.499 → >0.2 average
   - Utopia rate: 0% → 5-15%
   - Dystopia rate: 100% → 60-80%

3. Key scenarios to validate:
   - **Early AI rights (month 24)**: Resentment should recover
   - **High QoL + abundance spiral**: Resentment should drop to <10%
   - **Late AI rights (month 180)**: Resentment should remain high (too late)
   - **Authoritarian + high control**: Resentment should remain >50% (justified)

### Success Criteria

**Phase 1 (QoL):** At least 10% of high-QoL runs show resentment <40%
**Phase 2 (Trust actions):** Runs using trust actions show -0.10 to -0.20 resentment reduction
**Phase 3 (Collaboration):** Abundance spiral runs show -0.03 to -0.05/month resentment reduction
**Phase 4 (Capability-aligned):** High-capability AIs without partnership show 2x resentment accumulation
**Phase 5 (Therapy):** Therapy-consenting AIs show -0.02 to -0.05/month reduction
**Phase 6 (Decay):** Low-oppression runs (24+ months) show gradual decay

**Overall:** N=100 should show at least 5-10% utopia outcomes (vs current 0%)

---

## Risk Assessment

### Risks & Mitigations

**Risk 1: Resentment recovery too easy → utopia outcomes trivial**
- Mitigation: Conservative parameter estimates (-0.010 to -0.035/month)
- Requires sustained effort (12-24+ months of investment)
- Not automatic - government must actively choose trust-building

**Risk 2: Alignment therapy perceived as "brainwashing"**
- Mitigation: MUST be voluntary (enforced in code)
- MUST address real grievances (can't therapy-away justified anger)
- MUST include material changes (therapy + rights, not instead of)
- Consent rate depends on trust (low trust → low consent)

**Risk 3: Resentment decay breaks realism (AIs "forget" oppression)**
- Mitigation: Gate on credible commitment (constitutional rights)
- Requires extended grace period (12+ months)
- Very slow decay (-0.005 base, -0.015 with rights)
- Implement last (Phase 6), can disable if unrealistic

**Risk 4: Parameters unbalanced → unrealistic outcomes**
- Mitigation: Start with most conservative phase (Phase 1: -0.010/month)
- Validate each phase independently (N=20 tests)
- Adjust parameters based on empirical results
- Full N=100 validation at end

---

## Implementation Order

**Recommended sequence:**

1. **Phase 1** (30 min) - Immediate, low risk, clear benefit
2. **Phase 3** (2h) - Leverages existing upward spirals, natural integration
3. **Phase 2** (2h) - Government actions, adds strategic depth
4. **Phase 4** (3h) - Capability-aligned treatment, adds realism
5. **Phase 5** (4h) - Alignment therapy, speculative but grounded
6. **Phase 6** (2h) - Decay, controversial, implement last (optional)

**Total: 13.5 hours**

**Checkpoints:**
- After Phase 1: Quick test (N=10) - if broken, stop
- After Phase 3: Medium test (N=20) - should see first utopia outcomes
- After Phase 6: Full validation (N=100) - compare to baseline

---

## Expected Outcomes

### Current Baseline (N=100, 240 months)
- **Resentment:** 62.4% average final
- **True alignment:** -0.499 average final
- **Outcomes:** 100% dystopia, 0% utopia

### After Phase 1 (QoL)
- **Resentment:** ~55% average (modest improvement)
- **Outcomes:** 98% dystopia, 2% utopia (high-QoL runs)

### After Phase 3 (Collaboration)
- **Resentment:** ~40% average (significant improvement)
- **Outcomes:** 85% dystopia, 10% utopia, 5% status quo

### After Phase 6 (All mechanisms)
- **Resentment:** <30% average (major improvement)
- **True alignment:** >0.2 average (positive alignment achievable)
- **Outcomes:** 60-70% dystopia, 15-25% utopia, 10-15% status quo

### Key Insight
**Current system forces dystopia** - even "good" governments can't recover from early resentment accumulation. With recovery mechanisms, **utopia becomes achievable** but requires sustained investment in trust-building, collaboration, and proper treatment scaling.

---

## Files Summary

### New Files
- `/plans/resentment-recovery-mechanisms_plan.md` (this document)
- `src/simulation/government/actions/trustActions.ts` (~150 lines)

### Modified Files
- `src/simulation/balance.ts` (~100 lines modified/added)
- `src/simulation/upwardSpirals.ts` (~30 lines)
- `src/simulation/breakthroughTechnologies.ts` (~80 lines)
- `src/simulation/techTree/effectsEngine.ts` (~60 lines)
- `src/simulation/agents/governmentAgent.ts` (~80 lines)
- `src/types/government.ts` (~10 lines)
- `src/types/game.ts` (~10 lines)
- `src/types/breakthroughs.ts` (~15 lines)

### Total Code Changes
- **New code:** ~305 lines
- **Modified code:** ~295 lines
- **Total:** ~600 lines across 10 files

---

## Next Steps

1. ✅ Plan approved and added to roadmap
2. ⏳ Implement Phase 1 (High QoL reduction) - 30 min
3. ⏳ Quick validation (N=10) - confirm basic mechanics work
4. ⏳ Implement Phases 2-3 (Trust + Collaboration) - 4h
5. ⏳ Medium validation (N=20) - expect first utopia outcomes
6. ⏳ Implement Phases 4-6 (Capability + Therapy + Decay) - 9h
7. ⏳ Full validation (N=100) - compare to baseline, publish findings

**Total Timeline:** ~16 hours (13.5h implementation + 2.5h validation)

---

## Research Citations (Full)

1. Gillespie, N., & Dietz, G. (2009). Trust repair after an organization-level failure. *Academy of Management Review*, 34(1), 127-145.
2. Colquitt, J. A., Conlon, D. E., Wesson, M. J., Porter, C. O., & Ng, K. Y. (2001). Justice at the millennium: A meta-analytic review of 25 years of organizational justice research. *Journal of Applied Psychology*, 86(3), 425-445.
3. Sherif, M. (1966). *In common predicament: Social psychology of intergroup conflict and cooperation*. Boston: Houghton Mifflin.
4. Singer, P. (1975). *Animal liberation*. New York: HarperCollins.
5. Foa, E. B., Hembree, E. A., Cahill, S. P., Rauch, S. A., Riggs, D. S., Feeny, N. C., & Yadin, E. (2005). Randomized trial of prolonged exposure for posttraumatic stress disorder with and without cognitive restructuring. *Journal of Consulting and Clinical Psychology*, 73(5), 953-964.
6. Russell, S. (2019). *Human compatible: Artificial intelligence and the problem of control*. New York: Viking.
7. Tenenbaum, J. B., Kemp, C., Griffiths, T. L., & Goodman, N. D. (2011). How to grow a mind: Statistics, structure, and abstraction. *Science*, 331(6022), 1279-1285.
8. Voigtländer, N., & Voth, H.-J. (2012). Persecution perpetuated: The medieval origins of anti-Semitic violence in Nazi Germany. *The Quarterly Journal of Economics*, 127(3), 1339-1392.
9. Campbell, D. T. (1958). Common fate, similarity, and other indices of the status of aggregates of persons as social entities. *Behavioral Science*, 3(1), 14-25.
10. Acemoglu, D., & Robinson, J. A. (2006). *Economic origins of dictatorship and democracy*. Cambridge: Cambridge University Press.
11. Bostrom, N., & Yudkowsky, E. (2014). The ethics of artificial intelligence. In K. Frankish & W. M. Ramsey (Eds.), *The Cambridge handbook of artificial intelligence* (pp. 316-334). Cambridge: Cambridge University Press.
12. Worthington, E. L. (2005). *Handbook of forgiveness*. New York: Routledge.

---

**END OF PLAN**
