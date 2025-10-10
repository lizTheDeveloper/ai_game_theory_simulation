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

**Sustained virtuous cascades across multiple domains with no active crises**

```
Vision:
- AI capabilities augment human flourishing
- Post-scarcity economy achieved and sustained
- Work is optional, meaning pursued freely
- High trust between humans and AI systems
- Democratic participation enhanced
- Environmental restoration complete
- Social cohesion strong, meaning crisis resolved
- Cultural renaissance: artistic and philosophical flourishing
```

**Requirements (Updated October 2025 - Phase 2D):**

**NEW CONDITION (Phase 2D+):**
- **3+ Upward Spirals sustained for 12+ months** (see [Upward Spirals](../systems/upward-spirals.md))
- **No Active Crises:** All 10 crisis types must be inactive

**Six Possible Spirals:**
1. **Abundance:** Post-scarcity (material + energy + time liberation)
2. **Cognitive:** Mental health + purpose + AI augmentation
3. **Democratic:** Quality governance + civic engagement
4. **Scientific:** Breakthroughs + research investment + AI acceleration
5. **Meaning:** Cultural flourishing + renaissance (4 dimensions)
6. **Ecological:** Planetary healing + sustainability

**Why 3+ Spirals?**
- Multiple paths to Utopia (C(6,3) = 20 combinations)
- Not just one formula, but comprehensive excellence
- Different strategies work: tech path, cultural path, eco path, balanced path
- Requires sustained achievement (12 months), not momentary spikes

**Example Utopia Paths:**
- **Tech Path:** Scientific + Cognitive + Abundance
- **Cultural Path:** Meaning + Democratic + Cognitive (now achievable with Phase 2E!)
- **Eco Path:** Ecological + Abundance + Scientific
- **Balanced Path:** All 6 spirals (maximum 1.6x amplification)

**OLD CONDITION (Pre-Phase 2D):**
- Sustained Golden Age (12+ months)
- Environmental Sustainability ≥65%
- Social Sustainability ≥65%
- Technological Sustainability ≥65%
- No Active Crises

**Key Change (Phase 2D):** Utopia now requires **virtuous cascades** (upward spirals), not just absence of problems. This creates multiple strategic paths and clearer win conditions.

**Verification Function:** `canDeclareUtopia(state)` in upwardSpirals.ts:380

**Current Rate:** 0% (Phase 2D-F implemented, awaiting tuning - spirals not activating yet)

**Target Rate:** 10-20% with AI-accelerated deployment and meaning renaissance fixes

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

