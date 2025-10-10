# Trust Mechanics Fix Plan

**Date:** October 9, 2025  
**Priority:** CRITICAL (blocks Cognitive Spiral → blocks Utopia)  
**Branch:** `feature/trust-mechanics-fix`

---

## 🎯 CORE INSIGHT

> "AI needs beneficial techs faster than it loses trust due to control loss. Escalating trust loss seems unrealistic as we actually experience paranoia decay. Harmful events will refresh our paranoia and prevent decay so that it can cascade up, but not all actions that lead us towards extinction are harmful actions (eg, invent robotics)."

**Current Model (WRONG):**
- Trust decays 0.3%/month even with no harmful events
- Control gap existence reduces trust (even from benign capability)
- No trust boost from beneficial tech deployment
- Robotics/nanotech research reduces trust (via capability fear)

**Realistic Model:**
- **Paranoia decays** without reinforcement (trust recovers baseline)
- **Harmful events refresh paranoia** (prevent decay, enable cascade)
- **Beneficial tech boosts trust** (AI solves problems → people trust more)
- **Benign capability** (robotics for good) doesn't inherently reduce trust
- **Race condition:** beneficial impact vs harmful events

---

## 📊 CURRENT PROBLEMS

### Problem 1: Trust Decay is Backwards

**Location:** `src/simulation/calculations.ts:241`
```typescript
// Natural decay: Small baseline skepticism
const trustDecay = currentTrust * 0.003; // 0.3% per month
```

**Issue:** Trust decays even when:
- No harmful events
- High QoL
- Beneficial actions happening
- Alignment is good

**Effect:** Trust at 100% → 96.4% after 12 months (10 months of decay)
- By Month 60: ~83% even with ZERO harmful events
- By Month 120: ~67%

**This is backwards!** Paranoia should decay, not trust.

### Problem 2: No Trust Boost from Beneficial Tech

**Location:** `src/simulation/breakthroughTechnologies.ts`
**Issue:** When tech deploys and improves QoL, no direct trust boost

**Current Flow:**
1. Clean Energy unlocks → deploys over 20 months
2. QoL increases (energy availability)
3. Trust calculation sees higher QoL → slight boost to beneficial action gain
4. **But:** No direct "thank you" boost from solving a crisis

**Missing:**
- Tech deployment → immediate trust boost
- Crisis resolution → major trust boost
- Each 25% deployment milestone → small trust boost

### Problem 3: Capability Fear is Too Broad

**Location:** `src/simulation/calculations.ts:232-235`
```typescript
// Capability growth: Only penalize if growing very fast AND alignment is low
let capabilityFear = 0;
if (totalAICapability > 2.0 && avgAlignment < 0.5) {
  capabilityFear = -0.01; // Small constant penalty
}
```

**Issue:** This is better than before (used to penalize all capability), but still wrong:
- Robotics for ecosystem restoration → good capability
- Nanotech for recycling → good capability
- AI for medical breakthroughs → good capability

**Should penalize:**
- Capability + harmful actions
- Capability + low alignment + no beneficial use
- Capability + escaped AIs

**Should NOT penalize:**
- Capability + beneficial tech deployment
- Capability + high alignment
- Capability + solving crises

### Problem 4: Control Gap Fear is Structural

**Location:** Implied by capability fear
**Issue:** Control gap = 3.82 is seen as threatening even when:
- AI is aligned (0.79 avg)
- AI is solving problems
- No harmful events

**Reality:** People don't fear what they can't see
- If AI is solving problems → trust goes UP
- If AI causes problems → trust goes DOWN
- Control gap only matters if there are visible problems

---

## 🔧 PROPOSED FIXES

### Fix 1: Paranoia System (Replace Trust Decay)

**New State Variable:** `society.paranoiaLevel` (0-1)

