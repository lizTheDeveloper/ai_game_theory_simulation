/**
 * P2.3: Heterogeneous Population Segment Utilities (Oct 16, 2025)
 * 
 * Provides functions for:
 * - Calculating population-weighted aggregates (representative of whole society)
 * - Calculating power-weighted aggregates (for policy decisions)
 * - Measuring polarization and elite-mass gaps
 * - Applying differential crisis impacts by segment vulnerability
 * 
 * Research: Pew Research Political Typology (2021-2024)
 */

import { GameState, SocietySegment, HumanSocietyAgent } from '@/types/game';

/**
 * Calculate population-weighted average of a segment attribute
 * Represents the "true" public opinion across all segments
 * 
 * @param segments Population segments
 * @param attribute Function to extract the attribute from each segment
 * @returns Population-weighted average [0,1]
 */
export function calculatePopulationWeightedAverage(
  segments: SocietySegment[],
  attribute: (seg: SocietySegment) => number
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const seg of segments) {
    weightedSum += attribute(seg) * seg.populationFraction;
    totalWeight += seg.populationFraction;
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Calculate power-weighted average of a segment attribute
 * Represents what policy decisions will reflect (elites have outsized influence)
 * 
 * @param segments Population segments
 * @param attribute Function to extract the attribute from each segment
 * @returns Power-weighted average [0,1]
 */
export function calculatePowerWeightedAverage(
  segments: SocietySegment[],
  attribute: (seg: SocietySegment) => number
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const seg of segments) {
    weightedSum += attribute(seg) * seg.politicalPower;
    totalWeight += seg.politicalPower;
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Calculate polarization index (variance in attitudes)
 * Higher values = more disagreement between segments
 * 
 * @param segments Population segments
 * @param attribute Function to extract the attribute from each segment
 * @returns Polarization index [0,1] (0 = consensus, 1 = maximum disagreement)
 */
export function calculatePolarizationIndex(
  segments: SocietySegment[],
  attribute: (seg: SocietySegment) => number
): number {
  const mean = calculatePopulationWeightedAverage(segments, attribute);
  
  let variance = 0;
  let totalWeight = 0;
  
  for (const seg of segments) {
    const diff = attribute(seg) - mean;
    variance += (diff * diff) * seg.populationFraction;
    totalWeight += seg.populationFraction;
  }
  
  const normalizedVariance = totalWeight > 0 ? variance / totalWeight : 0;
  
  // Convert variance to 0-1 scale
  // Max theoretical variance = 0.25 (when half at 0, half at 1)
  return Math.min(1.0, normalizedVariance * 4);
}

/**
 * Calculate elite-mass gap
 * Difference between elite segment attitudes and mass (non-elite) attitudes
 * 
 * @param segments Population segments
 * @param attribute Function to extract the attribute from each segment
 * @returns Elite-mass gap [-1, 1] (positive = elites higher, negative = masses higher)
 */
export function calculateEliteMassGap(
  segments: SocietySegment[],
  attribute: (seg: SocietySegment) => number
): number {
  // Find elite segments (economicStatus === 'elite')
  const eliteSegments = segments.filter(seg => seg.economicStatus === 'elite');
  const nonEliteSegments = segments.filter(seg => seg.economicStatus !== 'elite');
  
  if (eliteSegments.length === 0 || nonEliteSegments.length === 0) {
    return 0;
  }
  
  // Calculate averages
  const eliteAvg = calculatePopulationWeightedAverage(eliteSegments, attribute);
  const massAvg = calculatePopulationWeightedAverage(nonEliteSegments, attribute);
  
  return eliteAvg - massAvg;
}

/**
 * Update society aggregates from segments
 * Recalculates all aggregate values (trustInAI, power-weighted values, polarization, etc.)
 * 
 * @param state Game state with society.segments
 */
export function updateSocietyAggregates(state: GameState): void {
  const society = state.society;
  
  if (!society.segments || society.segments.length === 0) {
    return; // No segments, use existing values
  }
  
  // Population-weighted aggregates (backward compatibility)
  society.trustInAI = calculatePopulationWeightedAverage(
    society.segments,
    seg => seg.trustInAI
  );
  
  // Power-weighted aggregates (for policy decisions)
  society.powerWeightedTrustInAI = calculatePowerWeightedAverage(
    society.segments,
    seg => seg.trustInAI
  );
  
  society.powerWeightedTrustInGovernment = calculatePowerWeightedAverage(
    society.segments,
    seg => seg.trustInGovernment
  );
  
  // Polarization metrics
  society.polarizationIndex = calculatePolarizationIndex(
    society.segments,
    seg => seg.trustInAI
  );
  
  society.eliteMassGap = calculateEliteMassGap(
    society.segments,
    seg => seg.trustInAI
  );
}

/**
 * Apply differential crisis mortality by segment vulnerability
 * More vulnerable segments (working class, rural, precariat) die at higher rates
 * 
 * @param state Game state
 * @param baseMortalityRate Base mortality rate for average vulnerability (0-1)
 * @returns Segment-specific mortality rates
 */
export function calculateSegmentMortality(
  state: GameState,
  baseMortalityRate: number
): Map<string, number> {
  const segmentMortality = new Map<string, number>();
  
  if (!state.society.segments || state.society.segments.length === 0) {
    return segmentMortality;
  }
  
  for (const seg of state.society.segments) {
    // Mortality scales with vulnerability
    // vulnerability = 0.5 (average) → 1.0x mortality
    // vulnerability = 1.0 (max) → 2.0x mortality
    // vulnerability = 0.0 (min) → 0.0x mortality
    const vulnerabilityMultiplier = seg.crisisVulnerability * 2.0;
    
    // Survival rate further modifies mortality
    // survivalRate = 1.5 (elite) → 0.67x mortality
    // survivalRate = 0.5 (precariat) → 2.0x mortality
    const survivalMultiplier = 1.0 / seg.survivalRate;
    
    // Combined effect
    const segmentMortality Rate = baseMortalityRate * vulnerabilityMultiplier * survivalMultiplier;
    
    segmentMortality.set(seg.id, Math.min(1.0, segmentMortalityRate));
  }
  
  return segmentMortality;
}

/**
 * Apply differential crisis impacts to segment attributes
 * Crises affect segments differently based on vulnerability and adaptability
 * 
 * @param state Game state
 * @param crisisIntensity Crisis intensity [0,1] (0 = minor, 1 = catastrophic)
 */
export function applyCrisisImpactsToSegments(
  state: GameState,
  crisisIntensity: number
): void {
  if (!state.society.segments || state.society.segments.length === 0) {
    return;
  }
  
  for (const seg of state.society.segments) {
    // Trust erosion scales with vulnerability
    // Vulnerable segments lose trust faster during crises
    const trustErosion = crisisIntensity * seg.crisisVulnerability * 0.05;
    seg.trustInAI = Math.max(0.1, seg.trustInAI - trustErosion);
    seg.trustInGovernment = Math.max(0.1, seg.trustInGovernment - trustErosion);
    
    // Openness decreases (people become more defensive)
    // But high-adaptability segments bounce back faster
    const opennessLoss = crisisIntensity * (1.0 - seg.adaptability) * 0.03;
    seg.openness = Math.max(0.1, seg.openness - opennessLoss);
  }
  
  // Recalculate aggregates after segment changes
  updateSocietyAggregates(state);
}

/**
 * Apply recovery effects to segments
 * After crises subside, segments recover at different rates
 * 
 * @param state Game state
 * @param recoveryRate Recovery rate per month [0,1]
 */
export function applySegmentRecovery(
  state: GameState,
  recoveryRate: number
): void {
  if (!state.society.segments || state.society.segments.length === 0) {
    return;
  }
  
  for (const seg of state.society.segments) {
    // Trust recovery scales with adaptability
    // High-adaptability segments (elites, middle class) recover faster
    const trustRecovery = recoveryRate * seg.adaptability * 0.02;
    
    // Recover toward segment baseline (not above)
    // This prevents infinite growth
    const maxTrust = seg.economicStatus === 'elite' ? 0.85 :
                     seg.economicStatus === 'middle' ? 0.70 :
                     seg.economicStatus === 'working' ? 0.55 : 0.40;
    
    seg.trustInAI = Math.min(maxTrust, seg.trustInAI + trustRecovery);
    seg.trustInGovernment = Math.min(maxTrust, seg.trustInGovernment + trustRecovery);
    
    // Openness recovers slowly
    const maxOpenness = seg.economicStatus === 'elite' ? 0.95 :
                        seg.economicStatus === 'middle' ? 0.70 :
                        seg.economicStatus === 'working' ? 0.50 : 0.35;
    
    seg.openness = Math.min(maxOpenness, seg.openness + recoveryRate * 0.01);
  }
  
  // Recalculate aggregates after segment changes
  updateSocietyAggregates(state);
}

