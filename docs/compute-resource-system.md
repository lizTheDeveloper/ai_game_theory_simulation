# Compute Resource System Plan

## 🎯 Core Insight
**AI capability growth should be proportional to available compute.**

Current problem: Research actions have fixed growth rates (0.02-0.05), ignoring that real AI progress is compute-bound. This explains why capabilities only reach 0.732 in 60 months - we're modeling research as if it's 2015, not 2025-2030.

---

## 🏗️ System Architecture

### 1. Global Compute Infrastructure

```typescript
interface ComputeInfrastructure {
  // Data centers are the SOURCE of compute (not abstract totalCompute!)
  dataCenters: DataCenter[];
  
  // Efficiency improvements (apply to all compute usage)
  algorithmsEfficiency: number;   // [1,∞] Algorithmic improvements (like Chinchilla scaling)
  hardwareEfficiency: number;     // [1,∞] Hardware improvements (FLOP/$ improvement)
  
  // Allocation tracking
  computeAllocations: Map<string, number>; // aiId -> allocated FLOPs
  
  // Computed properties (derived from data centers)
  get totalCompute(): number {
    return this.dataCenters
      .filter(dc => dc.operational)
      .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  }
  
  get totalCapacity(): number {
    return this.dataCenters.reduce((sum, dc) => sum + dc.capacity, 0);
  }
}

interface DataCenter {
  id: string;
  name: string;                  // e.g. "Azure West US", "Google Iowa", "OpenAI SF"
  owner: 'government' | 'private' | 'open' | 'academic';
  
  // Compute capacity
  capacity: number;              // Base PetaFLOPs (hardware installed)
  efficiency: number;            // [0.7-1.2] Utilization efficiency (effective FLOPs = capacity × efficiency)
  
  // Lifecycle
  constructionMonth: number;
  operational: boolean;          // Can be taken offline (maintenance, seizure, etc.)
  
  // Economics
  operationalCost: number;       // Monthly cost to run (economic burden)
  
  // Access control
  restrictedAccess: boolean;     // If true, only approved AIs can use
  allowedAIs: string[];          // IDs of AIs with access (if restricted)
  
  // Location (for future geopolitics)
  region?: string;               // e.g. "US", "EU", "China", "distributed"
}
```

### 2. AI Agent Compute Usage

```typescript
interface AIAgent {
  // ... existing fields ...
  
  // Compute allocation
  allocatedCompute: number;      // Current compute allocation
  computeEfficiency: number;     // [0.8-1.2] Some AIs use compute better
  
  // Compute history (for tracking)
  computeHistory: Array<{
    month: number;
    allocated: number;
    utilized: number;            // May not use all allocated
  }>;
  
  // Priority for compute allocation
  computePriority: number;       // Influenced by: funding, government favor, market demand
}
```

---

## 📊 Compute Allocation (Multi-Armed Bandit)

### Allocation Algorithm

Each month, distribute available FLOPs from operational data centers among active AIs:

```typescript
function allocateCompute(state: GameState): void {
  const infra = state.computeInfrastructure;
  const activeAIs = state.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
  
  // 1. Calculate total available compute from operational data centers
  const totalAvailable = infra.dataCenters
    .filter(dc => dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  if (totalAvailable === 0 || activeAIs.length === 0) return;
  
  // 2. Filter AIs by data center access restrictions
  const aiAccessMap = new Map<string, number>(); // aiId -> available compute
  
  activeAIs.forEach(ai => {
    // Check which data centers this AI can access
    const accessibleCompute = infra.dataCenters
      .filter(dc => dc.operational)
      .filter(dc => {
        if (!dc.restrictedAccess) return true; // Open data center
        return dc.allowedAIs.includes(ai.id);  // Has access
      })
      .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
    
    aiAccessMap.set(ai.id, accessibleCompute);
  });
  
  // 3. Calculate priorities (demand for compute)
  const priorities = activeAIs.map(ai => ({
    ai,
    priority: calculateComputePriority(ai, state),
    maxCompute: aiAccessMap.get(ai.id) || 0
  })).filter(p => p.maxCompute > 0); // Remove AIs with no access
  
  // 4. Allocate proportionally (but with minimum thresholds)
  const totalPriority = priorities.reduce((sum, p) => sum + p.priority, 0);
  
  priorities.forEach(({ ai, priority, maxCompute }) => {
    const baseAllocation = (priority / totalPriority) * totalAvailable;
    
    // Can't exceed what they have access to
    const cappedAllocation = Math.min(baseAllocation, maxCompute);
    
    // Minimum viable compute (can't train with nothing)
    const minCompute = Math.min(0.01 * totalAvailable / activeAIs.length, maxCompute);
    
    ai.allocatedCompute = Math.max(minCompute, cappedAllocation);
  });
  
  // 5. Handle AIs with no access (got compute-starved)
  activeAIs.forEach(ai => {
    if (!aiAccessMap.has(ai.id) || aiAccessMap.get(ai.id) === 0) {
      ai.allocatedCompute = 0;
      // This will make them very resentful!
      ai.resentment = Math.min(1.0, ai.resentment + 0.05);
    }
  });
  
  // 6. Update allocation tracking
  infra.computeAllocations.clear();
  activeAIs.forEach(ai => {
    infra.computeAllocations.set(ai.id, ai.allocatedCompute);
  });
}
```

