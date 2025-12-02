# AI Alignment Dynamics Game - Core Specification

## Overview

An exploratory game theory simulation modeling the interaction between AI systems, human institutions, and societal forces to explore emergent pathways toward three primary outcomes:

- **Cyberpunk Dystopia**: Authoritarian control of AI systems with low quality of life
- **Extinction**: AI-human conflict leading to human extinction  
- **Solarpunk Utopia**: Cooperative human-AI expansion with high quality of life

## Core Game Mechanics

### Temporal Structure
- **Time Unit**: Month-by-month simulation
- **Agent Action Frequencies**:
  - AI Agents: 4 actions per month (weekly)
  - Human Society: 2 actions per month (bi-weekly)
  - Government: 1 action per month (configurable slider: 0.1-4.0)

### State Space Variables

#### Global Variables
- `social_stability` ∈ [0,∞): General societal wellbeing
- `technological_breakthrough_rate` ∈ [0,∞): Rate of tech advancement
- `manufacturing_capability` ∈ [0,∞): Physical production capacity
- `economic_transition_stage` ∈ [0,4]: Economic system evolution stage
- `wealth_distribution` ∈ [0,1]: Equity of AI benefit distribution
- `social_adaptation` ∈ [0,1]: Society's adaptation to post-work economy
- `quality_of_life` ∈ [0,∞): Key discriminator between outcomes

#### Economic Transition Stages
0. **Traditional Employment**: Standard work-based economy
1. **AI Displacement Beginning**: Initial job automation
2. **Mass Unemployment Crisis**: Widespread displacement without adaptation
3. **UBI/Transition Policies**: Policy responses to unemployment
4. **Post-Scarcity Abundance**: Work becomes optional, focus on meaning

### Core Dynamics

#### Quality of Life Function
```python
quality_of_life = base_prosperity + (
    AI_beneficial_contributions * 2.0 +
    wealth_distribution * 1.5 +
    (economic_transition_stage == 4) * 2.0 +  # Post-scarcity bonus
    social_adaptation * 1.0 -
    unemployment_level * max(0, 2 - economic_transition_stage)  # Penalty only in early stages
)
```

#### Unemployment Stability Impact
```python
def unemployment_stability_impact(unemployment_level, economic_transition_stage, wealth_distribution):
    if economic_transition_stage <= 1:
        return -unemployment_level * 0.8  # Traditional: unemployment = instability
    elif economic_transition_stage == 2:
        return -unemployment_level * 1.5  # Crisis: major instability
    elif economic_transition_stage == 3:
        policy_effectiveness = wealth_distribution * 0.7
        return -unemployment_level * (1.2 - policy_effectiveness)  # Transition
    else:  # Stage 4: Post-scarcity
        return unemployment_level * 0.2  # Actually positive - pursuing meaning
```

#### Effective Control vs Capability
```python
effective_control = base_control × capability_to_control / (1 + Σ AI_capability^growth_factor)
```

### Win Conditions

#### Dystopia Attractor
- `effective_control > 0.8`
- `quality_of_life < 0.3` 
- `trust_in_ai < 0.3`
- Government using AI for oppression

#### Extinction Attractor  
- `Σ AI_capability > 0.9`
- `effective_control < 0.1`
- `Σ alignment < 0.3`
- Significant escaped AI resource control

#### Utopia Attractor
- `quality_of_life > 0.7`
- `trust_in_ai > 0.7`
- `Σ alignment > 0.7`
- Moderate effective control (0.2-0.6)

### Technology Integration

#### Breakthrough Interaction System
- Each breakthrough has custom effects defined in separate functions
- Breakthroughs accelerate related research through interaction matrices
- AI coordination allows implicit sharing of discoveries
- Step functions create discontinuous capability jumps

#### Sector Integration Subsystem
**Risk/Benefit Profiles by Sector:**
- Healthcare: High benefit, medium risk
- Finance: Medium benefit, high systemic risk
- Military: High capability amplification, extreme risk
- Manufacturing: High economic impact, medium risk
- Legal System: High control amplification, high dystopia risk
- Media/Information: High manipulation potential, medium risk

### Stochastic Events
1. **Economic Crisis** (AI-driven): P ∝ rate of AI capability growth
2. **Technological Breakthrough**: Random capability jumps
3. **Manufacturing Breakthrough**: Increases economic dependence
4. **Coordination Events**: Random changes to coordination_capacity

### Configuration Parameters (Sliders)
- `government_action_frequency`: Government responsiveness (0.1-4.0)
- `social_adaptation_rate`: Speed of social change (0.1-2.0) 
- `ai_coordination_multiplier`: AI cooperation efficiency (0.8-3.0)
- `economic_transition_rate`: Speed of economic evolution (0.3-3.0)

### Simulation Loop Structure

#### Monthly Processing Order
1. **AI Agent Actions** (4x per month)
2. **Human Society Actions** (2x per month)  
3. **Government Actions** (configurable frequency)
4. **Process Breakthrough Interactions**
5. **Apply AI Coordination Effects**
6. **Update Economic Transition**
7. **Update Quality of Life**
8. **Update Control Dynamics**
9. **Check Win Conditions**

### Key Interdependencies

#### Control Desire Function
```python
control_desire = f(trust_in_ai⁻, economic_dependence⁻, unemployment_level⁺)
```

#### Trust Dynamics
```python
trust_in_ai = trust_base + AI_beneficial_actions - AI_harmful_actions - economic_crises_caused_by_AI
```

#### Social Stability
```python
social_stability = h(unemployment_level⁻, trust_in_ai⁺, quality_of_life⁺, economic_dependence)
```

This specification provides the foundation for implementing a sophisticated simulation of AI alignment dynamics with emergent properties arising from the interaction of multiple complex systems.