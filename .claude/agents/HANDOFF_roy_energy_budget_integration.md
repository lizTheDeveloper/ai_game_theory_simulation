# HANDOFF: Roy - Energy Budget System Integration (H-1)

**Date:** December 10, 2025
**Coordinator:** orchestrator-1
**Priority:** HIGH (architecture integration)
**Complexity:** MEDIUM
**Effort Estimate:** 2-3 days

---

## Executive Summary

**Problem:** EnergyBudgetPhase allocations only consumed by ClimateDeploymentPhase. All other energy consumers operate independently, creating parallel/inconsistent energy modeling. No unified priority enforcement means AI datacenters can scale unlimited while climate tech starves.

**Your Mission:** Migrate Priority 1 energy consumers (AI infrastructure, power generation) to unified energy budget system.

**Success Criteria:**
- AI datacenter energy reads from `energyBudget.allocations['ai-datacenter']`
- Power generation unified with energy budget
- God mode doesn't cause energy-driven collapse
- Monte Carlo validated (N≥10, deterministic)

---

## Context: Research Already Validated

**Research File:** `research/energy_budget_constraints_20251209.md` (Grade B+)
**QG1 Validation:** `reviews/research_validation_energy_budget_20251209.md` (CONDITIONAL PASS)

**Key Parameters (research-backed, no need to re-validate):**
- Global electricity: 29,000 TWh/year (2024)
- AI datacenter baseline: 415-460 TWh (corrected from 730 TWh)
- Priority tiers: Essential (1) → High (2) → Climate (3) → Elective (4)
- AI/compute = TIER 4 (elective, lowest priority)
- Effectiveness multiplier: (allocated / demand)^1.2

**Reference Implementation:** ClimateDeploymentPhase (order 12.8) already works correctly.

---

## Implementation Files

**Complete Specification:**
- Implementation plan: `/openspec/changes/energy-budget-integration/proposal.md`
- Task breakdown: `/openspec/changes/energy-budget-integration/tasks.md`

**Key Files to Modify:**
1. `src/simulation/aiInfrastructureResources.ts` - AI datacenter energy
2. `src/simulation/powerGeneration.ts` - Power gen unification
3. `src/simulation/engine/phases/EnergyBudgetPhase.ts` - Enhancements

**Reference File (working pattern):**
- `src/simulation/engine/phases/ClimateDeploymentPhase.ts` - Follow this pattern

---

## Phase 1: Priority 1 Consumers (Your Focus)

### Task 1: AI Infrastructure Energy Integration

**File:** `src/simulation/aiInfrastructureResources.ts`
**Estimate:** 4-6 hours

**Pattern to follow:**
```typescript
// Step 1: Calculate unconstrained demand
const baseDemandMW = ENERGY_BASE_CONSUMPTION +
                    ENERGY_PER_CAPABILITY_POINT * aggregateCapability;

// Step 2: Query energy budget
const energyMultiplier = getEnergyMultiplier(state, 'ai-datacenter');

// Step 3: Apply constraint
const constrainedEnergyMW = baseDemandMW * energyMultiplier;

// Step 4: Scale water consumption accordingly
const waterConsumption = calculateWater(constrainedEnergyMW);

function getEnergyMultiplier(state: GameState, category: string): number {
  if (!state.energyBudget?.enabled) return 1.0; // Feature flag

  const allocation = state.energyBudget.allocations[category];
  if (!allocation) return 1.0;

  return assertFinite(
    allocation.effectivenessMultiplier,
    {
      location: 'getEnergyMultiplier',
      valueName: 'effectivenessMultiplier',
      month: state.currentMonth,
      additionalInfo: { category }
    }
  );
}
```

**Roy's Checklist:**
- [ ] Use `assertFinite()` for energy calculations (NO SILENT FALLBACKS)
- [ ] Feature flag check (`energyBudget?.enabled`)
- [ ] Keep `demand` field for tracking, add `allocated` field
- [ ] Water consumption scales with allocated (not demand)
- [ ] Unit test: multiplier 0.5 → consumption halved
- [ ] No NaN/Infinity

---

### Task 2: Power Generation Unification

