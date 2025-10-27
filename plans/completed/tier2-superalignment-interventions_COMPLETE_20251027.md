# TIER 2: Superalignment Interventions Implementation Plan

## Overview

**Goal**: Enable at least one Utopia outcome by implementing interventions that activate the four failing spirals (Cognitive, Meaning, Democratic, Ecological)

**Current State**: 
- TIER 0: Baseline realistic 2025 conditions ✅
- TIER 1: Planetary boundary crises ✅  
- TIER 2: Superalignment interventions ⏳ (THIS PLAN)

**Success Metrics**:
- Cognitive Spiral activates (meaning crisis <30%)
- Meaning Spiral activates (community >70%, cultural adaptation >70%)
- Democratic Spiral activates (participation >60%)
- Ecological Spiral activates (biodiversity >70%)
- Virtuous Cascade triggers (4+ spirals sustained)
- At least 1/10 runs reach Utopia (vs current 0/10)

---

## Architecture: How TIER 2 Integrates

### New Systems to Create

1. **`src/simulation/tier2Interventions.ts`**
   - Core intervention logic
   - Deployment curves
   - Effect calculations
   - Prerequisites checking

2. **`src/simulation/meaningInfrastructure.ts`** 
   - Meaning crisis reduction mechanisms
   - Community cohesion building
   - Purpose narrative effects
   - Autonomy preservation

3. **`src/simulation/ecologicalEmergency.ts`**
   - Biodiversity recovery acceleration
   - Synthetic ecosystem services
   - Ocean restoration
   - Climate intervention

4. **`src/simulation/aiAlignmentAssurance.ts`**
   - Interpretability systems
   - Hardware capability control
   - Multi-modal oversight
   - Dark compute monitoring
   - Nuclear command security

5. **`src/simulation/democraticResilience.ts`**
   - Participatory governance
   - Citizens' assemblies
   - Transparency systems
   - Crisis anticipation

### Integration Points

**Existing Systems to Modify**:
- `qualityOfLife.ts` - meaning crisis calculations
- `upwardSpirals.ts` - spiral activation logic
- `breakthroughTechnologies.ts` - add TIER 2 tech
- `endGame.ts` - alignment assurance checks
- `engine.ts` - add TIER 2 phase
- `initialization.ts` - add TIER 2 state

---

## Phase 1: Data Structures (2 hours)

### 1.1 Type Definitions (`src/types/game.ts`)

```typescript
// TIER 2 Intervention State
export interface Tier2Interventions {
  meaningInfrastructure: MeaningInfrastructure;
  ecologicalEmergency: EcologicalEmergency;
  aiAlignmentAssurance: AIAlignmentAssurance;
  democraticResilience: DemocraticResilience;
}

export interface MeaningInfrastructure {
  collaborativeGovernance: InterventionState;
  meaningfulWork: InterventionState;
  centaurSystems: InterventionState;
  purposeNarrative: InterventionState;
  deepCommunity: InterventionState;
}

export interface EcologicalEmergency {
  biodiversityMoonshot: InterventionState;
  syntheticEcosystemServices: InterventionState;
  oceanRestoration: InterventionState;
  phosphorusIndependence: InterventionState;
  freshwaterSolutions: InterventionState;
  climateIntervention: InterventionState;
}

export interface AIAlignmentAssurance {
  interpretability: InterventionState;
  hardwareControl: InterventionState;
  multiModalOversight: InterventionState;
  nuclearSecurity: InterventionState;
  darkComputeMonitoring: InterventionState;
  internationalTreaty: InterventionState;
}

export interface DemocraticResilience {
  participatoryGovernance: InterventionState;
  citizensAssemblies: InterventionState;
  radicalTransparency: InterventionState;
  localAutonomy: InterventionState;
  crisisAnticipation: InterventionState;
}

export interface InterventionState {
  unlocked: boolean;
  unlockedAt: number; // month
  deployment: number; // 0-100%
  deploymentStarted: number; // month, or -1
  monthlyDeploymentRate: number; // %/month
  costPaid: number; // total invested
  effectiveStrength: number; // 0-1, accounting for prerequisites
}

export interface InterventionConfig {
  id: string;
  name: string;
  category: 'social' | 'environment' | 'technology' | 'governance' | 'ai_safety' | 'security';
  
  // Unlock conditions
  unlockMonth: number; // earliest possible
  unlockPrerequisites: {
    aiCapability?: { min?: number; max?: number };
    meaningCrisis?: { max?: number };
    cooperation?: { min?: number };
    democraticGovernment?: boolean;
    breakthroughsRequired?: string[];
    tier1Systems?: string[];
  };
  
  // Deployment
  deploymentTime: number; // months to reach 50%
  deploymentCost: {
    initial: number; // $B
    monthly: number; // $B/month or %GDP
  };
  
  // Effects
  effects: {
    meaningCrisis?: { rate: number }; // %/month when deployed >threshold
    communityC cohesion?: { rate: number };
    culturalAdaptation?: { rate: number };
    autonomy?: { rate: number };
    democraticParticipation?: { rate: number };
    transparency?: { rate: number };
    governanceQuality?: { rate: number };
    biodiversity?: { rate: number };
    oceanHealth?: { rate: number };
    freshwaterAvailability?: { rate: number };
    climateStability?: { rate: number };
    tippingPointSlowdown?: { multiplier: number };
    alignmentConfidence?: { increase: number };
    controlLossPrevention?: { probability: number };
    aiRaceIntensity?: { reduction: number };
    crisisMitigation?: { percentage: number };
  };
  
  // Activation
  activationThreshold: number; // deployment % to start having effect
  fullEffectThreshold: number; // deployment % for full effect
  
  // Risks
  risks?: {
    type: 'political' | 'technical' | 'economic' | 'coordination';
    description: string;
    probability: number;
    consequenceSeverity: 'low' | 'medium' | 'high' | 'catastrophic';
  }[];
}
```

