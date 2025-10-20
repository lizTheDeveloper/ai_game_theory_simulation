# Master Research Roadmap: Multiple Paradigms Dystopia-Utopia Index

**Created:** 2025-10-19
**Status:** ACTIVE RESEARCH
**Estimated Effort:** 60-90 hours (research + implementation)
**Priority:** MEDIUM (after post-recalibration fixes complete)

## Vision

Model dystopia/utopia through **four distinct paradigmatic lenses**, showing fundamental value conflicts rather than false universal consensus. Each paradigm defines different success criteria, creating multi-dimensional outcome space.

## Research Foundation (Already Available)

### From `/research/welfare_quality_of_life_frameworks_20251019.md`:
- HDI (193 countries) - Western development model
- Social Progress Index (170 countries) - Needs-focused
- Planetary boundaries (Richardson 2023) - Ecological limits
- V-Dem (202 countries) - Democratic governance
- OECD How's Life (38 countries) - Quality of life

### From `/reviews/dystopia_utopia_index_critique_20251019.md`:
- Sen (1999) - Capability approach, cultural relativism
- Bhutan GNH - Non-Western happiness framework
- Indigenous perspectives (Whyte 2017) - Harmony with nature
- Buen Vivir (Latin America) - Community solidarity

## Four Paradigms Framework

### Paradigm 1: Western Liberal (Freedom-Focused)
**Core Value:** Individual autonomy, political rights, economic freedom
**Utopia Criteria:** High personal freedom, democracy, property rights, innovation
**Dystopia Triggers:** Authoritarianism, surveillance, economic control
**Research Gaps:**
- [ ] Freedom House methodology critique (Kelley & Simmons 2015 - 0.89 correlation with GDP)
- [ ] Privacy International indices (surveillance capitalism)
- [ ] Economic freedom indices (Heritage, Fraser)
- [ ] Civil liberties vs security trade-offs

### Paradigm 2: Development Needs (Survival-Focused)
**Core Value:** Basic needs fulfillment, health, material security
**Utopia Criteria:** Zero poverty, universal healthcare, food security
**Dystopia Triggers:** Preventable deaths, malnutrition, lack of shelter
**Research Gaps:**
- [ ] Multidimensional Poverty Index (Alkire 2024) - dual cutoff methodology
- [ ] IPC food crisis phases (FAO 2024)
- [ ] WHO essential health services
- [ ] Sen's entitlement theory vs Malthusian scarcity

### Paradigm 3: Ecological Harmony (Sustainability-Focused)
**Core Value:** Planetary boundaries, biodiversity, intergenerational justice
**Utopia Criteria:** All 9 boundaries safe, regenerative economy, zero extinction
**Dystopia Triggers:** Boundary transgression, ecosystem collapse, climate chaos
**Research Gaps:**
- [ ] Raworth Doughnut Economics (social floor + ecological ceiling)
- [ ] Ecological footprint vs biocapacity (Global Footprint Network)
- [ ] IPBES biodiversity assessment (2019) - driver decomposition
- [ ] Steffen et al. (2015) planetary boundaries update

### Paradigm 4: Indigenous/Communitarian (Harmony-Focused)
**Core Value:** Community solidarity, cultural preservation, spiritual wellbeing
**Utopia Criteria:** Strong social bonds, cultural continuity, collective purpose
**Dystopia Triggers:** Atomization, cultural genocide, meaninglessness
**Research Gaps:**
- [ ] Buen Vivir constitutional frameworks (Ecuador, Bolivia)
- [ ] Indigenous knowledge systems (Whyte 2017)
- [ ] Social cohesion indices (Putnam, social capital)
- [ ] Graeber (2018) bullshit jobs - meaning crisis

## Research Phases

### Phase 1: Paradigm Definition (15-20h)
**Deliverable:** 4 research documents defining each paradigm's ontology

