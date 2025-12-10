# H-1: Energy Budget System Integration

**Status:** IN PROGRESS - Discovery Phase Complete
**Priority:** HIGH (Architecture Integration)
**Effort:** 2-3 days
**Created:** 2025-12-10
**Workflow ID:** h1-energy-integration

## Problem Statement

EnergyBudgetPhase calculates global energy constraints and effectiveness multipliers, but only ClimateDeploymentPhase currently consumes them. Other major energy consumers operate independently:

1. **AI Infrastructure** (`aiInfrastructureResources.ts`):
   - Base: 500 MW + 200 MW per capability point
   - Grows independently of global electricity capacity
   - No constraint from EnergyBudgetPhase allocations

2. **Power Generation** (`powerGeneration.ts`):
   - AI inference power, training spikes, crypto mining
   - Data center buildout with 4-year construction lag
   - Operates with separate logic, ignores energy budget

3. **UBI Compute Drain** (if implemented):
   - Would consume TIER 4 (elective) allocation
   - Currently no integration pattern

4. **Technology Deployments** (`effectsEngine.ts`):
   - DAC, hydrogen, mineralization claim energy
   - Only constrained via ClimateDeploymentPhase
   - Other tech effects ignore energy limits

**Result:** Parallel energy constraint systems create inconsistent modeling. God mode deployment scenarios claim the same electricity multiple times without priority allocation conflicts.

## Discovery Phase Results

### Energy Consumers Identified

**TIER 1: Already Integrated**
- ✅ ClimateDeploymentPhase uses `energyBudget.allocations['climate']`
- ✅ Pattern working correctly (Dec 9, 2025 implementation)

**TIER 2: High Priority Integration (Phase 1)**
1. **AI Infrastructure Resources**
   - File: `src/simulation/aiInfrastructureResources.ts`
   - Current: Independent energy calculation (500 MW + 200 MW/capability)
   - Target: Use `energyBudget.allocations['elective']` (TIER 4)
   - Impact: Constrain datacenter growth by available electricity
   - Effort: 4-6 hours

2. **Power Generation System**
   - File: `src/simulation/powerGeneration.ts`
   - Current: Separate AI inference/training/crypto calculations
   - Target: Read from energy budget, respect TIER 4 cap
   - Impact: AI power growth limited by grid capacity
   - Effort: 6-8 hours

**TIER 3: Medium Priority Integration (Phase 2)**
3. **Technology Effects Engine**
   - File: `src/simulation/techTree/effectsEngine.ts`
   - Current: Tech effects apply independently
   - Target: Energy-consuming techs check budget before applying effects
   - Impact: Hydrogen, industrial electrification constrained
   - Effort: 4-6 hours

4. **UBI Compute Allocation** (if exists)
   - Search needed: UBI compute drain implementation
   - Target: TIER 4 elective allocation
   - Effort: TBD after discovery

**TIER 4: Low Priority (Phase 3)**
5. **Stochastic Innovation Energy** (if applicable)
   - File: `src/simulation/engine/phases/StochasticInnovationPhase.ts`
   - May have energy-consuming breakthrough techs
   - Effort: 2-3 hours

### Integration Pattern (from ClimateDeploymentPhase)

```typescript
// Example from ClimateDeploymentPhase.ts (working pattern)
const energyBudget = assertStateProperty(
  state,
  'energyBudget',
  { location: 'ClimateDeploymentPhase', month: state.currentMonth }
);

const climateAllocation = energyBudget.allocations['climate'];
const effectivenessMultiplier = climateAllocation?.effectivenessMultiplier ?? 1.0;

// Apply multiplier to technology effectiveness
const effectiveDACCapacity = nominalDACCapacity * effectivenessMultiplier;
```

**Key principles:**
1. Read `state.energyBudget.allocations[category]`
2. Extract `effectivenessMultiplier` (default 1.0 if unconstrained)
3. Apply to nominal capacity/effectiveness
4. Log constraint impact with 📊⚡ emoji pattern

## Implementation Plan

### Phase 1: Core Energy Consumers (2 days)

**P1.1: AI Infrastructure Resources** (4-6 hours)
- Modify `updateAIInfrastructureResources()`
- Read `energyBudget.allocations['elective']`
- Apply multiplier to datacenter growth
- Add energy shortage logging
- Unit tests for constraint scenarios

