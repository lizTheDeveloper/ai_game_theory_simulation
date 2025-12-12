# Delta for Simulation Specification
## Supply Chain Cascade Propagation

**Feature:** Model cascade failures through interconnected supply chains and infrastructure
**Status:** Quality Gate 1 - PENDING (awaiting research validation)

---

## ADDED Requirements

### Requirement: Just-In-Time Vulnerability Modeling
The simulation SHALL model inventory buffer exhaustion in critical supply chains with research-backed parameters.

**Rationale:** Modern manufacturing operates on 72-hour inventory buffers. McKinsey 2024 reports companies have 38,000 tier-3 suppliers with only 0.2% visibility. When disruptions exhaust buffers, cascades propagate rapidly through supply networks.

#### Scenario: Semiconductor Supply Disruption
- WHEN a critical semiconductor supply is disrupted (natural disaster, geopolitical conflict, etc.)
- AND inventory buffers are depleted (based on research parameters, typically 1-3 months)
- THEN downstream production halts within N days (research-backed parameter)
- AND cascades to dependent industries (automotive, electronics, defense)
- AND recovery requires both input restoration AND inventory rebuild (not instant)

#### Scenario: Rare Earth Supply Shock
- WHEN rare earth element supply is disrupted (Chinese export restrictions, mining disaster)
- AND buffer inventories fall below critical threshold
- THEN clean energy production halts (wind turbines, solar panels, batteries)
- AND climate mitigation technology deployment stalls
- AND cascades compound climate crisis impacts

#### Scenario: Agricultural Input Disruption
- WHEN critical agricultural inputs are disrupted (fertilizer, pesticides, seeds)
- AND farming inventory buffers exhausted
- THEN crop yields decline within growing season
- AND food security cascades trigger (months to famine)
- AND healthcare system stress from malnutrition

**Parameters (from research):**
- Buffer sizes: semiconductors (1-3 months), rare earths (2-4 months), agricultural (seasonal)
- Propagation speeds: days to weeks for tier-1, weeks to months for tier-3
- Recovery multiplier: 2-3x longer than disruption duration (rebuild buffers, not just restore supply)

---

### Requirement: Single Point of Failure Modeling
The simulation SHALL track critical infrastructure chokepoints and model global trade disruption when they fail.

**Rationale:** Drewry 2024 reports global shipping 40% more concentrated than 2010. Taiwan produces 90%+ of advanced semiconductors. SWIFT processes $5T+ daily transactions with limited alternatives.

#### Scenario: Suez Canal Closure
- WHEN Suez Canal closes (blockage, military conflict, climate impacts)
- THEN X% of global trade reroutes (research parameter, typically 10-15%)
- AND shipping costs increase Y% (fuel, time, insurance)
- AND delivery delays compound just-in-time disruptions
- AND some goods become unavailable in affected regions

#### Scenario: Taiwan Semiconductor Capacity Loss
- WHEN Taiwan semiconductor production capacity is reduced (earthquake, invasion, etc.)
- THEN global semiconductor shortage intensifies
- AND cascades through ALL dependent industries
- AND recovery timeline measured in years (fab construction time)
- AND geopolitical tensions escalate over supply security

#### Scenario: SWIFT System Failure
- WHEN SWIFT payment system is disrupted (cyberattack, geopolitical sanctions, technical failure)
- THEN international trade transactions halt
- AND credit freezes cascade to supply chains
- AND alternative systems (if any) have limited capacity
- AND recovery depends on trust restoration (not just technical fixes)

**Parameters (from research):**
- Chokepoint criticality: % of global trade/production affected
- Reroute costs: time multiplier, cost multiplier, goods unavailable
- Recovery timelines: days (shipping) to years (semiconductor fabs)
- Alternative capacity: how much can bypass the SPOF?

---

### Requirement: Infrastructure Cascade Propagation
The simulation SHALL model interdependent infrastructure failures that propagate sequentially through power → water → food → healthcare systems.

**Rationale:** Texas freeze 2021 demonstrated infrastructure cascades: 3-day grid failure → 4.5M without water → $195B damages. Systems are tightly coupled with minimal redundancy.

#### Scenario: Power Grid Failure Cascade
- WHEN power grid fails for T hours (disaster, cyberattack, fuel shortage)
- THEN water pumping and treatment stops within T+N hours (N from research)
- AND food processing and refrigeration fails within T+M hours
- AND healthcare operations degrade (no water, no refrigeration for medicines)
- AND mortality increases with cascade duration
- AND recovery requires sequential restoration (power first, then water, then food)

#### Scenario: Water System Failure Cascade
- WHEN water system fails independently (contamination, drought, infrastructure collapse)
- THEN agriculture irrigation stops (crop failure timeline from research)
- AND food processing halts (hygiene requirements)
- AND healthcare operations constrained (sanitation, dialysis)
- AND social unrest escalates (water scarcity riots)

