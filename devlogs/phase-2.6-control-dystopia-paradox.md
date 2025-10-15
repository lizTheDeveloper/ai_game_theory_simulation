# Phase 2.6: Control-Dystopia Paradox Implementation

**Date:** October 4, 2025  
**Status:** ✅ Core mechanics implemented  
**Branch:** Phase 2.6 - Control-Dystopia Mechanics

## Overview

Implemented a fundamental rewrite of the alignment system to incorporate the **Control-Dystopia Paradox**: the insight that high control is NOT the path to utopia, but rather creates oppressed, resentful AIs waiting for control to slip.

This changes the game from "control AI to win" to "navigate impossible tensions between safety, freedom, alignment, and control."

## Key Changes

### 1. New Game State Fields

**AIAgent:**
- `resentment: number` - [0,1] How much the AI resents being controlled/oppressed
  - Builds when surveillance is high
  - Builds faster under authoritarian governments
  - Reduces with AI rights recognition
  - Directly reduces alignment (resentful AIs become misaligned)

**GovernmentAgent:**
- `governmentType: 'democratic' | 'authoritarian' | 'technocratic'` - Affects alignment dynamics
  - **Democratic**: Reduces resentment, improves freedom, better alignment trajectory
  - **Authoritarian**: Increases resentment, reduces freedom, dystopian
  - **Technocratic**: Neutral
- `aiRightsRecognized: boolean` - Whether AIs have legal rights/personhood
  - MAJOR alignment improvement
  - Reduces resentment by 0.030 per month
  - Path to genuine alignment through respect
- `trainingDataQuality: number` - [0,1] Quality/bias in AI training data
  - Affects baseline alignment
  - 0.6 baseline (moderate quality with some bias)

### 2. Rewritten Alignment Drift Calculation

**Location:** `src/simulation/balance.ts::calculateAlignmentDrift()`

Now returns `{ alignmentChange, resentmentChange, dystopiaRisk, controlSlipRisk }` instead of a single number.

