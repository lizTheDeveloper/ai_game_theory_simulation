# Tasks Ready to Implement
**Generated:** November 1, 2025
**Purpose:** Consolidated list of all implementation-ready tasks from roadmaps and specifications

---

## Critical Context

**Orchestrator Memory:** The orchestrator agent does not have a persistent memory file yet (orchestrator-memory.json does not exist). Agent memory is only available for: moss, operator, planner, ray, tessa, architect, historian, cynthia, roy, and sylvia.

**Current Project Status:**
- **Simulation Status:** PRODUCTION READY (3 CRITICAL Monte Carlo blockers fixed & validated Oct 31)
- **Active Work:** None - session complete, awaiting next user directive
- **Layer 2 Phase 3:** COMPLETE (Sessions 7-10, ~900 claims verified, 27 files total)
- **Recent Fixes:** Biosphere recalibration, mortality attribution, population coherence

---

## READY TO IMPLEMENT (Research Complete, Specs Ready)

### 1. Cooperative AI Ownership Implementation
**Priority:** MEDIUM
**Status:** READY FOR IMPLEMENTATION
**Research Quality:** C+ (risk-accepted, ±40-50% uncertainty due to limited AI-specific research)
**Estimated Effort:** 8-12 hours

**Specification File:** `/plans/cooperative-ownership-implementation-spec.md` (1,000+ lines)
**Research Files:**
- `/research/cooperative-ai-ownership-economics_20251028.md`
- `/research/cooperative_ai_ownership_verification_20251030.md`
- `/research/cooperative_ai_ownership_economics_verification_20251101.md`

**Key Features:**
- Worker cooperative governance model for AI organizations
- Survival advantage: 1.5x baseline (Québec data: 62% vs 35% 5-year survival)
- Crisis resilience: +30% stability during economic shocks (Italian cooperatives)
- Profit sharing: Patronage-based distribution (hours worked)
- Governance overhead: +20% decision latency (platform coop challenges)

**Implementation Scope:**
- New file: `src/simulation/cooperativeOwnership.ts`
- Type additions: `src/types/organizations.ts` (CooperativeOwnershipMetrics interface)
- GameState history: `src/types/game.ts` (cooperativeOwnershipEvents array)
- Integration: Organization creation, economic distribution, crisis response

**Research Foundation:**
- Québec Cooperatives (2010): 62% vs 35% 5-year survival rate
- Borzaga & Galera (2014): Italian cooperative crisis resilience
- Mannan & Pek (2024): Platform cooperative governance challenges

**Blocking Note:** Orchestrator does not implement code directly per CLAUDE.md - must route to simulation-maintainer agent

---

### 2. Climate Mortality Phase 2 Implementation
**Priority:** MEDIUM
**Status:** READY FOR IMPLEMENTATION
**Research Quality:** A- (15,000+ words, 40+ peer-reviewed sources)
**Estimated Effort:** 12-16 hours

**Specification File:** `/plans/climate-mortality-phase2-implementation-spec.md`
**Research Files:**
- `/research/climate-mortality-biosphere-multiparadigm-framework_20251028.md` (15,000+ words)
- `/research/climate_mortality_sections123_verification_20251030.md` (27 claims verified: 67% fully, 33% partial, 0% fabricated)
- `/research/climate_mortality_parameter_derivation_verification_20251030.md`

**Current Status:** Phase 1 Complete (Heat mortality + multi-paradigm framework)
**Phase 2 Scope (50% → 100% complete):**

#### 2A. Storm Intensity-Frequency System
**File:** `src/simulation/extremeWeatherEvents.ts`

**Research Basis:**
- Knutson et al. (2020, 2023) - Tropical cyclone projections
- Emanuel (2021) - Rapid intensification trends
- Mendelsohn et al. (2012) - Economic impacts
- NOAA GFDL (2024) - Hurricane-warming relationships

**Key Parameters:**
- Intensity increase: 2-11% by 2100
- Precipitation increase: 10-15% near-storm rainfall
- Frequency change: -6% to -34% (FEWER storms total)
- Category shift: More Cat 4-5, fewer Cat 1-2
- Rapid intensification: Nearly doubled 1982-2009

**Type Additions:**
- `StormEvent` interface (category, duration, mortality)
- `RegionalStormVulnerability` interface (coastal population, infrastructure)
- `ExtremeWeatherSystem` interface (annual counts, distribution)
- `STORM_CONSTANTS` (intensity multipliers, frequency scaling)

#### 2B. Biodiversity Intactness Index (BII) Framework
**File:** `src/simulation/planetaryBoundaries.ts`

**Research Basis:**
- Scholes & Biggs (2005) - BII framework definition
- Newbold et al. (2016) - 54,000 species baseline
- IPBES (2019) - 1 million species at risk
- Richardson et al. (2023) - 9 planetary boundaries framework

