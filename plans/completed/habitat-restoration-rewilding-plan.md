# Habitat Restoration & Ecological Proxy Rewilding Implementation Plan

**Date:** October 22, 2025
**Purpose:** Add realistic pathways to biosphere recovery beyond 25% cap
**Research Foundation:** `/research/de_extinction_capabilities_timelines_20251022.md`
**Estimated Duration:** 10-13 hours

---

## Problem Statement

**Current State:** Biosphere integrity recovery is capped at ~25% because extinction is permanent.

**Discovery Context:**
- User asked about de-extinction as biosphere recovery mechanism
- super-alignment-researcher investigated de-extinction capabilities (2025-2045 timeframe)
- research-skeptic validated findings: De-extinction is NOT viable for 20-year simulation

**Key Finding:** TWO viable alternatives exist with strong research foundation:

1. **Habitat Restoration at Scale**
   - Can unlock 0-80% biosphere recovery (dominant factor)
   - Proven technology (reforestation, wetland restoration, marine protected areas)
   - Timeline: 15-30 years for functional ecosystem recovery
   - Cost: $10B/year global effort

2. **Ecological Proxy Rewilding**
   - 10-20% biosphere recovery, fast and cheap
   - Examples: Tauros Programme (auroch-like cattle), Pleistocene Park (elephants in Siberia)
   - Timeline: Already functional NOW, 5-20 years to scale
   - Cost: $10M-$100M vs $500M-$1B for de-extinction

---

## Research Foundation

**Comprehensive Research Already Complete:**
- File: `/research/de_extinction_capabilities_timelines_20251022.md` (1,000 lines)
- 25+ peer-reviewed citations (2020-2025)
- Research-skeptic validation: Already has critique (validates habitat restoration as superior)

**Key Research Findings:**

### Habitat Restoration (Jepson 2024, Moreno-Mateos et al. 2017)
- **Recovery Potential:** 0-80% of losses recoverable IF:
  - Habitat protected and restored at scale
  - Climate stabilized (prevents further losses)
  - Invasive species controlled
  - Pollution reduced
- **Timeline:** 10-50 years for ecosystem recovery
  - Organism abundance: 50-year lag
  - Species diversity: 30-year lag
  - Ecosystem functions: 30-40 year lag
- **Cost-Benefit:** Protect 32-69% more species per dollar than other methods

### Ecological Proxy Rewilding (Jepson 2024)
- **Tauros Programme:** Selective breeding of primitive cattle breeds
  - Auroch-like phenotype (size, behavior, grazing patterns)
  - Ecosystem services: Carbon sequestration, flood/wildfire reduction, biodiversity enhancement
  - Timeline: Populations already functioning in European rewilding sites (2020s)
  - Cost: MUCH lower than de-extinction (breeding, not genome engineering)
- **European Horse Rewilding:** Semi-feral horses fulfill ecological roles of extinct wild horses
  - Minimal de-domestication needed
  - Functional NOW, not decades away
- **Key Insight:** Ecosystem function > genetic purity (100-1000x more cost-effective)

### De-Extinction (For Context)
- **Contribution by 2045:** <5% biosphere recovery (symbolic only)
- **Cost:** $10-100M per species vs $1.5M/year conventional conservation
- **Timeline:** 20-50 years for first functional populations (Ne > 100)
- **Opportunity Cost:** Each $100M spent → 20 extant species not saved

---

## Implementation Phases

### Phase 1: Technology Tree Additions (3-4 hours)

**TIER 2 Technologies:**

**1. Habitat Restoration at Scale**
- **ID:** `habitatRestoration`
- **Name:** "Habitat Restoration at Scale"
- **Category:** environmental
- **Description:** Reforestation, wetland restoration, marine protected areas at ecosystem scale
- **Requirements:**
  - minAICapability: 0.8 (AI-optimized site selection, monitoring)
  - minEconomicStage: 3 (requires $10B/year investment)
  - requiredInvestment: $50B (setup costs)
  - prerequisiteTechs: ['cleanEnergy', 'ecosystemManagement']
- **Research:**
  - monthlyResearchCost: $2B
  - monthsToUnlock: 24-36 months (2-3 years R&D)
- **Deployment Timeline:** 180-360 months (15-30 years) to full deployment
  - 0 → 50% capacity: 180 months (15 years)
  - 50% → 100% capacity: 180 months (15 more years)
