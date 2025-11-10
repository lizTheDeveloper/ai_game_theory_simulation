/**
 * Spiral Threshold Analysis
 *
 * Deep dive into why spirals fail to activate in god mode scenarios
 * Reads final state from scenario results and compares actual values to thresholds
 */

import * as fs from 'fs';

const scenarioFile = process.argv[2] || 'logs/scenario_results/governance-first_seed42_2025-11-10T16-15-26-918Z.json';

console.log(`\n${'='.repeat(80)}`);
console.log('🔍 SPIRAL THRESHOLD ANALYSIS');
console.log(`${'='.repeat(80)}\n`);
console.log(`Analyzing: ${scenarioFile}\n`);

// Read scenario result
const resultPath = `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/${scenarioFile}`;
if (!fs.existsSync(resultPath)) {
  console.error(`❌ File not found: ${resultPath}`);
  process.exit(1);
}

const result = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));

// Log basic info
console.log(`📋 Scenario: ${result.scenarioId}`);
console.log(`🎲 Seed: ${result.seed}`);
console.log(`📅 Months: ${result.monthsSimulated}`);
console.log(`🎯 Outcome: ${result.outcome}\n`);

// Now check the log file for final state snapshot
const logFile = scenarioFile.replace('logs/scenario_results/', 'logs/scenario_').replace(/\.json$/, '.log').replace(/_seed\d+_[\dTZ-]+/, '');
console.log(`📄 Searching for state snapshot in: ${logFile}\n`);

// Read the actual log to find state values
const logPath = `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/${logFile}`;
if (fs.existsSync(logPath)) {
  const logContent = fs.readFileSync(logPath, 'utf-8');

  // Extract QoL values from log
  console.log(`${'='.repeat(80)}`);
  console.log('FINAL STATE VALUES FROM LOG');
  console.log(`${'='.repeat(80)}\n`);

  console.log('Quality of Life Systems:');
  const materialMatch = logContent.match(/Material abundance:\s*([\d.]+)/i);
  const energyMatch = logContent.match(/Energy availability:\s*([\d.]+)/i);
  const healthcareMatch = logContent.match(/Healthcare quality:\s*([\d.]+)/i);
  const ecosystemMatch = logContent.match(/Ecosystem health:\s*([\d.]+)/i);

  if (materialMatch) console.log(`  Material abundance: ${parseFloat(materialMatch[1]).toFixed(2)}`);
  if (energyMatch) console.log(`  Energy availability: ${parseFloat(energyMatch[1]).toFixed(2)}`);
  if (healthcareMatch) console.log(`  Healthcare quality: ${parseFloat(healthcareMatch[1]).toFixed(2)}`);
  if (ecosystemMatch) console.log(`  Ecosystem health: ${parseFloat(ecosystemMatch[1]).toFixed(2)}`);

  console.log(`\n${'='.repeat(80)}`);
  console.log('SPIRAL REQUIREMENT ANALYSIS');
  console.log(`${'='.repeat(80)}\n`);

  console.log('🔍 Searching log for spiral diagnostics...\n');

  // Look for spiral diagnostic output
  const spiralSection = logContent.match(/SPIRAL DIAGNOSTICS[\s\S]*?Active Spirals: (\d+)\/6/);
  if (spiralSection) {
    console.log(`Active spirals found in log: ${spiralSection[1]}/6`);
  }

  // Extract specific diagnostic info if available
  if (logContent.includes('ABUNDANCE SPIRAL')) {
    console.log('\n📦 ABUNDANCE SPIRAL diagnostics found in log');
  }
  if (logContent.includes('COGNITIVE SPIRAL')) {
    console.log('🧠 COGNITIVE SPIRAL diagnostics found in log');
  }
  if (logContent.includes('DEMOCRATIC SPIRAL')) {
    console.log('🗳️  DEMOCRATIC SPIRAL diagnostics found in log');
  }
  if (logContent.includes('SCIENTIFIC SPIRAL')) {
    console.log('🔬 SCIENTIFIC SPIRAL diagnostics found in log');
  }
  if (logContent.includes('MEANING SPIRAL')) {
    console.log('💫 MEANING SPIRAL diagnostics found in log');
  }
  if (logContent.includes('ECOLOGICAL SPIRAL')) {
    console.log('🌍 ECOLOGICAL SPIRAL diagnostics found in log');
  }

} else {
  console.error(`❌ Log file not found: ${logPath}`);
}

console.log(`\n${'='.repeat(80)}`);
console.log('KEY FINDINGS');
console.log(`${'='.repeat(80)}\n`);

console.log('From scenario result JSON:');
console.log(`  Active upward spirals: ${result.spiralActivation?.activeUpwardSpirals?.length || 0}`);
console.log(`  Cascade active: ${result.spiralActivation?.cascadeActive || false}`);
console.log(`  Trust cascades triggered: ${result.spiralActivation?.trustCascadesTriggered || 0}`);
console.log(`  Positive tipping cascades: ${result.spiralActivation?.tippingPointCascades || 0}\n`);

console.log('QoL Averages (from result JSON):');
if (result.finalQoL) {
  console.log(`  Survival: ${(result.finalQoL.survivalAvg * 100).toFixed(1)}%`);
  console.log(`  Basic needs: ${(result.finalQoL.basicNeedsAvg * 100).toFixed(1)}%`);
  console.log(`  Psychological: ${(result.finalQoL.psychologicalAvg * 100).toFixed(1)}%`);
  console.log(`  Social: ${(result.finalQoL.socialAvg * 100).toFixed(1)}%`);
  console.log(`  Health: ${(result.finalQoL.healthAvg * 100).toFixed(1)}%`);
  console.log(`  Environmental: ${(result.finalQoL.environmentalAvg * 100).toFixed(1)}%`);
  console.log(`  Overall: ${(result.finalQoL.overallAvg * 100).toFixed(1)}%\n`);
}

console.log('Hypotheses to investigate:');
console.log('  1. Are scenario starting conditions actually being applied to correct state locations?');
console.log('  2. Are spiral thresholds too stringent for realistic scenarios?');
console.log('  3. Are there missing state fields that prevent spiral activation?');
console.log('  4. Do we need workflow adaptation or other missing mechanics?\n');
