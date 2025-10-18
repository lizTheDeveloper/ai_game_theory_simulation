#!/usr/bin/env node

const fs = require('fs');

// Read the log file
const logPath = '/Users/annhoward/src/superalignmenttoutopia/logs/mc_overshoot_validation_20251018_121441.log';
const content = fs.readFileSync(logPath, 'utf-8');

// Extract root cause attribution data
const rootCauseMatches = content.matchAll(/--- ROOT CAUSES.*?\n(.*?Climate Change:.*?\n.*?Governance:.*?\n.*?Poverty:.*?\n)/gs);

const attributions = [];
for (const match of rootCauseMatches) {
  const section = match[1];

  // Extract values and percentages
  const climateMatch = section.match(/Climate Change:\s+(\d+\.?\d*)M\s+\(([^)]+)\)/);
  const govMatch = section.match(/Governance:\s+(\d+\.?\d*)M\s+\(([^)]+)\)/);
  const povertyMatch = section.match(/Poverty:\s+(\d+\.?\d*)M\s+\(([^)]+)\)/);

  if (climateMatch && govMatch && povertyMatch) {
    const climate = parseFloat(climateMatch[1]);
    const governance = parseFloat(govMatch[1]);
    const poverty = parseFloat(povertyMatch[1]);
    const total = climate + governance + poverty;

    // Calculate actual percentages
    const climatePct = total > 0 ? (climate / total * 100) : 0;
    const govPct = total > 0 ? (governance / total * 100) : 0;
    const povertyPct = total > 0 ? (poverty / total * 100) : 0;

    attributions.push({
      climate,
      governance,
      poverty,
      total,
      climatePct,
      govPct,
      povertyPct,
      climateReported: climateMatch[2],
      govReported: govMatch[2],
      povertyReported: povertyMatch[2]
    });
  }
}

// Analyze patterns
console.log('\n=== OVERSHOOT DEATH ATTRIBUTION ANALYSIS ===');
console.log(`Total runs analyzed: ${attributions.length}`);

// Filter out runs with very low deaths (< 100M total)
const significantRuns = attributions.filter(a => a.total > 100);
console.log(`Runs with significant deaths (>100M): ${significantRuns.length}`);

if (significantRuns.length > 0) {
  // Calculate averages
  const avgClimate = significantRuns.reduce((sum, a) => sum + a.climatePct, 0) / significantRuns.length;
  const avgGov = significantRuns.reduce((sum, a) => sum + a.govPct, 0) / significantRuns.length;
  const avgPoverty = significantRuns.reduce((sum, a) => sum + a.povertyPct, 0) / significantRuns.length;

  console.log('\n--- AVERAGE ATTRIBUTION (runs with >100M deaths) ---');
  console.log(`Climate:    ${avgClimate.toFixed(1)}%`);
  console.log(`Governance: ${avgGov.toFixed(1)}%`);
  console.log(`Poverty:    ${avgPoverty.toFixed(1)}%`);

  // Check for monocausal patterns (>80% single factor)
  const monocausalRuns = significantRuns.filter(a =>
    a.climatePct > 80 || a.govPct > 80 || a.povertyPct > 80
  );

  console.log(`\nMonocausal runs (>80% single factor): ${monocausalRuns.length} / ${significantRuns.length} (${(monocausalRuns.length/significantRuns.length*100).toFixed(1)}%)`);

  if (monocausalRuns.length > 0) {
    console.log('Examples of monocausal attribution:');
    monocausalRuns.slice(0, 3).forEach((run, i) => {
      const dominant = run.climatePct > 80 ? 'Climate' :
                      run.govPct > 80 ? 'Governance' : 'Poverty';
      const pct = Math.max(run.climatePct, run.govPct, run.povertyPct);
      console.log(`  Run ${i+1}: ${dominant} ${pct.toFixed(1)}% (Total: ${run.total.toFixed(0)}M deaths)`);
    });
  }

  // Check for floor/ceiling hits
  const floorHits = significantRuns.filter(a =>
    Math.abs(a.govPct - 20) < 1 || // Gov floor 20%
    Math.abs(a.climatePct - 70) < 1 // Climate ceiling 70%
  );

  console.log(`\nFloor/ceiling hits: ${floorHits.length} / ${significantRuns.length} (${(floorHits.length/significantRuns.length*100).toFixed(1)}%)`);

  // Distribution analysis
  console.log('\n--- DISTRIBUTION ANALYSIS ---');
  console.log('Climate attribution distribution:');
  console.log(`  < 30%: ${significantRuns.filter(a => a.climatePct < 30).length} runs`);
  console.log(`  30-50%: ${significantRuns.filter(a => a.climatePct >= 30 && a.climatePct < 50).length} runs`);
  console.log(`  50-70%: ${significantRuns.filter(a => a.climatePct >= 50 && a.climatePct < 70).length} runs`);
  console.log(`  > 70%: ${significantRuns.filter(a => a.climatePct >= 70).length} runs`);

  console.log('\nGovernance attribution distribution:');
  console.log(`  < 20%: ${significantRuns.filter(a => a.govPct < 20).length} runs`);
  console.log(`  20-40%: ${significantRuns.filter(a => a.govPct >= 20 && a.govPct < 40).length} runs`);
  console.log(`  40-60%: ${significantRuns.filter(a => a.govPct >= 40 && a.govPct < 60).length} runs`);
  console.log(`  > 60%: ${significantRuns.filter(a => a.govPct >= 60).length} runs`);

  console.log('\nPoverty attribution distribution:');
  console.log(`  < 10%: ${significantRuns.filter(a => a.povertyPct < 10).length} runs`);
  console.log(`  10-20%: ${significantRuns.filter(a => a.povertyPct >= 10 && a.povertyPct < 20).length} runs`);
  console.log(`  > 20%: ${significantRuns.filter(a => a.povertyPct >= 20).length} runs`);
}