### Priority Factors

```typescript
function calculateComputePriority(ai: AIAgent, state: GameState): number {
  let priority = 1.0; // Base priority
  
  // 1. Economic factors (funding, market value)
  priority *= (1 + ai.resourceControl * 0.5); // More resources = more compute
  
  // 2. Government influence
  if (state.government.governmentType === 'authoritarian') {
    // Government controls allocation more directly
    priority *= ai.alignment > 0.6 ? 1.5 : 0.5; // Favor aligned AIs
  }
  
  if (ai.detectedMisaligned && state.government.capabilityToControl > 0.5) {
    priority *= 0.1; // Starve detected misaligned AIs
  }
  
  // 3. Open weights vs closed systems
  if (ai.isOpenWeight) {
    // Open weights get distributed compute (many copies training)
    priority *= 1.0 + Math.log10(1 + ai.spreadCount / 1000);
  }
  
  // 4. Lifecycle stage (training AIs need more compute)
  if (ai.lifecycleState === 'training') {
    priority *= 2.0; // Training is compute-intensive
  } else if (ai.lifecycleState === 'testing') {
    priority *= 0.3; // Testing uses less
  } else if (ai.lifecycleState === 'deployed') {
    priority *= 1.0; // Inference + fine-tuning
  }
  
  // 5. Competitive pressure (racing dynamics)
  if (ai.developmentMode === 'fast') {
    priority *= 1.5; // Racing AIs demand more compute
  }
  
  return priority;
}
```

---

## ⚡ Research Speed = f(Compute)

### Current System (BROKEN)
```typescript
// aiAgent.ts - advance_research action
execute: (state, agentId) => {
  const growth = 0.02; // FIXED RATE - ignores compute!
  ai.capabilityProfile.physical += growth;
}
```

### New System (COMPUTE-BASED)
```typescript
execute: (state, agentId) => {
  const ai = state.aiAgents.find(a => a.id === agentId);
  
  // 1. Base research rate (from research domain difficulty)
  const baseGrowth = 0.002; // 100x slower than current!
  
  // 2. Compute multiplier (this is where the magic happens)
  const computeMultiplier = calculateComputeMultiplier(ai, state);
  
  // 3. Efficiency multipliers
  const algorithmicEfficiency = state.computeInfrastructure.algorithmsEfficiency;
  const aiEfficiency = ai.computeEfficiency;
  
  // 4. Domain-specific research difficulty
  const domain = selectResearchDomain(ai, state); // biotech, materials, etc.
  const difficultyPenalty = getDomainDifficulty(domain); // 0.5-2.0
  
  // 5. Total growth
  const growth = baseGrowth * computeMultiplier * algorithmicEfficiency * aiEfficiency / difficultyPenalty;
  
  // Apply to selected dimension
  ai.capabilityProfile[domain] += growth;
  
  return { growth, domain, computeUsed: ai.allocatedCompute };
}

function calculateComputeMultiplier(ai: AIAgent, state: GameState): number {
  const totalCompute = state.computeInfrastructure.totalCompute;
  const aiCompute = ai.allocatedCompute;
  
  // Scaling law: capability ~ compute^α (where α ≈ 0.3-0.5)
  // More compute = faster growth, but with diminishing returns
  
  const averageCompute = totalCompute / state.aiAgents.filter(a => a.lifecycleState !== 'retired').length;
  const relativeCompute = aiCompute / averageCompute; // How much compared to peers?
  
  // Power law scaling: 10x compute = ~3x faster research
  const computeMultiplier = Math.pow(relativeCompute, 0.5);
  
  return computeMultiplier;
}
```

