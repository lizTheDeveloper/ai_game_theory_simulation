# H-1: Energy Budget System Underutilization - Implementation Plan

**Date:** December 10, 2025
**Coordinator:** orchestrator-1
**Priority:** HIGH (architecture integration issue)
**Effort Estimate:** MEDIUM (2-3 days)
**Research Status:** Validated (QG1 PASSED on Dec 9, 2025)

---

## Problem Statement

EnergyBudgetPhase (order 12.75) calculates effectiveness multipliers (`energyBudget.allocations`) based on global electricity capacity and technology demands. However, only **one consumer** (ClimateDeploymentPhase) uses these multipliers. All other energy-consuming systems maintain parallel, inconsistent energy tracking:

- `aiInfrastructureResources.ts` - Direct energy calculation (MW)
- `powerGeneration.ts` - Separate datacenter power tracking
- `ComputeAllocationPhase` - Compute allocation without energy constraints
- Tech tree effects - Energy parameters not unified

This creates:
1. **Inconsistent modeling:** Same energy claimed multiple times
2. **No priority enforcement:** AI datacenters can scale unlimited while climate tech starves
3. **Architecture fragmentation:** Multiple sources of truth

**God Mode Evidence:** Deploying all 92 technologies causes collapse because there's no unified energy budget - technologies compete for the same limited electricity without allocation.

---

## Research Foundation

**Primary Research:**
- `research/energy_budget_constraints_20251209.md` (Grade B+)
- QG1 Validation: `reviews/research_validation_energy_budget_20251209.md` (CONDITIONAL PASS)

**Key Parameters (Research-Backed):**
- Global electricity: 29,000 TWh/year (2024 baseline)
- Clean electricity: 11,500 TWh/year (40% clean share)
- AI datacenter baseline: 415-460 TWh (corrected from 730 TWh)
- DAC at scale: 1,200-2,500 kWh/tCO2
- Green hydrogen: 50-55 kWh/kg H2
- Priority tiers: Essential (1) → High (2) → Climate (3) → Elective (4)

---

## Current System Analysis

### Working Consumer (Reference Implementation)

**ClimateDeploymentPhase (order 12.8):**
```typescript
// Step 1: Get energy effectiveness from EnergyBudgetPhase
const energyMultiplier = this.getEnergyMultiplier(state, tech);

// Step 2: Apply to deployment
const adjustedEffectiveness = baseDeployment * phaseMultiplier * energyMultiplier;
```

**Energy category mapping:**
- DAC → `energyBudget.allocations['dac']`
- Green hydrogen → `energyBudget.allocations['green-hydrogen']`
- SAI → `energyBudget.allocations['sai']`

### Energy Consumers Requiring Migration

**Priority 1 (CRITICAL - Direct energy tracking):**

1. **aiInfrastructureResources.ts**
   - Current: Direct MW calculation (`ENERGY_BASE_CONSUMPTION + ENERGY_PER_CAPABILITY_POINT`)
   - Migration: Map to `energyBudget.allocations['ai-datacenter']`
   - Integration point: `calculateAIInfrastructureConsumption()`
   - Energy category: TIER 4 (elective)

2. **powerGeneration.ts**
   - Current: Separate datacenter power tracking (`dataCenterPower`, `aiInferencePower`)
   - Migration: Read from energy budget, provide feedback to capacity growth
   - Integration point: `updatePowerGeneration()`
   - Energy category: TIER 4 (elective)

**Priority 2 (HIGH - Compute/infrastructure):**

3. **ComputeAllocationPhase**
   - Current: Allocates compute without energy constraints
   - Migration: Check `energyBudget.allocations['advanced-compute']` before allocation
   - Integration point: `allocateComputeGlobally()`
   - Energy category: TIER 4 (elective)

4. **Tech tree effects (effectsEngine.ts)**
   - Current: Technology effects don't check energy availability
   - Migration: Energy-intensive techs query budget for effectiveness multipliers
   - Integration point: `applyTechnologyEffects()`
   - Energy categories: TIER 2-4 (varies by tech)

**Priority 3 (MEDIUM - Secondary effects):**

5. **StochasticInnovationPhase**
   - Current: Breakthroughs don't account for energy bottlenecks
   - Migration: Energy-intensive breakthroughs check feasibility
   - Integration point: Innovation logic
   - Energy category: TIER 3-4 (varies)

6. **Government actions (crisisActions.ts, researchActions.ts)**
   - Current: Actions don't check energy constraints
   - Migration: Infrastructure-heavy actions query budget
   - Integration point: Action execution
   - Energy category: TIER 1-3 (varies)

---

## Implementation Strategy

### Phase 1: Core Integration (Days 1-2)

**Goal:** Migrate Priority 1 consumers to unified energy budget

**Steps:**

1. **AI Infrastructure Integration** (`aiInfrastructureResources.ts`)
   - Add energy budget query to `calculateAIInfrastructureConsumption()`
   - Map AI datacenter energy to `energyBudget.allocations['ai-datacenter']`
   - Apply effectivenessMultiplier to water/energy consumption
   - Preserve existing calculation as demand (what it would use unconstrained)
   - Allocated amount is constrained by priority tier

2. **Power Generation Unification** (`powerGeneration.ts`)
   - Refactor to READ from energy budget rather than track separately
   - `dataCenterPower` becomes derived from `energyBudget.allocations`
   - Keep growth projections as feedback to capacity expansion
   - Remove duplicate energy tracking

