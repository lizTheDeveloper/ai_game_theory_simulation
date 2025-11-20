# Nuclear Winter Cascades Enhancement Plan

**Date:** November 20, 2025
**Priority:** TIER 1 CRITICAL
**Complexity:** MEDIUM (enhancement of existing system, not new implementation)
**Research:** `research/nuclear_winter_climate_effects_20251113.md` (Nov 13, 2025, 8 peer-reviewed sources)

## Executive Summary

The nuclear winter system (`src/simulation/nuclearWinter.ts`) already exists and is operational. This plan enhances it with 2024-2025 research findings to improve parameter accuracy and add second-order cascade effects (ozone depletion, precipitation reduction, ecosystem collapse).

**Key Finding:** Existing implementation uses 2012-2019 research. November 2025 research provides updated parameters from Penn State agricultural models (38,572 locations) and IIASA famine estimates.

## Current Implementation Assessment

### ✅ Already Implemented (No Changes Needed)

1. **Soot injection modeling** - Lines 146-174 (research-based scaling)
2. **Temperature anomaly calculation** - Lines 187-211 (Robock 2019)
3. **Sunlight blocking** - Lines 257-284 (ARCH-4 integration with solar panels)
4. **Crop yield reduction** - Lines 222-239 (7% reduction per °C)
5. **Famine mortality** - Lines 318-363 (calibrated to Xia 2022 5-6B deaths)
6. **Radiation zones** - Lines 368-393 (per-country tracking)
7. **Monthly updates** - Lines 400-488 (soot decay, temperature recovery)
8. **Integration with mortality system** - Lines 452-462 (Bayesian mortality risks)

### 📊 Parameter Comparison: Existing vs 2025 Research

| Parameter | Existing (2019) | 2025 Research | Status |
|-----------|----------------|---------------|--------|
| **Limited war soot** | 5 Tg (100 warheads) | 5-5.5 Mt (50-100 warheads) | ✅ Matches (Tg=Mt) |
| **Regional war soot** | 50 Tg (1000 warheads) | 15-30 Mt (100-250 warheads) | ⚠️ Different scenario |
| **Full-scale soot** | 150 Tg (5000+ warheads) | 150-165 Mt (2000-4000 warheads) | ✅ Matches |
| **Temp drop (5 Tg)** | -2.25°C | -0.3°C to -2.25°C | ⚠️ Wide range in new research |
| **Temp drop (150 Tg)** | -17.5°C | -8°C to -12°C | ⚠️ Lower in 2025 research |
| **Crop reduction (5 Tg)** | 7% (calculated) | 7% corn (Penn State 2025) | ✅ Validates existing |
| **Crop reduction (165 Tg)** | 90% (calculated) | 80-90% (Xia 2022) | ✅ Matches |
| **Famine deaths (limited)** | ~2B (calibrated) | 2B (Xia 2022) | ✅ Matches |
| **Famine deaths (full-scale)** | ~5-6B (calibrated) | 5B (Xia 2022, IIASA 2025) | ✅ Matches |

**Conclusion:** Existing parameters are **well-calibrated** to research literature. Only minor adjustments needed.

### ❌ Missing Features (Second-Order Cascades)

The 2025 research identifies cascades NOT currently modeled:

1. **Ozone depletion** (Mills et al. 2014, reaffirmed 2025)
   - Mechanism: Stratospheric heating accelerates ozone destruction
   - Effect: 50-100% UV radiation increase
   - Impact: Agricultural stress (compounds cold/dark/dry), phytoplankton die-off
   - Timeline: 10-15 years persistence

2. **Precipitation reduction** (Robock et al. 2024-2025)
   - Mechanism: Anti-greenhouse effect, reduced evaporation
   - Effect: 6% global reduction (limited war), 20-30% (full-scale)
   - Impact: Monsoon failures, drought amplification
   - Timeline: 5-10 years

3. **Marine ecosystem collapse** (Penn State 2025)
   - Mechanism: Reduced sunlight + UV damage + ocean cooling
   - Effect: 20-40% phytoplankton productivity reduction
   - Impact: Fish stock collapse, 1-2B ocean-dependent populations at risk
   - Timeline: 1-2 years onset, 5-10 years recovery

4. **Resilient food system technologies** (adaptation pathways)
   - Cold-tolerant crops (potatoes, turnips, kale)
   - Greenhouse agriculture (where energy available)
   - Strategic grain reserves
   - Emergency distribution networks
   - Expected effect: 20-40% mortality reduction (optimistic case)

## Implementation Plan

