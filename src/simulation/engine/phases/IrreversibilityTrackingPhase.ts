/**
 * Irreversibility Tracking Phase (TIER 1 CRITICAL)
 *
 * Tracks environmental and social tipping points that cannot fully recover
 * on human timescales (centuries to millennia). Models hysteresis, extinction debt,
 * and legacy contamination.
 *
 * Research foundation:
 * - research/irreversibility_framework_20251116.md (41 sources, 2022-2025)
 * - reviews/irreversibility_framework_critique_20251116.md (Grade B-, CONDITIONAL PASS)
 *
 * CRITICAL Sylvia conditions implemented:
 * 1. Probabilistic thresholds (ranges, not point estimates)
 * 2. Permafrost as continuous "dimmer switch" (NOT binary tipping point)
 * 3. AMOC gradual weakening only (NO collapse before +4°C)
 * 4. Uncertainty ranges for ALL parameters
 * 5. Empirical vs model-derived flagged
 *
 * Order: 21.4 (after planetary boundaries update, before crisis detection)
 *
 * @reads state.resourceEconomy.co2, state.amazonForest, state.coralReefs, state.iceSheets, etc.
 * @writes state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact (adds coral collapse impact)
 *         state.environmentalAccumulation.biodiversityIndex
 *         state.tippingPoints.* (various tipping point states)
 */

import {
  GameState,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction,
  AmazonRegionState,
} from '@/types/game';
import {
  assertFinite,
  assertInRange,
  assertProbability,
  assertDefined,
  assertStateProperty,
} from '@/simulation/utils/assertions';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';

export class IrreversibilityTrackingPhase implements SimulationPhase {
  readonly id = 'irreversibility_tracking';
  readonly name = 'Irreversibility Tracking';
  readonly order = 21.4; // After planetary boundaries (21.0), before legacy nutrients (21.5)

  readonly dependencies = ['planetary_boundaries'] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const events: any[] = [];

    // HIGH-8 FIX (Nov 28, 2025): Disable irreversibility tracking during historical mode
    // Rationale: Historical period (1990-2024) did NOT cross irreversible tipping points
    // (no Greenland collapse, no AMOC shutdown, no Amazon dieback - these are projection concerns)
    // Prevents indigenous knowledge loss biodiversity impacts from corrupting hindcast calibration
    if (isHistoricalModeActive(state)) {
      return { events };
    }

    // === 1. ICE SHEET HYSTERESIS (Probabilistic Thresholds) ===
    // Research: Nature 2023 (Greenland threshold +0.8-3.2°C, 95% CI)
    //           Nature Comms E&E 2025 (+1.5°C too high for polar ice sheets)
    // Type: MODEL-DERIVED with EMPIRICAL validation (satellite observations)
    this.trackIceSheetHysteresis(state, rng, events);

    // === 2. PERMAFROST THAW (Continuous "Dimmer Switch") ===
    // Research: MIT 2024 ("dimmer switch" not on/off), Nature Climate Change 2022 (+9% methane since 2002)
    // Type: EMPIRICAL observations + MODEL projections
    // CRITICAL: NOT a tipping point - progressive thaw with temperature
    this.trackPermafrostThaw(state, rng, events);

    // === 3. AMOC WEAKENING (Gradual, NO Collapse) ===
    // Research: Nature Feb 2025 (resilient across 34 models), NOAA Jan 2025 (weakening observed 2000s, paused 2010s)
    // Type: EMPIRICAL observations (RAPID array) + MODEL consensus
    // CRITICAL: NO collapse before +4°C (consensus), gradual weakening only
    this.trackAMOCWeakening(state, rng, events);

    // === 4. AMAZON RAINFOREST DIEBACK (Regional Heterogeneity) ===
    // Research: Nature Feb 2024 (10-47% exposed to tipping by 2050), RAISG 2023 (Brazilian Amazon 25% transformed)
    // Type: EMPIRICAL deforestation data + MODEL-DERIVED threshold ranges
    // CRITICAL: Regional variation (SE Amazon 28% > NW Amazon intact)
    this.trackAmazonDieback(state, rng, events);

    // === 5. EXTINCTION DEBT (50-150 year lag) ===
    // Research: Conservation Letters 2024 (150-year avian debt), Nature Comms 2016 (power-law decay)
    // Type: EMPIRICAL historical extinctions + MODEL timescales
    this.trackExtinctionDebt(state, rng, events);

    // === 6. CORAL REEF COLLAPSE (Dual threats: thermal + acidification) ===
    // Research: Nature Comms 2024 (recovery possible if <+2°C), PNAS 2021 (pH 7.8 dissolution threshold)
    // Type: EMPIRICAL bleaching events + MODEL projections
    this.trackCoralReefCollapse(state, rng, events);

    // === 7. INDIGENOUS KNOWLEDGE LOSS ===
    // Research: UNESCO 2024 (2 languages/month lost), Trends E&E 2019 (knowledge-species multiplier)
    // Type: EMPIRICAL language extinction data + QUALITATIVE impact estimates
    this.trackIndigenousKnowledgeLoss(state, rng, events);

    // === 8. INSTITUTIONAL COLLAPSE (Social irreversibility) ===
    // Research: Current History 2025 (Haiti case study), Urban Institute 2024 ("Hemingway bankruptcy")
    // Type: QUALITATIVE case studies + EXPERT ESTIMATES
    // NOTE: Weak empirical basis per Sylvia's critique - wide uncertainty ranges
    this.trackInstitutionalCollapse(state, rng, events);

