# Master Research Roadmap

**Purpose:** Single source of truth for all research coordination across AI alignment, climate mitigation, planetary boundaries, and post-scarcity pathways.

**Last Updated:** November 19, 2025

**Primary Maintainer:** Sylvia (Research Skeptic) + Cynthia (Super-Alignment Researcher)

**Integration:** This roadmap integrates quantitative gap analysis from god mode testing (Priya's simulation diagnostics) with systematic research needs identified by research agents.

**Comprehensive Analysis:** Full technology gap analysis with 26 new tech candidates and 9 modeling paradigm shifts documented in `TECHNOLOGY_GAP_ANALYSIS_COMPREHENSIVE_20251110.md` (15,000+ words).

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

#### Missing Technologies - Solution Space

**Prevention Over Cleanup (TIER 0-1 - CRITICAL PRIORITY):**
1. **Global PFAS Production Ban** (TIER 0, 10-20 year timeline)
   - Type: Policy + industrial transition
   - Effect: Stop 4.4M tons/year production flow
   - Analog: Montreal Protocol CFC phase-out (12 years)
   - Research Needed: Montreal Protocol effectiveness ratios (production ban vs. cleanup contribution)

2. **Plastic Production Phase-Out 80%** (TIER 1, 20-30 year timeline)
   - Type: Circular economy transition
   - Effect: Reduce virgin plastic, shift to bio-based alternatives (PHA, PLA)
   - Dependencies: Substitute materials, waste infrastructure
   - Research Needed: Historical phase-out timelines (lead, asbestos)

3. **Chemical Substitution Acceleration** (TIER 1, 5-15 year per class)
   - Type: Green chemistry R&D + regulatory push
   - Effect: Replace persistent chemicals with biodegradable alternatives
   - Research Needed: Substitution success rates

**Dilute-Stream Remediation (TIER 2 - HIGH PRIORITY):**
4. **Membrane Cascade Systems** (TIER 2, 10-15 year timeline)
   - Type: Multi-stage concentration (ng/L → mg/L)
   - Effect: Concentrate dilute contamination with minimal energy
   - Target: <1,000 kWh/kg vs. current 10⁶ kWh/kg
   - Research Needed: Theoretical limits of selective membrane separation

5. **Biomimetic Filtration (Kidney Analog)** (TIER 3, 15-25 year timeline)
   - Type: Bio-inspired selective extraction at environmental concentrations
   - Effect: Passive or low-energy targeted removal
   - Research Needed: Biological analogues for dilute contaminant removal

6. **Photocatalytic Degradation at Scale** (TIER 2-3, 10-20 year timeline)
   - Type: Sunlight-driven in-situ breakdown
   - Effect: No concentration step required
   - Target: Quantum efficiency >50% (current <10%)
   - Research Needed: Quantum efficiency improvements

**Paradigm Shifts Required:**
- Energy-Constrained Cleanup: Gate effectiveness by `renewableSurplus`, add `energyRequirement` and `minimumConcentration` properties
- Irreversible Stock: Model as asymptotic approach (never zero), add `irreversible: true` flag
- Rebound Effects: Cleanup increases production rate (moral hazard) - net effectiveness = cleanup - induced production

#### Next Steps

1. **Diagnostic Run:** Deploy all 7 pollution techs individually in simulation, track Novel Entities delta per tech to identify if ANY work
2. **Energy Analysis:** Model energy requirements for cleanup vs. available energy surplus (constraint system)
3. **Literature Search:** Find peer-reviewed studies on environmental-scale (not lab-scale) PFAS/microplastic remediation costs and effectiveness
4. **Irreversibility Flag:** Consider adding `irreversible: true` property to Novel Entities boundary (like extinctions)
5. **Prevention Tech Research:** Quantify Montreal Protocol effectiveness ratios (production ban vs. cleanup)
6. **Add Missing Technologies:** Integrate 6 new prevention/remediation technologies into tech tree

---

## TIER 1B: CRITICAL - AI Coordination & Transition Management (God Mode Interpretation Gap)

### 0. Coordinated Technology Deployment (30% God Mode Mortality Finding)

**God Mode Finding:** Deploying all 73 technologies at month 0 results in 30% population mortality (8.15B → 5.71B). This is not a bug but reveals a fundamental model assumption gap.

**Priority:** CRITICAL - Affects interpretation of "post-alignment success." Current model shows tech unlock without coordination, not optimal AI-managed transition.

#### Active Research Questions

1. **CRITICAL: Transition Mortality (Managed vs Unmanaged)**
   - **Question:** What are historical mortality rates during rapid technology transitions - coerced vs coordinated?
   - **Evidence Gap:** China's Great Leap Forward (~15-55M deaths, rushed), USSR collectivization (5-8M deaths, forced) vs. peaceful transitions with governance support
   - **Model Impact:** Current "god mode" models instant tech unlock without coordination - worst-case scenario. Need to distinguish uncoordinated deployment from AI-managed transition
   - **Research Needed:** Peer-reviewed studies on transition mortality rates: coerced vs. supported vs. AI-coordinated
   - **Status:** Coffee-talk discussion (Nov 10, 2025) identified gap, needs systematic research

2. **CRITICAL: AI Coordination Mechanisms**
   - **Question:** What mechanisms does aligned AI use to coordinate technology deployment?
   - **Evidence Gap:** We model "AI unlocks tech" but not "AI manages rollout." Current assumption: humans deploy without AI coordination
   - **Model Impact:** Need new phase/system: CoordinatedDeploymentPhase that models rollout pacing, regional capacity assessment, transition support
   - **Research Needed:** AI coordination literature, optimal deployment scheduling, adaptive rollout based on regional readiness
   - **Status:** Hypothesis formed, no implementation yet

3. **CRITICAL: Transition Support Systems**
   - **Question:** What support systems mitigate mortality during rapid economic/technological disruption?
   - **Evidence:** UBI, retraining programs, food security during change, healthcare access during transition
   - **Model Impact:** Mortality during deployment should scale inversely with support system quality. Strong support → low mortality, weak support → high mortality
   - **Research Needed:** Empirical studies on social safety net effectiveness during economic transitions
   - **Status:** Conceptual framework exists (coffee-talk), needs quantification

4. **IMPORTANT: Deployment Pacing Physics**
   - **Question:** What is the optimal deployment rate that maximizes benefit while minimizing disruption casualties?
   - **Hypothesis:** There's a "safe deployment rate" constrained by retraining capacity, economic adaptation speed, infrastructure buildout
   - **Model Impact:** Tech should have deployment curves (gradual rollout) rather than instant activation
   - **Research Needed:** Technology diffusion rates, economic adaptation timescales, workforce transition capacity
   - **Status:** Overlaps with climate deployment timescales research (TIER 2), needs transition mortality focus

5. **IMPORTANT: Regional Capacity Assessment**
   - **Question:** How does deployment readiness vary by region (infrastructure, governance, economic capacity)?
   - **Evidence:** Advanced economies can absorb change faster than developing regions; uneven deployment creates winners/losers
   - **Model Impact:** Tech effectiveness should vary by region; instant global deployment is unrealistic
   - **Research Needed:** Regional readiness metrics, infrastructure capacity constraints, governance effectiveness
   - **Status:** Not currently modeled, needs investigation

#### Existing Research

- **Coffee-Talk Discussion (Nov 10, 2025):** Roy, Priya, Sylvia, Cynthia identified that "god mode" tests chaos (instant deployment) not coordination (AI-managed transition)
- **Historical Analogies:** Great Leap Forward, USSR collectivization (coerced), Industrial Revolution (uncoordinated) as baseline mortality rates
- **Gap:** No existing research in repository on AI-coordinated transition management

#### Missing Systems - Solution Space

**Coordination Mechanics (NEW PHASE - TIER 0 PRIORITY):**
1. **CoordinatedDeploymentPhase** (Implementation priority: CRITICAL)
   - Type: New phase that manages tech rollout pacing
   - Effect: AI system assesses regional capacity, schedules deployment, provides transition support
   - Inputs: Available tech, regional readiness, population capacity, economic stability
   - Outputs: Deployment rate per tech per region, support system activation, mortality mitigation
   - Research Needed: AI coordination mechanisms, optimal pacing algorithms

2. **Transition Support System** (Implementation priority: CRITICAL)
   - Type: Economic safety net during technological disruption
   - Components: UBI activation, retraining programs, food security, healthcare access
   - Effect: Reduces transition mortality from 30% (unsupported) to <5% (supported)
   - Dependencies: Economic capacity, governance effectiveness, AI coordination quality
   - Research Needed: Safety net effectiveness during rapid change

3. **Regional Capacity Modeling** (Implementation priority: HIGH)
   - Type: Differentiate deployment readiness by region
   - Effect: Tech deploys faster in high-capacity regions, slower in low-capacity (prevents collapse)
   - Metrics: Infrastructure quality, governance effectiveness, economic resilience
   - Research Needed: Regional readiness assessment frameworks

**Paradigm Shifts Required:**
- **God Mode Redefinition:** Current "god mode" = chaos mode (instant deployment, no coordination). Need "coordinated mode" = AI-managed optimal transition
- **Deployment as Process:** Tech deployment is not binary (deployed: true/false) but continuous (deploymentProgress: 0-100%, paced by coordination quality)
- **Mortality as Function:** Transition mortality = f(deployment_rate, support_quality, regional_capacity, coordination_effectiveness)

#### Next Steps

1. **Research Assignment:** Cynthia to find peer-reviewed studies on transition mortality (managed vs unmanaged), safety net effectiveness
2. **Validation:** Sylvia to verify historical mortality claims (Great Leap Forward, USSR collectivization) with academic sources
3. **Design:** Roy + Orchestrator to design CoordinatedDeploymentPhase architecture
4. **God Mode Reinterpretation:** Clarify what "god mode" tests - current (chaos) vs needed (coordination)
5. **Monte Carlo Validation:** Run N=10 with/without coordination, measure mortality delta (target: 30% chaos → <5% coordinated)

---

## TIER 1C: CRITICAL - Governance Sufficiency Research (Scenario Analysis Foundation)

**Context:** God mode analysis shows technology deployed but spirals not activating. Research roadmap covers physical/technical constraints but missing governance/social dimension that determines whether technology actually gets deployed effectively.

**Priority:** CRITICAL - Provides empirical grounding for scenario analysis framework. Without this, scenarios are arbitrary rather than research-backed.

**Core Question:** "Can governance actually deploy technology fast enough, fairly enough, and with enough coordination to activate upward spirals?"

### Active Research Questions

1. **CRITICAL: Historical Transition Management**
   - **Question:** What governance structures enabled successful rapid large-scale transitions?
   - **Success Cases:** Marshall Plan (4 years, $13B → European recovery), EU integration (decades, coordinated standards), Montreal Protocol (12 years, >99% CFC phase-out), German Reunification (rapid economic transition)
   - **Failure Cases:** USSR collectivization (5-8M deaths), Great Leap Forward (15-55M deaths), shock therapy transitions
   - **Model Impact:** Identify minimum governance quality, institutional capacity, and coordination mechanisms for successful transitions
   - **Research Needed:** Peer-reviewed comparative studies on transition mortality (managed vs unmanaged), institutional requirements for rapid change
   - **Status:** Coffee-talk discussion identified gap, needs systematic research

2. **CRITICAL: Policy Priority Trade-offs**
   - **Question:** Are climate, equality, and democracy compatible or must you sacrifice some?
   - **Evidence Gap:** Climate action often requires rapid centralized decisions (China renewables), equality requires redistribution (political opposition), democracy requires slow consensus
   - **Scenarios to Test:**
     - Climate + Equality (Green New Deal model)
     - Climate + Speed (Authoritarian efficiency model)
     - Equality + Democracy (Nordic model, slower climate action)
   - **Model Impact:** Define trade-off functions for scenario analysis. Can scenarios achieve multiple goals or must they prioritize?
   - **Research Needed:** Comparative policy studies on climate/equality/democracy combinations. Which countries achieved multiple goals?
   - **Status:** Theoretical framework exists, needs empirical quantification

3. **HIGH: Institutional Capacity Thresholds**
   - **Question:** What minimum governance quality enables coordinated tech deployment?
   - **Hypothesis:** Below some threshold (0.4? 0.6?), governance can't coordinate deployment regardless of technology availability
   - **Evidence:** Failed states can't deploy any technology effectively; strong states deploy faster even with fewer resources
   - **Model Impact:** Gate scenario effectiveness by `governanceQuality`. Below threshold = chaos mode regardless of priorities
   - **Research Needed:** World Bank governance indicators vs technology deployment success rates, state capacity literature
   - **Status:** Strong hypothesis, needs threshold quantification

4. **HIGH: Trust Requirements for Spiral Activation**
   - **Question:** What trust levels enable cooperative spirals and upward spirals?
   - **Evidence:** Cooperative spirals require 2+ alignment milestones including "demonstrated success." Upward spirals require sustained positive conditions for 12+ months
   - **Gap:** We don't know minimum trust levels for these to activate
   - **Model Impact:** Define trust thresholds for each spiral. If trust < threshold, spiral cannot activate
   - **Research Needed:** Social capital literature (Putnam), institutional trust studies, threshold effects in cooperation
   - **Status:** Mechanism exists in code, thresholds need calibration

5. **HIGH: Democratic Participation Requirements**
   - **Question:** Can authoritarian systems achieve utopia-enabling spirals, or is participation necessary?
   - **Hypothesis A:** Democracy required for meaning/democratic spirals (by definition)
   - **Hypothesis B:** Authoritarian systems can achieve abundance/ecological spirals via rapid deployment
   - **Model Impact:** Some spirals may be exclusive to high-participation governance. Authoritarian scenarios limited to subset of spirals
   - **Research Needed:** Comparative studies on authoritarian vs democratic environmental outcomes, public goods provision
   - **Status:** Critical for scenario design, needs empirical grounding

6. **MEDIUM: Success Path Mapping (Coffee-Talk Insight)**
   - **Question:** What are the specific pathways to SUCCESS, not just failure modes?
   - **Gap Identified:** Sylvia couldn't name 3 ways carbon capture succeeds (only failure modes). Model validation tests failures extensively but not success paths
   - **Research Areas:**
     - Carbon capture success cases (what conditions enabled them?)
     - Ecosystem restoration success cases (mangrove 98% survival - what worked?)
     - Rapid technology deployment success cases (solar/wind exceeding projections - why?)
     - Inequality reduction success cases (Nordic model - how achieved?)
   - **Model Impact:** Success path tests validate that positive outcomes ARE possible under specific conditions
   - **Research Needed:** Case study synthesis of environmental/social successes with conditions identified
   - **Status:** Gap identified in coffee-talk, needs systematic research

### Existing Research (Partial)

- **Coffee-Talk Discussion (Nov 10, 2025):** Identified governance gap, success path gap, institutional threshold hypothesis
- **God Mode Analysis:** Shows technology + spirals exist but don't activate → governance/conditions missing
- **Scenario Analysis Framework:** Added to implementation roadmap, needs research grounding

### Missing Research - Solution Space

**Transition Management Studies:**
1. Marshall Plan effectiveness analysis (4-year rapid reconstruction)
2. Montreal Protocol implementation mechanics (99% success rate)
3. EU integration governance structures (multi-decade coordination)
4. Comparative transition mortality studies (managed vs unmanaged)

**Policy Trade-off Studies:**
5. Climate-equality compatibility analysis (which countries achieved both?)
6. Democratic vs authoritarian environmental outcomes (comparative)
7. Speed-participation trade-offs in crisis response

**Institutional Threshold Studies:**
8. Governance quality vs technology deployment rates
9. State capacity thresholds for complex coordination
10. Trust threshold effects in collective action

**Success Case Studies:**
11. Renewable energy acceleration factors (why 25% ahead of projections?)
12. Ecosystem restoration success conditions (mangrove, Elwha salmon)
13. Ozone recovery acceleration factors (why 5 years early?)

### Paradigm Shifts Required

- **Governance-Gated Deployment:** Technology effectiveness = f(tech_level × governance_quality × trust_level)
- **Spiral Activation Thresholds:** Each spiral requires minimum trust/participation/capacity to activate
- **Priority Trade-off Functions:** Model explicit trade-offs between climate/equality/democracy goals
- **Success Path Validation:** Tests must validate success IS possible, not just that failure occurs

### Next Steps

1. **Research Assignment:** Cynthia to find comparative transition studies (Marshall Plan, Montreal Protocol effectiveness)
2. **Validation:** Sylvia to verify governance threshold claims with World Bank data, institutional capacity literature
3. **Threshold Calibration:** Extract minimum governance quality, trust, participation levels for spiral activation
4. **Success Case Synthesis:** Document conditions enabling environmental/social successes
5. **Trade-off Quantification:** Empirical studies on climate/equality/democracy compatibility
6. **Integration:** Provide research-backed parameters for scenario analysis framework

---

## TIER 2: HIGH - Severe Effectiveness Gaps (Prevent Misleading Outcomes)

### 2. Climate Change Boundary (5.5% effectiveness in god mode) ✅ RESEARCH COMPLETE

**God Mode Finding:** Despite carbon capture, fusion, renewables, and climate mitigation tech fully deployed, only 5.5% effectiveness. Model shows catastrophic failure even with full tech tree.

**Priority:** HIGH - Deployment speed physics not modeled; "deploy tech → immediate effect" assumption breaks reality

**RESEARCH STATUS:** ✅ **COMPLETE** (Nov 12, 2025) - Comprehensive timescale analysis validates 5.5% as physically accurate for 3-5 year evaluation window

#### Active Research Questions

1. **✅ COMPLETE: Deployment Speed vs. Technological Capability**
   - **Question:** Do we model deployment as technological problem or institutional problem?
   - **Evidence Gap:** Current model may assume instant deployment; reality shows 30-50 year timescales from planning to full deployment (IPCC AR6)
   - **Model Impact:** Tech should have deployment phases: planning (2-7 years), construction (3-10 years), scale-up (10-30 years), full deployment (30-50 years)
   - **Research Completed:** `research/climate_tech_deployment_timescales_20251112.md` (35 KB, 4,700 words, 15+ peer-reviewed sources)
   - **Key Finding:** Three-delay model (activation + scaling + physical response) explains 5.5% effectiveness. God mode deploys at month 0 but effects manifest over 20-30 years
   - **Status:** ✅ COMPLETE - Technology-specific parameters provided for all 9 climate technologies

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

#### Missing Technologies - Solution Space

**Rapid Deployment Technologies (TIER 0-1 - CRITICAL PRIORITY):**
1. **Modular DAC Units (SpaceX Starship Model)** (TIER 1, 10-15 year to factory-scale)
   - Type: Mass-manufactured, rapidly deployed modules
   - Effect: 1,000× faster deployment than custom engineering
   - Scale: Factory produces 100-1,000 units/year vs. 1-2 custom plants/decade
   - Analogy: SpaceX reduced rocket costs 10× via manufacturing-first approach
   - Research Needed: Learning curve analysis (cost reduction with volume)

2. **Automated Construction Systems** (TIER 1, 5-10 year timeline)
   - Type: AI-assisted robotic construction
   - Effect: 3-5× faster buildout of renewable infrastructure
   - Dependencies: AI robotics, supply chain coordination
   - Research Needed: Historical construction acceleration examples

3. **Institutional Automation (Permitting AI)** (TIER 1, 3-7 year timeline)
   - Type: AI-streamlined regulatory approval
   - Effect: Reduce planning phase from 2-7 years to 6-18 months
   - Research Needed: Regulatory bottleneck quantification

**Energy System Breakthroughs (TIER 1-2 - CRITICAL PRIORITY):**
4. **Early Fusion Deployment** (Move from TIER 4 to TIER 2, 2035-2040 target)
   - Current: Fusion in TIER 4 (2040-2050+)
   - Needed: Move to TIER 2 (2030-2040) with aggressive investment
   - Effect: Massive clean energy for DAC and industrial decarbonization
   - Pathway: Manhattan Project-scale public investment
   - Timeline: ITER (2025) → DEMO (2030s) → Commercial (2035-2040)
   - Research Needed: Realistic acceleration timelines with 10× funding boost

5. **Advanced Solar (Perovskite + Tandem)** (TIER 1, 5-10 year timeline)
   - Type: Next-gen high-efficiency solar (40-50% vs. current 20-25%)
   - Effect: Halves land/material requirements for same output
   - Research Needed: Commercialization barriers (stability, manufacturing)

6. **Carbon-Negative Materials** (TIER 2, 10-20 year timeline)
   - Type: Building materials that sequester more CO₂ than emitted in production
   - Examples: Biochar concrete, engineered wood, carbon-mineralized cement
   - Effect: Construction sector becomes carbon sink
   - Research Needed: Life-cycle carbon accounting standards

**Enhanced Carbon Sinks (TIER 2 - HIGH PRIORITY):**
7. **Ocean Iron Fertilization (Controlled)** (TIER 2-3, 10-20 year timeline)
   - Type: Targeted phytoplankton growth
   - Effect: 0.5-2.0 GtCO₂/year sequestration
   - Risks: Ecosystem disruption, monitoring required
   - Research Needed: Safe deployment protocols

8. **Coastal Blue Carbon Restoration** (TIER 2, 20-30 year timeline)
   - Type: Mangrove/seagrass/salt marsh restoration at scale
   - Effect: 0.5-1.5 GtCO₂/year + coastal protection
   - Co-benefits: Fisheries, storm protection, biodiversity
   - Research Needed: Optimal restoration strategies by region

9. **Soil Carbon Injection (Biochar)** (TIER 2, 10-20 year timeline)
   - Type: Pyrolyzed biomass deep injection
   - Effect: Permanent carbon storage (millennium timescales)
   - Scale: 1-3 GtCO₂/year potential
   - Research Needed: Long-term stability, soil fertility impacts

**Paradigm Shifts Required:**
- Phased Deployment: Tech has deployment phases (planning, construction, scale-up, maturity) with effectiveness scaling 0% → 10-30% → 30-80% → 80-100%
- Energy Budget Constraints: All energy-consuming tech gated by `renewableEnergySurplus`, partition among competing demands
- Temperature-Dependent Degradation: Carbon sink capacity -5% per 1°C, adaptation energy demand +10% per 1°C

#### Completed Research (Nov 12, 2025)

**Research Report:** `research/climate_tech_deployment_timescales_20251112.md`
- **Size:** 35 KB (4,700 words)
- **Sources:** 15+ peer-reviewed papers (2024-2025), IEA, NREL, government reports
- **Credibility:** Very High for SAI/renewables (>90%), High for DAC/BECCS (70-90%), Medium for enhanced weathering/biochar (50-70%)

**Key Findings:**
1. **Three-Delay Model Validated:** 5.5% effectiveness is correct for 3-5 year evaluation window
   - Activation delay: 2-15 years (construction/manufacturing before first operation)
   - Scaling delay: 5-50 years (S-curve adoption to gigatonne capacity)
   - Physical response delay: <1 to 100 years (atmospheric CO2 equilibration)

2. **Technology-Specific Parameters:** Complete timescale parameters for all 9 climate technologies:
   - Fast-acting (5-10 years): SAI, Heat Pumps, Smart Grid
   - Medium-acting (15-25 years): Green Hydrogen, Biochar
   - Slow-acting (30-50 years): DAC, BECCS, Enhanced Weathering, Ocean Alkalinization

3. **Historical Analogues:** Solar/wind took 20-30 years to reach terawatt scale at 15-30%/year growth. CCS must match or exceed these rates to stay on 2°C pathway (only 10% of IPCC pathways feasible).

4. **Atmospheric Response Lags:** CO2 removal takes decades to centuries to fully affect atmospheric concentration (75% removed in 197-1,820 years).

**Implementation Parameters Provided:**
- T_activate (activation delay)
- T_50 (time to 50% effectiveness)
- S(t) (scaling curve - logistic/S-curve)
- R(t) (physical response curve)
- E_max (maximum effectiveness)

**Recommendation:** Implement time-dependent effectiveness curves for each technology. Validate that early-game effectiveness remains low (<10% in first 5 years) even with aggressive deployment.

#### Next Steps (Implementation Required)

1. **✅ RESEARCH COMPLETE** - Parameters ready for implementation
2. **Add Deployment Timescales:** Tech should have `deploymentPhases` with planning, construction, scale-up, maturity (2-50 year timelines)
3. **Energy Constraint System:** DAC/mitigation tech gated by `renewableEnergySurplus` (can't consume more than available)
4. **Feedback Loops:** Temperature-dependent penalties to mitigation effectiveness (-5% per 1°C for carbon sinks, adaptation energy demand increases)
5. **Monte Carlo Validation:** Run N=100 with deployment timescales, confirm 2050 outcomes match IEA projections (60-80% renewable electricity, 3-12 GtCO₂/year capture)
6. **Calibration:** Adjust parameters until month 36-60 evaluation yields ~5.5% effectiveness (match god mode observation)
7. **Add Missing Technologies:** Integrate 9 new deployment/energy/sink technologies into tech tree

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

#### Missing Technologies - Solution Space

**Biological Nitrogen Fixation (TIER 1-2 - CRITICAL PRIORITY):**
1. **Nitroplast Integration (Cereal Crops)** (TIER 2, 10-20 year timeline)
   - Type: Genetic engineering of nitrogen-fixing organelles into wheat/rice/corn
   - Effect: Crops fix atmospheric N₂ like legumes (eliminate 50-70% fertilizer need)
   - Status: Named World Economic Forum "Top 10 Emerging Technologies 2025"
   - Timeline: Proof of concept 2024 → field trials → commercial deployment
   - Research Needed: Field trial effectiveness, yield impacts

2. **Rhizosphere Engineering** (TIER 2, 5-15 year timeline)
   - Type: Soil microbiome optimization for nitrogen fixation
   - Effect: Enhance natural N-fixing bacteria populations by 2-5×
   - Dependencies: Microbiome mapping, delivery systems
   - Research Needed: Long-term soil health impacts

3. **Precision Fermentation (Protein Shift)** (TIER 1-2, 10-20 year to mass adoption)
   - Type: Microbial protein production (less N-intensive than animal agriculture)
   - Effect: Reduce agricultural N demand by 30-50% via dietary shift
   - Co-benefits: Land use reduction, water savings
   - Research Needed: Consumer adoption barriers, nutritional equivalence

**Legacy Nutrient Removal (TIER 2 - HIGH PRIORITY):**
4. **Active Sediment Management** (TIER 2-3, 20-40 year timeline)
   - Type: Dredging + nutrient extraction from legacy sediments
   - Effect: Remove decades of accumulated P/N from aquatic systems
   - Scale: Massive infrastructure (Great Lakes alone: 100+ years at current rates)
   - Research Needed: Cost-effectiveness vs. waiting for natural decay

5. **Phytoremediation Networks** (TIER 2, 10-30 year timeline)
   - Type: Engineered wetlands that extract and harvest nutrients
   - Effect: Intercept agricultural runoff, harvest biomass (nutrient removal)
   - Co-benefits: Habitat restoration, flood control
   - Research Needed: Optimal plant species by climate zone

6. **Soil Nutrient Drawdown (Cover Cropping++)** (TIER 1-2, 10-30 year timeline)
   - Type: Intensive cover cropping to draw down legacy soil nutrients
   - Effect: Gradually reduce soil P/N over 10-30 years
   - Trade-off: Temporarily sequesters nutrients (doesn't remove from system)
   - Research Needed: Timescales and effectiveness by soil type

**Paradigm Shifts Required:**
- Legacy Stock Mechanics: Track `legacyStock` with exponential decay (half-life 20-50 years), effective pollution = current input + legacy release
- Nitrogen-Food Coupling: Nitrogen requirement = population × dietType.nitrogenPerCapita, aggressive cuts trigger famine
- Saturating Effect Flag: Some tech provides one-time improvement (e.g., soil carbon builds then plateaus)

#### Next Steps

1. **Add Legacy Stock Mechanic:** Biogeochemical boundaries track accumulated contamination with exponential decay (half-life 10-50 years)
2. **Nitrogen-Food Coupling:** Nutrient reduction tech should trigger food production penalties if deployed too aggressively
3. **Literature Search:** Find peer-reviewed studies on global legacy nutrient stocks and minimum N requirements for food security
4. **Validation Target:** 10% effectiveness may be CORRECT if problem is fundamentally constrained by food production needs
5. **Nitroplast Research:** Validate field trial effectiveness, deployment timelines
6. **Add Missing Technologies:** Integrate 6 new biological/remediation technologies into tech tree

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

#### Missing Technologies - Solution Space

**Functional Group Conservation (TIER 1 - CRITICAL PRIORITY):**
1. **Pollinator Corridor Networks** (TIER 1, 10-20 year timeline)
   - Type: Linked habitats specifically for pollinators
   - Effect: Maintain pollination services (affects 75% of crops)
   - Priority: Higher impact than large carnivore conservation
   - Research Needed: Corridor design principles, effectiveness metrics

2. **Decomposer Habitat Protection** (TIER 1, 5-15 year timeline)
   - Type: Soil biodiversity conservation (fungi, bacteria, invertebrates)
   - Effect: Maintain nutrient cycling (ecosystem foundation)
   - Priority: Invisible but critical functional group
   - Research Needed: Soil biodiversity metrics, restoration methods

3. **Keystone Species Prioritization** (TIER 0-1, ongoing)
   - Type: Focus on species with disproportionate ecosystem impact
   - Examples: Sea otters (kelp forests), wolves (trophic cascades), beavers (wetland creation)
   - Effect: Maximum ecosystem function per conservation dollar
   - Research Needed: Keystone species identification by biome

**Long-Timescale Recovery Modeling (TIER 2 - HIGH PRIORITY):**
4. **Genetic Rescue Programs** (TIER 2, 50-100 year programs)
   - Type: Address extinction debt via genetic diversity preservation
   - Effect: Keep "living dead" populations viable
   - Dependencies: Genetic monitoring, captive breeding
   - Research Needed: Minimum viable population thresholds by taxon

5. **Assisted Migration** (TIER 2, ongoing over 50-100 years)
   - Type: Relocate species to climate-suitable habitats
   - Effect: Prevent extinction from climate-driven range shifts
   - Risks: Invasive species potential
   - Research Needed: Risk assessment frameworks

6. **Ecosystem Function Monitoring (Not Just Species Counts)** (TIER 1, 5-10 year deployment)
   - Type: Track pollination rates, nutrient cycling, carbon sequestration
   - Effect: Measure actual ecosystem services, not biodiversity proxies
   - Research Needed: Function-based metrics vs. species-based

**Paradigm Shifts Required:**
- Functional Group Weighting: Weight pollinators (10×), decomposers (8×), keystones (5×), megafauna (1×) by ecosystem function
- Extinction Debt Integration: 50-400 year continued decline even after threat removal
- Tipping Point Mechanics: Nonlinear state shift at 50-90% habitat transformation (hysteresis in recovery)

#### Next Steps

1. **Diagnostic Run:** Examine which biosphere improvements drive 81.5% effectiveness (species counts vs. ecosystem function metrics)
2. **Add Extinction Debt:** Biosphere losses should continue for 50-100 years after threats removed (legacy effect)
3. **Functional Group Weighting:** Weight pollinators/decomposers/primary producers higher than megafauna in biosphere score
4. **Tipping Point Investigation:** Research habitat transformation thresholds for ecosystem state shifts
5. **Function-Based Metrics Research:** Pollination rates, nutrient cycling rates vs. species counts
6. **Add Missing Technologies:** Integrate 6 new functional conservation technologies into tech tree

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

**TIER 1: CRITICAL (Must Complete Before Implementing New Tech)**

1. **Novel Entities Energy Analysis** (CRITICAL priority)
   - **Question:** Energy requirements for environmental-scale PFAS/microplastic cleanup
   - **Deliverable:** Peer-reviewed sources on dilute-stream (ng/L to μg/L) remediation costs
   - **Target:** Quantify if 0% effectiveness is thermodynamic limit or implementation bug
   - **Owner:** UNASSIGNED
   - **Deadline:** Before implementing additional pollution tech

2. **Climate Deployment Timescale Integration** (CRITICAL priority)
   - **Question:** How to model 30-50 year deployment phases?
   - **Deliverable:** `DeploymentPhases` schema with empirical timescales per tech tier
   - **Existing Research:** `climate_mitigation_deployment_rates_20251021.md` (comprehensive)
   - **Owner:** UNASSIGNED
   - **Deadline:** Before next tech tier implementation

3. **Irreversibility Framework** (CRITICAL priority)
   - **Question:** Which of 9 planetary boundaries are reversible vs. irreversible?
   - **Deliverable:** Categorization (fully/partially/irreversible) with recovery half-lives
   - **Target:** Add `irreversible: true` flags and asymptotic recovery mechanics
   - **Owner:** UNASSIGNED
   - **Deadline:** Before modeling recovery pathways

**TIER 2: HIGH (Prevent Misleading Outcomes)**

4. **Nitrogen-Food Production Coupling Constraints** (HIGH priority)
   - **Question:** Minimum nitrogen requirements for food security at population/diet levels
   - **Deliverable:** Constraint function linking N reduction to food production capacity
   - **Target:** Prevent unrealistic N cuts that trigger unmodeled famine
   - **Owner:** UNASSIGNED
   - **Deadline:** Before implementing aggressive biogeochemical restoration tech

5. **Extinction Debt Timescales** (HIGH priority)
   - **Question:** How long do population losses continue after threat removal?
   - **Deliverable:** Timescale parameters (50-400 years) by taxon
   - **Target:** Integrate extinction debt into biosphere recovery projections
   - **Owner:** UNASSIGNED
   - **Deadline:** Before claiming rapid ecosystem recovery

6. **Energy Budget Constraint System** (HIGH priority)
   - **Question:** How to partition clean energy among competing demands?
   - **Deliverable:** Energy allocation algorithm (transport, industry, heating, DAC, cleanup)
   - **Target:** Gate all energy-consuming tech by available surplus
   - **Owner:** UNASSIGNED
   - **Deadline:** Before scaling energy-intensive tech (DAC, cleanup)

**TIER 3: MEDIUM (Investigation Priorities, Not Blocking)**

7. **Biosphere Functional Group Analysis** (MEDIUM priority)
   - **Question:** Which species losses cause ecosystem state shifts vs. cosmetic impacts?
   - **Deliverable:** Functional group importance weighting (pollinators > megafauna)
   - **Target:** Weight biosphere score by ecosystem services, not species counts
   - **Owner:** UNASSIGNED
   - **Deadline:** Investigation priority (validate 81.5% effectiveness outlier)

8. **Prevention Technology Effectiveness Ratios** (MEDIUM priority)
   - **Question:** How much did Montreal Protocol production ban contribute vs. cleanup?
   - **Deliverable:** Quantify prevention vs. remediation effectiveness (target: 90%+ ban, <10% cleanup)
   - **Target:** Justify prevention-over-cleanup paradigm shift
   - **Owner:** UNASSIGNED
   - **Deadline:** Before implementing production phase-out tech

9. **Learning Curve Analysis** (MEDIUM priority)
   - **Question:** How do tech costs decline with cumulative deployment?
   - **Deliverable:** Cost reduction rates (typically 15-25% per doubling) for each tech tier
   - **Target:** Model cost dynamics, not just static deployment
   - **Owner:** UNASSIGNED
   - **Deadline:** Before Monte Carlo cost-effectiveness validation

---

## TIER 7A: Technology Solution Space Catalog

**Total Missing Technologies Identified:** 26 new technology candidates across 8 categories

### Prevention Technologies (5 technologies)

**Novel Entities - Production Phase-Out:**
1. Global PFAS Production Ban (TIER 0, 10-20 year timeline)
2. Plastic Production Phase-Out 80% (TIER 1, 20-30 year timeline)
3. Chemical Substitution Acceleration (TIER 1, 5-15 year per class)

**Climate - Prevention Over Mitigation:**
4. Fossil Fuel Production Phase-Out (TIER 0-1, 20-40 year timeline)
5. Methane Leak Prevention at Scale (TIER 0, 5-10 year timeline)

### Rapid Deployment Technologies (3 technologies)

6. Modular DAC Units (SpaceX Model) (TIER 1, 10-15 year to factory-scale)
7. Automated Construction Systems (AI-assisted) (TIER 1, 5-10 year timeline)
8. Institutional Automation (Permitting AI) (TIER 1, 3-7 year timeline)

### Energy Breakthroughs (3 technologies)

9. Early Fusion Deployment (move from TIER 4 to TIER 2) (2035-2040 target)
10. Advanced Solar (Perovskite Tandem) (TIER 1, 5-10 year timeline)
11. Carbon-Negative Materials (TIER 2, 10-20 year timeline)

### Biological Nitrogen Fixation (3 technologies)

12. Nitroplast Integration (cereal crops) (TIER 2, 10-20 year timeline)
13. Rhizosphere Engineering (TIER 2, 5-15 year timeline)
14. Precision Fermentation Protein (TIER 1-2, 10-20 year to mass adoption)

### Functional Ecosystem Technologies (3 technologies)

15. Pollinator Corridor Networks (TIER 1, 10-20 year timeline)
16. Decomposer Habitat Protection (TIER 1, 5-15 year timeline)
17. Keystone Species Prioritization (TIER 0-1, ongoing)

### Dilute-Stream Remediation (3 technologies)

18. Membrane Cascade Systems (TIER 2, 10-15 year timeline)
19. Biomimetic Filtration (Kidney Analog) (TIER 3, 15-25 year timeline)
20. Photocatalytic Degradation at Scale (TIER 2-3, 10-20 year timeline)

### Enhanced Carbon Sinks (3 technologies)

21. Ocean Iron Fertilization (Controlled) (TIER 2-3, 10-20 year timeline)
22. Coastal Blue Carbon Restoration (TIER 2, 20-30 year timeline)
23. Soil Carbon Injection (Biochar) (TIER 2, 10-20 year timeline)

### Legacy Remediation (3 technologies)

24. Active Sediment Management (TIER 2-3, 20-40 year timeline)
25. Phytoremediation Networks (TIER 2, 10-30 year timeline)
26. Soil Nutrient Drawdown (TIER 1-2, 10-30 year timeline)

---

## TIER 7B: Modeling Paradigm Shifts Summary

**Total Paradigm Shifts Identified:** 9 fundamental modeling changes required

### 1. Energy-Constrained Cleanup
- **Current:** Tech deployed → effectiveness applies
- **Needed:** effectiveness = f(available_energy_surplus, contamination_concentration)
- **Implementation:** Add `energyRequirement` and `minimumConcentration` properties, gate by `renewableSurplus`

### 2. Phased Deployment
- **Current:** `deployed: true` → immediate full effect
- **Needed:** Planning (2-7y) → Construction (3-10y) → Scale-up (10-30y) → Maturity (30-50y)
- **Implementation:** Add `DeploymentPhases` interface, effectiveness scales 0% → 10-30% → 30-80% → 80-100%

### 3. Irreversible Boundaries
- **Current:** All boundaries modeled as reversible flows
- **Needed:** Some boundaries are effectively permanent (extinctions, atmospheric contamination)
- **Implementation:** Add `irreversible: boolean` flag, model as asymptotic approach (never reaches zero)

### 4. Energy Budget Partitioning
- **Current:** Tech uses energy, no explicit budget constraint
- **Needed:** All energy-consuming tech competes for same limited clean energy
- **Implementation:** Track `renewableSurplus` globally, allocate among transport/industry/heating/DAC/cleanup

### 5. Legacy Stock Mechanics
- **Current:** Pollution as simple flow (inputs → outputs)
- **Needed:** Stock + flow with legacy decay (decades to centuries)
- **Implementation:** Track `legacyStock` with exponential decay (half-life 20-50 years)

### 6. Rebound Effects
- **Current:** Cleanup tech only reduces contamination
- **Needed:** Cleanup increases production rate (moral hazard)
- **Implementation:** Net effectiveness = (cleanup rate) - (induced production increase)

### 7. Functional Group Weighting
- **Current:** Biosphere score weights all species equally
- **Needed:** Weight by ecosystem function (pollinators >> megafauna)
- **Implementation:** Weight pollinators (10×), decomposers (8×), keystones (5×), megafauna (1×)

### 8. Nitrogen-Food Coupling
- **Current:** Nutrient reduction independent of food production
- **Needed:** Aggressive N cuts trigger famine
- **Implementation:** Nitrogen requirement = population × dietType.nitrogenPerCapita, gate by food security

### 9. Tipping Point Mechanics
- **Current:** Linear recovery
- **Needed:** Nonlinear state shift at habitat transformation threshold (50-90%)
- **Implementation:** Hysteresis mechanics (recovery path ≠ degradation path)

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
