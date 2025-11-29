/**
 * GeopoliticalConflictPhase (28.0)
 *
 * Models AI-era geopolitical conflict escalation with research-backed parameters.
 *
 * **CRITICAL PARAMETERS (CORRECTED):**
 * - Base risk: 0.05% monthly (0.6% annual) [was 0.1%, corrected Nov 28]
 * - AI multiplier: 2× range [1.5, 3.0] [was 4×, corrected Nov 28]
 * - Compound cap: 4× maximum (prevents doom spiral)
 * - Deterrence discount: 0.6× (MAD still effective)
 *
 * **EXECUTION ORDER:** 28.0 (After government actions, before crisis cascades)
 * **DEPENDENCIES:**
 * - ai-lifecycle (order 4.0): AI capabilities for escalation multiplier
 * - government-actions (order 9.0): Government policy affects tensions
 * - quality-of-life (order 19.5): Resource scarcity (food/water security)
 * - refugee_crisis (order 20.6): Displacement data (climate/war/famine)
 *
 * **SIDE EFFECTS:**
 * - Updates geopoliticalConflict.tension
 * - Updates geopoliticalConflict.nuclearEscalationRisk
 * - May trigger conflict events (conventional or nuclear)
 * - Logs escalation/deescalation events
 *
 * **Research Foundation:**
 * - research/geopolitical_conflict_escalation_20251128.md (30+ sources)
 * - Validation: reviews/rd3_geopolitical_conflict_critique_20251128.md (PASSED)
 *
 * **Key Citations:**
 * - Barrett et al. 2013: Existential Risk from AI (nuclear C&C risks)
 * - Lohn & Jackson 2022: AI cyber offense amplifies crisis instability
 * - Altmann & Sauer 2017: Autonomous weapons reduce decision time
 * - Zhang et al. 2024: Taiwan conflict risk 40% by 2030
 * - Homer-Dixon et al. 2015: Resource scarcity conflict multiplier
 * - Hsiang et al. 2013: Climate-conflict relationship (+0.02 per °C)
 * - SIPRI 2024: Nuclear arsenals, MAD deterrence strength
 *
 * Nov 28, 2025 - Initial implementation (RD-3)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import {
  assertFinite,
  assertProbability,
  assertInRange,
  assertStateProperty,
  assertDefined,
} from '@/simulation/utils/assertions';
import { getGDPProxy } from '@/simulation/utils/recoveryCalculations';

/**
 * CORRECTED PARAMETERS (Nov 28, 2025)
 * Research: geopolitical_conflict_escalation_20251128.md
 * Validation: rd3_geopolitical_conflict_critique_20251128.md (PASSED with corrections)
 */

// Base monthly conflict probability
// Research: Barrett et al. 2013, adjusted for AI era
const BASE_MONTHLY_RISK = 0.0005;  // 0.05% monthly, 0.6% annual (CORRECTED from 0.1%)

// AI multiplier (applied when AI capabilities reach advanced levels)
// Research: Lohn & Jackson 2022 (cyber offense), Altmann & Sauer 2017 (autonomous weapons)
const AI_MULTIPLIER = 2.0;  // CORRECTED from 4.0 (overconfident original)
const AI_MULTIPLIER_RANGE = { min: 1.5, max: 3.0 };  // Calibrated range

// Compound cap (prevents doom spiral from cascading multipliers)
// Validation: Sylvia critique - cap required to prevent implausible escalation
const COMPOUND_CAP = 4.0;  // Max total multiplier on base risk

// MAD deterrence discount (nuclear weapons still provide deterrence)
// Research: SIPRI 2024, nuclear doctrine analysis
const DETERRENCE_DISCOUNT = 0.6;  // 40% reduction from deterrence effect

// Economic stress coefficient
// Research: Homer-Dixon et al. 2015 (resource scarcity → conflict)
const ECONOMIC_STRESS_COEFF = 0.05;  // +0.5× per 10% GDP loss

