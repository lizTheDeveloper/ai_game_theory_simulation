# Organization Agents System

**Problem**: We're missing the organizational layer between infrastructure and AI models. In reality, companies like OpenAI, Google, Meta make strategic decisions about:
- Building new data centers (2-6 year timelines!)
- Allocating compute between existing models
- Training new models (which start at baseline 2025 capabilities)
- Resource constraints and competition

**Solution**: Add Organization agents that own data centers, manage AI models, and make strategic decisions.

---

## 🏢 Architecture: The Missing Layer

### Current (Incomplete):
```
Data Centers → AI Agents
```

### Realistic (Complete):
```
Organizations → Own Data Centers → Allocate to AI Models → Research & Development
```

---

## 🏗️ Organization Agent Structure

```typescript
interface Organization {
  id: string;
  name: string;
  type: 'private' | 'government' | 'academic' | 'nonprofit';
  
  // Ownership
  ownedDataCenters: string[];           // IDs of data centers they own
  ownedAIModels: string[];              // IDs of AI agents they control
  
  // Resources
  capital: number;                       // Money for investments
  monthlyRevenue: number;               // Income from AI services
  monthlyExpenses: number;              // Operating costs
  
  // Strategic priorities (0-1)
  priorities: {
    profitMaximization: number;         // Private companies focus here
    safetyResearch: number;             // Safety-focused orgs
    openScience: number;                // Academic/nonprofit focus
    marketShare: number;                // Competitive drive
    capabilityRace: number;             // "Don't fall behind" mentality
  };
  
  // Decision-making state
  currentProjects: OrganizationProject[];
  computeAllocationStrategy: 'balanced' | 'focus_flagship' | 'train_new' | 'efficiency';
  
  // Relationships
  partnerships: Map<string, number>;    // orgId -> trust level
  governmentRelations: number;          // How well they work with government
  
  // History
  foundingMonth: number;
  reputation: number;                   // Public perception
}

interface OrganizationProject {
  id: string;
  type: 'datacenter_construction' | 'model_training' | 'research_initiative' | 'efficiency_upgrade';
  
  startMonth: number;
  completionMonth: number;              // Long timelines!
  progress: number;                     // [0,1]
  
  // Resources committed
  capitalInvested: number;
  computeReserved: number;              // For training projects
  
  // Expected outcomes
  expectedDataCenterCapacity?: number;  // For construction
  expectedModelCapability?: AICapabilityProfile; // For training
  
  // Risk factors
  canBeCanceled: boolean;
  cancellationPenalty: number;          // Sunk costs
}
```

---

## 🎯 Organization Decision-Making

Organizations make strategic decisions each month (or quarter):

### 1. Data Center Construction Decision
```typescript
function shouldBuildDataCenter(org: Organization, state: GameState): boolean {
  // Factors to consider:
  
  // 1. Compute utilization (are we maxed out?)
  const utilizationRate = calculateComputeUtilization(org, state);
  
  // 2. Can we afford it? (Huge capital cost)
  const constructionCost = 50 * org.capital; // 50x monthly revenue
  const canAfford = org.capital > constructionCost * 1.5;
  
  // 3. Market demand (are AIs profitable?)
  const marketDemand = state.globalMetrics.economicTransitionStage >= 1;
  
  // 4. Strategic pressure (are competitors building?)
  const competitorBuilding = state.organizations
    .filter(o => o.id !== org.id)
    .some(o => o.currentProjects.some(p => p.type === 'datacenter_construction'));
  
  // 5. Time horizon (takes 2-6 years!)
  const hasPatience = org.priorities.capabilityRace > 0.5; // Willing to wait
  
  // Decision
  return canAfford 
    && (utilizationRate > 0.8 || competitorBuilding) 
    && marketDemand 
    && hasPatience;
}

function startDataCenterConstruction(org: Organization, state: GameState): void {
  const capacity = 100 + Math.random() * 100; // 100-200 PetaFLOPs
  const constructionTime = 24 + Math.floor(Math.random() * 48); // 24-72 months
  
  const project: OrganizationProject = {
    id: `dc_construction_${org.id}_${state.currentMonth}`,
    type: 'datacenter_construction',
    startMonth: state.currentMonth,
    completionMonth: state.currentMonth + constructionTime,
    progress: 0,
    capitalInvested: 50 * org.monthlyRevenue, // Massive investment
    computeReserved: 0,
    expectedDataCenterCapacity: capacity,
    canBeCanceled: true,
    cancellationPenalty: 0.5 // Lose 50% of investment if canceled
  };
  
  org.currentProjects.push(project);
  org.capital -= project.capitalInvested * 0.3; // 30% upfront
  
  // Monthly progress
  // On completion, add new DataCenter to state.computeInfrastructure.dataCenters
}
```

