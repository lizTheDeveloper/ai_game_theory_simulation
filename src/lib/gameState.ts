import { GameState } from '@/types/game';
import fs from 'fs/promises';
import path from 'path';

/**
 * Load the current game state from simulation
 *
 * Options:
 * 1. Load from monteCarloOutputs/latest.json
 * 2. Connect to running simulation
 * 3. Load from database
 */
export async function getGameState(): Promise<GameState | null> {
  try {
    // Option 1: Load from latest Monte Carlo output
    const outputDir = path.join(process.cwd(), 'monteCarloOutputs');
    const files = await fs.readdir(outputDir);
    const jsonFiles = files
      .filter(f => f.endsWith('.json') && f.includes('historical_events'))
      .sort()
      .reverse();

    if (jsonFiles.length === 0) {
      console.warn('[getGameState] No simulation output files found');
      return null;
    }

    const latestFile = jsonFiles[0];
    if (!latestFile) {
      console.warn('[getGameState] No valid JSON files found');
      return null;
    }
    const filePath = path.join(outputDir, latestFile);
    const contents = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(contents);

    return data.finalState || data.state || null;
  } catch (error) {
    console.error('[getGameState] Error loading state:', error);
    return null;
  }
}

/**
 * Get state at specific month (from history)
 */
export async function getGameStateAtMonth(_month: number): Promise<GameState | null> {
  // TODO: Implement historical state retrieval
  return null;
}