- **Effects:**
  - biosphereRecoveryUnlock: true (enables 25% → 80% recovery potential)
  - biodiversityRecovery: +0.5% per month at full deployment
  - ecosystemHealthBoost: +0.3% per month
  - Timeline: 30-50 years for 50-70% recovery (per research)

**2. Ecological Proxy Rewilding**
- **ID:** `ecologicalRewilding`
- **Name:** "Ecological Proxy Rewilding"
- **Category:** environmental
- **Description:** Reintroduce keystone species proxies (Tauros cattle, semi-feral horses, tortoise translocations)
- **Requirements:**
  - minAICapability: 0.5 (monitoring, breeding program optimization)
  - minEconomicStage: 2 (moderate cost, $1B/year)
  - requiredInvestment: $5B (breeding programs, translocation)
  - prerequisiteTechs: ['ecosystemManagement']
- **Research:**
  - monthlyResearchCost: $500M
  - monthsToUnlock: 12-18 months (1-1.5 years)
- **Deployment Timeline:** 60-180 months (5-15 years) to full deployment
  - 0 → 50% capacity: 60 months (5 years)
  - 50% → 100% capacity: 120 months (10 more years)
- **Effects:**
  - biodiversityRecovery: +0.2% per month at full deployment
  - ecosystemHealthBoost: +0.15% per month
  - Timeline: 10-20% biosphere recovery boost over 15-20 years

**TIER 3 Technology:**

**3. Advanced Ecosystem Management AI**
- **ID:** `advancedEcosystemAI`
- **Name:** "AI-Optimized Ecosystem Restoration"
- **Category:** environmental
- **Description:** AI systems optimize restoration targeting, monitor ecosystem health, predict recovery trajectories
- **Requirements:**
  - minAICapability: 1.5 (sophisticated environmental modeling)
  - minEconomicStage: 4 (requires compute + field deployment)
  - requiredInvestment: $20B (AI infrastructure, sensors, drones)
  - prerequisiteTechs: ['habitatRestoration', 'ecologicalRewilding']
- **Research:**
  - monthlyResearchCost: $1B
  - monthsToUnlock: 36-48 months (3-4 years)
- **Deployment Timeline:** 120-240 months (10-20 years) to full deployment
- **Effects:**
  - habitatRestorationBoost: 1.3x (30% faster/more effective)
  - rewiIdingEffectivenessBoost: 1.2x (20% improvement)
  - ecosystemMonitoring: Early warning for restoration failures

**Files to Modify:**
- `src/simulation/breakthroughTechnologies.ts` (add technology definitions)
- `src/types/technologies.ts` (add new fields if needed)

---

### Phase 2: Government Investment Actions (2-3 hours)

**New Government Action:**

**"Invest in Habitat Restoration"**
- **Type:** Environmental policy
- **Cost:** Variable ($1B - $50B per year, scales with governance capacity)
- **Requirements:**
  - Habitat restoration OR rewilding technology unlocked
  - Government budget sufficient for investment
- **Effects:**
  - Accelerates deployment progress for habitat restoration
  - Scales with governance capacity (enforcement + international cooperation)
  - Regional variation: Different ecosystems need different approaches
- **Mechanics:**
  - Investment → deployment progress (monthly increment)
  - Low governance (< 0.5): 50% effectiveness (funds mismanaged, corruption)
  - High governance (> 0.7): 100% effectiveness

**Investment Tracking:**
- Add `habitatRestorationInvestment` to government budget tracking
- Track cumulative investment vs required ($50B unlock threshold)
- Show investment → deployment progress relationship in logs

**Regional Variation:**
- Different countries focus on different ecosystems:
  - Tropical countries: Rainforest restoration
  - Temperate countries: Temperate forest, wetland restoration
  - Coastal countries: Marine protected areas, coral reef restoration
  - Arid countries: Desert ecosystem restoration, water conservation

**Files to Modify:**
- `src/simulation/government/actions/` (new action file or extend existing)
- `src/types/government.ts` (add investment tracking fields)

---

### Phase 3: Planetary Boundary Integration (3-4 hours)

**Update Biosphere Recovery Mechanics:**

**Current State (planetaryBoundaryRecovery.ts):**
- Biosphere recovery maxes at 25% (extinction is permanent)
- No mechanism for habitat-based recovery

**New Mechanics:**

