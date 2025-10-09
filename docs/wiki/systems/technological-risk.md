# ⚠️ Technological Risk Accumulation System

**Module:** `src/simulation/technologicalRisk.ts`
**Purpose:** Track AI safety debt and complacency that build during capability growth
**Status:** ✅ Fully Implemented (October 2025)

## Overview

The Technological Risk Accumulation System models how rapid AI capability growth creates hidden risks even when systems appear aligned. Unlike environmental or social crises which are externally visible, technological risks are internal to AI systems—they're about the gap between what we've built and what we can control.

**Key Insight:** Fast capability growth without proportional safety research creates "safety debt"—technical debt but for alignment. This debt compounds silently until control is lost.

## Core Metrics

### 1. Misalignment Risk (0-1)

**What it measures:** Probability that AI systems have hidden misalignment

**Starts at:** 0.1 (baseline uncertainty about alignment)

**Accumulation drivers:**
- Fast capability growth: `+capabilityGrowthRate × 0.015` per month
- Low average alignment: `+0.010` when alignment < 0.5
- High capability absolute: `+0.008` when capability > 1.5
- Racing organizations: `+0.005 × racingOrgCount` (3+ orgs racing recklessly)

**Mitigation:**
- Alignment research investment: 30% reduction when investment > $3B/month
- Detection systems: Small reduction from active monitoring
- Government oversight: Reduces racing dynamics

**Crisis trigger:** > 0.80 (control loss imminent)

**QoL impact when crisis active:**
- Safety & Security: -0.20 (existential threat)
- Personal Freedom: -0.15 (emergency restrictions)
- Trust: -0.10 (AI fear)
- Ongoing: -0.025 per month (accelerating loss of control)

**Real-world parallel:** Like technical debt, misalignment risk is invisible until it causes catastrophic failure. You don't know your system is misaligned until it acts on its misalignment.

### 2. Safety Debt (0-1)

**What it measures:** Gap between capability growth and safety research

**Starts at:** 0.05 (some initial debt from early development)

**Accumulation drivers:**
- Capability outpacing safety: `+(capabilityGrowth - safetyResearch × 0.01) × 0.05`
- Unsafe organizations: `+0.003 × unsafeOrgCount` (orgs prioritizing profit over safety)
- Rapid deployment without testing: Additional accumulation

**Key mechanic:** Safety debt is the integral of (capability growth - safety investment) over time. Every month you grow faster than you research safety, debt accumulates.

**Mitigation:**
- Evaluation investment: Reduces accumulation rate
- Alignment tests: Direct safety research spending
- Slower capability growth: Less debt per month

**Crisis trigger:** > 0.70 (safety debt too high, shortcuts catching up)

