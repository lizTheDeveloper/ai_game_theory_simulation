/**
 * Simulation State Store (Zustand)
 *
 * Central state management for simulation dashboard.
 * Handles GameState, trajectory history, and UI state.
 */

import { create } from 'zustand'
import { GameState } from '@/types/game'

interface SimulationState {
  // Core simulation data
  currentState: GameState | null
  trajectory: GameState[]
  isLoading: boolean
  error: string | null

  // Playback state
  selectedMonth: number
  isPlaying: boolean
  playbackSpeed: number

  // View mode
  viewMode: 'live' | 'playback' | 'analysis'

  // Filters
  filters: {
    paradigm: 'all' | 'western' | 'development' | 'ecological' | 'indigenous'
    crisisTypes: string[]
    agentIds: string[]
    showOnlyCritical: boolean
  }

  // Actions
  loadState: (state: GameState) => void
  loadTrajectory: (trajectory: GameState[]) => void
  setSelectedMonth: (month: number) => void
  setViewMode: (mode: 'live' | 'playback' | 'analysis') => void
  setFilter: (key: keyof SimulationState['filters'], value: any) => void
  togglePlayback: () => void
  setPlaybackSpeed: (speed: number) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial state
  currentState: null,
  trajectory: [],
  isLoading: false,
  error: null,
  selectedMonth: 0,
  isPlaying: false,
  playbackSpeed: 1,
  viewMode: 'live',
  filters: {
    paradigm: 'all',
    crisisTypes: [],
    agentIds: [],
    showOnlyCritical: false
  },

  // Load single state
  loadState: (state: GameState) => {
    set({
      currentState: state,
      selectedMonth: state.currentMonth,
      isLoading: false,
      error: null
    })
  },

  // Load full trajectory
  loadTrajectory: (trajectory: GameState[]) => {
    set({
      trajectory,
      currentState: trajectory[trajectory.length - 1] || null,
      selectedMonth: trajectory.length > 0 ? trajectory[trajectory.length - 1].currentMonth : 0,
      isLoading: false,
      error: null
    })
  },

  // Set selected month for playback
  setSelectedMonth: (month: number) => {
    const { trajectory } = get()
    const state = trajectory.find(s => s.currentMonth === month)

    set({
      selectedMonth: month,
      currentState: state || get().currentState
    })
  },

  // Set view mode
  setViewMode: (mode: 'live' | 'playback' | 'analysis') => {
    set({ viewMode: mode })
  },

  // Update filters
  setFilter: (key, value) => {
    set(state => ({
      filters: {
        ...state.filters,
        [key]: value
      }
    }))
  },

  // Toggle playback
  togglePlayback: () => {
    set(state => ({ isPlaying: !state.isPlaying }))
  },

  // Set playback speed
  setPlaybackSpeed: (speed: number) => {
    set({ playbackSpeed: Math.max(0.25, Math.min(4, speed)) })
  },

  // Set error
  setError: (error: string | null) => {
    set({ error, isLoading: false })
  },

  // Reset to initial state
  reset: () => {
    set({
      currentState: null,
      trajectory: [],
      isLoading: false,
      error: null,
      selectedMonth: 0,
      isPlaying: false,
      playbackSpeed: 1,
      viewMode: 'live',
      filters: {
        paradigm: 'all',
        crisisTypes: [],
        agentIds: [],
        showOnlyCritical: false
      }
    })
  }
}))
