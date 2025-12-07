# Energy Budget Constraints - Implementation Tasks

## Phase 1: Research (Quality Gate 1)
- [ ] Quantify energy requirements per technology category (DAC, hydrogen, AI datacenters)
- [ ] Document global electricity generation capacity (~8,000 GW total, ~3,500 GW clean)
- [ ] Research annual growth rates (~3% from IEA projections)
- [ ] Model energy competition dynamics and priority ordering
- [ ] Add to research verification queue
- [ ] Pass research validation (Grade B+ required)

**Key sources:**
- IEA World Energy Outlook 2024
- MIT Energy Initiative DAC reports
- IEA AI & Energy special report (2024)
- US DOE hydrogen strategy

## Phase 2: Implementation
- [ ] Add `EnergyBudgetState` interface to `src/types/game.ts`
  - globalCapacity (totalGW, cleanGW, growthRate)
  - allocations per tech category (demand, allocated, effectiveness)
  - conflicts tracking
- [ ] Create `EnergyBudgetPhase` for allocation logic
- [ ] Modify `ClimateDeploymentPhase` to check energy availability
- [ ] Implement technology priority ordering (essential vs elective)
- [ ] Constrain effectiveness based on energy allocation (0-1 multiplier)
- [ ] Add config flag to enable/disable during testing

## Phase 3: Validation
- [ ] Verify god mode no longer causes instant collapse
- [ ] Test sequenced deployment scenarios work correctly
- [ ] Validate against IEA electricity projections
- [ ] Run Monte Carlo (N≥10) with energy constraints enabled
- [ ] Check CV < 0.01% (determinism)

## Phase 4: Architecture Review (Quality Gate 2)
- [ ] Submit for architecture-skeptic review
- [ ] Address CRITICAL/HIGH issues
- [ ] Pass QG2 (Grade B+ required)

## Phase 5: Documentation
- [ ] Update wiki with energy budget mechanics
- [ ] Document parameter sources
- [ ] Add to completed features list
