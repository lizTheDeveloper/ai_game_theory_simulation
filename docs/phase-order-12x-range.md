# Phase Execution Order Documentation: 12.x Range

**Last Updated:** December 12, 2025
**Purpose:** Document phase groups, dependencies, and insertion points for the crowded 12.x range
**Related:** M-5 (Architecture integration review finding)

---

## Overview

The 12.x range contains 7 phases that handle **technology deployment, social systems, and climate interventions**. This range is particularly crowded due to complex dependencies between technology discovery, social deployment, and resource allocation.

**Range:** 12.5 - 12.8 (0.3 point span)
**Phases:** 7 total
**Grouping:** Technology → Social Systems → Resource Allocation → Deployment

---

## Phase Execution Order

| Order | Phase | ID | Purpose | Dependencies |
|-------|-------|----|---------|-----------|
| 12.5 | TechTreePhase | `tech-tree` | Technology discovery and readiness | None (pure calculation) |
| 12.6 | StochasticInnovationPhase | `stochastic-innovation` | Stochastic breakthroughs | tech-tree |
| 12.61 | Tier2SocialSystemsPhase | `tier2-social-systems` | Centaur Systems (earliest intervention) | stochastic-innovation |
| 12.65 | CooperativeSystemsPhase | `cooperative-systems` | Cooperative economic systems | tech-tree, stochastic-innovation |
| 12.7 | MeaningRenaissancePhase | `meaning-renaissance` | Cultural/meaning transformation | cooperative-systems |
| 12.75 | EnergyBudgetPhase | `energy-budget` | Energy allocation (AI vs climate tech) | meaning-renaissance |
| 12.8 | ClimateDeploymentPhase | `climate-deployment` | Deploy climate technologies | tech-tree, stochastic-innovation, meaning-renaissance, energy-budget |

---

## Dependency Graph

```
TechTreePhase (12.5)
  ├─→ StochasticInnovationPhase (12.6)
  │     ├─→ Tier2SocialSystemsPhase (12.61) [Centaur Systems]
  │     └─→ CooperativeSystemsPhase (12.65)
  │           └─→ MeaningRenaissancePhase (12.7)
  │                 └─→ EnergyBudgetPhase (12.75)
  └─→ ClimateDeploymentPhase (12.8) [reads from all above]
```

---

## Phase Groups

### Group 1: Technology Discovery (12.5 - 12.6)
**Purpose:** Determine what technologies are available this month

- **12.5 TechTreePhase:** Update tech tree readiness, check unlock conditions
- **12.6 StochasticInnovationPhase:** Apply breakthrough events (AI advances, climate tech, social systems)

**Why this order:** Deterministic tech tree updates before stochastic breakthroughs ensures reproducibility.

### Group 2: Social System Deployment (12.61 - 12.7)
**Purpose:** Model social/economic transformations enabled by new technologies

- **12.61 Tier2SocialSystemsPhase:** Centaur Systems (earliest intervention requiring aligned AI)
- **12.65 CooperativeSystemsPhase:** Cooperative economics (requires tech base + social readiness)
- **12.7 MeaningRenaissancePhase:** Cultural transformation (requires cooperative base)

**Why this order:** Social systems deploy in dependency order - centaur systems enable cooperatives, cooperatives enable meaning renaissance.

### Group 3: Resource Allocation (12.75)
**Purpose:** Allocate constrained energy resources between AI scaling and climate tech

- **12.75 EnergyBudgetPhase:** Calculates energy budget, allocates to AI datacenters vs climate deployment

**Why here:** Must occur AFTER meaning renaissance (values affect allocation priorities) but BEFORE climate deployment (which consumes allocated energy).

### Group 4: Climate Deployment (12.8)
**Purpose:** Deploy climate technologies using allocated resources

- **12.8 ClimateDeploymentPhase:** Applies climate tech effects (carbon removal, adaptation, etc.)

**Why last:** Reads tech availability (12.5-12.6), social readiness (12.7), and energy allocation (12.75).

---

## Insertion Guidelines

### Adding New Phases to 12.x Range

**Before inserting a new phase in 12.x:**

1. **Identify dependencies:**
   - What does your phase READ from? (upstream dependencies)
   - What does your phase WRITE to? (downstream dependencies)

2. **Find insertion point:**
   - **12.5x:** Technology discovery (before social deployment)
   - **12.6x:** Social system deployment (after tech, before resource allocation)
   - **12.7x:** Resource allocation (after social systems, before climate deployment)
   - **12.8x:** Climate/technology deployment (reads from all above)

3. **Check decimal availability:**
   - Current gaps: None (range is fully occupied)
   - If inserting between existing phases, use midpoint (e.g., between 12.6 and 12.61, use 12.605)

4. **Update this documentation:**
   - Add phase to table above
   - Update dependency graph
   - Explain why the new order is correct

### Examples

**Good:** New "AdvancedMaterialsPhase" at 12.55 (between tech-tree and stochastic-innovation)
- Reads: TechTreePhase tech availability
- Writes: Material science breakthroughs
- Order: 12.55 (after tech tree, before stochastic innovation uses materials)

**Bad:** New "ClimateAdaptationPhase" at 12.72 (between meaning-renaissance and energy-budget)
- Problem: Should be at 12.85 (AFTER energy allocation, not before)
- Climate deployment needs energy budget to know what resources are available

---

## Rationale for Fine-Grained Ordering

The 12.x range uses fine decimals (12.5, 12.6, 12.61, 12.65, 12.7, 12.75, 12.8) because:

1. **Complex dependencies:** Social systems depend on each other in specific order
2. **Resource constraints:** Energy allocation must happen after social priorities but before deployment
3. **Historical growth:** Range started with 3 phases (12.5, 12.7, 12.8), grew to 7 as social systems were added

**Alternative considered:** Spread phases to 10.x - 18.x range
**Rejected because:** Would break semantic grouping (these are all "post-technology deployment" phases)

---

## Common Pitfalls

### Pitfall 1: Assuming energy is unlimited
- **Symptom:** Climate deployment phase ignores EnergyBudgetPhase allocations
- **Fix:** Read `state.energyBudget.allocations` and respect effectiveness multipliers

### Pitfall 2: Inserting social systems before tech availability
- **Symptom:** Social system tries to deploy tech that isn't discovered yet
- **Fix:** Ensure order > 12.6 (after stochastic innovation)

### Pitfall 3: Reading values written in same 12.x batch
- **Symptom:** Circular dependency within single step
- **Fix:** Split into two phases with clear order (reader must have higher order number)

---

## Related Documentation

- `src/simulation/engine/PhaseOrchestrator.ts` - Phase execution engine
- `src/simulation/engine/phases/README.md` - General phase documentation
- `reviews/architecture_integration_review_20251212.md` - M-5 issue documentation
- `docs/wiki/README.md` - System-level documentation

---

## Maintenance Notes

**When modifying phase order in 12.x range:**

1. Update this file (table + dependency graph)
2. Run full test suite (`npm test`)
3. Check for circular dependencies (`npx madge --circular src/simulation`)
4. Verify Monte Carlo determinism (N=10 runs with same seed must match)

**When adding new phase to 12.x range:**

1. Follow insertion guidelines above
2. Add phase to table
3. Update dependency graph
4. Explain rationale in commit message
5. Update this file in same commit

---

**Generated:** December 12, 2025
**Issue:** M-5 (Phase execution order documentation gap)
**Status:** Complete
