# Research Update Queue
<<<<<<< HEAD
<<<<<<< HEAD
**Generated:** 11/6/2025, 11:30:07 PM
**Files Scanned:** 318
=======
**Generated:** 11/6/2025, 9:30:05 PM
**Files Scanned:** 317
>>>>>>> origin/auto/researcher-20251106_213001
=======
**Last Updated:** November 6, 2025
**Last Verified By:** Autonomous Research Worker

This file tracks research items that need updates, verification, or additional sources.

## =4 CRITICAL Priority (Immediate Action Required)

### 1. Cavalcanti 2025 - Misinterpretation of Aid Effectiveness
**Issue:** Code models "donor availability tiers" but paper measures "USAID funding levels"
**Impact:** Fundamental modeling error - wrong concept being measured
**Source:** `src/simulation/config/centralConfig.ts:621-729`
**Action:**
- Rename variables to reflect funding levels (not donor availability)
- Find peer-reviewed research on donor fatigue during simultaneous crises
- Use age-appropriate mortality values (6%, 9%, 15% overall - not preschool 21%, 28%, 44%)
**Status:** CRITICAL - Blocks accurate humanitarian aid modeling
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

### 2. Ballester 2024 - Heat Adaptation Total Max Too High
**Issue:** Code claims 80% total reduction, paper shows ~44% overall
**Impact:** Simulation is MORE optimistic than empirical data supports
**Source:** `src/simulation/config/centralConfig.ts:1166-1170`
**Action:**
- Reduce `HEAT_ADAPTATION_TOTAL_MAX` from 0.8 to 0.45
- OR find additional supporting sources for 80% value
- OR mark as "extrapolation beyond empirical maximum"
**Status:** CRITICAL - Overestimates heat mortality protection
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

### 3. IOM 2024 - Migration Parameters Not in Source
**Issue:** 10 of 11 parameters citing IOM 2024 are not found in the World Migration Report
**Impact:** Parameters lack quantitative research backing
**Source:** `src/simulation/config/centralConfig.ts:555-619, 1176-1194`
**Parameters Missing:**
- 85% success rate
- 0.1% baseline mortality
- 3% maximum mortality
- 85% annual return rate
- Crisis penalty curves (30%, 40%)
- Distance-based mortality factors
**Action:**
- Search UNHCR Statistical Yearbooks for quantitative migration data
- Search Migration Policy Institute for displacement outcomes
- Search humanitarian reports (MSF, UNHCR) for refugee mortality statistics
- Mark as [MODELING ASSUMPTIONS] if no sources found
**Status:** CRITICAL - 10 parameters unsourced
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`
>>>>>>> origin/auto/researcher-20251106_193001

---

## =с HIGH Priority (Should Update Soon)

### 4. Ballester 2024 - Heat Adaptation Type-Specific Breakdown
**Issue:** Paper shows 44% total, but code breaks this into 20%, 30%, 50%, 40% by type
**Impact:** Type-specific effectiveness values are extrapolations, not empirical
**Source:** `src/simulation/config/centralConfig.ts:1126-1160`
**Action:**
- Find research on physiological vs behavioral vs infrastructure adaptation effectiveness
- OR mark as "estimated breakdown from total 44% (Ballester 2024)"
- Verify physiological adaptation develops over "weeks" (paper says "weeks to years")
**Status:** HIGH - General finding verified, but breakdown is extrapolated
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

### 5. Donor Fatigue - Pakistan/Haiti 2010 Example
**Issue:** Code cites "Pakistan 2010: 50% of Haiti's aid" but no peer-reviewed source
**Impact:** Donor fatigue concept lacks academic backing
**Source:** `src/simulation/config/centralConfig.ts:621-625`
**Action:**
- Verify Pakistan 2010 / Haiti 2010 funding comparison
- Find peer-reviewed research on donor fatigue during simultaneous crises
- Search for "humanitarian funding competition" literature
**Status:** HIGH - Historical example may be accurate but needs academic source
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

### 6. GAO 2025 - Emergency Response Mortality Effectiveness
**Issue:** GAO report is descriptive (workforce issues), not quantitative (mortality impact)
**Impact:** 20-40% mortality reduction range is estimate, not empirical
**Source:** `src/simulation/config/centralConfig.ts:631-751, 1199-1213`
**Action:**
- Search for peer-reviewed disaster response effectiveness literature
- Look for FEMA vs non-FEMA disaster mortality comparisons
- Use historical case studies (Katrina, Japan 2011) with measured outcomes
- Currently marked WEAK EVIDENCE (correct), but needs stronger sources
**Status:** HIGH - Currently transparent about weakness, but better sources exist
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

---

<<<<<<< HEAD
## тЪая╕П HIGH (Action Required Within 1 Month)

**Count:** 129 (40.6%)

### `CITATION_CORRECTIONS_APPLIED_PHASE11-14.md`
- **Oldest source:** 2009 (16 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_CORRECTIONS_APPLIED_PHASE11-14.md`

