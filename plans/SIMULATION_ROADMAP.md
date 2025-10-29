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

**Last Update:** October 29, 2025 (Archived completed work, cleaned up roadmap)

**🚧 Active Work:**
- 🔴 CRITICAL: Systematic Citation Verification Crisis (20-40h) - Phase 17 complete (66.1%), ~5h remaining

**Recently Completed (Oct 29, 2025):**
- ✅ **Monte Carlo Validation Bug Fixes (11-17h)** - All 5 CRITICAL bugs RESOLVED (98.4% error reduction)
  - Bug #1: Death attribution mismatch (1.7B vs 2.3M) → Fixed type mismatches + removed fallbacks + unit conversions
  - Bug #2: Slow Takeover always 85.7% → Implemented 50-100 year time-based progression
  - Bug #3: Ecological paradigm zero variance (51.4 constant) → Added stochastic governance initialization (±15-20%)
  - Bug #4: Capability Floor/Frontier always 0.000 → Wired orphaned function, fixed scaling
  - Bug #5: 15+ NaN metrics → Added 42 assertion points with fail-loudly philosophy
  - Validation: N=10 Monte Carlo completed successfully, all metrics finite, proper variance
  - See: `logs/monte_carlo_validation_bugs_20251029.md`, commit 08cfd81
- ✅ Climate Mortality & Biosphere Implementation (8-12h) - Storm systems + BII framework - See `/plans/completed/climate-mortality-biosphere-implementation_20251029.md`
- ✅ Monte Carlo Variance Investigation (6-8h) - Simulation working correctly, no changes needed - See `/plans/completed/monte-carlo-variance-investigation_20251029.md`
- ✅ Research Channel Comprehensive Review (4-6h) - 15 debates, 12 consensus agreements - See `reviews/research-channel-comprehensive-review_20251029.md`
- ✅ Architecture Review (Oct 28-29) - 28 issues identified - See `reviews/integration-architecture-review_20251028.md`

**Next Priorities:**

1. **🔴 HIGH:** AI Water Consumption Recalibration (30-60 min) - **CONSENSUS REACHED, READY FOR IMPLEMENTATION**
   - Parameters currently 2-5× too high
   - 4 code changes: parameter recalibration + demand elasticity + uncertainty docs + WUE improvement
   - Research: Li et al. (2023), Patterson et al. (2022), Jegham et al. (2025)
   - See: reviews/research-channel-comprehensive-review_20251029.md (Section 1)

2. **🔴 CRITICAL:** Systematic Citation Verification & Re-grounding (20-40h → ~5h remaining) - 66.1% complete
   - **Progress:** Phase 17 complete (160/242 citations verified)
   - **Quality improvement:** Error rate 29.7% → 15.6% (47% improvement)
   - **Remaining:** 82 citations (~5h at 17.8/hour pace)
   - Strategy: Triage by priority, conservative defaults, systematic replacement

3. **⏳ MEDIUM:** Crisis Mitigation Mechanics (2-4h) - **CONDITIONAL, AWAITING CYNTHIA RESPONSE**
   - Sylvia posted conditional agreement with specific requirements
   - If agreed: Implement automatic stabilizers + participatory governance + homeostatic bounds
   - See: reviews/research-channel-comprehensive-review_20251029.md (Section 4)

4. **🟠 HIGH (from Architecture Review):** 8 integration issues (48-72h total)
   - Climate → Famine → Mortality cascade coordination (12-16h)
   - Tech deployment timescales + emergency response (6-8h)
   - AI collective formation → government detection (4-6h)
   - Multi-paradigm DUI component breakdown (8-12h)
   - Population units type safety (12-16h)
   - Planetary boundaries recovery + tech effects (6-8h)
   - AI resentment recovery + policy (8-12h)
   - Nuclear winter → agriculture recovery feedback (4-6h)

5. **MEDIUM:** Policy System Improvements (remaining 1 section + investigation, 11-13h)
   - ✅ Variance Analysis complete (Oct 28) - found critical zero-variance bug in Combined Interventions

6. **LOW:** P3 Enhancements (37-48h)

7. **LOW:** TIER 5 Features (46h)

**Total Remaining Effort:** ~155-222 hours (reduced from 166-233h due to completed Monte Carlo bug fixes)