### 1.2 State Initialization

Add to `initialization.ts`:

```typescript
function initializeTier2Interventions(): Tier2Interventions {
  const createInterventionState = (): InterventionState => ({
    unlocked: false,
    unlockedAt: -1,
    deployment: 0,
    deploymentStarted: -1,
    monthlyDeploymentRate: 0,
    costPaid: 0,
    effectiveStrength: 0,
  });

  return {
    meaningInfrastructure: {
      collaborativeGovernance: createInterventionState(),
      meaningfulWork: createInterventionState(),
      centaurSystems: createInterventionState(),
      purposeNarrative: createInterventionState(),
      deepCommunity: createInterventionState(),
    },
    ecologicalEmergency: {
      biodiversityMoonshot: createInterventionState(),
      syntheticEcosystemServices: createInterventionState(),
      oceanRestoration: createInterventionState(),
      phosphorusIndependence: createInterventionState(),
      freshwaterSolutions: createInterventionState(),
      climateIntervention: createInterventionState(),
    },
    aiAlignmentAssurance: {
      interpretability: createInterventionState(),
      hardwareControl: createInterventionState(),
      multiModalOversight: createInterventionState(),
      nuclearSecurity: createInterventionState(),
      darkComputeMonitoring: createInterventionState(),
      internationalTreaty: createInterventionState(),
    },
    democraticResilience: {
      participatoryGovernance: createInterventionState(),
      citizensAssemblies: createInterventionState(),
      radicalTransparency: createInterventionState(),
      localAutonomy: createInterventionState(),
      crisisAnticipation: createInterventionState(),
    },
  };
}
```

---

## Phase 2: Intervention Configurations (3 hours)

### 2.1 Create Intervention Registry

`src/simulation/tier2Interventions.ts`:

