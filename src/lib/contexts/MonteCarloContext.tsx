/**
 * Monte Carlo Context
 *
 * Global state management for Monte Carlo parameter sweep UI.
 * Manages batch configuration, execution, and progress tracking.
 */

'use client'

import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from 'react'
import { MonteCarloManager, type MonteCarloBatchProgress, type MonteCarloAggregateStats, type ParameterSweepConfig } from '@/lib/MonteCarloManager'
import type { ScenarioMode } from '@/types/game'

// ============================================================================
// TYPES
// ============================================================================

interface MonteCarloSweepConfig {
  // Seed configuration
  startSeed: number;
  seedCount: number;

  // Sweep parameters (checkboxes)
  sweepThresholdScenarios: boolean;
  selectedThresholdScenarios: Array<'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia'>;

  sweepScenarioModes: boolean;
  selectedScenarioModes: ScenarioMode[];

  sweepMaxMonths: boolean;
  selectedMaxMonths: number[];

  sweepNestedMC: boolean;

  // Fixed parameters (used when not sweeping)
  fixedScenarioMode: ScenarioMode;
  fixedMaxMonths: number;
  fixedThresholdScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia';

  // Custom parameter sweeps from enhanced config
  customParameterSweeps?: Record<string, (string | number | boolean)[]>;
}

interface MonteCarloContextValue {
  // Manager instance
  manager: MonteCarloManager | null;

  // Current sweep configuration
  sweepConfig: MonteCarloSweepConfig;
  setSweepConfig: (config: MonteCarloSweepConfig) => void;

  // Batch state
  currentBatchId: string | null;
  isRunning: boolean;
  progress: MonteCarloBatchProgress | null;
  aggregateStats: MonteCarloAggregateStats | null;

  // Computed values
  totalSimulations: number;
  estimatedTimeMinutes: number;

  // Actions
  startSweep: () => Promise<void>;
  pauseSweep: () => void;
  cancelSweep: () => void;
}

const MonteCarloContext = createContext<MonteCarloContextValue | null>(null)

// ============================================================================
// PROVIDER
// ============================================================================

