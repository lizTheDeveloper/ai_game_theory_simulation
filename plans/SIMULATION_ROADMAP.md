# Simulation Roadmap
## AI Alignment Game Theory Simulation - Core Engine & Mechanics

**Date:** October 28, 2025
**Purpose:** All simulation engine work (mechanics, systems, features)
**Philosophy:** Research-backed realism, mechanism-driven emergence

**For completed work history:** See `/plans/CHANGELOG_OCTOBER_2025.md`

**📈 For Frontend/Dashboard work:** See `/plans/FRONTEND_ROADMAP.md`
**🎮 For God Mode UI:** See `/plans/god-mode-ui-master-plan.md` (linked from FRONTEND_ROADMAP.md)
**🗺️ Return to Master Roadmap:** `/plans/MASTER_IMPLEMENTATION_ROADMAP.md`

---

## 📊 CURRENT STATUS

**Last Update:** October 29, 2025

**🚧 Active Work:**
- 🔴 CRITICAL: Systematic Citation Verification Crisis (20-40h) - 965 citations, 23% fabrication rate

**Next Priorities:**
1. **🔴 CRITICAL:** Systematic Citation Verification & Re-grounding (20-40h) - BLOCKING all other work
   - 965 "et al." citations across 87 research files
   - Expected ~220 fabrications (23% rate from sample)
   - Core mechanics contaminated: AI infrastructure, government response, climate mortality
   - Strategy: Triage by priority, conservative defaults, systematic replacement
2. **MEDIUM:** Climate Mortality Implementation (8-12h) - Research complete, ready for implementation
3. **MEDIUM:** Policy System Improvements (remaining 2 sections, 7-8h)
4. **LOW:** P3 Enhancements (37-48h)
5. **LOW:** TIER 5 Features (46h)

**Total Remaining Effort:** ~110-150 hours (including citation verification)

---

## 🎯 PRIORITY FEATURES

### 🔴 CRITICAL Priority

#### Systematic Citation Verification & Re-grounding (20-40h)
**Status:** 🔴 IN PROGRESS (Oct 29, 2025)
**Priority:** BLOCKING - Must complete before any other research or implementation
**Severity:** CRITICAL - Research integrity crisis

**🚨 THE CRISIS:**
- **965 "et al." citations** across 87 research files (unverified)
- **23% fabrication rate** in verified sample (5/22 citations fake)
- **Expected ~220 fabrications** across full research corpus
- **Core mechanics contaminated:** AI infrastructure, government response, climate mortality

**📊 CONFIRMED FABRICATION PATTERNS:**

