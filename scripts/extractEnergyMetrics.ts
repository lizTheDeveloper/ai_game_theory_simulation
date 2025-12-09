/**
 * Extract energy budget metrics for Monte Carlo validation
 *
 * Runs a single simulation and extracts detailed energy allocation data
 * for determinism validation (CV analysis).
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';

const seed = parseInt(process.argv[2] || '42');
const maxMonths = parseInt(process.argv[3] || '120');

// Create initial state with proper RNG
const tempEngine = new SimulationEngine(undefined as any, seed);
const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());
const state = createDefaultInitialState(rng);

// Get all technologies
const allTech = getAllTech();

// Deploy ALL technologies at 100% (god mode)
for (const tech of allTech) {
  if (!state.techTreeState.unlockedTech.includes(tech.id)) {
    state.techTreeState.unlockedTech.push(tech.id);
    state.techTreeState.techUnlockedCount++;
  }
}

// Initialize global deployment array if needed
if (!state.techTreeState.regionalDeployment['global']) {
  state.techTreeState.regionalDeployment['global'] = [];
}

// Deploy all tech at 100% in global region
for (const tech of allTech) {
  const existing = state.techTreeState.regionalDeployment['global'].find(d => d.techId === tech.id);

  if (existing) {
    existing.deploymentLevel = 1.0;
    existing.deployedBy = [...existing.deployedBy, 'god_mode'];
  } else {
    state.techTreeState.regionalDeployment['global'].push({
      techId: tech.id,
      region: 'global',
      deploymentLevel: 1.0,
      monthlyInvestment: 0,
      totalInvested: tech.deploymentCost,
      deployedBy: ['god_mode'],
      effects: tech.effects,
    });
    state.techTreeState.techDeployedCount++;
  }
}

// Create engine for simulation
const engine = new SimulationEngine(undefined as any, seed);

// Run simulation and track energy metrics
let month = 0;
const energySnapshots: Array<{
  month: number;
  totalCapacity: number;
  cleanCapacity: number;
  totalDemand: number;
  surplus: number;
  allocations: Record<string, {
    demand: number;
    allocated: number;
    effectiveness: number;
  }>;
}> = [];

while (month < maxMonths) {
  engine.step(state);
  month = state.currentMonth;

  // Capture energy budget snapshot every 12 months
  if (month % 12 === 0 && state.energyBudget) {
    const snapshot: any = {
      month,
      totalCapacity: state.energyBudget.globalCapacity.totalTWh,
      cleanCapacity: state.energyBudget.globalCapacity.cleanTWh,
      totalDemand: state.energyBudget.conflicts.totalDemandTWh,
      surplus: state.energyBudget.conflicts.surplusDeficitTWh,
      allocations: {}
    };

    // Extract allocations
    for (const [tech, alloc] of Object.entries(state.energyBudget.allocations)) {
      snapshot.allocations[tech] = {
        demand: alloc.demandTWh,
        allocated: alloc.allocatedTWh,
        effectiveness: alloc.effectivenessMultiplier
      };
    }

    energySnapshots.push(snapshot);
  }

  // Check for early termination
  if (state.outcome) {
    break;
  }
}

// Output JSON for easy parsing
console.log(JSON.stringify({
  seed,
  monthsSimulated: month,
  outcome: state.outcome,
  finalState: {
    population: state.humanPopulationSystem?.population ?? 0,
    temperature: state.climate?.globalTempDelta ?? 0,
    energyCapacity: state.energyBudget?.globalCapacity.totalTWh ?? 0,
    energyDemand: state.energyBudget?.conflicts.totalDemandTWh ?? 0,
    energySurplus: state.energyBudget?.conflicts.surplusDeficitTWh ?? 0,
  },
  energySnapshots
}, null, 2));
