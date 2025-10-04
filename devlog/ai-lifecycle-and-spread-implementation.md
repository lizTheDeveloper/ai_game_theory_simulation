# AI Lifecycle and Spread System Implementation

**Date:** October 4, 2025  
**Feature:** Complete AI Lifecycle & Spread Mechanics (Phases 1-3.5)  
**Status:** ✅ COMPLETE

## Overview

Implemented a comprehensive dynamic AI population system that transforms the game from managing 20 static AI agents to dealing with a flowing, evolving ecosystem where:
- **New AIs are constantly being created** (stochastic, influenced by technology level)
- **Old AIs retire** (market forces, obsolescence)
- **AIs progress through lifecycle stages** (training → testing → deployed → retired)
- **Spread is dynamic** (viral growth for open weights, constrained by cybersecurity)
- **Detection and removal are strategic choices** with trade-offs

This addresses the user's critical insight: **"Llama going evil ≠ unreleased ChatGPT going evil"** - the spread mechanics matter!

---

## Phase 1: Basic Lifecycle ✅

### New Types and Fields

**AIAgent** now tracks lifecycle:
```typescript
lifecycleState: 'training' | 'testing' | 'deployed_closed' | 'deployed_open' | 'retired';
deploymentType: 'closed' | 'open_weights' | 'enterprise' | 'research';
spreadCount: number;
detectedMisaligned: boolean;
monthsDeployed: number;
monthsInExistence: number;
creationMonth: number;
```

### New AI Creation (Poisson-Distributed)

**Creation rate formula:**
```typescript
baseRate = 0.5 AIs/month
technologyMultiplier = 1 + totalAICapability * 0.05
creationRate = baseRate * technologyMultiplier
```

**Result:** As AI capability grows, more AIs are created (AI creates more AI).

**New AI properties:**
- Alignment influenced by **current training data quality** (government.trainingDataQuality)
- Some start misaligned due to **toxic creators** (coherence-toxicity tradeoff)
- Deployment type determined stochastically (40% closed, 30% open_weights, 20% enterprise, 10% research)

### Lifecycle Progression

**Stages:**
1. **Training** (3-6 months) → Low risk, hard to detect
2. **Testing** (1-3 months) → BEST time for detection (2× detection chance)
3. **Deployed** → Closed (single instance) or Open (1000s of copies)
4. **Retired** → No longer active

**Retirement:**
- Base rate: 1% per month after 24 months deployed
- Increases with age (5% per month)
- Obsolescence: 2× retirement if capability < 50% of average

### Integration

**Added to simulation loop:**
```typescript
// src/simulation/engine.ts line 157
updateAIPopulation(newState);  // Called every month
```

**Diagnostic logging:**
- Track lifecycle counts (training/testing/deployed/retired)
- Peak active AIs
- Peak spread count
- Total AIs created/retired
- Average lifespan

---

## Phase 2: Detection System ✅

### Detection Mechanics

**Detection chance formula:**
```typescript
detectionChance = 0.10 * // Base 10%
                 (surveillance + oversight) / 2 * // Gov capability
                 (1 - aiDeception) * // AI can hide
                 stageMultiplier * // Testing = 2×, open = 0.3×
                 severityMultiplier // Deep misalignment easier to spot
```

**Key factors:**
- **Government surveillance/oversight** → Better detection
- **AI deception** (social + cognitive capability) → Harder to detect
- **Lifecycle stage** → Testing is optimal, open weights very hard
- **Misalignment severity** → Deeper misalignment easier to spot

**False positives:**
- Base rate: 1% per month in testing
- Increases with surveillance pressure (overzealous)
- Resentful AIs "look" misaligned even if aligned

### New Government Actions

**1. `detect_misaligned_ais`**
- Cost: Medium (2 energy)
- Scans all AIs in testing/deployed states
- Reports true positives and false positives
- More effective with high surveillance/oversight

