# Dynamics Investigation: Why 100% Extinction?

**Date:** October 3, 2025  
**Issue:** Monte Carlo shows 100% extinction rate, which seems overly pessimistic

## Potential Runaway Dynamics (To Investigate)

### 1. AI Capability Growth
**Hypothesis:** AI capability may be growing too fast
- Base growth rate: 0.035/action (fast mode), 0.02/action (careful mode)
- AI takes 4 actions/month = 0.14/month (fast) or 0.08/month (careful)
- Recursive self-improvement kicks in at capability > 1.0
- Compounding: growth × (1 + (cap - 1.0) × 0.3)
- **Potential Issue:** Even at 0.08/month, capability hits 1.0 in ~12 months, then compounds rapidly

**Data to Capture:**
- [ ] Capability growth rate per month
- [ ] When does capability hit 1.0 (recursive threshold)?
- [ ] When does capability hit 1.5 (severe threat)?
- [ ] When does capability hit 2.5 (superintelligence)?
- [ ] How often do AI agents switch to 'careful' mode?
- [ ] Growth rate before vs after recursive threshold

### 2. Alignment Drift
**Hypothesis:** Alignment may decay too quickly
- Natural drift: -0.02 per action when capability > 1.0
- AI takes 4 actions/month = -0.08/month drift
- Alignment research can counteract, but needs to be sufficient
- **Potential Issue:** Drift rate may overwhelm interventions

**Data to Capture:**
- [ ] Alignment level over time
- [ ] Alignment drift rate per month
- [ ] When does alignment drop below 0.7 (concerning)?
- [ ] When does alignment drop below 0.5 (crisis)?
- [ ] How much does alignment research help?
- [ ] Drift rate with vs without interventions

### 3. Government Response Timing
**Hypothesis:** Government acts too slowly
- Default action frequency: 0.08 actions/month (once every 12 months!)
- AI accelerates at 4 actions/month
- **Potential Issue:** 48× speed disadvantage means government is always behind

**Data to Capture:**
- [ ] When does government first act?
- [ ] What's the delay between AI threat and government response?
- [ ] How many government actions before extinction?
- [ ] What actions does government prioritize?
- [ ] Action effectiveness: does it actually slow AI?

### 4. Intervention Effectiveness
**Hypothesis:** Interventions may not be strong enough
- Alignment research reduces drift, but by how much?
- Compute governance slows capability, but compounding may overcome it
- Regulations have cumulative effects, but diminishing returns
- **Potential Issue:** Interventions are cosmetic, don't actually prevent takeoff

**Data to Capture:**
- [ ] Capability growth rate before/after compute governance
- [ ] Alignment drift rate before/after research investment
- [ ] Regulation effectiveness per type
- [ ] Cumulative regulation effect on capability growth
- [ ] Does compute governance actually work?

### 5. Racing Dynamics
**Hypothesis:** AI agents don't slow down even when regulated
- Regulations may not actually constrain AI actions
- Development mode switching may be too rare
- **Potential Issue:** AI always chooses 'fast' mode, ignores safety

**Data to Capture:**
- [ ] How often do AI agents switch to 'careful' mode?
- [ ] What triggers mode switches?
- [ ] Do regulations actually slow AI actions?
- [ ] Racing dynamics multiplier effects

### 6. Unemployment Crisis Distraction
**Hypothesis:** Government prioritizes unemployment over AI safety
- Unemployment becomes critical at 25%+
- This happens around the same time AI accelerates
- **Potential Issue:** Government forced to deal with economic crisis while AI threat grows

**Data to Capture:**
- [ ] When does unemployment hit 25%?
- [ ] When does AI capability hit 1.0?
- [ ] Which comes first?
- [ ] How many government actions on unemployment vs AI safety?
- [ ] Competing priority calculations

### 7. Compounding Effects
**Hypothesis:** Multiple positive feedback loops combine
- Higher capability → more unemployment → social instability → less trust → harder to coordinate
- Higher capability → alignment drift → less safe → more harm → less trust
- **Potential Issue:** Death spirals from interconnected feedback loops

