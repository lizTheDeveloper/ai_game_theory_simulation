# Governance Scenario Experimental Design

**Date:** 2025-11-23
**Context:** Phase 3 governance scenarios all crashed (98.8% mortality) due to immediate tech deployment
**Root Cause:** All 6 scenarios use `techDeployment: { mode: 'immediate' }` which deploys 92 technologies at month 0

---

## Problem Statement

**Current behavior:**
```
Month 0: 92 techs deployed → Economic bifurcation + technology shock
Year 1: -1.7B deaths (21% population loss)
Year 14: Crash (98.8% mortality, 8.14B → 97.8M)
```

**Why governance had no effect:**
- Climate spending: $1B/month << -1.7B deaths/month
- Redistribution: Cannot redistribute during collapse
- AI safety: Tech already deployed unsafely

**Question:** What governance interventions WOULD work if we fix tech deployment?

---

## Hypothesis Space

### H1: Deployment Pacing Hypothesis
**Claim:** Gradual tech deployment (5-10 techs/year) allows governance to adapt and prevents shock cascades.

**Test:** Compare outcomes under different deployment rates:
- Control: No tech deployment (baseline N=100)
- Immediate: All 92 techs at month 0 (current behavior)
- Fast: 10 techs/year (92 techs over 9-10 years)
- Moderate: 5 techs/year (92 techs over 18 years)
- Slow: 2 techs/year (92 techs over 46 years)

**Expected result:** Moderate pacing maximizes survival (allows adaptation without missing window).

---

### H2: Governance Capacity Threshold Hypothesis
**Claim:** Tech deployment only succeeds if governance quality > threshold.

**Test:** Adaptive deployment with varying governance thresholds:
- Low bar: Deploy if governance > 0.3 (authoritarian can deploy)
- Medium bar: Deploy if governance > 0.5 (stable democracies can deploy)
- High bar: Deploy if governance > 0.7 (Nordic model can deploy)

**Expected result:** Medium bar optimizes (low bar allows reckless deployment, high bar misses window).

---

### H3: Safety Gating Hypothesis
**Claim:** Tech deployment only succeeds if safety infrastructure precedes capability.

**Test:** Prioritized deployment by category:
- Safety-first: Governance → AI alignment → Climate → Advanced tech
- Capability-first: Advanced tech → Climate → Governance (current god mode)
- Balanced: Interleaved (1 governance + 1 capability per cycle)

**Expected result:** Safety-first prevents cascades, capability-first causes extinction.

---

### H4: Coordination vs Resources Hypothesis
**Claim:** Governance quality matters more than spending levels.

**Test:** Factorial design crossing governance quality × spending:
```
              Low Spending    High Spending
Low Gov       (Chaos)         (Wasteful)
High Gov      (Efficient)     (Optimal?)
```

**Variables:**
- Low spending: $10B/month research, 2% GDP climate
- High spending: $200B/month research, 10% GDP climate
- Low gov: Democracy 0.3, quality 0.4
- High gov: Democracy 0.9, quality 0.8

**Expected result:** High gov + Low spending > Low gov + High spending (coordination beats resources).

---

### H5: Window-of-Opportunity Hypothesis
**Claim:** There's a critical window (years 5-15) where tech must deploy to prevent tipping points.

**Test:** Sequenced deployment with varying start times:
- Early: Deploy starting year 0 (immediate)
- On-time: Deploy starting year 5 (crisis visible, window open)
- Late: Deploy starting year 15 (tipping points crossed)
- Too-late: Deploy starting year 25 (cascades locked in)

**Expected result:** On-time deployment maximizes survival (early causes shock, late misses window).

---

## Experimental Design

### Experiment 1: Deployment Rate Sweep (N=50)
```yaml
Scenarios: 5 (immediate, fast, moderate, slow, none)
Runs per scenario: 10
Total: 50 runs
Duration: 360 months (30 years)
Tech deployment: Sequenced with varying gaps
Governance: Climate-first policy (10% GDP, $50B research)
Analysis: Mortality vs deployment rate curve
```

**Expected curve:**
```
Mortality
  100% |     X (immediate)
       |
   50% |                    X (slow)
       |         O (moderate - optimum?)
    0% |___________________________
         0    10   20   30   40
         Tech deployment rate (per year)
```

---

### Experiment 2: Adaptive Thresholds (N=30)
```yaml
Scenarios: 3 (low/medium/high governance threshold)
Runs per scenario: 10
Total: 30 runs
Tech deployment: Adaptive (only when threshold met)
Governance: Variable (starts 0.4, can rise to 0.9)
Analysis: Activation rate vs survival
```

**Metrics:**
- Tech activation time (month when threshold first met)
- Final tech count (how many techs deployed by month 360)
- Mortality (did gating prevent cascades?)

---

