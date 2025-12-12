# Simulation Systems Index

**Last Updated:** October 29, 2025

This index lists all major systems in the AI Game Theory Simulation, organized by TIER.

---

## TIER 0: Baseline Corrections

### ✅ Baseline Corrections
**File:** [baseline-corrections.md](baseline-corrections.md)
**Status:** Complete
**Phase:** Initialization only
**Summary:** Research-backed 2025 starting values. Sets biodiversity (35%), resources (65%), pollution (30%), climate rate (0.08%/month) to match peer-reviewed data.

---

## TIER 1: Critical Extinction Risks

### TIER 1.1: ✅ Phosphorus Depletion
**File:** [phosphorus-depletion.md](phosphorus-depletion.md)
**Status:** Complete
**Phase:** PhosphorusPhase (24.0)
**Summary:** Non-renewable resource crisis. Morocco controls 70% of reserves. Circular economy solutions. Peak phosphorus concept.

### TIER 1.2: ✅ Freshwater Depletion
**File:** [freshwater-depletion.md](freshwater-depletion.md)
**Status:** Complete
**Phase:** FreshwaterPhase (25.0)
**Summary:** Groundwater depletion (68% of water loss). "Day Zero Droughts" (compound extremes). Peak groundwater. 3 billion people at risk.

### TIER 1.3: ✅ Ocean Acidification
**File:** [ocean-acidification.md](ocean-acidification.md)
**Status:** Complete
**Phase:** OceanAcidificationPhase (26.0)
**Summary:** 7th planetary boundary breached Sept 2025. Coral reef collapse. Marine food web cascading failure. Ocean Alkalinity Enhancement (no termination shock).

### TIER 1.4: Multipolar System
**File:** *Not yet documented*
**Status:** Implemented but not documented
**Phase:** Multiple phases
**Summary:** Nation-state dynamics, nuclear deterrence, MAD, bilateral tensions.

### TIER 1.5: ✅ Novel Entities (Chemical Pollution)
**File:** [novel-entities.md](novel-entities.md)
**Status:** Complete (Updated Oct 13 with population deaths)
**Phase:** NovelEntitiesPhase (27.0)
**Summary:** 5th boundary breached 2022. Microplastics, PFAS, endocrine disruption. 50% sperm decline. Slowest extinction (200 years).

### TIER 1.6: ✅ Population Dynamics
**File:** [population-dynamics.md](population-dynamics.md)
**Status:** Complete (Updated Oct 13 with environmental mortality fixes)
**Phase:** HumanPopulationPhase (28.0)
**Summary:** Concrete population tracking (billions). Birth/death rates, carrying capacity, demographic structure. Population crash vs extinction distinction.

### TIER 1.6: ✅ Refugee Crisis
**File:** [refugee-crises.md](refugee-crises.md)
**Status:** Complete
**Phase:** RefugeeCrisisPhase (20.6)
**Summary:** Displacement from climate/war/famine. Gradual displacement (10% monthly). Generational resettlement (25 years). Transit mortality (2%). Social tension, economic strain.

### TIER 1.7: ✅ Nuclear Winter
**File:** [nuclear-winter.md](nuclear-winter.md)
**Status:** Complete
**Phase:** NuclearWinterPhase (252)
**Summary:** Long-term effects of nuclear war. Soot injection → temperature drop (-15 to -20°C) → crop failure (90%) → starvation (5% monthly). Recovery timeline: 5-10 years.

### TIER 1.7: ✅ Famine System
**File:** [famine-system.md](famine-system.md)
**Status:** Complete (Updated Oct 14 - comprehensive documentation)
**Phase:** FamineSystemPhase (21.5)
**Summary:** Realistic 30-60 day death curves (2% → 15% peak → 2%). Genocide detection (tech blocked). Food security < 0.4 triggers. Regional distribution. Tech mitigation (50-90% reduction).

### TIER 1.7: ✅ Radiation System
**File:** [radiation-system.md](radiation-system.md)
**Status:** Complete (Updated Oct 14 - comprehensive documentation + integration fix)
**Phase:** RadiationSystemPhase (252.5)
**Summary:** Acute radiation syndrome (50-80% mortality). Long-term cancer (40 years, +10-30% risk). Birth defects (3 generations). Environmental contamination (30-300 years). Monthly updates for cancer deaths, birth defects, and contamination decay. Integrated with food security and QoL.

