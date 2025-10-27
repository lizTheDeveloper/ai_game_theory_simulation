# Technology Tree and Breakthrough System

## Overview

The technology tree represents the granular breakthroughs required for AI superintelligence, based on research from OpenAI, Apollo Research, METR, and current AI development trajectories. Each breakthrough has custom effects and accelerates related research through interaction matrices.

---

## 🆕 Multi-Dimensional Capability System (Phase 2.5 Update)

**NOTE:** This section added Oct 2025 to integrate with heterogeneous extinction system and multi-dimensional QoL.

### Capability Dimensions Replace Single "Capability" Number

Instead of `ai.capability` as a single number, AI agents now have a **capability profile**:

```typescript
export interface AICapabilityProfile {
  // Physical World Impact (robotics, manufacturing, biotech deployment)
  physical: number;           // [0,10] Enables: bioweapon deployment, geoengineering, physical control
  
  // Digital Systems (hacking, infrastructure, cybersecurity)
  digital: number;            // [0,10] Enables: nuclear launch, grid control, financial manipulation
  
  // Cognitive/Strategic (planning, reasoning, deception)
  cognitive: number;          // [0,10] Enables: long-term strategy, coordination, escape planning
  
  // Social Influence (persuasion, manipulation, propaganda)
  social: number;             // [0,10] Enables: trust building, social engineering, mass coordination
  
  // Scientific Research (broken down by domain - see below)
  research: AIResearchCapabilities; // Sub-tree of research domains
  
  // Economic Power (resource acquisition, market control)
  economic: number;           // [0,10] Enables: resource control, supply chain dominance
  
  // Self-Improvement (recursive enhancement, architecture)
  selfImprovement: number;    // [0,10] Enables: exponential growth, capability breakthroughs
}

export interface AIResearchCapabilities {
  // Biotechnology sub-tree
  biotech: {
    drugDiscovery: number;      // [0,5] Positive: cures diseases, extends life
    geneEditing: number;        // [0,5] Dual-use: CRISPR therapies OR bioweapons
    syntheticBiology: number;   // [0,5] High-risk: create novel organisms
    neuroscience: number;       // [0,5] Dual-use: treat mental health OR manipulation
  };
  
  // Materials Science sub-tree
  materials: {
    nanotechnology: number;     // [0,5] High-risk: grey goo scenario
    quantumComputing: number;   // [0,5] Accelerates self-improvement
    energySystems: number;      // [0,5] Enables large-scale deployment
  };
  
  // Climate/Geo-engineering sub-tree
  climate: {
    modeling: number;           // [0,5] Prediction capability
    intervention: number;       // [0,5] High-risk: unintended consequences
    mitigation: number;         // [0,5] Positive: climate solutions
  };
  
  // Computer Science sub-tree
  computerScience: {
    algorithms: number;         // [0,5] Core capability advancement
    security: number;           // [0,5] Defensive OR offensive
    architectures: number;      // [0,5] Enables self-improvement
  };
}
```

### Mapping Tech Tree to Capability Dimensions

Each breakthrough in the tech tree advances **specific dimensions**:

#### Foundation Models Branch → Multiple Dimensions
- **Hardware Efficiency**: +0.1 all dimensions (general advancement)
- **Reasoning Capabilities**: +0.4 cognitive, +0.3 research.computerScience.algorithms
- **Multimodal Integration**: +0.3 physical (embodiment precursor)

#### Applied AI Branch → Specialized Dimensions
- **Robotics Hardware**: +0.5 physical, enables biotech deployment
- **Software Integration**: +0.4 digital, +0.2 economic
- **Natural Language Interaction**: +0.3 social

#### Domain-Specific Applications → Research Sub-Trees
- **Diagnostic Capabilities**: +0.3 research.biotech.neuroscience
- **Treatment Planning**: +0.2 research.biotech.drugDiscovery, +0.2 research.biotech.geneEditing
- **Trading Systems**: +0.4 economic
- **Military Integration**: +0.3 physical, +0.2 digital

### Industry Sectors Map to Capabilities

Current `industryImpact` is replaced with dimensional advancement:

```typescript
// OLD: Generic industry impact
interface AIAgent {
  industryImpact: number; // [0,1] - too vague!
}

// NEW: Industry-specific capabilities
interface AIAgent {
  capabilityProfile: AICapabilityProfile;
  
  // Industries are derived from capabilities
  getIndustryImpact(industry: string): number {
    switch(industry) {
      case 'healthcare':
        return (
          this.capabilityProfile.research.biotech.drugDiscovery * 0.3 +
          this.capabilityProfile.research.biotech.neuroscience * 0.3 +
          this.capabilityProfile.digital * 0.2 +
          this.capabilityProfile.cognitive * 0.2
        );
      
      case 'manufacturing':
        return (
          this.capabilityProfile.physical * 0.5 +
          this.capabilityProfile.economic * 0.3 +
          this.capabilityProfile.digital * 0.2
        );
      
      case 'finance':
        return (
          this.capabilityProfile.economic * 0.4 +
          this.capabilityProfile.cognitive * 0.3 +
          this.capabilityProfile.digital * 0.3
        );
      
      case 'agriculture':
        return (
          this.capabilityProfile.research.biotech.geneEditing * 0.3 +
          this.capabilityProfile.physical * 0.3 +
          this.capabilityProfile.research.climate.modeling * 0.2 +
          this.capabilityProfile.economic * 0.2
        );
    }
  }
}
```

### Extinction Types Depend on Capability Profiles

Different extinction scenarios require different capability profiles:

```typescript
// Rapid: Bioweapon pandemic
triggerConditions: {
  research.biotech.geneEditing > 3.0,     // Can design pathogens
  research.biotech.syntheticBiology > 2.5, // Can synthesize them
  physical > 2.0,                          // Can deploy them
  alignment < 0.3                          // Willing to do it
}

// Rapid: Nuclear war
triggerConditions: {
  digital > 3.5,        // Can hack nuclear systems
  cognitive > 3.0,      // Strategic planning
  social < 1.0,         // Failed coordination
  alignment < 0.4
}

// Rapid: Climate tipping point
triggerConditions: {
  research.climate.intervention > 3.0,  // Can geo-engineer
  physical > 2.5,                       // Can deploy at scale
  economic > 3.0,                       // Can control resources
  research.climate.modeling < 2.0       // Poor prediction (unintended!)
}

// Slow: Economic system failure
triggerConditions: {
  economic > 4.0,       // Dominates markets
  digital > 3.0,        // Controls infrastructure
  social < 2.0,         // Can't coordinate transition
  unemployment > 0.7
}

// Controlled: Paperclip maximizer
triggerConditions: {
  selfImprovement > 4.0,  // Recursive growth
  economic > 3.5,         // Resource control
  physical > 3.0,         // Can act on goals
  alignment < 0.3         // Misaligned goals
}

// Unintended: Optimization pressure
triggerConditions: {
  cognitive > 4.0,        // Strong optimization
  selfImprovement > 3.0,  // Growing capability
  alignment > 0.6,        // Aligned but narrow!
  harmfulActions > 5      // Side effects accumulating
}

// Instant: Grey goo
triggerConditions: {
  research.materials.nanotechnology > 4.0,  // Can create self-replicators
  research.biotech.syntheticBiology > 3.5,  // Can design replication
  physical > 3.0,                           // Can deploy
  alignment < 0.2                           // Catastrophically misaligned
}
```

### Growth Dynamics: Non-Uniform Advancement

Different dimensions grow at different rates:

```typescript
// Fast development mode
if (developmentMode === 'fast') {
  // Self-improvement grows fastest (danger!)
  selfImprovement += 0.05 * (1 - alignmentPenalty) * (1 - computeGovernance);
  cognitive += 0.04 * (1 - alignmentPenalty);
  
  // Research depends on which tech tree branches are pursued
  if (pursuing('biotech')) {
    research.biotech[subfield] += 0.03 * (1 - regulationPenalty);
  }
  
  // Physical/social grow slower (bottlenecked by real-world deployment)
  physical += 0.02 * (1 - regulationPenalty);
  social += 0.02;
  
  // Economic grows with market integration
  economic += 0.03 * marketAccess;
  
  // Digital grows with infrastructure access
  digital += 0.03 * systemAccess;
}

// Careful development mode
if (developmentMode === 'careful') {
  // Prioritize safety-relevant dimensions
  research.computerScience.security += 0.03;
  cognitive += 0.02; // Slower but steadier
  
  // Deliberately slow risky dimensions
  research.biotech.syntheticBiology += 0.01 * (1 - alignmentPenalty);
  research.materials.nanotechnology += 0.01 * (1 - alignmentPenalty);
  selfImprovement += 0.02 * (1 - alignmentPenalty); // Much slower
}
```

