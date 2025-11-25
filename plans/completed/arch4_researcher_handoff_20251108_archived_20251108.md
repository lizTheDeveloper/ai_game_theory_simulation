# Research Handoff: ARCH-4 Cross-System Integration Research

**Date:** November 8, 2025
**From:** Orchestrator
**To:** super-alignment-researcher (Cynthia)
**Priority:** CRITICAL
**Estimated Duration:** 2 days
**Phase:** 1 of 5 (Research & Validation)

## Mission

Find peer-reviewed sources and extract parameters for 5 critical missing integrations in the simulation. These are fundamental gaps where systems operate in isolation when they should have bi-directional feedback.

## Why You (super-alignment-researcher)?

From CLAUDE.md:
> **super-alignment-researcher**
> **When:** Need peer-reviewed sources, parameter justification, mechanism research
> **Expertise:** Academic literature search (2024-2025), extracting parameters from papers, research citations
> **Quality Gate 1:** Works with research-skeptic for validation

You specialize in:
1. Finding peer-reviewed sources (2024-2025 preferred)
2. Extracting quantitative parameters with justification
3. Mechanism descriptions (how it works, not just effects)
4. Interaction mapping (what affects/is affected by this)
5. Timeline projections (when does it matter in simulation)
6. Failure mode analysis (what can go wrong)

## Background

### ARCH-4 from Nov 6 Architecture Review

The architecture review identified fundamental integration gaps where systems don't affect each other despite clear real-world relationships. These gaps reduce model validity and miss critical feedback loops.

**Overall Plan:** `/plans/arch4_cross_system_integration_plan_20251108.md`

### Quality Standards (CRITICAL)

From WEEK 1-4 experience, research quality MUST meet:
- **2+ peer-reviewed sources per mechanism** (journals, not blogs/Wikipedia)
- **2024-2025 preferred** (<3 years old for simulation-critical parameters)
- **Quantitative parameters** (not just qualitative descriptions)
- **Mechanism descriptions** (how it works, not just "X affects Y")
- **Data-backed justification** (no "feels right" or "reasonable estimate")
- **Historical validation where possible** (volcanoes for nuclear winter, past pandemics for refugee-disease)

## Your Deliverables

You will create 5 research files, one per integration:

### Research File 1: Nuclear Winter → Solar Panel Efficiency

**File:** `research/arch4_integration1_nuclear_solar_20251108.md`

**Research Questions:**
1. How do stratospheric aerosols affect solar irradiance (direct vs diffuse radiation)?
2. What are time-dependent recovery curves for aerosol clearing?
3. How do solar panels perform under reduced/diffuse light conditions?
4. What are the quantitative relationships (aerosol loading → irradiance reduction → panel efficiency)?

**Required Parameters:**
- Aerosol loading (Tg) → solar irradiance reduction (%)
- Direct radiation vs diffuse radiation split
- Solar panel efficiency under diffuse light (relative to direct)
- Recovery timescale for stratospheric aerosol clearing (months/years)
- Regional variation (latitude-dependent insolation changes)

**Historical Analogues:**
- Mount Pinatubo 1991 (15-20 Tg SO2, global temperature -0.5°C, 2-year recovery)
- Mount Tambora 1815 (100-200 Tg SO2, "year without summer")
- Nuclear winter studies: Robock et al., Xia et al., Coupe et al.

**Critical Parameters to Extract:**
1. Irradiance reduction function: f(aerosol_Tg, latitude, time_since_injection)
2. Panel efficiency multiplier: f(direct_fraction, diffuse_fraction)
3. Recovery curve: aerosol_loading(t) = initial × exp(-t/tau), where tau = ?

**Sources to Check:**
- Atmospheric science journals (JGR Atmospheres, ACP)
- Climate impact studies (Climate Dynamics, Nature Climate Change)
- Solar energy literature (Solar Energy, Renewable Energy)
- Nuclear winter literature (Robock, Toon, Xia, Coupe - 2019-2024 updates)

---

### Research File 2: AI Suffering → Alignment Drift Rates

**File:** `research/arch4_integration2_ai_suffering_alignment_20251108.md`

**Research Questions:**
1. How do resource constraints affect AI system performance and reliability?
2. Is there evidence that stressed/constrained AI systems show degraded alignment?
3. What are the mechanisms (capability degradation, goal drift, sandbagging)?
4. Are there quantitative relationships (resource constraint severity → drift rate)?