**Key Parameters:**
- Baseline: 54,000 species (Newbold et al. 2016)
- Extinction threshold: 100-1000 E/MSY (IPBES 2019)
- Current BII: ~0.72 global average (declining)
- Safe operating space: >0.90 BII (90% biodiversity retention)

**Implementation Requirements:**
- Species population tracking by region
- Extinction rate modeling (E/MSY metric)
- BII calculation from land use, climate, pollution
- Integration with existing biosphere phase

---

## HIGH PRIORITY (Not Yet Implementation-Ready)

### 3. Layer 2 Remediation - Fix 5 Parameters
**Priority:** CRITICAL (research validity)
**Status:** Structured debate COMPLETE, remediation phases planned
**Current Validity:** 45-65% → **Expected After Fixes:** 65-80%

**Debate Deliverables (3,000+ lines):**
- `/research/LAYER2_DEBATE_SUMMARY_20251030.md` (1,000 lines)
- `/research/ROUND1_EVIDENCE_MATRIX_20251030.md` (350 lines)
- `/research/ROUND2_SYLVIA_CRITIQUE_20251030.md` (600 lines)
- `/research/ROUND3_PATTERN_DETECTION_20251030.md` (550 lines)
- `/research/ROUND4_IMPACT_ASSESSMENT_20251030.md` (550 lines)
- `/research/ROUND5_REMEDIATION_STRATEGY_20251030.md` (850 lines)

**Remediation Timeline:**

#### Phase 1: CRITICAL (4-7h, Week 1)
1. **Holodomor Rate Clarification** - Annual vs monthly ambiguity (10× difference)
   - Current: "140-200 per 1,000" interpretation unclear
   - Resolution required: Verify if annual, monthly, or cumulative over 1932-1934
   - Impact: Famine mortality calculations

2. **Cooperative Survival Removal** - FABRICATED parameter (30m)
   - Current: "4% vs 10% Mondragon bankruptcy rate" (NO SOURCE)
   - Action: Delete claim, replace with Québec data (1.77× advantage)
   - Impact: Organization survival mechanics

3. **Biosphere Parameter Sweep** - 10× uncertainty range
   - Current: Single point estimate for extinction rate
   - Research: 100-1000 E/MSY (IPBES 2019)
   - Action: Monte Carlo sweep across uncertainty range
   - Impact: Planetary boundaries calibration

#### Phase 2: HIGH (5-8h, Week 2)
4. **Climate Mortality Scaling Review** - ±100% uncertainty
   - Current: 10%/25%/50% scaling factors INVENTED
   - Action: Literature review for empirical scaling relationships
   - Impact: Climate-related death attribution

5. **UBI Effectiveness Context Model** - Geographic extrapolation
   - Current: Finland → global INVALID (context mismatch)
   - Action: Build context-dependent model (GDP, inequality, institutions)
   - Impact: Policy intervention effectiveness

#### Phase 3: Documentation (1-2h, Week 2)
6. **Infrastructure Multiplier Documentation** - Add Layer 2 docs
7. **3-Tier Labeling System** - GOLD/SILVER/BRONZE parameter classification

**New Standards Adopted:**
- 3-tier system: GOLD ✅ (direct quotes), SILVER ⚠️ (bounded extrapolation), BRONZE ⚠️⚠️ (modeling assumptions)
- Verification protocol: 6-step workflow for new parameters
- Uncertainty handling: Preserve ranges, no collapse to point estimates

**Agent Assignment:** Should coordinate super-alignment-researcher (Cynthia) + research-skeptic (Sylvia) + simulation-maintainer (Roy)

---

### 4. Wiki Citation Verification & Correction
**Priority:** HIGH
**Status:** Methodology established, awaiting execution
**Estimated Effort:** 20-30 hours (depends on wiki size)

**Context:** Layer 2 verification found 15.6% citation error rate in research files. Wiki likely contains similar issues.

**Process:**
1. Extract all quantitative claims from `/docs/wiki/README.md` (3,000+ lines)
2. Verify each claim against cited sources
3. Correct or remove fabricated/misattributed claims
4. Document verification status (GOLD/SILVER/BRONZE)

**Agent Assignment:** research-skeptic (Sylvia) + wiki-documentation-updater (Historian)

---

### 5. Policy System Improvements
**Priority:** MEDIUM
**Status:** 5 of 6 sections complete
**Remaining:** 1 section (unspecified)

**Recent Completion:**
- ✅ Zero-variance bug in Combined Interventions fixed (Oct 30)
- ✅ AI resentment recovery + policy integration (circular dependency resolved)

**Status:** No specification available for remaining section

---