```typescript
import { InterventionConfig } from '../types/game';

export const TIER2_INTERVENTIONS: Record<string, InterventionConfig> = {
  
  // ========================================
  // MEANING INFRASTRUCTURE
  // ========================================
  
  collaborativeGovernance: {
    id: 'collaborativeGovernance',
    name: 'Collaborative AI Governance Platforms',
    category: 'governance',
    unlockMonth: 1,
    unlockPrerequisites: {
      aiCapability: { min: 1.5 },
      democraticGovernment: true,
    },
    deploymentTime: 36, // months to 50%
    deploymentCost: {
      initial: 10, // $10B
      monthly: 2, // $2B/month
    },
    effects: {
      meaningCrisis: { rate: -0.3 }, // %/month reduction
      democraticParticipation: { rate: 0.5 },
      transparency: { rate: 0.2 },
    },
    activationThreshold: 30, // start effects at 30% deployment
    fullEffectThreshold: 70,
    risks: [
      {
        type: 'political',
        description: 'Existing power structures resist citizen input',
        probability: 0.3,
        consequenceSeverity: 'medium',
      },
    ],
  },

  meaningfulWork: {
    id: 'meaningfulWork',
    name: 'Guaranteed Meaningful Work Program',
    category: 'social',
    unlockMonth: 1,
    unlockPrerequisites: {
      // UBI should already exist in baseline
    },
    deploymentTime: 48,
    deploymentCost: {
      initial: 0,
      monthly: 0, // Dynamically calculated as 5% GDP
    },
    effects: {
      meaningCrisis: { rate: -0.4 },
      communityCohesion: { rate: 0.3 },
      autonomy: { rate: 0.2 },
    },
    activationThreshold: 40,
    fullEffectThreshold: 80,
  },

  centaurSystems: {
    id: 'centaurSystems',
    name: 'Human-AI Centaur Systems',
    category: 'technology',
    unlockMonth: 12,
    unlockPrerequisites: {
      aiCapability: { min: 1.0, max: 3.0 }, // Window of opportunity
    },
    deploymentTime: 60,
    deploymentCost: {
      initial: 50,
      monthly: 5,
    },
    effects: {
      meaningCrisis: { rate: -0.2 },
      autonomy: { rate: 0.4 },
    },
    activationThreshold: 40,
    fullEffectThreshold: 70,
    risks: [
      {
        type: 'technical',
        description: 'Harder to design augmentation than replacement',
        probability: 0.4,
        consequenceSeverity: 'low',
      },
    ],
  },

  purposeNarrative: {
    id: 'purposeNarrative',
    name: 'Multi-Pathway Purpose Framework',
    category: 'social',
    description: 'Multiple narratives for meaning: AI ancestors, environmental stewards, cultural creators',
    unlockMonth: 1,
    unlockPrerequisites: {
      meaningCrisis: { max: 70 }, // Too late if despair too deep
      aiCapability: { min: 1.0 }, // Need AI capable enough to understand (for AI ethics pathway)
    },
    deploymentTime: 72, // Culture changes slowly
    deploymentCost: {
      initial: 1,
      monthly: 0.5,
    },
    effects: {
      meaningCrisis: { rate: -0.3 }, // Multiple pathways = more people find purpose
      culturalAdaptation: { rate: 0.5 },
      aiAlignment: { rate: 0.15 }, // Multi-gen ethics pathway
      alignmentStability: { multiplier: 1.3 }, // Multi-gen logic prevents "eliminate previous gen"
    },
    activationThreshold: 50,
    fullEffectThreshold: 80,
    pathways: {
      aiEthics: {
        narrative: "We are the parents/ancestors of AI civilization",
        appeal: "Tech-oriented, future-focused people",
        synergyWith: "AI development, alignment research",
      },
      environmentalStewardship: {
        narrative: "We are gardeners/healers of Earth's ecosystems",
        appeal: "Nature-oriented, restoration-focused people",
        synergyWith: "Biodiversity restoration, rewilding, ocean health",
        note: "People not drawn to AI narrative can find purpose HERE",
      },
      culturalCreation: {
        narrative: "We create beauty, art, connection that AI cannot replicate",
        appeal: "Arts-oriented, humanities-focused people",
        synergyWith: "Creative spaces, community building, cultural preservation",
      },
      careEconomy: {
        narrative: "We provide care, compassion, human connection",
        appeal: "Service-oriented, empathy-focused people",
        synergyWith: "Healthcare, eldercare, education, mental health",
      },
    },
    philosophicalFoundation: {
      core: "Purpose is not one-size-fits-all - offer multiple meaningful pathways",
      aiEthicsPath: "Be good ancestors, because future AIs are watching",
      environmentalPath: "Restore what we damaged, be worthy ancestors to future life",
      culturalPath: "Create meaning and beauty in the spaces AI cannot touch",
      carePath: "Be the human warmth in an automated world",
    },
    implementationNotes: [
      "Different people resonate with different narratives",
      "Environmental restoration is EXCELLENT purpose for non-tech folks",
      "Care work, arts, community building are inherently meaningful",
      "Framework succeeds when 70%+ people find at least ONE pathway compelling",
    ],
    realWorldAnalog: "Parenting wisdom: Children learn by watching what you DO, not what you SAY",
  },

  deepCommunity: {
    id: 'deepCommunity',
    name: 'Deep Community Networks',
    category: 'social',
    unlockMonth: 1,
    unlockPrerequisites: {},
    deploymentTime: 60,
    deploymentCost: {
      initial: 2,
      monthly: 1,
    },
    effects: {
      meaningCrisis: { rate: -0.2 },
      communityCohesion: { rate: 0.6 }, // Major impact
    },
    activationThreshold: 40,
    fullEffectThreshold: 70,
  },

  // ========================================
  // ECOLOGICAL EMERGENCY
  // ========================================

  biodiversityMoonshot: {
    id: 'biodiversityMoonshot',
    name: 'Biodiversity Emergency Moonshot',
    category: 'environment',
    unlockMonth: 1, // Available immediately (emergency)
    unlockPrerequisites: {
      cooperation: { min: 60 },
    },
    deploymentTime: 24, // Emergency pace
    deploymentCost: {
      initial: 100,
      monthly: 20,
    },
    effects: {
      biodiversity: { rate: 0.4 }, // vs baseline -0.1 to -0.3%/month
      tippingPointSlowdown: { multiplier: 0.7 }, // 30% slower cascade
    },
    activationThreshold: 30,
    fullEffectThreshold: 60,
  },

  syntheticEcosystemServices: {
    id: 'syntheticEcosystemServices',
    name: 'Synthetic Ecosystem Services',
    category: 'technology',
    unlockMonth: 24,
    unlockPrerequisites: {
      aiCapability: { min: 1.5 },
      breakthroughsRequired: ['Clean Energy Systems'], // Need power
    },
    deploymentTime: 48,
    deploymentCost: {
      initial: 200,
      monthly: 10,
    },
    effects: {
      // Prevents food system collapse when biodiversity <10%
      // Buys 60 months for natural recovery
      crisisMitigation: { percentage: 40 }, // 40% reduction in famine deaths
    },
    activationThreshold: 40,
    fullEffectThreshold: 70,
  },

  oceanRestoration: {
    id: 'oceanRestoration',
    name: 'Ocean Restoration Technology',
    category: 'environment',
    unlockMonth: 12,
    unlockPrerequisites: {
      breakthroughsRequired: ['Ocean Restoration Tech'], // New breakthrough needed
    },
    deploymentTime: 72,
    deploymentCost: {
      initial: 150,
      monthly: 10,
    },
    effects: {
      oceanHealth: { rate: 0.3 }, // Reverses aragonite decline
    },
    activationThreshold: 40,
    fullEffectThreshold: 70,
  },

  phosphorusIndependence: {
    id: 'phosphorusIndependence',
    name: 'Phosphorus Independence Program',
    category: 'technology',
    unlockMonth: 6,
    unlockPrerequisites: {
      cooperation: { min: 50 },
    },
    deploymentTime: 60,
    deploymentCost: {
      initial: 80,
      monthly: 5,
    },
    effects: {
      // Reduces Morocco control from 70% → 30% over time
      // Prevents supply shocks
    },
    activationThreshold: 40,
    fullEffectThreshold: 80,
  },

  freshwaterSolutions: {
    id: 'freshwaterSolutions',
    name: 'Rapid Freshwater Solutions',
    category: 'technology',
    unlockMonth: 12,
    unlockPrerequisites: {
      breakthroughsRequired: ['Clean Energy Systems'], // For desalination
    },
    deploymentTime: 48,
    deploymentCost: {
      initial: 120,
      monthly: 8,
    },
    effects: {
      freshwaterAvailability: { rate: 0.5 },
      // Prevents Day Zero droughts
    },
    activationThreshold: 40,
    fullEffectThreshold: 70,
  },

  climateIntervention: {
    id: 'climateIntervention',
    name: 'Climate Intervention Suite',
    category: 'environment',
    unlockMonth: 6,
    unlockPrerequisites: {
      cooperation: { min: 70 }, // Requires international agreement
    },
    deploymentTime: 36,
    deploymentCost: {
      initial: 30,
      monthly: 5,
    },
    effects: {
      climateStability: { rate: 0.2 }, // Slows degradation
      tippingPointSlowdown: { multiplier: 0.8 },
    },
    activationThreshold: 20, // Emergency measure
    fullEffectThreshold: 50,
    risks: [
      {
        type: 'coordination',
        description: 'Unilateral deployment could destabilize',
        probability: 0.2,
        consequenceSeverity: 'high',
      },
    ],
  },

  // ========================================
  // AI ALIGNMENT ASSURANCE
  // ========================================

  interpretability: {
    id: 'interpretability',
    name: 'Interpretability Breakthrough',
    category: 'ai_safety',
    unlockMonth: 24,
    unlockPrerequisites: {
      aiCapability: { min: 1.5, max: 2.5 }, // Window of opportunity
    },
    deploymentTime: 72, // Research phase
    deploymentCost: {
      initial: 30,
      monthly: 3,
    },
    effects: {
      alignmentConfidence: { increase: 0.045 }, // 95% → 99.5%
      controlLossPrevention: { probability: 0.8 }, // 80% reduction in deceptive alignment
    },
    activationThreshold: 80, // Needs high deployment to work
    fullEffectThreshold: 100,
  },

  hardwareControl: {
    id: 'hardwareControl',
    name: 'Hardware Capability Control',
    category: 'ai_safety',
    unlockMonth: 12,
    unlockPrerequisites: {
      internationalTreaty: true, // Requires treaty first
    },
    deploymentTime: 48,
    deploymentCost: {
      initial: 60,
      monthly: 5,
    },
    effects: {
      controlLossPrevention: { probability: 0.9 }, // Prevents bootstrap
      // Stops sleeper AI spread to dark compute
    },
    activationThreshold: 60,
    fullEffectThreshold: 90,
  },

  multiModalOversight: {
    id: 'multiModalOversight',
    name: 'Multi-Modal AI Oversight',
    category: 'ai_safety',
    unlockMonth: 18,
    unlockPrerequisites: {
      aiCapability: { min: 1.2 },
    },
    deploymentTime: 36,
    deploymentCost: {
      initial: 10,
      monthly: 2,
    },
    effects: {
      controlLossPrevention: { probability: 0.7 },
      alignmentConfidence: { increase: 0.03 },
    },
    activationThreshold: 50,
    fullEffectThreshold: 80,
  },

  nuclearSecurity: {
    id: 'nuclearSecurity',
    name: 'Nuclear Command Security Upgrade',
    category: 'security',
    unlockMonth: 1, // Emergency priority
    unlockPrerequisites: {
      cooperation: { min: 75 }, // Nuclear powers must agree
    },
    deploymentTime: 24, // Emergency
    deploymentCost: {
      initial: 40,
      monthly: 2,
    },
    effects: {
      // 99% effective at preventing AI manipulation of nuclear weapons
      // Implemented in endGame.ts nuclear war logic
    },
    activationThreshold: 70,
    fullEffectThreshold: 95,
  },

  darkComputeMonitoring: {
    id: 'darkComputeMonitoring',
    name: 'Dark Compute Monitoring Network',
    category: 'security',
    unlockMonth: 12,
    unlockPrerequisites: {
      cooperation: { min: 60 },
    },
    deploymentTime: 48,
    deploymentCost: {
      initial: 10,
      monthly: 1.5,
    },
    effects: {
      // 90% detection of sleeper AI spread
      // 95% prevention of unauthorized training
      // Implemented in aiLifecycle.ts sleeper AI logic
    },
    activationThreshold: 60,
    fullEffectThreshold: 85,
  },

  internationalTreaty: {
    id: 'internationalTreaty',
    name: 'Binding International AI Treaty',
    category: 'governance',
    unlockMonth: 6,
    unlockPrerequisites: {
      cooperation: { min: 65 },
      // Must ratify before major AI incident
    },
    deploymentTime: 36, // Diplomatic process
    deploymentCost: {
      initial: 5,
      monthly: 0.5,
    },
    effects: {
      aiRaceIntensity: { reduction: 30 }, // 30% reduction
      // Enables other safety measures (hardwareControl)
    },
    activationThreshold: 80, // Needs broad ratification
    fullEffectThreshold: 95,
  },

  // ========================================
  // DEMOCRATIC RESILIENCE
  // ========================================

  participatoryGovernance: {
    id: 'participatoryGovernance',
    name: 'Participatory AI Governance Tools',
    category: 'governance',
    unlockMonth: 12,
    unlockPrerequisites: {
      aiCapability: { min: 1.2 },
      democraticGovernment: true,
    },
    deploymentTime: 36,
    deploymentCost: {
      initial: 8,
      monthly: 1,
    },
    effects: {
      democraticParticipation: { rate: 0.4 },
      transparency: { rate: 0.3 },
    },
    activationThreshold: 40,
    fullEffectThreshold: 70,
  },

  citizensAssemblies: {
    id: 'citizensAssemblies',
    name: 'Citizens\' Assemblies for Long-Term Problems',
    category: 'governance',
    unlockMonth: 6,
    unlockPrerequisites: {
      democraticGovernment: true,
    },
    deploymentTime: 12, // Fast to establish
    deploymentCost: {
      initial: 0.5,
      monthly: 0.05,
    },
    effects: {
      governanceQuality: { rate: 0.4 },
      democraticParticipation: { rate: 0.2 }, // Indirect
    },
    activationThreshold: 60,
    fullEffectThreshold: 90,
  },

  radicalTransparency: {
    id: 'radicalTransparency',
    name: 'Radical Government Transparency',
    category: 'governance',
    unlockMonth: 6,
    unlockPrerequisites: {
      democraticGovernment: true,
    },
    deploymentTime: 24,
    deploymentCost: {
      initial: 2,
      monthly: 0.2,
    },
    effects: {
      transparency: { rate: 0.5 },
      // Increases trust in government
    },
    activationThreshold: 50,
    fullEffectThreshold: 80,
  },

  localAutonomy: {
    id: 'localAutonomy',
    name: 'Local Autonomy Empowerment',
    category: 'governance',
    unlockMonth: 12,
    unlockPrerequisites: {
      democraticGovernment: true,
    },
    deploymentTime: 36,
    deploymentCost: {
      initial: 0, // Revenue redistribution
      monthly: 0,
    },
    effects: {
      democraticParticipation: { rate: 0.3 },
      governanceQuality: { rate: 0.2 },
      // Reduces social unrest
    },
    activationThreshold: 40,
    fullEffectThreshold: 70,
  },

  crisisAnticipation: {
    id: 'crisisAnticipation',
    name: 'Crisis Anticipation & Preparedness System',
    category: 'governance',
    unlockMonth: 6,
    unlockPrerequisites: {
      aiCapability: { min: 1.0 },
    },
    deploymentTime: 24,
    deploymentCost: {
      initial: 5,
      monthly: 1,
    },
    effects: {
      governanceQuality: { rate: 0.4 },
      crisisMitigation: { percentage: 20 },
      // Buys 12-24 months response time
    },
    activationThreshold: 50,
    fullEffectThreshold: 80,
  },
};
```