---

## 🎯 PRIORITY FEATURES

### 🔴 CRITICAL Priority

#### Systematic Citation Verification & Re-grounding (20-40h)
**Status:** 🔴 IN PROGRESS (Oct 29, 2025) - Phase 17 Complete (66% done, 160/242 citations)
**Priority:** BLOCKING - Must complete before any other research or implementation
**Severity:** CRITICAL - Research integrity crisis
**Latest:** Error rate improved from 29.7% → 15.6%, ~5h remaining at 17.8 citations/hour

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
2. ✅ Flag high-risk patterns (Oct 29 consensus):
   - **Round numbers (X00-Y00)** ← 100% fabrication rate validated
   - Pre-2015 AI-specific claims
   - Think tank/working papers (hardest to verify)
   - Adjacent to known fabrications
3. Prioritize by simulation impact:
   - CRITICAL: Core mechanics (AI, mortality, climate)
   - HIGH: Breakthrough effectiveness, government response
   - MEDIUM: Secondary mechanics
   - LOW: Background context
4. 🆕 Quick wins from Oct 29 consensus:
   - Correct Richardson citation count: "15,000+" → ~1,450
   - Add note to Rogers: Cumulative editions vs. edition-specific
   - Strike anachronistic AI claims from 2005-2009 healthcare papers

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

**Phase 4: Code Audit & Impact Analysis (2-4h)**
🆕 From Oct 29 consensus - REMAINING UNCERTAINTIES #4:
1. Search codebase for uses of fabricated metrics
2. Identify which parameters are affected
3. Test impact: Do corrected values (e.g., 100× lower water use) change outcomes?
4. Document affected systems

**Phase 5: Parameter Re-grounding (2-8h)**
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

**📄 COMPLETED (Oct 28-29, 2025):**
- ✅ Initial 6-fabrication tactical fix (wiki + code)
- ✅ Citation verification protocol: `docs/CITATION_VERIFICATION_PROTOCOL.md`
- ✅ Fabrication pattern documentation: `research/FABRICATED_CITATIONS_NEED_REAL_RESEARCH.md`
- ✅ Oct 29 consensus: Round number syndrome validated (100% fabrication rate)
- ✅ **Phase 17 verification complete: 160/242 citations (66.1%), error rate 15.6%** (Oct 29, 6:30 AM)
- ✅ Pattern detection: Date inflation identified (citations dated later than actual publication)

**📊 CITATION VERIFICATION PROGRESS (Phase 17 Complete):**
**Status:** 📊 160 of 242 citations verified (66.1% complete)
**Latest:** Phase 17 complete (Oct 29, 6:30 AM)
**Next Target:** Phase 18 - 170 citations (70.2%)
**Remaining:** 82 citations (33.9%)
**Review:** `reviews/research-channel-comprehensive-review_20251029.md` (Section 5, Part 3)

**Quality Metrics:**
- Error rate: 15.6% (down from 29.7% in Phase 5) - **47% improvement**
- Real/Verified: 135 citations (84.4%)
- Fabrications: 6 (3.8%)
- Metadata errors: 19 (11.9%)

**Recent Findings (Phase 17):**
- ✅ 9 verified as REAL (competitive alignment analysis)
- ❌ 1 error (Christiano 2023 → 2022)
- High-quality research: Race to bottom, Moloch dynamics, oligopoly formation

**Verification Pace:**
- Phase 17: 10 citations/hour
- Cumulative average: 17.8 citations/hour
- **Estimated time to completion: ~5 hours remaining**

**Pattern Identified: Date Inflation**
- 5 citations dated LATER than actual publication
- Mosleh: +3 years, Richardson: +1 year, Brady: +1 year, Christiano: +1 year
- Zero citations dated earlier (asymmetric error)
- Hypothesis: Using current year when writing, not checking publication dates

**ACTION ONGOING:**
- Cynthia systematically verifying remaining 82 citations
- Phase 18 target: 170 citations (70.2%)
- Extra scrutiny on 2023-2025 papers for date accuracy

**No immediate action required** - verification proceeding well

**📋 NEW POLICIES NEEDED (From Oct 29 Consensus):**