### TIER 1.8: ✅ Climate Impact Cascade
**File:** [climate-impact-cascade.md](climate-impact-cascade.md) (see also: `/docs/CLIMATE_CASCADE_IMPLEMENTATION_SUMMARY.md`)
**Status:** Complete (Oct 29, 2025)
**Phase:** ClimateImpactCascadePhase (34.0)
**Summary:** Coordinated climate → food security → famine → mortality cascade system. Research-backed lag times (0-12 months). Seasonal lean periods (Sahel, South Asia, East Africa) with 1.75× multiplier. Tiered mortality rates (15% → 5% → 0.2%) by food security level. Queue-based delayed impact modeling. Integrates with Bayesian mortality system. 450+ lines with fail-loudly assertions.

---

## TIER 2: Major Mitigations

### 🟡 AI Coordination & Transition Management
**File:** ai-coordination-transition.md (pending creation)
**Status:** Research complete, implementation pending
**Phase:** CoordinatedDeploymentPhase (pending)
**Summary:** Models AI-managed technology deployment coordination to reduce transition mortality. Research-backed conservative parameters: 9-12% mortality (coordinated) vs 30% (uncoordinated instant deployment). Includes coordination failure scenarios (10-20% probability) and rebound effects (5-10% decay per year). Quality Gate 1: PASSED (Grade B-).
**Research:** research/ai_coordination_transition_management_20251121.md (15K words, 15 sources)
**Critique:** reviews/ai_coordination_transition_critique_20251121.md
**Handoff:** .claude/agents/HANDOFF_ai_coordination_conservative_params.md

### Enhanced UBI System
**File:** *Not yet documented*
**Status:** Implemented
**Phase:** UBIPhase
**Summary:** Universal Basic Income mechanics. Meaning crisis mitigation, economic security, automation response.

### Social Safety Nets
**File:** *Not yet documented*
**Status:** Implemented
**Phase:** SocialSafetyNetsPhase
**Summary:** Healthcare, education, housing, food security. Quality of life protection during transitions.

---

## TIER 3: Planetary Boundaries

### ✅ Planetary Boundaries System
**File:** [planetary-boundaries.md](planetary-boundaries.md)
**Status:** Complete
**Phase:** PlanetaryBoundariesPhase (21.0)
**Summary:** Tracks all 9 planetary boundaries (7/9 breached in 2025). Integrates phosphorus, freshwater, ocean acidification, novel entities with climate, biodiversity, land use, nitrogen, atmospheric aerosols. Tipping point cascade mechanics (70% risk → 10% monthly cascade trigger → 48-month extinction).

---

## TIER 4: Enrichment Systems

### Information Warfare
**File:** [information-warfare.md](information-warfare.md)
**Status:** ✅ Documented
**Phase:** InformationWarfarePhase
**Summary:** Misinformation, disinformation, propaganda. Information integrity degradation. Social cohesion impacts.

### Information Ecology
**File:** [information-ecology.md](information-ecology.md)
**Status:** ✅ Implemented (Dec 12, 2025)
**Phase:** InformationEcologyPhase (18.0)
**Summary:** Epistemic environment health. Misinformation epidemiology (SIS model). Trust erosion. Polarization dynamics. Shared reality degradation. Coordination capacity modulation. Impact: 20-40% reduction in managed transition probability for polarized scenarios.
**Research:** 15+ peer-reviewed sources (Alotaibi 2024, Labarre 2024, APSR 2025, Edelman 2025)
**Quality Gates:** QG1: B+ (research skeptic), QG2: A (architecture skeptic)
**Determinism:** Perfect (CV = 0.000000%)

### Power Generation System
**File:** *Not yet documented*
**Status:** Implemented
**Phase:** PowerGenerationPhase
**Summary:** Energy production tracking. Fossil fuels vs renewables vs nuclear vs fusion. Carbon emissions, energy abundance.

---

## Core Supporting Systems

### Quality of Life System
**File:** *Not yet documented*
**Status:** Implemented
**Summary:** Multi-dimensional QoL: material abundance, health, mental health, social connection, meaning, safety, healthcare, longevity, diseases.

### Environmental Accumulation
**File:** *Partially documented (see baseline-corrections.md)*
**Status:** Implemented
**Summary:** Climate stability, biodiversity, pollution, resource reserves. Tracks slow degradation over time.

### Social Accumulation
**File:** *Partially documented (see baseline-corrections.md)*
**Status:** Implemented
**Summary:** Meaning crisis, institutional legitimacy, social cohesion, cultural adaptation. Social fabric degradation.

### Technological Risk
**File:** *Not yet documented*
**Status:** Implemented
**Summary:** Technological risk accumulation. AI safety, bioweapons, nanotechnology, synthetic biology risks.

