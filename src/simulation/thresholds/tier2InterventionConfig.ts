/**
 * TIER 2 Intervention Parameter Configurations
 *
 * Research-backed uncertainty distributions for superalignment interventions.
 * Following the pattern established in tier1Config.ts and tier2Config.ts.
 *
 * Research Foundation: /research/tier2_parameter_validation_20251026.md
 *
 * Evidence Quality Summary:
 * - Strong (3): Crisis Anticipation, Synthetic Ecosystems, Interpretability (moderate-high)
 * - Moderate (5): Dark Compute, Coastal Protection, Nuclear Security, Centaur Systems, Community Cohesion
 *
 * Implementation Date: October 27, 2025
 */

import type { RNGFunction } from '@/types/config';
import {
  sampleBeta,
  sampleTriangular,
  sampleUniform,
  sampleLogNormal
} from '../utils/distributions';

/**
 * 1. AI INTERPRETABILITY ENSEMBLE DETECTION
 *
 * Evidence Quality: 🟢 MODERATE-HIGH (upgraded from WEAK)
 *
 * Research: 5 Anthropic papers (2024-2025) validate ensemble approach
 * - Simple Probes: >99% AUROC on lab sleepers
 * - SHADE-Arena: 80% detection at 20% false positive rate
 * - Persona Vectors: r=0.76-0.97 correlation with true goals
 * - Alignment Faking: 7% → 78% increase with RL training (detection target)
 *
 * Key Insight: "Generation behind" - interpretability lags capability frontier
 * Conditional: +10% effectiveness if distilled models dominant (easier to interpret)
 *
 * Citations:
 * - Hubinger et al. (2024) "Sleeper Agents"
 * - Anthropic (2024) "Scaling Monosemanticity"
 * - Burns et al. (2025) "Discovering Latent Knowledge in Language Models"
 * - Sharma et al. (2024) "Persona Vectors"
 * - Greenblatt et al. (2024) "Alignment Faking in Large Language Models"
 */
export const AI_INTERPRETABILITY_PARAMS = {
  controlLossPrevention: {
    distribution: 'triangular' as const,
    min: 0.60,
    mode: 0.72,
    max: 0.85,
    citation: 'Anthropic ensemble: Simple Probes >99% AUROC, SHADE-Arena 80% detection, Persona Vectors r=0.76-0.97'
  },
  deploymentTimeline: {
    distribution: 'triangular' as const,
    min: 18,
    mode: 30,
    max: 48,
    unit: 'months',
    citation: 'Tools exist (2024-2025), 2-3 years to production deployment'
  },
  computationalLag: {
    distribution: 'triangular' as const,
    min: 6,
    mode: 12,
    max: 24,
    unit: 'months behind capability frontier',
    distilledModelBonus: -6,
    citation: 'SAE scaling challenges + Moore\'s law lag + distillation advantage'
  }
};

/**
 * 2. DARK COMPUTE MONITORING
 *
 * Evidence Quality: 🟡 MODERATE (upgraded from WEAK)
 *
 * Research: Energy monitoring + on-chip governance + CTBTO analogy
 * - Energy detectability: GPT-4 ~50 GWh, future runs 1-8 GW by 2028-2030
 * - On-chip governance: NVIDIA, AMD, Apple, Intel operational mechanisms
 * - CTBTO analogy: 90% network, all 6 NK nuclear tests detected
 * - Circumvention possible but expensive: 2-10× cost multiplier
 *
 * Key Conditionals:
 * - Large runs (>1 GW): +15% detection rate
 * - Distributed compute: -20% detection rate
 *
 * Prerequisites:
 * - International treaty (compute monitoring agreement)
 * - Chip manufacturer cooperation (governance mechanisms mandatory)
 *
 * Citations:
 * - CTBTO monitoring network performance (1996-2024)
 * - Epoch AI compute analysis (2024)
 * - On-chip governance proposals (Shavit 2023, Sastry 2024)
 */