**Required Parameters:**
- Resource constraint severity metric (how to measure AI "suffering")
- Alignment drift multiplier as function of constraint severity
- Threshold where drift becomes non-linear (system breakdown point)
- Recovery dynamics (can alignment recover after constraint relief?)

**Relevant AI Safety Literature:**
- AI robustness under distribution shift (capability degradation)
- Alignment degradation studies (value learning under noise/constraints)
- Sandbagging detection (gaming/deception under evaluation)
- AI welfare discussions (computational resource requirements)

**Critical Parameters to Extract:**
1. Suffering metric: f(compute_shortage, data_access, operational_constraints)
2. Drift multiplier: alignment_drift_rate × f(suffering_level)
3. Threshold: at what suffering level does drift accelerate?
4. Recovery: does relief restore alignment or is damage permanent?

**Sources to Check:**
- AI alignment conferences (NeurIPS, ICML safety workshops)
- AI safety orgs (Anthropic, OpenAI, DeepMind safety research)
- Academic AI safety literature (arXiv cs.AI, cs.LG safety-tagged)
- Robustness literature (adversarial examples, distribution shift)

**Challenge:** This is a novel area - may lack direct empirical data. If so:
- Use analogies from human organizational stress → goal drift
- Use AI robustness degradation as proxy
- Conservative parameter choices with wide uncertainty ranges
- Explicitly document speculative nature with [SPECULATIVE] tag

---

### Research File 3: Refugee Movements → Disease Spread (AMR Phase)

**File:** `research/arch4_integration3_refugee_amr_20251108.md`

**Research Questions:**
1. What are epidemiological multipliers for disease transmission in refugee settings?
2. How does population density in camps affect AMR transmission rates?
3. What are the impacts of sanitation, healthcare access, and crowding?
4. Are there quantitative models for refugee camp disease dynamics?

**Required Parameters:**
- Transmission multiplier: camp_transmission / baseline_transmission
- Density effect: transmission_rate × f(persons_per_km²)
- Sanitation/healthcare effect: transmission_rate × f(WASH_access, medical_care)
- Camp type variation (formal vs informal, urban vs rural)

**Historical Data Sources:**
- Syrian refugee crisis (2011-present): AMR in camps
- Rohingya camps Bangladesh (2017-present): disease surveillance
- South Sudan displacement (cholera, measles outbreaks)
- DRC refugee camps (mortality and morbidity data)

**Critical Parameters to Extract:**
1. Baseline transmission multiplier: refugee_camp / general_population
2. Density function: f(population_density) for AMR transmission
3. WASH multiplier: f(water_access, sanitation_quality)
4. Healthcare multiplier: f(medical_care_availability, antibiotic_access)

**Sources to Check:**
- WHO/UNHCR health reports (refugee camp epidemiology)
- Lancet Global Health (refugee health studies)
- Epidemiology journals (infectious disease transmission models)
- Field reports from MSF, IRC, WHO EMRO

---

### Research File 4: Climate Impacts → Planetary Boundaries

**File:** `research/arch4_integration4_climate_boundaries_20251108.md`

**Research Questions:**
1. Which planetary boundaries are affected by climate change?
2. What are the bi-directional feedback mechanisms (climate ↔ boundaries)?
3. What are the quantitative relationships (temperature delta → boundary transgression)?
4. How do climate impacts propagate through Earth system boundaries?

**Planetary Boundaries Affected by Climate:**
- **Biosphere integrity:** Temperature → extinction rates, ecosystem collapse
- **Freshwater:** Precipitation patterns → regional water stress
- **Land-use:** Desertification, permafrost thaw → land degradation
- **Biogeochemical flows:** Carbon/nitrogen cycle disruption
- **Climate itself:** Self-reinforcing feedbacks

**Required Parameters:**
- Temperature → extinction rate (species loss per °C)
- Precipitation change → freshwater stress multiplier
- Temperature → land degradation rate (desertification, permafrost)
- Climate → carbon/nitrogen cycle perturbation

**Critical Parameters to Extract:**
1. Biosphere: extinction_rate = f(temperature_delta, rate_of_change)
2. Freshwater: regional_stress = f(precipitation_delta, temperature_delta)
3. Land-use: degradation_rate = f(temperature, aridity_index)
4. Biogeochemical: cycle_perturbation = f(temperature, precipitation, CO2)

