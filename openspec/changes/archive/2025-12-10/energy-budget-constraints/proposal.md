# Energy Budget Constraints

**Created:** November 25, 2025
**Author:** autonomous-worker (via research-skeptic recommendation)
**Priority:** MEDIUM
**Effort:** 2-3 days

---

## Rationale

The current simulation allows simultaneous deployment of energy-intensive technologies without hard constraints, leading to unrealistic scenarios where DAC, hydrogen production, and AI datacenters all claim the same electricity simultaneously.

**God mode paradox:** Deploying all 92 technologies at once causes collapse because there's no energy budget constraint - technologies compete for the same limited global electricity capacity.

**Real-world constraint (MIT Energy Initiative 2024):**
- DAC at scale requires 34-51% of global electricity
- AI datacenter growth claiming 6-8% of global electricity by 2030
- Green hydrogen production requires dedicated renewable capacity

---

## Scope

Add energy budget state tracking and constraint system to limit technology effectiveness based on available electricity capacity. Technologies will compete for limited energy resources with priority ordering (essential vs elective).

**Affected systems:**
- `ClimateDeploymentPhase` - Add energy availability checks
- GameState - Add `EnergyBudgetState` type
- Technology deployment - Constrain effectiveness based on allocation

---

## Success Criteria

1. **Functional:**
   - God mode deployment doesn't cause instant collapse
   - Technologies constrained by available electricity
   - Priority ordering prevents essential systems from being starved
   - Sequenced deployment scenarios validate correctly

2. **Research:**
   - 2+ sources for energy requirements per tech category
   - Parameters match IEA World Energy Outlook 2024 projections
   - Validation against MIT DAC energy reports

3. **Performance:**
   - Energy allocation calculation < 5ms overhead per step
   - Monte Carlo runs show realistic energy transition timelines

---

## Sources

- IEA World Energy Outlook 2024
- MIT Energy Initiative DAC reports
- IEA AI & Energy special report (2024)
- US DOE hydrogen strategy
- `reviews/research_debate_session_20251125.md` - Energy budget identified as missing constraint