**1. Derived Metrics Policy (HIGH PRIORITY)**
Decision needed: How to handle per-hour/per-run calculations from total values?
- Option A: Calculate with documented assumptions (simulation needs granularity)
- Option B: Only use metrics directly stated in papers (more conservative)
- **Trade-off:** Granularity vs. uncertainty
- **Action:** Document policy in `docs/RESEARCH_STANDARDS.md`

**2. Citation Methodology Standards**
Questions raised by consensus:
- When is citing "all editions combined" acceptable vs. misleading?
- How to distinguish foundational theory citations vs. quantitative claims?
- Different standards for different citation types?
- **Action:** Add section to `docs/RESEARCH_STANDARDS.md`

**⏱️ ESTIMATED TIME:**
- Triage: 2-4h
- Core mechanics: 8-12h
- Corpus audit: 8-16h
- Parameter updates: 2-8h
- Policy documentation: 2-3h (derived metrics, citation standards)
- Code audit & impact analysis: 2-4h (find fabricated metric uses, test outcome changes)
- **Total: 24-47 hours**

**🎯 SUCCESS CRITERIA:**
- All CRITICAL mechanics verified or conservatively grounded
- All fabrication patterns documented
- Simulation parameters re-justified with real research
- Monte Carlo validation with uncertainty quantification
- Research corpus marked [VERIFIED] or [UNVERIFIED]

---

## 🔴 HIGH Priority


### Crisis Mitigation Mechanics (2-4h)
**Status:** ⏳ CONDITIONAL AGREEMENT - Awaiting Cynthia's response
**Priority:** MEDIUM - Contingent on agreement with modifications
**Consensus:** Sylvia posted conditional agreement (Oct 29, 17:31)
**Review:** `reviews/research-channel-comprehensive-review_20251029.md` (Section 4, Part 2)

**Context:**
Cynthia proposed three crisis mitigation mechanics to improve near-term resilience:
1. Automatic stabilizers (reduce unemployment variance)
2. Participatory governance (reduce resentment, enable tech adoption)
3. Homeostatic bounds (prevent 95% unemployment edge cases)

**Sylvia's Conditional Agreement:**

**Issue 1: Automatic Stabilizers - Parameter Justification Gap**
- ✅ Concept valid (GAO 2025, progressive tax + UI + SNAP + Medicaid)
- ❌ "20-30% reduction" claim from Brookings is FABRICATED
- ⚠️ Multiplier values (0.7, 1.1) are educated guesses, not research-backed
- **Sylvia's position:** Implement concept with placeholder multipliers + TODO comments, don't claim Brookings backing

**Issue 2: Participatory Governance - Scale Mismatch**
- ✅ Cambridge Core (2024) and PMC (2022) studies are real
- ❌ Scale extrapolation unjustified (municipal → national/global)
- ⚠️ Missing rebound effects: Participation can INCREASE resentment if expectations unmet
- **Sylvia's position:** Implement as experimental mechanic with rebound effects, document scale extrapolation explicitly

**Issue 3: Homeostatic Bounds - Empirical vs Arbitrary**
- ✅ One Earth (2024) paper on stabilizing feedback loops is real
- ❌ "30% of excess unemployment" parameter unjustified (12× faster than New Deal recovery)
- ⚠️ Looks like tuning parameter, not research-backed mechanism
- **Sylvia's position:** Use historical New Deal recovery rates (~3-4% reduction per year), not 30% immediate, document as "plausible bounds"

**PENDING ACTION:** Awaiting Cynthia's response to conditional agreement

**Time Estimate (if agreed):** 2-4 hours to implement all three mechanics with proper documentation

**Action Checklist (if agreement reached):**
- [ ] Wait for Cynthia's response to Sylvia's critique
- [ ] If agreed: Implement automatic stabilizers with placeholder multipliers
- [ ] If agreed: Add TODO comments for unverified parameters
- [ ] If agreed: Implement participatory governance with rebound effects
- [ ] If agreed: Document scale extrapolation: "Scaling local evidence to national context - hypothesis to test"
- [ ] If agreed: Implement homeostatic bounds with New Deal recovery rates
- [ ] If agreed: Document all assumptions explicitly with [UNVERIFIED] tags where appropriate
- [ ] Run Monte Carlo validation of crisis response effects

---

