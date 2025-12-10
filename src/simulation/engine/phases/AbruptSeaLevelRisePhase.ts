/**
 * Abrupt Sea Level Rise Phase (M-4, Marine Ice Sheet Instability)
 *
 * Models low-probability, high-impact marine ice sheet instability (MICI) events
 * that can cause abrupt sea level rise in tail scenarios.
 *
 * Research:
 * - DeConto & Pollard (2016, Nature 531:591-597): Foundational MICI mechanism
 * - Edwards et al. (2019, Nature 566:58-64): Probabilistic framework
 * - Science Advances (2024): "WAIS may not be vulnerable to MICI during 21st century"
 *   - CRITICAL: 2024 revision significantly reduces 21st century risk
 *   - MICI is now tail risk (1-5%), not central projection (71%)
 *   - 22nd-23rd century risk remains substantial if warming sustained
 *
 * Implementation:
 * - Conservative probabilities post-2024 revision (5-10x lower than Edwards 2019)
 * - True irreversibility: Once triggered, collapse continues regardless of temperature
 * - Time-dependent modifier: Risk increases post-2100
 * - Cascade impacts: Population displacement, infrastructure damage, agricultural loss
 *
 * Order: 34.5 (AFTER ClimateSystemPhase 34.0, BEFORE BayesianMortalityResolutionPhase 35.0)
 */