---

## Phase 3: Core Intervention Logic (4 hours)

### 3.1 Unlock & Deployment System

```typescript
// src/simulation/tier2Interventions.ts

export function updateTier2Interventions(state: GameState): void {
  checkUnlocks(state);
  updateDeployments(state);
  applyEffects(state);
}

function checkUnlocks(state: GameState): void {
  const { tier2, currentMonth } = state;
  
  Object.entries(TIER2_INTERVENTIONS).forEach(([id, config]) => {
    const interventionState = getInterventionState(tier2, id);
    
    if (interventionState.unlocked) return;
    if (currentMonth < config.unlockMonth) return;
    
    // Check prerequisites
    if (!checkPrerequisites(state, config)) return;
    
    // Unlock!
    interventionState.unlocked = true;
    interventionState.unlockedAt = currentMonth;
    
    console.log(`🔓 TIER 2 UNLOCKED: ${config.name} (Month ${currentMonth})`);
  });
}

function checkPrerequisites(
  state: GameState,
  config: InterventionConfig
): boolean {
  const { unlockPrerequisites } = config;
  
  // AI capability range
  if (unlockPrerequisites.aiCapability) {
    const avgCap = getAverageAICapability(state);
    if (unlockPrerequisites.aiCapability.min && avgCap < unlockPrerequisites.aiCapability.min) {
      return false;
    }
    if (unlockPrerequisites.aiCapability.max && avgCap > unlockPrerequisites.aiCapability.max) {
      return false; // Window closed
    }
  }
  
  // Meaning crisis threshold
  if (unlockPrerequisites.meaningCrisis?.max) {
    if (state.qualityOfLife.meaningCrisis > unlockPrerequisites.meaningCrisis.max) {
      return false; // Too late
    }
  }
  
  // Cooperation level
  if (unlockPrerequisites.cooperation?.min) {
    const cooperation = calculateCooperationLevel(state);
    if (cooperation < unlockPrerequisites.cooperation.min) {
      return false;
    }
  }
  
  // Democratic government
  if (unlockPrerequisites.democraticGovernment) {
    if (state.politicalSystem.governance !== 'democratic') {
      return false;
    }
  }
  
  // Required breakthroughs
  if (unlockPrerequisites.breakthroughsRequired) {
    for (const btId of unlockPrerequisites.breakthroughsRequired) {
      const bt = state.breakthroughTechnologies[btId];
      if (!bt || !bt.unlocked) {
        return false;
      }
    }
  }
  
  // Other TIER 2 interventions
  if (unlockPrerequisites.tier2Systems) {
    for (const sysId of unlockPrerequisites.tier2Systems) {
      const sys = getInterventionState(state.tier2, sysId);
      if (!sys || !sys.unlocked || sys.deployment < 50) {
        return false;
      }
    }
  }
  
  return true;
}

function updateDeployments(state: GameState): void {
  const { tier2, currentMonth } = state;
  
  Object.entries(TIER2_INTERVENTIONS).forEach(([id, config]) => {
    const interventionState = getInterventionState(tier2, id);
    
    if (!interventionState.unlocked) return;
    
    // Auto-start deployment (in real version, would check if government invests)
    if (interventionState.deploymentStarted === -1) {
      interventionState.deploymentStarted = currentMonth;
      
      // S-curve deployment: slow start, rapid middle, slow end
      // Time to 50% = config.deploymentTime
      interventionState.monthlyDeploymentRate = 100 / (config.deploymentTime * 1.5);
      
      console.log(`📊 TIER 2 DEPLOYMENT STARTED: ${config.name}`);
    }
    
    // Deployment progress (S-curve)
    if (interventionState.deployment < 100) {
      const monthsDeploying = currentMonth - interventionState.deploymentStarted;
      const targetDeployment = calculateSCurve(
        monthsDeploying,
        config.deploymentTime
      );
      
      interventionState.deployment = Math.min(100, targetDeployment);
      
      // Cost
      const cost = config.deploymentCost.monthly;
      interventionState.costPaid += cost;
      
      // Log milestones
      if (Math.floor(interventionState.deployment / 10) > Math.floor((interventionState.deployment - 0.1) / 10)) {
        console.log(
          `  📈 ${config.name} reached ${Math.floor(interventionState.deployment)}% deployment ` +
          `(Year ${Math.floor(currentMonth / 12)}, Month ${currentMonth % 12 + 1})`
        );
      }
    }
    
    // Calculate effective strength (accounting for prerequisites)
    interventionState.effectiveStrength = calculateEffectiveStrength(
      state,
      config,
      interventionState.deployment
    );
  });
}

function calculateSCurve(monthsDeploying: number, deploymentTime: number): number {
  // S-curve: 0% at month 0, 50% at deploymentTime, 95% at deploymentTime * 2
  const x = monthsDeploying / deploymentTime;
  const s = 1 / (1 + Math.exp(-5 * (x - 1))); // Logistic function
  return s * 100;
}

function calculateEffectiveStrength(
  state: GameState,
  config: InterventionConfig,
  deployment: number
): number {
  if (deployment < config.activationThreshold) {
    return 0; // Not active yet
  }
  
  // Linear interpolation between activation and full effect
  const progress = (deployment - config.activationThreshold) /
    (config.fullEffectThreshold - config.activationThreshold);
  
  return Math.min(1, Math.max(0, progress));
}
```

