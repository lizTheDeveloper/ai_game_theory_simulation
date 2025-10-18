/**
 * Early Warning Systems for Tipping Points (TIER 3.4, Oct 17, 2025)
 *
 * Implements detection and emergency intervention for approaching tipping points.
 * Uses critical slowing down indicators (TipESM) + IPCC methodologies.
 *
 * Research backing:
 * - TipESM Project (2020-2024): Early warning indicators, TRL 7
 * - IPCC AR6 WG1 (2023): Detection methodologies, TRL 8
 * - Nature Climate Change (2024): Critical infrastructure cascades detectable 1-5 years ahead
 * - REFIT (2024): Graph coloring framework, 5-15% nodes control 80% cascades
 *
 * Key mechanics:
 * - Detection window: 6-24 months (0.8-0.95 threshold)
 * - Golden hour interventions: 60-80% success rate
 * - Prevention effectiveness: 10-100x better than post-crisis recovery
 * - Detection quality scales with government investment (0.3-0.9)
 */

import { GameState, RNGFunction } from '@/types/game';
import {
  EarlyWarningSystem,
  TippingPointEarlyWarning,
  EmergencyIntervention,
  CriticalInfrastructureNode,
  BoundaryName,
  PlanetaryBoundary
} from '@/types/planetaryBoundaries';

/**
 * Initialize early warning system
 *
 * Sets up detection infrastructure with baseline quality.
 * Quality scales with government investment in monitoring.
 */
export function initializeEarlyWarningSystem(): EarlyWarningSystem {
  return {
    activeWarnings: [],
    detectionQuality: 0.5,                    // Baseline (improves with investment)
    falsePositiveRate: 0.25,                  // TipESM: <30% acceptable
    falseNegativeRate: 0.20,                  // More dangerous than false positives

    interventionsDeployed: [],
    interventionsSuccessful: 0,
    interventionsFailed: 0,

    goldenHourInterventions: 0,
    lateInterventions: 0,

    criticalNodes: initializeCriticalInfrastructure(),
    nodesProtected: 0,
    cascadeRiskReduction: 0,
  };
}

/**
 * Initialize critical infrastructure network
 *
 * Uses graph coloring framework (REFIT 2024).
 * 5-15% of nodes control 80% of cascade risk.
 */
function initializeCriticalInfrastructure(): CriticalInfrastructureNode[] {
  // Create representative critical nodes (would be expanded with real data)
  const nodes: CriticalInfrastructureNode[] = [
    // Water infrastructure (highest betweenness - interconnected globally)
    { id: 'water-aquifer-network', type: 'water', betweennessCentrality: 0.95, protected: false, resilience: 0.5, redundancy: 0.3, cascadeMultiplier: 0.7 },
    { id: 'water-desalination-grid', type: 'water', betweennessCentrality: 0.75, protected: false, resilience: 0.6, redundancy: 0.4, cascadeMultiplier: 0.8 },

    // Energy infrastructure (second-highest - powers all other systems)
    { id: 'energy-grid-backbone', type: 'energy', betweennessCentrality: 0.90, protected: false, resilience: 0.5, redundancy: 0.5, cascadeMultiplier: 0.75 },
    { id: 'energy-renewable-storage', type: 'energy', betweennessCentrality: 0.70, protected: false, resilience: 0.6, redundancy: 0.3, cascadeMultiplier: 0.85 },

    // Food infrastructure (third - depends on water + energy)
    { id: 'food-supply-chain', type: 'food', betweennessCentrality: 0.85, protected: false, resilience: 0.4, redundancy: 0.3, cascadeMultiplier: 0.75 },
    { id: 'food-agricultural-system', type: 'food', betweennessCentrality: 0.80, protected: false, resilience: 0.5, redundancy: 0.2, cascadeMultiplier: 0.8 },

    // Climate stabilization (fourth - affects all)
    { id: 'climate-carbon-sinks', type: 'climate', betweennessCentrality: 0.88, protected: false, resilience: 0.3, redundancy: 0.2, cascadeMultiplier: 0.7 },

    // Biodiversity (fifth - ecosystem services)
    { id: 'biodiversity-pollinator-networks', type: 'biodiversity', betweennessCentrality: 0.78, protected: false, resilience: 0.4, redundancy: 0.2, cascadeMultiplier: 0.8 },
  ];

  return nodes;
}

