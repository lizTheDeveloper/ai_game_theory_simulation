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

  // Initialize simulation
  const handleInit = () => {
    if (initialized) return

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
      init(configSeed, configScenario, configSpeed, alignmentConfig, climatePriorityConfig)
      setShowConfig(false)
    } catch (err) {
      console.error('[Navigation] Init error:', err)
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
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
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

        {/* Footer */}
        <div className="p-4 border-t text-xs space-y-1" style={{ borderColor: 'var(--white-10)', color: 'var(--white-30)' }}>
          <div>Keyboard: 0-9 navigate</div>
          <div>Spacebar: pause/play</div>
          <div className="pt-2 border-t" style={{ borderColor: 'var(--white-10)' }}>Design: Elysium 2100s</div>
        </div>
      </nav>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50" onClick={() => setShowConfig(false)}>
          <div className="bg-black border border-white/20 p-8 max-w-md w-full shadow-[0_0_30px_rgba(0,240,255,0.3)]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl mb-6 text-cyan-400">Initialize Simulation</h2>

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

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowConfig(false)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 transition-all rounded"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleInit}
                  className="flex-1 px-4 py-3 bg-cyan-500/20 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/30 transition-all rounded"
                >
                  INITIALIZE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
