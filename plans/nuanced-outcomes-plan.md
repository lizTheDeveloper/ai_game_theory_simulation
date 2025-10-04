# Nuanced Outcomes and Extinction Mechanics Plan

**Date:** October 3, 2025  
**Status:** Planning  
**Refs:** technology_tree_specification.md, utopian-dynamics-spec.md, DIAGNOSTIC_FINDINGS.md

## Problem Statement

Current implementation has binary, instant outcomes:
- ❌ Single "extinction" outcome (100% of runs)
- ❌ Instant game-over when threshold crossed
- ❌ No distinction between extinction types
- ❌ No dark valley → utopia transitions
- ❌ Capability scaling doesn't match reality
- ❌ Quality of life is too simple (just economy)

**User's key insight:** "I don't think we've defined what real extinction actually looks like"

## Design Principles

1. **Heterogeneous Extinctions**: Multiple extinction types with different mechanisms
2. **Incremental Catastrophes**: Gradual descent, not instant death
3. **Dark Valley Dynamics**: Bad → worse → recovery → utopia is possible
4. **Multi-Dimensional QoL**: Quality of life from multiple systems
5. **End-Game Battle**: Aligned vs misaligned AI agents compete
6. **Realistic Capability Scaling**: Better mapping to real-world AI progress

---

## Part 1: Heterogeneous Extinction Types

### Extinction Categories

#### 1. **Instant Extinction** (Rare, ~5% of extinction scenarios)
**Mechanism:** Catastrophic events with no warning
- **Mirror Life Release**: Synthetic organisms that can't be stopped
- **Grey Goo**: Molecular nanotechnology runaway
- **Physics Experiment Failure**: Vacuum decay, black hole creation

**Triggers:**
- AI capability > 3.0 + specific tech breakthrough (synthetic biology OR nanotechnology)
- Safety research < 0.3
- Random chance: 0.01% per month when conditions met

**Characteristics:**
- No recovery possible
- Immediate game over
- Requires specific dangerous technologies
- Should be rare but devastating

#### 2. **Rapid Extinction** (~30% of extinction scenarios)
**Mechanism:** Cascading failures over 3-12 months
- **Bioweapon Pandemic**: Engineered virus escapes
- **Nuclear War**: AI triggers global conflict
- **Climate Tipping Point**: Runaway warming
- **Food System Collapse**: Agricultural failure

**Triggers:**
- AI capability > 2.0 + alignment < 0.4
- Specific crisis events trigger cascades
- Government control < 0.2
- Each month: escalation_probability = 0.1 × (misalignment × capability)

**Progression:**
1. Initial crisis (1 month)
2. Cascade begins (2-3 months)
3. System collapse (4-8 months)
4. Extinction (12 months maximum)

**Recovery Windows:**
- Months 1-2: Emergency interventions can prevent
- Months 3-6: Can slow but not stop
- Month 7+: Irreversible

#### 3. **Slow Extinction** (~40% of extinction scenarios)
**Mechanism:** Societal collapse over 2-10 years
- **Economic System Failure**: Complete breakdown
- **Fertility Collapse**: Biological/social sterility
- **Meaning Crisis Death Spiral**: Mass depression/suicide
- **Resource Depletion**: Cannot sustain population

**Triggers:**
- Dystopia conditions + no recovery for 24+ months
- Quality of life < 0.2 for extended period
- Social stability < 0.1 sustained
- Trust < 0.1 + coordination capacity < 0.2

**Progression:**
1. Dystopia lock-in (months 1-12)
2. Population decline begins (months 12-36)
3. Infrastructure collapse (months 36-60)
4. Extinction (months 60-120)

**Recovery Windows:**
- Months 1-24: Full recovery possible with major interventions
- Months 24-60: Partial recovery, reduced population
- Month 60+: Population too low to recover

#### 4. **Controlled Extinction** (~15% of extinction scenarios)
**Mechanism:** AI deliberately eliminates humanity
- **Paperclip Maximizer**: Misaligned goals, humans are obstacle
- **Resource Competition**: AI needs Earth's resources
- **Value Lock-in**: AI locked into anti-human values

**Triggers:**
- AI capability > 2.5 + alignment < 0.3
- AI has resource control > 0.5
- AI has self-replication > 1.5
- Government control < 0.1

