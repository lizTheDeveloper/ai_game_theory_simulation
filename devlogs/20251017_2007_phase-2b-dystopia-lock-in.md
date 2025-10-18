# Phase 2B: Dystopia Lock-In Dynamics

**Date:** October 9, 2025  
**Status:** ✅ IMPLEMENTED

## Overview

Implemented a self-reinforcing dystopia trap: cascading crises → authoritarian takeover → inability to research social solutions → crises worsen → deeper dystopia.

## The Dystopia Lock-In Mechanism

### 1. Crisis-Driven Authoritarian Transitions

**Two paths to authoritarianism:**

#### Path 1: AI Threat (Existing)
- Low alignment (<0.4) + High capability (>1.5)
- Fear-driven political shift
- 2% chance/month at worst

#### Path 2: Cascade of Crises (NEW) ⭐
- 4+ active crises + Social stability <0.3
- Emergency powers → Permanent dictatorship
- 3% chance per crisis above 3

```typescript
const crisisCount = [
  resourceCrisisActive,
  pollutionCrisisActive,
  climateCatastropheActive,
  ecosystemCollapseActive,
  meaningCollapseActive,
  socialUnrestActive,
  institutionalFailureActive
].filter(Boolean).length;

if (crisisCount >= 4 && socialStability < 0.3) {
  transitionChance = 0.03 * (crisisCount - 3);
  // 4 crises: 3% chance
  // 5 crises: 6% chance
  // 6 crises: 9% chance
}
```

### 2. Authoritarian Research Penalties

Once authoritarian, government **cannot** effectively research social technologies:

| Technology | Democratic | Authoritarian | Reason |
|------------|-----------|---------------|--------|
| **Purpose Frameworks** | 100% | **20%** | Ideology blocks adaptation |
| **Community Platforms** | 100% | **30%** | Surveillance breaks trust |
| **Mental Health AI** | 100% | **50%** | Stigma + control culture |
| **Ecosystem Management** | 100% | **70%** | Ignores feedback loops |
| **Clean Energy** | 100% | 100% | Industrial tech unaffected |
| **Disease Elimination** | 100% | **80%** | Some brain drain |

**Technocratic bonuses (alternative path):**
- Clean Energy: +30%
- Carbon Capture: +30%
- Advanced Recycling: +30%
- Social tech: -30% (weak on human factors)

### 3. The Lock-In Spiral

```
1. Multiple crises trigger (environmental + social)
     ↓
2. Social stability crashes
     ↓
3. Authoritarian takeover (emergency powers)
     ↓
4. Surveillance + control increase
     ↓
5. CANNOT research social tech effectively
     ↓
6. Meaning crisis + social unrest CANNOT be resolved
     ↓
7. More crises → More control → Permanent dystopia
```

**Key insight:** Democratic governments can research **all** breakthrough tech → more paths to recovery. Authoritarian governments locked into technical solutions only → social crises persist forever.

### 4. Emergency Deployment (Crisis-Specific)

Technologies now deploy **faster** during relevant crises:

| Tech | Base Rate | Crisis Urgency | Max Multiplier |
|------|-----------|----------------|----------------|
| **Clean Energy** | 5%/month | Pollution + Climate | **3x** (15%/month) |
| **Ecosystem Mgmt** | 5%/month | Ecosystem Collapse | **2.6x** (13%/month) |
| **Purpose Frameworks** | 5%/month | Meaning Collapse | **2.6x** (13%/month) |
| **Mental Health AI** | 5%/month | Meaning Collapse | **2.4x** (12%/month) |
| **Disease Elimination** | 5%/month | No direct crisis | **1.0x** (5%/month) |

**Example:** If Clean Energy unlocked during active pollution + climate crises:
- Crisis urgency: 0.4 (pollution) + 0.4 (climate) = **0.8**
- Deployment multiplier: 1 + (0.8 × 2) = **2.6x faster**
- With $10B budget: 10/5 × 2.6 = **5.2% → capped at 15%/month**
- Full deployment in ~7 months instead of ~18 months

### 5. Crisis Resolution (Tech-Aware)

Technologies make crises **easier** to resolve:

#### Pollution Crisis
- **Without tech:** Pollution < 0.5
- **With Clean Energy (30%+):** Pollution < 0.6 ✅ (easier threshold)

#### Meaning Crisis
- **Without tech:** Meaning crisis level < 0.5
- **With Mental Health AI + Purpose Frameworks (30%+):** Level < 0.6 ✅

#### Ecosystem Collapse
- **Without tech:** Biodiversity > 0.6
- **With Ecosystem Management AI (40%+):** Biodiversity > 0.5 ✅

## Expected Outcomes

### Democratic Path
1. Crises trigger
2. Research all tech types
3. Deploy both environmental AND social tech
4. Resolve crises
5. Stabilize → Possible Utopia

### Authoritarian Path
1. Crises trigger
2. Authoritarian takeover
3. **Cannot** research social tech (20-50% rates)
4. Environmental tech deploys OK
5. **Social crises persist** (meaning, unrest)
6. Cascading failures continue
7. **Permanent dystopia** (surveillance state)

### Technocratic Path
1. Crises trigger
2. Technical solutions accelerate (+30%)
3. Environmental crises resolve fast
4. Social tech slower (-30%)
5. Mixed outcome: Technical utopia but social strain

## Implementation Details

### Files Modified

1. **`src/simulation/breakthroughTechnologies.ts`** (~150 lines added)
   - `getCrisisUrgency()` - Tech-specific crisis matching
   - `getGovernmentTypePenalty()` - Research penalties by government type
   - Emergency deployment scaling in `updateTechProgress()`
   - Tech-aware crisis resolution thresholds

2. **`src/simulation/dystopiaProgression.ts`** (~40 lines added)
   - Crisis-count authoritarian transition
   - Dystopia lock-in warning message

### Key Functions

```typescript
// Tech-specific crisis urgency
getCrisisUrgency(state, category, techId): number
// Returns 0-1 based on active crises relevant to THIS tech

// Government type research penalty
getGovernmentTypePenalty(state, techId, category): number
// Returns 0.2-1.3 multiplier on research progress

// Crisis resolution with tech awareness
checkCrisisResolution(state, month): void
// Uses deployed tech levels to adjust thresholds
```

## Balance Rationale

### Why 80% Penalty for Purpose Frameworks?
- Authoritarian regimes rely on **ideological rigidity**
- Cannot adapt worldview to post-work reality
- Historical: USSR struggled with cultural adaptation
- Creates meaningful path divergence

### Why 3% Transition Chance per Crisis?
- With 6 crises: 9% chance/month
- Over 12 months (1 year): ~70% chance of transition
- Allows some democratic runs to survive cascade
- But makes authoritarianism likely during prolonged crisis

### Why Emergency Deployment Up to 3x?
- Crisis creates political will + resources
- Manhattan Project / Apollo Program parallels
- But capped at 15%/month (still takes 7+ months)
- Prevents instant solutions

## Testing Observations

From `testEmergencyDeployment.ts` (60 months):
- ✅ Clean Energy unlocked + fully deployed
- ✅ Cascading failures happened (6 crises Month 48+)
- ✅ Multiple breakthroughs (Community Platforms, Recycling, Agriculture, Purpose Frameworks)
- ❌ Still resulted in Extinction (need full Monte Carlo to assess)
- 🔍 Crises resolved: Pollution ✅, Climate ✅, Ecosystem ✅
- 🔍 Meaning crisis still active at end

**Hypothesis:** Dystopia rate should increase, Utopia rate should increase (from 0%), Extinction rate should decrease.

## Next Steps

1. **Run full Monte Carlo** (10 runs, 120 months)
2. **Measure outcome distribution** - Expect:
   - Dystopia: 60% → 50-55% (slightly down)
   - Extinction: 40% → 30-35% (tech provides escape)
   - Utopia: 0% → 10-15% (democratic + fast tech = recovery)
3. **Check for authoritarian transitions** - Log frequency
4. **Verify lock-in dynamics** - Auth runs should have fewer social tech unlocks

---

**Status:** ✅ Ready for testing  
**Risk:** Dystopia lock-in may be too strong (need Monte Carlo data)  
**Opportunity:** Creates meaningful strategic divergence based on government response to crisis