**Root causes (Phase 2D-F diagnosis):**
1. **Upward spirals not activating:** 0 virtuous cascades observed in testing
2. **Deployment too slow:** Scientific spiral blocked (technologies unlock but don't deploy fast enough)
3. **Meaning spiral never activates:** Only 1 tech (Purpose Frameworks) helps meaning, Renaissance system (Phase 2E) needs validation
4. **Diplomatic AI not intervening:** 0 attempts in 10 runs (geopolitical crisis threshold too strict)
5. **Crisis cascades dominant:** 6 simultaneous crises (3.0x degradation) before spirals can form

**Specific Blockers:**
- **Scientific Spiral:** Requires 4+ techs deployed 50%+, but deployment takes 18+ months after unlock
- **Meaning Spiral:** Renaissance strength needs 0.7+, but only gets to 0.4-0.5 before crises cascade
- **Ecological Spiral:** Technologies unlock Month 40-60, too late to prevent cascade
- **Democratic Spiral:** Often lost during crisis cascade (authoritarian transition)

**Expected with Phase 2E-F tuning (target: 10-20%):**
- AI-accelerated deployment (1.5-1.9x faster based on AI capability)
- Meaning Renaissance (4 dimensions, not just 1 tech)
- Diplomatic AI intervention (lower threshold, earlier deployment)
- Spirals activate Month 60-75, virtuous cascade begins
- 3+ spirals sustained → Utopia by Month 85-95

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

## Paths to Utopia (Phase 2D-F Update)

With the addition of Upward Spirals (Phase 2D), Meaning Renaissance (Phase 2E), and Conflict Resolution (Phase 2F), Utopia now requires **3+ sustained spirals for 12+ months + no crises**.

### Path 1: Tech Utopia (Scientific + Cognitive + Abundance)
```
Month 1-20: Heavy research investment
  ├─ $8B/month environmental research
  ├─ $4B/month social research (mental health, purpose)
  └─ High AI capability development (2.0+ by Month 40)

Month 30-40: Post-scarcity achieved
  ├─ Economic Stage 4
  ├─ Energy level 1.5+
  ├─ 60%+ unemployment
  └─ Abundance Spiral activates

Month 40-55: Technologies unlock
  ├─ Clean Energy (Month 35)
  ├─ Disease Elimination (Month 42)
  ├─ Purpose Frameworks (Month 48)
  ├─ Community Platforms (Month 52)
  └─ AI-accelerated deployment (1.6x faster)

Month 55: Cognitive Spiral activates
  ├─ Mental health tech deployed
  ├─ Purpose tech deployed
  └─ AI capability 2.0+ with high trust

Month 60: Scientific Spiral activates
  ├─ 4+ technologies deployed 50%+
  ├─ Research investment $50B+
  └─ AI capability 2.5+

Month 62: Virtuous Cascade begins
  ├─ 3 spirals active → 1.4x amplification
  ├─ Cross-reinforcement accelerates
  └─ Crises resolve faster

Month 75: Utopia declared
  └─ 3 spirals sustained 12+ months
```

### Path 2: Cultural Utopia (Meaning + Democratic + Cognitive)
```
Month 1-30: Governance quality focus
  ├─ Maintain democratic government
  ├─ High AI alignment (0.7+)
  └─ Build institutional capacity

Month 35: Democratic Spiral activates
  ├─ Decision quality 0.8+
  ├─ Participation 0.7+
  ├─ Transparency 0.7+
  └─ Democratic government maintained

Month 40-60: Meaning Renaissance builds
  ├─ Purpose diversity grows (4 pathways)
  ├─ Self-actualization increases
  ├─ Artistic renaissance begins
  └─ Philosophical maturity develops

Month 65: Meaning Spiral activates
  ├─ Renaissance strength 0.72
  ├─ Meaning crisis < 0.3
  ├─ Community platforms deployed
  └─ Purpose frameworks deployed

Month 70: Cognitive Spiral activates
  ├─ Mental health tech deployed
  ├─ AI augmentation strong (2.5+)
  └─ Purpose fulfilled

Month 82: Utopia declared
  └─ Cultural path achieved!
```

### Path 3: Eco Utopia (Ecological + Abundance + Scientific)
```
Month 1-25: Environmental focus
  ├─ $10B/month environmental research
  ├─ Prioritize Clean Energy, Ecosystem Management
  └─ Carbon Capture research

Month 30-45: Abundance achieved
  ├─ Clean Energy deployed
  ├─ Food security high
  └─ Material abundance

Month 50-65: Environmental tech deployed
  ├─ Clean Energy 70%+ (pollution dropping)
  ├─ Carbon Capture 50%+ (climate stabilizing)
  ├─ Ecosystem Management 60%+ (biodiversity recovering)
  └─ AI-accelerated deployment

Month 68: Ecological Spiral activates
  ├─ Biodiversity > 0.7
  ├─ Climate > 0.7
  ├─ Pollution < 0.3
  └─ Resources > 0.7

Month 70: Scientific Spiral activates
  ├─ 6+ environmental techs deployed
  ├─ Research investment $50B+
  └─ Tech momentum

Month 82: Utopia declared
  └─ Planet healed + scientific progress
```

### Path 4: Balanced Utopia (All 6 Spirals)
```
Month 1-40: Comprehensive excellence
  ├─ Democracy maintained
  ├─ High research investment (all categories)
  ├─ Post-scarcity achieved
  └─ AI alignment high

Month 50-70: Spirals activate sequentially
  ├─ Abundance (Month 45)
  ├─ Democratic (Month 50)
  ├─ Cognitive (Month 55)
  ├─ Ecological (Month 60)
  ├─ Scientific (Month 65)
  └─ Meaning (Month 70)

Month 70: Virtuous Cascade at maximum
  ├─ 6 spirals active → 1.6x amplification
  ├─ Maximum cross-reinforcement
  └─ Fastest path to stability

Month 82: Utopia declared
  └─ Most stable Utopia (all spirals)
```

**Success Rates (Target with Phase 2E-F tuning):**
- Tech Path: 5-8% (fast but narrow)
- Cultural Path: 4-6% (requires maintaining democracy through crises)
- Eco Path: 3-5% (requires early environmental investment)
- Balanced Path: 2-4% (hardest but most stable)
- **Total Utopia Rate:** 10-20%

### Path 5: Authoritarian Lock-In (Dystopia Trap - 0% Utopia)
```
Month 25-35: Crisis cascade begins
  └─ 4+ crises, social stability < 0.3

Month 35: Authoritarian transition
  ├─ Crisis-driven takeover
  ├─ Weak democratic resistance (low participation)
  └─ Emergency powers permanent

Authoritarianism → Social tech penalties (Phase 2B)
  ├─ Purpose Frameworks: 80% slower (20% rate)
  ├─ Community Platforms: 70% slower (30% rate)
  ├─ Mental Health AI: 50% slower
  └─ Cannot research social solutions effectively!

Month 50+: Spirals blocked
  ├─ Democratic spiral: IMPOSSIBLE (authoritarian)
  ├─ Meaning spiral: BLOCKED (can't research social tech)
  ├─ Cognitive spiral: BLOCKED (meaning crisis persists)
  └─ Only tech spirals possible (Abundance, Scientific, Ecological)

Result: Maximum 3 spirals, but meaning crisis persists
  └─ Can't resolve all crises → Utopia IMPOSSIBLE
  └─ Dystopia lock-in permanent
```

**Lesson:** Democratic government is REQUIRED for Utopia. Authoritarian governments cannot achieve Meaning or Cognitive spirals due to social tech penalties (Phase 2B). Maximum 3 spirals theoretical, but crises persist → Dystopia instead.

## Related Systems

- [Golden Age Mechanic](./golden-age.md) - Prosperity state vs Utopia outcome
- [Quality of Life](./quality-of-life.md) - Primary discriminator
- [Upward Spirals](../systems/upward-spirals.md) - **NEW:** 6 virtuous cascades, Utopia condition (Phase 2D)
- [Meaning Renaissance](../systems/meaning-renaissance.md) - **NEW:** Cultural flourishing enables Meaning spiral (Phase 2E)
- [Governance Quality](../systems/governance-quality.md) - **NEW:** Democratic resilience enables Democratic spiral (Phase 2C)
- [Conflict Resolution](../systems/conflict-resolution.md) - **NEW:** Peace systems reduce extinction risk (Phase 2F)
- [Breakthrough Technologies](../systems/breakthrough-technologies.md) - Technologies enable spirals
- [Environmental System](../systems/environmental.md) - Enables Ecological spiral
- [Social Cohesion](../systems/social-cohesion.md) - Meaning crisis blocks Meaning spiral
- [Technological Risk](../systems/technological-risk.md) - Affects Cognitive and Scientific spirals
- [Crisis Cascades](./crisis-cascades.md) - What prevents Utopia (blocks spiral activation)
- [Extinctions](../advanced/extinctions.md) - 17 specific mechanisms
- [Economics](./economics.md) - Stage transitions affect outcomes
- [Crisis Points](../advanced/crisis-points.md) - Decisive moments

---

**Version History:**
- **v1.0** (Sep 2025): Three outcome system (commit 2b728e4)
- **v1.1** (Oct 2025): Heterogeneous extinctions (commit 2b728e4)
- **v1.2** (Oct 2025): Tuning based on Monte Carlo (commit 86723f7)
- **v2.0** (Oct 9, 2025): Golden Age distinction, sustainability requirements, breakthrough tech paths
- **v2.1** (Oct 9, 2025): **Phase 2D-F:** Spiral-based Utopia condition, multiple paths (Tech/Cultural/Eco/Balanced), Meaning Renaissance, Conflict Resolution integration