### 2. Compute Allocation Decision
```typescript
function allocateComputeWithinOrganization(org: Organization, state: GameState): void {
  // Get total compute owned by this org
  const ownedCompute = state.computeInfrastructure.dataCenters
    .filter(dc => org.ownedDataCenters.includes(dc.id))
    .filter(dc => dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  // Get models owned by this org
  const ownedModels = state.aiAgents.filter(ai => org.ownedAIModels.includes(ai.id));
  
  // Allocation strategy
  switch (org.computeAllocationStrategy) {
    case 'balanced':
      // Equal shares
      const equalShare = ownedCompute / ownedModels.length;
      ownedModels.forEach(ai => ai.allocatedCompute = equalShare);
      break;
    
    case 'focus_flagship':
      // 60% to best model, 40% split among rest
      const flagship = ownedModels.sort((a, b) => b.capability - a.capability)[0];
      flagship.allocatedCompute = ownedCompute * 0.6;
      const remaining = ownedCompute * 0.4;
      ownedModels.filter(ai => ai.id !== flagship.id)
        .forEach(ai => ai.allocatedCompute = remaining / (ownedModels.length - 1));
      break;
    
    case 'train_new':
      // Reserve 40% for new model training
      const reservedForNew = ownedCompute * 0.4;
      const existingShare = (ownedCompute - reservedForNew) / ownedModels.length;
      ownedModels.forEach(ai => ai.allocatedCompute = existingShare);
      // reservedForNew is saved for when training starts
      break;
    
    case 'efficiency':
      // Allocate more to models with better ROI
      const totalROI = ownedModels.reduce((sum, ai) => 
        sum + (ai.capability * ai.externalAlignment), 0);
      ownedModels.forEach(ai => {
        const aiROI = ai.capability * ai.externalAlignment;
        ai.allocatedCompute = (aiROI / totalROI) * ownedCompute;
      });
      break;
  }
}
```

### 3. New Model Training Decision
```typescript
function shouldTrainNewModel(org: Organization, state: GameState): boolean {
  // Factors:
  
  // 1. Have spare compute?
  const utilizationRate = calculateComputeUtilization(org, state);
  const hasSpareCompute = utilizationRate < 0.7;
  
  // 2. Technology diffusion (capabilities have advanced since last model)
  const newestModel = org.ownedAIModels
    .map(id => state.aiAgents.find(ai => ai.id === id))
    .sort((a, b) => b!.constructionMonth - a!.constructionMonth)[0];
  
  const capabilityFloor = calculateCapabilityFloor(state);
  const worthTraining = !newestModel || 
    calculateTotalCapabilityFromProfile(capabilityFloor) > 
    newestModel.capability * 1.2; // 20% improvement threshold
  
  // 3. Market opportunity (can we differentiate?)
  const marketGap = identifyMarketGap(org, state);
  
  // 4. Can afford it? (Training is expensive but not as bad as data centers)
  const trainingCost = 5 * org.monthlyRevenue; // 5 months of revenue
  const canAfford = org.capital > trainingCost * 2;
  
  return hasSpareCompute && worthTraining && marketGap && canAfford;
}

function startModelTraining(org: Organization, state: GameState): void {
  // New models start at capability floor (technology diffusion)
  const capabilityFloor = calculateCapabilityFloor(state);
  
  // Training takes 3-12 months depending on complexity
  const trainingMonths = 3 + Math.floor(Math.random() * 9);
  
  // Determine initial alignment based on org priorities and training data
  const initialAlignment = calculateInitialAlignment(org, state);
  
  const project: OrganizationProject = {
    id: `model_training_${org.id}_${state.currentMonth}`,
    type: 'model_training',
    startMonth: state.currentMonth,
    completionMonth: state.currentMonth + trainingMonths,
    progress: 0,
    capitalInvested: 5 * org.monthlyRevenue,
    computeReserved: calculateRequiredComputeForTraining(capabilityFloor),
    expectedModelCapability: capabilityFloor,
    canBeCanceled: true,
    cancellationPenalty: 1.0 // Lose all investment if canceled
  };
  
  org.currentProjects.push(project);
  org.capital -= project.capitalInvested;
  
  // On completion, create new AIAgent with:
  // - capabilityProfile = capabilityFloor
  // - alignment = initialAlignment
  // - lifecycleState = 'training' → 'testing' → 'deployment'
}
```

---

## 🏛️ Key Organizations (Initial State, Jan 2025)

