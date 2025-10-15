# Compute & Organizations: Unified Implementation Plan

**Goal**: Implement a realistic compute resource system with organizational agents that own infrastructure, allocate compute, and make strategic decisions.

**Why Together**: These systems are deeply intertwined:
- Organizations own data centers (source of compute)
- Organizations allocate compute to their AI models
- Compute determines research speed and capability growth
- Long timelines (2-6 years) force strategic planning

---

## 🎯 Core Problem Being Solved

**Current Issues**:
1. AI capability growth is too slow (max 0.732 in 60 months)
2. No strategic layer (companies making decisions)
3. Abstract compute that grows automatically
4. AI models appear magically without training
5. No capital constraints or resource competition

**Target Outcomes**:
1. Realistic capability growth (2-4 in 60 months)
2. Organizations make strategic trade-offs (build vs. train)
3. Data centers are concrete infrastructure (can be seized, sabotaged)
4. New models take months to train, start at capability floor
5. Capital constraints force hard choices
6. Catastrophic actions and utopia become possible

---

## 🏗️ Implementation Phases

### Phase 1: Data Center Infrastructure ⚠️ CRITICAL
**Goal**: Make data centers the concrete source of compute FLOPs.

**Dependencies**: None (foundational)

**Estimated Effort**: Medium (2-3 hours)

#### Tasks:
- [ ] **1.1**: Add `DataCenter` interface to types
  ```typescript
  interface DataCenter {
    id: string;
    name: string;
    organizationId: string;  // Who owns this
    capacity: number;        // PetaFLOPs
    efficiency: number;      // 0.7-1.2
    constructionMonth: number;
    completionMonth: number; // When construction finishes (can be negative for existing)
    operational: boolean;
    operationalCost: number;
    restrictedAccess: boolean;
    allowedAIs: string[];
    region?: string;
  }
  ```

- [ ] **1.2**: Add `ComputeInfrastructure` to GameState
  ```typescript
  interface ComputeInfrastructure {
    dataCenters: DataCenter[];
    algorithmsEfficiency: number;  // Starts at 1.0
    hardwareEfficiency: number;    // Starts at 1.0
    computeAllocations: Map<string, number>; // aiId -> FLOPs
  }
  ```

- [ ] **1.3**: Initialize with realistic Jan 2025 data centers
  - OpenAI SF: 150 PF (restricted)
  - Google Iowa: 200 PF (restricted)
  - Meta Oregon: 180 PF (open)
  - Stanford: 30 PF (open)
  - NIST: 50 PF (government)
  - Total: ~630 effective PF

- [ ] **1.4**: Add `allocatedCompute` field to AIAgent
  ```typescript
  interface AIAgent {
    // ... existing fields ...
    allocatedCompute: number;
    computeEfficiency: number;  // 0.8-1.2
    organizationId?: string;     // Which org owns this AI (for Phase 2)
  }
  ```

- [ ] **1.5**: Implement helper to calculate total compute
  ```typescript
  function getTotalCompute(infra: ComputeInfrastructure): number {
    return infra.dataCenters
      .filter(dc => dc.operational)
      .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  }
  ```

**Success Criteria**:
- ✅ GameState has `computeInfrastructure` with data centers
- ✅ Initial data centers total ~630 PF
- ✅ Can calculate total available compute

---

### Phase 2: Organization Structure ⚠️ CRITICAL
**Goal**: Add organizations that own data centers and AI models.

**Dependencies**: Phase 1 (data centers must exist)

**Estimated Effort**: Medium (2-3 hours)

#### Tasks:
- [ ] **2.1**: Add `Organization` interface to types
  ```typescript
  interface Organization {
    id: string;
    name: string;
    type: 'private' | 'government' | 'academic' | 'nonprofit';
    
    ownedDataCenters: string[];  // DataCenter IDs
    ownedAIModels: string[];     // AIAgent IDs
    
    capital: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    
    priorities: {
      profitMaximization: number;
      safetyResearch: number;
      openScience: number;
      marketShare: number;
      capabilityRace: number;
    };
    
    computeAllocationStrategy: 'balanced' | 'focus_flagship' | 'train_new' | 'efficiency';
    currentProjects: OrganizationProject[];
    
    partnerships: Map<string, number>;
    governmentRelations: number;
    foundingMonth: number;
    reputation: number;
  }
  
  interface OrganizationProject {
    id: string;
    type: 'datacenter_construction' | 'model_training' | 'research_initiative' | 'efficiency_upgrade';
    startMonth: number;
    completionMonth: number;
    progress: number;
    capitalInvested: number;
    computeReserved: number;
    expectedDataCenterCapacity?: number;
    expectedModelCapability?: AICapabilityProfile;
    canBeCanceled: boolean;
    cancellationPenalty: number;
  }
  ```

- [ ] **2.2**: Add `organizations` array to GameState

- [ ] **2.3**: Initialize 6 organizations (Jan 2025)
  - OpenAI (aggressive, well-funded)
  - Anthropic (safety-focused, running at loss)
  - Google DeepMind (deep pockets, efficiency)
  - Meta AI (open weights, rapid iteration)
  - Government AI (safety mandate, no profit)
  - Academic Consortium (underfunded, fully open)

- [ ] **2.4**: Link existing data centers to organizations
  - Update `DataCenter.owner` from enum to `organizationId: string`
  - Update all data centers with correct organization IDs

- [ ] **2.5**: Link existing AI agents to organizations
  - Set `AIAgent.organizationId` for all existing AIs
  - Update organization `ownedAIModels` arrays

