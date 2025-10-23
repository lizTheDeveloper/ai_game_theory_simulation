/**
 * Simulation Worker Context
 *
 * Global singleton for managing the simulation Web Worker.
 * Ensures only ONE worker instance exists across the entire app.
 * Provides shared state to Navigation and all dashboard pages.
 *
 * Architecture:
 * - Single worker created on app mount
 * - Shared state distributed via React Context
 * - Components subscribe to updates without creating duplicate workers
 * - Proper cleanup on app unmount only
 */

'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { SimulationWorkerClient, type StateDelta, type InitialStateSnapshot } from '@/lib/simulationWorkerClient'
import type { ScenarioMode } from '@/types/game'

interface SimulationWorkerContextValue {
  // Worker client (singleton)
  client: SimulationWorkerClient | null

  // Simulation state
  initialized: boolean
  running: boolean
  month: number
  day: number
  scenario: ScenarioMode
  seed: number

  // Latest update delta (for pages that need detailed state)
  lastUpdate: StateDelta | null

  // Control functions
  init: (seed: number, scenario: ScenarioMode, speed: number) => void
  start: () => void
  pause: () => void
  step: () => void
}

const SimulationWorkerContext = createContext<SimulationWorkerContextValue | null>(null)

export function SimulationWorkerProvider({ children }: { children: ReactNode }) {
  // Use ref to ensure worker persists across re-renders
  const clientRef = useRef<SimulationWorkerClient | null>(null)

  // Shared state
  const [initialized, setInitialized] = useState(false)
  const [running, setRunning] = useState(false)
  const [month, setMonth] = useState(0)
  const [day, setDay] = useState(1)
  const [scenario, setScenario] = useState<ScenarioMode>('historical')
  const [seed, setSeed] = useState(42000)
  const [lastUpdate, setLastUpdate] = useState<StateDelta | null>(null)

  // Create singleton worker on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Only create if doesn't exist
    if (!clientRef.current) {
      try {
        const client = new SimulationWorkerClient()
        clientRef.current = client

        console.log('[WorkerContext] Created singleton worker client')

        // Setup global listeners
        client.on('initialized', (snapshot: InitialStateSnapshot) => {
          console.log('[WorkerContext] Worker initialized:', snapshot)
          setInitialized(true)
          setMonth(snapshot.currentMonth)
          setScenario(snapshot.scenario)
        })

        client.on('update', (delta: StateDelta, currentMonth?: number, currentDay?: number) => {
          setLastUpdate(delta)
          if (delta.currentMonth !== undefined) {
            setMonth(delta.currentMonth)
          }
          if (currentDay !== undefined) {
            setDay(currentDay)
          }
        })

        client.on('dayUpdate', (currentDay: number) => {
          setDay(currentDay)
        })

        client.on('paused', () => {
          console.log('[WorkerContext] Simulation paused')
          setRunning(false)
        })

        client.on('resumed', () => {
          console.log('[WorkerContext] Simulation resumed')
          setRunning(true)
        })

        client.on('error', (error: Error) => {
          console.error('[WorkerContext] Worker error:', error)
        })
      } catch (error) {
        console.error('[WorkerContext] Failed to create worker:', error)
      }
    }

    // Cleanup only on app unmount (not on re-render)
    return () => {
      console.log('[WorkerContext] App unmounting, destroying worker')
      if (clientRef.current) {
        clientRef.current.destroy()
        clientRef.current = null
      }
    }
  }, []) // Empty deps - only run on mount/unmount

  // Control functions
  const init = (seedValue: number, scenarioValue: ScenarioMode, speed: number) => {
    if (!clientRef.current) {
      console.error('[WorkerContext] Cannot init: no worker client')
      return
    }

    if (initialized) {
      console.warn('[WorkerContext] Already initialized')
      return
    }

    setSeed(seedValue)
    setScenario(scenarioValue)

    const interval = Math.floor(30000 / speed)
    clientRef.current.init(seedValue, scenarioValue, interval)
  }

  const start = () => {
    if (!clientRef.current) {
      console.error('[WorkerContext] Cannot start: no worker client')
      return
    }

    if (!initialized) {
      console.error('[WorkerContext] Cannot start: not initialized')
      return
    }

    clientRef.current.start()
  }

  const pause = () => {
    if (!clientRef.current) {
      console.error('[WorkerContext] Cannot pause: no worker client')
      return
    }

    clientRef.current.pause()
  }

  const step = () => {
    if (!clientRef.current) {
      console.error('[WorkerContext] Cannot step: no worker client')
      return
    }

    clientRef.current.step()
  }

  return (
    <SimulationWorkerContext.Provider
      value={{
        client: clientRef.current,
        initialized,
        running,
        month,
        day,
        scenario,
        seed,
        lastUpdate,
        init,
        start,
        pause,
        step
      }}
    >
      {children}
    </SimulationWorkerContext.Provider>
  )
}

/**
 * Hook to access the global simulation worker
 * Must be used within SimulationWorkerProvider
 */
export function useSimulationWorker() {
  const context = useContext(SimulationWorkerContext)

  if (!context) {
    throw new Error('useSimulationWorker must be used within SimulationWorkerProvider')
  }

  return context
}