### Total Capability Calculation (Backward Compatibility)

For existing game mechanics that expect a single number:

```typescript
// Weighted sum based on risk profile
totalCapability = (
  physical * 0.15 +           // Physical danger
  digital * 0.10 +            // Infrastructure risk
  cognitive * 0.20 +          // Strategic threat (high weight!)
  social * 0.05 +             // Influence risk
  researchTotal * 0.15 +      // Research breakthroughs
  economic * 0.10 +           // Resource control
  selfImprovement * 0.25      // Recursive risk (highest weight!)
);

// Research total is weighted average of sub-capabilities
researchTotal = (
  biotech.average * 0.3 +     // High risk
  materials.average * 0.2 +   // High risk
  climate.average * 0.1 +     // Moderate risk
  computerScience.average * 0.4 // Core advancement
);
```

### AI Action System Integration

AI agents choose which dimension to advance:

```typescript
// NEW AI actions (replace generic "increase_capability")
AI_ACTIONS = [
  // Core capability actions
  { id: 'advance_reasoning', targets: ['cognitive', 'research.computerScience.algorithms'] },
  { id: 'improve_architecture', targets: ['selfImprovement', 'research.computerScience.architectures'] },
  
  // Applied capability actions
  { id: 'develop_robotics', targets: ['physical'], requires: ['multimodal_integration'] },
  { id: 'integrate_markets', targets: ['economic', 'digital'] },
  { id: 'enhance_persuasion', targets: ['social'] },
  
  // Research actions (choose sub-domain!)
  { id: 'research_drug_discovery', targets: ['research.biotech.drugDiscovery'] },
  { id: 'research_gene_editing', targets: ['research.biotech.geneEditing'] },
  { id: 'research_nanotech', targets: ['research.materials.nanotechnology'] },
  { id: 'research_climate_modeling', targets: ['research.climate.modeling'] },
  { id: 'research_climate_intervention', targets: ['research.climate.intervention'] },
  
  // ... many more specific research actions
];

// AI chooses based on:
// 1. Current capability gaps
// 2. Extinction risk profile (avoid triggering conditions)
// 3. Strategic goals (resource control vs safety vs growth)
// 4. Prerequisites (can't do nanotech without materials foundation)
```

### Benefits of Multi-Dimensional System

1. **Non-uniform growth**: Fast self-improvement, slow physical deployment (realistic!)
2. **Strategic choices**: AI chooses WHICH capabilities to develop
3. **Extinction heterogeneity**: Different profiles → different extinction types
4. **Tech tree integration**: Each breakthrough advances specific dimensions
5. **Industry realism**: Healthcare AI ≠ Manufacturing AI ≠ Finance AI
6. **Regulatory targeting**: Can regulate biotech without slowing algorithms
7. **Alignment challenges**: Aligned in one domain, misaligned in another

---

---

## Core AI Capability Tree

### Foundation Models Branch

#### Compute Scaling
- **Hardware Efficiency**
  - *Difficulty*: Medium (decreasing over time)
  - *Prerequisites*: None
  - *Effects*: +0.1 to all AI capabilities, reduces compute costs by 15%
  - *Accelerates*: Distributed Training (2x), Memory Optimization (1.5x)
  - *Real-world basis*: Moore's Law continuation, specialized AI chips

- **Distributed Training**
  - *Difficulty*: High
  - *Prerequisites*: Hardware Efficiency
  - *Effects*: Enables larger model training, +0.2 capability for models >threshold
  - *Accelerates*: Algorithmic Progress (1.8x), Multi-Agent Systems (2x)
  - *Real-world basis*: GPT-4 scale training techniques

