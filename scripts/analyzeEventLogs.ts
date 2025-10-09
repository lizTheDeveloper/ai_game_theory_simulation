/**
 * Analyze event logs from Monte Carlo runs
 */

import * as fs from 'fs';
import * as path from 'path';

const outputDir = path.join(__dirname, '..', 'monteCarloOutputs');

// Get all event log files
const files = fs.readdirSync(outputDir)
  .filter(f => f.startsWith('run_') && f.endsWith('_events.json'))
  .sort();

console.log(`\n📊 Analyzing ${files.length} event logs...\n`);

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));
  const seed = data.seed;
  const outcome = data.outcome;
  
  const crisisCount = data.events?.summary?.eventsByType?.crisis || 0;
  const cascadingCount = data.events?.summary?.eventsByType?.cascading_failure || 0;
  
  if (crisisCount > 0 || cascadingCount > 0) {
    console.log(`🔥 Seed ${seed} (${outcome}): ${crisisCount} crises, ${cascadingCount} cascading`);
    
    // Try to find actual crisis events in criticalEvents
    const criticalCrises = (data.criticalEvents || []).filter((e: any) => 
      e.description && (
        e.description.includes('Crisis') || 
        e.description.includes('Collapse') || 
        e.description.includes('Catastrophe') ||
        e.description.includes('Cascading')
      )
    );
    
    if (criticalCrises.length > 0) {
      console.log(`   Critical crisis events found: ${criticalCrises.length}`);
      criticalCrises.slice(0, 5).forEach((e: any) => {
        console.log(`      Month ${e.month}: ${e.description}`);
      });
    } else {
      console.log(`   ⚠️  No crisis events found in criticalEvents (might be in different format)`);
    }
    console.log();
  }
});

console.log('\n✅ Analysis complete!\n');

