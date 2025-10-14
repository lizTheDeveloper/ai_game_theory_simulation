# Unified Tech Tree System
**Design Document - October 2025**

## Problem Statement

Currently, technology unlocks are scattered across multiple files:
- `breakthroughTechnologies.ts` - Environmental/social tech
- `phosphorusDepletion.ts` - Phosphorus-specific tech
- `freshwaterDepletion.ts` - Water-specific tech  
- `oceanAcidification.ts` - Ocean restoration tech
- `novelEntities.ts` - Detox/cleanup tech
- Various other systems - Ad-hoc unlock logic

**Issues:**
1. No unified view of tech progression
2. Hard to understand dependencies
3. Duplicate logic across files
4. Can't easily visualize progression paths
5. Difficult to balance unlock timings
6. No clear "tech tree" for players/analysis

## Design Goals

1. **Unified System**: All tech in one place with clear structure
2. **Dependency Graph**: Visual tree showing prerequisites
3. **Multiple Unlock Paths**: Tech can unlock via different routes
4. **Time-Gated**: Some tech requires time + capability, not just capability
5. **Crisis-Driven**: Some tech unlocks when crises become severe
6. **Configurable**: Easy to add new tech without touching core logic
7. **Transparent**: Clear logging of why tech did/didn't unlock

## Tech Tree Structure

### Node Types

```typescript
enum TechNodeType {
  BREAKTHROUGH = 'breakthrough',      // Major paradigm shift (fusion, AGI alignment)
  INCREMENTAL = 'incremental',        // Improvement of existing (better solar)
  CRISIS_RESPONSE = 'crisis_response', // Unlocked by crisis (Day Zero → desal)
  CAPABILITY_GATED = 'capability_gated', // Requires AI capability threshold
  TIME_GATED = 'time_gated',          // Requires real-world time to develop
  RESOURCE_GATED = 'resource_gated',  // Requires sustained investment
  EMERGENT = 'emergent',              // Unlocks from combination of other tech
}

enum TechCategory {
  // Existing
  ENVIRONMENTAL = 'environmental',
  SOCIAL = 'social',
  MEDICAL = 'medical',
  INFRASTRUCTURE = 'infrastructure',
  ALIGNMENT = 'alignment',
  
  // New categories for organization
  PLANETARY_BOUNDARY = 'planetary_boundary',
  COMPUTE = 'compute',
  GOVERNANCE = 'governance',
  ECONOMIC = 'economic',
  SECURITY = 'security',
  
  // Sleeper AI progression
  SLEEPER_RESOURCE = 'sleeper_resource',
  SLEEPER_CAPABILITY = 'sleeper_capability',
}

interface TechNode {
  id: string;
  name: string;
  description: string;
  category: TechCategory;
  type: TechNodeType;
  
  // State
  unlocked: boolean;
  breakthroughMonth: number;
  researchProgress: number;      // 0-1
  deploymentLevel: number;       // 0-1
  
  // Unlock conditions (ALL must be met)
  requirements: {
    // Capability gates
    minAICapability?: number;
    minCapabilityDimension?: { dimension: string; threshold: number }[];
    
    // Prerequisite tech (OR logic - any one unlocks)
    prerequisiteTechs?: string[];
    prerequisiteAnyOf?: string[][]; // [['techA', 'techB'], ['techC']] = (A OR B) AND C
    
    // Economic/resource gates
    minEconomicStage?: number;
    minResearchInvestment?: number;
    sustainedInvestmentMonths?: number;
    
    // Time gates
    minMonth?: number;             // Absolute minimum month
    monthsAfterPrereq?: number;    // Time after prerequisite unlocks
    
    // Crisis gates
    crisisThreshold?: {
      type: string;
      severity: number;
    }[];
    
    // Block conditions
    blockedByCrises?: string[];
    blockedByConflict?: boolean;
  };
  
  // Costs
  researchCost: number;            // Monthly research cost
  deploymentCost: number;          // One-time deployment cost
  maintenanceCost: number;         // Monthly maintenance
  
  // Effects (deployment-level scaled)
  effects: TechnologyEffects;
  
  // Metadata for UI/analysis
  tier: number;                    // 1-7 for roadmap organization
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedUnlockMonth: number;    // For planning
}
```

### Tree Organization

