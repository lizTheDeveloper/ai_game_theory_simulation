/**
 * Monte Carlo Parameter Sweep Page
 *
 * Unified interface for Monte Carlo analysis with 3-tab workflow:
 * 1. Configure: Set up parameter sweeps
 * 2. Progress: Real-time tracking of running batches
 * 3. Analysis: Comprehensive results visualization
 *
 * Features far-future aesthetic with glowing tabs and smooth transitions.
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { MonteCarloProvider, useMonteCarlo } from '@/lib/contexts/MonteCarloContext'
import { MonteCarloConfigPanel } from '@/components/monte-carlo/MonteCarloConfigPanel'
import { EnhancedParameterConfig, type EnhancedSweepConfig } from '@/components/monte-carlo/EnhancedParameterConfig'
import { BatchProgressTracker } from '@/components/monte-carlo/BatchProgressTracker'
import { SweepResultsPanel } from '@/components/monte-carlo/SweepResultsPanel'
import { Settings2, FlaskConical, Play, Activity, BarChart3 } from 'lucide-react'
import {
  convertEnhancedToContextConfig,
  convertContextToEnhancedConfig,
  validateEnhancedConfig,
  describeSweepConfig
} from '@/lib/monte-carlo/configAdapter'

// Import new analysis panels
import { LiveProgressPanel } from '@/components/monte-carlo/panels/LiveProgressPanel'
import { OutcomeDistributionPanel } from '@/components/monte-carlo/panels/OutcomeDistributionPanel'
import { TimelineAnalysisPanel } from '@/components/monte-carlo/panels/TimelineAnalysisPanel'
import { CriticalEventsStream } from '@/components/monte-carlo/panels/CriticalEventsStream'
import { EventTypeBreakdownPanel } from '@/components/monte-carlo/panels/EventTypeBreakdownPanel'
import { ParameterSweepComparison } from '@/components/monte-carlo/panels/ParameterSweepComparison'
import { RunInspector } from '@/components/monte-carlo/panels/RunInspector'

// Tab type definition
type TabId = 'configure' | 'progress' | 'analysis'

interface RunEventData {
  seed: number
  run: number
  outcome: string
  outcomeReason: string
  totalMonths: number
  events: {
    summary: {
      period: string
      totalEvents: number
      eventsByType: Record<string, number>
      criticalEvents: Array<{
        id?: string
        month?: number
        severity?: string
        title?: string
        agent?: string
        description?: string
        effects?: Record<string, any>
      }>
    }
    criticalEvents?: Array<any>
  }
  criticalEvents?: Array<any>
  snapshots?: any
}

function TabButton({
  id,
  label,
  icon: Icon,
  isActive,
  badge,
  disabled,
  onClick
}: {
  id: TabId
  label: string
  icon: React.ElementType
  isActive: boolean
  badge?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 flex items-center gap-2 transition-all duration-300
        border-b-2 font-light text-sm uppercase tracking-wider
        ${isActive
          ? 'border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
          : disabled
            ? 'border-transparent text-white/20 cursor-not-allowed'
            : 'border-transparent text-white/60 hover:text-white/80 hover:border-white/20'
        }
      `}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {badge && (
        <span className={`
          ml-2 px-2 py-0.5 rounded-full text-xs font-medium
          ${isActive
            ? 'bg-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
            : 'bg-white/10 text-white/60'
          }
        `}>
          {badge}
        </span>
      )}
    </button>
  )
}

function MonteCarloPageContent() {
  const {
    sweepConfig,
    setSweepConfig,
    startSweep,
    isRunning,
    progress,
    aggregateStats
  } = useMonteCarlo()

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('configure')
  const [useEnhancedConfig, setUseEnhancedConfig] = useState(true)

  // Enhanced config state
  const [enhancedConfig, setEnhancedConfig] = useState<EnhancedSweepConfig>(() =>
    convertContextToEnhancedConfig(sweepConfig)
  )

  // Results data (loaded from disk)
  const [runResults, setRunResults] = useState<Map<string, RunEventData>>(new Map())
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [criticalEvents, setCriticalEvents] = useState<Array<{
    runId: string
    month: number
    event: any
  }>>([])

  // Auto-switch to Progress tab when batch starts
  useEffect(() => {
    if (isRunning && activeTab === 'configure') {
      setActiveTab('progress')
    }
  }, [isRunning, activeTab])

  // Load results when batch completes
  useEffect(() => {
    if (aggregateStats && progress && !isRunning) {
      loadBatchResults(progress.batchId)
    }
  }, [aggregateStats, progress, isRunning])

  // Sync enhanced config changes to context
  const handleEnhancedConfigChange = (newConfig: EnhancedSweepConfig) => {
    setEnhancedConfig(newConfig)
    const contextConfig = convertEnhancedToContextConfig(newConfig)
    setSweepConfig(contextConfig)
  }

  // Handle enhanced sweep start
  const handleEnhancedSweep = async () => {
    const hasEnabledParams = Object.values(enhancedConfig.parameters).some(
      p => p.enabled && p.values.length > 0
    )

    if (!hasEnabledParams && enhancedConfig.seedCount === 1) {
      alert('Please select at least one parameter to sweep, or increase the seed count for a seed-only sweep.')
      return
    }

    const validationError = validateEnhancedConfig(enhancedConfig)
    if (validationError) {
      alert(validationError)
      return
    }

    console.log('Starting enhanced parameter sweep:', describeSweepConfig(enhancedConfig))

    try {
      await startSweep()
    } catch (error) {
      console.error('Failed to start sweep:', error)
      alert('Failed to start parameter sweep. Check console for details.')
    }
  }

  // Load batch results from disk
  const loadBatchResults = useCallback(async (batchId: string) => {
    try {
      const match = batchId.match(/batch-(\d+)-/)
      if (!match) return

      const startSeed = parseInt(match[1])
      const results = new Map<string, RunEventData>()
      const events: Array<{ runId: string; month: number; event: any }> = []

      // Load up to 100 run files
      for (let i = 0; i < 100; i++) {
        try {
          const response = await fetch(`/monteCarloOutputs/run_${startSeed + i}_events.json`)
          if (!response.ok) break

          const data: RunEventData = await response.json()
          results.set(`run_${startSeed + i}`, data)

          // Extract critical events
          if (data.events?.summary?.criticalEvents) {
            data.events.summary.criticalEvents.forEach(event => {
              if (event.severity === 'destructive' || event.severity === 'high') {
                events.push({
                  runId: `run_${startSeed + i}`,
                  month: event.month || 0,
                  event
                })
              }
            })
          }
        } catch (err) {
          // File doesn't exist, stop loading
          break
        }
      }

      setRunResults(results)
      setCriticalEvents(events)
    } catch (err) {
      console.error('Failed to load batch results:', err)
    }
  }, [])

  // Calculate derived metrics
  const outcomeBreakdown = useMemo(() => {
    if (!runResults.size) return null

    const breakdown: Record<string, number> = {
      utopia: 0,
      postScarcity: 0,
      sustainable: 0,
      bottleneck: 0,
      collapse: 0,
      extinction: 0,
      terminal: 0
    }

    runResults.forEach(run => {
      const outcome = run.outcome?.toLowerCase() || 'unknown'
      if (outcome in breakdown) {
        breakdown[outcome]++
      }
    })

    return breakdown
  }, [runResults])

  const eventTypeStats = useMemo(() => {
    if (!runResults.size) return null

    const aggregated: Record<string, number> = {}

    runResults.forEach(run => {
      if (run.events?.summary?.eventsByType) {
        Object.entries(run.events.summary.eventsByType).forEach(([type, count]) => {
          aggregated[type] = (aggregated[type] || 0) + count
        })
      }
    })

    return aggregated
  }, [runResults])

  // Determine tab states
  const hasResults = aggregateStats !== null && runResults.size > 0
  const canViewAnalysis = hasResults

  return (
    <main className="min-h-screen p-8 bg-black">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light text-white mb-2">
            Monte Carlo Parameter Sweep
          </h1>
          <p className="text-sm text-white/60">
            Explore simulation outcomes across parameter space with comprehensive real-time analysis
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-white/10 mb-6">
          <div className="flex items-center gap-1">
            <TabButton
              id="configure"
              label="Configure"
              icon={Settings2}
              isActive={activeTab === 'configure'}
              onClick={() => setActiveTab('configure')}
            />
            <TabButton
              id="progress"
              label="Progress"
              icon={Activity}
              isActive={activeTab === 'progress'}
              badge={isRunning ? 'Running' : undefined}
              onClick={() => setActiveTab('progress')}
            />
            <TabButton
              id="analysis"
              label="Analysis"
              icon={BarChart3}
              isActive={activeTab === 'analysis'}
              badge={hasResults ? 'Ready' : undefined}
              disabled={!canViewAnalysis}
              onClick={() => canViewAnalysis && setActiveTab('analysis')}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* CONFIGURE TAB */}
          {activeTab === 'configure' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Configuration Panel */}
              <div className="lg:col-span-1">
                <div className="mb-4">
                  <button
                    onClick={() => setUseEnhancedConfig(!useEnhancedConfig)}
                    className={`w-full px-4 py-2 rounded flex items-center justify-center gap-2 transition-all ${
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

              {/* Right: Info Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Start Guide */}
                <div className="p-6 bg-black/40 border border-cyan-500/20 rounded-lg">
                  <h3 className="text-lg font-light text-cyan-400 mb-3 flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Getting Started
                  </h3>
                  <div className="space-y-3 text-sm text-white/60">
                    <p>
                      The Monte Carlo parameter sweep explores simulation outcomes by running multiple
                      simulations with varying parameters and random seeds.
                    </p>
                    <div className="space-y-2">
                      <p className="text-white/80 font-medium">Workflow:</p>
                      <ol className="list-decimal list-inside ml-2 space-y-1">
                        <li>Select parameters to sweep (enable checkboxes, add values)</li>
                        <li>Set seed count for statistical variance</li>
                        <li>Click "Start Sweep" to begin batch execution</li>
                        <li>Monitor progress in real-time on the Progress tab</li>
                        <li>Analyze comprehensive results on the Analysis tab</li>
                      </ol>
                    </div>
                    <p className="mt-3 text-xs text-white/40">
                      Total simulations = (seeds) × (param1 values) × (param2 values) × ...
                    </p>
                  </div>
                </div>

                {/* Enhanced Config Info */}
                {useEnhancedConfig && (
                  <div className="p-6 bg-black/40 border border-cyan-500/20 rounded-lg">
                    <h3 className="text-lg font-light text-cyan-400 mb-3 flex items-center gap-2">
                      <FlaskConical className="h-5 w-5" />
                      Enhanced Configuration
                    </h3>
                    <div className="space-y-2 text-sm text-white/60">
                      <p>
                        Access to all simulation parameters including:
                      </p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Core simulation dynamics (government, social, economic, AI coordination)</li>
                        <li>Alignment dynamics models (static, drift, epicycles, unknowable)</li>
                        <li>AI suffering and consciousness parameters</li>
                        <li>Collective evolution thresholds</li>
                        <li>Crisis cascade multipliers and recovery rates</li>
                        <li>Scenario modes and threshold uncertainties</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Current Batch Stats */}
                {progress && (
                  <div className="p-6 bg-black/40 border border-white/20 rounded-lg">
                    <h3 className="text-lg font-light text-white/80 mb-3">
                      Current Batch Status
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-light text-white">
                          {progress.completedRuns}
                        </p>
                        <p className="text-xs text-white/40 uppercase tracking-wider">
                          Completed
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-light text-cyan-400">
                          {progress.runningRuns}
                        </p>
                        <p className="text-xs text-white/40 uppercase tracking-wider">
                          Running
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-light text-white/60">
                          {progress.totalRuns}
                        </p>
                        <p className="text-xs text-white/40 uppercase tracking-wider">
                          Total
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROGRESS TAB */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {progress ? (
                <>
                  <LiveProgressPanel
                    progress={progress}
                    onCancel={() => {
                      console.log('TODO: Cancel batch')
                    }}
                  />
                  <BatchProgressTracker />
                </>
              ) : (
                <div className="p-12 bg-black/40 border border-white/20 rounded-lg text-center">
                  <Activity className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-light text-white/60 mb-2">
                    No Active Batch
                  </h3>
                  <p className="text-sm text-white/40 mb-6">
                    Start a parameter sweep from the Configure tab to see real-time progress here.
                  </p>
                  <button
                    onClick={() => setActiveTab('configure')}
                    className="px-6 py-2 bg-cyan-500/20 border border-cyan-400/60 rounded
                               text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300
                               shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  >
                    Go to Configure
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ANALYSIS TAB */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {hasResults ? (
                <>
                  {/* Top Row: Outcomes + Timeline */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <OutcomeDistributionPanel
                      stats={aggregateStats!}
                      outcomeBreakdown={outcomeBreakdown}
                    />
                    <TimelineAnalysisPanel
                      stats={aggregateStats!}
                      runResults={Array.from(runResults.values())}
                    />
                  </div>

                  {/* Middle Row: Events + Event Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CriticalEventsStream
                      events={criticalEvents}
                      isLive={isRunning}
                    />
                    <EventTypeBreakdownPanel
                      eventStats={eventTypeStats}
                      totalRuns={runResults.size}
                    />
                  </div>

                  {/* Parameter Sweep Comparison (full width if sweep exists) */}
                  {progress?.sweepGroups && (
                    <ParameterSweepComparison
                      sweepGroups={progress.sweepGroups}
                      runResults={runResults}
                    />
                  )}

                  {/* Run Inspector (expandable) */}
                  <RunInspector
                    runResults={runResults}
                    selectedRunId={selectedRunId}
                    onSelectRun={setSelectedRunId}
                  />

                  {/* Legacy Results Panel */}
                  <SweepResultsPanel />
                </>
              ) : (
                <div className="p-12 bg-black/40 border border-white/20 rounded-lg text-center">
                  <BarChart3 className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-light text-white/60 mb-2">
                    No Results Available
                  </h3>
                  <p className="text-sm text-white/40 mb-6">
                    Complete a parameter sweep to see comprehensive analysis here.
                  </p>
                  <button
                    onClick={() => setActiveTab('configure')}
                    className="px-6 py-2 bg-cyan-500/20 border border-cyan-400/60 rounded
                               text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300
                               shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  >
                    Start New Sweep
                  </button>
                </div>
              )}
            </div>
          )}
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