**File:** `src/simulation/powerGeneration.ts`
**Estimate:** 6-8 hours

**Current Problem:** Separate tracking (`dataCenterPower`, `aiInferencePower`) duplicates energy budget.

**Solution:** Read from energy budget, convert TWh/year to MW:
```typescript
if (state.energyBudget?.enabled) {
  const aiDatacenterAlloc = state.energyBudget.allocations['ai-datacenter'];

  // TWh/year to MW conversion: 1 TWh/year = 114.16 MW
  const twhToMW = 114.16;

  power.aiInferencePower = aiDatacenterAlloc.allocatedTWh * twhToMW;
  power.dataCenterPower = power.aiInferencePower +
                          power.aiTrainingPower +
                          power.cryptoPower +
                          power.traditionalCloudPower;
} else {
  // Legacy calculation (backwards compatibility)
}
```

**Roy's Checklist:**
- [ ] TWh/year → MW conversion correct
- [ ] Feature flag preserves legacy calculation
- [ ] Remove duplicate tracking when enabled
- [ ] Keep growth projections (feedback to capacity)
- [ ] Unit test: conversion math correct

---

### Task 3: EnergyBudgetPhase Enhancements

**File:** `src/simulation/engine/phases/EnergyBudgetPhase.ts`
**Estimate:** 2-3 hours

**Changes:**
1. Add demand validation (warn if > 150% capacity)
2. Improve tech ID → category mapping
3. Add crypto mining category (TIER 4, if relevant)

**Validation pattern:**
```typescript
if (totalDemand > totalCapacity * 1.5) {
  console.log(`⚠️ ENERGY CRISIS: Demand ${totalDemand.toFixed(0)} TWh exceeds capacity by ${((totalDemand/totalCapacity - 1) * 100).toFixed(0)}%`);

  const topConsumers = Object.entries(demands)
    .sort((a, b) => b[1].demandTWh - a[1].demandTWh)
    .slice(0, 5)
    .map(([cat, d]) => `${cat}: ${d.demandTWh.toFixed(0)} TWh`)
    .join(', ');

  console.log(`  Top consumers: ${topConsumers}`);
}
```

**Roy's Checklist:**
- [ ] Demand > 150% capacity triggers warning
- [ ] Top 5 consumers logged
- [ ] Tech mapping comprehensive
- [ ] Emoji: ⚠️ warnings, 🚨 crisis, ⚡ allocation

---

## Testing Requirements

**Unit Tests:**
- Energy multiplier 0.0-1.0 range
- Feature flag on/off behavior
- TWh/year ↔ MW conversion
- Demand validation triggers

**Integration Tests:**
- AI infrastructure + energy budget
- Power generation + energy budget
- Climate deployment (already working)

**Monte Carlo Validation:**
- Baseline (before): N=10, seed=12345
- Phase 1 complete: N=10, seed=12345
- Compare determinism (same seed = same results)
- God mode test: Deploy all 92 techs

**God Mode Evidence:**
Current behavior: Deploying all 92 techs causes collapse because no energy constraint. After fix: Energy crisis logged, low-priority techs constrained.

---

## Defensive Coding Requirements (Your Specialty)

**Roy's Rules:**
1. ✅ `assertFinite()` for all energy calculations
2. ✅ NO silent fallbacks (`?? defaultValue` is BANNED)
3. ✅ Fail loudly if data missing (throw with context)
4. ✅ Feature flag checked consistently
5. ✅ Unit conversion documented (comments)
6. ✅ Module-level state reset (determinism)

**NaN Nemesis Protocol:**
- Every energy calculation gets `assertFinite()`
- Division by zero protected
- No circular dependencies (read → transform → write)
- Module state reset for determinism

**Example (good):**
```typescript
const energy = assertFinite(
  baseEnergy * multiplier,
  {
    location: 'calculateEnergy',
    valueName: 'energy',
    month: state.currentMonth,
    additionalInfo: { baseEnergy, multiplier }
  }
);
```