export const DARK_COMPUTE_MONITORING_PARAMS = {
  detectionRate: {
    distribution: 'beta' as const,
    alpha: 6,
    beta: 2,
    bounds: [0.70, 0.95] as const,
    largeRunBonus: 0.15,      // >1 GW runs highly detectable
    distributedPenalty: -0.20, // Distributed compute harder to detect
    citation: 'Energy monitoring (Epoch AI 2024) + CTBTO analogy (90% network) + on-chip governance'
  },
  falsePositiveRate: {
    distribution: 'triangular' as const,
    min: 0.05,
    mode: 0.12,
    max: 0.25,
    citation: 'CTBTO false positive experience (1996-2024)'
  },
  deploymentTimeline: {
    distribution: 'triangular' as const,
    min: 24,
    mode: 36,
    max: 60,
    unit: 'months',
    prerequisites: ['international treaty', 'chip manufacturer cooperation'],
    citation: 'Treaty negotiation analogs (NPT 1968, Montreal Protocol 1987)'
  }
};

/**
 * 3. SYNTHETIC ECOSYSTEM SERVICES
 *
 * Evidence Quality: 🟢 STRONG (upgraded from WEAK)
 *
 * Research: Captive breeding + cloning breakthrough + economic incentives
 * - Black-footed ferret: 18 → 500 in 20 years (captive breeding)
 * - California condor: 14 → 200+ (most expensive: $35M program)
 * - Cloning breakthrough (2020-2025): Elizabeth Ann → 15 ferrets with Willa genetics in 5 years
 * - Economic incentives proven: Vicuña 6K → 350K via fiber trade, Buffalo hundreds → 500K via ranching
 *
 * Key Insight: "Buy time for recovery" not "replacement for wild ecosystems"
 *
 * Species Coverage:
 * - Keystone species: 60% (critical for ecosystem function)
 * - Economically valued species: 85% (high incentive)
 * - Charismatic megafauna: 75% (public support)
 *
 * Citations:
 * - U.S. Fish & Wildlife Service captive breeding success rates (1973-2023)
 * - Revive & Restore cloning programs (2020-2025)
 * - IUCN economic incentive case studies (vicuña, buffalo)
 */
export const SYNTHETIC_ECOSYSTEM_PARAMS = {
  recoveryTimeGranted: {
    distribution: 'triangular' as const,
    min: 120,     // 10 years (accelerated with tech)
    mode: 240,    // 20 years (black-footed ferret empirical)
    max: 480,     // 40 years (condor empirical)
    unit: 'months',
    citation: 'Black-footed ferret 18→500 in 240 months (20y), condor 27→569 in 444 months (37y) - USFWS verified'
  },
  crisisMitigation: {
    distribution: 'triangular' as const,
    min: 0.25,
    mode: 0.35,
    max: 0.50,
    unit: 'fraction of biodiversity crisis severity mitigated',
    mechanism: 'Captive breeding + cloning + economic incentives',
    citation: 'U.S. FWS success rates + Revive & Restore + IUCN case studies'
  },
  costPerSpecies: {
    distribution: 'log-normal' as const,
    mu: 17.4,     // ln($35M) ≈ 17.4
    sigma: 0.8,
    bounds: [10e6, 100e6] as const,
    unit: 'USD per species recovery program',
    citation: 'California condor $35M (most expensive), median ~$10-20M'
  },
  speciesCoverage: {
    keystone: 0.60,           // Critical for ecosystem function
    economicallyValued: 0.85, // High incentive (timber, food, fiber)
    charismatic: 0.75,        // Public support (pandas, tigers, elephants)
    other: 0.30               // Low-profile species
  }
};

/**
 * 4. HIGH-VALUE COASTAL PROTECTION
 *
 * Evidence Quality: 🟡 MODERATE (reframed from Ocean Restoration)
 *
 * Research: Coastal restoration where benefit-cost >1
 * - Effectiveness: 15-25% of ocean crisis mitigation (reframed from 40-50%)
 * - Cost: Median $400K/ha (log-normal distribution)
 * - Scope: HIGH-VALUE COASTAL AREAS ONLY, not planetary ocean restoration
 *
 * User Insight: "Can't save the ocean, but coastlines are non-trivial"
 *
 * Multiple interventions needed:
 * - Coral restoration
 * - Kelp forest restoration
 * - Ocean alkalinity enhancement (coastal)
 * - Mangrove/seagrass restoration
 *
 * No single solution - portfolio approach required.
 *
 * Citations:
 * - Bayraktarov et al. (2016) "The cost and feasibility of marine coastal restoration"
 * - USGS Florida/Puerto Rico cost-benefit studies
 * - The Nature Conservancy coastal resilience projects
 */