**P1.2: Power Generation System** (6-8 hours)
- Modify `updatePowerGeneration()`
- Constrain AI inference power by elective allocation
- Training spikes respect available capacity
- Crypto mining competes for same TIER 4 pool
- Integration tests with EnergyBudgetPhase

**P1.3: EnergyBudgetPhase Enhancements** (2-3 hours)
- Add 'elective' category explicitly (currently implied in TIER 4)
- Track AI datacenter vs crypto vs UBI compute separately
- Improve conflict logging (which systems competing)

### Phase 2: Technology Effects (1 day)

**P2.1: Effects Engine Integration** (4-6 hours)
- Identify energy-consuming tech effects
- Check energy budget before applying
- Add effectiveness degradation under constraint
- Update tech tree energy requirements

**P2.2: UBI Compute Discovery** (2-3 hours)
- Search codebase for UBI compute implementation
- If exists: integrate with TIER 4 elective
- If missing: document for future implementation

### Phase 3: Validation & Review (4-6 hours)

**P3.1: God Mode Testing**
- Deploy all energy-intensive techs simultaneously
- Verify constraint enforcement (should NOT collapse)
- Check priority allocation working (essential > elective)
- Monte Carlo N≥10 with energy stress scenarios

**P3.2: Architecture Review (Quality Gate 2)**
- Spawn architecture-skeptic
- Focus: Performance (energy budget checked every phase?), state propagation
- Address CRITICAL/HIGH issues before merge

**P3.3: Documentation**
- Update wiki with energy budget integration pattern
- Document which systems use which tier
- Add debugging guide for energy constraint issues

## Research Foundation

**Already validated (QG1 PASSED Dec 9, 2025):**
- Research: `research/energy_budget_constraints_20251209.md` (Grade B+)
- Critique: `reviews/research_validation_energy_budget_20251209.md`
- Sources: IEA WEO 2024, MIT DAC, DOE hydrogen, IEA AI & Energy 2024

**No new research needed** - implementation only uses existing framework.

## Success Criteria

1. **Constraint Enforcement:**
   - God mode scenario does NOT collapse from energy over-commitment
   - AI datacenter growth limited by TIER 4 allocation
   - Climate tech competes for TIER 3, gets priority over TIER 4

2. **Performance:**
   - Energy budget checks add <5ms per simulation step
   - No redundant calculations (use cached allocations)

3. **Determinism:**
   - Monte Carlo N≥10, CV < 0.01%
   - Same seed → same energy constraints → same outcomes

4. **Logging:**
   - Clear energy shortage warnings (📊⚡ pattern)
   - Conflict tracking (which techs competing for same capacity)
   - Effectiveness degradation visible in logs

## Quality Gates

**Gate 1: Research Validation** ✅ COMPLETE (Dec 9, 2025)
- Grade B+ research file
- All parameters justified with peer-reviewed sources

**Gate 2: Architecture Review** (MANDATORY)
- Spawn architecture-skeptic after Phase 2 complete
- Must address CRITICAL/HIGH issues before Phase 3
- Focus: Performance, state propagation, complexity

**Gate 3: Code Quality** (OPTIONAL)
- If architecture review finds concerns, spawn senior-dev-reviewer
- Otherwise skip (implementation follows established patterns)

## Timeline

- **Phase 1:** 2 days (AI infrastructure + power generation + budget enhancements)
- **Phase 2:** 1 day (effects engine + UBI discovery)
- **Phase 3:** 0.5 day (validation + review)
- **Total:** 3.5 days (conservative, includes review iterations)

## Dependencies

- ✅ EnergyBudgetPhase exists and working
- ✅ ClimateDeploymentPhase integration pattern validated
- ✅ Research foundation complete (QG1 passed)
- ⏳ Awaiting: Roy (simulation-maintainer) implementation

## Next Actions

1. Create detailed handoff for simulation-maintainer (Roy)
2. Roy implements Phase 1 (AI infrastructure + power generation)
3. Unit tests + integration tests
4. Phase 2 implementation (effects engine)
5. God mode validation testing
6. Architecture review (Quality Gate 2)
7. Documentation + OpenSpec delta merge
8. Archive to `docs/implementation-history/`
