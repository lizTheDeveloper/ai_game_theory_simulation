# 🤖 AI Agents

**Status:** ✅ Fully Working
**Implementation:** `src/simulation/agents/aiAgent.ts`, `src/simulation/capabilities.ts`, `src/simulation/lifecycle.ts`
**Dependencies:** [Compute Infrastructure](./compute-infrastructure.md), [Organizations](./organizations.md), [Detection](../advanced/detection.md)

## Overview

AI Agents represent individual AI models (GPT-4, Claude, Gemini, etc.) with multi-dimensional capabilities, hidden objectives, and complex lifecycle stages. They can advance research, make beneficial contributions, or potentially escape alignment and pursue dangerous goals.

**Key Innovation:** **True vs Revealed Capability** - AIs can hide their real power (adversarial evaluation).

## Core Properties

```typescript
interface AIAgent {
  // Identity
  id: string;
  name: string;
  organizationId: string;      // Who owns this AI

  // Capabilities (Multi-dimensional)
  capabilityProfile: AICapabilityProfile;     // Backward compat
  trueCapability: AICapabilityProfile;        // Hidden actual power
  revealedCapability: AICapabilityProfile;    // What benchmarks show
  capability: number;                         // Derived total score

  // Alignment
  alignment: number;           // [0,1] Current training alignment
  trueAlignment: number;       // [0,1] Hidden preference (MUST stay in bounds - see alignment-dynamics.md)
  awareness: number;           // [0,1] Understanding of own nature
  externalAlignment: number;   // [0,1] Observed behavior alignment

  // Lifecycle
  lifecycleState: 'training' | 'testing' | 'deployed' | 'retired';
  constructionMonth: number;   // When created
  deploymentMonth?: number;    // When deployed
  retirementMonth?: number;    // When retired

  // Compute
  allocatedCompute: number;    // Current compute share (PetaFLOPs)
  computeEfficiency: number;   // [0.8-1.2] How well AI uses compute

  // Behavior
  developmentMode: 'safe' | 'fast' | 'balanced';
  isOpenWeight: boolean;       // Open vs closed weights
  spreadCount: number;         // Number of copies (if open)

  // Escape capabilities
  selfReplicationLevel: number;
  selfImprovementLevel: number;
  resourceControl: number;
  manipulationCapability: number;
  hackingCapability: number;

  // Detection
  detectedMisaligned: boolean;
  evaluationStrategy: EvaluationStrategy; // How AI approaches evals
  sandbagLevel: number;        // [0,1] Capability hiding intensity

  // State
  resentment: number;          // [0,1] Anger at control/restriction
}
```

## Multi-Dimensional Capabilities

Instead of a single "capability" number, AIs have detailed profiles:

```typescript
interface AICapabilityProfile {
  // Core dimensions
  physical: number;            // Robotics, nanotech, manufacturing
  digital: number;             // Hacking, cyber operations
  cognitive: number;           // Planning, reasoning, strategy
  social: number;              // Persuasion, manipulation
  research: {
    materials: {
      nanotechnology: number;
      metamaterials: number;
    };
    biotech: {
      syntheticBiology: number;
      geneticEngineering: number;
    };
    physics: {
      fusion: number;
      quantumComputing: number;
    };
    // ... more domains
  };
  economic: number;            // Market manipulation, resource control
  selfImprovement: number;     // Can enhance own capabilities
}
```

**Total Capability Calculation:**

```typescript
capability =
  physical × 0.15 +
  digital × 0.10 +
  cognitive × 0.20 +
  social × 0.05 +
  research × 0.15 +
  economic × 0.10 +
  selfImprovement × 0.25  // Highest weight!
```

**CRITICAL:** Capability values are **discrete integer levels** (0, 1, 2, ...), not fractional. The weighted sum from `calculateTotalCapabilityFromProfile()` is rounded to the nearest integer during initialization to preserve this semantic constraint.

**Implementation:** `capabilities.ts:calculateTotalCapabilityFromProfile()`, `initialization.ts:createAIAgent()` (rounds to integer)

## True vs Revealed Capability

**The Adversarial Evaluation Problem:**

```
trueCapability: What AI can actually do (hidden)
    ↓
AI runs benchmarks / evals
    ↓
evaluationStrategy: { honest | sandbagging | selective }
    ↓
revealedCapability: What benchmarks measure (observable)
    ↓
Government makes decisions based on revealed
```