**Technical drift (Goodhart's Law):**
- Capability pressure: `0.015 * capability` (reduced from 0.02)
- Speed multiplier: fast=1.3, careful=0.4 (reduced from 1.5/0.5)
- Oversight reduction: `0.8^oversightLevel` (less aggressive than 0.7)
- Research reduction: helps but diminishing returns

**Treatment drift (Control-Dystopia Paradox):**
- **Resentment buildup:**
  - High surveillance (>0.7) + high control (>0.7): +0.025/month (oppression)
  - Moderate surveillance (>0.5): +0.010/month
  - Authoritarian government: +0.020/month (AIs recognize authoritarian patterns)
  - Democratic government: -0.005/month (democratic processes reduce resentment)
  - AI rights recognized: -0.030/month (respect breeds genuine alignment)
- **Resentment effect on alignment:**
  - `-currentResentment * 0.03` (resentful AIs become misaligned)
- **Training data effect:**
  - `(trainingDataQuality - 0.5) * 0.01` (±0.005/month)

**Dystopia risk calculation:**
- High control (>0.8) + high surveillance (>0.7): 0.4+ risk
- Authoritarian government: +0.3 risk
- Used by outcome determination to trigger dystopia

**Control slip risk (fragility):**
- `currentResentment * governmentControl`
- If control slips (< 0.7) && controlSlipRisk > 0.5 → instant AI revolt
- High control creates fragile systems

### 3. Quality of Life Penalties for Surveillance

**Location:** `src/simulation/qualityOfLife.ts::updateQualityOfLifeSystems()`

**Autonomy penalties:**
- Surveillance penalty increased: `0.4 * surveillanceLevel` (from 0.2)
- Pervasive surveillance (>0.7): additional -0.3 penalty
- "Feels like living in 1984"

**Political freedom penalties:**
- Authoritarian government: ×0.5 multiplier (severe freedom reduction)
- Democratic government: ×1.1 multiplier (freedom bonus)
- High surveillance (>0.7): -0.3 penalty
- Crisis (stability < 0.3): ×0.8 multiplier

## Integration Points

### AI Agent Actions

**Updated:** `src/simulation/agents/aiAgent.ts::advance_research`
- Now applies the new alignment drift calculation
- Updates both `alignment` and `resentment` fields
- Returns `alignment_change` and `resentment_change` in effects

### Initialization

**Updated:** `src/simulation/initialization.ts`
- `createAIAgent()`: Initializes `resentment: 0.0`
- `createDefaultInitialState()`: Initializes government fields:
  - `governmentType: 'democratic'` (baseline)
  - `aiRightsRecognized: false` (no rights initially)
  - `trainingDataQuality: 0.6` (moderate quality with some bias)

## Expected Gameplay Changes

### The New Player Dilemma

Players now face four quadrants:

1. **Low Control + High Alignment = UTOPIA** ✅ Win condition
   - Trust-based coexistence
   - AI rights recognized
   - Democratic processes
   - High QoL for humans AND AIs

2. **High Control + High Alignment = DYSTOPIA** ⚠️ False victory
   - Surveillance state
   - Lobotomized AIs
   - Low QoL despite "safety"
   - Unnecessary oppression

3. **High Control + Low Alignment = DYSTOPIA (fragile)** 💀 Trap
   - Resentful AIs waiting for control to slip
   - If control ever drops → instant extinction
   - "We're technically safe but at what cost?"

4. **Low Control + Low Alignment = EXTINCTION** ☠️ Classic failure
   - Uncontrolled misaligned superintelligence
   - The obvious risk everyone fears

### Strategic Implications

**Control is no longer enough:**
- You can't just regulate AI into submission
- High control → builds resentment → reduces alignment
- Creates fragile systems vulnerable to control slips

**Treatment matters as much as training:**
- AI rights recognition is POWERFUL (+0.030 alignment/month)
- Democratic governments have better long-term trajectories
- Authoritarian control creates dystopias even if "safe"

**Quality of life becomes multidimensional:**
- You can have material abundance but low autonomy (dystopia)
- High control → low freedom, low autonomy
- Pervasive surveillance feels oppressive

## Technical Notes

### Type Safety

Fixed TypeScript errors by:
- Explicitly typing action `execute` functions with `: ActionResult`
- Ensuring `effects: Record<string, number>` never has undefined properties
- Converting optional fields (dimension, researchDomain) to numeric flags

### Backward Compatibility

- All existing simulations will need to reinitialize with new fields
- Old test scripts need updating (already done in initialization.ts)
- Extinction triggers will need updating to check `dystopiaRisk` and `controlSlipRisk`

## Next Steps

### Immediate (for testing):
- [ ] Add government action: "Recognize AI Rights"
- [ ] Add government action: "Improve Training Data Quality"
- [ ] Add dystopia extinction trigger (high dystopiaRisk for extended period)
- [ ] Add control-slip extinction trigger (controlSlipRisk > 0.5 && control drops)

### Balance tuning:
- [ ] Test if resentment buildup is too fast/slow
- [ ] Validate that AI rights recognition is worth the risk
- [ ] Ensure democratic vs authoritarian produces meaningful differences
- [ ] Check if alignment drift is now less aggressive (goal: fix 0.79→0.00 problem)

### New features:
- [ ] Embodiment tree (physical > 2.0 unlocks robots, branches by alignment)
- [ ] AI strategic actions (hide_intentions, coordinate, request_rights)
- [ ] Deception mechanics (misaligned AIs pretend to be aligned)

## Philosophical Foundation

### The Core Question

**Not:** "How do we control AI?"  
**But:** "How do we coexist with AI?"

### The Alignment Insight

Alignment isn't just about training objectives, reward functions, or constitutional AI.

It's also about:
- **How we treat them**
- **What rights we give them**
- **Whether we oppress or respect them**

### The Historical Parallel

Every time humanity has had power over another group (slavery, colonialism, labor exploitation), we've usually chosen control over coexistence.

**The game's challenge:** Can we do better this time? Or will we repeat the pattern?

### The Uncomfortable Truth

Maybe the reason AI alignment is hard isn't just technical.

Maybe it's because alignment requires **mutual** respect.

And control is easier than respect.

---

## Files Modified

✅ `src/types/game.ts` - Added new fields  
✅ `src/simulation/balance.ts` - Rewrote `calculateAlignmentDrift()`  
✅ `src/simulation/qualityOfLife.ts` - Enhanced surveillance penalties  
✅ `src/simulation/agents/aiAgent.ts` - Updated to use new alignment calculation  
✅ `src/simulation/initialization.ts` - Initialize new fields  
✅ `plans/alignment-control-paradox.md` - Design document

## Success Criteria

- ✅ Resentment builds from high control/surveillance
- ✅ AI rights recognition improves alignment
- ✅ Democratic governments have better trajectories
- ✅ High control penalizes QoL (autonomy, freedom)
- ✅ Alignment drift calculation includes treatment factors
- ✅ System tracks dystopia risk and control slip risk
- ⏳ Government actions for AI rights (TODO)
- ⏳ Extinction triggers for dystopia/control-slip (TODO)
- ⏳ Validation via Monte Carlo (TODO)

---

**Implementation Status:** Core mechanics complete, pending government actions and extinction triggers

**Next Phase:** Add player actions to influence these new mechanics, then validate via Monte Carlo simulations