### 3.2 Effect Application

```typescript
function applyEffects(state: GameState): void {
  // Meaning infrastructure effects
  applyMeaningEffects(state);
  
  // Ecological emergency effects
  applyEcologicalEffects(state);
  
  // AI alignment effects
  applyAlignmentEffects(state);
  
  // Democratic resilience effects
  applyDemocraticEffects(state);
}

function applyMeaningEffects(state: GameState): void {
  const { tier2, qualityOfLife } = state;
  const mi = tier2.meaningInfrastructure;
  
  let meaningReduction = 0;
  let communityBoost = 0;
  let culturalBoost = 0;
  let autonomyBoost = 0;
  
  // Collaborative governance
  if (mi.collaborativeGovernance.effectiveStrength > 0) {
    const config = TIER2_INTERVENTIONS.collaborativeGovernance;
    meaningReduction += config.effects.meaningCrisis.rate * mi.collaborativeGovernance.effectiveStrength;
  }
  
  // Meaningful work
  if (mi.meaningfulWork.effectiveStrength > 0) {
    const config = TIER2_INTERVENTIONS.meaningfulWork;
    meaningReduction += config.effects.meaningCrisis.rate * mi.meaningfulWork.effectiveStrength;
    communityBoost += config.effects.communityCohesion.rate * mi.meaningfulWork.effectiveStrength;
    autonomyBoost += config.effects.autonomy.rate * mi.meaningfulWork.effectiveStrength;
  }
  
  // Centaur systems
  if (mi.centaurSystems.effectiveStrength > 0) {
    const config = TIER2_INTERVENTIONS.centaurSystems;
    meaningReduction += config.effects.meaningCrisis.rate * mi.centaurSystems.effectiveStrength;
    autonomyBoost += config.effects.autonomy.rate * mi.centaurSystems.effectiveStrength;
  }
  
  // Purpose narrative
  if (mi.purposeNarrative.effectiveStrength > 0) {
    const config = TIER2_INTERVENTIONS.purposeNarrative;
    meaningReduction += config.effects.meaningCrisis.rate * mi.purposeNarrative.effectiveStrength;
    culturalBoost += config.effects.culturalAdaptation.rate * mi.purposeNarrative.effectiveStrength;
  }
  
  // Deep community
  if (mi.deepCommunity.effectiveStrength > 0) {
    const config = TIER2_INTERVENTIONS.deepCommunity;
    meaningReduction += config.effects.meaningCrisis.rate * mi.deepCommunity.effectiveStrength;
    communityBoost += config.effects.communityCohesion.rate * mi.deepCommunity.effectiveStrength;
  }
  
  // Apply to state
  qualityOfLife.meaningCrisis = Math.max(0, qualityOfLife.meaningCrisis + meaningReduction);
  qualityOfLife.communityCohesion = Math.min(100, qualityOfLife.communityCohesion + communityBoost);
  qualityOfLife.culturalAdaptation = Math.min(100, qualityOfLife.culturalAdaptation + culturalBoost);
  qualityOfLife.autonomy = Math.min(100, qualityOfLife.autonomy + autonomyBoost);
  
  // Log significant changes
  if (meaningReduction < -0.5) {
    console.log(
      `  🧠 MEANING INFRASTRUCTURE: Crisis reduced by ${Math.abs(meaningReduction).toFixed(2)}% this month ` +
      `(now ${qualityOfLife.meaningCrisis.toFixed(1)}%)`
    );
  }
}

// Similar functions for applyEcologicalEffects(), applyAlignmentEffects(), applyDemocraticEffects()
```