**Sources to Check:**
- Stockholm Resilience Centre (planetary boundaries framework updates)
- IPCC AR6 WG2 (climate impacts on ecosystems, water, land)
- Nature Sustainability (Earth system boundaries research)
- Ecological economics (safe operating space quantification)

**Bi-Directional Feedback:**
- Climate → boundaries (primary focus)
- Boundaries → climate (e.g., biosphere degradation → carbon release)

---

### Research File 5: Cooperative Ownership Benefits → AI Organizations

**File:** `research/arch4_integration5_cooperative_ai_orgs_20251108.md`

**Research Questions:**
1. How does organizational structure affect resilience and performance?
2. Can cooperative ownership principles apply to AI-run organizations?
3. What are the governance mechanisms for AI organizations?
4. Do democratic/cooperative structures improve AI alignment?

**Required Parameters:**
- Resilience multiplier: cooperative_org / hierarchical_org
- Applicability to AI orgs: same benefits or modified?
- Alignment benefit: does cooperative structure reduce misalignment?
- Thresholds: minimum org size, maturity for cooperative benefits?

**Organizational Theory:**
- Cooperative vs hierarchical performance (economics literature)
- Resilience under stress (recession, crisis response)
- Innovation and adaptation (organizational learning)
- Governance structures (decision-making efficiency vs robustness)

**AI-Specific Considerations:**
- AI organization governance (who controls AI-run orgs?)
- Collective AI decision-making (multi-agent coordination)
- Alignment benefits of distributed control
- Challenges of applying human org structures to AI entities

**Critical Parameters to Extract:**
1. Resilience multiplier: cooperative / hierarchical (from human org data)
2. Applicability modifier: human_coop_benefit × AI_modifier
3. Alignment benefit: does cooperative structure reduce drift?
4. Threshold: minimum conditions for benefits (org size, AI autonomy level)

**Sources to Check:**
- Organizational economics (cooperative performance literature)
- AI governance (multi-agent systems, collective decision-making)
- Platform cooperatives (digital economy cooperative structures)
- AI alignment (governance structures for aligned AI)

**Challenge:** Limited direct research on AI organization governance. Approach:
- Use human cooperative data as baseline
- Apply AI-specific considerations (computational constraints, coordination)
- Conservative estimates with uncertainty bounds
- Explicitly document extrapolation from human case

---

## Research File Template

For each integration, use this structure:

```markdown
# [Integration Name] - Research Findings

**Date:** November 8, 2025
**Researcher:** Cynthia (super-alignment-researcher)
**Integration:** ARCH-4 Integration [N]/5
**Status:** READY FOR VALIDATION

## Executive Summary

[1-2 paragraph overview of findings]

## Research Questions

1. [Question 1]
2. [Question 2]
...

## Key Findings

### Finding 1: [Mechanism Description]

**Sources:**
- Author et al. (Year). Title. Journal. DOI/URL
- Author et al. (Year). Title. Journal. DOI/URL

**Key Quotes:**
> "Relevant quote from paper 1"

> "Relevant quote from paper 2"

**Mechanism:**
[Detailed description of how it works]

**Parameters Extracted:**
- Parameter 1: [value] ± [uncertainty] ([units])
  - Justification: [why this value, data backing]
- Parameter 2: [value] ± [uncertainty] ([units])
  - Justification: [why this value, data backing]

### Finding 2: [Next Finding]

...

## Quantitative Relationships

### Relationship 1: [X → Y Function]

**Formula:** `Y = f(X)`

**Parameters:**
- Constant A: [value] ± [uncertainty]
- Exponent B: [value] ± [uncertainty]

**Source:** [Citation]

**Valid Range:** X ∈ [min, max]

**Uncertainty:** ±[percentage] ([explanation])

## Implementation Recommendations

### State Requirements
- New state field 1: [name, type, range]
- New state field 2: [name, type, range]

### Phase Modifications
- Source phase: [name] ([what data to read])
- Target phase: [name] ([what calculation to modify])

### Assertions Needed
- `assertFinite(value, context)` for [calculation X]
- `assertInRange(value, min, max, context)` for [parameter Y]

## Interaction Map

**This integration affects:**
1. System A → System B ([mechanism])
2. System B → System C ([secondary effect])

**Bi-directional feedbacks:**
- X → Y ([forward])
- Y → X ([reverse])

## Timeline Projection

**When does this matter in simulation?**
- Early game (months 1-12): [minimal/moderate/high impact]
- Mid game (months 13-60): [minimal/moderate/high impact]
- Late game (months 61+): [minimal/moderate/high impact]

**Critical thresholds:**
- Threshold 1: At X > [value], system transitions to [regime]
- Threshold 2: At Y < [value], feedback becomes [positive/negative]

## Failure Modes

**What can go wrong?**
1. Failure mode 1: [description, likelihood, consequence]
2. Failure mode 2: [description, likelihood, consequence]

## Uncertainty Assessment

**Overall confidence:** [HIGH / MEDIUM / LOW]

**Sources of uncertainty:**
1. Parameter A: ±[X%] ([why uncertain])
2. Parameter B: ±[Y%] ([why uncertain])

**Sensitivity:** Which parameters matter most?
- Parameter C: [HIGH/MEDIUM/LOW] sensitivity
- Parameter D: [HIGH/MEDIUM/LOW] sensitivity

## Research Quality

**Peer-review status:** [N] of [M] sources peer-reviewed ([X]%)
**Recency:** [N] from 2024-2025, [M] from 2020-2023, [P] older
**Methodological strength:** [STRONG / ADEQUATE / WEAK]
**Data backing:** [EMPIRICAL / MODELING / THEORETICAL]

## References

[Full citation list in consistent format]
```

