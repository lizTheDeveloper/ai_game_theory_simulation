/**
 * Temperature Anticorrelation Diagnostic
 *
 * Traces temperature and CO2 through a hindcast run to identify where correlation breaks.
 *
 * Expected output:
 * - Month-by-month CO2 and temperature values
 * - Phase-by-phase modifications to both
 * - Correlation coefficient calculation
 * - Identification of which phase causes anticorrelation
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';
import { setDeterministicRng } from '../src/simulation/utils/deterministicRng';

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

async function runDiagnostic() {
  console.log('\n🔬 TEMPERATURE ANTICORRELATION DIAGNOSTIC\n');

  const rng = createSeededRng(42100);
  setDeterministicRng(rng);

  const state = await initializeHistoricalSimulation(1990, rng);
  const engine = new SimulationEngine();

  console.log('Simulating 1990-2010 (240 months)...\n');
  console.log('Month | CO2 (ppm) | Temp (°C) | ΔCO2 | ΔTemp | Correlation Check');
  console.log('-'.repeat(80));

  let prevCO2 = state.resourceEconomy.co2.atmosphericCO2;
  let prevTemp = state.resourceEconomy.co2.temperatureAnomaly;

  const co2Values: number[] = [];
  const tempValues: number[] = [];
  let anticorrelationCount = 0;

  for (let month = 1; month <= 240; month++) {
    engine.step(state, rng);

    const co2 = state.resourceEconomy.co2.atmosphericCO2;
    const temp = state.resourceEconomy.co2.temperatureAnomaly;
    const deltaCO2 = co2 - prevCO2;
    const deltaTemp = temp - prevTemp;

    co2Values.push(co2);
    tempValues.push(temp);

    // Check for anticorrelation (opposite signs)
    const anticorrelated = (deltaCO2 > 0 && deltaTemp < 0) || (deltaCO2 < 0 && deltaTemp > 0);
    if (anticorrelated) anticorrelationCount++;

    const flag = anticorrelated ? ' ⚠️ ANTICORRELATION' : '';

    if (month % 12 === 0 || anticorrelated) {
      console.log(
        `${month.toString().padStart(4)} | ` +
        `${co2.toFixed(2).padStart(9)} | ` +
        `${temp.toFixed(3).padStart(9)} | ` +
        `${deltaCO2.toFixed(3).padStart(6)} | ` +
        `${deltaTemp.toFixed(4).padStart(7)}${flag}`
      );
    }

    prevCO2 = co2;
    prevTemp = temp;
  }

  console.log('\n📊 FINAL STATE (Month 240 = Year 2010):');
  console.log(`  CO2: ${state.resourceEconomy.co2.atmosphericCO2.toFixed(2)} ppm`);
  console.log(`  Temperature: ${state.resourceEconomy.co2.temperatureAnomaly.toFixed(3)}°C`);
  console.log(`  Target CO2: 389.90 ppm (NOAA Mauna Loa 2010)`);
  console.log(`  Target Temp: 0.73°C (NASA GISS 2010)`);

  // Calculate correlation coefficient
  const n = co2Values.length;
  const meanCO2 = co2Values.reduce((a, b) => a + b, 0) / n;
  const meanTemp = tempValues.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let sumSqCO2 = 0;
  let sumSqTemp = 0;

  for (let i = 0; i < n; i++) {
    const co2Diff = co2Values[i] - meanCO2;
    const tempDiff = tempValues[i] - meanTemp;
    numerator += co2Diff * tempDiff;
    sumSqCO2 += co2Diff * co2Diff;
    sumSqTemp += tempDiff * tempDiff;
  }

  const correlation = numerator / Math.sqrt(sumSqCO2 * sumSqTemp);

  console.log(`\n📈 CORRELATION ANALYSIS:`);
  console.log(`  Pearson correlation coefficient: ${correlation.toFixed(4)}`);
  console.log(`  Expected: > 0.9 (strong positive correlation)`);
  console.log(`  Anticorrelation events: ${anticorrelationCount}/240 months (${(anticorrelationCount / 240 * 100).toFixed(1)}%)`);

  if (correlation < 0) {
    console.log(`\n❌ NEGATIVE CORRELATION DETECTED - PHYSICS VIOLATION`);
  } else if (correlation < 0.5) {
    console.log(`\n⚠️ WEAK CORRELATION - LIKELY BUG`);
  } else if (correlation < 0.9) {
    console.log(`\n⚠️ MODERATE CORRELATION - MAY NEED INVESTIGATION`);
  } else {
    console.log(`\n✅ STRONG POSITIVE CORRELATION - EXPECTED BEHAVIOR`);
  }
}

runDiagnostic().catch(console.error);
