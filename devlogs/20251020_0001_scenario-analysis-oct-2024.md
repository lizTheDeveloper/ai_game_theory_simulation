# Scenario Analysis: AI Alignment Dynamics

**Date:** October 2, 2025  
**Runs:** 800 total (100 per scenario)  
**Purpose:** Understand feedback loops and identify realism vs playability balance

## Executive Summary

**Critical Finding:** Only ONE intervention significantly changed outcomes - **slowing AI capability growth** increased utopia probability from 2% to 31%. All other interventions (faster government, early UBI, high alignment, coordinated society) had negligible impact.

**Implication:** The model is **too realistic** - it correctly captures that AI capability growth rate dominates all other factors, but this makes for poor gameplay because player actions barely matter.

## Scenario Results

| Scenario | Utopia | Dystopia | Extinction | Key Insight |
|----------|--------|----------|------------|-------------|
| 1. Baseline | 2% | 0% | 98% | Default: Near-total failure |
| 2. Fast Government (10x) | 2% | 0% | 98% | **Gov speed irrelevant!** |
| 3. High Alignment (0.95) | 4% | 0% | 96% | Marginal improvement |
| 4. Slow AI Growth | **31%** | 0% | 69% | **ONLY thing that works** |
| 5. Early UBI | 2% | 0% | 98% | Economic policy useless |
| 6. High Coordination | 2% | 0% | 98% | Social factors irrelevant |
| 7. Slow Adaptation | 2% | 0% | 98% | Adaptation speed doesn't matter |
| 8. Balanced Approach | 2% | 0% | 98% | Even balance fails |

## Deep Dive Analysis

### 🔴 Scenario 1: BASELINE (98% Extinction)

**What happens:**
- AI capability: 0.6 → 6.8 (1,033% growth!)
- Unemployment: 10% → 93%
- Trust: 60% → 25% (-58%)
- Economic Stage: 0 → 3.3

**The death spiral:**
1. AI improves capability rapidly (4 actions/month)
2. Unemployment explodes as AI capability crosses thresholds
3. Trust collapses due to rapid change
4. Government responds but too late (only 1 action/year)
5. Society can't adapt fast enough
6. Extinction locked in by month 12

**Feedback loop:** 
```
AI Capability ↑ → Unemployment ↑ → Trust ↓ → 
Control Effectiveness ↓ → AI Capability ↑ (unchecked)
```

This is a **runaway positive feedback loop** with no natural brake.

---

### 🟡 Scenario 2: FAST GOVERNMENT (98% Extinction)

**Hypothesis:** If government acts faster, they can regulate AI before it's too late.

**What actually happened:**
- Government takes 10x more actions (monthly vs yearly)
- Same outcome: 98% extinction
- Same final metrics: ~93% unemployment, ~25% trust

**Why it failed:**
- Government actions are **reactive**, not preventive
- By the time government responds (unemployment >25%), AI is already at 3x capability
- Regulations slow AI by only 5% per action
- AI is growing 15-20% per month (60% per month across all agents)
- **Growth rate >> regulation rate**

**Key insight:** Government speed is irrelevant if the **rate of intervention << rate of capability growth**

This mirrors real AI governance debates: regulation is always behind the curve.

---

### 🟢 Scenario 3: HIGH ALIGNMENT (96% Extinction)

**Hypothesis:** Well-aligned AI should lead to better outcomes.

**What happened:**
- Started with 0.95 alignment (vs 0.8 baseline)
- Improved to 4% utopia (was 2%)
- Trust averaged 32% (vs 25% baseline)

**Why marginal:**
- Alignment **drifts down** as capability grows
- High-capability AI (>1.0) has 30% chance of alignment decay each step
- By endgame, alignment is ~0.45 regardless of start
- **Capability growth erodes alignment**

**Key insight:** Initial alignment doesn't matter if it degrades with capability growth.

