/**
 * Bayesian Mortality System Implementation
 *
 * Research-backed mortality model using Bayesian risk accumulation.
 * Death is NOT "X% of population dies" (frequentist).
 * Death IS "each person's probability of death increases by X%" (Bayesian).
 *
 * Multi-causal deaths compound: weak from starvation + catches cold = much higher risk.
 *
 * Research: /research/mortality_caps_historical_data_20251027.md
 * - Malnutrition × Disease = 2.63× multiplier (HIGH confidence)
 * - Monthly caps: 2.8% extreme famine, 1.7% nuclear winter
 * - Socioeconomic differentials: 2-3× normal, compress to 1.1-1.5× in extreme crises
 *
 * Date: October 27, 2025
 */

import { GameState } from '@/types/game';
import { HumanPopulationSystem } from '@/types/population';
import {
  MortalityRisk,
  MortalityResult,
  MortalityCapConfig,
  DemographicSegment,
  DeathSegment,
  CauseAttribution,
} from '@/types/bayesianMortality';
import { RNGFunction } from '@/types/game';

/**
 * Default demographic segments (research-backed)
 *
 * Based on wealth distribution and vulnerability research:
 * - Elite (5%): Top wealth/income, best access to resources
 * - Professional (20%): Stable employment, good resources
 * - Working (50%): Moderate resources, vulnerable to shocks
 * - Precariat (20%): Unstable employment, high vulnerability
 * - Informal (5%): Subsistence, highest vulnerability
 *
 * Vulnerability multipliers from research:
 * - Irish Famine (1845-52): 2-3× higher mortality in poor vs wealthy
 * - Holodomor (1932-33): Party elite ~0.2×, peasants ~2.0×
 * - COVID-19 (2020-22): 2.63× mortality with malnutrition
 */
export function getDefaultDemographics(): DemographicSegment[] {
  return [
    {
      name: 'Elite',
      fraction: 0.05,
      baselineDeathRate: 0.006, // 0.6% annual (better healthcare)
      vulnerability: {
        famine: 0.2,      // Can afford imported food
        disease: 0.5,     // Best healthcare access
        disaster: 0.3,    // Better shelter, can evacuate
        war: 0.6,         // Can flee, less exposed
        pollution: 0.4,   // Live in cleaner areas
        ecosystem: 0.5,   // Less dependent on local ecosystems
      },
    },
    {
      name: 'Professional',
      fraction: 0.20,
      baselineDeathRate: 0.007, // 0.7% annual
      vulnerability: {
        famine: 0.6,
        disease: 0.7,
        disaster: 0.6,
        war: 0.8,
        pollution: 0.6,
        ecosystem: 0.7,
      },
    },
    {
      name: 'Working',
      fraction: 0.50,
      baselineDeathRate: 0.008, // 0.8% annual (global average)
      vulnerability: {
        famine: 1.0,      // Baseline risk
        disease: 1.0,
        disaster: 1.0,
        war: 1.0,
        pollution: 1.0,
        ecosystem: 1.0,
      },
    },
    {
      name: 'Precariat',
      fraction: 0.20,
      baselineDeathRate: 0.010, // 1.0% annual (worse access)
      vulnerability: {
        famine: 2.0,      // Food insecurity
        disease: 1.5,     // Limited healthcare
        disaster: 1.8,    // Unsafe housing
        war: 1.4,         // Cannot flee
        pollution: 1.6,   // Live in polluted areas
        ecosystem: 1.5,   // Dependent on local resources
      },
    },
    {
      name: 'Informal',
      fraction: 0.05,
      baselineDeathRate: 0.012, // 1.2% annual (subsistence)
      vulnerability: {
        famine: 2.5,      // Extreme food insecurity
        disease: 2.0,     // No healthcare access
        disaster: 2.2,    // Most vulnerable housing
        war: 1.8,         // Trapped, highly exposed
        pollution: 2.0,   // Highest environmental exposure
        ecosystem: 2.0,   // Directly dependent on ecosystems
      },
    },
  ];
}

/**
 * Default mortality caps (research-backed)
 */
export function getDefaultMortalityCaps(): MortalityCapConfig {
  return {
    // Monthly cap: Based on Holodomor (2.8% monthly peak)
    monthlyMaxMortalityRate: 0.028,

    // Instant cap: Based on Hiroshima (20% instant), modern nukes (30-50%)
    instantMaxMortalityRate: 0.50,

    // Crisis compression: At >10% monthly mortality, differentials compress
    extremeCrisisThreshold: 0.10,
    compressionFactor: 0.5, // Compress halfway toward equality
  };
}