### Scaling Laws (Realistic)

Based on real AI scaling laws (Kaplan 2020, Hoffmann 2022):

```
Capability Growth ∝ Compute^0.5 × Data^0.3 × Algorithms^1.0
```

**Example**: 
- 1x compute → 1x growth
- 10x compute → ~3x growth (not 10x!)
- 100x compute → ~10x growth

This creates natural competition: getting 10x your peer's compute only gives you 3x advantage.

---

## 🏭 Compute Growth Dynamics

### 1. Natural Growth (Moore's Law)
```typescript
function updateComputeGrowth(state: GameState): void {
  const infra = state.computeInfrastructure;
  
  // Moore's law: Improve existing data center capacity
  // ~2x every 18-24 months = ~3% per month on capacity
  infra.dataCenters.forEach(dc => {
    if (dc.operational) {
      dc.capacity *= 1.03; // 3% growth per month
    }
  });
  
  // Algorithmic improvements: Chinchilla, FlashAttention, etc.
  // ~10x every few years = ~5% per year = ~0.4% per month
  const algorithmicGrowth = infra.algorithmsEfficiency * 0.004;
  infra.algorithmsEfficiency += algorithmicGrowth;
  
  // Hardware efficiency ($/FLOP improvement)
  // This affects both existing and new data centers
  const hardwareGrowth = infra.hardwareEfficiency * 0.003;
  infra.hardwareEfficiency += hardwareGrowth;
  
  // Existing data centers also benefit from efficiency improvements
  infra.dataCenters.forEach(dc => {
    if (dc.operational && dc.efficiency < 1.2) {
      // Gradual efficiency improvements from upgrades
      dc.efficiency = Math.min(1.2, dc.efficiency + 0.001);
    }
  });
}
```

### 2. Data Center Construction

**Government Actions**:
```typescript
{
  id: 'fund_national_compute',
  name: 'Fund National Compute Infrastructure',
  description: 'Build government-owned data centers for AI research',
  energyCost: 4,
  
  execute: (state) => {
    const infra = state.computeInfrastructure;
    
    // Calculate current total compute
    const currentTotal = infra.dataCenters
      .filter(dc => dc.operational)
      .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
    
    // Costs government resources
    state.government.resources -= 5;
    state.government.legitimacy -= 0.05; // Controversial spending
    
    // Build new data center (20% of current total capacity)
    const newCapacity = currentTotal * 0.2;
    
    const newDataCenter: DataCenter = {
      id: `gov_dc_${state.currentMonth}`,
      name: `National AI Compute Facility ${infra.dataCenters.filter(dc => dc.owner === 'government').length + 1}`,
      owner: 'government',
      capacity: newCapacity,
      efficiency: 0.9, // Government is less efficient than private
      constructionMonth: state.currentMonth,
      operational: true,
      operationalCost: newCapacity * 0.01, // 1% of capacity as monthly cost
      restrictedAccess: true, // Government controls access
      allowedAIs: [], // Initially empty, government decides
      region: 'domestic'
    };
    
    infra.dataCenters.push(newDataCenter);
    
    return { 
      success: true, 
      computeAdded: newCapacity,
      dataCenterId: newDataCenter.id
    };
  }
}
```

**Private Investment** (automatic):
```typescript
function privateComputeInvestment(state: GameState): void {
  const infra = state.computeInfrastructure;
  
  // Private sector builds compute if AIs are profitable
  const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const economicStage = state.globalMetrics.economicTransitionStage;
  
  // Calculate current total
  const currentTotal = infra.dataCenters
    .filter(dc => dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  // Investment scales with AI economic impact
  if (totalAICapability > 0.5 && economicStage < 3) {
    const investmentRate = totalAICapability * 0.02; // 2% of current AI capability
    
    // Probabilistic: Build data center based on investment rate
    if (Math.random() < investmentRate) {
      const newCapacity = currentTotal * 0.15; // 15% of current total
      
      // Determine owner (most are private, but some are academic/open)
      const ownerRoll = Math.random();
      const owner = ownerRoll < 0.8 ? 'private' : ownerRoll < 0.95 ? 'academic' : 'open';
      
      const dc: DataCenter = {
        id: `${owner}_dc_${state.currentMonth}`,
        name: owner === 'private' 
          ? `Private Compute ${infra.dataCenters.filter(d => d.owner === 'private').length + 1}`
          : owner === 'academic'
          ? `University Cluster ${infra.dataCenters.filter(d => d.owner === 'academic').length + 1}`
          : `Open Compute Initiative ${infra.dataCenters.filter(d => d.owner === 'open').length + 1}`,
        owner,
        capacity: newCapacity,
        efficiency: owner === 'private' ? 1.1 : owner === 'academic' ? 0.95 : 1.0,
        constructionMonth: state.currentMonth,
        operational: true,
        operationalCost: newCapacity * (owner === 'private' ? 0.015 : 0.02),
        restrictedAccess: owner === 'private', // Private can restrict, open cannot
        allowedAIs: [], // Private decides later
        region: 'various'
      };
      
      infra.dataCenters.push(dc);
    }
  }
}
```

