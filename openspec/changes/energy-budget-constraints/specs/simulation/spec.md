# Delta for Simulation Specification

## ADDED Requirements

### Requirement: Energy Budget Constraints
The simulation SHALL model hard constraints on energy-intensive technology deployment based on global electricity capacity.

#### Scenario: DAC Energy Competition
- WHEN deploying Direct Air Capture at scale
- THEN system MUST check available clean electricity capacity
- AND DAC effectiveness MUST be constrained by allocated capacity
- AND DAC SHALL compete with other technologies for limited energy

#### Scenario: Technology Priority Ordering
- WHEN multiple technologies demand electricity simultaneously
- THEN system SHALL allocate based on priority (essential > elective)
- AND lower-priority technologies SHALL be constrained if capacity exceeded
- AND conflicts SHALL be tracked and logged

#### Scenario: God Mode Energy Realism
- WHEN deploying all 92 technologies simultaneously in God Mode
- THEN energy constraints SHALL prevent instant collapse
- AND system SHALL explain which technologies are energy-starved
- AND effectiveness SHALL scale with available capacity

---

## MODIFIED Requirements

### Requirement: Technology Deployment Effectiveness
The simulation SHALL calculate technology effectiveness based on available resources including energy capacity.

**Previous:** Effectiveness based only on deployment timescale and technical readiness.

**Updated:** Effectiveness additionally constrained by energy budget allocation:
```typescript
effectiveness = baseEffectiveness * energyConstraintMultiplier
where energyConstraintMultiplier = min(1.0, allocatedGW / demandGW)
```

---

## Implementation Notes

**New state type:**
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
      constrainedEffectiveness: number;  // 0-1
    };
  };
  conflicts: string[];
}
```

**Research backing:**
- MIT Energy Initiative 2024: DAC requires 34-51% of global electricity at scale
- IEA AI & Energy 2024: AI datacenters claiming 6-8% by 2030
- IEA World Energy Outlook 2024: Global capacity projections

**Affected phases:**
- ClimateDeploymentPhase (check energy before deployment)
- New EnergyBudgetPhase (allocation logic)