/**
 * Add mortality risk to population
 *
 * Accumulates risk throughout the month. Risks are resolved at month end via resolveMortality().
 *
 * @param pop - Population system
 * @param risk - Mortality risk to add
 */
export function addMortalityRisk(
  pop: HumanPopulationSystem & { mortalityRisks?: MortalityRisk[] },
  risk: MortalityRisk
): void {
  // Initialize mortalityRisks array if not present
  if (!pop.mortalityRisks) {
    pop.mortalityRisks = [];
  }

  // Validate risk
  if (risk.baseRisk < 0 || risk.baseRisk > 1) {
    console.warn(`⚠️ Invalid mortality risk: ${risk.baseRisk} (should be 0-1)`);
    return;
  }

  // Add risk to accumulator
  pop.mortalityRisks.push(risk);

  // Optional: Log high-risk events
  if (risk.baseRisk > 0.01) {
    console.log(
      `  ⚠️ High mortality risk added: ${(risk.baseRisk * 100).toFixed(2)}% base (${risk.proximate} from ${risk.root})`
    );
  }
}

/**
 * Resolve accumulated mortality risks using Bayesian compounding
 *
 * Calculates individual death probabilities, applies demographic vulnerabilities,
 * enforces mortality caps, and updates population.
 *
 * Formula: P(death) = 1 - ∏(1 - p_i × vulnerability_i)
 *
 * @param state - Game state
 * @param rng - Random number generator
 * @returns Mortality result with deaths applied
 */