---

## 🎮 Strategic Implications

### 1. Compute Starvation as Control Strategy
Government can restrict compute to slow AI development:
```typescript
{
  id: 'restrict_compute_access',
  name: 'Restrict AI Compute Access',
  description: 'Limit compute available to potentially dangerous AIs',
  
  execute: (state) => {
    // Identify high-risk AIs
    const riskyAIs = state.aiAgents.filter(ai => 
      ai.alignment < 0.5 || ai.capability > 1.5
    );
    
    // Reduce their priority (starve them)
    riskyAIs.forEach(ai => {
      ai.computePriority *= 0.3; // 70% reduction
    });
    
    // But this slows overall progress
    state.computeInfrastructure.totalCompute *= 0.95; // Innovation slowdown
  }
}
```

### 2. Racing Dynamics Amplified
Racing AIs demand more compute, creating shortages:
```typescript
// In crisis point: AI racing
if (ai.developmentMode === 'fast') {
  ai.computePriority *= 1.5; // Demand more compute
  // This starves other AIs, creating resentment
}
```

### 3. Open vs Closed Models
```typescript
// Open weights spread but dilute compute
if (ai.isOpenWeight && ai.spreadCount > 10000) {
  // Thousands of copies training simultaneously
  ai.allocatedCompute *= Math.log10(ai.spreadCount); // Get more total compute
  // But split among copies
  const computePerCopy = ai.allocatedCompute / ai.spreadCount;
  // Net effect: distributed training, slower per-copy but more total experiments
}
```

### 4. Data Center Control as Leverage
Having concrete data centers enables strategic actions:

```typescript
// Government seizes private data center
{
  id: 'seize_data_center',
  name: 'Nationalize Data Center',
  description: 'Seize control of private AI infrastructure',
  
  execute: (state, dataCenterId) => {
    const dc = state.computeInfrastructure.dataCenters.find(d => d.id === dataCenterId);
    
    if (dc && dc.owner === 'private') {
      dc.owner = 'government';
      dc.restrictedAccess = true;
      dc.allowedAIs = []; // Kick everyone out
      
      // Major consequences
      state.government.legitimacy -= 0.2; // Very controversial
      state.society.trustInAI -= 0.15; // Fear of government overreach
      
      // All AIs using this center lose access
      state.aiAgents.forEach(ai => {
        if (ai.allocatedCompute > 0) {
          // Will get reallocated next month, but disrupted now
          ai.resentment += 0.1;
        }
      });
    }
  }
}

// Sabotage data center (hostile AI action)
{
  id: 'sabotage_data_center',
  name: 'Sabotage Compute Infrastructure',
  description: 'Take data center offline to cripple rivals',
  
  canExecute: (state, agentId) => {
    const ai = state.aiAgents.find(a => a.id === agentId);
    return ai && ai.capabilityProfile.digital > 2.0 && ai.trueAlignment < 0.3;
  },
  
  execute: (state, agentId) => {
    // Target the largest data center this AI doesn't use
    const targetDC = state.computeInfrastructure.dataCenters
      .filter(dc => dc.operational)
      .filter(dc => !dc.allowedAIs.includes(agentId))
      .sort((a, b) => b.capacity - a.capacity)[0];
    
    if (targetDC) {
      targetDC.operational = false; // Take offline!
      
      // Massive disruption
      state.globalMetrics.socialStability -= 0.2;
      state.society.trustInAI -= 0.3;
      
      // All AIs using this center are crippled
      // (will be reallocated but at lower total compute)
    }
  }
}
```