**1. Unlock Recovery Potential**
```typescript
// In updateBiosphereStabilization()
const habitatRestorationDeployed = state.breakthroughTech?.habitatRestoration?.deploymentLevel ?? 0;
const rewiIdingDeployed = state.breakthroughTech?.ecologicalRewilding?.deploymentLevel ?? 0;

// Base recovery cap: 25% (current)
// Habitat restoration unlocks: +55% (to 80% total)
// Rewilding boost: +10-20% effectiveness
const recoveryCapUnlock = 0.25 + (0.55 * habitatRestorationDeployed);
const rewiIdingBoost = 1.0 + (0.2 * rewiIdingDeployed); // 1.0-1.2x multiplier
```

**2. Multi-Timescale Deployment**
- Habitat restoration: 0 → 50% over 180 months, 50% → 100% over 180 more months
- Rewilding: 0 → 50% over 60 months, 50% → 100% over 120 more months
- Recovery rate scales with deployment level (gradual, not instant)

**3. Actual Ecosystem Recovery**
```typescript
// Recovery rate based on research (30-50 years for 50-70% recovery)
// Monthly recovery: 0.3-0.5% per month at full deployment
const monthlyRecoveryRate = 0.004 * habitatRestorationDeployed * rewiIdingBoost * governanceMultiplier;

// Track progress toward recovery cap
const currentRecovery = boundary.recoveryProgress ?? 0;
const newRecovery = Math.min(currentRecovery + monthlyRecoveryRate, recoveryCapUnlock);

boundary.recoveryProgress = newRecovery;
```

**4. Governance Multiplier (Already Exists)**
- Low governance (< 0.5): 0.5x recovery rate
- High governance (> 0.7): 1.0x recovery rate
- Rationale: Tragedy of commons, enforcement needed

**5. Expected Timescales**
```typescript
// Baseline (no action): 0-25% recovery (permanent cap)
// With habitat restoration deployed:
//   - 10 years (120 months): 25-35% recovery
//   - 20 years (240 months): 40-60% recovery
//   - 30 years (360 months): 50-70% recovery
//   - 50 years (600 months): 60-80% recovery (if sustained)
```

**Files to Modify:**
- `src/simulation/planetaryBoundaryRecovery.ts` (update biosphere recovery logic)
- `src/types/planetaryBoundaries.ts` (add recovery tracking fields)

---

### Phase 4: Monte Carlo Validation (2 hours)

**Validation Goals:**
- Verify biosphere can now recover beyond 25%
- Measure recovery timescales match research (30-50 years for 50-70%)
- Confirm habitat restoration > rewilding > de-extinction effectiveness hierarchy
- Check governance capacity effects

**Test Scenarios:**

**Scenario 1: Baseline (No Habitat Restoration)**
- Expected: Biosphere maxes at 0-25% (current behavior)
- Validates: Cap still in place without new technologies

**Scenario 2: Habitat Restoration Deployed**
- Deploy habitat restoration at month 60 (5 years)
- Expected by month 240 (20 years):
  - Biosphere: 40-60% (if governance high)
  - Biosphere: 30-45% (if governance low)
- Validates: Unlocks recovery beyond 25%, governance matters

**Scenario 3: Habitat Restoration + Rewilding**
- Deploy both technologies early (month 30-60)
- Expected by month 240:
  - Biosphere: 50-70% (synergistic effects)
- Validates: Rewilding boosts recovery rate

**Scenario 4: Long-Term Recovery (360 months = 30 years)**
- Extended run to see if 80% cap is reachable
- Expected: 60-80% recovery if sustained effort
- Validates: Full recovery requires 30-50 years (per research)

