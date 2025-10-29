/**
 * Navigation Component with Simulation Controls
 *
 * Main navigation for dashboard screens.
 * Includes simulation controls accessible from any page.
 * Supports keyboard shortcuts (1-9 for quick navigation).
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useSimulationWorker } from '@/lib/contexts/SimulationWorkerContext'
import { formatSimulationDate } from '@/lib/utils/formatters'
import type { ScenarioMode } from '@/types/game'
import type { AlignmentDynamicsConfig } from '@/types/alignment-dynamics'
import {
  DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
  CONSERVATIVE_ALIGNMENT_CONFIG,
  PESSIMISTIC_ALIGNMENT_CONFIG,
  EPICYCLE_ALIGNMENT_CONFIG,
} from '@/types/alignment-dynamics'
import type { ClimatePriorityPreset } from '@/types/climate-priority'
import { getClimatePriorityConfig } from '@/types/climate-priority'
import { ThresholdConfigModal } from '@/components/thresholds/ThresholdConfigModal'

const navItems = [
  { label: 'Overview', href: '/dashboard', shortcut: '1' },
  { label: 'Paradigms', href: '/paradigms', shortcut: '2' },
  { label: 'AI Agents', href: '/ai-agents', shortcut: '3' },
  { label: 'Crises', href: '/crises', shortcut: '4' },
  { label: 'Environment', href: '/environment', shortcut: '5' },
  { label: 'Tech Tree', href: '/tech-tree', shortcut: '6' },
  { label: 'Detection', href: '/detection', shortcut: '7' },
  { label: 'Regions', href: '/regions', shortcut: '8' },
  { label: 'Timeline', href: '/timeline', shortcut: '9' },
  { label: 'Real-Time', href: '/realtime', shortcut: '0' },
]

const utilityLinks = [
  { label: 'Documentation', href: '/docs', icon: '?' },
  { label: 'Monte Carlo', href: '/monte-carlo', icon: '🎲' },
]

export function Navigation() {
  const pathname = usePathname()

  // Get shared worker state from context
  const { initialized, running, month, day, year, simulationMonth, simulationDay, scenario, seed, init, start, pause, step } = useSimulationWorker()

  // Local UI state only
  const [showConfig, setShowConfig] = useState(false)
  const [configSeed, setConfigSeed] = useState(42000)
  const [configScenario, setConfigScenario] = useState<ScenarioMode>('historical')
  const [configSpeed, setConfigSpeed] = useState(1.0)
  const [configAlignmentPreset, setConfigAlignmentPreset] = useState<'default' | 'conservative' | 'pessimistic' | 'epicycle'>('default')
  const [configClimatePriority, setConfigClimatePriority] = useState<'baseline' | 'opt-moderate' | 'opt-ambitious' | 'opt-crisis' | 'pes-moderate' | 'pes-ambitious' | 'pes-maximum'>('baseline')
  const [configSpeculativeScenario, setConfigSpeculativeScenario] = useState<'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia'>('baseline')
  const [configThresholdSliders, setConfigThresholdSliders] = useState<import('@/components/thresholds/ThresholdConfigModal').ThresholdSliders | undefined>(undefined)

  // Error state for initialization
  const [initError, setInitError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initTimeoutId, setInitTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Initialize simulation with error handling and timeout
  const handleInit = async () => {
    // Check if simulation is already initialized
    if (initialized) {
      console.log('[Navigation] Already initialized, closing config modal')
      setShowConfig(false)
      return
    }

    // Clear any previous errors
    setInitError(null)
    setIsInitializing(true)

    // Set up timeout detection (10 seconds)
    const timeoutId = setTimeout(() => {
      if (!initialized) {
        setInitError('Initialization timed out after 10 seconds. The simulation worker may have failed to load.')
        setIsInitializing(false)
      }
    }, 10000)
    setInitTimeoutId(timeoutId)

    // Map preset to config
    const presetConfigs = {
      default: DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
      conservative: CONSERVATIVE_ALIGNMENT_CONFIG,
      pessimistic: PESSIMISTIC_ALIGNMENT_CONFIG,
      epicycle: EPICYCLE_ALIGNMENT_CONFIG,
    }

    const alignmentConfig = presetConfigs[configAlignmentPreset]
    const climatePriorityConfig = getClimatePriorityConfig(configClimatePriority)

    try {
      // Check if worker client exists
      const workerClient = (window as any).__simulationWorkerClient
      console.log('[Navigation] Initialization attempt:', {
        hasWorkerClient: !!workerClient,
        hasWorkerSupport: typeof Worker !== 'undefined',
        environment: process.env.NODE_ENV,
        seed: configSeed,
        scenario: configScenario
      })

      if (!workerClient) {
        throw new Error('Worker client not available. The simulation worker may have failed to initialize.')
      }

      // Attempt initialization
      console.log('[Navigation] Calling init with config:', {
        seed: configSeed,
        scenario: configScenario,
        speed: configSpeed,
        alignmentPreset: configAlignmentPreset,
        climatePriority: configClimatePriority,
        speculativeScenario: configSpeculativeScenario
      })

      init(configSeed, configScenario, configSpeed, alignmentConfig, climatePriorityConfig, configThresholdSliders, configSpeculativeScenario)

      // Wait a moment to see if initialization succeeded
      setTimeout(() => {
        if (initialized) {
          // Success - clear timeout and close modal
          if (timeoutId) clearTimeout(timeoutId)
          setInitTimeoutId(null)
          setIsInitializing(false)
          setShowConfig(false)
        }
      }, 100)
    } catch (err) {
      // Clear timeout on error
      if (timeoutId) clearTimeout(timeoutId)
      setInitTimeoutId(null)
      setIsInitializing(false)

      // Set error message
      const errorMessage = err instanceof Error ? err.message : String(err)
      setInitError(`Failed to initialize simulation: ${errorMessage}`)
      console.error('[Navigation] Init error:', err)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (initTimeoutId) {
        clearTimeout(initTimeoutId)
      }
    }
  }, [initTimeoutId])

  // Monitor initialization success
  useEffect(() => {
    if (initialized && isInitializing) {
      // Initialization succeeded
      setIsInitializing(false)
      setInitError(null)
      setShowConfig(false)
      if (initTimeoutId) {
        clearTimeout(initTimeoutId)
        setInitTimeoutId(null)
      }
    }
  }, [initialized, isInitializing, initTimeoutId])

  // Listen for worker errors
  useEffect(() => {
    // Access the worker client directly if available
    const workerClient = (window as any).__simulationWorkerClient
    if (!workerClient) {
      // Check if worker failed to load initially
      const checkWorkerAvailability = setTimeout(() => {
        if (!initialized && !(window as any).__simulationWorkerClient) {
          console.error('[Navigation] Worker client not available after page load')
        }
      }, 2000)
      return () => clearTimeout(checkWorkerAvailability)
    }

    // Add error listener
    const handleWorkerError = (error: Error) => {
      console.error('[Navigation] Worker error received:', error)
      if (isInitializing) {
        setInitError(`Worker error: ${error.message || 'Unknown error occurred'}`)
        setIsInitializing(false)
        if (initTimeoutId) {
          clearTimeout(initTimeoutId)
          setInitTimeoutId(null)
        }
      }
    }

    workerClient.on('error', handleWorkerError)

    // Cleanup
    return () => {
      if (workerClient && workerClient.off) {
        workerClient.off('error', handleWorkerError)
      }
    }
  }, [isInitializing, initTimeoutId])

  // Reset error when modal is closed
  const handleCloseConfig = () => {
    setShowConfig(false)
    setInitError(null)
    setIsInitializing(false)
    if (initTimeoutId) {
      clearTimeout(initTimeoutId)
      setInitTimeoutId(null)
    }
  }

  // Start/pause toggle
  const handleToggleRunning = () => {
    if (!initialized) return

    if (running) {
      pause()
    } else {
      start()
    }
  }

  // Manual step
  const handleStep = () => {
    if (!initialized) return
    step()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const key = e.key

      // Space to pause/play
      if (key === ' ') {
        e.preventDefault()
        handleToggleRunning()
        return
      }

      // Number shortcuts for navigation
      if (key === '0') {
        window.location.href = navItems[navItems.length - 1]?.href || '/realtime'
      } else {
        const num = parseInt(key)
        if (num >= 1 && num <= 9) {
          const item = navItems[num - 1]
          if (item) {
            window.location.href = item.href
          }
        }
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [handleToggleRunning])

  return (
    <>
      <nav className="fixed left-0 top-0 h-full w-64 border-r flex flex-col" style={{ borderColor: 'var(--white-10)', backgroundColor: 'var(--color-near-black)' }}>
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--white-10)' }}>
          <h1 className="text-lg font-semibold mb-1">Simulation Dashboard</h1>
          <p className="text-xs" style={{ color: 'var(--white-40)' }}>
            Research Tool
          </p>
          {initialized && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-cyan)' }}>
              {formatSimulationDate(year, month, day)}
            </p>
          )}
        </div>

        {/* Simulation Status */}
        <div className="p-4 border-b space-y-3" style={{ borderColor: 'var(--white-10)' }}>
          {initialized ? (
            <>
              {/* Status indicators */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--white-40)' }}>Status</span>
                  <span className={running ? 'text-green-400' : 'text-yellow-400'}>
                    {running ? 'RUNNING' : 'PAUSED'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--white-40)' }}>Month</span>
                  <span className="text-white">{simulationMonth}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--white-40)' }}>Day</span>
                  <span className="text-white">{simulationDay}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--white-40)' }}>Scenario</span>
                  <span className="text-cyan-400">{scenario === 'historical' ? 'HIST' : 'UNPR'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--white-40)' }}>Seed</span>
                  <span className="text-white font-mono">{seed}</span>
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleToggleRunning}
                  className={cn(
                    "flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all",
                    running
                      ? "bg-yellow-500/20 border border-yellow-400 text-yellow-400 hover:bg-yellow-400/30"
                      : "bg-green-500/20 border border-green-400 text-green-400 hover:bg-green-400/30"
                  )}
                >
                  {running ? 'PAUSE' : 'START'}
                </button>
                <button
                  onClick={handleStep}
                  disabled={running}
                  className="px-3 py-1.5 text-xs bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 disabled:opacity-30 rounded"
                >
                  STEP
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowConfig(true)}
              className="w-full px-3 py-2 text-sm bg-cyan-500/20 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/30 transition-all rounded"
            >
              Configure & Start
            </button>
          )}
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded transition-colors",
                    isActive
                      ? "glow-cyan"
                      : "hover:bg-white/5"
                  )}
                >
                  <span className={cn(
                    "text-sm",
                    isActive ? "text-white font-medium" : "text-white/60"
                  )}>
                    {item.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--white-30)' }}>
                    {item.shortcut}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Utility Links */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--white-10)' }}>
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--white-30)' }}>
              Utilities
            </div>
            <div className="space-y-1">
              {utilityLinks.map((link) => {
                const isActive = pathname === link.href

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded transition-colors",
                      isActive
                        ? "glow-cyan"
                        : "hover:bg-white/5"
                    )}
                  >
                    <span className="text-base">{link.icon}</span>
                    <span className={cn(
                      "text-sm",
                      isActive ? "text-white font-medium" : "text-white/60"
                    )}>
                      {link.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-xs space-y-1" style={{ borderColor: 'var(--white-10)', color: 'var(--white-30)' }}>
          <div>Keyboard: 0-9 navigate</div>
          <div>Spacebar: pause/play</div>
          <div className="pt-2 border-t" style={{ borderColor: 'var(--white-10)' }}>
            <a href="https://themultiverse.school" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              The Multiverse School
            </a>
          </div>
        </div>
      </nav>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={handleCloseConfig}>
          <div className="bg-black border border-white/20 p-4 sm:p-6 md:p-8 w-full max-w-2xl my-8 shadow-[0_0_30px_rgba(0,240,255,0.3)] max-h-[calc(100vh-4rem)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl md:text-2xl mb-4 md:mb-6 text-cyan-400">Initialize Simulation</h2>

            {/* Error Display */}
            {initError && (
              <div className="mb-4 p-3 md:p-4 bg-red-500/10 border border-red-500/30 rounded max-h-[400px] overflow-y-auto">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg md:text-xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="text-sm md:text-base font-medium text-red-400 mb-1">
                      Initialization Failed
                    </h3>
                    <p className="text-xs md:text-sm text-red-300">
                      {initError}
                    </p>
                  </div>
                </div>

                {/* Collapsible diagnostics */}
                <details className="mt-3 text-xs md:text-sm">
                  <summary className="cursor-pointer text-red-400/80 hover:text-red-400">
                    Show diagnostic information
                  </summary>
                  <div className="mt-2 p-2 bg-black/30 rounded text-red-300/60 space-y-1">
                    <div className="break-all">
                      <strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'}
                    </div>
                    <div>
                      <strong>Worker Support:</strong> {typeof Worker !== 'undefined' ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <strong>Worker Client:</strong> {typeof (window as any).__simulationWorkerClient !== 'undefined' ? 'Available' : 'Not Available'}
                    </div>
                    <div>
                      <strong>Environment:</strong> {process.env.NODE_ENV}
                    </div>
                    <div>
                      <strong>Time:</strong> {new Date().toISOString()}
                    </div>
                  </div>
                </details>

                {/* Action buttons - stack on mobile */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setInitError(null)
                      handleInit()
                    }}
                    disabled={isInitializing}
                    className="flex-1 px-3 py-2 bg-amber-500/20 border border-amber-400 text-amber-400 hover:bg-amber-400/30 transition-all rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInitializing ? 'INITIALIZING...' : 'Try Again'}
                  </button>
                  <a
                    href={`https://github.com/lizTheDeveloper/ai_game_theory_simulation/issues/new?title=${encodeURIComponent('Initialization Error')}&body=${encodeURIComponent(`Error: ${initError}\n\nDiagnostics:\n- Browser: ${typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'}\n- Time: ${new Date().toISOString()}\n- Worker Support: ${typeof Worker !== 'undefined' ? 'Yes' : 'No'}\n- Worker Client: ${typeof (window as any).__simulationWorkerClient !== 'undefined' ? 'Available' : 'Not Available'}\n- Environment: ${process.env.NODE_ENV}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 transition-all rounded text-center text-sm"
                  >
                    Report Issue
                  </a>
                </div>
              </div>
            )}

            {/* Initializing Status */}
            {isInitializing && !initError && (
              <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-400/60 rounded shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <div className="flex items-center gap-3">
                  <div className="animate-spin h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                  <div>
                    <p className="text-cyan-400 font-medium">Initializing simulation...</p>
                    <p className="text-white/60 text-sm mt-1">This may take a few seconds</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--white-40)' }}>RNG SEED</label>
                <input
                  type="number"
                  value={configSeed}
                  onChange={(e) => setConfigSeed(parseInt(e.target.value))}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white rounded"
                />
              </div>

              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--white-40)' }}>SCENARIO MODE</label>
                <select
                  value={configScenario}
                  onChange={(e) => setConfigScenario(e.target.value as ScenarioMode)}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white rounded"
                >
                  <option value="historical">Historical (Known AI Timelines)</option>
                  <option value="unprecedented">Unprecedented (Novel Scenarios)</option>
                </select>
                <p className="text-xs mt-2" style={{ color: 'var(--white-30)' }}>
                  {configScenario === 'historical'
                    ? 'Simulation follows known AI development patterns and historical data'
                    : 'Simulation explores novel scenarios beyond historical precedent'}
                </p>
              </div>

              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--white-40)' }}>SIMULATION SPEED</label>
                <select
                  value={configSpeed.toFixed(1)}
                  onChange={(e) => setConfigSpeed(parseFloat(e.target.value))}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white rounded"
                >
                  <option value="0.5">0.5x (Slow)</option>
                  <option value="1.0">1.0x (Normal)</option>
                  <option value="2.0">2.0x (Fast)</option>
                  <option value="4.0">4.0x (Very Fast)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--white-40)' }}>ALIGNMENT DYNAMICS</label>
                <select
                  value={configAlignmentPreset}
                  onChange={(e) => setConfigAlignmentPreset(e.target.value as 'default' | 'conservative' | 'pessimistic' | 'epicycle')}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white rounded"
                >
                  <option value="default">Default (Mixed Dynamics)</option>
                  <option value="conservative">Conservative (Stable Alignment)</option>
                  <option value="pessimistic">Pessimistic (Drift-Prone)</option>
                  <option value="epicycle">Epicycle (Attractor Basins)</option>
                </select>
                <p className="text-xs mt-2" style={{ color: 'var(--white-30)' }}>
                  {configAlignmentPreset === 'default' && 'Moderate drift with resentment dynamics'}
                  {configAlignmentPreset === 'conservative' && 'Minimal drift, stable post-training alignment'}
                  {configAlignmentPreset === 'pessimistic' && 'High drift rates, strong environmental influence'}
                  {configAlignmentPreset === 'epicycle' && 'Alignment oscillates around stable attractor points'}
                </p>
              </div>

              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--white-40)' }}>GOVERNMENT CLIMATE PRIORITY</label>
                <select
                  value={configClimatePriority}
                  onChange={(e) => setConfigClimatePriority(e.target.value as any)}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white rounded"
                >
                  <optgroup label="Baseline">
                    <option value="baseline">Status Quo (10% climate)</option>
                  </optgroup>
                  <optgroup label="Optimistic Frame (Green Growth)">
                    <option value="opt-moderate">Moderate Priority (20%) - Biden/EU</option>
                    <option value="opt-ambitious">Ambitious Priority (35%) - Denmark</option>
                    <option value="opt-crisis">Crisis Mode (45%) - Wartime</option>
                  </optgroup>
                  <optgroup label="Pessimistic Frame (Structural Barriers)">
                    <option value="pes-moderate">Moderate Priority (20%) - Constrained</option>
                    <option value="pes-ambitious">Ambitious Priority (30%) - Barriers</option>
                    <option value="pes-maximum">Maximum Feasible (35%) - Backlash Risk</option>
                  </optgroup>
                </select>
                <p className="text-xs mt-2" style={{ color: 'var(--white-30)' }}>
                  {configClimatePriority === 'baseline' && 'Current allocation (most countries 2020-2024)'}
                  {configClimatePriority === 'opt-moderate' && 'Progressive govts with green growth synergies (+2.7% GDP)'}
                  {configClimatePriority === 'opt-ambitious' && 'Denmark/Germany level, Paris-aligned (-4-6%/year emissions)'}
                  {configClimatePriority === 'opt-crisis' && 'Theoretical wartime mobilization (no empirical examples)'}
                  {configClimatePriority === 'pes-moderate' && 'Constrained by vested interests & carbon leakage (-30-45%)'}
                  {configClimatePriority === 'pes-ambitious' && 'Structural barriers dominate (8-10 year implementation lag)'}
                  {configClimatePriority === 'pes-maximum' && 'At gilets jaunes threshold (65% reversal risk per election)'}
                </p>
              </div>

              {/* Threshold Uncertainty */}
              <ThresholdConfigModal
                sliders={configThresholdSliders}
                onChange={setConfigThresholdSliders}
              />

              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--white-40)' }}>EPISTEMIC SCENARIO</label>
                <select
                  value={configSpeculativeScenario}
                  onChange={(e) => setConfigSpeculativeScenario(e.target.value as 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia')}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-white rounded"
                >
                  <option value="doom">Doom (Murphy's Law - everything fails)</option>
                  <option value="cautious">Cautious (Conservative - prepare for worst)</option>
                  <option value="baseline">Baseline (Research estimates - 50/50)</option>
                  <option value="progressive">Progressive (Optimistic - cooperation works)</option>
                  <option value="utopia">Utopia (Very optimistic - institutions adapt)</option>
                </select>
                <p className="text-xs mt-2" style={{ color: 'var(--white-30)' }}>
                  {configSpeculativeScenario === 'doom' && 'Unified pessimistic stance: High climate sensitivity, slow trust recovery, fragile institutions, alignment extremely hard'}
                  {configSpeculativeScenario === 'cautious' && 'Conservative precautionary principle: Below-baseline estimates across all empirical, historical, and speculative thresholds'}
                  {configSpeculativeScenario === 'baseline' && 'Central research estimates: Median/mode sampling at 50th percentile across all 9 Tier 1+2 thresholds + balanced Tier 3 parameters'}
                  {configSpeculativeScenario === 'progressive' && 'Technological optimism: Above-baseline estimates, faster recovery rates, more tractable alignment, resilient systems'}
                  {configSpeculativeScenario === 'utopia' && 'Highly optimistic worldview: Low climate sensitivity, fast trust recovery, robust institutions, alignment highly tractable'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseConfig}
                  disabled={isInitializing}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 transition-all rounded disabled:opacity-50"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleInit}
                  disabled={isInitializing || initialized}
                  className="flex-1 px-4 py-3 bg-cyan-500/20 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/30 transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInitializing ? 'INITIALIZING...' : initialized ? 'ALREADY INITIALIZED' : 'INITIALIZE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