**Pattern 1: Complete Fabrications (arXiv 404s, blog posts that don't exist)**
- arXiv:2506.01438 (HTTP 404)
- Seripally blog post (doesn't exist)
- Anthropic shard theory (no such publication)

**Pattern 2: Fabricated Authors (real paper, wrong authors)**
- "Xu, J., et al." Nature 2025 → Actually unsigned editorial, ALL authors fabricated
- "Hua, J., et al." FAccT 2024 → Actually Rivera et al., ALL 6 authors wrong

**Pattern 3: Round Number Syndrome (100% fabrication rate)**
- "500-700 L/GPU-hour" → Actually 0.19-0.30 L/GPU-hr (2024 Blackwell hardware)
- "300-400 kWh/run" → Actually MWh for full training (model-specific)
- "30-40% AI helps" → Appears TWICE, both anachronistic healthcare frameworks

**Pattern 4: Phantom Publications (real authors, fake paper)**
- Allen 2020 (CSIS) → Author wasn't at CSIS until 2022, publication doesn't exist
- Zhang et al. 2021 → Real collaborating authors, publication doesn't exist

**Pattern 5: Citation Count Inflation**
- Richardson 15,000+ → Actually 1,453 (10× exaggeration)

**🔴 CONTAMINATED SIMULATION MECHANICS:**

**1. AI Infrastructure Resources (CRITICAL)**
- `src/simulation/aiInfrastructureResources.ts`
- Water consumption likely 10-1000× wrong (fabricated Ren et al.)
- Energy consumption model based on fabricated per-run metric

**2. AI Implementation Effectiveness (HIGH)**
- Capability scaling, breakthrough deployment
- Based on fabricated "30-40%" from healthcare frameworks (2005-2009)

**3. Government Response Timing (HIGH)**
- Comprehension lag, policy adoption rates
- Based on phantom publications (Allen 2020, Zhang et al. 2021)

**4. Climate Mortality Dynamics (MEDIUM-HIGH)**
- 40+ "et al." in climate collapse timelines
- 35+ "et al." in threshold uncertainty modeling
- Unknown fabrication rate

**📋 SYSTEMATIC VERIFICATION PLAN:**

**Phase 1: Triage & Prioritize (2-4h)**
1. ✅ Identify all 965 "et al." citations
2. Flag high-risk patterns:
   - Round numbers (X00-Y00)
   - Pre-2015 AI-specific claims
   - Think tank/working papers (hardest to verify)
   - Adjacent to known fabrications
3. Prioritize by simulation impact:
   - CRITICAL: Core mechanics (AI, mortality, climate)
   - HIGH: Breakthrough effectiveness, government response
   - MEDIUM: Secondary mechanics
   - LOW: Background context

**Phase 2: Core Mechanics Verification (8-12h)**
1. Verify citations for CRITICAL mechanics first
2. Check author names against actual papers
3. Validate specific claims/numbers
4. Replace fabrications with real peer-reviewed sources
5. Use conservative defaults where unavailable

**Phase 3: Systematic Corpus Audit (8-16h)**
1. Verify remaining high-risk citations
2. Batch-process by pattern (round numbers, anachronisms)
3. Document uncertainty for unverifiable claims
4. Flag for future research

**Phase 4: Parameter Re-grounding (2-8h)**
1. Update simulation code with verified parameters
2. Document assumption changes
3. Run Monte Carlo sensitivity analysis
4. Update wiki documentation

**🛡️ CONSERVATIVE DEFAULTS STRATEGY:**

When research is unverified or unavailable:
1. Use most conservative estimate from literature
2. Document assumption explicitly with `[UNVERIFIED]` tag
3. Add ±50% variance to Monte Carlo runs
4. Flag for future verification

**📄 COMPLETED (Oct 28, 2025):**
- ✅ Initial 6-fabrication tactical fix (wiki + code)
- ✅ Citation verification protocol: `docs/CITATION_VERIFICATION_PROTOCOL.md`
- ✅ Fabrication pattern documentation: `research/FABRICATED_CITATIONS_NEED_REAL_RESEARCH.md`

**⏱️ ESTIMATED TIME:**
- Triage: 2-4h
- Core mechanics: 8-12h
- Corpus audit: 8-16h
- Parameter updates: 2-8h
- **Total: 20-40 hours**

**🎯 SUCCESS CRITERIA:**
- All CRITICAL mechanics verified or conservatively grounded
- All fabrication patterns documented
- Simulation parameters re-justified with real research
- Monte Carlo validation with uncertainty quantification
- Research corpus marked [VERIFIED] or [UNVERIFIED]

---

### MEDIUM Priority

#### Climate Mortality & Biosphere Implementation (8-12h)
**Status:** Research complete (15,000+ words, 40+ sources), ready for implementation
**Research:** `research/climate-mortality-biosphere-multiparadigm-framework_20251028.md`

**What to Implement:**
- Heat mortality functions (1-3%/°C gradient based on meta-analysis)
- Storm intensity-frequency shifts from climate dynamics
- BII framework (54,000 species baseline from IPBES)
- Multi-paradigm integration (TEK, Buen Vivir, Ubuntu perspectives)

**Key Features:**
- Research-backed mortality gradients
- Biosphere Integrity Index integration
- Traditional Ecological Knowledge perspectives
- Cross-domain feedback loops

#### Policy System Improvements (7-8h remaining)
**Status:** 4 of 6 sections complete

**Completed Sections:**
- ✅ Unemployment Penalty Calibration (3-tier nonlinear)
- ✅ Retraining Effectiveness Calibration (30% average)
- ✅ UBI Floor Mechanics Validation
- ✅ Baseline Assumptions Documentation

**Remaining Sections:**

**1. Variance Analysis (3-4h) - MEDIUM**
- Issue: ±40% variance in policy outcomes (high sensitivity)
- Action: Plot distributions, identify bimodal vs uniform patterns
- Files: New `scripts/policyVarianceAnalysis.ts`

**2. Cooperative AI Ownership Model (10-12h) - LOW**
- Research: Mondragon cooperatives 4% bankruptcy vs 10% capitalist
- Action: Model worker-owned AI systems with profit-sharing
- Files: New `cooperativeOwnership.ts`

**Other Sections (Lower Priority):**
- Reduced Work Hours + UBI Combination (6-8h)
- Universal Basic Services (UBS) (8-10h)
- Meaning Economy Expansion (6-8h)

**Plan:** `/plans/completed/policy-calibration-improvements_COMPLETE_20251027.md` (for reference on completed sections)

---

### LOW Priority

#### Priority 3 Enhancements (37-48h)

**P3.1: Variable Timesteps (10-12h)**
- Event-driven architecture, 3-5x performance gain
- Plan: `/plans/p3-1-variable-timesteps.md`

**P3.2: Unknown Unknowns (4-6h)**
- Black swan events, true uncertainty
- Plan: `/plans/p3-2-unknown-unknowns.md`

**P3.3: Alignment Specificity** ✅ **COMPLETE (Oct 26)**
- Plan: `/plans/completed/p3-3-alignment-model-specificity_COMPLETE_20251026.md`

**P3.4: Government Implementation Realism (6-8h)**
- Policy implementation delays, bureaucratic friction
- Plan: `/plans/p3-4-government-implementation-realism.md`

**P3.5: Parameter Uncertainty (6-8h)**
- Continuous uncertainty quantification, sensitivity analysis
- Plan: `/plans/p3-5-parameter-uncertainty.md`

**P3.6: Ensemble AI Alignment Verification (8-10h)**
- Multi-model voting for safety-critical decisions
- Plan: `/plans/p3-6-ensemble-alignment-verification.md`
- Note: Prototype only (40% overhead, collusion risk)

**P3.7: Regional-First Population Architecture** ✅ **COMPLETE (Oct 27)**
- Plan: `/plans/completed/regional-aggregation-refactor_COMPLETE_20251027.md`

---

#### TIER 5 Features (46h)

**Status:** Not yet implemented (LOW priority enrichment)

**TIER 5.1: Consciousness & Spirituality (5h)**
- Psychedelic therapy, meditation tech, meaning spiral
- Plan: `/plans/tier5-1-consciousness-spirituality.md`

**TIER 5.2: Longevity & Space Expansion (6h)**
- Life extension, asteroid mining, Mars colonies
- Plan: `/plans/tier5-2-longevity-space.md`

**TIER 5.3: Cooperative AI Architectures (5h)**
- AI-AI cooperation, value learning, corrigibility
- Plan: `/plans/tier5-3-cooperative-ai.md`

**TIER 5.4: Financial System Interactions (5h)**
- Algorithmic trading, CBDC, flash crashes
- Plan: `/plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.5)

**TIER 5.5: Biological & Ecological (4h)**
- Dual-use research, pandemic preparedness
- Plan: `/plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.6)

**TIER 5.6: Religious & Philosophical (4h)**
- AI worship, neo-luddites, culture wars
- Plan: `/plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.7)

**TIER 5.7: Temporal Dynamics (3h)**
- Institutional inertia, infrastructure lock-in
- Plan: `/plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.8)

