/**
 * Regional Tech Deployment System
 * 
 * Manages how technologies deploy differently across regions based on:
 * - Regional needs (desalination helps coastal regions, not inland)
 * - Economic capacity (wealthy regions deploy faster)
 * - Infrastructure (developed regions have better deployment)
 * - Geographic factors (solar works better in sunny regions)
 * - Political factors (authoritarian vs democratic deployment)
 */

import { GameState } from '@/types/game';
import { TechDefinition } from './comprehensiveTechTree';
import { RegionalTechDeployment } from './engine';

export interface RegionalFactors {
  region: string;
  economicCapacity: number;    // [0, 1] GDP per capita, wealth
  infrastructure: number;      // [0, 1] Roads, power grid, internet
  politicalStability: number;  // [0, 1] Government effectiveness
  geographicRelevance: number; // [0, 1] How relevant is this tech to this region
  deploymentSpeed: number;     // [0, 2] Multiplier for deployment speed
  costMultiplier: number;      // [0.5, 2] Cost modifier for this region
}

// Regional factors for each major region
export const REGIONAL_FACTORS: Map<string, RegionalFactors> = new Map([
  ['Asia', {
    region: 'Asia',
    economicCapacity: 0.6,      // Mixed: China/Japan wealthy, others developing
    infrastructure: 0.7,        // Good in developed areas, poor in rural
    politicalStability: 0.5,    // Mixed: stable China, unstable others
    geographicRelevance: 0.8,   // High: large population, diverse needs
    deploymentSpeed: 1.2,       // Fast: large markets, government support
    costMultiplier: 0.8,        // Cheap: manufacturing base, economies of scale
  }],
  ['Africa', {
    region: 'Africa',
    economicCapacity: 0.3,      // Low: many poor countries
    infrastructure: 0.4,        // Poor: limited roads, power, internet
    politicalStability: 0.4,    // Low: many unstable governments
    geographicRelevance: 0.9,   // Very high: needs all tech for development
    deploymentSpeed: 0.6,       // Slow: limited capacity
    costMultiplier: 1.5,        // Expensive: poor infrastructure, corruption
  }],
  ['South America', {
    region: 'South America',
    economicCapacity: 0.5,      // Medium: some wealthy, some poor
    infrastructure: 0.6,        // Medium: urban good, rural poor
    politicalStability: 0.6,    // Medium: generally stable democracies
    geographicRelevance: 0.8,   // High: diverse geography, needs
    deploymentSpeed: 0.8,       // Medium: moderate capacity
    costMultiplier: 1.1,        // Slightly expensive: import costs
  }],
  ['North America', {
    region: 'North America',
    economicCapacity: 0.9,      // High: US/Canada wealthy
    infrastructure: 0.9,        // Excellent: developed infrastructure
    politicalStability: 0.8,    // High: stable democracies
    geographicRelevance: 0.7,   // Medium: already developed
    deploymentSpeed: 1.5,       // Very fast: strong institutions
    costMultiplier: 1.0,        // Standard: efficient markets
  }],
  ['Europe', {
    region: 'Europe',
    economicCapacity: 0.8,      // High: wealthy developed countries
    infrastructure: 0.9,        // Excellent: well-developed
    politicalStability: 0.9,    // Very high: stable democracies
    geographicRelevance: 0.6,   // Medium: already developed
    deploymentSpeed: 1.3,       // Fast: strong institutions, EU coordination
    costMultiplier: 1.2,        // Expensive: high labor costs, regulations
  }],
  ['Oceania', {
    region: 'Oceania',
    economicCapacity: 0.7,      // High: Australia/NZ wealthy
    infrastructure: 0.8,        // Good: developed but remote
    politicalStability: 0.9,    // Very high: stable democracies
    geographicRelevance: 0.8,   // High: unique challenges (isolation, climate)
    deploymentSpeed: 1.0,       // Standard: good but small markets
    costMultiplier: 1.3,        // Expensive: remote, small markets
  }],
  ['global', {
    region: 'global',
    economicCapacity: 1.0,      // Global average
    infrastructure: 1.0,        // Global average
    politicalStability: 1.0,    // Global average
    geographicRelevance: 1.0,   // All regions
    deploymentSpeed: 1.0,       // Standard
    costMultiplier: 1.0,        // Standard
  }],
]);

/**
 * Calculate regional relevance for a specific technology
 */