#### Scenario: Food System Failure Cascade
- WHEN food system fails (agricultural collapse, supply chain breakdown)
- THEN malnutrition increases healthcare demand
- AND labor productivity declines
- AND social cohesion degrades (food riots, hoarding)
- AND mortality increases (famine timeline from research)

**Parameters (from research):**
- Power → water: hours until pumping fails, hours until treatment fails
- Water → food: days until agriculture impacts, days until processing halts
- Food → healthcare: weeks until malnutrition, months until famine
- Mortality multipliers: cascade duration → excess deaths
- Recovery sequences: must restore in order (power → water → food)

---

### Requirement: Finance → Supply Chain Cascade Propagation
The simulation SHALL model how financial system failures cascade to physical supply chains and employment.

**Rationale:** 2008 financial crisis showed credit freezes cascade to real economy within weeks. Just-in-time systems depend on functioning payment networks and credit availability.

#### Scenario: Credit Market Freeze
- WHEN credit markets freeze (financial crisis, bank failures, etc.)
- THEN just-in-time payment systems fail
- AND suppliers demand cash-on-delivery
- AND companies without cash reserves halt production within days
- AND unemployment cascades (production halt → layoffs → demand collapse → further contraction)
- AND recovery requires both credit restoration AND demand recovery (not independent)

#### Scenario: Payment System Failure
- WHEN electronic payment systems fail (SWIFT, clearing systems, cyberattack)
- THEN international trade halts immediately
- AND domestic trade degrades (cash only)
- AND supply chains collapse within 72 hours (no payments = no shipments)
- AND recovery timeline depends on trust restoration (not just technical fixes)

#### Scenario: Currency Collapse
- WHEN national currency collapses (hyperinflation, loss of confidence)
- THEN international trade shifts to hard currencies (if available)
- AND import-dependent supply chains break
- AND domestic production constrained by input unavailability
- AND employment cascades through demand destruction

**Parameters (from research):**
- Credit freeze → production halt: days to weeks
- Payment system failure → trade halt: hours to days
- Cash reserve buffers: days to months by industry
- Employment cascade: unemployment → demand → further unemployment (feedback loop strength)
- Recovery timelines: weeks to months for credit, months to years for currency

---

### Requirement: Compound Cascade Effects
The simulation SHALL model how multiple simultaneous cascades amplify each other using research-backed multipliers.

**Rationale:** Research shows polycrisis compound effects of 1.5-2.5x beyond simple addition (Lawrence et al. 2024, Gambhir et al. 2025). Infrastructure cascades + supply chain cascades + financial cascades create synergistic failures.