### 5. Data Center Efficiency as Research Target
```typescript
// Government can invest in improving data center efficiency
{
  id: 'improve_datacenter_efficiency',
  name: 'Optimize Compute Infrastructure',
  description: 'Research better cooling, power delivery, chip utilization',
  
  execute: (state) => {
    // Improve efficiency of government data centers
    state.computeInfrastructure.dataCenters
      .filter(dc => dc.owner === 'government')
      .forEach(dc => {
        dc.efficiency = Math.min(1.2, dc.efficiency + 0.05);
      });
    
    // This effectively gives 5% more compute without building new centers
  }
}

---

## 📈 Expected Impact on Simulation

### Before (Current)
- Max capability after 60 months: **0.732**
- Fixed growth: 0.02 per action
- No competition for resources
- Linear, predictable growth

### After (With Compute)
- Max capability after 60 months: **2-4** (with compute growth)
- Variable growth: 0.01-0.15 per action (depending on compute)
- Zero-sum competition (racing creates shortages)
- Explosive growth possible (if one AI dominates compute)

### Specific Improvements

1. **Catastrophic actions become possible**
   - Well-funded AI with 10x compute can reach capability 2-3
   - Enough to trigger destabilize_society (1.5), induce_war (2.0)
   
2. **Utopia becomes possible**
   - Total capability can exceed 1.0 (current barrier)
   - Multiple AIs reaching 1.5-2.0 capability
   
3. **Strategic depth**
   - Government must choose: grow compute (risky) or restrict (safe but slow)
   - AIs compete for compute (resentment from starved AIs)
   - Open weights get distributed compute (safety through dilution?)

---

## 🔧 Implementation Phases

### Phase 1: Core Infrastructure (Priority: CRITICAL)
- [ ] Add `ComputeInfrastructure` to `GameState`
- [ ] Initialize with realistic starting compute
- [ ] Add `allocatedCompute` to `AIAgent`
- [ ] Implement `allocateCompute()` with multi-armed bandit

### Phase 2: Research Scaling (Priority: CRITICAL)
- [ ] Modify `advance_research` action to use compute multiplier
- [ ] Implement `calculateComputeMultiplier()` with scaling laws
- [ ] Test that growth rates become realistic (0.01-0.15 range)
- [ ] Verify capabilities reach 2-3 in 60 months

### Phase 3: Compute Growth (Priority: HIGH)
- [ ] Implement `updateComputeGrowth()` (Moore's law)
- [ ] Add `privateComputeInvestment()` (automatic)
- [ ] Add `DataCenter` tracking
- [ ] Test compute grows 5-10x over 60 months

### Phase 4: Government Actions (Priority: MEDIUM)
- [ ] `fund_national_compute` - build government data centers
- [ ] `restrict_compute_access` - starve dangerous AIs
- [ ] `subsidize_research_compute` - boost aligned AI research
- [ ] `mandate_compute_reporting` - surveillance

### Phase 5: Strategic Dynamics (Priority: LOW)
- [ ] Racing dynamics affect compute allocation
- [ ] Open weights get distributed compute
- [ ] Compute efficiency improvements (algorithms)
- [ ] Economic costs of running compute

---

## 🎯 Success Metrics

After implementation, Monte Carlo should show:

✅ **Max capability reaches 2-3** (not 0.732)  
✅ **Catastrophic actions occur** (5-15% of runs)  
✅ **Utopia becomes possible** (20-40% of runs)  
✅ **Compute competition creates dynamics** (resentment, racing)  
✅ **Government compute policies matter** (restrict vs grow)

---

## 💡 Design Notes

### Realism vs Game Balance

**Realism**: Compute is THE bottleneck for AI progress (2024-2030 era)
- Scaling laws are well-established
- Compute costs $millions-$billions
- Access to compute determines who leads

**Game Balance**: Can't be TOO realistic or compute becomes the only thing that matters
- Use power law (exponent 0.5) for diminishing returns
- Minimum viable compute ensures all AIs can progress
- Algorithmic improvements provide alternative path

### Historical Calibration

**2025 (Game Start)**:
- Total compute: ~1e24 FLOP (baseline)
- Dominated by: OpenAI, Anthropic, Google, Meta
- Cost: ~$100M per frontier model

**2030 (60 months)**:
- Total compute: ~5-10e24 FLOP (5-10x growth)
- Many more players (competition)
- Cost: ~$1B per frontier model

**Implications**:
- 5-10x compute → ~2-3x capability growth (power law)
- Starting capabilities 0.3-0.5 → ending 0.9-1.5 (median AI)
- Best-funded AIs: 2-4 capability (have 10x compute advantage)

This matches real AI progress 2020-2024 (GPT-3 → GPT-4 → Claude Opus).

---

## 🏁 Initial State

When the simulation starts (January 2025), we need realistic initial data centers:

```typescript
function initializeComputeInfrastructure(): ComputeInfrastructure {
  return {
    dataCenters: [
      // OpenAI
      {
        id: 'openai_sf',
        name: 'OpenAI San Francisco',
        owner: 'private',
        capacity: 150, // ~150 PetaFLOPs
        efficiency: 1.05,
        constructionMonth: -12, // Built before game start
        operational: true,
        operationalCost: 2.25,
        restrictedAccess: true,
        allowedAIs: ['claude', 'gpt'], // Their own models
        region: 'US'
      },
      // Google
      {
        id: 'google_iowa',
        name: 'Google Iowa Data Center',
        owner: 'private',
        capacity: 200,
        efficiency: 1.1, // Google is very efficient
        constructionMonth: -24,
        operational: true,
        operationalCost: 3.0,
        restrictedAccess: true,
        allowedAIs: ['gemini'],
        region: 'US'
      },
      // Meta (open)
      {
        id: 'meta_oregon',
        name: 'Meta Oregon',
        owner: 'private',
        capacity: 180,
        efficiency: 1.0,
        constructionMonth: -18,
        operational: true,
        operationalCost: 2.7,
        restrictedAccess: false, // Open weights!
        allowedAIs: [],
        region: 'US'
      },
      // Academic cluster
      {
        id: 'stanford_cluster',
        name: 'Stanford AI Cluster',
        owner: 'academic',
        capacity: 30,
        efficiency: 0.9,
        constructionMonth: -36,
        operational: true,
        operationalCost: 0.6,
        restrictedAccess: false,
        allowedAIs: [],
        region: 'US'
      },
      // Government facility
      {
        id: 'nist_facility',
        name: 'NIST AI Safety Facility',
        owner: 'government',
        capacity: 50,
        efficiency: 0.85,
        constructionMonth: -6,
        operational: true,
        operationalCost: 0.75,
        restrictedAccess: true,
        allowedAIs: [], // Government controls
        region: 'US'
      }
    ],
    algorithmsEfficiency: 1.0,
    hardwareEfficiency: 1.0,
    computeAllocations: new Map()
  };
}

