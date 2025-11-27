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
import { getEraMortalityMultiplier } from '@/types/config';
import {
  Billions,
  Millions,
  toBillions,
  assertBillionsToMillions,
  billionsToMillions,
} from '@/simulation/utils/populationUnits';
import {
  assertFinite,
  assertPopulationMillion,
  assertMortalityRate,
  assertInRange,
} from '@/simulation/utils/assertions';

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
      baselineDeathRate: 0.0048, // 0.48% annual → 0.6× global average (Chetty 2016)
      vulnerability: {
        famine: 0.2,      // Can afford imported food
        disease: 0.5,     // Best healthcare access
        disaster: 0.3,    // Better shelter, can evacuate
        war: 0.6,         // Can flee, less exposed
        pollution: 0.4,   // Live in cleaner areas
        ecosystem: 0.5,   // Less dependent on local ecosystems
        cascade: 0.4,     // FIX (Oct 28, 2025): Add cascade vulnerability - elites have resources to weather cascading crises
        other: 0.6,       // FIX (Nov 24, 2025): Adjusted from 0.5 → 0.6 (Chetty 2016)
      },
    },
    {
      name: 'Professional',
      fraction: 0.20,
      baselineDeathRate: 0.0056, // 0.56% annual → 0.7× global average (interpolated)
      vulnerability: {
        famine: 0.6,
        disease: 0.7,
        disaster: 0.6,
        war: 0.8,
        pollution: 0.6,
        ecosystem: 0.7,
        cascade: 0.7,     // FIX (Oct 28, 2025): Add cascade vulnerability - professionals moderately affected by cascading crises
        other: 0.7,       // FIX (Oct 28, 2025): Add other vulnerability
      },
    },
    {
      name: 'Working',
      fraction: 0.50,
      baselineDeathRate: 0.008, // 0.8% annual (global average baseline)
      vulnerability: {
        famine: 1.0,      // Baseline risk
        disease: 1.0,
        disaster: 1.0,
        war: 1.0,
        pollution: 1.0,
        ecosystem: 1.0,
        cascade: 1.0,     // FIX (Oct 28, 2025): Add cascade vulnerability - baseline
        other: 1.0,       // FIX (Oct 28, 2025): Add other vulnerability - baseline
      },
    },
    {
      name: 'Precariat',
      fraction: 0.20,
      baselineDeathRate: 0.0104, // 1.04% annual → 1.3× global average (interpolated)
      vulnerability: {
        famine: 2.0,      // Food insecurity
        disease: 1.5,     // Limited healthcare
        disaster: 1.8,    // Unsafe housing
        war: 1.4,         // Cannot flee
        pollution: 1.6,   // Live in polluted areas
        ecosystem: 1.5,   // Dependent on local resources
        cascade: 1.8,     // FIX (Oct 28, 2025): Add cascade vulnerability - precariat highly vulnerable to cascading crises
        other: 1.6,       // FIX (Oct 28, 2025): Add other vulnerability
      },
    },
    {
      name: 'Informal',
      fraction: 0.05,
      baselineDeathRate: 0.0128, // 1.28% annual → 1.6× global average (Kahn 2022: 1.76×, conservative 1.6×)
      vulnerability: {
        famine: 2.5,      // Extreme food insecurity
        disease: 2.0,     // No healthcare access
        disaster: 2.2,    // Most vulnerable housing
        war: 1.8,         // Trapped, highly exposed
        pollution: 2.0,   // Highest environmental exposure
        ecosystem: 2.0,   // Directly dependent on ecosystems
        cascade: 2.2,     // FIX (Oct 28, 2025): Add cascade vulnerability - informal workers most vulnerable to cascading crises
        other: 1.6,       // FIX (Nov 24, 2025): Adjusted from 2.0 → 1.6× (Kahn 2022, conservative)
      },
    },
  ];
}