export function resolveMortality(
  state: GameState,
  rng: RNGFunction
): MortalityResult {
  const pop = state.humanPopulationSystem as HumanPopulationSystem & {
    mortalityRisks?: MortalityRisk[];
  };

  // Initialize mortalityRisks if not present
  if (!pop.mortalityRisks) {
    pop.mortalityRisks = [];
  }

  const risks = pop.mortalityRisks;
  const demographics = getDefaultDemographics();
  const caps = getDefaultMortalityCaps();

  // No risks = no deaths
  if (risks.length === 0) {
    return {
      totalDeaths: 0,
      deaths: [],
      remainingPopulation: pop.population,
      cappedByMonthlyLimit: false,
      cappedByInstantLimit: false,
      summary: {
        avgDeathProbability: 0,
        compoundedRisks: 0,
        peakSegmentMortality: {
          segment: 'Working',
          mortality: 0,
        },
      },
    };
  }

  // Separate instant vs gradual risks
  const instantRisks = risks.filter((r) => r.scope === 'GLOBAL' || !r.scope);
  const gradualRisks = risks.filter((r) => r.scope !== 'GLOBAL');

  // Calculate death probabilities for each demographic segment
  const deathSegments: DeathSegment[] = [];
  let totalDeaths = 0;
  let cappedByMonthly = false;
  let cappedByInstant = false;

  for (const demo of demographics) {
    // Calculate compounded probability: P(death) = 1 - ∏(1 - p_i × v_i)
    let survivalProb = 1.0;

    for (const risk of risks) {
      const vulnerability = demo.vulnerability[risk.type];
      const adjustedRisk = risk.baseRisk * vulnerability;
      survivalProb *= 1 - adjustedRisk;
    }

    const deathProb = 1 - survivalProb;

    // Check for extreme crisis compression (>10% monthly mortality)
    let finalDeathProb = deathProb;
    if (deathProb > caps.extremeCrisisThreshold) {
      // Compress differentials toward 1.0× (equality)
      const baselineVulnerability = 1.0; // Working class baseline
      const currentVulnerabilityEffect = deathProb / (risks.reduce((sum, r) => sum + r.baseRisk, 0) || 1);
      const compressedVulnerability =
        baselineVulnerability +
        (currentVulnerabilityEffect - baselineVulnerability) * (1 - caps.compressionFactor);

      finalDeathProb = deathProb * (compressedVulnerability / currentVulnerabilityEffect);
    }

    // Apply mortality caps
    if (finalDeathProb > caps.monthlyMaxMortalityRate) {
      finalDeathProb = caps.monthlyMaxMortalityRate;
      cappedByMonthly = true;
    }

    if (instantRisks.length > 0 && finalDeathProb > caps.instantMaxMortalityRate) {
      finalDeathProb = caps.instantMaxMortalityRate;
      cappedByInstant = true;
    }

    // Calculate deaths for this segment
    const segmentPopulation = pop.population * demo.fraction;
    const segmentDeaths = segmentPopulation * finalDeathProb;

    // Multi-causal attribution (distribute deaths across causes by risk weight)
    const totalRisk = risks.reduce((sum, r) => sum + r.baseRisk * demo.vulnerability[r.type], 0);
    const causes: CauseAttribution[] = risks.map((risk) => {
      const riskWeight = (risk.baseRisk * demo.vulnerability[risk.type]) / totalRisk;
      return {
        proximate: risk.proximate,
        root: risk.root,
        contributionFraction: riskWeight,
        confidence: risk.confidence,
      };
    });

    deathSegments.push({
      demographic: demo.name,
      count: segmentDeaths,
      probability: finalDeathProb,
      causes,
    });

    totalDeaths += segmentDeaths;
  }

  // Apply deaths to population
  // NOTE: pop.population is in BILLIONS, totalDeaths is in MILLIONS
  pop.population = Math.max(0, pop.population - (totalDeaths / 1000));
  pop.cumulativeCrisisDeaths += totalDeaths;
  pop.monthlyExcessDeaths = totalDeaths;

  // Update death tracking by category and root cause
  for (const segment of deathSegments) {
    for (const cause of segment.causes) {
      const attributedDeaths = segment.count * cause.contributionFraction;

      // Update proximate cause (stored in millions)
      pop.deathsByCategory[cause.proximate] = (pop.deathsByCategory[cause.proximate] || 0) + attributedDeaths;

      // Update root cause (stored in BILLIONS for legacy compatibility)
      pop.deathsByRootCause[cause.root] = (pop.deathsByRootCause[cause.root] || 0) + (attributedDeaths / 1000);

      // Update confidence distribution (stored in BILLIONS for legacy compatibility)
      pop.deathsByRootCause.confidenceDistribution[cause.confidence] =
        (pop.deathsByRootCause.confidenceDistribution[cause.confidence] || 0) + (attributedDeaths / 1000);
    }
  }

  // Track compound attribution if multiple risks (stored in BILLIONS for legacy compatibility)
  if (risks.length > 1) {
    pop.deathsByRootCause.compound = (pop.deathsByRootCause.compound || 0) + (totalDeaths / 1000);
  }

  // Calculate summary statistics
  const avgDeathProbability =
    deathSegments.reduce((sum, s) => sum + s.probability * (demographics.find((d) => d.name === s.demographic)?.fraction || 0), 0);

  const peakSegment = deathSegments.reduce((max, s) =>
    s.probability > max.probability ? s : max
  );

  // Clear risks after resolution
  pop.mortalityRisks = [];

  // Log mortality event
  if (totalDeaths > 0.001) {
    console.log(`\n📊 Monthly Mortality Resolved:`);
    console.log(`  Total deaths: ${totalDeaths.toFixed(1)}M (${(avgDeathProbability * 100).toFixed(2)}% avg)`);
    console.log(`  Remaining population: ${(pop.population / 1000).toFixed(3)}B`);
    console.log(`  Peak segment: ${peakSegment.demographic} (${(peakSegment.probability * 100).toFixed(2)}%)`);
    if (cappedByMonthly) console.log(`  ⚠️ Monthly cap reached (${caps.monthlyMaxMortalityRate * 100}%)`);
    if (cappedByInstant) console.log(`  ⚠️ Instant cap reached (${caps.instantMaxMortalityRate * 100}%)`);
  }

  return {
    totalDeaths,
    deaths: deathSegments,
    remainingPopulation: pop.population,
    cappedByMonthlyLimit: cappedByMonthly,
    cappedByInstantLimit: cappedByInstant,
    summary: {
      avgDeathProbability,
      compoundedRisks: risks.length,
      peakSegmentMortality: {
        segment: peakSegment.demographic,
        mortality: peakSegment.probability,
      },
    },
  };
}

/**
 * Clear accumulated mortality risks
 *
 * Useful for debugging or handling edge cases where risks should be discarded.
 */
export function clearMortalityRisks(
  pop: HumanPopulationSystem & { mortalityRisks?: MortalityRisk[] }
): void {
  pop.mortalityRisks = [];
}

/**
 * Get current accumulated mortality risks
 *
 * Useful for debugging or displaying pending risks to user.
 */
export function getMortalityRisks(
  pop: HumanPopulationSystem & { mortalityRisks?: MortalityRisk[] }
): MortalityRisk[] {
  return pop.mortalityRisks || [];
}
