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
   * @research Raymond et al. (2020) - 35°C WBT = 6-hour lethality
   * @value 35 - Absolute physiological limit
   */
  WET_BULB_LETHAL_THRESHOLD: 35,

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
   * @research [RESEARCH NEEDED] - Based on historical social fragmentation
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
   * Ocean acidification rate (pH units per year)
   * @research IPCC SROCC (2019) - -0.002 pH/year
   * @value 0.000167 - -0.002/12 per month
   */
  OCEAN_ACIDIFICATION_RATE: 0.000167,

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
   * @research Epoch AI (2024) - Algorithmic progress trends
   * @value 12 - Capabilities double every 12 months
   */
  AI_CAPABILITY_DOUBLING_TIME: 12,

  /**
   * Compute growth rate (per year)
   * @research Epoch AI (2024) - 4x every 2 years = 100% per year
   * @value 1.0 - 100% per year = 2x every year
   */
  COMPUTE_GROWTH_RATE: 1.0,

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
   * @research [RESEARCH NEEDED] - Post-conflict reconciliation timelines
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
export type ToleranceKey = keyof typeof TOLERANCES;

/**
 * Complete configuration type
 */
export interface SimulationConfig {
  thresholds: typeof THRESHOLDS;
  rates: typeof RATES;
  multipliers: typeof MULTIPLIERS;
  baselines: typeof BASELINES;
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
    tolerances: TOLERANCES,
  };
}
