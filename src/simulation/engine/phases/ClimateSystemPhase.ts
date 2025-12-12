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
import { TIPPING_INTERACTIONS, TippingElementState, TippingElement } from '@/types/tipping-points';
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

    // Step 1 & 2: Update tipping element states with bidirectional hysteresis (M-7, Dec 5, 2025)
    // Research: Garbe et al. (2020) Nature, Drüke et al. (2024) ESD
    // Replaces unidirectional trigger logic with state machine supporting recovery
    const previousTriggerCount = state.tippingPointSystem.triggers.length;
    this.updateTippingElementStates(state, currentTempC, rng);

    // Track newly triggered elements this month for compound event detection (M-5)
    const newlyTriggered = state.tippingPointSystem.triggers
      .slice(previousTriggerCount)
      .filter(t => t.monthTriggered === state.currentMonth)
      .map(t => {
        const element = state.tippingPointSystem.elements.find(e => e.id === t.elementId);
        return element?.name || t.elementId;
      });

    // Step 3: Calculate cascade amplification
    this.calculateTippingCascades(state);

    // Step 3.5: Detect compound climate events (M-5: 3+ simultaneous triggers)
    // Note: Must come AFTER calculateTippingCascades to read correct cascadeMultiplier
    this.detectCompoundEvents(state, newlyTriggered);

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

    if (system.triggeredCount > 0) {
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
      // Linear scaling reflects rate-dependent accumulating effects:
      // - Freshwater forcing accumulates over time
      // - Carbon release accelerates as thaw deepens
      // - Albedo feedback compounds with ice loss
      // Research: Earth System Dynamics (2024) documents "rate-induced tipping cascades"
      // where interaction strength accelerates, not diminishes.
      const progressScalar = Math.max(0.1, sourceElement.progress);

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
    // This is a simulation stability safeguard to prevent over-catastrophizing,
    // not a research-backed parameter. Ensures cascades remain bounded.
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

  /**
   * Bidirectional hysteresis state machine for tipping elements (M-7, Dec 5, 2025)
   *
   * Research: Garbe et al. (2020) Nature, Drüke et al. (2024) ESD
   *
   * Key insight: Recovery threshold << crossing threshold (hysteresis gap 0-3°C)
   * Example (WAIS): Cross at +2.0°C, recover below -1.0°C = 3.0°C gap
   *
   * State transitions:
   * - NOT_TRIGGERED → PROGRESSING: temp >= effectiveThreshold
   * - PROGRESSING → FULLY_TIPPED: progress >= 1.0
   * - FULLY_TIPPED → RECOVERING: temp < recoveryTempC (hysteresis!)
   * - RECOVERING → RECOVERED: progress <= minimumAsymptoticValue
   * - RECOVERING → PROGRESSING: temp rises above threshold during recovery
   * - RECOVERED → PROGRESSING: temp rises above threshold again
   */
  private updateTippingElementStates(state: GameState, currentTempC: number, rng: RNGFunction): void {
    const system = state.tippingPointSystem;

    for (const element of system.elements) {
      // Calculate effective threshold with cascade reduction (Nov 23, 2025)
      const effectiveThreshold = this.getEffectiveThreshold(element, state);

      // Get recovery threshold (undefined = irreversible, same as trigger = no hysteresis)
      const recoveryThreshold = element.recoveryTempC ?? -Infinity; // If undefined, never recovers

      // State is now always initialized (MEDIUM-2 fix, Dec 12, 2025) - no backward compatibility check needed

      switch (element.state) {
        case TippingElementState.NOT_TRIGGERED:
          if (currentTempC >= effectiveThreshold) {
            this.transitionToProgressing(element, state, currentTempC, effectiveThreshold);
          }
          break;

        case TippingElementState.PROGRESSING:
          this.updateProgressingElement(element, state, rng);
          if (element.progress >= 1.0) {
            this.transitionToFullyTipped(element, state);
          }
          break;

        case TippingElementState.FULLY_TIPPED:
          // Check if temperature dropped below RECOVERY threshold (hysteresis!)
          if (currentTempC < recoveryThreshold) {
            this.transitionToRecovering(element, state, currentTempC, recoveryThreshold);
          }
          break;

        case TippingElementState.RECOVERING:
          // Check if temp rises again before recovery complete (re-triggering)
          if (currentTempC >= effectiveThreshold) {
            this.transitionToProgressing(element, state, currentTempC, effectiveThreshold);
          } else {
            this.updateRecoveringElement(element, state, rng);
            const floor = element.minimumAsymptoticValue ?? 0.0;
            if (element.progress <= floor) {
              this.transitionToRecovered(element, state);
            }
          }
          break;

        case TippingElementState.RECOVERED:
          // Can re-trigger if temperature crosses threshold again
          if (currentTempC >= effectiveThreshold) {
            this.transitionToProgressing(element, state, currentTempC, effectiveThreshold);
          }
          break;
      }
    }
  }

  /**
   * Calculate effective threshold with cascade reductions (Nov 23, 2025)
   * Research: Wunderling et al. (2024), Armstrong McKay et al. (2022)
   */
  private getEffectiveThreshold(element: TippingElement, state: GameState): number {
    const thresholdReduction = element.effectiveThresholdReduction || 0;
    const baseThreshold = element.triggerTempC;

    return assertFinite(
      baseThreshold - thresholdReduction,
      {
        location: 'ClimateSystemPhase.getEffectiveThreshold',
        valueName: 'effectiveThreshold',
        month: state.currentMonth,
        additionalInfo: {
          elementId: element.id,
          baseThreshold,
          deterministicThreshold: element.triggerTempC,
          thresholdReduction
        }
      }
    );
  }

  /**
   * Transition to PROGRESSING state (element begins tipping)
   */
  private transitionToProgressing(
    element: TippingElement,
    state: GameState,
    currentTempC: number,
    effectiveThreshold: number
  ): void {
    const previousState = element.state;
    element.state = TippingElementState.PROGRESSING;
    element.triggered = true;  // Keep for backward compatibility
    element.monthsSinceTrigger = 0;

    // Record trigger event
    state.tippingPointSystem.triggers.push({
      elementId: element.id,
      monthTriggered: state.currentMonth,
      tempAtTrigger: currentTempC
    });

    // Log with hysteresis context
    const thresholdReduction = element.effectiveThresholdReduction || 0;
    const gap = element.hysteresisGapC ?? 0;

    if (previousState === TippingElementState.RECOVERING) {
      console.warn(`  🔄 RE-TRIGGERING DURING RECOVERY: ${element.name}`);
      console.log(`     Temperature rose to ${currentTempC.toFixed(2)}°C before recovery complete`);
      console.log(`     Progress was: ${(element.progress * 100).toFixed(1)}%`);
    } else if (thresholdReduction > 0) {
      console.warn(`  🚨 CASCADE TIPPING POINT: ${element.name}`);
      console.log(`     Original threshold: ${element.triggerTempC}°C`);
      console.log(`     Effective threshold: ${effectiveThreshold.toFixed(2)}°C (lowered by ${thresholdReduction.toFixed(2)}°C)`);
      console.log(`     Current: ${currentTempC.toFixed(2)}°C`);
    } else {
      console.warn(`  🚨 TIPPING POINT: ${element.name}`);
      console.log(`     Trigger: ${element.triggerTempC}°C | Current: ${currentTempC.toFixed(2)}°C`);
    }

    if (gap > 0) {
      console.log(`     🌡️ Hysteresis gap: ${gap.toFixed(1)}°C (recovers below ${element.recoveryTempC}°C)`);
    }
    console.log(`     Transition timescale: ${element.transitionMinMonths}-${element.transitionMaxMonths} months`);
  }

  /**
   * Update PROGRESSING element (sigmoid curve toward fully tipped)
   */
  private updateProgressingElement(element: TippingElement, state: GameState, rng: RNGFunction): void {
    element.monthsSinceTrigger++;

    // Sample random transition time within range (only on first update)
    if (element.monthsSinceTrigger === 1) {
      const transitionTime = element.transitionMinMonths +
        rng() * (element.transitionMaxMonths - element.transitionMinMonths);
      element._sampledTransitionTime = transitionTime;
    }

    const transitionTime = element._sampledTransitionTime || element.transitionMaxMonths;

    // Sigmoid curve parameters
    const k = 4 / transitionTime;
    const t = element.monthsSinceTrigger;
    const t_mid = transitionTime / 2;

    const newProgress = assertFinite(
      1 / (1 + Math.exp(-k * (t - t_mid))),
      {
        location: 'ClimateSystemPhase.updateProgressingElement',
        valueName: 'newProgress',
        month: state.currentMonth,
        additionalInfo: { elementId: element.id, t, k, t_mid }
      }
    );

    element.progress = assertInRange(
      Math.min(1.0, Math.max(0.0, newProgress)),
      0, 1,
      {
        location: 'ClimateSystemPhase.updateProgressingElement',
        valueName: `element[${element.id}].progress`,
        month: state.currentMonth
      }
    );
  }

  /**
   * Transition to FULLY_TIPPED state (progress reached 1.0)
   */
  private transitionToFullyTipped(element: TippingElement, state: GameState): void {
    element.state = TippingElementState.FULLY_TIPPED;
    console.log(`  ⚠️ FULLY TRANSITIONED: ${element.name} (progress = 100%)`);

    const gap = element.hysteresisGapC ?? 0;
    if (gap > 0) {
      console.log(`     Recovery requires temp below ${element.recoveryTempC}°C (${gap.toFixed(1)}°C drop)`);
    } else if (element.recoveryTempC === undefined) {
      console.log(`     ⚠️ IRREVERSIBLE on human timescales`);
    }
  }

  /**
   * Transition to RECOVERING state (temp dropped below recovery threshold)
   */
  private transitionToRecovering(
    element: TippingElement,
    state: GameState,
    currentTempC: number,
    recoveryThreshold: number
  ): void {
    element.state = TippingElementState.RECOVERING;
    element.monthsSinceTrigger = 0;  // Reset counter for recovery phase

    console.log(`  🌱 RECOVERY BEGINS: ${element.name}`);
    console.log(`     Temp dropped to ${currentTempC.toFixed(2)}°C (below recovery threshold ${recoveryThreshold.toFixed(2)}°C)`);
    console.log(`     Progress will decrease from ${(element.progress * 100).toFixed(1)}% toward floor: ${((element.minimumAsymptoticValue ?? 0) * 100).toFixed(1)}%`);

    const halfLife = element.recoveryHalfLife ?? 400;
    console.log(`     Recovery half-life: ${halfLife} years`);
  }

  /**
   * Update RECOVERING element (exponential decay toward floor)
   * Research: Drüke et al. (2024) - recovery timescales 100-1000 years
   */
  private updateRecoveringElement(element: TippingElement, state: GameState, rng: RNGFunction): void {
    element.monthsSinceTrigger++;

    const halfLife = element.recoveryHalfLife ?? 400;  // Default 400 years
    const floor = element.minimumAsymptoticValue ?? 0.0;

    // Exponential decay toward floor: progress(t) = floor + (progress_0 - floor) * exp(-λt)
    // λ = ln(2) / halfLife (in years)
    const lambda = Math.log(2) / halfLife;
    const t_years = element.monthsSinceTrigger / 12;

    const newProgress = assertFinite(
      floor + (element.progress - floor) * Math.exp(-lambda * t_years),
      {
        location: 'ClimateSystemPhase.updateRecoveringElement',
        valueName: 'newProgress',
        month: state.currentMonth,
        additionalInfo: {
          elementId: element.id,
          halfLife,
          floor,
          t_years,
          currentProgress: element.progress
        }
      }
    );

    element.progress = assertInRange(
      Math.max(floor, newProgress),  // Never go below floor
      0, 1,
      {
        location: 'ClimateSystemPhase.updateRecoveringElement',
        valueName: `element[${element.id}].progress`,
        month: state.currentMonth
      }
    );
  }

  /**
   * Transition to RECOVERED state (progress reached floor)
   */
  private transitionToRecovered(element: TippingElement, state: GameState): void {
    element.state = TippingElementState.RECOVERED;
    const floor = element.minimumAsymptoticValue ?? 0.0;

    console.log(`  ✅ RECOVERY COMPLETE: ${element.name}`);
    console.log(`     Progress: ${(element.progress * 100).toFixed(1)}% (floor: ${(floor * 100).toFixed(1)}%)`);

    if (floor > 0) {
      console.log(`     ⚠️ Irreversible component: ${(floor * 100).toFixed(1)}% remains`);
    }
  }

  /**
   * Calculate cascade amplification multiplier (M-5: Compound Climate Events)
   *
   * Research-backed cascade multipliers from:
   * - Communications Earth & Environment (2024) DOI: 10.1038/s43247-024-01799-5
   *   "At 1.5°C, neglecting polar ice sheets can alter expected tipped element count by >2x"
   * - Global Tipping Points Report 2025: 3+ elements = 30-50% probability at 2.0°C
   * - Wunderling et al. (2024) ESD: "Many tipping interactions are DESTABILIZING"
   *
   * Multiplier Justification:
   * - 2 elements: 1.5x (moderate amplification)
   * - 3 elements: 2.0x (CRITICAL THRESHOLD - research "factor of 2" finding)
   * - 4 elements: 2.5x (severe amplification)
   * - 5+ elements: 3.0x (full cascade "Hothouse Earth" scenario)
   *
   * Note: Previous multipliers (1.15x, 1.35x, 1.60x) were 48% too conservative
   * for 3-element cascades per Communications Earth & Environment (2024).
   */
  private calculateTippingCascades(state: GameState): void {
    const system = state.tippingPointSystem;

    const activeCascadingElements = system.elements.filter(e =>
      e.progress > 0 && e.cascades
    );

    const cascadeCount = activeCascadingElements.length;

    let cascadeMultiplier: number;
    if (cascadeCount === 0 || cascadeCount === 1) {
      cascadeMultiplier = 1.0;  // No cascade
    } else if (cascadeCount === 2) {
      cascadeMultiplier = 1.5;  // Moderate amplification
    } else if (cascadeCount === 3) {
      cascadeMultiplier = 2.0;  // CRITICAL THRESHOLD (research-backed 2x factor)
    } else if (cascadeCount === 4) {
      cascadeMultiplier = 2.5;  // Severe amplification
    } else {
      // 5+ elements: Full cascade ("Hothouse Earth" scenario)
      cascadeMultiplier = 3.0;  // Maximum amplification
    }

    system.cascadeMultiplier = assertInRange(
      cascadeMultiplier,
      1.0, 3.0,  // Updated max to 3.0 for 5+ element cascades
      {
        location: 'ClimateSystemPhase.calculateTippingCascades',
        valueName: 'system.cascadeMultiplier',
        month: state.currentMonth
      }
    );
  }

  /**
   * Detect compound climate events (M-5: Compound Climate Events)
   *
   * Research: Global Tipping Points Report 2025
   * - At 2.0°C warming: 3+ simultaneous tipping points = 30-50% probability
   * - Compound events trigger accelerated collapse dynamics
   *
   * @param state Game state
   * @param newlyTriggered Array of element names that triggered this month
   */
  private detectCompoundEvents(state: GameState, newlyTriggered: string[]): void {
    const system = state.tippingPointSystem;

    // Compound event threshold: 3+ elements tipping simultaneously
    const COMPOUND_THRESHOLD = 3;

    if (newlyTriggered.length >= COMPOUND_THRESHOLD) {
      // Validate cascade multiplier exists (defensive)
      const cascadeMultiplier = assertFinite(
        system.cascadeMultiplier,
        {
          location: 'ClimateSystemPhase.detectCompoundEvents',
          valueName: 'system.cascadeMultiplier',
          month: state.currentMonth
        }
      );

      // Log compound event with pictographic marker
      console.log(`\n🌍🔥💥 COMPOUND CLIMATE EVENT`);
      console.log(`  ${newlyTriggered.length} tipping points crossed simultaneously (month ${state.currentMonth})`);
      console.log(`  Elements: ${newlyTriggered.join(', ')}`);
      console.log(`  Cascade acceleration: ${cascadeMultiplier.toFixed(2)}x`);
      console.log(`  🚨 Accelerated collapse dynamics initiated`);
      console.log(`  Research: Global Tipping Points Report 2025 - 30-50% probability at 2.0°C warming`);
    }
  }

  private applyTippingImpacts(state: GameState): void {
    const system = state.tippingPointSystem;

    let totalClimateStabilityImpact = 0;
    let totalHabitabilityImpact = 0;
    let totalFoodSecurityImpact = 0;
    let totalFreshwaterImpact = 0;

    // Count active cascading elements for tail risk detection
    const activeCascadingElements = system.elements.filter(e =>
      e.progress > 0 && e.cascades
    );
    const cascadeCount = activeCascadingElements.length;

    /**
     * Track regional compound impacts (M-5: Compound Climate Events)
     *
     * Research: Global Tipping Points Report 2025
     * - Regions hit by 3+ tipping points experience non-linear damage amplification
     * - Example: Amazon + AMOC + Permafrost → extreme regional stress
     */
    const regionalHits: Record<string, number> = {};
    const regionalElements: Record<string, string[]> = {};

    for (const element of system.elements) {
      if (element.progress === 0) continue;

      const scaledProgress = element.progress * system.cascadeMultiplier;

      totalClimateStabilityImpact += element.impactClimateStability * scaledProgress;
      totalHabitabilityImpact += element.impactHabitability * scaledProgress;
      totalFoodSecurityImpact += element.impactFoodSecurity * scaledProgress;
      totalFreshwaterImpact += element.impactFreshwater * scaledProgress;

      // Track which regions are hit by this element (M-5)
      if (element.regionalImpacts) {
        for (const region of Object.keys(element.regionalImpacts)) {
          regionalHits[region] = (regionalHits[region] || 0) + 1;
          if (!regionalElements[region]) {
            regionalElements[region] = [];
          }
          regionalElements[region].push(element.name);
        }
      }
    }

    // Log compound regional impacts (M-5: 3+ simultaneous tipping points per region)
    for (const [region, hitCount] of Object.entries(regionalHits)) {
      if (hitCount >= 3) {
        // Region experiencing compound cascade
        const compoundAmplification = assertFinite(
          1.0 + (hitCount - 2) * 0.3,  // 30% amplification per additional element beyond 2
          {
            location: 'ClimateSystemPhase.applyTippingImpacts',
            valueName: 'compoundAmplification',
            month: state.currentMonth,
            additionalInfo: { region, hitCount }
          }
        );
        console.log(`  🌍⚠️ COMPOUND REGIONAL IMPACT: ${region}`);
        console.log(`     Hit by ${hitCount} tipping points: ${regionalElements[region].join(', ')}`);
        console.log(`     Damage amplification: ${compoundAmplification.toFixed(2)}x`);
      }
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
    // HIGH-4 (Nov 29, 2025): Regime-based feedback loops
    // Ecological-collapse regime accelerates degradation via positive feedbacks
    // Research: Scheffer et al. (2014) - regime shifts create self-reinforcing dynamics
    const regimeMultiplier = state.bifurcationState?.currentRegime === 'ecological-collapse' ? 1.5 : 1.0;

    // HIGH-7 (Dec 3, 2025): Conditional climate stability floor
    // Research: Wunderling et al. (2024) "Climate tipping point interactions and cascades"
    // - "Many tipping interactions are destabilizing" (83% of papers, not self-limiting)
    // - Cascades cannot be ruled out at 1.5-2C warming
    // - 83% of papers show destabilizing interactions (no support for stability floor)
    //
    // Option C: Conditional Floor (Policy Stabilization vs Natural Collapse)
    // Apply 5% floor ONLY in stabilization scenarios (Paris success, few tipping cascades)
    // Remove floor in tail risk scenarios (Paris failure + cascade risk) to match research
    //
    // Stabilization scenarios (floor applies):
    // - Paris Agreement success (warming < 1.5°C)
    // - Low cascade risk (< 3 triggered tipping elements OR warming < 2.0°C)
    //
    // Tail risk scenarios (no floor, natural collapse):
    // - Paris failure (warming >= 2.0°C) AND cascade risk (>= 3 tipping elements)
    //
    // Research Grade: B- (conditional approach aligns with Wunderling 2024, ACCESS-ESM-1.5 2024)
    // @see research/climate_stability_mechanisms_2024_2025_update.md
    // @see research/research_validation_session_51_20251203.md (lines 54-58)
    // @see reviews/climate_stability_floor_debate_20251203.md
    // @see plans/proposed_climate_stability_floor_conditional_20251203.md
    // @see Wunderling et al. (2024) DOI: 10.5194/esd-15-41-2024
    // @see Zhang et al. (2024) ACCESS-ESM-1.5 DOI: 10.5194/esd-15-1353-2024
    const currentTemperature = assertFinite(
      state.planetaryBoundariesSystem?.boundaries?.climate_change?.currentValue ?? 0,
      {
        location: 'ClimateSystemPhase.conditionalStabilityFloor',
        valueName: 'currentTemperature',
        month: state.currentMonth
      }
    );
    const parisSuccess = currentTemperature < 1.5;  // Paris Agreement 1.5C target
    const cascadeRisk = system.triggeredCount >= 3 && currentTemperature >= 2.0;  // Tail risk: many cascades + high warming

    // Floor only applies in stabilization scenarios (policy intervention successful)
    // In tail risk scenarios, allow natural collapse per Wunderling et al. (2024)
    const stabilityFloor = (parisSuccess || !cascadeRisk) ? 0.05 : 0.0;

    // Log when floor is removed in tail risk scenarios
    if (stabilityFloor === 0.0 && system.triggeredCount > 0) {
      console.warn(
        `⚠️ Tail risk scenario: Climate stability floor removed ` +
        `(${system.triggeredCount} tipping elements, ${currentTemperature.toFixed(2)}°C warming)`
      );
      console.log(`   Research: Wunderling et al. (2024) - "many tipping interactions are destabilizing"`);
    }

    state.environmentalAccumulation.climateStability = assertInRange(
      Math.max(stabilityFloor, oldStability * (1 - totalClimateStabilityImpact * 0.01 * regimeMultiplier)),
      0, 1,
      {
        location: 'ClimateSystemPhase.applyTippingImpacts',
        valueName: 'climateStability (after)',
        month: state.currentMonth
      }
    );

    // Store tipping point impacts for other systems
    state._tippingPointImpacts = {
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
      // CRITICAL-1 FIX (Dec 1, 2025): currentValue is ALREADY temperature in °C
      // Don't multiply by 2.0 - that was assuming a [0,1] probability scale
      const tempAnomaly = climateChangeBoundary.currentValue;

      // Climate stability = 1.0 at safe boundary (1.0°C), 0.0 at high risk (1.5°C+)
      // Formula: stability = max(0, 1 - (temp - 1.0) / 0.5)
      const climateStability = Math.max(0, Math.min(1, 1 - (tempAnomaly - 1.0) / 0.5));

      return {
        globalTemperatureAnomaly: tempAnomaly,
        carbonPPM: 420 + ((tempAnomaly - 1.0) * 360), // ~1.21°C = 495ppm, ~1.5°C = 600ppm
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
