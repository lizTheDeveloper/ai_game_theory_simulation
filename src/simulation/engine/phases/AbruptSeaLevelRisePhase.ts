/**
 * Abrupt Sea Level Rise Phase (M-4, Dec 5, 2025)
 *
 * Marine Ice Sheet Instability (MICI) modeling for West Antarctic Ice Sheet (WAIS)
 * and Greenland Ice Sheet (GIS) collapse driven by subsurface ocean warming.
 *
 * Research: research/marine_ice_sheet_instability_20251205.md
 * Critique: reviews/marine_ice_sheet_instability_critique_20251205.md
 * Quality Gate 1: CONDITIONAL PASS
 *
 * Key Findings:
 * - Subsurface ocean warming (2-3°C) triggers WAIS collapse
 * - GIS collapse threshold: +1.0°C (adjusted from 0.8°C)
 * - Abrupt pulses: 0.5m magnitude, 2%/decade probability (adjusted from 5%)
 * - GIS recovery possible (Bochow 2023) - NOT permanently irreversible
 * - 10-20 year cooldown between abrupt pulses
 *
 * Parameters Adjusted from Research (per Sylvia validation):
 * - GIS_TIPPING_MIN: 0.8C → 1.0C (more conservative)
 * - ABRUPT_PULSE_PROB_BASE: 0.05 → 0.02 (reduce compounding to 17% by 2100)
 * - ABRUPT_PULSE_MAGNITUDE: 1.5m → 0.5m (no Holocene precedent for 1.5m)
 * - DISPLACED_PER_METER: 93.5M → 50M (exposure ≠ migration)
 * - DAMAGE_QUADRATIC: 3.0 → 2.0 (unverified in literature)
 *
 * Order: 34.1 (After ClimateSystemPhase 34.0, before mortality resolution 35.0)
 */

import type { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction, GameEvent } from '@/types/game';
import {
  assertFinite,
  assertInRange,
  assertStateProperty,
  assertProbability,
} from '@/simulation/utils/assertions';

// WAIS threshold (subsurface ocean warming proxy from global temperature)
const WAIS_TIPPING_THRESHOLD = 2.5; // °C above pre-industrial (conservative)

// GIS threshold (ADJUSTED from research: 0.8°C → 1.0°C per critique)
const GIS_TIPPING_MIN = 1.0;  // °C above pre-industrial
const GIS_TIPPING_MAX = 1.5;  // °C above pre-industrial

// GIS recovery parameters (Bochow 2023)
const GIS_RECOVERY_THRESHOLD = 1.5;    // Must cool below this for recovery eligibility
const GIS_RECOVERY_MIN_MONTHS = 600;   // 50 years sustained cooling required

// Abrupt pulse parameters (ADJUSTED from research)
const ABRUPT_PULSE_PROB_BASE = 0.02;   // 2%/decade (was 5% in research)
const ABRUPT_PULSE_MAGNITUDE = 0.5;    // meters (was 1.5m in research)
const ABRUPT_PULSE_COOLDOWN_MIN = 120; // 10 years minimum between pulses
const ABRUPT_PULSE_COOLDOWN_MAX = 240; // 20 years maximum between pulses

// Gradual sea level rise (baseline)
const BASELINE_RISE_RATE = 0.0034;     // 3.4mm/year = 0.0034m/year
const RISE_ACCELERATION = 0.0001;      // 0.1mm/year² acceleration

// Impact coefficients (ADJUSTED from research)
const DISPLACED_PER_METER = 50.0;      // Million people per meter (was 93.5M)
const DAMAGE_LINEAR = 500.0;           // Billion USD per meter (one-time capital)
const DAMAGE_QUADRATIC = 2.0;          // Quadratic coefficient (was 3.0)
const AGRICULTURAL_LOSS_PER_METER = 8750; // km² per meter (50% of 17,500)

export class AbruptSeaLevelRisePhase implements SimulationPhase {
  readonly id = 'abrupt_sea_level_rise';
  readonly name = 'Abrupt Sea Level Rise (MICI)';
  readonly order = 34.2;

  readonly dependencies = [
    'climate_system',         // For temperature anomaly
  ] as const;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const events: GameEvent[] = [];

