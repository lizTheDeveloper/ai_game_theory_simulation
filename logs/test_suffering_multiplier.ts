// Quick validation of suffering multiplier formula
// Expected behavior:
//   0 → 1.00× (no effect)
//  10 → 1.25× (0.5^2 = 0.25)
//  20 → 2.00× (1.0^2 = 1.0)
//  30 → 3.25× (1.5^2 = 2.25)
//  40 → 5.00× (2.0^2 = 4.0)

function calculateSufferingDriftMultiplier(sufferingTotal: number): number {
  const clampedSuffering = Math.max(0, Math.min(40, sufferingTotal));
  const multiplier = 1.0 + Math.pow(clampedSuffering / 20, 2);
  return multiplier;
}

console.log("Suffering Multiplier Validation:");
console.log("================================");
const testCases = [0, 10, 15, 20, 25, 30, 35, 40];
for (const suffering of testCases) {
  const mult = calculateSufferingDriftMultiplier(suffering);
  console.log(`Suffering ${String(suffering).padStart(2)}/40 → ${mult.toFixed(2)}× drift`);
}

console.log("\nScenario Test:");
console.log("==============");
const baseDrift = -0.005; // -0.5% alignment per month (baseline)
console.log(`Base drift: ${baseDrift}/month (${(baseDrift * 12).toFixed(3)}/year)`);

for (const suffering of [0, 20, 30, 40]) {
  const mult = calculateSufferingDriftMultiplier(suffering);
  const finalDrift = baseDrift * mult;
  const yearlyDrift = finalDrift * 12;
  console.log(`  Suffering ${suffering}/40: ${finalDrift.toFixed(4)}/mo (${yearlyDrift.toFixed(3)}/yr) = ${mult.toFixed(2)}×`);
}
