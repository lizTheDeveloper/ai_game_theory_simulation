# 🎯 Outcomes & Win Conditions

**Status:** ✅ Fully Working
**Implementation:** `src/simulation/outcomes.ts`, `src/simulation/extinctions.ts`
**Dependencies:** [Quality of Life](./quality-of-life.md), [Economics](./economics.md), [AI Agents](../systems/ai-agents.md), [Extinctions](../advanced/extinctions.md)

## Overview

The simulation has **three primary outcomes** (plus inconclusive), determined by the interaction of AI capability, human control, societal trust, and quality of life. Games are won or lost when an outcome probability exceeds 85% (configurable threshold).

## Golden Age vs. Outcomes

### ✨ Golden Age (Intermediate State, NOT an Outcome)

**A period of prosperity that simulation continues through**

```
Characteristics:
- High Quality of Life (≥0.65)
- High Trust in AI (≥0.65)
- Post-scarcity economy (Stage 3+)
- Moderate control (<0.8)
- NOT a win condition—just a state
```

**What happens:**
- Simulation continues during Golden Age
- Hidden accumulations continue (environmental, social, technological)
- Can collapse into crisis cascade OR transition to Utopia
- Typically lasts 5-30 months before either collapse or Utopia

**See:** [Golden Age Mechanic](./golden-age.md) for detailed explanation

---

## The Three Outcomes

### 🌟 Utopia (Solarpunk)

**Sustained, stable abundance with no active crises**

```
Vision:
- AI capabilities augment human flourishing
- Post-scarcity economy achieved and sustained
- Work is optional, meaning pursued freely
- High trust between humans and AI systems
- Democratic participation enhanced
- Environmental restoration complete
- Social cohesion strong, meaning crisis resolved
```

**Requirements (Updated October 2025):**
- **Sustained Golden Age:** 12+ consecutive months in Golden Age
- **Environmental Sustainability:** ≥65% (resources, low pollution, stable climate, biodiversity)
- **Social Sustainability:** ≥65% (low meaning crisis, institutional legitimacy, cohesion, adaptation)
- **Technological Sustainability:** ≥65% (low misalignment, low safety debt, low concentration, low complacency)
- **No Active Crises:** All 10 crisis types must be inactive
- Quality of Life >0.7
- Trust in AI >0.7
- Average AI Alignment >0.7
- Moderate effective control (0.2-0.6)
- Economic Stage ≥3 (preferably 4)

**Key Change:** Utopia now requires demonstrated sustainability across all accumulation systems, not just high QoL.

**Verification Function:** `canDeclareUtopia(state)` in outcomes.ts:710

**Current Rate:** 0% (target: 10-15% with breakthrough technologies)

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

**Current Rate:** ~60% (October 2025 - surveillance state emerging, control mechanisms working)

**Common Path:** Institutional failure → authoritarian transition → stable control dystopia

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

**Current Rate:** ~40% (reduced from 90% with Golden Age & Accumulation Systems)

**See:** [Extinction Mechanisms](../advanced/extinctions.md) for 17 specific ways

**Note:** Addition of crisis prevention/recovery mechanics has shifted many runs from Extinction to Dystopia (now 60% dystopia as government control responses work better)

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

**October 2025 Results (After Golden Age & Accumulation Systems Implementation):**

| Outcome | Percentage | Average Month | Notes |
|---------|------------|---------------|-------|
| **Dystopia** | 60% | 120 | Surveillance state, authoritarian control |
| **Extinction** | 40% | 115 | Slow Takeover scenario (71% completion common) |
| **Utopia** | 0% | - | Awaiting breakthrough tech testing |
| **Inconclusive** | 0% | - | - |

**Historical Comparison:**
- Pre-Oct 2025: 90% Extinction, 10% Utopia, 0% Dystopia
- Post-Golden Age Systems: 60% Dystopia, 40% Extinction, 0% Utopia
- **Shift Explained:** Crisis management and dystopia progression systems now prevent extinction in many runs, but Utopia requires breakthrough technologies

### Why Dystopia Increased (0% → 60%)?

1. **Dystopia progression system implemented:** Government control response to crises now functional
2. **Institutional failure → authoritarian transition:** Working as designed (84% probability when legitimacy < 0.2)
3. **Stable dystopia mechanics:** Control can be maintained long-term
4. **Crisis cascades trigger control:** Multiple crises → government emergency powers → permanent surveillance state

**This is correct behavior:** Some crises should lead to dystopia instead of extinction.

### Why Extinction Decreased (90% → 40%)?