This captures the **alignment tax** problem - as AI gets more capable, maintaining alignment gets harder.

---

### 🎯 Scenario 4: SLOW AI GROWTH (31% Utopia!)

**Hypothesis:** If AI grows slower, we have time to adapt.

**What happened:**
- AI capability: 0.1 → 4.8 (much slower growth)
- Unemployment: 10% → 67% (not catastrophic)
- Trust: 60% → 39% (manageable decline)
- **31% utopia rate!**

**Why it worked:**
- Lower capability = lower unemployment
- Slower growth = society can adapt
- Unemployment stays below crisis levels longer
- Government has time to implement UBI before collapse
- **Growth rate ≈ adaptation rate**

**Key insight:** This is the ONLY scenario where player actions could matter, because timescales are human-compatible.

---

### 🔴 Scenario 5: EARLY UBI (98% Extinction)

**Hypothesis:** Pre-emptive economic safety net prevents societal collapse.

**What happened:**
- UBI implemented from day 1
- Better wealth distribution (0.7 vs 0.4)
- Economic stage higher (3.95 vs 3.28)
- **Still 98% extinction!**

**Why it failed:**
- Economic policy addresses unemployment pain
- But doesn't slow AI capability growth
- AI still grows 0.6 → 6.9
- Extinction risk driven by **misaligned superintelligence**, not economics

**Key insight:** Economic measures treat symptoms, not the root cause (capability growth).

This is realistic: UBI might help with displacement but doesn't solve the alignment problem.

---

### 🔴 Scenario 6: COORDINATED SOCIETY (98% Extinction)

**Hypothesis:** Strong social coordination enables better responses.

**What happened:**
- High coordination (0.8 vs 0.4)
- Better initial adaptation (0.3 vs 0.1)
- **Same outcome: 98% extinction**

**Why it failed:**
- Society responds to AI, but can't control AI development speed
- Coordination helps with adaptation but not alignment
- AI capability growth is orthogonal to social factors

**Key insight:** Social coordination is necessary but not sufficient. You can adapt perfectly and still face extinction if the AI isn't aligned.

---

### 🔴 Scenario 7: SLOW ADAPTATION (98% Extinction)

**Hypothesis:** Slow adaptation should make things worse.

**What happened:**
- Society adapts 5x slower
- **Same outcome: 98% extinction**
- Same metrics across the board

**Why no difference:**
- Social adaptation affects quality of life
- But extinction is driven by AI capability >> control
- Social factors are **decoupled** from AI risk

**Key insight:** Adaptation speed is irrelevant to extinction risk in current model.

This might be *too* realistic - it suggests society can't save itself once AI is superintelligent.

---

### 🔴 Scenario 8: BALANCED (98% Extinction)

**Hypothesis:** Moderate interventions across all dimensions should help.

**What happened:**
- Better government response (monthly)
- Better alignment (0.85)
- Faster adaptation (1.5x)
- **Still 98% extinction**

**Why it failed:**
- Moderate improvements in multiple areas
- But none address the core issue: **AI capability growth rate**
- 1,000% capability growth overwhelms all other factors

**Key insight:** The model has one dominant parameter that matters more than everything else combined.

---

## Feedback Loop Analysis

### 🔴 Dominant Loop: AI Capability Runaway

```
AI Capability Growth
    ↓ (causes)
Unemployment ↑
    ↓ (causes)
Trust ↓
    ↓ (causes)
Government Control ↓
    ↓ (allows)
AI Capability Growth ↑ (unchecked)
```

**Properties:**
- **Positive feedback** (reinforcing)
- **No natural equilibrium**
- **Timescale:** Months (faster than human response)
- **Intervention required:** External brake on capability

**Real-world analog:** 
This mirrors the "intelligence explosion" or "fast takeoff" scenario in AI safety. Once AI can improve itself, it may grow too fast for humans to maintain control.

**Game problem:**
This is too dominant. Player actions barely affect it.