**Research Questions per Paradigm:**
1. What constitutes utopia? (Operational criteria, thresholds)
2. What constitutes dystopia? (Failure modes, red lines)
3. Which metrics are privileged? (What counts as evidence)
4. What trade-offs are acceptable? (Freedom vs security, growth vs sustainability)
5. Historical exemplars? (Countries/periods embodying this paradigm)
6. Known contradictions? (Internal tensions, impossible demands)

**Sources Needed:**
- Western: Rawls, Nozick, Hayek, Sen (liberalism spectrum)
- Development: Amartya Sen, Martha Nussbaum, Jeffrey Sachs
- Ecological: Kate Raworth, Johan Rockström, Donella Meadows
- Indigenous: Kyle Whyte, Linda Tuhiwai Smith, Vandana Shiva

### Phase 2: Metric Mapping (10-15h)
**Deliverable:** Crosswalk table showing how each paradigm measures success

**Example Conflicts to Document:**
- Singapore: Western dystopia (low freedom), Development utopia (high HDI)
- Cuba: Western dystopia (authoritarianism), Development success (health/education)
- Bhutan: Development failure (low GDP), Indigenous success (GNH)
- Norway: Western/Development utopia, Ecological dystopia (oil exporter)

**Research Tasks:**
- [ ] Map 50+ indicators to paradigm relevance (critical/important/irrelevant/negative)
- [ ] Identify zero-sum conflicts (one paradigm's utopia = another's dystopia)
- [ ] Document measurement biases (which paradigms lack data infrastructure)
- [ ] Find empirical cases of paradigm divergence

### Phase 3: Implementation Design (8-12h) ✅ COMPLETE

**Status:** 100% Complete (October 20, 2025)
**Actual Effort:** ~6 hours
**Deliverables:** 1,576 lines of production code + tests

**Completed Sub-Phases:**
- ✅ 3.1: State Structure Design (`/src/types/multiParadigmDUI.ts`, ~350 lines)
- ✅ 3.2: Geometric Mean Implementation (`/src/simulation/utils/geometricMean.ts`, ~210 lines)
- ✅ 3.3: Air Quality Indicator (`/src/simulation/airQuality.ts`, ~350 lines)
- ✅ 3.4: Indigenous Paradigm Derivation (`/src/simulation/indigenousParadigm.ts`, ~466 lines)
- ✅ Test Suite (`/tests/indigenousParadigm.test.ts`, 6 tests, all passing)

**Key Innovations:**

1. **3-Tier Architecture:**
   - Tier 1: Simulation Foundation (existing mechanics)
   - Tier 2A: High-Confidence Paradigms (Western, Development, Ecological) - drive + report
   - Tier 2B: Reporting-Only Paradigms (Indigenous) - report only, advocacy tool

2. **Geometric Mean Aggregation:**
   - Non-compensatory: prevents "elite utopia" masking deficits
   - MIN_FLOOR = 0.1: prevents zero-handling breakdown
   - Test cases: [90,85,10,75] → 45.6 (deficit pulls down)

3. **Air Quality (PM2.5):**
   - Fixed critical omission (7M deaths/year)
   - 13th Ecological paradigm indicator
   - WHO exposure-response function, health/economic impacts

4. **Indigenous 3-Tier Data Strategy:**
   - DIRECT (Bhutan GNH): HIGH confidence, 1 country
   - PROXY (WVS): MEDIUM confidence, 80 countries
   - DERIVED (simulation): LOW confidence, 115 countries
   - Advocacy: Makes visible 0.5% vs 100% coverage gap

**Design Decisions:**
- ✅ How to aggregate within paradigm? → Geometric mean (UNDP HDI methodology)
- ✅ How to weight paradigms globally? → Don't aggregate across paradigms (preserve conflicts)
- ✅ Can ecological paradigm veto others? → Not yet (Phase 5 integration question)
- ✅ How to model paradigm shift? → Country-level tracking (Phase 5)

**Documentation:**
- `/devlogs/phase3-implementation-design-complete_20251020.md` (complete summary)

