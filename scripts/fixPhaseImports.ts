/**
 * Fix phase type imports across all phase files
 *
 * This script ensures all phase files properly import:
 * - SimulationPhase
 * - PhaseResult
 * - PhaseContext
 * from @/types/game
 */

import * as fs from 'fs';
import * as path from 'path';

const PHASE_DIR = path.join(__dirname, '../src/simulation/engine/phases');

function fixPhaseFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let hasGameImport = false;
  let gameImportLine = -1;
  let hasPhaseTypes = false;

  // Find existing @/types/game import
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("from '@/types/game'") || line.includes('from "@/types/game"')) {
      hasGameImport = true;
      gameImportLine = i;

      // Check if it already has phase types
      if (line.includes('SimulationPhase') && line.includes('PhaseResult') && line.includes('PhaseContext')) {
        hasPhaseTypes = true;
      }
      break;
    }
  }

  // Check for old imports from PhaseOrchestrator
  let hasOldImport = false;
  let oldImportLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("from '../PhaseOrchestrator'") || line.includes("from '../../../types/game'")) {
      hasOldImport = true;
      oldImportLine = i;
      break;
    }
  }

  let modified = false;

  if (hasOldImport && oldImportLine >= 0) {
    // Remove old import line
    lines.splice(oldImportLine, 1);
    modified = true;

    // Recalculate game import line if it's after old import
    if (gameImportLine > oldImportLine) {
      gameImportLine--;
    }
  }

  if (hasGameImport && !hasPhaseTypes) {
    // Add phase types to existing import
    const importLine = lines[gameImportLine];

    // Extract existing imports
    const match = importLine.match(/import\s*{([^}]+)}\s*from\s*['"]@\/types\/game['"]/);
    if (match) {
      const existingImports = match[1].trim().split(',').map(s => s.trim());

      // Add phase types if not present
      if (!existingImports.includes('SimulationPhase')) {
        existingImports.push('SimulationPhase');
      }
      if (!existingImports.includes('PhaseResult')) {
        existingImports.push('PhaseResult');
      }
      if (!existingImports.includes('PhaseContext')) {
        existingImports.push('PhaseContext');
      }

      // Rebuild import line
      lines[gameImportLine] = `import { ${existingImports.join(', ')} } from '@/types/game';`;
      modified = true;
    }
  } else if (!hasGameImport) {
    // No game import found, add one at the top after existing imports
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '') {
        // Stop at first blank line after imports
        break;
      }
    }

    lines.splice(insertIndex, 0, "import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext } from '@/types/game';");
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`✓ Fixed ${path.basename(filePath)}`);
  } else {
    console.log(`- Skipped ${path.basename(filePath)} (already correct)`);
  }
}

// Process all phase files
const files = fs.readdirSync(PHASE_DIR).filter(f => f.endsWith('.ts'));

console.log(`Processing ${files.length} phase files...\n`);

for (const file of files) {
  try {
    fixPhaseFile(path.join(PHASE_DIR, file));
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error);
  }
}

console.log('\nDone!');