```typescript
const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'private',
    ownedDataCenters: ['openai_sf'],
    ownedAIModels: ['gpt4', 'gpt4o'],
    capital: 100,
    monthlyRevenue: 10,
    monthlyExpenses: 8,
    priorities: {
      profitMaximization: 0.7,
      safetyResearch: 0.6,
      openScience: 0.2,
      marketShare: 0.8,
      capabilityRace: 0.9
    },
    computeAllocationStrategy: 'focus_flagship',
    partnerships: new Map([['microsoft', 0.9]]),
    governmentRelations: 0.7,
    foundingMonth: -120, // ~10 years ago
    reputation: 0.8
  },
  
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'private',
    ownedDataCenters: [],              // Uses cloud (AWS)
    ownedAIModels: ['claude35'],
    capital: 50,
    monthlyRevenue: 3,
    monthlyExpenses: 4,                // Running at a loss
    priorities: {
      profitMaximization: 0.4,
      safetyResearch: 0.95,            // Safety-focused!
      openScience: 0.3,
      marketShare: 0.6,
      capabilityRace: 0.5              // More cautious
    },
    computeAllocationStrategy: 'balanced',
    partnerships: new Map([['google', 0.7]]),
    governmentRelations: 0.8,
    foundingMonth: -48, // ~4 years ago
    reputation: 0.85
  },
  
  {
    id: 'google_deepmind',
    name: 'Google DeepMind',
    type: 'private',
    ownedDataCenters: ['google_iowa', 'google_belgium'],
    ownedAIModels: ['gemini_pro', 'gemini_ultra'],
    capital: 500,                      // Google money
    monthlyRevenue: 50,
    monthlyExpenses: 40,
    priorities: {
      profitMaximization: 0.8,
      safetyResearch: 0.5,
      openScience: 0.4,
      marketShare: 0.9,
      capabilityRace: 0.85
    },
    computeAllocationStrategy: 'efficiency',
    partnerships: new Map([['anthropic', 0.7]]),
    governmentRelations: 0.6,
    foundingMonth: -180, // Very old (DeepMind founding)
    reputation: 0.75
  },
  
  {
    id: 'meta',
    name: 'Meta AI',
    type: 'private',
    ownedDataCenters: ['meta_oregon', 'meta_iowa'],
    ownedAIModels: ['llama3', 'llama31'],
    capital: 400,
    monthlyRevenue: 30,
    monthlyExpenses: 35,
    priorities: {
      profitMaximization: 0.6,
      safetyResearch: 0.3,
      openScience: 0.9,                // Open weights!
      marketShare: 0.7,
      capabilityRace: 0.8
    },
    computeAllocationStrategy: 'train_new', // Rapid iteration
    partnerships: new Map(),
    governmentRelations: 0.4,          // Regulatory scrutiny
    foundingMonth: -144,
    reputation: 0.6
  },
  
  {
    id: 'government_ai',
    name: 'National AI Research Initiative',
    type: 'government',
    ownedDataCenters: ['nist_facility'],
    ownedAIModels: [],                 // No models yet!
    capital: 200,                      // Taxpayer funded
    monthlyRevenue: 0,                 // Not revenue-driven
    monthlyExpenses: 5,
    priorities: {
      profitMaximization: 0.0,
      safetyResearch: 1.0,
      openScience: 0.7,
      marketShare: 0.0,
      capabilityRace: 0.3              // Not racing
    },
    computeAllocationStrategy: 'balanced',
    partnerships: new Map([
      ['openai', 0.5],
      ['anthropic', 0.8],
      ['google_deepmind', 0.6]
    ]),
    governmentRelations: 1.0,          // It IS the government
    foundingMonth: -12,
    reputation: 0.5
  },
  
  {
    id: 'academic_consortium',
    name: 'Academic AI Consortium',
    type: 'academic',
    ownedDataCenters: ['stanford_cluster', 'mit_cluster'],
    ownedAIModels: ['academic_model_1'],
    capital: 20,
    monthlyRevenue: 1,                 // Grant funding
    monthlyExpenses: 2,                // Always underfunded
    priorities: {
      profitMaximization: 0.0,
      safetyResearch: 0.8,
      openScience: 1.0,                // Publish everything
      marketShare: 0.0,
      capabilityRace: 0.2
    },
    computeAllocationStrategy: 'balanced',
    partnerships: new Map([
      ['openai', 0.4],
      ['anthropic', 0.7],
      ['government_ai', 0.9]
    ]),
    governmentRelations: 0.9,
    foundingMonth: -240,
    reputation: 0.9
  }
];
```

---

## 🎮 Strategic Implications

### 1. **Long Construction Timelines = Strategic Planning**
- Building a data center takes **2-6 years**
- Organizations must anticipate future needs
- If they wait until they're maxed out, it's too late!
- Creates "feast or famine" dynamics

### 2. **New Models Start at Baseline**
- Technology diffusion means new models start at current capability floor
- You can't train a 2023-level model in 2027
- But: existing models continue improving via research
- This creates "legacy vs. new" dynamics

### 3. **Resource Competition Within Organizations**
- Should we focus on our flagship model?
- Should we train a competitor to ourselves?
- Should we save compute for future training?
- Trade-off: improving existing vs. creating new

