/**
 * Bifurcation Logic Phase
 *
 * Identifies when simulation crosses critical thresholds and applies variance amplification
 * to create path-dependent trajectories. Near tipping points, small differences → large effects.
 *
 * CRITICAL MECHANISM FOR MONTE CARLO VARIANCE:
 * - Far from thresholds → variance damped (outcomes converge)
 * - Near thresholds → variance amplified (small differences → regime shifts)
 *
 * Research:
 * - Scheffer et al. (2014) Phil. Trans. R. Soc. B 370: 20130263 - Critical slowing down, regime shifts
 * - Richardson et al. (2023) Science Advances - Planetary boundaries, tipping points
 * - Keller et al. (2024) Nat. Comm. Psych. - Resilience heterogeneity creates differential outcomes
 *
 * Order: 4.5 (early in step, BEFORE domain-specific updates that use variance amplification)
 * Dependencies: None (calculates proximity to thresholds, doesn't mutate systems)
 *
 * Expected impact: Introduces 20-70% coefficient of variation (fixes 100% dystopia convergence)
 *
 * @see /research/outcome_variance_mechanisms_20251030.md
 * @see /plans/bifurcation_logic_implementation_spec.md
 */

import type { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import type { BifurcationThreshold, RegimeType } from '@/types/bifurcation';
import { assertFinite, assertInRange, assertStateProperty, assertDefined } from '@/simulation/utils/assertions';

export class BifurcationLogicPhase implements SimulationPhase {
  readonly id = 'bifurcation-logic';
  readonly name = 'Bifurcation Logic';
  readonly order = 4.5;
  readonly dependencies = ['ai-lifecycle'];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Ensure bifurcationState exists (should be initialized)
    const bifState = assertDefined(state.bifurcationState, {
      location: 'BifurcationLogicPhase.execute',
      valueName: 'bifurcationState',
      month: state.currentMonth,
      expectedSource: 'initialization.ts - bifurcationState should be initialized'
    });

    // Calculate proximity to all thresholds
    const proximities = this.calculateProximities(state, bifState);

    // Update variance amplification based on nearest threshold
    this.updateVarianceAmplification(bifState, proximities);

    // Check for threshold crossings and update regime
    this.checkThresholdCrossings(state, bifState, proximities);

    // Log bifurcation events if regime shifted
    const events = this.logRegimeShifts(state, bifState);

    return { events };
  }

  /**
   * Calculate proximity to all thresholds
   *
   * Returns normalized distances (0 = at threshold, 1 = far from threshold)
   */
  private calculateProximities(
    state: GameState,
    bifState: import('@/types/bifurcation').BifurcationState
  ): Map<string, { distance: number; currentValue: number; threshold: import('@/types/bifurcation').BifurcationThreshold }> {
    const proximities = new Map();

    // Environmental collapse threshold
    // Calculate environmental health from environmentalAccumulation metrics
    // (geometric mean of positive metrics: climateStability, biodiversityIndex, resourceReserves)
    const climateStability = assertStateProperty(state.environmentalAccumulation, 'climateStability', {
      location: 'BifurcationLogicPhase.calculateProximities',
      month: state.currentMonth,
    });
    const biodiversityIndex = assertStateProperty(state.environmentalAccumulation, 'biodiversityIndex', {
      location: 'BifurcationLogicPhase.calculateProximities',
      month: state.currentMonth,
    });
    const resourceReserves = assertStateProperty(state.environmentalAccumulation, 'resourceReserves', {
      location: 'BifurcationLogicPhase.calculateProximities',
      month: state.currentMonth,
    });
    const pollutionLevel = assertStateProperty(state.environmentalAccumulation, 'pollutionLevel', {
      location: 'BifurcationLogicPhase.calculateProximities',
      month: state.currentMonth,
    });

    // Environmental health: geometric mean of positive metrics × (1 - pollution)
    // Higher = healthier environment
    const envHealth = Math.pow(climateStability * biodiversityIndex * resourceReserves * (1 - pollutionLevel), 0.25);
    const envHealthFinite = assertFinite(envHealth, {
      location: 'BifurcationLogicPhase.calculateProximities',
      valueName: 'environmentalHealth',
      month: state.currentMonth,
    });
    const envDistance = Math.abs(envHealthFinite - bifState.environmentalCollapseThreshold.location);
    proximities.set('environmental', {
      distance: envDistance,
      currentValue: envHealthFinite,
      threshold: bifState.environmentalCollapseThreshold,
    });

    // Social breakdown threshold
    // Use society.coordinationCapacity as proxy for social cohesion
    // (Higher coordination = stronger social bonds)
    const socialCohesion = assertStateProperty(state.society, 'coordinationCapacity', {
      location: 'BifurcationLogicPhase.calculateProximities',
      month: state.currentMonth,
    });
    const socialCohesionFinite = assertFinite(socialCohesion, {
      location: 'BifurcationLogicPhase.calculateProximities',
      valueName: 'socialCohesion',
      month: state.currentMonth,
    });
    const socialDistance = Math.abs(socialCohesionFinite - bifState.socialBreakdownThreshold.location);
    proximities.set('social', {
      distance: socialDistance,
      currentValue: socialCohesionFinite,
      threshold: bifState.socialBreakdownThreshold,
    });

    // Economic collapse threshold
    // Use combination of economicTransitionStage (progress) and wealthDistribution (equity)
    // Higher stage + higher equity = more stable economy
    const economicStage = assertStateProperty(state.globalMetrics, 'economicTransitionStage', {
      location: 'BifurcationLogicPhase.calculateProximities',
      month: state.currentMonth,
    });
    const wealthDist = assertStateProperty(state.globalMetrics, 'wealthDistribution', {
      location: 'BifurcationLogicPhase.calculateProximities',
      month: state.currentMonth,
    });
    // Normalize economicStage to [0,1] (from [0,4]) and average with wealthDistribution
    const economicStability = (economicStage / 4.0 + wealthDist) / 2.0;
    const economicStabilityFinite = assertFinite(economicStability, {
      location: 'BifurcationLogicPhase.calculateProximities',
      valueName: 'economicStability',
      month: state.currentMonth,
    });
    const economicDistance = Math.abs(economicStabilityFinite - bifState.economicCollapseThreshold.location);
    proximities.set('economic', {
      distance: economicDistance,
      currentValue: economicStabilityFinite,
      threshold: bifState.economicCollapseThreshold,
    });

    // Governance failure threshold
    // Use government.legitimacy as proxy for governance effectiveness
    // (Higher legitimacy = more effective governance)
    const governanceEffectiveness = assertStateProperty(state.government, 'legitimacy', {
      location: 'BifurcationLogicPhase.calculateProximities',
      month: state.currentMonth,
    });
    const governanceEffectivenessFinite = assertFinite(governanceEffectiveness, {
      location: 'BifurcationLogicPhase.calculateProximities',
      valueName: 'governanceEffectiveness',
      month: state.currentMonth,
    });
    const governanceDistance = Math.abs(governanceEffectivenessFinite - bifState.governanceFailureThreshold.location);
    proximities.set('governance', {
      distance: governanceDistance,
      currentValue: governanceEffectivenessFinite,
      threshold: bifState.governanceFailureThreshold,
    });

    // Flourishing threshold (QoL overall)
    // Calculate aggregate QoL from all dimensions
    const qol = state.qualityOfLifeSystems;
    const qolOverall = (
      (qol.survivalFundamentals.foodSecurity + qol.survivalFundamentals.waterSecurity +
       qol.survivalFundamentals.thermalHabitability + qol.survivalFundamentals.shelterSecurity) / 4 +
      qol.materialAbundance + qol.energyAvailability + qol.physicalSafety +
      qol.mentalHealth + qol.meaningAndPurpose + qol.socialConnection
    ) / 9;
    const qolOverallFinite = assertFinite(qolOverall, {
      location: 'BifurcationLogicPhase.calculateProximities',
      valueName: 'qolOverall',
      month: state.currentMonth,
    });
    const flourishingDistance = Math.abs(qolOverallFinite - bifState.flourishingThreshold.location);
    proximities.set('flourishing', {
      distance: flourishingDistance,
      currentValue: qolOverallFinite,
      threshold: bifState.flourishingThreshold,
    });

    // Technology breakthrough threshold (tech unlock progress)
    // This is a proxy - we calculate fraction of technologies unlocked
    const techState = state.techTreeState;
    // Count unlocked techs out of total 71 techs
    const avgDeployment = techState.unlockedTech ? techState.unlockedTech.length / 71 : 0.0;
    const avgDeploymentFinite = assertFinite(avgDeployment, {
      location: 'BifurcationLogicPhase.calculateProximities',
      valueName: 'avgDeployment',
      month: state.currentMonth,
    });
    const techDistance = Math.abs(avgDeploymentFinite - bifState.technologyBreakthroughThreshold.location);
    proximities.set('technology', {
      distance: techDistance,
      currentValue: avgDeploymentFinite,
      threshold: bifState.technologyBreakthroughThreshold,
    });

    return proximities;
  }

  /**
   * Update variance amplification based on nearest threshold
   *
   * CRITICAL: Variance amplification affects other systems that use it as a multiplier.
   * Near thresholds (distance → 0), amplification → 100× (capped)
   * Far from thresholds (distance → 1), amplification → 1× (no effect)
   *
   * FORMULA: systemMultiplier / √(0.01 + distance) with 100× cap
   *
   * Research basis:
   * - Bifurcation theory: variance ~ 1/√d for saddle-node bifurcations (Strogatz 2015)
   * - Financial crisis (2008): 3-5× amplification in credit markets (Manda 2010, Fed 2016)
   * - Ecosystem regime shifts: 10-20× amplification near collapse (Scheffer et al. 2009)
   * - Social breakdown: 20-40× amplification in conflict onset (Cederman et al. 2010)
   * - System-specific multipliers calibrated to bifurcation dynamics (fold, Hopf, transcritical)
   *
   * @see Scheffer et al. (2009) - Early-warning signals for critical transitions
   * @see Dakos et al. (2012) - Robustness of variance as indicator
   * @see /research/bifurcation_empirical_validation_20251112.md - Empirical validation
   * @see /reviews/bifurcation_empirical_critique_20251112.md - System-dependent scaling rationale
   */
  private updateVarianceAmplification(
    bifState: import('@/types/bifurcation').BifurcationState,
    proximities: Map<string, { distance: number; currentValue: number; threshold: import('@/types/bifurcation').BifurcationThreshold }>
  ): void {
    // Find minimum distance across all thresholds AND track which threshold is nearest
    let minDistance = 1.0; // Start at max (far from all thresholds)
    let nearestThresholdName = 'environmental'; // Default

    for (const [name, { distance }] of proximities.entries()) {
      if (distance < minDistance) {
        minDistance = distance;
        nearestThresholdName = name;
      }
    }

    // Validate distance is in valid range
    const minDistanceValidated = assertInRange(minDistance, 0, 1, {
      location: 'BifurcationLogicPhase.updateVarianceAmplification',
      valueName: 'minDistance',
      month: bifState.currentRegime === 'status-quo' ? undefined : 0, // Can't access state.currentMonth here
    });

    // Base amplification: 1 / √(0.01 + distance)
    // This follows bifurcation theory for saddle-node transitions (conservative estimate)
    // - Distance = 0.0 (at threshold): base = 1 / √0.01 = 10×
    // - Distance = 0.1 (near threshold): base = 1 / √0.11 ≈ 3×
    // - Distance = 0.5 (mid-range): base = 1 / √0.51 ≈ 1.4×
    // - Distance = 1.0 (far from threshold): base = 1 / √1.01 ≈ 1×
    const baseAmplification = 1.0 / Math.sqrt(0.01 + minDistanceValidated);

    // System-specific multiplier based on bifurcation dynamics
    // Different threshold types exhibit different amplification behaviors:
    // - Environmental: Fold catastrophe (moderate, 1.5×)
    // - Social: Hopf/oscillatory instability (strong, 2.5×)
    // - Economic: Cascade effects through credit/supply chains (very strong, 3.5×)
    // - Governance: Feedback loops between legitimacy and effectiveness (strong, 2.0×)
    // - Flourishing: Positive threshold, less volatile (baseline, 1.0×)
    // - Technology: Innovation spikes, moderate amplification (1.5×)
    //
    // Calibration targets:
    // - Economic at d=0.1: 3× base × 3.5× = 10.5× (matches 2008 financial crisis 3-5× to 10-40× range)
    // - Environmental at d=0.05: 4.5× base × 1.5× = 6.7× (ecosystem regime shifts)
    // - Social at d=0.03: 5.8× base × 2.5× = 14.5× (conflict onset amplification)
    const systemMultiplier = this.getSystemMultiplier(nearestThresholdName);

    // Final amplification with system-specific scaling
    const amplification = baseAmplification * systemMultiplier;

    // Cap at 100× to prevent extreme amplification at exact threshold
    // This cap protects against numerical instability and represents an upper bound
    // observed in empirical studies (compound disasters can reach 100-200×)
    const amplificationCapped = Math.min(100.0, amplification);

    // Validate final amplification
    const amplificationValidated = assertFinite(amplificationCapped, {
      location: 'BifurcationLogicPhase.updateVarianceAmplification',
      valueName: 'amplification',
      month: undefined,
    });

    // Update bifurcation state (mutation)
    bifState.varianceAmplification = amplificationValidated;
    bifState.distanceToNearestThreshold = minDistanceValidated;

    // Log amplification details for debugging (threshold-specific dynamics)
    if (minDistanceValidated < 0.3) {
      // Only log when approaching thresholds (distance < 0.3) to reduce noise
      console.log(
        `📊 Bifurcation variance amplification: ${amplificationValidated.toFixed(2)}× ` +
        `(nearest: ${nearestThresholdName}, d=${minDistanceValidated.toFixed(3)}, ` +
        `base=${baseAmplification.toFixed(2)}×, system=${systemMultiplier.toFixed(1)}×)`
      );
    }
  }

  /**
   * Get system-specific variance amplification multiplier
   *
   * Different threshold types exhibit different bifurcation dynamics:
   * - Fold/saddle-node: Moderate amplification (environmental collapse)
   * - Hopf: Strong amplification with oscillations (social breakdown)
   * - Transcritical with cascades: Very strong (economic collapse)
   * - Feedback loops: Strong amplification (governance failure)
   *
   * @param thresholdName - Name of the threshold (environmental, social, economic, etc.)
   * @returns Multiplier for system-specific variance amplification (1.0-3.5)
   */
  private getSystemMultiplier(thresholdName: string): number {
    const multipliers: Record<string, number> = {
      'environmental': 1.5,  // Fold catastrophe in ecosystems (moderate)
      'social': 2.5,         // Hopf/oscillatory instability in social systems (strong)
      'economic': 3.5,       // Cascade effects through credit/supply chains (very strong)
      'governance': 2.0,     // Feedback loops between legitimacy and effectiveness (strong)
      'flourishing': 1.0,    // Positive threshold, less volatile (baseline)
      'technology': 1.5,     // Innovation spikes, moderate amplification
    };

    return multipliers[thresholdName] ?? 2.0; // Default to moderate-strong if unknown
  }

  /**
   * Check for threshold crossings and update current regime
   *
   * When a metric crosses its threshold:
   * - Mark threshold as crossed
   * - Update current regime
   * - Record regime shift in history
   */
  private checkThresholdCrossings(
    state: GameState,
    bifState: import('@/types/bifurcation').BifurcationState,
    proximities: Map<string, { distance: number; currentValue: number; threshold: import('@/types/bifurcation').BifurcationThreshold }>
  ): void {
    // Save previous regime for comparison
    bifState.previousRegime = bifState.currentRegime;

    // Check each threshold
    for (const [name, { currentValue, threshold }] of proximities.entries()) {
      const crossed = this.hasThresholdBeenCrossed(currentValue, threshold);

      if (crossed && !threshold.crossed) {
        // First time crossing this threshold
        threshold.crossed = true;
        threshold.crossedAt = state.currentMonth;

        // Update current regime to threshold's regime
        bifState.currentRegime = threshold.regime;

        console.log(
          `🔀 BIFURCATION: ${name} threshold crossed at Month ${state.currentMonth} ` +
          `(value: ${currentValue.toFixed(3)}, threshold: ${threshold.location.toFixed(3)}, ` +
          `regime: ${threshold.regime})`
        );
      }
    }

    // If no thresholds crossed, determine regime based on current state
    if (bifState.currentRegime === bifState.previousRegime && bifState.currentRegime === 'status-quo') {
      // Re-evaluate regime based on all metrics
      bifState.currentRegime = this.determineCurrentRegime(state, bifState, proximities);
    }
  }

  /**
   * Check if a threshold has been crossed
   *
   * @param value - Current metric value
   * @param threshold - Threshold configuration
   * @returns True if threshold has been crossed
   */
  private hasThresholdBeenCrossed(value: number, threshold: import('@/types/bifurcation').BifurcationThreshold): boolean {
    if (threshold.direction === 'below') {
      // Collapse thresholds: trigger when value drops below threshold
      return value < threshold.location;
    } else {
      // Flourishing thresholds: trigger when value rises above threshold
      return value > threshold.location;
    }
  }

  /**
   * Determine current regime based on all metrics
   *
   * Checks all thresholds to classify current state into a regime type
   */
  private determineCurrentRegime(
    state: GameState,
    bifState: import('@/types/bifurcation').BifurcationState,
    proximities: Map<string, { distance: number; currentValue: number; threshold: import('@/types/bifurcation').BifurcationThreshold }>
  ): RegimeType {
    // Priority order: Collapse regimes first, then flourishing, then status quo

    // Check collapse thresholds (environmental, social, economic, governance)
    for (const [name, { currentValue, threshold }] of proximities.entries()) {
      if (threshold.direction === 'below' && currentValue < threshold.location) {
        // Crossed a collapse threshold → return that regime
        return threshold.regime;
      }
    }

    // Check flourishing thresholds
    const { currentValue: qolValue, threshold: flourishingThreshold } = proximities.get('flourishing')!;
    if (qolValue > flourishingThreshold.location) {
      return 'flourishing';
    }

    // Check sustainable threshold (tech deployment > threshold)
    const { currentValue: techValue, threshold: techThreshold } = proximities.get('technology')!;
    if (techValue > techThreshold.location) {
      return 'sustainable';
    }

    // Default: status quo (between thresholds)
    return 'status-quo';
  }

  /**
   * Log regime shifts to event log
   *
   * Records transitions between regimes for debugging and analysis
   */
  private logRegimeShifts(
    state: GameState,
    bifState: import('@/types/bifurcation').BifurcationState
  ): import('@/types/game').GameEvent[] {
    const events: import('@/types/game').GameEvent[] = [];

    if (bifState.currentRegime !== bifState.previousRegime) {
      // Regime shift occurred
      bifState.regimeShiftHistory.push({
        month: state.currentMonth,
        fromRegime: bifState.previousRegime,
        toRegime: bifState.currentRegime,
        trigger: `Regime shift: ${bifState.previousRegime} → ${bifState.currentRegime}`,
      });

      console.log(
        `🌀 REGIME SHIFT at Month ${state.currentMonth}: ${bifState.previousRegime} → ${bifState.currentRegime} ` +
        `(variance amplification: ${bifState.varianceAmplification.toFixed(2)}×)`
      );

      // Create event for regime shift
      events.push({
        id: `regime-shift-${state.currentMonth}-${state.eventIdCounter++}`,
        timestamp: state.currentMonth,
        type: 'info',
        severity: bifState.currentRegime.includes('collapse') || bifState.currentRegime.includes('failure') ? 'critical' : 'major',
        agent: 'system',
        title: '🌀 Regime Shift',
        description: `Regime shift: ${bifState.previousRegime} → ${bifState.currentRegime} (variance amplification: ${bifState.varianceAmplification.toFixed(2)}×)`,
        effects: {
          previousRegime: bifState.previousRegime,
          currentRegime: bifState.currentRegime,
          varianceAmplification: bifState.varianceAmplification,
        },
      });
    }

    return events;
  }
}