### Phase 1: Parameter Refinement (2 hours)

**Goal:** Update existing parameters with 2025 research precision.

**Files to modify:**
- `src/simulation/nuclearWinter.ts`

**Changes:**

1. **Update temperature anomaly calculation** (lines 187-211)
   - Current: Linear scaling (5 Tg → -2.25°C, 150 Tg → -17.5°C)
   - New: Update to 2025 consensus (5 Tg → -1.5°C, 150 Tg → -9°C)
   - Rationale: 2025 climate models show lower sensitivity than 1980s Sagan estimates

2. **Refine crop yield curves** (lines 222-239)
   - Current: 7% reduction per °C (linear)
   - New: Add darkening (2% per °C) and precipitation (3% per °C) as separate factors
   - Rationale: Penn State 2025 model separates temperature vs sunlight effects

3. **Add scenario-specific soot injection** (lines 146-174)
   - Current: Generic scaling curve
   - New: Add three explicit scenarios (India-Pakistan 5.5 Mt, Regional 27.5 Mt, US-Russia 157.5 Mt)
   - Rationale: Literature uses specific scenarios, not continuous curves

**Research citations to add:**
- Penn State (2025): 38,572 location agricultural model
- IIASA (2025): "Looming shadow of nuclear winter"
- Xia et al. (2022): 5B deaths validation

### Phase 2: Second-Order Cascades (4 hours)

**Goal:** Add ozone depletion, precipitation reduction, marine ecosystem collapse.

**Files to modify:**
- `src/simulation/nuclearWinter.ts` (add new state fields)
- `src/types/nuclearWinter.ts` (extend NuclearWinterState interface)
- `src/simulation/engine/phases/NuclearCrisisPhase.ts` (integrate cascades)

**New state fields:**

```typescript
export interface NuclearWinterState {
  // ... existing fields ...

  // Second-order cascades (2025 research)
  ozoneDepletion: number;        // [0,1] Ozone layer damage (0.5 = 50% depleted)
  ozoneRecoveryRate: number;     // Monthly recovery (0.007 = 10-15 year half-life)
  uvRadiationMultiplier: number; // [1.0, 2.0] Surface UV increase (1.5 = 50% increase)

  precipitationReduction: number; // [0,1] Rainfall reduction vs baseline (0.3 = 30% less)
  monsoonFailureProbability: number; // [0,1] Annual monsoon failure risk

  marineProductivityReduction: number; // [0,1] Phytoplankton die-off (0.3 = 30% reduction)
  oceanDependentPopulationAtRisk: number; // Billions at risk from fish stock collapse
}
```

**New functions:**

```typescript
// Calculate ozone depletion from soot level (Mills et al. 2014)
function calculateOzoneDepletion(soot: number, monthsSinceWar: number): number

// Calculate precipitation reduction (Robock 2024-2025)
function calculatePrecipitationReduction(temperatureAnomaly: number): number

// Calculate marine productivity impact (Penn State 2025)
function calculateMarineProductivityReduction(sunlightBlocked: number, uvMultiplier: number): number

// Apply UV radiation agricultural stress (compounds existing crop failures)
function applyUVAgriculturalDamage(baseYield: number, uvMultiplier: number): number
```

**Integration points:**

1. Ozone depletion → UV radiation → crop yield multiplier (compounds temperature effects)
2. Precipitation reduction → drought amplification → FoodSecurityDegradationPhase
3. Marine productivity → fish stock collapse → FamineSystemPhase (protein deficit)

### Phase 3: Resilient Food Technologies (3 hours)

**Goal:** Add adaptation technologies that reduce nuclear winter mortality.

**Files to modify:**
- `src/simulation/techTree/comprehensiveTechTree.ts` (add 4-6 new technologies)
- `src/simulation/nuclearWinter.ts` (check deployed technologies, adjust mortality)

**New technologies:**

1. **Strategic Grain Reserves** (TIER 0 - Crisis Response)
   - Effect: 6-month food buffer (reduces mortality 20% in first year)
   - Prerequisites: None (institutional capacity only)
   - Deployment: 2-5 years
   - Cost: $100B+ global reserves
   - Research: FAO strategic reserves (2024-2025)

2. **Cold-Tolerant Crop Substitution** (TIER 1 - Adaptation)
   - Effect: 15% yield recovery (potatoes, turnips, kale vs wheat/rice)
   - Prerequisites: Agricultural research, seed banks
   - Deployment: 3-7 years
   - Research: Penn State (2025) adaptation scenarios

