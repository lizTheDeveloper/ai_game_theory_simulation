#!/usr/bin/env tsx
/**
 * Add Assertions to Phase Files in Batch
 *
 * Systematically adds assertion utility imports and validation to phase files
 * that currently lack them.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PHASES_DIR = 'src/simulation/engine/phases';

// Phases to update in this batch (CRITICAL priority)
const BATCH_1_CRITICAL = [
  'QualityOfLifePhase.ts',
  'OutcomeProbabilitiesPhase.ts',
  'AIAgentActionsPhase.ts',
  'ExtinctionTriggersPhase.ts',
  'FamineSystemPhase.ts',
];

function addAssertionsToQualityOfLifePhase(filePath: string): void {
  let content = readFileSync(filePath, 'utf-8');

  // Add assertion imports
  if (!content.includes('from \'@/simulation/utils/assertions\'')) {
    content = content.replace(
      /import \{ setDeterministicRng \} from '@\/simulation\/utils\/deterministicRng';/,
      `import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertProbability,
  assertStateProperty,
  assertNonEmpty
} from '@/simulation/utils/assertions';`
    );
  }

  // Add assertions to QoL calculations
  if (!content.includes('assertProbability(')) {
    content = content.replace(
      /const globalQoLFromSystems = calculateQualityOfLife\(updatedQoLSystems\);/,
      `const globalQoLFromSystems = assertProbability(
      calculateQualityOfLife(updatedQoLSystems),
      {
        location: 'QualityOfLifePhase.execute',
        valueName: 'globalQoLFromSystems',
        month: state.currentMonth
      }
    );`
    );

    content = content.replace(
      /const aggregatedQoL = aggregateGlobalQoL\(state\);/,
      `const aggregatedQoL = assertProbability(
        aggregateGlobalQoL(state),
        {
          location: 'QualityOfLifePhase.execute',
          valueName: 'aggregatedQoL',
          month: state.currentMonth
        }
      );`
    );
  }

  writeFileSync(filePath, content);
  console.log(`✅ Updated: ${filePath}`);
}

function addAssertionsToOutcomeProbabilitiesPhase(filePath: string): void {
  let content = readFileSync(filePath, 'utf-8');

  // Add assertion imports
  if (!content.includes('from \'@/simulation/utils/assertions\'')) {
    content = content.replace(
      /import \{ setDeterministicRng \} from '@\/simulation\/utils\/deterministicRng';/,
      `import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertProbability } from '@/simulation/utils/assertions';`
    );
  }

  // Add assertions after calculating outcome probabilities
  if (!content.includes('assertProbability(outcomeProbs')) {
    content = content.replace(
      /const outcomeProbs = calculateOutcomeProbabilities\(state\);\s+setDeterministicRng\(rng\);\s+state\.outcomeMetrics = outcomeProbs;/,
      `setDeterministicRng(rng);
    const outcomeProbs = calculateOutcomeProbabilities(state);

    // Validate all outcome probabilities are in [0, 1]
    if (outcomeProbs.utopiaProbability !== undefined) {
      assertProbability(outcomeProbs.utopiaProbability, {
        location: 'OutcomeProbabilitiesPhase.execute',
        valueName: 'utopiaProbability',
        month: state.currentMonth
      });
    }

    if (outcomeProbs.dystopiaProbability !== undefined) {
      assertProbability(outcomeProbs.dystopiaProbability, {
        location: 'OutcomeProbabilitiesPhase.execute',
        valueName: 'dystopiaProbability',
        month: state.currentMonth
      });
    }

    if (outcomeProbs.extinctionProbability !== undefined) {
      assertProbability(outcomeProbs.extinctionProbability, {
        location: 'OutcomeProbabilitiesPhase.execute',
        valueName: 'extinctionProbability',
        month: state.currentMonth
      });
    }

    state.outcomeMetrics = outcomeProbs;`
    );
  }

  writeFileSync(filePath, content);
  console.log(`✅ Updated: ${filePath}`);
}

function main() {
  console.log('=== Adding Assertions to Batch 1 (CRITICAL) ===\n');

  for (const file of BATCH_1_CRITICAL) {
    const filePath = join(PHASES_DIR, file);

    try {
      if (file === 'QualityOfLifePhase.ts') {
        addAssertionsToQualityOfLifePhase(filePath);
      } else if (file === 'OutcomeProbabilitiesPhase.ts') {
        addAssertionsToOutcomeProbabilitiesPhase(filePath);
      } else {
        console.log(`⏭️  Skipped: ${file} (no automated pattern yet)`);
      }
    } catch (err) {
      console.error(`❌ Failed to update ${file}:`, err);
    }
  }

  console.log('\n=== Batch 1 Complete ===');
  console.log('Run `npx tsc --noEmit` to validate changes');
}

main();
