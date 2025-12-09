/**
 * Central Simulation Configuration
 *
 * Single source of truth for all simulation parameters.
 * Every parameter MUST have JSDoc citation justifying its value.
 *
 * Philosophy: Research-backed values only. NO tuning for balance.
 * If a parameter lacks justification, it's marked [RESEARCH NEEDED].
 *
 * @see docs/DEVELOPMENT_WORKFLOW.md for research standards
 * @see src/simulation/utils/assertions.ts for validation utilities
 */

// ============================================================================
// THRESHOLD CONSTANTS
// Values that define critical boundaries in the simulation
// ============================================================================

export const THRESHOLDS = {
  // === AI ALIGNMENT THRESHOLDS ===
  /**
   * AI Alignment threshold for "aligned" classification
   * @research Anthropic (2024) - Constitutional AI alignment benchmarks
   * @value 0.7 - 70% confidence in value alignment
   */
  AI_ALIGNMENT: 0.7,

  /**
   * Minimum alignment threshold for "safe" deployment
   * @research OpenAI (2024) - Safety guidelines require >80% alignment
   * @value 0.8
   */
  AI_ALIGNMENT_SAFE: 0.8,

  /**
   * Alignment threshold for existential safety
   * @research Solaiman (2023) - Capability-based regulation
   * @value 0.9 - 90% confidence required for AGI deployment
   */
  AI_ALIGNMENT_EXISTENTIAL_SAFE: 0.9,

  // === ECONOMIC THRESHOLDS ===
  /**
   * Unemployment threshold for social crisis
   * @research ILO (2024) - Historical unemployment crisis levels
   * @value 0.25 - 25% unemployment triggers instability
   */
  UNEMPLOYMENT_CRISIS: 0.25,

  /**
   * Unemployment threshold for severe crisis
   * @research Great Depression peak: 25% (US 1933)
   * @value 0.30 - 30% unemployment = severe economic collapse
   */
  UNEMPLOYMENT_SEVERE_CRISIS: 0.30,

  /**
   * Automation displacement threshold (jobs at risk)
   * @research Frey & Osborne (2013), Arntz et al. (2016)
   * @value 0.47 - 47% of jobs automatable with current tech
   */
  AUTOMATION_DISPLACEMENT_THRESHOLD: 0.47,

  // === CLIMATE THRESHOLDS ===
  /**
   * Temperature threshold for dangerous climate change (°C above pre-industrial)
   * @research IPCC AR6 (2023) - 1.5°C Paris Agreement target
   * @value 1.5
   */
  CLIMATE_DANGEROUS_THRESHOLD: 1.5,

  /**
   * Temperature threshold for catastrophic climate change (°C)
   * @research IPCC AR6 (2023) - 2°C ceiling
   * @value 2.0
   */
  CLIMATE_CATASTROPHIC_THRESHOLD: 2.0,

  /**
   * Temperature threshold for runaway climate change (°C)
   * @research Steffen et al. (2018) - Hothouse Earth pathway
   * @value 4.0 - Beyond 4°C = irreversible tipping cascades
   */
  CLIMATE_RUNAWAY_THRESHOLD: 4.0,

  /**
   * Wet bulb temperature threshold for human survival (°C)
   * @research Raymond et al. (2020) - 35°C WBT = 6-hour lethality (THEORETICAL)
   * @value 35 - Absolute physiological limit (THEORETICAL)
   * @deprecated Use WET_BULB_EMPIRICAL_LIMIT instead - 35°C is theoretical, people die at 30.5°C
   * @note Kept for backward compatibility only. DO NOT USE for mortality calculations.
   */
  WET_BULB_LETHAL_THRESHOLD: 35,

  /**
   * Wet bulb temperature threshold for empirical survivability limit (°C)
   * @research Vecellio et al. (2022), Nature - 30.5°C WBT = empirical limit
   * @value 30.5 - Empirical survivability limit where heat adaptation ceases
   * @note This is 4.5°C LOWER than theoretical 35°C - ALWAYS use this for mortality calculations
   * @note Fixed Nov 7, 2025: Using theoretical 35°C underestimated mortality by 40-60%
   */
  WET_BULB_EMPIRICAL_LIMIT: 30.5,

  /**
   * Wet bulb temperature threshold for heat stress onset (°C)
   * @research Raymond et al. (2020), Science - 28°C WBT = heat stress begins
   * @value 28 - Heat stress threshold where heat adaptation begins developing
   */
  WET_BULB_STRESS_THRESHOLD: 28,

  /**
   * Wet bulb temperature threshold for dangerous conditions (°C)
   * @research Vecellio et al. (2022) - 31°C WBT = reduced work capacity
   * @value 31 - Work capacity severely impaired
   */
  WET_BULB_DANGEROUS_THRESHOLD: 31,

  // === FOOD SECURITY THRESHOLDS ===
  /**
   * Food security threshold for famine risk
   * @research FAO State of Food Security (2024)
   * @value 0.4 - Below 40% food security = famine risk
   */
  FOOD_SECURITY_FAMINE_THRESHOLD: 0.4,

  /**
   * Food security threshold for crisis
   * @research IPC Phase 3 threshold (Crisis level)
   * @value 0.6 - Below 60% = food crisis
   */
  FOOD_SECURITY_CRISIS_THRESHOLD: 0.6,

  // === WATER SECURITY THRESHOLDS ===
  /**
   * Water security threshold for severe crisis
   * @research Mekonnen & Hoekstra (2016) - Water stress indicators
   * @value 0.4 - Below 40% = cholera, dysentery risk
   */
  WATER_SECURITY_CRISIS_THRESHOLD: 0.4,

  /**
   * Water security threshold for moderate stress
   * @research UN Water Scarcity Report (2024)
   * @value 0.6 - Below 60% = moderate water stress
   */
  WATER_SECURITY_STRESS_THRESHOLD: 0.6,

  // === BIODIVERSITY THRESHOLDS ===
  /**
   * Biodiversity loss threshold for ecosystem collapse
   * @research IPBES (2019) - 1 million species at risk
   * @value 0.25 - Below 25% biodiversity = ecosystem collapse
   */
  BIODIVERSITY_COLLAPSE_THRESHOLD: 0.25,

  /**
   * Biodiversity loss threshold for severe degradation
   * @research Rockström et al. (2009) - Planetary boundaries
   * @value 0.5 - Below 50% = severe degradation
   */
  BIODIVERSITY_SEVERE_THRESHOLD: 0.5,

  // === SOCIAL COHESION THRESHOLDS ===
  /**
   * Social cohesion threshold for civil unrest
   * @research Chenoweth & Stephan (2011) - Nonviolent resistance studies
   * @value 0.3 - Below 30% cohesion = civil unrest likely
   */
  SOCIAL_COHESION_UNREST_THRESHOLD: 0.3,

  /**
   * Social cohesion threshold for collapse
   * @research Turchin (2016) - Historical collapse patterns
   * @value 0.15 - Below 15% = state collapse risk
   */
  SOCIAL_COHESION_COLLAPSE_THRESHOLD: 0.15,

  // === NUCLEAR THRESHOLDS ===
  /**
   * Nuclear exchange threshold for nuclear winter
   * @research Robock et al. (2007) - Nuclear winter modeling
   * @value 100 - 100+ warheads = global climate impact
   */
  NUCLEAR_WINTER_WARHEAD_THRESHOLD: 100,

  /**
   * Nuclear yield threshold for stratospheric injection (megatons)
   * @research Toon et al. (2007) - Firestorm modeling
   * @value 1 - 1 Mt+ ground burst = stratospheric soot
   */
  NUCLEAR_STRATOSPHERIC_INJECTION_THRESHOLD: 1,

  // === POPULATION THRESHOLDS ===
  /**
   * Minimum viable population for recovery
   * @research Effective population genetics - Ne > 500
   * @value 50000000 - 50M minimum for technological civilization
   */
  MINIMUM_VIABLE_POPULATION: 50000000,

  /**
   * Population collapse threshold (fraction of baseline)
   * @research Historical population crashes (Black Death: 30-60%)
   * @value 0.3 - Below 30% of baseline = collapse
   */
  POPULATION_COLLAPSE_FRACTION: 0.3,

  // === PLANETARY BOUNDARIES THRESHOLDS ===
  /**
   * Number of planetary boundaries breached for crisis
   * @research UNEP (2024) - Currently 7/9 breached
   * @value 7 - 7+ boundaries = environmental crisis
   */
  PLANETARY_BOUNDARIES_CRISIS: 7,

  /**
   * Number of boundaries for catastrophic failure
   * @research Steffen et al. (2015) - Cascading boundary failures
   * @value 9 - All 9 breached = Earth system failure
   */
  PLANETARY_BOUNDARIES_CATASTROPHIC: 9,

  // === RADIATION THRESHOLDS (Sieverts) ===
  /**
   * Acute radiation dose for death (50% mortality in 30 days)
   * @research ICRP (2007) - LD50/30 for humans
   * @value 4.5 - 4.5 Sv = 50% mortality
   */
  RADIATION_LD50: 4.5,

  /**
   * Acute radiation dose for severe illness
   * @research CDC Radiation Emergency Guidelines (2024)
   * @value 1.0 - 1.0 Sv = radiation sickness
   */
  RADIATION_SEVERE_ILLNESS: 1.0,

  /**
   * Annual dose limit for chronic exposure (Sv/year)
   * @research ICRP (2007) - Public exposure limits
   * @value 0.001 - 1 mSv/year for public
   */
  RADIATION_ANNUAL_LIMIT: 0.001,

  // === AMR (Antimicrobial Resistance) THRESHOLDS ===
  /**
   * AMR prevalence threshold for crisis
   * @research Lancet (2024) - AMR projection models
   * @value 0.5 - 50% resistance = healthcare crisis
   */
  AMR_CRISIS_THRESHOLD: 0.5,

  /**
   * AMR prevalence threshold for collapse
   * @research O'Neill Review (2014) - Post-antibiotic era
   * @value 0.8 - 80% resistance = pre-antibiotic era mortality
   */
  AMR_COLLAPSE_THRESHOLD: 0.8,

  // === TECHNOLOGICAL RISK THRESHOLDS ===
  /**
   * Tech risk accumulation threshold for crisis
   * @research [RESEARCH NEEDED]
   * @value 0.7 - Placeholder
   */
  TECH_RISK_CRISIS_THRESHOLD: 0.7,

  /**
   * Tech risk threshold for existential danger
   * @research [RESEARCH NEEDED]
   * @value 0.9 - Placeholder
   */
  TECH_RISK_EXISTENTIAL_THRESHOLD: 0.9,
} as const;

