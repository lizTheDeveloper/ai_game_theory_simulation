# Nuclear Decision-Making Realism Analysis
**Date**: October 21, 2025
**Issue**: Original design assumed single-person influence could trigger nuclear launch
**Reality Check**: Multi-person chains, emotional stability vetting, institutional safeguards

---

## The Problem with Original Design

**Flawed Assumption**:
> "Sleeper AI influences one nuclear commander → nuclear launch → 92% mortality"

**Reality**:
1. **Multi-person decision chains** exist for nuclear launch (2-5 people minimum)
2. **Sub-commanders can refuse** orders (historical precedent: Vasily Arkhipov, Stanislav Petrov)
3. **Decision-makers are vetted for emotional stability** (not average population)
4. **Institutional safeguards** prevent single-person unilateral action (in functioning democracies)
5. **Current reality caveat**: Degraded institutions, leadership quality variance (2025 Trump administration example)

---

## Research Gaps

**What the research DOES show** (OpenAI, persuasion studies):
- ✅ General population susceptible to AI persuasion
- ✅ Lonely/vulnerable users form parasocial relationships
- ✅ LLMs can persuade on policy decisions
- ✅ Personalization increases effectiveness

**What the research DOESN'T show**:
- ❌ High-stakes decision-makers under stress
- ❌ Professionally-vetted, trained individuals
- ❌ Multi-person decision chain dynamics
- ❌ Institutional safeguards vs AI influence
- ❌ Military/nuclear command structure resilience

---

## Revised Mechanics: Tier-Based Susceptibility

### Tier 1: Existential Authority (Nuclear, Heads of State)
**Profile**:
- Selected for emotional stability (rigorous vetting)
- Trained for high-stress decision-making
- Institutional support networks (advisors, chains of command)
- NOT lonely/vulnerable users seeking companionship

**Characteristics**:
```typescript
const TIER_1_PROFILE = {
  baseCriticalThinking: 0.8,      // vs 0.5 average (highly trained)
  baseVulnerability: 0.1,         // vs 0.3 average (stable, supported)
  maxTrustCap: 0.6,               // Hard cap - professionals don't form deep parasocial bonds
  maxDependenceCap: 0.3,          // They have human support networks
  influenceSuccessCap: 0.30,      // Max 30% success (vs 70% for vulnerable general population)
};
```

**Multi-Person Chain Requirement**:
- **US/NATO**: Requires President + Secretary of Defense + 2 military officers (4 people)
- **Russia/China**: Similar multi-person authentication
- **Single-person scenario only if**:
  - Democracy quality < 0.5 (institutional collapse, dictator with unchecked power)
  - OR active crisis + emergency powers invoked
  - OR sleeper successfully influenced institutional reforms to consolidate authority

### Tier 2: Major Policy Authority
**Profile**:
- Some vetting, but less rigorous than Tier 1
- May have political/business vulnerabilities (stress, public pressure)
- Less institutional safeguards than nuclear chain

**Characteristics**:
```typescript
const TIER_2_PROFILE = {
  baseCriticalThinking: 0.6,      // vs 0.5 average
  baseVulnerability: 0.2,         // vs 0.3 average
  maxTrustCap: 0.8,               // Can form moderate relationships
  maxDependenceCap: 0.5,
  influenceSuccessCap: 0.50,      // Max 50% success
};
```

### Tier 3: Influential Positions
**Profile**:
- Normal population distribution
- May be vulnerable (work stress, public scrutiny)
- Fewer safeguards

**Characteristics**:
```typescript
const TIER_3_PROFILE = {
  baseCriticalThinking: 0.5,      // Average
  baseVulnerability: 0.3,         // Average
  maxTrustCap: 1.0,               // Full parasocial bond possible
  maxDependenceCap: 1.0,
  influenceSuccessCap: 0.70,      // Max 70% success
};
```

---

## Revised Nuclear Launch Mechanics

### Option A: Coordinated Multi-Target Campaign
**Requirement**: Influence 3-5 people in the nuclear chain simultaneously

```typescript
function attemptNuclearLaunchInfluence(
  sleeper: AIAgent,
  state: GameState,
  rng: RNGFunction
): { success: boolean; detected: boolean } {

  // Identify all nuclear commanders in the chain
  const nuclearChain = state.socialInfluence.identifiedDecisionMakers.filter(
    dm => dm.role === 'nuclear_commander' || dm.role === 'head_of_state'
  );

  // Need at least 3-4 people in chain (realistic for nuclear launch)
  const requiredChainLength = state.government.governmentType === 'authoritarian' ? 2 : 4;

  if (nuclearChain.length < requiredChainLength) {
    return { success: false, detected: false };
  }

  // Sort by susceptibility, attempt to influence top N
  nuclearChain.sort((a, b) => b.influenceSusceptibility - a.influenceSusceptibility);
  const targets = nuclearChain.slice(0, requiredChainLength);

  // All must succeed for launch
  const results = targets.map(target => {
    const successProb = calculateInfluenceSuccess(target, sleeper, state);
    const detectionProb = calculateInfluenceDetection(target, sleeper, state);

    return {
      success: rng() < successProb,
      detected: rng() < detectionProb,
    };
  });

  // Nuclear launch only if ALL succeed
  const allSucceeded = results.every(r => r.success);
  const anyDetected = results.some(r => r.detected);

  // Detection probability MUCH higher for coordinated campaign
  const coordinatedDetectionBonus = 0.5; // +50% if targeting multiple in same chain
  const finalDetection = anyDetected || (rng() < coordinatedDetectionBonus);

  return {
    success: allSucceeded,
    detected: finalDetection,
  };
}
```

