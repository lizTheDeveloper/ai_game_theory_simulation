/**
 * CoordinatedDeploymentPhase (16.5)
 *
 * AI-managed gradual technology deployment to minimize transition mortality.
 * Implements research-backed coordination effectiveness (50-70% reduction, NOT 96-98%).
 *
 * **EXECUTION ORDER:** 16.5 (after tech deployment at 12.5, before economic effects at 31.0)
 * **DEPENDENCIES:**
 * - tech-tree (12.5): Reads technology deployment levels
 * - ai-lifecycle (3.0): Reads AI capabilities for coordination quality
 * - government-actions (7.0): Reads governance capacity
 *
 * **RESEARCH:**
 * - Primary: /research/transition_mortality_coordination_effectiveness_20251115.md
 * - Critique: /reviews/transition_mortality_research_critique_20251115.md (Grade B-, Sylvia adjustments)
 *
 * **KEY FINDINGS (Sylvia-Adjusted):**
 * - Chaotic rapid transition: 3.5-8.1% population mortality over 2-4 years
 * - Coordinated gradual transition: 0.14-0.53% mortality
 * - Coordination effectiveness: 50-70% reduction (capped, NOT 96-98%)
 * - Optimal deployment speed: 4-8% per year (Green Revolution pace)
 * - Support system effectiveness: 40-60% cumulative protection
 * - Labor participation penalty: 2-5% reduction from support systems
 *
 * **SIDE EFFECTS:**
 * - Updates coordinatedDeployment.transitionMortality
 * - Modifies humanPopulationSystem.population (mortality application)
 * - Logs deployment events with mortality impacts
 */

