/**
 * Test deployment sigmoid curve
 * Verify that technologies deploy over correct timescales
 */

function sigmoidDeploymentCurve(
  monthsSinceStart: number,
  totalMonthsToFull: number,
  steepness: number = 0.02
): number {
  if (totalMonthsToFull === 0) return 1.0; // Instant deployment
  if (monthsSinceStart <= 0) return 0.0;

  const t_mid = totalMonthsToFull / 2; // 50% deployment at midpoint
  const t = monthsSinceStart;

  // Sigmoid formula
  const exponent = -steepness * (t - t_mid);
  const deploymentLevel = 1.0 / (1.0 + Math.exp(exponent));

  return Math.min(1.0, Math.max(0.0, deploymentLevel));
}

// Test cases
console.log('=== Sigmoid Deployment Curve Tests ===\n');

// Test 1: DAC (300 months / 25 years)
console.log('DAC (300 months timescale):');
const dacTimescale = 300;
const dacMilestones = [0, 30, 60, 75, 90, 120, 150, 180, 210, 240, 270, 300];
for (const month of dacMilestones) {
  const level = sigmoidDeploymentCurve(month, dacTimescale);
  console.log(`  Month ${month.toString().padStart(3)}: ${(level * 100).toFixed(1)}%`);
}

console.log('\nRenewables (312 months timescale):');
const renewTimescale = 312;
const renewMilestones = [0, 30, 60, 90, 120, 156, 180, 210, 240, 270, 312];
for (const month of renewMilestones) {
  const level = sigmoidDeploymentCurve(month, renewTimescale);
  console.log(`  Month ${month.toString().padStart(3)}: ${(level * 100).toFixed(1)}%`);
}

console.log('\nTIER 1 (180 months timescale):');
const tier1Timescale = 180;
const tier1Milestones = [0, 30, 45, 60, 90, 120, 150, 180];
for (const month of tier1Milestones) {
  const level = sigmoidDeploymentCurve(month, tier1Timescale);
  console.log(`  Month ${month.toString().padStart(3)}: ${(level * 100).toFixed(1)}%`);
}

console.log('\nScalable Oversight (120 months):');
const soTimescale = 120;
const soMilestones = [0, 10, 20, 30, 40, 50, 60, 80, 100, 120];
for (const month of soMilestones) {
  const level = sigmoidDeploymentCurve(month, soTimescale);
  console.log(`  Month ${month.toString().padStart(3)}: ${(level * 100).toFixed(1)}%`);
}

// Test with governance/climate multipliers
console.log('\n=== Multiplier Effects ===\n');
console.log('DAC with low governance (0.5×):');
const dacLowGov = dacTimescale / 0.5; // 600 months effective timescale
const dacLowGovMilestones = [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600];
for (const month of dacLowGovMilestones) {
  const level = sigmoidDeploymentCurve(month, dacLowGov);
  console.log(`  Month ${month.toString().padStart(3)}: ${(level * 100).toFixed(1)}%`);
}

console.log('\nDAC with 2°C warming (0.8× climate feedback):');
const dacWarm = dacTimescale / 0.8; // 375 months effective timescale
const dacWarmMilestones = [0, 60, 120, 180, 240, 300, 360, 375];
for (const month of dacWarmMilestones) {
  const level = sigmoidDeploymentCurve(month, dacWarm);
  console.log(`  Month ${month.toString().padStart(3)}: ${(level * 100).toFixed(1)}%`);
}
