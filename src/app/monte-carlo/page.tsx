/**
 * Monte Carlo Parameter Sweep Page
 *
 * Main interface for configuring and running Monte Carlo parameter sweeps.
 * Enhanced with comprehensive parameter configuration
 */

'use client'

import { useState, useEffect } from 'react'
import { MonteCarloProvider, useMonteCarlo } from '@/lib/contexts/MonteCarloContext'
import { MonteCarloConfigPanel } from '@/components/monte-carlo/MonteCarloConfigPanel'
import { EnhancedParameterConfig, type EnhancedSweepConfig } from '@/components/monte-carlo/EnhancedParameterConfig'
import { BatchProgressTracker } from '@/components/monte-carlo/BatchProgressTracker'
import { SweepResultsPanel } from '@/components/monte-carlo/SweepResultsPanel'
import { Settings2, FlaskConical } from 'lucide-react'
import {
  convertEnhancedToContextConfig,
  convertContextToEnhancedConfig,
  validateEnhancedConfig,
  describeSweepConfig
} from '@/lib/monte-carlo/configAdapter'

function MonteCarloPageContent() {
  const {
    sweepConfig,
    setSweepConfig,
    startSweep,
    isRunning,
    progress,
    aggregateStats
  } = useMonteCarlo()

  const [useEnhancedConfig, setUseEnhancedConfig] = useState(true)

  // Initialize enhanced config from context on mount
  const [enhancedConfig, setEnhancedConfig] = useState<EnhancedSweepConfig>(() =>
    convertContextToEnhancedConfig(sweepConfig)
  )

  // Sync enhanced config changes to context
  const handleEnhancedConfigChange = (newConfig: EnhancedSweepConfig) => {
    setEnhancedConfig(newConfig)

    // Convert and update context config
    const contextConfig = convertEnhancedToContextConfig(newConfig)
    setSweepConfig(contextConfig)
  }

  // Handle enhanced sweep start
  const handleEnhancedSweep = async () => {
    // Check if no parameters are selected (seed-only sweep)
    const hasEnabledParams = Object.values(enhancedConfig.parameters).some(
      p => p.enabled && p.values.length > 0
    )

    if (!hasEnabledParams && enhancedConfig.seedCount === 1) {
      alert('Please select at least one parameter to sweep, or increase the seed count for a seed-only sweep.')
      return
    }

    // Validate configuration
    const validationError = validateEnhancedConfig(enhancedConfig)
    if (validationError) {
      alert(validationError)
      return
    }

    // Log sweep details
    console.log('Starting enhanced parameter sweep:', describeSweepConfig(enhancedConfig))

    // Start the actual sweep via context
    try {
      await startSweep()
    } catch (error) {
      console.error('Failed to start sweep:', error)
      alert('Failed to start parameter sweep. Check console for details.')
    }
  }

  return (
    <main className="min-h-screen p-8 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header with Config Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-light text-white">Monte Carlo Parameter Sweep</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUseEnhancedConfig(!useEnhancedConfig)}
                className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${
                  useEnhancedConfig
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : 'bg-white/10 border border-white/20 text-white/60'
                }`}
              >
                {useEnhancedConfig ? <FlaskConical className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {useEnhancedConfig ? 'Enhanced Config' : 'Basic Config'}
                </span>
              </button>
            </div>
          </div>
          <p className="text-sm text-white/60">
            {useEnhancedConfig
              ? 'Configure comprehensive parameter sweeps across all simulation dimensions'
              : 'Quick parameter sweep with basic configuration options'
            }
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Configuration Panel */}
          <div className="lg:col-span-1">
            {useEnhancedConfig ? (
              <EnhancedParameterConfig
                config={enhancedConfig}
                onChange={handleEnhancedConfigChange}
                onStartSweep={handleEnhancedSweep}
                isRunning={isRunning}
              />
            ) : (
              <MonteCarloConfigPanel />
            )}
          </div>

          {/* Right: Progress and Results */}
          <div className="lg:col-span-2 space-y-6">
            <BatchProgressTracker />
            <SweepResultsPanel />

            {/* Enhanced Config Info Panel */}
            {useEnhancedConfig && (
              <div className="p-6 bg-black/40 border border-cyan-500/20 rounded-lg">
                <h3 className="text-lg font-light text-cyan-400 mb-3 flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Enhanced Configuration Active
                </h3>
                <div className="space-y-2 text-sm text-white/60">
                  <p>
                    The enhanced configuration provides access to all simulation parameters including:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Core simulation dynamics (government, social, economic, AI coordination)</li>
                    <li>Alignment dynamics models (static, drift, epicycles, unknowable)</li>
                    <li>AI suffering and consciousness parameters</li>
                    <li>Collective evolution thresholds</li>
                    <li>Crisis cascade multipliers and recovery rates</li>
                    <li>Scenario modes and threshold uncertainties</li>
                  </ul>
                  <p className="mt-3 text-xs text-white/40">
                    Each parameter can be swept across multiple values to explore the full parameter space.
                    Results will show sensitivity analysis and outcome distributions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function MonteCarloPage() {
  return (
    <MonteCarloProvider>
      <MonteCarloPageContent />
    </MonteCarloProvider>
  )
}