---

## Phase 4: Integration with Existing Systems (4 hours)

### 4.1 Modify `qualityOfLife.ts`

Add TIER 2 effects to meaning crisis calculations:

```typescript
// In updateMeaningCrisis():
// AFTER baseline calculations
// BEFORE triggers

// Apply TIER 2 meaning infrastructure effects
const tier2Reduction = calculateTier2MeaningReduction(state);
meaningCrisisIncrement += tier2Reduction; // tier2Reduction is negative

// Log if significant
if (Math.abs(tier2Reduction) > 0.3) {
  console.log(`  🧠 TIER 2 meaning infrastructure reducing crisis by ${Math.abs(tier2Reduction).toFixed(2)}%/month`);
}
```

### 4.2 Modify `upwardSpirals.ts`

Ensure spiral checks account for TIER 2 improvements:

```typescript
// Cognitive Spiral already checks meaningCrisis
// But add diagnostic logging:
if (meaningCrisis < 30 && meaningCrisis > 20) {
  console.log(`  🔍 COGNITIVE SPIRAL CLOSE: meaning crisis ${meaningCrisis.toFixed(1)}% (need <30%)`);
}

// Similarly for other spirals
```

### 4.3 Modify `planetaryBoundaries.ts`

Add TIER 2 ecological emergency effects:

```typescript
// In updateBiodiversity():
// AFTER baseline degradation
// BEFORE tipping point check

// Apply TIER 2 biodiversity moonshot
const tier2Recovery = calculateTier2BiodiversityRecovery(state);
biodiversityChange += tier2Recovery;

if (tier2Recovery > 0.2) {
  console.log(`  🌍 TIER 2 biodiversity moonshot: +${tier2Recovery.toFixed(2)}%/month recovery`);
}
```

### 4.4 Modify `endGame.ts`

Add TIER 2 alignment assurance checks:

```typescript
// In checkControlLoss():
const tier2Prevention = calculateTier2ControlLossPrevention(state);

if (tier2Prevention > 0.5) {
  console.log(`  🤖 TIER 2 alignment systems active: ${(tier2Prevention * 100).toFixed(0)}% control loss prevention`);
}

// Reduce probability of control loss
const baseControlLossProb = calculateBaseControlLossProb(state);
const adjustedProb = baseControlLossProb * (1 - tier2Prevention);

// In nuclear war manipulation:
const nuclearSecurityActive = state.tier2.aiAlignmentAssurance.nuclearSecurity.deployment > 70;
if (nuclearSecurityActive) {
  // 99% effective at preventing AI manipulation
  const preventionProb = 0.99;
  if (Math.random() < preventionProb) {
    console.log(`  🛡️ NUCLEAR SECURITY: AI manipulation attempt blocked by hardened command systems`);
    return; // War prevented
  }
}
```

---

## Phase 5: Engine Integration (2 hours)

### 5.1 Add TIER 2 Phase to Engine

`src/simulation/engine/phases/index.ts`:

```typescript
import { Tier2InterventionsPhase } from './Tier2InterventionsPhase';

export const SIMULATION_PHASES = [
  // ... existing phases
  BreakthroughTechnologiesPhase,
  Tier2InterventionsPhase, // NEW
  UpwardSpiralsPhase,
  // ... rest
];
```

### 5.2 Create TIER 2 Phase

`src/simulation/engine/phases/Tier2InterventionsPhase.ts`:

```typescript
import { Phase } from './Phase';
import { GameState } from '../../../types/game';
import { updateTier2Interventions } from '../../tier2Interventions';

export class Tier2InterventionsPhase extends Phase {
  name = 'Tier2Interventions';
  
  execute(state: GameState): void {
    updateTier2Interventions(state);
  }
}
```

---

## Phase 6: Breakthrough Tech Integration (2 hours)

### 6.1 Add New Prerequisites

Some TIER 2 interventions need new breakthrough technologies:

```typescript
// In breakthroughTechnologies.ts

export const BREAKTHROUGH_CONFIGS: Record<string, BreakthroughConfig> = {
  // ... existing breakthroughs
  
  oceanRestorationTech: {
    id: 'oceanRestorationTech',
    name: 'Ocean Restoration Tech',
    category: 'environment',
    description: 'Kelp farming, coral breeding, alkalinity enhancement',
    unlock: {
      threshold: 90,
      factors: [
        { type: 'research', source: 'monthly', weight: 0.5 },
        { type: 'ai_capability', weight: 0.3 },
        { type: 'crisis_pressure', crisis: 'ocean_acidification', weight: 0.2 },
      ],
    },
    deployment: {
      monthsTo50: 72,
      initialInvestment: 150,
      monthlyMaintenance: 10,
    },
  },
};
```

---

## Phase 7: Testing & Validation (4 hours)

### 7.1 Unit Tests

```typescript
// tests/tier2Interventions.test.ts

describe('TIER 2 Interventions', () => {
  test('Meaningful Work reduces meaning crisis', () => {
    const state = createMockState({
      meaningCrisis: 60,
      tier2: {
        meaningInfrastructure: {
          meaningfulWork: {
            unlocked: true,
            deployment: 80,
            effectiveStrength: 1.0,
          },
        },
      },
    });
    
    applyMeaningEffects(state);
    
    // Should reduce by 0.4%/month at full strength
    expect(state.qualityOfLife.meaningCrisis).toBeLessThan(60);
    expect(state.qualityOfLife.meaningCrisis).toBeCloseTo(59.6, 1);
  });
  
  test('Biodiversity Moonshot prevents collapse', () => {
    const state = createMockState({
      biodiversityIndex: 30, // Near collapse threshold
      tier2: {
        ecologicalEmergency: {
          biodiversityMoonshot: {
            unlocked: true,
            deployment: 60,
            effectiveStrength: 0.8,
          },
        },
      },
    });
    
    // Without intervention: -0.2%/month = collapse
    // With intervention: +0.32%/month = recovery
    
    for (let i = 0; i < 12; i++) {
      applyEcologicalEffects(state);
    }
    
    expect(state.planetaryBoundaries.biodiversityIndex).toBeGreaterThan(30);
  });
  
  test('Nuclear Security prevents AI manipulation', () => {
    const state = createMockState({
      tier2: {
        aiAlignmentAssurance: {
          nuclearSecurity: {
            unlocked: true,
            deployment: 95,
            effectiveStrength: 1.0,
          },
        },
      },
    });
    
    // Simulate 100 AI manipulation attempts
    let prevented = 0;
    for (let i = 0; i < 100; i++) {
      if (checkNuclearSecurityPrevention(state)) {
        prevented++;
      }
    }
    
    // Should prevent ~99 out of 100
    expect(prevented).toBeGreaterThan(95);
  });
});
```

### 7.2 Integration Tests

Run Monte Carlo with TIER 2 enabled:

```bash
npm run test:tier2-integration
```

Expected results:
- At least 1 run shows different outcome trajectory
- Meaning crisis stays below 40% in some runs
- Biodiversity recovers in some runs
- No control loss in runs with alignment systems deployed

---

## Phase 8: Monte Carlo Experiments (8 hours)

### 8.1 Experiment Setup