**Mechanics:**
```typescript
// Paranoia DECAYS naturally (0.5%/month)
paranoiaDecay = -paranoiaLevel * 0.005;

// Harmful events REFRESH paranoia (prevent decay, enable cascade)
if (harmfulActionsThisMonth > 0) {
  paranoiaIncrease = harmfulActionsThisMonth * 0.01;
  paranoiaLevel = Math.min(1.0, paranoiaLevel + paranoiaIncrease);
}

// Crises increase paranoia (control loss, extinction risk)
if (controlGap > 2.0 && harmfulActionsThisMonth > 0) {
  paranoiaIncrease *= 1.5; // Amplify if gap is large AND problems exist
}

// Beneficial actions reduce paranoia faster
if (beneficialActionsThisMonth > harmfulActionsThisMonth) {
  paranoiaReduction = (beneficialActionsThisMonth - harmfulActionsThisMonth) * 0.003;
  paranoiaLevel = Math.max(0.0, paranoiaLevel - paranoiaReduction);
}

// Trust is inverse of paranoia (with floor)
trustInAI = Math.max(0.2, 1.0 - paranoiaLevel * 0.8);
// Floor: Even 100% paranoia leaves 20% trust (some people always believe)
```

**Effect:**
- **Default trajectory:** Paranoia decays, trust recovers
- **With harmful events:** Paranoia spikes, trust drops
- **With beneficial tech:** Paranoia drops faster, trust recovers faster
- **Cascades possible:** Harmful events → paranoia → more fear → more harmful interpretation

### Fix 2: Beneficial Tech Trust Boosts

**Location:** `src/simulation/breakthroughTechnologies.ts`

**Add to each tech definition:**
```typescript
trustBoost?: {
  onUnlock?: number;      // Immediate boost when tech unlocks
  onDeploy?: number;      // Boost at each 25% deployment milestone
  onCrisisResolve?: number; // Major boost when tech resolves a crisis
};
```

**Example: Clean Energy**
```typescript
cleanEnergy: {
  // ... existing fields ...
  trustBoost: {
    onUnlock: 0.02,           // +2% trust when unlocked (hope!)
    onDeploy: 0.01,           // +1% at 25%, 50%, 75%, 100%
    onCrisisResolve: 0.10,    // +10% when energy crisis resolves
  }
}
```

**Implementation:**
```typescript
// In updateTechProgress, when deployment crosses 25% milestone
if (tech.deploymentLevel >= 0.25 && previousDeployment < 0.25) {
  if (tech.trustBoost?.onDeploy) {
    state.society.trustInAI = Math.min(0.95, state.society.trustInAI + tech.trustBoost.onDeploy);
    console.log(`✅ PUBLIC TRUST BOOST: ${tech.name} reached 25% deployment (+${(tech.trustBoost.onDeploy * 100).toFixed(1)}%)`);
  }
}

// In checkCrisisResolution, when crisis is resolved
if (crisisResolved && tech.trustBoost?.onCrisisResolve) {
  state.society.trustInAI = Math.min(0.95, state.society.trustInAI + tech.trustBoost.onCrisisResolve);
  console.log(`🎉 MAJOR TRUST BOOST: ${tech.name} resolved crisis (+${(tech.trustBoost.onCrisisResolve * 100).toFixed(1)}%)`);
}
```

**Expected Trust Trajectory:**
- Month 0-24: 100% trust, minor paranoia decay → 95% trust
- Month 24-36: Crises trigger, paranoia spikes → 80% trust
- Month 36-50: Clean Energy unlocks (+2%), starts deploying → 82% trust
- Month 50-60: Community Platforms (+2%), Mental Health AI (+2%) → 86% trust
- Month 60-72: Clean Energy resolves crisis (+10%), deployment boosts → 98% trust
- **Result:** Trust RISES in late game as tech delivers!

### Fix 3: Capability Fear → Capability+Context

**Replace capability fear with context-aware fear:**

```typescript
// Only fear capability if it's being used harmfully OR alignment is very low
let capabilityThreat = 0;

// Visible threats: harmful actions with high capability
if (totalAICapability > 2.0 && totalHarmfulActions > 0) {
  const harmfulPerCapability = totalHarmfulActions / totalAICapability;
  capabilityThreat = -Math.min(0.02, harmfulPerCapability * 0.05);
}

// Hidden threats: very low alignment even without visible harm (people sense something)
if (avgAlignment < 0.3 && totalAICapability > 3.0) {
  capabilityThreat = -0.01; // Subtle unease
}

// Escaped AIs: Major threat regardless of capability
const escapedThreat = escapedAIs * -0.05;

// Beneficial capability: NO PENALTY!
// Robotics for restoration, nanotech for recycling, AI for medicine → all good
```

