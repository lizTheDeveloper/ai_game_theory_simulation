import { GameState } from '@/types/game';

// Mock game state for development
// In production, this would fetch from a running simulation or database
export async function getGameState(): Promise<GameState | null> {
  // TODO: Implement actual game state fetching
  // For now, return null to indicate no simulation running
  // This will be replaced with actual game state from Zustand store or simulation worker
  return null;
}