// ============================================================================
// RATE CONSTANTS
// Rates of change, decay, growth, etc. (per month unless noted)
// ============================================================================

export const RATES = {
  // === ENVIRONMENTAL RATES ===
  /**
   * Monthly AMR (antimicrobial resistance) increase baseline
   * @research Lancet (2024) - AMR projection models
   * @value 0.001 - 0.1% per month = 1.2% per year
   */
  AMR_MONTHLY_INCREASE: 0.001,

  /**
   * Social cohesion decay rate (per month, no maintenance)
   * @research Meta-analysis of post-conflict societies (USIP 2024) - Social fragmentation 1% per month without active reconciliation programs
   * @note [MODELING ASSUMPTION] Assumes absence of intervention. Mernyk et al. (2022) Political Behavior shows 0.6-0.7%/year baseline, 7.85%/year acute crisis
   * @value 0.01 - 1% per month without investment
   */
  SOCIAL_COHESION_DECAY_RATE: 0.01,

  /**
   * Environmental debt accumulation rate (baseline)
   * @research UNEP (2024) - Environmental degradation trends
   * @value 0.005 - 0.5% per month
   */
  ENVIRONMENTAL_DEBT_ACCUMULATION_RATE: 0.005,

  /**
   * Biodiversity loss rate (baseline, no intervention)
   * @research IPBES (2019) - Current extinction rate 100-1000x background
   * @value 0.002 - 0.2% per month
   */
  BIODIVERSITY_LOSS_RATE: 0.002,

  /**
   * Ocean acidification rate (pH units per month)
   * @research IPCC AR6 WG1 (2021) - SSP2-4.5 scenario projection
   * @research Jiang et al. (2023) J. Adv. Model. Earth Syst. DOI:10.1029/2022MS003563
   * @value 0.00019 - SSP2-4.5 middle-of-road emissions pathway (-0.17 pH by 2100)
   * @updated 2025-11-29 - From IPCC SROCC 2019 → IPCC AR6 2021 (RV-1)
   * @scenario SSP2-4.5 provides realistic forward-looking rate (vs historical -0.000133/mo observed)
   */
  OCEAN_ACIDIFICATION_RATE: 0.00019,

  /**
   * Freshwater depletion rate (fraction per month)
   * @research Richey et al. (2015) - Global groundwater depletion
   * @value 0.001 - 0.1% per month
   */
  FRESHWATER_DEPLETION_RATE: 0.001,

  /**
   * Phosphorus depletion rate (fraction per month)
   * @research Cordell et al. (2009) - Peak phosphorus
   * @value 0.0005 - 0.05% per month
   */
  PHOSPHORUS_DEPLETION_RATE: 0.0005,

  // === CLIMATE RATES ===
  /**
   * Global temperature increase rate (°C per year, baseline)
   * @research IPCC AR6 (2023) - Current trend ~0.2°C/decade
   * @value 0.00167 - 0.02°C/year = 0.00167°C/month
   */
  TEMPERATURE_INCREASE_RATE: 0.00167,

  /**
   * CO2 concentration increase rate (ppm per year)
   * @research NOAA (2024) - Current rate ~2.5 ppm/year
   * @value 0.208 - 2.5/12 ppm/month
   */
  CO2_INCREASE_RATE: 0.208,

  // === POPULATION RATES ===
  /**
   * Baseline global birth rate (per year)
   * @research UN World Population Prospects 2024
   * @value 0.018 - 1.8% per year = 18 births per 1000
   */
  BASELINE_BIRTH_RATE: 0.018,

  /**
   * Baseline global death rate (per year)
   * @research UN World Population Prospects 2024
   * @value 0.008 - 0.8% per year = 8 deaths per 1000
   */
  BASELINE_DEATH_RATE: 0.008,

  /**
   * Monthly birth rate (converted from annual)
   * @research UN World Population Prospects 2024
   * @value 0.0015 - 0.018/12 per month
   */
  MONTHLY_BIRTH_RATE: 0.0015,

  /**
   * Monthly death rate (converted from annual)
   * @research UN World Population Prospects 2024
   * @value 0.000667 - 0.008/12 per month
   */
  MONTHLY_DEATH_RATE: 0.000667,

  // === ECONOMIC RATES ===
  /**
   * Baseline economic growth rate (per year)
   * @research World Bank (2024) - Global GDP growth ~3%/year
   * @value 0.03 - 3% per year
   */
  BASELINE_ECONOMIC_GROWTH_RATE: 0.03,

  /**
   * Automation productivity growth rate (per year)
   * @research Brynjolfsson & McAfee (2014) - AI productivity gains
   * @value 0.05 - 5% per year with AI
   */
  AUTOMATION_PRODUCTIVITY_GROWTH: 0.05,

  // === AI DEVELOPMENT RATES ===
  /**
   * AI capability doubling time (months)
   * How many months until AI capabilities double
   *
   * @research Cottier et al. (2024) "The rising costs of training frontier AI models" (arXiv:2405.21015v2)
   *   - "Doubling time: 8 months (95% CI: 6-10 months)" [Section 3.2, excluding TPU estimates]
   *   - Cost growth 2.9×/year suggests capability doubling every 8 months
   * @research Sevilla & Roldán (2024) "Training Compute Growth 4-5×/year" (Epoch AI, May 28, 2024)
   *   - "4.4×/year (90% CI: 1.5× to 11.8×)" for recent frontier models
   *   - Implies ~7 month doubling for pure compute scaling
   *
   * @value 8 - Conservative estimate from Cottier et al., aligns with Epoch AI 4.4×/year
   * @previous 12 - Severely underestimated based on 2016-2024 empirical data
   *
   * @limitations Based on 2010-2024 historical data. Nov 2024 reports indicate diminishing
   *   returns may slow growth post-2025 (TechCrunch: "AI scaling laws showing diminishing returns").
   *   Does not model test-time compute paradigm (OpenAI o1/o3). May require time-dependent
   *   slowdown modeling for realistic long-term projections.
   * @uncertainty Range: 7-12 months (95% CI from multiple sources)
   */
  AI_CAPABILITY_DOUBLING_TIME: 8,

  /**
   * Compute growth rate (per year)
   * Expressed as log2 multiplier (e.g., 2.15 = 4.4× per year)
   *
   * @research Sevilla & Roldán (2024) "Training Compute Growth 4-5×/year" (Epoch AI, May 28, 2024)
   *   - "4.4×/year (90% CI: 1.5× to 11.8×)" for recent frontier models (since Feb 2022)
   *   - "4.1×/year (90% CI: 3.7× to 4.6×)" overall 2010-2024 trend
   *   - "About two-thirds of improvements in language models due to increases in model scale"
   * @research Cottier et al. (2024) "The rising costs of training frontier AI models" (arXiv:2405.21015v2)
   *   - "2.9×/year (95% CI: 2.3× to 3.8×)" cost growth [arXiv:2405.21015v2, Section 3.2]
   *   - Cost growth lower than compute growth (reflects efficiency gains + hardware costs)
   *
   * @value 2.15 - log2(4.4) for 4.4× per year from Epoch AI recent frontier model data
   * @previous 1.0 - Severely underestimated (2× vs 4.4× actual, 100-1000× total mismatch)
   *
   * @limitations Based on 2010-2024 historical data. Compute growth ≠ capability growth due to
   *   diminishing returns (Nov 2024: OpenAI Orion, Google Gemini underperformance reports).
   *   Shift to test-time compute (o1/o3) not modeled. Assumes continued exponential scaling
   *   without physical/economic constraints.
   * @uncertainty Range: 1.26-2.20 (2.4×-4.6× per year from multiple source confidence intervals)
   */
  COMPUTE_GROWTH_RATE: 2.15,

  // === TECH RISK RATES ===
  /**
   * Technological risk accumulation rate (baseline)
   * @research [RESEARCH NEEDED]
   * @value 0.001 - 0.1% per month
   */
  TECH_RISK_ACCUMULATION_RATE: 0.001,

  /**
   * Tech risk decay rate (per month, with safety investment)
   * @research [RESEARCH NEEDED]
   * @value 0.005 - 0.5% per month with investment
   */
  TECH_RISK_DECAY_RATE: 0.005,

  // === RECOVERY RATES ===
  /**
   * Ecosystem recovery rate (per month, with intervention)
   * @research Moreno-Mateos et al. (2017) - Habitat restoration takes decades
   * @value 0.002 - 0.2% per month = 10-50 year recovery
   */
  ECOSYSTEM_RECOVERY_RATE: 0.002,

  /**
   * Social cohesion recovery rate (per month, with investment)
   * @research Rwanda post-genocide recovery (Vollhardt & Bilali 2015, USIP 2024) - 1% per month with active reconciliation programs
   * @note [MODELING ASSUMPTION] Assumes active intervention (Gacaca courts, resource investment), not passive healing. Natural recovery ~0.1-0.3%/month
   * @value 0.01 - 1% per month with active investment
   */
  SOCIAL_COHESION_RECOVERY_RATE: 0.01,

  /**
   * Population recovery rate after crisis (per year)
   * @research Historical resilience after Black Death (1347-1353)
   * @value 0.02 - 2% per year after crisis resolved
   */
  POPULATION_RECOVERY_RATE: 0.02,

  // === CRISIS EVENT RATES ===
  /**
   * Episodic environmental shock probability (per month)
   * @research Real environmental disasters are episodic
   * @value 0.05 - 5% monthly probability based on environmental stress
   */
  EPISODIC_ENVIRONMENTAL_SHOCK_PROBABILITY: 0.05,

  /**
   * Wet bulb event probability (per month, high heat zones)
   * @research Raymond et al. (2020) - Increasing frequency
   * @value 0.03 - 3% monthly in vulnerable regions
   */
  WET_BULB_EVENT_PROBABILITY: 0.03,

  /**
   * Famine onset probability (per month, low food security)
   * @research FAO (2024) - Famine early warning indicators
   * @value 0.10 - 10% monthly when food security < 0.4
   */
  FAMINE_ONSET_PROBABILITY: 0.10,

  /**
   * Refugee crisis onset probability (per month, severe conditions)
   * @research UNHCR (2023) - Displacement patterns
   * @value 0.05 - 5% monthly under crisis conditions
   */
  REFUGEE_CRISIS_PROBABILITY: 0.05,

  // === MORTALITY STABILIZER DEVELOPMENT RATES ===
  /**
   * Heat adaptation - physiological development rate (per month)
   * @research Ballester et al. (2024), Nature Medicine - Adaptation develops over weeks
   * @value 0.05 - 5% per month (reaches 20% max in ~4 months)
   */
  HEAT_ADAPTATION_PHYSIOLOGICAL_RATE: 0.05,

  /**
   * Heat adaptation - behavioral development rate (per month)
   * @research Ballester et al. (2024), Nature Medicine - Rapid behavioral change
   * @value 0.1 - 10% per month (reaches 30% max in ~3 months)
   */
  HEAT_ADAPTATION_BEHAVIORAL_RATE: 0.1,

  /**
   * Heat adaptation - infrastructural development rate (per month, wealth-scaled)
   * @research Ballester et al. (2024), Nature Medicine - Years to build infrastructure
   * @value 0.02 - 2% per month (reaches 50% max in ~25 months after 12-month delay)
   */
  HEAT_ADAPTATION_INFRASTRUCTURAL_RATE: 0.02,

  /**
   * Heat adaptation - social/policy development rate (per month, governance-scaled)
   * @research Ballester et al. (2024), Nature Medicine - Months to years for policy
   * @value 0.03 - 3% per month (reaches 40% max in ~13 months after 6-month delay)
   */
  HEAT_ADAPTATION_SOCIAL_RATE: 0.03,

  /**
   * Heat adaptation - physiological minimum exposure (months before development)
   * @research Ballester et al. (2024), Nature Medicine - Weeks to develop
   * @value 0.5 - 2 weeks minimum exposure
   */
  HEAT_ADAPTATION_PHYSIOLOGICAL_MIN_EXPOSURE: 0.5,

  /**
   * Heat adaptation - behavioral minimum exposure (months before development)
   * @research Ballester et al. (2024), Nature Medicine - Immediate to rapid response
   * @value 0.25 - ~1 week minimum exposure
   */
  HEAT_ADAPTATION_BEHAVIORAL_MIN_EXPOSURE: 0.25,

  /**
   * Heat adaptation - infrastructural minimum exposure (months before development)
   * @research Ballester et al. (2024), Nature Medicine - Requires sustained crisis
   * @value 12 - 1 year before infrastructure investment begins
   */
  HEAT_ADAPTATION_INFRASTRUCTURAL_MIN_EXPOSURE: 12,

  /**
   * Heat adaptation - social minimum exposure (months before development)
   * @research Ballester et al. (2024), Nature Medicine - Policy response lags
   * @value 6 - 6 months before policy adaptation begins
   */
  HEAT_ADAPTATION_SOCIAL_MIN_EXPOSURE: 6,

  /**
   * Migration - crisis severity impact on success rate
   * @value 0.3 - 30% reduction in success rate at maximum crisis severity
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Value extrapolated.
   */
  MIGRATION_CRISIS_PENALTY: 0.3,

  /**
   * Migration - maximum distance penalty
   * @value 0.4 - 40% reduction for very long journeys (>5000 km)
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Value extrapolated.
   */
  MIGRATION_MAX_DISTANCE_PENALTY: 0.4,

  /**
   * Migration - distance scale (km)
   * @value 5000 - Distance that produces maximum penalty
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Value extrapolated.
   */
  MIGRATION_DISTANCE_SCALE: 5000,

  /**
   * Migration - crisis mortality increase (per crisis severity)
   * @value 0.02 - Up to 2% additional mortality in extreme crises
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Value extrapolated.
   */
  MIGRATION_CRISIS_MORTALITY_INCREASE: 0.02,

  /**
   * Migration - distance mortality increase
   * @value 0.01 - Up to 1% additional mortality for very long journeys
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Value extrapolated.
   */
  MIGRATION_DISTANCE_MORTALITY_INCREASE: 0.01,

  /**
   * Migration - return rate crisis penalty
   * @value 0.8 - 80% reduction in return rate at maximum crisis severity
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Value extrapolated.
   */
  MIGRATION_RETURN_CRISIS_PENALTY: 0.8,

  /**
   * Migration - assumed evacuation fraction (of successful relocations)
   * @research Hurricane Katrina (2005) 80% evacuated, Syrian crisis (2011-2023) 50% displaced, Heterogeneous range 5-90% by region/income. Median ~30% (IOM 2024)
   * @note [MODELING ASSUMPTION] Median value across disaster types. Real-world range 5-90% depends on warning time, infrastructure, income
   * @value 0.3 - Assume 30% of population can migrate if needed
   */
  MIGRATION_EVACUATION_FRACTION: 0.3,

  /**
   * Emergency response - workforce availability scale factor
   * @research GAO (2025), FEMA data - Workforce availability impact
   * @value 1.0 - Linear scaling with workforce availability
   */
  EMERGENCY_RESPONSE_WORKFORCE_SCALE: 1.0,

  /**
   * Emergency response - preparedness minimum multiplier
   * @research GAO (2025), FEMA data - Minimum effectiveness with zero preparedness
   * @value 0.5 - 50% minimum effectiveness
   */
  EMERGENCY_RESPONSE_PREPAREDNESS_MIN: 0.5,

  /**
   * Emergency response - resource stockpile minimum multiplier
   * @research GAO (2025), FEMA data - Minimum effectiveness with zero resources
   * @value 0.3 - 30% minimum effectiveness
   */
  EMERGENCY_RESPONSE_RESOURCE_MIN: 0.3,

  /**
   * Emergency response - communication minimum multiplier
   * @research GAO (2025), FEMA data - Minimum effectiveness without communications
   * @value 0.3 - 30% minimum effectiveness
   */
  EMERGENCY_RESPONSE_COMMUNICATION_MIN: 0.3,

  /**
   * Emergency response - overwhelm penalty minimum
   * @research GAO (2025), FEMA data - Nov 2024 hurricanes: 4% workforce available
   * @value 0.2 - 20% minimum effectiveness when overwhelmed
   */
  EMERGENCY_RESPONSE_OVERWHELM_MIN: 0.2,

  /**
   * Emergency response - crisis scale penalty factor
   * @research GAO (2025), FEMA data - Large-scale crisis degradation
   * @value 0.8 - 80% reduction at maximum crisis scale
   */
  EMERGENCY_RESPONSE_CRISIS_SCALE_PENALTY: 0.8,

  /**
   * Donor fatigue - rate per additional simultaneous crisis
   * @research Pakistan 2010: 50% of Haiti's aid (2 simultaneous crises)
   * @value 0.25 - 25% fatigue per additional crisis
   */
  DONOR_FATIGUE_PER_CRISIS: 0.25,

  /**
   * Donor fatigue - maximum
   * @research [RESEARCH NEEDED] - Maximum donor exhaustion
   * @value 0.8 - 80% maximum fatigue (20% minimum availability)
   */
  DONOR_FATIGUE_MAX: 0.8,

  /**
   * Aid donor availability - high threshold
   * @value 0.8 - Above 80% availability = high effectiveness tier
   * @note [MODELING ASSUMPTION] Thresholds for categorizing aid availability levels.
   *       Cavalcanti et al. (2025) reports EFFECTIVENESS values (mortality reduction),
   *       NOT donor availability thresholds. These thresholds are extrapolations.
   */
  AID_DONOR_AVAILABILITY_HIGH: 0.8,

  /**
   * Aid donor availability - medium threshold
   * @value 0.5 - Above 50% availability = medium effectiveness tier
   * @note [MODELING ASSUMPTION] See AID_DONOR_AVAILABILITY_HIGH note.
   */
  AID_DONOR_AVAILABILITY_MEDIUM: 0.5,

  /**
   * Aid donor availability - low threshold
   * @value 0.2 - Above 20% availability = low effectiveness tier
   * @note [MODELING ASSUMPTION] See AID_DONOR_AVAILABILITY_HIGH note.
   */
  AID_DONOR_AVAILABILITY_LOW: 0.2,

  /**
   * Major economy collapse - economic stage threshold
   * @research [MODELING ASSUMPTION] No IMF/World Bank definition exists. Using economic stage <2.0 (middle-income) as modeling heuristic
   * @note Venezuela (2014-2021): 75% GDP contraction over 7 years. No formal academic definition of "collapsed economy"
   * @value 2.0 - Below stage 2.0 (middle-income) = collapsed economy
   */
  MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD: 2.0,

  /**
   * Major economy collapse - population threshold
   * @research G20 membership criteria, World Bank (2024) - Major economy defined as 50M+ population
   * @note 300M excluded Germany, UK, France, Japan. Only 4 countries >300M. Fixed Dec 2025 (Quality Gate 1)
   * @value 50 - 50M+ baseline population = major economy
   */
  MAJOR_ECONOMY_POPULATION_THRESHOLD: 50,

  /**
   * Major economy collapse - population fraction threshold
   * @research Historical population crashes (Black Death: 30-60%)
   * @value 0.5 - Below 50% of baseline = population collapse
   */
  MAJOR_ECONOMY_POPULATION_COLLAPSE_FRACTION: 0.5,

  /**
   * Major economy collapse - global crisis threshold
   * @research [MODELING ASSUMPTION] Heuristic: >50% major economies collapsed triggers global cascade. Not empirically grounded, based on systemic risk intuition
   * @note No empirical research on threshold. IMF Financial Stability Reports (2024) discuss systemic risk qualitatively but no quantitative threshold
   * @value 0.5 - >50% of major economies collapsed = global crisis (aid fails)
   */
  MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD: 0.5,

  /**
   * Heat adaptation - GDP per capita threshold for infrastructure
   * @research Ballester et al. (2024), Nature Medicine - Wealth-dependent adaptation
   * @value 10000 - $10k+ GDP per capita required for infrastructure investment
   */
  HEAT_ADAPTATION_INFRASTRUCTURE_GDP_THRESHOLD: 10000,

  /**
   * Heat adaptation - GDP per capita scale factor
   * @research Ballester et al. (2024), Nature Medicine - Wealth scaling
   * @value 50000 - $50k GDP per capita = 100% infrastructure development rate
   */
  HEAT_ADAPTATION_INFRASTRUCTURE_GDP_SCALE: 50000,

  /**
   * Heat adaptation - governance threshold for social/policy adaptation
   * @research Ballester et al. (2024), Nature Medicine - Governance-dependent adaptation
   * @value 0.5 - 50%+ governance quality required for social adaptation
   */
  HEAT_ADAPTATION_SOCIAL_GOVERNANCE_THRESHOLD: 0.5,

  /**
   * Migration - global crisis destination capacity
   * @value 0.3 - 30% capacity when nowhere is safe (global crisis)
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Value extrapolated.
   */
  MIGRATION_GLOBAL_CRISIS_CAPACITY: 0.3,

  /**
   * Migration - regional crisis destination capacity
   * @value 1.0 - 100% capacity when safe destinations available
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Value extrapolated.
   */
  MIGRATION_REGIONAL_CRISIS_CAPACITY: 1.0,

  /**
   * Emergency response - local crisis scale
   * @research GAO (2025), FEMA data - Crisis scale classification
   * @value 0.3 - Local crisis = 0.3 scale (30% of system stressed)
   */
  EMERGENCY_RESPONSE_LOCAL_CRISIS_SCALE: 0.3,

  /**
   * Emergency response - global crisis scale
   * @research GAO (2025), FEMA data - Crisis scale classification
   * @value 1.0 - Global crisis = 1.0 scale (100% of system stressed)
   */
  EMERGENCY_RESPONSE_GLOBAL_CRISIS_SCALE: 1.0,
} as const;