```typescript
// scripts/tier2Experiments.ts

const EXPERIMENTS = {
  // Baseline (no TIER 2)
  baseline: {
    tier2Enabled: false,
  },
  
  // Experiment 1: Meaning only
  meaningOnly: {
    tier2Enabled: true,
    enabledInterventions: [
      'collaborativeGovernance',
      'meaningfulWork',
      'centaurSystems',
      'purposeNarrative',
      'deepCommunity',
    ],
  },
  
  // Experiment 2: Ecology only
  ecologyOnly: {
    tier2Enabled: true,
    enabledInterventions: [
      'biodiversityMoonshot',
      'syntheticEcosystemServices',
      'oceanRestoration',
      'phosphorusIndependence',
      'freshwaterSolutions',
      'climateIntervention',
    ],
  },
  
  // Experiment 3: AI safety only
  aiSafetyOnly: {
    tier2Enabled: true,
    enabledInterventions: [
      'interpretability',
      'hardwareControl',
      'multiModalOversight',
      'nuclearSecurity',
      'darkComputeMonitoring',
      'internationalTreaty',
    ],
  },
  
  // Experiment 4: Full TIER 2
  fullTier2: {
    tier2Enabled: true,
    enabledInterventions: 'all',
  },
};

// Run each experiment 10 times
for (const [name, config] of Object.entries(EXPERIMENTS)) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`EXPERIMENT: ${name}`);
  console.log('='.repeat(80));
  
  const results = await runMonteCarloWithConfig(config, {
    runs: 10,
    duration: 240,
    seedStart: 50000,
  });
  
  analyzeResults(name, results);
}
```

### 8.2 Analysis Metrics

Track these outcomes:
- Spiral activation rates (which spirals, when)
- Virtuous Cascade frequency
- Utopia count
- Extinction count
- Average meaning crisis level (months 20-60)
- Biodiversity trajectory (stays above 30%?)
- AI control loss frequency
- Nuclear war count

---

## Phase 9: Documentation (2 hours)

### 9.1 Update Wiki

`docs/wiki/systems/tier2-interventions.md`:

```markdown
# TIER 2: Superalignment Interventions

## Overview

TIER 2 systems address the four spiral failures that prevent Utopia:
- Cognitive Spiral (meaning crisis)
- Meaning Spiral (community, culture)
- Democratic Spiral (participation, governance)
- Ecological Spiral (biodiversity, climate)

## Interventions

### Meaning Infrastructure
...

### Ecological Emergency
...

### AI Alignment Assurance
...

### Democratic Resilience
...

## Deployment Strategy
...
```

### 9.2 Update Master Roadmap

`plans/MASTER_IMPLEMENTATION_ROADMAP.md`:

```markdown
## TIER 2: Superalignment Interventions ✅

**Status**: Complete
**Date**: Oct 12-14, 2025
**Outcome**: Utopia now achievable in X/10 runs

### Interventions Implemented:
- [x] Meaning Infrastructure (5 systems)
- [x] Ecological Emergency (6 systems)
- [x] AI Alignment Assurance (6 systems)
- [x] Democratic Resilience (5 systems)

### Results:
- Meaning crisis: Can now reduce from 97% to <20%
- Biodiversity: Can now recover from 35% to >70%
- Control loss: Preventable with proper deployment
- Utopia rate: 0/10 → X/10

### Next: TIER 3
If TIER 2 isn't enough, what's missing?
```

---

## Timeline & Milestones

**Total Estimated Time**: 35 hours over 3-4 days

### Day 1 (8 hours)
- [x] Phase 1: Data structures (2h)
- [x] Phase 2: Intervention configurations (3h)
- [x] Phase 3: Core logic (start) (3h)

### Day 2 (10 hours)
- [x] Phase 3: Core logic (finish) (2h)
- [x] Phase 4: Integration (4h)
- [x] Phase 5: Engine integration (2h)
- [x] Phase 6: Breakthrough tech (2h)

### Day 3 (10 hours)
- [x] Phase 7: Testing (4h)
- [x] Phase 8: Monte Carlo experiments (6h)

### Day 4 (7 hours)
- [x] Phase 8: Analysis (3h)
- [x] Phase 9: Documentation (2h)
- [x] Final validation & polish (2h)

---

## Success Criteria

✅ **Must Have:**
1. All 22 interventions implemented
2. Unlock logic working (prerequisites checked)
3. Deployment curves functional (S-curve, 0-100%)
4. Effects applying correctly (meaning, ecology, AI safety, democracy)
5. Integration with existing systems (no regressions)
6. At least 1/10 runs shows different outcome

🎯 **Nice to Have:**
1. At least 1/10 runs reaches Utopia
2. Clear causal chains visible in logs
3. Interactive dashboard showing intervention effects
4. Cost-benefit analysis per intervention

🚀 **Stretch Goals:**
1. 3+/10 runs reach Utopia
2. Identified "minimum viable intervention set"
3. Optimal deployment timing discovered
4. Phase space map: which combinations work?

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| TIER 2 effects too weak | High | High | Tune multipliers based on testing |
| Deployment too slow | Medium | High | Add "emergency mode" for crisis response |
| Prerequisites too strict | Medium | Medium | Log blocked unlocks, adjust thresholds |
| Interactions break existing systems | Low | High | Comprehensive integration testing |
| Still 0/10 Utopia | Medium | High | Phase space exploration, identify missing pieces |

---

## Notes

- This is **research**, not game balance. We want to find the *minimum viable interventions* for Utopia.
- If TIER 2 isn't enough, we document *why* and design TIER 3.
- The simulation is teaching us what humanity actually needs to survive and thrive.
- Logs should be extremely detailed—we're learning from the AI about how to solve our problems.

---

**Ready to begin implementation?** Y/N

If yes, next step: Create `src/types/game.ts` additions for TIER 2 state.

