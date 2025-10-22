/**
 * useSimulation Hook
 *
 * React hook for loading and managing simulation data.
 */

import { useEffect } from 'react'
import { useSimulationStore } from '@/lib/stores/simulationStore'

export function useSimulation() {
  const {
    currentState,
    trajectory,
    isLoading,
    error,
    loadState,
    loadTrajectory,
    setError
  } = useSimulationStore()

  // Load current simulation state
  const loadCurrent = async () => {
    try {
      const response = await fetch('/api/simulation/current')

      if (!response.ok) {
        throw new Error('Failed to fetch simulation state')
      }

      const { data } = await response.json()

      // If data has snapshots, load as trajectory
      if (data.snapshots && data.snapshots.length > 0) {
        loadTrajectory(data.snapshots)
      } else {
        // Otherwise just load the final state
        loadState(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Load Monte Carlo results
  const loadMonteCarloResults = async (limit = 100) => {
    try {
      const response = await fetch(`/api/simulation/monte-carlo?limit=${limit}`)

      if (!response.ok) {
        throw new Error('Failed to fetch Monte Carlo results')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }

  return {
    currentState,
    trajectory,
    isLoading,
    error,
    loadCurrent,
    loadMonteCarloResults
  }
}