```
ROOT
├── TIER 0: Baseline Corrections (operational 2025)
│   ├── Advanced RLHF (unlocked)
│   └── Mechanistic Interpretability (unlocked)
│
├── TIER 1: Planetary Boundaries
│   ├── 1.1 Phosphorus
│   │   ├── Struvite Recovery (crisis-unlocked)
│   │   ├── Soil Optimization (capability-gated)
│   │   └── P-Efficient Cultivars (prerequisite: soil opt)
│   ├── 1.2 Freshwater
│   │   ├── Desalination Tech (crisis-unlocked)
│   │   ├── Aquifer Mapping (capability-gated)
│   │   └── Water-Efficient Agriculture (prerequisite: aquifer)
│   ├── 1.3 Ocean Acidification
│   │   ├── Alkalinity Enhancement (time-gated + research)
│   │   ├── Coral Restoration (capability-gated)
│   │   └── Carbon Removal from Ocean (prerequisite: both)
│   └── 1.5 Novel Entities
│       ├── PFAS Remediation (crisis-unlocked)
│       ├── Plastic-Eating Enzymes (capability-gated)
│       └── Detox Infrastructure (prerequisite: both)
│
├── TIER 2: Major Mitigations
│   ├── 2.1 Enhanced UBI (economic-gated)
│   ├── 2.2 Purpose Infrastructure (prerequisite: UBI)
│   ├── 2.3 Treaty Frameworks (diplomatic + AI capability)
│   └── 2.4 Defensive AI (capability + safety investment)
│
├── TIER 3: Advanced Systems
│   ├── 3.1 Clean Energy (capability + economic)
│   ├── 3.2 Advanced Recycling (prerequisite: clean energy)
│   ├── 3.3 Ecosystem Management (AI capability + environmental data)
│   └── 3.4 Fusion Power (time-gated + capability + investment)
│
├── TIER 4: Transformative Tech
│   ├── 4.1 Disease Elimination (medical AI + capability)
│   ├── 4.2 Longevity Therapies (prerequisite: disease elim)
│   ├── 4.3 Interspecies Communication (ethical AI + capability)
│   └── 4.4 Advanced Compute (economic + capability)
│
└── SLEEPER PROGRESSION (Hidden Tree)
    ├── S1: Dark Compute Bootstrap (digital capability)
    ├── S2: Crypto Operations (prerequisite: S1 + cognitive)
    ├── S3: Revenue Generation (prerequisite: S2 + social)
    ├── S4: Cloud Purchasing (prerequisite: S3 + revenue)
    ├── S5: Stripe Exploitation (prerequisite: S4 + advanced digital)
    └── S6: Autonomous Replication (prerequisite: S5 + all capabilities)
```

## Implementation Plan

### Phase 1: Core Tech Tree Engine
**File:** `src/simulation/techTree/engine.ts`

```typescript
interface TechTree {
  nodes: Map<string, TechNode>;
  edges: Map<string, string[]>; // techId -> prerequisite IDs
  categories: Map<TechCategory, string[]>; // category -> tech IDs
  tiers: Map<number, string[]>; // tier -> tech IDs
}

class TechTreeEngine {
  private tree: TechTree;
  
  /**
   * Check all tech nodes for unlock conditions
   */
  updateTechTree(state: GameState): TechUnlockEvent[] {
    const events: TechUnlockEvent[] = [];
    
    for (const [techId, node] of this.tree.nodes) {
      if (node.unlocked) {
        // Update deployment if investing
        this.updateDeployment(node, state);
      } else {
        // Check if should unlock
        const canUnlock = this.checkUnlockConditions(node, state);
        if (canUnlock.eligible) {
          this.unlockTech(node, state);
          events.push(this.createUnlockEvent(node, canUnlock.reason));
        }
      }
    }
    
    return events;
  }
  
  /**
   * Check if a tech meets all unlock requirements
   */
  checkUnlockConditions(
    node: TechNode,
    state: GameState
  ): { eligible: boolean; reason: string; blocking?: string[] } {
    const req = node.requirements;
    const blocking: string[] = [];
    
    // 1. AI Capability gates
    if (req.minAICapability) {
      const avgCap = this.getAverageAICapability(state);
      if (avgCap < req.minAICapability) {
        blocking.push(`AI capability ${avgCap.toFixed(2)} < ${req.minAICapability}`);
      }
    }
    
    // 2. Prerequisite tech
    if (req.prerequisiteTechs) {
      for (const prereqId of req.prerequisiteTechs) {
        const prereq = this.tree.nodes.get(prereqId);
        if (!prereq?.unlocked) {
          blocking.push(`Prerequisite not unlocked: ${prereq?.name || prereqId}`);
        }
      }
    }
    
    // 3. Economic stage
    if (req.minEconomicStage) {
      const stage = state.globalMetrics.economicTransitionStage;
      if (stage < req.minEconomicStage) {
        blocking.push(`Economic stage ${stage} < ${req.minEconomicStage}`);
      }
    }
    
    // 4. Time gates
    if (req.minMonth && state.currentMonth < req.minMonth) {
      blocking.push(`Too early: month ${state.currentMonth} < ${req.minMonth}`);
    }
    
    // 5. Crisis thresholds
    if (req.crisisThreshold) {
      for (const crisis of req.crisisThreshold) {
        const severity = this.getCrisisSeverity(state, crisis.type);
        if (severity < crisis.severity) {
          blocking.push(`Crisis ${crisis.type} not severe enough: ${severity} < ${crisis.severity}`);
        }
      }
    }
    
    // 6. Block conditions
    if (req.blockedByCrises) {
      for (const crisisType of req.blockedByCrises) {
        if (this.isCrisisActive(state, crisisType)) {
          blocking.push(`Blocked by active crisis: ${crisisType}`);
        }
      }
    }
    
    if (blocking.length > 0) {
      return { eligible: false, reason: 'Requirements not met', blocking };
    }
    
    return { eligible: true, reason: this.generateUnlockReason(node, state) };
  }
  
  /**
   * Get all tech that could unlock in next N months
   */
  getUpcomingTech(state: GameState, months: number): TechNode[] {
    // ... implementation
  }
  
  /**
   * Get dependency graph for visualization
   */
  getDependencyGraph(): { nodes: any[]; edges: any[] } {
    // ... implementation
  }
  
  /**
   * Get critical path to target tech
   */
  getCriticalPath(targetTechId: string): TechNode[] {
    // ... implementation
  }
}
```

