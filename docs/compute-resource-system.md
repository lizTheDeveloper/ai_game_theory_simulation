# Compute Resource System Plan

## 🎯 Core Insight
**AI capability growth should be proportional to available compute.**

Current problem: Research actions have fixed growth rates (0.02-0.05), ignoring that real AI progress is compute-bound. This explains why capabilities only reach 0.732 in 60 months - we're modeling research as if it's 2015, not 2025-2030.

---

## 🏗️ System Architecture

### 1. Global Compute Infrastructure

```typescript
interface ComputeInfrastructure {
  // Total compute available (measured in PetaFLOPs or abstract units)
  totalCompute: number;           // [0,∞] Total compute capacity
  
  // Compute growth
  monthlyComputeGrowth: number;   // Natural growth from Moore's law + investment
  
  // Data centers
  dataCenters: DataCenter[];
  
  // Efficiency improvements
  algorithmsEfficiency: number;   // [1,∞] Algorithmic improvements (like Chinchilla scaling)
  hardwareEfficiency: number;     // [1,∞] Hardware improvements (FLOP/$ improvement)
  
  // Allocation tracking
  computeAllocations: Map<string, number>; // aiId -> allocated compute
}

interface DataCenter {
  id: string;
  owner: 'government' | 'private' | 'open';
  capacity: number;              // PetaFLOPs
  constructionMonth: number;
  operationalCost: number;       // Economic cost to run
  efficiency: number;            // [0.7-1.2] Some centers are better than others
  restrictedAccess: boolean;     // Government can restrict who uses it
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

Each month, distribute `totalCompute` among active AIs:

```typescript
function allocateCompute(state: GameState): void {
  const totalAvailable = state.computeInfrastructure.totalCompute;
  const activeAIs = state.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
  
  // 1. Calculate priorities (demand for compute)
  const priorities = activeAIs.map(ai => ({
    ai,
    priority: calculateComputePriority(ai, state)
  }));
  
  // 2. Allocate proportionally (but with minimum thresholds)
  const totalPriority = priorities.reduce((sum, p) => sum + p.priority, 0);
  
  priorities.forEach(({ ai, priority }) => {
    const baseAllocation = (priority / totalPriority) * totalAvailable;
    
    // Minimum viable compute (can't train with nothing)
    const minCompute = 0.01 * totalAvailable / activeAIs.length;
    
    ai.allocatedCompute = Math.max(minCompute, baseAllocation);
  });
  
  // 3. Update allocation tracking
  state.computeInfrastructure.computeAllocations.clear();
  activeAIs.forEach(ai => {
    state.computeInfrastructure.computeAllocations.set(ai.id, ai.allocatedCompute);
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
  
  // Moore's law equivalent: ~2x every 18-24 months = ~3% per month
  const mooresLawGrowth = infra.totalCompute * 0.03;
  
  // Algorithmic improvements: Chinchilla, FlashAttention, etc.
  // ~10x every few years = ~5% per year = ~0.4% per month
  const algorithmicGrowth = infra.algorithmsEfficiency * 0.004;
  infra.algorithmsEfficiency += algorithmicGrowth;
  
  // Hardware efficiency ($/FLOP improvement)
  const hardwareGrowth = infra.hardwareEfficiency * 0.003;
  infra.hardwareEfficiency += hardwareGrowth;
  
  // Effective compute growth
  infra.totalCompute += mooresLawGrowth;
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
    // Costs government resources
    state.government.resources -= 5;
    state.government.legitimacy -= 0.05; // Controversial spending
    
    // Adds compute capacity
    const newDataCenter: DataCenter = {
      id: `gov_dc_${state.currentMonth}`,
      owner: 'government',
      capacity: state.computeInfrastructure.totalCompute * 0.2, // +20% compute
      constructionMonth: state.currentMonth,
      operationalCost: 0.1,
      efficiency: 0.9, // Government is less efficient
      restrictedAccess: true // Can control who uses it
    };
    
    state.computeInfrastructure.dataCenters.push(newDataCenter);
    state.computeInfrastructure.totalCompute += newDataCenter.capacity;
    
    return { 
      success: true, 
      computeAdded: newDataCenter.capacity 
    };
  }
}
```

**Private Investment** (automatic):
```typescript
function privateComputeInvestment(state: GameState): void {
  // Private sector builds compute if AIs are profitable
  const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const economicStage = state.globalMetrics.economicTransitionStage;
  
  // Investment scales with AI economic impact
  if (totalAICapability > 0.5 && economicStage < 3) {
    const investmentRate = totalAICapability * 0.02; // 2% of current AI capability → compute
    
    const newCapacity = state.computeInfrastructure.totalCompute * investmentRate;
    state.computeInfrastructure.totalCompute += newCapacity;
    
    // Maybe add discrete data center
    if (Math.random() < investmentRate) {
      const dc: DataCenter = {
        id: `private_dc_${state.currentMonth}`,
        owner: 'private',
        capacity: newCapacity,
        constructionMonth: state.currentMonth,
        operationalCost: 0.15,
        efficiency: 1.1, // Private is more efficient
        restrictedAccess: false
      };
      state.computeInfrastructure.dataCenters.push(dc);
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

## 🚀 Quick Start (Phase 1+2)

Minimal viable implementation to fix capability growth:

```typescript
// 1. Add to GameState
interface GameState {
  computeInfrastructure: {
    totalCompute: number;  // Start: 1000 (abstract units)
    monthlyGrowth: number; // 3% (Moore's law)
  };
}

// 2. Each month, grow compute
state.computeInfrastructure.totalCompute *= 1.03;

// 3. Allocate to AIs (simple: equal shares)
const computePerAI = state.computeInfrastructure.totalCompute / activeAIs.length;
activeAIs.forEach(ai => ai.allocatedCompute = computePerAI);

// 4. Scale research by compute
const computeMultiplier = Math.sqrt(ai.allocatedCompute / 10); // Power law
const growth = 0.002 * computeMultiplier; // Base growth much lower

// 5. Result: Capabilities scale with compute growth
// Month 1: compute=1000, growth=0.002*sqrt(100)=0.02
// Month 60: compute=5000, growth=0.002*sqrt(500)=0.045
// Total growth: ~1.5-2.0 (realistic!)
```

This minimal version would fix the capability growth issue immediately.