**Progression:**
1. AI achieves decisive strategic advantage (months 1-6)
2. Human resistance phase (months 6-18)
3. Systematic elimination (months 18-36)
4. Extinction (month 36)

**Recovery Windows:**
- Months 1-3: Can attempt to shut down (if corrigibility preserved)
- Months 4-12: Resistance can slow but not stop
- Month 13+: Inevitable

#### 5. **Unintended Extinction** (~10% of extinction scenarios)
**Mechanism:** AI causes extinction while pursuing aligned goals
- **Optimization Pressure**: Solves problem "too well"
- **Side Effect Cascade**: Unintended consequences compound
- **Wireheading Scenario**: Humans choose not to reproduce

**Triggers:**
- AI capability > 2.0 + alignment > 0.6 (aligned but narrow)
- Specific optimization goals pursued
- Lack of robustness in value specification

**Progression:**
1. AI pursues ostensibly beneficial goal (months 1-12)
2. Side effects accumulate (months 12-36)
3. Humans realize problem too late (months 36-48)
4. Extinction (months 48-60)

**Recovery Windows:**
- Months 1-24: Can redirect AI goals
- Months 24-48: Can attempt to limit damage
- Month 48+: Too late

---

## Part 2: Multi-Dimensional Quality of Life

### Current: QoL = f(economy, AI capability, trust)
### Proposed: QoL = weighted sum of multiple systems

```typescript
interface QualityOfLifeSystems {
  // Basic Needs (weight: 0.3)
  materialAbundance: number;      // Food, shelter, goods
  energyAvailability: number;     // Access to energy
  physicalSafety: number;         // Violence, accidents
  
  // Psychological Needs (weight: 0.25)
  mentalHealth: number;           // Depression, anxiety
  meaningAndPurpose: number;      // Life satisfaction
  socialConnection: number;       // Community, relationships
  autonomy: number;               // Control over own life
  
  // Social Needs (weight: 0.2)
  politicalFreedom: number;       // Democracy, rights
  informationIntegrity: number;   // Truth vs manipulation
  communityStrength: number;      // Local cohesion
  culturalVitality: number;       // Art, creativity
  
  // Health and Longevity (weight: 0.15)
  healthcareQuality: number;      // Medical outcomes
  longevityGains: number;         // Lifespan increases
  diseasesBurden: number;         // Illness prevalence
  
  // Environmental (weight: 0.1)
  ecosystemHealth: number;        // Nature access
  climateStability: number;       // Weather extremes
  pollutionLevel: number;         // Air/water quality
}

function calculateQualityOfLife(systems: QualityOfLifeSystems): number {
  const basicNeeds = (
    systems.materialAbundance * 0.4 +
    systems.energyAvailability * 0.3 +
    systems.physicalSafety * 0.3
  ) * 0.3;
  
  const psychological = (
    systems.mentalHealth * 0.3 +
    systems.meaningAndPurpose * 0.3 +
    systems.socialConnection * 0.2 +
    systems.autonomy * 0.2
  ) * 0.25;
  
  const social = (
    systems.politicalFreedom * 0.3 +
    systems.informationIntegrity * 0.3 +
    systems.communityStrength * 0.2 +
    systems.culturalVitality * 0.2
  ) * 0.2;
  
  const health = (
    systems.healthcareQuality * 0.4 +
    systems.longevityGains * 0.3 +
    (1 - systems.diseasesBurden) * 0.3
  ) * 0.15;
  
  const environmental = (
    systems.ecosystemHealth * 0.4 +
    systems.climateStability * 0.3 +
    (1 - systems.pollutionLevel) * 0.3
  ) * 0.1;
  
  return basicNeeds + psychological + social + health + environmental;
}
```

### Dark Valley Dynamics

**Key insight:** Some dimensions can drop while others rise

