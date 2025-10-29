/**
 * Monte Carlo Config Panel
 *
 * Parameter sweep configuration form.
 * Allows users to select which parameters to vary and see total simulation count.
 */

'use client'

import { useMonteCarlo } from '@/lib/contexts/MonteCarloContext'
import { Panel } from '@/components/core/Panel'
import { useState } from 'react'

export function MonteCarloConfigPanel() {
  const { sweepConfig, setSweepConfig, totalSimulations, estimatedTimeMinutes, startSweep, isRunning } = useMonteCarlo()

  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null)

  // Handle checkbox changes
  const handleSweepToggle = (parameterName: keyof typeof sweepConfig) => {
    setSweepConfig({
      ...sweepConfig,
      [parameterName]: !sweepConfig[parameterName]
    })
  }

  // Handle threshold scenario selection
  const handleThresholdScenarioToggle = (scenario: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia') => {
    const current = sweepConfig.selectedThresholdScenarios
    const isSelected = current.includes(scenario)

    const updated = isSelected
      ? current.filter(s => s !== scenario)
      : [...current, scenario]

    setSweepConfig({
      ...sweepConfig,
      selectedThresholdScenarios: updated
    })
  }

  // Handle scenario mode selection
  const handleScenarioModeToggle = (mode: 'historical' | 'unprecedented') => {
    const current = sweepConfig.selectedScenarioModes
    const isSelected = current.includes(mode)

    const updated = isSelected
      ? current.filter(m => m !== mode)
      : [...current, mode]

    setSweepConfig({
      ...sweepConfig,
      selectedScenarioModes: updated
    })
  }

  // Handle max months selection
  const handleMaxMonthsToggle = (months: number) => {
    const current = sweepConfig.selectedMaxMonths
    const isSelected = current.includes(months)

    const updated = isSelected
      ? current.filter(m => m !== months)
      : [...current, months]

    setSweepConfig({
      ...sweepConfig,
      selectedMaxMonths: updated
    })
  }

  // Handle start sweep
  const handleStartSweep = async () => {
    // Validate configuration
    if (totalSimulations === 0) {
      setValidationError('No parameters selected. Select at least one sweep parameter.')
      return
    }

    if (totalSimulations > 1000) {
      setValidationError(`Too many simulations (${totalSimulations}). Maximum is 1000. Reduce seeds or parameters.`)
      return
    }

    // Check that at least one option is selected for each enabled sweep parameter
    if (sweepConfig.sweepThresholdScenarios && sweepConfig.selectedThresholdScenarios.length === 0) {
      setValidationError('Threshold scenarios sweep enabled but no scenarios selected.')
      return
    }

    if (sweepConfig.sweepScenarioModes && sweepConfig.selectedScenarioModes.length === 0) {
      setValidationError('Scenario modes sweep enabled but no modes selected.')
      return
    }

    if (sweepConfig.sweepMaxMonths && sweepConfig.selectedMaxMonths.length === 0) {
      setValidationError('Max months sweep enabled but no months selected.')
      return
    }

    setValidationError(null)

    try {
      await startSweep()
    } catch (error) {
      if (error instanceof Error) {
        setValidationError(`Failed to start sweep: ${error.message}`)
      } else {
        setValidationError('Failed to start sweep. Check console for details.')
      }
    }
  }

  return (
    <Panel title="Parameter Sweep Configuration" glow="cyan">
      <div className="space-y-6">
        {/* Seed Range */}
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--white-60)' }}>
            Seed Range
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs mb-1" style={{ color: 'var(--white-40)' }}>Start</label>
              <input
                type="number"
                value={sweepConfig.startSeed}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (!isNaN(value)) {
                    setSweepConfig({ ...sweepConfig, startSeed: value })
                  }
                }}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white"
                disabled={isRunning}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1" style={{ color: 'var(--white-40)' }}>Count</label>
              <input
                type="number"
                value={sweepConfig.seedCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (!isNaN(value) && value >= 1 && value <= 100) {
                    setSweepConfig({ ...sweepConfig, seedCount: value })
                  }
                }}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white"
                disabled={isRunning}
                min={1}
                max={100}
              />
            </div>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
            Generates: {sweepConfig.startSeed}, {sweepConfig.startSeed + 1}, ..., {sweepConfig.startSeed + sweepConfig.seedCount - 1}
          </p>
        </div>

        {/* Sweep Parameters */}
        <div>
          <label className="block text-sm mb-3" style={{ color: 'var(--white-60)' }}>
            Sweep Parameters (select which to vary)
          </label>

          <div className="space-y-4">
            {/* Threshold Scenario */}
            <div className="p-3 bg-black/20 rounded border border-white/10">
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sweepConfig.sweepThresholdScenarios}
                  onChange={() => handleSweepToggle('sweepThresholdScenarios')}
                  className="w-4 h-4"
                  disabled={isRunning}
                />
                <span className="text-sm font-medium">Threshold Scenario</span>
              </label>

              {sweepConfig.sweepThresholdScenarios && (
                <div className="ml-6 space-y-2">
                  {(['doom', 'cautious', 'baseline', 'progressive', 'utopia'] as const).map(scenario => (
                    <label key={scenario} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sweepConfig.selectedThresholdScenarios.includes(scenario)}
                        onChange={() => handleThresholdScenarioToggle(scenario)}
                        className="w-3 h-3"
                        disabled={isRunning}
                      />
                      <span className="text-sm capitalize" style={{ color: 'var(--white-60)' }}>{scenario}</span>
                    </label>
                  ))}
                  <p className="text-xs mt-2" style={{ color: 'var(--white-40)' }}>
                    Selected: {sweepConfig.selectedThresholdScenarios.length}
                  </p>
                </div>
              )}
            </div>

            {/* Scenario Mode */}
            <div className="p-3 bg-black/20 rounded border border-white/10">
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sweepConfig.sweepScenarioModes}
                  onChange={() => handleSweepToggle('sweepScenarioModes')}
                  className="w-4 h-4"
                  disabled={isRunning}
                />
                <span className="text-sm font-medium">Scenario Mode</span>
              </label>

              {sweepConfig.sweepScenarioModes && (
                <div className="ml-6 space-y-2">
                  {(['historical', 'unprecedented'] as const).map(mode => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sweepConfig.selectedScenarioModes.includes(mode)}
                        onChange={() => handleScenarioModeToggle(mode)}
                        className="w-3 h-3"
                        disabled={isRunning}
                      />
                      <span className="text-sm capitalize" style={{ color: 'var(--white-60)' }}>{mode}</span>
                    </label>
                  ))}
                  <p className="text-xs mt-2" style={{ color: 'var(--white-40)' }}>
                    Selected: {sweepConfig.selectedScenarioModes.length}
                  </p>
                </div>
              )}
            </div>

            {/* Max Months */}
            <div className="p-3 bg-black/20 rounded border border-white/10">
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sweepConfig.sweepMaxMonths}
                  onChange={() => handleSweepToggle('sweepMaxMonths')}
                  className="w-4 h-4"
                  disabled={isRunning}
                />
                <span className="text-sm font-medium">Max Months</span>
              </label>

              {sweepConfig.sweepMaxMonths && (
                <div className="ml-6 space-y-2">
                  {[60, 120, 360, 600].map(months => (
                    <label key={months} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sweepConfig.selectedMaxMonths.includes(months)}
                        onChange={() => handleMaxMonthsToggle(months)}
                        className="w-3 h-3"
                        disabled={isRunning}
                      />
                      <span className="text-sm" style={{ color: 'var(--white-60)' }}>{months} months</span>
                    </label>
                  ))}
                  <p className="text-xs mt-2" style={{ color: 'var(--white-40)' }}>
                    Selected: {sweepConfig.selectedMaxMonths.length}
                  </p>
                </div>
              )}
            </div>

            {/* Nested MC */}
            <div className="p-3 bg-black/20 rounded border border-white/10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sweepConfig.sweepNestedMC}
                  onChange={() => handleSweepToggle('sweepNestedMC')}
                  className="w-4 h-4"
                  disabled={isRunning}
                />
                <span className="text-sm font-medium">Nested Monte Carlo</span>
              </label>
              <p className="text-xs mt-1 ml-6" style={{ color: 'var(--white-40)' }}>
                Tests with nested MC enabled/disabled
              </p>
            </div>
          </div>
        </div>

        {/* Total Simulations */}
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Simulations</span>
            <span className="text-2xl font-light">{totalSimulations}</span>
          </div>
          <div className="text-xs" style={{ color: 'var(--white-40)' }}>
            Estimated time: ~{estimatedTimeMinutes} minutes (5 concurrent)
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
            <p className="text-sm text-red-400">{validationError}</p>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStartSweep}
          disabled={isRunning || totalSimulations === 0 || totalSimulations > 1000}
          className="w-full px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running...' : 'Start Parameter Sweep'}
        </button>
      </div>
    </Panel>
  )
}