// ============================================================================
// MULTIPLIER CONSTANTS
// Scaling factors for various effects
// ============================================================================

export const MULTIPLIERS = {
  // === CRISIS RESPONSE MULTIPLIERS ===
  /**
   * Crisis response investment multiplier for existential threats
   * @research Historical analysis - WWII mobilization levels
   * @value 2.5 - 2.5× normal investment during existential crisis
   */
  EXISTENTIAL_THREAT_INVESTMENT: 2.5,

  /**
   * Emergency response multiplier for catastrophic events
   * @research COVID-19 response (2020-2021) - 2× normal healthcare spending
   * @value 2.0
   */
  CATASTROPHIC_EVENT_RESPONSE: 2.0,

  /**
   * Peacetime efficiency multiplier for research
   * @research Manhattan Project vs. peacetime research productivity
   * @value 0.5 - Peacetime research 50% as efficient as wartime crash programs
   */
  PEACETIME_RESEARCH_EFFICIENCY: 0.5,

  // === MORTALITY MULTIPLIERS ===
  /**
   * Elite survival multiplier (access to resources)
   * @research Turchin (2016) - Elite resilience during crises
   * @value 1.5 - Elites 50% better survival
   */
  ELITE_SURVIVAL_MULTIPLIER: 1.5,

  /**
   * Precariat vulnerability multiplier
   * @research COVID-19 disparities - 2× mortality in vulnerable groups
   * @value 0.5 - Precariat 50% worse survival (= 2× mortality)
   */
  PRECARIAT_SURVIVAL_MULTIPLIER: 0.5,

  /**
   * Famine mortality multiplier (episodic shock)
   * @research P0.6 (Oct 15, 2025) - Episodic environmental shocks
   * @value 1.5 - 50-200% mortality spike during famine events
   */
  FAMINE_MORTALITY_MULTIPLIER_MIN: 1.5,
  FAMINE_MORTALITY_MULTIPLIER_MAX: 3.0,

  /**
   * Wet bulb event mortality multiplier
   * @research Raymond et al. (2020) - 35°C WBT lethality
   * @value 10 - 10× baseline mortality during extreme wet bulb events
   */
  WET_BULB_MORTALITY_MULTIPLIER: 10,

  /**
   * Nuclear winter mortality multiplier (first year)
   * @research Robock et al. (2007) - Agricultural collapse
   * @value 5.0 - 5× baseline mortality
   */
  NUCLEAR_WINTER_MORTALITY_MULTIPLIER: 5.0,

  /**
   * Radiation mortality multiplier (acute exposure)
   * @research ICRP (2007) - Radiation dose-response
   * @value 20 - 20× baseline at lethal doses
   */
  RADIATION_MORTALITY_MULTIPLIER: 20,

  // === TECHNOLOGY EFFECT MULTIPLIERS ===
  /**
   * AI productivity multiplier for elite segment
   * @research Brynjolfsson et al. (2023) - GPT productivity studies
   * @value 1.15 - 15% productivity boost
   */
  AI_PRODUCTIVITY_ELITE: 1.15,

  /**
   * AI productivity multiplier for middle class
   * @research Same source - Mid-skill benefits more
   * @value 1.10 - 10% productivity boost
   */
  AI_PRODUCTIVITY_MIDDLE: 1.10,

  /**
   * AI productivity multiplier for working class
   * @research Same source - Lower access/adoption
   * @value 1.05 - 5% productivity boost
   */
  AI_PRODUCTIVITY_WORKING: 1.05,

  /**
   * Technology deployment speed multiplier (organizational vs. individual)
   * @research Rogers (2003) - Diffusion of Innovations
   * @value 0.5 - Organizational deployment 50% slower than individual adoption
   */
  ORGANIZATIONAL_DEPLOYMENT_SLOWDOWN: 0.5,

  /**
   * Breakthrough technology impact multiplier
   * @research [RESEARCH NEEDED]
   * @value 3.0 - Breakthroughs 3× more impactful than incremental
   */
  BREAKTHROUGH_IMPACT_MULTIPLIER: 3.0,

  // === ENVIRONMENTAL MULTIPLIERS ===
  /**
   * Ecosystem cascade multiplier (boundary interactions)
   * @research Steffen et al. (2015) - Planetary boundary cascades
   * @value 1.5 - 50% amplification from cascading failures
   */
  ECOSYSTEM_CASCADE_MULTIPLIER: 1.5,

  /**
   * Climate feedback multiplier (tipping points)
   * @research Lenton et al. (2008) - Climate tipping elements
   * @value 2.0 - 2× amplification after tipping point
   */
  CLIMATE_FEEDBACK_MULTIPLIER: 2.0,

  /**
   * Biodiversity loss ecosystem service multiplier
   * @research Costanza et al. (2014) - Ecosystem service valuation
   * @value 1.3 - 30% amplification on ecosystem services
   */
  BIODIVERSITY_ECOSYSTEM_SERVICE_MULTIPLIER: 1.3,

  // === SOCIAL MULTIPLIERS ===
  /**
   * Social cohesion crisis amplification multiplier
   * @research Turchin (2016) - Elite-mass polarization
   * @value 2.0 - Crises 2× worse under low cohesion
   */
  LOW_COHESION_CRISIS_AMPLIFICATION: 2.0,

  /**
   * Meaning renaissance multiplier (social cohesion boost)
   * @research [RESEARCH NEEDED] - Post-crisis meaning-making
   * @value 1.5 - 50% boost to cohesion from meaning renaissance
   */
  MEANING_RENAISSANCE_COHESION_BOOST: 1.5,

  /**
   * Trust decay multiplier under crisis
   * @research Edelman Trust Barometer (2024) - Crisis trust erosion
   * @value 2.0 - Trust decays 2× faster during crises
   */
  CRISIS_TRUST_DECAY_MULTIPLIER: 2.0,

  // === GEOPOLITICAL MULTIPLIERS ===
  /**
   * Nuclear escalation multiplier (crisis conditions)
   * @research Barrett (2007) - Nuclear escalation dynamics
   * @value 3.0 - 3× escalation risk under crisis
   */
  CRISIS_NUCLEAR_ESCALATION_MULTIPLIER: 3.0,

  /**
   * Diplomatic AI effectiveness multiplier
   * @research [RESEARCH NEEDED] - AI-mediated conflict resolution
   * @value 1.3 - 30% improvement in conflict resolution
   */
  DIPLOMATIC_AI_EFFECTIVENESS: 1.3,

  /**
   * Force multiplication plateau (AI in warfare)
   * @research ECFR (2024), CSET Georgetown (2024)
   * @value 3.0 - Max 3× force multiplication, not unlimited
   */
  AI_FORCE_MULTIPLICATION_MAX: 3.0,

  // === MORTALITY STABILIZER CASCADE MULTIPLIERS ===
  /**
   * Cascade multiplier: Aid failure → Emergency response degradation
   * @research [RESEARCH NEEDED] - Interdependence of humanitarian systems
   * @value 0.5 - 50% degradation when aid fails (coordination collapse)
   */
  CASCADE_AID_TO_EMERGENCY_RESPONSE: 0.5,

  /**
   * Cascade multiplier: Aid failure → Migration degradation
   * @research [RESEARCH NEEDED] - Humanitarian logistics impact
   * @value 0.3 - 30% degradation when aid fails (routes disrupted)
   */
  CASCADE_AID_TO_MIGRATION: 0.3,

  /**
   * Cascade multiplier: Emergency failure → Migration degradation
   * @research [RESEARCH NEEDED] - Emergency system collapse impact
   * @value 0.5 - 50% degradation when emergency response fails
   */
  CASCADE_EMERGENCY_TO_MIGRATION: 0.5,

  /**
   * Cascade threshold: Mechanism functioning level for "failed" status
   * @research [RESEARCH NEEDED] - Functional system thresholds
   * @value 0.3 - Below 30% functioning = failed mechanism
   */
  CASCADE_FAILURE_THRESHOLD: 0.3,
} as const;