**Next:** Phase 4 - Data Pipeline (10-12h)

### Phase 4: Validation Research (12-18h)
**Deliverable:** Historical calibration showing paradigm predictions

**Validation Cases:**
- [ ] USSR collapse (1991): Western predicted, Development shocked
- [ ] Singapore rise (1965-2000): Western concerned, Development celebrated
- [ ] Bhutan GNH (1972-present): Development puzzled, Indigenous affirmed
- [ ] Nordic model (1950-present): Can all paradigms agree?
- [ ] Venezuela collapse (2014-present): Development failure, but which paradigm explains?

**Research Tasks:**
- [ ] Find longitudinal data 1950-2025 for test cases
- [ ] Compare paradigm predictions to actual trajectories
- [ ] Identify which paradigms have predictive power for collapse
- [ ] Document cases where paradigms converge vs diverge

### Phase 5: Integration (15-20h)
**Deliverable:** Working multi-paradigm DUI in simulation

**Implementation Phases:**
- 5A: State types and initialization (3-4h)
- 5B: Western paradigm metrics (3-4h)
- 5C: Development paradigm metrics (3-4h)
- 5D: Ecological paradigm metrics (3-4h)
- 5E: Indigenous paradigm metrics (3-4h)
- 5F: Divergence tracking and visualization (2-3h)

**Validation:**
- Monte Carlo N=100, 240mo
- Check all four paradigms can achieve "utopia" in some runs
- Verify paradigm conflicts emerge (Western + Ecological tension)
- Measure divergence over time (do paradigms converge or diverge?)

## Success Criteria

**Minimal Success:**
- [ ] Four paradigms operationally defined with research backing
- [ ] Each paradigm has 5-10 core metrics
- [ ] Can identify paradigm conflicts in simulation outcomes
- [ ] Historical validation shows predictive divergence

**Full Success:**
- [ ] Paradigm-specific utopia/dystopia classification
- [ ] Divergence metrics show value conflicts
- [ ] Country-level paradigm alignment tracking
- [ ] Can answer: "Utopia for whom? By which values?"

**Stretch Goals:**
- [ ] Paradigm shift mechanics (countries change value systems)
- [ ] AI alignment to paradigms (AIs embody different values)
- [ ] Civilizational attractors (which paradigms are stable?)

## Dependencies

**Blockers:**
- Post-recalibration fixes must complete first (Week 1-3)
- Minimal Suffering Indicators (Option A) provides baseline

**Enables:**
- Rich outcome classification beyond binary utopia/dystopia
- Cultural variation in AI alignment (different societies want different AI)
- Realistic modeling of value conflicts in global governance

## Research Questions to Answer

1. **Can paradigms be operationalized without Western bias?** (Risk: We impose liberal framework even on "indigenous" paradigm)

2. **What happens when paradigms fundamentally conflict?** (Ecological sustainability vs development growth - can't both win)

3. **Do paradigms converge or diverge under AI superintelligence?** (Does AGI force value convergence or enable pluralism?)

4. **Which paradigms are stable attractors?** (Some values self-reinforce, others collapse)

5. **Can simulation handle multiple "success" states?** (Current code assumes single utopia definition)

## Timeline

**Phase 1-2 (Research):** 25-35 hours
**Phase 3-4 (Design + Validation):** 20-30 hours
**Phase 5 (Implementation):** 15-20 hours
**Total:** 60-85 hours (~2-3 weeks full-time)

## Next Steps

1. **Immediate:** Review this roadmap, adjust scope
2. **Week 1:** Begin Phase 1 (Paradigm Definition research)
3. **Week 2:** Phase 2 (Metric Mapping) + Phase 3 (Design)
4. **Week 3:** Phase 4 (Validation) + Phase 5A (Implementation start)

---

**Status:** ROADMAP COMPLETE - Ready for research phase to begin
**Coordination:** Super-alignment-researcher for research, Research-skeptic for validation, Feature-implementer for Phase 5