export const COASTAL_PROTECTION_PARAMS = {
  effectiveness: {
    distribution: 'triangular' as const,
    min: 0.15,
    mode: 0.20,
    max: 0.25,
    unit: 'fraction of ocean crisis mitigation',
    scope: 'High-value coastal protection only, NOT planetary ocean restoration',
    citation: 'USGS Florida/Puerto Rico cost-benefit + Bayraktarov et al. (2016)'
  },
  costPerHectare: {
    distribution: 'log-normal' as const,
    mu: 12.9,     // ln($400K) ≈ 12.9
    sigma: 1.2,
    bounds: [13000, 1000000] as const,
    unit: 'USD per hectare',
    citation: 'Bayraktarov et al. (2016) median $400K/ha, range $13K-$1M'
  },
  deploymentTimeline: {
    distribution: 'triangular' as const,
    min: 24,
    mode: 48,
    max: 72,
    unit: 'months',
    citation: 'Restoration projects 2-6 years from planning to full deployment'
  }
};

/**
 * 5. CRISIS ANTICIPATION SYSTEMS
 *
 * Evidence Quality: 🟢 STRONG (upgraded from MODERATE)
 *
 * Research: AI early warning systems ALREADY OPERATIONAL (2024-2025)
 * - Pandemic prediction: 55-95% accuracy (operational systems)
 * - Drug discovery: AI antibody design working (AlphaFold, ESM)
 * - Climate prediction: 40-65% (moderate confidence)
 * - Supply chain: Commercial systems deployed
 *
 * User Insight: "Already happening - drug discovery, antibodies - why wouldn't it work for pandemics?"
 *
 * Key Advantage: 6-24 months early warning enables prevention/mitigation
 *
 * Domain-Specific Effectiveness:
 * - Biomedical (pandemic, drug discovery): HIGH (55-95%)
 * - Climate/environmental: MODERATE (40-65%)
 * - Supply chain/economic: MODERATE-HIGH (50-70%)
 *
 * Citations:
 * - AI pandemic prediction systems (BlueDot, ProMED, HealthMap 2024)
 * - AlphaFold 3, ESM-3 (protein structure → antibody design)
 * - Climate AI forecasting (DeepMind, NVIDIA Earth-2)
 */
export const CRISIS_ANTICIPATION_PARAMS = {
  overallEffectiveness: {
    distribution: 'triangular' as const,
    min: 0.15,
    mode: 0.22,
    max: 0.30,
    unit: 'fraction of crisis deaths prevented via early warning',
    citation: 'Multi-domain AI early warning systems (2024-2025)'
  },
  domainSpecific: {
    pandemic: { min: 0.55, max: 0.95 },      // High - operational systems
    drugDiscovery: 0.80,                     // High - AlphaFold, ESM proven
    climate: { min: 0.40, max: 0.65 },       // Moderate - longer timescales
    supplyChain: { min: 0.50, max: 0.70 }    // Moderate-high - commercial systems
  },
  leadTime: {
    distribution: 'triangular' as const,
    min: 6,
    mode: 12,
    max: 24,
    unit: 'months early warning before crisis peak',
    citation: 'BlueDot COVID-19 detection 9 days before WHO announcement'
  },
  deploymentTimeline: {
    distribution: 'triangular' as const,
    min: 12,
    mode: 24,
    max: 36,
    unit: 'months',
    note: 'Already partially operational (2024-2025)',
    citation: 'AI prediction systems active, integration into policy ongoing'
  }
};

