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
import { eventDatabase } from '@/lib/eventDatabase'
import { indexedDBLLMStorage } from '@/lib/llmStorageAdapter'
import { setLLMLogStorage } from '@/simulation/llm/logging'
import type { ScenarioMode } from '@/types/game'

interface SimulationWorkerContextValue {
  // Worker client (singleton)
  client: SimulationWorkerClient | null

  // Simulation state
  initialized: boolean
  running: boolean
  month: number  // UI display month (for formatted date)
  day: number    // UI display day (for formatted date)
  year: number   // UI display year (for formatted date)
  simulationMonth: number  // Actual simulation month (0, 1, 2...)
  simulationDay: number    // Actual simulation day (1-30)
  scenario: ScenarioMode
  seed: number
  startDate: Date | null  // Real-world date when simulation started

  // Latest update delta (for pages that need detailed state)
  lastUpdate: StateDelta | null

  // Control functions
  init: (seed: number, scenario: ScenarioMode, speed: number, alignmentConfig?: import('@/types/alignment-dynamics').AlignmentDynamicsConfig, climatePriorityConfig?: import('@/types/climate-priority').ClimatePriorityConfig, thresholdSliders?: import('@/components/thresholds/ThresholdConfigModal').ThresholdSliders, speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia') => void
  resumeFromSimulationId: (simulationId: string) => Promise<void>
  start: () => void
  pause: () => void
  step: () => void
}

const SimulationWorkerContext = createContext<SimulationWorkerContextValue | null>(null)

export function SimulationWorkerProvider({ children }: { children: ReactNode }) {
  // Use ref to ensure worker persists across re-renders
  const clientRef = useRef<SimulationWorkerClient | null>(null)

  // Track initialization state with ref to avoid closure issues
  const initializedRef = useRef(false)

  // Simulation state (actual month/day in the simulation)
  const [initialized, setInitialized] = useState(false)
  const [running, setRunning] = useState(false)
  const [simulationMonth, setSimulationMonth] = useState(0)
  const [simulationDay, setSimulationDay] = useState(1)
  const [scenario, setScenario] = useState<ScenarioMode>('historical')
  const [seed, setSeed] = useState(42000)
  const [lastUpdate, setLastUpdate] = useState<StateDelta | null>(null)

  // UI-only date display (doesn't affect simulation state)
  const [displayDate, setDisplayDate] = useState<Date>(new Date())

  // Create singleton worker on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Only create if doesn't exist
    if (!clientRef.current) {
      try {
        // Inject LLM log storage (dependency injection for module boundary separation)
        setLLMLogStorage(indexedDBLLMStorage)
        console.log('[WorkerContext] Injected IndexedDB LLM log storage')

        const client = new SimulationWorkerClient()
        clientRef.current = client

        // Expose globally for debugging
        ;(window as any).__simulationWorkerClient = client

        console.log('[WorkerContext] Created singleton worker client and exposed globally')

        // Setup global listeners
        client.on('initialized', (snapshot: InitialStateSnapshot, startDate?: string) => {
          console.log('[WorkerContext] Worker initialized:', snapshot)
          // Don't set initialized=true here anymore
          // We'll wait for the first update with actual data
          setSimulationMonth(snapshot.currentMonth)
          setScenario(snapshot.scenario)

          // Set UI display date to today's real-world date
          if (startDate) {
            setDisplayDate(new Date(startDate))
          } else {
            setDisplayDate(new Date())
          }
        })

        client.on('update', (delta: StateDelta, currentMonth?: number, currentDay?: number) => {
          // If this is the first update and we're not initialized yet, set initialized now
          if (!initializedRef.current && delta) {
            console.log('[WorkerContext] First update received, setting initialized=true')
            initializedRef.current = true
            setInitialized(true)
          }

          setLastUpdate(delta)
          // Always update simulation month from delta if present
          if (delta.currentMonth !== undefined) {
            setSimulationMonth(delta.currentMonth)
          }
          if (currentDay !== undefined) {
            setSimulationDay(currentDay)
          }
        })

        client.on('dayUpdate', (currentDay: number) => {
          setSimulationDay(currentDay)

          // Increment UI display date by 1 day (purely cosmetic)
          setDisplayDate(prevDate => {
            const newDate = new Date(prevDate)
            newDate.setDate(newDate.getDate() + 1)
            return newDate
          })
        })

        client.on('paused', () => {
          console.log('[WorkerContext] Simulation paused')
          setRunning(false)
        })

        client.on('resumed', (snapshot?: InitialStateSnapshot, startDate?: string) => {
          console.log('[WorkerContext] Simulation resumed')
          setRunning(true)

          // Update state if snapshot provided (from resumeFromState)
          if (snapshot) {
            // Don't set initialized here - wait for the first update with data
            // Just update the metadata
            setSimulationMonth(snapshot.currentMonth)
            setScenario(snapshot.scenario)

            if (startDate) {
              setDisplayDate(new Date(startDate))
            }
          }
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
        // Clean up global reference
        if ((window as any).__simulationWorkerClient) {
          delete (window as any).__simulationWorkerClient
        }
      }
    }
  }, []) // Empty deps - only run on mount/unmount

  // Control functions
  const init = (seedValue: number, scenarioValue: ScenarioMode, speed: number, alignmentConfig?: import('@/types/alignment-dynamics').AlignmentDynamicsConfig, climatePriorityConfig?: import('@/types/climate-priority').ClimatePriorityConfig, thresholdSliders?: import('@/components/thresholds/ThresholdConfigModal').ThresholdSliders, speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia') => {
    if (!clientRef.current) {
      console.error('[WorkerContext] Cannot init: no worker client')
      return
    }

    if (initialized) {
      console.warn('[WorkerContext] Already initialized')
      return
    }

    // Reset initialization tracking
    initializedRef.current = false
    setLastUpdate(null)

    setSeed(seedValue)
    setScenario(scenarioValue)

    const interval = Math.floor(30000 / speed)
    clientRef.current.init(seedValue, scenarioValue, interval, alignmentConfig, climatePriorityConfig, thresholdSliders, speculativeScenario)
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

  const resumeFromSimulationId = async (simulationId: string) => {
    if (!clientRef.current) {
      console.error('[WorkerContext] Cannot resume: no worker client')
      return
    }

    if (initialized) {
      console.warn('[WorkerContext] Already initialized')
      return
    }

    try {
      console.log('[WorkerContext] Loading simulation:', simulationId)
      const stored = await eventDatabase.loadSimulation(simulationId)

      if (!stored) {
        console.error('[WorkerContext] Simulation not found:', simulationId)
        throw new Error(`Simulation ${simulationId} not found`)
      }

      console.log('[WorkerContext] Resuming from month:', stored.currentMonth)

      // Reset initialization tracking
      initializedRef.current = false
      setLastUpdate(null)

      // Extract seed and scenario from simulationId (format: "{seed}_{scenario}")
      const [seedStr, ...scenarioParts] = simulationId.split('_')
      const seedValue = parseInt(seedStr, 10) || 42000
      const scenarioValue = scenarioParts.join('_') as ScenarioMode || 'historical'

      setSeed(seedValue)
      setScenario(scenarioValue)

      // Resume from state
      clientRef.current.resumeFromState(stored.gameState)
    } catch (error) {
      console.error('[WorkerContext] Failed to resume simulation:', error)
      throw error
    }
  }

  // Compute UI display values from displayDate (for formatted date string)
  const displayYear = displayDate.getFullYear()
  const displayMonth = displayDate.getMonth() // 0-based (0 = January)
  const displayDay = displayDate.getDate()

  return (
    <SimulationWorkerContext.Provider
      value={{
        client: clientRef.current,
        initialized,
        running,
        month: displayMonth,         // UI display month (0-11, for formatted date like "October")
        day: displayDay,             // UI display day (1-31, for formatted date like "23")
        year: displayYear,           // UI display year (for formatted date like "2025")
        simulationMonth,             // Actual simulation month (0, 1, 2...)
        simulationDay,               // Actual simulation day (1-30)
        scenario,
        seed,
        startDate: displayDate,      // Real-world date when simulation started
        lastUpdate,
        init,
        resumeFromSimulationId,
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
