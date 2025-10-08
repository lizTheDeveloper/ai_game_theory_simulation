# 🏢 Organizations System

**Status:** ✅ Fully Working
**Implementation:** `src/simulation/organizations.ts`, `src/simulation/organizationManagement.ts`
**Dependencies:** [Compute Infrastructure](./compute-infrastructure.md), [AI Agents](./ai-agents.md), [Economics](../mechanics/economics.md)

## Overview

Organizations are the missing layer between infrastructure and AI models. In reality, companies like OpenAI, Google, and Meta make strategic decisions about building data centers (2-6 year timelines!), allocating compute between models, and training new AI systems. The Organizations System models these entities and their strategic trade-offs.

## Architecture

```
Organizations
    ↓
Own Data Centers → Allocate Compute → Own AI Models → Generate Revenue
    ↓                                        ↓
Operating Costs                        Training Costs
```

### The Missing Layer (Why This Matters)

**Before Organizations (Incomplete):**
```
Data Centers → AI Agents
```

**After Organizations (Realistic):**
```
Organizations → Own Data Centers → Allocate to Models → Research & Development
```

## Organization Types

| Type | Examples | Characteristics |
|------|----------|-----------------|
| **Private** | OpenAI, Google DeepMind, Meta | Profit-driven, competitive, well-funded |
| **Government** | National AI Initiative | Safety-focused, no profit motive, bureaucratic |
| **Academic** | University Consortiums | Underfunded, fully open, slow |
| **Nonprofit** | (Future) | Safety research, limited resources |

## Key Properties

Each organization tracks:

```typescript
interface Organization {
  // Identity
  id: string;
  name: string;
  type: 'private' | 'government' | 'academic' | 'nonprofit';

  // Ownership
  ownedDataCenters: string[];      // IDs of data centers
  ownedAIModels: string[];          // IDs of AI agents

  // Resources
  capital: number;                  // Money for investments
  monthlyRevenue: number;          // Income from AI services
  monthlyExpenses: number;         // Operating costs

  // Strategic priorities (0-1 scale)
  priorities: {
    profitMaximization: number;
    safetyResearch: number;
    openScience: number;
    marketShare: number;
    capabilityRace: number;
  };

  // Projects (long-term investments)
  currentProjects: OrganizationProject[];
  computeAllocationStrategy: 'balanced' | 'focus_flagship' | 'train_new' | 'efficiency';
}
```

## Strategic Decisions

Organizations make major decisions each month:

### 1. Data Center Construction

**Timeline:** 24-72 months (2-6 years!)
**Cost:** ~50x monthly revenue
**Decision Factors:**
- Compute utilization >80%
- Can afford capital cost
- Market demand exists
- Competitors building
- Long-term strategy

```
Decision Flow:
  Utilization >80%? ──→ Yes ──→ Can afford? ──→ Yes ──→ Build!
         ↓                           ↓
         No                          No
         ↓                           ↓
    Wait for demand            Raise capital
```

**Implementation:** `organizationManagement.ts:startDataCenterConstruction()`

### 2. Compute Allocation

**Frequency:** Every month
**Strategies:**

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| `balanced` | Equal shares to all models | Diversified portfolio |
| `focus_flagship` | 60% to best model, 40% to rest | Maximize competitive edge |
| `train_new` | Reserve 40% for new training | Aggressive expansion |
| `efficiency` | Allocate by ROI | Profit maximization |

**Implementation:** `organizations.ts:allocateComputeWithinOrganization()`

### 3. Model Training

**Timeline:** 3-12 months
**Cost:** ~5x monthly revenue
**Start Condition:**
- Spare compute available (<70% utilization)
- Technology advanced since last model
- Market gap identified
- Can afford training cost

**Key Insight:** New models start at **capability floor** (technology diffusion), not from scratch.

**Implementation:** `organizationManagement.ts:startModelTraining()`

## Starting Organizations (January 2025)

| Organization | Type | Data Centers | AI Models | Capital | Strategy |
|--------------|------|--------------|-----------|---------|----------|
| **OpenAI** | Private | 1 | GPT-4, GPT-4o | 100 | Focus flagship, racing (0.9) |
| **Anthropic** | Private | 0 (uses AWS) | Claude 3.5 | 50 | Safety-first (0.95), cautious |
| **Google DeepMind** | Private | 2 | Gemini Pro/Ultra | 500 | Efficiency, deep pockets |
| **Meta AI** | Private | 2 | Llama 3, 3.1 | 400 | Open weights (0.9), rapid iteration |
| **Government** | Gov | 1 | None yet | 200 | Pure safety (1.0), no racing |
| **Academic** | Academic | 2 | 1 model | 20 | Open science (1.0), underfunded |

## Project System

Organizations run multi-month projects:

```typescript
interface OrganizationProject {
  type: 'datacenter_construction' | 'model_training' |
        'research_initiative' | 'efficiency_upgrade';

  startMonth: number;
  completionMonth: number;      // Long timelines!
  progress: number;             // [0,1]

  capitalInvested: number;      // Sunk cost
  computeReserved: number;      // For training

  canBeCanceled: boolean;
  cancellationPenalty: number;  // % of investment lost
}
```