/**
 * Update early warning system detection
 *
 * Scans planetary boundaries for critical slowing down indicators.
 * Generates warnings for boundaries in golden hour window (0.8-0.95).
 *
 * Research: TipESM critical slowing down + IPCC ensemble methods
 */
export function updateEarlyWarningDetection(state: GameState, rng: RNGFunction): void {
  const system = state.planetaryBoundariesSystem;
  if (!system || !system.earlyWarning) return;

  const earlyWarning = system.earlyWarning;
  const boundaries = system.boundaries;

  // === 1. UPDATE DETECTION QUALITY (scales with government investment) ===
  // Research: IPCC (2023) - monitoring quality ranges 0.3-0.9 based on investment
  const govInvestment = state.government.researchInvestments?.environmental ?? 0;
  const aiCapability = getMaxAIResearchCapability(state, 'climate');

  // Detection quality improves with investment + AI assistance
  const baseQuality = 0.3 + (govInvestment * 0.4);                    // 0.3-0.7 from investment
  const aiBoost = Math.min(0.2, aiCapability * 0.1);                  // Up to +0.2 from AI
  earlyWarning.detectionQuality = Math.min(0.9, baseQuality + aiBoost);

  // False positive/negative rates decrease with quality
  earlyWarning.falsePositiveRate = Math.max(0.10, 0.40 - earlyWarning.detectionQuality * 0.3);
  earlyWarning.falseNegativeRate = Math.max(0.05, 0.30 - earlyWarning.detectionQuality * 0.25);

  // === 2. SCAN BOUNDARIES FOR WARNINGS ===
  const newWarnings: TippingPointEarlyWarning[] = [];

  for (const boundaryName of Object.keys(boundaries) as BoundaryName[]) {
    const boundary = boundaries[boundaryName];
    if (!boundary) continue;

    const currentLevel = boundary.currentValue;

    // Golden hour window: 0.8-0.95 of critical threshold (normalized boundary = 1.0)
    const goldenHourStart = 0.8;
    const goldenHourEnd = 0.95;

    if (currentLevel >= goldenHourStart && currentLevel <= goldenHourEnd) {
      // === CALCULATE CRITICAL SLOWING DOWN INDICATORS (TipESM) ===
      const warning = detectTippingPointWarning(
        state,
        boundary,
        earlyWarning.detectionQuality,
        rng
      );

      if (warning) {
        newWarnings.push(warning);
      }
    } else if (currentLevel > goldenHourEnd) {
      // Beyond golden hour - late warning (less effective intervention window)
      const warning = detectTippingPointWarning(
        state,
        boundary,
        earlyWarning.detectionQuality * 0.7, // Detection harder after golden hour
        rng
      );

      if (warning) {
        warning.warningLevel = 'red'; // Urgent - already past golden hour
        newWarnings.push(warning);
      }
    }
  }

  // === 3. UPDATE ACTIVE WARNINGS ===
  earlyWarning.activeWarnings = newWarnings;

  // === 4. LOG NEW WARNINGS ===
  const newCriticalWarnings = newWarnings.filter(w => w.warningLevel === 'red' || w.warningLevel === 'orange');
  if (newCriticalWarnings.length > 0) {
    console.log(`\n⚠️  === EARLY WARNING SYSTEM - ${newCriticalWarnings.length} CRITICAL ALERTS ===`);
    console.log(`   Detection quality: ${(earlyWarning.detectionQuality * 100).toFixed(0)}%`);
    for (const warning of newCriticalWarnings) {
      const inGoldenHour = warning.currentLevel >= 0.8 && warning.currentLevel <= 0.95;
      console.log(`   ${warning.warningLevel.toUpperCase()}: ${warning.boundaryName}`);
      console.log(`      Level: ${warning.currentLevel.toFixed(2)} (threshold: 1.0)`);
      console.log(`      Time to critical: ~${warning.monthsUntilCritical} months`);
      console.log(`      ${inGoldenHour ? '✅ GOLDEN HOUR - Intervention effective' : '⚠️  LATE - Intervention less effective'}`);
      console.log(`      Critical slowing down: autocorr=${(warning.autocorrelation * 100).toFixed(0)}% variance=${(warning.variance * 100).toFixed(0)}%`);
    }
    console.log('');
  }
}

