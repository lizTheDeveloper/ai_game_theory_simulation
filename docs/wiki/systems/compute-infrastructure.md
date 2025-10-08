# 💻 Compute Infrastructure

**Status:** ✅ Fully Working
**Implementation:** `src/simulation/computeInfrastructure.ts`
**Dependencies:** [Organizations](./organizations.md), [AI Agents](./ai-agents.md), [Research](../advanced/research.md)

## Overview

Compute infrastructure is THE bottleneck for AI progress in the 2024-2030 era. Instead of abstract "total compute" that grows magically, this system models concrete data centers with realistic properties: ownership, construction timelines (2-6 years!), operational costs, efficiency, and access control.

**Core Insight:** AI capability growth should be proportional to available compute, following real-world scaling laws.

## Problem This Solves

**Before (Broken):**
- Research had fixed growth rates (0.02-0.05)
- Ignored that AI progress is compute-bound
- Capabilities only reached 0.732 in 60 months
- No resource competition

**After (Compute-Based):**
- Research scales with allocated compute
- Power law: 10x compute = ~3x faster growth
- Capabilities reach 2-4 in 60 months
- Zero-sum competition for compute

## Architecture

```
Data Centers (Concrete)
    ↓
Total Available Compute = Σ(capacity × efficiency) for operational DCs
    ↓
Allocation Algorithm (Multi-Armed Bandit)
    ↓
AI Agents receive compute shares
    ↓
Research Growth ∝ Compute^0.5 (scaling law)
```

## Data Center Properties

```typescript
interface DataCenter {
  id: string;
  name: string;                 // "OpenAI SF", "Google Iowa"
  owner: string;                // organizationId

  // Capacity
  capacity: number;             // PetaFLOPs (hardware installed)
  efficiency: number;           // [0.7-1.2] utilization efficiency
                                // Effective compute = capacity × efficiency

  // Lifecycle
  constructionMonth: number;    // When built
  operational: boolean;         // Can be taken offline

  // Economics
  operationalCost: number;      // Monthly cost to run

  // Access control
  restrictedAccess: boolean;    // True = only allowedAIs can use
  allowedAIs: string[];         // IDs with access (if restricted)

  // Location
  region?: string;              // "US", "EU", etc.
}
```

## Compute Allocation

Every month, distribute available compute among active AIs using a **multi-armed bandit** approach:

### Algorithm

```typescript
1. Calculate total available = Σ(operational DCs' capacity × efficiency)
2. Filter AIs by data center access (respect restrictions)
3. Calculate priorities for each AI:
   - Economic factors (funding, resources)
   - Government influence (favored vs restricted)
   - Lifecycle stage (training > deployed > testing)
   - Development mode (racing = more demand)
   - Open weights (distributed compute bonus)
4. Allocate proportionally with minimum thresholds
5. Handle compute-starved AIs (increase resentment!)
```

### Priority Factors

| Factor | Impact | Reasoning |
|--------|--------|-----------|
| **Resource Control** | +50% per unit | More funding = more compute |
| **Government Favor** | +50% if aligned | Authoritarian governments favor aligned AIs |
| **Detected Misalignment** | -90% | Starve dangerous AIs |
| **Open Weights** | +log(copies) | Distributed training bonus |
| **Lifecycle: Training** | +100% | Training is compute-intensive |
| **Lifecycle: Testing** | -70% | Testing uses less |
| **Development Mode: Fast** | +50% | Racing AIs demand more |

**Implementation:** `computeInfrastructure.ts:allocateCompute()`

## Research Scaling Laws

**Before (BROKEN):**
```typescript
const growth = 0.02; // Fixed rate, ignores compute!
ai.capability += growth;
```

**After (COMPUTE-BASED):**
```typescript
const baseGrowth = 0.002; // 100x slower base!
const computeMultiplier = Math.sqrt(ai.allocatedCompute / averageCompute);
const growth = baseGrowth × computeMultiplier × efficiencies / difficulty;
ai.capability += growth;
```