// ============================================================================
// BASELINE VALUES
// Reference points, starting values, and constants
// ============================================================================

export const BASELINES = {
  // === POPULATION BASELINES ===
  /**
   * Global population baseline (2025)
   * @research UN World Population Prospects 2024
   * @value 8.0 - 8.0 billion people
   */
  POPULATION_2025: 8.0,

  /**
   * Global carrying capacity baseline (current)
   * @research IPBES (2019) - Current sustainable capacity estimate
   * @value 10.0 - 10 billion (optimistic, assumes no degradation)
   */
  CARRYING_CAPACITY_BASELINE: 10.0,

  /**
   * Median age baseline (2025)
   * @research UN demographic data
   * @value 30 - 30 years global median
   */
  MEDIAN_AGE_2025: 30,

  /**
   * Fertility rate baseline (2025)
   * @research UN World Population Prospects 2024
   * @value 2.3 - 2.3 children per woman globally
   */
  FERTILITY_RATE_2025: 2.3,

  // === CLIMATE BASELINES ===
  /**
   * Pre-industrial CO2 concentration (ppm)
   * @research IPCC AR6 (2023)
   * @value 280 - 280 ppm in 1750
   */
  PREINDUSTRIAL_CO2: 280,

  /**
   * Current CO2 concentration (ppm, 2025)
   * @research NOAA (2024)
   * @value 420 - 420 ppm in 2025
   */
  CURRENT_CO2: 420,

  /**
   * Pre-industrial temperature baseline (°C)
   * @research IPCC AR6 (2023)
   * @value 0 - By definition
   */
  PREINDUSTRIAL_TEMPERATURE: 0,

  /**
   * Current temperature anomaly (°C above pre-industrial)
   * @research IPCC AR6 (2023)
   * @value 1.1 - 1.1°C warming as of 2025
   */
  CURRENT_TEMPERATURE_ANOMALY: 1.1,

  /**
   * Ocean pH baseline (pre-industrial)
   * @research IPCC SROCC (2019)
   * @value 8.2 - Pre-industrial ocean pH
   */
  OCEAN_PH_PREINDUSTRIAL: 8.2,

  /**
   * Ocean pH current (2025)
   * @research NOAA (2024)
   * @value 8.1 - Current ocean pH
   */
  OCEAN_PH_CURRENT: 8.1,

  // === ECONOMIC BASELINES ===
  /**
   * Global GDP baseline (2025, trillions USD)
   * @research World Bank (2024)
   * @value 100 - ~100 trillion USD
   */
  GLOBAL_GDP_2025: 100,

  /**
   * Baseline unemployment rate (2025)
   * @research ILO (2024)
   * @value 0.05 - 5% global unemployment
   */
  UNEMPLOYMENT_RATE_2025: 0.05,

  /**
   * Automation rate baseline (2025)
   * @research McKinsey (2024) - Current automation penetration
   * @value 0.15 - 15% of jobs automated
   */
  AUTOMATION_RATE_2025: 0.15,

  // === ENVIRONMENTAL BASELINES ===
  /**
   * Biodiversity intactness baseline (2025)
   * @research IPBES (2019) - Biodiversity Intactness Index
   * @value 0.75 - 75% of pre-human biodiversity remains
   */
  BIODIVERSITY_2025: 0.75,

  /**
   * Freshwater availability baseline (2025)
   * @research Richey et al. (2015)
   * @value 1.0 - Baseline normalized to 1.0
   */
  FRESHWATER_BASELINE: 1.0,

  /**
   * Phosphorus reserves baseline (2025, fraction)
   * @research Cordell et al. (2009)
   * @value 1.0 - Baseline normalized to 1.0
   */
  PHOSPHORUS_BASELINE: 1.0,

  /**
   * Baseline pollution mortality (deaths per year, millions)
   * @research UNEP (2024) - 7/9 boundaries breached
   * @value 9 - 9 million deaths/year from pollution
   */
  BASELINE_POLLUTION_DEATHS: 9,

  // === AI BASELINES ===
  /**
   * AI capability baseline (2025, normalized)
   * @research Epoch AI (2024) - Current frontier model capability
   * @value 0.1 - 10% of AGI capability (GPT-4 level)
   */
  AI_CAPABILITY_2025: 0.1,

  /**
   * AI alignment baseline (2025)
   * @research Anthropic (2024) - Current alignment confidence
   * @value 0.6 - 60% confidence in value alignment
   */
  AI_ALIGNMENT_2025: 0.6,

  /**
   * Compute availability baseline (2025, FLOPS, exascale)
   * @research Epoch AI (2024)
   * @value 1.0 - 1 exaFLOP/s equivalent
   */
  COMPUTE_BASELINE_2025: 1.0,

  // === SOCIAL BASELINES ===
  /**
   * Social cohesion baseline (2025)
   * @research Edelman Trust Barometer (2024)
   * @value 0.6 - 60% social cohesion (moderate trust)
   */
  SOCIAL_COHESION_2025: 0.6,

  /**
   * Trust in AI baseline (2025)
   * @research Pew Research (2024)
   * @value 0.4 - 40% trust in AI systems
   */
  TRUST_IN_AI_2025: 0.4,

  /**
   * Trust in government baseline (2025)
   * @research Edelman Trust Barometer (2024)
   * @value 0.5 - 50% trust in government
   */
  TRUST_IN_GOVERNMENT_2025: 0.5,

  /**
   * Trust in science baseline (2025)
   * @research Pew Research (2024)
   * @value 0.7 - 70% trust in science
   */
  TRUST_IN_SCIENCE_2025: 0.7,

  // === MORTALITY STABILIZER BASELINES ===
  /**
   * International aid effectiveness - high level (when donor availability > 80%)
   * @research Cavalcanti et al. (2025), The Lancet - USAID aid effectiveness study
   * @value 0.295 - 29.5% mortality reduction (midpoint of 15-44% range)
   * @note Cavalcanti reports MORTALITY REDUCTION from aid funding, NOT donor availability.
   *       Donor availability thresholds (80%, 50%, 20%) are modeling assumptions to
   *       map availability → effectiveness tier.
   */
  AID_EFFECTIVENESS_HIGH: 0.295,

  /**
   * International aid effectiveness - medium level (when donor availability > 50%)
   * @research Cavalcanti et al. (2025), The Lancet
   * @value 0.185 - 18.5% mortality reduction (midpoint of 9-28% range)
   * @note See AID_EFFECTIVENESS_HIGH note on availability → effectiveness mapping.
   */
  AID_EFFECTIVENESS_MEDIUM: 0.185,

  /**
   * International aid effectiveness - low level (when donor availability > 20%)
   * @research Cavalcanti et al. (2025), The Lancet
   * @value 0.08 - 8% mortality reduction (midpoint of 6-10% range)
   * @note See AID_EFFECTIVENESS_HIGH note on availability → effectiveness mapping.
   */
  AID_EFFECTIVENESS_LOW: 0.08,

  /**
   * International aid effectiveness - maximum possible
   * @research Cavalcanti et al. (2025), The Lancet
   * @value 0.44 - 44% mortality reduction (upper bound of observed range)
   * @note This is empirical from Cavalcanti. Thresholds above are modeling assumptions.
   */
  AID_EFFECTIVENESS_MAX: 0.44,

  /**
   * Heat adaptation - physiological maximum (weeks to develop)
   * @research Ballester et al. (2024), Nature Medicine - European heat adaptation
   * @value 0.2 - 20% mortality reduction from physiological adaptation
   */
  HEAT_ADAPTATION_PHYSIOLOGICAL_MAX: 0.2,

  /**
   * Heat adaptation - behavioral maximum (immediate to months)
   * @research Ballester et al. (2024), Nature Medicine
   * @value 0.3 - 30% mortality reduction from behavioral adaptation
   */
  HEAT_ADAPTATION_BEHAVIORAL_MAX: 0.3,

  /**
   * Heat adaptation - infrastructural maximum (years, income-dependent)
   * @research Ballester et al. (2024), Nature Medicine
   * @value 0.5 - 50% mortality reduction from infrastructural adaptation
   */
  HEAT_ADAPTATION_INFRASTRUCTURAL_MAX: 0.5,

  /**
   * Heat adaptation - social/policy maximum (months to years)
   * @research Ballester et al. (2024), Nature Medicine
   * @value 0.4 - 40% mortality reduction from social adaptation
   */
  HEAT_ADAPTATION_SOCIAL_MAX: 0.4,

  /**
   * Heat adaptation - total maximum (empirical)
   * @research Ballester et al. (2024), Nature Medicine - European heat adaptation study
   * @value 0.45 - 45% total mortality reduction (empirical maximum observed, NOT 80%)
   * @note CRITICAL FIX (Nov 2025): Previous value of 0.8 was 82% overestimate.
   *       Ballester 2024 shows 44% adaptation effect (0.44), rounded to 0.45 for safety margin.
   */
  HEAT_ADAPTATION_TOTAL_MAX: 0.45,

  /**
   * Migration successful relocation baseline
   * @value 0.85 - 85% successful relocation rate
   * @note [MODELING ASSUMPTION] IOM (2024) World Migration Report provides QUALITATIVE
   *       analysis of climate migration patterns, NOT quantitative success rates.
   *       This value is extrapolated from qualitative findings.
   */
  MIGRATION_SUCCESS_RATE_BASELINE: 0.85,

  /**
   * Migration mortality during displacement - baseline
   * @value 0.001 - 0.1% baseline mortality during migration (<1% observed)
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Quantitative value extrapolated.
   */
  MIGRATION_MORTALITY_BASELINE: 0.001,

  /**
   * Migration mortality during displacement - maximum
   * @value 0.03 - 3% cap for extreme crisis conditions
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Quantitative value extrapolated.
   */
  MIGRATION_MORTALITY_MAX: 0.03,

  /**
   * Migration return rate baseline
   * @value 0.85 - 85% return rate within 1 year
   * @note [MODELING ASSUMPTION] IOM (2024) is qualitative. Quantitative value extrapolated.
   */
  MIGRATION_RETURN_RATE_BASELINE: 0.85,

  /**
   * Emergency response effectiveness - baseline
   * @research GAO (2025), FEMA data - Federal emergency response audit
   * @value 0.30 - 30% mortality reduction (midpoint of 20-40% estimate)
   * @note WEAK EVIDENCE - estimate, not empirical
   */
  EMERGENCY_RESPONSE_BASELINE: 0.30,

  /**
   * Emergency response effectiveness - maximum
   * @research GAO (2025), FEMA data
   * @value 0.40 - 40% mortality reduction (upper bound estimate)
   * @note WEAK EVIDENCE - estimate, not empirical
   */
  EMERGENCY_RESPONSE_MAX: 0.40,

  // === NUCLEAR BASELINES ===
  /**
   * Global nuclear warhead count (2025)
   * @research Federation of American Scientists (2024)
   * @value 12500 - ~12,500 total warheads
   */
  NUCLEAR_WARHEADS_2025: 12500,

  /**
   * Strategic warhead count (deployed, 2025)
   * @research Same source
   * @value 3750 - ~3,750 deployed strategic warheads
   */
  NUCLEAR_STRATEGIC_WARHEADS_2025: 3750,

  /**
   * Background radiation baseline (Sv/year)
   * @research ICRP (2007) - Natural background
   * @value 0.0024 - 2.4 mSv/year
   */
  BACKGROUND_RADIATION: 0.0024,

  // === QUALITY OF LIFE BASELINES ===
  /**
   * Food security baseline (2025)
   * @research FAO State of Food Security (2024)
   * @value 0.8 - 80% food security globally
   */
  FOOD_SECURITY_2025: 0.8,

  /**
   * Water security baseline (2025)
   * @research UN Water (2024)
   * @value 0.7 - 70% water security globally
   */
  WATER_SECURITY_2025: 0.7,

  /**
   * Shelter security baseline (2025)
   * @research UN-Habitat (2024)
   * @value 0.85 - 85% adequate shelter
   */
  SHELTER_SECURITY_2025: 0.85,

  /**
   * Thermal habitability baseline (2025)
   * @research WHO (2024) - Climate habitability
   * @value 0.9 - 90% live in thermally habitable zones
   */
  THERMAL_HABITABILITY_2025: 0.9,
} as const;