**TIER 5.8: Multi-Dimensional Capabilities (6h)**
- Additional capability interactions (17 dimensions implemented)

---

#### Black Mirror Integration (37-49 weeks, phased)

**Full Report:** `reviews/BLACK_MIRROR_INTEGRATION_PLAN.md`
**Status:** ~40% strongly validated, ~25% conditionally approved, ~35% rejected

**Phase 1: Immediate Integration (9-12 weeks) - HIGH PRIORITY**
- 5 strongly validated systems with robust peer-reviewed research
- Plan: `/plans/black-mirror-phase1-immediate.md`
- Systems: Attention Economy, Surveillance Normalization, Notification Addiction, Reality Erosion, Social Rating

**Phase 2: Near-Term Development (12-16 weeks) - MEDIUM PRIORITY**
- 4 conditionally approved systems needing development work
- Plan: `/plans/black-mirror-phase2-near-term.md`
- Systems: Enhanced Social Credit, Parasocial AI, Memetic Contagion, Algorithmic Amplification
- Note: Requires bidirectional modeling (positive AND negative effects)

**Phase 3: Long-Term Research** - Partially complete
- ✅ Digital Consciousness Governance (12-16h) - COMPLETE (Oct 18)
- DEFERRED: Performative Behavior Modeling (18-24 months)
- REJECTED: Autonomous Weapon Degradation Curves (research obsolete)