// Look for NaN percentages issue
const nanRuns = attributions.filter(a =>
  a.climateReported === 'NaN%' ||
  a.govReported === 'NaN%' ||
  a.povertyReported === 'NaN%'
);

console.log(`\n--- NaN PERCENTAGE BUG ---`);
console.log(`Runs with NaN%: ${nanRuns.length} / ${attributions.length} (${(nanRuns.length/attributions.length*100).toFixed(1)}%)`);
if (nanRuns.length > 0 && nanRuns.length === attributions.length) {
  console.log('⚠️  ALL runs show NaN% - display bug in logging, but actual values are being tracked');
}

// Check for patterns in overshoot events specifically
console.log('\n--- OVERSHOOT DEATH PATTERNS ---');
const overshootLines = content.match(/💀 OVERSHOOT DEATHS:.*\n.*Root cause attribution:.*/g) || [];
console.log(`Overshoot death events found: ${overshootLines.length}`);

if (overshootLines.length > 0) {
  const overshootAttributions = overshootLines.map(line => {
    const match = line.match(/Climate (\d+)%, Poverty (\d+)%, Governance (\d+)%/);
    if (match) {
      return {
        climate: parseInt(match[1]),
        poverty: parseInt(match[2]),
        governance: parseInt(match[3])
      };
    }
    return null;
  }).filter(Boolean);

  if (overshootAttributions.length > 0) {
    const avgOvClimate = overshootAttributions.reduce((sum, a) => sum + a.climate, 0) / overshootAttributions.length;
    const avgOvPoverty = overshootAttributions.reduce((sum, a) => sum + a.poverty, 0) / overshootAttributions.length;
    const avgOvGov = overshootAttributions.reduce((sum, a) => sum + a.governance, 0) / overshootAttributions.length;

    console.log(`\nAverage overshoot-specific attribution:`);
    console.log(`  Climate: ${avgOvClimate.toFixed(1)}%`);
    console.log(`  Poverty: ${avgOvPoverty.toFixed(1)}%`);
    console.log(`  Governance: ${avgOvGov.toFixed(1)}%`);

    // Check if consistently hitting floors/ceilings
    const govAt20 = overshootAttributions.filter(a => a.governance === 20).length;
    const climateAt70 = overshootAttributions.filter(a => a.climate === 70).length;

    if (govAt20 > overshootAttributions.length * 0.5) {
      console.log(`⚠️  Governance floor (20%) hit in ${(govAt20/overshootAttributions.length*100).toFixed(0)}% of cases`);
    }
    if (climateAt70 > overshootAttributions.length * 0.5) {
      console.log(`⚠️  Climate ceiling (70%) hit in ${(climateAt70/overshootAttributions.length*100).toFixed(0)}% of cases`);
    }
  }
}

console.log('\n=== END ANALYSIS ===\n');