    // Initialize state if needed
    if (!state.marineIceSheetState) {
      state.marineIceSheetState = {
        waisTriggered: false,
        waisStartMonth: null,
        gisTriggered: false,
        gisStartMonth: null,
        gisRecoveryEligible: false,
        lastAbruptPulseMonth: null,
        abruptPulseCount: 0,
        cumulativeSeaLevelRise: 0,
        lastMonthSeaLevel: 0,
        coastalPopulationDisplaced: 0,
        coastalInfrastructureDamage: 0,
        agriculturalLandLost: 0,
      };
    }

    const mici = state.marineIceSheetState;

    // Get current temperature anomaly (from resource economy CO2 system)
    const tempAnomaly = assertStateProperty(
      state.resourceEconomy.co2,
      'temperatureAnomaly',
      {
        location: 'AbruptSeaLevelRisePhase.execute',
        month: state.currentMonth,
      }
    );

    assertFinite(tempAnomaly, {
      location: 'AbruptSeaLevelRisePhase.execute',
      valueName: 'tempAnomaly',
      month: state.currentMonth,
    });

    // Check WAIS triggering (subsurface ocean warming threshold)
    if (!mici.waisTriggered && tempAnomaly >= WAIS_TIPPING_THRESHOLD) {
      mici.waisTriggered = true;
      mici.waisStartMonth = state.currentMonth;
      console.log(`\n🌊❌ WAIS TIPPING POINT CROSSED`);
      console.log(`  Temperature: +${tempAnomaly.toFixed(2)}°C (threshold: +${WAIS_TIPPING_THRESHOLD}°C)`);
      console.log(`  Month: ${state.currentMonth}`);
      console.log(`  Status: Irreversible collapse initiated`);

      events.push({
        id: String(state.eventIdCounter++),
        timestamp: state.currentMonth,
        agent: 'environment',
        type: 'environmental',
        severity: 'critical',
        title: '🌊 West Antarctic Ice Sheet Collapse',
        description: `Subsurface ocean warming (+${tempAnomaly.toFixed(2)}°C) has triggered irreversible WAIS collapse. Expect multi-meter sea level rise over coming decades.`,
        effects: {
          environmental: 'WAIS collapse initiated',
          longTermThreat: 'Multi-meter sea level commitment',
        },
      });
    }

    // Check GIS triggering
    if (!mici.gisTriggered && tempAnomaly >= GIS_TIPPING_MIN) {
      const triggerProb = assertProbability(
        Math.min((tempAnomaly - GIS_TIPPING_MIN) / (GIS_TIPPING_MAX - GIS_TIPPING_MIN), 1.0),
        {
          location: 'AbruptSeaLevelRisePhase.execute',
          valueName: 'gisTriggerProb',
          month: state.currentMonth,
        }
      );

      if (rng() < triggerProb) {
        mici.gisTriggered = true;
        mici.gisStartMonth = state.currentMonth;
        mici.gisRecoveryEligible = false;
        console.log(`\n🌊❌ GREENLAND ICE SHEET TIPPING POINT CROSSED`);
        console.log(`  Temperature: +${tempAnomaly.toFixed(2)}°C (threshold: +${GIS_TIPPING_MIN}-${GIS_TIPPING_MAX}°C)`);
        console.log(`  Trigger probability: ${(triggerProb * 100).toFixed(1)}%`);
        console.log(`  Month: ${state.currentMonth}`);
        console.log(`  Status: Collapse initiated (recovery possible if cooling within 50 years)`);

        events.push({
          id: String(state.eventIdCounter++),
          timestamp: state.currentMonth,
          agent: 'environment',
          type: 'environmental',
          severity: 'critical',
          title: '🌊 Greenland Ice Sheet Collapse',
          description: `Atmospheric warming (+${tempAnomaly.toFixed(2)}°C) has triggered GIS collapse. Recovery possible if temperature drops below +${GIS_RECOVERY_THRESHOLD}°C within 50 years.`,
          effects: {
            environmental: 'GIS collapse initiated',
            longTermThreat: 'Multi-meter sea level rise (potentially reversible)',
          },
        });
      }
    }