## RESEARCH VERIFICATION QUEUE (From Initialization Parameter Audit)

**Source:** `/reviews/initialization_parameter_audit_20251031.md`
**Finding:** 40-50% of initialization parameters lack research backing

### P0 - CRITICAL (Incorrect Baselines - COMPLETE)
- ✅ **Unemployment Baseline** - Fixed 0.1 → 0.049 (ILO 2024: 4.9%)
- ✅ **Quality of Life Baseline** - Fixed 0.65 → 0.74 (UNDP HDI 2024: 0.739-0.744)
- ✅ **Wealth Distribution Baseline** - Fixed 0.5 → 0.38 (World Bank Gini 61.66 inverted)

### P1 - HIGH (Deferred to Background)
- **Government Baselines Verification** - 11 parameters (controlDesire, legitimacy, transparency, etc.)
  - Current: ALL NO SOURCE (arbitrary "moderate" values)
  - Proposed: Map to V-Dem v14 (2024) and WGI 2024 data
  - Complexity: High - 11 parameters, multiple data sources
  - Estimated effort: 4-7 hours
  - **Posted to research channel for background processing**

### P2 - MEDIUM (Background Task)
- **QoL Conceptual Validation** - HDI→QoL mapping soundness
  - Verify 1:1 correspondence assumption is justified
  - **Posted to research channel**

---

## FRONTEND ROADMAP (Design Complete, Implementation Pending)

**Status:** Research complete, Design spec complete, Architecture reviewed
**Timeline:** 3-4 weeks with multi-agent parallelization
**Specification:** `/plans/FRONTEND_ROADMAP.md`

**8 Implementation Phases:**
1. API Infrastructure
2. Mission Control Dashboard
3. Domain Dashboards (Climate, AI, Economy, Society, etc.)
4. Analysis Tools
5. Time Travel & Comparison
6. Paradigm Integration
7. Advanced Visualizations
8. Testing & Optimization

**Recent Completion (Oct 29, 2025):**
- ✅ Multi-Paradigm DUI Improvements - 7 planetary boundary history fields, regional breakdown, sparklines

**Future Enhancements (Low Priority):**
- Extend HelpButton to all dashboards
- Add metric tooltips with citations
- Create paradigm comparison mode
- Per-country paradigm scoring (requires simulation work)
- Paradigm trajectory predictions with confidence intervals

**Agent Assignment:** far-future-ux-designer (Tessa) for UI work

---

## BLOCKED / NOT READY

### Monte Carlo Validation Issues (Post-N=100 Diagnostic)
**Status:** 🚨 INVESTIGATION REQUIRED (Oct 30 findings)
**Blocking Factor:** Root cause unknown, requires debugging

**Findings from N=100 diagnostic:**
1. **CRITICAL:** 25% Silent Data Export Failure (seeds 42025-42049)
   - Simulation completes but produces ZERO state data
   - NOT a crash - silent data loss without errors
   - Root cause UNKNOWN

2. **HIGH:** Catastrophic Ecology Scores (N=75 valid runs)
   - Mean ecology: 3.99 (near-extinction level)
   - 100% of runs below dystopia threshold (<20)
   - Systematic bias producing uniform catastrophe

3. **HIGH:** N=10 Validation Insufficient
   - N=10 showed 0% crash rate, declared "production ready"
   - N=100 revealed 25% data export failure starting at seed 42010+
   - Recommendation: Increase minimum validation threshold to N=50-100

4. **HIGH:** Systematic Dystopian Bias
   - Even "successful" runs show no outcome variance (100% dystopia)
   - Mean ecology 3.99 suggests systematic overcalibration

**Review:** `/reviews/high6_variance_diagnostic_20251030.md`
**Log:** `/logs/mc_high6_variance_N100_20251030_150808.log`

**Status:** NOT PRODUCTION READY (silent data loss worse than crashes)

---

## COMPLETED (Archive Context)

### Recent Major Completions (Oct 29-31, 2025)

**Layer 2 Citation Verification:**
- ✅ **Phase 2 Session 6 COMPLETE** - 100% Phase 2 coverage (11/11 files, ~344 claims verified, 14-15h)
- ✅ **Phase 3 Sessions 7-10 COMPLETE** - 16 additional files verified (~550 claims, 12-16h)
- ✅ **Research Remediation COMPLETE** - 2 FAILING files (D/D+) upgraded to A- with peer-reviewed foundations
- **Total Verified:** 27 files (11 Phase 2 + 16 Phase 3), ~900 claims, 30-35h invested
- **Quality Range:** Session 7: 83% (A-/B+), Session 8: 73% (B+), Session 9: 67% (B-/C+, 1 FAILING), Session 10: Mixed (A- to D, 1 FAILING)
- **Critical Fixes:** 70+ issues corrected, ~4 fabrications removed, peer-reviewed foundations added