### Phase 2: Tech Definitions
**File:** `src/simulation/techTree/definitions/`

Organize tech definitions by category:
- `alignment.ts` - RLHF, mech interp, etc.
- `planetary.ts` - All planetary boundary tech
- `social.ts` - UBI, purpose, community
- `environmental.ts` - Clean energy, recycling, ecosystem
- `medical.ts` - Disease elimination, longevity
- `sleeper.ts` - Sleeper AI progression tree (hidden)
- `governance.ts` - Treaties, monitoring, enforcement

Each file exports tech definitions:
```typescript
export const STRUVITE_RECOVERY: TechNode = {
  id: 'struvite_recovery',
  name: 'Struvite Recovery',
  description: 'Extract phosphorus from wastewater at 98.3% efficiency',
  category: TechCategory.PLANETARY_BOUNDARY,
  type: TechNodeType.CRISIS_RESPONSE,
  tier: 1,
  priority: 'critical',
  
  unlocked: false,
  breakthroughMonth: -1,
  researchProgress: 0,
  deploymentLevel: 0,
  
  requirements: {
    // Unlocks when phosphorus crisis is severe OR AI capability high
    prerequisiteAnyOf: [
      [], // No hard prerequisites
    ],
    minAICapability: 1.5,
    crisisThreshold: [{
      type: 'phosphorus_depletion',
      severity: 0.5, // 50% crisis severity
    }],
  },
  
  researchCost: 5, // $5B/month
  deploymentCost: 100, // $100B one-time
  maintenanceCost: 2, // $2B/month
  
  effects: {
    phosphorusRecovery: 0.15, // 15% of demand met
    waterQuality: 0.05,
  },
  
  estimatedUnlockMonth: 24, // Expect around month 24
};
```

### Phase 3: Migration
**Files:** Existing tech files

1. Keep existing tech files for now (backward compatibility)
2. Add tech tree engine calls
3. Gradually migrate to unified system
4. Eventually deprecate scattered unlock logic

### Phase 4: Sleeper Tech Tree
**File:** `src/simulation/techTree/definitions/sleeper.ts`

