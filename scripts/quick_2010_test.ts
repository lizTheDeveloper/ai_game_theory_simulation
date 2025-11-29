#!/usr/bin/env tsx
import { createHistoricalInitialState } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';

async function test() {
  const engine = new SimulationEngine({ seed: 42 });
  const rng = engine.getRNG().next.bind(engine.getRNG());
  const state = await createHistoricalInitialState({
    year: 1990,
    rng,
    includeAIAgents: false,
    scenarioMode: 'historical'
  });

  console.log(`Starting: ${state.currentYear}, CO2: ${state.resourceEconomy.co2.atmosphericCO2.toFixed(2)} ppm`);

  for (let i = 0; i < 240; i++) {
    engine.step(state);
    if (state.currentMonth % 12 === 0) {
      console.log(`Year ${state.currentYear}: CO2 ${state.resourceEconomy.co2.atmosphericCO2.toFixed(2)} ppm`);
    }
  }
}

test().catch(console.error);