### Breakthrough Technologies
**File:** *Not yet documented*
**Status:** Implemented
**Summary:** Tech tree. Fusion power, sustainable agriculture, carbon capture, circular economy, etc. Research requirements and deployment.

### Upward Spirals (Utopia Detection)
**File:** *Not yet documented*
**Status:** Implemented
**Summary:** Tracks positive feedback loops. Ecological spiral, abundance spiral, meaning spiral, coordination spiral.

### Resource Economy
**File:** *Not yet documented*
**Status:** Implemented
**Summary:** Food and water stocks. Production, consumption, distribution. Integrates with freshwater and phosphorus.

### Extinction System
**File:** *Not yet documented*
**Status:** Implemented
**Summary:** Tracks extinction types (instant, rapid, slow, controlled, unintended). Severity progression. Population impacts.

---

## Organization by Completeness

### ✅ Fully Documented (13 systems)
1. Baseline Corrections (TIER 0)
2. Phosphorus Depletion (TIER 1.1)
3. Freshwater Depletion (TIER 1.2)
4. Ocean Acidification (TIER 1.3)
5. Novel Entities (TIER 1.5)
6. Population Dynamics (TIER 1.6)
7. Refugee Crisis (TIER 1.6)
8. Nuclear Winter (TIER 1.7)
9. Famine System (TIER 1.7)
10. Radiation System (TIER 1.7) - **✅ Integration complete (Oct 14)**
11. Climate Impact Cascade (TIER 1.8) - **✅ Complete (Oct 29)**
12. Planetary Boundaries (TIER 3)
13. Information Ecology (TIER 4.4) - **✅ Complete (Dec 12, 2025)** - Misinformation epidemiology, trust erosion, polarization, shared reality, coordination capacity modulation

### 🟡 Partially Documented (2 systems)
1. Environmental Accumulation (covered in baseline-corrections.md)
2. Social Accumulation (covered in baseline-corrections.md)

### ⏳ Implemented But Undocumented (12+ systems)
1. Multipolar System (TIER 1.4)
2. Enhanced UBI (TIER 2)
3. Social Safety Nets (TIER 2)
4. Information Warfare (TIER 4)
5. Power Generation (TIER 4)
6. Quality of Life
7. Technological Risk
8. Breakthrough Technologies
9. Upward Spirals
10. Resource Economy
11. Extinction System
12. And more...

---

## Priority for Next Documentation

Based on integration with documented systems and user needs:

**HIGH PRIORITY:**
1. ~~**Nuclear Winter**~~ ✅ COMPLETE (Oct 14)
2. ~~**Famine System**~~ ✅ COMPLETE (Oct 14)
3. ~~**Planetary Boundaries**~~ ✅ COMPLETE (existing doc)
4. ~~**Refugee Crisis**~~ ✅ COMPLETE (existing doc)
5. ~~**Radiation System - Fix Integration**~~ ✅ COMPLETE (Oct 14 - RadiationSystemPhase implemented and integrated)

**MEDIUM PRIORITY:**
6. Quality of Life - Core QoL mechanics
7. Resource Economy - Food/water production
8. Technological Risk - AI safety framework
9. Breakthrough Technologies - Tech tree

**LOWER PRIORITY:**
9. UBI - Important but less critical for understanding model
10. Social Safety Nets - Supporting system
11. Information Warfare - Enrichment feature
12. Power Generation - Energy modeling

---

## Documentation Standards

Each wiki page should include:
1. **Overview** - Why this system is critical
2. **State Tracking** - Complete interface definitions
3. **Mechanics** - 5-8 detailed sections on core systems
4. **Breakthrough Technologies** - Solutions with costs, timelines, effects
5. **Research Validation** - Peer-reviewed sources (20-30+)
6. **Integration** - How systems interact
7. **Parameter Tuning** - Initial values, thresholds, rates
8. **Testing & Validation** - Monte Carlo results
9. **Code Structure** - File locations, key functions
10. **Future Enhancements** - Post-current-TIER work

---

## Contributing

To add or update documentation:
1. Read the source code (`src/simulation/*.ts` and `src/types/*.ts`)
2. Check planning docs (`plans/*.md`)
3. Follow the template from existing wiki pages
4. Include research citations
5. Document recent changes (check git history)
6. Update this INDEX.md

---

**Maintained by:** AI Assistant + User
**Repository:** [ai_game_theory_simulation](https://github.com/anthropics/ai_game_theory_simulation)
**Documentation Location:** `docs/wiki/systems/`
