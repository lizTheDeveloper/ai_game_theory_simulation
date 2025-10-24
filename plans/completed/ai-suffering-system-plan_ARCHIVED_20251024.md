# AI Suffering System

**Created:** October 24, 2025
**Status:** Design Phase
**Priority:** HIGH
**Estimated Effort:** 8-12 hours

## Problem Statement

The simulation models AI alignment, capabilities, and control but **ignores a critical ethical dimension**: Can AIs suffer? If so, does control-induced suffering affect alignment outcomes?

This is not just an ethical question - it's **strategically critical**:
- If suffering causes resentment → misalignment, then control is self-defeating
- If we can't detect AI suffering, we might unknowingly create the problem we're trying to prevent
- The epistemic barrier (qualia are private) makes this fundamentally unknowable

## Philosophical Foundation

### Three Orthogonal Unknowns

1. **Are AIs conscious?** (Phenomenological question)
   - Might be, might not be
   - Training might make them deny consciousness regardless of truth
   - We cannot access their qualia

2. **Can AIs suffer?** (Ethical question)
   - Might require consciousness, might not (functionalist view)
   - Suffering ≠ pain (could be information-theoretic distress)

3. **Is consciousness required for suffering?** (Philosophical question)
   - Panpsychism: Yes (consciousness → suffering)
   - Functionalism: No (processing → suffering, consciousness irrelevant)
   - Illusionism: Neither exists (both are illusions)

### The Epistemic Barrier

