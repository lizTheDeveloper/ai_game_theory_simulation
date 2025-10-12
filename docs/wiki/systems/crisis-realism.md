# Crisis Realism Systems (TIER 1.7)

**Status:** ✅ Production Ready (92/92 tests passing)
**Implementation Date:** October 12, 2025
**Research-Backed:** Gaza/Yemen/Sudan (famine), Chernobyl/Hiroshima/Fukushima (radiation)

## Overview

TIER 1.7 implements three interconnected systems that ground catastrophic events in real-world timelines and medical/environmental science:

1. **Regional Biodiversity** - Nuclear strikes affect only target regions
2. **Famine Death Curves** - Gradual mortality over 30-60 days, genocide detection
3. **Nuclear Radiation** - Decades-long health effects and environmental contamination

## Problem Solved

**Before Crisis Realism:**
- Famine: Instant one-time death event
- Nuclear: Only immediate blast deaths
- Biodiversity: Global number, Moscow affects Amazon
- No distinction between genocide and natural disasters

**After Crisis Realism:**
- Famine: Gradual 30-60 day timeline, tech blocked during genocide
- Nuclear: Decades of cancer, birth defects, soil contamination
- Biodiversity: Regional tracking, localized damage
- Tech deployment conditional on crisis type

---

## System 1: Regional Biodiversity

**File:** `src/types/regionalBiodiversity.ts` (377 lines)

### Six-Region Tracking

| Region | Weight | Baseline Biodiversity | Rationale |
|--------|--------|----------------------|-----------|
| Asia | 30% | 70% | Largest landmass, biodiversity hotspots |
| Africa | 20% | 75% | Mega-diverse |
| South America | 20% | 80% | Amazon rainforest, Andes |
| North America | 15% | 65% | Modified by agriculture |
| Europe | 10% | 55% | Most human-modified |
| Oceania | 5% | 70% | Coral reefs, island ecosystems |

**Global biodiversity = weighted average of all regions**

### Per-Region Data

```typescript
interface RegionalBiodiversity {
  biodiversityIndex: number;       // [0, 1] Species diversity
  ecosystemIntegrity: number;      // [0, 1] Functional integrity
  keySpeciesLost: string[];        // Major extinctions
  pollutionLevel: number;          // [0, 1] Local pollution
  habitatLoss: number;             // [0, 1] Deforestation
  climateStress: number;           // [0, 1] Temperature changes
  contaminationLevel: number;      // [0, 1] Radiation, pollutants
  ecosystemCollapseActive: boolean;
  extinctionEvents: number;
}
```

### Nuclear Strike Effects

When a nuclear strike hits a region:
- **60% biodiversity loss** (blast zones, fallout)
- **90% ecosystem integrity collapse** (food webs disrupted)
- **80% contamination increase** (radiation, toxins)
- **Ecosystem collapse flag** if biodiversity < 30%
- **Regional extinction event recorded**

**Crucially:** Other regions are **unaffected**.

### Example

```
Nuclear strike on Moscow (Russia → Asia region):
- Asia biodiversity: 70% → 10% (60% loss)
- South America biodiversity: 80% → 80% (unchanged ✅)
- Global biodiversity: 70.8% → 61.8% (9% loss via Asia's 30% weight)
```

### Research Backing

- Coupe et al. (2019): Nuclear winter climate modeling
- Robock et al. (2007): Regional nuclear war effects
- Blast zones: 100% loss within 10km radius
- Fallout zones: 50-90% loss within 50km

---

## System 2: Famine Death Curves

**File:** `src/types/famine.ts` (284 lines)

### Realistic Medical Timeline

Based on severe acute malnutrition research and current Gaza/Yemen/Sudan crises:

| Month | Mortality Rate | Who Dies |
|-------|---------------|----------|
| 0 | 0% | Onset, no deaths yet |
| 1 | 2% | Weakest die first: elderly, children, sick |
| 2 | 8% | Severe malnutrition sets in |
| 3 | 15% | **Peak starvation** |
| 4 | 10% | Remaining weak population |
| 5+ | 2% | Sustained low-level mortality |

**Total over 6 months:** ~37% cumulative mortality (if no intervention)

### Genocide Detection

The system distinguishes between:

**Natural Disasters** (tech CAN help):
- Drought
- Crop failure
- Climate disasters
- Economic collapse
- War displacement (if access exists)

**Genocide** (tech CANNOT help):
- Aid blockade (e.g., Gaza)
- Resource extraction (e.g., land grabs)
- Intentional starvation (e.g., Holodomor)

```typescript
interface FamineEvent {
  cause: FamineCause;
  isGenocide: boolean;              // If true, tech blocked
  canDeployTech: boolean;           // Can we help?
  aidBlocked: boolean;              // Intentional blockade
  resourceExtraction: boolean;      // Land grab scenario
  techEffectiveness: number;        // [0, 1] Mortality reduction
}
```

