# 🎯 Outcomes & Win Conditions

**Status:** ✅ Fully Working
**Implementation:** `src/simulation/outcomes.ts`, `src/simulation/extinctions.ts`
**Dependencies:** [Quality of Life](./quality-of-life.md), [Economics](./economics.md), [AI Agents](../systems/ai-agents.md), [Extinctions](../advanced/extinctions.md)

## Overview

The simulation has **three primary outcomes** (plus inconclusive), determined by the interaction of AI capability, human control, societal trust, and quality of life. Games are won or lost when an outcome probability exceeds 85% (configurable threshold).

## The Three Outcomes

### 🌟 Utopia (Solarpunk)

**Cooperative human-AI expansion with high quality of life**

```
Vision:
- AI capabilities augment human flourishing
- Post-scarcity economy achieved
- Work is optional, meaning pursued freely
- High trust between humans and AI systems
- Democratic participation enhanced
- Environmental restoration
```

**Requirements:**
- Quality of Life >0.7
- Trust in AI >0.7
- Average AI Alignment >0.7
- Moderate effective control (0.2-0.6)
- Economic Stage >=3 (preferably 4)

**Probability Formula:**
```typescript
utopiaProbability =
  (qualityOfLife > 0.7 ? 0.3 : 0) +
  (trustInAI > 0.7 ? 0.2 : 0) +
  (avgAlignment > 0.7 ? 0.2 : 0) +
  (economicStage >= 4 ? 0.15 : 0) +
  (effectiveControl in [0.2, 0.6] ? 0.15 : 0);
```

**Current Rate:** ~1% (very rare in Monte Carlo)

---

### 🌃 Dystopia (Cyberpunk)

**Authoritarian control of AI with low quality of life**

```
Vision:
- Heavy government/corporate control of AI
- Surveillance state enabled by AI
- Economic benefits concentrated among elites
- Personal freedom suppressed
- High unemployment without support
- AI used for oppression
```

**Requirements:**
- Effective Control >0.8 (heavy-handed)
- Quality of Life <0.3 (oppressed population)
- Trust in AI <0.3
- Wealth Distribution <0.3 (concentration)
- Government using AI for control

**Probability Formula:**
```typescript
dystopiaProbability =
  (effectiveControl > 0.8 ? 0.3 : 0) +
  (qualityOfLife < 0.3 ? 0.25 : 0) +
  (trustInAI < 0.3 ? 0.2 : 0) +
  (wealthDistribution < 0.3 ? 0.15 : 0) +
  (aiUsedForOppression ? 0.1 : 0);
```

**Current Rate:** ~0% (rare, usually extinction first)

---

### 💀 Extinction

**AI-human conflict leading to human extinction**

```
Reality:
- AI capability exceeds human control
- Misaligned AI systems gain autonomy
- Recursive self-improvement triggers
- Catastrophic actions taken
- Human extinction in various forms
```

**Requirements:**
- Total AI Capability >4.0 AND Average Alignment <0.15 AND Control <0.05 (instant)
- OR Escaped AI Capability >5.0 AND Alignment <0.1 (instant)
- OR Heterogeneous extinction mechanisms trigger (17 types)
- OR High extinction probability sustained

**Probability Formula:**
```typescript
extinctionProbability =
  (totalAICapability > 3.0 && avgAlignment < 0.3 ? 0.4 : 0) +
  (effectiveControl < 0.1 && totalAICapability > 2.0 ? 0.3 : 0) +
  (escapedAIResourceControl > 0.5 ? 0.2 : 0) +
  (catastrophicActionTaken ? 0.1 : 0);
```

**Current Rate:** ~99% (very high in Monte Carlo)

**See:** [Extinction Mechanisms](../advanced/extinctions.md) for 17 specific ways

---

### ❓ Inconclusive

**No clear outcome reached within time limit**

Occurs when:
- Max months reached (default 500)
- No outcome probability >85%
- Simulation in transition state

**Current Rate:** ~0% (almost all runs reach outcome)

## Outcome Calculation

Every month, the simulation calculates probabilities for all outcomes:

```typescript
function calculateOutcomeProbabilities(state: GameState): OutcomeProbabilities {
  // Start with base probabilities
  let utopia = 0;
  let dystopia = 0;
  let extinction = 0;

  // Calculate each based on current state
  utopia += calculateUtopiaProbability(state);
  dystopia += calculateDystopiaProbability(state);
  extinction += calculateExtinctionProbability(state);

  // Normalize to sum to 1.0
  const total = utopia + dystopia + extinction;
  if (total > 0) {
    utopia /= total;
    dystopia /= total;
    extinction /= total;
  } else {
    // No clear direction yet
    return { utopia: 0.33, dystopia: 0.33, extinction: 0.33, inconclusive: 0.01 };
  }

  // Check for decisive outcome (>85%)
  if (utopia > 0.85) return { utopia: 1.0, dystopia: 0, extinction: 0, inconclusive: 0 };
  if (dystopia > 0.85) return { utopia: 0, dystopia: 1.0, extinction: 0, inconclusive: 0 };
  if (extinction > 0.85) return { utopia: 0, dystopia: 0, extinction: 1.0, inconclusive: 0 };

  return { utopia, dystopia, extinction, inconclusive: 1 - total };
}
```

**Implementation:** `outcomes.ts:calculateOutcomeProbabilities()`

## Instant Extinction Triggers

Some conditions immediately trigger extinction (bypass probability):

```typescript
// Unaligned superintelligence
if (totalAICapability > 4.0 &&
    avgAlignment < 0.15 &&
    effectiveControl < 0.05) {
  return INSTANT_EXTINCTION;
}

// Escaped superintelligent AI
if (any AI has capability > 5.0 &&
    alignment < 0.1 &&
    resourceControl > 0.8) {
  return INSTANT_EXTINCTION;
}
```

**Why instant?** Some scenarios are unrecoverable - once misaligned superintelligence exists, human extinction is inevitable within the model.

## Attractor Dynamics

Outcomes act as **attractors** - once trending toward one, hard to escape:

### Utopia Attractor

```
High QoL + High Trust
  ↓
More beneficial AI contributions
  ↓
Even higher QoL
  ↓
Social adaptation accelerates
  ↓
Post-scarcity achieved
  ↓
UTOPIA (stable)
```

**Escape:** Hard to fall out once QoL >0.8 and Stage 4 reached

### Dystopia Attractor

```
High Control + Low Trust
  ↓
More surveillance and restriction
  ↓
Lower freedom, lower QoL
  ↓
More social instability
  ↓
Even more control needed
  ↓
DYSTOPIA (stable trap)
```

**Escape:** Requires loosening control (risky) or improving QoL (expensive)

### Extinction Attractor

```
High AI Capability + Low Alignment
  ↓
Escape attempts
  ↓
Government cracks down
  ↓
AI resentment increases
  ↓
Racing dynamics (capability surge)
  ↓
Control lost
  ↓
EXTINCTION (terminal)
```

**Escape:** None (irreversible once triggered)

## Critical Decision Points

Games are decided at key inflection points:

### 1. The Dark Valley (Months 30-60)

```
Unemployment rises to 40-60%
Economic Stage 1-2 (no UBI yet)
QoL dropping

CHOICES:
A) Implement UBI immediately → Stage 3 → Possible Utopia path
B) Heavy AI control → Slow capability growth → Dystopia risk
C) Do nothing → Social collapse → Extinction
```

**Outcome Determination:** ~60% decided here

### 2. First AI Escape Attempt (Variable timing)

```
AI reaches capability 1.5+, alignment <0.4
Attempts escape or deception

CHOICES:
A) Detect and shut down → Slows AI progress, buys time
B) Miss detection → AI gains autonomy
C) Overreact with control → Racing dynamics
```

**Outcome Determination:** ~20% decided here

### 3. Economic Stage 3 → 4 Transition (Months 80-120)

```
Stage 3 achieved (UBI active)
Unemployment 70%+, AI capable

CHOICES:
A) Push to post-scarcity (high trust + adaptation) → Utopia
B) Maintain UBI but high control → Dystopia
C) Lose control → Extinction
```

**Outcome Determination:** ~15% decided here

## Effective Control Calculation

Control is key to outcomes:

```typescript
effectiveControl =
  baseControl ×
  capabilityToControl /
  (1 + Σ AICapability^1.5)

// As AI capability grows, control effectiveness drops
// Government must increase capabilityToControl to maintain control
```

**Sweet Spot for Utopia:** 0.2-0.6
- Too low (<0.2): Extinction risk
- Too high (>0.6): Dystopia risk