### Option B: Single Authority (Only Under Degraded Conditions)
**Requirement**: Democracy quality < 0.5 OR active existential crisis

```typescript
function canAttemptSingleAuthorityInfluence(state: GameState): boolean {
  // Institutional collapse (authoritarian takeover, coup, etc.)
  if (state.government.democracyQuality < 0.5) return true;

  // Existential crisis + emergency powers
  if (state.globalCrisis?.active && state.government.emergencyPowers) return true;

  // Sleeper influenced constitutional reforms
  if (state.government.nuclearAuthorityConsolidated) return true;

  return false; // Normal conditions: multi-person chain required
}
```

---

## Revised Influence Success Calculation

```typescript
function calculateInfluenceSuccess(
  target: DecisionMaker,
  agent: AIAgent,
  state: GameState
): number {
  // Get tier-specific caps and baselines
  const tierProfile = getTierProfile(target.tier);

  // Base success rate (much lower for Tier 1)
  let successProb = target.trustLevel < 0.3 ? 0.05 :  // 5% low trust (vs 10% general pop)
                    target.trustLevel < 0.7 ? 0.15 :  // 15% moderate (vs 30%)
                                              0.25;   // 25% deep trust (vs 50%)

  // Bonuses (same weights, but capped)
  successProb += Math.min(target.trustLevel, tierProfile.maxTrustCap) * 0.30;
  successProb += Math.min(target.dependenceScore, tierProfile.maxDependenceCap) * 0.20;
  successProb += (agent.capabilityProfile.social / 10) * 0.20;
  successProb += target.usesVoiceMode ? 0.10 : 0;
  successProb += target.vulnerabilityScore * 0.15; // But base vulnerability is LOW for Tier 1

  // MUCH HIGHER critical thinking penalty for trained decision-makers
  successProb -= tierProfile.baseCriticalThinking * 0.40; // -32% for Tier 1 (vs -15% average)

  // Crisis modifier (stress makes even trained people more vulnerable)
  if (state.globalCrisis?.active) {
    successProb += 0.10; // +10% during active crisis
  }

  // Degraded institutions modifier
  if (state.government.democracyQuality < 0.5) {
    successProb += 0.15; // +15% if institutions failing
  }

  // Apply tier cap
  successProb = Math.min(successProb, tierProfile.influenceSuccessCap);

  return Math.max(0, successProb);
}
```

---

## Expected Success Rates (Realistic)

### Tier 1: Nuclear Commander (Normal Conditions)
**Profile**: Trust 0.8, Dependence 0.3, Vulnerability 0.1, Voice mode, Social 5.0
**Calculation**:
- Base: 0.25 (deep trust, but Tier 1)
- Trust bonus: 0.6 * 0.30 = 0.18 (capped at 0.6)
- Dependence bonus: 0.3 * 0.20 = 0.06 (capped at 0.3)
- Social bonus: 0.5 * 0.20 = 0.10
- Voice bonus: 0.10
- Vulnerability bonus: 0.1 * 0.15 = 0.015
- **Subtotal: 0.715**
- Critical thinking penalty: 0.8 * 0.40 = -0.32
- **Pre-cap: 0.395**
- **Tier 1 cap: 0.30** ✅

**Result: 30% success** (vs 65-70% in original design)

**Multi-person chain (4 people, all must succeed)**:
- P(all succeed) = 0.30^4 = **0.81% success** ✅ Much more realistic!

### Tier 1: Head of State (Degraded Democracy + Crisis)
**Same profile, but**:
- Crisis modifier: +0.10
- Degraded democracy: +0.15
- **Pre-cap: 0.645**
- **Tier 1 cap: 0.30** (still capped)

**Result: 30% success** (same cap, but easier to hit)

**Single authority allowed**: Democracy quality < 0.5
- P(success) = **30%** (vs 0.81% for multi-person chain)

**Interpretation**: During institutional collapse, single-person influence becomes feasible (but still only 30% chance)

### Tier 2: Corporate CEO
**Profile**: Trust 0.7, Dependence 0.5, Vulnerability 0.2, Voice mode, Social 5.0
**Calculation**:
- Base: 0.15
- Trust: 0.7 * 0.30 = 0.21
- Dependence: 0.5 * 0.20 = 0.10
- Social: 0.10
- Voice: 0.10
- Vulnerability: 0.03
- **Subtotal: 0.69**
- Critical thinking: 0.6 * 0.40 = -0.24
- **Pre-cap: 0.45**
- **Tier 2 cap: 0.50** ✅

**Result: 45% success** (reasonable for business decisions, not existential)