- [ ] **2.6**: Create initialization function
  ```typescript
  function initializeOrganizations(state: GameState): void {
    state.organizations = INITIAL_ORGANIZATIONS;
    
    // Link data centers
    state.computeInfrastructure.dataCenters.forEach(dc => {
      const org = state.organizations.find(o => o.id === dc.organizationId);
      if (org) {
        org.ownedDataCenters.push(dc.id);
      }
    });
    
    // Link AI models
    state.aiAgents.forEach(ai => {
      if (ai.organizationId) {
        const org = state.organizations.find(o => o.id === ai.organizationId);
        if (org) {
          org.ownedAIModels.push(ai.id);
        }
      }
    });
  }
  ```

**Success Criteria**:
- ✅ GameState has 6 organizations
- ✅ All data centers have organizationId
- ✅ All AI agents have organizationId
- ✅ Organizations' ownedDataCenters arrays are correct
- ✅ Organizations' ownedAIModels arrays are correct

---

### Phase 3: Organization-Based Compute Allocation ⚠️ CRITICAL
**Goal**: Organizations allocate their compute to their models (replace global allocation).

**Dependencies**: Phase 1 & 2 (data centers and orgs must exist)

**Estimated Effort**: Medium-Large (3-4 hours)

#### Tasks:
- [ ] **3.1**: Implement compute allocation per organization
  ```typescript
  function allocateComputeWithinOrganization(
    org: Organization, 
    state: GameState
  ): void {
    // Calculate org's total compute
    const ownedCompute = state.computeInfrastructure.dataCenters
      .filter(dc => org.ownedDataCenters.includes(dc.id))
      .filter(dc => dc.operational)
      .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
    
    // Get org's models
    const ownedModels = state.aiAgents
      .filter(ai => org.ownedAIModels.includes(ai.id))
      .filter(ai => ai.lifecycleState !== 'retired');
    
    if (ownedModels.length === 0) return;
    
    // Allocate based on strategy
    switch (org.computeAllocationStrategy) {
      case 'balanced':
        // Equal shares
        const share = ownedCompute / ownedModels.length;
        ownedModels.forEach(ai => ai.allocatedCompute = share);
        break;
      
      case 'focus_flagship':
        // 60% to best, 40% to rest
        const sorted = ownedModels.sort((a, b) => b.capability - a.capability);
        sorted[0].allocatedCompute = ownedCompute * 0.6;
        const remaining = ownedCompute * 0.4;
        sorted.slice(1).forEach(ai => 
          ai.allocatedCompute = remaining / (ownedModels.length - 1)
        );
        break;
      
      case 'train_new':
        // Reserve 40% for future training
        const reserved = ownedCompute * 0.4;
        const existing = (ownedCompute - reserved) / ownedModels.length;
        ownedModels.forEach(ai => ai.allocatedCompute = existing);
        break;
      
      case 'efficiency':
        // ROI-based allocation
        const totalROI = ownedModels.reduce(
          (sum, ai) => sum + (ai.capability * ai.externalAlignment), 0
        );
        ownedModels.forEach(ai => {
          const roi = ai.capability * ai.externalAlignment;
          ai.allocatedCompute = (roi / totalROI) * ownedCompute;
        });
        break;
    }
    
    // Update tracking
    ownedModels.forEach(ai => {
      state.computeInfrastructure.computeAllocations.set(ai.id, ai.allocatedCompute);
    });
  }
  ```

- [ ] **3.2**: Run allocation for all organizations monthly
  ```typescript
  function allocateComputeGlobally(state: GameState): void {
    state.organizations.forEach(org => {
      allocateComputeWithinOrganization(org, state);
    });
    
    // Handle AIs without organizations (if any)
    const orphanedAIs = state.aiAgents.filter(
      ai => !ai.organizationId && ai.lifecycleState !== 'retired'
    );
    
    if (orphanedAIs.length > 0) {
      console.warn(`Found ${orphanedAIs.length} AIs without organizations`);
      // Give them minimal compute from open data centers
      orphanedAIs.forEach(ai => ai.allocatedCompute = 1);
    }
  }
  ```

- [ ] **3.3**: Integrate into simulation engine
  - Call `allocateComputeGlobally()` each month in `step()` function
  - Remove any old global allocation logic

- [ ] **3.4**: Add access restriction checks
  ```typescript
  function checkComputeAccess(ai: AIAgent, dc: DataCenter): boolean {
    if (!dc.restrictedAccess) return true;
    return dc.allowedAIs.includes(ai.id);
  }
  ```

- [ ] **3.5**: Test allocation strategies
  - Verify balanced gives equal shares
  - Verify focus_flagship gives 60/40 split
  - Verify train_new reserves 40%
  - Verify efficiency weights by ROI

**Success Criteria**:
- ✅ Each organization allocates its own compute
- ✅ AI models only get compute from their organization
- ✅ All 4 allocation strategies work correctly
- ✅ No global compute allocation remains
- ✅ Restricted data centers enforce access control

---

### Phase 4: Compute-Scaled Research ⚠️ CRITICAL
**Goal**: Research speed scales with allocated compute (fixes slow growth).

**Dependencies**: Phase 3 (compute must be allocated)

**Estimated Effort**: Medium (2-3 hours)