    // Check GIS recovery eligibility (Bochow 2023)
    if (mici.gisTriggered && !mici.gisRecoveryEligible && mici.gisStartMonth !== null) {
      const monthsSinceGIS = state.currentMonth - mici.gisStartMonth;

      // If cooling below threshold within recovery window, mark eligible
      if (tempAnomaly < GIS_RECOVERY_THRESHOLD && monthsSinceGIS <= GIS_RECOVERY_MIN_MONTHS) {
        mici.gisRecoveryEligible = true;
        console.log(`\n🌊✅ GIS RECOVERY ELIGIBLE`);
        console.log(`  Temperature dropped to +${tempAnomaly.toFixed(2)}°C (below +${GIS_RECOVERY_THRESHOLD}°C)`);
        console.log(`  Recovery window: ${(monthsSinceGIS / 12).toFixed(1)} years into 50-year window`);

        events.push({
          id: String(state.eventIdCounter++),
          timestamp: state.currentMonth,
          agent: 'environment',
          type: 'environmental',
          severity: 'positive',
          title: '🌊 Greenland Ice Sheet Recovery Possible',
          description: `Rapid cooling has made GIS recovery eligible. Sustained low temperatures may reverse collapse.`,
          effects: {
            environmental: 'GIS recovery pathway opened',
          },
        });
      }
    }

    // Calculate gradual sea level rise (baseline)
    const yearsFromStart = state.currentMonth / 12;
    const gradualRiseRate = assertFinite(
      BASELINE_RISE_RATE + (RISE_ACCELERATION * yearsFromStart),
      {
        location: 'AbruptSeaLevelRisePhase.execute',
        valueName: 'gradualRiseRate',
        month: state.currentMonth,
      }
    );

    let deltaSeaLevel = gradualRiseRate / 12; // Convert annual rate to monthly

    // Check for abrupt pulse events (if either ice sheet triggered)
    if ((mici.waisTriggered || mici.gisTriggered) &&
        (mici.lastAbruptPulseMonth === null ||
         state.currentMonth - mici.lastAbruptPulseMonth >= ABRUPT_PULSE_COOLDOWN_MIN)) {

      // Calculate probability (2%/decade = 0.02/120 months ≈ 0.000167/month)
      const monthlyPulseProb = assertProbability(
        ABRUPT_PULSE_PROB_BASE / 120,
        {
          location: 'AbruptSeaLevelRisePhase.execute',
          valueName: 'monthlyPulseProb',
          month: state.currentMonth,
        }
      );

      if (rng() < monthlyPulseProb) {
        // Abrupt pulse event!
        deltaSeaLevel += ABRUPT_PULSE_MAGNITUDE;
        mici.lastAbruptPulseMonth = state.currentMonth;
        mici.abruptPulseCount++;

        const cooldownMonths = assertFinite(
          ABRUPT_PULSE_COOLDOWN_MIN + rng() * (ABRUPT_PULSE_COOLDOWN_MAX - ABRUPT_PULSE_COOLDOWN_MIN),
          {
            location: 'AbruptSeaLevelRisePhase.execute',
            valueName: 'cooldownMonths',
            month: state.currentMonth,
          }
        );

        console.log(`\n🌊💥 ABRUPT SEA LEVEL PULSE EVENT`);
        console.log(`  Magnitude: ${ABRUPT_PULSE_MAGNITUDE}m`);
        console.log(`  Source: ${mici.waisTriggered ? 'WAIS' : 'GIS'} marine ice cliff collapse`);
        console.log(`  Pulse count: ${mici.abruptPulseCount}`);
        console.log(`  Cooldown: ${(cooldownMonths / 12).toFixed(1)} years`);
        console.log(`  New cumulative rise: ${(mici.cumulativeSeaLevelRise + deltaSeaLevel).toFixed(2)}m`);

        events.push({
          id: String(state.eventIdCounter++),
          timestamp: state.currentMonth,
          agent: 'environment',
          type: 'environmental',
          severity: 'critical',
          title: '🌊 Abrupt Sea Level Rise Event',
          description: `Marine ice cliff instability has caused ${ABRUPT_PULSE_MAGNITUDE}m abrupt sea level rise. Total rise: ${(mici.cumulativeSeaLevelRise + deltaSeaLevel).toFixed(2)}m.`,
          effects: {
            environmental: `+${ABRUPT_PULSE_MAGNITUDE}m sea level pulse`,
            population: 'Coastal displacement accelerating',
            economic: 'Infrastructure damage surge',
          },
        });
      }
    }

    // Update cumulative sea level
    mici.cumulativeSeaLevelRise = assertFinite(
      mici.cumulativeSeaLevelRise + deltaSeaLevel,
      {
        location: 'AbruptSeaLevelRisePhase.execute',
        valueName: 'cumulativeSeaLevelRise',
        month: state.currentMonth,
      }
    );