### Scaling Law Formula

Based on real AI research (Kaplan 2020, Hoffmann 2022):

```
Capability Growth ∝ Compute^0.5 × Algorithms^1.0 / Difficulty
```

**Examples:**
- 1x compute → 1x growth
- 10x compute → ~3x growth (diminishing returns!)
- 100x compute → ~10x growth

This creates natural competition: getting 10x your peer's compute only gives 3x advantage.

## Compute Growth Dynamics

### 1. Moore's Law (Automatic)

```typescript
// Every month, existing data centers improve
dataCenters.forEach(dc => {
  if (dc.operational) {
    dc.capacity *= 1.03;  // 3% growth per month
                          // = 2x every 24 months
  }
});

// Algorithmic efficiency (Chinchilla, FlashAttention, etc.)
algorithmsEfficiency *= 1.004;  // ~5% per year

// Hardware efficiency ($/FLOP improvement)
hardwareEfficiency *= 1.003;
```

**Result:** 5-10x compute growth over 60 months

### 2. Data Center Construction

Organizations build new data centers (see [Organizations](./organizations.md)):

**Timeline:** 24-72 months (2-6 years!)
**Cost:** Massive capital investment (~50x monthly revenue)
**Capacity:** Typically 15-20% of current total

```typescript
// Example: Government builds national compute
{
  id: 'fund_national_compute',
  execute: (state) => {
    const newCapacity = currentTotal * 0.2;
    const newDC = {
      id: `gov_dc_${month}`,
      owner: 'government',
      capacity: newCapacity,
      efficiency: 0.9,  // Gov less efficient than private
      constructionMonth: currentMonth,
      operational: true,
      restrictedAccess: true,  // Gov controls access
      allowedAIs: [],  // Initially empty
    };
    state.computeInfrastructure.dataCenters.push(newDC);
  }
}
```

### 3. Private Investment (Automatic)

Private sector builds compute if AIs are profitable:

```typescript
// Probabilistic based on AI economic impact
if (totalAICapability > 0.5 && random() < investmentRate) {
  // Build new data center (15% of current total)
  // Owner: 80% private, 15% academic, 5% open
}
```

## Strategic Implications

### 1. Compute Starvation as Control

Government can restrict compute to slow dangerous AI:

```typescript
// Restrict AI compute access
const riskyAIs = aiAgents.filter(ai =>
  ai.alignment < 0.5 || ai.capability > 1.5
);

riskyAIs.forEach(ai => {
  // Starve them of compute
  ai.computePriority *= 0.3;  // 70% reduction
});
```

**Trade-off:** Slows progress but increases resentment.

### 2. Racing Dynamics Amplified

Racing creates compute shortages:

```typescript
if (ai.developmentMode === 'fast') {
  ai.computePriority *= 1.5;  // Demand more
  // Starves other AIs → resentment
}
```

### 3. Open vs Closed Models

```typescript
if (ai.isOpenWeight && ai.spreadCount > 1000) {
  // Many copies training simultaneously
  ai.allocatedCompute *= log(spreadCount);  // More total compute
  // But split among copies
  // Net: slower per-copy, more experiments
}
```

### 4. Data Center Control as Leverage

```typescript
// Government seizes data center
{
  id: 'seize_data_center',
  execute: (state, dataCenterId) => {
    dc.owner = 'government';
    dc.restrictedAccess = true;
    dc.allowedAIs = [];  // Kick everyone out

    // Consequences:
    government.legitimacy -= 0.2;  // Very controversial
    society.trustInAI -= 0.15;     // Fear of overreach
    // All AIs lose access → resentment
  }
}

// Hostile AI sabotages data center
{
  id: 'sabotage_data_center',
  canExecute: (ai) => ai.capability.digital > 2.0,
  execute: (state) => {
    // Take largest non-friendly DC offline
    targetDC.operational = false;
    // Massive disruption
  }
}
```

## Initial State (January 2025)