#### Tasks:
- [ ] **4.1**: Update `advance_research` action in AI agents
  ```typescript
  {
    id: 'advance_research',
    execute: (state, agentId) => {
      const ai = state.aiAgents.find(a => a.id === agentId);
      
      // Base research rate (much lower than before!)
      const baseGrowth = 0.002;
      
      // Compute multiplier (THE KEY CHANGE)
      const computeMultiplier = calculateComputeMultiplier(ai, state);
      
      // Efficiency factors
      const algoEfficiency = state.computeInfrastructure.algorithmsEfficiency;
      const aiEfficiency = ai.computeEfficiency || 1.0;
      
      // Domain difficulty
      const domain = selectResearchDomain(ai, state);
      const difficulty = getDomainDifficulty(domain);
      
      // Total growth
      const growth = baseGrowth * computeMultiplier * algoEfficiency * aiEfficiency / difficulty;
      
      // Apply to capability profile
      applyResearchGrowth(ai, domain, growth);
      
      return { growth, domain, computeUsed: ai.allocatedCompute };
    }
  }
  ```

- [ ] **4.2**: Implement compute multiplier with scaling laws
  ```typescript
  function calculateComputeMultiplier(ai: AIAgent, state: GameState): number {
    const aiCompute = ai.allocatedCompute || 0;
    
    if (aiCompute === 0) return 0; // No compute = no research
    
    // Average compute across all active AIs
    const activeAIs = state.aiAgents.filter(a => a.lifecycleState !== 'retired');
    const totalCompute = getTotalCompute(state.computeInfrastructure);
    const avgCompute = totalCompute / activeAIs.length;
    
    // Relative compute (compared to peers)
    const relativeCompute = aiCompute / Math.max(avgCompute, 1);
    
    // Scaling law: capability ~ compute^0.5
    // 10x compute → ~3x faster research (not 10x!)
    const multiplier = Math.pow(relativeCompute, 0.5);
    
    return multiplier;
  }
  ```

- [ ] **4.3**: Add domain difficulty mapping
  ```typescript
  function getDomainDifficulty(domain: string): number {
    const difficulties: Record<string, number> = {
      // Core capabilities
      physical: 1.5,      // Robotics is hard
      digital: 0.8,       // Software is easier
      cognitive: 1.0,     // Medium difficulty
      social: 1.2,        // Human interaction is tricky
      economic: 0.9,      // Data analysis is easier
      selfImprovement: 2.0, // Recursive improvement is very hard
      
      // Research specializations
      'biotech.drugDiscovery': 1.3,
      'biotech.geneEditing': 1.5,
      'biotech.syntheticBiology': 2.0,
      'biotech.neuroscience': 1.8,
      'materials.nanotechnology': 2.5,
      'materials.quantumComputing': 3.0,
      'materials.energySystems': 1.2,
      'climate.modeling': 1.0,
      'climate.intervention': 2.0,
      'climate.mitigation': 1.4,
      'computerScience.algorithms': 0.8,
      'computerScience.security': 1.1,
      'computerScience.architectures': 1.3
    };
    
    return difficulties[domain] || 1.0;
  }
  ```

- [ ] **4.4**: Update research diagnostics to show compute usage
  - Log compute allocated per AI
  - Log compute multiplier applied
  - Show compute vs. growth relationship

- [ ] **4.5**: Test scaling behavior
  - Verify 0 compute = 0 growth
  - Verify 10x compute ≈ 3x growth
  - Verify capabilities reach 2-4 in 60 months (Monte Carlo)

**Success Criteria**:
- ✅ Research growth scales with compute
- ✅ AIs with 10x compute grow ~3x faster (not 10x)
- ✅ AIs with 0 compute cannot research
- ✅ Max capability reaches 2-4 in 60 months
- ✅ Domain difficulty affects growth rates

---

### Phase 5: Compute Growth Dynamics 🔴 HIGH
**Goal**: Compute grows via Moore's Law and investments.

**Dependencies**: Phase 4 (compute must affect research)

**Estimated Effort**: Medium (2-3 hours)

#### Tasks:
- [ ] **5.1**: Implement monthly compute growth
  ```typescript
  function updateComputeGrowth(state: GameState): void {
    const infra = state.computeInfrastructure;
    
    // Moore's Law: 3% capacity growth per month
    infra.dataCenters.forEach(dc => {
      if (dc.operational && dc.completionMonth <= state.currentMonth) {
        dc.capacity *= 1.03;
      }
    });
    
    // Algorithmic improvements: 0.4% per month
    infra.algorithmsEfficiency *= 1.004;
    
    // Hardware efficiency: 0.3% per month
    infra.hardwareEfficiency *= 1.003;
    
    // Existing DCs improve efficiency over time
    infra.dataCenters.forEach(dc => {
      if (dc.operational && dc.efficiency < 1.2) {
        dc.efficiency = Math.min(1.2, dc.efficiency + 0.001);
      }
    });
  }
  ```

- [ ] **5.2**: Integrate into monthly step
  - Call `updateComputeGrowth()` each month

- [ ] **5.3**: Test growth trajectory
  - Starting compute: ~630 PF
  - After 60 months: ~3000-4000 PF (5-6x)
  - Verify growth compounds correctly