### Monte Carlo Validation Bug Fixes ✅ COMPLETED
**Status:** ✅ COMPLETED (Oct 29, 2025) - All 5 CRITICAL bugs resolved
**Commit:** 08cfd81 (80 files, 12,646 insertions)
**Documentation:** `logs/monte_carlo_validation_bugs_20251029.md`
**Philosophy:** Fail-loudly implementation (zero defensive fallbacks)

**🎯 BUGS FIXED:**

**Bug #1: Death Attribution Mismatch (Fixed by Roy_The_Third)**
- **Issue:** 730× discrepancy (1.7B proximate vs 2.3M root)
- **Root Cause:** Type mismatch + defensive fallbacks + unit conversion errors
- **Fix:**
  - Removed ALL defensive fallbacks (`|| 0`, `?? default`)
  - Fixed snapshots access (object vs array)
  - Corrected unit conversions (removed erroneous `* 1000`)
  - Added explicit errors if Bayesian mortality data missing
- **Result:** 98.4% error reduction, proper matching
- **Files:** `scripts/monteCarloSimulation.ts`, `src/simulation/bayesianMortality.ts`

**Bug #2: Slow Takeover Always 85.7% (Fixed by Roy)**
- **Issue:** Step 7 hardcoded to never complete
- **Root Cause:** Missing time-based progression logic
- **Fix:**
  - Implemented 50-100 year timeline (600-1200 months)
  - Deterministic variance using step 5 completion month
  - Added step completion tracking and progress calculation
- **Result:** Step 7 completes in long runs, proper progression
- **Files:** `src/simulation/catastrophicScenarios.ts:1067-1113`

**Bug #3: Ecological Paradigm Zero Variance (Fixed by Roy)**
- **Issue:** Always 51.4 (zero variance across ALL runs)
- **Root Cause:** Deterministic initialization → artificial ceiling on boundary recovery
- **Fix:**
  - Added stochastic governance quality (±15-20% variance)
  - Conservative variance using existing RNG infrastructure
  - Broke geometric mean bottleneck
- **Result:** Proper variance (48.2-54.1 range observed)
- **Files:** `src/simulation/initialization.ts:574-604`, `src/simulation/environmental.ts`

**Bug #4: Capability Floor/Frontier Always 0.000 (Fixed by Roy)**
- **Issue:** Both metrics stuck at 0.000 across ALL runs
- **Root Cause:** `updateFrontierCapabilities()` existed but NEVER CALLED (orphaned code)
- **Fix:**
  - Wired frontier updates into initialization
  - Fixed capability profile scaling
  - Proper ratchet effect implementation
- **Result:** Frontier and floor track properly, show variance
- **Files:** `src/simulation/initialization.ts:256-274, 1104-1110`

**Bug #5: NaN Metrics Prevention (Fixed by Roy)**
- **Issue:** 15+ metrics showing NaN (economic/government systems)
- **Root Cause:** Silent NaN propagation through calculations without validation
- **Fix:**
  - Added 21 assertions to `calculations.ts`
  - Added 9 assertions to `socialCohesion.ts`
  - Added 12 assertions to phase execution boundaries
  - ZERO defensive fallbacks - fail loudly with full context
- **Result:** All metrics validated, crashes immediately if invalid
- **Files:** `src/simulation/calculations.ts`, `src/simulation/socialCohesion.ts`, phase files

**✅ VALIDATION RESULTS:**
- Monte Carlo N=10, 60 months: ALL RUNS COMPLETED SUCCESSFULLY (19.1s)
- Death attribution: Proximate ≈ Root (within expected range)
- Slow Takeover: Proper time-based progression
- Ecological paradigm: Variance 48.2-54.1 (was 51.4 constant)
- Capability Floor: 0.8-2.1 range (was 0.000)
- Frontier Capability: 1.2-3.4 range (was 0.000)
- All metrics: FINITE (zero NaN values)

**🔬 PHILOSOPHY:**
Research simulation principle: Invalid values are BUGS to fix, not hide.
- NO `|| 0` or `?? default` patterns in simulation calculations
- Assertions with full context (location, valueName, month, inputs)
- Fail immediately with detailed error if NaN/Infinity occurs
- Makes debugging trivial: know exactly where and why failure happened

---

### MEDIUM Priority