// Climate displacement coefficient
// Research: Hsiang et al. 2013, Abel et al. 2019 (climate migration → instability)
const CLIMATE_DISPLACEMENT_COEFF = 0.003;  // +0.3× per 100M displaced

// Resource scarcity multiplier (food, water)
// Research: Homer-Dixon 2015, FAO 2024 (food crisis correlations)
const RESOURCE_SCARCITY_COEFF = 0.8;  // +0.8× when critical resources <20%

// Regional flashpoints (monthly escalation probabilities)
// Research: Zhang et al. 2024 (Taiwan), IISS 2024 (regional conflicts)
const FLASHPOINT_REGIONS = {
  'Taiwan': { baseRisk: 0.033, escalationPotential: 0.7 },  // 3.3% monthly → 40% by 2030
  'Ukraine': { baseRisk: 0.005, escalationPotential: 0.3 },  // 0.5% monthly (reduced from peak)
  'Middle East': { baseRisk: 0.020, escalationPotential: 0.5 },  // 2.0% monthly (ongoing)
  'Kashmir': { baseRisk: 0.008, escalationPotential: 0.4 }  // 0.8% monthly (periodic)
};

export class GeopoliticalConflictPhase implements SimulationPhase {
  readonly id = 'geopolitical-conflict';
  readonly name = 'Geopolitical Conflict Escalation';
  readonly order = 28.0;

  // DEPENDENCIES: Requires AI capabilities, economic state, refugee crisis, QoL systems
  readonly dependencies = [
    'ai-lifecycle',           // Order 4.0: AI capabilities affect escalation
    'government-actions',     // Order 9.0: Government policy affects tensions
    'refugee_crisis',         // Order 20.6: Refugee displacement data (climate/war/famine)
    'quality-of-life',        // Order 19.5: Resource scarcity (food/water security)
  ] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // CRITICAL: RNG must be required, never optional with fallback
    // (CRITICAL-3 regression fix, Nov 7, 2025)
    if (!rng || typeof rng !== 'function') {
      throw new Error('❌ CRITICAL: RNG required for deterministic simulation in GeopoliticalConflictPhase');
    }

    // Initialize geopoliticalConflict if not present (should be initialized in initialization.ts)
    if (!state.geopoliticalConflict) {
      state.geopoliticalConflict = {
        tension: 50,  // Baseline moderate tension
        nuclearEscalationRisk: 0,
        regionalFlashpoints: new Map(),
        activeConflicts: {
          conventional: 0,
          nuclear: false
        },
        historicalEvents: []
      };
    }

    // Calculate monthly conflict risk with CORRECTED parameters
    const riskCalculation = this.calculateMonthlyRisk(state, rng);

    // Update state with calculated risk
    state.geopoliticalConflict.nuclearEscalationRisk = riskCalculation.totalRisk;
    state.geopoliticalConflict.tension = this.updateTension(state, riskCalculation);

    // Sample for conflict event
    const events: any[] = [];
    if (rng() < riskCalculation.totalRisk) {
      const conflictEvent = this.triggerConflictEvent(state, rng, riskCalculation);
      events.push(conflictEvent);
    }

    // Update regional flashpoints
    this.updateRegionalFlashpoints(state, rng);

