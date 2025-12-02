# Comprehensive Irreversibility Framework - Implementation Plan

**Date:** November 16, 2025
**Priority:** TIER 1 CRITICAL
**Status:** PLANNING
**Orchestrator:** orchestrator-1

---

## Executive Summary

Extend the Novel Entities irreversibility framework (completed Nov 14, 2025) to ALL 9 planetary boundaries with research-backed mechanics for:
1. Irreversibility floors (fraction of damage that's permanent on 50-100 year timescales)
2. Energy trap constraints (cleanup energy vs. global capacity)
3. Concentration-effectiveness curves (remediation efficiency vs. contamination levels)
4. Prevention vs. cleanup effectiveness ratios (Montreal Protocol analogs)

**Building on existing work:**
- Novel Entities: ✅ COMPLETE (90% irreversible floor implemented, Grade B+ research)
- Ocean Acidification: ⚠️ PARTIAL (reversibility mechanics exist, needs irreversibility floor)
- Stratospheric Ozone: ✅ COMPLETE (Montreal Protocol recovery modeled)
- Other 6 boundaries: ❌ NEED IMPLEMENTATION

---

## Context from Existing Research

**Already Available (Grade B+, 78% verified):**
- `research/planetary_boundary_reversibility_empirical_verification_20251101.md`
- `research/novel_entities_zero_effectiveness_20251113.md` (742 lines, 16 sources)
- `plans/completed/novel_entities_model_redesign_COMPLETE_20251114.md`

**Key findings:**
1. **Novel Entities:** 90% irreversible (Cousins 2022, Kane 2022)
2. **Ozone:** 90% reversible via Montreal Protocol (UNEP 2023)
3. **Ocean Acidification:** Century-scale deep ocean recovery (Jiang 2023)
4. **Prevention:Remediation Ratio:** 10:1 to 20:1 (Montreal Protocol analog)
5. **Energy Trap:** PFAS remediation = 0.2-66× global GDP (Ling 2024)

---

## Research Gaps (Needs Additional Sources)

### Priority 1: Irreversibility Fractions for 6 Remaining Boundaries

**Climate Change:**
- Ice sheet collapse (WAIS, Greenland): Irreversible on millennial timescales
- AMOC shutdown: Multi-century recovery if reversible at all
- Ocean heat content: Decades to centuries
- **Need:** Quantify irreversible fraction for each subsystem

**Biosphere Integrity:**
- Extinction is PERMANENT (100% irreversible)
- Functional extinction (populations <MVP): Effectively irreversible
- Ecosystem reassembly: Millennial timescales
- **Need:** Extinction debt parameters, restoration limits

**Land System Change:**
- Topsoil loss: 500-1000 years to rebuild 1 inch
- Desertification: Often irreversible without massive intervention
- Deforestation: Decades to regenerate, centuries for old growth
- **Need:** Irreversibility by soil type, biome

**Freshwater Change:**
- Aquifer depletion: Irreversible if compaction occurs
- Glacier loss: Irreversible under current warming
- Wetland loss: Restoration difficult, decades minimum
- **Need:** Irreversibility by water source type

**Biogeochemical Flows (Nitrogen/Phosphorus):**
- Dead zones: Years to decades to recover if inputs stopped
- Soil nitrogen saturation: Decades to leach out
- Legacy nutrient stocks: Persistent eutrophication
- **Need:** Recovery timescales, irreversible fraction

**Atmospheric Aerosols:**
- Short atmospheric lifetime (days to weeks)
- HIGHLY reversible (90%+ within months)
- **Need:** Confirm reversibility parameters

### Priority 2: Energy Trap Quantification

**Carbon Removal:**
- Direct Air Capture: 1.5-2.5 MWh/tonne CO₂ (Keith 2018)
- BECCS: 0.4-1.2 MWh/tonne CO₂
- Enhanced weathering: 0.2-0.8 MWh/tonne CO₂
- **Global scale:** 360-680 GtCO₂ needed (IPCC AR6) = energy trap calculation

**Other boundaries:**
- Desalination at scale
- Soil remediation energy
- Marine cleanup operations

### Priority 3: Concentration-Effectiveness Curves

**Atmospheric CO₂:**
- Point source capture (cement, steel): 400-1000 ppm CO₂
- Ambient air: 420 ppm CO₂
- Effectiveness ratio: ~2-3× cost penalty for DAC vs. point source

**Ocean nutrients:**
- Coastal dead zones: mg/L concentrations
- Open ocean: μg/L concentrations
- Effectiveness penalty: Similar to Novel Entities (10³-10⁶× dilution)

**Need:** Power law exponents for each boundary

### Priority 4: Prevention Technology Identification

**TIER 0 Prevention (Regulatory):**
1. Global PFAS Production Ban (✅ IMPLEMENTED for Novel Entities)
2. Plastic Production Phase-Out (✅ IMPLEMENTED for Novel Entities)
3. **NEW:** Fossil Fuel Production Phase-Out (Climate)
4. **NEW:** Agricultural Nitrogen Cap (Biogeochemical)
5. **NEW:** Deforestation Ban (Land System)

**TIER 1 Prevention (Industrial + Regulatory):**
1. Chemical Substitution Acceleration (✅ IMPLEMENTED)
2. **NEW:** Circular Economy Transition (Land System, Novel Entities)
3. **NEW:** Precision Agriculture (Biogeochemical)
4. **NEW:** Reforestation at Scale (Land System, Climate)

---

## Research Strategy

### Phase 1: Literature Review (2-3 hours)
**Focus:** Quantify irreversibility fractions for 6 remaining boundaries

**Search strategy:**
1. **Climate:** IPCC AR6 WG1 Ch4 (ice sheets), Ch9 (ocean), Collins et al. 2024 (tipping points)
2. **Biosphere:** IPBES 2019, Ceballos et al. 2023 (extinction debt), Tilman et al. 1994 (MVP)
3. **Land:** FAO soil reports, Lal 2015 (topsoil), Bestelmeyer et al. 2015 (desertification)
4. **Freshwater:** Wada et al. 2023 (aquifers), Hugonnet et al. 2021 (glaciers)
5. **Biogeochemical:** Conley et al. 2024 (dead zones), Van Meter et al. 2016 (legacy N)
6. **Aerosols:** IPCC AR6 Ch6 (atmospheric residence time)

**Deliverable:** `research/planetary_boundaries_irreversibility_comprehensive_20251116.md`
- Grade target: B+ minimum (78%+ verification)
- 2+ sources per boundary (2024-2025 preferred)
- Quantitative parameters extracted

### Phase 2: Research Validation (1 hour)
**Agent:** research-skeptic (Sylvia)
**Output:** `reviews/planetary_boundaries_irreversibility_critique_20251116.md`

**Quality Gate 1 (MUST PASS):**
- No fabricated citations
- Quantitative parameters verified
- Mechanisms explained (not handwaving)
- Grade B+ minimum

---

## Implementation Design

### Phase 3: Extend Irreversibility Framework (3-4 hours)

**Files to modify:**
1. `src/types/planetaryBoundaries.ts`
   - Add `irreversibilityFraction` field to `PlanetaryBoundary` interface
   - Add `energyTrapThreshold` field (TWh/year)
   - Add `concentrationDecayExponent` field (power law)

2. `src/simulation/planetaryBoundaries.ts`
   - Generalize irreversibility floor logic (currently Novel Entities only)
   - Add energy trap gating for all cleanup technologies
   - Implement concentration-dependent effectiveness

3. `src/data/technologyTree.ts`
   - Add 4 new TIER 0-1 prevention technologies (climate, biogeochemical, land)
   - Update existing cleanup tech with energy requirements

**New type definition:**
```typescript
export interface PlanetaryBoundary {
  // ... existing fields ...

  // === IRREVERSIBILITY FRAMEWORK (Nov 16, 2025) ===
  irreversibilityFraction: number;    // [0, 1] Fraction that's permanent on 50-100 yr timescale
  peak?: number;                       // Historical maximum (for floor calculation)
  energyTrapThreshold?: number;        // TWh/year required for meaningful remediation
  concentrationDecayExponent?: number; // Power law for dilution penalty (0 = no penalty, 2 = quadratic)
  preventionRatio: number;             // Prevention:Remediation effectiveness (default 10:1)
}
```

**Implementation pattern (generalized from Novel Entities):**
```typescript
function applyIrreversibilityFloor(
  boundary: PlanetaryBoundary,
  proposedValue: number
): number {
  // Track peak contamination/damage
  if (!boundary.peak) {
    boundary.peak = boundary.currentValue;
  }
  boundary.peak = Math.max(boundary.peak, proposedValue);

  // Calculate irreversible floor
  const irreversibleFloor = boundary.peak * boundary.irreversibilityFraction;

  // Cannot clean below floor
  return Math.max(irreversibleFloor, proposedValue);
}
```

**Energy trap gating:**
```typescript
function applyEnergyTrapConstraint(
  tech: Technology,
  state: GameState
): number {
  const energyRequired = tech.energyRequirement || 0; // TWh/year
  const renewableSurplus = calculateRenewableSurplus(state); // TWh/year

  // If insufficient energy, effectiveness scales with available fraction
  const energyMultiplier = Math.min(1.0, renewableSurplus / energyRequired);

  return tech.baseEffectiveness * energyMultiplier;
}
```

**Concentration penalty:**
```typescript
function applyConcentrationPenalty(
  tech: Technology,
  boundary: PlanetaryBoundary
): number {
  if (!boundary.concentrationDecayExponent) {
    return tech.baseEffectiveness; // No penalty
  }

  // Effectiveness decays with dilution (power law)
  // Point sources (concentrated): full effectiveness
  // Dilute environmental: effectiveness × (1/dilution_factor)^exponent
  const dilutionFactor = tech.worksOnDiluteStreams ? 1000 : 1; // 10³ dilution
  const penalty = Math.pow(1 / dilutionFactor, boundary.concentrationDecayExponent);

  return tech.baseEffectiveness * penalty;
}
```

### Phase 4: Add Prevention Technologies (2-3 hours)

**NEW TIER 0 Technologies:**

```typescript
{
  id: "fossil_fuel_production_phaseout",
  name: "Fossil Fuel Production Phase-Out (80%)",
  tier: 0,
  type: "regulatory",
  timeline: "20-30 years",
  effectiveness: {
    climate: 0.60, // 60% by stopping emissions flow
    oceanAcidification: 0.40 // Indirect via CO₂
  },
  preventionRatio: 15, // 15:1 vs. carbon removal
  dependencies: ["renewable_transition", "global_governance"],
  analog: "Montreal Protocol CFC phase-out",
  research: ["IPCC AR6 mitigation pathways"]
}

{
  id: "agricultural_nitrogen_cap",
  name: "Global Agricultural Nitrogen Cap",
  tier: 0,
  type: "regulatory + agricultural",
  timeline: "15-25 years",
  effectiveness: {
    biogeochemicalFlows: 0.50, // 50% by stopping flow
    freshwaterChange: 0.30 // Reduces eutrophication
  },
  preventionRatio: 20, // 20:1 vs. dead zone remediation
  dependencies: ["precision_agriculture", "circular_food_systems"],
  research: ["Sutton et al. 2013 nitrogen budget"]
}

{
  id: "deforestation_ban_enforcement",
  name: "Deforestation Ban + Enforcement",
  tier: 0,
  type: "regulatory + enforcement",
  timeline: "10-20 years",
  effectiveness: {
    landSystemChange: 0.40, // 40% by stopping loss
    biosphereIntegrity: 0.25, // Protects habitat
    climate: 0.10 // Preserves carbon stock
  },
  preventionRatio: 10, // 10:1 vs. reforestation
  dependencies: ["indigenous_land_rights", "enforcement_tech"],
  analog: "Brazil deforestation reduction 2004-2012"
}
```

### Phase 5: Parameter Assignment (1-2 hours)

**Based on research findings, assign to each boundary:**

| Boundary | Irreversibility Fraction | Energy Trap (TWh/yr) | Concentration Exponent | Prevention:Cleanup |
|----------|-------------------------|---------------------|----------------------|-------------------|
| Climate Change | 0.70 (ice sheets, AMOC) | 50,000 (DAC for 10 Gt/yr) | 1.0 (point vs ambient) | 15:1 |
| Biosphere Integrity | 1.00 (extinction) | N/A (irreversible) | N/A | Prevention only |
| Land System Change | 0.60 (topsoil, desert) | 5,000 (restoration) | 0.0 (no dilution) | 10:1 |
| Freshwater Change | 0.80 (aquifers, glaciers) | 2,000 (desalination) | 0.0 | 5:1 |
| Biogeochemical Flows | 0.30 (dead zones) | 500 (nutrient removal) | 1.5 (coastal vs open) | 20:1 |
| Novel Entities | 0.90 (PFAS, plastic) | 10,000 (pyrolysis) | 2.0 (dilution penalty) | 15:1 ✅ |
| Ocean Acidification | 0.85 (deep ocean) | 50,000 (DAC + ocean) | N/A | 15:1 |
| Stratospheric Ozone | 0.05 (Montreal success) | Minimal | N/A | 20:1 ✅ |
| Atmospheric Aerosols | 0.10 (short-lived) | Minimal | N/A | 5:1 |

**⚠️ HIGH UNCERTAINTY PARAMETERS:**
All fractions are DERIVED from mechanism descriptions, not direct measurements. Sensitivity analysis REQUIRED (Monte Carlo N≥30).

---

## Testing & Validation

### Phase 6: Architecture Review (1 hour)
**Agent:** architecture-skeptic
**Output:** `reviews/irreversibility_framework_architecture_20251116.md`

**Quality Gate 2 (MUST PASS):**
- No performance bottlenecks (caching for repeated calculations)
- State propagation correct (irreversibility floors applied consistently)
- No circular dependencies
- Address CRITICAL/HIGH issues before proceeding

### Phase 7: Monte Carlo Validation (2-4 hours)
**Agent:** priya (quantitative validator)
**Output:** `reviews/irreversibility_framework_monte_carlo_20251116.md`

**Test matrix:**
1. **Determinism check:** N=10 runs with same seed (CV < 0.01%)
2. **Sensitivity analysis:** Vary irreversibility fractions ±20% (27 combinations)
3. **Effectiveness validation:** Confirm prevention:cleanup ratios honored
4. **Energy trap validation:** God mode test with/without energy constraints
5. **Irreversibility floor validation:** Boundaries cannot recover below floor

**Expected outcomes:**
- Climate: 0-30% recovery with aggressive prevention + cleanup
- Biosphere: 0% (extinction irreversible)
- Land: 10-40% recovery depending on intervention
- Freshwater: 5-20% (aquifer/glacier limits)
- Biogeochemical: 30-70% (most reversible if inputs stopped)
- Novel Entities: 0-10% (confirmed existing model)
- Ocean Acidification: 0-15% (deep ocean limits)
- Ozone: 90%+ (confirmed existing model)
- Aerosols: 90%+ (short-lived)

### Phase 8: Documentation (1 hour)
**Agent:** wiki-documentation-updater
**Updates:**
- `docs/wiki/systems/planetary-boundaries.md` (add irreversibility section)
- `docs/wiki/systems/technologies.md` (prevention tech catalog)
- `docs/wiki/mechanics/irreversibility.md` (NEW - comprehensive guide)

---

## Success Criteria

1. ✅ Research Grade B+ from research-skeptic
2. ✅ All 9 boundaries have irreversibility parameters
3. ✅ Energy trap constraints implemented
4. ✅ Concentration-effectiveness curves implemented
5. ✅ 3+ new prevention technologies added
6. ✅ Architecture review passes (CRITICAL/HIGH addressed)
7. ✅ Monte Carlo validation deterministic (CV < 0.01%)
8. ✅ God mode testing shows realistic recovery limits
9. ✅ Wiki documentation updated

---

## Timeline Estimate

| Phase | Agent | Time |
|-------|-------|------|
| Research | super-alignment-researcher | 2-3 hours |
| Validation | research-skeptic | 1 hour |
| Implementation | feature-implementer | 3-4 hours |
| Testing | priya | 2-4 hours |
| Architecture Review | architecture-skeptic | 1 hour |
| Documentation | wiki-documentation-updater | 1 hour |
| **TOTAL** | | **10-16 hours** |

**Target completion:** 2-3 work sessions

---

## Dependencies

**Blocked by:** None (research foundation exists)
**Blocks:**
- God mode effectiveness validation
- Utopia pathway verification
- Long-term outcome realism

---

## Next Steps

1. ✅ **Plan created:** This document
2. ⏳ **Spawn super-alignment-researcher:** Gather additional research for 6 remaining boundaries
3. ⏳ **Quality Gate 1:** research-skeptic validation
4. ⏳ **Spawn feature-implementer:** Extend framework implementation
5. ⏳ **Quality Gate 2:** architecture-skeptic review
6. ⏳ **Spawn priya:** Monte Carlo validation
7. ⏳ **Spawn wiki-documentation-updater:** Documentation sync
8. ⏳ **Spawn architect:** Archive plan to /plans/completed/

---

## References

**Existing Research:**
- `research/planetary_boundary_reversibility_empirical_verification_20251101.md` (Grade B+, 78% verified)
- `research/novel_entities_zero_effectiveness_20251113.md` (Grade B+, 16 sources)

**Completed Work:**
- `plans/completed/novel_entities_model_redesign_COMPLETE_20251114.md`
- Novel Entities irreversibility: ✅ IMPLEMENTED (src/simulation/planetaryBoundaries.ts:864-876)

**Additional Sources Needed:**
- IPCC AR6 WG1 (ice sheets, AMOC, ocean heat)
- IPBES 2019 (extinction debt, MVP)
- FAO soil reports (topsoil timescales)
- Wada et al. 2023 (aquifer depletion)
- Conley et al. 2024 (dead zone recovery)