export function calculateRegionalRelevance(tech: TechDefinition, region: string): number {
  const factors = REGIONAL_FACTORS.get(region);
  if (!factors) return 0.5; // Default relevance
  
  let relevance = 0.5; // Base relevance
  
  // Technology-specific regional relevance
  switch (tech.category) {
    case 'environmental':
      // Environmental tech is more relevant to regions with environmental problems
      if (region === 'Africa') relevance = 0.9; // High environmental stress
      if (region === 'Asia') relevance = 0.8;   // High pollution, population
      if (region === 'South America') relevance = 0.9; // Amazon protection
      if (region === 'Oceania') relevance = 0.8; // Coral reefs, climate
      break;
      
    case 'energy':
      // Energy tech relevance varies by region
      if (region === 'Africa') relevance = 0.9; // Energy poverty
      if (region === 'Asia') relevance = 0.8;   // High energy demand
      if (region === 'Europe') relevance = 0.7; // Energy transition
      if (region === 'North America') relevance = 0.6; // Already developed
      break;
      
    case 'water':
      // Water tech is highly relevant to water-stressed regions
      if (region === 'Africa') relevance = 0.9; // Water scarcity
      if (region === 'Asia') relevance = 0.8;   // Large populations, water stress
      if (region === 'Oceania') relevance = 0.7; // Drought-prone
      if (region === 'Europe') relevance = 0.6; // Generally water-rich
      if (region === 'North America') relevance = 0.5; // Generally water-rich
      break;
      
    case 'agriculture':
      // Agriculture tech is more relevant to agricultural regions
      if (region === 'Africa') relevance = 0.9; // Food security
      if (region === 'Asia') relevance = 0.8;   // Large populations
      if (region === 'South America') relevance = 0.8; // Major food producer
      if (region === 'Europe') relevance = 0.6; // Developed agriculture
      if (region === 'North America') relevance = 0.7; // Major food producer
      break;
      
    case 'medical':
      // Medical tech is more relevant to regions with health challenges
      if (region === 'Africa') relevance = 0.9; // High disease burden
      if (region === 'Asia') relevance = 0.7;   // Large populations
      if (region === 'South America') relevance = 0.7; // Mixed health systems
      if (region === 'Europe') relevance = 0.6; // Good health systems
      if (region === 'North America') relevance = 0.6; // Good health systems
      break;
      
    case 'social':
      // Social tech is more relevant to regions with social challenges
      if (region === 'Africa') relevance = 0.8; // Social development needs
      if (region === 'Asia') relevance = 0.7;   // Large populations, social issues
      if (region === 'South America') relevance = 0.7; // Inequality, social issues
      if (region === 'Europe') relevance = 0.6; // Generally good social systems
      if (region === 'North America') relevance = 0.6; // Generally good social systems
      break;
      
    case 'ai_safety':
      // AI safety is more relevant to regions with AI development
      if (region === 'North America') relevance = 0.9; // Major AI companies
      if (region === 'Asia') relevance = 0.8;   // China, Japan AI development
      if (region === 'Europe') relevance = 0.7; // EU AI regulation
      if (region === 'Oceania') relevance = 0.6; // Limited AI development
      if (region === 'Africa') relevance = 0.5; // Limited AI development
      if (region === 'South America') relevance = 0.5; // Limited AI development
      break;
      
    default:
      relevance = 0.5; // Default relevance
  }
  
  // Specific technology adjustments
  if (tech.id.includes('desalination') || tech.id.includes('water')) {
    // Water tech is more relevant to coastal/arid regions
    if (region === 'Africa') relevance = 0.9; // Water scarcity
    if (region === 'Asia') relevance = 0.8;   // Water stress
    if (region === 'Oceania') relevance = 0.7; // Drought-prone
    if (region === 'Europe') relevance = 0.4; // Generally water-rich
    if (region === 'North America') relevance = 0.5; // Mixed
  }
  
  if (tech.id.includes('solar') || tech.id.includes('renewable')) {
    // Solar tech is more relevant to sunny regions
    if (region === 'Africa') relevance = 0.9; // High solar potential
    if (region === 'Asia') relevance = 0.7;   // Good solar potential
    if (region === 'South America') relevance = 0.8; // Good solar potential
    if (region === 'Oceania') relevance = 0.8; // Good solar potential
    if (region === 'Europe') relevance = 0.6; // Moderate solar potential
    if (region === 'North America') relevance = 0.7; // Good solar potential
  }
  
  if (tech.id.includes('fusion') || tech.id.includes('nuclear')) {
    // Fusion/nuclear tech is more relevant to energy-hungry regions
    if (region === 'Asia') relevance = 0.9;   // High energy demand
    if (region === 'North America') relevance = 0.8; // High energy demand
    if (region === 'Europe') relevance = 0.8; // Energy transition
    if (region === 'Africa') relevance = 0.7; // Energy poverty
    if (region === 'South America') relevance = 0.6; // Moderate energy demand
    if (region === 'Oceania') relevance = 0.5; // Low energy demand
  }
  
  return Math.min(1.0, relevance);
}