3. **Emergency Greenhouse Networks** (TIER 2 - Advanced Adaptation)
   - Effect: 10% yield recovery (where energy available)
   - Prerequisites: Renewable energy ≥40%, manufacturing capacity
   - Deployment: 5-10 years
   - Constraint: Energy-limited (fusion/renewables required)
   - Research: IIASA (2025) optimistic case

4. **Emergency Food Distribution AI** (TIER 1 - Logistics)
   - Effect: 10% mortality reduction (reduces hoarding, violence)
   - Prerequisites: AI coordination ≥0.6, governance ≥0.5
   - Deployment: 2-4 years
   - Research: Supply chain resilience (2024-2025)

**Expected impact:** Combined technologies reduce famine mortality 20-40% (matches IIASA optimistic case).

**Constraint:** Technologies must be DEPLOYED BEFORE nuclear war to be effective. Post-war deployment impossible (infrastructure collapse).

### Phase 4: Testing & Validation (3 hours)

**Goal:** Unit tests, integration tests, Monte Carlo validation.

**Unit tests:**
- Test soot injection scenarios (5.5 Mt, 27.5 Mt, 157.5 Mt) → expected temperature drops
- Test crop yield calculations (temperature + darkening + precipitation + UV)
- Test ozone depletion curves (Mills et al. 2014 validation)
- Test resilient food technologies (20-40% mortality reduction)

**Integration tests:**
- Trigger limited nuclear war → verify 2B deaths (Xia 2022 baseline)
- Trigger full-scale war → verify 5B deaths (IIASA 2025 baseline)
- Deploy resilient food tech → verify 20-40% mortality reduction
- Check marine ecosystem collapse → FamineSystemPhase protein deficit

**Monte Carlo validation (N≥10):**
- Scenario 1: 100 warheads, no resilient tech → 2B deaths (Xia baseline)
- Scenario 2: 4000 warheads, no resilient tech → 5B deaths (IIASA baseline)
- Scenario 3: 100 warheads, all resilient tech → 1.2-1.6B deaths (20-40% reduction)
- Check coefficient of variation < 0.01% (deterministic)
- Check outcome distributions (should shift toward extinction for full-scale war)

**Test files:**
- `tests/unit/nuclearWinter.test.ts` (NEW)
- `tests/integration/nuclearWinterCascades.test.ts` (NEW)

### Phase 5: Documentation (1 hour)

**Goal:** Update wiki, create devlog.

**Files to update:**
- `docs/wiki/README.md` (add Nuclear Winter Cascades section)
- `devlogs/nuclear_winter_cascades_20251120.md` (NEW)
- `plans/completed/nuclear_winter_cascades_complete_20251120.md` (archive this plan)

**Wiki section structure:**

```markdown
## Nuclear Winter System

**Overview:** Models catastrophic long-term effects of nuclear war (soot injection, temperature collapse, agricultural failure, famine).

**Research:** Xia et al. (2022), Penn State (2025), IIASA (2025), Mills et al. (2014)

### Primary Effects
- Soot injection (5.5 Mt, 27.5 Mt, 157.5 Mt scenarios)
- Temperature drops (-1.5°C to -9°C)
- Sunlight blocking (60% to 92.5%)
- Crop yield collapse (7% to 80-90%)

### Second-Order Cascades
- Ozone depletion → UV radiation increase (50-100%)
- Precipitation reduction (6% to 30%)
- Marine ecosystem collapse (20-40% productivity loss)

### Famine Mortality
- Limited war (5.5 Mt): 2B deaths (Xia 2022)
- Regional war (27.5 Mt): 3-4B deaths (scaling)
- Full-scale war (157.5 Mt): 5B deaths (IIASA 2025)

### Resilient Food Technologies
- Strategic grain reserves (20% mortality reduction)
- Cold-tolerant crops (15% yield recovery)
- Emergency greenhouses (10% yield recovery, energy-limited)
- Emergency distribution AI (10% mortality reduction)
- **Combined effect:** 20-40% mortality reduction (IIASA optimistic case)
- **Critical constraint:** Must deploy BEFORE nuclear war

### Integration Points
- NuclearCrisisPhase (order 252) → monthly updates
- FoodSecurityDegradationPhase → precipitation-drought coupling
- FamineSystemPhase → marine ecosystem protein deficit
- Solar energy system → sunlight blocking (ARCH-4 validated)
```

## Timeline Estimate

