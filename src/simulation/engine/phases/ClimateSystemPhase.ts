/**
 * Climate System Phase (TIER 1.7 + Climate Dynamics)
 *
 * Consolidated climate system management covering full cascade:
 * 1. Geoengineering interventions & environmental restoration
 * 2. Multi-timescale tipping point detection & progression
 * 3. Environmental feedback aggregation for multi-paradigm DUI
 * 4. Climate impact cascades → food security → famine → mortality
 *
 * Research:
 * - Armstrong McKay et al. (2022): Climate tipping thresholds
 * - Lenton et al. (2023): Tipping element interactions
 * - IPCC AR6 (2021): Climate feedbacks and impacts
 * - Rockström et al. (2009): Planetary boundaries framework
 *
 * Order: 34.0 (AFTER environmental state updates, BEFORE mortality resolution 35.0)
 * NOTE: Order corrected from plan's 19.0 to 34.0 to satisfy dependencies:
 * - Requires planetary_boundaries (21.0) for tipping point detection
 * - Requires ocean-acidification (20.3), novel-entities (20.4) for environmental feedback
 * - Feeds into mortality resolution via climate impact cascades
 *
 * Batch 3 Consolidation (Nov 9, 2025): Merged 4 phases:
 * - GeoengineringPhase (was 19.0)
 * - TippingPointPhase (was 21.6)
 * - EnvironmentalFeedbackPhase (was 33.5)
 * - ClimateImpactCascadePhase (was 34.0)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction, GameEvent } from '@/types/game';
import { TIPPING_INTERACTIONS } from '@/types/tipping-points';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertInRange,
  assertStateProperty,
  assertDefined,
  assertProbability,
  capWithBifurcationAwareness,
} from '@/simulation/utils/assertions';
import { updateGeoengineering } from '../../geoengineering';

/**
 * Climate impact event with delayed effects (from ClimateImpactCascade)
 */
interface ClimateImpact {
  type: 'heat_wave' | 'drought' | 'extreme_weather' | 'ecosystem_collapse';
  intensity: number;  // [0, 1] scale
  lagMonths: number;  // Delay before agricultural impact
  affectedRegions: string[];
  month: number;      // When impact was created
}

/**
 * Delayed climate impact waiting to be applied
 */
interface DelayedClimateImpact extends ClimateImpact {
  applyAtMonth: number;  // When to apply this impact
}

/**
 * Regional famine risk with seasonal context
 */
interface FamineRisk {
  region: string;
  foodSecurityLevel: number;  // [0, 1] scale
  isLeanSeason: boolean;
  demographicMultipliers: Map<string, number>;  // Elite: 0.2×, Precariat: 2.0×, etc.
  cause: string;  // Description for logging
}

export class ClimateSystemPhase implements SimulationPhase {
  readonly id = 'climate_system';
  readonly name = 'Climate System';
  readonly order = 34.0;

  // DEPENDENCIES (Nov 9, 2025): Consolidated dependencies from all 4 merged phases
  readonly dependencies = [
    'tech-tree',                  // For geoengineering interventions
    'planetary_boundaries',       // For tipping point detection (order 21.0)
    'resource-water',             // For environmental feedback - ocean acidification (Batch 3: consolidated)
    'resource-soil',              // For environmental feedback - novel entities (Batch 3: consolidated)
    'bifurcation-logic',          // Nov 14, 2025 - CRITICAL-1 fix: explicit bifurcation dependency
  ] as const;

  // Minimum floor for food security to prevent exactly zero
  private static readonly MIN_FOOD_SECURITY = 0.001;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    setDeterministicRng(rng);

    const events: GameEvent[] = [];

    // ===================================================================
    // STEP 1: GEOENGINEERING (formerly GeoengineringPhase, order 19.0)
    // ===================================================================updateGeoengineering(state);

    // ===================================================================
    // STEP 2: TIPPING POINTS (formerly TippingPointPhase, order 21.6)
    // ===================================================================
    this.executeTippingPoints(state, rng, context);

    // ===================================================================
    // STEP 3: ENVIRONMENTAL FEEDBACK (formerly EnvironmentalFeedbackPhase, order 33.5)
    // ===================================================================
    const feedbackEvents = this.executeEnvironmentalFeedback(state, rng, context);
    events.push(...feedbackEvents);

    // ===================================================================
    // STEP 4: CLIMATE IMPACT CASCADE (formerly ClimateImpactCascadePhase, order 34.0)
    // ===================================================================
    this.executeClimateImpactCascade(state, rng, context);