export function MonteCarloProvider({ children }: { children: ReactNode }) {
  // Manager instance (singleton)
  const managerRef = useRef<MonteCarloManager | null>(null)

  // Sweep configuration
  const [sweepConfig, setSweepConfig] = useState<MonteCarloSweepConfig>({
    startSeed: 42000,
    seedCount: 10,
    sweepThresholdScenarios: false,
    selectedThresholdScenarios: ['baseline'],
    sweepScenarioModes: false,
    selectedScenarioModes: ['historical'],
    sweepMaxMonths: false,
    selectedMaxMonths: [120],
    sweepNestedMC: false,
    fixedScenarioMode: 'historical',
    fixedMaxMonths: 120,
    fixedThresholdScenario: 'baseline'
  })

  // Batch state
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<MonteCarloBatchProgress | null>(null)
  const [aggregateStats, setAggregateStats] = useState<MonteCarloAggregateStats | null>(null)

  // Initialize manager on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!managerRef.current) {
      console.log('[MonteCarloContext] Initializing manager')
      const manager = new MonteCarloManager()
      managerRef.current = manager

      // Setup event listeners
      manager.on('batchStarted', (batchId: string) => {
        console.log('[MonteCarloContext] Batch started:', batchId)
        setIsRunning(true)
      })

      manager.on('batchProgress', (progressUpdate: MonteCarloBatchProgress) => {
        console.log('[MonteCarloContext] Batch progress:', progressUpdate)
        setProgress(progressUpdate)
      })

      manager.on('batchCompleted', async (batchId: string) => {
        console.log('[MonteCarloContext] Batch completed:', batchId)
        setIsRunning(false)

        // Get final aggregate stats
        const stats = await manager.getAggregateStats(batchId)
        if (stats) {
          setAggregateStats(stats)
        }
      })

      manager.on('simulationError', (simulationId: string, batchId: string, error: Error) => {
        console.error('[MonteCarloContext] Simulation error:', simulationId, error)
      })
    }

    // Cleanup on unmount
    return () => {
      if (managerRef.current) {
        console.log('[MonteCarloContext] Destroying manager')
        managerRef.current.destroy()
        managerRef.current = null
      }
    }
  }, [])

  // Calculate total simulations
  const totalSimulations = calculateTotalSimulations(sweepConfig)

  // Estimate time (assume 30 seconds per simulation, 5 concurrent)
  const estimatedTimeMinutes = Math.ceil((totalSimulations * 30) / 60 / 5)

  // Start sweep
  const startSweep = async () => {
    if (!managerRef.current) {
      console.error('[MonteCarloContext] Manager not initialized')
      return
    }

    if (isRunning) {
      console.warn('[MonteCarloContext] Sweep already running')
      return
    }

    try {
      console.log('[MonteCarloContext] Starting sweep with config:', sweepConfig)

      // Convert UI config to ParameterSweepConfig
      const paramSweepConfig = convertToParameterSweepConfig(sweepConfig)

      // Create batch
      const batchId = await managerRef.current.createParameterSweep(paramSweepConfig)
      setCurrentBatchId(batchId)

      // Start execution
      await managerRef.current.startParameterSweep(batchId)
    } catch (error) {
      console.error('[MonteCarloContext] Failed to start sweep:', error)
      setIsRunning(false)
    }
  }

  // Pause sweep (not implemented yet)
  const pauseSweep = () => {
    console.log('[MonteCarloContext] TODO: Pause sweep')
  }

  // Cancel sweep (not implemented yet)
  const cancelSweep = () => {
    console.log('[MonteCarloContext] TODO: Cancel sweep')
    setIsRunning(false)
    setCurrentBatchId(null)
    setProgress(null)
  }

  return (
    <MonteCarloContext.Provider
      value={{
        manager: managerRef.current,
        sweepConfig,
        setSweepConfig,
        currentBatchId,
        isRunning,
        progress,
        aggregateStats,
        totalSimulations,
        estimatedTimeMinutes,
        startSweep,
        pauseSweep,
        cancelSweep
      }}
    >
      {children}
    </MonteCarloContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function useMonteCarlo() {
  const context = useContext(MonteCarloContext)

  if (!context) {
    throw new Error('useMonteCarlo must be used within MonteCarloProvider')
  }

  return context
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Calculate total simulations from sweep config
 */
function calculateTotalSimulations(config: MonteCarloSweepConfig): number {
  let total = config.seedCount

  if (config.sweepThresholdScenarios && config.selectedThresholdScenarios.length > 0) {
    total *= config.selectedThresholdScenarios.length
  }

  if (config.sweepScenarioModes && config.selectedScenarioModes.length > 0) {
    total *= config.selectedScenarioModes.length
  }

  if (config.sweepMaxMonths && config.selectedMaxMonths.length > 0) {
    total *= config.selectedMaxMonths.length
  }

  if (config.sweepNestedMC) {
    total *= 2 // [true, false]
  }

  return total
}

/**
 * Convert UI config to ParameterSweepConfig for backend
 */
function convertToParameterSweepConfig(config: MonteCarloSweepConfig & { customParameterSweeps?: Record<string, any[]> }): ParameterSweepConfig {
  const sweepParameters: any = {}

  // Add sweep parameters if enabled
  if (config.sweepThresholdScenarios && config.selectedThresholdScenarios.length > 0) {
    sweepParameters.thresholdScenarios = config.selectedThresholdScenarios
  }

  if (config.sweepScenarioModes && config.selectedScenarioModes.length > 0) {
    sweepParameters.scenarioModes = config.selectedScenarioModes
  }

  if (config.sweepMaxMonths && config.selectedMaxMonths.length > 0) {
    sweepParameters.maxMonths = config.selectedMaxMonths
  }

  if (config.sweepNestedMC) {
    sweepParameters.nestedMC = [true, false]
  }

  // CRITICAL FIX: Add custom parameter sweeps from enhanced config
  if (config.customParameterSweeps) {
    // The MonteCarloManager expects custom parameters to be included directly in sweepParameters
    Object.entries(config.customParameterSweeps).forEach(([paramId, values]) => {
      if (values && values.length > 0) {
        sweepParameters[paramId] = values
      }
    })
  }

  // Count total parameter dimensions for accurate description
  const totalDimensions = Object.keys(sweepParameters).length

  return {
    seeds: {
      start: config.startSeed,
      count: config.seedCount
    },
    sweepParameters,
    fixedParameters: {
      scenario: config.fixedScenarioMode,
      maxMonths: config.fixedMaxMonths,
      speculativeScenario: config.fixedThresholdScenario
    },
    name: 'Parameter Sweep',
    description: `Exploring ${totalDimensions} parameter dimensions`
  }
}
