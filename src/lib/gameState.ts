import { GameState } from '@/types/game';
import { useGameStore } from './gameStore';

/**
 * Get current game state for server-side API routes
 *
 * Since Zustand stores are client-side only, we need to access the store state
 * differently in server components. This function works around that by directly
 * accessing the store's state.
 */
export async function getGameState(): Promise<GameState | null> {
  try {
    // Access the Zustand store state directly
    // Note: This works because Zustand stores are just functions that return state
    const state = useGameStore.getState();

    // Return a copy to avoid mutation issues
    // Use structuredClone (10x faster, preserves Maps/Sets/Dates)
    return state ? structuredClone(state) : null;
  } catch (error) {
    console.error('Error getting game state:', error);
    return null;
  }
}