    return { events };
  }

  // =====================================================================
  // TIPPING POINTS LOGIC (from TippingPointPhase.ts)
  // =====================================================================

  private executeTippingPoints(state: GameState, rng: RNGFunction, context: PhaseContext): void {
    const system = state.tippingPointSystem;

    // Get current global mean temperature (degrees C above pre-industrial)
    const currentTempC = assertStateProperty(
      state.resourceEconomy.co2,
      'temperatureAnomaly',
      {
        location: 'ClimateSystemPhase.executeTippingPoints',
        month: state.currentMonth,
        expectedSource: 'resourceEconomy.co2.temperatureAnomaly (required for tipping point evaluation)'
      }
    );

    console.log(`\n=== Tipping Points ===`);
    console.log(`  Current Temperature: ${currentTempC.toFixed(2)}°C above pre-industrial`);

    // Step 0.5: Calculate threshold lowering from triggered elements (Nov 23, 2025)
    // Research: Wunderling et al. (2024), Armstrong McKay et al. (2022)
    this.calculateThresholdLowering(state);

    // Step 1: Check for new triggers
    const newlyTriggered = this.detectTippingThresholds(state, currentTempC);

    // Step 2: Progress active elements
    this.updateTippingTransitions(state, rng);

    // Step 3: Calculate cascade amplification
    this.calculateTippingCascades(state);

    // Step 4: Apply impacts with regional variation
    this.applyTippingImpacts(state);

    // Update aggregate metrics
    system.triggeredCount = system.elements.filter(e => e.triggered).length;
    system.completedCount = system.elements.filter(e => e.progress >= 1.0).length;
    const totalElementProgress = assertFinite(
      system.elements.reduce((sum, e) => sum + e.progress, 0),
      {
        location: 'ClimateSystemPhase.executeTippingPoints',
        valueName: 'totalElementProgress',
        month: state.currentMonth
      }
    );
    system.totalProgress = assertInRange(
      totalElementProgress / system.elements.length,
      0, 1,
      {
        location: 'ClimateSystemPhase.executeTippingPoints',
        valueName: 'system.totalProgress',
        month: state.currentMonth
      }
    );

    if (newlyTriggered.length > 0 || system.triggeredCount > 0) {
      console.log(`  Triggered Elements: ${system.triggeredCount}/${system.elements.length}`);
      console.log(`  Completed Transitions: ${system.completedCount}/${system.elements.length}`);
      console.log(`  Total Progress: ${(system.totalProgress * 100).toFixed(1)}%`);
      console.log(`  Cascade Multiplier: ${system.cascadeMultiplier.toFixed(2)}x`);
    }
  }

  /**
   * Calculate threshold lowering from triggered tipping elements (Nov 23, 2025)
   *
   * Research:
   * - Wunderling et al. (2024) ESD: "combined effect tending to lower temperature thresholds"
   * - Armstrong McKay et al. (2022) Science: Network of 16 tipping elements with causal interactions
   *
   * When one tipping element triggers, it can lower the effective threshold for connected elements.
   * This creates cascade dynamics where crossing one threshold increases probability of others.
   */
  private calculateThresholdLowering(state: GameState): void {
    const system = state.tippingPointSystem;

    // Reset threshold reductions for all elements
    for (const element of system.elements) {
      element.effectiveThresholdReduction = 0;
    }

    // For each triggered element, find interactions and apply threshold lowering
    for (const sourceElement of system.elements) {
      if (!sourceElement.triggered) continue;

      // Scale reduction by progress (0 = just triggered, 1 = fully transitioned)
      // Use sqrt to front-load the effect - most reduction happens early in transition
      const progressScalar = Math.sqrt(Math.max(0.1, sourceElement.progress));

      // Find all interactions where this element is the source
      const interactions = TIPPING_INTERACTIONS.filter(i => i.sourceId === sourceElement.id);

      for (const interaction of interactions) {
        // No index - domain-specific search (tipping elements array)
        const targetElement = system.elements.find(e => e.id === interaction.targetId);
        if (!targetElement) continue;
        if (targetElement.triggered) continue; // Already triggered, no need to lower

        // Calculate threshold reduction scaled by progress
        const reduction = assertFinite(
          interaction.thresholdReduction * progressScalar,
          {
            location: 'ClimateSystemPhase.calculateThresholdLowering',
            valueName: 'thresholdReduction',
            month: state.currentMonth,
            additionalInfo: {
              sourceId: sourceElement.id,
              targetId: targetElement.id,
              baseReduction: interaction.thresholdReduction,
              progressScalar
            }
          }
        );

        // Accumulate reductions (multiple sources can affect same target)
        targetElement.effectiveThresholdReduction =
          (targetElement.effectiveThresholdReduction || 0) + reduction;

        // Log significant threshold lowering events
        if (reduction > 0.05) {
          console.log(
            `  🔗 CASCADE: ${sourceElement.name} lowers ${targetElement.name} threshold by ${reduction.toFixed(2)}°C`
          );
          console.log(`     Mechanism: ${interaction.mechanism}`);
        }
      }
    }

    // Cap total threshold reduction at 0.5°C per element to prevent runaway cascades
    // Research: Conservative estimate from Wunderling et al. (2024)
    const MAX_THRESHOLD_REDUCTION = 0.5;
    for (const element of system.elements) {
      if (element.effectiveThresholdReduction && element.effectiveThresholdReduction > MAX_THRESHOLD_REDUCTION) {
        console.log(
          `  ⚠️ Threshold reduction capped: ${element.name} ${element.effectiveThresholdReduction.toFixed(2)}°C -> ${MAX_THRESHOLD_REDUCTION}°C`
        );
        element.effectiveThresholdReduction = MAX_THRESHOLD_REDUCTION;
      }
    }
  }

  private detectTippingThresholds(state: GameState, currentTempC: number): string[] {
    const system = state.tippingPointSystem;
    const newlyTriggered: string[] = [];

    for (const element of system.elements) {
      if (element.triggered) continue;

      // Calculate effective threshold with reduction from triggered elements (Nov 23, 2025)
      // Research: Wunderling et al. (2024), Armstrong McKay et al. (2022)
      const thresholdReduction = element.effectiveThresholdReduction || 0;
      const effectiveThreshold = assertFinite(
        element.triggerTempC - thresholdReduction,
        {
          location: 'ClimateSystemPhase.detectTippingThresholds',
          valueName: 'effectiveThreshold',
          month: state.currentMonth,
          additionalInfo: {
            elementId: element.id,
            baseThreshold: element.triggerTempC,
            thresholdReduction
          }
        }
      );

      if (currentTempC >= effectiveThreshold) {
        element.triggered = true;
        element.monthsSinceTrigger = 0;

        system.triggers.push({
          elementId: element.id,
          monthTriggered: state.currentMonth,
          tempAtTrigger: currentTempC
        });

        newlyTriggered.push(element.name);

        // Log with cascade context if threshold was lowered
        if (thresholdReduction > 0) {
          console.warn(`  🚨 CASCADE TIPPING POINT: ${element.name}`);
          console.log(`     Original threshold: ${element.triggerTempC}°C`);
          console.log(`     Effective threshold: ${effectiveThreshold.toFixed(2)}°C (lowered by ${thresholdReduction.toFixed(2)}°C)`);
          console.log(`     Current: ${currentTempC.toFixed(2)}°C`);
        } else {
          console.warn(`  ⚠️ TIPPING POINT TRIGGERED: ${element.name}`);
          console.log(`     Threshold: ${element.triggerTempC}°C | Current: ${currentTempC.toFixed(2)}°C`);
        }
        console.log(`     Transition timescale: ${element.transitionMinMonths}-${element.transitionMaxMonths} months`);
      }
    }

    return newlyTriggered;
  }

  private updateTippingTransitions(state: GameState, rng: RNGFunction): void {
    const system = state.tippingPointSystem;

    for (const element of system.elements) {
      if (!element.triggered) continue;

      element.monthsSinceTrigger++;

      // Sample random transition time within range (only on first update)
      if (element.monthsSinceTrigger === 1) {
        const transitionTime = element.transitionMinMonths +
          rng() * (element.transitionMaxMonths - element.transitionMinMonths);
        (element as any)._sampledTransitionTime = transitionTime;
      }

      const transitionTime = (element as any)._sampledTransitionTime || element.transitionMaxMonths;

      // Sigmoid curve parameters
      const k = 4 / transitionTime;
      const t = element.monthsSinceTrigger;
      const t_mid = transitionTime / 2;

      const newProgress = assertFinite(
        1 / (1 + Math.exp(-k * (t - t_mid))),
        {
          location: 'ClimateSystemPhase.updateTippingTransitions',
          valueName: 'newProgress',
          month: state.currentMonth,
          additionalInfo: { elementId: element.id, t, k, t_mid }
        }
      );

      element.progress = assertInRange(
        Math.min(1.0, Math.max(0.0, newProgress)),
        0, 1,
        {
          location: 'ClimateSystemPhase.updateTippingTransitions',
          valueName: `element[${element.id}].progress`,
          month: state.currentMonth
        }
      );
    }
  }

  private calculateTippingCascades(state: GameState): void {
    const system = state.tippingPointSystem;

    const activeCascadingElements = system.elements.filter(e =>
      e.progress > 0 && e.cascades
    );

    const cascadeCount = activeCascadingElements.length;

    let cascadeMultiplier: number;
    if (cascadeCount === 0 || cascadeCount === 1) {
      cascadeMultiplier = 1.0;
    } else if (cascadeCount === 2) {
      cascadeMultiplier = 1.15;
    } else if (cascadeCount === 3) {
      cascadeMultiplier = 1.35;
    } else {
      cascadeMultiplier = 1.60;
    }

    system.cascadeMultiplier = assertInRange(
      cascadeMultiplier,
      1.0, 2.0,
      {
        location: 'ClimateSystemPhase.calculateTippingCascades',
        valueName: 'system.cascadeMultiplier',
        month: state.currentMonth
      }
    );
  }

  private applyTippingImpacts(state: GameState): void {
    const system = state.tippingPointSystem;

    let totalClimateStabilityImpact = 0;
    let totalHabitabilityImpact = 0;
    let totalFoodSecurityImpact = 0;
    let totalFreshwaterImpact = 0;

    for (const element of system.elements) {
      if (element.progress === 0) continue;

      const scaledProgress = element.progress * system.cascadeMultiplier;

      totalClimateStabilityImpact += element.impactClimateStability * scaledProgress;
      totalHabitabilityImpact += element.impactHabitability * scaledProgress;
      totalFoodSecurityImpact += element.impactFoodSecurity * scaledProgress;
      totalFreshwaterImpact += element.impactFreshwater * scaledProgress;
    }

    /**
     * Cap total degradation at 95% (per-step)
     *
     * IMPLEMENTATION CHOICE for simulation tractability. This is NOT research-backed.
     * Recent comprehensive reviews (Wunderling et al. 2024) show destabilizing cascades
     * accelerate beyond 2°C warming - there is no evidence for a 95% degradation cap.
     *
     * Why This Cap Exists:
     * - Prevents single-step collapse artifacts in simulation
     * - Models physical inertia (climate systems don't change instantly)
     * - Provides bounded degradation range per timestep
     * - Does NOT represent a real physical limit on tipping cascade severity
     *
     * What 2024-2025 Research Actually Shows:
     * - Wunderling et al. (2024, Earth System Dynamics): "Many tipping interactions
     *   are DESTABILIZING" - cascades accelerate beyond 2°C, especially with fast
     *   tipping elements (AMOC, Amazon rainforest). No evidence for degradation cap.
     * - Lenton et al. (2019, Nature): "We have underestimated the risks of unleashing
     *   irreversible changes, where the planet SELF-AMPLIFIES global warming."
     *   Warns of CASCADING risks, not self-limiting bounds.
     * - Armstrong McKay et al. (2022, Science): Multiple tipping points cause severe,
     *   potentially irreversible changes. No stability guarantee.
     *
     * Planck Feedback (Basic Physics):
     * Stefan-Boltzmann radiation (T⁴) prevents infinite warming - this IS basic physics.
     * However, it operates continuously (slows warming) rather than creating a
     * per-timestep "cap" on degradation rate. This is conflating continuous negative
     * feedback with bounded rate-of-change.
     *
     * This cap models system inertia and prevents simulation artifacts, NOT a claim
     * about Earth system self-stabilization. Research warns the opposite - cascades
     * can accelerate beyond 2°C warming.
     *
     * @see research/climate_stability_mechanisms_2024_2025_update.md - Comprehensive 2024-2025 review
     * @see research/climate_tipping_timescales_20251106.md
     * @see research/verification_climate_stability_citations_20251126.md
     * @see Wunderling et al. (2024) "Climate tipping point interactions and cascades" Earth System Dynamics 15:41-74
     */
    const cap = 0.95;
    totalClimateStabilityImpact = Math.min(cap, Math.abs(totalClimateStabilityImpact));

    // Apply to global metrics
    const oldStability = assertInRange(
      state.environmentalAccumulation.climateStability,
      0, 1,
      {
        location: 'ClimateSystemPhase.applyTippingImpacts',
        valueName: 'climateStability (before)',
        month: state.currentMonth
      }
    );
    /**
     * 5% minimum climate stability floor
     *
     * IMPLEMENTATION CHOICE for simulation tractability. This is NOT research-backed.
     * Recent comprehensive reviews (Wunderling et al. 2024) show the OPPOSITE of
     * self-limiting stability - most tipping interactions are destabilizing.
     *
     * Why This Floor Exists:
     * - Prevents simulation artifacts (division by zero, single-step collapse)
     * - Provides bounded range for tractability
     * - Does NOT represent actual Earth system behavior after tipping cascades
     *
     * What 2024-2025 Research Actually Shows:
     * - Wunderling et al. (2024, Earth System Dynamics): "Many tipping interactions
     *   are DESTABILIZING" - cascades cannot be ruled out at 1.5-2°C warming.
     *   Comprehensive review of tipping cascades shows acceleration, not stabilization.
     * - Net climate feedbacks "becoming LESS negative" with continued emissions
     *   (multiple 2024 studies) - stabilizing mechanisms are weakening, not strengthening.
     * - Lenton et al. (2019, Nature): "We have underestimated the risks of unleashing
     *   irreversible changes, where the planet SELF-AMPLIFIES global warming."
     *   Warns of cascading RISK and planetary EMERGENCY, not self-limiting stability.
     * - Armstrong McKay et al. (2022, Science): Multiple tipping points cause severe,
     *   potentially irreversible changes. Stability is not guaranteed.
     *
     * Planck Feedback (Only Real Negative Feedback):
     * Stefan-Boltzmann radiation (T⁴) is fundamental physics and operates continuously.
     * However, this does NOT create a "stability floor" after crossing tipping points.
     * It's a continuous dampening effect, not a minimum bound. Positive feedbacks
     * (methane release, ice loss, forest dieback) can overwhelm Planck response.
     *
     * Paleoclimate Analogues (Geological Timescales, NOT Human Timescales):
     * - PETM (~56Ma): Recovery took 100-200ky. "Largest deep-sea mass extinction
     *   in 93 million years" occurred during this "recovery" (Zachos et al. 2008).
     * - These demonstrate eventual geological stabilization, NOT rapid resilience
     *   relevant to human civilization timescales (decades to centuries).
     *
     * HONEST FRAMING: This 5% floor is an OPTIMISTIC assumption not supported by
     * 2024-2025 research. It represents "worst plausible Earth scenario maintaining
     * some multicellular life" (still catastrophic for civilization). The simulation
     * likely UNDERESTIMATES collapse risk in tail scenarios where multiple tipping
     * cascades occur. Reserve 0% for "Venus scenario" (complete atmospheric loss).
     *
     * Research Grade: D- (0% support for stability floor, 83% contradict)
     * Papers reviewed: 6 (2024-2025)
     * Support floor: 0
     * Contradict floor: 5
     *
     * @see research/climate_stability_mechanisms_2024_2025_update.md - Comprehensive 2024-2025 review
     * @see research/climate_self_limiting_mechanisms_20251125.md - Full research synthesis
     * @see research/verification_climate_stability_citations_20251126.md - Citation verification
     * @see Wunderling et al. (2024) "Climate tipping point interactions and cascades" Earth System Dynamics 15:41-74
     * @see Lenton et al. (2019) "Climate tipping points — too risky to bet against" Nature
     * @see Armstrong McKay et al. (2022) "Exceeding 1.5°C global warming could trigger multiple tipping points" Science
     */
    state.environmentalAccumulation.climateStability = assertInRange(
      Math.max(0.05, oldStability * (1 - totalClimateStabilityImpact * 0.01)),
      0, 1,
      {
        location: 'ClimateSystemPhase.applyTippingImpacts',
        valueName: 'climateStability (after)',
        month: state.currentMonth
      }
    );

    // Store tipping point impacts for other systems
    (state as any)._tippingPointImpacts = {
      climateStability: totalClimateStabilityImpact,
      habitability: totalHabitabilityImpact,
      foodSecurity: totalFoodSecurityImpact,
      freshwater: totalFreshwaterImpact
    };
  }

  // =====================================================================
  // ENVIRONMENTAL FEEDBACK LOGIC (from EnvironmentalFeedbackPhase.ts)
  // =====================================================================

  private executeEnvironmentalFeedback(state: GameState, rng: RNGFunction, context: PhaseContext): GameEvent[] {
    // Aggregate climate state
    const climateState = this.aggregateClimateState(state);

    // Aggregate pollution level
    const pollutionLevel = this.aggregatePollutionLevel(state);

    // Aggregate resource depletion
    const resourceDepletion = this.aggregateResourceDepletion(state);

    // Update environmental accumulation tracking
    if (!state.environmentalAccumulation) {
      state.environmentalAccumulation = {
        resourceReserves: 0.65,
        pollutionLevel: 0.40,
        climateStability: 0.60,
        biodiversityIndex: 0.65,
        pollutionPreventionFactor: 1.0,
        monsoonDisruptionRisk: 0,
        ozoneDepletionRisk: 0,
        resourceCrisisActive: false,
        pollutionCrisisActive: false,
        climateCrisisActive: false,
        ecosystemCrisisActive: false,
      };
    }

    // Sync pollution to 0-100 scale (detect NaN and fail loudly)
    if (isNaN(pollutionLevel)) {
      console.error(`❌ NaN pollution level in ClimateSystemPhase.executeEnvironmentalFeedback at month ${state.currentMonth}`);
      throw new Error(`NaN pollution level detected - simulation corrupted at month ${state.currentMonth}`);
    }
    /**
     * Pollution normalized to [0, 1] scale
     *
     * The 1.0 (100%) cap is a definitional bound, not a physical limit:
     * - 0.0 = pre-industrial baseline (1750)
     * - 1.0 = maximum modeled pollution intensity
     *
     * Note: Actual pollution could theoretically exceed 100% of our
     * current worst-case scenario, but:
     * - Self-limiting: Extreme pollution causes collapse, which reduces
     *   industrial output and emissions (Meadows et al. 1972, Limits to Growth)
     * - Scale reference: Persson et al. (2022, ES&T) establishes that Novel Entities
     *   planetary boundary is "exceeded" using qualitative weight-of-evidence, NOT
     *   a quantified 2x multiple (see verification_climate_stability_citations_20251126.md)
     * - The [0,1] normalization enables consistent cross-system comparisons
     */
    state.environmentalAccumulation.pollutionLevel = Math.max(0, Math.min(1, pollutionLevel / 100));

    // CRITICAL FIX (Nov 28, 2025): CRITICAL-1 climateStability zeroing bug
    // ClimateSystemPhase was blindly overwriting climateStability from planetary boundaries,
    // but planetaryBoundariesSystem.climate_change.currentValue can be > 1.0 at initialization
    // (e.g., 2.1 = 210% over safe boundary), which produces climateStability = max(0, 1 - 2.1) = 0.000
    //
    // This ZEROED the correct value from environmentalAccumulation (0.768) at Month 0,
    // causing immediate environmental collapse bifurcation at Month 1 in 100% of runs.
    //
    // FIX: Only overwrite if calculated value is valid (>= 0.1). Otherwise, keep existing value.
    // Rationale: Climate stability should NEVER be exactly zero at initialization.
    // If planetary boundaries produce 0.000, that's a configuration bug, not reality.
    const calculatedStability = climateState.climateStability;
    const currentStability = state.environmentalAccumulation.climateStability;

    if (calculatedStability >= 0.1) {
      // Calculated value is reasonable, use it
      state.environmentalAccumulation.climateStability = calculatedStability;
    } else if (currentStability >= 0.1) {
      // DEFENSIVE: If planetary boundaries produce nonsense (<0.1) but current value is reasonable,
      // keep the current value. This prevents planetary boundary misconfiguration from zeroing climate.
      // Only warn on first few months to avoid log spam.
      if (state.currentMonth <= 3) {
        const climateBoundaryValue = state.planetaryBoundariesSystem?.boundaries?.climate_change?.currentValue ?? -1;
        console.warn(
          `⚠️ [ClimateSystemPhase Month ${state.currentMonth}] Planetary boundary produced climateStability=${calculatedStability.toFixed(4)} (< 0.1). ` +
          `Keeping environmentalAccumulation value (${currentStability.toFixed(4)}) instead. ` +
          `(climate_change.currentValue = ${climateBoundaryValue.toFixed(2)})`
        );
      }
      // Keep current value, don't overwrite
    } else {
      // Both calculated and current are near-zero - this is a real collapse
      state.environmentalAccumulation.climateStability = calculatedStability;
    }

    const events: GameEvent[] = [];

    // Report significant changes (only log major updates)
    if (state.currentMonth % 12 === 0) {
      events.push({
        id: `environmental_state_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'environmental',
        severity: 'info',
        agent: 'system',
        title: 'Environmental State Annual Report',
        description: `Climate=${climateState.globalTemperatureAnomaly.toFixed(2)}°C, Pollution=${pollutionLevel.toFixed(1)}, Resources=${(100 - resourceDepletion).toFixed(1)}% remaining`,
        effects: {
          climateAnomaly: climateState.globalTemperatureAnomaly,
          pollution: pollutionLevel,
          resourcesRemaining: 100 - resourceDepletion
        }
      });
    }

    return events;
  }

  private aggregateClimateState(state: GameState): {
    globalTemperatureAnomaly: number;
    carbonPPM: number;
    climateStability: number;
  } {
    const climateChangeBoundary = state.planetaryBoundariesSystem?.boundaries?.climate_change;
    if (climateChangeBoundary) {
      const tempAnomaly = climateChangeBoundary.currentValue * 2.0;
      const climateStability = Math.max(0, 1 - climateChangeBoundary.currentValue);

      return {
        globalTemperatureAnomaly: tempAnomaly,
        carbonPPM: 420 + (climateChangeBoundary.currentValue * 180),
        climateStability,
      };
    }

    if (state.environmentalAccumulation) {
      if (state.environmentalAccumulation.climateStability === undefined) {
        throw new Error('❌ state.environmentalAccumulation.climateStability is undefined in ClimateSystemPhase - initialization bug');
      }
      return {
        globalTemperatureAnomaly: 1.0 + (1 - state.environmentalAccumulation.climateStability) * 2.0,
        carbonPPM: 420,
        climateStability: state.environmentalAccumulation.climateStability,
      };
    }

    return {
      globalTemperatureAnomaly: 1.1,
      carbonPPM: 424,
      climateStability: 0.6,
    };
  }

  private aggregatePollutionLevel(state: GameState): number {
    if (state.environmentalAccumulation?.pollutionLevel !== undefined) {
      const pollutionLevel = state.environmentalAccumulation.pollutionLevel;
      if (isNaN(pollutionLevel)) {
        console.error(`❌ NaN in environmentalAccumulation.pollutionLevel at month ${state.currentMonth}`);
        throw new Error(`NaN pollution in environmental accumulation - trace and fix source`);
      }
      return pollutionLevel * 100;
    }

    if (state.novelEntitiesSystem) {
      const syntheticLoad = assertStateProperty(
        state.novelEntitiesSystem,
        'syntheticChemicalLoad',
        { location: 'ClimateSystemPhase.aggregatePollutionLevel', month: state.currentMonth }
      );
      const microplastics = assertStateProperty(
        state.novelEntitiesSystem,
        'microplasticConcentration',
        { location: 'ClimateSystemPhase.aggregatePollutionLevel', month: state.currentMonth }
      );
      const pfas = assertStateProperty(
        state.novelEntitiesSystem,
        'pfasPrevalence',
        { location: 'ClimateSystemPhase.aggregatePollutionLevel', month: state.currentMonth }
      );

      const avgPollution = (syntheticLoad + microplastics + pfas) / 3;
      return avgPollution * 100;
    }

    return 40;
  }

  private aggregateResourceDepletion(state: GameState): number {
    let depletion = 0;
    let count = 0;

    if (state.phosphorusSystem) {
      const reserves = assertStateProperty(
        state.phosphorusSystem,
        'reserves',
        { location: 'ClimateSystemPhase.aggregateResourceDepletion', month: state.currentMonth }
      );
      depletion += (1 - reserves) * 100;
      count++;
    }

    if (state.freshwaterSystem) {
      const waterStress = assertStateProperty(
        state.freshwaterSystem,
        'waterStress',
        { location: 'ClimateSystemPhase.aggregateResourceDepletion', month: state.currentMonth }
      );
      depletion += waterStress * 100;
      count++;
    }

    if (state.environmentalAccumulation) {
      const resourceReserves = assertStateProperty(
        state.environmentalAccumulation,
        'resourceReserves',
        { location: 'ClimateSystemPhase.aggregateResourceDepletion', month: state.currentMonth }
      );
      depletion += (1 - resourceReserves) * 100;
      count++;
    }

    if (count > 0) {
      return depletion / count;
    }

    return 35;
  }

  // =====================================================================
  // CLIMATE IMPACT CASCADE LOGIC (from ClimateImpactCascadePhase.ts)
  // =====================================================================

  private executeClimateImpactCascade(state: GameState, rng: RNGFunction, context: PhaseContext): void {
    // Get bifurcation variance amplification
    const varianceAmp = assertFinite(state.bifurcationState.varianceAmplification, {
      location: 'ClimateSystemPhase.executeClimateImpactCascade',
      valueName: 'varianceAmplification',
      month: state.currentMonth
    });

    const climateImpacts = this.calculateClimateImpacts(state, rng, context, varianceAmp);

    const foodSecurityChanges = this.applyFoodSecurityImpacts(state, climateImpacts, context);

    const famineRisks = this.calculateFamineRisks(state, foodSecurityChanges, context);

    this.addMortalityRisks(state, famineRisks, context);
  }

  private calculateClimateImpacts(
    state: GameState,
    rng: RNGFunction,
    context: PhaseContext,
    varianceAmp: number
  ): ClimateImpact[] {
    const impacts: ClimateImpact[] = [];

    // Heat wave impacts
    const avgTemp = assertStateProperty(state.environmentalAccumulation, 'climateStability', {
      location: 'ClimateSystemPhase.calculateClimateImpacts',
      month: state.currentMonth
    });

    if (avgTemp < 0.7) {
      const baseIntensity = assertFinite(1.0 - avgTemp, {
        location: 'ClimateSystemPhase.heatWaveIntensity',
        valueName: 'baseIntensity',
        month: state.currentMonth
      });

      const normalizedBase = baseIntensity / 0.3;
      const amplifiedIntensity = capWithBifurcationAwareness(
        normalizedBase * varianceAmp / 5.0,
        1.0,
        {
          location: 'ClimateSystemPhase.calculateClimateImpacts',
          valueName: 'heatWaveIntensity',
          month: state.currentMonth
        }
      );

      impacts.push({
        type: 'heat_wave',
        intensity: amplifiedIntensity,
        lagMonths: 0,
        affectedRegions: this.getHeatVulnerableRegions(state),
        month: state.currentMonth
      });
    }

    // Drought impacts
    const climateStability = assertInRange(
      state.environmentalAccumulation.climateStability,
      0, 1,
      {
        location: 'ClimateSystemPhase.calculateClimateImpacts',
        valueName: 'climateStability',
        month: state.currentMonth
      }
    );

    if (climateStability < 0.6) {
      const baseIntensity = assertFinite(1.0 - climateStability, {
        location: 'ClimateSystemPhase.droughtIntensity',
        valueName: 'baseIntensity',
        month: state.currentMonth
      });

      const normalizedBase = baseIntensity / 0.4;
      const amplifiedIntensity = capWithBifurcationAwareness(
        normalizedBase * varianceAmp / 5.0,
        1.0,
        {
          location: 'ClimateSystemPhase.calculateClimateImpacts',
          valueName: 'droughtIntensity',
          month: state.currentMonth
        }
      );

      impacts.push({
        type: 'drought',
        intensity: amplifiedIntensity,
        lagMonths: Math.floor(rng() * 2) + 1,
        affectedRegions: this.getDroughtVulnerableRegions(state),
        month: state.currentMonth
      });
    }

    // Ecosystem collapse
    const biosphereBoundary = state.planetaryBoundariesSystem?.boundaries?.biosphere_integrity;
    const biosphereIntegrity = assertDefined(
      biosphereBoundary?.currentValue,
      {
        location: 'ClimateSystemPhase.calculateClimateImpacts',
        valueName: 'biosphereIntegrity',
        month: state.currentMonth
      }
    );

    if (biosphereIntegrity > 1.0) {
      const baseIntensity = assertFinite(biosphereIntegrity - 1.0, {
        location: 'ClimateSystemPhase.ecosystemCollapseIntensity',
        valueName: 'baseIntensity',
        month: state.currentMonth
      });

      const normalizedBase = baseIntensity / 0.5;
      const amplifiedIntensity = capWithBifurcationAwareness(
        normalizedBase * varianceAmp / 5.0,
        1.0,
        {
          location: 'ClimateSystemPhase.calculateClimateImpacts',
          valueName: 'ecosystemCollapseIntensity',
          month: state.currentMonth
        }
      );

      impacts.push({
        type: 'ecosystem_collapse',
        intensity: amplifiedIntensity,
        lagMonths: Math.floor(rng() * 6) + 6,
        affectedRegions: ['GLOBAL'],
        month: state.currentMonth
      });
    }

    return impacts;
  }

  private applyFoodSecurityImpacts(
    state: GameState,
    impacts: ClimateImpact[],
    context: PhaseContext
  ): Map<string, number> {
    const changes = new Map<string, number>();

    for (const impact of impacts) {
      if (impact.lagMonths === 0) {
        for (const region of impact.affectedRegions) {
          const currentChange = changes.get(region) || 0;
          const impactValue = assertFinite(impact.intensity * 0.05, {
            location: 'ClimateSystemPhase.immediateImpact',
            valueName: 'impactValue',
            month: state.currentMonth
          });
          changes.set(region, currentChange - impactValue);
        }
      } else {
        this.storeDelayedImpact(context, impact);
      }
    }

    const delayedImpacts = this.retrieveDelayedImpacts(context, state.currentMonth);
    for (const impact of delayedImpacts) {
      for (const region of impact.affectedRegions) {
        const currentChange = changes.get(region) || 0;
        const impactValue = assertFinite(impact.intensity * 0.08, {
          location: 'ClimateSystemPhase.delayedImpact',
          valueName: 'impactValue',
          month: state.currentMonth
        });
        changes.set(region, currentChange - impactValue);
      }
    }

    return changes;
  }

  private calculateFamineRisks(
    state: GameState,
    foodSecurityChanges: Map<string, number>,
    context: PhaseContext
  ): FamineRisk[] {
    const risks: FamineRisk[] = [];

    const leanSeasonMap = this.getLeanSeasonStatus(state.currentMonth);

    for (const [region, change] of foodSecurityChanges) {
      const currentFoodSecurity = this.getRegionalFoodSecurity(state, region);

      const calculatedFoodSecurity = Math.max(
        ClimateSystemPhase.MIN_FOOD_SECURITY,
        currentFoodSecurity + change
      );

      const newFoodSecurity = assertInRange(
        calculatedFoodSecurity,
        0, 1,
        {
          location: 'ClimateSystemPhase.calculateFamineRisks',
          valueName: 'foodSecurity',
          month: state.currentMonth
        }
      );

      if (newFoodSecurity < 0.6) {
        const isLeanSeason = leanSeasonMap.get(region) || false;

        risks.push({
          region,
          foodSecurityLevel: newFoodSecurity,
          isLeanSeason,
          demographicMultipliers: this.getDemographicMultipliers(state, region),
          cause: `Climate-driven food insecurity (level: ${newFoodSecurity.toFixed(2)})`
        });
      }
    }

    return risks;
  }

  private addMortalityRisks(state: GameState, risks: FamineRisk[], context: PhaseContext): void {
    for (const risk of risks) {
      let baseRate = 0;

      if (risk.foodSecurityLevel < 0.2) {
        baseRate = 0.15;
      } else if (risk.foodSecurityLevel < 0.4) {
        baseRate = risk.isLeanSeason ? 0.05 : 0.005;
      } else {
        baseRate = 0.002;
      }

      if (risk.isLeanSeason && risk.foodSecurityLevel < 0.4) {
        baseRate = assertFinite(baseRate * 1.75, {
          location: 'ClimateSystemPhase.seasonalMultiplier',
          valueName: 'baseRate',
          month: state.currentMonth
        });
      }

      addMortalityRisk(state.humanPopulationSystem, {
        type: 'famine',
        baseRisk: baseRate,
        proximate: 'famine',
        root: 'climate',
        confidence: 'HIGH',
        scope: 'REGIONAL',
        region: risk.region,
        month: state.currentMonth,
        description: risk.cause
      });

      if (baseRate > 0.01) {
        console.log(
          `🌍☠️ Climate cascade: ${risk.region} food security ${risk.foodSecurityLevel.toFixed(2)}, ` +
          `base mortality ${(baseRate * 100).toFixed(2)}% (lean season: ${risk.isLeanSeason})`
        );
      }
    }
  }

  // Helper methods (from ClimateImpactCascadePhase)

  private getHeatVulnerableRegions(state: GameState): string[] {
    return ['Sub-Saharan Africa', 'South Asia', 'Middle East & North Africa'];
  }

  private getDroughtVulnerableRegions(state: GameState): string[] {
    return ['Sub-Saharan Africa', 'Central Asia', 'Southern Europe'];
  }

  private getLeanSeasonStatus(currentMonth: number): Map<string, boolean> {
    const leanSeasons = new Map<string, boolean>();
    const monthOfYear = ((currentMonth - 1) % 12) + 1;

    const isSahelLean = monthOfYear >= 6 && monthOfYear <= 8;
    leanSeasons.set('Sub-Saharan Africa', isSahelLean);
    leanSeasons.set('West Africa', isSahelLean);

    const isSouthAsiaLean = monthOfYear >= 9 && monthOfYear <= 11;
    leanSeasons.set('South Asia', isSouthAsiaLean);

    const isEastAfricaLean = monthOfYear >= 1 && monthOfYear <= 5 || monthOfYear === 12;
    leanSeasons.set('East Africa', isEastAfricaLean);

    return leanSeasons;
  }

  private getDemographicMultipliers(state: GameState, region: string): Map<string, number> {
    return new Map([
      ['Elite', 0.2],
      ['Professional', 0.6],
      ['Working', 1.0],
      ['Precariat', 2.0],
      ['Informal', 3.0]
    ]);
  }

  private getRegionalFoodSecurity(state: GameState, region: string): number {
    const foodSecurity = assertStateProperty(
      state.qualityOfLifeSystems.survivalFundamentals,
      'foodSecurity',
      {
        location: 'ClimateSystemPhase.getRegionalFoodSecurity',
        month: state.currentMonth
      }
    );

    return assertInRange(foodSecurity, 0, 1, {
      location: 'ClimateSystemPhase.getRegionalFoodSecurity',
      valueName: 'foodSecurity',
      month: state.currentMonth
    });
  }

  private storeDelayedImpact(context: PhaseContext, impact: ClimateImpact): void {
    if (!context.data.has('delayedClimateImpacts')) {
      context.data.set('delayedClimateImpacts', []);
    }
    const impacts = context.data.get('delayedClimateImpacts') as DelayedClimateImpact[];
    impacts.push({
      ...impact,
      applyAtMonth: context.month + impact.lagMonths
    });
  }

  private retrieveDelayedImpacts(context: PhaseContext, currentMonth: number): ClimateImpact[] {
    if (!context.data.has('delayedClimateImpacts')) {
      return [];
    }

    const allImpacts = context.data.get('delayedClimateImpacts') as DelayedClimateImpact[];
    const applicable = allImpacts.filter(i => i.applyAtMonth === currentMonth);

    const remaining = allImpacts.filter(i => i.applyAtMonth > currentMonth);
    context.data.set('delayedClimateImpacts', remaining);

    return applicable;
  }
}
