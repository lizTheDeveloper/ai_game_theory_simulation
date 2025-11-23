# Research Verification: Carbon Capture Deployment Parameters

**Commit:** c52826e2952a172aec315f7c438461393695a818
**Date:** November 21, 2025
**Trigger:** New comprehensive carbon capture research (carbon_capture_deployment_timelines_2025.md)
**Verification Status:** PENDING

---

## Overview

New research document provides comprehensive carbon capture deployment data from 12 peer-reviewed sources (2024-2025). Current simulation has basic DAC parameters in ClimateDeploymentDelayPhase. This verification checks:

1. **Citation Existence:** Do the cited papers exist and are they accessible?
2. **Claim Accuracy:** Do the papers actually support the specific claims made?
3. **Parameter Validation:** Are current simulation parameters consistent with new research?
4. **Enhancement Opportunities:** What new constraints/mechanics should be added?

---

## Layer 1: Citation Existence Verification

### Primary Sources to Verify

1. **Tan, S., et al. (2024).** "Deployment expectations of multi-gigatonne scale carbon removal could have adverse impacts on Asia's energy-water-land nexus." *Nature Communications*, 15, Article 6380. DOI: 10.1038/s41467-024-50637-2
   - **Status:** PENDING
   - **Verification needed:** Confirm paper exists, author names correct, DOI resolves

2. **Climeworks. (2024, May 8).** "Climeworks switches on world's largest direct air capture plant, Mammoth." Press release.
   - **Status:** PENDING
   - **Verification needed:** Confirm press release exists, date accurate, plant specifications

3. **International Energy Agency. (2024).** "CCUS projects around the world are reaching new milestones." Commentary.
   - **Status:** PENDING
   - **Verification needed:** Confirm IEA commentary exists, publication date

4. **Canary Media. (2024).** "CO2-removal leader Climeworks says new tech can halve costs, energy use."
   - **Status:** PENDING
   - **Verification needed:** Confirm article exists, claims about Gen 3 technology

5. **Frontiers in Climate. (2024).** "Scaling carbon removal systems: deploying direct air capture amidst Canada's low-carbon transition." DOI: 10.3389/fclim.2024.1338647
   - **Status:** PENDING
   - **Verification needed:** Confirm paper exists, DOI resolves

---

## Layer 2: Claim Verification (CRITICAL)

### Claim 1: Current DAC Capacity

**Research Document Claims:**
- "Current global DAC capacity: <0.01 Mt/yr"
- "Mammoth plant (Iceland, 2024): 36,000 tonnes CO2/year"
- "Largest operational: Orca (4,000 tonnes/yr) + Mammoth (36,000 tonnes/yr)"

**Sources Cited:**
- Climeworks press release (May 8, 2024)
- Multiple industry reports (2024)

**Verification Required:**
- [ ] Quote the specific passage from Climeworks about Mammoth capacity
- [ ] Verify operational status (May 2024 vs current status)
- [ ] Check if "36,000 tonnes/year" is nameplate or actual operational capacity
- [ ] Confirm total global capacity estimate (<0.01 Mt/yr) from authoritative source

**Current Simulation Parameter:**
- ClimateDeploymentDelayPhase: `E_max: 1.0 Gt CO2/year` (maximum theoretical capacity)
- No current capacity modeled (starts from breakthrough)

**Compatibility:** COMPATIBLE - E_max is future potential, not current capacity

---

### Claim 2: Deployment Timeline (20-40 years to gigatonne impact)

**Research Document Claims:**
- "Timeline: 20-40 years from breakthrough to gigatonne impact"
- "Deployment lag: 10-20 years from breakthrough to significant climate impact"
- "Historical example: 15-year trajectory for Climeworks (0 → 0.000036 Gt/yr)"

**Sources Cited:**
- IEA (2024) - DAC scaling feasibility
- Industry projections synthesis (2024-2025)
- Climeworks historical data (2009-2024)

**Verification Required:**
- [ ] Quote IEA (2024) specific passage about DAC scaling timeline
- [ ] Verify Climeworks 2009 founding date and trajectory claims
- [ ] Check if "20-40 years" is supported by specific modeling or historical analog