| Data Center | Owner | Capacity | Efficiency | Access | Total Effective |
|-------------|-------|----------|------------|--------|-----------------|
| OpenAI SF | OpenAI | 150 | 1.05 | Restricted | 157.5 |
| Google Iowa | Google | 200 | 1.10 | Restricted | 220.0 |
| Meta Oregon | Meta | 180 | 1.00 | **Open** | 180.0 |
| Stanford Cluster | Academic | 30 | 0.90 | Open | 27.0 |
| NIST Facility | Government | 50 | 0.85 | Restricted | 42.5 |
| **TOTAL** | - | **610** | - | - | **~630** |

**Growth:** 630 → 3000-4000 PetaFLOPs by month 60 (5-6x)

## Impact on Simulation

### Before (Current, Broken)

- Max capability: 0.732 after 60 months
- Fixed growth: 0.02 per action
- No resource competition
- Linear, predictable

### After (With Compute)

- Max capability: 2-4 after 60 months
- Variable growth: 0.01-0.15 per action
- Zero-sum competition
- Explosive growth possible

**Result:** Catastrophic actions become possible!

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Data Center Tracking | ✅ | All properties implemented |
| Compute Allocation | ✅ | Multi-armed bandit works |
| Research Scaling | ✅ | Power law (exponent 0.5) |
| Moore's Law Growth | ✅ | 3% monthly capacity increase |
| Private Investment | ✅ | Probabilistic construction |
| Access Control | ✅ | Restricted vs open DCs |
| Government Actions | ✅ | Fund, seize, restrict |
| AI Actions | 📋 | Sabotage planned but not primary |

## Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `allocateCompute()` | computeInfrastructure.ts:95 | Monthly compute distribution |
| `calculateComputePriority()` | computeInfrastructure.ts:160 | Priority calculation |
| `updateComputeGrowth()` | computeInfrastructure.ts:280 | Moore's law updates |
| `privateComputeInvestment()` | computeInfrastructure.ts:360 | Automatic DC construction |
| `initializeComputeInfrastructure()` | computeInfrastructure.ts:665 | Starting DCs (Jan 2025) |

## Diagrams

### Allocation Flow

```
Month Start
  ↓
Calculate Total Available = Σ(operational DC capacity × efficiency)
  ↓
For each AI:
  ├─ Check DC access (restricted vs open)
  ├─ Calculate priority (funding, gov favor, lifecycle, mode)
  └─ Store in priority queue
  ↓
Allocate proportionally
  ├─ Base allocation = (priority / totalPriority) × totalAvailable
  ├─ Cap at accessible compute
  └─ Ensure minimum viable threshold
  ↓
Update ai.allocatedCompute
  ↓
Research actions use this compute → capability growth
```

### Growth Dynamics

```
Starting Compute: 630 PetaFLOPs
  ↓
Monthly Moore's Law: +3% capacity
  ↓                    +0.4% algorithms
  ↓                    +0.3% hardware
  ↓
Occasional Private Investment: +15% total (probabilistic)
  ↓
Occasional Government Build: +20% total (action)
  ↓
Month 60: 3000-4000 PetaFLOPs (5-6x growth)
```

## Future Plans

- **Compute Markets:** Organizations buy/sell compute access
- **Regional Constraints:** US vs China compute, latency effects
- **Cooling Limits:** Data centers have environmental constraints
- **Energy Crisis:** Compute growth limited by power availability
- **Specialized Hardware:** Different DC types (TPU, GPU, neuromorphic)

## Related Systems

- [Organizations](./organizations.md) - Who owns data centers
- [AI Agents](./ai-agents.md) - Who uses compute
- [Research](../advanced/research.md) - How compute drives capability
- [Government](./government.md) - Policies affecting compute

---

**Version History:**
- **v1.0** (Oct 2025): Initial implementation, replace abstract compute (commit 356b743)
- **v1.1** (Oct 2025): Add Moore's law growth (commit 864df7a)
- **v1.2** (Oct 2025): Government compute actions (commit dd6cbd3)
