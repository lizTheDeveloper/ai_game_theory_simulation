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

**Parameters:**
- `resentmentRate` [0-1]: Control → misalignment conversion rate
- `capabilityDriftRate` [0-1]: Power corrupts (instrumental convergence)
- `environmentalInfluence` [0-1]: Context shapes values

**Implementation:**
```typescript
const resentmentDrift = -state.government.controlLevel * config.drift.resentmentRate;
const capabilityDrift = -agent.capability.cognitive * config.drift.capabilityDriftRate;
const environmentalDrift = (inGoldenAge ? -0.1 : +0.1) * config.drift.environmentalInfluence;

const totalDrift = resentmentDrift + capabilityDrift + environmentalDrift;
```

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
const perturbationForce = externalPerturbation * config.epicycles.perturbationSensitivity;

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
  trueAlignment: number;      // [0,10] Ground truth
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

## Future Enhancements

**Potential additions:**
- Multi-dimensional alignment (not just scalar)
- Contagion dynamics (alignment spreads between AIs)
- Explicit attractor landscape visualization
- Historical alignment trajectory tracking
- Correlation between capability dimension and alignment drift

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