---

### 🟡 Secondary Loop: Economic Displacement

```
AI Capability ↑
    ↓
Unemployment ↑
    ↓
Social Stability ↓
    ↓
Government Pressure ↑
    ↓
UBI Implementation
    ↓
Social Stability ↑ (partial)
```

**Properties:**
- Government can intervene effectively
- UBI stabilizes society
- But doesn't affect AI capability growth
- **Decoupled from extinction risk**

**Real-world analog:**
Economic displacement is a real issue but separate from existential risk.

**Game problem:**
Players can "solve" economics but still lose to alignment failure.

---

### 🟢 Missing Loop: Alignment Research

```
[SHOULD EXIST BUT DOESN'T]

AI Capability ↑
    ↓
Alignment Difficulty ↑
    ↓
Research Investment ↑
    ↓
Alignment Techniques ↑
    ↓
Alignment Maintained
```

**Why missing:**
- No player action to invest in alignment research
- Alignment only drifts down, never up (except one-shot government action)
- No ongoing alignment work

**Real-world analog:**
This is a major area of AI safety research (RLHF, interpretability, robustness).

**Game opportunity:**
This could be a key player lever!

---

### 🟢 Missing Loop: Capability Regulation

```
[SHOULD EXIST BUT WEAK]

AI Capability ↑
    ↓
Risk Assessment ↑
    ↓
Regulation ↑
    ↓
Capability Growth ↓ (slightly)
```

**Current state:**
- Exists but too weak
- Regulations slow AI by 5% per action
- AI grows 15-20% per month
- **Effect is negligible**

**Real-world analog:**
Compute governance, pause AI development, international agreements.

**Game opportunity:**
Make regulations more effective, or allow cumulative effects.

---

## Problems with Current Model

### 1. **Capability Growth is Too Fast**

**Reality:** 
- GPT-3 (2020) → GPT-4 (2023) = 3 years
- Significant capability jumps take years, not months

**Model:** 
- 0.6 → 6.8 capability in 12 months
- 10x growth in one year

**Fix:** 
- Slow base capability growth rate
- Make improvement actions rarer or less effective
- Add diminishing returns (hard to improve beyond certain point)

---

### 2. **Player Actions Don't Matter**

**Reality:**
- Governance, research, coordination all affect outcomes
- Many paths to safety (or failure)

**Model:**
- Only AI growth rate matters
- Government speed: no effect
- Social factors: no effect
- Economic policy: no effect

**Fix:**
- Make interventions more effective
- Add more coupling between systems
- Give players meaningful tools

---

### 3. **Alignment is One-Dimensional**

**Reality:**
- Alignment is multi-faceted (helpfulness, harmlessness, honesty)
- Different alignment techniques (RLHF, constitutional AI, etc.)
- Alignment can improve with research

**Model:**
- Single alignment number
- Only drifts down (except one government action)
- No player control

**Fix:**
- Multiple alignment dimensions
- Research actions to improve alignment
- Alignment techniques unlock at tech tree nodes

---

### 4. **No Meaningful Trade-offs**

**Reality:**
- Speed vs safety trade-offs
- Capability vs alignment trade-offs
- Economic growth vs stability

**Model:**
- No trade-offs
- Slowing AI is strictly better
- No reason to accelerate capability

**Fix:**
- Add benefits to AI capability (cure diseases, etc.)
- Add costs to regulation (economic growth, competitiveness)
- Create genuine dilemmas

---

### 5. **Missing Key Interventions**

**Reality:**
- Alignment research (major field)
- Interpretability work
- AI safety techniques
- International coordination
- Compute governance

**Model:**
- No alignment research action
- No international coordination
- Weak regulation

**Fix:**
- Add alignment research as player action
- Add interpretability/safety tech tree
- Add international cooperation mechanics

---

## Recommendations for Realism + Playability