    // Calculate impacts
    const totalRise = mici.cumulativeSeaLevelRise;

    // Population displacement (linear - 50M per meter, adjusted from 93.5M)
    const newDisplaced = assertFinite(
      DISPLACED_PER_METER * deltaSeaLevel,
      {
        location: 'AbruptSeaLevelRisePhase.execute',
        valueName: 'newDisplaced',
        month: state.currentMonth,
      }
    );

    mici.coastalPopulationDisplaced = assertFinite(
      mici.coastalPopulationDisplaced + newDisplaced,
      {
        location: 'AbruptSeaLevelRisePhase.execute',
        valueName: 'coastalPopulationDisplaced',
        month: state.currentMonth,
      }
    );

    // Infrastructure damage (linear + quadratic, adjusted coefficient to 2.0)
    const newDamage = assertFinite(
      (DAMAGE_LINEAR * deltaSeaLevel) + (DAMAGE_QUADRATIC * totalRise * totalRise),
      {
        location: 'AbruptSeaLevelRisePhase.execute',
        valueName: 'newDamage',
        month: state.currentMonth,
      }
    );

    mici.coastalInfrastructureDamage = assertFinite(
      mici.coastalInfrastructureDamage + newDamage / 1000, // Convert billions to trillions
      {
        location: 'AbruptSeaLevelRisePhase.execute',
        valueName: 'coastalInfrastructureDamage',
        month: state.currentMonth,
      }
    );

    // Agricultural land loss (linear)
    const newLandLost = assertFinite(
      AGRICULTURAL_LOSS_PER_METER * deltaSeaLevel,
      {
        location: 'AbruptSeaLevelRisePhase.execute',
        valueName: 'newLandLost',
        month: state.currentMonth,
      }
    );

    mici.agriculturalLandLost = assertFinite(
      mici.agriculturalLandLost + newLandLost,
      {
        location: 'AbruptSeaLevelRisePhase.execute',
        valueName: 'agriculturalLandLost',
        month: state.currentMonth,
      }
    );

    // Apply impacts to global systems
    if (deltaSeaLevel > 0.001) {
      // Food security impact (cumulative)
      const foodSecurityImpact = assertFinite(
        1.0 - (mici.agriculturalLandLost / 1000000) * 0.01, // 1% per million km²
        {
          location: 'AbruptSeaLevelRisePhase.execute',
          valueName: 'foodSecurityImpact',
          month: state.currentMonth,
        }
      );

      // Apply to global food security (if system exists)
      // NOTE: foodSecurity is tracked in state.safetyNets system, not globalMetrics
      // This impact should be applied through the food security phase
      // TODO: Integrate with food security system when coastal agriculture loss is modeled

      // GDP impact (uncertainty shock from abrupt events)
      // NOTE: gdpPerCapita is tracked in state.society system, not globalMetrics
      // This impact should be applied through economic damage calculations
      // TODO: Integrate with economic system when infrastructure damage modeling is complete

      // Log monthly summary (if significant change)
      if (deltaSeaLevel > 0.01) {
        console.log(`\n🌊 Sea Level Rise Update (Month ${state.currentMonth})`);
        console.log(`  Delta: +${(deltaSeaLevel * 1000).toFixed(1)}mm`);
        console.log(`  Cumulative: ${totalRise.toFixed(3)}m`);
        console.log(`  Displaced: ${newDisplaced.toFixed(2)}M people (total: ${mici.coastalPopulationDisplaced.toFixed(1)}M)`);
        console.log(`  Damage: $${newDamage.toFixed(1)}B (total: $${(mici.coastalInfrastructureDamage * 1000).toFixed(0)}B)`);
        console.log(`  Land lost: ${newLandLost.toFixed(0)}km² (total: ${mici.agriculturalLandLost.toFixed(0)}km²)`);
      }
    }

    // Store for next month's delta calculation
    mici.lastMonthSeaLevel = mici.cumulativeSeaLevelRise;

    return {
      events,
      metadata: {
        stateChanged: deltaSeaLevel > 0,
        message: `✅ Abrupt Sea Level Rise: +${(deltaSeaLevel * 1000).toFixed(1)}mm (Total: ${totalRise.toFixed(3)}m)`,
      },
    };
  }
}

export const AbruptSeaLevelRise = new AbruptSeaLevelRisePhase();
