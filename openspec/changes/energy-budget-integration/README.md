# H-1: Energy Budget System Integration

**Status:** Phase 0 Complete → Ready for Implementation
**Priority:** HIGH (Architecture Integration)
**Timeline:** 2-3 days estimated
**Created:** 2025-12-10

## Quick Summary

EnergyBudgetPhase exists and works correctly with ClimateDeploymentPhase, but other major energy consumers (AI infrastructure, power generation, technology effects) operate independently. This creates parallel constraint systems where god mode scenarios can claim the same electricity multiple times.

**Goal:** Migrate all energy consumers to use unified energy budget allocations.

## Problem

**Current State:**
- ✅ EnergyBudgetPhase calculates global constraints (Dec 9, 2025)
- ✅ ClimateDeploymentPhase uses energy budget correctly
- ❌ AI infrastructure grows without energy constraint
- ❌ Power generation (AI/crypto) ignores global capacity
- ❌ Technology effects don't check energy budget
- ❌ God mode deployment scenarios collapse from over-commitment

**Target State:**
- ✅ All energy consumers read from energy budget
- ✅ Priority allocation enforced (essential > high > climate > elective)
- ✅ God mode scenarios constrained but stable
- ✅ Clear logging of energy conflicts

## Discovery Phase Results

**Energy Consumers Identified:**

**TIER 4 (Elective - 5-10% capacity):**
1. AI Infrastructure Resources (`aiInfrastructureResources.ts`)
   - Current: 500 MW + 200 MW/capability (independent)
   - Target: Use `energyBudget.allocations['elective']`
   - Effort: 4-6 hours

2. Power Generation System (`powerGeneration.ts`)
   - Current: AI inference/training/crypto separate logic
   - Target: Constrain by TIER 4 allocation
   - Effort: 6-8 hours

**TIER 2/3 (High Priority + Climate - 40-60% capacity):**
3. Technology Effects Engine (`effectsEngine.ts`)
   - Current: Tech effects apply independently
   - Target: Energy-consuming techs check budget
   - Effort: 4-6 hours (deferred to Phase 2)

**TIER 4 (TBD):**
4. UBI Compute Allocation (if exists)
   - Discovery needed: Search for UBI implementation
   - Effort: 2-3 hours (Phase 2)

## Integration Pattern

**Working reference:** `src/simulation/engine/phases/ClimateDeploymentPhase.ts`

```typescript
// 1. Read energy budget
const energyBudget = assertStateProperty(state, 'energyBudget', {...});

// 2. Get allocation for category
const allocation = energyBudget.allocations['elective']; // or 'climate', 'high', 'essential'
const effectivenessMultiplier = allocation?.effectivenessMultiplier ?? 1.0;

// 3. Apply to nominal capacity
const effectiveCapacity = nominalCapacity * effectivenessMultiplier;

// 4. Log if constrained
if (effectivenessMultiplier < 0.9) {
  console.log(`📊⚡ [System] constrained: ${(effectivenessMultiplier * 100).toFixed(1)}%`);
}
```

## Implementation Plan

### Phase 1: Core Energy Consumers (2 days)

**Agent:** simulation-maintainer (Roy)
**Handoff:** `.claude/agents/HANDOFF_roy_energy_budget_integration.md`

**Tasks:**
- T1.1: AI Infrastructure Resources (4-6h)
- T1.2: Power Generation System (6-8h)
- T1.3: EnergyBudgetPhase Enhancements (2-3h)

**Deliverables:**
- Code changes (3 files)
- Unit tests (2 files)
- Integration test (1 file)
- God mode validation

### Phase 2: Technology Effects (1 day, optional)

**Agent:** simulation-maintainer OR feature-implementer
**Tasks:**
- T2.1: Effects Engine Integration (4-6h)
- T2.2: UBI Compute Discovery (2-3h)

### Phase 3: Validation & Review (0.5 day)

**Quality Gates:**
- God mode testing (N≥10 Monte Carlo)
- Architecture review (MANDATORY)
- Documentation & archival

## Research Foundation

**Already validated (QG1 PASSED Dec 9, 2025):**
- Research: `research/energy_budget_constraints_20251209.md` (Grade B+)
- Critique: `reviews/research_validation_energy_budget_20251209.md`
- Sources: IEA WEO 2024, MIT DAC, DOE hydrogen, IEA AI & Energy 2024

**Key Parameters:**
- Global capacity: 29,000 TWh/year (2024 baseline)
- Clean electricity: 11,500 TWh/year (40% clean share)
- DAC energy: 1,200-2,500 kWh/tCO₂
- AI datacenter: 415-460 TWh baseline (corrected from 730 TWh)

**Priority Tiers:**
- TIER 1: 40-50% (Essential - healthcare, food, water, housing)
- TIER 2: 30-40% (High Priority - industry, transport, education)
- TIER 3: 10-20% (Climate Tech - DAC, hydrogen, carbon removal)
- TIER 4: 5-10% (Elective - AI expansion, crypto, luxury compute)

## Success Criteria

1. **Constraint Enforcement:**
   - God mode scenario does NOT collapse
   - AI datacenter growth limited by available electricity
   - Climate tech prioritized over elective tech

2. **Performance:**
   - Energy budget checks add < 5ms per step
   - No redundant calculations

3. **Determinism:**
   - Monte Carlo N≥10, CV < 0.01%
   - Same seed → same energy constraints

4. **Logging:**
   - Clear energy shortage warnings (📊⚡ pattern)
   - Conflict tracking (AI vs crypto vs UBI breakdown)

## Files

**Planning Documents:**
- `proposal.md` - Complete feature specification (8.2 KB)
- `tasks.md` - Detailed task breakdown (12.5 KB)
- `WORKFLOW_STATUS.md` - Phase tracking and status (9.8 KB)
- `README.md` - This file (quick reference)

**Handoffs:**
- `.claude/agents/HANDOFF_roy_energy_budget_integration.md` (13.6 KB)

**Reference Implementation:**
- `src/simulation/engine/phases/ClimateDeploymentPhase.ts` (working pattern)

**Research:**
- `research/energy_budget_constraints_20251209.md` (validated Dec 9)
- `reviews/research_validation_energy_budget_20251209.md` (Grade B+)

## Timeline

- **Phase 0 (Discovery):** 1 hour ✅ COMPLETE (Dec 10, 02:00-03:00)
- **Phase 1 (Implementation):** 2 days ⏳ READY TO START
- **Phase 2 (Effects Engine):** 1 day ⏸️ DEFERRED (optional)
- **Phase 3 (Validation):** 0.5 day ⏸️ BLOCKED (after Phase 1)
- **Total:** 3.5 days (conservative with reviews)

## Next Steps

**For User:**
1. Invoke simulation-maintainer (Roy) to begin Phase 1
2. OR wait for autonomous worker to pick up (hourly schedule)

**For Roy:**
1. Read handoff: `.claude/agents/HANDOFF_roy_energy_budget_integration.md`
2. Implement Phase 1 tasks (2 days)
3. Run tests + validation
4. Post results to implementation channel

**For Orchestrator:**
1. Monitor implementation channel
2. Spawn architecture-skeptic (Quality Gate 2)
3. Coordinate documentation & archival
4. Mark H-1 COMPLETE in OpenSpec

---

**Created:** 2025-12-10 03:00 UTC
**Orchestrator:** orchestrator-1
**Status:** Phase 0 complete, ready for implementation