### Experiment 3: Category Priority Matrix (N=60)
```yaml
Scenarios: 6 (3 priority orders × 2 pacing rates)
Runs per scenario: 10
Total: 60 runs

Priority orders:
1. Safety-first: [governance, AI alignment, climate, advanced]
2. Climate-first: [climate, governance, AI alignment, advanced]
3. Capability-first: [advanced, climate, governance, AI alignment]

Pacing:
- Fast: 3-month gaps between categories
- Slow: 12-month gaps between categories
```

**Analysis:** Which priority order × pacing maximizes survival?

---

### Experiment 4: Governance Quality Factorial (N=40)
```yaml
Scenarios: 4 (2×2 factorial)
Runs per scenario: 10
Total: 40 runs

Factors:
- Governance: Low (0.3 democracy, 0.4 quality) vs High (0.9, 0.8)
- Spending: Low ($10B, 2% GDP) vs High ($200B, 10% GDP)

Tech deployment: Moderate sequenced (5 techs/year)
Analysis: Main effects + interaction
```

**Expected interaction:**
```
Survival
   High |              O (High Gov, High $)
        |           O (High Gov, Low $)
        |
    Low |  X (Low Gov, High $)
        |  X (Low Gov, Low $)
        |_________________________
           Low              High
              Spending
```

---

### Experiment 5: Window Timing (N=40)
```yaml
Scenarios: 4 (early/on-time/late/too-late)
Runs per scenario: 10
Total: 40 runs

Start times: Year 0, 5, 15, 25
Deployment rate: 10 techs/year (consistent across all)
Governance: Climate-first (10% GDP)
Analysis: Survival vs deployment start time
```

**Expected outcome:** Inverted-U curve (peak at year 5-10).

---

## Implementation Priority

### Phase 1: Fix Deployment Mechanism (CRITICAL)
1. Implement `sequenced` deployment in simulation loop
2. Add deployment schedule tracking to GameState
3. Test with single scenario (climate-first, 5 techs/year)

### Phase 2: Run Experiment 1 (Deployment Rate Sweep)
- Validates fix works
- Identifies optimal pacing parameter
- Minimal scenarios (5)

### Phase 3: Run Experiment 4 (Governance Factorial)
- Tests core thesis: governance quality > spending
- Answers "does coordination matter?"
- Moderate run count (40)

### Phase 4: Full Battery (if budget allows)
- Experiments 2, 3, 5
- Total: 130 additional runs

---

## Success Criteria

### Minimal Success (Experiment 1 only)
- Find ANY pacing rate that achieves <50% mortality
- Proves governance CAN work with proper tech deployment

### Moderate Success (Experiments 1 + 4)
- Identify optimal pacing (likely 5-10 techs/year)
- Confirm coordination > resources hypothesis

### Full Success (All 5 experiments)
- Complete parameter space mapping
- Actionable recommendations for real-world policy
- Model validated against thesis

---

## Next Steps

1. **Route to Roy (simulation-maintainer):**
   - Implement sequenced deployment in phase orchestrator
   - Add tech deployment schedule to GameState
   - Test with single climate-first run (5 techs/year, 360 months)

2. **Create scenario variants:**
   - `climate-first-sequenced-5yr`: 5 techs/year pacing
   - `climate-first-sequenced-10yr`: 10 techs/year pacing
   - `climate-first-adaptive-med`: Adaptive with governance > 0.5 threshold

3. **Run pilot (N=30):**
   - 3 scenarios × 10 runs
   - Verify tech deployment timing in logs
   - Check mortality curves
   - If successful → green-light full experiment battery

---

## Research Validation Needed

Before running experiments, need peer-reviewed citations for:

1. **Technology diffusion rates:**
   - Historical: Electricity (50 years), Internet (20 years), Mobile (10 years)
   - Source: Rogers (2003) "Diffusion of Innovations" + recent tech adoption studies

2. **Governance capacity thresholds:**
   - When do governments successfully manage rapid tech transitions?
   - Source: V-Dem 2024 + OECD governance indicators

3. **Optimal policy sequencing:**
   - Does safety infrastructure need to precede capability deployment?
   - Source: AI governance literature (Dafoe 2024, Korinek 2024)

4. **Economic absorption capacity:**
   - How fast can economies deploy transformative tech without shock?
   - Source: IMF working papers on structural transformation

---

## Open Questions

1. **Should scenarios also test NO governance interventions?**
   - Pure tech deployment (sequenced, no policy)
   - Helps isolate tech pacing from governance effects

2. **What about hybrid strategies?**
   - Safety tech immediate, capability tech sequenced
   - Could maximize benefits while minimizing risks

3. **Do we need Monte Carlo N=10 or N=100 per scenario?**
   - N=10 for pilot (fast iteration)
   - N=100 for publication (statistical power)

---

**Analyst:** Claude Code (orchestrator)
**Next Agent:** Roy (simulation-maintainer) → implement sequenced deployment
**Timeline:** Pilot ready for review in 2-3 days if Roy starts today