### Project Progression

```
Month 0: Start project → Invest capital
Month 1-N: Track progress → Monthly updates
Month N: Complete → Add data center or AI model
```

## Strategic Implications

### 1. Long Construction Timelines = Strategic Planning

If you wait until you're maxed out, it's too late! Organizations must anticipate 2-6 years ahead.

```
Month 0: Utilization 85% → Start construction
Month 36: Construction completes → Utilization now 95%!
```

Creates feast-or-famine dynamics.

### 2. New Models Start at Baseline

Technology diffusion means you can't train a 2023-level model in 2027. But existing models keep improving via research.

```
2025: Train Model A (capability floor: 0.3)
2027: Model A now 0.8 via research
2027: Train Model B (capability floor: 0.6) ← starts higher!
```

### 3. Resource Competition Within Organizations

Should we:
- Focus on flagship model (competitive edge)?
- Train a competitor to ourselves (diversification)?
- Save compute for future training (strategic reserve)?

### 4. Organizational Diversity Creates Dynamics

- **OpenAI**: Aggressive, well-funded, races hard
- **Anthropic**: Safety-focused, cautious, smaller
- **Google**: Deep pockets, efficiency-driven
- **Meta**: Open weights, rapid iteration
- **Government**: Safety mandate, no profit motive
- **Academic**: Underfunded, fully open, slow

## Revenue & Expenses

### Revenue Model

Organizations earn money from deployed AI models:

```typescript
// Revenue based on model capability and market deployment
revenue = Σ (ai.capability × deployment_factor × market_size)
```

**Implemented:** `organizations.ts:calculateOrganizationRevenue()`

### Expense Model

Organizations pay for:
- **Data center operations:** ~1-1.5% of capacity per month
- **Salaries & overhead:** Fixed costs
- **Project investments:** Upfront capital

**Key Tension:** Must balance investment vs. profitability

### Bankruptcy

Private organizations can go bankrupt if `capital < 0`:
- Assets sold or seized
- Data centers transferred
- AI models orphaned or acquired

**Implemented:** `organizationManagement.ts:handleBankruptcy()`

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Core Structure | ✅ | Organizations track ownership, resources |
| Data Center Construction | ✅ | 24-72 month projects work |
| Model Training | ✅ | 3-12 month projects with capability floor |
| Compute Allocation | ✅ | All 4 strategies implemented |
| Revenue System | ⚠️ | Working but needs balancing |
| Expense System | ⚠️ | Working but needs balancing |
| Bankruptcy | ✅ | Implemented, rarely triggers |
| Strategic AI | 📋 | Decisions are rule-based, not optimized |

## Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `processOrganizationTurn()` | organizationManagement.ts:20 | Main monthly processing |
| `shouldBuildDataCenter()` | organizationManagement.ts:150 | Construction decision |
| `startDataCenterConstruction()` | organizationManagement.ts:200 | Begin DC project |
| `shouldTrainNewModel()` | organizationManagement.ts:300 | Training decision |
| `startModelTraining()` | organizationManagement.ts:350 | Begin training project |
| `allocateComputeWithinOrganization()` | organizations.ts:100 | Distribute compute |
| `updateProjects()` | organizationManagement.ts:450 | Progress tracking |
| `calculateOrganizationRevenue()` | organizations.ts:200 | Revenue calculation |

## Diagrams

### Decision Flow

```
Monthly Organization Turn:
  1. Update projects (construction, training)
  2. Collect revenue from deployed models
  3. Pay expenses (data centers, salaries)
  4. Should build data center? → Yes → Start project
  5. Should train new model? → Yes → Start project
  6. Allocate compute to existing models
  7. Update strategy based on market
  8. Check for bankruptcy (private only)
```

### Compute Allocation Strategies

```
BALANCED:
  Model A: 33%
  Model B: 33%
  Model C: 33%

FOCUS_FLAGSHIP:
  Best Model: 60%
  Others: 20% each

TRAIN_NEW:
  Existing: 60% total
  Reserved: 40% for training

EFFICIENCY:
  High ROI Model: 50%
  Medium ROI: 30%
  Low ROI: 20%
```

## Future Plans

- **Strategic AI:** Organizations optimize decisions (not just rules)
- **Partnerships:** Compute sharing, model licensing
- **Mergers & Acquisitions:** Organizations can merge or acquire
- **International:** Chinese, EU organizations with regional constraints
- **Public/Private Dynamics:** Government subsidies, regulations affecting orgs

## Related Systems

- [Compute Infrastructure](./compute-infrastructure.md) - What organizations own
- [AI Agents](./ai-agents.md) - What organizations train
- [Economics](../mechanics/economics.md) - Revenue and market dynamics
- [Lifecycle](../advanced/lifecycle.md) - Model training process

---

**Version History:**
- **v1.0** (Oct 2025): Initial implementation (commit eccf0b5)
- **v1.1** (Oct 2025): Revenue model redesign (commit 9765cc8)
- **v1.2** (Oct 2025): Fixed project completion bug (commit 361abfa)