/**
 * Calculate deployment speed for a technology in a specific region
 */
export function calculateDeploymentSpeed(tech: TechDefinition, region: string, gameState: GameState): number {
  const factors = REGIONAL_FACTORS.get(region);
  if (!factors) return 1.0;
  
  let speed = factors.deploymentSpeed;
  
  // Adjust based on regional relevance
  const relevance = calculateRegionalRelevance(tech, region);
  speed *= (0.5 + relevance); // 0.5x to 1.5x based on relevance
  
  // Adjust based on economic capacity
  speed *= (0.5 + factors.economicCapacity); // 0.5x to 1.5x based on wealth
  
  // Adjust based on infrastructure
  speed *= (0.7 + factors.infrastructure * 0.6); // 0.7x to 1.3x based on infrastructure
  
  // Adjust based on political stability
  speed *= (0.8 + factors.politicalStability * 0.4); // 0.8x to 1.2x based on stability
  
  // Crisis modifiers
  if (gameState.crisisDetected) {
    // Crisis can either speed up (emergency deployment) or slow down (chaos)
    const crisisModifier = gameState.crisisDetected.severity > 0.7 ? 0.5 : 1.5;
    speed *= crisisModifier;
  }
  
  return Math.max(0.1, Math.min(3.0, speed)); // Cap between 0.1x and 3.0x
}

/**
 * Calculate deployment cost for a technology in a specific region
 */
export function calculateDeploymentCost(tech: TechDefinition, region: string, gameState: GameState): number {
  const factors = REGIONAL_FACTORS.get(region);
  if (!factors) return tech.deploymentCost;
  
  let cost = tech.deploymentCost * factors.costMultiplier;
  
  // Adjust based on infrastructure (poor infrastructure = higher costs)
  cost *= (1.5 - factors.infrastructure * 0.5); // 1.0x to 1.5x based on infrastructure
  
  // Adjust based on political stability (instability = higher costs)
  cost *= (1.3 - factors.politicalStability * 0.3); // 1.0x to 1.3x based on stability
  
  // Crisis modifiers
  if (gameState.crisisDetected) {
    // Crisis increases costs due to supply chain disruption
    const crisisModifier = 1 + gameState.crisisDetected.severity * 0.5;
    cost *= crisisModifier;
  }
  
  return Math.max(tech.deploymentCost * 0.5, cost); // Minimum 50% of base cost
}

/**
 * Get optimal deployment regions for a technology
 */
export function getOptimalDeploymentRegions(tech: TechDefinition, gameState: GameState): string[] {
  const regions = Array.from(REGIONAL_FACTORS.keys()).filter(r => r !== 'global');
  
  // Calculate relevance for each region
  const regionRelevance = regions.map(region => ({
    region,
    relevance: calculateRegionalRelevance(tech, region),
    speed: calculateDeploymentSpeed(tech, region, gameState),
    cost: calculateDeploymentCost(tech, region, gameState),
  }));
  
  // Sort by relevance (highest first)
  regionRelevance.sort((a, b) => b.relevance - a.relevance);
  
  // Return top regions (relevance > 0.6)
  return regionRelevance
    .filter(r => r.relevance > 0.6)
    .map(r => r.region);
}

/**
 * Get deployment priority for a technology in a region
 */
export function getDeploymentPriority(tech: TechDefinition, region: string, gameState: GameState): number {
  const relevance = calculateRegionalRelevance(tech, region);
  const speed = calculateDeploymentSpeed(tech, region, gameState);
  const factors = REGIONAL_FACTORS.get(region);
  
  if (!factors) return 0.5;
  
  // Priority = relevance * speed * economic capacity
  let priority = relevance * speed * factors.economicCapacity;
  
  // Boost priority for high-need regions
  if (region === 'Africa' && tech.category === 'environmental') priority *= 1.5;
  if (region === 'Asia' && tech.category === 'energy') priority *= 1.3;
  if (region === 'South America' && tech.category === 'agriculture') priority *= 1.3;
  
  // Crisis modifiers
  if (gameState.crisisDetected) {
    // Crisis increases priority for relevant tech
    if (tech.category === 'environmental' && gameState.crisisDetected.severity > 0.5) {
      priority *= 2.0;
    }
  }
  
  return Math.min(1.0, priority);
}

/**
 * Get regional deployment status for logging
 */
export function getRegionalDeploymentStatus(deployment: RegionalTechDeployment): string {
  return `${deployment.region}: ${(deployment.deploymentLevel * 100).toFixed(1)}% ` +
         `($${deployment.totalInvested.toFixed(0)}M invested, ` +
         `${deployment.deployedBy.length} deployers)`;
}