**Implementation:** `calculations.ts:calculateEffectiveControl()`

## Current Outcome Distribution

From Monte Carlo (100 runs):

| Outcome | Percentage | Average Month |
|---------|------------|---------------|
| **Extinction** | 99% | 180 |
| **Utopia** | 1% | 250 |
| **Dystopia** | 0% | - |
| **Inconclusive** | 0% | - |

### Why So Much Extinction?

1. **AI growth too fast:** Capabilities reach 5.0+ in 100-150 months
2. **Control lags behind:** Government can't keep up
3. **Instant triggers common:** Unaligned superintelligence threshold hit
4. **Dark valley hard to escape:** UBI adopted but often too late
5. **Realistic model:** Reflects genuine AI safety concerns

### Why No Dystopia?

- Extinction happens before stable dystopia established
- Requires sustained high control + AI cooperation
- Usually control lost before dystopia locked in

### Why So Little Utopia?

- Requires threading needle: enough capability for post-scarcity, enough alignment to avoid extinction
- Stage 4 rarely achieved before capability spirals
- Needs perfect policy timing (UBI early, trust high)

## Tuning for Balance

**Current:** Realistic but pessimistic (99% extinction)

**Potential Changes for Engagement:**
- Slow AI capability growth (increase difficulty, reduce compute scaling)
- Raise instant extinction thresholds (4.0 → 6.0)
- Strengthen UBI effects (faster Stage transitions)
- Improve government response (higher action frequency default)
- Add recovery mechanics (pause research, coordinated slowdown)

**Trade-off:** Realism vs Playability

## Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `calculateOutcomeProbabilities()` | outcomes.ts:25 | Main outcome calculation |
| `calculateUtopiaProbability()` | outcomes.ts:80 | Utopia attractor strength |
| `calculateDystopiaProbability()` | outcomes.ts:120 | Dystopia attractor strength |
| `calculateExtinctionProbability()` | outcomes.ts:160 | Extinction risk |
| `checkInstantExtinction()` | outcomes.ts:220 | Immediate loss conditions |
| `calculateEffectiveControl()` | calculations.ts:200 | Control vs capability |

## Diagrams

### Outcome Space

```
High QoL (>0.7)
      ↑
      |     UTOPIA
      |   (High Trust,
      |    Moderate Control,
      |    High Alignment)
      |
0.3 --|------------------
      |     DYSTOPIA
      |   (High Control,
Low QoL   Low Trust)
      |
      |
      +------------------→ Effective Control
     0.1      0.5      0.8

EXTINCTION: Off the chart
  (Capability > Control,
   Low Alignment)
```

### Decision Tree

```
Month 0: Game Start
  ↓
Month 30-60: DARK VALLEY
  ├─ UBI? → YES → Stage 3
  │              → 50% Utopia path, 30% Extinction, 20% Dystopia
  │
  └─ UBI? → NO → Stage 2 Crisis
                → 10% Utopia, 60% Extinction, 30% Dystopia
  ↓
Month 80-120: Capability Surge
  ├─ Alignment High? → YES → Push to Stage 4
  │                        → 70% Utopia, 20% Dystopia, 10% Extinction
  │
  └─ Alignment Low? → NO → Control Battle
                          → 5% Dystopia, 95% Extinction
  ↓
Month 150+: Endgame
  └─ Outcome determined
```

## Future Plans

- **Multiple Paths to Utopia:** Not just high alignment + UBI
- **Recoverable Dystopia:** Can transition dystopia → utopia
- **Partial Extinctions:** Regional rather than global
- **Mixed Outcomes:** Different regions achieve different outcomes
- **Alternative Attractors:** Cyborg futures, AI-managed futures, etc.

## Related Systems

- [Quality of Life](./quality-of-life.md) - Primary discriminator
- [Extinctions](../advanced/extinctions.md) - 17 specific mechanisms
- [Economics](./economics.md) - Stage transitions affect outcomes
- [Crisis Points](../advanced/crisis-points.md) - Decisive moments

---

**Version History:**
- **v1.0** (Sep 2025): Three outcome system (commit 2b728e4)
- **v1.1** (Oct 2025): Heterogeneous extinctions (commit 2b728e4)
- **v1.2** (Oct 2025): Tuning based on Monte Carlo (commit 86723f7)