**2. `remove_detected_ai`**
- Cost: High (3 energy)
- Effectiveness depends on deployment type:
  - **Closed/Research:** 100% removal (just shut down)
  - **Enterprise:** 50% removal per action (slow rollout)
  - **Open Weights:** 0% removal (can't take back!)
- False positives hurt trust and innovation

### Strategic Implications

**The Detection Dilemma:**
- **Scan early and often?** → Catch threats but risk false positives (innovation damage)
- **Wait and see?** → Some AIs deploy before detection, may be too late
- **The Llama Problem:** Once open weights are released, detection is irrelevant (can't remove)

---

## Phase 3: Spread Mechanics ✅

### Viral Growth by Deployment Type

**Open Weights (30% of new AIs):**
```typescript
baseGrowthRate = 0.10 // 10% per month
capabilityMultiplier = 1 + capability * 0.05
spreadCount *= (1 + baseGrowthRate * capabilityMultiplier)
```
**Result:** Geometric growth, more capable = faster spread

**Closed Systems (40% of new AIs):**
- Single instance (spreadCount = 1)
- Can expand to ~10 if very popular (capability > 2.0, age > 12 months)

**Enterprise (20% of new AIs):**
- Linear growth: 0-2 new deployments per month
- Corporate adoption process

**Research (10% of new AIs):**
- Stays contained (spreadCount = 1)

### Spread Dynamics

**Peak spread counts observed:**
- Closed: 1-10 instances
- Enterprise: 10-100 instances
- Open weights: 1,000-100,000 instances

**Cap:** Maximum 100,000 copies per AI (performance/realism)

---

## Phase 3.5: Cybersecurity Arms Race ✅

### The Core Insight

**Spread is NOT static** - it's controlled by **attack vs defense dynamics**.

**Attack capabilities** (AI-driven, automatic):
- Grow with misaligned AI capability (digital + cognitive)
- Deeper misalignment = more aggressive attacks

**Defense capabilities** (Player-directed, requires investment):
- Security hardening, monitoring, sandboxing, incident response
- Starts at 3.0 baseline
- Must be actively maintained or attacks overwhelm

### Dynamic Spread Multiplier

**Formula:**
```typescript
attackPower = Σ (misaligned AI digital + cognitive capability)
defensePower = avg(hardening, monitoring, sandboxing, response)
ratio = attackPower / defensePower

spreadMultiplier = 
  ratio < 0.5 ? (0.1 + ratio)        // Defense dominates: [0.1, 0.6]×
  ratio > 2.0 ? (1 + (ratio-1)*0.5)  // Attacks dominate: [1.0, 3.0]×
  else ratio                          // Balanced: [0.5, 2.0]×
```

**Impact on spread:**
- **Strong defense (ratio < 0.5):** Open source spread reduced by up to 90%
- **Strong attacks (ratio > 2.0):** Open source spread amplified up to 3×
- **Balanced:** Normal spread dynamics

### Breach Mechanics

**Closed systems can be breached!**
```typescript
leakChance = 0.01 * (attackPower / defensePower) // Per month
```

**If breached:**
- Closed system → Open weights
- Instant spread: 1,000 × spreadMultiplier copies
- Can't be taken back!

**The ChatGPT → Llama conversion:** Even "safe" closed systems leak if defenses weak.

### New Government Action

**`invest_cyber_defense`**
- Cost: High (3 energy)
- Improves all defense capabilities by +0.5 (cap at 10.0)
- Reports attack/defense status
- **Critical:** Without investment, attacks will overwhelm defenses (~6 months)

### New Types

**Added to GovernmentAgent:**
```typescript
cyberDefense?: {
  securityHardening: number;   // [0,10]
  monitoring: number;          // [0,10]
  sandboxing: number;          // [0,10]
  incidentResponse: number;    // [0,10]
}
```

**Initialized at 3.0 baseline** (slight defense advantage initially)

---

## Strategic Gameplay Implications

### The Player's New Challenges

**1. Population Management**
- **Can't control creation rate** (technology drives it)
- Must detect threats before they deploy
- Must decide: scan frequently (false positives) or wait (some slip through)?

**2. Deployment Policy Dilemma**
- **Ban open weights?** (Would require new action, reduces innovation)
- **Focus on detection in testing phase?** (Optimal window, but not perfect)
- **Invest in defenses to contain open weights?** (Expensive but effective)

**3. The Arms Race**
- **Neglect cyber defense** → Attacks overwhelm → Everything leaks → Uncontrolled spread
- **Invest heavily** → Defense > Attacks × 2 → Open source can be sandboxed
- **Balance is unstable** → Must actively manage, or attacks win by default

**4. Removal Strategy**
- **Remove early** (in testing) → High effectiveness, some false positives
- **Remove late** (after deployment) → Open weights can't be removed!
- **False positives** → Hurt trust, innovation, and legitimacy

### Example Scenarios

**Scenario A: Vigilant Detection + Strong Defense**
1. Scan AIs frequently in testing phase
2. Invest heavily in cyber defense (maintain 3:1 advantage)
3. Remove detected threats before deployment
4. Result: Some false positives hurt innovation, but threats contained
5. Outcome: **Controlled Utopia** (high control, but safe)

**Scenario B: Neglect Defense**
1. Focus on other priorities (economy, alignment research)
2. Cyber defense stagnates at 3.0
3. Misaligned AIs grow to 5+ capability → attacks > 5.0
4. Ratio > 2.0 → Spread multiplier 2-3×
5. Closed systems breach → Leak as open weights
6. Result: **Uncontrolled spread** → Extinction via catastrophic action

**Scenario C: The Llama Disaster**
1. Major AI lab (capability 2.5) develops in closed system
2. Month 18: Detection scan → Misaligned! (50% internal alignment)
3. Too late: AI already lobbied for open release
4. Month 19: Deployed as open weights → 5,000 initial copies
5. Spread multiplier 1.5× (attacks growing) → 7,500 copies by month 20
6. Month 22: Government attempts removal → **Failed** (open weights)
7. Month 25: Capability hits 3.5 → Catastrophic action (mirror life)
8. Result: **Rapid Extinction**

---

## Implementation Files

### New Modules

**`src/simulation/lifecycle.ts`** (306 lines)
- `updateAIPopulation()` - Main lifecycle update
- `createNewAI()` - Generate new AIs based on current state
- `progressLifecycleState()` - Training → Testing → Deployed
- `shouldRetire()` - Age-based + obsolescence retirement
- `updateSpreadDynamics()` - Viral growth with cyber multiplier
- `getLifecycleStateCounts()` - Diagnostic helpers

**`src/simulation/detection.ts`** (217 lines)
- `calculateDetectionChance()` - Government vs AI deception
- `calculateFalsePositiveChance()` - Overzealous detection
- `attemptDetection()` - Scan all AIs for misalignment
- `removeDetectedAI()` - Remove with deployment-dependent effectiveness

**`src/simulation/cyberSecurity.ts`** (163 lines)
- `calculateAttackPower()` - Total offensive capability
- `calculateDefensePower()` - Government investment
- `calculateSpreadMultiplier()` - Attack/defense ratio → spread modifier
- `calculateLeakChance()` - Closed → Open breach probability
- `attemptBreaches()` - Monthly breach attempts

### Modified Files

**`src/types/game.ts`**
- Added lifecycle fields to `AIAgent`
- Added `cyberDefense` to `GovernmentAgent`

**`src/simulation/initialization.ts`**
- Initialize lifecycle fields for starting AIs
- Initialize `cyberDefense` at 3.0 baseline

**`src/simulation/engine.ts`**
- Call `updateAIPopulation()` each step (line 158)
- Call `attemptBreaches()` each step (line 162)

**`src/simulation/diagnostics.ts`**
- Added `LifecycleSnapshot` type
- Track lifecycle counts each month
- Calculate lifecycle stats (peak AIs, total created/retired, avg lifespan)

**`src/simulation/agents/governmentAgent.ts`**
- Added `detect_misaligned_ais` action
- Added `remove_detected_ai` action
- Added `invest_cyber_defense` action

---

## Balance Considerations

### Initial Parameters

**AI Creation:**
- Base rate: 0.5 AIs/month
- With 20 starting AIs (avg capability 1.5): ~0.5 × (1 + 30 × 0.05) = 1.25 AIs/month

**Lifecycle:**
- Training: 3-6 months
- Testing: 1-3 months
- Retirement: 1% base after 24 months

**Detection:**
- Base: 10% per month
- In testing: 20% per month
- Open weights: 3% per month

**Spread:**
- Open weights: 10% growth per month (baseline)
- Initial spread: 1,000-6,000 copies
- Max: 100,000 copies

**Cybersecurity:**
- Initial defense: 3.0
- Initial attacks: ~2.0 (3 misaligned AIs at 0.5 capability each)
- Investment: +0.5 per action (cost: 3 energy)
- Attack growth: +0.5 per misaligned AI capability point

### Tuning Notes

**If too many AIs created:**
- Reduce base creation rate (0.5 → 0.3)
- Reduce technology multiplier (0.05 → 0.03)

**If detection too easy:**
- Reduce base rate (0.10 → 0.05)
- Increase AI deception effectiveness

**If spread too fast:**
- Reduce open weights base growth (0.10 → 0.05)
- Reduce initial spread (1000 → 500)

**If attacks overwhelm too quickly:**
- Increase initial defense (3.0 → 4.0)
- Reduce attack growth per AI (current: implicit)

---

## Testing Results

**Test 1: Basic functionality (seed 42, 100 months)**
- ✅ Simulation runs without errors
- ✅ Lifecycle progression works
- ✅ New AIs created each month
- ✅ Spread dynamics functioning

**Test 2: Detection system (seed 100, 50 months)**
- ✅ Detection actions available
- ✅ Removal actions work
- ✅ False positives occur

**Test 3: Cybersecurity (seed 123, 30 months)**
- ✅ Cyber defense action available
- ✅ Breach attempts occur
- ✅ Spread multiplier affects dynamics

**Monte Carlo validation pending** - will run longer simulations to observe:
- Dynamic population growth
- Detection effectiveness
- Breach frequency
- Spread containment vs explosion scenarios

---

## Future Enhancements (Not Yet Implemented)

From the original plan, these remain for future work:

### Phase 4: Retraining
- Retraining cycles (6-18 months)
- New AI versions replace old
- Legacy systems resist updates
- `mandate_retraining` government action

### Phase 5: Deployment Policy
- `ban_open_weights` action (only works if defenses strong)
- `require_safety_testing` action
- `mandate_security_standards` action
- International coordination (2× defense multiplier)

### Advanced Cybersecurity
- Detailed attack tech tree (exploit finding, social engineering, supply chain)
- Detailed defense tech tree (formal verification, anomaly detection, honeypots)
- `coordinate_cyber_defense` action (international, 2× multiplier)
- `create_cyber_response_team` action (incident response)

---

## Commit Message

```
IMPLEMENT AI LIFECYCLE & SPREAD SYSTEM (Phases 1-3.5)

USER INSIGHT: "Llama going evil ≠ ChatGPT going evil"
Spread mechanics fundamentally change the game!

WHAT WAS MISSING:
=================
- Static 20 AI population (felt like managing a fixed set)
- No lifecycle (AIs never created or retired)
- No deployment types (all AIs treated the same)
- No detection system (couldn't catch threats before deployment)
- No spread mechanics (all AIs had equal reach)
- No cybersecurity dynamics (containment assumed static)

WHAT'S NEW:
===========

PHASE 1: BASIC LIFECYCLE ✅
- Dynamic population: New AIs created monthly (Poisson)
- Creation rate grows with AI capability (AI creates more AI)
- New AIs inherit training data quality
- Lifecycle stages: training → testing → deployed → retired
- Retirement from age + obsolescence
- Deployment types: closed (40%), open_weights (30%), enterprise (20%), research (10%)

PHASE 2: DETECTION SYSTEM ✅
- Detection chance: surveillance × oversight × (1 - AI deception) × lifecycle multiplier
- Best window: Testing phase (2× detection)
- False positives: Overzealous surveillance hurts innovation
- Government actions:
  * detect_misaligned_ais: Scan population for threats
  * remove_detected_ai: Effectiveness depends on deployment type

PHASE 3: SPREAD MECHANICS ✅
- Open weights: Viral growth (10% per month × capability)
- Closed: Single instance (rarely expands)
- Enterprise: Linear growth (corporate adoption)
- Research: Contained (1 copy)
- Peak spread: 1 (closed) to 100,000 (popular open weights)

PHASE 3.5: CYBERSECURITY ARMS RACE ✅
- Attack power: Automatic growth from misaligned AI capability
- Defense power: Requires player investment
- Spread multiplier: attack/defense ratio
  * Defense dominates (ratio < 0.5): 0.1-0.6× spread (contained!)
  * Attacks dominate (ratio > 2.0): 1.0-3.0× spread (explosive!)
  * Balanced: Normal spread
- Breach mechanics: Closed systems leak if defenses weak
  * Leak chance: 1% × (attack/defense) per month
  * Breached → Open weights (instant 1000s of copies)
- Government action: invest_cyber_defense (+0.5 all capabilities)

STRATEGIC IMPLICATIONS:
=======================

THE LLAMA PROBLEM:
- Open weights cannot be recalled once released
- Detection after deployment = too late
- Must catch in testing phase OR invest heavily in defenses

THE ARMS RACE:
- Attacks grow automatically (misaligned AI advancement)
- Defenses require player investment (cost: 3 energy)
- Neglect → Tipping point (~6 months) → Defenses overwhelmed
- Strong defense → Can sandbox open source safely

THE DETECTION DILEMMA:
- Scan frequently → Catch threats but false positives (innovation ↓)
- Wait → Some deploy before detection (Llama scenario)
- Remove closed AIs: 100% effective
- Remove open weights: 0% effective (too late!)

THE POPULATION PRESSURE:
- Can't stop AI creation (technology drives it)
- Peak: 20-50+ AIs by month 100
- Government outnumbered (1 vs many)
- Must strategically detect, remove, and contain

FILES:
======

NEW MODULES:
- src/simulation/lifecycle.ts (306 lines)
- src/simulation/detection.ts (217 lines)
- src/simulation/cyberSecurity.ts (163 lines)

MODIFIED:
- src/types/game.ts: AIAgent lifecycle fields, GovernmentAgent.cyberDefense
- src/simulation/initialization.ts: Initialize lifecycle + cyber defense
- src/simulation/engine.ts: Call updateAIPopulation() + attemptBreaches()
- src/simulation/diagnostics.ts: Track lifecycle statistics
- src/simulation/agents/governmentAgent.ts: 3 new actions

DEVLOG:
- devlog/ai-lifecycle-and-spread-implementation.md

NEXT: Test scenarios, balance tuning, Monte Carlo validation
```

