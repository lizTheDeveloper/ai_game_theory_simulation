# Proposed Feature: Energy Budget Constraints

**Created:** November 25, 2025
**Author:** autonomous-worker (via research-skeptic recommendation)
**Priority:** MEDIUM (god mode effectiveness improvement)
**Effort:** 2-3 days (research + implementation)

---

## Problem Statement

The current simulation allows simultaneous deployment of energy-intensive technologies without hard constraints. This leads to:

1. **God mode paradox:** Deploying all 92 technologies simultaneously causes collapse
2. **Unrealistic scaling:** DAC, hydrogen production, AI datacenters all claim same electricity
3. **Missing competition:** Technologies don't compete for limited energy resources

**Real-world constraint (MIT Energy Initiative 2024):**
- DAC at scale requires 34-51% of global electricity
- AI datacenter growth claiming 6-8% of global electricity by 2030
- Green hydrogen production requires dedicated renewable capacity

---

## Proposed Solution

### Phase 1: Research (1 day)
1. Quantify energy requirements per technology category
2. Document global electricity generation capacity and growth rates
3. Model energy competition dynamics (priority ordering)

**Key sources:**
- IEA World Energy Outlook 2024
- MIT Energy Initiative DAC reports
- IEA AI & Energy special report (2024)
- US DOE hydrogen strategy

### Phase 2: Implementation (1-2 days)
1. Add `EnergyBudgetState` type:
   ```typescript
   interface EnergyBudgetState {
     globalCapacity: {
       totalGW: number;           // ~8,000 GW current
       cleanGW: number;           // ~3,500 GW current
       growthRate: number;        // ~3% annual
     };
     allocations: {
       [techCategory: string]: {
         demandGW: number;
         allocatedGW: number;
         constrainedEffectiveness: number;  // 0-1, based on demand/supply
       };
     };
     conflicts: string[];         // List of competing technologies
   }
   ```

2. Modify `ClimateDeploymentPhase` to check energy availability
3. Add technology priority ordering (essential vs elective)
4. Constrain effectiveness based on energy allocation

### Phase 3: Validation (0.5 days)
1. Verify god mode no longer causes instant collapse
2. Check sequenced deployment scenarios work correctly
3. Validate against IEA projections

---

## Expected Impact

- **God mode realism:** Energy constraints explain why 92 simultaneous techs fail
- **Scenario validity:** Paced deployment makes physical sense
- **Policy relevance:** Shows energy transition as bottleneck for climate tech

---

## Connection to Existing Systems

Already implemented:
- `ClimateDeploymentPhase` has phased deployment timescales
- `techDeploymentSchedule` enables sequenced rollout
- Energy consumption tracked in `resourceEconomy.energyConsumption`

This feature adds **hard constraints** on what existing systems allow.

---

## Risk Assessment

**Medium risk:**
- Modifies technology effectiveness calculations
- May require recalibrating deployment timescales
- Interaction with economic model (electricity prices)

**Mitigation:**
- Implement as effectiveness multiplier, not hard block
- Config flag to enable/disable during testing
- Validate against sequenced deployment scenarios

---

## Next Steps

1. Post to research channel for energy requirement data
2. Cross-check with existing climate deployment implementation
3. Implement via simulation-maintainer if approved

---

## Sources

Per research debate session `reviews/research_debate_session_20251125.md`:
- Energy budget identified as missing constraint
- MIT 2024 report: DAC requires 34-51% global electricity
- Directly explains god mode failure pattern