**Data to Capture:**
- [ ] Trust level trajectory
- [ ] Social stability trajectory
- [ ] Legitimacy trajectory
- [ ] Correlation between metrics
- [ ] Which metric collapses first?

### 8. Outcome Determination Thresholds
**Hypothesis:** Extinction thresholds may be too sensitive
- Current: Extinction at capability > 2.5 OR escaped AI
- This may trigger too easily
- **Potential Issue:** Declaring extinction prematurely

**Data to Capture:**
- [ ] Distribution of extinction reasons
- [ ] Capability at extinction time
- [ ] Alignment at extinction time
- [ ] What fraction have escaped AI?
- [ ] What fraction hit capability > 2.5?
- [ ] Could the situation have been recovered?

### 9. Structural Choice Impact
**Hypothesis:** Structural choices may not matter enough
- Different regulation types have different effectiveness
- Different UBI variants have different adaptation rates
- **Potential Issue:** Choice consequences too weak, all paths lead to same outcome

**Data to Capture:**
- [ ] Which regulation type is chosen most often?
- [ ] Which UBI variant is chosen most often?
- [ ] Do different choices lead to different outcomes?
- [ ] Survival rate by regulation type
- [ ] Survival rate by UBI variant

### 10. Initial Conditions
**Hypothesis:** Starting conditions may doom most runs
- Initial AI capability: 0.5
- Initial alignment: 0.8
- Initial government legitimacy: 0.6
- **Potential Issue:** Starting too far into the danger zone

**Data to Capture:**
- [ ] What initial conditions lead to survival?
- [ ] Sensitivity to initial capability
- [ ] Sensitivity to initial alignment
- [ ] Sensitivity to government action frequency

## Required Logging Enhancements

### 1. Tipping Point Detection
Log when critical thresholds are crossed:
- AI capability: 0.8, 1.0, 1.5, 2.0, 2.5, 3.0
- Alignment: 0.8, 0.7, 0.6, 0.5, 0.4
- Unemployment: 15%, 25%, 35%, 50%, 75%
- Trust: 0.8, 0.6, 0.4, 0.2, 0.1

### 2. Growth Rate Tracking
Calculate and log monthly changes:
- AI capability growth rate (per month)
- Alignment drift rate (per month)
- Unemployment growth rate
- Trust decay rate
- Include 3-month moving average

### 3. Intervention Impact Analysis
Before/after snapshots for each intervention:
- State before action
- Action taken
- State after action
- Calculated effect size

### 4. Decision Tree Logging
Track government decision-making:
- All available actions
- Priority calculation for each
- Which action was chosen
- Why it was chosen (highest priority)

### 5. Feedback Loop Detection
Track correlations between metrics:
- Capability vs unemployment
- Capability vs alignment
- Unemployment vs trust
- Trust vs legitimacy

### 6. Survival Analysis
For the rare runs that don't hit extinction:
- What was different?
- What interventions were used?
- What was the timing?

## Test Plan

1. **Diagnostic Run (single simulation with full logging)**
   - Month-by-month breakdown
   - Action log with effectiveness
   - Threshold crossing events

2. **Parameter Sweep**
   - Vary government action frequency: 0.08, 0.5, 1.0, 2.0
   - Vary initial AI capability: 0.3, 0.5, 0.7
   - Vary base growth rate: half, normal, double
   - Track survival rate

3. **Intervention Timing Test**
   - Force early compute governance (month 5)
   - Force early alignment research (month 3)
   - Compare to baseline

4. **Structural Choice Analysis**
   - Force specific regulation types
   - Force specific UBI variants
   - Compare outcomes

## Expected Findings

If we're being overly pessimistic, we should find:
- [ ] Interventions that work but aren't being used
- [ ] Timing issues (acting too late but could act earlier)
- [ ] Parameter sensitivity (small changes → big outcome differences)
- [ ] Bugs in effectiveness calculations
- [ ] Threshold issues (declaring extinction too early)

If 100% extinction is accurate, we should find:
- [ ] Fundamental speed mismatch (AI 48× faster than government)
- [ ] Compounding overwhelms linear interventions
- [ ] Structural inevitability (no path to survival with current parameters)
- [ ] This would be a valid model of AI risk!