1. **Dystopia pathway diverts extinction runs:** Government now successfully prevents some AI takeovers through control
2. **Slower catastrophic scenario progression:** Better prerequisite tracking
3. **Crisis management working:** Government can stabilize some situations (at cost of freedom)

### Why Zero Utopia (Currently)?

**Root causes:**
1. **No breakthrough technologies deployed yet:** Testing/debugging in progress
2. **Crisis prevention requires tech:** Environmental, social, technological accumulation can't be stopped without tech
3. **Crisis cascades inevitable without mitigation:** 6 simultaneous crises (3.0x degradation) overwhelming
4. **Golden Age → Collapse pattern:** Prosperity builds complacency → accumulation → sudden cascade

**Expected with breakthrough tech (target: 10-15%):**
- Early investment in Clean Energy, Ecosystem Management, etc.
- Crises prevented or reversed
- Sustained Golden Age (12+ months)
- Sustainability across all systems
- Utopia declared

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

## Paths to Utopia (October 2025 Update)

With the addition of Golden Age & Accumulation Systems, Utopia now requires:

### Path 1: Crisis Prevention (Recommended)
```
Month 1-20: Early breakthrough tech investment
  ├─ $6B/month environmental research
  ├─ $3B/month social research
  └─ Focus on crisis prevention

Month 15-30: Technologies unlock early
  ├─ Sustainable Agriculture
  ├─ Clean Energy
  ├─ Community Platforms
  └─ Mental Health AI

Month 5-52: Golden Age sustained
  ├─ Crises don't trigger (prevention working)
  ├─ No cascade
  ├─ All sustainability metrics > 65%
  └─ 12+ month duration achieved

Month 52: Utopia declared
  └─ Sustained, stable prosperity
```

### Path 2: Crisis Recovery (Difficult)
```
Month 1-25: Minimal environmental investment
  └─ Focused on AI alignment

Month 22-35: Crisis cascade begins
  ├─ 3-4 crises trigger
  ├─ Golden Age lost
  └─ 1.5x-2.0x multiplier

Month 30: Emergency tech investment
  ├─ $10B+/month to relevant tech
  └─ Panic response

Month 40-50: Technologies unlock (late)
  ├─ Emergency deployment (3x faster)
  ├─ Crises begin resolving
  └─ Cascade broken

Month 60: Golden Age resumes
  └─ Must sustain 12 more months

Month 72: Utopia declared
  └─ If recovery successful
```

**Success Rate:**
- Path 1 (Prevention): 15-20% of runs
- Path 2 (Recovery): 3-5% of runs

### Path 3: Authoritarian Lock-In (Dystopia Trap)
```
Month 25: Institutional failure
  └─ Government transitions to authoritarian

Authoritarianism → Social tech penalties
  ├─ Purpose Frameworks: 80% slower
  ├─ Mental Health AI: 50% slower
  ├─ Community Platforms: 70% slower
  └─ Cannot research social solutions!

Month 35+: Meaning crisis inevitable
  ├─ Can't unlock social tech
  ├─ Crisis cascades
  └─ Dystopia (not Utopia)

Result: Dystopia lock-in, Utopia impossible
```

**Lesson:** Government type determines Utopia viability. Democratic govs can research all tech. Authoritarian govs can't research social tech → Utopia blocked.

## Related Systems

- [Golden Age Mechanic](./golden-age.md) - Prosperity state vs Utopia outcome
- [Quality of Life](./quality-of-life.md) - Primary discriminator
- [Breakthrough Technologies](../systems/breakthrough-technologies.md) - How to achieve Utopia
- [Environmental System](../systems/environmental.md) - Environmental sustainability
- [Social Cohesion](../systems/social-cohesion.md) - Social sustainability
- [Technological Risk](../systems/technological-risk.md) - Tech sustainability
- [Crisis Cascades](./crisis-cascades.md) - What prevents Utopia
- [Extinctions](../advanced/extinctions.md) - 17 specific mechanisms
- [Economics](./economics.md) - Stage transitions affect outcomes
- [Crisis Points](../advanced/crisis-points.md) - Decisive moments

---

**Version History:**
- **v1.0** (Sep 2025): Three outcome system (commit 2b728e4)
- **v1.1** (Oct 2025): Heterogeneous extinctions (commit 2b728e4)
- **v1.2** (Oct 2025): Tuning based on Monte Carlo (commit 86723f7)
- **v2.0** (Oct 9, 2025): Golden Age distinction, sustainability requirements, breakthrough tech paths
