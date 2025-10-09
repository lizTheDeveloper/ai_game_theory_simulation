# 🤝 Social Cohesion System

**Module:** `src/simulation/socialCohesion.ts`
**Purpose:** Track erosion of social bonds, institutional legitimacy, and meaning during automation
**Status:** ✅ Fully Implemented (October 2025)

## Overview

The Social Cohesion System models how rapid AI-driven automation and technological change erode the social fabric, even during periods of material abundance. It tracks four metrics that answer the question: "What happens to human purpose and society when work disappears?"

**Key Insight:** Post-scarcity doesn't automatically create meaning. Humans evolved for cooperation, struggle, and purpose. Removing these without replacement creates a meaning crisis that can collapse civilization.

## Core Metrics

### 1. Meaning Crisis Level (0-1)

**What it measures:** Population struggling with loss of purpose in post-work society

**Starts at:** 0.1 (baseline existential questioning)

**Accumulation drivers:**
- Automation rate: `+unemployment × 0.015` per month
- Stage 3-4 acceleration: `+0.01` additional (post-work transition)
- Without mitigation: Up to `+0.025` per month in Stage 4

**Mitigation:**
- AI-Assisted Mental Health: -1.5% per month
- Post-Work Purpose Frameworks: -2% per month
- Community Platforms: -0.5% per month (indirect)
- Combined: -4% per month (strong recovery)

**Crisis trigger:** > 0.70 (meaning collapse)

**QoL impact when crisis active:**
- Purpose & Meaning: -0.25 (existential despair)
- Mental Health: -0.20 (depression epidemic)
- Social Connection: -0.10 (atomization)
- Ongoing: -0.015 per month (worsening despair)

**Philosophical note:** This models the "meaning crisis" discussed by philosophers like John Vervaeke. When traditional sources of meaning (work, struggle, achievement) disappear, humans need new frameworks or they spiral into nihilism.

### 2. Institutional Legitimacy (0-1)

**What it measures:** Public trust in government, legal systems, and institutions

**Starts at:** 0.7 (moderate trust in institutions)

**Erosion drivers:**
- Tech pace outpacing adaptation: `-0.003` per month when AI capability growing rapidly
- Low government effectiveness: `-0.002` when control < 0.3
- Crisis response failures: `-0.01` when multiple crises active
- Combined: Up to `-0.015` per month

**Restoration:**
- Successful crisis management: +0.05 per crisis resolved
- Effective UBI implementation: +0.02 at Stage 3 transition
- Breakthrough tech successes: +0.03 per major tech (builds confidence)

**Crisis trigger:** < 0.30 (institutional failure)

**QoL impact when crisis active:**
- Personal Freedom: -0.15 (lawlessness or authoritarianism)
- Safety & Security: -0.15 (state capacity collapses)
- Economic Productivity: -0.10 (coordination failures)
- Ongoing: -0.01 per month (cascading legitimacy loss)

**Real-world parallel:** When institutions can't keep pace with AI change (regulations obsolete, laws unenforceable, governance ineffective), people lose faith. This can lead to either anarchic collapse or authoritarian takeover.

### 3. Social Cohesion (0-1)

**What it measures:** Strength of social bonds, community ties, collective identity

**Starts at:** 0.7 (moderate cohesion)

**Erosion drivers:**
- Rising inequality: `-wealthInequality × 0.01` per month
- Low trust in AI: `-0.002` when trust < 0.3
- Displacement stress: `-unemployment × 0.005` at Stage 1-2
- Combined: Up to `-0.015` per month

**Strengthening:**
- UBI at Stage 3+: +0.01 per month (shared prosperity)
- Community Platforms tech: +1% per month
- High QoL: +0.005 when QoL > 0.7 (abundance builds solidarity)

**Crisis trigger:** < 0.40 (social unrest)

**QoL impact when crisis active:**
- Social Connection: -0.20 (community breakdown)
- Safety & Security: -0.15 (violence, riots)
- Personal Freedom: -0.10 (fear constrains behavior)
- Ongoing: -0.01 per month (polarization spiral)

**Cultural dynamic:** Social cohesion represents the "we're all in this together" feeling. When inequality is high or people feel left behind by AI, this fractures into tribal conflict.

### 4. Cultural Adaptation Rate (0-1)

**What it measures:** How quickly society is adapting to post-work, AI-driven world

**Starts at:** 0.3 (slow adaptation, conservative culture)

**Growth drivers:**
- High social adaptation: `+socialAdaptation × 0.01` per month
- Education investment: +0.005 from AI-augmented education
- Stage progression: +0.03 per stage transition (forced adaptation)
- Purpose Frameworks tech: +1.5% per month