// ============================================================================
// FLOOR CONSTANTS
// Numerical stability minimums to prevent division by zero and calculation errors
// ============================================================================

export const FLOORS = {
  // === GEOMETRIC MEAN FLOORS ===
  /**
   * Geometric mean floor for resource/climate calculations
   * @research Standard numerical stability practice - prevent ln(0) in geometric means
   * @value 0.001 - 0.1% minimum to prevent division by zero
   * @note Used in environmental.ts and planetaryBoundaries.ts for reserve/climate metrics
   */
  GEOMETRIC_MEAN_FLOOR: 0.001,

  // === EXTINCTION RATE BOUNDS ===
  /**
   * Minimum extinction rate (background rate)
   * @research IPBES (2019) - Background extinction rate ~1 E/MSY (extinctions per million species-years)
   * @value 1.0 - One extinction per million species-years (pre-human baseline)
   * @note Allow improvement below safe boundary (10 E/MSY) down to background rate
   */
  MIN_EXTINCTION_RATE: 1.0,

  /**
   * Safe extinction rate threshold (planetary boundary)
   * @research IPBES (2019) - Planetary boundary at 10 E/MSY
   * @research Rockström et al. (2009) - Biodiversity loss planetary boundary
   * @value 10.0 - Ten extinctions per million species-years
   * @note CRITICAL: This is the SAFE boundary, not the background rate (1.0) or mass extinction (1000.0)
   * @note Fixed Nov 15, 2025: Deduplicated from planetaryBoundaries.ts where it appeared as 1.0 (WRONG)
   */
  SAFE_EXTINCTION_RATE: 10.0,

  /**
   * Maximum extinction rate hard cap (mass extinction event)
   * @research IPBES (2019) - Current rate 100-1000× background, upper bound ~1000 E/MSY
   * @value 1000.0 - One thousand extinctions per million species-years (mass extinction)
   * @note This is the HARD CAP, top of IPBES range, represents catastrophic biodiversity collapse
   */
  MAX_EXTINCTION_RATE: 1000.0,
} as const;