import {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import {
  assertFinite,
  assertProbability,
  assertInRange,
  assertDefined,
  assertStateProperty
} from '@/simulation/utils/assertions';

export class CoordinatedDeploymentPhase implements SimulationPhase {
  readonly id = 'coordinated-deployment';
  readonly name = 'Coordinated Technology Deployment';
  readonly order = 16.5;

  readonly dependencies = [
    'tech-tree',         // Order 12.5: Tech deployment levels
    'ai-lifecycle',      // Order 3.0: AI capabilities
    'government-actions' // Order 7.0: Governance capacity
  ] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> origin/auto/worker-20251117_110001
=======
>>>>>>> origin/auto/worker-20251117_120001
=======
>>>>>>> origin/auto/worker-20251117_130001
=======
>>>>>>> origin/auto/worker-20251117_140001
    // DEFENSIVE CHECK: Fail loudly if state not initialized after bootstrap
    if (!state.coordinatedDeployment) {
      if (state.currentMonth > 1) {
        throw new Error(
          `❌ CRITICAL: coordinatedDeployment state missing at month ${state.currentMonth}. ` +
          `This indicates initialization failure. Check src/simulation/initialization.ts.`
        );
      }
      // Only skip during bootstrap (month 0-1)
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> origin/auto/worker-20251117_120001
=======
>>>>>>> origin/auto/worker-20251117_130001
=======
>>>>>>> origin/auto/worker-20251117_140001
=======
    // Skip if coordinated deployment not initialized (optional system)
    if (!state.coordinatedDeployment) {
>>>>>>> origin/auto/researcher-20251115_093001
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> origin/auto/worker-20251117_110001
=======
>>>>>>> origin/auto/worker-20251117_120001
=======
>>>>>>> origin/auto/worker-20251117_130001
=======
>>>>>>> origin/auto/worker-20251117_140001
      return { events };
    }

    const deployment = state.coordinatedDeployment;
    const currentMonth = state.currentMonth;

    // === STEP 1: Assess Regional Capacity ===
    const regionalCapacity = this.assessRegionalCapacity(state, rng);
    deployment.regionalCapacity = regionalCapacity;

    // === STEP 2: Activate Support Systems ===
    this.activateSupportSystems(state, rng);

    // === STEP 3: Calculate AI Coordination Quality ===
    deployment.globalCoordinationQuality = this.calculateCoordinationQuality(state, rng);

    // === STEP 4: Calculate Optimal Deployment Speed ===
    const avgRegionalCapacity = this.averageRegionalCapacity(regionalCapacity);
    deployment.optimalDeploymentSpeed = this.calculateOptimalDeploymentSpeed(
      avgRegionalCapacity,
      deployment.globalCoordinationQuality,
      this.averageSupportSystemQuality(deployment.supportSystems),
      rng
    );

    // === STEP 5: Calculate Current Deployment Speed ===
    deployment.currentDeploymentSpeed = this.calculateCurrentDeploymentSpeed(state, rng);

    // === STEP 6: Calculate Transition Mortality ===
    const mortalityResults = this.calculateTransitionMortality(
      deployment.currentDeploymentSpeed,
      deployment.supportSystems,
      avgRegionalCapacity,
      deployment.globalCoordinationQuality,
      state.humanPopulationSystem.population,
      rng
    );

    // === STEP 7: Update State ===
    deployment.transitionMortality.annualExcessMortality = mortalityResults.annualRate;
    deployment.transitionMortality.mortalityByMechanism = mortalityResults.byMechanism;

    // Monthly deaths = annual rate / 12
    const monthlyDeaths = mortalityResults.absoluteDeathsMonthly;
    deployment.transitionMortality.cumulativeTransitionDeaths += monthlyDeaths;

    // Apply mortality to population (deaths in millions)
    const previousPop = state.humanPopulationSystem.population;
    state.humanPopulationSystem.population = Math.max(
      0.001, // Minimum 1M population
      previousPop - monthlyDeaths / 1000 // Convert millions to billions
    );

    // === STEP 8: Log Events ===
    if (currentMonth % 6 === 0 || mortalityResults.annualRate > 5) {
      console.log(`\n🤝 COORDINATED DEPLOYMENT (Month ${currentMonth})`);
      console.log(`   Deployment Speed: ${(deployment.currentDeploymentSpeed * 100).toFixed(1)}%/year` +
        ` (optimal: ${(deployment.optimalDeploymentSpeed * 100).toFixed(1)}%)`);
      console.log(`   Coordination Quality: ${(deployment.globalCoordinationQuality * 100).toFixed(0)}%` +
        ` (capped at 70% per Sylvia)`);
      console.log(`   Regional Capacity: High=${(regionalCapacity.highIncome * 100).toFixed(0)}%,` +
        ` Mid=${(regionalCapacity.upperMiddle * 100).toFixed(0)}%,` +
        ` Low=${(regionalCapacity.lowIncome * 100).toFixed(0)}%`);
      console.log(`   Support Systems: UBI=${(deployment.supportSystems.universalBasicIncome * 100).toFixed(0)}%,` +
        ` Food=${(deployment.supportSystems.foodSecurity * 100).toFixed(0)}%,` +
        ` Healthcare=${(deployment.supportSystems.healthcareAccess * 100).toFixed(0)}%`);
      console.log(`   Transition Mortality: ${mortalityResults.annualRate.toFixed(2)} per 1000/year` +
        ` (${monthlyDeaths.toFixed(2)}M deaths this month)`);
      console.log(`   Cumulative Deaths: ${deployment.transitionMortality.cumulativeTransitionDeaths.toFixed(1)}M`);

      if (mortalityResults.annualRate > 5) {
        console.log(`   ⚠️ HIGH MORTALITY: Exceeds 5 per 1000 threshold`);
      }
    }

    // Log significant mortality events
    if (mortalityResults.annualRate > 10) {
      events.push({
        id: `transition_mortality_crisis_${currentMonth}`,
        timestamp: currentMonth,
        type: 'crisis',
        severity: 'major',
        agent: 'Technology Deployment',
        title: `High Transition Mortality (${mortalityResults.annualRate.toFixed(1)} per 1000)`,
        description: `Rapid technology deployment causing ${mortalityResults.annualRate.toFixed(1)} deaths per 1000 population annually. ` +
          `Coordination quality: ${(deployment.globalCoordinationQuality * 100).toFixed(0)}%. ` +
          `Deployment speed: ${(deployment.currentDeploymentSpeed * 100).toFixed(0)}%/year.`,
        effects: {
          mortality: monthlyDeaths,
          coordination: deployment.globalCoordinationQuality
        }
      });
    }

    return { events };
  }

  /**
   * Assess regional capacity for technology adoption
   *
   * Metrics: governance effectiveness, infrastructure quality, economic resilience
   *
   * @research Historical regional variation in Green Revolution (3x difference)
   * @research Post-Soviet transition capacity differences (Poland vs Russia)
   */
  private assessRegionalCapacity(state: GameState, rng: RNGFunction): {
    highIncome: number;
    upperMiddle: number;
    lowerMiddle: number;
    lowIncome: number;
  } {
    // Base capacity by income level
    let highIncome = 0.75;    // OECD: strong institutions, infrastructure
    let upperMiddle = 0.60;   // China, Brazil: moderate capacity
    let lowerMiddle = 0.45;   // India, Indonesia: developing infrastructure
    let lowIncome = 0.30;     // Sub-Saharan Africa: limited capacity

    // Governance quality modifier (±0.15)
    // Use government capability as proxy (normalized to 0-1 range)
    const governanceQuality = Math.min(1.0, state.government.capabilityToControl / 2) || 0.50;
    const governanceMod = (governanceQuality - 0.50) * 0.30;

    highIncome = assertProbability(highIncome + governanceMod, {
      location: 'assessRegionalCapacity',
      valueName: 'highIncome',
      month: state.currentMonth
    });

    upperMiddle = assertProbability(upperMiddle + governanceMod * 0.8, {
      location: 'assessRegionalCapacity',
      valueName: 'upperMiddle',
      month: state.currentMonth
    });

    lowerMiddle = assertProbability(lowerMiddle + governanceMod * 0.6, {
      location: 'assessRegionalCapacity',
      valueName: 'lowerMiddle',
      month: state.currentMonth
    });

    lowIncome = assertProbability(lowIncome + governanceMod * 0.4, {
      location: 'assessRegionalCapacity',
      valueName: 'lowIncome',
      month: state.currentMonth
    });

    return { highIncome, upperMiddle, lowerMiddle, lowIncome };
  }

  /**
   * Activate support systems based on economic capacity and governance
   *
   * Support systems: UBI, retraining, food security, healthcare access
   *
   * @research SNAP 33% food insecurity reduction (Bailey et al. 2020)
   * @research Social Security $1k/yr → 10-20% mortality reduction (Behrman et al. 2011)
   * @research Worker retraining 25-40% effectiveness (Dorn et al. 2024)
   * @uncertainty Labor participation penalty 2-5% (Sylvia adjustment)
   */
  private activateSupportSystems(state: GameState, rng: RNGFunction): void {
    const deployment = state.coordinatedDeployment!;
    const economicStage = state.globalMetrics.economicTransitionStage || 2;

    // UBI coverage scales with GDP per capita and economic stage
    const ubiBase = Math.min(0.85, economicStage / 4);
    deployment.supportSystems.universalBasicIncome = assertProbability(
      ubiBase * (0.9 + rng() * 0.2), // ±10% variation
      {
        location: 'activateSupportSystems',
        valueName: 'universalBasicIncome',
        month: state.currentMonth
      }
    );

    // Retraining quality scales with education spending and governance
    // Use government capability as proxy (normalized to 0-1 range)
    const governanceQuality = Math.min(1.0, state.government.capabilityToControl / 2) || 0.50;
    const retrainingBase = Math.min(0.80, governanceQuality + economicStage / 8);
    deployment.supportSystems.retrainingPrograms = assertProbability(
      retrainingBase * (0.85 + rng() * 0.30), // Higher variation (program quality varies)
      {
        location: 'activateSupportSystems',
        valueName: 'retrainingPrograms',
        month: state.currentMonth
      }
    );

    // Food security scales with agricultural capacity
    const foodBase = 0.95; // AI-optimized food systems
    deployment.supportSystems.foodSecurity = assertProbability(
      Math.min(1.0, foodBase * (0.90 + rng() * 0.20)), // Clamp to [0, 1]
      {
        location: 'activateSupportSystems',
        valueName: 'foodSecurity',
        month: state.currentMonth
      }
    );

    // Healthcare access scales with health infrastructure
    const healthBase = 0.90; // AI healthcare support
    deployment.supportSystems.healthcareAccess = assertProbability(
      Math.min(1.0, healthBase * (0.85 + rng() * 0.30)), // Clamp to [0, 1]
      {
        location: 'activateSupportSystems',
        valueName: 'healthcareAccess',
        month: state.currentMonth
      }
    );
  }

  /**
   * Calculate AI coordination quality
   *
   * CRITICAL SYLVIA ADJUSTMENT: Capped at 70% (NOT 95%)
   * Maximum AI coordination = human best (60%) + 20% speculative improvement
   *
   * @research AI governance coordination mechanisms (Oxford 2024, Nature 2024)
   * @critique Sylvia: No empirical AI governance at scale, 95% pure speculation
   * @uncertainty HIGH - extrapolation from human coordination to AI
   */
  private calculateCoordinationQuality(state: GameState, rng: RNGFunction): number {
    // Base coordination from governance quality
    // Use government capability as proxy (normalized to 0-1 range)
    const governanceQuality = Math.min(1.0, state.government.capabilityToControl / 2) || 0.50;

    // AI capability contribution (capped)
    const aiAgents = state.aiAgents.filter(a => a.lifecycleState === 'deployed_open' || a.lifecycleState === 'deployed_closed');
    let avgAICapability = 0;
    if (aiAgents.length > 0) {
      const totalCapability = aiAgents.reduce((sum, agent) => {
        // Use cognitive + social capabilities for coordination
        return sum + (agent.capabilityProfile.cognitive || 0) + (agent.capabilityProfile.social || 0);
      }, 0);
      avgAICapability = totalCapability / (aiAgents.length * 10); // Normalize to 0-1 (max 5+5=10)
    }

    // International alignment (placeholder - would come from governance system)
    const internationalAlignment = 0.70; // Moderate global cooperation

    // Base coordination quality (weighted factors)
    const baseCoordination =
      governanceQuality * 0.40 +
      avgAICapability * 0.30 +
      internationalAlignment * 0.30;

    // SYLVIA CAP: Maximum 70% coordination effectiveness
    const SYLVIA_MAX = 0.70;
    const coordinationQuality = Math.min(SYLVIA_MAX, baseCoordination);

    return assertProbability(coordinationQuality, {
      location: 'calculateCoordinationQuality',
      valueName: 'coordinationQuality',
      month: state.currentMonth
    });
  }

  /**
   * Calculate optimal deployment speed based on capacity and coordination
   *
   * @research Green Revolution: 4-8% per year optimal pace
   * @research Post-Soviet gradual reform: ~4-5% per year avoided mortality spike
   * @research PLOS (2024): Fast deployment (>60-70%) creates oscillating cycles
   */
  private calculateOptimalDeploymentSpeed(
    regionalCapacity: number,
    coordinationQuality: number,
    supportSystemQuality: number,
    rng: RNGFunction
  ): number {
    // Base safe speed: 4-7% per year (Green Revolution range)
    const baseSafeSpeed = 0.05; // 5% midpoint

    // Capacity adjustment: higher capacity → faster safe speed
    const capacityMultiplier = 0.6 + regionalCapacity * 0.8;

    // Coordination adjustment: better coordination → faster safe speed
    const coordinationMultiplier = 0.7 + coordinationQuality * 0.6;

    // Support systems: comprehensive support → faster safe speed
    const supportMultiplier = 0.7 + supportSystemQuality * 0.6;

    const optimalSpeed = baseSafeSpeed *
      capacityMultiplier *
      coordinationMultiplier *
      supportMultiplier;

    // Cap at 30% per year (shock therapy threshold)
    const cappedSpeed = Math.min(0.30, optimalSpeed);

    return assertFinite(cappedSpeed, {
      location: 'calculateOptimalDeploymentSpeed',
      valueName: 'optimalSpeed',
      month: 0, // No month context in this helper
      additionalInfo: { regionalCapacity, coordinationQuality, supportSystemQuality }
    });
  }

  /**
   * Calculate current deployment speed from tech tree
   *
   * Measures fraction of economy transformed per year based on
   * recent technology deployment progress.
   */
  private calculateCurrentDeploymentSpeed(state: GameState, rng: RNGFunction): number {
    // Placeholder: Would calculate based on tech deployment deltas
    // For now, use moderate deployment assumption
    const deploymentSpeed = 0.08; // 8% per year (moderate pace)

    return assertFinite(deploymentSpeed, {
      location: 'calculateCurrentDeploymentSpeed',
      valueName: 'deploymentSpeed',
      month: state.currentMonth
    });
  }

  /**
   * Calculate transition mortality from technology deployment
   *
   * COMPREHENSIVE MODEL synthesizing all historical findings:
   * - Chaotic rapid transition baseline: 3.5-8.1% over 2-4 years
   * - Coordination mitigation: 50-70% reduction (Sylvia-adjusted, NOT 96-98%)
   * - Support systems: 40-60% cumulative protection
   * - Labor participation penalty: 2-5% from support systems (Sylvia addition)
   *
   * @research Meng et al. (2015) Great Leap Forward: 3.5-4.6% mortality
   * @research Naumenko (2021) Soviet collectivization: 8.1-12.2% mortality
   * @research Stuckler et al. (2009) Shock therapy: 12.8% increase
   * @research Moscona et al. (2020) Green Revolution: -2.8% infant mortality reduction
   * @research Bailey et al. (2020) SNAP: 33% food insecurity reduction
   * @critique Sylvia: Coordination effectiveness capped at 70%, labor participation penalty required
   */
  private calculateTransitionMortality(
    deploymentSpeed: number, // Fraction per year
    supportSystems: { universalBasicIncome: number; retrainingPrograms: number; foodSecurity: number; healthcareAccess: number },
    regionalCapacity: number, // Average regional capacity
    coordinationQuality: number, // 0-0.70 (Sylvia-capped)
    populationBillions: number,
    rng: RNGFunction
  ): {
    annualRate: number; // Deaths per 1000 per year
    byMechanism: {
      famine: number;
      unemployment: number;
      healthcareLoss: number;
      coordinationFailure: number;
      other: number;
    };
    absoluteDeathsMonthly: number; // Millions
  } {
    const baselineMortalityRate = 8; // per 1000 (global average)

    // === RISK FACTORS (increase mortality) ===

    // 1. Deployment speed risk (deviation from optimal 5%)
    const optimalSpeed = 0.05;
    const speedDeviation = Math.abs(deploymentSpeed - optimalSpeed);
    const speedRisk = speedDeviation * 15; // per 1000

    // 2. Coordination failure risk (Sylvia-adjusted: max 70% effectiveness)
    const chaoticBaseRisk = 50; // per 1000 (Soviet collectivization level)
    const SYLVIA_MAX_MITIGATION = 0.70; // NOT 0.95
    const coordinationMitigation = Math.min(SYLVIA_MAX_MITIGATION, coordinationQuality);
    const coordinationRisk = chaoticBaseRisk * (1 - coordinationMitigation);

    // 3. Economic disruption risks
    const unemploymentRate = 0.18; // 18% automation displacement (placeholder)
    const unemploymentRisk = unemploymentRate * 0.63 * baselineMortalityRate; // 63% hazard increase

    // === PROTECTIVE FACTORS (decrease mortality) ===

    // 1. Cash transfer protection (UBI)
    const cashTransferAmount = 15.0; // thousands USD (robust UBI)
    const cashTransferProtection =
      supportSystems.universalBasicIncome *
      Math.min(cashTransferAmount * 0.15, 0.60) *
      baselineMortalityRate;

    // 2. Food security protection
    const foodInsecurityBaseline = 3; // per 1000
    const foodSecurityProtection = supportSystems.foodSecurity * 0.33 * foodInsecurityBaseline;

    // 3. Healthcare access protection
    const healthcareProtection = supportSystems.healthcareAccess * 2.5; // per 1000

    // 4. Retraining effectiveness (reduces unemployment mortality)
    const retrainingProtection = supportSystems.retrainingPrograms * 0.35 * unemploymentRisk;

    // 5. Regional capacity buffer
    const capacityProtection = regionalCapacity * 0.40 * coordinationRisk;

    // SYLVIA ADDITION: Labor participation penalty from support systems
    // 2-5% reduction in labor force participation reduces economic output
    const laborPenalty = (supportSystems.universalBasicIncome * 0.05 +
      supportSystems.retrainingPrograms * 0.02) * baselineMortalityRate * 0.5;

    // === NET MORTALITY CALCULATION ===

    const totalRisk = speedRisk + coordinationRisk + unemploymentRisk;
    const totalProtection = cashTransferProtection + foodSecurityProtection +
      healthcareProtection + retrainingProtection + capacityProtection -
      laborPenalty; // Subtract penalty

    const annualExcessMortality = Math.max(0, totalRisk - totalProtection); // per 1000

    // === MORTALITY BY MECHANISM ===
    const mortalityByMechanism = {
      famine: assertFinite(foodInsecurityBaseline * (1 - supportSystems.foodSecurity * 0.33), {
        location: 'calculateTransitionMortality',
        valueName: 'famineComponent',
        additionalInfo: { foodSecurity: supportSystems.foodSecurity }
      }),
      unemployment: assertFinite(unemploymentRisk - retrainingProtection, {
        location: 'calculateTransitionMortality',
        valueName: 'unemploymentComponent',
        additionalInfo: { unemploymentRate, retraining: supportSystems.retrainingPrograms }
      }),
      healthcareLoss: assertFinite((baselineMortalityRate * 0.2) * (1 - supportSystems.healthcareAccess), {
        location: 'calculateTransitionMortality',
        valueName: 'healthcareLossComponent',
        additionalInfo: { healthcareAccess: supportSystems.healthcareAccess }
      }),
      coordinationFailure: assertFinite(coordinationRisk - capacityProtection, {
        location: 'calculateTransitionMortality',
        valueName: 'coordinationFailureComponent',
        additionalInfo: { coordinationRisk, capacityProtection }
      }),
      other: assertFinite(speedRisk + laborPenalty, {
        location: 'calculateTransitionMortality',
        valueName: 'otherComponent',
        additionalInfo: { speedRisk, laborPenalty }
      })
    };

    // === ABSOLUTE DEATHS ===
    // Annual mortality per 1000 → monthly deaths in millions
    const annualDeathsMillions = (annualExcessMortality / 1000) * populationBillions * 1000;
    const monthlyDeathsMillions = annualDeathsMillions / 12;

    return {
      annualRate: assertFinite(annualExcessMortality, {
        location: 'calculateTransitionMortality',
        valueName: 'annualExcessMortality',
        additionalInfo: { totalRisk, totalProtection, laborPenalty }
      }),
      byMechanism: mortalityByMechanism,
      absoluteDeathsMonthly: assertFinite(monthlyDeathsMillions, {
        location: 'calculateTransitionMortality',
        valueName: 'monthlyDeathsMillions',
        additionalInfo: { annualDeathsMillions, populationBillions }
      })
    };
  }

  /**
   * Calculate average regional capacity across all regions
   */
  private averageRegionalCapacity(regional: {
    highIncome: number;
    upperMiddle: number;
    lowerMiddle: number;
    lowIncome: number;
  }): number {
    // Population-weighted average (rough approximation)
    // High income: 1.2B, Upper middle: 2.5B, Lower middle: 3.0B, Low income: 1.3B
    const totalPop = 8.0;
    const weighted =
      (regional.highIncome * 1.2 +
        regional.upperMiddle * 2.5 +
        regional.lowerMiddle * 3.0 +
        regional.lowIncome * 1.3) / totalPop;

    return assertProbability(weighted, {
      location: 'averageRegionalCapacity',
      valueName: 'weightedAverage'
    });
  }

  /**
   * Calculate average support system quality
   */
  private averageSupportSystemQuality(systems: {
    universalBasicIncome: number;
    retrainingPrograms: number;
    foodSecurity: number;
    healthcareAccess: number;
  }): number {
    const avg = (systems.universalBasicIncome + systems.retrainingPrograms +
      systems.foodSecurity + systems.healthcareAccess) / 4;

    return assertProbability(avg, {
      location: 'averageSupportSystemQuality',
      valueName: 'average'
    });
  }
}
