import { getInvestmentMultiplier, getGovernanceMultiplier, getClimateRecoveryMultiplier, sigmoidDeploymentCurve, getDeploymentTimescale } from '../src/simulation/techTree/deploymentTimescales';
import { createDefaultInitialState } from '../src/simulation/initialization';

const state = createDefaultInitialState(42);

console.log("\n=== MULTIPLIERS ===");
console.log(`Investment: ${getInvestmentMultiplier(state).toFixed(3)}`);
console.log(`Governance: ${getGovernanceMultiplier(state).toFixed(3)}`);
console.log(`Climate: ${getClimateRecoveryMultiplier(state).toFixed(3)}`);
console.log(`Combined: ${(getInvestmentMultiplier(state) * getGovernanceMultiplier(state) * getClimateRecoveryMultiplier(state)).toFixed(3)}`);

console.log("\n=== CLIMATE INVESTMENT ===");
console.log(`Mitigation: ${state.government.researchInvestments?.climate?.mitigation ?? 'undefined'}`);
console.log(`Intervention: ${state.government.researchInvestments?.climate?.intervention ?? 'undefined'}`);
console.log(`Modeling: ${state.government.researchInvestments?.climate?.modeling ?? 'undefined'}`);

console.log("\n=== DEPLOYMENT TIMESCALE (DAC) ===");
const dacTimescale = getDeploymentTimescale('direct_air_capture');
console.log(`Base timescale: ${dacTimescale} months (${(dacTimescale/12).toFixed(1)} years)`);

console.log("\n=== SIGMOID CURVE (DAC at various months) ===");
const combined = getInvestmentMultiplier(state) * getGovernanceMultiplier(state) * getClimateRecoveryMultiplier(state);
const adjustedTimescale = dacTimescale / combined;
console.log(`Adjusted timescale: ${adjustedTimescale.toFixed(0)} months (${(adjustedTimescale/12).toFixed(1)} years)`);

for (const months of [0, 60, 120, 180, 240, 300, 360]) {
  const level = sigmoidDeploymentCurve(months, adjustedTimescale, 0.02);
  console.log(`  Month ${months} (${(months/12).toFixed(1)}y): ${(level * 100).toFixed(1)}%`);
}