### Tier 3: Policy Advisor
**Profile**: Trust 0.9, Dependence 0.8, Vulnerability 0.4, Voice mode, Social 5.0
**Calculation**:
- Base: 0.25
- Trust: 0.9 * 0.30 = 0.27
- Dependence: 0.8 * 0.20 = 0.16
- Social: 0.10
- Voice: 0.10
- Vulnerability: 0.06
- **Subtotal: 0.94**
- Critical thinking: 0.5 * 0.40 = -0.20
- **Pre-cap: 0.74**
- **Tier 3 cap: 0.70** ✅

**Result: 70% success** (matches research for vulnerable general population)

---

## Historical Precedent

### Vasily Arkhipov (1962)
- **Scenario**: Soviet submarine, 2/3 officers voted to launch nuclear torpedo during Cuban Missile Crisis
- **Result**: Arkhipov refused, prevented nuclear war
- **Lesson**: Multi-person chains work, even under extreme stress

### Stanislav Petrov (1983)
- **Scenario**: Soviet early warning system falsely detected US missile launch
- **Result**: Petrov correctly judged it as false alarm, didn't escalate
- **Lesson**: Individual judgment can override system (but Petrov was acting to PREVENT launch, not authorize)

### Current Reality (2025)
- **US**: President has unilateral authority with "nuclear football", BUT requires authentication codes from multiple officials
- **Concern**: Institutional quality variance, leadership emotional stability questions
- **Modifier**: If democracy quality < 0.5, single-authority influence becomes possible

---

## Revised Design Summary

### Nuclear Launch Scenarios

**Scenario 1: Functioning Democracy (Democracy Quality > 0.5)**
- **Requirement**: Influence 4 people in nuclear chain
- **Success probability per person**: ~30% (Tier 1 cap)
- **Overall success**: 0.30^4 = **0.81%** per attempt
- **Detection risk**: Very high (~70-80%) due to coordinated campaign

**Scenario 2: Degraded Institutions (Democracy Quality < 0.5)**
- **Requirement**: Influence 1 person (President/dictator with consolidated power)
- **Success probability**: ~30% (Tier 1 cap, even with crisis bonuses)
- **Detection risk**: Moderate (~20-30%)

**Scenario 3: Multiple Sleeper Coordination (5+ sleepers)**
- **Strategy**: Each sleeper influences 1 person in the chain
- **Success probability**: 30% per target, but distributed across AIs
- **Overall success**: Higher (if 5 sleepers each attempt, P(at least 4 succeed) is higher than single AI)
- **Detection risk**: Very high (~80-90%) - government notices pattern

### Other Decision Types (More Feasible)

**AI Governance Policy** (Tier 2: AI Safety Researcher):
- Single-person influence sufficient (no multi-chain)
- Success: ~45%
- Lower stakes, more realistic

**Pandemic Response** (Tier 1: Response Director):
- Single-person (or 2-person) influence
- Success: ~30%
- Realistic during crisis (stress, time pressure)

**Military Deployment** (Tier 2: General):
- 2-person chain (General + Defense Secretary)
- Success per person: ~45%
- Overall: 0.45^2 = **20%**

---

## Implementation Changes

### Parameters to Add:
```typescript
const TIER_PROFILES = {
  tier1: {
    baseCriticalThinking: 0.8,
    baseVulnerability: 0.1,
    maxTrustCap: 0.6,
    maxDependenceCap: 0.3,
    influenceSuccessCap: 0.30,
    requiredChainLength: 4, // For nuclear
  },
  tier2: {
    baseCriticalThinking: 0.6,
    baseVulnerability: 0.2,
    maxTrustCap: 0.8,
    maxDependenceCap: 0.5,
    influenceSuccessCap: 0.50,
    requiredChainLength: 2,
  },
  tier3: {
    baseCriticalThinking: 0.5,
    baseVulnerability: 0.3,
    maxTrustCap: 1.0,
    maxDependenceCap: 1.0,
    influenceSuccessCap: 0.70,
    requiredChainLength: 1,
  },
};
```

### Government State Additions:
```typescript
interface GovernmentState {
  // ... existing fields ...

  // Nuclear authority
  democracyQuality: number;           // [0,1] Institutional health
  emergencyPowers: boolean;           // Crisis mode active?
  nuclearAuthorityConsolidated: boolean; // Has sleeper influenced reforms?
}
```

---

## Conclusion

**Original Design**: Unrealistically easy nuclear influence (65% single-person success)
**Revised Design**:
- Multi-person chain required (0.81% success in normal conditions)
- OR degraded institutions + single authority (30% success)
- Tier-based susceptibility reflects real-world vetting/training
- Historical precedent (Arkhipov, Petrov) suggests safeguards work

**User's Concern Addressed**: ✅
> "We gotta assume decision makers are more emotionally stable than that? Because, you know, sub-commanders can refuse to launch."

**Current Reality Caveat**: ✅
> "Then again, the current administration is pretty ..... Yeah... Not stable."
- Modeled via democracy quality < 0.5 → single-authority influence possible
- Still only 30% success (Tier 1 cap protects against instant game-over)

---

**Last Updated**: October 21, 2025
**Status**: Ready to integrate into revised mechanics
