/**
 * Analyze Feature Events from Monte Carlo Logs
 *
 * Extracts cooperative ownership and storm events from MC logs to verify features work.
 */

import * as fs from 'fs';
import * as path from 'path';

interface EventCounts {
  cooperativeConversions: number;
  cooperativeDividends: number;
  cooperativeCrisisResponses: number;
  stormEvents: number;
  stormsByCategory: { [key: number]: number };
  totalStormDeaths: number;
}

function analyzeLogFile(logPath: string): EventCounts {
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');

  const counts: EventCounts = {
    cooperativeConversions: 0,
    cooperativeDividends: 0,
    cooperativeCrisisResponses: 0,
    stormEvents: 0,
    stormsByCategory: {},
    totalStormDeaths: 0
  };

  for (const line of lines) {
    // Cooperative ownership events
    if (line.includes('🤝 COOPERATIVE CONVERSION') || line.includes('converted to worker cooperative')) {
      counts.cooperativeConversions++;
    }
    if (line.includes('💰') && line.includes('Distributed') && line.includes('worker-owners')) {
      counts.cooperativeDividends++;
    }
    if (line.includes('🤝 Cooperative resilience') || line.includes('bankruptcy risk reduced')) {
      counts.cooperativeCrisisResponses++;
    }

    // Storm events
    if (line.includes('🌀')) {
      counts.stormEvents++;

      // Extract category (Cat 1-5)
      const catMatch = line.match(/Cat (\d)/);
      if (catMatch) {
        const category = parseInt(catMatch[1]);
        counts.stormsByCategory[category] = (counts.stormsByCategory[category] || 0) + 1;
      }

      // Extract deaths
      const deathMatch = line.match(/(\d+(?:,\d+)*)\s+deaths/);
      if (deathMatch) {
        const deaths = parseInt(deathMatch[1].replace(/,/g, ''));
        counts.totalStormDeaths += deaths;
      }
    }
  }

  return counts;
}

function main() {
  const logsDir = '/Users/annhoward/src/superalignmenttoutopia/logs';
  const baselineLog = fs.readdirSync(logsDir)
    .filter(f => f.startsWith('mc_baseline_validation_20251101'))
    .sort()
    .reverse()[0];

  if (!baselineLog) {
    console.error('❌ No baseline validation log found');
    process.exit(1);
  }

  const logPath = path.join(logsDir, baselineLog);
  console.log(`\n📊 Analyzing: ${baselineLog}\n`);

  const counts = analyzeLogFile(logPath);

  console.log('=== COOPERATIVE OWNERSHIP EVENTS ===');
  console.log(`  Conversions: ${counts.cooperativeConversions}`);
  console.log(`  Dividend distributions: ${counts.cooperativeDividends}`);
  console.log(`  Crisis responses: ${counts.cooperativeCrisisResponses}`);

  console.log('\n=== STORM EVENTS ===');
  console.log(`  Total storms: ${counts.stormEvents}`);
  console.log(`  By category:`);
  for (let cat = 1; cat <= 5; cat++) {
    const count = counts.stormsByCategory[cat] || 0;
    console.log(`    Cat ${cat}: ${count}`);
  }
  console.log(`  Total deaths: ${counts.totalStormDeaths.toLocaleString()}`);

  console.log('\n=== VALIDATION STATUS ===');
  const coopWorking = counts.cooperativeConversions > 0 || counts.cooperativeDividends > 0;
  const stormsWorking = counts.stormEvents > 0;

  console.log(`  Cooperative ownership: ${coopWorking ? '✅ WORKING' : '⚠️  NO EVENTS DETECTED'}`);
  console.log(`  Storm systems: ${stormsWorking ? '✅ WORKING' : '⚠️  NO EVENTS DETECTED'}`);

  if (!coopWorking && !stormsWorking) {
    console.log('\n⚠️  WARNING: Neither feature detected events. Possible issues:');
    console.log('   - Features not triggering (check phase execution)');
    console.log('   - Logging not working (check console.log calls)');
    console.log('   - Simulation too short (storms need climate warming)');
  }
}

main();
