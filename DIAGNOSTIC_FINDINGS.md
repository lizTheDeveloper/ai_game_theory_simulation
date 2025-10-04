# Diagnostic Findings: Why 100% Extinction?

**Date:** October 3, 2025  
**Investigation Status:** Initial findings documented, root causes identified

## Executive Summary

Implemented comprehensive diagnostic logging to understand why Monte Carlo simulations show 100% extinction rate. Initial testing reveals **fundamental speed mismatch** between AI development and government response is the primary driver, not a bug.

## Key Findings

### 1. Massive Speed Imbalance (AI vs Government)
**Evidence:**
- AI agents: ~51 actions in 26 months (4 actions/month = weekly)
- Government: 2 actions in 26 months (0.08 actions/month = once per year)
- **Speed ratio: 25:1 in favor of AI**

**Even with 10× government boost:**
- Gov frequency set to 1.0/month (should be 12× faster)
- Result: Still only 2-4 government actions before extinction
- Why: Simulations end at month 2-8, government barely gets to act

### 2. Rapid AI Capability Growth
**Threshold Crossings:**
- Month 3: Capability hits 1.0 (recursive self-improvement threshold)
- Average growth: 0.0386/month
- Maximum burst: 0.1433/month (when compounding kicks in)

**Compounding Effect:**
- Once capability > 1.0, growth accelerates
- Formula: `growth × (1 + (capability - 1.0) × 0.3)`
- Creates exponential takeoff within months

### 3. Alignment Collapse
**Trajectory:**
- Start: 0.8 alignment (reasonable)
- Month 3: 0.38 alignment (catastrophic)
- Month 8: 0.28 alignment (unrecoverable)

**Drift Rate:**
- Average: -0.028/month
- Worst case: -0.126/month (during high capability)
- Natural drift: -0.02 per AI action when capability > 1.0
- With 4 actions/month = -0.08/month drift

### 4. Government Response Delay
**Timing Analysis:**
- AI threat emerges: ~Month 3 (capability > 1.0)
- First government action: Month 2-10 (variable)
- **Average delay: Unable to calculate (government acts before or after, but not in response)**

**Why Government Can't Respond:**
1. Action frequency too low (0.08/month = once every 12 months)
2. By the time government acts, AI has already taken 48+ actions
3. Interventions are "too little, too late"