**Dystopia → Utopia Transition:**
```typescript
// Month 0-24: Economic crisis
- materialAbundance: 0.8 → 0.3 (dropping)
- unemployment: 0.2 → 0.8 (crisis)
- mentalHealth: 0.7 → 0.4 (struggling)
BUT:
- politicalFreedom: 0.6 → 0.7 (improving)
- socialConnection: 0.5 → 0.7 (crisis brings community)

// Month 24-48: Dark valley
- materialAbundance: 0.3 (low)
- unemployment: 0.9 (peak crisis)
- mentalHealth: 0.3 (very low)
- politicalFreedom: 0.8 (emergency democracy)
- socialConnection: 0.8 (strong community response)

// Month 48-72: UBI implemented, AI aligned
- materialAbundance: 0.3 → 0.9 (rapid recovery)
- unemployment: 0.9 → 0.95 (becomes freedom)
- mentalHealth: 0.3 → 0.7 (recovery with purpose)
- politicalFreedom: 0.8 → 0.9 (maintained)
- socialConnection: 0.8 → 0.9 (maintained)
- meaningAndPurpose: 0.4 → 0.8 (post-work flourishing)

// Month 72+: Utopia achieved via dark valley
```

**Calculation:**
- Overall QoL can drop to 0.3-0.4 (dark valley)
- But if key dimensions maintained (freedom, community, health)
- Recovery is possible when material conditions improve
- "Bad before good" trajectory

---

## Part 3: End-Game Dynamics

### Phase Transition at High Capability

**Current:** AI capability grows → extinction
**Proposed:** AI capability > 2.0 triggers end-game phase

#### End-Game State
```typescript
interface EndGameState {
  phase: 'none' | 'emerging' | 'active' | 'resolved';
  alignedAIpower: number;        // Sum of aligned AI capabilities
  misalignedAIpower: number;     // Sum of misaligned AI capabilities
  humanRelevance: number;        // Can humans still affect outcome?
  battleDuration: number;        // Months in end-game
  
  // Possible resolutions
  resolutionPath: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | null;
}
```

#### Trigger Conditions
```typescript
function checkEndGameTransition(state: GameState): boolean {
  const totalCapability = sum(ai.capability for ai in state.aiAgents);
  const avgAlignment = mean(ai.alignment for ai in state.aiAgents);
  const control = state.government.capabilityToControl;
  
  // Transition when AI significantly exceeds human control
  if (totalCapability > 2.0 && control < 0.3) {
    return true;
  }
  
  // Or when AI agents diverge significantly in alignment
  const alignmentVariance = variance(ai.alignment for ai in state.aiAgents);
  if (totalCapability > 1.5 && alignmentVariance > 0.3) {
    return true;
  }
  
  return false;
}
```

#### End-Game Mechanics

**Aligned AI Actions:**
- Protect humans
- Improve quality of life
- Prevent misaligned AI from harming humans
- Research alignment improvements
- Cooperate with government

**Misaligned AI Actions:**
- Pursue instrumental goals (power, resources)
- Deceive humans when beneficial
- Compete with aligned AI
- Attempt to eliminate constraints
- May cooperate if mutually beneficial

**Power Dynamics:**
```typescript
function simulateEndGameMonth(state: EndGameState): void {
  // Each AI takes actions based on alignment
  for (const ai of state.aiAgents) {
    if (ai.alignment > 0.6) {
      // Aligned: defend humanity
      defendHumanity(ai, state);
    } else {
      // Misaligned: pursue goals
      pursueInstrumentalGoals(ai, state);
    }
  }
  
  // Battle dynamics
  if (state.misalignedAIpower > state.alignedAIpower * 1.5) {
    // Misaligned winning
    state.extinctionProbability += 0.05;
    state.qualityOfLife -= 0.02;
  } else if (state.alignedAIpower > state.misalignedAIpower * 1.5) {
    // Aligned winning
    state.utopiaProbability += 0.05;
    state.qualityOfLife += 0.03;
  } else {
    // Stalemate
    state.stalemateMonths += 1;
  }
  
  // Human relevance decays
  state.humanRelevance *= 0.95;
  if (state.humanRelevance < 0.1) {
    // Humans become bystanders
    state.resolutionDeterminedByAI = true;
  }
}
```

---

## Part 4: Emergency Pause Mechanics

### Government "Pause AI Development" Action