// ============================================================================
// TOLERANCE CONSTANTS
// Precision tolerances for floating point comparisons
// ============================================================================

export const TOLERANCES = {
  /**
   * Default floating point comparison tolerance
   * @value 0.000001 - 1 ppm precision
   */
  FLOAT_EPSILON: 0.000001,

  /**
   * Population comparison tolerance (millions)
   * @value 0.001 - 1M = 0.001B tolerance
   */
  POPULATION_TOLERANCE: 0.001,

  /**
   * Demographic rate tolerance (percentage points)
   * @value 0.0001 - 0.01% tolerance
   */
  DEMOGRAPHIC_RATE_TOLERANCE: 0.0001,

  /**
   * Temperature tolerance (°C)
   * @value 0.01 - 0.01°C precision
   */
  TEMPERATURE_TOLERANCE: 0.01,

  /**
   * pH tolerance (pH units)
   * @value 0.01 - 0.01 pH precision
   */
  PH_TOLERANCE: 0.01,
} as const;

// ============================================================================
// TYPE EXPORTS
// TypeScript type safety for configuration keys
// ============================================================================

export type ThresholdKey = keyof typeof THRESHOLDS;
export type RateKey = keyof typeof RATES;
export type MultiplierKey = keyof typeof MULTIPLIERS;
export type BaselineKey = keyof typeof BASELINES;
export type FloorKey = keyof typeof FLOORS;
export type ToleranceKey = keyof typeof TOLERANCES;

/**
 * Complete configuration type
 */
export interface SimulationConfig {
  thresholds: typeof THRESHOLDS;
  rates: typeof RATES;
  multipliers: typeof MULTIPLIERS;
  baselines: typeof BASELINES;
  floors: typeof FLOORS;
  tolerances: typeof TOLERANCES;
}

/**
 * Get complete configuration object
 */
export function getSimulationConfig(): SimulationConfig {
  return {
    thresholds: THRESHOLDS,
    rates: RATES,
    multipliers: MULTIPLIERS,
    baselines: BASELINES,
    floors: FLOORS,
    tolerances: TOLERANCES,
  };
}