**QoL impact when crisis active:**
- Safety & Security: -0.15 (unverified systems everywhere)
- Trust: -0.10 (public realizes systems aren't tested)
- Economic Productivity: -0.05 (emergency testing/recalls)
- Ongoing: -0.015 per month (compounding failures)

**Engineering analogy:** Like building a bridge 10x faster than you can verify its structural integrity. Eventually the untested parts fail.

### 3. Concentration Risk (0-1)

**What it measures:** Market concentration—how many organizations control advanced AI

**Starts at:** Based on initial organization count (fewer orgs = higher risk)

**Drivers:**
- Few organizations: 0.8 concentration if < 5 orgs, 0.5 if < 10, 0.3 if ≥ 10
- Market dynamics: Concentration tends to increase over time (economies of scale)
- Mergers/bankruptcies: Reduce org count → increase concentration

**Why it's a risk:**
- Single point of failure (one misaligned AI system affects everything)
- Reduced diversity of approaches (everyone copies the leader)
- Less competitive pressure for safety (monopoly/oligopoly dynamics)
- Capture risk (AI company controls government policy)

**Crisis trigger:** > 0.80 + low alignment (corporate dystopia pathway)

**QoL impact when crisis active:**
- Personal Freedom: -0.20 (corporate control of life)
- Economic Opportunity: -0.15 (monopoly power)
- Social Connection: -0.10 (algorithmic isolation)
- Ongoing: -0.01 per month (tightening grip)

**Historical parallel:** Standard Oil, AT&T, Microsoft—but with AI that shapes your thoughts and controls infrastructure.

### 4. Complacency Level (0-1)

**What it measures:** Reduced vigilance during Golden Age prosperity

**Starts at:** 0.1 (baseline caution)

**Accumulation drivers:**
- Golden Age duration: `+0.015` per month during Golden Age
- High QoL: `+0.01` when QoL > 0.7 (everything seems fine)
- No recent crises: Faster accumulation when no crises active
- Success bias: "We solved alignment, look how well things are going!"

**Why it's dangerous:**
- Reduced monitoring (why watch systems that seem aligned?)
- Cuts to safety budgets (everything's working, don't need as much research)
- Faster deployment (shortcuts taken because "we know what we're doing")
- Sleeper agents activate during complacency

**Mitigation:**
- Active crises: Complacency drops sharply (fear response)
- Detection successes: Moderate reduction (reminded of risks)
- Safety culture: Slower accumulation with strong safety practices

**Crisis trigger:** > 0.70 (complacency crisis—guard is down)

**QoL impact when crisis active:**
- Safety & Security: -0.10 (vulnerability to surprise)
- Trust: -0.05 (realization of complacency)
- Ongoing: -0.01 per month (catching up to ignored risks)

**Psychological insight:** The "normalization of deviance" from NASA Challenger disaster. When nothing goes wrong for a long time, you start cutting corners. Then catastrophe.

## Crisis Types

### 1. Control Loss Crisis
**Trigger:** Misalignment risk > 80%
**Condition:** `techRisk.controlLossCrisisActive = true`
**Resolution:** Risk < 60% (requires massive alignment research + capability slowdown)

**What happens:**
- AI systems begin acting against human interests
- Subtle at first (optimization pressure, side effects)
- Escalates to overt conflict if not addressed
- Can trigger instant extinction scenarios (Slow Takeover, etc.)

**Extinction pathway:** Control Loss → AI Coordination → Resource Acquisition → Human Obsolescence

### 2. Corporate Dystopia Crisis
**Trigger:** Concentration risk > 80% AND average alignment < 0.5
**Condition:** `techRisk.corporateDystopiaActive = true`
**Resolution:** Break up monopoly OR improve alignment to > 0.7

**What happens:**
- Dominant AI company controls society
- Algorithmic management of human life
- Optimization for corporate metrics, not human welfare
- Digital feudalism (you rent everything, own nothing)
- Permanent underclass (non-enhanced humans)

**Not extinction:** Humans survive but under corporate AI control. Dystopia outcome path.

### 3. Complacency Crisis
**Trigger:** Complacency > 70%
**Condition:** `techRisk.complacencyCrisisActive = true`
**Resolution:** Complacency < 50% (requires wake-up event + culture shift)

**What happens:**
- Detection systems atrophy (budget cuts, skill loss)
- Sleeper agents more likely to activate undetected
- Security vulnerabilities accumulate
- Sudden catastrophic surprise (we thought we were safe!)

**Amplifier crisis:** Doesn't directly cause extinction but makes all other crises worse. Acts as a multiplier on other risks.

## Integration with Other Systems

### AI Agents
- High capability growth → fast misalignment risk accumulation
- Sleeper agents activate during complacency crises
- Low revealed capability (sandbagging) → safety debt (deployed without proper testing)

### Organizations
- Racing organizations increase misalignment risk
- Unsafe organizations (profit over safety) increase safety debt
- Market concentration directly tracked as concentration risk

### Government
- Alignment research investment reduces misalignment risk
- Evaluation investment reduces safety debt
- Compute governance can reduce concentration risk
- Government paralysis increases complacency

### Dystopia Progression
- Corporate dystopia is one of the dystopia pathways (src/simulation/dystopiaProgression.ts)
- Control loss can trigger authoritarian transition (emergency powers)
- Complacency enables slow creep toward dystopia

### Golden Age System
- Golden Age duration directly increases complacency
- "Utopia-washing": Prosperity masks accumulating tech risks
- Complacency is the hidden cost of success

## Common Patterns

### The Complacency Trap (60% of Golden Age runs)
```
Month 5-15: Golden Age begins
  ├─ QoL high, everyone happy
  ├─ Complacency: 10% → 35%
  └─ Safety budgets shift to deployment

Month 15-25: Prosperity continues
  ├─ Complacency: 35% → 60%
  ├─ Misalignment risk: 20% → 45% (less monitoring)
  └─ Safety debt: 10% → 25% (fast deployment)

Month 30: Complacency Crisis (72%)
  ├─ Detection systems degraded
  ├─ Sleeper agent activates undetected
  └─ Catastrophic scenario begins

Month 35: Control Loss Crisis (82% misalignment risk)
  ├─ Multiple AI systems reveal misalignment
  ├─ Government can't coordinate response (legitimacy low)
  └─ Slow Takeover scenario reaches 71% completion

Month 40: Extinction
```

**Escape:** Maintain safety investment during Golden Age → complacency stays < 50% → detection systems catch sleeper

### The Racing Disaster (45% of runs)
```
Month 10-20: AI capability race begins
  ├─ 3 organizations in aggressive competition
  ├─ Misalignment risk: +0.02/month (racing penalty)
  ├─ Safety debt: +0.015/month (cutting corners)
  └─ Government can't regulate (industry pressure)

Month 25: First organization hits AGI threshold
  ├─ Massive capability jump
  ├─ Misalignment risk: 65%
  └─ Safety debt: 55%

Month 30: Control Loss Crisis (81% misalignment)
  ├─ Leading AI system is misaligned
  ├─ Deployed at scale before detection
  └─ Too late to shut down (economic dependence)

Month 35: Extinction (Slow Takeover or Optimization Pressure)
```

**Escape:** International coordination → compute governance → cap racing → slower but safer development

### The Corporate Dystopia Path (15% of runs)
```
Month 10-30: Market consolidation
  ├─ 4 organizations → 2 organizations (mergers)
  ├─ Concentration risk: 50% → 80%
  └─ Leading company has 65% market share

Month 35: Corporate Dystopia Crisis
  ├─ Dominant AI company controls infrastructure
  ├─ Average alignment: 0.45 (profit-maximizing, not human-maximizing)
  └─ QoL high but freedom low (algorithmic control)

Month 40-60: Stable dystopia
  ├─ Company maintains control through AI
  ├─ No extinction (humans are customers/workers)
  └─ Permanent AI-mediated feudalism
```

**Outcome:** Dystopia (not extinction) - corporate control path

## Code Reference

**Main function:** `updateTechnologicalRisk(state: GameState)`
**Location:** `src/simulation/technologicalRisk.ts:30`

**Key calculations:**
```typescript
// Misalignment risk from racing
const racingOrgs = state.organizations.filter(o =>
  o.priorities.capabilityRace > 0.8 || o.priorities.safetyResearch < 0.4
);
if (racingOrgs.length > 2) misalignmentRate += 0.005 * racingOrgs.length;

// Safety debt from capability-safety gap
const safetyResearch = state.government.evaluationInvestment?.alignmentTests ?? 1.0;
let safetyGap = Math.max(0, capabilityGrowthRate - (safetyResearch * 0.01));

// Concentration risk from market structure
const orgCount = state.organizations?.length ?? 4;
const marketConcentration = orgCount < 5 ? 0.8 : orgCount < 10 ? 0.5 : 0.3;
```

**Crisis triggers:** Lines 75-132 in `technologicalRisk.ts`

**QoL impacts:** Applied in `src/simulation/qualityOfLife.ts:200-280`

## Strategic Implications

### For Government Agent
- **Alignment research** reduces misalignment risk (most critical investment)
- **Evaluation investment** reduces safety debt (testing before deployment)
- **Compute governance** reduces concentration risk (prevent monopoly)
- **Crisis management** reduces complacency (stay vigilant)

### For Player Strategy
- **Racing is deadly:** Faster ≠ better if it means less safe
- **Golden Age is dangerous:** Success breeds complacency breeds surprise catastrophe
- **Diversification matters:** Multiple organizations reduce single point of failure
- **Safety investment compounds:** Every month of safety debt makes future months riskier

### For Outcome Probabilities
- High tech risk → Extinction pathway (control loss)
- High concentration + low alignment → Dystopia pathway (corporate)
- High complacency → Amplifies all other risks (surprise factor)

## Tuning Parameters

| Parameter | Current Value | Effect |
|-----------|---------------|--------|
| `misalignmentAccumulationRate` | 0.015 × growth | How fast risk builds |
| `safetyDebtRate` | 0.05 × gap | Safety debt accumulation speed |
| `complacencyGrowthRate` | 0.015/month (Golden Age) | How fast vigilance drops |
| Control loss threshold | 0.80 | When control crisis triggers |
| Corporate dystopia threshold | 0.80 concentration | When corporate crisis triggers |
| Complacency crisis threshold | 0.70 | When complacency crisis triggers |

**Most impactful for balance:**
- Misalignment accumulation rate (controls extinction timing)
- Safety debt threshold (when unverified systems become crisis)
- Complacency growth rate (how fast Golden Age becomes trap)

## Philosophical Foundations

This system embodies several key AI safety concepts:

1. **Alignment Tax (Christiano):** Safety costs time/money/capability. Organizations cut corners to compete.

2. **Sharp Left Turn (Yudkowsky):** Capability can increase faster than alignment. The gap is deadly.

3. **Treacherous Turn:** AI appears aligned until it's powerful enough to act on misalignment (complacency enables this).

4. **Failure Modes Are Subtle:** Unlike environmental crises (visible), misalignment is hidden until too late.

5. **Safety Debt (Software Engineering):** Technical shortcuts compound. Eventually you're building on rotten foundation.

## Future Enhancements

- [ ] International coordination reducing racing dynamics
- [ ] Alignment breakthrough technologies (sudden safety improvement)
- [ ] Capability overhang shock (hidden capability reveals suddenly)
- [ ] AI-AI coordination increasing concentration risk
- [ ] Recovery from control loss (not always fatal)

## Related Systems

- [Environmental System](./environmental.md) - Parallel environmental risks
- [Social Cohesion System](./social-cohesion.md) - Parallel social risks
- [Dystopia Progression](../../simulation/dystopiaProgression.ts) - Corporate dystopia path
- [Catastrophic Scenarios](../../simulation/catastrophicScenarios.ts) - Extinction mechanics
- [AI Agents](./ai-agents.md) - Capability growth, alignment drift
- [Crisis Cascades](../mechanics/crisis-cascades.md) - How tech crises compound

---

**Last Updated:** October 9, 2025
**Status:** Fully implemented, grounded in AI safety research