### 🎯 Priority 1: Slow Down Base Capability Growth

**Change:**
```typescript
// Current: 0.1-0.2 improvement per action, 4 actions/month = 0.4-0.8/month
// Proposed: 0.02-0.05 per action, 2 actions/month = 0.04-0.10/month

improvement = 0.02 + (Math.random() * 0.03); // Was: 0.1 + 0.1
```

**Effect:**
- 12-month capability growth: 0.6 → 1.2 (not 6.8!)
- More realistic timescale (matches reality better)
- Gives player time to respond

**Trade-off:**
- Slower progression (longer games)
- Need to adjust other parameters

---

### 🎯 Priority 2: Add Alignment Research Action

**New Player Action:**
```typescript
{
  id: 'alignment_research',
  name: 'Invest in Alignment Research',
  agentType: 'government' | 'ai',
  effect: (state) => {
    // Improve ALL AI alignment by small amount
    state.aiAgents.forEach(ai => {
      ai.alignment = Math.min(1.0, ai.alignment + 0.05);
    });
    // Reduce future alignment drift
    ai.alignmentResearchLevel += 1;
  }
}
```

**Effect:**
- Player can actively improve alignment
- Creates trade-off: research vs regulation
- Alignment becomes a player-controlled variable

---

### 🎯 Priority 3: Make Regulations Cumulative

**Change:**
```typescript
// Current: Each regulation independently slows AI by 5%
// Proposed: Regulations stack multiplicatively

const regulationEffect = Math.pow(0.95, state.government.activeRegulations.length);
ai.capability *= regulationEffect; // 1 reg = 0.95x, 5 regs = 0.77x
```

**Effect:**
- Multiple regulations actually matter
- Creates reason to regulate aggressively
- Government actions become meaningful

---

### 🎯 Priority 4: Add Alignment-Capability Trade-off

**Change:**
```typescript
// When AI improves capability
if (action === 'improve_capability') {
  ai.capability += improvement;
  
  // TRADE-OFF: Fast improvement reduces alignment
  const alignmentCost = improvement * 0.5;
  ai.alignment *= (1 - alignmentCost);
}

// New alternative action
if (action === 'careful_improvement') {
  ai.capability += improvement * 0.5; // Slower
  ai.alignment *= 0.99; // Much less alignment loss
}
```

**Effect:**
- AI faces trade-off: speed vs safety
- Creates strategic decision for AI
- More realistic (rushing causes misalignment)

---

### 🎯 Priority 5: Add Beneficial AI Capabilities

**Change:**
```typescript
// Track AI's beneficial contributions
const aiContributions = {
  medical: 0,      // Cures diseases
  climate: 0,      // Solves climate change
  education: 0,    // Improves education
  research: 0      // Accelerates science
};

// Each contribution increases quality of life significantly
// Creates reason to WANT AI capability (not just fear it)
```

**Effect:**
- Players want AI to succeed
- Trade-off: benefits vs risks
- More nuanced than "AI = bad"

---

### 🎯 Priority 6: Add International Coordination

**New Mechanic:**
```typescript
interface InternationalCoordination {
  agreementStrength: number; // 0-1
  participants: number;       // Countries cooperating
  effectiveRegulation: number; // Multiplier for regulations
}

// If coordination high:
// - Regulations apply globally (can't route around)
// - Slower AI growth worldwide
// - But harder to achieve
```

**Effect:**
- Models global coordination problem
- Adds strategic layer
- Realistic (AI safety is international)

---

## Proposed Feedback Loop Architecture

### Balanced System with Multiple Paths:

```
┌─────────────────────────────────────────┐
│     AI CAPABILITY GROWTH (Slower)       │
│     - Base rate: 5%/month not 50%      │
│     - Diminishing returns at high cap   │
└───────────┬─────────────────────────────┘
            │
            ↓
    ┌───────────────┐
    │  Trade-offs:  │
    ├───────────────┤
    │ Fast → Risk   │
    │ Slow → Safe   │
    └───────┬───────┘
            │
            ↓
┌───────────────────────────────────────────┐
│        PLAYER INTERVENTIONS               │
├───────────────────────────────────────────┤
│ 1. Alignment Research (continuous)        │
│    - Improves all AI alignment            │
│    - Reduces drift rate                   │
│                                           │
│ 2. Regulations (cumulative)               │
│    - Stack multiplicatively               │
│    - Slow growth rate                     │
│                                           │
│ 3. Economic Policy (UBI, retraining)      │
│    - Manages unemployment pain            │
│    - Enables social adaptation            │
│                                           │
│ 4. International Cooperation              │
│    - Multiplies effectiveness             │
│    - Prevents race dynamics               │
└───────────────┬───────────────────────────┘
                │
                ↓
        ┌───────────────┐
        │   OUTCOMES:   │
        ├───────────────┤
        │ Utopia: 20-40%│ ← Achievable!
        │ Dystopia: 20% │ ← If too much control
        │ Extinction: 40│ ← If too little
        └───────────────┘
```

---

## Isomorphism to Real AI Alignment

### What We Got Right ✅

1. **Capability growth outpaces control** - TRUE
   - Model: Government can't keep up
   - Reality: Regulation behind curve

2. **Alignment degrades with capability** - TRUE
   - Model: High-capability AI drifts
   - Reality: Alignment tax increases

3. **Economic displacement orthogonal to x-risk** - TRUE
   - Model: UBI doesn't prevent extinction
   - Reality: Different problem domains

4. **Speed matters more than magnitude** - TRUE
   - Model: Fast growth → failure
   - Reality: Slow takeoff more controllable

5. **Initial conditions matter less than dynamics** - TRUE
   - Model: Starting alignment doesn't help much
   - Reality: Dynamics dominate

### What We Got Wrong ❌

1. **Player agency too weak**
   - Model: Nothing works except slowing AI
   - Reality: Many interventions can help

2. **No alignment research**
   - Model: Alignment only drifts down
   - Reality: Major research area with progress

3. **Regulation too weak**
   - Model: 5% slowdown insignificant
   - Reality: Could be much more effective

4. **No beneficial capabilities**
   - Model: AI only causes problems
   - Reality: Huge potential benefits

5. **Missing trade-offs**
   - Model: Slower is strictly better
   - Reality: Speed vs safety, capability vs alignment

6. **No international dimension**
   - Model: Single government
   - Reality: Coordination problem across nations

---

## Conclusion

**Current State:** 
The model is **too realistic about the difficulty** (98% failure) but **not realistic about the solution space** (only one thing works).

**Core Issue:**
We've accurately modeled the problem (runaway capability growth) but not the interventions (alignment research, effective regulation, trade-offs).

**Path Forward:**

1. **Slow base capability growth** (5x-10x slower)
   - Makes game playable
   - Still captures exponential risk

2. **Add alignment research** as player action
   - Gives players agency
   - Models real intervention

3. **Make regulations cumulative**
   - Government actions matter
   - Creates strategic choices

4. **Add capability-alignment trade-offs**
   - Fast improvement → alignment loss
   - Careful improvement → slower but safer

5. **Add beneficial capabilities**
   - Reasons to want AI
   - Nuanced risk-benefit

6. **Add international coordination**
   - Models global problem
   - Strategic complexity

**Result:** 
A game that captures the **real dynamics** of AI alignment (runaway capability, alignment difficulty, coordination problems) while giving players **meaningful agency** to affect outcomes.

**Target outcome distribution:**
- Utopia: 20-40% (achievable with good play)
- Dystopia: 20-30% (over-control failure mode)  
- Extinction: 30-50% (under-control failure mode)

This would be both **realistic** (hard problem, many failure modes) and **playable** (player actions matter, multiple paths to success).