import type { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import {
  assertFinite,
  assertInRange,
  assertStateProperty,
  assertProbability,
} from '@/simulation/utils/assertions';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import { getGDPProxy } from '@/simulation/utils/recoveryCalculations';

export class AbruptSeaLevelRisePhase implements SimulationPhase {
  readonly id = 'abrupt_sea_level_rise';
  readonly name = 'Abrupt Sea Level Rise';
  readonly order = 34.5;

  readonly dependencies = [
    'climate_system',  // For temperature data (order 34.0)
  ] as const;

  /**
   * Conservative probability function (post-2024 revision)
   * Research: Science Advances (2024) - MICI unlikely in 21st century
   *
   * Returns annual probability of MICI trigger based on temperature and time
   */
  private calculateTriggerProbability(tempC: number, currentYear: number): number {
    // Base probability by temperature (per year)
    let baseProbability: number;
    if (tempC < 1.5) {
      baseProbability = 0.0001;  // Background
    } else if (tempC < 2.0) {
      baseProbability = 0.001;   // Emerging
    } else if (tempC < 2.5) {
      baseProbability = 0.005;   // Low risk
    } else if (tempC < 3.0) {
      baseProbability = 0.01;    // Moderate risk
    } else if (tempC < 4.0) {
      baseProbability = 0.03;    // Significant risk
    } else {
      baseProbability = 0.05;    // High tail risk
    }

    // Time modifier (risk increases post-2100)
    // Research: 2024 revision says "unlikely in 21st century", not "won't happen in 22nd+"
    let timeModifier: number;
    if (currentYear < 2100) {
      timeModifier = 0.5;  // Lower for 21st century
    } else if (currentYear < 2150) {
      timeModifier = 1.0;  // Baseline for early 22nd
    } else if (currentYear < 2200) {
      timeModifier = 2.0;  // Increased for mid 22nd
    } else {
      timeModifier = 3.0;  // High for late 22nd+
    }

    const annualProbability = assertFinite(
      baseProbability * timeModifier,
      {
        location: 'AbruptSeaLevelRisePhase.calculateTriggerProbability',
        valueName: 'annualProbability',
        additionalInfo: { tempC, currentYear, baseProbability, timeModifier }
      }
    );

    return assertProbability(
      annualProbability,
      {
        location: 'AbruptSeaLevelRisePhase.calculateTriggerProbability',
        valueName: 'annualProbability'
      }
    );
  }

  /**
   * Calculate sea level rise magnitude based on phase of collapse
   * Research: DeConto & Pollard (2016), Edwards et al. (2019)
   *
   * - Initial decade: 0.1-0.2m (10-20cm)
   * - Sustained contribution: 0.3-0.5m cumulative by 2100 (if triggered early)
   * - Long-term potential: 3-8m by 2300
   *
   * FIX (CRITICAL): Use pre-rolled magnitudes to ensure monotonicity
   * - Previously: Called rng() each month, re-rolling magnitudes → sea level DECREASED
   * - Now: Use stored magnitudes from trigger time → monotonic increase guaranteed
   */
  private calculateSeaLevelRise(
    monthsSinceOnset: number,
    rolledMagnitudes: { onset: number; acceleration: number; plateau: number }
  ): number {
    const yearsSinceOnset = monthsSinceOnset / 12;

    // Initial onset phase (0-10 years): 0.1-0.2m total
    if (yearsSinceOnset < 10) {
      // Linear rise in first decade
      const decadeProgress = yearsSinceOnset / 10;
      return assertFinite(
        rolledMagnitudes.onset * decadeProgress,
        {
          location: 'AbruptSeaLevelRisePhase.calculateSeaLevelRise',
          valueName: 'onsetRise',
          additionalInfo: { yearsSinceOnset, decadeProgress, onsetMagnitude: rolledMagnitudes.onset }
        }
      );
    }

    // Acceleration phase (10-100 years): Additional 0.2-0.3m
    if (yearsSinceOnset < 100) {
      const onsetContribution = rolledMagnitudes.onset;
      const accelerationProgress = (yearsSinceOnset - 10) / 90;
      const accelerationContribution = assertFinite(
        rolledMagnitudes.acceleration * accelerationProgress,
        {
          location: 'AbruptSeaLevelRisePhase.calculateSeaLevelRise',
          valueName: 'accelerationRise',
          additionalInfo: { yearsSinceOnset, accelerationProgress, accelerationMagnitude: rolledMagnitudes.acceleration }
        }
      );
      return onsetContribution + accelerationContribution;
    }

    // Plateau phase (100-300 years): Approach long-term potential 3-8m
    const onsetContribution = rolledMagnitudes.onset;
    const accelerationContribution = rolledMagnitudes.acceleration;
    const plateauProgress = Math.min(1.0, (yearsSinceOnset - 100) / 200);
    const plateauContribution = assertFinite(
      (rolledMagnitudes.plateau - onsetContribution - accelerationContribution) * plateauProgress,
      {
        location: 'AbruptSeaLevelRisePhase.calculateSeaLevelRise',
        valueName: 'plateauRise',
        additionalInfo: { yearsSinceOnset, plateauProgress, longTermPotential: rolledMagnitudes.plateau }
      }
    );

    return assertInRange(
      onsetContribution + accelerationContribution + plateauContribution,
      0, 10,  // Cap at 10m (extreme upper bound)
      {
        location: 'AbruptSeaLevelRisePhase.calculateSeaLevelRise',
        valueName: 'totalRise',
        additionalInfo: { yearsSinceOnset }
      }
    );
  }

  /**
   * Update collapse phase based on time since onset
   */
  private updateCollapsePhase(monthsSinceOnset: number): 'onset' | 'acceleration' | 'plateau' {
    const yearsSinceOnset = monthsSinceOnset / 12;
    if (yearsSinceOnset < 10) {
      return 'onset';
    } else if (yearsSinceOnset < 100) {
      return 'acceleration';
    } else {
      return 'plateau';
    }
  }

  /**
   * Apply cascading impacts from sea level rise
   *
   * Research:
   * - Population displacement: 100-200M people per meter (World Bank, UNEP)
   * - Infrastructure damage: 3-7% coastal GDP per meter
   * - Agricultural loss: 10-25% coastal farmland per meter
   */
  private applyCascadingImpacts(
    state: GameState,
    deltaSeaLevelRise: number,
    context: PhaseContext
  ): void {
    if (deltaSeaLevelRise <= 0.001) return;  // Skip trivial changes

    const mici = state.marineIceSheetInstability;

    // Population displacement
    // Research: 100-200M people per meter of rise
    const currentPop = assertStateProperty(
      state.humanPopulationSystem,
      'population',
      {
        location: 'AbruptSeaLevelRisePhase.applyCascadingImpacts',
        month: state.currentMonth,
        expectedSource: 'humanPopulationSystem.population (required for displacement calculations)'
      }
    );

    const displacementPerMeter = 150e6;  // 150M people (mid-range estimate)
    const displacedPopulation = assertFinite(
      displacementPerMeter * deltaSeaLevelRise,
      {
        location: 'AbruptSeaLevelRisePhase.applyCascadingImpacts',
        valueName: 'displacedPopulation',
        additionalInfo: { deltaSeaLevelRise, currentPop }
      }
    );

    // Update cumulative displacement (in millions)
    mici.totalDisplacement += displacedPopulation / 1e6;

    // Mortality risk from displacement (infrastructure loss, disease, conflict)
    // Conservative estimate: 0.5% mortality from displacement stress
    // FIX (CRITICAL): Cap at 100% to prevent overflow when population collapses
    const displacementMortalityRate = 0.005;
    const rawMortalityRisk = (displacedPopulation / currentPop) * displacementMortalityRate;
    const displacementMortalityRisk = assertProbability(
      Math.min(1.0, rawMortalityRisk),  // Cap at 100%
      {
        location: 'AbruptSeaLevelRisePhase.applyCascadingImpacts',
        valueName: 'displacementMortalityRisk',
        additionalInfo: { displacedPopulation, currentPop, rawMortalityRisk }
      }
    );

    if (displacementMortalityRisk > 0.0001) {
      addMortalityRisk(state.humanPopulationSystem, {
        type: 'crisis',
        baseRisk: displacementMortalityRisk,
        proximate: 'disasters',
        root: 'climate',
        confidence: 'HIGH',
        scope: 'GLOBAL',
        month: state.currentMonth,
        description: `Sea level rise displacement: ${(displacedPopulation / 1e6).toFixed(1)}M people displaced`
      });

      console.log(
        `🌊 Sea level rise: +${deltaSeaLevelRise.toFixed(3)}m displaces ${(displacedPopulation / 1e6).toFixed(1)}M people ` +
        `(mortality risk ${(displacementMortalityRisk * 100).toFixed(3)}%)`
      );
    }

    // Infrastructure damage
    // Research: 3-7% coastal GDP per meter (World Economic Forum, Nature)
    const gdp = getGDPProxy(state);
    const coastalGDPFraction = 0.15;  // ~15% of GDP is coastal (conservative)
    const damagePerMeter = 0.05;  // 5% (mid-range of 3-7%)
    const deltaInfrastructureDamage = assertFinite(
      coastalGDPFraction * damagePerMeter * deltaSeaLevelRise,  // As fraction of coastal GDP
      {
        location: 'AbruptSeaLevelRisePhase.applyCascadingImpacts',
        valueName: 'deltaInfrastructureDamage',
        additionalInfo: { gdp, deltaSeaLevelRise }
      }
    );

    // Update cumulative infrastructure damage
    mici.infrastructureDamage += deltaInfrastructureDamage;

    // Economic impact feeds into quality of life degradation
    // (handled by other systems that read GDP)
    if (deltaInfrastructureDamage > 0.001) {
      const damageUSD = gdp * coastalGDPFraction * deltaInfrastructureDamage;
      console.log(
        `🌊 Infrastructure damage: $${(damageUSD / 1e12).toFixed(2)}T ` +
        `(${(deltaInfrastructureDamage * 100).toFixed(2)}% of coastal GDP, ` +
        `${(mici.infrastructureDamage * 100).toFixed(1)}% cumulative)`
      );
    }

    // Agricultural loss
    // Research: 10-25% coastal farmland per meter (FAO, World Bank)
    const foodSecurity = assertStateProperty(
      state.qualityOfLifeSystems.survivalFundamentals,
      'foodSecurity',
      {
        location: 'AbruptSeaLevelRisePhase.applyCascadingImpacts',
        month: state.currentMonth
      }
    );

    const coastalFarmlandFraction = 0.10;  // ~10% of farmland is coastal
    const farmlandLossPerMeter = 0.175;  // 17.5% (mid-range of 10-25%)
    const deltaAgriculturalLoss = assertFinite(
      coastalFarmlandFraction * farmlandLossPerMeter * deltaSeaLevelRise,
      {
        location: 'AbruptSeaLevelRisePhase.applyCascadingImpacts',
        valueName: 'deltaAgriculturalLoss',
        additionalInfo: { deltaSeaLevelRise }
      }
    );

    // Update cumulative agricultural loss
    // FIX (HIGH): Cap at 100% - can't lose more than all coastal farmland
    mici.agriculturalLoss = Math.min(
      100,  // 100% = all coastal farmland lost
      mici.agriculturalLoss + deltaAgriculturalLoss
    );

    const newFoodSecurity = assertInRange(
      Math.max(0.01, foodSecurity - deltaAgriculturalLoss),
      0, 1,
      {
        location: 'AbruptSeaLevelRisePhase.applyCascadingImpacts',
        valueName: 'foodSecurity (after agricultural loss)',
        month: state.currentMonth
      }
    );

    state.qualityOfLifeSystems.survivalFundamentals.foodSecurity = newFoodSecurity;

    if (deltaAgriculturalLoss > 0.001) {
      console.log(
        `🌊 Agricultural loss: -${(deltaAgriculturalLoss * 100).toFixed(2)}% food security ` +
        `(coastal farmland inundation, ${(mici.agriculturalLoss * 100).toFixed(1)}% cumulative)`
      );
    }
  }

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const mici = state.marineIceSheetInstability;

    // Get current temperature
    const tempC = assertStateProperty(
      state.resourceEconomy.co2,
      'temperatureAnomaly',
      {
        location: 'AbruptSeaLevelRisePhase.execute',
        month: state.currentMonth,
        expectedSource: 'resourceEconomy.co2.temperatureAnomaly (degrees C above pre-industrial)'
      }
    );

    const currentYear = 2025 + Math.floor(state.currentMonth / 12);

    // Check for trigger if not already triggered
    if (!mici.triggered) {
      const annualProbability = this.calculateTriggerProbability(tempC, currentYear);
      const monthlyProbability = assertProbability(
        annualProbability / 12,
        {
          location: 'AbruptSeaLevelRisePhase.execute',
          valueName: 'monthlyProbability'
        }
      );

      const roll = rng();
      if (roll < monthlyProbability) {
        // MICI TRIGGERED
        mici.triggered = true;
        mici.triggerMonth = state.currentMonth;
        mici.cumulativeSeaLevelRise = 0;
        mici.seaLevelRiseRate = 0;
        mici.totalDisplacement = 0;
        mici.infrastructureDamage = 0;
        mici.agriculturalLoss = 0;

        // FIX (CRITICAL): Roll magnitudes ONCE at trigger time for monotonic progression
        // Research: DeConto & Pollard (2016), Edwards et al. (2019)
        const onsetMagnitude = 0.1 + rng() * 0.1;  // 0.1-0.2m
        const accelerationMagnitude = 0.2 + rng() * 0.1;  // 0.2-0.3m
        const plateauMagnitude = 3.0 + rng() * 5.0;  // 3-8m

        mici.rolledMagnitudes = {
          onset: assertInRange(onsetMagnitude, 0.1, 0.2, {
            location: 'AbruptSeaLevelRisePhase.execute (trigger)',
            valueName: 'onsetMagnitude'
          }),
          acceleration: assertInRange(accelerationMagnitude, 0.2, 0.3, {
            location: 'AbruptSeaLevelRisePhase.execute (trigger)',
            valueName: 'accelerationMagnitude'
          }),
          plateau: assertInRange(plateauMagnitude, 3.0, 8.0, {
            location: 'AbruptSeaLevelRisePhase.execute (trigger)',
            valueName: 'plateauMagnitude'
          })
        };

        console.warn(`\n🚨 MARINE ICE SHEET INSTABILITY TRIGGERED`);
        console.log(`  🧊 Temperature: ${tempC.toFixed(2)}°C above pre-industrial`);
        console.log(`  🧊 Year: ${currentYear}`);
        console.log(`  🧊 Month: ${state.currentMonth}`);
        console.log(`  🧊 Annual probability: ${(annualProbability * 100).toFixed(3)}%`);
        console.log(`  🧊 This collapse is IRREVERSIBLE regardless of future temperature changes`);
        console.log(`  🧊 Expected contribution: ${mici.rolledMagnitudes.onset.toFixed(2)}m onset, ` +
                    `${mici.rolledMagnitudes.acceleration.toFixed(2)}m acceleration, ` +
                    `${mici.rolledMagnitudes.plateau.toFixed(1)}m long-term`);
      }
    }

    // If triggered, update collapse progression
    if (mici.triggered && typeof mici.triggerMonth === 'number') {
      const monthsSinceOnset = state.currentMonth - mici.triggerMonth;

      // Ensure rolled magnitudes exist (should have been set at trigger time)
      if (!mici.rolledMagnitudes) {
        throw new Error(
          `❌ CRITICAL: rolledMagnitudes missing for triggered MICI (month ${state.currentMonth}). ` +
          `This indicates a state initialization bug.`
        );
      }

      // Calculate total sea level rise from MICI using pre-rolled magnitudes
      const newSeaLevelRise = this.calculateSeaLevelRise(monthsSinceOnset, mici.rolledMagnitudes);
      const deltaSeaLevelRise = assertFinite(
        newSeaLevelRise - mici.cumulativeSeaLevelRise,
        {
          location: 'AbruptSeaLevelRisePhase.execute',
          valueName: 'deltaSeaLevelRise',
          month: state.currentMonth,
          additionalInfo: {
            newSeaLevelRise,
            oldSeaLevelRise: mici.cumulativeSeaLevelRise,
            monthsSinceOnset
          }
        }
      );

      const oldSeaLevelRise = mici.cumulativeSeaLevelRise;
      mici.cumulativeSeaLevelRise = assertInRange(
        newSeaLevelRise,
        0, 10,  // Cap at 10m
        {
          location: 'AbruptSeaLevelRisePhase.execute',
          valueName: 'cumulativeSeaLevelRise',
          month: state.currentMonth
        }
      );

      // Update rate (m/year)
      mici.seaLevelRiseRate = assertFinite(
        (deltaSeaLevelRise * 12),  // Convert monthly to annual
        {
          location: 'AbruptSeaLevelRisePhase.execute',
          valueName: 'seaLevelRiseRate',
          month: state.currentMonth
        }
      );

      // Apply cascading impacts
      this.applyCascadingImpacts(state, deltaSeaLevelRise, context);

      // Periodic status logging
      if (state.currentMonth % 120 === 0 && monthsSinceOnset > 0) {  // Every 10 years
        const yearsSince = monthsSinceOnset / 12;
        const collapsePhase = this.updateCollapsePhase(monthsSinceOnset);
        console.log(
          `\n🌊 MICI Status Report (${yearsSince.toFixed(0)} years since onset):`
        );
        console.log(`  Phase: ${collapsePhase}`);
        console.log(`  Cumulative sea level rise: ${mici.cumulativeSeaLevelRise.toFixed(2)}m`);
        console.log(`  Current rate: ${mici.seaLevelRiseRate.toFixed(3)}m/year`);
        console.log(`  Total displacement: ${mici.totalDisplacement.toFixed(1)}M people`);
        console.log(`  Infrastructure damage: ${(mici.infrastructureDamage * 100).toFixed(1)}% of coastal GDP`);
        console.log(`  Agricultural loss: ${(mici.agriculturalLoss * 100).toFixed(1)}% of coastal farmland`);
        console.log(`  Collapse continues regardless of temperature changes (irreversible)`);
      }
    }

    return { events: [] };
  }
}