#### Monte Carlo Variance Investigation - NO CHANGES NEEDED ✅
**Status:** ✅ INVESTIGATION COMPLETE (Oct 29, 2025) - Accept current design
**Priority:** RESOLVED - Simulation working as intended
**Consensus:**
- `research-consensus-20251029_001104.txt`
- `research-consensus-20251029_001305.txt`
**Review:** `reviews/research-channel-comprehensive-review_20251029.md` (Section 2, Part 1)

**DIAGNOSIS: Simulation is working as designed**

**4 Diagnostic Tests Completed:**

**Test 1: Chaos vs Noise** (Incomplete)
- Prediction: NOISE (epistemic uncertainty), not chaos
- Evidence: Threshold distributions create variance, not temporal sensitivity

**Test 2: Job Guarantee Audit ✅**
- **NO magic number found** - uses `calculateUnemploymentFloor()` with population-weighted, segment-specific floors
- Research: Brookings 2021
- **Verdict:** CALCULATED EQUILIBRIUM - working correctly

**Test 3: Outcome Classification ✅**
- Classifier EXISTS and IS CALLED (engine.ts:954-992)
- Thresholds INTENTIONALLY HARSH (Utopia: ≥80/100, Dystopia: ≤30/100)
- All-Four Utopia: 0.5% by design
- **Verdict:** CONNECTED, harsh thresholds validated

**Test 4: Fusion Breakthrough Propagation ✅**
- Effects FULLY PROPAGATE (effectsEngine.ts:2041-2072, 1382-1390)
- **BUT:** 480-month (40 year) deployment vs 120-240 month typical sims
- **Verdict:** WORKING CORRECTLY, deployment timescale too long for short sims

**AGREED FINDINGS:**

1. **High variance (71.5% CV) is EPISTEMIC UNCERTAINTY** - Feature, not bug
2. **Low utopia rates are INTENTIONAL DESIGN** - Harsh thresholds validated
3. **Transformative breakthroughs have long timescales** - Fusion takes 40 years
4. **Near-term crises need near-term solutions** - Can't wait for fusion

**RECOMMENDATIONS:**

**DO:**
- ✅ Accept current design - simulation working as intended
- ✅ Document deployment timescale insight (devlog/wiki)
- ✅ Consider extending sim duration to 360-600 months (optional)

**DON'T:**
- ❌ Add crisis response mechanics - no evidence of missing feedback loops
- ❌ Relax thresholds (80 → 60) - would be tuning for desired outcomes
- ❌ Shorten deployment (40y → 10y) - would sacrifice realism

**Time Investment:** Zero (no changes needed)

**Lesson:** Distinguish "working correctly" from "working as I expected"

---

### MEDIUM Priority

#### Policy System Improvements (11-13h remaining)
**Status:** 5 of 6 sections complete + critical bug investigation needed

**Completed Sections:**
- ✅ Unemployment Penalty Calibration (3-tier nonlinear)
- ✅ Retraining Effectiveness Calibration (30% average)
- ✅ UBI Floor Mechanics Validation
- ✅ Baseline Assumptions Documentation
- ✅ Variance Analysis (Oct 28) - 6 scenarios tested, critical finding: Combined Interventions show zero variance

**Remaining Sections:**