**Current Simulation Parameter:**
- ClimateDeploymentDelayPhase DAC parameters:
  - `activationDelay: 7 years` (5-10 range from IEA 2024)
  - `T_50: 30 years` (to 50% of gigatonne scale)
  - Source: `research/climate_tech_deployment_timescales_20251112.md`

**Code Location:** `src/simulation/engine/phases/ClimateDeploymentDelayPhase.ts:67-73`

**Specific Claim to Verify:**
- Does IEA (2024) actually state "5-10 years" activation delay for DAC?
- Does any source support the "30 years to 50% effectiveness" parameter?

**Compatibility Check:**
- New research: 20-40 years to gigatonne (1 Gt/yr)
- Current model: 7-year activation + 30-year T_50 = ~37 years to 50% of 1 Gt/yr
- **Assessment:** COMPATIBLE - parameters align within stated range

---

### Claim 3: Energy Requirements (4-10 TWh per Gt/yr)

**Research Document Claims:**
- "Energy requirement: 4-10 TWh per 1 Gt/yr"
- "Solid sorbent: 1.8-2.5 MWh electrical + 4-6 MWh thermal per tonne CO2"
- "Liquid solvent: 2-3 MWh electrical + 5-8 MWh thermal per tonne CO2"
- "Must couple with clean energy to avoid increasing emissions"

**Sources Cited:**
- "Multiple technical assessments from Frontiers in Climate (2024-2025)"
- "Tan et al. (2024) energy-water-land nexus analysis"

**Verification Required:**
- [ ] Find specific Frontiers in Climate paper with energy values
- [ ] Quote Tan et al. (2024) passage on energy requirements
- [ ] Verify 1.8-2.5 MWh electrical + 4-6 MWh thermal = 4-10 TWh per Gt/yr calculation
  - Calculation check: (1.8-2.5) + (4-6) = 5.8-8.5 MWh per tonne
  - For 1 Gt/yr: 5.8-8.5 MWh/tonne × 1e9 tonnes = 5.8-8.5 TWh/yr
  - **DISCREPANCY:** Research claims 4-10 TWh, calculation shows 5.8-8.5 TWh
  - **Action needed:** Verify if 4-10 TWh includes efficiency improvements or is different range

**Current Simulation Parameter:**
- ClimateDeploymentDelayPhase: No energy coupling constraint modeled
- No energy requirement field for DAC technology

**Code Gap:** Energy requirements not currently modeled in deployment delay phase

**Enhancement Opportunity:** Add energy coupling constraint to limit DAC deployment by clean energy availability

---

### Claim 4: Water Requirements (15 km³/yr for 4 Gt/yr)

**Research Document Claims:**
- "Water demand: 15 km³/year for DAC at 4 Gt/yr scale"
- "3.8% of global industrial water use"
- "Regional constraint: Competes with agriculture in water-stressed regions"

**Sources Cited:**
- Tan et al. (2024) *Nature Communications*

**Verification Required:**
- [ ] Quote Tan et al. (2024) specific passage on water requirements
- [ ] Verify 15 km³/yr for 4 Gt/yr calculation (3.75 km³ per Gt/yr)
- [ ] Check if this is for solid sorbent, liquid solvent, or both
- [ ] Verify "3.8% of global industrial water use" claim

**Current Simulation Parameter:**
- ClimateDeploymentDelayPhase: No water coupling constraint modeled
- No water requirement field for DAC technology

**Code Gap:** Water requirements not currently modeled

**Enhancement Opportunity:** Add regional water constraint to limit DAC deployment in water-stressed regions

---

### Claim 5: Cost Trajectory ($600-1,000/tonne → $100-300/tonne)

**Research Document Claims:**
- "Current cost: $600-1,000/tonne CO2"
- "Target by 2030: $300-400/tonne"
- "Long-term floor: $100-300/tonne (thermodynamic limit)"
- "Climeworks CFO statement: 'Today we are closer to the $1,000 per tonne mark'"

**Sources Cited:**
- Climeworks company statements (2024)
- Euronews (May 9, 2024)
- Canary Media (2024) - Gen 3 technology cost reduction claims

**Verification Required:**
- [ ] Find and quote Climeworks CFO statement about $1,000/tonne
- [ ] Verify Euronews (May 9, 2024) article exists and supports cost claims
- [ ] Check if "$100-300/tonne floor" is supported by thermodynamic analysis or expert opinion
- [ ] Verify "50% cost reduction" claim for Generation 3 technology