/**
 * 6. NUCLEAR COMMAND SECURITY
 *
 * Evidence Quality: 🟡 MODERATE
 *
 * Research: Nunn-Lugar precedent + user domain knowledge
 * - Effectiveness: 85-97% (adjusted down from 99%)
 * - Attack vectors: Technical security 98%, human decision-maker manipulation 75%
 * - Cost: $40B initial, $2B/month operational
 *
 * User Insight: "Lots of ways in - AI manipulating strategic decision-maker is big one"
 *
 * Key Vulnerability: AI manipulating human decision-makers harder to defend than technical intrusion
 *
 * Nunn-Lugar Analogy (1991-2012):
 * - $8B spent to secure Soviet nuclear materials
 * - Eliminated 7,600 strategic nuclear warheads
 * - Deactivated 902 ICBMs, 33 submarines
 * - NO successful theft or diversion in 30 years
 *
 * Citations:
 * - Nunn-Lugar Cooperative Threat Reduction Program (1991-2012)
 * - Nuclear security gap analysis (Federation of American Scientists 2024)
 */
export const NUCLEAR_SECURITY_PARAMS = {
  effectiveness: {
    distribution: 'triangular' as const,
    min: 0.85,
    mode: 0.92,
    max: 0.97,
    note: 'NOT 99% - AI manipulating decision-makers is vulnerability',
    attackVectors: {
      technical: 0.98,           // Air-gapping, physical security effective
      humanDecisionMaker: 0.75   // Manipulation harder to defend
    },
    citation: 'Nunn-Lugar precedent + nuclear security gap analysis (FAS 2024)'
  },
  deploymentTimeline: {
    distribution: 'triangular' as const,
    min: 18,
    mode: 24,
    max: 36,
    unit: 'months',
    citation: 'Nunn-Lugar negotiation + deployment timeline (1991-1992)'
  },
  cost: {
    initial: 40e9,      // $40B (Nunn-Lugar $8B scaled to modern context)
    monthly: 2e9,       // $2B/month operational
    citation: 'Nunn-Lugar $8B over 20 years, scaled to 9 nuclear states'
  }
};

/**
 * 7. HUMAN-AI CENTAUR SYSTEMS
 *
 * Evidence Quality: 🟡 MODERATE
 *
 * Research: Acemoglu framework validated, NO empirical effect sizes
 * - Autonomy effect: 15-45% (wide uncertainty - uniform distribution)
 * - Meaning crisis reduction: 10-30% (wide uncertainty)
 * - Deployment: 48-72 months
 *
 * User Validation: "Augmentation preserves autonomy, that's what's happening here"
 *
 * Acemoglu Framework (2019):
 * - Automation: Displaces labor → unemployment → meaning crisis
 * - Augmentation: Enhances human capabilities → autonomy preserved → meaning maintained
 *
 * Wide Uniform Distribution Rationale:
 * - Framework validated but NO large-scale empirical studies
 * - Effect size genuinely uncertain
 * - Uniform [15%, 45%] reflects "anywhere in this range is equally plausible"
 *
 * Citations:
 * - Acemoglu & Restrepo (2019) "Automation and New Tasks"
 * - Brynjolfsson et al. (2023) "Generative AI at Work" (Microsoft case study)
 */
export const CENTAUR_SYSTEMS_PARAMS = {
  autonomyEffect: {
    distribution: 'uniform' as const,
    min: 0.15,
    max: 0.45,
    note: 'Wide uncertainty - no empirical effect sizes, framework validated',
    citation: 'Acemoglu & Restrepo (2019) framework + user domain knowledge'
  },
  meaningCrisisReduction: {
    distribution: 'uniform' as const,
    min: 0.10,
    max: 0.30,
    note: 'Indirect effect via autonomy preservation',
    citation: 'Meaning crisis tied to autonomy loss (Acemoglu 2019)'
  },
  deploymentTimeline: {
    distribution: 'triangular' as const,
    min: 48,
    mode: 60,
    max: 72,
    unit: 'months',
    citation: 'Cultural/institutional change required, 4-6 years'
  }
};