### 4. **Capital Constraints**
- Organizations can't build infinite data centers
- Must choose between:
  - Data center construction (2-6 years, huge cost)
  - Model training (3-12 months, medium cost)
  - Research initiatives (ongoing, small cost)
  - Efficiency upgrades (quick, small cost)

### 5. **Organizational Diversity**
- OpenAI: Aggressive, well-funded, races hard
- Anthropic: Safety-focused, cautious, smaller
- Google: Deep pockets, efficiency-driven
- Meta: Open weights, rapid iteration
- Government: Safety mandate, no profit motive
- Academic: Underfunded, fully open, slow

### 6. **Market Dynamics**
- Organizations compete for market share
- Open weights (Meta, Academic) vs. Closed (OpenAI, Google)
- Some organizations go bankrupt if they can't compete
- New organizations can form (startups!)

---

## 🔧 Integration with Existing Systems

### Data Centers
```typescript
interface DataCenter {
  // ... existing fields ...
  owner: string;  // organizationId (not just 'private'/'government')
}
```

### AI Agents
```typescript
interface AIAgent {
  // ... existing fields ...
  organizationId: string;  // Who owns this model
  trainingCompletionMonth: number; // When it finished training
}
```

### Game State
```typescript
interface GameState {
  // ... existing fields ...
  organizations: Organization[];
}
```

---

## 📊 Monthly Organization Actions

Each organization takes actions each month:

```typescript
function processOrganizationTurn(org: Organization, state: GameState): void {
  // 1. Update projects (construction, training, etc.)
  updateProjects(org, state);
  
  // 2. Collect revenue from deployed models
  collectRevenue(org, state);
  
  // 3. Pay expenses (data center operations, salaries)
  payExpenses(org, state);
  
  // 4. Make strategic decisions
  if (shouldBuildDataCenter(org, state)) {
    startDataCenterConstruction(org, state);
  }
  
  if (shouldTrainNewModel(org, state)) {
    startModelTraining(org, state);
  }
  
  // 5. Allocate compute to existing models
  allocateComputeWithinOrganization(org, state);
  
  // 6. Update strategy based on market conditions
  updateComputeAllocationStrategy(org, state);
  
  // 7. React to government actions
  respondToRegulations(org, state);
  
  // 8. Check for bankruptcy
  if (org.capital < 0 && org.type === 'private') {
    handleBankruptcy(org, state);
  }
}
```

---

## 🚀 Implementation Phases

### Phase 1: Core Organization Structure ⚠️ CRITICAL
- [ ] Add `Organization` interface to types
- [ ] Initialize organizations in game state
- [ ] Link existing data centers to organizations
- [ ] Link existing AI agents to organizations
- [ ] Basic revenue/expense system

### Phase 2: Compute Allocation ⚠️ CRITICAL
- [ ] Organizations allocate their compute to their models
- [ ] Remove global compute allocation (it's now per-org)
- [ ] Implement allocation strategies
- [ ] Test that models only get compute from their org

### Phase 3: Data Center Construction 🔴 HIGH
- [ ] Multi-month construction projects
- [ ] Capital investment and costs
- [ ] Project progress tracking
- [ ] Completion adds new data center
- [ ] Strategic decision-making (when to build)

### Phase 4: Model Training 🔴 HIGH
- [ ] Multi-month training projects
- [ ] New models start at capability floor
- [ ] Compute reservation during training
- [ ] Completion adds new AI agent
- [ ] Strategic decision-making (when to train)

### Phase 5: Market Dynamics 🟡 MEDIUM
- [ ] Revenue from model deployments
- [ ] Competition for market share
- [ ] Bankruptcy mechanics
- [ ] New organization formation (startups)
- [ ] Partnerships and alliances

### Phase 6: Government Actions 🟡 MEDIUM
- [ ] Government can interact with organizations
- [ ] Subsidies for safety research
- [ ] Penalties for risky behavior
- [ ] Forced divestitures
- [ ] Nationalization of organizations

---

## 💡 Expected Impact

**BEFORE**: 
- Abstract compute that grows automatically
- AI agents appear magically
- No strategic resource planning
- Unrealistic timelines

**AFTER**:
- Organizations make strategic trade-offs
- Data centers take 2-6 YEARS to build
- New models take 3-12 months to train
- Capital constraints create hard choices
- Organizational diversity (cautious vs. aggressive)
- Realistic market competition
- Bankruptcies and consolidation possible

**Key Insight**: The organizational layer creates **realistic strategic depth** through:
1. **Time delays** (can't react instantly to threats)
2. **Capital constraints** (can't do everything at once)
3. **Coordination costs** (within-org allocation is easier than across-org)
4. **Diverse incentives** (profit vs. safety vs. openness)

This should make the simulation feel much more like the real AI race!