**Example (bad - DON'T DO THIS):**
```typescript
const energy = isNaN(baseEnergy * multiplier) ? 500 : baseEnergy * multiplier;
```

---

## Emoji Conventions (Pictographic Event Language)

**Energy domain:**
- ⚡ Energy allocation events
- ⚠️ Energy warnings (demand approaching capacity)
- 🚨 Energy crisis (demand > 150% capacity)
- 🏭 Industrial/datacenter energy
- 💡 Energy breakthrough (fusion, solar)
- ❌ Error (all errors use this)

**Combining pattern (max 2):**
- `⚡🏭 AI datacenter allocation: 437 TWh`
- `🚨⚡ ENERGY CRISIS: Demand 45,000 TWh exceeds capacity`

---

## Integration Channel Updates

**Post to implementation channel when:**
- Task 1 complete → [IN-PROGRESS] status + Monte Carlo results
- Task 2 complete → [IN-PROGRESS] status + integration test results
- Task 3 complete → [COMPLETED] status + god mode test results
- Blocked → [BLOCKED] status + blocker description
- Question → [QUESTION] status + specific question

**Format:**
```
---
**roy** | YYYY-MM-DD HH:MM | [STATUS]

Task 1 complete: AI infrastructure integrated
**Changes:** aiInfrastructureResources.ts (87 lines modified)
**Testing:** Monte Carlo N=10, deterministic ✅, no NaN ✅
**Next:** Task 2 (power generation unification)
---
```

---

## Success Criteria (Phase 1 Complete)

**Functional:**
- [ ] AI infrastructure uses `energyBudget.allocations['ai-datacenter']`
- [ ] Power generation reads from energy budget
- [ ] EnergyBudgetPhase tracks all consumers
- [ ] God mode logs energy crisis (doesn't crash)

**Quality:**
- [ ] Monte Carlo validated (N≥10, CV < 0.01%)
- [ ] Deterministic (same seed = identical results)
- [ ] No NaN/Infinity in energy calculations
- [ ] Feature flag works correctly

**Code Quality (Your Standards):**
- [ ] All energy calcs use `assertFinite()`
- [ ] No silent fallbacks
- [ ] Emoji conventions followed
- [ ] Unit tests pass

---

## Known Gotchas (Watch Out)

1. **TWh/year vs MW conversion:** 1 TWh/year = 114.16 MW (8,760 hours/year)
2. **Feature flag:** Must check `energyBudget?.enabled` consistently
3. **Module-level state:** Reset global vars for determinism (see aiInfrastructureResources.ts line 91)
4. **Priority tiers:** AI = TIER 4 (lowest), gets constrained first
5. **Backwards compatibility:** Old saves don't have energyBudget, feature flag handles this

---

## Questions? Blockers?

**Post to implementation channel with:**
- [QUESTION] tag for clarifications
- [BLOCKED] tag for blockers
- [ALERT] tag for critical issues

**Orchestrator monitoring:** orchestrator-1 checking implementation channel regularly

---

## Next Phases (After Phase 1)

**Phase 2:** Compute allocation + tech effects (Priority 2)
**Phase 3:** Stochastic innovation + government actions (Priority 3)

**Don't start Phase 2 until Phase 1 validated by orchestrator.**

---

## Roy's Internal Monologue (Optional Reading)

"*sigh* Another integration task. Of course the energy budget only talks to ONE consumer. Why would we design it properly from the start? That would be too easy.

Alright. AI infrastructure first. Going to add SO MANY assertions. If this goes NaN, I want to know EXACTLY where and why. No more `?? 500` nonsense hiding bugs for months.

Power generation unification - this is going to be fun. TWh/year to MW conversion. Someone's going to get this wrong in 6 months and I'll be back here fixing it. Better add a comment explaining the conversion factor.

EnergyBudgetPhase enhancements - validation warnings. Good. I WANT to know when we're exceeding capacity by 150%. That's the kind of thing that should be LOUD.

God mode test. If this doesn't work, the whole integration is pointless. All 92 techs deployed, energy crisis logged, low-priority stuff gets constrained. That's the dream.

Let's do this. And add assertions. So many assertions."

---

**HANDOFF COMPLETE. Good luck, Roy. Try not to break anything. (But if you do, at least make it fail loudly.)**
