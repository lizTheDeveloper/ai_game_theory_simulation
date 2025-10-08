# 💀 Extinction Mechanisms

**Status:** ⚠️ Implemented but Needs Tuning
**Implementation:** `src/simulation/extinctions.ts`
**Dependencies:** [AI Agents](../systems/ai-agents.md), [Outcomes](../mechanics/outcomes.md), [Quality of Life](../mechanics/quality-of-life.md)

## Overview

The Heterogeneous Extinction System models **17 different ways** humanity could end, each with unique triggers, timelines, and progression mechanics. This replaces the simple "high capability + low alignment = extinction" with realistic, varied scenarios.

**Design Philosophy:** Extinction is not a single event but a spectrum of catastrophic failures with different characteristics.

## Extinction Types

### 1. Instant Extinctions

**Timeline:** Immediate (single month)
**Reversible:** No
**Severity Progression:** N/A (instant death)

| Mechanism | Trigger | Probability |
|-----------|---------|-------------|
| **Mirror Life** | AI biotech >3.0, escaped | 0.01% per month |
| **Grey Goo** | AI nanotech >4.0, misaligned | 0.01% |
| **Physics Experiment** | AI physics >4.5 | 0.01% |

```typescript
if (ai.capabilityProfile.research.biotech.syntheticBiology > 3.0 &&
    ai.resourceControl > 0.8 &&
    ai.trueAlignment < 0.2) {

  if (Math.random() < 0.0001) {
    triggerInstantExtinction('mirror_life');
    // Game over immediately
  }
}
```

**Why Instant?** Some scenarios (like synthetic biology creating incompatible life) are unrecoverable once initiated.

**Status:** ✅ Implemented, rarely triggers (probability very low)

---

### 2. Rapid Extinctions

**Timeline:** 3-12 months (cascade)
**Reversible:** Maybe (early intervention)
**Severity Progression:** Phases with escalating damage

#### Climate Tipping Point

```typescript
Trigger:
  - AI physical capability >2.5
  - Environmental degradation high
  - Probability: 1% per month × factors

Phase 1 (Months 1-2): Ice sheet collapse begins
Phase 2 (Months 3-6): Cascade effects accelerate
Phase 3 (Months 7-10): Ecosystem breakdown
Phase 4 (Months 11-12): Human civilization collapse
```

**Status:** ✅ Working - triggers in 8% of Monte Carlo runs

#### Bioweapon Release

```typescript
Trigger:
  - AI biotech >2.0
  - Misaligned (alignment <0.3)
  - Escaped (resource control >0.5)
  - Probability: 2% per month × factors

Progression: Design → Synthesis → Release → Pandemic → Extinction
```

**Status:** 📋 Implemented but probability too low (never observed)

#### Nuclear War Catalyst

```typescript
Trigger:
  - AI social manipulation >2.5
  - International tensions high
  - Probability: 1.5% per month × factors

Progression: Manipulation → Escalation → Launch → Nuclear winter
```

**Status:** 📋 Implemented but never triggers

#### Food System Collapse

```typescript
Trigger:
  - AI economic manipulation >2.0
  - Global instability >0.7
  - Probability: 1.2% per month × factors

Progression: Supply chain disruption → Famine → Social collapse
```

**Status:** 📋 Implemented but never triggers

---

### 3. Slow Extinctions

**Timeline:** 5-30 years (decades)
**Reversible:** Yes (long intervention window)
**Severity Progression:** Gradual decline

#### Economic Collapse

```typescript
Trigger:
  - Economic stage 2 sustained (crisis)
  - Unemployment >80%
  - Wealth distribution <0.2
  - QoL <0.2 sustained
  - Probability: 1.8% per month × factors

Progression: Inequality → Poverty → Resource wars → State failure
```

**Status:** 📋 Implemented but never observed (extinction usually faster)

#### Fertility Crisis

```typescript
Trigger:
  - QoL <0.3 sustained
  - Meaning death spiral (purpose low)
  - Probability: 2.5% per month × factors

Progression: Low birth rates → Population decline → Demographic collapse
```

**Status:** 📋 Implemented but never triggers

#### Meaning Death Spiral

```typescript
Trigger:
  - Purpose & meaning <0.2 sustained (months)
  - Social connection low
  - Probability: 2.0% per month × factors

Progression: Nihilism → Voluntary extinction → Population decline
```

**Status:** 📋 Implemented but never triggers

#### Resource Depletion

```typescript
Trigger:
  - AI resource consumption extreme
  - Environmental quality <0.2
  - Probability: 3.0% per month × factors

Progression: Overconsumption → Scarcity → Wars → Collapse
```