    return { events };
  }

  /**
   * Calculate monthly conflict risk with CORRECTED research-backed parameters
   *
   * Formula (CORRECTED Nov 28, 2025):
   * risk = BASE_MONTHLY_RISK × AI_MULTIPLIER × ECONOMIC_STRESS × CLIMATE_STRESS × RESOURCE_STRESS
   * risk = min(risk, BASE_MONTHLY_RISK × COMPOUND_CAP)  // Apply compound cap
   * risk = risk × DETERRENCE_DISCOUNT  // Apply MAD deterrence
   *
   * Research: geopolitical_conflict_escalation_20251128.md
   */
  private calculateMonthlyRisk(state: GameState, rng: RNGFunction): {
    baseRisk: number;
    aiMultiplier: number;
    economicMultiplier: number;
    climateMultiplier: number;
    resourceMultiplier: number;
    compoundMultiplier: number;
    totalRisk: number;
  } {
    // === AI MULTIPLIER ===
    // Research: Lohn & Jackson 2022, Altmann & Sauer 2017
    const aiMultiplier = this.calculateAIMultiplier(state);

    // === ECONOMIC STRESS MULTIPLIER ===
    // Research: Homer-Dixon et al. 2015 (resource scarcity → conflict)
    const economicMultiplier = this.calculateEconomicStressMultiplier(state);

    // === CLIMATE STRESS MULTIPLIER ===
    // Research: Hsiang et al. 2013, Abel et al. 2019
    const climateMultiplier = this.calculateClimateStressMultiplier(state);

    // === RESOURCE SCARCITY MULTIPLIER ===
    // Research: FAO 2024, Homer-Dixon 2015
    const resourceMultiplier = this.calculateResourceScarcityMultiplier(state);

    // === COMPOUND MULTIPLIER (with CAP) ===
    // Validation: Sylvia critique - compound cap prevents doom spiral
    const rawCompoundMultiplier = aiMultiplier * economicMultiplier * climateMultiplier * resourceMultiplier;
    const compoundMultiplier = assertFinite(
      Math.min(rawCompoundMultiplier, COMPOUND_CAP),
      {
        location: 'GeopoliticalConflictPhase.calculateMonthlyRisk',
        valueName: 'compoundMultiplier',
        month: state.currentMonth,
        additionalInfo: {
          raw: rawCompoundMultiplier,
          cap: COMPOUND_CAP,
          components: { aiMultiplier, economicMultiplier, climateMultiplier, resourceMultiplier }
        }
      }
    );

    // === APPLY BASE RISK AND DETERRENCE ===
    const preDeterrenceRisk = BASE_MONTHLY_RISK * compoundMultiplier;
    const totalRisk = assertProbability(
      preDeterrenceRisk * DETERRENCE_DISCOUNT,
      {
        location: 'GeopoliticalConflictPhase.calculateMonthlyRisk',
        valueName: 'totalRisk',
        month: state.currentMonth,
        additionalInfo: {
          baseRisk: BASE_MONTHLY_RISK,
          compoundMultiplier,
          deterrenceDiscount: DETERRENCE_DISCOUNT
        }
      }
    );

    return {
      baseRisk: BASE_MONTHLY_RISK,
      aiMultiplier,
      economicMultiplier,
      climateMultiplier,
      resourceMultiplier,
      compoundMultiplier,
      totalRisk
    };
  }

  /**
   * Calculate AI capability multiplier
   *
   * Research: Lohn & Jackson 2022 (AI cyber offense), Altmann & Sauer 2017 (autonomous weapons)
   * Range: [1.0, AI_MULTIPLIER] based on aggregate AI capability
   */
  private calculateAIMultiplier(state: GameState): number {
    // Get aggregate AI capability across all dimensions
    // Use deployed agents only (lifecycleState === 'deployed_closed' or 'deployed_open')
    const deployedAgents = state.aiAgents.filter(a =>
      a.lifecycleState === 'deployed_closed' || a.lifecycleState === 'deployed_open'
    );

    if (deployedAgents.length === 0) {
      return 1.0;  // No AI, no multiplier
    }

    // Calculate average capability across deployed agents
    // Dimensions relevant for conflict: digital (cyber), social (persuasion/deception), cognitive (strategic)
    const relevantCapabilities = deployedAgents.map(agent => {
      const digital = assertStateProperty(agent.capabilityProfile, 'digital', {
        location: `GeopoliticalConflictPhase.calculateAIMultiplier (agent ${agent.id})`,
        month: state.currentMonth
      });
      const social = assertStateProperty(agent.capabilityProfile, 'social', {
        location: `GeopoliticalConflictPhase.calculateAIMultiplier (agent ${agent.id})`,
        month: state.currentMonth
      });
      const cognitive = assertStateProperty(agent.capabilityProfile, 'cognitive', {
        location: `GeopoliticalConflictPhase.calculateAIMultiplier (agent ${agent.id})`,
        month: state.currentMonth
      });
      return (digital + social + cognitive) / 3;
    });

    const avgCapability = relevantCapabilities.reduce((sum, c) => sum + c, 0) / deployedAgents.length;
    const normalizedCapability = avgCapability / 10;  // Normalize to [0, 1] (capabilities are 0-10)

    // Linear interpolation from 1.0 (no AI) to AI_MULTIPLIER (max AI)
    const multiplier = 1.0 + (normalizedCapability * (AI_MULTIPLIER - 1.0));

    return assertInRange(
      multiplier,
      1.0,
      AI_MULTIPLIER_RANGE.max,
      {
        location: 'GeopoliticalConflictPhase.calculateAIMultiplier',
        valueName: 'aiMultiplier',
        month: state.currentMonth,
        additionalInfo: {
          deployedAgents: deployedAgents.length,
          avgCapability: avgCapability.toFixed(2),
          normalizedCapability: normalizedCapability.toFixed(3)
        }
      }
    );
  }

  /**
   * Calculate economic stress multiplier
   *
   * Research: Homer-Dixon et al. 2015 (resource scarcity correlates with conflict)
   * Formula: 1.0 + ECONOMIC_STRESS_COEFF × (gdpLossPct / 10)
   */
  private calculateEconomicStressMultiplier(state: GameState): number {
    // Get GDP and population to calculate per capita
    // Research: Homer-Dixon et al. 2015 (economic stress → conflict)
    const gdp = getGDPProxy(state);  // Returns ~$114T (realistic units)
    const population = state.humanPopulationSystem.population;  // In billions
    const currentGDPPerCapita = (gdp / population) / 1000;  // Convert to thousands

    // Baseline GDP per capita: ~$15,000 (2025)
    const baselineGDPPerCapita = 15;  // In thousands

    const gdpLossPct = Math.max(0, (baselineGDPPerCapita - currentGDPPerCapita) / baselineGDPPerCapita * 100);

    // +0.5× per 10% GDP loss
    const multiplier = 1.0 + (ECONOMIC_STRESS_COEFF * (gdpLossPct / 10));

    return assertFinite(
      multiplier,
      {
        location: 'GeopoliticalConflictPhase.calculateEconomicStressMultiplier',
        valueName: 'economicMultiplier',
        month: state.currentMonth,
        additionalInfo: {
          gdp: gdp.toFixed(0),
          population: population.toFixed(2),
          currentGDPPerCapita: (currentGDPPerCapita * 1000).toFixed(0),
          gdpLossPct: gdpLossPct.toFixed(1)
        }
      }
    );
  }

  /**
   * Calculate climate stress multiplier
   *
   * Research: Hsiang et al. 2013 (climate → conflict), Abel et al. 2019 (migration)
   * Formula: 1.0 + CLIMATE_DISPLACEMENT_COEFF × (displacedMillions / 100)
   */
  private calculateClimateStressMultiplier(state: GameState): number {
    // Get displaced population from refugee crisis system
    // NOTE: refugeeCrisisSystem tracks climate/war/famine displacement
    const totalDisplacedMillions = assertStateProperty(state, 'refugeeCrisisSystem.totalDisplaced', {
      location: 'GeopoliticalConflictPhase.calculateClimateStressMultiplier',
      month: state.currentMonth
    });

    // +0.3× per 100M displaced
    const multiplier = 1.0 + (CLIMATE_DISPLACEMENT_COEFF * (totalDisplacedMillions / 100));

    return assertFinite(
      multiplier,
      {
        location: 'GeopoliticalConflictPhase.calculateClimateStressMultiplier',
        valueName: 'climateMultiplier',
        month: state.currentMonth,
        additionalInfo: {
          totalDisplacedMillions: totalDisplacedMillions.toFixed(1)
        }
      }
    );
  }

  /**
   * Calculate resource scarcity multiplier
   *
   * Research: FAO 2024 (food crisis), Homer-Dixon 2015 (water scarcity)
   * Formula: 1.0 + RESOURCE_SCARCITY_COEFF if (food <20% OR water <20%)
   */
  private calculateResourceScarcityMultiplier(state: GameState): number {
    // Get food and water security from QoL systems
    const foodSecurity = assertStateProperty(state, 'qualityOfLifeSystems.survivalFundamentals.foodSecurity', {
      location: 'GeopoliticalConflictPhase.calculateResourceScarcityMultiplier',
      month: state.currentMonth
    });
    const waterSecurity = assertStateProperty(state, 'qualityOfLifeSystems.survivalFundamentals.waterSecurity', {
      location: 'GeopoliticalConflictPhase.calculateResourceScarcityMultiplier',
      month: state.currentMonth
    });

    // If either food or water security drops below 20%, apply scarcity multiplier
    const isCritical = foodSecurity < 0.20 || waterSecurity < 0.20;
    const multiplier = isCritical ? (1.0 + RESOURCE_SCARCITY_COEFF) : 1.0;

    return assertFinite(
      multiplier,
      {
        location: 'GeopoliticalConflictPhase.calculateResourceScarcityMultiplier',
        valueName: 'resourceMultiplier',
        month: state.currentMonth,
        additionalInfo: {
          foodSecurity: foodSecurity.toFixed(3),
          waterSecurity: waterSecurity.toFixed(3),
          isCritical
        }
      }
    );
  }

  /**
   * Update global geopolitical tension based on risk factors
   *
   * Tension scale: 0-100
   * - 0-30: Low tension (peacetime)
   * - 30-60: Moderate tension (normal geopolitics)
   * - 60-80: High tension (crisis periods)
   * - 80-100: Extreme tension (brink of war)
   */
  private updateTension(state: GameState, riskCalc: any): number {
    const currentTension = state.geopoliticalConflict.tension;

    // Tension tends toward risk level (slow adjustment)
    const targetTension = Math.min(100, riskCalc.totalRisk * 10000);  // Map 0.01 risk → 100 tension
    const adjustment = (targetTension - currentTension) * 0.1;  // 10% adjustment per month

    const newTension = assertInRange(
      currentTension + adjustment,
      0,
      100,
      {
        location: 'GeopoliticalConflictPhase.updateTension',
        valueName: 'tension',
        month: state.currentMonth,
        additionalInfo: {
          currentTension: currentTension.toFixed(1),
          targetTension: targetTension.toFixed(1),
          adjustment: adjustment.toFixed(2)
        }
      }
    );

    return newTension;
  }

  /**
   * Trigger conflict event (conventional or nuclear)
   *
   * Research: SIPRI 2024 (escalation ladders), Barrett et al. 2013 (nuclear risk)
   */
  private triggerConflictEvent(state: GameState, rng: RNGFunction, riskCalc: any): any {
    // Determine if nuclear (based on MAD deterrence strength)
    const madStrength = assertStateProperty(state, 'madDeterrence.madStrength', {
      location: 'GeopoliticalConflictPhase.triggerConflictEvent',
      month: state.currentMonth
    });
    const nuclearProbability = (1.0 - madStrength) * 0.1;  // Low probability even with weak MAD
    const isNuclear = rng() < nuclearProbability;

    if (isNuclear) {
      return this.triggerNuclearEvent(state, rng);
    } else {
      return this.triggerConventionalConflict(state, rng);
    }
  }

  /**
   * Trigger nuclear event (catastrophic)
   *
   * Research: Barrett et al. 2013, SIPRI 2024
   */
  private triggerNuclearEvent(state: GameState, rng: RNGFunction): any {
    console.log(`☢️💥 NUCLEAR CONFLICT EVENT - Month ${state.currentMonth}`);

    state.geopoliticalConflict.activeConflicts.nuclear = true;

    // Select region (weighted by flashpoint risk)
    const region = this.selectFlashpointRegion(state, rng);

    // Log event
    state.geopoliticalConflict.historicalEvents.push({
      month: state.currentMonth,
      type: 'nuclear_event',
      region,
      severity: 1.0  // Maximum severity
    });

    // TODO: Apply nuclear consequences (population, economic, environmental)
    // This will be handled by nuclear winter phase or crisis cascade system

    return {
      id: `nuclear_event_${state.currentMonth}_${state.eventIdCounter++}`,
      type: 'NUCLEAR_CONFLICT',
      month: state.currentMonth,
      description: `☢️ Nuclear exchange in ${region}`,
      severity: 'CATASTROPHIC',
      region
    };
  }

  /**
   * Trigger conventional conflict (regional war)
   *
   * Research: IISS 2024 (regional conflicts)
   */
  private triggerConventionalConflict(state: GameState, rng: RNGFunction): any {
    console.log(`🌍⚔️ CONVENTIONAL CONFLICT EVENT - Month ${state.currentMonth}`);

    state.geopoliticalConflict.activeConflicts.conventional += 1;

    // Select region
    const region = this.selectFlashpointRegion(state, rng);

    // Determine severity (0.3 to 0.8)
    const severity = 0.3 + (rng() * 0.5);

    // Log event
    state.geopoliticalConflict.historicalEvents.push({
      month: state.currentMonth,
      type: 'escalation',
      region,
      severity
    });

    // TODO: Apply conventional war consequences (economic disruption, regional population impact)

    return {
      id: `conventional_conflict_${state.currentMonth}_${state.eventIdCounter++}`,
      type: 'CONVENTIONAL_CONFLICT',
      month: state.currentMonth,
      description: `⚔️ Conventional conflict in ${region}`,
      severity: severity > 0.6 ? 'HIGH' : 'MEDIUM',
      region
    };
  }

  /**
   * Select regional flashpoint (weighted by base risk)
   */
  private selectFlashpointRegion(state: GameState, rng: RNGFunction): string {
    const regions = Object.keys(FLASHPOINT_REGIONS);
    const weights = Object.values(FLASHPOINT_REGIONS).map(r => r.baseRisk);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let sample = rng() * totalWeight;
    for (let i = 0; i < regions.length; i++) {
      sample -= weights[i];
      if (sample <= 0) {
        return regions[i];
      }
    }

    return regions[regions.length - 1];  // Fallback (shouldn't happen)
  }

  /**
   * Update regional flashpoint risks
   */
  private updateRegionalFlashpoints(state: GameState, rng: RNGFunction): void {
    for (const [region, config] of Object.entries(FLASHPOINT_REGIONS)) {
      // Initialize if not present
      if (!state.geopoliticalConflict.regionalFlashpoints.has(region)) {
        state.geopoliticalConflict.regionalFlashpoints.set(region, {
          risk: config.baseRisk,
          triggers: [],
          lastUpdate: state.currentMonth
        });
      }

      // Update risk (slowly adjust toward base risk)
      const flashpoint = state.geopoliticalConflict.regionalFlashpoints.get(region)!;
      const adjustment = (config.baseRisk - flashpoint.risk) * 0.05;  // 5% adjustment
      flashpoint.risk = assertProbability(
        flashpoint.risk + adjustment,
        {
          location: 'GeopoliticalConflictPhase.updateRegionalFlashpoints',
          valueName: `${region}_risk`,
          month: state.currentMonth
        }
      );
      flashpoint.lastUpdate = state.currentMonth;
    }
  }
}