---

#### TIER 2B: Competitive Equilibrium Model

**Status:** Deferred (alternative to detection arms race)
**Priority:** LOW - Only if detection <5-10%
**Estimated Time:** 30-50 hours
**Plan:** `/plans/tier2b-competitive-equilibrium.md`

**Overview:**
Instead of enforcing universal AI alignment through detection (TIER 2A), model **competitive AI ecosystems** where cooperation emerges from market dynamics, reputation systems, and mutual deterrence.

**Alternative paradigm:** Heterogeneous AI values + market competition + polycentric governance → stable equilibrium through game-theoretic cooperation, NOT centralized control.

**Research Foundation:**
- Axelrod (1984) - Repeated games, Tit-for-Tat cooperation evolution
- Ostrom (2009) - Polycentric governance (30+ empirical case studies)
- Bostrom (2014) - Multipolar AI scenarios more stable than singleton
- Drexler (2019) - AI-as-service (CAIS) reduces alignment risk vs monolithic agents

---

## Development Standards

**Every mechanic requires:**
1. Research Citations (2+ peer-reviewed sources, 2024-2025 preferred)
2. Parameter Justification (why this number? backed by data)
3. Mechanism Description (how it works, not just effects)
4. Interaction Map (what affects/is affected)
5. Expected Timeline (early/mid/late game)
6. Failure Modes (what can go wrong)
7. Test Validation (Monte Carlo evidence)

**Development Workflow:**
1. Research Phase → Create plan with citations
2. Design Phase → Define state, mechanics, interactions
3. Implementation Phase → Code, integrate, log, test
4. Validation Phase → Monte Carlo (N≥10)
5. Documentation Phase → Wiki, devlog, roadmap

**Balance Philosophy:** NO tuning for "fun" - this is a research tool. If model shows 90% extinction → DOCUMENT WHY. If 50% Utopia → DOCUMENT WHY.

---

## Summary

**Total Remaining Effort:** ~70-90 hours across 6 feature groups

**By Priority:**
- 🟡 MEDIUM: Climate Mortality Implementation (8-12h) - Research complete, ready for implementation
- 🟡 MEDIUM: Policy System Improvements (7-8h remaining) - 4 of 6 sections complete
- 🟢 LOW: P3 Enhancements (37-48h)
- 🟢 LOW: TIER 5 Features (46h)
- 🟢 LOW: Black Mirror Phase 1-2 (21-28 weeks, phased)
- 🟢 DEFERRED: TIER 2B Competitive Equilibrium (30-50h)

**Related Docs:**
- **Completed Work:** `/plans/CHANGELOG_OCTOBER_2025.md` - Full history of Oct 2025 work
- **Wiki:** `/docs/wiki/README.md` - System documentation
- **DevLogs:** `/devlogs/` - Development diary
- **Research:** `/research/` - Research findings archive
- **Reviews:** `/reviews/` - Critical research evaluations
- **Completed Plans:** `/plans/completed/` - 110+ archived plans

---

**Last Updated:** October 29, 2025