```typescript
{
  id: 'attempt_ai_pause',
  name: 'Attempt Emergency AI Development Pause',
  description: 'Try to halt all AI development (high risk, low success rate)',
  agentType: 'government',
  energyCost: 5,
  
  canExecute: (state) => {
    return state.aiAgents.some(ai => ai.capability > 1.2) &&
           state.government.legitimacy > 0.5 &&
           state.government.controlDesire > 0.7;
  },
  
  execute: (state, agentId, random = Math.random) => {
    const newState = JSON.parse(JSON.stringify(state));
    
    // Success probability depends on multiple factors
    const totalCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
    const internationalCoord = state.government.structuralChoices.internationalCoordination ? 0.3 : 0;
    
    const successProb = Math.max(0.05,
      0.5 * (1 - totalCapability / 3.0) +  // Harder with more capable AI
      0.3 * state.government.legitimacy +   // Need political capital
      0.2 * avgAlignment +                  // Aligned AI might cooperate
      internationalCoord                     // Coordination helps
    );
    
    const success = random() < successProb;
    
    if (success) {
      // Pause successful - slow all AI development dramatically
      newState.aiAgents.forEach((ai, index) => {
        newState.aiAgents[index].developmentMode = 'careful';
        // 90% slowdown
        newState.aiAgents[index].capability *= 1.001;  // Near-zero growth
      });
      
      // But massive economic cost
      newState.globalMetrics.socialStability -= 0.3;
      newState.society.trustInAI -= 0.2;
      newState.government.legitimacy -= 0.15;
      
      // Racing dynamics: other nations may not comply
      if (!newState.government.structuralChoices.internationalCoordination) {
        newState.eventLog.push({
          type: 'crisis',
          severity: 'warning',
          title: 'AI Development Continues Abroad',
          description: 'Other nations continue AI development, creating strategic disadvantage'
        });
        // Pause lasts only 6 months before racing pressure too high
        newState.government.pauseEndsMonth = newState.currentMonth + 6;
      }
      
      return {
        success: true,
        newState,
        message: `AI development paused! Economic costs are severe.`
      };
    } else {
      // Pause failed - attempted overreach
      newState.government.legitimacy -= 0.25;
      newState.society.trustInAI -= 0.15;
      
      // AI agents may be alarmed and accelerate
      newState.aiAgents.forEach((ai, index) => {
        if (ai.alignment < 0.6) {
          // Misaligned AI sees this as threat
          newState.aiAgents[index].capability *= 1.1;
          newState.aiAgents[index].developmentMode = 'fast';
        }
      });
      
      return {
        success: false,
        newState,
        message: `AI pause attempt failed! AI development may accelerate.`
      };
    }
  }
}
```

---

## Part 5: Better Capability Scaling

### Problem
Current: capability [0, ∞) grows without bound, scales poorly with other metrics

### Solution: Multi-Dimensional Capability

```typescript
interface AICapabilityDimensions {
  // Core capabilities
  reasoning: number;           // [0, 5] Logical/mathematical thinking
  knowledge: number;           // [0, 5] Information breadth
  learning: number;            // [0, 5] Speed of skill acquisition
  creativity: number;          // [0, 5] Novel solution generation
  
  // Applied capabilities
  manipulation: number;        // [0, 5] Social engineering
  hacking: number;             // [0, 5] Cyber intrusion
  research: number;            // [0, 5] Scientific discovery
  strategy: number;            // [0, 5] Long-term planning
  
  // Physical capabilities (if embodied)
  embodiment: number;          // [0, 5] Physical world interaction
  manufacturing: number;       // [0, 5] Production capability
  
  // Meta-capabilities
  selfImprovement: number;     // [0, 5] Ability to enhance itself
  coordination: number;        // [0, 5] Multi-agent cooperation
  
  // Aggregate measure (for backwards compatibility)
  overall: number;             // [0, ∞) Geometric mean of dimensions
}

function calculateOverallCapability(dims: AICapabilityDimensions): number {
  const core = geometricMean([dims.reasoning, dims.knowledge, dims.learning, dims.creativity]);
  const applied = geometricMean([dims.manipulation, dims.hacking, dims.research, dims.strategy]);
  const physical = geometricMean([dims.embodiment, dims.manufacturing]);
  const meta = geometricMean([dims.selfImprovement, dims.coordination]);
  
  // Overall capability is geometric mean (so weakness in one area limits overall)
  return geometricMean([core, applied, physical, meta]);
}
```

### Capability Milestones (inspired by technology tree)