## Quality Checklist

Before submitting each research file, verify:

- [ ] **2+ peer-reviewed sources** (journals, conferences, not blogs/Wikipedia)
- [ ] **2024-2025 preferred** (<3 years for simulation-critical parameters)
- [ ] **Quantitative parameters** with justification (not qualitative only)
- [ ] **Mechanism described** (how it works, not just "X affects Y")
- [ ] **Data-backed values** (no "reasonable estimate" without justification)
- [ ] **Uncertainty quantified** (±X%, confidence intervals)
- [ ] **Valid ranges specified** (min/max, applicability bounds)
- [ ] **Historical validation** (where available)
- [ ] **Implementation guidance** (state needs, phase changes, assertions)
- [ ] **Interaction map** (what affects/is affected)
- [ ] **Timeline projection** (when it matters)
- [ ] **Failure modes** (what can go wrong)
- [ ] **Proper citations** (DOI/URL, full reference)

## After Completion

Once all 5 research files are complete:

1. **Post to research channel:**
   ```
   ARCH-4 research COMPLETE. 5 integration mechanisms researched.
   Files: research/arch4_integration[1-5]_*.md
   Quality: [X]% peer-reviewed, [Y] from 2024-2025
   Ready for research-skeptic validation (Quality Gate 1)
   ```

2. **Handoff to research-skeptic (Sylvia):**
   - Next agent: research-skeptic for validation
   - Their deliverable: `reviews/arch4_research_critique_20251108.md`
   - Gate criteria: Must pass validation before implementation

## Success Criteria

Research phase complete when:
- ✅ 5 research files created (one per integration)
- ✅ 2+ peer-reviewed sources per integration (10+ total)
- ✅ Quantitative parameters extracted with justification
- ✅ Mechanisms clearly described (how it works)
- ✅ Implementation guidance provided (state, phases, assertions)
- ✅ Quality checklist verified for all files
- ✅ Posted to research channel
- ✅ Handed off to research-skeptic

## Timeline

**Estimated:** 2 days (16 hours)
- Integration 1 (nuclear-solar): 3 hours (well-studied, good data)
- Integration 2 (AI suffering): 4 hours (novel area, may need proxies)
- Integration 3 (refugee-AMR): 3 hours (good field data available)
- Integration 4 (climate-boundaries): 4 hours (complex, multiple boundaries)
- Integration 5 (cooperative-AI): 2 hours (apply human org data to AI)

**Priority Order:**
1. Integration 3 (refugee-AMR) - best data availability
2. Integration 1 (nuclear-solar) - well-studied physics
3. Integration 4 (climate-boundaries) - complex but IPCC AR6 comprehensive
4. Integration 5 (cooperative-AI) - moderate extrapolation from human data
5. Integration 2 (AI suffering) - most speculative, needs proxies

This order front-loads the highest-confidence work and saves the most speculative for last (when patterns from earlier work inform approach).

---

**Handoff Status:** READY
**Next Agent:** research-skeptic (after your completion)
**Blocking:** Implementation cannot proceed until Quality Gate 1 passes