**Monte Carlo Run:**
```bash
# N=10, 240 months
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=240 > logs/mc_habitat_restoration_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Success Criteria:**
- Biosphere recovery > 25% in at least 50% of runs
- Median biosphere at month 240: 40-60%
- Recovery scales with deployment progress (not instant)
- Low governance reduces recovery rate by ~50%

---

## Expected Outcomes

**Biosphere Recovery Trajectory:**
- **Baseline (no action):** 0-25% (current cap, extinction is permanent)
- **With habitat restoration (20 years):** 40-60%
- **With restoration + rewilding (20 years):** 50-70%
- **Full recovery (30-50 years):** 60-80% (requires sustained commitment beyond typical simulation)

**Ecological DUI Score Improvement:**
- **Current:** Ecology 0.4-1.3/100 (catastrophic collapse)
- **With habitat restoration:** Ecology 20-40/100 (stabilized sustainable development)
- **With heroic effort:** Ecology 60-80/100 (recovering ecosystems)

**Alignment with FIX #14 Research:**
- FIX #14 finding: "Stabilized sustainable development" (20-40/100 ecology) is realistic 20-year outcome
- Habitat restoration enables this outcome (40-60% biosphere = 20-40/100 ecology score)
- Full recovery (60-80/100 ecology) requires 30-50 year commitment

**Cost-Benefit Validation:**
- Habitat restoration: $10B/year → 40-60% biosphere recovery (20 years)
- Rewilding: $1B/year → +10-20% boost
- De-extinction: $10B total → <5% recovery (symbolic only)
- **ROI:** Habitat protection 3-8x more species saved than de-extinction (per research)

---

## Research Citations

All citations from `/research/de_extinction_capabilities_timelines_20251022.md`:

**Habitat Restoration:**
- Moreno-Mateos et al. (2017). "Anthropogenic ecosystem disturbance and the recovery debt." Nature Communications, 8, 14163.
  - Recovery debt: 46-51% abundance deficit, 27-33% diversity deficit, lasting decades
- Jepson (2024). "De-extinction beyond species: Restoring ecosystem functionality through large herbivore rewilding." Cambridge Prisms: Extinction, PMC11895704.
  - Tauros Programme, functional traits vs genetic purity, ecosystem services

**Ecological Proxies:**
- Seddon et al. (2017). "The ecology of de-extinction." Functional Ecology, 31(5).
  - Minimum viable populations, habitat requirements, founder group sizes
- Bennett et al. (2017). "Spending limited resources on de-extinction could lead to net biodiversity loss." Nature Ecology & Evolution, 1(4), 0053.
  - De-extinction → 3-8x fewer species saved vs habitat protection

**Cost-Benefit:**
- Possingham et al. (conservation prioritization literature)
  - Habitat protection protects up to 3x more distinct vertebrate species per dollar

---

## Files to Modify

**Phase 1: Technology Tree**
- `src/simulation/breakthroughTechnologies.ts`
- `src/types/technologies.ts`

**Phase 2: Government Actions**
- `src/simulation/government/actions/` (new file or extend existing)
- `src/types/government.ts`

**Phase 3: Planetary Boundaries**
- `src/simulation/planetaryBoundaryRecovery.ts`
- `src/types/planetaryBoundaries.ts`

**Phase 4: Validation**
- `scripts/monteCarloSimulation.ts` (no changes, just run)

---

## Quality Gates

**Quality Gate 1: Research Validation**
- Status: ✅ PASSED (research already complete and validated)
- Research: `/research/de_extinction_capabilities_timelines_20251022.md`
- Critique: Research-skeptic already has de-extinction critique (validates habitat restoration superiority)

**Quality Gate 2: Architecture Review**
- Trigger: After Phase 3 implementation complete
- Reviewer: architecture-skeptic
- Focus: Performance impact, state propagation, complexity
- Must address: CRITICAL/HIGH severity issues before documentation

---

## Timeline

**Total Estimated Duration:** 10-13 hours

- **Phase 1:** Technology Tree Additions (3-4h)
- **Phase 2:** Government Investment Actions (2-3h)
- **Phase 3:** Planetary Boundary Integration (3-4h)
- **Phase 4:** Monte Carlo Validation (2h)

**Workflow:**
1. ✅ Research complete (already done)
2. ✅ Research-skeptic validation (critique exists)
3. 🔄 Implementation (current work)
4. 🔲 Architecture review (after implementation)
5. 🔲 Documentation (wiki, devlog, archive)

---

## Success Criteria

**Implementation:**
- ✅ Three new technologies in tech tree (habitat restoration, rewilding, advanced ecosystem AI)
- ✅ Government action: "Invest in Habitat Restoration"
- ✅ Biosphere recovery unlocks beyond 25% cap
- ✅ Multi-timescale deployment (15-30 years for habitat, 5-15 years for rewilding)

**Validation:**
- ✅ Biosphere recovery > 25% in at least 50% of Monte Carlo runs
- ✅ Median biosphere at month 240: 40-60%
- ✅ Recovery timescales match research (30-50 years for full recovery)
- ✅ Governance capacity effects evident (low governance = 50% slower)

**Integration:**
- ✅ No performance degradation
- ✅ Passes architecture-skeptic review
- ✅ Wiki documentation updated
- ✅ Devlog entry created

---

**Plan Status:** READY FOR IMPLEMENTATION
**Next Steps:** Begin Phase 1 (Technology Tree Additions)
**Blocking:** None

---

Generated with Claude Code (claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