/**
 * Detect tipping point warning for a specific boundary
 *
 * Calculates critical slowing down indicators + IPCC metrics.
 * Returns warning if detection succeeds (accounts for false negatives).
 */
function detectTippingPointWarning(
  state: GameState,
  boundary: PlanetaryBoundary,
  detectionQuality: number,
  rng: RNGFunction
): TippingPointEarlyWarning | null {
  // False negative check (missed warning)
  const falseNegativeRate = Math.max(0.05, 0.30 - detectionQuality * 0.25);
  if (rng() < falseNegativeRate) {
    return null; // Missed this warning
  }

  // === CRITICAL SLOWING DOWN INDICATORS (TipESM) ===
  // Research: TipESM (2020-2024) - system recovery time increases near tipping points

  // Autocorrelation: increases as system approaches tipping point (slower recovery)
  // Proxy: currentValue proximity to threshold
  const proximityToThreshold = Math.max(0, (boundary.currentValue - 0.8) / (1.0 - 0.8));
  const autocorrelation = Math.min(1.0, 0.3 + proximityToThreshold * 0.6 + (rng() - 0.5) * 0.2);

  // Variance: fluctuations increase near tipping point
  // Proxy: interaction strength (highly interactive boundaries fluctuate more)
  const variance = Math.min(1.0, 0.2 + boundary.interactionStrength * 0.5 + (rng() - 0.5) * 0.3);

  // Flickering: oscillations between states increase near bifurcation
  // Proxy: trend instability (worsening boundaries flicker less than stabilizing ones)
  const flickering = boundary.trend === 'worsening'
    ? 0.3 + (rng() - 0.5) * 0.2
    : 0.6 + (rng() - 0.5) * 0.3;

  // === IPCC INDICATORS ===
  // Model disagreement: ensemble spread increases near tipping points
  // Proxy: tipping point risk (higher risk = more uncertainty)
  const modelDisagreement = Math.min(1.0, boundary.tippingPointRisk * 0.8 + (rng() - 0.5) * 0.2);

  // Rate of change: acceleration metric
  // Proxy: months breached (longer breached = faster deterioration)
  const monthsBreachedNormalized = Math.min(1.0, boundary.monthsBreached / (50 * 12)); // Normalize to 50 years
  const rateOfChange = Math.min(1.0, monthsBreachedNormalized * 0.6 + (rng() - 0.5) * 0.2);

  // === COMPOSITE WARNING SCORE ===
  // Research: TipESM weighting (autocorr 25%, variance 25%, flickering 20%, disagreement 15%, rate 15%)
  const warningScore = (
    autocorrelation * 0.25 +
    variance * 0.25 +
    flickering * 0.20 +
    modelDisagreement * 0.15 +
    rateOfChange * 0.15
  );

  // === WARNING LEVEL CLASSIFICATION ===
  let warningLevel: 'yellow' | 'orange' | 'red';
  let monthsUntilCritical: number;

  if (warningScore > 0.7) {
    warningLevel = 'red';                     // Imminent (1-2 years)
    monthsUntilCritical = 12 + Math.floor(rng() * 12); // 12-24 months
  } else if (warningScore > 0.5) {
    warningLevel = 'orange';                  // Likely (3-5 years)
    monthsUntilCritical = 36 + Math.floor(rng() * 24); // 36-60 months
  } else {
    warningLevel = 'yellow';                  // Possible (5-10 years)
    monthsUntilCritical = 60 + Math.floor(rng() * 60); // 60-120 months
  }

  return {
    boundaryName: boundary.name,
    currentLevel: boundary.currentValue,
    detectionThreshold: 0.85,                 // Golden hour midpoint

    autocorrelation,
    variance,
    flickering,
    modelDisagreement,
    rateOfChange,

    warningLevel,
    monthsUntilCritical,

    interventionDeployed: false,
    interventionMonth: null,
    interventionType: null,
  };
}

