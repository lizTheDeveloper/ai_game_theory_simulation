/**
 * Ocean Acidification Cascade Phase (RD-2, Nov 28, 2025)
 *
 * Extends existing ocean acidification system with regional cascades.
 * Models compound stress (warming × acidification ≈30%), regional variation,
 * and transformation pathways (40% floor, not uniform collapse).
 *
 * Research: IPCC AR6 (2023), Jiang et al. (2023), Nature (2025), Newcastle (2024)
 * Evidence: 🟢 STRONG (pH), 🟡 MODERATE (coral - high species variation)
 *
 * @see research/ocean_acidification_cascades_REVISED_20251128.md
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import {
  assertFinite,
  assertStateProperty,
  assertProbability,
  assertInRange
} from '@/simulation/utils/assertions';

export class OceanAcidificationCascadePhase implements SimulationPhase {
  readonly id = 'ocean_acidification_cascade';
  readonly name = 'Ocean Acidification Cascade';
  readonly order = 21.8; // After planetary_boundaries (21.0), famine (21.6)

  readonly dependencies = ['planetary_boundaries'] as const;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    if (!rng || typeof rng !== 'function') {
      throw new Error(`❌ CRITICAL: RNG required for deterministic simulation in ${this.id} (Month ${state.currentMonth})`);
    }

    const events: GameEvent[] = [];
    const ocean = state.oceanAcidificationSystem;

    // Calculate compound stress (warming × acidification)
    this.calculateCompoundStress(state, ocean, events);

    // Update regional coral health with species sensitivity + resilience
    this.updateRegionalCoralHealth(state, ocean, rng, events);

    // Update fisheries productivity (power-law: health^1.5)
    this.updateFisheriesProductivity(state, ocean, events);

    // Track economic + population impacts
    this.updateImpacts(state, ocean, events);

    // Check threshold crossings
    this.checkThresholds(state, ocean, events);

    // Update history
    ocean.pHHistory.push(ocean.pH);
    ocean.coralHealthHistory.push(ocean.regionalCoralHealth.globalAverage);
    if (ocean.pHHistory.length > 120) ocean.pHHistory = ocean.pHHistory.slice(-120);
    if (ocean.coralHealthHistory.length > 120) ocean.coralHealthHistory = ocean.coralHealthHistory.slice(-120);

    return { events };
  }

  private calculateCompoundStress(state: GameState, ocean: any, events: GameEvent[]): void {
    const climate = state.planetaryBoundariesSystem.boundaries.climate_change;
    const tempAnomaly = assertFinite(climate.currentValue, {
      location: 'OceanAcidificationCascadePhase.calculateCompoundStress',
      valueName: 'climate.currentValue',
      month: state.currentMonth
    }) * 1.5; // Boundary value → °C

    const warmingContribution = Math.min(1.0, tempAnomaly / 3.0); // 3°C = max
    const pHDecline = 8.1 - ocean.pH;
    const acidificationContribution = Math.min(1.0, pHDecline / 0.4); // 0.4 = max decline

    ocean.warmingContribution = assertProbability(warmingContribution, {
      location: 'OceanAcidificationCascadePhase.calculateCompoundStress',
      valueName: 'warmingContribution',
      month: state.currentMonth
    });

    ocean.acidificationContribution = assertProbability(acidificationContribution, {
      location: 'OceanAcidificationCascadePhase.calculateCompoundStress',
      valueName: 'acidificationContribution',
      month: state.currentMonth
    });

    // Anthony et al. (2008): ~30% amplification
    ocean.compoundStressMultiplier = assertInRange(
      1.0 + (warmingContribution * acidificationContribution * 0.30),
      1.0,
      1.5,
      {
        location: 'OceanAcidificationCascadePhase.calculateCompoundStress',
        valueName: 'compoundStressMultiplier',
        month: state.currentMonth
      }
    );
  }

  private updateRegionalCoralHealth(state: GameState, ocean: any, rng: RNGFunction, events: GameEvent[]): void {
    const pH = ocean.pH;
    const omega = ocean.aragoniteSaturation;
    const compoundStress = ocean.compoundStressMultiplier;

    // Base stress from pH/Ω thresholds
    let baseStress = 0;
    if (pH < 7.7 || omega < 2.0) baseStress = 1.0;
    else if (pH < 7.8 || omega < 2.5) baseStress = 0.7;
    else if (pH < 7.9 || omega < 3.0) baseStress = 0.4;
    else baseStress = 0.1;

    const effectiveStress = assertProbability(Math.min(1.0, baseStress * compoundStress), {
      location: 'OceanAcidificationCascadePhase.updateRegionalCoralHealth',
      valueName: 'effectiveStress',
      month: state.currentMonth
    });

    // Track stress duration
    if (effectiveStress > 0.4 && ocean.monthsSinceStressOnset === 0) {
      ocean.monthsSinceStressOnset = 1;
    } else if (effectiveStress > 0.4) {
      ocean.monthsSinceStressOnset++;
    } else {
      ocean.monthsSinceStressOnset = 0;
    }

    // Recovery potential declines with prolonged stress (20 years = 240 months)
    ocean.recoveryPotential = assertProbability(Math.max(0.1, 1.0 - (ocean.monthsSinceStressOnset / 240)), {
      location: 'OceanAcidificationCascadePhase.updateRegionalCoralHealth',
      valueName: 'recoveryPotential',
      month: state.currentMonth
    });

    // Update each region
    const regions = ['seAsia', 'pacificIslands', 'caribbean', 'indianOcean'] as const;
    for (const region of regions) {
      const currentHealth = assertProbability(ocean.regionalCoralHealth[region], {
        location: `OceanAcidificationCascadePhase.updateRegionalCoralHealth.${region}`,
        valueName: 'currentHealth',
        month: state.currentMonth
      });

      const sensitivity = assertInRange(ocean.regionalSpeciesSensitivity[region], 0.3, 2.0, {
        location: `OceanAcidificationCascadePhase.updateRegionalCoralHealth.${region}`,
        valueName: 'sensitivity',
        month: state.currentMonth
      });

      const resilience = assertProbability(ocean.regionalResilience[region], {
        location: `OceanAcidificationCascadePhase.updateRegionalCoralHealth.${region}`,
        valueName: 'resilience',
        month: state.currentMonth
      });

      let monthlyChange = 0;
      if (effectiveStress > 0.3) {
        // Declining: stress × sensitivity × (1 - resilience) × 1%/month
        monthlyChange = -effectiveStress * sensitivity * (1 - resilience) * 0.01;
      } else if (currentHealth < 0.9) {
        // Recovering: resilience × recoveryPotential × 0.5%/month
        monthlyChange = resilience * ocean.recoveryPotential * 0.005;
      }

      // Apply 40% adaptation floor
      const newHealth = assertProbability(
        Math.max(ocean.adaptationFloor, Math.min(1.0, currentHealth + monthlyChange)),
        {
          location: `OceanAcidificationCascadePhase.updateRegionalCoralHealth.${region}`,
          valueName: 'newHealth',
          month: state.currentMonth
        }
      );

      ocean.regionalCoralHealth[region] = newHealth;
    }

    // Weighted global average (SE Asia 40%, Pacific 25%, Caribbean 20%, Indian 15%)
    const globalAverage = assertProbability(
      ocean.regionalCoralHealth.seAsia * 0.40 +
      ocean.regionalCoralHealth.pacificIslands * 0.25 +
      ocean.regionalCoralHealth.caribbean * 0.20 +
      ocean.regionalCoralHealth.indianOcean * 0.15,
      {
        location: 'OceanAcidificationCascadePhase.updateRegionalCoralHealth',
        valueName: 'globalAverage',
        month: state.currentMonth
      }
    );

    ocean.regionalCoralHealth.globalAverage = globalAverage;
    ocean.coralReefHealth = globalAverage * 100; // Sync legacy field (0-100 scale)
  }

  private updateFisheriesProductivity(state: GameState, ocean: any, events: GameEvent[]): void {
    const coralHealth = ocean.regionalCoralHealth.globalAverage;
    const fisheriesYield = assertProbability(Math.pow(coralHealth, 1.5), {
      location: 'OceanAcidificationCascadePhase.updateFisheriesProductivity',
      valueName: 'fisheriesYield',
      month: state.currentMonth
    });
    ocean.coastalFisheriesYield = fisheriesYield;
  }

  private updateImpacts(state: GameState, ocean: any, events: GameEvent[]): void {
    const coralHealth = ocean.regionalCoralHealth.globalAverage;
    const fisheriesYield = ocean.coastalFisheriesYield;

    // Economic value at risk: $300B baseline × coral health
    ocean.economicValueAtRisk = assertFinite(300 * coralHealth, {
      location: 'OceanAcidificationCascadePhase.updateImpacts',
      valueName: 'economicValueAtRisk',
      month: state.currentMonth
    });

    // Population dependent: 415M baseline × fisheries yield
    ocean.populationDependent = assertFinite(415 * fisheriesYield, {
      location: 'OceanAcidificationCascadePhase.updateImpacts',
      valueName: 'populationDependent',
      month: state.currentMonth
    });
  }

  private checkThresholds(state: GameState, ocean: any, events: GameEvent[]): void {
    const pH = ocean.pH;
    const omega = ocean.aragoniteSaturation;
    const globalHealth = ocean.regionalCoralHealth.globalAverage;

    if ((pH < 7.9 || omega < 3.0) && !ocean.thresholdsCrossed.moderateStress) {
      ocean.thresholdsCrossed.moderateStress = true;
      events.push({
        id: `ocean_moderate_stress_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'high',
        title: '🌊 Ocean Acidification: Moderate Stress Threshold',
        description: `pH ${pH.toFixed(2)}, Ω ${omega.toFixed(1)}. Coral health ${(globalHealth * 100).toFixed(0)}%. ${ocean.populationDependent.toFixed(0)}M at risk.`,
        effects: { pH, omega, globalHealth, population: ocean.populationDependent },
        agent: 'system'
      });
    }

    if ((pH < 7.8 || omega < 2.5) && !ocean.thresholdsCrossed.severeStress) {
      ocean.thresholdsCrossed.severeStress = true;
      events.push({
        id: `ocean_severe_stress_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'critical',
        title: '🌊🚨 Ocean Acidification: Severe Stress',
        description: `pH ${pH.toFixed(2)}, Ω ${omega.toFixed(1)}. Pteropod shell dissolution. Fisheries ${(ocean.coastalFisheriesYield * 100).toFixed(0)}%. Economic risk $${ocean.economicValueAtRisk.toFixed(0)}B/year.`,
        effects: { pH, omega, fisheriesYield: ocean.coastalFisheriesYield, economicRisk: ocean.economicValueAtRisk },
        agent: 'system'
      });
    }

    if ((pH < 7.7 || omega < 2.0) && !ocean.thresholdsCrossed.ecosystemCollapse) {
      ocean.thresholdsCrossed.ecosystemCollapse = true;
      events.push({
        id: `ocean_collapse_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'critical',
        title: '🌊💀 Ocean Acidification: Ecosystem Collapse',
        description: `pH ${pH.toFixed(2)}, Ω ${omega.toFixed(1)}. Coral growth halted, net dissolution. ${ocean.populationDependent.toFixed(0)}M losing protein source. Food insecurity crisis.`,
        effects: { pH, omega, globalHealth, population: ocean.populationDependent, economicRisk: ocean.economicValueAtRisk },
        agent: 'system'
      });
    }
  }
}