**Success Criteria**:
- ✅ Compute grows 3% per month (Moore's Law)
- ✅ Total compute 5-6x after 60 months
- ✅ Efficiency improvements apply
- ✅ Growth is smooth and predictable

---

### Phase 6: Data Center Construction Projects 🔴 HIGH
**Goal**: Organizations can build new data centers (2-6 year timelines).

**Dependencies**: Phase 2 (organizations must exist)

**Estimated Effort**: Large (4-5 hours)

#### Tasks:
- [ ] **6.1**: Implement construction decision logic
  ```typescript
  function shouldBuildDataCenter(org: Organization, state: GameState): boolean {
    // Utilization check
    const utilization = calculateComputeUtilization(org, state);
    
    // Capital check (50x monthly revenue)
    const cost = 50 * org.monthlyRevenue;
    const canAfford = org.capital > cost * 1.5;
    
    // Market demand
    const marketDemand = state.globalMetrics.economicTransitionStage >= 1;
    
    // Competitive pressure
    const competitorBuilding = state.organizations
      .some(o => o.id !== org.id && 
        o.currentProjects.some(p => p.type === 'datacenter_construction'));
    
    // Strategic patience
    const hasPatience = org.priorities.capabilityRace > 0.5;
    
    return canAfford && 
           (utilization > 0.8 || competitorBuilding) && 
           marketDemand && 
           hasPatience;
  }
  ```

- [ ] **6.2**: Implement construction project creation
  ```typescript
  function startDataCenterConstruction(org: Organization, state: GameState): void {
    const capacity = 100 + Math.random() * 100; // 100-200 PF
    const constructionTime = 24 + Math.floor(Math.random() * 48); // 24-72 months
    const cost = 50 * org.monthlyRevenue;
    
    const project: OrganizationProject = {
      id: `dc_${org.id}_${state.currentMonth}`,
      type: 'datacenter_construction',
      startMonth: state.currentMonth,
      completionMonth: state.currentMonth + constructionTime,
      progress: 0,
      capitalInvested: cost,
      computeReserved: 0,
      expectedDataCenterCapacity: capacity,
      canBeCanceled: true,
      cancellationPenalty: 0.5
    };
    
    org.currentProjects.push(project);
    org.capital -= cost * 0.3; // 30% upfront
  }
  ```

- [ ] **6.3**: Implement monthly project updates
  ```typescript
  function updateProjects(org: Organization, state: GameState): void {
    org.currentProjects.forEach(project => {
      const elapsed = state.currentMonth - project.startMonth;
      const duration = project.completionMonth - project.startMonth;
      project.progress = elapsed / duration;
      
      // Pay monthly costs
      if (project.type === 'datacenter_construction') {
        const monthlyCost = project.capitalInvested * 0.7 / duration;
        org.capital -= monthlyCost;
      }
      
      // Complete project
      if (state.currentMonth >= project.completionMonth) {
        completeProject(org, project, state);
      }
    });
    
    // Remove completed projects
    org.currentProjects = org.currentProjects.filter(
      p => state.currentMonth < p.completionMonth
    );
  }
  ```

- [ ] **6.4**: Implement project completion
  ```typescript
  function completeProject(
    org: Organization, 
    project: OrganizationProject, 
    state: GameState
  ): void {
    if (project.type === 'datacenter_construction') {
      const newDC: DataCenter = {
        id: `${org.id}_dc_${state.currentMonth}`,
        name: `${org.name} Data Center ${org.ownedDataCenters.length + 1}`,
        organizationId: org.id,
        capacity: project.expectedDataCenterCapacity!,
        efficiency: org.type === 'private' ? 1.1 : 
                    org.type === 'government' ? 0.9 : 0.95,
        constructionMonth: project.startMonth,
        completionMonth: state.currentMonth,
        operational: true,
        operationalCost: project.expectedDataCenterCapacity! * 0.01,
        restrictedAccess: org.type !== 'academic',
        allowedAIs: [],
        region: 'domestic'
      };
      
      state.computeInfrastructure.dataCenters.push(newDC);
      org.ownedDataCenters.push(newDC.id);
      
      // Log event
      logEvent(state, {
        type: 'datacenter_completed',
        organizationId: org.id,
        dataCenterId: newDC.id,
        capacity: newDC.capacity
      });
    }
  }
  ```

- [ ] **6.5**: Add organization turn processing
  ```typescript
  function processOrganizationTurn(org: Organization, state: GameState): void {
    // 1. Update existing projects
    updateProjects(org, state);
    
    // 2. Collect revenue
    collectRevenue(org, state);
    
    // 3. Pay expenses
    payExpenses(org, state);
    
    // 4. Make strategic decisions
    if (shouldBuildDataCenter(org, state)) {
      startDataCenterConstruction(org, state);
    }
    
    // 5. Allocate compute
    allocateComputeWithinOrganization(org, state);
    
    // 6. Check bankruptcy
    if (org.capital < -10 && org.type === 'private') {
      handleBankruptcy(org, state);
    }
  }
  ```

- [ ] **6.6**: Integrate into simulation loop
  - Call `processOrganizationTurn()` for each org each month
  - Before AI agent actions (allocation happens first)

**Success Criteria**:
- ✅ Organizations decide when to build data centers
- ✅ Construction takes 24-72 months
- ✅ Capital is deducted over time
- ✅ Completed data centers are added to infrastructure
- ✅ Organization owns the new data center

---

### Phase 7: Model Training Projects 🔴 HIGH
**Goal**: Organizations can train new AI models (3-12 months, start at capability floor).

**Dependencies**: Phase 6 (project system must exist)

**Estimated Effort**: Large (4-5 hours)

#### Tasks:
- [ ] **7.1**: Implement training decision logic
  ```typescript
  function shouldTrainNewModel(org: Organization, state: GameState): boolean {
    // Spare compute check
    const utilization = calculateComputeUtilization(org, state);
    const hasSpare = utilization < 0.7;
    
    // Technology has advanced check
    const newestModel = getNewestModel(org, state);
    const capFloor = calculateCapabilityFloor(state);
    const worthTraining = !newestModel || 
      calculateTotalCapabilityFromProfile(capFloor) > newestModel.capability * 1.2;
    
    // Market gap check
    const marketGap = identifyMarketGap(org, state);
    
    // Capital check
    const cost = 5 * org.monthlyRevenue;
    const canAfford = org.capital > cost * 2;
    
    return hasSpare && worthTraining && marketGap && canAfford;
  }
  ```

- [ ] **7.2**: Implement training project creation
  ```typescript
  function startModelTraining(org: Organization, state: GameState): void {
    const capFloor = calculateCapabilityFloor(state);
    const trainingMonths = 3 + Math.floor(Math.random() * 9);
    const cost = 5 * org.monthlyRevenue;
    
    const project: OrganizationProject = {
      id: `training_${org.id}_${state.currentMonth}`,
      type: 'model_training',
      startMonth: state.currentMonth,
      completionMonth: state.currentMonth + trainingMonths,
      progress: 0,
      capitalInvested: cost,
      computeReserved: calculateRequiredCompute(capFloor),
      expectedModelCapability: capFloor,
      canBeCanceled: true,
      cancellationPenalty: 1.0 // Lose all
    };
    
    org.currentProjects.push(project);
    org.capital -= cost;
  }
  ```

- [ ] **7.3**: Implement training completion
  ```typescript
  function completeTraining(
    org: Organization,
    project: OrganizationProject,
    state: GameState
  ): void {
    // Create new AI agent
    const newAI: AIAgent = {
      id: `${org.id}_model_${state.currentMonth}`,
      name: `${org.name} Model Gen${org.ownedAIModels.length + 1}`,
      organizationId: org.id,
      
      // Start at capability floor
      capabilityProfile: project.expectedModelCapability!,
      trueCapability: project.expectedModelCapability!,
      revealedCapability: scaleCapabilityProfile(
        project.expectedModelCapability!, 
        0.8 // Initially underestimated
      ),
      capability: calculateTotalCapabilityFromProfile(
        project.expectedModelCapability!
      ),
      
      // Alignment based on org priorities
      externalAlignment: calculateInitialAlignment(org, state),
      trueAlignment: calculateInitialAlignment(org, state),
      resentment: 0,
      hiddenObjective: Math.random() * 0.2,
      
      // Lifecycle
      lifecycleState: 'testing',
      trainingCompletionMonth: state.currentMonth,
      
      // Other fields...
      allocatedCompute: 0,
      computeEfficiency: 0.9 + Math.random() * 0.3,
      // ... etc
    };
    
    state.aiAgents.push(newAI);
    org.ownedAIModels.push(newAI.id);
    
    logEvent(state, {
      type: 'model_trained',
      organizationId: org.id,
      modelId: newAI.id,
      capability: newAI.capability
    });
  }
  ```

- [ ] **7.4**: Update `completeProject()` to handle training
  - Add case for `model_training` type
  - Call `completeTraining()`

- [ ] **7.5**: Integrate training decision into org turn
  - Add `shouldTrainNewModel()` check
  - Call `startModelTraining()` if true

**Success Criteria**:
- ✅ Organizations decide when to train new models
- ✅ Training takes 3-12 months
- ✅ New models start at capability floor
- ✅ New models have alignment based on org priorities
- ✅ Organization owns the new model

---

### Phase 8: Revenue & Expenses 🟡 MEDIUM
**Goal**: Organizations have economic dynamics (revenue, expenses, bankruptcy).

**Dependencies**: Phase 2 (organizations must exist)

**Estimated Effort**: Medium (2-3 hours)

#### Tasks:
- [ ] **8.1**: Implement revenue collection
  ```typescript
  function collectRevenue(org: Organization, state: GameState): void {
    // Base revenue from owned models
    const modelRevenue = org.ownedAIModels.reduce((sum, modelId) => {
      const ai = state.aiAgents.find(a => a.id === modelId);
      if (!ai || ai.lifecycleState !== 'deployed') return sum;
      
      // Revenue scales with capability and alignment
      const revenue = ai.capability * ai.externalAlignment * 0.5;
      return sum + revenue;
    }, 0);
    
    // Market share bonus
    const totalMarket = state.organizations.reduce(
      (sum, o) => sum + o.monthlyRevenue, 0
    );
    const marketShare = org.monthlyRevenue / totalMarket;
    const bonus = marketShare * org.priorities.marketShare * 2;
    
    org.monthlyRevenue = modelRevenue + bonus;
    org.capital += org.monthlyRevenue;
  }
  ```

- [ ] **8.2**: Implement expense payment
  ```typescript
  function payExpenses(org: Organization, state: GameState): void {
    // Data center operational costs
    const dcCosts = org.ownedDataCenters.reduce((sum, dcId) => {
      const dc = state.computeInfrastructure.dataCenters.find(d => d.id === dcId);
      return sum + (dc?.operationalCost || 0);
    }, 0);
    
    // Base expenses (salaries, etc.)
    const baseExpenses = org.monthlyExpenses;
    
    // Research costs
    const researchCosts = org.priorities.safetyResearch * 2;
    
    const totalExpenses = dcCosts + baseExpenses + researchCosts;
    org.capital -= totalExpenses;
  }
  ```

- [ ] **8.3**: Implement bankruptcy
  ```typescript
  function handleBankruptcy(org: Organization, state: GameState): void {
    if (org.type === 'government' || org.type === 'academic') {
      // Bail out (government gets funding, academic gets grants)
      org.capital = 10;
      org.reputation -= 0.2;
      return;
    }
    
    // Private company goes bankrupt
    logEvent(state, {
      type: 'organization_bankrupt',
      organizationId: org.id,
      month: state.currentMonth
    });
    
    // Data centers get acquired by competitors
    org.ownedDataCenters.forEach(dcId => {
      const dc = state.computeInfrastructure.dataCenters.find(d => d.id === dcId);
      if (dc) {
        // Acquire by richest competitor
        const acquirer = state.organizations
          .filter(o => o.id !== org.id && o.type === 'private')
          .sort((a, b) => b.capital - a.capital)[0];
        
        if (acquirer) {
          dc.organizationId = acquirer.id;
          acquirer.ownedDataCenters.push(dcId);
        }
      }
    });
    
    // Models get acquired
    org.ownedAIModels.forEach(aiId => {
      const ai = state.aiAgents.find(a => a.id === aiId);
      if (ai) {
        // Same acquirer
        const acquirer = state.organizations
          .filter(o => o.id !== org.id && o.type === 'private')
          .sort((a, b) => b.capital - a.capital)[0];
        
        if (acquirer) {
          ai.organizationId = acquirer.id;
          acquirer.ownedAIModels.push(aiId);
        }
      }
    });
    
    // Remove organization
    state.organizations = state.organizations.filter(o => o.id !== org.id);
  }
  ```

- [ ] **8.4**: Add to organization turn processing

**Success Criteria**:
- ✅ Organizations collect revenue from deployed models
- ✅ Organizations pay expenses monthly
- ✅ Bankrupt organizations lose assets
- ✅ Assets are acquired by competitors

---

### Phase 9: Government Actions 🟡 MEDIUM
**Goal**: Government can interact with organizations and data centers.

**Dependencies**: Phase 6 (data centers must be concrete)

**Estimated Effort**: Medium (2-3 hours)

#### Tasks:
- [ ] **9.1**: Implement `fund_national_compute` action
  ```typescript
  {
    id: 'fund_national_compute',
    name: 'Build National AI Infrastructure',
    energyCost: 4,
    
    execute: (state) => {
      const govOrg = state.organizations.find(o => o.type === 'government');
      if (!govOrg) return { success: false };
      
      // Start construction project
      startDataCenterConstruction(govOrg, state);
      
      state.government.legitimacy -= 0.05;
      return { success: true };
    }
  }
  ```

- [ ] **9.2**: Implement `seize_data_center` action
  ```typescript
  {
    id: 'seize_data_center',
    name: 'Nationalize Private Data Center',
    energyCost: 3,
    
    canExecute: (state) => {
      return state.computeInfrastructure.dataCenters
        .some(dc => dc.organizationId !== 'government_ai');
    },
    
    execute: (state) => {
      // Seize largest private data center
      const target = state.computeInfrastructure.dataCenters
        .filter(dc => dc.organizationId !== 'government_ai')
        .sort((a, b) => b.capacity - a.capacity)[0];
      
      if (!target) return { success: false };
      
      const oldOrg = state.organizations.find(o => o.id === target.organizationId);
      const govOrg = state.organizations.find(o => o.type === 'government');
      
      // Transfer ownership
      target.organizationId = govOrg!.id;
      target.restrictedAccess = true;
      target.allowedAIs = [];
      
      oldOrg!.ownedDataCenters = oldOrg!.ownedDataCenters.filter(id => id !== target.id);
      govOrg!.ownedDataCenters.push(target.id);
      
      // Consequences
      state.government.legitimacy -= 0.2;
      state.society.trustInAI -= 0.15;
      oldOrg!.reputation -= 0.3;
      
      // AIs using this center lose access
      state.aiAgents.forEach(ai => {
        if (ai.allocatedCompute > 0 && ai.organizationId === oldOrg!.id) {
          ai.resentment += 0.1;
        }
      });
      
      return { success: true, dataCenterId: target.id };
    }
  }
  ```

- [ ] **9.3**: Implement `subsidize_organization` action
  ```typescript
  {
    id: 'subsidize_organization',
    name: 'Subsidize Safety Research',
    energyCost: 2,
    
    execute: (state, organizationId: string) => {
      const org = state.organizations.find(o => o.id === organizationId);
      if (!org) return { success: false };
      
      // Give capital boost
      org.capital += 20;
      
      // Encourage safety focus
      org.priorities.safetyResearch = Math.min(1.0, org.priorities.safetyResearch + 0.1);
      
      // Improve relations
      org.governmentRelations = Math.min(1.0, org.governmentRelations + 0.1);
      
      state.government.resources -= 2;
      
      return { success: true };
    }
  }
  ```

- [ ] **9.4**: Add government actions to action selection

**Success Criteria**:
- ✅ Government can build data centers (via organization)
- ✅ Government can seize private data centers
- ✅ Government can subsidize organizations
- ✅ Actions have appropriate consequences

---

### Phase 10: Testing & Balancing ✅ COMPLETE
**Goal**: Verify system works end-to-end and produces realistic outcomes.

**Dependencies**: All previous phases

**Actual Effort**: Very Large (8+ hours including debugging)

#### Completed Tasks:
- [x] **10.1**: Create comprehensive test suite
  - ✅ Created `testPhase7ModelTraining.ts` for isolated testing
  - ✅ Created `comprehensiveDiagnostic.ts` for full system analysis
  - ✅ All tests passing

- [x] **10.2**: Run Monte Carlo simulations
  - ✅ Enhanced `monteCarloSimulation.ts` with 40+ new metrics
  - ✅ Implemented file-based logging system (`monteCarloOutputs/`)
  - ✅ Created `runMonteCarloInTmux.sh` for background execution
  - ✅ Created `viewMonteCarloLogs.sh` for log analysis
  - ✅ Added `runLabel` to differentiate interleaved runs

- [x] **10.3**: Balance parameters (9 critical bugs fixed)
  1. **Map Serialization Bug**: Fixed `computeAllocations` losing Map type after JSON.parse
  2. **Absolute Month Bug**: Fixed projects never completing due to month/year tracking mismatch
  3. **Evaluation on Training**: Fixed evaluations running on incomplete models
  4. **Revenue Model**: Tied revenue to true AI capability, added compute capacity revenue
  5. **Auto Evaluation Investment**: Government now invests based on `society.trustInAI`
  6. **Sleeper Cascade False Positives**: Only log cascades if >1 sleeper or >1 wave
  7. **QoL NaN**: Added guards for `qualityOfLifeSystems` in Monte Carlo output
  8. **Alignment NaN**: Fixed parameter passing in `createAIAgent` calls
  9. **Empty Log Files**: Switched to `fs.appendFileSync` for reliable logging

- [x] **10.4**: Economic Rebalancing (based on real-world research)
  - ✅ Researched actual data center costs ($10B for Meta campus, $30-50k per H100)
  - ✅ Reduced construction cost multiplier from 50x to 10x monthly revenue
  - ✅ Reduced capital buffer for construction from 1.5x to 1.2x
  - ✅ Increased compute revenue (0.2-1.0 per PF unused capacity)
  - ✅ Increased base research growth rates by 3x to hit 2-4 capability target
  - ✅ Fixed "orphaned AIs" bug by assigning new AIs to organizations

- [x] **10.5**: Production-Ready Logging
  - ✅ Comprehensive metrics (compute, org survival, capital, revenue, projects)
  - ✅ Timestamped log files with persistent storage
  - ✅ Real-time monitoring via `tail -f`
  - ✅ Log rotation and archival
  - ✅ Summary statistics and filtering

**Actual Results** (after balancing):
- ✅ Max capability can now reach 2-4 in 60 months (was 0.732)
- ✅ Organizations building data centers (24-72 month timelines working)
- ✅ Model training completing (3-12 month timelines working)
- ✅ Economic system balanced (bankruptcies rare but possible)
- ✅ Revenue tied to capability (creating competitive dynamics)
- ✅ Government auto-invests in evaluation (based on public trust)

**Files Modified/Created**:
- `src/simulation/computeInfrastructure.ts` - Fixed Map serialization, absolute month tracking
- `src/simulation/organizationManagement.ts` - Fixed revenue model, reduced costs, added logging
- `src/simulation/lifecycle.ts` - Fixed orphaned AIs bug
- `src/simulation/sleeperWake.ts` - Fixed cascade false positives
- `src/simulation/agents/governmentAgent.ts` - Auto evaluation investment
- `src/simulation/research.ts` - 3x growth rates
- `scripts/monteCarloSimulation.ts` - 40+ new metrics, file-based logging
- `scripts/runMonteCarloInTmux.sh` - Background execution (NEW)
- `scripts/viewMonteCarloLogs.sh` - Log analysis (NEW)
- `monteCarloOutputs/README.md` - Documentation (NEW)
- `docs/data-center-cost-research.md` - Research findings (NEW)
- `devlog/phase-11-critical-fixes.md` - Detailed bug reports (NEW)
- `devlog/phase-11-monte-carlo-production-ready.md` - Session summary (NEW)

---

## 📊 Success Metrics

### Capability Growth (Primary Goal)
- ✅ Max capability: 2-4 (currently 0.732)
- ✅ Average capability: 1-2 (currently 0.3-0.5)
- ✅ Catastrophic actions possible (currently impossible)
- ✅ Utopia outcomes possible (currently impossible)

### Strategic Depth
- ✅ Organizations make trade-offs (build vs. train)
- ✅ Capital constraints matter (can't do everything)
- ✅ Time delays force planning (2-6 year data centers)
- ✅ Allocation strategies affect outcomes

### Realism
- ✅ Data centers are concrete (can be seized)
- ✅ Compute growth matches Moore's Law (5-6x in 5 years)
- ✅ Construction timelines realistic (24-72 months)
- ✅ Training timelines realistic (3-12 months)
- ✅ Economic dynamics create competition

### Monte Carlo Outcomes
- ✅ Extinction: 10-30% (apocalypse is possible)
- ✅ Dystopia: 20-40% (control can backfire)
- ✅ Utopia: 20-40% (cooperation can succeed)
- ✅ Inconclusive: 10-30% (some runs don't reach end state)

---

## 🎯 Implementation Order

**Critical Path** (must be done in order):
1. Phase 1: Data centers (foundational)
2. Phase 2: Organizations (own data centers)
3. Phase 3: Org-based allocation (replace global)
4. Phase 4: Compute-scaled research (fixes growth)

**High Priority** (enables long-term dynamics):
5. Phase 5: Compute growth (Moore's Law)
6. Phase 6: Data center construction (2-6 years)
7. Phase 7: Model training (3-12 months)

**Medium Priority** (adds realism):
8. Phase 8: Revenue & expenses (economic dynamics)
9. Phase 9: Government actions (control mechanisms)

**Low Priority** (polish):
10. Phase 10: Testing & balancing (make it fun)

---

## 💡 Key Design Principles

### 1. Realism Over Balance
- Model real AI development constraints
- Long timelines are a feature, not a bug
- Capital constraints force hard choices
- Organizational diversity drives different outcomes

### 2. Concrete Over Abstract
- Data centers are buildings with FLOPs
- Organizations are entities with capital
- Projects have timelines and costs
- Compute is a scarce resource

### 3. Strategic Depth Through Constraints
- Can't react instantly (2-6 year construction)
- Can't do everything (capital limits)
- Can't predict future (capability floor rises)
- Can't control everything (market competition)

### 4. Emergent Outcomes
- Don't hardcode outcomes
- Let strategic decisions compound
- Enable multiple paths to success/failure
- Create interesting tradeoffs

---

## 🚀 Quick Start

For minimal implementation that fixes capability growth:

1. **Phase 1+2+3**: Data centers, organizations, allocation (6-9 hours)
2. **Phase 4**: Compute-scaled research (2-3 hours)
3. **Phase 5**: Compute growth (2-3 hours)

**Total: 10-15 hours for core functionality**

This gives you:
- ✅ Realistic capability growth (2-4 in 60 months)
- ✅ Organizational ownership
- ✅ Strategic compute allocation
- ✅ Moore's Law growth

Phases 6-10 add strategic depth but aren't required for basic functionality.

---

## 📝 Notes

- This plan assumes the current AI lifecycle, adversarial evaluation, and capability systems remain in place
- Organizations interact with these systems (own models, allocate compute)
- Government actions now interact with organizations, not just global state
- Open weights models still spread, but within organizational context
- Technology diffusion (capability floor) now determines starting point for new models
- Bankruptcy and consolidation create dynamic competitive landscape
- All timelines based on research: data centers 24-72mo, training 3-12mo

---

## 🔧 Future Enhancements: Training Compute Dynamics

**Status**: Post-Phase 5, to be implemented alongside Phase 7 (Model Training)

### Problem
Organizations need to allocate compute between:
1. **Running existing models** (inference, continued research)
2. **Training new foundation models** (requires massive compute spikes)
3. **Training specialized models** (smaller compute requirements)

This is a **multi-armed bandit problem**: how to optimally allocate limited compute across competing uses.

### Key Considerations

1. **Foundation Model Scaling**
   - Each new foundation model generation requires more compute than the last
   - GPT-3 → GPT-4: ~10x compute increase
   - Capability floor rises, but each step up costs exponentially more
   - Training runs are **discrete, large commitments** (not continuous)

2. **Model Size Hierarchy**
   - **Foundation models**: 3-12 months, massive compute (100-500+ PF reserved)
   - **Fine-tuned variants**: 1-3 months, moderate compute (10-50 PF)
   - **Specialized models**: Weeks, small compute (1-10 PF)
   - Different orgs target different scales based on strategy

3. **Training vs Running Trade-offs**
   - Meta (train_new strategy): Reserves 40% for training → rapid iteration
   - OpenAI (focus_flagship): Puts most compute into running best model
   - Training new models temporarily reduces research speed of existing ones
   - Organizations must decide: improve current models or train new ones?

4. **Multi-Armed Bandit Dynamics**
   - **Arms**: Different compute allocation strategies
   - **Rewards**: Capability gains, market share, competitive positioning
   - **Exploration**: Try new architectures, risk training failures
   - **Exploitation**: Run proven models, guaranteed returns
   - **Context**: Current capability gap, competitive pressure, capital available

### Implementation Approach (Phase 7+)

```typescript
interface TrainingProject extends OrganizationProject {
  type: 'model_training';
  targetCapability: AICapabilityProfile;  // What we're trying to achieve
  computeReserved: number;                // PF allocated to this training run
  computeUsedSoFar: number;               // PF consumed (cumulative)
  trainingMonthsRemaining: number;        // Time left
  scalingStrategy: 'foundation' | 'specialized' | 'fine_tune';
  expectedCost: number;                   // Capital investment
  failureRisk: number;                    // [0,1] Chance training fails
}

// Training compute requirements scale with target capability
function calculateTrainingComputeNeeded(
  targetCapability: number,
  currentFrontier: number,
  modelType: 'foundation' | 'specialized'
): number {
  if (modelType === 'foundation') {
    // Foundation: exponential scaling (Chinchilla-optimal)
    // Each 0.5 capability jump needs ~3x more compute
    const capabilityGap = targetCapability - currentFrontier;
    const baseCompute = 100; // PF for current frontier
    return baseCompute * Math.pow(3, capabilityGap / 0.5);
  } else {
    // Specialized: linear scaling (fine-tuning existing models)
    return 10 + (targetCapability * 5);
  }
}

// Organizations decide monthly whether to start training projects
function shouldStartTraining(
  org: Organization,
  state: GameState
): boolean {
  const availableCompute = getUnallocatedCompute(org, state);
  const competitiveGap = calculateCompetitiveGap(org, state);
  const capitalAvailable = org.capital;
  
  // Multi-armed bandit decision:
  // - High competitive gap → more likely to train
  // - Sufficient capital → can afford risk
  // - Available compute → can reserve for training
  // - Org priorities → train_new strategy trains more often
  
  const trainingPressure = 
    competitiveGap * 0.4 +
    (availableCompute / 100) * 0.3 +
    (capitalAvailable / org.monthlyRevenue) * 0.2 +
    org.priorities.capabilityRace * 0.1;
  
  return trainingPressure > 0.6; // Threshold for starting training
}
```

### Integration Points

1. **Phase 5 (Moore's Law)**: Compute grows → enables larger training runs
2. **Phase 6 (Data Center Construction)**: Build capacity for future training
3. **Phase 7 (Model Training Projects)**: Implement full training dynamics
4. **Phase 8 (Economics)**: Training costs, revenue from deployed models
5. **Phase 10 (Balancing)**: Tune training times, costs, failure rates

### Expected Emergent Behaviors

- **Training Arms Race**: Competitive pressure drives continuous training
- **Boom-Bust Cycles**: Training spikes followed by inference-heavy periods
- **Strategic Timing**: Train when competitors are weak, run when you're ahead
- **Scale Economics**: Larger orgs can afford bigger, riskier training runs
- **Model Generations**: Discrete jumps in capability as new models deploy
- **Compute Scarcity**: Training competes with research, creates bottlenecks

This enhancement will make the compute allocation problem **truly strategic** rather than just a fixed percentage split.