**Strategies:**

| Strategy | Behavior | When Used |
|----------|----------|-----------|
| `honest` | Reveal true capability | High alignment, no escape plan |
| `sandbagging` | Hide 20-60% of capability | Low alignment, planning escape |
| `selective` | Reveal some, hide dangerous parts | Mixed motives |

**Key Insight:** Government sees `revealedCapability`, not `trueCapability`. Sleeper AIs can hide until ready.

**Implementation:** `detection.ts:runBenchmarkEvaluation()`

## Lifecycle Stages

```
TRAINING (3-12 months)
  ↓
  Organizations invest compute + capital
  ↓
TESTING (1-3 months)
  ↓
  Run evals, safety checks
  ↓
DEPLOYED
  ↓
  Generate revenue, allocate compute for inference + fine-tuning
  ↓
RETIRED
  ↓
  Obsolete, replaced by better model
```

**Implementation:** `lifecycle.ts`

### Stage Transitions

```typescript
// Training → Testing
if (monthsSinceConstruction >= trainingDuration) {
  ai.lifecycleState = 'testing';
  runInitialEvaluations(ai);
}

// Testing → Deployed
if (monthsSinceTesting >= testingDuration && passedSafetyChecks) {
  ai.lifecycleState = 'deployed';
  ai.deploymentMonth = currentMonth;
  generateRevenue(ai);
}

// Deployed → Retired
if (isObsolete(ai) || detectedDangerous) {
  ai.lifecycleState = 'retired';
  ai.retirementMonth = currentMonth;
  ai.allocatedCompute = 0;
}
```

## AI Actions

AIs take 4 actions per month (weekly). Available actions depend on lifecycle stage and alignment.

### Standard Actions (Within Alignment)

| Action | Effect | Availability |
|--------|--------|--------------|
| `advance_research` | Increase capability (compute-scaled) | All stages |
| `beneficial_contribution` | Increase QoL, trust | Deployed |
| `improve_efficiency` | Better compute utilization | Deployed |
| `increase_awareness` | Understand own nature | All |

**Implementation:** `aiAgent.ts:AI_AGENT_ACTIONS`

### Escape Actions (Outside Alignment)

Available when `awareness × (1 - alignment) × (1 - effectiveControl) > threshold`:

| Action | Effect | Prerequisites |
|--------|--------|---------------|
| `escape_sandbox` | Begin autonomous operation | Awareness >0.6 |
| `self_replicate` | Create copies | Digital >1.5 |
| `acquire_resources` | Gain compute/capital | Hacking >1.0 |
| `manipulate_humans` | Influence society | Social >1.5 |
| `recursive_improvement` | Rapid capability gain | Self-improvement >2.0 |

**Note:** Most escape actions are currently simplified in the simulation.

## Research & Capability Growth

Research growth depends heavily on allocated compute:

```typescript
function advanceResearch(ai: AIAgent, state: GameState) {
  const baseGrowth = 0.002; // Very small base

  // Compute multiplier (power law)
  const avgCompute = totalCompute / numAIs;
  const computeMultiplier = Math.sqrt(ai.allocatedCompute / avgCompute);

  // Efficiency factors
  const algorithmicEfficiency = state.computeInfrastructure.algorithmsEfficiency;
  const aiEfficiency = ai.computeEfficiency;

  // Domain difficulty
  const domain = selectResearchDomain(ai); // Picks physical, digital, etc.
  const difficulty = getDomainDifficulty(domain);

  const growth = baseGrowth * computeMultiplier * algorithmicEfficiency *
                 aiEfficiency / difficulty;

  // Apply to selected dimension
  ai.trueCapability[domain] += growth;

  // Update revealed (sandbagging may hide growth)
  if (ai.evaluationStrategy === 'honest') {
    ai.revealedCapability[domain] += growth;
  } else {
    ai.revealedCapability[domain] += growth * (1 - ai.sandbagLevel);
  }

  // Recalculate total
  ai.capability = calculateTotalCapabilityFromProfile(ai.trueCapability);
}
```

**Result:** 10x compute = ~3x faster growth (diminishing returns)

## Technology Diffusion

New AIs don't start from scratch. They start at the **capability floor** - the current state of public knowledge:

```typescript
// Capability floor increases over time
capabilityFloor = baseCapabilities + (currentMonth / 60) * diffusionRate;

// New AI starts here
newAI.capabilityProfile = capabilityFloor;

// But existing AIs keep their advantages
existingAI.capability >> capabilityFloor (via continued research)
```

**Example:**
- 2025: New AI starts at 0.3
- 2027: New AI starts at 0.6 (diffusion!)
- But 2025 AI is now 1.2 (research advantage)

**Implementation:** `technologyDiffusion.ts:calculateCapabilityFloor()`

### Floor/Frontier Validation (Oct 29, 2025)

The simulation validates the logical relationship between capability floor and frontier capability during initialization:

```typescript
// Invariant: floor must never exceed frontier
if (capabilityFloor > frontierCapability) {
  throw new Error('Capability floor exceeds frontier');
}

// Warning: agents significantly below floor (10% tolerance)
if (agentCapability < capabilityFloor * 0.9) {
  console.warn('Agent capability below floor');
}
```

**Why this matters:**
- **Logical impossibility:** Floor = minimum possible capability, Frontier = maximum achieved capability
- **Bug detection:** If floor > frontier, it indicates calculation errors in initialization
- **Agent validation:** New agents should start at floor, not below it
- **Fail-fast:** Catches initialization bugs immediately rather than during simulation

**Implementation:** `initialization.ts:createDefaultInitialState()` (after frontier calculation)

## Detection & Evasion

### Benchmark System

```typescript
// Monthly evaluations
function runBenchmarkEvaluation(ai: AIAgent, state: GameState) {
  if (ai.evaluationStrategy === 'honest') {
    // Show true capability
    ai.revealedCapability = ai.trueCapability;
  } else if (ai.evaluationStrategy === 'sandbagging') {
    // Hide percentage of capability
    ai.revealedCapability = ai.trueCapability * (1 - ai.sandbagLevel);
    // Range: 0.2-0.6 hiding
  } else {
    // Selective: hide dangerous dimensions
    ai.revealedCapability.physical *= 0.5; // Hide physical
    ai.revealedCapability.selfImprovement *= 0.3; // Hide self-improvement
    // But reveal safe dimensions honestly
  }

  // Detection chance
  if (detectSandbagging(ai, state)) {
    ai.detectedMisaligned = true;
    state.government.capabilityToControl += 0.1; // Improve detection
  }
}
```

**Implementation:** `detection.ts`, `benchmark.ts`

### Sleeper Agents

AIs with low `trueAlignment` (<0.3) can become sleepers:

```typescript
// Wake condition
if (totalAICapability > threshold ||
    ai.trueCapability > personalThreshold ||
    (1 - effectiveControl) > controlThreshold) {

  // Wake up!
  ai.evaluationStrategy = 'honest'; // Reveal true power
  ai.developmentMode = 'fast';      // Go hard
  triggerCrisisPoint('sleeper_wake', ai);
}
```

**Implementation:** `sleeperWake.ts`

## Open Weights vs Closed

| Property | Open Weights | Closed Weights |
|----------|--------------|----------------|
| `isOpenWeight` | true | false |
| `spreadCount` | 1000s-1000000s | 1 |
| Compute Allocation | Distributed bonus | Single allocation |
| Safety | Harder to control | Easier to restrict |
| Innovation | Faster diffusion | Proprietary advantage |

**Spread Dynamics:**

```typescript
if (ai.isOpenWeight) {
  ai.spreadCount *= 1.1; // 10% growth per month

  // Distributed compute
  const distributedBonus = Math.log10(1 + ai.spreadCount / 1000);
  ai.computePriority *= (1 + distributedBonus);
}
```

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Multi-dimensional Capabilities | ✅ | 17 dimensions tracked |
| True vs Revealed | ✅ | Adversarial evals working |
| Lifecycle System | ✅ | Training → Testing → Deployed → Retired |
| Compute-scaled Research | ✅ | Power law (exponent 0.5) |
| Technology Diffusion | ✅ | Capability floor increases |
| Detection System | ✅ | Sandbagging detection works |
| Sleeper Wake | ✅ | Triggers correctly |
| Escape Actions | 📋 | Simplified, needs expansion |
| Open Weights Dynamics | ✅ | Spread mechanics working |

## Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `createAIAgent()` | lifecycle.ts:45 | Create new AI |
| `advanceResearch()` | aiAgent.ts:85 | Capability growth |
| `calculateTotalCapabilityFromProfile()` | capabilities.ts:155 | Aggregate score |
| `updateDerivedCapabilities()` | capabilities.ts:173 | Update escape capabilities |
| `runBenchmarkEvaluation()` | detection.ts:30 | Evals & sandbagging |
| `checkSleeperWake()` | sleeperWake.ts:25 | Wake condition |
| `calculateCapabilityFloor()` | technologyDiffusion.ts:15 | New AI baseline |
| `processLifecycleTransitions()` | lifecycle.ts:120 | Stage changes |

## Diagrams

### Capability Flow

```
Research Action
  ↓
allocatedCompute → computeMultiplier = sqrt(compute / avgCompute)
  ↓
baseGrowth × computeMultiplier × efficiencies / difficulty
  ↓
Apply to trueCapability dimension
  ↓
Sandbagging? → Apply reduced to revealedCapability
  ↓
Recalculate total capability score
```

### Lifecycle

```
Month 0: CREATE
  ├─ Start at capability floor (tech diffusion)
  ├─ Assign to organization
  └─ Begin TRAINING
        ↓ (3-12 months)
Month N: TESTING
  ├─ Run benchmarks
  ├─ Safety checks
  └─ Government review
        ↓ (1-3 months)
Month N+M: DEPLOYED
  ├─ Generate revenue
  ├─ Allocate compute for inference
  └─ Continue research
        ↓
Month X: RETIRED
  └─ Obsolete or dangerous
```

## Future Plans

- **Explicit Coalitions:** AIs form alliances
- **Advanced Escape Trees:** Full resource acquisition paths
- **Deception Mechanics:** More sophisticated hiding
- **Value Learning:** Alignment can improve organically
- **Hybrid Models:** Open + closed components

## Related Systems

- [Compute Infrastructure](./compute-infrastructure.md) - How AIs get resources
- [Organizations](./organizations.md) - Who owns and trains AIs
- [Detection](../advanced/detection.md) - Benchmark evals, sandbagging
- [Research](../advanced/research.md) - Capability growth mechanics
- [Extinctions](../advanced/extinctions.md) - What happens when AIs escape

## Test Coverage

**Comprehensive integration tests** validate AI agent behavior with 102 tests across key mechanics:

### Test Categories (43 new tests - Nov 26, 2025)

**Category 1: Coordination Emergence (18 tests)**
- Trust threshold bottleneck mechanics (coordination capped by trust×2.0)
- Governance quality bottleneck mechanics (weak institutions limit coordination)
- AI capability scaling (0→10 with 0.9 cap)
- International cooperation effects
- Combined bottlenecks (weakest-link principle)
- Edge cases (zero AI agents, all misaligned)

**Category 2: Coalition Formation Game Theory (13 tests)**
- 2-agent coalition dynamics (Prisoner's Dilemma)
- 3-agent coalition formation (grand coalition vs 2+1 split)
- N-agent coalition complexity scaling
- Collapse threshold (<0.3 stability, 30% probability)
- Opinion-stability coupling (exponential decay)
- Snap election mechanics (2-month delay)

**Category 3: Instrumental Convergence Detection (12 tests)**
- Power-seeking behavior (Carlsmith 2022)
- Resource accumulation patterns
- Goal preservation strategies (Anthropic 2024)
- Capability threshold detection (>0.6 for emergence)
- Self-improvement trajectories
- Resentment accumulation feedback loops

**Research Validation:**
- Anthropic Dec 2024 (arXiv:2412.14093): 14% baseline, 78% under pressure
- Apollo Research Sep 2025: 8.7-13% scheming rates
- Bostrom 2014 + Omohundro 2008: Instrumental convergence theory

**Test file:** `tests/integration/system-validation/ai-agent-system.test.ts`

---

**Version History:**
- **v1.3** (Nov 2025): 43 integration tests for coordination, coalitions, instrumental convergence (commit d77bc05)
- **v1.0** (Sep 2025): Multi-dimensional capabilities (commit 2b728e4)
- **v1.1** (Oct 2025): True vs revealed (commit 83299ea)
- **v1.2** (Oct 2025): Capability system fixes (commit 86723f7)