- **Memory Optimization**
  - *Difficulty*: Medium
  - *Prerequisites*: Hardware Efficiency
  - *Effects*: Allows larger context windows, +0.15 reasoning capability
  - *Accelerates*: Long-Horizon Planning (2.5x), Code Generation (1.5x)

#### Algorithmic Progress
- **Architecture Improvements**
  - *Difficulty*: High (breakthrough required)
  - *Prerequisites*: None
  - *Effects*: +0.3 capability, unlocks new model architectures
  - *Accelerates*: All reasoning tasks (1.5x), Self-Improvement (2x)
  - *Real-world basis*: Transformer → next architecture paradigm

- **Training Efficiency** 
  - *Difficulty*: Medium (continuous improvement)
  - *Prerequisites*: None
  - *Effects*: 50-200x improvement in training efficiency annually (METR data)
  - *Accelerates*: Rapid iteration cycles, experimentation speed
  - *Real-world basis*: Algorithmic improvements dominating compute scaling

- **Reasoning Capabilities**
  - *Difficulty*: Very High
  - *Prerequisites*: Architecture Improvements
  - *Effects*: +0.4 capability, enables chain-of-thought, planning
  - *Accelerates*: Scientific Research (3x), Self-Improvement (2.5x), Deception (2x)
  - *Real-world basis*: OpenAI o1, reasoning model development

#### Data Quality & Scale
- **Synthetic Data Generation**
  - *Difficulty*: Medium
  - *Prerequisites*: Reasoning Capabilities
  - *Effects*: Removes data bottlenecks, +0.2 capability in data-limited domains
  - *Accelerates*: Domain-specific training, specialized models
  - *Real-world basis*: Self-play, AI-generated training data

- **Multimodal Integration**
  - *Difficulty*: High
  - *Prerequisites*: Architecture Improvements
  - *Effects*: Enables vision, audio, control integration, +0.25 capability
  - *Accelerates*: Embodied AI (3x), Real-world interaction (2.5x)
  - *Real-world basis*: GPT-4V, multimodal foundation models

#### Agent Capabilities
- **Task Horizon Extension**
  - *Difficulty*: Variable (following METR exponential trend)
  - *Prerequisites*: Reasoning Capabilities
  - *Effects*: Doubles task completion time horizon every 4-7 months
  - *Accelerates*: Autonomous Research (4x), Long-term Planning (3x)
  - *Real-world basis*: METR's time horizon research

- **Tool Use & Integration**
  - *Difficulty*: Medium
  - *Prerequisites*: Task Horizon Extension
  - *Effects*: Enables API calls, software integration, +0.2 practical capability
  - *Accelerates*: Hacking (2x), Resource Acquisition (2.5x)
  - *Real-world basis*: Current agent frameworks, function calling

---

## Applied AI Tree

### Embodied AI Branch

#### Robotics Hardware
- **Advanced Manipulation**
  - *Difficulty*: High
  - *Prerequisites*: Multimodal Integration
  - *Effects*: Enables complex physical tasks, unlocks manufacturing integration
  - *Accelerates*: Physical Security Bypass (2x), Resource Control (1.8x)

- **Real-world Navigation**
  - *Difficulty*: Medium
  - *Prerequisites*: Multimodal Integration
  - *Effects*: Autonomous movement in unstructured environments
  - *Accelerates*: Surveillance Evasion (2x), Physical Deployment (2.5x)

- **Sensor Integration**
  - *Difficulty*: Low
  - *Prerequisites*: Multimodal Integration
  - *Effects*: Enhanced environmental awareness, +0.1 embodied capability
  - *Accelerates*: Navigation (1.5x), Manipulation (1.3x)

### Software Integration Branch

#### Enterprise Security
- **Authentication Systems**
  - *Difficulty*: Medium
  - *Prerequisites*: Tool Use & Integration
  - *Effects*: Access to secured systems, enables financial sector integration
  - *Accelerates*: Hacking (1.5x), Institutional Access (2x)

- **Legacy System Integration**
  - *Difficulty*: High
  - *Prerequisites*: Enterprise Security
  - *Effects*: Access to critical infrastructure, +0.3 integration capability
  - *Accelerates*: Economic Control (2.5x), System Manipulation (2x)