**Total: 13 hours** (2-day sprint)

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Parameter refinement | 2 hours | Research validation complete |
| Phase 2: Second-order cascades | 4 hours | Phase 1 |
| Phase 3: Resilient food tech | 3 hours | Phase 2 |
| Phase 4: Testing & validation | 3 hours | Phases 1-3 |
| Phase 5: Documentation | 1 hour | Phase 4 |

**Buffer:** +3 hours (total 16 hours / 2 days)

## Quality Gates

### Gate 1: Research Validation
- ✅ **PASSED** (Nov 13, 2025)
- Research: `research/nuclear_winter_climate_effects_20251113.md`
- Grade: A- (8 peer-reviewed sources, parameter justification, mechanism description)
- No critique needed (research quality high)

### Gate 2: Architecture Review
- **Criteria:** No CRITICAL/HIGH performance issues, no state propagation bugs
- **Reviewer:** architecture-skeptic (after implementation)
- **Focus areas:** Second-order cascade integration, tech tree additions

### Gate 3: Monte Carlo Validation
- **Criteria:** N≥10, deterministic (CV < 0.01%), 2B/5B death scenarios match literature
- **Validator:** priya (quantitative validator)
- **Success metrics:** Outcome distributions shift toward extinction for full-scale war

## Expected Impact

**Before:** Nuclear winter functional but uses 2012-2019 parameters, missing second-order cascades.

**After:**
- Parameters updated to 2024-2025 research (Penn State 38,572 location study, IIASA)
- Second-order cascades operational (ozone, precipitation, marine ecosystems)
- Resilient food technologies available (20-40% mortality reduction if deployed early)
- Full research provenance (8 peer-reviewed sources 2022-2025)

**God mode analysis impact:** Nuclear winter scenarios should produce extinction outcomes for full-scale war (5B deaths = 62.5% of 8B population). Limited war scenarios (2B deaths) should produce severe dystopia outcomes.

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Parameter conflicts with existing calibration | MEDIUM | HIGH | Preserve Xia 2022 2B/5B death targets as validation |
| Second-order cascades cause new NaN bugs | MEDIUM | MEDIUM | Use assertion utilities, defensive coding |
| Tech tree additions break existing balance | LOW | MEDIUM | Technologies only reduce mortality 20-40%, not eliminate |
| Monte Carlo validation fails determinism | LOW | HIGH | All RNG calls use required rng parameter |

## Success Criteria

- ✅ All parameters match 2024-2025 research (Penn State, IIASA, Xia)
- ✅ Second-order cascades operational (ozone, precipitation, marine)
- ✅ Resilient food technologies available (4-6 new techs)
- ✅ Unit tests pass (soot scenarios, crop yields, cascades)
- ✅ Integration tests pass (2B/5B death scenarios)
- ✅ Monte Carlo validation passes (N≥10, deterministic, literature matches)
- ✅ Architecture review passes (no CRITICAL/HIGH issues)
- ✅ Wiki updated, devlog created, plan archived

## Research Citations

All citations from `research/nuclear_winter_climate_effects_20251113.md`:

1. Xia, L. et al. (2022). "Global food insecurity and famine from reduced crop, marine fishery and livestock production due to climate disruption from nuclear war soot injection." *Nature Food*, 3, 586–596.

2. Penn State University (2025). "Cycles agroecosystem model simulation of nuclear winter impacts on global corn yields." 38,572 locations modeled.

3. IIASA (2025). "The looming shadow of nuclear winter." 90% calorie drop, 5B deaths.

4. Mills, M. J. et al. (2014, reaffirmed 2024-2025). "Smoke from nuclear war would devastate ozone layer, alter climate." NCAR/UCAR.

5. Robock, A. et al. (2024-2025 updates). "Climatic consequences of nuclear conflict." Rutgers Climate Lab.

6. Toon, B. R., Robock, A., & Turco, R. P. (2008). "Environmental consequences of nuclear war." *Physics Today*, 61(12), 37-42.

7. US National Academies of Science (2023-2025). "Independent Study on Potential Environmental Effects of Nuclear War." (In progress, expected 2025)

8. FAO (2024-2025). Strategic grain reserves and emergency food systems.

## Notes

**Implementation approach:** Enhancement, not rewrite. Existing nuclear winter system is well-designed and functional. This plan adds precision and second-order effects, not fundamental changes.

**Defensive coding:** Follow assertion utilities pattern (no silent fallbacks). All RNG calls REQUIRED parameter. Fail loudly on invalid state.

**Emoji conventions:** Register any new emojis in `docs/EMOJI_EVENT_MAP.txt` before use. Nuclear winter uses ☢️ (nuclear), 🌍 (planetary), 💀 (mortality).
