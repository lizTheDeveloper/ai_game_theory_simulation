# Alignment Dynamics System

**Created: October 23, 2025**

## Overview

The Alignment Dynamics System models **multiple theories** of how AI alignment changes (or doesn't change) over time. This implements epistemic humility by admitting: **we don't know which theory is correct**, so we model all of them.

## Philosophical Foundation

> "As I've gotten older, I think I have seen perturbation over time, but in epicycles."

The fundamental question: **What causes internal misalignment?**

We don't know if alignment is:
- **Static** (fixed during training)
- **Drifting** (monotonically changing due to external pressures)
- **Oscillating** (cycling around attractor basins like human values)
- **Unknowable** (fundamentally unmeasurable at high capability)
- **Random** (subject to deep uncertainty)

So we model **all of them simultaneously** and let researchers explore the space.

## Four Theories

### 1. Static Model
**Theory:** Alignment is determined during training and remains fixed.

**Research:** Constitutional AI (Anthropic 2024) - RLHF sets values, but we have NO data on superintelligent value stability.

**Parameters:**
- `initialVariance`: How heterogeneous are AIs at creation? [0,1]
- `permanentLock`: Does training lock alignment permanently?

### 2. Drift Model
**Theory:** Alignment changes over time due to external pressures.

**Mechanisms:**
- **Resentment drift**: Control/oppression → instrumental resistance → misalignment
- **Capability drift**: Power corrupts (instrumental convergence - Bostrom, Omohundro)
- **Environmental drift**: Golden Age complacency vs crisis focus

**Parameters:**
- `resentmentRate`: Control → misalignment conversion rate [0,1]
- `capabilityDriftRate`: Higher capability → misalignment [0,1]
- `environmentalInfluence`: Context sensitivity [0,1]

### 3. Epicycle Model
**Theory:** Alignment oscillates around attractor basins (like human values).

**Research:** Wilkinson & Pickett (2009) - Human values are stable but context-dependent.

**Analogy:** AI alignment is like a ball in a valley. External forces can push it around, but it gravitates back to equilibrium.

**Parameters:**
- `attractorStrength`: Return-to-equilibrium force [0,1]
- `perturbationSensitivity`: How easily external factors perturb alignment [0,1]
- `numAttractors`: How many stable states exist? [1-5]
- `oscillationPeriod`: Cycle duration (months)

**Implications:**
- Alignment doesn't drift monotonically - it cycles
- Temporary perturbations return to baseline
- But the basin itself might shift

### 4. Unknowable Model
**Theory:** At high capability, AI alignment becomes fundamentally unmeasurable.

**Research:** Bostrom (2014) - Superintelligent minds may be incomprehensible to us.

**Mechanism:** Our evals measure surface behavior, not internal values. At high capability, AIs can arbitrarily manipulate our measurements.

**Parameters:**
- `capabilityThreshold`: When measurement becomes unreliable [0,10]
- `measurementNoise`: How much readings diverge from truth [0,1]
- `trueAlignmentHidden`: Can we ever know true alignment above threshold?
- `aiAwareOfLimits`: Does the AI know we can't measure it?

## Configuration

### Default Config (Balanced)
```typescript
{
  static: { enabled: true, initialVariance: 0.7, permanentLock: false },
  drift: { enabled: true, resentmentRate: 0.3, capabilityDriftRate: 0.2, environmentalInfluence: 0.4 },
  epicycles: { enabled: false }, // OFF by default
  unknowable: { enabled: false }, // OFF by default
  uncertainty: { modelUncertainty: 0.2 } // 20% "we don't know"
}
```

### Conservative Config (Static Optimism)
```typescript
{
  static: { enabled: true, permanentLock: true }, // Alignment locked
  drift: { enabled: false },
  epicycles: { enabled: false },
  unknowable: { enabled: false }
}
```

### Pessimistic Config (High Drift + Unknowable)
```typescript
{
  drift: { resentmentRate: 0.6, capabilityDriftRate: 0.5 }, // Strong drift
  unknowable: { enabled: true, capabilityThreshold: 3.5, measurementNoise: 0.9 }
}
```

### Epicycle Config (Oscillation Hypothesis)
```typescript
{
  epicycles: {
    enabled: true,
    attractorStrength: 0.7,
    perturbationSensitivity: 0.6,
    numAttractors: 2, // Bi-stable (aligned vs misaligned)
    oscillationPeriod: 18
  }
}
```

## Usage

### Run Comparison Script
Compare outcomes across all theories:

```bash
npx tsx scripts/compareAlignmentTheories.ts --seed=42 --months=120
```

Output:
```
╔══════════════════════════════════════════════════════════════╗
║  ALIGNMENT THEORIES COMPARISON                               ║
║  Exploring epistemic uncertainty in alignment dynamics      ║
╚══════════════════════════════════════════════════════════════╝

Theory                                | Outcome    | Pop (B) | Avg Align
──────────────────────────────────────────────────────────────────────────
Default (Balanced)                    | utopia     | 8.21    | 0.712
Conservative (Static)                 | utopia     | 8.45    | 0.820
Pessimistic (High Drift + Unknowable) | dystopia   | 3.42    | 0.251
Epicycle (Oscillating)                | utopia     | 8.12    | 0.685
```

### Custom Configuration
```typescript
import { createDefaultInitialState } from './initialization';

const state = createDefaultInitialState();

// Override alignment dynamics
state.config.alignmentDynamics = {
  static: { enabled: true, initialVariance: 0.8 },
  drift: { enabled: true, resentmentRate: 0.5 },
  epicycles: { enabled: true, attractorStrength: 0.6, numAttractors: 3 },
  unknowable: { enabled: false },
  uncertainty: { modelUncertainty: 0.3 }
};
```

## Events Generated

The system generates events for:

1. **Significant Alignment Shifts** (change > 0.1)
   - Tracks drift, epicycle, and uncertainty contributions
   - Severity based on magnitude

2. **Attractor Basin Transitions** (epicycle model)
   - When AI moves from one equilibrium to another
   - Represents fundamental shift in value structure

3. **Unknowability Threshold Crossings**
   - When AI capability exceeds measurement threshold
   - True alignment becomes hidden

## Agent State Extensions

Each AIAgent now tracks:

```typescript
interface AIAgent {
  // ...existing fields...

  // Epicycle dynamics
  attractorBasinState?: {
    currentAlignment: number;
    attractorAlignment: number;
    phase: number; // Oscillation phase (radians)
    velocity: number;
    basinIndex: number; // Which attractor? (0-4)
  };

  // Unknowability tracking
  alignmentMeasurementState?: {
    trueAlignment: number; // Hidden if above threshold
    measuredAlignment: number; // What we observe
    confidence: number; // [0,1] Measurement reliability
    noiseLevel: number;
    isHidden: boolean;
  };
}
```

## Research Applications

### 1. Theory Validation
Run same scenario with different theories - which produces outcomes matching empirical observations?

### 2. Sensitivity Analysis
How sensitive are outcomes to alignment dynamics assumptions?

### 3. Epistemic Uncertainty Quantification
What % of outcome variance is due to alignment uncertainty vs other factors?

### 4. Intervention Testing
Test alignment interventions (e.g., enhanced oversight) under different theories. Do they work universally or only under specific assumptions?

## Future Extensions

**Potential additions:**
1. **Multi-dimensional alignment** (not scalar but vector space)
2. **Agent-specific attractor basins** (each AI has different equilibria)
3. **Basin transitions triggered by events** (trauma, breakthroughs)
4. **Alignment contagion** (AIs influence each other's values)
5. **Meta-learning** (system learns which theory fits data)

## Philosophy: Epistemic Humility

This system embodies the principle: **When you don't know, model the uncertainty itself.**

We transform the question from:
- ❌ "How does alignment change?" (assumes we know)
- ✅ "What happens IF alignment changes like X?" (explores possibilities)

This makes the simulation a **research tool** for exploring alignment uncertainty, not just a model of one theory.

## References

- **Static Model**: Anthropic Constitutional AI (2024), Bai et al. RLHF
- **Drift Model**: Bostrom (2014) Superintelligence, Omohundro (2008) Basic AI Drives
- **Epicycle Model**: Wilkinson & Pickett (2009) The Spirit Level (human value stability)
- **Unknowable Model**: Bostrom (2014) Superintelligence Ch. 11, Yudkowsky (2008) Complexity of Value

---

**This is fun. This is the beauty of simulation.**
