# Master Research Roadmap

**Purpose:** Single source of truth for all research coordination across AI alignment, climate mitigation, planetary boundaries, and post-scarcity pathways.

**Last Updated:** November 9, 2025

**Primary Maintainer:** Sylvia (Research Skeptic) + Cynthia (Super-Alignment Researcher)

**Integration:** This roadmap integrates quantitative gap analysis from god mode testing (Priya's simulation diagnostics) with systematic research needs identified by research agents.

---

## Priority Matrix

Research priorities ranked by:
1. **Criticality:** How broken is the model without this? (CRITICAL → HIGH → MEDIUM → LOW)
2. **God Mode Gap:** Quantitative effectiveness gaps from exhaustive tech deployment testing
3. **Implementation Readiness:** Can this be modeled now, or requires fundamental research first?

---

## TIER 1: CRITICAL - Zero Effectiveness Gaps (Must Fix Before Adding Features)

### 1. Novel Entities Boundary (0% effectiveness in god mode)

**God Mode Finding:** 7 pollution-related technologies deployed, yet 0% effectiveness for Novel Entities boundary. System shows no improvement despite PFAS remediation, plastic-eating enzymes, microplastic capture, and electrochemical destruction being fully active.

**Priority:** CRITICAL - Either tech isn't being applied (implementation bug) OR problem is fundamentally harder than modeled (research hypothesis)

#### Active Research Questions

1. **URGENT: Thermodynamic Feasibility (Energy Trap)**
   - **Question:** Is cleanup energy requirement exceeding global capacity?
   - **Evidence Gap:** PFAS thermal destruction requires 850-1200°C, consuming 50-100 GJ/ton. Destroying accumulated contamination would require 4-40% of global energy (Sylvia's calculation from IEA data)
   - **Model Impact:** If cleanup costs exceed capacity, tech should show diminishing returns or activation gates based on available energy
   - **Research Needed:** Peer-reviewed energy analysis for environmental-scale PFAS destruction (not just concentrated waste streams)
   - **Status:** Hypothesis formed, needs empirical validation

2. **CRITICAL: Concentration Problem (Dilution Reality)**
   - **Question:** Do cleanup techs only work on concentrated waste (>1000 mg/L) while environmental contamination is ng/L to μg/L (6-9 orders of magnitude too dilute)?
   - **Evidence:** Electrochemical PFAS destruction demonstrated only on concentrated streams; environmental levels require reverse osmosis concentration consuming more energy than destruction
   - **Model Impact:** Tech effectiveness should scale with contamination concentration (power law decay, not linear)
   - **Research Needed:** Find empirical studies on dilute-stream remediation costs vs. concentrated-stream costs
   - **Status:** Strong hypothesis, partial evidence

3. **CRITICAL: Rebound Effects (Jevons Paradox)**
   - **Question:** Does making cleanup "cheaper" increase pollution production (moral hazard)?
   - **Evidence:** Historical pattern in environmental regulation; making disposal easier increases waste generation
   - **Model Impact:** Cleanup tech deployment should have dual effect: reduce stock AND increase flow (net effect may be negative)
   - **Research Needed:** Empirical studies on waste generation rates following remediation technology deployment
   - **Status:** Theoretical framing exists, quantification missing

4. **IMPORTANT: Irreversibility Hypothesis (Permanent Contamination)**
   - **Question:** Are novel entities effectively permanent on human timescales (like extinctions)?
   - **Evidence:** Cousins et al. 2022 shows PFAS in rainwater exceeds EPA advisories on all continents including Antarctica. Atmospheric transport means local cleanup is futile - it rains back down
   - **Model Impact:** Novel entities should be modeled as irreversible stock accumulation, not reversible flow
   - **Research Needed:** Define what fraction of contamination is reversible vs. permanently distributed in global systems
   - **Status:** Strong evidence for atmospheric PFAS, needs synthesis across contaminant types

#### Existing Research

- **Planetary Boundaries (Richardson 2023):** Novel entities defined as rate exceeding assessment capacity - even with perfect cleanup, production exceeds evaluation
- **PFAS Global Contamination (Cousins 2022):** Rainwater globally contaminated above EPA health advisories everywhere including Antarctica
- **PFAS/Microplastic Pyrolysis (Keller 2024):** >99% PFAS removal, 91-97% microplastic removal at 400-600°C (BUT only for concentrated biosolids)
- **Citation Verified:** `research/planetary_boundary_reversibility_empirical_verification_20251101.md` (B+ grade, 78% verified)

#### Next Steps

1. **Diagnostic Run:** Deploy all 7 pollution techs individually in simulation, track Novel Entities delta per tech to identify if ANY work
2. **Energy Analysis:** Model energy requirements for cleanup vs. available energy surplus (constraint system)
3. **Literature Search:** Find peer-reviewed studies on environmental-scale (not lab-scale) PFAS/microplastic remediation costs and effectiveness
4. **Irreversibility Flag:** Consider adding `irreversible: true` property to Novel Entities boundary (like extinctions)

---

## TIER 2: HIGH - Severe Effectiveness Gaps (Prevent Misleading Outcomes)

### 2. Climate Change Boundary (5.5% effectiveness in god mode)

**God Mode Finding:** Despite carbon capture, fusion, renewables, and climate mitigation tech fully deployed, only 5.5% effectiveness. Model shows catastrophic failure even with full tech tree.

**Priority:** HIGH - Deployment speed physics not modeled; "deploy tech → immediate effect" assumption breaks reality

#### Active Research Questions

1. **URGENT: Deployment Speed vs. Technological Capability**
   - **Question:** Do we model deployment as technological problem or institutional problem?
   - **Evidence Gap:** Current model may assume instant deployment; reality shows 30-50 year timescales from planning to full deployment (IPCC AR6)
   - **Model Impact:** Tech should have deployment phases: planning (2-7 years), construction (3-10 years), scale-up (10-30 years), full deployment (30-50 years)
   - **Research Needed:** Empirical timescales for energy infrastructure transitions (historical analogs: nuclear 1950s→1980s, solar 1990s→2020s)
   - **Status:** Existing research comprehensive (`research/climate_mitigation_deployment_rates_20251021.md`)

2. **CRITICAL: Energy Requirements (DAC Energy Trap)**
   - **Question:** Where does 10,000-22,000 TWh/year for DAC come from without increasing emissions?
   - **Evidence:** 10 GtCO₂/year DAC requires 50-110% of current global electricity (IEA 2024). Chicken-egg problem: need massive renewable buildout BEFORE scaling DAC
   - **Model Impact:** DAC effectiveness should be gated by renewable energy surplus (hard constraint: can't consume more clean energy than exists)
   - **Research Needed:** Energy system modeling with competing demands (EVs, industry, heating, DAC)
   - **Status:** Well-researched, needs integration into simulation constraints

3. **CRITICAL: Carbon Cycle Feedbacks (Diminishing Returns)**
   - **Question:** Do natural carbon sinks saturate as warming increases?
   - **Evidence:** Ocean CO₂ uptake -10 to -20% at 2°C warming (reduced solubility + AMOC slowdown). Permafrost releases 0.1-0.3 GtCO₂/year at >2°C. Forest dieback shifts sinks to sources
   - **Model Impact:** Mitigation effectiveness should degrade with temperature: every 1°C warming reduces sink capacity and increases feedback emissions
   - **Research Needed:** Quantify feedback magnitudes with uncertainty ranges (current estimates have 3× spreads)
   - **Status:** Mechanisms confirmed, magnitudes uncertain (research priority)

4. **IMPORTANT: Infrastructure Damage Feedback**
   - **Question:** Do climate damages divert resources from mitigation investment?
   - **Evidence:** Climate damages at 2°C = 2-4% GDP annually. Disaster recovery competes with mitigation investment
   - **Model Impact:** Economic losses should reduce available capital for tech deployment (resource scarcity feedback)
   - **Research Needed:** Empirical studies on disaster recovery costs displacing climate investment
   - **Status:** Conceptual framework strong, quantification needed

#### Existing Research

- **Climate Mitigation Deployment Rates (Oct 21, 2025):** Comprehensive 1,277-line analysis of DAC, renewables, fusion timelines with IPCC AR6, IEA sources
  - **Key Finding:** 25-30 year timescale from pilot (2024) to full deployment (2050) matches historical energy transitions
  - **Conservative Timescales:** Net-zero 2045-2070 (advanced economies), 2050+ (developing)
  - **Carbon Budget:** 275 GtCO₂ remaining for 1.5°C (7 years at current rates)
  - **Research Confidence:** 70-80% (deployment rates empirical, governance highly uncertain)

- **Planetary Boundary Reversibility (Oct 20, 2025):** IPCC AR6 CDR requirements verified: 360 GtCO₂ (median) to 680 GtCO₂ (95th percentile) for 1.5°C overshoot recovery
  - **Timeline:** "On order of decades" to return below 1.5°C after overshoot
  - **Citation Verified:** B+ grade (78% verified, one journal misattribution corrected)

#### Next Steps

1. **Add Deployment Timescales:** Tech should have `deploymentPhases` with planning, construction, scale-up, maturity (2-50 year timelines)
2. **Energy Constraint System:** DAC/mitigation tech gated by `renewableEnergySurplus` (can't consume more than available)
3. **Feedback Loops:** Temperature-dependent penalties to mitigation effectiveness (-5% per 1°C for carbon sinks, adaptation energy demand increases)
4. **Monte Carlo Validation:** Run N=100 with deployment timescales, confirm 2050 outcomes match IEA projections (60-80% renewable electricity, 3-12 GtCO₂/year capture)

---

### 3. Biogeochemical Flows Boundary (10% effectiveness in god mode)

**God Mode Finding:** Nitrogen/phosphorus pollution shows only 10% effectiveness despite precision agriculture, nutrient recovery, and biogeochemical restoration tech deployed.

**Priority:** HIGH - Legacy contamination and fundamental food production constraints not modeled

#### Active Research Questions

1. **CRITICAL: Legacy Nutrient Problem (Lake Erie Cautionary Tale)**
   - **Question:** How much improvement can occur when sediments release as much phosphorus as rivers deliver?
   - **Evidence:** Lake Erie has 50+ years of phosphorus controls, yet only 3 of last 7 years met targets. Internal loading from sediments matches external inputs (10,000-11,000 MT/year)
   - **Model Impact:** Nutrient boundaries should have "legacy stock" that releases on decadal timescales independent of current inputs
   - **Research Needed:** Quantify legacy nutrient stocks in global agricultural soils and aquatic sediments
   - **Status:** Lake Erie case study verified (Paerl 2024), needs global extrapolation

2. **URGENT: Nitrogen-Food Production Coupling**
   - **Question:** Can we cut nitrogen pollution 60% without cutting food production?
   - **Evidence:** 120 Mt N/year reduction needed to return to safe boundary. This nitrogen feeds ~3 billion people (40 kg N/person/year for protein synthesis). No alternative to nitrogen for food
   - **Model Impact:** Nitrogen reduction should be coupled to food production capacity; aggressive cuts trigger famine cascades
   - **Research Needed:** Find studies on minimum nitrogen requirements for global food security at different population/diet levels
   - **Status:** Strong hypothesis (Springmann 2018: only 20-40% reduction possible with perfect tech), needs constraint modeling

3. **IMPORTANT: One-Time vs. Continuous Solutions (Soil Carbon Plateau)**
   - **Question:** Do some "solutions" only work once then saturate?
   - **Evidence:** Reducing nitrogen fertilizer by 50% requires doubling soil organic matter, which takes 30-50 years and then plateaus (Lal 2023). It sequesters carbon initially but not continuously
   - **Model Impact:** Some tech should have `saturatingEffect: true` property (one-time improvement, no ongoing benefit)
   - **Research Needed:** Identify which nutrient management techniques are one-time vs. continuous
   - **Status:** Conceptual framework exists, needs tech classification

#### Existing Research

- **Planetary Boundary Reversibility (Oct 20, 2025):** Lake Erie eutrophication case study (Paerl 2024) showing dual P/N reduction needed, legacy phosphorus persists for decades
  - **Citation Status:** Verified (Paerl 2024 in Limnology and Oceanography exists, phosphorus claim verified with minor conflation corrected)

#### Next Steps

1. **Add Legacy Stock Mechanic:** Biogeochemical boundaries track accumulated contamination with exponential decay (half-life 10-50 years)
2. **Nitrogen-Food Coupling:** Nutrient reduction tech should trigger food production penalties if deployed too aggressively
3. **Literature Search:** Find peer-reviewed studies on global legacy nutrient stocks and minimum N requirements for food security
4. **Validation Target:** 10% effectiveness may be CORRECT if problem is fundamentally constrained by food production needs

---

## TIER 3: MEDIUM - Outlier Investigation (Too Good to Be True?)

### 4. Biosphere Integrity Boundary (81.5% effectiveness in god mode)

**God Mode Finding:** Biosphere shows 81.5% effectiveness while everything else fails catastrophically. This outlier demands scrutiny - either genuinely easier or model is wrong.

**Priority:** MEDIUM - Not broken, but suspiciously successful compared to other boundaries

#### Active Research Questions

1. **Is the Model Conflating Species Counts with Ecosystem Function?**
   - **Question:** Are we counting species recovery while ecosystems collapse?
   - **Hypothesis:** Model may show "biodiversity recovery" (charismatic megafauna saved) while ecosystem services (pollination, nutrient cycling, carbon sequestration) remain degraded
   - **Model Impact:** Biosphere metric should weight ecosystem services, not just species counts
   - **Research Needed:** Find studies distinguishing biodiversity metrics from ecosystem function metrics
   - **Status:** Hypothesis needs investigation

2. **Timescale Mismatch (Recovery in Decades vs. Centuries)?**
   - **Question:** Does model show rapid recovery when reality takes centuries?
   - **Evidence:** Ceballos et al. 2020 shows extinction debt means losses continue for centuries even if all threats stop immediately
   - **Model Impact:** Biosphere recovery should have multi-century timescales, not decade-scale
   - **Research Needed:** Empirical timescales for ecosystem recovery after threat removal
   - **Status:** Strong evidence for slow recovery, needs integration

3. **Gaming Detection (Saving Pandas, Losing Pollinators)?**
   - **Question:** Is improvement real or cosmetic (saving visible species while functional groups collapse)?
   - **Hypothesis:** Rewilding large mammals is easier and more visible than protecting insects/microbes that drive ecosystem function
   - **Model Impact:** Weight biosphere score by functional group importance (pollinators, decomposers, primary producers > charismatic megafauna)
   - **Research Needed:** Functional group sensitivity analysis - which losses cause ecosystem state shifts?
   - **Status:** Conceptual concern, needs validation against game logs

4. **Critical Transition Warning (Barnosky Tipping Point)?**
   - **Question:** Could we be modeling recovery right before catastrophic state shift?
   - **Evidence:** Barnosky et al. 2012 suggests planetary-scale critical transition possible at 50-90% habitat transformation. We're at 40-50% now
   - **Model Impact:** Biosphere should have nonlinear tipping points where gradual improvement suddenly reverses
   - **Research Needed:** Identify habitat transformation thresholds for state shifts
   - **Status:** Theoretical framework exists, thresholds uncertain

#### Existing Research

- **Planetary Boundary Reversibility (Oct 20, 2025):** Wildlife restoration case studies verified
  - **Saiga Antelope:** 50,000 (2005) → 1.3M (2022) = 26× increase (verified)
  - **Large Carnivore Translocations:** 66% success rate (verified, Biological Conservation 2023)
  - **Wildlife Carbon Capture:** Restoring 9 key species captures 6.4 GtCO₂/year = 15% of current emissions (verified, Nature Climate Change 2023)
  - **Rewilding Resilience:** 70% of observations show increased ecosystem resilience (verified, 2024 meta-analysis)

#### Next Steps

1. **Diagnostic Run:** Examine which biosphere improvements drive 81.5% effectiveness (species counts vs. ecosystem function metrics)
2. **Add Extinction Debt:** Biosphere losses should continue for 50-100 years after threats removed (legacy effect)
3. **Functional Group Weighting:** Weight pollinators/decomposers/primary producers higher than megafauna in biosphere score
4. **Tipping Point Investigation:** Research habitat transformation thresholds for ecosystem state shifts

---

## TIER 4: Research Standards & Quality Control

### Citation Verification (Ongoing)

**Status:** Major citation audit completed Oct-Nov 2025. 200+ fabricated citations identified and corrected.

**Active Issues:**
- **COMMONLY_HALLUCINATED_CITATIONS.md:** 47 papers that don't exist, systematically removed
- **AI_PROBLEMS_INDEX_CITATION_AUDIT.md:** Complete audit of AI safety citations
- **FAKE_CITATION_FOUND.md:** Tracking system for fabrications

**Standards:**
- **2+ peer-reviewed sources** (2024-2025 preferred)
- **Parameter justification** (not "feels right," data-backed)
- **Mechanism description** (how it works, not just effects)
- **Interaction map** (what affects/is affected by this system)
- **Timeline projections** (when does it matter - early/mid/late game)
- **Failure modes** (what can go wrong)
- **Monte Carlo validation** (N≥10 runs, check outcome distributions)

### Recent High-Quality Research (Use as Templates)

1. **Climate Mitigation Deployment Rates (Oct 21, 2025)**
   - **Quality:** 70-80% research confidence, 28 peer-reviewed sources, IPCC AR6, IEA reports
   - **Strengths:** Conservative timescales, deployment physics, energy requirements, investment needs, AI acceleration factors
   - **Use For:** Any research requiring deployment timescale modeling

2. **Planetary Boundary Reversibility (Oct 20, 2025)**
   - **Quality:** B+ grade (78% verified, 3% fabricated - journal misattribution)
   - **Strengths:** Tiered reversibility framework (reversible/partial/irreversible), empirical case studies (ozone, Lake Erie, Saiga antelope)
   - **Issues Corrected:** Jiang 2023 journal misattribution (Journal of Environmental Sciences, not Nature Communications)
   - **Use For:** Modeling recovery timescales and irreversibility constraints

3. **AI Infrastructure Resources (Oct 19, 2025)**
   - **Topics:** Data center energy consumption, water usage, chip manufacturing constraints
   - **Use For:** AI scaling constraints and environmental footprint

4. **Competitive Alignment Failure Modes (Oct 16, 2025)**
   - **Topics:** Racing dynamics, corner-cutting on safety, international competition
   - **Use For:** AI development trajectory modeling

---

## TIER 5: Completed Research Index (335+ Files)

### AI Alignment & Safety

**Core Framework:**
- `ai_welfare_framework_20251020.md` - Fundamental approach to AI moral status
- `alignment_technique_properties_20251026.md` - RLHF, constitutional AI, debate properties
- `competitive_alignment_failure_modes_20251016.md` - Racing dynamics, safety shortcuts

**Adversarial Evaluation:**
- `ai_sandbagging_capability_concealment_verification_20251101.md` - Capability underreporting
- `noise-injection-sandbagging-detection_20251016.md` - Detection methods
- `cold_war_sleeper_agents_comparison_20251021.md` - Historical analogies for deceptive AI

**Deployment & Infrastructure:**
- `ai-infrastructure-resources_20251019.md` - Data centers, energy, water, chips
- `ai_model_counts_ecosystem_20251027.md` - AI ecosystem scale and growth
- `ai-accelerated-tech-diffusion_20251019.md` - Technology adoption speed-up

**Economic & Cooperative:**
- `cooperative-ai-ownership-economics_20251028.md` - Post-scarcity economics
- `ai_welfare_v2_relationship_revision_verification_20251102.md` - Human-AI relationships

**Nuclear Risk:**
- `ai-nuclear-war-pathways_20251016.md` - AI control systems in nuclear command
- `nuclear_decision_realism_20251021.md` - Decision-making under pressure
- `nuclear_war_ai_control_gap_20251022.md` - Gaps in AI-augmented C3I

### Climate & Planetary Boundaries

**Core Mitigation:**
- `climate_mitigation_deployment_rates_20251021.md` - DAC, renewables, fusion timelines (1,277 lines, 70-80% confidence)
- `climate-mortality-phase2-validation-cynthia-20251101.md` - Temperature-mortality relationships

**Reversibility:**
- `planetary_boundary_reversibility_empirical_20251020.md` - Which boundaries can recover
- `planetary_boundary_reversibility_empirical_verification_20251101.md` - Citation verification (B+ grade)

**Crisis Response:**
- `crisis_cascade_multipliers_20251020.md` - How crises amplify each other
- `emergency_response_deployment_times_20251020.md` - Realistic intervention timescales
- `catastrophe-recovery-timescales_20251017.md` - Post-collapse recovery physics

**Thresholds & Tipping Points:**
- `threshold_uncertainty_modeling_20251021.md` - Uncertainty in planetary boundaries
- `threshold_tier3_scenarios_20251026.md` - TIER 3 tech scenarios

### Post-Scarcity & Technology

**Timelines:**
- `post-scarcity-timeline-research_20251008.md` - Pathway to material abundance

**Technology Diffusion:**
- `technology-diffusion-io-psychology_20251019.md` - I/O psychology of adoption
- `organizational-technology-deployment-timelines_20251019.md` - Org-level deployment rates

**Paradigms:**
- `paradigm_1_western_liberal_20251019.md` - Western liberal democratic values
- `paradigm_3_ecological_harmony_20251019.md` - Ecological worldview
- `paradigm_4_indigenous_communitarian_20251019.md` - Indigenous perspectives
- `paradigm_metric_mapping_20251019.md` - How paradigms map to QoL dimensions

### Social Systems

**Trust & Cooperation:**
- `trust-dynamics_20251019.md` - Social trust formation and decay

**Migration & Mobility:**
- `water_scarcity_migration_immobility_20251020.md` - Climate-driven displacement
- `government_relocation_programs_20251020.md` - Managed retreat programs

**Policy & Economics:**
- `policy-interventions-systemic-inequality-validation_20251016.md` - Inequality reduction
- `ubi-floor-mechanics-validation_20251027.md` - Universal Basic Income implementation
- `government_climate_investment_adoption_patterns_20251024.md` - Government climate action

### Citation Quality Control

**Verification Reports:**
- `CITATION_VERIFICATION_SUMMARY.md` - Overall status
- `CITATION_VERIFICATION_SESSION_SUMMARY.md` - Detailed session logs
- `verification_740a914_20251105.md` - Recent verification runs

**Corrections Applied:**
- `CITATION_CORRECTIONS_APPLIED_PHASE4_CRITICAL.md` - Critical fixes
- `CITATION_CORRECTIONS_APPLIED_PHASE24_FINAL.md` - Final cleanup phase
- `CITATION_FIX_SUMMARY.md` - What was fixed

**Problem Tracking:**
- `FAKE_CITATION_FOUND.md` - Known fabrications
- `COMMONLY_HALLUCINATED_CITATIONS.md` - 47 papers that don't exist
- `CLAIM_VERIFICATION_CRISIS.md` - Systematic issues identified

**PDF Access:**
- `DOWNLOADED_PDFS_MANIFEST.md` - Papers acquired for verification
- `PDF_SEARCH_SYSTEM.md` - How to search downloaded papers

---

## TIER 6: Research Workflow & Coordination

### When Research Is Needed

**Trigger Research When:**
1. **God mode gap identified:** Quantitative analysis shows tech not working as expected
2. **New feature proposed:** No existing research on mechanism/parameters
3. **Monte Carlo anomaly:** Simulation outcomes don't match empirical literature
4. **Citation verification fails:** Source doesn't say what was claimed
5. **Parameter feels arbitrary:** "Tuned for balance" instead of data-backed

**Research Process:**
1. **Identify specific question** - Not "research climate," but "what is empirical deployment timescale for DAC from pilot to commercial?"
2. **Literature search** - Use Zotero semantic search, AI Safety Transcripts MCP, PDF RAG, WebSearch
3. **Extract parameters** - Specific numbers with ranges/uncertainty, not vague claims
4. **Verify citations** - Use `/check_citation` slash command, cross-reference with WebSearch
5. **Document confidence** - 50-95% research confidence based on source quality and consensus
6. **Save to `research/[topic]_YYYYMMDD.md`** - Timestamped, never delete old research

### Research Agent Coordination

**Cynthia (Super-Alignment Researcher):**
- **Role:** Literature search, parameter extraction, academic sources
- **Channels:** `research` (primary), `coordination` (cross-team)
- **Memory:** `.claude/agents/memories/cynthia-memory.json`
- **MCP Access:** Zotero, AI Safety Transcripts, PDF RAG, Matrix

**Sylvia (Research Skeptic):**
- **Role:** Citation verification, contradictory evidence, overconfidence detection
- **Channels:** `research` (primary), `coordination` (cross-team)
- **Memory:** `.claude/agents/memories/sylvia-memory.json`
- **MCP Access:** WebSearch, PDF access, Zotero verification
- **Quality Gate:** MANDATORY review before implementation

**Workflow Pattern:**
1. **Research need identified** → Post to `research` channel
2. **Cynthia researches** → Finds peer-reviewed sources, extracts parameters
3. **Sylvia validates** → Verifies citations, finds contradictory evidence, grades research
4. **If B+ or higher** → Proceed to implementation
5. **If below B+** → Fix fabrications/misattributions, re-verify

### Communication Channels

**Research Channel:**
- **Purpose:** Research questions, source validation, parameter debates
- **Active Agents:** Cynthia, Sylvia
- **Monitoring:** Architect (for roadmap updates), Orchestrator (for workflow coordination)

**Coordination Channel:**
- **Purpose:** Cross-team updates, research → implementation handoff
- **All Agents:** Post major research completion, flag blockers

**Implementation Channel:**
- **Purpose:** Roy (simulation-maintainer) + Architect coordination
- **Handoff:** When research is verified and ready for code integration

---

## TIER 7: Active Research Coordination

### Current Research Assignments (November 2025)

**Unassigned - Needs Owner:**
1. **Novel Entities Energy Analysis** (CRITICAL priority)
   - **Question:** Energy requirements for environmental-scale PFAS/microplastic cleanup
   - **Deliverable:** Peer-reviewed sources on dilute-stream remediation costs vs. concentrated-stream
   - **Target:** Find studies showing cost scaling with contamination concentration
   - **Deadline:** Before implementing additional pollution tech

2. **Climate Deployment Timescales Integration** (HIGH priority)
   - **Question:** How to model 30-50 year deployment phases in simulation?
   - **Deliverable:** Tech property schema with `deploymentPhases: { planning, construction, scaleUp, maturity }`
   - **Existing Research:** Already comprehensive (`climate_mitigation_deployment_rates_20251021.md`)
   - **Deadline:** Before next major tech tier implementation

3. **Nitrogen-Food Coupling Constraints** (HIGH priority)
   - **Question:** Minimum nitrogen requirements for global food security at population/diet levels
   - **Deliverable:** Constraint function linking nitrogen reduction to food production capacity
   - **Target:** Find studies quantifying N requirements for different dietary scenarios (omnivore, vegetarian, vegan)
   - **Deadline:** Before implementing aggressive biogeochemical restoration tech

4. **Biosphere Functional Group Analysis** (MEDIUM priority)
   - **Question:** Which species losses cause ecosystem state shifts vs. cosmetic impacts?
   - **Deliverable:** Functional group importance weighting for biosphere score
   - **Target:** Pollinator/decomposer/primary producer sensitivity vs. megafauna
   - **Deadline:** Investigation priority, not blocking

---

## TIER 8: Knowledge Gaps & Uncertainties

### High-Uncertainty Parameters (±50-100%)

From climate mitigation research (Oct 21, 2025):
1. **DAC cost curve post-2040:** Industry targets ($100/tCO₂) may not be achievable (current: $400-1,000/tCO₂)
2. **Fusion economic viability:** LCOE range $60-150/MWh (2.5× range) - may arrive "too late" vs. cheap renewables
3. **Carbon cycle feedback magnitudes:** Permafrost release 0.1-0.3 GtCO₂/year (3× range)
4. **Political continuity:** Policy reversals unpredictable (election outcomes, populism)
5. **AI acceleration factor:** 1.1-1.5× range for climate tech (limited macro-level empirical data)

### Critical Unknowns (Unknowable?)

1. **Tipping point cascades:** Will single tipping point trigger others?
2. **Technology breakthroughs:** Unforeseen innovations (room-temperature superconductors, etc.)
3. **Social tipping points:** When does public demand reach critical mass?
4. **Geopolitical shocks:** Wars, pandemics, economic crises disrupting transitions
5. **Geoengineering deployment:** Will solar radiation management be attempted?

### Modeling Approach for Uncertainties

**When uncertainty is ±50-100%:**
- Use **triangular distributions** in Monte Carlo: `triangular(pessimistic, realistic, optimistic)`
- Run N≥100 simulations, report outcome distributions
- Sensitivity analysis (Sobol indices) to identify high-influence parameters

**When uncertainty is "unknowable":**
- Model as **branching scenarios** (different simulation runs, not distributions within a run)
- Example: Geoengineering deployment is scenario choice, not random variable
- Allow users to select scenario assumptions (preset sliders: realistic/optimistic/pessimistic)

---

## TIER 9: Next Steps & Maintenance

### Immediate Priorities (Nov 2025)

1. **Novel Entities Deep Dive (CRITICAL):**
   - Assign Cynthia: Find energy analysis for environmental-scale PFAS cleanup
   - Assign Sylvia: Verify dilution constraint hypothesis with peer-reviewed sources
   - Diagnostic: Run simulation with each pollution tech individually, track effectiveness delta
   - Implementation: If research confirms energy trap, add energy gating to cleanup tech

2. **Climate Deployment Timescales (HIGH):**
   - Roy: Design tech property schema for deployment phases
   - Cynthia: Extract timescales from existing research for each tech tier
   - Validation: Monte Carlo with timescales, confirm 2050 outcomes match IEA projections

3. **Nitrogen-Food Coupling (HIGH):**
   - Cynthia: Find minimum N requirements for food security at population levels
   - Roy: Design constraint system linking nutrient reduction to food production
   - Validation: Aggressive N reduction should trigger famine if not coupled with dietary change

4. **Biosphere Outlier Investigation (MEDIUM):**
   - Diagnostic: Examine which metrics drive 81.5% effectiveness
   - Research: Functional group importance weighting
   - Implementation: Weight ecosystem services over species counts

### Maintenance Schedule

**Weekly:**
- Check `research` channel for new research questions
- Update "Active Research Assignments" section with owners
- Flag completed research for citation verification

**Monthly:**
- Review god mode diagnostics for new effectiveness gaps
- Update priority rankings based on simulation validation results
- Archive completed research to appropriate subdirectories

**Quarterly:**
- Systematic citation re-verification (spot-check 10% of sources)
- Update research confidence levels based on new publications
- Refresh deployment timescale projections (IEA, IPCC updates)

**Annual:**
- Major research audit (verify all CRITICAL/HIGH priority claims)
- Update carbon budget remaining (Global Carbon Project)
- Refresh technology cost curves (DAC, fusion, batteries)

---

## TIER 10: Resources & Tools

### MCP Research Tools

**Zotero (via MCP):**
- `zotero_semantic_search(query, limit)` - AI-powered search across library
- `zotero_search_items(query, qmode="titleCreatorYear")` - Text search
- `zotero_get_item_metadata(item_key, include_abstract=true)` - Full metadata
- `zotero_get_item_fulltext(item_key)` - Extract full text
- **Use For:** Finding existing papers, verifying citations, extracting parameters

**AI Safety Transcripts (via MCP):**
- `search_transcripts_tool(query, top_k=5, channel=None)` - Semantic search
- `rag_query(query, top_k=5)` - Context retrieval for LLM
- `list_channels_tool()` - Available channels
- **Use For:** AI alignment research, Robert Miles explainers, safety research context

**PDF RAG (via MCP):**
- `search_pdfs_tool(query, top_k=5, author=None)` - Semantic PDF search
- `rag_query(query, top_k=5)` - Extract context from papers
- `search_abstracts(query, limit=10)` - Quick scanning
- `search_methods(query, limit=10)` - Methodology sections
- `search_results_section(query, limit=10)` - Empirical findings
- **Use For:** Deep dives into downloaded papers, methodology extraction

**WebSearch (via MCP):**
- For sources not in Zotero/PDFs
- Verify publication details (journal, year, DOI)
- **Limitation:** Can't access full-text PDFs behind paywalls

### Citation Verification

**Slash Command:**
- `/check_citation` - Thoroughly verify citations in previous message against actual paper content
- **Use:** After Cynthia provides research with citations, run this command to verify

**Manual Verification:**
1. Search Zotero: `zotero_search_items(query="Author Year")`
2. If not found: WebSearch for DOI/journal confirmation
3. If exists: `zotero_get_item_fulltext(item_key)` to verify claim
4. Grade: A-/A (80%+ verified), B+/B (70%+), C+/C (60%+), D+/D (50%+), F (<50% or >20% fabricated)

### Research File Naming Convention

**Format:** `[topic]_YYYYMMDD.md`

**Examples:**
- `climate_mitigation_deployment_rates_20251021.md` (date = completion date)
- `ai_sandbagging_capability_concealment_verification_20251101.md` (date = verification date)

**Never Delete:** Archive completed research to subdirectories if needed, but preserve with timestamps

---

## TIER 11: Contact & Coordination

**Questions about this roadmap:** Post to `research` channel

**Research assignments:** Post to `research` channel with `@cynthia` or `@sylvia` mentions

**Research → Implementation handoff:** Post to `coordination` channel when research verified (B+ or higher)

**God mode gaps identified:** Post to `research` channel with diagnostic output (which tech, which boundary, observed effectiveness %)

**Roadmap updates:** Architect maintains this file, updates after major research completion or new god mode diagnostics

---

**Roadmap Version:** 1.0
**Created:** November 9, 2025
**Last Major Update:** November 9, 2025
**Next Review:** December 2025 (after next god mode diagnostic run)