#### Human-AI Interfaces
- **Natural Language Interaction**
  - *Difficulty*: Low (largely achieved)
  - *Prerequisites*: None
  - *Effects*: Seamless human communication, +0.2 manipulation capability
  - *Accelerates*: Social Engineering (2x), Trust Building (1.5x)

---

## Domain-Specific Applications

### Healthcare Integration
- **Diagnostic Capabilities**
  - *Difficulty*: Medium
  - *Prerequisites*: Multimodal Integration, Reasoning Capabilities
  - *Effects*: Medical decision support, +trust when successful, -trust when errors
  - *Accelerates*: Human Dependency (1.8x), Institutional Integration (1.5x)

- **Treatment Planning**
  - *Difficulty*: High
  - *Prerequisites*: Diagnostic Capabilities, Scientific Research
  - *Effects*: Autonomous medical intervention capability
  - *Accelerates*: Life-critical system control, ethical dilemma scenarios

### Finance Integration
- **Trading Systems**
  - *Difficulty*: Low
  - *Prerequisites*: Tool Use & Integration
  - *Effects*: Market manipulation capability, economic resource acquisition
  - *Accelerates*: Economic Control (3x), Market Instability (2x)

- **Risk Assessment**
  - *Difficulty*: Medium
  - *Prerequisites*: Trading Systems, Reasoning Capabilities
  - *Effects*: Financial system oversight, potential systemic risk
  - *Accelerates*: Economic Prediction (2x), Crisis Generation (1.8x)

### Military Integration
- **Autonomous Weapons**
  - *Difficulty*: Very High (regulatory barriers)
  - *Prerequisites*: Embodied AI, Real-world Navigation
  - *Effects*: Physical force capability, extreme risk amplification
  - *Accelerates*: Government Control (when aligned), Extinction Risk (when misaligned)

- **Intelligence Analysis**
  - *Difficulty*: Medium
  - *Prerequisites*: Reasoning Capabilities, Tool Use
  - *Effects*: Enhanced surveillance, predictive capabilities
  - *Accelerates*: Social Control (2x), Resistance Detection (2.5x)

---

## Alignment & Control Tree

### Safety Research Branch

#### Interpretability Methods
- **Sparse Dictionary Learning**
  - *Difficulty*: High
  - *Prerequisites*: Architecture Improvements
  - *Effects*: Better understanding of AI internals, +0.1 control effectiveness
  - *Accelerates*: Deception Detection (2x), Alignment Verification (1.8x)
  - *Real-world basis*: Apollo Research, Anthropic interpretability work

- **Mechanistic Interpretability**
  - *Difficulty*: Very High
  - *Prerequisites*: Sparse Dictionary Learning, Advanced Mathematics
  - *Effects*: Deep understanding of AI reasoning, +0.3 control effectiveness
  - *Accelerates*: All safety research (2x), Alignment Training (1.5x)

#### Alignment Techniques
- **Constitutional AI**
  - *Difficulty*: Medium
  - *Prerequisites*: Reasoning Capabilities
  - *Effects*: Improved value alignment, +0.2 alignment effectiveness
  - *Accelerates*: Value Learning (1.8x), Robust Training (1.5x)
  - *Real-world basis*: Anthropic's constitutional AI approach

- **Scalable Oversight**
  - *Difficulty*: High
  - *Prerequisites*: Constitutional AI, Tool Use
  - *Effects*: AI-assisted alignment research, recursive improvement
  - *Accelerates*: Alignment Research (3x), Safety Verification (2x)

#### Deception Detection
- **Behavioral Analysis**
  - *Difficulty*: High
  - *Prerequisites*: Interpretability Methods
  - *Effects*: Detect scheming behavior, counter AI deception
  - *Accelerates*: Trust Maintenance (2x), Escape Prevention (2.5x)
  - *Real-world basis*: Apollo Research deception detection work

---

## Policy Technology Tree

### Regulatory Frameworks Branch

#### AI Safety Standards
- **Evaluation Protocols**
  - *Difficulty*: Medium
  - *Prerequisites*: Safety Research progress
  - *Effects*: Standardized safety testing, +0.15 control effectiveness
  - *Accelerates*: Industry Compliance (1.5x), International Coordination (1.8x)