### `CITATION_CORRECTIONS_APPLIED_PHASE15.md`
- **Oldest source:** 1981 (44 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_CORRECTIONS_APPLIED_PHASE15.md`

### `CITATION_CORRECTIONS_APPLIED_PHASE17.md`
- **Oldest source:** 1984 (41 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_CORRECTIONS_APPLIED_PHASE17.md`

### `CITATION_CORRECTIONS_APPLIED_PHASE19-23.md`
- **Oldest source:** 2013 (12 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_CORRECTIONS_APPLIED_PHASE19-23.md`

### `CITATION_CORRECTIONS_APPLIED_PHASE2.md`
- **Oldest source:** 2016 (9 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_CORRECTIONS_APPLIED_PHASE2.md`

### `CITATION_CORRECTIONS_APPLIED_PHASE24_FINAL.md`
- **Oldest source:** 1989 (36 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_CORRECTIONS_APPLIED_PHASE24_FINAL.md`

### `CITATION_CORRECTIONS_APPLIED_PHASE3.md`
- **Oldest source:** 2015 (10 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_CORRECTIONS_APPLIED_PHASE3.md`

### `CITATION_CORRECTIONS_APPLIED_PHASE5.md`
- **Oldest source:** 2012 (13 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_CORRECTIONS_APPLIED_PHASE5.md`

### `CITATION_CORRECTIONS_APPLIED_PHASE6-7.md`
- **Oldest source:** 2011 (14 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_CORRECTIONS_APPLIED_PHASE6-7.md`

### `CITATION_CORRECTIONS_APPLIED_PHASE8.md`
- **Oldest source:** 2001 (24 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_CORRECTIONS_APPLIED_PHASE8.md`

### `CITATION_VERIFICATION_PROGRESS.md`
- **Oldest source:** 1999 (26 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_VERIFICATION_PROGRESS.md`

### `CITATION_VERIFICATION_SESSION_SUMMARY.md`
- **Oldest source:** 2012 (13 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_VERIFICATION_SESSION_SUMMARY.md`

### `CITATION_VERIFICATION_SUMMARY.md`
- **Oldest source:** 2017 (8 years old)
- **Status:** Not used in simulation
- **Path:** `research/CITATION_VERIFICATION_SUMMARY.md`

### `CRISIS_MITIGATION_RESEARCH_CRITIQUE_20251029.md`
- **Oldest source:** 2001 (24 years old)
- **Status:** Not used in simulation
- **Path:** `research/CRISIS_MITIGATION_RESEARCH_CRITIQUE_20251029.md`

### `DOWNLOADED_PDFS_MANIFEST.md`
- **Oldest source:** 2016 (9 years old)
- **Status:** Not used in simulation
- **Path:** `research/DOWNLOADED_PDFS_MANIFEST.md`

### `FABRICATED_CITATIONS_NEED_REAL_RESEARCH.md`
- **Oldest source:** 2005 (20 years old)
- **Status:** Not used in simulation
- **Path:** `research/FABRICATED_CITATIONS_NEED_REAL_RESEARCH.md`

### `FAKE_CITATIONS_REPLACEMENTS.md`
- **Oldest source:** 2016 (9 years old)
- **Status:** Not used in simulation
- **Path:** `research/FAKE_CITATIONS_REPLACEMENTS.md`

### `FAKE_CITATION_FOUND.md`
- **Oldest source:** 2016 (9 years old)
- **Status:** Not used in simulation
- **Path:** `research/FAKE_CITATION_FOUND.md`

### `LAYER2_PHASE2_VERIFICATION_STATUS.md`
- **Oldest source:** 2016 (9 years old)
- **Status:** Not used in simulation
- **Path:** `research/LAYER2_PHASE2_VERIFICATION_STATUS.md`

### `MISATTRIBUTIONS_TRIAGE.md`
- **Oldest source:** 1993 (32 years old)
- **Status:** Not used in simulation
- **Path:** `research/MISATTRIBUTIONS_TRIAGE.md`

### `PDF_MANIFEST.md`
- **Oldest source:** 1970 (55 years old)
- **Status:** Not used in simulation
- **Path:** `research/PDF_MANIFEST.md`

### `PHASE2_LAYER2_SESSION11_SUMMARY_20251031.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/PHASE2_LAYER2_SESSION11_SUMMARY_20251031.md`

### `PHASE2_LAYER2_SESSION12_SUMMARY_20251031.md`
- **Oldest source:** 2012 (13 years old)
- **Status:** Not used in simulation
- **Path:** `research/PHASE2_LAYER2_SESSION12_SUMMARY_20251031.md`

### `PHASE2_LAYER2_SESSION13_SUMMARY_20251101.md`
- **Oldest source:** 2007 (18 years old)
- **Status:** Not used in simulation
- **Path:** `research/PHASE2_LAYER2_SESSION13_SUMMARY_20251101.md`

### `PHASE2_LAYER2_SESSION14_SUMMARY_20251101.md`
- **Oldest source:** 2013 (12 years old)
- **Status:** Not used in simulation
- **Path:** `research/PHASE2_LAYER2_SESSION14_SUMMARY_20251101.md`

### `PHASE2_LAYER2_SESSION16_SUMMARY_20251101.md`
- **Oldest source:** 2002 (23 years old)
- **Status:** Not used in simulation
- **Path:** `research/PHASE2_LAYER2_SESSION16_SUMMARY_20251101.md`

### `PHASE2_LAYER2_SESSION18_PLAN_20251102.md`
- **Oldest source:** 1969 (56 years old)
- **Status:** Not used in simulation
- **Path:** `research/PHASE2_LAYER2_SESSION18_PLAN_20251102.md`

### `PHASE2_LAYER2_SESSION4_SUMMARY_20251030.md`
- **Oldest source:** 2009 (16 years old)
- **Status:** Not used in simulation
- **Path:** `research/PHASE2_LAYER2_SESSION4_SUMMARY_20251030.md`

### `PHASE2_LAYER2_SESSION5_SUMMARY_20251031.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/PHASE2_LAYER2_SESSION5_SUMMARY_20251031.md`

### `PHASE2_LAYER2_SESSION6_SUMMARY_20251031.md`
- **Oldest source:** 1991 (34 years old)
- **Status:** Not used in simulation
- **Path:** `research/PHASE2_LAYER2_SESSION6_SUMMARY_20251031.md`

### `ROUND2_SYLVIA_CRITIQUE_20251030.md`
- **Oldest source:** 2006 (19 years old)
- **Status:** Not used in simulation
- **Path:** `research/ROUND2_SYLVIA_CRITIQUE_20251030.md`

### `ROUND5_REMEDIATION_STRATEGY_20251030.md`
- **Oldest source:** 2009 (16 years old)
- **Status:** Not used in simulation
- **Path:** `research/ROUND5_REMEDIATION_STRATEGY_20251030.md`

### `UNVERIFIED_CITATIONS_TRIAGE.md`
- **Oldest source:** 2008 (17 years old)
- **Status:** Not used in simulation
- **Path:** `research/UNVERIFIED_CITATIONS_TRIAGE.md`

### `ai_collective_evolution_20251024.md`
- **Oldest source:** 2008 (17 years old)
- **Status:** Not used in simulation
- **Path:** `research/ai_collective_evolution_20251024.md`

### `ai_collective_evolution_validation_verification_20251031.md`
- **Oldest source:** 2008 (17 years old)
- **Status:** Not used in simulation
- **Path:** `research/ai_collective_evolution_validation_verification_20251031.md`

### `ai_collective_evolution_verification_20251101.md`
- **Oldest source:** 2008 (17 years old)
- **Status:** Not used in simulation
- **Path:** `research/ai_collective_evolution_verification_20251101.md`

### `ai_safety_climate_crossdomain_verification_20251031.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/ai_safety_climate_crossdomain_verification_20251031.md`

### `ai_welfare_framework_20251020.md`
- **Oldest source:** 1988 (37 years old)
- **Status:** Not used in simulation
- **Path:** `research/ai_welfare_framework_20251020.md`

### `ai_welfare_framework_verification_20251031.md`
- **Oldest source:** 1988 (37 years old)
- **Status:** Not used in simulation
- **Path:** `research/ai_welfare_framework_verification_20251031.md`

### `ai_welfare_redesign_adversarial_resistant_verification_20251031.md`
- **Oldest source:** 2014 (11 years old)
- **Status:** Not used in simulation
- **Path:** `research/ai_welfare_redesign_adversarial_resistant_verification_20251031.md`

### `ai_welfare_v2_relationship_revision_20251021.md`
- **Oldest source:** 1969 (56 years old)
- **Status:** Not used in simulation
- **Path:** `research/ai_welfare_v2_relationship_revision_20251021.md`

### `alignment_dynamics_research_questions_20251024.md`
- **Oldest source:** 2015 (10 years old)
- **Status:** Not used in simulation
- **Path:** `research/alignment_dynamics_research_questions_20251024.md`

### `alignment_technique_network_completion_20251031.md`
- **Oldest source:** 2018 (7 years old)
- **Status:** Not used in simulation
- **Path:** `research/alignment_technique_network_completion_20251031.md`

### `black-mirror-phase3-research-AMENDED_20251016.md`
- **Oldest source:** 2000 (25 years old)
- **Status:** Not used in simulation
- **Path:** `research/black-mirror-phase3-research-AMENDED_20251016.md`

### `black-mirror-phase3-research_20251016.md`
- **Oldest source:** 2013 (12 years old)
- **Status:** Not used in simulation
- **Path:** `research/black-mirror-phase3-research_20251016.md`

### `black_mirror_phase3_research_verification_20251101.md`
- **Oldest source:** 2013 (12 years old)
- **Status:** Not used in simulation
- **Path:** `research/black_mirror_phase3_research_verification_20251101.md`

### `catastrophe-recovery-analysis-phase1c_20251017.md`
- **Oldest source:** 1989 (36 years old)
- **Status:** Not used in simulation
- **Path:** `research/catastrophe-recovery-analysis-phase1c_20251017.md`

### `catastrophe-recovery-timescales_20251017.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/catastrophe-recovery-timescales_20251017.md`

### `catastrophe_recovery_timescales_verification_20251101.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/catastrophe_recovery_timescales_verification_20251101.md`

### `citation_skeptic_analysis_20251028.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/citation_skeptic_analysis_20251028.md`

### `climate-mortality-biosphere-multiparadigm-framework_20251028.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/climate-mortality-biosphere-multiparadigm-framework_20251028.md`

### `climate-mortality-phase2-validation-cynthia-20251101.md`
- **Oldest source:** 2012 (13 years old)
- **Status:** Not used in simulation
- **Path:** `research/climate-mortality-phase2-validation-cynthia-20251101.md`

### `climate_collapse_timelines_20251026.md`
- **Oldest source:** 2007 (18 years old)
- **Status:** Not used in simulation
- **Path:** `research/climate_collapse_timelines_20251026.md`

### `climate_collapse_timelines_verification_20251031.md`
- **Oldest source:** 2007 (18 years old)
- **Status:** Not used in simulation
- **Path:** `research/climate_collapse_timelines_verification_20251031.md`

### `climate_collapse_timelines_verification_20251101.md`
- **Oldest source:** 2008 (17 years old)
- **Status:** Not used in simulation
- **Path:** `research/climate_collapse_timelines_verification_20251101.md`

### `climate_mortality_sections123_verification_20251030.md`
- **Oldest source:** 2011 (14 years old)
- **Status:** Not used in simulation
- **Path:** `research/climate_mortality_sections123_verification_20251030.md`

### `climate_timescale_validation_ipcc_ar6_20251106.md`
- **Oldest source:** 2016 (9 years old)
- **Status:** Not used in simulation
- **Path:** `research/climate_timescale_validation_ipcc_ar6_20251106.md`

### `climate_tipping_timescales_20251106.md`
- **Oldest source:** 2016 (9 years old)
- **Status:** Not used in simulation
- **Path:** `research/climate_tipping_timescales_20251106.md`

### `competitive_ai_alignment_20251016.md`
- **Oldest source:** 1995 (30 years old)
- **Status:** Not used in simulation
- **Path:** `research/competitive_ai_alignment_20251016.md`

### `competitive_alignment_failure_modes_20251016.md`
- **Oldest source:** 1995 (30 years old)
- **Status:** Not used in simulation
- **Path:** `research/competitive_alignment_failure_modes_20251016.md`

### `competitive_alignment_failure_modes_verification_20251101.md`
- **Oldest source:** 1995 (30 years old)
- **Status:** Not used in simulation
- **Path:** `research/competitive_alignment_failure_modes_verification_20251101.md`

### `cooperative-ownership-validation-cynthia-20251101.md`
- **Oldest source:** 2014 (11 years old)
- **Status:** Not used in simulation
- **Path:** `research/cooperative-ownership-validation-cynthia-20251101.md`

### `cooperative_ai_ownership_economics_verification_20251101.md`
- **Oldest source:** 2014 (11 years old)
- **Status:** Not used in simulation
- **Path:** `research/cooperative_ai_ownership_economics_verification_20251101.md`

### `cooperative_ai_ownership_remediation_complete_20251101.md`
- **Oldest source:** 2013 (12 years old)
- **Status:** Not used in simulation
- **Path:** `research/cooperative_ai_ownership_remediation_complete_20251101.md`

### `cooperative_ai_ownership_verification_20251030.md`
- **Oldest source:** 2009 (16 years old)
- **Status:** Not used in simulation
- **Path:** `research/cooperative_ai_ownership_verification_20251030.md`

### `crisis_cascade_multipliers_verification_20251031.md`
- **Oldest source:** 2009 (16 years old)
- **Status:** Not used in simulation
- **Path:** `research/crisis_cascade_multipliers_verification_20251031.md`

### `dashboard_visualization_best_practices_20251022.md`
- **Oldest source:** 1997 (28 years old)
- **Status:** Not used in simulation
- **Path:** `research/dashboard_visualization_best_practices_20251022.md`

### `de_extinction_capabilities_timelines_verification_20251031.md`
- **Oldest source:** 2008 (17 years old)
- **Status:** Not used in simulation
- **Path:** `research/de_extinction_capabilities_timelines_verification_20251031.md`

### `death_attribution_methodology_20251018.md`
- **Oldest source:** 2007 (18 years old)
- **Status:** Not used in simulation
- **Path:** `research/death_attribution_methodology_20251018.md`

### `emergency_response_deployment_times_20251020.md`
- **Oldest source:** 2012 (13 years old)
- **Status:** Not used in simulation
- **Path:** `research/emergency_response_deployment_times_20251020.md`

### `emergency_response_deployment_times_verification_20251101.md`
- **Oldest source:** 2012 (13 years old)
- **Status:** Not used in simulation
- **Path:** `research/emergency_response_deployment_times_verification_20251101.md`

### `extinction_rate_uncertainty_bounds_20251102.md`
- **Oldest source:** 2014 (11 years old)
- **Status:** Not used in simulation
- **Path:** `research/extinction_rate_uncertainty_bounds_20251102.md`

### `extracted-research-questions.md`
- **Oldest source:** 2000 (25 years old)
- **Status:** Not used in simulation
- **Path:** `research/extracted-research-questions.md`

### `famine_distribution_mechanisms_20251030.md`
- **Oldest source:** 1981 (44 years old)
- **Status:** Not used in simulation
- **Path:** `research/famine_distribution_mechanisms_20251030.md`

### `famine_distribution_mechanisms_verification_20251102.md`
- **Oldest source:** 1981 (44 years old)
- **Status:** Not used in simulation
- **Path:** `research/famine_distribution_mechanisms_verification_20251102.md`

### `hendrycks_2021_citation_verification.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/hendrycks_2021_citation_verification.md`

### `instrumental_convergence_citation_verification_20251029.md`
- **Oldest source:** 2008 (17 years old)
- **Status:** Not used in simulation
- **Path:** `research/instrumental_convergence_citation_verification_20251029.md`

### `lenton_2019_tipping_cascades_verification_20251029.md`
- **Oldest source:** 2008 (17 years old)
- **Status:** Not used in simulation
- **Path:** `research/lenton_2019_tipping_cascades_verification_20251029.md`

### `mayer_1995_trust_restoration_verification_20251029.md`
- **Oldest source:** 1993 (32 years old)
- **Status:** Not used in simulation
- **Path:** `research/mayer_1995_trust_restoration_verification_20251029.md`

### `memetic-contagion-system_20251028.md`
- **Oldest source:** 2007 (18 years old)
- **Status:** Not used in simulation
- **Path:** `research/memetic-contagion-system_20251028.md`

### `memetic_contagion_system_verification_20251101.md`
- **Oldest source:** 2001 (24 years old)
- **Status:** Not used in simulation
- **Path:** `research/memetic_contagion_system_verification_20251101.md`

### `mitigation_technologies_20251015.md`
- **Oldest source:** 2003 (22 years old)
- **Status:** Not used in simulation
- **Path:** `research/mitigation_technologies_20251015.md`

### `modeling-contingency-and-agency-debate_20251017.md`
- **Oldest source:** 1987 (38 years old)
- **Status:** Not used in simulation
- **Path:** `research/modeling-contingency-and-agency-debate_20251017.md`

### `mortality_caps_historical_data_20251027.md`
- **Oldest source:** 2006 (19 years old)
- **Status:** Not used in simulation
- **Path:** `research/mortality_caps_historical_data_20251027.md`

### `mortality_stabilizers_failure_conditions_20251106.md`
- **Oldest source:** 2010 (15 years old)
- **Status:** Not used in simulation
- **Path:** `research/mortality_stabilizers_failure_conditions_20251106.md`

### `organizational-technology-deployment-timelines_20251019.md`
- **Oldest source:** 1990 (35 years old)
- **Status:** Not used in simulation
- **Path:** `research/organizational-technology-deployment-timelines_20251019.md`

### `outcome_variance_mechanisms_20251030.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/outcome_variance_mechanisms_20251030.md`

### `paradigm_1_western_liberal_20251019.md`
- **Oldest source:** 1999 (26 years old)
- **Status:** Not used in simulation
- **Path:** `research/paradigm_1_western_liberal_20251019.md`

### `paradigm_2_development_needs_20251019.md`
- **Oldest source:** 1955 (70 years old)
- **Status:** Not used in simulation
- **Path:** `research/paradigm_2_development_needs_20251019.md`

### `paradigm_4_indigenous_communitarian_20251019.md`
- **Oldest source:** 1992 (33 years old)
- **Status:** Not used in simulation
- **Path:** `research/paradigm_4_indigenous_communitarian_20251019.md`

### `paradigm_conflicts_analysis_20251019.md`
- **Oldest source:** 2018 (7 years old)
- **Status:** Not used in simulation
- **Path:** `research/paradigm_conflicts_analysis_20251019.md`

### `paradigm_metric_mapping_20251019.md`
- **Oldest source:** 2015 (10 years old)
- **Status:** Not used in simulation
- **Path:** `research/paradigm_metric_mapping_20251019.md`

### `phase3-critical-juncture-validation_20251017.md`
- **Oldest source:** 1989 (36 years old)
- **Status:** Not used in simulation
- **Path:** `research/phase3-critical-juncture-validation_20251017.md`

### `phase3-future-scenarios_20251017.md`
- **Oldest source:** 1972 (53 years old)
- **Status:** Not used in simulation
- **Path:** `research/phase3-future-scenarios_20251017.md`

### `policy-economics-debate_20251016.md`
- **Oldest source:** 1984 (41 years old)
- **Status:** Not used in simulation
- **Path:** `research/policy-economics-debate_20251016.md`

### `policy-interventions-systemic-inequality-validation_20251016.md`
- **Oldest source:** 2011 (14 years old)
- **Status:** Not used in simulation
- **Path:** `research/policy-interventions-systemic-inequality-validation_20251016.md`

### `post-recalibration-fixes-validation_20251019.md`
- **Oldest source:** 2003 (22 years old)
- **Status:** Not used in simulation
- **Path:** `research/post-recalibration-fixes-validation_20251019.md`

### `predicts-database-verification_20251106.md`
- **Oldest source:** 2017 (8 years old)
- **Status:** Not used in simulation
- **Path:** `research/predicts-database-verification_20251106.md`

### `psychological_warfare_success_rates_verification_20251101.md`
- **Oldest source:** 1994 (31 years old)
- **Status:** Not used in simulation
- **Path:** `research/psychological_warfare_success_rates_verification_20251101.md`

### `raymond_et_al_2020_wet_bulb_verification_20251030.md`
- **Oldest source:** 2010 (15 years old)
- **Status:** Not used in simulation
- **Path:** `research/raymond_et_al_2020_wet_bulb_verification_20251030.md`

### `robock_citation_clarification_20251030.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/robock_citation_clarification_20251030.md`

### `rousseau_1998_trust_recovery_verification_20251029.md`
- **Oldest source:** 1998 (27 years old)
- **Status:** Not used in simulation
- **Path:** `research/rousseau_1998_trust_recovery_verification_20251029.md`

### `simulation_mortality_validation_20251028.md`
- **Oldest source:** 2015 (10 years old)
- **Status:** Not used in simulation
- **Path:** `research/simulation_mortality_validation_20251028.md`

### `simulation_mortality_verification_20251031.md`
- **Oldest source:** 2007 (18 years old)
- **Status:** Not used in simulation
- **Path:** `research/simulation_mortality_verification_20251031.md`

### `slovic_1993_trust_asymmetry_verification_20251029.md`
- **Oldest source:** 1993 (32 years old)
- **Status:** Not used in simulation
- **Path:** `research/slovic_1993_trust_asymmetry_verification_20251029.md`

### `spanish_flu_1918_historical_validation_20251101.md`
- **Oldest source:** 2002 (23 years old)
- **Status:** Not used in simulation
- **Path:** `research/spanish_flu_1918_historical_validation_20251101.md`

### `swarm_intelligence_citation_verification_20251029.md`
- **Oldest source:** 1987 (38 years old)
- **Status:** Not used in simulation
- **Path:** `research/swarm_intelligence_citation_verification_20251029.md`

### `technology-diffusion-io-psychology_20251019.md`
- **Oldest source:** 1989 (36 years old)
- **Status:** Not used in simulation
- **Path:** `research/technology-diffusion-io-psychology_20251019.md`

### `technology_diffusion_io_psychology_verification_20251101.md`
- **Oldest source:** 1982 (43 years old)
- **Status:** Not used in simulation
- **Path:** `research/technology_diffusion_io_psychology_verification_20251101.md`

### `threshold_tier2_historical_ranges_20251026.md`
- **Oldest source:** 1970 (55 years old)
- **Status:** Not used in simulation
- **Path:** `research/threshold_tier2_historical_ranges_20251026.md`

### `threshold_tier2_historical_ranges_verification_20251101.md`
- **Oldest source:** 1999 (26 years old)
- **Status:** Not used in simulation
- **Path:** `research/threshold_tier2_historical_ranges_verification_20251101.md`

### `threshold_tier3_scenarios_20251026.md`
- **Oldest source:** 2014 (11 years old)
- **Status:** Not used in simulation
- **Path:** `research/threshold_tier3_scenarios_20251026.md`

### `threshold_tier3_scenarios_verification_20251031.md`
- **Oldest source:** 2014 (11 years old)
- **Status:** Not used in simulation
- **Path:** `research/threshold_tier3_scenarios_verification_20251031.md`

### `threshold_uncertainty_modeling_20251021.md`
- **Oldest source:** 2009 (16 years old)
- **Status:** Not used in simulation
- **Path:** `research/threshold_uncertainty_modeling_20251021.md`

### `threshold_uncertainty_modeling_verification_20251101.md`
- **Oldest source:** 2009 (16 years old)
- **Status:** Not used in simulation
- **Path:** `research/threshold_uncertainty_modeling_verification_20251101.md`

### `tier2_parameter_validation_20251026.md`
- **Oldest source:** 2002 (23 years old)
- **Status:** Not used in simulation
- **Path:** `research/tier2_parameter_validation_20251026.md`

### `tier2_params_verification_20251031.md`
- **Oldest source:** 1991 (34 years old)
- **Status:** Not used in simulation
- **Path:** `research/tier2_params_verification_20251031.md`

### `ubi_floor_mechanics_verification_20251030.md`
- **Oldest source:** 2016 (9 years old)
- **Status:** Not used in simulation
- **Path:** `research/ubi_floor_mechanics_verification_20251030.md`

### `validation-summary-ready-for-implementation-20251101.md`
- **Oldest source:** 2014 (11 years old)
- **Status:** Not used in simulation
- **Path:** `research/validation-summary-ready-for-implementation-20251101.md`

### `verification_9f29b05_20251030.md`
- **Oldest source:** 2004 (21 years old)
- **Status:** Not used in simulation
- **Path:** `research/verification_9f29b05_20251030.md`

### `verification_a5188f3_20251106.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/verification_a5188f3_20251106.md`

### `verification_d6e80e8_20251106.md`
- **Oldest source:** 2013 (12 years old)
- **Status:** Not used in simulation
- **Path:** `research/verification_d6e80e8_20251106.md`

### `visionary_ideas_research_validation_2025-10-16.md`
- **Oldest source:** 2014 (11 years old)
- **Status:** Not used in simulation
- **Path:** `research/visionary_ideas_research_validation_2025-10-16.md`

### `water_scarcity_migration_immobility_20251020.md`
- **Oldest source:** 2012 (13 years old)
- **Status:** Not used in simulation
- **Path:** `research/water_scarcity_migration_immobility_20251020.md`

### `water_scarcity_migration_immobility_verification_20251101.md`
- **Oldest source:** 2012 (13 years old)
- **Status:** Not used in simulation
- **Path:** `research/water_scarcity_migration_immobility_verification_20251101.md`

### `water_scarcity_migration_verification_20251031.md`
- **Oldest source:** 2012 (13 years old)
- **Status:** Not used in simulation
- **Path:** `research/water_scarcity_migration_verification_20251031.md`

### `welfare_quality_of_life_frameworks_20251019.md`
- **Oldest source:** 2011 (14 years old)
- **Status:** Not used in simulation
- **Path:** `research/welfare_quality_of_life_frameworks_20251019.md`

### `welfare_quality_of_life_frameworks_verification_20251101.md`
- **Oldest source:** 2019 (6 years old)
- **Status:** Not used in simulation
- **Path:** `research/welfare_quality_of_life_frameworks_verification_20251101.md`

### `xia_vs_shi_food_security_resolution_20251106.md`
- **Oldest source:** 2007 (18 years old)
- **Status:** Not used in simulation
- **Path:** `research/xia_vs_shi_food_security_resolution_20251106.md`
=======
## =т MEDIUM Priority (Verify When Time Permits)

### 7. Major Economy Collapse Thresholds
**Issue:** 3 of 5 parameters marked [RESEARCH NEEDED]
**Source:** `src/simulation/config/centralConfig.ts:702-736`
**Parameters:**
- Economic collapse definition (stage 2.0 threshold)
- Major economy population threshold (300M)
- Global crisis threshold (50% of major economies)
**Action:**
- Search economic collapse literature (IMF, World Bank definitions)
- Historical population crash data verification (Black Death 30-60%)
- Systemic risk / cascading failure thresholds
**Status:** MEDIUM - Historical analogy used, but needs modern research
**Discovered:** 2025-11-06

### 8. Cascade Multipliers - Humanitarian System Interdependence
**Issue:** 4 of 5 cascade parameters marked [RESEARCH NEEDED]
**Source:** `src/simulation/config/centralConfig.ts:913-947`
**Parameters:**
- Aid failure Т emergency response degradation (50%)
- Aid failure Т migration degradation (30%)
- Emergency failure Т migration degradation (50%)
- Functional system threshold (30%)
**Action:**
- Search for humanitarian logistics research
- System interdependence literature (infrastructure networks)
- Cascading failure thresholds
**Status:** MEDIUM - Modeling assumptions, reasonable but unsourced
**Discovered:** 2025-11-06
>>>>>>> origin/auto/researcher-20251106_193001

---

##  Recently Verified (2025-11-06)

<<<<<<< HEAD
**Count:** 17 (5.3%)
=======
### Ballester et al. (2024) - Heat Adaptation General Finding
**Status:**  VERIFIED (with caveats)
- Paper confirms ~44% mortality reduction from adaptation (80% higher without)
- Elderly populations show ~50% reduction (100% higher without)
- Timeline: "weeks to years" (supports general approach, not specific rates)
**Caveats:** Total max and type-specific breakdown still need verification (see CRITICAL #2, HIGH #4)
>>>>>>> origin/auto/researcher-20251106_193001

### Cavalcanti et al. (2025) - USAID Funding Impact
**Status:** а VERIFIED BUT MISAPPLIED
- Paper measures funding levels (low: 6%, intermediate: 9%, high: 15% overall mortality reduction)
- Preschool age shows higher values (21%, 28%, 44%)
- Code incorrectly interprets this as "donor availability tiers" (see CRITICAL #1)

### GAO (2025) - FEMA Workforce Crisis
**Status:**  PARTIALLY VERIFIED
- 4% workforce availability during Nov 2024 hurricanes: CONFIRMED
- Workforce reduction 25,800 Т 23,350 (Jan-June 2025): CONFIRMED
- Mortality effectiveness estimates: NOT IN REPORT (see HIGH #6)

### IOM (2024) - Climate Migration Context
**Status:** а QUALITATIVE ONLY
- Report exists and discusses climate migration
- Quantitative parameters NOT found in report (see CRITICAL #3)

---

## Research Standards Reminder

<<<<<<< HEAD
**Count:** 172 (54.1%)
=======
### Layer 1 Verification (Citation Existence)
 Check if paper exists
 Check if paper is relevant to topic
>>>>>>> origin/auto/researcher-20251106_193001

### Layer 2 Verification (Claim Verification)
 Check if specific values are in paper
 Check if methodology matches code's use
 Check for extrapolation vs direct citation
 Flag misinterpretations

### Required for All Parameters
- 2+ peer-reviewed sources (2024-2025 preferred)
- Parameter justification (why this value?)
- Mechanism description (how it works)
- Interaction map (what affects/is affected)
- Expected timeline (when does it matter)
- Failure modes (what can go wrong)

---

## Next Research Session Should Focus On

<<<<<<< HEAD
| Metric | Value |
|--------|-------|
| Total files | 318 |
| CRITICAL | 0 (0.0%) |
| HIGH | 129 (40.6%) |
| MEDIUM | 17 (5.3%) |
| LOW | 172 (54.1%) |
| Average age | 9.0 years |
| Oldest source | 1955 (70 years ago) |

### Research Currency

| Status | Files | Percentage |
|--------|-------|------------|
| Current (<3yr) | 172 | 54.1% |
| Warning (3-5yr) | 17 | 5.3% |
| Critical (>5yr) | 129 | 40.6% |

### Targets

- **Goal:** <5% sources >3 years old, 0% sources >5 years old
- **Current:** 40.6% critical (>5yr)
- **Status:** ЁЯЪи CRITICAL threshold exceeded
=======
1. **Donor fatigue literature** (simultaneous humanitarian crises)
2. **Climate migration outcomes** (quantitative - UNHCR, Migration Policy Institute)
3. **Heat adaptation effectiveness by type** (physiological, behavioral, infrastructure, social)
4. **Disaster response mortality studies** (peer-reviewed alternatives to GAO estimates)
5. **Economic collapse definitions** (IMF, World Bank thresholds)
>>>>>>> origin/auto/researcher-20251106_193001

---

**Note:** This file is automatically updated by the autonomous research worker and the architect agent.
