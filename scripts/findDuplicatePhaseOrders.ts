/**
 * Find duplicate phase order numbers
 *
 * CRITICAL fix for non-deterministic phase execution
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const phasesDir = 'src/simulation/engine/phases';
const files = readdirSync(phasesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

interface PhaseInfo {
  name: string;
  order: number;
  file: string;
}

const phases: PhaseInfo[] = [];

for (const file of files) {
  const content = readFileSync(join(phasesDir, file), 'utf-8');

  // Try both patterns: 'order:' and 'readonly order ='
  const orderMatch = content.match(/(?:readonly\s+)?order\s*[:=]\s*([\d.]+)/m);

  if (orderMatch) {
    const order = parseFloat(orderMatch[1]);

    // Try to find name from export
    const exportMatch = content.match(/export (?:const|class) (\w+Phase)/);
    const name = exportMatch ? exportMatch[1] : file.replace('.ts', '');

    phases.push({ name, order, file });
  }
}

// Sort by order
phases.sort((a, b) => a.order - b.order);

// Find duplicates
const orderCounts = new Map<number, string[]>();
for (const phase of phases) {
  if (!orderCounts.has(phase.order)) {
    orderCounts.set(phase.order, []);
  }
  const existing = orderCounts.get(phase.order);
  if (existing) {
    existing.push(`${phase.name} (${phase.file})`);
  }
}

console.log('All phases with order numbers:');
console.log('='.repeat(80));
for (const phase of phases) {
  const orderPhases = orderCounts.get(phase.order);
  const isDupe = orderPhases && orderPhases.length > 1 ? '⚠️ DUPLICATE' : '';
  console.log(`[${phase.order.toFixed(2).padStart(6)}] ${phase.name.padEnd(40)} ${isDupe}`);
}

console.log('\n\nDuplicate order numbers:');
console.log('='.repeat(80));
let totalDupes = 0;
const sortedOrders = Array.from(orderCounts.entries()).sort((a, b) => a[0] - b[0]);

for (const [order, names] of sortedOrders) {
  if (names.length > 1) {
    console.log(`\n❌ Order ${order}: ${names.length} phases`);
    for (const name of names) {
      console.log(`  - ${name}`);
    }
    totalDupes += names.length;
  }
}

console.log(`\n\nTotal phases: ${phases.length}`);
console.log(`Phases with duplicate orders: ${totalDupes}`);