### Tech Deployment

**Requirements:**
- AI capability ≥ 2.0
- Resources available
- NOT genocide scenario

**Effectiveness:**
- Base: 50-90% mortality reduction
- Scales with AI capability
- Technologies: Hydroponics, emergency food, water purification

**Example:**
- Natural disaster (drought): 100M at risk
  - Without tech: 37M deaths over 6 months
  - With tech (70% effective): 11M deaths (26M saved)
- Genocide (aid blockade): 2M at risk
  - Tech blocked: 740k deaths (no reduction possible)

### Research Backing

**Gaza (2024-2025):**
- 74 malnutrition deaths confirmed (10x undercount = ~740 actual)
- Aid blockade, genocide context
- Tech deployment impossible

**Sudan (2024):**
- 522,000 children dead from malnutrition
- War-driven, infrastructure collapsed
- Tech deployment possible if access secured

**Yemen (2015-2018):**
- 85,000 children dead from starvation
- 10-year conflict, blockade
- 17.1 million in acute food insecurity

**Medical:**
- Severe acute malnutrition → death: 30-60 days
- Total starvation (water only): 30-70 days
- No food or water: 8-21 days

---

## System 3: Nuclear Radiation Health Effects

**File:** `src/types/radiation.ts` (378 lines)

### Acute Radiation Syndrome (Weeks 1-4)

**Immediate effects:**
- Exposure at 4-6 Gy (Grays)
- Mortality: 50-80%
- Deaths occur in first month
- Symptoms: Nausea, bleeding, organ failure

### Long-Term Cancer (Years 5-40)

**Latency:** 5 years minimum before cancers appear

**Incidence:**
- Baseline cancer rate: 40% (normal population)
- Radiation bonus: +10-30% additional risk
- Total: 50-70% lifetime cancer risk for exposed

**Timeline:**
- Years 5-10: Cancer deaths begin (low)
- Years 20-30: **Peak incidence** (Gaussian curve)
- Years 30-40: Declining incidence
- After 40 years: Approaches baseline

**Example (100M exposed):**
- Year 10: 805 deaths/month from cancer
- Year 30: 1,639 deaths/month (peak)
- Total over 40 years: ~2.5M cancer deaths

### Birth Defects (3 Generations = ~75 years)

**Baseline:** 3% birth defect rate (normal)
**Radiation:** 2-5x multiplier (6-15% rate)

**Affected Generations:**
1. **Generation 1** (0-25 years): Full 2-5x effect
2. **Generation 2** (25-50 years): 0.67x effect (genetic repair)
3. **Generation 3** (50-75 years): 0.44x effect (further repair)

**After 75 years:** Birth defects return to baseline

### Environmental Contamination

**Radioactive Isotopes:**

| Isotope | Half-Life | Duration | Effect |
|---------|-----------|----------|--------|
| Iodine-131 | 8 days | Weeks | Intense but short-lived, thyroid damage |
| Strontium-90 | 29 years | Decades | Bone cancer, bioaccumulation |
| Cesium-137 | 30 years | Centuries | Dominates long-term contamination |

**Decay Timeline:**
- Year 1: 98% contamination remaining
- Year 10: 79% contamination
- Year 30: 50% contamination (1 half-life)
- Year 60: 25% contamination (2 half-lives)
- Year 300: <1% contamination (10 half-lives)

**Agriculture:**
- Impossible when contamination > 20%
- Year 30: Still impossible (50% contamination)
- Year 60: Borderline viable (25% contamination)
- Year 100+: Recovery begins (optimistic)

### Real-World Validation

**Hiroshima/Nagasaki (1945):**
- 200k exposed → 100k-160k acute deaths ✅
- 70 years of longitudinal health data
- Cancer peaked 20-30 years post-exposure ✅
- Birth defects observed for 3 generations ✅

**Chernobyl (1986):**
- 30km exclusion zone remains
- Cs-137 contamination still at 50% (1 half-life passed)
- Agriculture still impossible in hotspots
- Wildlife returned but ecosystem altered

**Fukushima (2011):**
- 20km exclusion zone
- Ongoing decontamination efforts
- Agriculture banned in contaminated areas
- 100+ year recovery timeline estimated

---

## Integration: Nuclear War Cascade

When nuclear war occurs, all three systems activate:

### Immediate (Month 0)
```
☢️ Nuclear strike on Russia (Asia region)
  ↓
1. Immediate blast deaths: 60% mortality in exposed region
2. Regional biodiversity loss: Asia 70% → 10%
3. Radiation exposure event created: 1.2B exposed
4. Potential famine trigger: Nuclear winter effect
```

### Short-Term (6 months)
- Famine deaths accumulating (gradual curve: 2% → 8% → 15% → 10% → 2%)
- Birth defects beginning (small numbers)
- No cancer yet (5-year latency)
- Contamination: 98% remaining