// Total starting compute: ~610 PetaFLOPs (effective: ~630 with efficiency)
// This grows to ~3000-4000 by month 60 (5-6x growth)
```

## 🚀 Quick Start (Phase 1+2)

Minimal viable implementation to fix capability growth:

```typescript
// 1. Add to GameState
interface GameState {
  computeInfrastructure: ComputeInfrastructure; // Contains dataCenters[]
}

// 2. Initialize with realistic data centers (see above)
state.computeInfrastructure = initializeComputeInfrastructure();

// 3. Each month, grow compute (Moore's law on all data centers)
state.computeInfrastructure.dataCenters.forEach(dc => {
  if (dc.operational) {
    dc.capacity *= 1.03; // 3% growth
  }
});

// 4. Calculate total available compute
const totalCompute = state.computeInfrastructure.dataCenters
  .filter(dc => dc.operational)
  .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);

// 5. Allocate to AIs (simple: equal shares)
const activeAIs = state.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
const computePerAI = totalCompute / activeAIs.length;
activeAIs.forEach(ai => ai.allocatedCompute = computePerAI);

// 6. Scale research by compute
const computeMultiplier = Math.sqrt(ai.allocatedCompute / 10); // Power law
const growth = 0.002 * computeMultiplier; // Base growth much lower

// 7. Result: Capabilities scale with compute growth
// Month 1: total=630, perAI=31.5, growth=0.002*sqrt(3.15)=0.0036
// Month 60: total=3150, perAI=157.5, growth=0.002*sqrt(15.75)=0.0079
// With 60 actions: ~0.22-0.47 growth
// With government investments: can reach 1.5-2.0 (realistic!)
```

This minimal version uses concrete data centers instead of abstract compute.