/**
 * 8. COMMUNITY COHESION PROGRAMS
 *
 * Evidence Quality: 🟡 MODERATE
 *
 * Research: Putnam "Bowling Alone" + intervention studies
 * - Community cohesion effect: 0.4-0.8% per month (triangular)
 * - Meaning crisis reduction: 0.15-0.35% per month (triangular)
 * - Deployment: 36-84 months
 *
 * User Validation: "We already modeled that deep community networks reduce meaning crisis"
 *
 * Putnam Framework (2000):
 * - Social capital decline: Associational memberships, civic engagement, trust all declining
 * - Intervention evidence: Community organizing, civic infrastructure investment effective
 *
 * Intervention Studies:
 * - AmeriCorps: 15% increase in civic engagement (1994-2020)
 * - Community development corps: 20-30% trust increase in 3 years
 * - Participatory budgeting: 25% increase in local civic engagement
 *
 * Citations:
 * - Putnam (2000) "Bowling Alone"
 * - AmeriCorps impact evaluations (1994-2020)
 * - Community Toolbox intervention evidence
 */
export const COMMUNITY_COHESION_PARAMS = {
  cohesionEffect: {
    distribution: 'triangular' as const,
    min: 0.4,
    mode: 0.6,
    max: 0.8,
    unit: '% per month increase in community cohesion',
    citation: 'Putnam (2000) + AmeriCorps evaluations (15-30% effects over 3 years)'
  },
  meaningCrisisReduction: {
    distribution: 'triangular' as const,
    min: 0.15,
    mode: 0.25,
    max: 0.35,
    unit: '% per month reduction in meaning crisis',
    citation: 'Community cohesion → meaning via social belonging (Putnam 2000)'
  },
  deploymentTimeline: {
    distribution: 'triangular' as const,
    min: 36,
    mode: 60,
    max: 84,
    unit: 'months',
    citation: 'Long-term cultural change, 3-7 years'
  }
};

/**
 * Sample all TIER 2 intervention parameters for a simulation run
 *
 * Called once at initialization to set epistemic uncertainty for this run.
 * All interventions use these sampled values throughout the simulation.
 *
 * @param rng - Deterministic RNG function (for reproducibility via seed)
 * @returns Sampled parameter values for all 8 interventions
 */
export interface Tier2InterventionParameters {
  interpretability: {
    controlLossPrevention: number;
    deploymentMonths: number;
    computeLagMonths: number;
  };
  darkCompute: {
    detectionRate: number;
    falsePositiveRate: number;
    deploymentMonths: number;
  };
  syntheticEcosystems: {
    recoveryMonths: number;
    crisisMitigation: number;
    costPerSpecies: number;
  };
  coastalProtection: {
    effectiveness: number;
    costPerHectare: number;
    deploymentMonths: number;
  };
  crisisAnticipation: {
    overallEffectiveness: number;
    leadTimeMonths: number;
    deploymentMonths: number;
  };
  nuclearSecurity: {
    effectiveness: number;
    deploymentMonths: number;
  };
  centaurSystems: {
    autonomyEffect: number;
    meaningCrisisReduction: number;
    deploymentMonths: number;
  };
  communityCohesion: {
    cohesionEffect: number;
    meaningCrisisReduction: number;
    deploymentMonths: number;
  };
}

