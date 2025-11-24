/**
 * Irreversibility Framework Types (TIER 1 CRITICAL)
 *
 * Environmental and social tipping points that cannot fully recover on human
 * timescales (centuries to millennia). Models hysteresis, extinction debt,
 * and legacy contamination.
 *
 * Research foundation:
 * - research/irreversibility_framework_20251116.md (41 sources)
 * - reviews/irreversibility_framework_critique_20251116.md (Grade B-, CONDITIONAL PASS)
 *
 * Key insight: Tipping points have PROBABILISTIC thresholds with REGIONAL variation,
 * NOT deterministic on/off switches.
 */

/**
 * Ice Sheet Hysteresis State
 *
 * Research: Nature 2023 (Greenland +0.8-3.2°C threshold), Nature Comms E&E 2025 (+1.5°C too high)
 * Type: MODEL-DERIVED with EMPIRICAL validation
 *
 * Hysteresis gap: Collapse at +1.5°C, recovery requires cooling to <+1°C
 * Commitment: 7.2m sea level rise (Greenland), 3.3m (WAIS) over 200-1000 years
 */
export interface IceSheetState {
  greenlandCollapsed: boolean;
  antarcticWAISCollapsed: boolean;
  collapseMonth: number | null;
  seaLevelCommitmentMeters: number; // Committed sea level rise
  collapseProbability: number; // [0, 1] Current probability
}

/**
 * Permafrost Thaw State (Continuous "Dimmer Switch")
 *
 * Research: MIT 2024 ("dimmer switch" not binary), Nature Climate Change 2022 (+9% methane since 2002)
 * Type: EMPIRICAL observations + MODEL projections
 *
 * CRITICAL: NOT a tipping point - progressive thaw with temperature
 * Arctic amplification: 4x global warming
 */
export interface PermafrostState {
  percentThawed: number; // [0, 100] % of permafrost thawed
  cumulativeCarbonReleased: number; // Gt C released to atmosphere
  methaneReleaseRate: number; // Mt CH4/year
  irreversible: boolean; // true - cannot refreeze on <500 year timescales
}

/**
 * AMOC Weakening State (Temperature-Dependent Collapse Probability)
 *
 * Research: Nature Feb 2025 (resilient across 34 models), NOAA Jan 2025 (weakening observed, paused 2010s)
 * Type: EMPIRICAL observations (RAPID array) + MODEL consensus
 *
 * IMPLEMENTATION (Nov 20, 2025): Temperature-dependent collapse probability
 * - <+2C: 0.5% annual (extremely unlikely)
 * - +2.2-3C: 5-50% annual (rising risk, median threshold +3C per Westen 2024)
 * - +3-3.9C: 50-90% annual (high risk)
 * - >+3.9C: 90% annual (very likely)
 *
 * See: research/amoc_collapse_probability_20251120.md
 * See: IrreversibilityTrackingPhase.ts calculateAMOCCollapseProbability()
 */
export interface AMOCState {
  strength: number; // [0.4, 1.0] 1.0 = pre-industrial, 0.4 = floor (Southern Ocean sustains weak circulation)
  collapsed: boolean;
  weakeningSincePreindustrial: number; // [EMPIRICAL] ~15% observed
}

/**
 * Amazon Regional State
 *
 * Regional heterogeneity is CRITICAL per Sylvia's critique:
 * - SE Amazon: 28% deforestation (PAST threshold)
 * - Brazilian Amazon: 25% (AT threshold)
 * - NW Amazon: <10% (still resilient)
 */
export interface AmazonRegionState {
  deforestation: number; // [0, 100] % forest lost
  tipped: boolean; // Has regional tipping point been crossed?
  savannaTransitionProgress: number; // [0, 1] Progress through 50-year transition
}

/**
 * Amazon Rainforest Dieback State
 *
 * Research: Nature Feb 2024 (10-47% exposed to tipping by 2050), RAISG 2023 (regional data)
 * Type: EMPIRICAL deforestation + MODEL-DERIVED threshold ranges
 *
 * Threshold: 20-25% (PROBABILISTIC, not deterministic)
 * Transition: 50 years to savanna state once tipped
 * Carbon loss: ~120 Gt C
 */