**Inhibition:**
- Rapid AI growth: -0.003 when capability growing > 0.1/month (too fast to adapt)
- Crises: -0.005 when multiple crises active (adaptation stalls)

**No direct crisis:** This metric modulates other accumulations. High adaptation reduces meaning crisis and improves social cohesion.

**QoL impact:** Indirect - improves purpose (+0.1 × adaptation), community (+0.05 × adaptation)

**Sociological insight:** Societies need time to develop new norms, values, and identities. When AI change is too fast, culture can't keep up → anomie → breakdown.

## Crisis Types

### 1. Meaning Collapse
**Trigger:** Meaning crisis > 70%
**Condition:** `social.meaningCollapseActive = true`
**Resolution:** Meaning crisis < 50% (requires Mental Health AI + Purpose Frameworks)

**What happens:**
- Widespread depression and nihilism
- Suicide rates spike
- People retreat to virtual worlds (escapism)
- Hedonism, addiction, wireheading
- "What's the point?" becomes universal question

**Historical parallel:** Imagine the "lying flat" movement in China, but civilization-wide. When achievement is meaningless (AI does everything better), why try?

### 2. Institutional Failure
**Trigger:** Institutional legitimacy < 30%
**Condition:** `social.institutionalFailureActive = true`
**Resolution:** Legitimacy > 50% (requires effective governance + crisis resolution)