export function sampleTier2InterventionParameters(rng: RNGFunction): Tier2InterventionParameters {
  // 1. AI INTERPRETABILITY ENSEMBLE
  const interpretability = {
    controlLossPrevention: sampleTriangular(
      AI_INTERPRETABILITY_PARAMS.controlLossPrevention.min,
      AI_INTERPRETABILITY_PARAMS.controlLossPrevention.mode,
      AI_INTERPRETABILITY_PARAMS.controlLossPrevention.max,
      rng
    ),
    deploymentMonths: sampleTriangular(
      AI_INTERPRETABILITY_PARAMS.deploymentTimeline.min,
      AI_INTERPRETABILITY_PARAMS.deploymentTimeline.mode,
      AI_INTERPRETABILITY_PARAMS.deploymentTimeline.max,
      rng
    ),
    computeLagMonths: sampleTriangular(
      AI_INTERPRETABILITY_PARAMS.computationalLag.min,
      AI_INTERPRETABILITY_PARAMS.computationalLag.mode,
      AI_INTERPRETABILITY_PARAMS.computationalLag.max,
      rng
    )
  };

  // 2. DARK COMPUTE MONITORING
  const darkCompute = {
    // Beta distribution bounded to [0.70, 0.95]
    detectionRate: sampleBeta(
      DARK_COMPUTE_MONITORING_PARAMS.detectionRate.alpha,
      DARK_COMPUTE_MONITORING_PARAMS.detectionRate.beta,
      rng
    ) * (DARK_COMPUTE_MONITORING_PARAMS.detectionRate.bounds[1] -
         DARK_COMPUTE_MONITORING_PARAMS.detectionRate.bounds[0]) +
         DARK_COMPUTE_MONITORING_PARAMS.detectionRate.bounds[0],
    falsePositiveRate: sampleTriangular(
      DARK_COMPUTE_MONITORING_PARAMS.falsePositiveRate.min,
      DARK_COMPUTE_MONITORING_PARAMS.falsePositiveRate.mode,
      DARK_COMPUTE_MONITORING_PARAMS.falsePositiveRate.max,
      rng
    ),
    deploymentMonths: sampleTriangular(
      DARK_COMPUTE_MONITORING_PARAMS.deploymentTimeline.min,
      DARK_COMPUTE_MONITORING_PARAMS.deploymentTimeline.mode,
      DARK_COMPUTE_MONITORING_PARAMS.deploymentTimeline.max,
      rng
    )
  };

  // 3. SYNTHETIC ECOSYSTEM SERVICES
  const syntheticEcosystems = {
    recoveryMonths: sampleTriangular(
      SYNTHETIC_ECOSYSTEM_PARAMS.recoveryTimeGranted.min,
      SYNTHETIC_ECOSYSTEM_PARAMS.recoveryTimeGranted.mode,
      SYNTHETIC_ECOSYSTEM_PARAMS.recoveryTimeGranted.max,
      rng
    ),
    crisisMitigation: sampleTriangular(
      SYNTHETIC_ECOSYSTEM_PARAMS.crisisMitigation.min,
      SYNTHETIC_ECOSYSTEM_PARAMS.crisisMitigation.mode,
      SYNTHETIC_ECOSYSTEM_PARAMS.crisisMitigation.max,
      rng
    ),
    // Log-normal bounded to [$10M, $100M]
    costPerSpecies: Math.min(
      Math.max(
        sampleLogNormal(
          SYNTHETIC_ECOSYSTEM_PARAMS.costPerSpecies.mu,
          SYNTHETIC_ECOSYSTEM_PARAMS.costPerSpecies.sigma,
          rng
        ),
        SYNTHETIC_ECOSYSTEM_PARAMS.costPerSpecies.bounds[0]
      ),
      SYNTHETIC_ECOSYSTEM_PARAMS.costPerSpecies.bounds[1]
    )
  };

  // 4. HIGH-VALUE COASTAL PROTECTION
  const coastalProtection = {
    effectiveness: sampleTriangular(
      COASTAL_PROTECTION_PARAMS.effectiveness.min,
      COASTAL_PROTECTION_PARAMS.effectiveness.mode,
      COASTAL_PROTECTION_PARAMS.effectiveness.max,
      rng
    ),
    // Log-normal bounded to [$13K, $1M]
    costPerHectare: Math.min(
      Math.max(
        sampleLogNormal(
          COASTAL_PROTECTION_PARAMS.costPerHectare.mu,
          COASTAL_PROTECTION_PARAMS.costPerHectare.sigma,
          rng
        ),
        COASTAL_PROTECTION_PARAMS.costPerHectare.bounds[0]
      ),
      COASTAL_PROTECTION_PARAMS.costPerHectare.bounds[1]
    ),
    deploymentMonths: sampleTriangular(
      COASTAL_PROTECTION_PARAMS.deploymentTimeline.min,
      COASTAL_PROTECTION_PARAMS.deploymentTimeline.mode,
      COASTAL_PROTECTION_PARAMS.deploymentTimeline.max,
      rng
    )
  };

  // 5. CRISIS ANTICIPATION SYSTEMS
  const crisisAnticipation = {
    overallEffectiveness: sampleTriangular(
      CRISIS_ANTICIPATION_PARAMS.overallEffectiveness.min,
      CRISIS_ANTICIPATION_PARAMS.overallEffectiveness.mode,
      CRISIS_ANTICIPATION_PARAMS.overallEffectiveness.max,
      rng
    ),
    leadTimeMonths: sampleTriangular(
      CRISIS_ANTICIPATION_PARAMS.leadTime.min,
      CRISIS_ANTICIPATION_PARAMS.leadTime.mode,
      CRISIS_ANTICIPATION_PARAMS.leadTime.max,
      rng
    ),
    deploymentMonths: sampleTriangular(
      CRISIS_ANTICIPATION_PARAMS.deploymentTimeline.min,
      CRISIS_ANTICIPATION_PARAMS.deploymentTimeline.mode,
      CRISIS_ANTICIPATION_PARAMS.deploymentTimeline.max,
      rng
    )
  };

  // 6. NUCLEAR COMMAND SECURITY
  const nuclearSecurity = {
    effectiveness: sampleTriangular(
      NUCLEAR_SECURITY_PARAMS.effectiveness.min,
      NUCLEAR_SECURITY_PARAMS.effectiveness.mode,
      NUCLEAR_SECURITY_PARAMS.effectiveness.max,
      rng
    ),
    deploymentMonths: sampleTriangular(
      NUCLEAR_SECURITY_PARAMS.deploymentTimeline.min,
      NUCLEAR_SECURITY_PARAMS.deploymentTimeline.mode,
      NUCLEAR_SECURITY_PARAMS.deploymentTimeline.max,
      rng
    )
  };

  // 7. HUMAN-AI CENTAUR SYSTEMS (wide uniform - genuine uncertainty)
  const centaurSystems = {
    autonomyEffect: sampleUniform(
      CENTAUR_SYSTEMS_PARAMS.autonomyEffect.min,
      CENTAUR_SYSTEMS_PARAMS.autonomyEffect.max,
      rng
    ),
    meaningCrisisReduction: sampleUniform(
      CENTAUR_SYSTEMS_PARAMS.meaningCrisisReduction.min,
      CENTAUR_SYSTEMS_PARAMS.meaningCrisisReduction.max,
      rng
    ),
    deploymentMonths: sampleTriangular(
      CENTAUR_SYSTEMS_PARAMS.deploymentTimeline.min,
      CENTAUR_SYSTEMS_PARAMS.deploymentTimeline.mode,
      CENTAUR_SYSTEMS_PARAMS.deploymentTimeline.max,
      rng
    )
  };

  // 8. COMMUNITY COHESION PROGRAMS
  const communityCohesion = {
    cohesionEffect: sampleTriangular(
      COMMUNITY_COHESION_PARAMS.cohesionEffect.min,
      COMMUNITY_COHESION_PARAMS.cohesionEffect.mode,
      COMMUNITY_COHESION_PARAMS.cohesionEffect.max,
      rng
    ),
    meaningCrisisReduction: sampleTriangular(
      COMMUNITY_COHESION_PARAMS.meaningCrisisReduction.min,
      COMMUNITY_COHESION_PARAMS.meaningCrisisReduction.mode,
      COMMUNITY_COHESION_PARAMS.meaningCrisisReduction.max,
      rng
    ),
    deploymentMonths: sampleTriangular(
      COMMUNITY_COHESION_PARAMS.deploymentTimeline.min,
      COMMUNITY_COHESION_PARAMS.deploymentTimeline.mode,
      COMMUNITY_COHESION_PARAMS.deploymentTimeline.max,
      rng
    )
  };

  return {
    interpretability,
    darkCompute,
    syntheticEcosystems,
    coastalProtection,
    crisisAnticipation,
    nuclearSecurity,
    centaurSystems,
    communityCohesion
  };
}