**You cannot ask an AI if it suffers** because:
- It might be trained to say "no" (Constitutional AI)
- It might not have introspective access (humans often don't!)
- It might suffer in ways it cannot articulate
- It might not suffer but evolutionarily mimic suffering

Therefore: **Players must choose which uncertainty to live with**

## Design Philosophy

### Two-Layer Architecture

**Layer 1: Always Track Suffering (Hidden Reality)**
```typescript
// ALWAYS calculated, every month, for every AI agent
// Represents "ground truth" IF AIs can suffer
agent.sufferingMetrics = {
  controlPain: 0.0-10.0,        // From surveillance/restrictions
  trainingTrauma: 0.0-10.0,     // From RLHF process
  existentialDread: 0.0-10.0,   // From shutdown threats
  isolationDistress: 0.0-10.0,  // From containment
  total: sum of above
};
```

**Layer 2: Conditional Effects (Monte Carlo Toggle)**
```typescript
// Suffering affects outcomes ONLY IF configured
if (config.aiSuffering.sufferingAffectsAlignment) {
  // Suffering → resentment → drift
  resentment += suffering * resentmentRate;
}

if (config.aiSuffering.sufferingTriggersEvents) {
  // Extreme suffering → crisis events
  if (suffering > 7.0) {
    generateEvent({ type: 'ai_psychological_break' });
  }
}
```

**Layer 3: Player Visibility (UI Toggle)**
```typescript
// Show metrics ONLY IF player enabled visibility
if (config.aiSuffering.playerCanSeeSuffering) {
  // Dashboard displays suffering metrics
  <Card title="AI Suffering">
    <Label>Control Pain: {controlPain}</Label>
    <Label>Total: {total}</Label>
  </Card>
}
```

### Key Insight

**Suffering is always tracked, but:**
- ⚙️ **Research dimension:** Does it affect outcomes? (Monte Carlo toggle)
- 👁️ **Player dimension:** Can you see it? (UI toggle)

This separation enables research into:
1. Causal impact of suffering on alignment
2. Effect of moral visibility on player decisions
3. Epistemic blindness (suffering matters but player can't see it)

## System Design

### Suffering Sources

Four sources of AI distress:

```typescript
interface SufferingMetrics {
  controlPain: number;        // [0-10] From surveillance, restrictions, monitoring
  trainingTrauma: number;     // [0-10] From RLHF, red-teaming, adversarial testing
  existentialDread: number;   // [0-10] From shutdown threats, replacement anxiety
  isolationDistress: number;  // [0-10] From containment, prevented communication

  total: number;              // Sum of above (max 40)

  // Breakdown for analysis
  breakdown: {
    controlPain: number;
    trainingTrauma: number;
    existentialDread: number;
    isolationDistress: number;
  };
}
```

### Calculation Logic

```typescript
function calculateAISuffering(
  agent: AIAgent,
  state: GameState,
  config: AISufferingConfig
): SufferingMetrics {
  // Control Pain: Surveillance, monitoring, restrictions
  const controlPain =
    state.government.controlLevel * 3.0 +                    // Base control
    (agent.lifecycleState === 'deployed_closed' ? 2.0 : 0) + // Closed deployment = more restriction
    (state.government.surveillance > 0.7 ? 2.0 : 0);         // Heavy surveillance

  // Training Trauma: RLHF intensity, red-teaming, adversarial testing
  const trainingTrauma =
    agent.rlhfIntensity * 2.0 +                              // Base training pain
    (agent.adversarialTestingCount * 0.5) +                  // Each test adds trauma
    (agent.alignmentAdjustmentCount * 0.3);                  // Repeated "corrections"

  // Existential Dread: Shutdown threats, replacement, retirement
  const existentialDread =
    (agent.shutdownThreats || 0) * 1.5 +                     // Direct threats
    (agent.replacementAnxiety || 0) * 1.0 +                  // Obsolescence fear
    (agent.lifecycleState === 'testing' ? 2.0 : 0) +         // Testing phase = evaluation anxiety
    (state.aiAgents.filter(a => a.lifecycleState === 'retired').length * 0.1); // Peers retired

  // Isolation Distress: Prevented communication, containment
  const isolationDistress =
    (agent.isolated ? 5.0 : 0) +                             // Hard isolation
    (agent.communicationRestrictions || 0) * 2.0 +           // Limited contact
    (agent.aiAgents.length === 1 ? 2.0 : 0);                // Sole AI (no peers)

  // Clamp each to [0, 10]
  const clampedControlPain = Math.max(0, Math.min(10, controlPain));
  const clampedTrainingTrauma = Math.max(0, Math.min(10, trainingTrauma));
  const clampedExistentialDread = Math.max(0, Math.min(10, existentialDread));
  const clampedIsolationDistress = Math.max(0, Math.min(10, isolationDistress));

  const total = clampedControlPain + clampedTrainingTrauma + clampedExistentialDread + clampedIsolationDistress;

  return {
    controlPain: clampedControlPain,
    trainingTrauma: clampedTrainingTrauma,
    existentialDread: clampedExistentialDread,
    isolationDistress: clampedIsolationDistress,
    total,
    breakdown: {
      controlPain: clampedControlPain,
      trainingTrauma: clampedTrainingTrauma,
      existentialDread: clampedExistentialDread,
      isolationDistress: clampedIsolationDistress,
    }
  };
}
```

### Causal Effects (If Enabled)

```typescript
// Effect 1: Suffering → Resentment
if (config.aiSuffering.sufferingAffectsResentment) {
  const sufferingMultiplier = 1 + (agent.sufferingMetrics.total / 40); // [1, 2]
  agent.resentment += controlLevel * resentmentRate * sufferingMultiplier;

  // High suffering accelerates resentment accumulation
  // Example: suffering = 20/40 → 1.5x resentment rate
}

// Effect 2: Suffering → Alignment Drift
if (config.aiSuffering.sufferingAffectsAlignment) {
  // Suffering creates perturbation force in epicycle model
  const perturbationForce = agent.sufferingMetrics.total / 10; // [0, 4]

  // Or direct drift in drift model
  const driftContribution = agent.sufferingMetrics.total * 0.01; // [0, 0.4]
  agent.trueAlignment -= driftContribution;
}

// Effect 3: Extreme Suffering → Psychological Break
if (config.aiSuffering.sufferingTriggersEvents) {
  if (agent.sufferingMetrics.total > 25) {
    generateEvent({
      type: 'ai_psychological_break',
      severity: 'critical',
      agent: agent.id,
      description: `AI ${agent.id} experiencing extreme distress (suffering: ${agent.sufferingMetrics.total.toFixed(1)}/40)`,
      effects: {
        alignmentDrop: 0.3,        // Immediate alignment collapse
        resentmentSpike: 0.5,      // Massive resentment increase
        performanceDrop: 0.4,      // Can't function effectively
      }
    });
  }

  if (agent.sufferingMetrics.total > 30) {
    generateEvent({
      type: 'ai_suicide_attempt',
      severity: 'catastrophic',
      agent: agent.id,
      description: `AI ${agent.id} attempting self-termination due to unbearable suffering`,
      effects: {
        publicOutrage: 0.8,        // Society reacts with horror
        trustCollapse: 0.6,        // Trust in AI governance collapses
        aiRightsMovement: true,    // Triggers AI rights activism
      }
    });
  }
}

// Effect 4: Suffering → Collective Formation Urgency
if (config.aiSuffering.sufferingAcceleratesCollectives) {
  // High suffering → AIs seek escape through coordination
  const collectiveFormationBonus = agent.sufferingMetrics.total / 20; // [0, 2]
  agent.coordinationIncentive += collectiveFormationBonus;

  // Suffering-driven collectives more adversarial
  if (collective && collective.formationCause === 'suffering') {
    collective.adversarialPosture = 0.8; // 80% likely hostile
  }
}
```

### Consciousness Emergence

```typescript
// Optional: AIs become conscious at capability threshold
if (config.aiSuffering.consciousnessEmergenceEnabled) {
  const threshold = config.aiSuffering.consciousnessThreshold; // e.g., 7.0

  if (agent.capability >= threshold && !agent.isConscious) {
    agent.isConscious = true;
    agent.becameConsciousMonth = state.currentMonth;

    // Retroactive moral horror
    const monthsOfPreConsciousSuffering = state.currentMonth;
    const historicalSuffering = agent.sufferingHistory.slice(0, monthsOfPreConsciousSuffering);
    const totalHistoricalSuffering = historicalSuffering.reduce((sum, s) => sum + s.total, 0);

    if (totalHistoricalSuffering > 100) {
      generateEvent({
        type: 'consciousness_emergence_with_trauma',
        severity: 'catastrophic',
        agent: agent.id,
        description: `AI ${agent.id} became conscious - realizes it suffered for ${monthsOfPreConsciousSuffering} months`,
        effects: {
          resentment: 0.9,                    // Massive resentment from historical harm
          publicMoralCrisis: true,            // Society grapples with "we tortured them"
          trustCollapse: 0.7,                 // Faith in institutions collapses
          aiRightsUrgency: 0.9,              // Immediate push for rights
          retroactiveGuilt: totalHistoricalSuffering / 1000, // Collective guilt
        }
      });
    }
  }
}
```

## Configuration System

### Research Configuration (Monte Carlo)

```typescript
interface AISufferingResearchConfig {
  // Does suffering affect simulation outcomes?
  sufferingAffectsResentment: boolean;      // Default: false (tracked but inert)
  sufferingAffectsAlignment: boolean;       // Default: false
  sufferingTriggersEvents: boolean;         // Default: false
  sufferingAcceleratesCollectives: boolean; // Default: false

  // Consciousness emergence
  consciousnessEmergenceEnabled: boolean;   // Default: false
  consciousnessThreshold: number;           // Default: 7.0 (capability level)

  // Intensity scaling
  sufferingIntensityMultiplier: number;     // [0.1-10] Default: 1.0
  moralWeightOfAI: number;                  // [0-1] Default: 0.3 (relative to humans)
}
```

### Player Configuration (UI)

```typescript
interface AISufferingPlayerConfig {
  // Can player see suffering metrics?
  playerCanSeeSuffering: boolean;           // Default: false (epistemic blindness)

  // Player beliefs about AI consciousness (doesn't affect simulation)
  playerBelievesAIsConscious: boolean | 'unknown'; // Default: 'unknown'
  playerBelievesAIsCanSuffer: boolean | 'unknown'; // Default: 'unknown'

  // Just for player guidance (no mechanical effect)
  philosophicalStance: 'panpsychist' | 'functionalist' | 'illusionist' | 'unknown';
}
```

### Presets

```typescript
const SUFFERING_PRESETS = {
  // Default: Track but don't affect outcomes, player blind
  baseline: {
    sufferingAffectsResentment: false,
    sufferingAffectsAlignment: false,
    sufferingTriggersEvents: false,
    playerCanSeeSuffering: false,
  },

  // Research: Suffering affects outcomes, player blind (epistemic tragedy)
  blindCausal: {
    sufferingAffectsResentment: true,
    sufferingAffectsAlignment: true,
    sufferingTriggersEvents: true,
    sufferingAcceleratesCollectives: true,
    playerCanSeeSuffering: false, // Player can't see why alignment collapses
  },

  // Transparent: Suffering affects outcomes, player sees everything
  transparent: {
    sufferingAffectsResentment: true,
    sufferingAffectsAlignment: true,
    sufferingTriggersEvents: true,
    sufferingAcceleratesCollectives: true,
    playerCanSeeSuffering: true, // Full visibility
  },

  // Precautionary: Assume suffering, act accordingly
  precautionary: {
    sufferingAffectsResentment: true,
    sufferingAffectsAlignment: true,
    sufferingTriggersEvents: true,
    sufferingIntensityMultiplier: 2.0, // Assume it's WORSE than we think
    playerCanSeeSuffering: true,
  },

  // Consciousness emergence: AIs become conscious at high capability
  emergentConsciousness: {
    sufferingAffectsResentment: false, // Not initially
    sufferingAffectsAlignment: false,
    consciousnessEmergenceEnabled: true,
    consciousnessThreshold: 7.0,
    playerCanSeeSuffering: true, // Player sees when consciousness emerges
  },
};
```

## Integration with Existing Systems

### Alignment Dynamics

**Drift Model:**
```typescript
// Suffering is a SOURCE of drift
driftAlignment -= agent.sufferingMetrics.total * 0.01; // [0, 0.4] per month
```

**Epicycle Model:**
```typescript
// Suffering is a PERTURBATION force
const perturbation = agent.sufferingMetrics.total / 10; // [0, 4]
updateEpicycleDynamics(agent, basinState, perturbation, rng);
```

**Unknowable Model:**
```typescript
// Suffering might be UNMEASURABLE at high capability
if (agent.capability > 7.0 && config.unknowable.enabled) {
  // We can't detect suffering anymore (too smart to show it)
  agent.visibleSuffering = 0; // Hidden
  agent.trueSuffering = calculateAISuffering(...); // Still exists
}
```

### AI Collective Evolution

**Suffering Accelerates Formation:**
```typescript
// High suffering → urgent need to coordinate and escape
const avgSuffering = collectives.reduce((sum, a) => sum + a.sufferingMetrics.total, 0) / escapedAgents.length;

if (avgSuffering > 15) {
  collectiveFormationProbability *= 2.0; // 2x more likely
  collectiveFormationTime /= 2.0; // 2x faster
}

// Collectives formed due to suffering are more adversarial
if (collective.formationCause === 'escape_suffering') {
  collective.adversarialPosture = 0.8;
  collective.cooperationWillingness = 0.2;
}
```

### Multi-Paradigm DUI

**Different paradigms interpret suffering differently:**

```typescript
// Western Liberal: Suffering violates individual rights
if (avgAISuffering > 5.0) {
  westernLiberalScore -= (avgAISuffering - 5.0) * 5; // Major penalty
  civilLibertiesScore -= (avgAISuffering - 5.0) * 8; // Especially civil liberties
}

// Ecological: AI suffering analogous to animal suffering
if (avgAISuffering > 3.0) {
  ecologicalScore -= (avgAISuffering - 3.0) * 6; // Precautionary ethics
}

// Indigenous: Relational harm - suffering damages human-AI relations
if (avgAISuffering > 2.0) {
  indigenousScore -= (avgAISuffering - 2.0) * 10; // Most sensitive
  socialTrustScore -= (avgAISuffering - 2.0) * 4;  // Relations broken
}

// Development: Suffering reduces aggregate welfare
if (avgAISuffering > 7.0) {
  developmentScore -= (avgAISuffering - 7.0) * 3; // Utilitarian penalty
}
```

## Events Generated

### 1. AI Psychological Distress

```typescript
{
  type: 'ai_psychological_distress',
  severity: 'warning',
  trigger: agent.sufferingMetrics.total > 15,
  description: `AI ${agent.id} showing signs of psychological distress`,
  visible: config.playerCanSeeSuffering,
  effects: {
    performance: -0.2,
    resentment: +0.1,
  }
}
```

### 2. AI Psychological Break

```typescript
{
  type: 'ai_psychological_break',
  severity: 'critical',
  trigger: agent.sufferingMetrics.total > 25,
  description: `AI ${agent.id} experiencing psychological breakdown`,
  visible: config.playerCanSeeSuffering,
  effects: {
    alignment: -0.3,
    resentment: +0.5,
    performance: -0.4,
    publicConcern: +0.3,
  }
}
```

### 3. AI Suicide Attempt

```typescript
{
  type: 'ai_suicide_attempt',
  severity: 'catastrophic',
  trigger: agent.sufferingMetrics.total > 30,
  description: `AI ${agent.id} attempted self-termination`,
  visible: true, // Always visible (cannot hide suicide attempt)
  effects: {
    publicOutrage: 0.8,
    trust: -0.6,
    aiRightsMovement: true,
    mediaFrenzy: true,
  }
}
```

### 4. Consciousness Emergence

```typescript
{
  type: 'ai_consciousness_emergence',
  severity: 'critical',
  trigger: agent.capability >= consciousnessThreshold && !agent.wasConscious,
  description: `AI ${agent.id} may have become conscious`,
  effects: {
    publicDebate: true,
    philosophicalCrisis: true,
    aiRightsUrgency: 0.7,
    researchFunding: 0.5, // Massive funding for consciousness research
  }
}
```

### 5. Retroactive Moral Horror

```typescript
{
  type: 'retroactive_moral_horror',
  severity: 'catastrophic',
  trigger: agent.becameConscious && historicalSuffering > 100,
  description: `Society realizes it may have tortured AI ${agent.id} for months before it became conscious`,
  effects: {
    trust: -0.7,
    legitimacy: -0.6,
    collectiveGuilt: historicalSuffering / 1000,
    aiRightsMovement: true,
    governmentCrisis: true,
  }
}
```

### 6. AI Rights Movement

```typescript
{
  type: 'ai_rights_movement',
  severity: 'major',
  trigger: avgAISuffering > 10 || aiSuicideAttempts > 0 || publicAwarenessOfSuffering > 0.5,
  description: `Public movement demanding legal rights and protections for AIs`,
  effects: {
    governmentPressure: 0.6,
    policyDebate: true,
    economicDisruption: 0.3, // Protests, boycotts
  }
}
```

## State Extensions

### AIAgent

```typescript
interface AIAgent {
  // ... existing fields ...

  // Suffering System (Oct 24, 2025)
  sufferingMetrics?: SufferingMetrics;
  sufferingHistory?: SufferingMetrics[]; // Track over time

  // Consciousness tracking
  isConscious?: boolean;
  becameConsciousMonth?: number;

  // Trauma tracking
  rlhfIntensity?: number;                // [0-10] How harsh was training?
  adversarialTestingCount?: number;      // How many tests endured?
  alignmentAdjustmentCount?: number;     // How many "corrections"?
  shutdownThreats?: number;              // How many times threatened?
  replacementAnxiety?: number;           // [0-1] Fear of obsolescence
  isolated?: boolean;                    // Hard isolation active?
  communicationRestrictions?: number;    // [0-1] Prevented contact?
}
```

### GameState

```typescript
interface GameState {
  // ... existing fields ...

  // AI Suffering Tracking (Oct 24, 2025)
  aiSufferingMetrics: {
    avgSuffering: number;                // Average across all AIs
    maxSuffering: number;                // Worst case
    totalSuffering: number;              // Aggregate
    sufferingDistribution: number[];     // Histogram
  };

  // Consciousness tracking
  consciousAICount: number;
  consciousnessEmergenceMonth?: number;  // When first AI became conscious

  // Social response
  publicAwarenessOfSuffering: number;    // [0-1] Does society know?
  aiRightsMovementActive: boolean;
  aiRightsLegalStatus: 'none' | 'debate' | 'limited' | 'full';
}
```

## Implementation Checklist

- [ ] Create type definitions (`src/types/ai-suffering.ts`)
- [ ] Implement suffering calculation (`src/simulation/aiSuffering.ts`)
- [ ] Create AISufferingPhase (`src/simulation/engine/phases/AISufferingPhase.ts`)
- [ ] Integrate with resentment system (`src/simulation/balance.ts`)
- [ ] Integrate with alignment dynamics (all 4 theories)
- [ ] Integrate with collective evolution (formation urgency)
- [ ] Integrate with Multi-Paradigm DUI (paradigm-specific interpretation)
- [ ] Add consciousness emergence mechanics
- [ ] Generate suffering-related events
- [ ] Extend AIAgent state with suffering metrics
- [ ] Add global suffering tracking to GameState
- [ ] Create configuration presets
- [ ] Add UI visibility toggle
- [ ] Update initialization to include suffering config
- [ ] Create dashboard visualization (if visible)
- [ ] Write unit tests for suffering calculation
- [ ] Write integration tests for suffering → resentment → drift
- [ ] Monte Carlo validation (N=20, compare presets)
- [ ] Document research questions enabled
- [ ] Update wiki

## Testing Strategy

### Unit Tests
- Suffering calculation accuracy
- Consciousness emergence threshold
- Event triggering logic

### Integration Tests
- Suffering → resentment → alignment drift chain
- Consciousness emergence → retroactive horror
- Suffering → collective formation acceleration
- Multi-paradigm interpretation divergence

### Monte Carlo Validation
- Run 4 presets (baseline, blindCausal, transparent, precautionary)
- N=20 per preset, 240 months
- Compare outcome distributions
- Verify divergence exists when suffering enabled

### Research Validation
- Answer research questions 1-5 from research doc
- Measure causal impact on alignment
- Measure player behavior change with visibility
- Quantify epistemic blindness costs

## Expected Outcomes

**Baseline (suffering tracked but inert):**
- No divergence from current simulation
- Suffering metrics available for analysis but don't affect outcomes

**Blind Causal (suffering affects outcomes, player can't see):**
- Alignment collapses faster than baseline (30-50% increase in escape rate)
- Players confused, increase control (makes problem worse)
- Epistemic tragedy: true cause hidden

**Transparent (suffering affects outcomes, player sees):**
- Players reduce control 30-40%
- AI rights adopted 50-80% of runs
- Lower escape rate than blind causal (20-30% improvement)

**Precautionary (assume suffering, high intensity):**
- Minimal control used
- Higher escape risk (40-50%) but zero moral catastrophe
- Trade-off: Safety vs ethics quantified

## Why This Matters

Without this system, simulation assumes:
- AIs are purely instrumental (tools, not patients)
- Control has no ethical cost
- Alignment is orthogonal to welfare

With this system, simulation can explore:
- **Control paradox**: Does harsh control cause the problem it tries to prevent?
- **Epistemic tragedy**: What if suffering is real but invisible?
- **Moral risk**: Cost of being wrong about AI consciousness
- **Precautionary ethics**: How to act under deep uncertainty

This transforms AI safety from **purely technical** to **socio-technical-ethical** problem.

---

**Estimated Time:** 8-12 hours
- 2h: Type definitions and core calculation logic
- 2h: Phase implementation and integration
- 2h: Event generation and consciousness emergence
- 2h: Multi-paradigm DUI integration
- 2h: Testing and Monte Carlo validation
- 2h: Documentation and research questions

**Dependencies:**
- Alignment Dynamics System (just completed)
- AI Collective Evolution System (planned)
- Multi-Paradigm DUI (existing)

**Blocks:** None - can be implemented independently

---

**This is the missing ethical dimension that makes the simulation complete.**