**Current Simulation Parameter:**
- ClimateDeploymentDelayPhase: No cost modeling
- No economic constraint on DAC deployment

**Code Gap:** Cost trajectory not modeled

**Enhancement Opportunity:** Add economic constraint (cost per tonne × deployment level vs available capital)

---

### Claim 6: Regional Variance (Iceland/US Southwest high potential, Asia constrained)

**Research Document Claims:**
- "High-potential: Iceland (geothermal), US Southwest (solar + storage)"
- "Asia constrained: Water stress (North China Plain), energy mix coal-dominated"
- "China expectation: 6 Gt/yr by 2050 (maximum-reliance scenario)"
- "China realistic: 0.5-2 Gt/yr (if constraints solved)"

**Sources Cited:**
- Tan et al. (2024) - Asia energy-water-land nexus analysis

**Verification Required:**
- [ ] Quote Tan et al. (2024) passage on regional deployment expectations
- [ ] Verify "6 Gt/yr China expectation" claim
- [ ] Check basis for "0.5-2 Gt/yr realistic" range
- [ ] Confirm water stress constraints for Asia specifically

**Current Simulation Parameter:**
- ClimateDeploymentDelayPhase: No regional variance modeled
- Global aggregate deployment only

**Code Gap:** Regional constraints not modeled

**Enhancement Opportunity:** Add regional deployment factors based on:
1. Clean energy availability (geothermal, solar, wind)
2. Water stress levels
3. Capital availability

---

## Parameter Validation Summary

| Parameter | New Research | Current Simulation | Status | Action |
|-----------|-------------|-------------------|--------|--------|
| **Activation Delay** | 5-10 years (IEA 2024) | 7 years | ✅ COMPATIBLE | Verify IEA source |
| **T_50 (Scaling Time)** | 30 years to 50% | 30 years | ✅ COMPATIBLE | Verify research backing |
| **E_max (Capacity)** | 1-10 Gt/yr (theoretical) | 1 Gt/yr | ✅ COMPATIBLE | Add phase progression |
| **Energy Requirement** | 4-10 TWh per Gt/yr | Not modeled | ⚠️ MISSING | Add coupling constraint |
| **Water Requirement** | 15 km³/yr for 4 Gt/yr | Not modeled | ⚠️ MISSING | Add regional constraint |
| **Cost Trajectory** | $600→$100/tonne | Not modeled | ⚠️ MISSING | Add economic constraint |
| **Regional Variance** | Iceland/US high, Asia low | Not modeled | ⚠️ MISSING | Add regional factors |

---

## Enhancement Opportunities

### 1. Energy Coupling Constraint (HIGH PRIORITY)

**Rationale:** DAC at 4-10 TWh per Gt/yr must compete with other energy uses

**Implementation:**
```typescript
// In ClimateDeploymentDelayPhase or new constraint phase
const availableCleanEnergy = state.energySystem.totalCleanEnergy;
const dacEnergyRequired = dacDeploymentLevel * 7; // TWh per Gt/yr (midpoint of 4-10)
const energyLimitedDeployment = Math.min(
  dacDeploymentLevel,
  availableCleanEnergy / dacEnergyRequired
);
```

**Research Backing:** Tan et al. (2024), Frontiers in Climate (2024-2025)

**Files to Modify:**
- `src/simulation/engine/phases/ClimateDeploymentDelayPhase.ts` (add constraint)
- `src/types/game.ts` (ensure EnergySystem has totalCleanEnergy field)

---

### 2. Water Regional Constraint (MEDIUM PRIORITY)

**Rationale:** Water-stressed regions (US Southwest, Asia) have limited DAC potential

**Implementation:**
```typescript
// Regional water stress multiplier
const waterStressFactors = {
  'north_america': 0.7,  // US Southwest water-limited
  'asia': 0.4,           // Severe water stress
  'europe': 1.0,         // Iceland, Norway abundant
  'middle_east': 0.3     // Critical water scarcity
};

const waterLimitedDeployment = dacDeploymentLevel * waterStressFactor[region];
```

**Research Backing:** Tan et al. (2024) - Asia water stress analysis