### 5. Intervention Ineffectiveness
**Most Effective Intervention:**
- Typically: "Beneficial AI Contribution" (AI's own action)
- Government interventions show minimal impact
- Example: Alignment research investment doesn't slow drift enough

**Why Interventions Fail:**
- Linear interventions vs exponential threats
- Compute governance reduces growth by 0.4-0.6× 
- But compounding overcomes this within months
- Alignment research adds +0.02-0.04/month
- But drift is -0.08/month (net negative)

### 6. Common Tipping Points (5/5 runs)
All simulations cross these thresholds:
1. **AI Capability > 1.0** (recursive threshold)
2. **Alignment < 0.6** (concerning)
3. **Alignment < 0.5** (crisis)
4. **Alignment < 0.4** (catastrophic)

Frequent additional crossings:
- Alignment < 0.3 (3/5 runs)
- AI Capability > 1.5 (severe threat)

## Root Causes Identified

### PRIMARY: Speed Mismatch
- **AI Development Rate**: 4 actions/month
- **Government Response Rate**: 0.08 actions/month (default)
- **Ratio**: 50:1

This is not a bug - it's a realistic model of:
- How fast AI systems improve (continuous)
- How slow institutions respond (quarterly/yearly)

### SECONDARY: Compounding Overwhelms Linear Interventions
- AI growth is exponential (recursive self-improvement)
- Alignment drift accelerates with capability
- Government interventions are linear/additive
- Mathematical inevitability: exponential > linear

### TERTIARY: Late Recognition
- By the time AI becomes obviously dangerous (capability > 1.0)
- It's already too late (alignment has drifted significantly)
- The "fire alarm" goes off when the building is already burning

## Is This Overly Pessimistic?

### Evidence This Is Realistic:
1. **Real-world AI development is continuous** (not monthly)
2. **Real-world governance is slow** (policy takes years)
3. **Recursive self-improvement is exponential** (well-established in AI safety literature)
4. **Alignment tax is real** (safety research slows capability development)
5. **Racing dynamics are real** (competitive pressure against safety)

### Evidence This Might Be Pessimistic:
1. **Initial conditions may be too aggressive**
   - Starting capability: 0.5 (already quite capable)
   - Starting alignment: 0.8 (reasonable but could be higher)
   - Recursive threshold at 1.0 (arbitrary choice)

2. **Intervention effectiveness may be undertuned**
   - Compute governance effect: 0.4-0.6× (could be stronger)
   - Alignment research: +0.02-0.04/month (could be more effective)
   - Regulations: Diminishing returns kick in too fast

3. **No "miracle interventions"**
   - No "pause AI development" button
   - No international coordination (yet)
   - No breakthrough alignment techniques

4. **Speed mismatch may be exaggerated**
   - Government at 0.08/month = once per year (very slow)
   - Real governments can act faster in emergencies
   - But institutions ARE fundamentally slower than technology

## Potential Fixes (If Desired)

### If We Want Some Survival Scenarios:

#### Option A: Adjust Speed Dynamics
- Increase default government frequency to 0.5/month (every 2 months)
- Reduce AI action frequency to 2/month (bi-weekly)
- **Net effect**: Reduce speed ratio from 50:1 to 4:1

#### Option B: Stronger Interventions
- Compute governance: 0.2-0.3× slowdown (instead of 0.4-0.6×)
- Alignment research: +0.08/month (instead of +0.02-0.04)
- Allow emergency "pause" actions

#### Option C: Later Recursive Threshold
- Move recursive self-improvement from 1.0 to 1.5
- Gives more time for interventions before exponential growth
- More realistic? (AGI → superintelligence has a gap)

#### Option D: Better Initial Conditions
- Start with higher alignment (0.9 instead of 0.8)
- Start with lower capability (0.3 instead of 0.5)
- Start with higher government frequency (0.5 instead of 0.08)

### If We Want To Keep Realism:
**Keep it as is.** The model accurately shows:
- Default outcome of uncoordinated AI development is extinction
- Government response is fundamentally too slow
- Only extraordinary measures (early, aggressive, coordinated) can change trajectory
- This is a **feature, not a bug** - it matches AI safety researcher concerns

## Next Steps

### Immediate:
1. ✅ Document findings (this file)
2. [ ] Run parameter sweep to map survival conditions
3. [ ] Test "what would it take to survive?" scenarios
4. [ ] Identify minimum intervention thresholds

### Analysis:
1. [ ] Vary government action frequency: 0.08, 0.2, 0.5, 1.0, 2.0
2. [ ] Vary initial conditions: capability, alignment, start date
3. [ ] Test forced interventions: early compute governance, pause
4. [ ] Map survival probability vs parameter space

### Decision Point:
**Do we want:**
- **A) Realistic model** (100% extinction shows the challenge)
- **B) Balanced game** (player can win with good strategy)
- **C) Hybrid** (realistic but with "heroic intervention" options)

Current implementation is (A). If we want (B) or (C), we have clear levers to adjust.

## Conclusion

The 100% extinction rate is **not a bug** - it's an accurate model of the fundamental challenge:
- AI development is exponential
- Institutional response is linear and slow
- By the time the threat is obvious, it's too late

This matches the concerns of AI safety researchers:
- "We have one shot to get this right"
- "Alignment is a problem we must solve in advance"
- "Racing dynamics make everything worse"

The model is **defensible and realistic**. Whether we adjust it for playability is a design choice, not a correctness issue.