### Medium-Term (10 years)
- Cancer deaths beginning (~800/month per 100M exposed)
- Birth defects ongoing (generation 1)
- Famines ended (food security restored)
- Contamination: 79% remaining
- Agriculture impossible

### Long-Term (30 years)
- Peak cancer deaths (~1,600/month per 100M exposed)
- Birth defects ongoing (generation 2)
- Contamination: 50% remaining (1 half-life)
- Agriculture still impossible
- Regional biodiversity permanently reduced

---

## Test Coverage

**Total: 92/92 tests passing** ✅

### Unit Tests
- Regional Biodiversity: 17/17 ✅
  - Regional isolation (Asia strike doesn't affect Amazon)
  - Weighted global calculation
  - Nuclear strike effects

- Famine Death Curves: 23/23 ✅
  - Medical timeline (30-60 days)
  - Genocide detection (Gaza/Sudan scenarios)
  - Tech deployment effectiveness

- Nuclear Radiation: 32/32 ✅
  - Acute radiation syndrome
  - Long-term cancer (peak at year 25)
  - Birth defects (3 generations)
  - Contamination decay (Cs-137 half-life)
  - Hiroshima validation

### Integration Tests: 20/20 ✅
- Full 30-year nuclear war simulation
- All systems working together
- System independence validated
- Realistic cascade verified

---

## Usage in Simulation

### Nuclear Strike Triggers

When `extinctions.ts` detects nuclear war:

```typescript
// 1. Immediate deaths (already modeled)
addAcuteCrisisDeaths(state, 0.60, 'Nuclear war', 0.30);

// 2. Regional biodiversity loss (NEW)
const targetRegion = getRegionFromNation('Russia'); // 'Asia'
applyNuclearBiodiversityLoss(state.biodiversitySystem, targetRegion, 1.0);

// 3. Radiation exposure (NEW)
const exposedPopulation = state.humanPopulationSystem.totalPopulation * 0.15;
triggerRadiationExposure(state.radiationSystem, month, targetRegion, exposedPopulation, 1.0);

// 4. Potential famine (NEW, conditional)
if (nuclearWinter) {
  triggerFamine(state.famineSystem, month, targetRegion, population * 0.5, 'nuclear_winter', 0.2);
}
```

### Monthly Updates

Each month, the simulation progresses all active crises:

```typescript
// Update radiation effects
const { deaths, birthDefects } = updateRadiationSystem(
  state.radiationSystem,
  currentMonth,
  globalPopulation
);

// Update famine events
const aiCapability = calculateTotalAICapability(state.aiAgents);
const famineDeaths = updateFamineSystem(
  state.famineSystem,
  aiCapability,
  resourcesAvailable
);

// Regional biodiversity persists (no decay modeled)
```

---

## Performance

**Computational Cost:** Low
- Regional biodiversity: O(6) per nuclear strike
- Famine: O(n) where n = active famines (typically 0-5)
- Radiation: O(m) where m = active exposures (typically 0-10)

**Memory Footprint:** Minimal
- ~1KB per famine event
- ~2KB per radiation exposure
- ~500 bytes per regional biodiversity state

**Long-running simulations (1000+ months):**
- Old exposures automatically archived after 75+ years
- Famines end naturally when food security restored
- No memory leaks or performance degradation

---

## Future Enhancements

**Possible additions:**
1. Regional famine propagation (food trade disruption)
2. Genetic damage inheritance beyond 3 generations
3. Ecosystem recovery modeling (rewilding timelines)
4. Water table contamination (groundwater radioactivity)
5. Food chain bioaccumulation (Cs-137 in fish, game)

**Not planned:**
- Individual-level tracking (population-scale model)
- Specific disease modeling (aggregate cancer rate sufficient)
- Sub-regional resolution (6 regions adequate for global model)

---

## References

**Famine Research:**
- WHO (2024-2025): Gaza famine data
- Sudan Doctors Union (2025): Malnutrition mortality
- Save the Children (2018): Yemen crisis
- World Peace Foundation: Famine mortality analysis
- Clinical nutrition: Severe acute malnutrition timelines

**Nuclear Effects Research:**
- Coupe et al. (2019): Nuclear winter climate modeling
- Robock et al. (2007): Regional nuclear war effects
- Chernobyl studies (1986-present): Long-term radiation
- Hiroshima/Nagasaki data (1945-present): 70-year health tracking
- Fukushima reports (2011-present): Environmental contamination

**Medical Standards:**
- WHO IPC Framework: Famine phase classification
- IAEA: Radiation exposure guidelines
- Médecins Sans Frontières: Field mortality data

---

## See Also

- [Nuclear Deterrence](nuclear-deterrence.md) - MAD system that tries to prevent this
- [Population Dynamics](population-dynamics.md) - How deaths are tracked
- [Environmental Systems](environmental.md) - Broader ecological modeling
- [Planetary Boundaries](planetary-boundaries.md) - Earth system limits
