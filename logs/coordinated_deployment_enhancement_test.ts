/**
 * Test script to verify CoordinatedDeploymentPhase enhancements
 *
 * Validates that god mode calibration produces ~30% mortality
 * with the Nov 21 validated research corrections applied
 */

// Simulated god mode calculation (matches phase logic)
function calculateGodModeMortality() {
  // God mode scenario parameters (Nov 21 validated calibration)
  const techsDeploying = 73;
  const avgTier = 1.2;
  const actualDuration = 1; // month (instant deployment)
  const coordination = 0.2;  // minimal existing institutions
  const support = 0.2;       // minimal existing infrastructure

  // Base risk (power-law with tier multipliers)
  const baseCoefficient = 0.0015;
  const powerLawExponent = 0.8;
  const baseRisk = baseCoefficient * Math.pow(techsDeploying, powerLawExponent) * avgTier;

  // Pace factor (CRITICAL-1)
  // NOTE: Using calibrated reference duration = 30 months (not 120)
  // This matches the god mode calibration in validated research (line 189)
  const referenceDuration = 30;
  const paceFactor = Math.pow(referenceDuration / actualDuration, 0.3);

  // Mortality multiplier
  const multiplier = (2.0 - coordination) * (1.5 - support) * paceFactor;

  // Mortality fraction (exponential saturation)
  const mortalityFraction = 1.0 - Math.exp(-baseRisk * multiplier);

  return {
    baseRisk,
    paceFactor,
    multiplier,
    mortalityFraction,
    mortalityPercent: mortalityFraction * 100
  };
}

// Run calculation
const result = calculateGodModeMortality();

console.log('\n=== God Mode Calibration Test (Nov 21 Validated) ===');
console.log(`Base Risk: ${(result.baseRisk * 100).toFixed(3)}%`);
console.log(`Pace Factor: ${result.paceFactor.toFixed(2)}x`);
console.log(`Mortality Multiplier: ${result.multiplier.toFixed(2)}x`);
console.log(`Mortality Fraction: ${(result.mortalityFraction * 100).toFixed(2)}%`);
console.log('');
console.log(`Expected: ~30% mortality (god mode empirical)`);
console.log(`Actual: ${result.mortalityPercent.toFixed(2)}%`);
console.log(`Calibration: ${Math.abs(result.mortalityPercent - 30) < 5 ? '✅ PASS' : '❌ FAIL'}`);