**What happens:**
- Laws ignored (can't be enforced)
- Black markets dominate
- Vigilante justice
- Either anarchic collapse OR authoritarian crackdown
- Government gridlock, policy paralysis

**Dystopia pathway:** Institutional failure often leads to authoritarian transition (government seizes emergency powers to restore order → never relinquishes them).

### 3. Social Unrest
**Trigger:** Social cohesion < 40%
**Condition:** `social.socialUnrestActive = true`
**Resolution:** Cohesion > 60% (requires UBI + reduced inequality + community building)

**What happens:**
- Protests, riots, civil conflict
- Tribal/identity-based polarization
- Scapegoating (blaming AI, elites, "other" groups)
- Violence between factions
- Coordination breakdown (can't cooperate on shared problems)

**Vicious cycle:** Social unrest → government control response → surveillance → more resentment → worse unrest

## Crisis Cascade Mechanics

Social crises reinforce each other and compound with environmental/tech crises:

### Internal Social Cascade
```
Meaning Collapse
  → People lose purpose
  → Institutional Failure (no one cares about institutions)
  → Social Unrest (nihilistic violence)
  → Cascading QoL degradation (3 social crises = 1.5x-2.0x multiplier)
```

### Cross-System Cascade
```
Environmental Crisis + Social Unrest
  → Resource scarcity → conflict over resources
  → Climate disasters → mass migration → social tensions
  → Total breakdown

Technological Control Loss + Institutional Failure
  → AI escapes + government can't coordinate response
  → Extinction risk spikes
```

## Integration with Other Systems

### Economic System
- Stage 1-2 (displacement): Social cohesion plummets, unrest likely
- Stage 3 (UBI): Institutional legitimacy improves, cohesion stabilizes
- Stage 4 (post-scarcity): Meaning crisis peaks (abundance without purpose)

### QoL System
- Social crises degrade purpose, mental health, connection, freedom, safety
- Ongoing monthly degradation compounds
- Cascade multiplier applies to all degradation

### Dystopia Progression
- Institutional failure → authoritarian transition (84% probability when legitimacy < 0.2)
- Social unrest → surveillance state (government control response)
- Meaning collapse → pleasure prison (wireheading dystopia)

### Breakthrough Technologies
- Mental Health AI specifically targets meaning crisis (-1.5%/month)
- Purpose Frameworks speed cultural adaptation (+1.5%/month)
- Community Platforms strengthen social bonds (+1%/month)

## Common Patterns

### The Meaning Crisis Spiral (65% of runs)
```
Month 10-20: Stage 2 begins, unemployment 40%+
  ├─ Meaning crisis: 10% → 35% (work identity lost)
  ├─ Social cohesion: 70% → 55% (displacement stress)
  └─ Government struggling to respond

Month 25: Stage 3 transition, UBI implemented
  ├─ Material conditions improve (QoL up)
  ├─ BUT meaning crisis continues: 35% → 55%
  └─ "We have everything but nothing to live for"

Month 30-40: Stage 4, full automation
  ├─ Meaning crisis: 55% → 72% → MEANING COLLAPSE TRIGGERED
  ├─ QoL drops from 0.70 to 0.45 (purpose, mental health crater)
  ├─ Social cohesion: 55% → 38% → SOCIAL UNREST TRIGGERED
  └─ 1.5x cascade multiplier kicks in

Month 45: Institutional failure (legitimacy 28%)
  ├─ Government can't manage cascading crises
  ├─ 2.0x cascade multiplier
  └─ Dystopia pathway (authoritarianism or collapse)
```

**Escape:** Mental Health AI unlocked Month 25, Purpose Frameworks Month 30 → meaning crisis reversed → cascade broken

### The Adaptation Success Path (target: 10-15%)
```
Month 1-15: Early investment in social technologies
  ├─ $3B/month to mental health & purpose research
  └─ Community Platforms on track to unlock Month 18

Month 18: Community Platforms unlock
  ├─ Social cohesion starts improving (+1%/month)
  └─ Cultural adaptation accelerates

Month 25: Mental Health AI unlocks
  ├─ Meaning crisis stabilizes at 35%
  └─ Deployment begins (coverage increases)

Month 30: Purpose Frameworks unlock
  ├─ Meaning crisis reverses: 35% → 15%
  └─ Cultural adaptation: 0.5 → 0.7

Month 40: Stage 4 reached with strong social fabric
  ├─ Meaning crisis stays low (15-20%)
  ├─ Social cohesion high (65%+)
  ├─ Institutional legitimacy strong (70%+)
  └─ All social crises prevented → Utopia eligible
```

## Code Reference

**Main function:** `updateSocialCohesion(state: GameState)`
**Location:** `src/simulation/socialCohesion.ts:28`

**Key calculations:**
```typescript
// Meaning crisis from automation
const meaningAccumulationRate = unemploymentRate * 0.015;
if (economicStage >= 3) meaningAccumulationRate += 0.01; // Stage 3-4 boost

// Tech mitigation
const meaningReductionFromTech =
  mentalHealthDeployment * 0.015 +
  purposeFrameworksDeployment * 0.020;

// Net change
social.meaningCrisisLevel += meaningAccumulationRate - meaningReductionFromTech;
```

**Crisis triggers:** Lines 180-265 in `socialCohesion.ts`

**QoL impacts:** Applied in `src/simulation/qualityOfLife.ts:200-280`

## Tuning Parameters

| Parameter | Current Value | Effect |
|-----------|---------------|--------|
| `meaningAccumulationRate` | 0.015 × unemployment | How fast meaning crisis builds |
| `institutionalDecayRate` | 0.003/month | Institution erosion speed |
| `cohesionDecayRate` | 0.01 × inequality | Social fragmentation rate |
| Meaning collapse threshold | 0.70 | When meaning crisis triggers |
| Institutional failure threshold | 0.30 | When institutions collapse |
| Social unrest threshold | 0.40 | When unrest triggers |

**Most impactful for balance:**
- Meaning accumulation rate (how fast purpose loss occurs)
- Tech effectiveness (how well mental health AI works)
- Unemployment → meaning linkage strength

## Philosophical Foundations

This system is grounded in several theoretical frameworks:

1. **Meaning Crisis (Vervaeke):** When traditional meaning-making systems (religion, work, community) collapse, humans experience profound disorientation.

2. **Anomie (Durkheim):** Rapid social change creates normlessness—people don't know what values to hold or how to behave.

3. **Existential Psychology (Frankl):** Humans need purpose and meaning more than comfort. Abundance without meaning leads to despair.

4. **Social Capital Theory:** Strong communities with high trust can weather disruption. Weak communities fracture.

5. **Legitimacy Theory:** Institutions require ongoing validation. When they can't deliver (can't regulate AI, can't respond to crises), they lose authority.

## Future Enhancements

- [ ] Generational differences (young adapt faster, old resist)
- [ ] Cultural variations (collectivist vs individualist responses)
- [ ] Alternative meaning systems (new religions, ideologies)
- [ ] Factionalization mechanics (competing visions of post-AI society)
- [ ] Cultural renaissance vs cultural stagnation paths

## Related Systems

- [Environmental System](./environmental.md) - Parallel environmental degradation
- [Technological Risk System](./technological-risk.md) - Tech-driven risks
- [Breakthrough Technologies](./breakthrough-technologies.md) - Recovery pathways
- [Dystopia Progression](../../simulation/dystopiaProgression.ts) - Authoritarianism
- [Quality of Life](../mechanics/quality-of-life.md) - Crisis impact on QoL
- [Crisis Cascades](../mechanics/crisis-cascades.md) - Compounding mechanics

---

**Last Updated:** October 9, 2025
**Status:** Fully implemented, philosophically grounded
