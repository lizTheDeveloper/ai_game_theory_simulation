/**
 * Quick test: CO2 accumulation with airborne fraction vs saturation model
 *
 * Roy (Nov 29, 2025): Verify the airborne fraction fix reduces CO2 bias
 */

// Test emissions trajectory (1990-2010 from GCP)
const emissions = {
  1990: 6.1 * 3.67,  // GtC → GtCO2
  2000: 6.7 * 3.67,
  2010: 9.1 * 3.67
};

// OLD MODEL (saturation approach - WRONG)
function calculateCO2Old(years: number): number {
  let co2 = 354.4;  // 1990 baseline
  const saturation = 0.46;  // From code

  // Fixed sink capacity (reduced by saturation)
  const oceanSink = 8.1;  // GtCO2/yr
  const landSink = 4.8;    // GtCO2/yr
  const sinkCapacity = (oceanSink + landSink) * (1 - saturation);  // 7.0 GtCO2/yr

  for (let year = 0; year < years; year++) {
    const yearsSince1990 = year;
    const annualEmissions = emissions[1990] + (emissions[2010] - emissions[1990]) * (yearsSince1990 / 20);
    const netToAtmosphere = Math.max(0, annualEmissions - sinkCapacity);
    const ppmIncrease = netToAtmosphere / 7.82;
    co2 += ppmIncrease;
  }

  return co2;
}

// NEW MODEL (airborne fraction approach - CORRECT)
function calculateCO2New(years: number): number {
  let co2 = 354.4;  // 1990 baseline
  const airborneFraction = 0.44;  // GCP empirical value

  for (let year = 0; year < years; year++) {
    const yearsSince1990 = year;
    const annualEmissions = emissions[1990] + (emissions[2010] - emissions[1990]) * (yearsSince1990 / 20);
    const netToAtmosphere = annualEmissions * airborneFraction;
    const ppmIncrease = netToAtmosphere / 7.82;
    co2 += ppmIncrease;
  }

  return co2;
}

// Run test
console.log('🧪 CO2 Accumulation Test (1990-2010)');
console.log('=====================================\n');

const co2Old2010 = calculateCO2Old(20);
const co2New2010 = calculateCO2New(20);
const observed2010 = 390.0;  // NOAA observations

console.log('Old model (saturation):');
console.log(`  2010 CO2: ${co2Old2010.toFixed(1)} ppm`);
console.log(`  Bias: ${((co2Old2010 - observed2010) / observed2010 * 100).toFixed(1)}%\n`);

console.log('New model (airborne fraction):');
console.log(`  2010 CO2: ${co2New2010.toFixed(1)} ppm`);
console.log(`  Bias: ${((co2New2010 - observed2010) / observed2010 * 100).toFixed(1)}%\n`);

console.log('Observed (NOAA):');
console.log(`  2010 CO2: ${observed2010.toFixed(1)} ppm\n`);

console.log('✅ Fix effectiveness:');
console.log(`  Bias reduction: ${Math.abs(co2Old2010 - observed2010).toFixed(1)} → ${Math.abs(co2New2010 - observed2010).toFixed(1)} ppm`);
console.log(`  Improvement: ${(((Math.abs(co2Old2010 - observed2010) - Math.abs(co2New2010 - observed2010)) / Math.abs(co2Old2010 - observed2010)) * 100).toFixed(1)}%`);
