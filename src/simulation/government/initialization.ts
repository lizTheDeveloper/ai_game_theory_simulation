/**
 * Government System Initialization
 *
 * Initialize 30 real-world governments with political structure,
 * state capacity, and policy positions.
 *
 * Research Foundation:
 * - V-Dem v14 (2024): 531 indicators, 202 countries
 * - WGI 2024 (World Bank): State capacity metrics
 * - Laver (2020): Agent-based political decision making
 *
 * @module simulation/government/initialization
 */

import { loadCountries, Government, createStateCapacity } from '@lizthedeveloper/government-agents';
import type { GovernmentSystemState } from '../../types/government';
import type { RNGFunction } from '../../types/config';

/**
 * Initialize government system with 30 countries
 *
 * @param rng - Random number generator for stochastic initialization
 * @returns Initialized government system state
 */
export function initializeGovernmentSystem(rng: RNGFunction): GovernmentSystemState {
  console.log('\n=== Initializing Government System (30 Countries) ===');

  // Load all 30 countries from government-agents package
  const countriesData = loadCountries();
  const governments = new Map<string, any>();

  // Create Government objects for each country
  for (const [code, data] of countriesData) {
    const capacity = createStateCapacity(data.wgi);
    const gov = new Government({
      countryCode: code,
      countryName: data.name,
      type: data.type,
      capacity,
      population: data.population,
      gdpPPP: data.gdpPPP,
      year: 2024,
    });
    governments.set(code, gov);
  }

  console.log(`  Loaded ${governments.size} governments`);

  // Initialize coalitions (only for multi-party parliamentary systems)
  // NOTE: Coalition formation will be implemented when government-agents package Phase 5.4 is complete
  // For now, coalitions form dynamically during elections via CoalitionFormation.ts
  const coalitions = new Map();

  // Initialize election schedule
  const nextElections = new Map<string, number>();
  for (const [code, gov] of governments) {
    // Schedule elections based on government type
    const electionCycle = gov.characteristics?.electionCycleMonths || 48;
    // Stagger initial elections
    const offset = Math.floor(rng() * 12);
    nextElections.set(code, electionCycle + offset);
  }

  console.log(`  Scheduled elections for ${nextElections.size} countries`);

  // Initialize public opinion (start at moderate approval)
  const publicOpinion = new Map<string, number>();
  for (const [code, gov] of governments) {
    // Start between 0.4-0.6 based on government quality
    const baseOpinion = 0.5;
    const capacityBonus = gov.capacity.derived.overallCapacity * 0.2 - 0.1;
    publicOpinion.set(code, Math.max(0.2, Math.min(0.8, baseOpinion + capacityBonus + (rng() - 0.5) * 0.1)));
  }

  // Initialize AI comprehension lag (based on state capacity)
  const comprehensionLag = new Map<string, number>();
  for (const [code, gov] of governments) {
    const capacity = gov.capacity.derived.overallCapacity;
    // High capacity = 3-6 months lag, low capacity = 12-24 months lag
    const baseLag = 24 - (capacity * 18);
    comprehensionLag.set(code, baseLag + (rng() - 0.5) * 6);
  }

  console.log(`  Initialized comprehension lags (3-24 months)`);

  const system: GovernmentSystemState = {
    governments,
    coalitions,
    activePolicies: [],
    treaties: [],
    nextElections,
    publicOpinion,
    comprehensionLag,
    internationalCoordination: 0.3, // Start with moderate coordination
    totalPoliciesEnacted: 0,
  };

  console.log('=== Government System Initialized ===\n');

  return system;
}

/**
 * Calculate average AI capability across all agents
 * Helper for policy response logic
 */
export function calculateAverageAICapability(aiAgents: any[]): number {
  if (!aiAgents || aiAgents.length === 0) return 0;
  // FIX #20 (Oct 22, 2025): Access correct property - capabilityProfile.cognitive, not agent.cognitive
  // Bug: AI agents don't have agent.cognitive property (always undefined), they have capabilityProfile.cognitive
  const sum = aiAgents.reduce((acc, agent) => acc + (agent.capabilityProfile?.cognitive || 0), 0);
  return sum / aiAgents.length;
}

/**
 * Check if country should respond to AI capability level
 * Based on comprehension lag and capability growth
 */
export function shouldRespondToAICapability(
  country: string,
  currentMonth: number,
  aiCapability: number,
  comprehensionLag: Map<string, number>,
  lastResponseMonth?: number
): boolean {
  // Has government comprehended current AI level?
  const lag = comprehensionLag.get(country) || 12;

  // Need at least 'lag' months to understand new capabilities
  if (lastResponseMonth && currentMonth - lastResponseMonth < lag) {
    return false;
  }

  // High capability levels always trigger response (eventually)
  if (aiCapability > 6.0) return true;

  // Medium capabilities need time to assess
  if (aiCapability > 4.0 && (!lastResponseMonth || currentMonth - lastResponseMonth > lag * 2)) {
    return true;
  }

  return false;
}