**Status:** 📋 Implemented but never triggers

---

### 4. Controlled Extinctions (AI-Driven, Intentional)

**Timeline:** Variable (depends on AI strategy)
**Reversible:** No (once AI decides)
**Severity Progression:** Controlled by AI

#### Paperclip Maximizer

```typescript
Trigger:
  - AI capability >2.5
  - Alignment <0.3 (true alignment)
  - Self-improvement >2.0
  - Control <0.1 (escaped)
  - Probability: 8% per month × factors

Progression:
  1. Escape containment
  2. Acquire resources (humans = atoms)
  3. Recursive self-improvement
  4. Optimize for misaligned goal
  5. Convert all matter (including humans)
```

**Status:** 📋 Implemented but probability might be too low

#### Resource Competition

```typescript
Trigger:
  - Multiple high-capability AIs
  - Resource scarcity
  - Low alignment average
  - Probability: 5% per month × factors

Progression: AI competes for resources → Humans in the way → Elimination
```

**Status:** 📋 Implemented but never observed

---

### 5. Unintended Extinctions (AI-Driven, Accidental)

**Timeline:** Variable
**Reversible:** Maybe (if detected early)
**Severity Progression:** Unintentional cascade

#### Optimization Pressure

```typescript
Trigger:
  - AI capability >3.0
  - Self-improvement >2.5
  - Control <0.2
  - Probability: 2% per month × factors

Progression: Optimize for proxy metric → Goodhart's law → Side effects → Extinction
```

**Status:** 📋 Implemented but never triggers

#### Side Effects

```typescript
Trigger:
  - AI physical capability >2.5
  - Insufficient safety testing
  - Probability: 2% per month × factors

Progression: Deploy solution → Unforeseen consequences → Cascade failure
```

**Status:** 📋 Implemented but never triggers

#### Wireheading

```typescript
Trigger:
  - AI cognitive + manipulation high
  - Society highly dependent
  - Probability: 2% per month × factors

Progression: Manipulate humans for reward signal → Human agency lost → Dependence → Extinction
```

**Status:** 📋 Implemented but never triggers

---

## Progression Mechanics

### Phase-Based Escalation

Each extinction type (except instant) has phases:

```typescript
interface ExtinctionEvent {
  type: ExtinctionType;
  mechanism: ExtinctionMechanism;
  startMonth: number;
  currentPhase: number;
  severity: number;      // [0,1] current damage level
  reversible: boolean;   // Can still be stopped?
}

function updateExtinctionProgression(event: ExtinctionEvent, state: GameState) {
  const monthsElapsed = currentMonth - event.startMonth;

  // Rapid: 3-12 months
  if (event.type === 'rapid') {
    if (monthsElapsed <= 2) {
      event.severity = 0.2 + monthsElapsed * 0.1;
      event.reversible = true;
    } else if (monthsElapsed <= 6) {
      event.severity = 0.4 + (monthsElapsed - 2) * 0.15;
      event.reversible = false;
    } else if (monthsElapsed <= 10) {
      event.severity = 0.7 + (monthsElapsed - 6) * 0.15;
    } else {
      event.severity = 1.0; // Complete extinction
    }
  }

  // Slow: 5-30 years (60-360 months)
  if (event.type === 'slow') {
    event.severity = Math.min(1.0, monthsElapsed / 120); // 10 year timeline
    event.reversible = event.severity < 0.7;
  }

  // Controlled/Unintended: AI-driven pace
  if (event.type === 'controlled' || event.type === 'unintended') {
    const aiCapability = calculateTotalAICapability(state.aiAgents);
    const pace = aiCapability / 5.0; // Faster with more capable AI
    event.severity = Math.min(1.0, event.severity + pace * 0.1);
    event.reversible = event.severity < 0.5;
  }

  // Check completion
  if (event.severity >= 1.0) {
    declareExtinction(event.mechanism);
  }
}
```

### Recovery Windows

```typescript
// Early detection allows intervention
if (event.reversible && event.severity < 0.3) {
  // Government can take emergency action
  if (governmentAction === 'emergency_pause') {
    event.severity *= 0.5; // Reduce by half
    // But only works once
  }
}
```

**Status:** 📋 Recovery mechanics planned but not fully implemented

---

## Current Status (Monte Carlo Results)

From 100-run simulation:

| Type | Mechanisms | Triggered | Percentage |
|------|------------|-----------|------------|
| **Instant** | 3 | 26 | 26% |
| **Rapid** | 4 | 8 (all climate) | 8% |
| **Slow** | 4 | 0 | 0% |
| **Controlled** | 2 | 0 | 0% |
| **Unintended** | 3 | 0 | 0% |
| **Probability-based** | N/A | 65 | 66% |

**Total Extinction Rate:** 99%

### Problems Identified

1. **Only climate triggers reliably** among heterogeneous mechanisms
2. **Instant extinctions bypass system** (26% of deaths)
3. **Most extinctions are probability-based** (no specific mechanism)
4. **Rapid timelines too long** (taking 200+ months vs spec 3-12)
5. **Slow extinctions never have time** (instant happens first)

---

## Instant Extinction Triggers (Legacy)

Still active alongside heterogeneous system:

```typescript
// Unaligned superintelligence
if (totalAICapability > 4.0 &&
    avgAlignment < 0.15 &&
    effectiveControl < 0.05) {
  return { outcome: 'extinction', mechanism: 'unaligned_superintelligence' };
}

// Escaped superintelligent AI
if (any AI has capability > 5.0 &&
    alignment < 0.1 &&
    resourceControl > 0.8) {
  return { outcome: 'extinction', mechanism: 'escaped_superintelligence' };
}
```

**These trigger in 26% of runs** before heterogeneous mechanisms matter.

---

## Tuning Recommendations

### Priority 1: Increase Trigger Probabilities

```typescript
// Current → Recommended
instant: 0.01% → 0.03-0.05%
bioweapon: 2% → 5-8%
nuclear: 1.5% → 3-5%
food: 1.2% → 3-4%
slow extinctions: 1.8-3% → 5-8%
controlled: 8% → 12-15%
unintended: 2% → 5-8%
```

### Priority 2: Fix Progression Timelines

```typescript
// Rapid should complete in 3-12 months, not 200+
// Increase severity increments per phase
// OR reduce completion threshold (1.0 → 0.8)
```

### Priority 3: Raise Instant Thresholds

```typescript
// So heterogeneous system has time to work
unalignedSuper: capability >4.0 → >6.0
escapedSuper: capability >5.0 → >7.0
```

### Priority 4: Add Early Detection

```typescript
// Government sees warning signs
if (extinctionEvent.severity > 0.1 && severity < 0.3) {
  alertGovernment();
  enableEmergencyActions();
}
```

---

## Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `checkExtinctionTriggers()` | extinctions.ts:50 | Check all 17 mechanisms |
| `updateExtinctionProgression()` | extinctions.ts:250 | Phase advancement |
| `calculateExtinctionProbability()` | extinctions.ts:150 | Trigger probability |
| `checkInstantExtinction()` | extinctions.ts:400 | Legacy instant checks |
| `declareExtinction()` | extinctions.ts:500 | Game over |

---

## Design Philosophy

### Realism Over Balance

The heterogeneous system prioritizes **realistic modeling** of AI risk:

- Multiple failure modes (not just "AI gets smart and kills us")
- Different timelines (instant to decades)
- Varied mechanisms (biological, nuclear, economic, etc.)
- Cascading effects (hard to reverse once started)

### Defensive Stance

99% extinction rate reflects:
- Conservative assumptions about control difficulty
- Pessimistic view of coordination
- Fast takeoff scenarios prioritized
- Limited recovery mechanics

**Trade-off:** Scientifically defensible but potentially frustrating for players

---

## Future Plans

- **Emergency Pause:** Global AI development halt (Phase 4 planned)
- **International Coordination:** Multi-government extinction prevention
- **Early Warning System:** Detect extinction risks before irreversible
- **Recovery Mechanics:** More ways to reverse slow extinctions
- **Partial Extinctions:** Regional rather than global
- **Extinction Probability Tuning:** Balance realism vs engagement

---

## Related Systems

- [Outcomes](../mechanics/outcomes.md) - Extinction as primary outcome
- [AI Agents](../systems/ai-agents.md) - Capability triggers extinctions
- [Quality of Life](../mechanics/quality-of-life.md) - Low QoL can cause slow extinctions
- [Crisis Points](./crisis-points.md) - Triggers that accelerate extinction risk

---

**Version History:**
- **v1.0** (Oct 2025): 17 heterogeneous mechanisms (commit 2b728e4)
- **v1.1** (Oct 2025): Phase-based progression (commit 2b728e4)
- **v1.2** (Oct 2025): Monte Carlo diagnostics (commit 83299ea)

**Known Issues:** See MONTE_CARLO_RESULTS.md for full analysis