/**
 * Minimum total risk threshold for differential compression
 *
 * Below 1% monthly mortality, socioeconomic differentials are negligible
 * (all demographics face similar low risk, no compression needed).
 *
 * Research basis:
 * - Liu et al. (2021): COVID-19 showed 2.6× differential at 0.5% monthly mortality
 * - Below 0.1% monthly, differentials statistically insignificant
 * - Compression only meaningful when base risks sum to >1%
 *
 * Oct 30, 2025: Extracted from inline magic number per senior dev review
 */
export const MIN_RISK_FOR_COMPRESSION = 0.01;

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

  // DIAGNOSTIC LOGGING (Nov 6, 2025 - Week 1 CRITICAL Phase 2)
  // Track mortality risk contributions to identify excessive base mortality sources
  // Target: Identify why base mortality = 5% monthly (hits Holodomor cap despite stabilizers)
  if (risk.baseRisk > 0.001) {  // 0.1% threshold to reduce noise
    const cumulativeRisk = pop.mortalityRisks.reduce((sum, r) => sum + r.baseRisk, 0);
    console.log(`💀 MORTALITY RISK: ${risk.description || `${risk.proximate} from ${risk.root}`}`);
    console.log(`  Base risk added: ${risk.baseRisk.toFixed(4)} (${(risk.baseRisk * 100).toFixed(2)}%)`);
    console.log(`  Source: ${risk.proximate} (root: ${risk.root})`);
    console.log(`  Month: ${risk.month}`);
    console.log(`  Cumulative risk this month: ${cumulativeRisk.toFixed(4)} (${(cumulativeRisk * 100).toFixed(2)}%)`);
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

  // HINDCAST FIX (Nov 24, 2025): Apply era-specific mortality multiplier
  // Historical eras had lower baseline mortality due to different resilience profiles.
  // This scales ALL mortality risks (not just baseline deaths) to match historical data.
  // Research: UN World Population Prospects 2024, Chetty et al. 2016 (JAMA)
  const eraMortalityMultiplier = getEraMortalityMultiplier(state.currentYear);

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

  // DIAGNOSTIC LOGGING (Nov 6, 2025 - Week 1 CRITICAL Phase 2)
  // Summarize mortality risk sources BEFORE resolution
  // This shows what's driving base mortality (target: identify 5% monthly sources)
  const totalBaseRisk = risks.reduce((sum, r) => sum + r.baseRisk, 0);

  // NaN AUDIT (Nov 7, 2025): Validate totalBaseRisk before division
  assertFinite(totalBaseRisk, {
    location: 'resolveMortality.diagnosticLogging',
    valueName: 'totalBaseRisk',
    month: state.currentMonth,
    additionalInfo: { riskCount: risks.length }
  });

  const risksBySource = new Map<string, { risk: number; count: number }>();
  const risksByProximate = new Map<string, number>();
  const risksByRoot = new Map<string, number>();

  for (const risk of risks) {
    // Group by source (proximate + root)
    const sourceKey = `${risk.proximate} (${risk.root})`;
    const existing = risksBySource.get(sourceKey) || { risk: 0, count: 0 };
    risksBySource.set(sourceKey, { risk: existing.risk + risk.baseRisk, count: existing.count + 1 });

    // Group by proximate cause
    risksByProximate.set(risk.proximate, (risksByProximate.get(risk.proximate) || 0) + risk.baseRisk);

    // Group by root cause
    risksByRoot.set(risk.root, (risksByRoot.get(risk.root) || 0) + risk.baseRisk);
  }

  // Log summary (only if total risk > 0.1% to reduce noise)
  // NaN AUDIT (Nov 7, 2025): Division by totalBaseRisk is safe here
  // because we've validated it's finite above
  if (totalBaseRisk > 0.001) {
    console.log(`\n💀💀💀 MORTALITY RISK SUMMARY (Month ${state.currentMonth}) 💀💀💀`);
    console.log(`  Total base risk: ${totalBaseRisk.toFixed(4)} (${(totalBaseRisk * 100).toFixed(2)}%)`);
    console.log(`  Risk events: ${risks.length}`);
    // HINDCAST FIX (Nov 24, 2025): Log era mortality multiplier when active
    if (eraMortalityMultiplier < 0.99) {
      console.log(`  Era mortality multiplier: ${eraMortalityMultiplier.toFixed(2)} (year ${state.currentYear})`);
      console.log(`  Effective risk: ${(totalBaseRisk * eraMortalityMultiplier * 100).toFixed(2)}%`);
    }
    console.log(`\n  📊 By Proximate Cause:`);
    Array.from(risksByProximate.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([cause, risk]) => {
        const pct = (risk / totalBaseRisk) * 100;
        console.log(`    ${cause}: ${risk.toFixed(4)} (${pct.toFixed(1)}% of total)`);
      });

    console.log(`\n  🔍 By Root Cause:`);
    Array.from(risksByRoot.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([cause, risk]) => {
        const pct = (risk / totalBaseRisk) * 100;
        console.log(`    ${cause}: ${risk.toFixed(4)} (${pct.toFixed(1)}% of total)`);
      });

    console.log(`\n  🎯 Top 5 Sources (proximate + root):`);
    Array.from(risksBySource.entries())
      .sort((a, b) => b[1].risk - a[1].risk)
      .slice(0, 5)
      .forEach(([source, data]) => {
        const pct = (data.risk / totalBaseRisk) * 100;
        console.log(`    ${source}: ${data.risk.toFixed(4)} (${pct.toFixed(1)}%, ${data.count} events)`);
      });
    console.log(``);
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

      // FIX (Oct 28, 2025): Detect NaN in risk baseRisk
      if (isNaN(risk.baseRisk)) {
        throw new Error(`risk.baseRisk is NaN: type=${risk.type}, proximate=${risk.proximate}, root=${risk.root}, description="${risk.description}", month=${risk.month}`);
      }
      if (isNaN(vulnerability) || vulnerability === undefined) {
        console.warn(`⚠️ No vulnerability for risk type '${risk.type}' in demographic '${demo.name}'`);
        console.warn(`   Available types: ${Object.keys(demo.vulnerability).join(', ')}`);
        throw new Error(`vulnerability is NaN: demographic=${demo.name}, riskType=${risk.type}, vulnerability=${vulnerability}`);
      }

      // CRITICAL FIX (Nov 27, 2025): ERA multiplier for CRISIS mortality only, not baseline
      // ERA represents emergency response capability (early warning, surge capacity, disaster coordination)
      // Baseline demographic mortality improvement (9.3→7.5/1000 CDR 1990-2025) already captured in historical CDR
      // Only apply ERA to crisis-related mortality (famine, heatwave, conflict, pollution)
      //
      // Research: config.ts line 322 - "Applied to crisis mortality calculations, not baseline population dynamics"
      const isBaselineMortality = (risk.root === 'demographic' || risk.type === 'other');
      const eraAdjustment = isBaselineMortality ? 1.0 : eraMortalityMultiplier;
      const adjustedRisk = risk.baseRisk * vulnerability * eraAdjustment;

      if (isNaN(adjustedRisk)) {
        throw new Error(`adjustedRisk is NaN: baseRisk=${risk.baseRisk}, vulnerability=${vulnerability}, eraMortalityMultiplier=${eraMortalityMultiplier}, demographic=${demo.name}`);
      }

      survivalProb *= 1 - adjustedRisk;

      if (isNaN(survivalProb)) {
        throw new Error(`survivalProb became NaN: demographic=${demo.name}, adjustedRisk=${adjustedRisk}, riskType=${risk.type}`);
      }
    }

    let deathProb = 1 - survivalProb;

    if (isNaN(deathProb)) {
      throw new Error(`deathProb is NaN: demographic=${demo.name}, survivalProb=${survivalProb}, riskCount=${risks.length}`);
    }

    // Apply mortality stabilizers (Oct 30, 2025 - Issues #4, #5, #6)
    // Stabilizers reduce mortality through aid, adaptation, migration, emergency response
    // Applied AFTER compounding but BEFORE caps
    if (pop.regionalPopulations && pop.regionalPopulations.length > 0) {
      // Calculate population-weighted average stabilizer reduction across all regions
      let totalPop = 0;
      let weightedReduction = 0;

      for (const region of pop.regionalPopulations) {
        if (region.mortalityStabilizers && region.population > 0) {
          const reduction = region.mortalityStabilizers.combinedReduction;
          weightedReduction += reduction * region.population;
          totalPop += region.population;
        }
      }

      if (totalPop > 0) {
        const avgReduction = weightedReduction / totalPop;

        // DIAGNOSTIC LOGGING: Show stabilizer application
        const deathProbBefore = deathProb;

        // Apply reduction: deathProb × (1 - reduction)
        // Example: 50% death prob, 40% reduction → 50% × 0.6 = 30% final
        deathProb *= (1 - avgReduction);

        // DIAGNOSTIC: Log stabilizer effect for this demographic (Phase 2.3 - Nov 14, 2025)
        if (deathProbBefore > 0.001) {
          console.log(`🛡️ Stabilizers: ${demo.name} ${(deathProbBefore*100).toFixed(3)}% → ${(deathProb*100).toFixed(3)}% (${(avgReduction*100).toFixed(1)}% reduction)`);
        }
      }
    }

    // BUG FIX (Oct 30, 2025): Cap deathProb at 1.0 BEFORE compression calculation
    // BLOCKER-1: When deathProb=0.98 and sum(baseRisks)=0.05, division produces 19.6 (1960%!)
    // Research: Monthly mortality cannot exceed 100% (physically impossible)
    deathProb = Math.min(1.0, deathProb);

    // Check for extreme crisis compression (>10% monthly mortality)
    let finalDeathProb = deathProb;
    if (deathProb > caps.extremeCrisisThreshold) {
      // Compress differentials toward 1.0× (equality)
      const baselineVulnerability = 1.0; // Working class baseline
      const sumBaseRisks = risks.reduce((sum, r) => sum + r.baseRisk, 0);

      // FIX (Oct 30, 2025): Protect against division by zero or very small denominators
      // If sum of base risks is below threshold, use deathProb directly (compression invalid)
      if (sumBaseRisks < MIN_RISK_FOR_COMPRESSION) {
        // Skip compression - not meaningful with tiny base risks
        finalDeathProb = deathProb;
      } else {
        const currentVulnerabilityEffect = deathProb / sumBaseRisks;

        // NaN AUDIT (Nov 7, 2025): Validate currentVulnerabilityEffect before division at line 422
        assertFinite(currentVulnerabilityEffect, {
          location: 'resolveMortality.compressionCalculation',
          valueName: 'currentVulnerabilityEffect',
          month: state.currentMonth,
          additionalInfo: {
            demographic: demo.name,
            deathProb,
            sumBaseRisks,
            riskCount: risks.length
          }
        });

        // ASSERTION: currentVulnerabilityEffect should never exceed ~3× (informal worker max)
        // If it does, something is very wrong with the risk accumulation
        if (currentVulnerabilityEffect > 5.0) {
          throw new Error(
            `❌ BLOCKER-1: currentVulnerabilityEffect=${currentVulnerabilityEffect.toFixed(2)} exceeds 5.0×! ` +
            `This indicates risk accumulation bug. ` +
            `deathProb=${deathProb.toFixed(4)}, sumBaseRisks=${sumBaseRisks.toFixed(4)}, ` +
            `demographic=${demo.name}, month=${state.currentMonth}, riskCount=${risks.length}`
          );
        }

        const compressedVulnerability =
          baselineVulnerability +
          (currentVulnerabilityEffect - baselineVulnerability) * (1 - caps.compressionFactor);

        // NaN AUDIT (Nov 7, 2025): Division by currentVulnerabilityEffect is safe here
        // because we've validated it's finite above
        finalDeathProb = deathProb * (compressedVulnerability / currentVulnerabilityEffect);
      }
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

    // WEEK 3: Validate mortality rate with assertMortalityRate
    // (Replaces ad-hoc >1.0 check with proper assertion)
    assertMortalityRate(finalDeathProb, {
      location: 'resolveMortality.demographicLoop',
      valueName: 'finalDeathProb',
      month: state.currentMonth,
      population: pop.population,
    });

    // Calculate deaths for this segment
    // FIX (Oct 29, 2025): Use type-safe population units (billions)
    // pop.population is in BILLIONS, segmentPopulation is also BILLIONS
    const segmentPopulationBillions: Billions = toBillions(pop.population * demo.fraction);

    // WEEK 3: Replace defensive NaN checks with assertions
    assertFinite(segmentPopulationBillions, {
      location: 'resolveMortality.segmentPopulation',
      valueName: 'segmentPopulationBillions',
      month: state.currentMonth,
      additionalInfo: {
        totalPopulation: pop.population,
        demographicFraction: demo.fraction,
        demographic: demo.name,
      }
    });

    // segmentDeaths is also in BILLIONS (deaths calculated from billions of people)
    const segmentDeathsBillions: Billions = toBillions(segmentPopulationBillions * finalDeathProb);

    assertFinite(segmentDeathsBillions, {
      location: 'resolveMortality.segmentDeaths',
      valueName: 'segmentDeathsBillions',
      month: state.currentMonth,
      additionalInfo: {
        segmentPopulation: segmentPopulationBillions,
        mortality: finalDeathProb,
        demographic: demo.name,
      }
    });

    // Multi-causal attribution (distribute deaths across causes by risk weight)
    const totalRisk = risks.reduce((sum, r) => sum + r.baseRisk * demo.vulnerability[r.type], 0);

    // NaN AUDIT (Nov 7, 2025): Validate totalRisk before division
    assertFinite(totalRisk, {
      location: 'resolveMortality.multiCausalAttribution',
      valueName: 'totalRisk',
      month: state.currentMonth,
      additionalInfo: {
        demographic: demo.name,
        riskCount: risks.length
      }
    });

    const causes: CauseAttribution[] = risks.map((risk) => {
      // NaN AUDIT (Nov 7, 2025): Division by totalRisk is safe here because validated above
      // If totalRisk is 0 (no risks), this loop won't execute anyway (risks is empty)
      const riskWeight = totalRisk > 0 ? (risk.baseRisk * demo.vulnerability[risk.type]) / totalRisk : 0;
      return {
        proximate: risk.proximate,
        root: risk.root,
        contributionFraction: riskWeight,
        confidence: risk.confidence,
      };
    });

    deathSegments.push({
      demographic: demo.name,
      count: segmentDeathsBillions,  // FIX (Oct 29, 2025): Type-safe billions
      probability: finalDeathProb,
      causes,
    });

    totalDeaths += segmentDeathsBillions;  // FIX (Oct 29, 2025): Type-safe billions
  }

  // Apply deaths to REGIONAL populations (not global)
  // FIX (Oct 28, 2025): Apply deaths to regions, then HumanPopulationPhase aggregates → global
  // This prevents aggregation from overwriting our mortality

  // WEEK 3: Replace defensive NaN check with proper assertion
  assertFinite(totalDeaths, {
    location: 'resolveMortality.totalDeaths',
    valueName: 'totalDeaths',
    month: state.currentMonth,
    additionalInfo: {
      segmentCount: deathSegments.length,
      segmentDeaths: deathSegments.map(s => s.count),
    }
  });

  // Apply deaths proportionally to each region
  if (pop.regionalPopulations && pop.regionalPopulations.length > 0) {
    // FIX (Oct 29, 2025): Type-safe conversion billions → millions
    // totalDeaths is in BILLIONS, regional tracking uses MILLIONS
    const totalDeathsMillions: Millions = assertBillionsToMillions(totalDeaths, {
      location: 'resolveMortality',
      valueName: 'totalDeaths',
      month: state.currentMonth,
    });

    // FIX (Oct 29, 2025): Type-safe global population conversion
    // pop.population is in BILLIONS, regional.population is in MILLIONS
    const globalPopulationMillions: Millions = billionsToMillions(toBillions(pop.population));

    // NaN AUDIT (Nov 7, 2025): Validate globalPopulationMillions before division
    assertFinite(globalPopulationMillions, {
      location: 'resolveMortality.regionalDeathDistribution',
      valueName: 'globalPopulationMillions',
      month: state.currentMonth,
      additionalInfo: {
        popPopulation: pop.population,
        regionCount: pop.regionalPopulations?.length
      }
    });

    for (const region of pop.regionalPopulations) {
      // Each region gets deaths proportional to its share of global population
      // BOTH values are now MILLIONS (type-safe, no 1000× error possible)
      // NaN AUDIT (Nov 7, 2025): Division by globalPopulationMillions is safe here
      // because we've validated it's finite above
      const regionFraction = region.population / globalPopulationMillions;
      const regionalDeaths = totalDeathsMillions * regionFraction;

      region.population = Math.max(0, region.population - regionalDeaths);

      // Track deaths at regional level
      region.monthlyExcessDeaths = regionalDeaths;
      region.cumulativeCrisisDeaths += regionalDeaths;
    }
  }

  // DON'T update pop.population directly - aggregateGlobalPopulation will do it
  // pop.population = newPopulation; // REMOVED - let aggregation handle this

  // FIX (Oct 29, 2025): Type-safe conversion for global death tracking
  // Convert totalDeaths (billions) → millions for legacy tracking
  const totalDeathsMillionsGlobal: Millions = assertBillionsToMillions(totalDeaths, {
    location: 'resolveMortality',
    valueName: 'totalDeathsGlobal',
    month: state.currentMonth,
  });

  // WEEK 3: Validate death counts before state mutation
  assertPopulationMillion(totalDeathsMillionsGlobal, {
    location: 'resolveMortality',
    valueName: 'totalDeathsMillionsGlobal',
    month: state.currentMonth,
  });

  // WEEK 3: Validate cumulative deaths won't overflow
  const newCumulativeDeaths = pop.cumulativeCrisisDeaths + totalDeathsMillionsGlobal;
  assertFinite(newCumulativeDeaths, {
    location: 'resolveMortality',
    valueName: 'cumulativeCrisisDeaths',
    month: state.currentMonth,
    additionalInfo: {
      previous: pop.cumulativeCrisisDeaths,
      adding: totalDeathsMillionsGlobal,
    }
  });

  pop.cumulativeCrisisDeaths += totalDeathsMillionsGlobal;
  pop.monthlyExcessDeaths = totalDeathsMillionsGlobal;

  // Update death tracking by category and root cause
  for (const segment of deathSegments) {
    for (const cause of segment.causes) {
      // FIX (Oct 29, 2025): Type-safe conversion billions → millions
      // segment.count is in BILLIONS, death tracking uses MILLIONS
      const segmentDeathsMillions: Millions = billionsToMillions(segment.count as Billions);
      const attributedDeathsMillions = segmentDeathsMillions * cause.contributionFraction;

      // WEEK 3: Validate attributed deaths before mutation
      assertPopulationMillion(attributedDeathsMillions, {
        location: 'resolveMortality.deathAttribution',
        valueName: 'attributedDeathsMillions',
        month: state.currentMonth,
      });

      // Update proximate cause (stored in millions)
      const newProximateCategoryTotal = (pop.deathsByCategory[cause.proximate] || 0) + attributedDeathsMillions;
      // Clamp to valid range (floating-point precision can cause slight overflow)
      const clampedProximateTotal = Math.min(10000, Math.max(0, newProximateCategoryTotal));
      // deathsByCategory tracks GLOBAL cumulative deaths by cause - use 10B cap
      assertInRange(clampedProximateTotal, 0, 10000, {
        location: 'resolveMortality.deathsByCategory',
        valueName: `deathsByCategory.${cause.proximate}`,
        month: state.currentMonth,
      });
      pop.deathsByCategory[cause.proximate] = clampedProximateTotal;

      // FIX (Oct 29, 2025): BUG #1 - Death attribution mismatch (730× error)
      // ROOT CAUSE: deathsByRootCause was stored in BILLIONS while deathsByCategory was in MILLIONS
      // SOLUTION: Both are now stored in MILLIONS (per types/population.ts line 74)
      // Update root cause (stored in millions)
      const newRootCauseTotal = (pop.deathsByRootCause[cause.root] || 0) + attributedDeathsMillions;
      assertFinite(newRootCauseTotal, {
        location: 'resolveMortality.deathsByRootCause',
        valueName: `deathsByRootCause.${cause.root}`,
        month: state.currentMonth,
        additionalInfo: {
          previous: pop.deathsByRootCause[cause.root] || 0,
          adding: attributedDeathsMillions,
        }
      });
      pop.deathsByRootCause[cause.root] = newRootCauseTotal;

      // Update confidence distribution (stored in millions)
      const newConfidenceTotal = (pop.deathsByRootCause.confidenceDistribution[cause.confidence] || 0) + attributedDeathsMillions;
      assertFinite(newConfidenceTotal, {
        location: 'resolveMortality.confidenceDistribution',
        valueName: `confidenceDistribution.${cause.confidence}`,
        month: state.currentMonth,
        additionalInfo: {
          previous: pop.deathsByRootCause.confidenceDistribution[cause.confidence] || 0,
          adding: attributedDeathsMillions,
        }
      });
      pop.deathsByRootCause.confidenceDistribution[cause.confidence] = newConfidenceTotal;
    }
  }

  // Track compound attribution if multiple risks (stored in millions)
  if (risks.length > 1) {
    // FIX (Oct 29, 2025): Use the type-safe millions variable
    const newCompoundTotal = (pop.deathsByRootCause.compound || 0) + totalDeathsMillionsGlobal;
    assertFinite(newCompoundTotal, {
      location: 'resolveMortality.compoundDeaths',
      valueName: 'deathsByRootCause.compound',
      month: state.currentMonth,
      additionalInfo: {
        previous: pop.deathsByRootCause.compound || 0,
        adding: totalDeathsMillionsGlobal,
        riskCount: risks.length,
      }
    });
    pop.deathsByRootCause.compound = newCompoundTotal;
  }

  // Calculate summary statistics
  // NaN AUDIT (Nov 7, 2025): Replace silent fallback with explicit assertion
  const avgDeathProbability = deathSegments.reduce((sum, s) => {
    const demo = demographics.find((d) => d.name === s.demographic);
    if (!demo) {
      throw new Error(
        `❌ NaN AUDIT: Demographic not found for segment "${s.demographic}". ` +
        `Available demographics: ${demographics.map(d => d.name).join(', ')}. ` +
        `Month: ${state.currentMonth}`
      );
    }
    return sum + s.probability * demo.fraction;
  }, 0);

  // NaN AUDIT (Nov 7, 2025): Validate avgDeathProbability
  assertFinite(avgDeathProbability, {
    location: 'resolveMortality.summaryStatistics',
    valueName: 'avgDeathProbability',
    month: state.currentMonth,
    additionalInfo: {
      segmentCount: deathSegments.length
    }
  });

  const peakSegment = deathSegments.reduce((max, s) =>
    s.probability > max.probability ? s : max
  );

  // Clear risks after resolution
  pop.mortalityRisks = [];

  // Log mortality event (totalDeaths is in billions)
  if (totalDeaths > 0.000001) { // 0.000001B = 1000 people
    console.log(`\n📊 Monthly Mortality Resolved:`);
    // FIX (Oct 29, 2025): Use type-safe conversion for logging
    console.log(`  Total deaths: ${totalDeathsMillionsGlobal.toFixed(1)}M (${(avgDeathProbability * 100).toFixed(2)}% avg)`);
    console.log(`  Remaining population: ${pop.population.toFixed(3)}B`);
    console.log(`  Peak segment: ${peakSegment.demographic} (${(peakSegment.probability * 100).toFixed(2)}%)`);
    if (cappedByMonthly) console.log(`  ⚠️ Monthly cap reached (${caps.monthlyMaxMortalityRate * 100}%)`);
    if (cappedByInstant) console.log(`  ⚠️ Instant cap reached (${caps.instantMaxMortalityRate * 100}%)`);
  }

  return {
    // FIX (Oct 29, 2025): Use type-safe millions value
    totalDeaths: totalDeathsMillionsGlobal, // Return in millions for compatibility
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