export interface AmazonState {
  deforestationPercent: number; // [0, 100] Full biome average
  regions: {
    southeast: AmazonRegionState;
    northwest: AmazonRegionState;
    brazilian: AmazonRegionState;
  };
  collapsed: boolean; // Full biome collapse (all regions tipped)
  carbonReleased: number; // Gt C released from savannification
}

/**
 * Extinction Debt Queue Entry
 *
 * Species below minimum viable population but not yet extinct.
 * Extinction occurs with time lag (50-150 years).
 */
export interface ExtinctionDebtEntry {
  speciesCount: number; // Number of species in debt
  debtTimescaleMonths: number; // Total lag time
  monthsRemaining: number; // Time until extinction
  extinctionProbabilityPerMonth: number; // Monthly extinction rate
}

/**
 * Extinction Debt State
 *
 * Research: Conservation Letters 2024 (150-year avian debt), Nature Comms 2016 (power-law decay)
 * Type: EMPIRICAL historical extinctions + MODEL timescales
 *
 * Time lag: 50-150 years (median 100) between habitat loss and extinction
 * Irreversible: Once extinct, cannot recover (without de-extinction tech)
 */
export interface ExtinctionDebtState {
  debtQueue: ExtinctionDebtEntry[]; // Species committed to extinction
  totalDebt: number; // Count of species in debt queue
  paidDebt: number; // Count of extinctions from historical habitat loss
}

/**
 * Coral Reef State
 *
 * Research: Nature Comms 2024 (recovery possible <+2°C), PNAS 2021 (pH 7.8 dissolution)
 * Type: EMPIRICAL bleaching events + MODEL projections
 *
 * Dual threats: Thermal bleaching + ocean acidification
 * Recovery: Possible if temp <+2°C AND pH >7.8
 */
export interface CoralReefState {
  liveCoverPercent: number; // [0, 100] % live coral cover (2024: 27.1%)
  bleachedPercent: number; // [0, 100] % bleached but not dead
  recoveryPossible: boolean; // Can reefs recover if conditions improve?
  dissolutionActive: boolean; // Is net dissolution occurring? (pH <7.8)
}

/**
 * Indigenous Knowledge Loss State
 *
 * Research: UNESCO 2024 (2 languages/month), Trends E&E 2019 (knowledge-species multiplier)
 * Type: EMPIRICAL language extinction + QUALITATIVE impact
 *
 * Irreversible: Language extinction cannot be undone
 * Multiplier: Knowledge loss accelerates biodiversity loss (2-3x)
 */
export interface IndigenousKnowledgeState {
  languagesExtinct: number; // Cumulative count
  languagesAtRisk: number; // UNESCO 2024: 3,330 (40% of 8,325)
  knowledgeLost: number; // [0, 1] Unitless metric
  extinctionRatePerMonth: number; // [EMPIRICAL] 2/month
}

/**
 * Institutional Collapse State
 *
 * Research: Current History 2025 (Haiti), Urban Institute 2024 ("Hemingway bankruptcy")
 * Type: QUALITATIVE case studies + EXPERT ESTIMATES
 *
 * NOTE: Weak empirical basis per Sylvia - wide uncertainty ranges
 * Dynamics: "First gradually, then suddenly"
 * Recovery window: 5-15 years (narrow window for intervention)
 */
export interface InstitutionalState {
  corruptionIndex: number; // [0, 100] 100 = total corruption
  trustInGovernment: number; // [0, 1]
  armedGroupControl: number; // [0, 1] % territory under non-state control
  collapsed: boolean;
  gradualDeclineMonths: number; // Duration of gradual phase before collapse
  recoveryWindowMonths: number | null; // 5-15 years after collapse (null = window closed)
}

/**
 * Complete Irreversibility Tracking State
 *
 * Aggregates all tipping point systems that exhibit irreversibility
 * or long-term hysteresis on human timescales.
 */
export interface IrreversibilityState {
  iceSheets?: IceSheetState;
  permafrost?: PermafrostState;
  amoc?: AMOCState;
  amazon?: AmazonState;
  extinctionDebt?: ExtinctionDebtState;
  coralReefs?: CoralReefState;
  indigenousKnowledge?: IndigenousKnowledgeState;
  institutional?: InstitutionalState;
}