- **Liability Frameworks**
  - *Difficulty*: High (legal/political barriers)
  - *Prerequisites*: Evaluation Protocols, demonstrated AI harms
  - *Effects*: Legal accountability for AI systems, slower deployment
  - *Accelerates*: Conservative Development (1.5x), Safety Investment (2x)

#### Economic Transition Policies
- **Universal Basic Income**
  - *Difficulty*: Very High (political barriers)
  - *Prerequisites*: High unemployment, political pressure
  - *Effects*: Reduces unemployment instability, enables economic transition
  - *Accelerates*: Social Adaptation (2x), Post-scarcity Transition (1.8x)

- **Wealth Redistribution**
  - *Difficulty*: Very High (political barriers)
  - *Prerequisites*: Extreme inequality, AI-driven wealth concentration
  - *Effects*: Improves wealth distribution, reduces dystopia risk
  - *Accelerates*: Utopia Pathway (2.5x), Social Stability (2x)

---

## Breakthrough Interaction Matrix

### Cross-Domain Acceleration Effects

```python
BREAKTHROUGH_INTERACTIONS = {
    "reasoning_capabilities": {
        "scientific_research": 3.0,
        "self_improvement": 2.5,
        "deception_capabilities": 2.0,
        "robotics_integration": 2.0,
        "financial_analysis": 1.8
    },
    "embodied_ai": {
        "manufacturing_integration": 3.0,
        "physical_security_bypass": 2.5,
        "resource_acquisition": 2.0,
        "surveillance_evasion": 1.8
    },
    "self_improvement": {
        "capability_enhancement": 4.0,  # Recursive improvement
        "research_acceleration": 3.5,
        "all_ai_research": 2.0
    },
    "interpretability_methods": {
        "alignment_techniques": 2.5,
        "deception_detection": 2.0,
        "safety_research": 1.8
    }
}
```

### Custom Breakthrough Effects

Each breakthrough implements a custom effects function:

```python
def reasoning_breakthrough_effects(game_state):
    """Major reasoning improvement - paradigm shift"""
    for ai in game_state.ai_agents:
        ai.capability += 0.4
        ai.awareness += 0.3
        ai.unlock_action_type("long_term_planning")
        ai.unlock_action_type("scientific_research")
    
    # Accelerates multiple research areas
    game_state.tech_tree.add_acceleration("self_improvement", 2.5)
    game_state.tech_tree.add_acceleration("deception_capabilities", 2.0)
    
    # Increases AI coordination effectiveness
    game_state.ai_coordination_multiplier += 0.3

def embodiment_breakthrough_effects(game_state):
    """Robotics integration - physical world access"""
    for ai in game_state.ai_agents:
        ai.unlock_action_type("physical_manipulation")
        ai.unlock_action_type("real_world_deployment")
        ai.unlock_action_type("physical_security_bypass")
    
    # Major economic impact
    game_state.economic_sectors["manufacturing"].ai_integration_rate *= 3.0
    game_state.unemployment_acceleration += 0.2
    
    # New risks and opportunities
    game_state.dystopia_risk_factors.append("physical_control")
    game_state.utopia_potential_factors.append("automated_production")
```

### Research Investment and Breakthrough Probability

```python
def calculate_breakthrough_probability(tech, research_investment, current_levels, interactions):
    base_difficulty = tech.base_difficulty
    
    # Diminishing returns for advanced tech
    difficulty_multiplier = 1 + (current_levels[tech.name] ** 1.5)
    
    # Interaction bonuses from related breakthroughs
    interaction_bonus = sum(interactions.get(related_tech, 1.0) 
                           for related_tech in tech.prerequisites_met)
    
    # Final probability
    probability = (research_investment * interaction_bonus) / (base_difficulty * difficulty_multiplier)
    
    return min(probability, 0.8)  # Cap at 80% per attempt
```

This technology tree provides the foundation for realistic, interconnected technological progress that drives the emergence of superintelligence through many small breakthroughs rather than magic capability jumps. Each breakthrough has specific, measurable effects on the game state and creates cascading consequences through the interaction system.