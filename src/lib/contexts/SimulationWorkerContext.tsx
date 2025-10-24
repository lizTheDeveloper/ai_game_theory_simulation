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
  month: number  // UI display month (for formatted date)
  day: number    // UI display day (for formatted date)
  year: number   // UI display year (for formatted date)
  simulationMonth: number  // Actual simulation month (0, 1, 2...)
  simulationDay: number    // Actual simulation day (1-30)
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
        const client = new SimulationWorkerClient()
        clientRef.current = client

        console.log('[WorkerContext] Created singleton worker client')

        // Setup global listeners
        client.on('initialized', (snapshot: InitialStateSnapshot, startDate?: string) => {
          console.log('[WorkerContext] Worker initialized:', snapshot)
          setInitialized(true)
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
          setLastUpdate(delta)
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