**Files to Modify:**
- `src/simulation/engine/phases/ClimateDeploymentDelayPhase.ts` (add regional constraint)
- `src/types/game.ts` (add regional water stress tracking if not present)

---

### 3. Cost-Based Deployment Curve (LOW PRIORITY)

**Rationale:** Deployment speed depends on cost reduction (learning curve)

**Implementation:**
```typescript
// Cost declines with cumulative deployment (learning curve)
const costPerTonne = 600 * Math.pow(cumulativeDeployment, -0.15); // 15% learning rate
const deploymentSpeed = capitalAvailable / (costPerTonne * targetDeployment);
```

**Research Backing:** Climeworks cost trajectory, Canary Media (2024)

**Note:** Lower priority - economic constraints handled elsewhere in simulation

---

## Verification Checklist

**Citation Existence:**
- [ ] Tan et al. (2024) *Nature Communications* - paper exists, DOI resolves
- [ ] Climeworks Mammoth press release (May 8, 2024) - exists, specifications correct
- [ ] IEA (2024) CCUS commentary - exists, publication date confirmed
- [ ] Canary Media (2024) Gen 3 technology article - exists, claims verified
- [ ] Frontiers in Climate (2024) Canada DAC paper - exists, DOI resolves

**Claim Accuracy:**
- [ ] Mammoth 36,000 tonnes/yr capacity - quote from Climeworks
- [ ] IEA 5-10 year activation delay - quote from IEA report
- [ ] Energy 4-10 TWh per Gt/yr - quote from Frontiers/Tan et al.
- [ ] Water 15 km³/yr for 4 Gt/yr - quote from Tan et al.
- [ ] Cost $600-1,000/tonne current - quote from Climeworks CFO
- [ ] 30-year T_50 scaling - verify research support for this specific parameter

**Parameter Compatibility:**
- [x] Activation delay (7 years) - compatible with 5-10 range
- [x] T_50 (30 years) - compatible with 20-40 year gigatonne timeline
- [x] E_max (1 Gt/yr) - conservative within 1-10 Gt/yr theoretical range
- [ ] Energy requirements - NOT MODELED, needs implementation
- [ ] Water requirements - NOT MODELED, needs implementation
- [ ] Cost trajectory - NOT MODELED, optional enhancement

---

## Next Steps (for Orchestrator)

1. **Research Validation Phase:**
   - Verify all 5 primary citations exist and are accessible
   - Extract specific quotes supporting each claim
   - Flag any unsupported claims or discrepancies

2. **Parameter Validation:**
   - Confirm IEA (2024) supports 7-year activation delay
   - Verify 30-year T_50 has research backing (may need adjustment)
   - Calculate energy requirement range consistency (4-10 TWh claim vs 5.8-8.5 TWh calculation)

3. **Enhancement Implementation:**
   - **HIGH:** Add energy coupling constraint (requires clean energy availability)
   - **MEDIUM:** Add regional water stress factors
   - **LOW:** Add cost-based deployment curve (optional)

4. **Testing:**
   - Monte Carlo validation with new constraints
   - Verify energy/water constraints don't over-constrain deployment
   - Check god mode results for realistic gigatonne timescales

5. **Documentation:**
   - Update wiki with verification results
   - Document new constraints in CLAUDE.md
   - Add research citations to code comments

---

## Files Requiring Attention

**Simulation Code:**
- `src/simulation/engine/phases/ClimateDeploymentDelayPhase.ts:67-73` - DAC parameters, verify IEA source
- `src/simulation/engine/phases/ClimateDeploymentDelayPhase.ts` (full file) - add energy/water constraints
- `src/types/game.ts` - ensure EnergySystem.totalCleanEnergy exists

**Research Documents:**
- `research/carbon_capture_deployment_timelines_2025.md` - source of claims
- `research/climate_tech_deployment_timescales_20251112.md` - current parameter source (verify consistency)

**Documentation:**
- `docs/wiki/README.md:2672-2688` - carbon capture section
- `docs/wiki/README.md:1180-1209` - climate deployment system section

---

## Status

**Created:** November 21, 2025
**Verification Phase:** PENDING (awaiting research-skeptic review)
**Implementation Phase:** BLOCKED (awaiting verification)
**Target Completion:** TBD (orchestrator to schedule)