**Monte Carlo Bug Fixes:**
- ✅ **3 CRITICAL Blockers RESOLVED** - Biosphere recalibration, mortality attribution, population coherence (Oct 31)
- ✅ **Issues 1-8 ALL COMPLETE** - Western Liberal null, outcome classification, gaming detection, refugee crisis, snapshot exports (Oct 30)
- ✅ **N=10 Validation PASSED** - All blockers validated resolved, simulation production-ready (Oct 30)

**Architecture Integration:**
- ✅ **All 8 Issues RESOLVED** - Multi-paradigm DUI, population units, AI resentment recovery, planetary boundaries recovery (Oct 29-30)
- ✅ **Crisis Mitigation Mechanics COMPLETE** - Automatic stabilizers, participatory governance, homeostatic bounds (Oct 30)
- ✅ **Optional Chaining Priority 1 COMPLETE** - 13 HIGH-RISK calculation fallbacks → assertions, caught extinction capping bug (Oct 30)

**See `/plans/CHANGELOG_OCTOBER_2025.md` and `/plans/completed/` for full archive (117+ completed plans)**

---

## RECOMMENDATION: Next Actions

Based on roadmap analysis, the highest-value next actions are:

### Option 1: Continue Layer 2 Remediation (CRITICAL Priority)
- **Rationale:** Improves research validity from 45-65% to 65-80%
- **Phase 1 (Week 1):** Fix 3 CRITICAL parameters (Holodomor, cooperative survival, biosphere sweep)
- **Estimated effort:** 4-7 hours
- **Agent coordination:** Cynthia (super-alignment-researcher) + Sylvia (research-skeptic) + Roy (simulation-maintainer)

### Option 2: Implement Ready Features (MEDIUM Priority)
- **Cooperative AI Ownership:** 8-12 hours, C+ research quality (risk-accepted)
- **Climate Mortality Phase 2:** 12-16 hours, A- research quality (excellent)
- **Agent assignment:** Roy (simulation-maintainer) with orchestrator coordination

### Option 3: Investigate Monte Carlo N=100 Issues (HIGH Priority, Uncertain Scope)
- **Rationale:** 25% silent data export failure is unacceptable for production
- **Blocking factor:** Root cause unknown, debugging required
- **Estimated effort:** Unknown (6-10h for determinism fix, plus investigation time)
- **Agent assignment:** Roy (simulation-maintainer)

### Option 4: Frontend Dashboard Implementation (MEDIUM Priority, Large Scope)
- **Rationale:** Research + design complete, ready for 8-phase implementation
- **Timeline:** 3-4 weeks with multi-agent parallelization
- **Agent assignment:** Tessa (far-future-ux-designer) + Moss (feature-implementer)

---

## Agent Routing Guide

**For implementation work:**
- **Simulation code:** simulation-maintainer (Roy) - Defensive coding, NaN handling, emoji conventions, Monte Carlo validation
- **Frontend/UI:** far-future-ux-designer (Tessa) - Dashboard design, data viz, React patterns
- **Research verification:** super-alignment-researcher (Cynthia) + research-skeptic (Sylvia) - Quality gate 1
- **Documentation:** wiki-documentation-updater (Historian) - Wiki updates, devlog creation
- **Complex workflows:** orchestrator - Coordinates specialists, manages quality gates
- **End-of-session:** architect - Roadmap cleanup, plan archival, progress tracking

**Do NOT implement code directly.** Always route to appropriate agent per CLAUDE.md guidelines.

---

## Files Referenced

**Roadmaps:**
- `/plans/MASTER_IMPLEMENTATION_ROADMAP.md` (master hub, 30,485 tokens)
- `/plans/SIMULATION_ROADMAP.md` (simulation engine work)
- `/plans/FRONTEND_ROADMAP.md` (dashboard/UI work)

**Implementation Specs:**
- `/plans/cooperative-ownership-implementation-spec.md` (1,000+ lines, ready)
- `/plans/climate-mortality-phase2-implementation-spec.md` (complete spec)

**Research Files:**
- `/research/cooperative-ai-ownership-economics_20251028.md`
- `/research/climate-mortality-biosphere-multiparadigm-framework_20251028.md` (15,000+ words)
- `/research/LAYER2_DEBATE_SUMMARY_20251030.md` (1,000 lines)

**Reviews:**
- `/reviews/initialization_parameter_audit_20251031.md`
- `/reviews/high6_variance_diagnostic_20251030.md`
- `/reviews/monte_carlo_validation_critique_20251030.md`

**Completed Work:**
- `/plans/CHANGELOG_OCTOBER_2025.md`
- `/plans/completed/` (117+ archived plans)