/**
 * Get maximum AI research capability for a specific domain
 */
function getMaxAIResearchCapability(state: GameState, domain: string): number {
  let maxCapability = 0;

  for (const ai of state.aiAgents) {
    if (ai.lifecycle === 'deployed') {
      const capability = ai.capabilities.research ?? 0;
      maxCapability = Math.max(maxCapability, capability);
    }
  }

  return maxCapability;
}

/**
 * Protect critical infrastructure nodes
 *
 * Government hardening of critical nodes reduces cascade risk.
 * Research: REFIT (2024) - 5-15% of nodes control 80% of cascades
 */
export function protectCriticalInfrastructure(state: GameState): void {
  const system = state.planetaryBoundariesSystem;
  if (!system || !system.earlyWarning) return;

  const earlyWarning = system.earlyWarning;
  const gov = state.government;

  // Cost: 0.1% GDP per critical node (REFIT 2024)
  const totalNodes = earlyWarning.criticalNodes.length;
  const unprotectedNodes = earlyWarning.criticalNodes.filter(n => !n.protected);
  const protectionCost = unprotectedNodes.length * 0.001; // 0.1% GDP per node

  // Government decides to protect if resources available and warnings active
  const urgentWarnings = earlyWarning.activeWarnings.filter(
    w => w.warningLevel === 'red' || w.warningLevel === 'orange'
  );

  if (urgentWarnings.length > 0 && gov.resources > protectionCost) {
    // Protect all unprotected nodes
    for (const node of unprotectedNodes) {
      node.protected = true;
      node.resilience += 0.3;                 // +30% failure threshold
      node.redundancy += 0.2;                 // +20% backup capacity
      earlyWarning.nodesProtected++;
    }

    gov.resources -= protectionCost;

    // Calculate cascade risk reduction
    // Research: One Earth (2024) - critical node protection → 30% cascade reduction
    const protectionFraction = earlyWarning.nodesProtected / totalNodes;
    earlyWarning.cascadeRiskReduction = Math.min(0.5, protectionFraction * 0.3);

    // Apply reduction to planetary boundaries cascade risk
    system.tippingPointRisk = Math.max(0, system.tippingPointRisk * (1 - earlyWarning.cascadeRiskReduction));

    console.log(`\n🛡️  CRITICAL INFRASTRUCTURE PROTECTED`);
    console.log(`   Nodes hardened: ${earlyWarning.nodesProtected}/${totalNodes}`);
    console.log(`   Cost: ${(protectionCost * 100).toFixed(2)}% GDP`);
    console.log(`   Cascade risk reduction: ${(earlyWarning.cascadeRiskReduction * 100).toFixed(0)}%`);
    console.log(`   New tipping point risk: ${(system.tippingPointRisk * 100).toFixed(1)}%\n`);
  }
}

/**
 * Emergency intervention design
 *
 * Maps tipping points to specific interventions.
 * Research: Plan intervention types and costs
 */