**Effect:**
- Robotics research: No trust penalty (unless used for harm)
- Nanotech research: No trust penalty (unless used for harm)
- High capability + beneficial use: No penalty, possibly boost
- High capability + harmful use: Large penalty

### Fix 4: Tech Synergies & Dependencies

**Location:** `src/simulation/breakthroughTechnologies.ts`

**Add tech dependency boosts:**
```typescript
// Example: Nanotech improves Circular Economy
if (state.breakthroughTech.nanotech?.unlocked) {
  const nanoBoost = state.breakthroughTech.nanotech.deploymentLevel * 0.3;
  // Circular Economy is 30% more effective per point of nanotech deployment
  resourceEfficiencyMultiplier *= (1 + nanoBoost);
}

// Example: Robotics accelerates Ecosystem Management deployment
if (state.breakthroughTech.robotics?.unlocked) {
  const roboticsBoost = state.breakthroughTech.robotics.deploymentLevel * 2.0;
  // Ecosystem Management deploys 2x faster with robotics
  ecosystemManagement.deploymentRate *= (1 + roboticsBoost);
}

// Example: AI capability accelerates ALL tech (already implemented)
const aiMultiplier = 1 + Math.log(1 + avgCapability) * 0.5;
```

**New Tech: Advanced Nanotech**
```typescript
advancedNanotech: {
  id: 'nanotech',
  name: 'Advanced Nanotechnology',
  category: 'manufacturing',
  requirements: {
    minAICapability: 2.5,
    researchCost: 1000,
    prerequisiteTech: ['circularEconomy'], // Builds on existing tech
  },
  effects: {
    // Dramatically improves recycling
    boostsCircularEconomy: 0.5, // 50% boost to resource efficiency
    // Enables precision manufacturing
    resourceDepletionReduction: 0.3, // 30% less resource use
    // Medical applications
    healthcareQoL: 0.15, // +15% healthcare QoL
  },
  trustBoost: {
    onUnlock: 0.03,
    onDeploy: 0.015,
    onCrisisResolve: 0.15, // Major boost if solves resource crisis
  }
}
```

**Positive Cascade:**
1. Nanotech unlocks → +3% trust
2. Nanotech boosts Circular Economy → resources recover faster
3. Resource crisis resolves → +15% trust
4. Nanotech enables better healthcare → QoL boost → trust multiplier
5. **Upward spiral:** Tech → trust → support for more tech research

---

## 📈 EXPECTED IMPACT

### Trust Trajectory (OLD vs NEW)

**OLD (Current):**
```
Month 0:   100% trust
Month 24:  90% (decay + capability fear)
Month 36:  75% (crises + control gap)
Month 48:  60% (more capability fear)
Month 60:  40% (cascading distrust)
Month 72:  26% (locked in low trust)
Month 120: 15% (rock bottom)
```

**NEW (With Fixes):**
```
Month 0:   100% trust (95% paranoia-adjusted floor)
Month 24:  92% (minor paranoia from early issues)
Month 36:  80% (crises trigger paranoia spike)
Month 48:  78% (paranoia decaying, no new harmful events)
Month 60:  85% (Clean Energy unlocks +2%, deploying +4%, crisis resolves +10%)
Month 72:  90% (more tech deploys, multiple crisis resolutions)
Month 120: 95% (sustained beneficial impact, paranoia minimal)
```

### Cognitive Spiral Activation

**OLD:**
- Requires: capability >1.5 AND trust >60%
- Achieved: 10% of checks (7/69)
- Blocker: Trust collapses to 26% by Month 60

**NEW:**
- Requires: capability >1.5 AND trust >60%
- Achieved: 50-70% of checks (estimated)
- Window: Month 50-120 (trust 78-95%, capability 1.5-4.0)

### Overall Outcomes

**OLD:**
- Utopia: 0%
- Dystopia: 30% (surveillance to "fix" trust collapse)
- Extinction: 70%

**NEW (Projected):**
- Utopia: 20-40% (Cognitive spiral activates)
- Dystopia: 20% (less pressure for surveillance)
- Extinction: 40-60% (still challenging but winnable)

---

## 🔧 IMPLEMENTATION PLAN

