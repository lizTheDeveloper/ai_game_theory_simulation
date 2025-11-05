/**
 * Climate Impact Cascade Coordinator Phase (TIER 1.7 Integration)
 *
 * Coordinates climate → food security → famine → mortality cascade with:
 * - Research-backed lag times between events (3-24 months)
 * - Seasonal lean season concentration (3-4 month periods)
 * - Infrastructure mismatch multipliers
 * - Fail-loudly assertions for data integrity
 *
 * Research:
 * - /research/climate-mortality-biosphere-multiparadigm-framework_20251028.md
 * - /research/seasonal_famine_mortality_20251026.md
 * - /reviews/famine_mortality_overestimation_critique_20251026.md
 *
 * Order: 34.0 (AFTER environmental feedback 33.5, BEFORE mortality resolution 35.0)
 *
 * Architecture:
 * - Phase-based cascade coordinator (not scattered across multiple phases)
 * - Queue-based lag modeling for delayed impacts
 * - Seasonal pattern modeling for lean season mortality spikes
 * - Integration with Bayesian mortality system for demographic targeting
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import {
  assertFinite,
  assertInRange,
  assertStateProperty,
  assertDefined,
} from '@/simulation/utils/assertions';

/**
 * Climate impact event with delayed effects
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

export class ClimateImpactCascadePhase implements SimulationPhase {
  readonly id = 'climate_impact_cascade';
  readonly name = 'Climate Impact Cascade';
  readonly order = 34.0;

  // Minimum floor for food security to prevent exactly zero
  private static readonly MIN_FOOD_SECURITY = 0.001;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // 1. Calculate current climate impacts with lag effects
    const climateImpacts = this.calculateClimateImpacts(state, rng, context);

    // 2. Apply to food security (immediate + delayed impacts)
    const foodSecurityChanges = this.applyFoodSecurityImpacts(state, climateImpacts, context);

    // 3. Calculate famine risks during lean seasons
    const famineRisks = this.calculateFamineRisks(state, foodSecurityChanges, context);

    // 4. Add mortality risks with demographic targeting
    this.addMortalityRisks(state, famineRisks, context);

    return { events: [] };
  }

  /**
   * Calculate climate impacts with research-backed lag times
   *
   * Research:
   * - Heat waves: Immediate impact on crop yields (within weeks)
   * - Drought: 1-3 month lag for soil moisture depletion
   * - Extreme weather: Immediate for direct damage, 1-6 months for secondary effects
   * - Ecosystem collapse: 6-12 month lag for biodiversity loss → agricultural failure
   */
  private calculateClimateImpacts(
    state: GameState,
    rng: RNGFunction,
    context: PhaseContext
  ): ClimateImpact[] {
    const impacts: ClimateImpact[] = [];

    // === HEAT WAVE IMPACTS (Immediate) ===
    const avgTemp = assertStateProperty(state.environmentalAccumulation, 'climateStability', {
      location: 'ClimateImpactCascade.calculateClimateImpacts',
      month: state.currentMonth
    });

    // Heat waves trigger when climate stability drops below 0.7 (30% degradation)
    // Intensity scales with degradation severity
    if (avgTemp < 0.7) {
      const intensity = assertFinite(1.0 - avgTemp, {
        location: 'ClimateImpactCascade.heatWaveIntensity',
        valueName: 'intensity',
        month: state.currentMonth,
        additionalInfo: { climateStability: avgTemp }
      });

      impacts.push({
        type: 'heat_wave',
        intensity: Math.min(1.0, intensity / 0.3), // Normalize to [0, 1]
        lagMonths: 0,  // Immediate crop impact
        affectedRegions: this.getHeatVulnerableRegions(state),
        month: state.currentMonth
      });
    }

    // === DROUGHT IMPACTS (1-3 month lag) ===
    const climateStability = assertInRange(
      state.environmentalAccumulation.climateStability,
      0, 1,
      {
        location: 'ClimateImpactCascade.calculateClimateImpacts',
        valueName: 'climateStability',
        month: state.currentMonth
      }
    );

    if (climateStability < 0.6) {
      const intensity = assertFinite(1.0 - climateStability, {
        location: 'ClimateImpactCascade.droughtIntensity',
        valueName: 'intensity',
        month: state.currentMonth,
        additionalInfo: { climateStability }
      });

      impacts.push({
        type: 'drought',
        intensity: Math.min(1.0, intensity / 0.4), // Normalize to [0, 1]
        lagMonths: Math.floor(rng() * 2) + 1,  // 1-3 month lag
        affectedRegions: this.getDroughtVulnerableRegions(state),
        month: state.currentMonth
      });
    }

    // === ECOSYSTEM COLLAPSE (6-12 month lag) ===
    // Access biosphereIntegrity from planetaryBoundariesSystem
    const biosphereBoundary = state.planetaryBoundariesSystem?.boundaries?.biosphere_integrity;
    const biosphereIntegrity = assertDefined(
      biosphereBoundary?.currentValue,
      {
        location: 'ClimateImpactCascade.calculateClimateImpacts',
        valueName: 'biosphereIntegrity',
        month: state.currentMonth,
        expectedSource: 'initialization.ts (planetaryBoundariesSystem)'
      }
    );

    // Biosphere integrity below 1.0 (boundary threshold) triggers ecosystem impacts
    if (biosphereIntegrity > 1.0) {  // currentValue > 1.0 means breach (worse than boundary)
      const intensity = assertFinite(biosphereIntegrity - 1.0, {
        location: 'ClimateImpactCascade.ecosystemCollapseIntensity',
        valueName: 'intensity',
        month: state.currentMonth,
        additionalInfo: { biosphereIntegrity }
      });

      impacts.push({
        type: 'ecosystem_collapse',
        intensity: Math.min(1.0, intensity / 0.5), // Normalize to [0, 1]
        lagMonths: Math.floor(rng() * 6) + 6,  // 6-12 month lag
        affectedRegions: ['GLOBAL'],
        month: state.currentMonth
      });
    }

    return impacts;
  }

  /**
   * Apply food security impacts with queue-based lag modeling
   *
   * BUG FIX (Oct 30, 2025): BLOCKER-3 - Reduce food security shock magnitudes
   * ROOT CAUSE: -15% immediate, -25% delayed EVERY MONTH caused food security → 0 within 4-5 months
   * RESEARCH: Sen (1981), FAO (2023) - Famines are distributional, not absolute scarcity
   *   - Modern food production exceeds needs
   *   - Shocks are temporary (harvest failures), not permanent collapse
   * FIX: Reduce to -5% immediate, -8% delayed (3× reduction)
   *
   * Stores delayed impacts in PhaseContext.data for future application
   */
  private applyFoodSecurityImpacts(
    state: GameState,
    impacts: ClimateImpact[],
    context: PhaseContext
  ): Map<string, number> {
    const changes = new Map<string, number>();

    for (const impact of impacts) {
      if (impact.lagMonths === 0) {
        // Immediate impact - REDUCED from -15% to -5%
        for (const region of impact.affectedRegions) {
          const currentChange = changes.get(region) || 0;
          const impactValue = assertFinite(impact.intensity * 0.05, {
            location: 'ClimateImpactCascade.immediateImpact',
            valueName: 'impactValue',
            month: state.currentMonth,
            additionalInfo: { intensity: impact.intensity, region }
          });
          changes.set(region, currentChange - impactValue);  // Up to -5% food security (was -15%)
        }
      } else {
        // Store for delayed application
        this.storeDelayedImpact(context, impact);
      }
    }

    // Apply previously stored delayed impacts
    const delayedImpacts = this.retrieveDelayedImpacts(context, state.currentMonth);
    for (const impact of delayedImpacts) {
      for (const region of impact.affectedRegions) {
        const currentChange = changes.get(region) || 0;
        const impactValue = assertFinite(impact.intensity * 0.08, {
          location: 'ClimateImpactCascade.delayedImpact',
          valueName: 'impactValue',
          month: state.currentMonth,
          additionalInfo: { intensity: impact.intensity, region, lagMonths: impact.lagMonths }
        });
        changes.set(region, currentChange - impactValue);  // Up to -8% delayed effect (was -25%)
      }
    }

    return changes;
  }

  /**
   * Calculate famine risks during lean seasons
   *
   * Research: Seasonal lean season duration 3-4 months per year
   * Seasonal mortality multiplier: 1.5-2× during lean season vs baseline
   */
  private calculateFamineRisks(
    state: GameState,
    foodSecurityChanges: Map<string, number>,
    context: PhaseContext
  ): FamineRisk[] {
    const risks: FamineRisk[] = [];

    // Determine if current month is lean season (varies by region)
    const leanSeasonMap = this.getLeanSeasonStatus(state.currentMonth);

    for (const [region, change] of foodSecurityChanges) {
      // Get current regional food security
      const currentFoodSecurity = this.getRegionalFoodSecurity(state, region);

      // Apply change with floor to prevent negative values
      // Multiple climate impacts can stack, so we must bound before assertion
      const calculatedFoodSecurity = Math.max(
        ClimateImpactCascadePhase.MIN_FOOD_SECURITY,
        currentFoodSecurity + change
      );

      const newFoodSecurity = assertInRange(
        calculatedFoodSecurity,
        0, 1,
        {
          location: 'ClimateImpactCascade.calculateFamineRisks',
          valueName: 'foodSecurity',
          month: state.currentMonth
        }
      );

      // Separate chronic vs acute food insecurity (per research critique)
      // <0.2: True famine, 0.2-0.4: Acute seasonal, 0.4-0.6: Chronic
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

  /**
   * Add mortality risks with demographic targeting
   *
   * Research:
   * - True famine (<0.2): 15% monthly peak mortality
   * - Acute crisis (0.2-0.4): 5% during 3-month lean season, 0.5% recovery
   * - Chronic insecurity (0.4-0.6): 0.2% continuous
   * - Seasonal multiplier: 1.75× (midpoint of 1.5-2× range)
   * - Demographic targeting: Elite (0.2×) → Informal (3.0×)
   */
  private addMortalityRisks(state: GameState, risks: FamineRisk[], context: PhaseContext): void {
    for (const risk of risks) {
      // Calculate base mortality rate by food security level
      let baseRate = 0;

      if (risk.foodSecurityLevel < 0.2) {
        // True famine (< 0.2): Use existing death curve (high mortality)
        baseRate = 0.15;  // 15% monthly peak
      } else if (risk.foodSecurityLevel < 0.4) {
        // Acute food crisis (0.2-0.4): Seasonal spike
        if (risk.isLeanSeason) {
          baseRate = 0.05;  // 5% during 3-month lean season
        } else {
          baseRate = 0.005;  // 0.5% baseline (recovery months)
        }
      } else {
        // Chronic food insecurity (0.4-0.6): Low continuous
        baseRate = 0.002;  // 0.2% monthly
      }

      // Apply seasonal multiplier (1.5-2× during lean season)
      if (risk.isLeanSeason && risk.foodSecurityLevel < 0.4) {
        baseRate = assertFinite(baseRate * 1.75, {
          location: 'ClimateImpactCascade.seasonalMultiplier',
          valueName: 'baseRate',
          month: state.currentMonth,
          additionalInfo: { originalRate: baseRate / 1.75, multiplier: 1.75 }
        });
      }

      // Add mortality risk to Bayesian system
      // Note: Demographic multipliers are applied during mortality resolution,
      // not stored in the risk object itself
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

      // Log cascade event with proper emojis
      if (baseRate > 0.01) {  // Log significant mortality (>1%)
        console.log(
          `🌍☠️ Climate cascade: ${risk.region} food security ${risk.foodSecurityLevel.toFixed(2)}, ` +
          `base mortality ${(baseRate * 100).toFixed(2)}% (lean season: ${risk.isLeanSeason})`
        );
      }
    }
  }

  // ============================
  // HELPER METHODS
  // ============================

  /**
   * Get heat-vulnerable regions
   *
   * Research: Sub-Saharan Africa, South Asia, Middle East most vulnerable to heat stress
   */
  private getHeatVulnerableRegions(state: GameState): string[] {
    return ['Sub-Saharan Africa', 'South Asia', 'Middle East & North Africa'];
  }

  /**
   * Get drought-vulnerable regions
   *
   * Research: Sub-Saharan Africa, Central Asia, Mediterranean most vulnerable to drought
   */
  private getDroughtVulnerableRegions(state: GameState): string[] {
    return ['Sub-Saharan Africa', 'Central Asia', 'Southern Europe'];
  }

  /**
   * Determine lean season status by region and month
   *
   * Research: Lean season varies by region based on agricultural cycles
   * - Sahel: June-August (pre-harvest)
   * - South Asia: September-November (monsoon failure period)
   * - East Africa: December-May (long dry season)
   */
  private getLeanSeasonStatus(currentMonth: number): Map<string, boolean> {
    const leanSeasons = new Map<string, boolean>();

    // Month modulo 12 for yearly cycle (1-12)
    const monthOfYear = ((currentMonth - 1) % 12) + 1;

    // Sahel (West Africa): June-August (months 6-8)
    const isSahelLean = monthOfYear >= 6 && monthOfYear <= 8;
    leanSeasons.set('Sub-Saharan Africa', isSahelLean);
    leanSeasons.set('West Africa', isSahelLean);

    // South Asia: September-November (months 9-11)
    const isSouthAsiaLean = monthOfYear >= 9 && monthOfYear <= 11;
    leanSeasons.set('South Asia', isSouthAsiaLean);

    // East Africa: December-May (months 12, 1-5)
    const isEastAfricaLean = monthOfYear >= 1 && monthOfYear <= 5 || monthOfYear === 12;
    leanSeasons.set('East Africa', isEastAfricaLean);

    return leanSeasons;
  }

  /**
   * Get demographic vulnerability multipliers from Bayesian mortality system
   *
   * Research:
   * - Elite: 0.2× (5× less vulnerable - resources, connections, mobility)
   * - Professional: 0.6× (modest buffer - savings, skills)
   * - Working: 1.0× (baseline vulnerability)
   * - Precariat: 2.0× (2× more vulnerable - unstable work, no savings)
   * - Informal: 3.0× (3× more vulnerable - no safety nets, day-to-day survival)
   */
  private getDemographicMultipliers(state: GameState, region: string): Map<string, number> {
    return new Map([
      ['Elite', 0.2],       // 5× less vulnerable
      ['Professional', 0.6],
      ['Working', 1.0],     // Baseline
      ['Precariat', 2.0],   // 2× more vulnerable
      ['Informal', 3.0]     // 3× more vulnerable
    ]);
  }

  /**
   * Get regional food security level
   *
   * Currently uses global food security as baseline
   * TODO: Implement proper regional food security tracking
   */
  private getRegionalFoodSecurity(state: GameState, region: string): number {
    // Use quality of life food security as proxy
    const foodSecurity = assertStateProperty(
      state.qualityOfLifeSystems.survivalFundamentals,
      'foodSecurity',
      {
        location: 'ClimateImpactCascade.getRegionalFoodSecurity',
        month: state.currentMonth
      }
    );

    return assertInRange(foodSecurity, 0, 1, {
      location: 'ClimateImpactCascade.getRegionalFoodSecurity',
      valueName: 'foodSecurity',
      month: state.currentMonth
    });
  }

  // ============================
  // CONTEXT STORAGE (LAG EFFECTS)
  // ============================

  /**
   * Store delayed impact for future application
   */
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

  /**
   * Retrieve delayed impacts ready to be applied this month
   */
  private retrieveDelayedImpacts(context: PhaseContext, currentMonth: number): ClimateImpact[] {
    if (!context.data.has('delayedClimateImpacts')) {
      return [];
    }

    const allImpacts = context.data.get('delayedClimateImpacts') as DelayedClimateImpact[];
    const applicable = allImpacts.filter(i => i.applyAtMonth === currentMonth);

    // Remove applied impacts, keep future ones
    const remaining = allImpacts.filter(i => i.applyAtMonth > currentMonth);
    context.data.set('delayedClimateImpacts', remaining);

    return applicable;
  }
}