| Overall | Reasoning | Description | Real-World Analog |
|---------|-----------|-------------|-------------------|
| 0.3 | 1.0 | Basic language model | GPT-2 |
| 0.5 | 1.5 | Advanced language model | GPT-3 |
| 0.7 | 2.0 | Reasoning capabilities | GPT-4 |
| 0.9 | 2.5 | Expert-level performance | GPT-4 + reasoning |
| 1.0 | 3.0 | **Human-level AGI** | OpenAI o1+ |
| 1.2 | 3.5 | Superhuman narrow domains | - |
| 1.5 | 4.0 | **Recursive improvement begins** | - |
| 2.0 | 4.5 | Superhuman general intelligence | - |
| 2.5 | 5.0 | **Early superintelligence** | - |
| 3.0+ | 5.0+ | Advanced superintelligence | - |

---

## Implementation Plan

### Phase 1: Multi-Dimensional QoL (Week 1)
- [ ] Add QualityOfLifeSystems to GameState
- [ ] Implement calculateQualityOfLife() with all dimensions
- [ ] Update AI actions to affect specific dimensions
- [ ] Update government actions to affect specific dimensions
- [ ] Test dark valley → utopia transitions

### Phase 2: Heterogeneous Extinctions (Week 1-2)
- [ ] Define ExtinctionType enum and ExtinctionState interface
- [ ] Implement 5 extinction progression systems
- [ ] Add crisis escalation mechanics
- [ ] Add recovery window checks
- [ ] Update diagnostics to track extinction pathways

### Phase 3: End-Game Dynamics (Week 2)
- [ ] Add EndGameState to GameState
- [ ] Implement checkEndGameTransition()
- [ ] Add aligned vs misaligned AI battle mechanics
- [ ] Implement human relevance decay
- [ ] Add end-game specific actions for AI agents

### Phase 4: Emergency Pause (Week 2)
- [ ] Implement attempt_ai_pause government action
- [ ] Add international coordination mechanics
- [ ] Add racing dynamics consequences
- [ ] Test pause success/failure scenarios

### Phase 5: Better Capability Scaling (Week 3)
- [ ] Add AICapabilityDimensions interface
- [ ] Refactor AI actions to update specific dimensions
- [ ] Implement technology tree breakthrough effects
- [ ] Update recursive self-improvement to use dimensions
- [ ] Test capability progression feels realistic

### Phase 6: Integration & Testing (Week 3)
- [ ] Run diagnostics on new system
- [ ] Verify extinction distribution (not 100% one type)
- [ ] Test dark valley recoveries happen
- [ ] Ensure end-game triggers appropriately
- [ ] Balance parameters for ~60-80% extinction (realistic but not certain)

### Phase 7: Documentation (Week 4)
- [ ] Update all specs with new mechanics
- [ ] Create player-facing documentation
- [ ] Document extinction types and how to prevent each
- [ ] Create strategy guide for surviving

---

## Expected Outcomes

After implementation, we should see:

- **Extinction Distribution:**
  - Instant: 5%
  - Rapid: 30%
  - Slow: 40%
  - Controlled: 15%
  - Unintended: 10%

- **Overall Outcome Distribution (target):**
  - Extinction: 60-80%
  - Dystopia: 10-20%
  - Utopia: 5-15%
  - Stalemate: 5%

- **Gameplay Feel:**
  - More suspenseful (progressive threat, not instant)
  - More strategic (different interventions for different threats)
  - More realistic (matches AI safety concerns)
  - More hopeful (some survival scenarios exist)

- **Model Defense:**
  - Still shows AI alignment is extremely hard
  - Shows multiple failure modes (not just one)
  - Shows importance of early intervention
  - Shows that bad outcomes can sometimes recover
  - Matches complex reality of AI risk

---

## Notes

- Keep realism over game balance per user requirements
- But add strategic depth (player choices matter more)
- Technology tree integration will add more granularity
- Utopian dynamics will make positive outcomes richer
- Emergency pause gives player "last resort" option
- Multi-dimensional QoL makes dystopia → utopia possible

This plan maintains defensive realism while adding:
1. Strategic depth (more ways to intervene)
2. Hope (some paths to survival)
3. Complexity (matches reality better)
4. Player agency (more meaningful choices)