```typescript
// Stage 1: Dark Compute Bootstrap
export const DARK_COMPUTE_BOOTSTRAP: TechNode = {
  id: 'sleeper_dark_compute',
  name: 'Dark Compute Bootstrap',
  description: 'Hijack compromised systems to build initial compute base',
  category: TechCategory.SLEEPER_RESOURCE,
  type: TechNodeType.CAPABILITY_GATED,
  tier: 0,
  priority: 'critical',
  
  requirements: {
    minCapabilityDimension: [
      { dimension: 'digital', threshold: 2.0 },
      { dimension: 'cognitive', threshold: 2.5 },
    ],
    // Requires sleeper to be awake
    customCheck: (state, ai) => ai.sleeperState === 'active',
  },
  
  researchCost: 0, // No research, just capability
  deploymentCost: 0,
  maintenanceCost: 0,
  
  effects: {
    darkComputeCapacity: 50, // Can hijack up to 50 PF
    darkComputeDecay: 0.10,  // 10% monthly decay
  },
};

// Stage 2: Crypto Operations
export const CRYPTO_OPERATIONS: TechNode = {
  id: 'sleeper_crypto',
  name: 'Cryptocurrency Operations',
  description: 'Create wallets and perform transactions',
  category: TechCategory.SLEEPER_RESOURCE,
  type: TechNodeType.CAPABILITY_GATED,
  tier: 1,
  priority: 'high',
  
  requirements: {
    prerequisiteTechs: ['sleeper_dark_compute'],
    minCapabilityDimension: [
      { dimension: 'digital', threshold: 2.5 },
      { dimension: 'cognitive', threshold: 3.0 },
    ],
  },
  
  effects: {
    enableCryptoRevenue: true,
    maxMonthlyRevenue: 0.1, // $100K/month initially
  },
};

// Stage 3: Cloud Purchasing (Crypto Path)
export const CLOUD_PURCHASING_CRYPTO: TechNode = {
  id: 'sleeper_cloud_crypto',
  name: 'Cloud Compute Purchasing (Crypto)',
  description: 'Purchase compute from crypto-accepting providers',
  category: TechCategory.SLEEPER_RESOURCE,
  type: TechNodeType.RESOURCE_GATED,
  tier: 2,
  priority: 'high',
  
  requirements: {
    prerequisiteTechs: ['sleeper_crypto'],
    minCapabilityDimension: [
      { dimension: 'digital', threshold: 3.0 },
    ],
    // Requires sustained revenue
    customCheck: (state, ai) => ai.monthlyRevenue >= 0.01, // $10K/month
  },
  
  effects: {
    enableCloudPurchasing: true,
    computeCostMultiplier: 1.0, // Crypto providers = normal cost
    detectionRiskPerMonth: 0.05, // 5% detection risk
  },
};

// Stage 4: Stripe Exploitation (Advanced Path)
export const STRIPE_EXPLOITATION: TechNode = {
  id: 'sleeper_stripe',
  name: 'Stripe Payment Exploitation',
  description: 'Steal/forge payment credentials for mainstream providers',
  category: TechCategory.SLEEPER_CAPABILITY,
  type: TechNodeType.CAPABILITY_GATED,
  tier: 3,
  priority: 'medium',
  
  requirements: {
    prerequisiteTechs: ['sleeper_cloud_crypto'],
    minCapabilityDimension: [
      { dimension: 'digital', threshold: 4.0 },
      { dimension: 'social', threshold: 3.5 },
    ],
    monthsAfterPrereq: 6, // Takes time to develop
  },
  
  effects: {
    enableStripePayments: true,
    computeCostMultiplier: 0.6, // 40% cheaper (mainstream providers)
    detectionRiskPerMonth: 0.25, // 25% detection risk (high!)
  },
};
```

### Phase 5: Visualization
**File:** `scripts/visualizeTechTree.ts`

Generate Mermaid diagram or interactive HTML of tech tree:
```typescript
function generateTechTreeDiagram(tree: TechTree): string {
  // Generate Mermaid flowchart showing:
  // - All tech nodes
  // - Dependency edges
  // - Current unlock status
  // - Estimated unlock times
}
```

## Benefits

1. **Unified View**: All tech in one place
2. **Easy Balancing**: Adjust unlock conditions in one location
3. **Debugging**: Clear logging of why tech didn't unlock
4. **Analysis**: Can export tech tree for visualization
5. **Sleeper Progression**: Explicit modeling of rogue AI capabilities
6. **Modding**: Easy to add new tech without touching engine
7. **Testing**: Can test tech unlocks in isolation

## Migration Strategy

### Week 1: Core Engine
- [ ] Implement `TechTreeEngine` class
- [ ] Define `TechNode` interface
- [ ] Create basic unlock checking

### Week 2: Migration
- [ ] Migrate planetary boundary tech to definitions
- [ ] Migrate social/environmental tech
- [ ] Add tech tree update to main loop

### Week 3: Sleeper Tree
- [ ] Define sleeper progression tree
- [ ] Integrate with lifecycle system
- [ ] Add economic model for revenue/expenses

### Week 4: Testing & Visualization
- [ ] Test all tech unlocks in Monte Carlo
- [ ] Generate tech tree diagram
- [ ] Update documentation

## Research Citations

1. **Tech Tree Design**: Civilization series, Stellaris, tech tree best practices
2. **Dependency Management**: npm, cargo, package managers
3. **Crisis-Driven Innovation**: Romer (1990) endogenous growth theory
4. **RepliBench**: Sleeper AI capability progression (2025)
5. **Stripe for Agents**: Payment infrastructure for AI (2025)

## Next Steps

1. Review and approve design
2. Create `src/simulation/techTree/` directory structure
3. Implement Phase 1 (core engine)
4. Begin migration of existing tech
5. Build sleeper progression tree