3. **EnergyBudgetPhase Enhancement**
   - Ensure all major energy consumers registered in `TECH_ENERGY_REQUIREMENTS`
   - Add validation: total demand should never exceed capacity by >50% (early warning)
   - Improve tech ID → energy category mapping

**Testing:**
- Run 3 Monte Carlo simulations (N=10 each)
- Verify energy budget constraints limit AI datacenter growth
- Check god mode no longer causes energy-driven collapse
- Validate determinism (same seed = same allocation)

### Phase 2: Compute & Effects (Day 2-3)

**Goal:** Integrate compute allocation and tech effects

**Steps:**

1. **Compute Allocation** (`ComputeAllocationPhase`)
   - Query `energyBudget.allocations['advanced-compute']` before allocation
   - Scale allocated compute by energy effectiveness multiplier
   - Add energy-constrained message if limited

2. **Tech Effects** (`effectsEngine.ts`)
   - Identify energy-intensive technologies (DAC, hydrogen, electrification)
   - Query appropriate energy budget category
   - Apply effectiveness multiplier to tech effects
   - Already partially done for climate techs (ClimateDeploymentPhase)

**Testing:**
- Run 3 Monte Carlo simulations (N=10 each)
- Check compute allocation respects energy constraints
- Verify tech effects scale with energy availability

### Phase 3: Secondary Integration (Day 3)

**Goal:** Complete remaining integrations

**Steps:**

1. **Stochastic Innovation**
   - Energy-intensive breakthroughs check feasibility
   - Low energy availability delays deployment

2. **Government Actions**
   - Infrastructure-heavy actions query budget
   - Provide "insufficient energy" feedback

**Testing:**
- Full Monte Carlo validation (N=20)
- God mode test (all 92 techs deployed)
- Energy constraint effectiveness test

### Phase 4: Documentation & Quality Gates

**Steps:**
1. Update wiki with unified energy architecture
2. Document energy category mapping
3. Add troubleshooting guide for energy bottlenecks
4. Architecture review (Quality Gate 2)

---

## Success Criteria

**Functional Requirements:**
- [ ] All Priority 1 consumers use `energyBudget.allocations`
- [ ] AI datacenter growth limited by TIER 4 priority
- [ ] Climate tech effectiveness scales with energy allocation
- [ ] Compute allocation respects energy constraints
- [ ] God mode doesn't cause energy-driven collapse

**Quality Requirements:**
- [ ] Deterministic (same seed = same results)
- [ ] Monte Carlo validated (N≥10, CV analysis)
- [ ] No NaN/Infinity in energy calculations
- [ ] Architecture review passes (no CRITICAL/HIGH issues)

**Documentation Requirements:**
- [ ] Wiki updated with unified energy architecture
- [ ] Energy category mapping documented
- [ ] Integration patterns documented for future consumers

---

## Risks & Mitigation

**Risk 1: Breaking existing behavior**
- **Mitigation:** Feature flag (`energyBudget.enabled`), gradual rollout
- **Testing:** Parallel runs with/without feature flag

**Risk 2: Over-constraining early game**
- **Mitigation:** Baseline capacity high enough for normal operations
- **Testing:** Early-game scenarios (months 0-24)

**Risk 3: Performance impact**
- **Mitigation:** Energy budget already runs once per month (phase 12.75)
- **Testing:** Profile phase execution times

**Risk 4: Complexity creep**
- **Mitigation:** Clear documentation, follow ClimateDeploymentPhase pattern
- **Testing:** Code review focuses on simplicity

---

## Open Questions

1. **Should we backport energy constraints to pre-energy-budget saves?**
   - Proposal: Feature flag defaults to `false`, opt-in for new games

2. **How should energy surplus scale with breakthroughs?**
   - Proposal: Fusion/solar breakthroughs increase `globalCapacity.totalTWh`

3. **Should crypto mining compete in energy budget?**
   - Proposal: Yes, TIER 4 (elective), can be policy-limited

4. **How do we handle energy storage technologies?**
   - Proposal: Future work, currently outside scope

---

## Next Steps

1. Post to implementation channel for feedback
2. Review plan with Roy (simulation-maintainer)
3. Begin Phase 1 integration (Priority 1 consumers)
4. Run baseline Monte Carlo before changes
5. Iterate with testing after each phase

---

## Appendix: Energy Category Mapping

| Energy Consumer | Energy Category | Priority Tier | TWh/year (full deployment) |
|----------------|----------------|---------------|---------------------------|
| DAC | `dac` | 3 (Climate) | 15,000 |
| Green Hydrogen | `green-hydrogen` | 3 (Climate) | 5,250 |
| SAI | `sai` | 3 (Climate) | 100 |
| Carbon Mineralization | `carbon-mineralization` | 3 (Climate) | 8,000 |
| AI Datacenter | `ai-datacenter` | 4 (Elective) | 437.5 |
| Advanced Compute | `advanced-compute` | 4 (Elective) | 200 |
| Industrial Electrification | `industrial-electrification` | 2 (High Priority) | 3,000 |
| Transport Electrification | `transport-electrification` | 2 (High Priority) | 2,500 |
| Baseline Essential | `baseline-essential` | 1 (Essential) | 14,500 |

**Source:** `EnergyBudgetPhase.ts` lines 42-102