export function designEmergencyIntervention(
  warning: TippingPointEarlyWarning,
  state: GameState,
  rng: RNGFunction
): EmergencyIntervention | null {
  // Intervention mapping (from plan)
  const interventionMap: Record<string, {
    type: string;
    actions: string[];
    gdpCost: number;
    effectiveness: number;
  }> = {
    'climate_change': {
      type: 'rapid-decarbonization',
      actions: ['emergency-renewable-deployment', 'fossil-fuel-phase-out'],
      gdpCost: 0.05,
      effectiveness: 0.60,
    },
    'ocean_acidification': {
      type: 'ocean-alkalinity-enhancement',
      actions: ['emergency-limestone-deployment', 'emissions-reduction'],
      gdpCost: 0.03,
      effectiveness: 0.70,
    },
    'freshwater_change': {
      type: 'emergency-desalination',
      actions: ['desalination-deployment', 'water-conservation-mandates'],
      gdpCost: 0.04,
      effectiveness: 0.75,
    },
    'biosphere_integrity': {
      type: 'emergency-protected-areas',
      actions: ['habitat-protection', 'species-translocation'],
      gdpCost: 0.02,
      effectiveness: 0.50,
    },
    'biogeochemical_flows': {
      type: 'phosphorus-recovery',
      actions: ['circular-agriculture', 'fertilizer-efficiency'],
      gdpCost: 0.02,
      effectiveness: 0.65,
    },
    'land_system_change': {
      type: 'reforestation',
      actions: ['forest-restoration', 'deforestation-ban'],
      gdpCost: 0.03,
      effectiveness: 0.60,
    },
    'novel_entities': {
      type: 'pollution-remediation',
      actions: ['PFAS-remediation', 'microplastic-cleanup'],
      gdpCost: 0.04,
      effectiveness: 0.55,
    },
  };

  const config = interventionMap[warning.boundaryName];
  if (!config) return null;

  // Adjust effectiveness based on warning level (earlier = better)
  let effectiveness = config.effectiveness;
  if (warning.currentLevel > 0.95) {
    effectiveness *= 0.7;                     // Late intervention (past golden hour)
  } else if (warning.currentLevel < 0.85) {
    effectiveness *= 1.1;                     // Early intervention (optimal window)
  }

  // Add AI boost if advanced AI available
  const aiCapability = getMaxAIResearchCapability(state, 'climate');
  if (aiCapability > 2.5) {
    effectiveness = Math.min(0.95, effectiveness * (1 + aiCapability * 0.05));
  }

  return {
    tippingPoint: warning.boundaryName,
    type: config.type,
    deployedMonth: state.currentMonth,
    warningLevel: warning.warningLevel,
    gdpCost: config.gdpCost,
    deploymentTime: 6 + Math.floor(rng() * 6), // 6-12 months
    effectiveness: Math.min(0.95, effectiveness),
    actualSuccess: null,                      // Determined during deployment
    actions: config.actions,
  };
}

/**
 * Apply emergency intervention effects
 *
 * Executes intervention and determines success.
 * Research: 60-80% success during golden hour, 10-100x better than recovery
 */
export function applyEmergencyIntervention(
  state: GameState,
  intervention: EmergencyIntervention,
  rng: RNGFunction
): void {
  const system = state.planetaryBoundariesSystem;
  if (!system || !system.earlyWarning) return;

  const boundary = system.boundaries[intervention.tippingPoint];
  if (!boundary) return;

  // Determine success (stochastic based on effectiveness)
  const success = rng() < intervention.effectiveness;
  intervention.actualSuccess = success;

  if (success) {
    // Successful intervention - reduce boundary value
    const reduction = 0.1 + (rng() * 0.1); // 10-20% reduction
    boundary.currentValue = Math.max(0, boundary.currentValue - reduction);

    system.earlyWarning.interventionsSuccessful++;

    console.log(`\n✅ EMERGENCY INTERVENTION SUCCESS`);
    console.log(`   Boundary: ${intervention.tippingPoint}`);
    console.log(`   Type: ${intervention.type}`);
    console.log(`   Reduction: ${(reduction * 100).toFixed(0)}% (${boundary.currentValue.toFixed(2)} → ${(boundary.currentValue - reduction).toFixed(2)})`);
    console.log(`   Cost: ${(intervention.gdpCost * 100).toFixed(1)}% GDP`);
    console.log(`   Actions: ${intervention.actions.join(', ')}\n`);
  } else {
    // Failed intervention - boundary continues to worsen
    system.earlyWarning.interventionsFailed++;

    console.log(`\n❌ EMERGENCY INTERVENTION FAILED`);
    console.log(`   Boundary: ${intervention.tippingPoint}`);
    console.log(`   Type: ${intervention.type}`);
    console.log(`   Boundary continues to worsen (${boundary.currentValue.toFixed(2)})`);
    console.log(`   Cost: ${(intervention.gdpCost * 100).toFixed(1)}% GDP (resources spent)\n`);
  }
}