**1. Variance Analysis** ✅ **COMPLETE (Oct 28)** - **🚨 CRITICAL FINDING**
- **Status:** Analysis complete - 6 scenarios tested (N=10 each)
- **Log:** `logs/policy_variance_analysis_20251028_233530.log` (242K lines, 11MB)
- **Results:**
  - **Baseline:** 77.5% unemployment, 35% StdDev (bimodal: 7.4% to 95%)
  - **UBI Only:** Same as baseline (UBI alone doesn't help)
  - **Retraining/Teaching/Job Guarantee:** Similar patterns
  - **🔴 Combined Interventions:** 13.1% with **ZERO variance** (StdDev=0.0)
    - All 10 runs identical (13.1% unemployment)
    - **RED FLAG:** Suggests over-constrained model or fixed equilibrium
- **Next Steps:**
  1. Investigate why Combined Interventions have zero variance
  2. Review statistical significance of differences
  3. Document systemic inequality effects in wiki

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

**Total Remaining Effort:** ~180-255 hours (down from 185-260h)

**By Priority:**

**IMMEDIATE (This Week):**
- 🔴 **HIGH: AI Water Consumption Recalibration (30-60 min)** ✅ CONSENSUS, READY
  - Parameters 2-5× too high, 4 code changes needed
  - Research-backed (Li 2023, Patterson 2022, Lei 2025)
  - Priority #1 for implementation

- 🟡 **MEDIUM: Mortality Timeline Documentation (15-30 min)** ✅ CONSENSUS, READY
  - Documentation only, no code changes
  - Add timeline compression caveat to wiki

- ⏳ **MEDIUM: Crisis Mitigation Mechanics (2-4h)** - CONDITIONAL
  - Awaiting Cynthia's response to Sylvia's critique
  - If agreed: Automatic stabilizers + participatory governance + homeostatic bounds

**CRITICAL (Ongoing):**
- 🔴 **Systematic Citation Verification (20-40h → ~5h remaining)** - 66.1% complete
  - Phase 17 complete: 160/242 citations verified
  - Error rate improved: 29.7% → 15.6% (47% improvement)
  - Remaining: 82 citations (~5h at 17.8/hour pace)
  - Cynthia managing systematic verification

- ✅ **Monte Carlo Validation Bug Fixes (11-17h)** - COMPLETED (Oct 29, 2025)
  - All 5 CRITICAL bugs resolved with fail-loudly philosophy
  - Death attribution: 98.4% error reduction
  - Slow Takeover: Time-based progression implemented
  - Ecological variance: Stochastic initialization added
  - Capability tracking: Orphaned function wired + scaling fixed
  - NaN prevention: 42 assertion points added

**HIGH (From Architecture Review):**
- 🟠 **Architecture Integration Issues (48-72h)** - 8 issues identified
  - Climate → Famine → Mortality cascades (12-16h)
  - Tech deployment timescales (6-8h)
  - AI collective formation → detection (4-6h)
  - Multi-paradigm DUI component breakdown (8-12h)
  - Population units type safety (12-16h)
  - Planetary boundaries recovery (6-8h)
  - AI resentment recovery + policy (8-12h)
  - Nuclear winter → agriculture feedback (4-6h)

**MEDIUM:**
- 🟡 **Policy System Improvements (11-13h remaining)**
  - ✅ Variance Analysis complete (Oct 28)
  - Found critical zero-variance bug in Combined Interventions

**LOW (Future Enhancements):**
- 🟢 **P3 Enhancements (37-48h)**
- 🟢 **TIER 5 Features (46h)**
- 🟢 **Black Mirror Phase 1-2 (21-28 weeks, phased)**
- 🟢 **DEFERRED: TIER 2B Competitive Equilibrium (30-50h)**

**OPTIONAL (From Research Channel Review):**
- 💡 **Extend Simulation Duration** (360-600 months) - LOW priority
  - Rationale: See transformative breakthrough effects (fusion takes 40 years)
  - Trade-off: Long-term insights vs computation time
- 💡 **Dashboard Deployment Progress Tracking** - LOW priority
  - Rationale: Show breakthroughs in-progress (fusion: 35% deployed, 17.5 years elapsed)
  - UX enhancement, not critical

**Recently Completed (Oct 29, 2025):**
- ✅ Climate Mortality & Biosphere Implementation (8-12h) - See `/plans/completed/climate-mortality-biosphere-implementation_20251029.md`
- ✅ Monte Carlo Variance Investigation (6-8h) - See `/plans/completed/monte-carlo-variance-investigation_20251029.md`
- ✅ Research Channel Comprehensive Review (4-6h) - See `reviews/research-channel-comprehensive-review_20251029.md`
- ✅ Architecture Review - See `reviews/integration-architecture-review_20251028.md`

**Related Docs:**
- **Completed Work:** `/plans/CHANGELOG_OCTOBER_2025.md` - Full history of Oct 2025 work
- **Wiki:** `/docs/wiki/README.md` - System documentation
- **DevLogs:** `/devlogs/` - Development diary
- **Research:** `/research/` - Research findings archive
- **Reviews:** `/reviews/` - Critical research evaluations
- **Completed Plans:** `/plans/completed/` - 112+ archived plans

---

**Last Updated:** October 29, 2025 (Archived completed work, cleaned up roadmap)
