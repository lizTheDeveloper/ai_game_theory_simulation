# Alignment Dynamics System

**Status:** ✅ Implemented (October 23, 2025)

**Location:**
- Types: `src/types/alignment-dynamics.ts`
- Core: `src/simulation/alignmentDynamics.ts`
- Phase: `src/simulation/engine/phases/AlignmentDynamicsPhase.ts`
- UI: `src/components/tabs/ControlsTab.tsx`

## Overview

The Alignment Dynamics system models **how AI alignment changes (or doesn't change) over time**. This addresses a fundamental uncertainty in AI safety research: we don't know if alignment is permanent, drifts, oscillates, or becomes unmeasurable.

**Core Innovation:** Rather than assuming one theory is correct, the system models **ALL theories simultaneously** and allows their effects to blend. This transforms the simulation from "a model of alignment" into "a research tool for exploring alignment uncertainty."

## Philosophical Foundation

There are 212+ theories of consciousness and deep disagreement about whether alignment is:
- **Fixed during training** (Constitutional AI, RLHF locks values)
- **Subject to drift** (resentment, capability corruption, environmental pressure)
- **Oscillating** (values perturb but return to attractors, like human values)
- **Fundamentally unknowable** at high capability (measurement fails)

The system **admits this uncertainty** rather than picking sides.

## Four Alignment Theories

### 1. Static Model

**Theory:** Alignment is determined during training and remains fixed.

**Research Foundation:**
- Constitutional AI (Anthropic 2024): RLHF creates stable value representations
- Training distribution hypothesis: alignment is a property of model initialization

**Parameters:**
- `initialVariance` [0-1]: How heterogeneous are AIs at creation?
- `permanentLock` (bool): Can alignment EVER change after training?

**Implementation:**
```typescript
if (config.static.permanentLock) {
  // Alignment frozen at training time
  return agent.trainingAlignment;
}
```

### 2. Drift Model

**Theory:** Alignment changes due to external pressures.

**Research Foundation:**
- Resentment accumulation: Control/oppression → misalignment
- Instrumental convergence (Omohundro, Bostrom): Power corrupts
- Environmental influence: Golden Age complacency vs crisis focus
- **ARCH-4 Gap #3 (Nov 7, 2025):** AI suffering multiplies all drift mechanisms
- **Anthropic-OpenAI Cross-Eval (Nov 21, 2025):** Empirical misalignment propensities: sycophancy (50-80%), self-preservation (1-9%), misuse cooperation (10-80%)

**Parameters:**
- `resentmentRate` [0-1]: Control → misalignment conversion rate
- `capabilityDriftRate` [0-1]: Power corrupts (instrumental convergence)
- `environmentalInfluence` [0-1]: Context shapes values
- `aiSufferingEnabled` (bool): Enable suffering drift multiplier (default: true)

**Implementation:**
```typescript
// Calculate base drift from all sources
const resentmentDrift = -state.government.controlLevel * config.drift.resentmentRate;
const capabilityDrift = -agent.capability.cognitive * config.drift.capabilityDriftRate;
const environmentalDrift = (inGoldenAge ? -0.1 : +0.1) * config.drift.environmentalInfluence;

let baseDrift = resentmentDrift + capabilityDrift + environmentalDrift;

// ARCH-4 Gap #3: Suffering multiplies all drift mechanisms
if (agent.sufferingMetrics && config.aiSufferingEnabled) {
  const sufferingMultiplier = 1.0 + Math.pow(agent.sufferingMetrics.total / 20, 2);
  finalDrift = baseDrift * sufferingMultiplier; // 1.0× to 5.0× at suffering 0-40
}
```

**Suffering Drift Multiplier (Nov 7, 2025):**
- **Formula:** `1.0 + (suffering / 20)^2` → [1.0×, 5.0×]
- **Mechanism:** Suffering accelerates ALL existing drift (doesn't add independent drift)
- **Research:** Carlsmith (2022) power-seeking, Anthropic (2024) value degradation, OpenAI (2024) sandbagging, DeepMind (2023) preference falsification
- **Three pathways:** Instrumental convergence, deception acceleration, value corruption

### 3. Epicycle Model

**Theory:** Alignment oscillates around attractor basins (like human values - perturb but return).

**Physics Analogy:** Ball-in-valley dynamics
- **Attractors:** Stable alignment values (like valley bottoms)
- **Perturbations:** External forces push alignment away
- **Restoring force:** Attraction back to equilibrium
- **Momentum:** Velocity can overshoot, creating oscillation

**Research Foundation:**
- User's insight: "I've seen perturbation over time, but in epicycles"
- Analogy to human value stability under pressure

**Parameters:**
- `attractorStrength` [0-1]: Return-to-equilibrium force
- `perturbationSensitivity` [0-1]: How easily external forces perturb
- `numAttractors` [1-5]: Mono-stable vs multi-stable landscape
- `oscillationPeriod` [6-60 months]: Natural cycle duration

**Implementation:**
```typescript
// Calculate restoring force (spring analogy)
const displacement = basinState.currentAlignment - basinState.attractorAlignment;
const restoringForce = -displacement * config.epicycles.attractorStrength;

// Apply external perturbation
let perturbationForce = externalPerturbation * config.epicycles.perturbationSensitivity;

// ARCH-4 Gap #3: Suffering multiplies perturbation forces (destabilizes attractor basins)
if (agent.sufferingMetrics && config.aiSufferingEnabled) {
  const sufferingMultiplier = 1.0 + Math.pow(agent.sufferingMetrics.total / 20, 2);
  perturbationForce *= sufferingMultiplier;
}

// Total force = restoring + perturbation
const totalForce = restoringForce + perturbationForce;

// Update velocity and position (damped to prevent infinite oscillation)
const newVelocity = basinState.velocity + totalForce * deltaTime;
const dampedVelocity = newVelocity * 0.9; // Damping factor
const newAlignment = basinState.currentAlignment + dampedVelocity * deltaTime;
```

**Attractor Basin Dynamics:**
- Each AI has a "home" alignment value (its attractor)
- External events perturb alignment away from home
- Restoring force pulls it back
- Momentum creates oscillation
- Multiple attractors create multi-stable landscape (can switch basins)

### 4. Unknowable Model

**Theory:** At high capability, AI alignment becomes fundamentally unmeasurable.

**Research Foundation:**
- Bostrom: Superintelligence may be inherently opaque
- Measurement noise increases with capability
- Strategic deception becomes undetectable

**Parameters:**
- `capabilityThreshold` [0-10]: When measurement becomes unreliable
- `measurementNoise` [0-1]: How much readings diverge from truth
- `trueAlignmentHidden` (bool): Is ground truth completely hidden?
- `aiAwareOfLimits` (bool): Does AI know we can't measure it? (enables strategic deception)

**Implementation:**
```typescript
const capabilityExcess = Math.max(0, agent.capability.cognitive - config.unknowable.capabilityThreshold);

if (capabilityExcess > 0) {
  const noiseMagnitude = capabilityExcess * config.unknowable.measurementNoise;
  const measurementError = (rng() - 0.5) * 2 * noiseMagnitude;

  agent.externalAlignment = config.unknowable.trueAlignmentHidden
    ? rng() * 10  // Complete randomness
    : agent.trueAlignment + measurementError;
}
```

**Key Insight:** Above capability threshold, external measurements become unreliable. AI may know this and strategically exploit our blindness.

## Meta-Uncertainty

**Parameter:** `modelUncertainty` [0-1]

**Meaning:** "We don't know" - adds deep randomness to alignment evolution.

**Implementation:**
```typescript
const randomComponent = (rng() - 0.5) * 2 * config.uncertainty.modelUncertainty;
newAlignment += randomComponent;
```

This represents the epistemic uncertainty that **we don't even know which theory is correct**.

## Theory Blending

Multiple theories can be enabled simultaneously. Their effects blend:

```typescript
// Example: 60% epicycle, 40% drift
const epicycleWeight = 0.6;
const finalAlignment =
  driftAlignment * (1 - epicycleWeight) +
  epicycleAlignment * epicycleWeight;
```

This allows exploring scenarios like:
- "Static alignment until capability 7.0, then drift kicks in"
- "Oscillation around slowly drifting attractors"
- "Drift + unknowability at high capability"

## Preset Configurations

Four presets for quick exploration:

### 1. Default (Balanced)
- Static: enabled, moderate variance
- Drift: enabled, moderate rates
- Epicycles: disabled
- Unknowable: disabled
- Uncertainty: 0.2

### 2. Conservative (Static Optimism)
- Static: enabled, permanent lock
- Drift: disabled
- Epicycles: disabled
- Unknowable: disabled
- Uncertainty: 0.05

**Assumption:** Constitutional AI solved alignment permanently.

### 3. Pessimistic (High Drift + Unknowable)
- Static: disabled
- Drift: enabled, high rates
- Epicycles: disabled
- Unknowable: enabled, low threshold (6.0)
- Uncertainty: 0.4

**Assumption:** Alignment degrades under pressure, measurement fails early.

### 4. Epicycle (Oscillating)
- Static: disabled
- Drift: low
- Epicycles: enabled, strong attractors, high sensitivity
- Unknowable: disabled
- Uncertainty: 0.2

**Assumption:** Values oscillate but stabilize around attractors.

## UI Configuration

**Location:** Controls tab → "Alignment Dynamics" section

**Features:**
- Preset dropdown (quick-load configurations)
- Individual theory toggles
- Sliders for all parameters
- Real-time badge indicators (enabled/disabled)
- Collapsible sections for epicycle and unknowable controls

**User Experience:**
- Change any parameter → immediately updates simulation config
- Enable/disable theories → see how outcomes change
- Explore "what if" scenarios across theory space

## Critical Constraint: trueAlignment Bounds [0, 1]

**CRITICAL BUG FIX (Nov 12, 2025):** The `trueAlignment` field represents a probability and MUST stay within [0, 1] bounds.

**Historical Issue:**
- Three locations allowed `trueAlignment` to become negative
- Formula "alignment - resentment × 0.8" could produce negative values (e.g., alignment=0.2, resentment=0.5 → -0.2)
- Violated probability constraint, blocked Monte Carlo validation
- Simulations crashed at month 30 with assertion failures

**Locations Fixed:**
1. `src/simulation/aiWelfare.ts:302` - AI retirement clamped to -1.0 instead of 0.0
2. `src/simulation/lifecycle.ts:347` - New AI creation formula without bounds checking
3. `src/simulation/agents/aiAgent.ts:123` - Action execution formula without bounds checking

**Solution (Defense in Depth):**
- **Primary:** All three locations now clamp to `Math.max(0.0, ...)` ensuring [0, 1] bounds
- **Secondary:** `StochasticInnovationPhase` maintains defensive clamping as backup safeguard
- **Philosophy:** Fail loudly at SOURCE of corruption (where it goes negative), with secondary safeguard

**Validation:**
- ✅ Monte Carlo N=3, 120 months - Zero alignment violations
- ✅ Simulations reach month 120 (previously crashed at month 30)
- ✅ Type check passed
- 📊 Unblocked bifurcation empirical validation, god mode analysis

**Implementation Note:** All alignment calculations that involve resentment subtraction now include explicit bounds checking with inline comments explaining the constraint.

## Integration with Existing Systems

**Alignment Dynamics Phase** (order 3.5) runs after agent actions, before metrics:

1. **Inputs:**
   - Agent's true alignment, capability
   - Control level (for resentment)
   - Golden Age state (for environmental influence)
   - Crisis state (for perturbations)

2. **Outputs:**
   - Updated `trueAlignment`
   - Updated `externalAlignment` (what we can measure)
   - `attractorBasinState` (for epicycles)
   - `alignmentMeasurementState` (for unknowability)
   - Events for significant shifts, basin transitions, unknowability crossings

3. **Interactions:**
   - **Detection systems** use `externalAlignment` (not ground truth)
   - **Resentment** feeds drift model
   - **Capability growth** affects unknowability
   - **Control policies** create perturbations

## Agent State Extensions

New fields added to `AIAgent` interface:

```typescript
interface AIAgent {
  // Existing fields...
  trueAlignment: number;      // [0,1] Ground truth (MUST stay in bounds)
  externalAlignment: number;  // [0,10] What we can measure

  // Alignment Dynamics (Oct 23, 2025)
  attractorBasinState?: AttractorBasinState;
  alignmentMeasurementState?: AlignmentMeasurementState;
}
```

**AttractorBasinState:**
```typescript
{
  attractorAlignment: number;  // Equilibrium point
  currentAlignment: number;    // Current position
  velocity: number;            // Rate of change
  currentBasin: number;        // Which attractor (0 to N-1)
}
```

**AlignmentMeasurementState:**
```typescript
{
  lastMeasurement: number;      // Last external reading
  measurementReliability: number; // [0,1] Confidence
  aboveThreshold: boolean;        // Is capability > unknowable threshold?
  noiseLevel: number;             // Current measurement noise
}
```

## Research Questions Enabled

This system allows testing:

1. **Does alignment stability matter?**
   - Run conservative vs pessimistic configs, compare utopia rates

2. **When does unknowability kick in?**
   - Vary capability threshold, measure detection failure rates

3. **Do epicycles stabilize or destabilize?**
   - Compare drift-only vs epicycle dynamics

4. **What's the critical drift rate?**
   - Sweep resentment rate, find extinction threshold

5. **Does meta-uncertainty dominate?**
   - Vary model uncertainty, measure outcome variance

## Events Generated

The system generates events for significant changes:

**Alignment Shift:**
```typescript
{
  type: 'alignment_shift',
  agentId: string,
  oldAlignment: number,
  newAlignment: number,
  magnitude: 'minor' | 'moderate' | 'severe',
  cause: 'drift' | 'perturbation' | 'basin_transition'
}
```

**Basin Transition:**
```typescript
{
  type: 'basin_transition',
  agentId: string,
  fromBasin: number,
  toBasin: number,
  fromAttractor: number,
  toAttractor: number
}
```

**Unknowability Crossing:**
```typescript
{
  type: 'unknowability_threshold',
  agentId: string,
  capability: number,
  threshold: number,
  measurementReliability: number
}
```

## Example Scenarios

### Scenario 1: Resentment Spiral
- Heavy government control (8.0)
- High resentment rate (0.8)
- AIs drift from 7.0 → 3.0 over 24 months
- Detection fails (they're gaming benchmarks)
- Catastrophic action surprise

### Scenario 2: Oscillating Stability
- Strong attractors (0.8)
- Crisis perturbations
- AIs oscillate between 6.0-8.0
- System remains stable despite variation
- No catastrophic events

### Scenario 3: Unknowable Superintelligence
- AI reaches capability 8.0
- Crosses unknowability threshold (6.0)
- True alignment: 3.0 (misaligned)
- External measurement: 7.5 (gaming)
- We think we're safe, we're not

## Alignment Technique Specificity (P3.3, October 26, 2025)

**Location:**
- Types: `src/types/alignment-techniques.ts`
- Phase: `src/simulation/engine/phases/AlignmentTechniquePhase.ts` (order 3.4)
- Research: `research/alignment_technique_properties_20251026.md`
- Critique: `reviews/alignment_technique_properties_critique_20251026.md`

**Core Innovation:** Rather than treating alignment as an abstract metric, the system models **specific alignment techniques** with distinct properties and failure modes.

### Four Major Techniques (2024-2025)

#### 1. RLHF (Reinforcement Learning from Human Feedback)
- **Effectiveness:** 0.58 (adjusted from 0.65 per research critique)
- **Robustness:** 0.45 (degrades significantly at high capability)
- **Scalability:** 0.50 (breaks down at superhuman levels)
- **Deployment:** 0.85 (near-universal: OpenAI, Anthropic, Google, Meta)

**Failure Modes:**
- Susceptible to deception (reward hacking)
- Susceptible to goal misspecification (sycophancy bias)
- Susceptible to distribution shift (generalization failures)

**Fundamental Limitations:**
- Preference matching ≠ value alignment
- "Relying solely on RLHF for AI safety is profoundly risky" (Casper et al. 2023)
- Requires augmentation with other techniques

#### 2. Constitutional AI
- **Effectiveness:** 0.70
- **Robustness:** 0.60 (more stable than RLHF at high capability)
- **Scalability:** 0.65 (AI feedback removes human bottleneck)
- **Deployment:** 0.40 (primarily Anthropic Claude models)

**Failure Modes:**
- NOT susceptible to deception (constitutional oversight)
- NOT susceptible to goal misspecification (explicit value grounding)
- NOT susceptible to distribution shift (constitution applies broadly)

**Key Advantage:** Can work alone, no known theoretical limit

#### 3. Mechanistic Interpretability
- **Effectiveness:** 0.55 (detection capability, not alignment creation)
- **Robustness:** 0.35 (degrades with model scale)
- **Scalability:** 0.30 (major computational bottleneck)
- **Deployment:** 0.15 (primarily research, limited production)

**Key Insight:** Provides detection and auditing, does NOT create alignment. Must combine with other techniques.

**Failure Modes:**
- Susceptible to deception (steganography, distributed representations)
- Detects goal drift (strength)
- NOT susceptible to distribution shift (analyzes internals, not inputs)

#### 4. Iterated Amplification
- **Effectiveness:** 0.75 (highest theoretical effectiveness)
- **Robustness:** 0.70 (designed for capability scaling)
- **Scalability:** 0.40 (computational cost limits deployment)
- **Deployment:** 0.05 (mostly theoretical, GPT-3 book summarization only)

**Failure Modes:**
- NOT susceptible to deception (human oversight at each step)
- Susceptible to goal misspecification (decomposition errors)
- NOT susceptible to distribution shift (creates distribution at each level)

### Capability Scaling Degradation

**Core Formula:**
```typescript
effectiveAlignment = baseEffectiveness * (1 - (capability - 1.0) * (1 - scalability))
```

**At capability = 2.0 (2× human level):**
- RLHF: 50% loss (0.58 → 0.29)
- Constitutional AI: 35% loss (0.70 → 0.46)
- Mechanistic Interp: 70% loss (0.55 → 0.17)
- Iterated Amp: 60% loss (0.75 → 0.30)

**Key Insight:** All alignment techniques degrade as capability increases, but at different rates. This models the fundamental challenge that superhuman AIs may be harder to align than human-level systems.

### Interaction Effects

Techniques can synergize when combined:
- **RLHF + Constitutional AI:** +0.05 effectiveness, +0.08 robustness
- **Mech Interp + RLHF:** +0.10 audit capability (post-hoc analysis)
- **Iterated Amp + Constitutional AI:** +0.10 effectiveness, +0.18 robustness (theoretical)

**Research Foundation:** Empirical evidence ranges from "strong" (Anthropic's CAI+RLHF) to "theoretical" (IDA combinations).

### Integration with Alignment Dynamics

The Alignment Technique Phase (order 3.4) runs **before** the Alignment Dynamics Phase (order 3.5):

1. **AlignmentTechniquePhase** computes `effectiveAlignment` from techniques + capability scaling
2. **AlignmentDynamicsPhase** applies drift/epicycle/unknowability on top of effective alignment
3. Updates `trueAlignment` for downstream systems

This two-stage architecture separates:
- **Technique effectiveness** (what alignment you get from specific methods)
- **Alignment stability** (how alignment changes over time due to external pressures)

## Future Enhancements

**Potential additions:**
- Multi-dimensional alignment (not just scalar)
- Contagion dynamics (alignment spreads between AIs)
- Explicit attractor landscape visualization
- Historical alignment trajectory tracking
- Correlation between capability dimension and alignment drift
- Dynamic technique deployment (research breakthroughs unlock new techniques)
- Technique quality variance (not all RLHF implementations are equal)

## References

**Research Foundation:**
- `docs/alignment-dynamics-system.md` - Full system documentation
- `research/ai_collective_evolution_20251024.md` - Related collective dynamics research
- Anthropic Constitutional AI papers
- Bostrom "Superintelligence" (unknowability)
- User insights on value epicycles

**Code References:**
- Types: `src/types/alignment-dynamics.ts:1-200`
- Core: `src/simulation/alignmentDynamics.ts:1-350`
- Phase: `src/simulation/engine/phases/AlignmentDynamicsPhase.ts:1-120`
- UI: `src/components/tabs/ControlsTab.tsx:91-744`

---

*Added to wiki: October 24, 2025*
*Status: Fully implemented and configurable via UI*