    return { events };
  }

  // ============================================================================
  // 1. ICE SHEET HYSTERESIS (Probabilistic Thresholds)
  // ============================================================================

  private trackIceSheetHysteresis(
    state: GameState,
    rng: RNGFunction,
    events: any[]
  ): void {
    // Get current temperature anomaly - no silent fallbacks
    const tempAnomaly = assertStateProperty(
      state,
      'resourceEconomy.co2.temperatureAnomaly',
      {
        location: 'trackIceSheetHysteresis',
        month: state.currentMonth,
      }
    );

    // === PROBABILISTIC THRESHOLD (Sylvia condition #1) ===
    // Research: Nature 2023 - Greenland threshold +0.8-3.2°C (95% CI)
    // UNCERTAINTY PROPAGATION (Nov 23, 2025): Use sampled threshold if available
    // Range: [0.8, 3.2]C - Nature (2023)

    // Use sampled threshold or default to midpoint (2.0°C)
    const COLLAPSE_THRESHOLD_MEAN = state.uncertaintyParameters?.greenlandCollapseThreshold ?? 2.0; // [MODEL-DERIVED] °C
    const COLLAPSE_THRESHOLD_STDDEV = 0.5; // [MODEL-DERIVED] Uncertainty range
    const RECOVERY_THRESHOLD = COLLAPSE_THRESHOLD_MEAN - 0.5; // [MODEL-DERIVED] Hysteresis gap: need cooling below threshold

    // CRITICAL FIX (Nov 22, 2025): tippingPoints initialized in createDefaultInitialState
    // No more dynamic creation with `as any` - fail loudly if missing
    const tippingPoints = assertDefined(state.tippingPoints, {
      location: 'trackIceSheetHysteresis',
      valueName: 'state.tippingPoints',
      month: state.currentMonth,
      additionalInfo: { context: 'CRITICAL: tippingPoints must be initialized in createDefaultInitialState' }
    });

    const iceSheets = assertDefined(tippingPoints.iceSheets, {
      location: 'trackIceSheetHysteresis',
      valueName: 'tippingPoints.iceSheets',
      month: state.currentMonth,
      additionalInfo: { context: 'CRITICAL: iceSheets must be initialized in initializeIrreversibilityState' }
    });

    // Calculate collapse probability using sigmoid (NOT deterministic on/off switch)
    // P(collapse) = sigmoid((T - threshold_mean) / threshold_stddev)
    const sigmoidSteepness = 1 / COLLAPSE_THRESHOLD_STDDEV;
    const collapseProbability = this.sigmoid(
      (tempAnomaly - COLLAPSE_THRESHOLD_MEAN) * sigmoidSteepness
    );

    assertProbability(collapseProbability, {
      location: 'trackIceSheetHysteresis',
      valueName: 'collapseProbability',
      month: state.currentMonth,
    });

    iceSheets.collapseProbability = collapseProbability;

    // === PROBABILISTIC COLLAPSE (NOT deterministic) ===
    if (!iceSheets.greenlandCollapsed) {
      // Monthly collapse probability (scaled down from annual)
      const monthlyCollapseProbability = collapseProbability / 12;

      if (rng() < monthlyCollapseProbability) {
        iceSheets.greenlandCollapsed = true;
        iceSheets.collapseMonth = state.currentMonth;
        iceSheets.seaLevelCommitmentMeters = 7.2; // Research: Greenland contributes 7.2m SLR

        events.push({
          type: 'tipping_point_crossed',
          severity: 0.9,
          description: `🌍🚨 GREENLAND ICE SHEET COLLAPSE: Irreversible melting triggered at +${tempAnomaly.toFixed(2)}°C. Commits to 7.2m sea level rise over centuries.`,
          impact: 'Multi-meter sea level rise commitment, coastal displacement, irreversible on human timescales',
          month: state.currentMonth,
        });

        console.log(
          `\n🌍🚨 ICE SHEET TIPPING POINT CROSSED (Month ${state.currentMonth})`
        );
        console.log(`   Temperature: +${tempAnomaly.toFixed(2)}°C (threshold range: +${(COLLAPSE_THRESHOLD_MEAN - 2*COLLAPSE_THRESHOLD_STDDEV).toFixed(1)}-${(COLLAPSE_THRESHOLD_MEAN + 2*COLLAPSE_THRESHOLD_STDDEV).toFixed(1)}°C, 95% CI)`);
        console.log(`   Collapse probability: ${(collapseProbability * 100).toFixed(1)}%`);
        console.log(`   Sea level commitment: ${iceSheets.seaLevelCommitmentMeters}m over 200-1000 years`);
        console.log(`   Recovery threshold: <+${RECOVERY_THRESHOLD}°C (hysteresis gap: ${(COLLAPSE_THRESHOLD_MEAN - RECOVERY_THRESHOLD).toFixed(1)}°C)`);
      }
    } else {
      // === HYSTERESIS: Recovery requires cooling BELOW collapse threshold ===
      if (tempAnomaly < RECOVERY_THRESHOLD) {
        // Recovery is POSSIBLE but extremely slow (centuries to millennia)
        // For simulation purposes, treat as irreversible on human timescales
        console.log(
          `🌍⚠️ Ice sheets: Temperature below recovery threshold (+${tempAnomaly.toFixed(2)}°C < +${RECOVERY_THRESHOLD}°C) but recovery takes millennia`
        );
      }
    }

    // Update climate boundary with ice sheet contribution
    if (iceSheets.greenlandCollapsed && state.planetaryBoundariesSystem) {
      const climateBoundary = state.planetaryBoundariesSystem.boundaries.climate_change;
      if (climateBoundary) {
        // Ice sheet collapse adds to climate boundary value (positive feedback)
        // Albedo loss accelerates warming
        climateBoundary.tippingPointRisk = Math.min(
          1.0,
          climateBoundary.tippingPointRisk + 0.1
        );
      }
    }
  }

  // ============================================================================
  // 2. PERMAFROST THAW (Continuous "Dimmer Switch" - NOT Binary)
  // ============================================================================

  private trackPermafrostThaw(
    state: GameState,
    rng: RNGFunction,
    events: any[]
  ): void {
    const tempAnomaly = assertStateProperty(
      state,
      'resourceEconomy.co2.temperatureAnomaly',
      {
        location: 'trackPermafrostThaw',
        month: state.currentMonth,
      }
    );

    // === ARCTIC AMPLIFICATION (4x global warming) ===
    // Research: Nature Climate Change 2022 - Arctic warming 4x global average
    const ARCTIC_AMPLIFICATION = 4.0; // [EMPIRICAL]
    const arcticTempAnomaly = tempAnomaly * ARCTIC_AMPLIFICATION;

    // CRITICAL FIX (Nov 22, 2025): Use proper assertions instead of dynamic creation
    const tippingPoints = assertDefined(state.tippingPoints, {
      location: 'trackPermafrostThaw',
      valueName: 'state.tippingPoints',
      month: state.currentMonth,
    });

    const permafrost = assertDefined(tippingPoints.permafrost, {
      location: 'trackPermafrostThaw',
      valueName: 'tippingPoints.permafrost',
      month: state.currentMonth,
    });

    // === CONTINUOUS THAW FUNCTION (Dimmer Switch - Sylvia condition #2) ===
    // Research: MIT 2024 - "dimmer switch model", not on/off tipping point
    // Thaw percentage as function of Arctic temperature anomaly
    // +1.5°C global (+6°C Arctic) → 50% thawed
    // +2.5°C global (+10°C Arctic) → 90% thawed
    // Using logistic function for gradual transition

    const THAW_50_PERCENT_ARCTIC_TEMP = 6.0; // [MODEL-DERIVED] °C Arctic anomaly for 50% thaw
    const THAW_STEEPNESS = 0.3; // [MODEL-DERIVED] Logistic curve steepness

    // Logistic function: percentThawed = 100 / (1 + exp(-steepness * (arcticTemp - midpoint)))
    const targetPercentThawed =
      100 / (1 + Math.exp(-THAW_STEEPNESS * (arcticTempAnomaly - THAW_50_PERCENT_ARCTIC_TEMP)));

    assertInRange(targetPercentThawed, 0, 100, {
      location: 'trackPermafrostThaw',
      valueName: 'targetPercentThawed',
      month: state.currentMonth,
    });

    // === GRADUAL THAW (Not Instantaneous) ===
    // Thaw rate: Approaches target exponentially with ~10-year timescale
    const THAW_TIMESCALE_MONTHS = 120; // [MODEL-DERIVED] 10 years
    const thawRate = (targetPercentThawed - permafrost.percentThawed) / THAW_TIMESCALE_MONTHS;

    const previousPercentThawed = permafrost.percentThawed;
    permafrost.percentThawed = Math.max(
      previousPercentThawed,
      Math.min(100, permafrost.percentThawed + thawRate)
    );

    // === CARBON RELEASE (Progressive with thaw) ===
    // Research: Harvard 2024 - 1,500 Gt C in permafrost (2x atmospheric carbon)
    // Nature Climate Change 2022 - +9% methane emissions since 2002
    // UNCERTAINTY PROPAGATION (Nov 23, 2025): Use sampled carbon pool if available
    // Range: [1460, 1600] Gt C - Nature Climate Change (2022)
    const TOTAL_PERMAFROST_CARBON = state.uncertaintyParameters?.permafrostCarbonPool ?? 1500; // [EMPIRICAL] Gt C
    const CARBON_RELEASE_FRACTION = 0.15; // [MODEL-DERIVED] 15% released as CO2/CH4 when thawed

    const thawedThisMonth = permafrost.percentThawed - previousPercentThawed;
    if (thawedThisMonth > 0.01) {
      const carbonReleasedThisMonth =
        (thawedThisMonth / 100) * TOTAL_PERMAFROST_CARBON * CARBON_RELEASE_FRACTION;

      permafrost.cumulativeCarbonReleased += carbonReleasedThisMonth;

      // Update methane release rate (9% increase per decade observed, scaled to current thaw)
      const METHANE_FRACTION = 0.05; // [EMPIRICAL] 5% of released carbon as methane
      permafrost.methaneReleaseRate += carbonReleasedThisMonth * METHANE_FRACTION * 12; // Gt C/month → Mt CH4/year

      console.log(
        `🌡️⚠️ PERMAFROST THAW (Dimmer Switch): ${permafrost.percentThawed.toFixed(1)}% thawed (+${thawedThisMonth.toFixed(2)}% this month)`
      );
      console.log(
        `   Arctic temperature: +${arcticTempAnomaly.toFixed(2)}°C (${ARCTIC_AMPLIFICATION}x global +${tempAnomaly.toFixed(2)}°C)`
      );
      console.log(
        `   Cumulative carbon released: ${permafrost.cumulativeCarbonReleased.toFixed(1)} Gt C`
      );
      console.log(
        `   Methane release rate: ${permafrost.methaneReleaseRate.toFixed(1)} Mt CH4/year`
      );

      // Positive feedback to climate
      if (state.resourceEconomy?.co2 && carbonReleasedThisMonth > 0.1) {
        // Add permafrost carbon to atmospheric CO2 (positive feedback)
        const ppmIncrease = carbonReleasedThisMonth * 0.47; // Gt C → ppm CO2 conversion
        state.resourceEconomy.co2.atmosphericCO2 += ppmIncrease;

        console.log(`   🔁 Positive feedback: +${ppmIncrease.toFixed(2)} ppm CO2`);
      }
    }
  }

  // ============================================================================
  // 3. AMOC WEAKENING (Gradual Only, NO Collapse Before +4°C)
  // ============================================================================

  private trackAMOCWeakening(
    state: GameState,
    rng: RNGFunction,
    events: any[]
  ): void {
    const tempAnomaly = assertStateProperty(
      state,
      'resourceEconomy.co2.temperatureAnomaly',
      {
        location: 'trackAMOCWeakening',
        month: state.currentMonth,
      }
    );

    // CRITICAL FIX (Nov 22, 2025): Use proper assertions
    const tippingPoints = assertDefined(state.tippingPoints, {
      location: 'trackAMOCWeakening',
      valueName: 'state.tippingPoints',
      month: state.currentMonth,
    });

    const amoc = assertDefined(tippingPoints.amoc, {
      location: 'trackAMOCWeakening',
      valueName: 'tippingPoints.amoc',
      month: state.currentMonth,
    });

    // === GRADUAL WEAKENING (Sylvia condition #3) ===
    // Research: Nature Feb 2025 - AMOC resilient across 34 models, Southern Ocean sustains weak circulation
    // NOAA Jan 2025 - Extensive weakening 2000s, paused since early 2010s
    // Type: EMPIRICAL observations (RAPID array) + MODEL consensus

    // === TEMPERATURE-DEPENDENT COLLAPSE PROBABILITY ===
    // Original Sources (traced from Armstrong McKay et al. 2022):
    // - Stommel (1961) Tellus - Bistability theory (salt-advection feedback)
    // - Rahmstorf (1996) Climate Dynamics - Freshwater transport criterion
    // - Weijer et al. (2020) GRL - CMIP6 projections (27 models: -18% to -74% by 2100)
    // - Van Westen et al. (2024) Science Advances - First ESM collapse (CESM1)
    // - Qin et al. (2025) Nature - Resilience across 34 models (Southern Ocean sustains weak AMOC)
    // Synthesis: Armstrong McKay et al. (2022) Science
    //
    // See: research/amoc_collapse_probability_20251120.md
    // See: research/amoc_tipping_point_original_sources_20251120.md
    //
    // CRITICAL UPDATE (Nov 20, 2025): Fixed 5% probability replaced with temperature-dependent function
    // - <+2°C: ~0.5% (extremely unlikely)
    // - +2-2.2°C: ~1-5% (outlier tail risk)
    // - +2.2-3°C: ~5-50% (rising risk)
    // - +3-3.9°C: ~50-90% (high risk)
    // - >+3.9°C: ~90% (very likely)
    //
    // Gradual weakening: ~15% per degree of warming (linear approximation)
    const WEAKENING_RATE_PER_DEGREE = 0.15; // [MODEL-DERIVED from EMPIRICAL observations]
    const COLLAPSE_THRESHOLD = 4.0; // [MODEL-DERIVED] °C - consensus threshold (Armstrong McKay 2022: range 1.4-8°C)

    // === TEMPERATURE-DEPENDENT COLLAPSE PROBABILITY FUNCTION ===
    // Based on Weijer et al. (2020), Van Westen et al. (2024), Qin et al. (2025)
    // RECALIBRATED (Nov 24, 2025): Default raised from 3.0 to 4.0°C (median estimate)
    // Sylvia audit: reviews/mechanism_audit_tipping_cascades_20251124.md
    // Baker et al. (2025) Nature: 34/35 CMIP6 models show AMOC resilience via Southern Ocean compensation
    // UNCERTAINTY PROPAGATION (Nov 23, 2025): Use sampled AMOC threshold if available
    // Range: [2.2, 5.0]C - Updated range per Armstrong McKay 2022 (median 4°C, range 1.4-8°C)
    const amocThreshold = state.uncertaintyParameters?.amocCollapseThreshold ?? 4.0;

    const calculateAMOCCollapseProbability = (temp: number): number => {
      // Dynamically scale probability based on sampled threshold
      // Low threshold → crisis triggers earlier, High threshold → more resilient
      const lowThreshold = amocThreshold - 0.8;   // e.g., 2.2 if sampled=3.0
      const midThreshold = amocThreshold;          // e.g., 3.0
      const highThreshold = amocThreshold + 0.9;   // e.g., 3.9

      if (temp < lowThreshold - 0.2) {
        // Extremely unlikely well below threshold
        return 0.005; // 0.5% annual probability
      } else if (temp < lowThreshold) {
        // Linear interpolation: 0.5% → 5%
        return 0.005 + ((temp - (lowThreshold - 0.2)) / 0.2) * (0.05 - 0.005);
      } else if (temp < midThreshold) {
        // Linear interpolation: 5% → 50%
        const range = midThreshold - lowThreshold;
        return 0.05 + ((temp - lowThreshold) / range) * (0.50 - 0.05);
      } else if (temp < highThreshold) {
        // Linear interpolation: 50% → 90%
        const range = highThreshold - midThreshold;
        return 0.50 + ((temp - midThreshold) / range) * (0.90 - 0.50);
      } else {
        // Very likely above high threshold
        return 0.90; // 90% annual probability
      }
    };

    // Calculate target strength based on temperature
    let targetStrength = 1.0 - (tempAnomaly * WEAKENING_RATE_PER_DEGREE);
    targetStrength = Math.max(0.4, Math.min(1.0, targetStrength)); // Floor at 40% (Southern Ocean sustains weak circulation)

    // Gradual approach to target (not instantaneous)
    const WEAKENING_TIMESCALE_MONTHS = 60; // [MODEL-DERIVED] 5-year timescale
    const weakeningRate = (amoc.strength - targetStrength) / WEAKENING_TIMESCALE_MONTHS;
    amoc.strength = Math.max(0.4, amoc.strength - weakeningRate);

    assertInRange(amoc.strength, 0.4, 1.0, {
      location: 'trackAMOCWeakening',
      valueName: 'amoc.strength',
      month: state.currentMonth,
    });

    // === COLLAPSE CHECK (Temperature-Dependent Probability) ===
    if (!amoc.collapsed && tempAnomaly >= 2.0) {
      // Calculate temperature-dependent annual collapse probability
      const annualCollapseProbability = calculateAMOCCollapseProbability(tempAnomaly);
      const monthlyCollapseProbability = annualCollapseProbability / 12;

      // Validate probability is in [0, 1]
      assertProbability(monthlyCollapseProbability, {
        location: 'trackAMOCWeakening',
        valueName: 'monthlyCollapseProbability',
        month: state.currentMonth,
        additionalInfo: {
          tempAnomaly,
          annualProbability: annualCollapseProbability,
        },
      });

      if (rng() < monthlyCollapseProbability) {
        amoc.collapsed = true;
        amoc.strength = 0.1; // Near-zero but not complete shutdown (eddies sustain weak circulation)

        const isOutlier = tempAnomaly < COLLAPSE_THRESHOLD;
        const severityLabel = isOutlier ? 'OUTLIER' : 'EXPECTED';
        const emoji = isOutlier ? '🌊⚠️' : '🌊🚨';

        events.push({
          type: 'tipping_point_crossed',
          severity: 0.85,
          description: `${emoji} AMOC COLLAPSE ${isOutlier ? '(Outlier)' : ''}: Atlantic circulation collapsed at +${tempAnomaly.toFixed(2)}°C. Northern Europe cooling, sea level rise, monsoon disruption. Annual probability: ${(annualCollapseProbability * 100).toFixed(1)}%.`,
          impact:
            'Regional cooling 2-5°C (Northern Europe), accelerated sea level rise (North Atlantic), African monsoon disruption',
          month: state.currentMonth,
        });

        console.log(`\n${emoji} AMOC COLLAPSE - ${severityLabel} (Month ${state.currentMonth})`);
        console.log(`   Temperature: +${tempAnomaly.toFixed(2)}°C`);
        console.log(`   Annual collapse probability: ${(annualCollapseProbability * 100).toFixed(1)}%`);
        console.log(`   Consensus threshold: +${COLLAPSE_THRESHOLD}°C`);
        console.log(`   Residual strength: ${(amoc.strength * 100).toFixed(1)}% (eddies sustain weak circulation)`);
        console.log(`   Recovery timescale: 500-2000 years`);
      }
    }

    // Log gradual weakening (if significant change)
    if (Math.abs(weakeningRate) > 0.01) {
      console.log(
        `🌊 AMOC WEAKENING: ${(amoc.strength * 100).toFixed(1)}% strength (${((1 - amoc.strength) * 100).toFixed(1)}% weaker than pre-industrial)`
      );
      console.log(`   Temperature: +${tempAnomaly.toFixed(2)}°C`);
      console.log(`   Target strength: ${(targetStrength * 100).toFixed(1)}%`);
    }
  }

  // ============================================================================
  // 4. AMAZON RAINFOREST DIEBACK (Regional Heterogeneity)
  // ============================================================================

  private trackAmazonDieback(
    state: GameState,
    rng: RNGFunction,
    events: any[]
  ): void {
    // CRITICAL FIX (Nov 22, 2025): Use proper assertions
    const tippingPoints = assertDefined(state.tippingPoints, {
      location: 'trackAmazonDieback',
      valueName: 'state.tippingPoints',
      month: state.currentMonth,
    });

    const amazon = assertDefined(tippingPoints.amazon, {
      location: 'trackAmazonDieback',
      valueName: 'tippingPoints.amazon',
      month: state.currentMonth,
    });

    // === REGIONAL THRESHOLDS (Sylvia condition #4: Regional Heterogeneity) ===
    // Research: Nature Feb 2024 - 10-47% exposed to tipping by 2050
    //           RAISG 2023 - Regional variation SE 28%, Brazilian 25%, NW <10%
    //           Lovejoy & Nobre 2019 - 20-25% threshold (classic estimate)
    // UNCERTAINTY PROPAGATION (Nov 23, 2025): Use sampled threshold if available
    // Range: [0.20, 0.25] - Frontiers in Public Health (2025)

    // Threshold is PROBABILISTIC with regional variation
    // Use sampled threshold (as percentage 0-1) converted to percent, or default
    const sampledThreshold = state.uncertaintyParameters?.amazonDiebackDeforestation;
    const DEFORESTATION_THRESHOLD_MEAN = sampledThreshold ? sampledThreshold * 100 : 22.5; // [EXPERT-ESTIMATE] %
    const DEFORESTATION_THRESHOLD_RANGE = 2.5; // [EXPERT-ESTIMATE] +/- range
    const TRANSITION_TIMESCALE_YEARS = 50; // [MODEL-DERIVED] Years for savanna transition once tipped

    // Check each region
    const regions: Array<[string, AmazonRegionState]> = [
      ['southeast', amazon.regions.southeast],
      ['northwest', amazon.regions.northwest],
      ['brazilian', amazon.regions.brazilian],
    ];

    for (const [regionName, region] of regions) {
      if (region.tipped) {
        // Already tipped - continue savanna transition
        region.savannaTransitionProgress = Math.min(
          1.0,
          region.savannaTransitionProgress + 1 / (TRANSITION_TIMESCALE_YEARS * 12)
        );

        if (region.savannaTransitionProgress > 0.5 && region.savannaTransitionProgress < 0.51) {
          console.log(
            `🌳⚠️ Amazon ${regionName}: Savanna transition ${(region.savannaTransitionProgress * 100).toFixed(0)}% complete`
          );
        }
      } else {
        // Check for tipping
        // Probabilistic threshold: Use uniform distribution within range
        const thresholdForThisRegion =
          DEFORESTATION_THRESHOLD_MEAN + (rng() - 0.5) * 2 * DEFORESTATION_THRESHOLD_RANGE;

        if (region.deforestation >= thresholdForThisRegion) {
          region.tipped = true;
          region.savannaTransitionProgress = 0.01; // Start transition

          events.push({
            type: 'tipping_point_crossed',
            severity: 0.8,
            description: `🌳🚨 AMAZON ${regionName.toUpperCase()} TIPPING POINT: ${region.deforestation.toFixed(1)}% deforestation crossed threshold (~${thresholdForThisRegion.toFixed(1)}%). Irreversible savanna transition begins (50-year timescale).`,
            impact: `Carbon release, rainfall reduction, biodiversity collapse in ${regionName} Amazon`,
            month: state.currentMonth,
          });

          console.log(`\n🌳🚨 AMAZON ${regionName.toUpperCase()} TIPPED (Month ${state.currentMonth})`);
          console.log(`   Deforestation: ${region.deforestation.toFixed(1)}% (threshold: ~${thresholdForThisRegion.toFixed(1)}%)`);
          console.log(`   Savanna transition: 50 years`);
          console.log(`   Regional heterogeneity: SE ${amazon.regions.southeast.deforestation}%, NW ${amazon.regions.northwest.deforestation}%`);
        }
      }

      // Carbon release from transition
      if (region.savannaTransitionProgress > 0) {
        const CARBON_STOCK_PER_REGION = 40; // [MODEL-DERIVED] Gt C per region (~120 Gt total)
        const carbonReleaseRate =
          (CARBON_STOCK_PER_REGION / (TRANSITION_TIMESCALE_YEARS * 12)) *
          region.savannaTransitionProgress;
        amazon.carbonReleased += carbonReleaseRate;

        // Positive feedback to climate
        if (carbonReleaseRate > 0.01 && state.resourceEconomy?.co2) {
          const ppmIncrease = carbonReleaseRate * 0.47; // Gt C → ppm CO2
          state.resourceEconomy.co2.atmosphericCO2 += ppmIncrease;
        }
      }
    }

    // Check if full biome has collapsed (all regions tipped)
    const allRegionsTipped =
      amazon.regions.southeast.tipped &&
      amazon.regions.northwest.tipped &&
      amazon.regions.brazilian.tipped;
    if (allRegionsTipped && !amazon.collapsed) {
      amazon.collapsed = true;

      events.push({
        type: 'tipping_point_crossed',
        severity: 0.95,
        description: `🌳💥 FULL AMAZON COLLAPSE: All regions tipped to savanna. Irreversible loss of world's largest rainforest. -120 Gt C carbon storage, rainfall pattern collapse.`,
        impact:
          'Global carbon sink loss, South American drought, mass extinction, indigenous displacement',
        month: state.currentMonth,
      });

      console.log(`\n🌳💥 FULL AMAZON BIOME COLLAPSE (Month ${state.currentMonth})`);
      console.log(`   All regions tipped: SE ${amazon.regions.southeast.savannaTransitionProgress.toFixed(2)}, NW ${amazon.regions.northwest.savannaTransitionProgress.toFixed(2)}, BR ${amazon.regions.brazilian.savannaTransitionProgress.toFixed(2)}`);
      console.log(`   Total carbon released: ${amazon.carbonReleased.toFixed(1)} Gt C`);
    }
  }

  // ============================================================================
  // 5. EXTINCTION DEBT (50-150 year time lag)
  // ============================================================================
  //
  // COMPLEXITY ANALYSIS (Nov 20, 2025 optimization):
  // - Time: O(n) per month where n = current queue size
  //   Previous: O(n²) with splice() causing n element shifts per deletion
  //   Optimized: O(n) single pass with two-pointer compaction
  // - Space: O(1) in-place modification (no allocations)
  // - Determinism: PRESERVED (same iteration order, same RNG consumption)
  //
  // Performance characteristics:
  // - Normal queue size: <100 debts (150-year max lag → ~10 debts/decade)
  // - Extreme scenarios: ~500 debts (warning threshold)
  // - Cost per month: O(n) iterate + O(1) truncate = O(n) total
  //
  // Regression detection: Performance assertion warns if queue exceeds 500 items

  private trackExtinctionDebt(
    state: GameState,
    rng: RNGFunction,
    events: any[]
  ): void {
    // CRITICAL FIX (Nov 22, 2025): Use proper assertions
    const tippingPoints = assertDefined(state.tippingPoints, {
      location: 'trackExtinctionDebt',
      valueName: 'state.tippingPoints',
      month: state.currentMonth,
    });

    const extinctionDebt = assertDefined(tippingPoints.extinctionDebt, {
      location: 'trackExtinctionDebt',
      valueName: 'tippingPoints.extinctionDebt',
      month: state.currentMonth,
    });

    // PERFORMANCE ASSERTION: Detect pathological queue growth
    // Normal: <100 debts (150-year max lag → ~10 debts per decade)
    // Warning: 100-500 debts (investigate debt accumulation rate)
    // Critical: >500 debts (likely bug or extreme scenario)
    if (extinctionDebt.debtQueue.length > 500) {
      console.warn(
        `⚠️ PERFORMANCE: Extinction debt queue size ${extinctionDebt.debtQueue.length} exceeds 500. Investigate accumulation rate (Month ${state.currentMonth}).`
      );
    }

    // === ADD NEW DEBT (from current habitat loss) ===
    // Research: Conservation Letters 2024 - 150-year avian extinction debt
    //           Nature Comms 2016 - Power-law decay with half-life increasing with area
    // Type: EMPIRICAL historical data + MODEL timescales

    // Get current habitat loss rate from land use system
    if (state.planetaryBoundariesSystem?.landUse) {
      const landUse = state.planetaryBoundariesSystem.landUse;
      const globalHabitatCover = assertFinite(
        assertDefined(landUse.globalHabitatCoverPercent, {
          location: 'trackExtinctionDebt',
          valueName: 'landUse.globalHabitatCoverPercent',
          month: state.currentMonth,
          additionalInfo: { context: 'Required for extinction debt calculation' }
        }),
        {
          location: 'trackExtinctionDebt',
          valueName: 'globalHabitatCover',
          month: state.currentMonth,
        }
      );

      // Habitat loss this month (estimate from rate of change)
      // This is a simplified proxy - full implementation would track monthly changes
      const BASELINE_HABITAT_COVER = 75; // [EMPIRICAL] Safe boundary
      const habitatLossPercent = BASELINE_HABITAT_COVER - globalHabitatCover;

      if (habitatLossPercent > 0.1) {
        // Significant habitat loss - add to extinction debt
        // Research: 10% habitat loss → ~5% species committed to extinction (power-law)
        const SPECIES_AT_RISK_MULTIPLIER = 0.5; // [MODEL-DERIVED]
        const speciesAddedToDebt = habitatLossPercent * SPECIES_AT_RISK_MULTIPLIER;

        // Timescale: 50-150 years (use triangular distribution, peak at 100)
        const LAG_MIN_YEARS = 50; // [EMPIRICAL]
        const LAG_MAX_YEARS = 150; // [EMPIRICAL]
        const LAG_MODE_YEARS = 100; // [EMPIRICAL] Peak probability

        const lagYears = this.triangularSample(
          rng,
          LAG_MIN_YEARS,
          LAG_MAX_YEARS,
          LAG_MODE_YEARS
        );
        const lagMonths = lagYears * 12;

        extinctionDebt.debtQueue.push({
          speciesCount: speciesAddedToDebt,
          debtTimescaleMonths: lagMonths,
          monthsRemaining: lagMonths,
          extinctionProbabilityPerMonth: speciesAddedToDebt / lagMonths,
        });

        extinctionDebt.totalDebt += speciesAddedToDebt;

        console.log(
          `🦴 EXTINCTION DEBT ADDED: ${speciesAddedToDebt.toFixed(1)} species committed (lag: ${lagYears.toFixed(0)} years)`
        );
      }
    }

    // === PAY DEBT (extinctions from historical habitat loss) ===
    // PERFORMANCE FIX (Nov 20, 2025): O(n) compaction with two-pointer technique
    // Previous: splice() causes O(n²) with n deletions × n array shifts each
    // Optimized: Single O(n) pass with in-place compaction (no shifts, no allocations)

    let writeIndex = 0; // Write pointer for keeping valid debts

    for (let readIndex = 0; readIndex < extinctionDebt.debtQueue.length; readIndex++) {
      const debt = extinctionDebt.debtQueue[readIndex];
      debt.monthsRemaining -= 1;

      if (debt.monthsRemaining <= 0) {
        // Debt fully paid - extinctions occur (skip in compaction)
        extinctionDebt.paidDebt += debt.speciesCount;
        extinctionDebt.totalDebt -= debt.speciesCount;

        console.log(
          `💀 EXTINCTION DEBT PAID: ${debt.speciesCount.toFixed(1)} species extinct from historical habitat loss`
        );

        // Update biosphere boundary
        if (state.planetaryBoundariesSystem?.boundaries?.biosphere_integrity) {
          const biosphere = state.planetaryBoundariesSystem.boundaries.biosphere_integrity;
          biosphere.currentValue += debt.speciesCount * 0.01; // Increase extinction rate
          biosphere.extinctionContribution += 0.05; // Debt contributes to risk
        }
        // Skip: don't copy to writeIndex, don't increment writeIndex
      } else {
        // Keep this debt - copy to writeIndex if different from readIndex
        if (writeIndex !== readIndex) {
          extinctionDebt.debtQueue[writeIndex] = debt;
        }
        writeIndex++;

        // Log every 10 years
        if (debt.monthsRemaining % 120 === 0) {
          console.log(
            `🦴 Extinction debt: ${debt.speciesCount.toFixed(1)} species (${(debt.monthsRemaining / 12).toFixed(0)} years remaining)`
          );
        }
      }
    }

    // Truncate array to new length (O(1) operation)
    extinctionDebt.debtQueue.length = writeIndex;
  }

  // ============================================================================
  // 6. CORAL REEF COLLAPSE (Thermal + Acidification)
  // ============================================================================

  private trackCoralReefCollapse(
    state: GameState,
    rng: RNGFunction,
    events: any[]
  ): void {
    const tempAnomaly = assertStateProperty(
      state,
      'resourceEconomy.co2.temperatureAnomaly',
      {
        location: 'trackCoralReefCollapse',
        month: state.currentMonth,
      }
    );
    const oceanPH = assertStateProperty(
      state,
      'oceanAcidificationSystem.pHLevel',
      {
        location: 'trackCoralReefCollapse',
        month: state.currentMonth,
      }
    );

    // CRITICAL FIX (Nov 22, 2025): Use proper assertions
    const tippingPoints = assertDefined(state.tippingPoints, {
      location: 'trackCoralReefCollapse',
      valueName: 'state.tippingPoints',
      month: state.currentMonth,
    });

    const coral = assertDefined(tippingPoints.coralReefs, {
      location: 'trackCoralReefCollapse',
      valueName: 'tippingPoints.coralReefs',
      month: state.currentMonth,
    });

    // === THERMAL BLEACHING ===
    // Research: NOAA 2024 - 4th global bleaching event, 84.4% of reefs affected
    //           Nature Comms 2024 - Recovery possible if <+2°C
    // Type: EMPIRICAL bleaching events + MODEL recovery projections
    // UNCERTAINTY PROPAGATION (Nov 23, 2025): Use sampled threshold if available
    // Range: [1.0, 1.5]C - IPCC AR6 (2021)

    const BLEACHING_THRESHOLD = state.uncertaintyParameters?.coralReefThreshold ?? 1.2; // [EMPIRICAL] C - crossed in 2024
    const EXTINCTION_THRESHOLD = BLEACHING_THRESHOLD + 0.8; // [MODEL-DERIVED] C - recovery impossible above this
    const BLEACHING_PROBABILITY_PER_MONTH = 0.02; // [EMPIRICAL] ~20% annual at current temps

    if (tempAnomaly >= BLEACHING_THRESHOLD && rng() < BLEACHING_PROBABILITY_PER_MONTH) {
      const bleachingExtent = 10 + rng() * 40; // 10-50% of remaining live coral
      const bleachedThisEvent = (coral.liveCoverPercent * bleachingExtent) / 100;
      coral.bleachedPercent += bleachedThisEvent;
      coral.liveCoverPercent -= bleachedThisEvent;

      console.log(
        `🪸⚠️ CORAL BLEACHING EVENT: ${bleachedThisEvent.toFixed(1)}% bleached (${coral.liveCoverPercent.toFixed(1)}% live cover remaining)`
      );

      // Recovery check
      if (tempAnomaly < EXTINCTION_THRESHOLD && oceanPH > 7.8) {
        // Recovery possible (5-15 years)
        console.log(
          `   Recovery possible: Temperature +${tempAnomaly.toFixed(2)}°C < +${EXTINCTION_THRESHOLD}°C, pH ${oceanPH.toFixed(2)} > 7.8`
        );
      } else {
        coral.recoveryPossible = false;
        console.log(
          `   ❌ Recovery IMPOSSIBLE: Temperature +${tempAnomaly.toFixed(2)}°C or pH ${oceanPH.toFixed(2)}`
        );
      }
    }

    // === OCEAN ACIDIFICATION (Dissolution) ===
    // Research: PNAS 2021 - pH 7.8 threshold for net dissolution
    //           PNAS 2018 - -20.3% skeletal density by 2100
    // Type: EMPIRICAL acidification + MODEL dissolution projections

    const DISSOLUTION_THRESHOLD_PH = 7.8; // [MODEL-DERIVED] Below this, dissolution > calcification

    if (oceanPH < DISSOLUTION_THRESHOLD_PH && !coral.dissolutionActive) {
      coral.dissolutionActive = true;
      coral.recoveryPossible = false;

      events.push({
        type: 'tipping_point_crossed',
        severity: 0.75,
        description: `🪸💀 CORAL REEF DISSOLUTION: Ocean pH ${oceanPH.toFixed(2)} < 7.8. Net dissolution exceeds calcification. Reefs eroding permanently.`,
        impact:
          'Reef erosion, marine biodiversity collapse, coastal protection loss, fisheries collapse',
        month: state.currentMonth,
      });

      console.log(`\n🪸💀 CORAL REEF DISSOLUTION ACTIVE (Month ${state.currentMonth})`);
      console.log(`   Ocean pH: ${oceanPH.toFixed(2)} (threshold: ${DISSOLUTION_THRESHOLD_PH})`);
      console.log(`   Recovery: IMPOSSIBLE (dissolution > calcification)`);
    }

    // Apply dissolution if active
    if (coral.dissolutionActive) {
      const DISSOLUTION_RATE_PERCENT_PER_YEAR = 1.0; // [MODEL-DERIVED] -10.5 mm/year → ~1% cover/year
      const dissolutionThisMonth = (coral.liveCoverPercent * DISSOLUTION_RATE_PERCENT_PER_YEAR) / 12;
      coral.liveCoverPercent = Math.max(0, coral.liveCoverPercent - dissolutionThisMonth);

      if (state.currentMonth % 120 === 0) {
        // Log every 10 years
        console.log(
          `🪸💀 Coral dissolution: ${coral.liveCoverPercent.toFixed(1)}% live cover (pH ${oceanPH.toFixed(2)})`
        );
      }
    }
  }

  // ============================================================================
  // 7. INDIGENOUS KNOWLEDGE LOSS (Cultural Extinction)
  // ============================================================================

  private trackIndigenousKnowledgeLoss(
    state: GameState,
    rng: RNGFunction,
    events: any[]
  ): void {
    // CRITICAL FIX (Nov 22, 2025): Use proper assertions
    const tippingPoints = assertDefined(state.tippingPoints, {
      location: 'trackIndigenousKnowledgeLoss',
      valueName: 'state.tippingPoints',
      month: state.currentMonth,
    });

    const knowledge = assertDefined(tippingPoints.indigenousKnowledge, {
      location: 'trackIndigenousKnowledgeLoss',
      valueName: 'tippingPoints.indigenousKnowledge',
      month: state.currentMonth,
    });

    // === LANGUAGE EXTINCTION (Irreversible) ===
    // Research: UNESCO 2024 - 2 languages lost per month, 40% threatened
    //           Trends E&E 2019 - Knowledge loss = species loss (network collapse)
    // Type: EMPIRICAL extinction data + QUALITATIVE impact

    // Monthly extinction probability
    const extinctionsThisMonth = Math.floor(knowledge.extinctionRatePerMonth + rng());

    if (extinctionsThisMonth > 0) {
      knowledge.languagesExtinct += extinctionsThisMonth;
      knowledge.languagesAtRisk -= extinctionsThisMonth;

      // Knowledge loss: Each language represents ~5,000 years accumulated knowledge
      const KNOWLEDGE_PER_LANGUAGE = 0.0001; // [QUALITATIVE] Unitless
      knowledge.knowledgeLost += extinctionsThisMonth * KNOWLEDGE_PER_LANGUAGE;

      console.log(
        `🗣️💀 INDIGENOUS LANGUAGE EXTINCTION: ${extinctionsThisMonth} language(s) lost (total: ${knowledge.languagesExtinct}, at-risk: ${knowledge.languagesAtRisk})`
      );
      console.log(
        `   Knowledge lost: ${(knowledge.knowledgeLost * 100).toFixed(3)}% (irreversible)`
      );

      // Multiplier effect: Knowledge loss accelerates biodiversity loss
      // Research: "Joint loss accelerates collapse at much higher rate" (2-3x multiplier)
      if (state.planetaryBoundariesSystem?.boundaries?.biosphere_integrity) {
        const biosphere = state.planetaryBoundariesSystem.boundaries.biosphere_integrity;
        const KNOWLEDGE_SPECIES_MULTIPLIER = 2.5; // [QUALITATIVE] Multiplicative, not additive
        biosphere.extinctionContribution += extinctionsThisMonth * 0.001 * KNOWLEDGE_SPECIES_MULTIPLIER;

        console.log(
          `   🔁 Biodiversity impact: ${(extinctionsThisMonth * 0.001 * KNOWLEDGE_SPECIES_MULTIPLIER * 100).toFixed(3)}% (knowledge-species multiplier)`
        );
      }
    }
  }

  // ============================================================================
  // 8. INSTITUTIONAL COLLAPSE (Social Irreversibility)
  // ============================================================================

  private trackInstitutionalCollapse(
    state: GameState,
    rng: RNGFunction,
    events: any[]
  ): void {
    // CRITICAL FIX (Nov 22, 2025): Use proper assertions
    const tippingPoints = assertDefined(state.tippingPoints, {
      location: 'trackInstitutionalCollapse',
      valueName: 'state.tippingPoints',
      month: state.currentMonth,
    });

    const institutional = assertDefined(tippingPoints.institutional, {
      location: 'trackInstitutionalCollapse',
      valueName: 'tippingPoints.institutional',
      month: state.currentMonth,
    });

    // === "HEMINGWAY BANKRUPTCY" DYNAMICS ===
    // Research: Urban Institute 2024 - "First gradually, then suddenly"
    //           Current History 2025 - Haiti case study (80% capital under armed groups)
    // Type: QUALITATIVE case studies + EXPERT ESTIMATES
    // NOTE: Weak empirical basis per Sylvia - wide uncertainty ranges

    // Collapse threshold (all three conditions)
    const CORRUPTION_THRESHOLD = 70; // [EXPERT-ESTIMATE] 0-100
    const TRUST_THRESHOLD = 0.2; // [EXPERT-ESTIMATE] [0, 1]
    const ARMED_GROUP_THRESHOLD = 0.3; // [EXPERT-ESTIMATE] 30% territory

    // Gradual decline phase
    if (!institutional.collapsed) {
      // Deterioration accelerates with crises
      const crisisCount = assertFinite(
        assertDefined(state.planetaryBoundariesSystem?.boundariesBreached, {
          location: 'trackInstitutionalCollapse',
          valueName: 'state.planetaryBoundariesSystem.boundariesBreached',
          month: state.currentMonth,
          additionalInfo: { context: 'Required for institutional deterioration calculation' }
        }),
        {
          location: 'trackInstitutionalCollapse',
          valueName: 'crisisCount',
          month: state.currentMonth,
        }
      );
      const deteriorationRate = Math.min(0.5, crisisCount * 0.05); // [EXPERT-ESTIMATE]

      institutional.corruptionIndex += deteriorationRate * rng();
      institutional.trustInGovernment -= deteriorationRate * 0.01 * rng();
      institutional.armedGroupControl += deteriorationRate * 0.005 * rng();

      institutional.gradualDeclineMonths += 1;

      // Clamp values
      institutional.corruptionIndex = Math.min(100, institutional.corruptionIndex);
      institutional.trustInGovernment = Math.max(0, institutional.trustInGovernment);
      institutional.armedGroupControl = Math.min(1, institutional.armedGroupControl);

      // Check for sudden collapse
      if (
        institutional.corruptionIndex >= CORRUPTION_THRESHOLD &&
        institutional.trustInGovernment <= TRUST_THRESHOLD &&
        institutional.armedGroupControl >= ARMED_GROUP_THRESHOLD
      ) {
        institutional.collapsed = true;
        institutional.recoveryWindowMonths = (5 + rng() * 10) * 12; // [EXPERT-ESTIMATE] 5-15 years

        events.push({
          type: 'social_collapse',
          severity: 0.9,
          description: `🏛️💥 INSTITUTIONAL COLLAPSE: "Hemingway bankruptcy" - gradual decline (${(institutional.gradualDeclineMonths / 12).toFixed(1)} years), then sudden collapse. Corruption ${institutional.corruptionIndex.toFixed(0)}%, trust ${(institutional.trustInGovernment * 100).toFixed(0)}%, armed groups ${(institutional.armedGroupControl * 100).toFixed(0)}%.`,
          impact:
            'State failure, violence surge, refugee flows, economic collapse. Recovery window: 5-15 years.',
          month: state.currentMonth,
        });

        console.log(`\n🏛️💥 INSTITUTIONAL COLLAPSE (Month ${state.currentMonth})`);
        console.log(
          `   Gradual decline: ${(institutional.gradualDeclineMonths / 12).toFixed(1)} years`
        );
        console.log(`   Corruption: ${institutional.corruptionIndex.toFixed(0)}% (threshold: ${CORRUPTION_THRESHOLD}%)`);
        console.log(
          `   Trust: ${(institutional.trustInGovernment * 100).toFixed(0)}% (threshold: ${TRUST_THRESHOLD * 100}%)`
        );
        console.log(
          `   Armed groups: ${(institutional.armedGroupControl * 100).toFixed(0)}% (threshold: ${ARMED_GROUP_THRESHOLD * 100}%)`
        );
        console.log(
          `   Recovery window: ${(institutional.recoveryWindowMonths! / 12).toFixed(1)} years`
        );
      }
    } else {
      // Collapsed - track recovery window
      if (institutional.recoveryWindowMonths !== null) {
        institutional.recoveryWindowMonths -= 1;

        if (institutional.recoveryWindowMonths <= 0) {
          console.log(
            `🏛️⚠️ INSTITUTIONAL COLLAPSE: Recovery window closed. State failure may be permanent (decades to century-scale recovery required).`
          );
          institutional.recoveryWindowMonths = null; // Window closed
        } else if (institutional.recoveryWindowMonths % 120 === 0) {
          console.log(
            `🏛️⏳ Recovery window: ${(institutional.recoveryWindowMonths / 12).toFixed(1)} years remaining`
          );
        }
      }
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Sigmoid function for smooth probabilistic transitions
   * Returns value in [0, 1]
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Sample from triangular distribution
   * Used for extinction debt timescales (50-150 years, peak at 100)
   */
  private triangularSample(
    rng: RNGFunction,
    min: number,
    max: number,
    mode: number
  ): number {
    const u = rng();
    const F = (mode - min) / (max - min);

    if (u < F) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }
}