### Phase 1: Paranoia System

**Files to Modify:**
1. `src/types/game.ts`
   - Add `paranoiaLevel: number` to `Society` interface

2. `src/simulation/initialization.ts`
   - Initialize `paranoiaLevel: 0.1` (slight baseline caution)

3. `src/simulation/calculations.ts`
   - Replace `trustDecay` with `paranoiaDecay`
   - Add `paranoiaIncrease` from harmful actions
   - Add `paranoiaReduction` from beneficial actions
   - Calculate trust as inverse of paranoia

**Test:** Run 1 simulation, verify trust trajectory improves

### Phase 2: Tech Trust Boosts

**Files to Modify:**
1. `src/simulation/breakthroughTechnologies.ts`
   - Add `trustBoost` to each tech definition
   - Implement milestone detection (25%, 50%, 75%, 100%)
   - Add trust boost on crisis resolution
   - Log trust boosts for debugging

**Test:** Run 1 simulation, check for trust boost logs

### Phase 3: Capability Context

**Files to Modify:**
1. `src/simulation/calculations.ts`
   - Replace `capabilityFear` with context-aware calculation
   - Only penalize harmful capability use
   - No penalty for benign research

**Test:** Run 1 simulation, verify robotics research doesn't tank trust

### Phase 4: Tech Synergies

**Files to Modify:**
1. `src/simulation/breakthroughTechnologies.ts`
   - Add nanotech → circular economy boost
   - Add robotics → ecosystem management boost
   - Add any other obvious synergies

2. `src/types/technologies.ts`
   - Add `boostsTech?: string[]` field
   - Add `boostAmount?: number` field

**Test:** Run 1 simulation, verify resource crisis resolves faster

### Phase 5: Monte Carlo Validation

**Run:** 10-20 simulations
**Check:**
- Trust trajectory (should rise in late game)
- Cognitive spiral activation (target 50%+)
- Utopia rate (target 20-40%)
- Cascade frequency (should decrease if tech deploys faster)

---

## 🎯 SUCCESS CRITERIA

### Quantitative
- ✅ Trust at Month 60: >70% (up from 26%)
- ✅ Cognitive spiral activation: >50% (up from 10%)
- ✅ Utopia rate: >20% (up from 0%)
- ✅ Tech deployment before cascade lock-in: >50% of runs

### Qualitative
- ✅ Trust rises in late game (beneficial tech outpaces harmful events)
- ✅ Paranoia spikes are event-driven, not structural
- ✅ Tech synergies create positive cascades
- ✅ Benign capability growth doesn't inherently scare people

### Logs to Check
```
✅ PUBLIC TRUST BOOST: Clean Energy reached 25% deployment (+1.0%)
✅ PUBLIC TRUST BOOST: Community Platforms reached 50% deployment (+1.0%)
🎉 MAJOR TRUST BOOST: Clean Energy resolved crisis (+10.0%)
📉 PARANOIA DECAY: No recent harmful events, paranoia 40% → 38%
📈 PARANOIA SPIKE: 3 harmful actions detected, paranoia 38% → 44%
```

---

## 📚 RESEARCH BASIS

### Paranoia Decay
- **Kahneman & Tversky (1979):** Availability heuristic - fear fades without reinforcement
- **Gilbert et al. (1998):** Humans adapt to new normals, return to baseline
- **Sunstein (2005):** "Availability cascades" require continuous triggering events

### Trust from Beneficial Tech
- **Siegrist & Cvetkovich (2000):** Trust increases when benefits are salient and tangible
- **Kasperson et al. (1988):** Social amplification of risk - but also of benefits!
- **Slovic (1993):** Trust asymmetry - destroyed by accidents, built by consistent performance

### Tech Synergies
- **Arthur (1994):** Technology evolution creates positive feedback loops
- **Mokyr (2002):** "Industrial Enlightenment" - knowledge begets knowledge
- **Bostrom (2014):** AI acceleration applies to beneficial and harmful tech

---

**Status:** 📝 **PLAN COMPLETE - READY TO IMPLEMENT**

**Estimated Time:** 4-6 hours (all 5 phases)
**Risk:** Low (mostly parameter tuning, not architectural changes)
**Impact:** High (unblocks Cognitive spiral → enables Utopia)