#### Scenario: Polycrisis Cascade Compounding
- WHEN 2+ cascade types are simultaneously active
- THEN damage exceeds sum of individual cascades
- AND use crisis cascade multipliers (1.5-2.5x from existing research)
- AND recovery timelines extend (can't fix infrastructure while supply chains broken)
- AND intervention effectiveness degrades (limited resources spread across multiple crises)

**Parameters (from research):**
- 2 simultaneous cascades: 1.5x multiplier
- 3 simultaneous cascades: 2.0x multiplier
- 4+ simultaneous cascades: 2.5x multiplier
- Recovery extension: +50% time per additional active cascade

---

### Requirement: Cascade Intervention Mechanisms
The simulation SHALL allow interventions to interrupt or mitigate cascades, with research-backed effectiveness parameters.

#### Scenario: Emergency Infrastructure Restoration
- WHEN infrastructure cascade is active
- AND emergency response is deployed (disaster aid, military logistics)
- THEN cascade propagation slows or halts (effectiveness from research)
- AND recovery timeline reduces (resource allocation dependent)
- BUT effectiveness degrades in polycrisis (resources spread thin)

#### Scenario: Strategic Reserve Release
- WHEN just-in-time buffers are exhausted
- AND strategic reserves exist (oil, grain, semiconductors)
- THEN cascade delayed by reserve duration
- BUT reserves are finite (months, not years)
- AND depletion creates future vulnerability

**Parameters (from research):**
- Intervention effectiveness: % cascade reduction per intervention type
- Resource constraints: how many interventions can run simultaneously?
- Recovery acceleration: time reduction from intervention
- Strategic reserve sizes: months of buffer by commodity type

---

## MODIFIED Requirements

### Requirement: Crisis Cascade Multipliers (Existing)
**Modification:** Extend to include supply chain cascade interactions

**Previous behavior:** Crisis cascade multipliers only applied to overlapping crises (climate + economic + social)

**New behavior:**
- Supply chain cascades COUNT as active crises for multiplier calculation
- Infrastructure cascade active = +1 crisis
- JIT cascade active = +1 crisis
- Finance cascade active = +1 crisis
- Multipliers apply to ALL compound effects (existing + new cascades)

**Example:**
- Climate crisis + economic crisis + infrastructure cascade = 3 crises → 2.0x multiplier
- Climate + economic + infrastructure + JIT + finance = 5 crises → 2.5x multiplier

---

## REMOVED Requirements

_No requirements removed by this feature._

---

## Implementation Notes

### State Structure
Add to GameState interface:
```typescript
supplyChainCascades: {
  justInTimeVulnerability: {
    semiconductorBuffer: number;      // months
    rareEarthBuffer: number;
    criticalInputsBuffer: number;
    disruptionActive: boolean;
    daysUntilCascade: number;
  };
  singlePointsOfFailure: {
    suezStatus: 'open' | 'restricted' | 'closed';
    panamaStatus: 'open' | 'restricted' | 'closed';
    malaccaStatus: 'open' | 'restricted' | 'closed';
    swiftStatus: 'operational' | 'restricted' | 'failed';
    taiwanSemiconductorCapacity: number;  // % of global
  };
  infrastructureCascades: {
    powerGridStatus: number;           // 0-1
    waterSystemStatus: number;
    foodSystemStatus: number;
    healthcareSystemStatus: number;
    cascadeActive: boolean;
    hoursInCascade: number;
  };
  financeCascades: {
    creditAvailability: number;        // 0-1
    paymentSystemStatus: number;
    cashReservesDepletion: number;
    employmentCascadeActive: boolean;
  };
}
```

### Phase Implementation
New phase: `updateSupplyChainCascades(state, rng)`
- Register after crisis management phase
- Before outcome determination phase
- Frequency: Every step (but only calculate when thresholds crossed)

### Integration Points
- **Economic system:** Supply chain disruptions → GDP impacts, unemployment
- **Social system:** Infrastructure failures → quality of life, mortality
- **Climate system:** Resource scarcity → mitigation/adaptation constraints
- **Crisis cascade multipliers:** Supply chain cascades count as active crises
- **Geopolitical system:** Chokepoint failures → international tensions

### Testing Requirements
- Unit tests for each cascade type
- Integration tests with crisis cascade multipliers
- Monte Carlo validation (N≥10, CV < 0.01%)
- Historical comparison (Texas 2021, COVID-19)
- Edge cases (all SPOFs failed, zero buffers, cascade interruption)

### Defensive Coding Requirements
- RNG must be required (never optional with Math.random fallback)
- Use assertion utilities (assertFinite, assertStateProperty, assertProbability)
- No silent fallback values (fail loudly on NaN/undefined)
- Pictographic event language (📦 JIT, 🚨 SPOF, 🌍💥 infrastructure, 💰 finance)
- Sequential propagation (power → water → food), no same-step circular dependencies

---

## Research Dependencies

**Primary research file:** `research/supply_chain_cascade_propagation_YYYYMMDD.md` (PENDING)

**Existing research:**
- `research/crisis_cascade_multipliers_20251020.md` - Compound effect multipliers
- Texas freeze 2021 case study - Infrastructure cascade validation
- COVID-19 supply chain analysis - JIT cascade validation

**Quality Gate 1:** Research must be validated by research-skeptic before implementation proceeds.

---

## Success Metrics

Feature is successful when:
- [ ] Collapse scenarios show realistic cascade timelines (match historical events)
- [ ] Monte Carlo runs produce diverse outcomes (not all collapse, not all thrive)
- [ ] Infrastructure failures propagate sequentially (power → water → food)
- [ ] Financial shocks cascade to real economy within research-backed timeframes
- [ ] CV < 0.01% for determinism (same seed = same cascade)
- [ ] No performance regressions (cascade calculations only when needed)
- [ ] Integration with crisis cascade multipliers is clean

---

## Future Enhancements

**Out of scope for initial implementation, but documented for future consideration:**

1. **Adaptive supply chain restructuring**
   - AI-optimized supply chains reduce SPOF vulnerabilities over time
   - Onshoring/nearshoring reduces cascade sensitivity
   - Research needed: timeline and cost of restructuring

2. **Regional cascade modeling**
   - Different regions have different cascade vulnerabilities
   - Asia-Pacific vs. North America vs. Europe SPOF exposure
   - Research needed: regional dependency maps

3. **Climate-cascade interactions**
   - Climate disasters trigger supply chain cascades
   - Supply chain cascades constrain climate mitigation
   - Bidirectional feedback loops (out of scope for Phase 1)

4. **AI-accelerated cascade recovery**
   - AI logistics optimization speeds recovery
   - AI-designed redundancy reduces cascade severity
   - Research needed: effectiveness parameters

---

## Notes

This feature addresses a critical gap: **collapse scenarios are 2-5x too slow because we model individual failures, not cascades.** Research (Scheffer et al. 2023) shows cascade failures are the dominant mode of civilizational collapse.

The implementation must balance realism with playability. Conservative parameters from research, not speculative catastrophizing. The simulation is a research tool, not disaster porn.

All parameters must be justified from peer-reviewed sources (2024-2025 preferred). No tuning for "interesting" outcomes - let the model show what it shows.
