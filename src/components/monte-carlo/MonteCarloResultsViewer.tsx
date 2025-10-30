/**
 * Monte Carlo Results Viewer
 *
 * Comprehensive real-time visualization of Monte Carlo simulation results.
 * Transforms opaque background worker data into an information-rich dashboard.
 *
 * Features:
 * - Real-time progress tracking as simulations run
 * - 7-tier outcome classification visualization
 * - Timeline analysis with survival curves
 * - Critical events streaming
 * - Event type breakdowns
 * - Parameter sweep comparisons
 * - Individual run inspection
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { MonteCarloManager, type MonteCarloBatchProgress, type MonteCarloAggregateStats } from '@/lib/MonteCarloManager'
import { LiveProgressPanel } from './panels/LiveProgressPanel'
import { OutcomeDistributionPanel } from './panels/OutcomeDistributionPanel'
import { TimelineAnalysisPanel } from './panels/TimelineAnalysisPanel'
import { CriticalEventsStream } from './panels/CriticalEventsStream'
import { EventTypeBreakdownPanel } from './panels/EventTypeBreakdownPanel'
import { ParameterSweepComparison } from './panels/ParameterSweepComparison'
import { RunInspector } from './panels/RunInspector'
import { Panel } from '@/components/core/Panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export function MonteCarloResultsViewer() {
  // State management
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null)
  const [batchProgress, setBatchProgress] = useState<MonteCarloBatchProgress | null>(null)
  const [aggregateStats, setAggregateStats] = useState<MonteCarloAggregateStats | null>(null)
  const [runResults, setRunResults] = useState<Map<string, RunEventData>>(new Map())
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Manager reference
  const managerRef = useRef<MonteCarloManager | null>(null)

  // Event feed state
  const [criticalEvents, setCriticalEvents] = useState<Array<{
    runId: string
    month: number
    event: any
  }>>([])

  // Initialize manager and setup event listeners
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new MonteCarloManager()

      // Setup event listeners
      managerRef.current.on('batchProgress', (progress: MonteCarloBatchProgress) => {
        setBatchProgress(progress)

        // Update aggregate stats periodically
        if (progress.completedRuns > 0 && progress.completedRuns % 10 === 0) {
          loadAggregateStats(progress.batchId)
        }
      })

      managerRef.current.on('batchCompleted', async (batchId: string) => {
        // Load final results
        await loadBatchResults(batchId)
        await loadAggregateStats(batchId)
      })

      managerRef.current.on('simulationCompleted', async (simulationId: string, batchId: string) => {
        // Load individual run results
        await loadRunResults(simulationId)
      })
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
      }
    }
  }, [])

  // Load batch results from JSON files
  const loadBatchResults = useCallback(async (batchId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Parse batch ID to get seed range
      const match = batchId.match(/batch-(\d+)-/)
      if (!match) return

      const startSeed = parseInt(match[1])
      const results = new Map<string, RunEventData>()

      // Try to load up to 100 run files
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
                setCriticalEvents(prev => [...prev, {
                  runId: `run_${startSeed + i}`,
                  month: event.month || 0,
                  event
                }])
              }
            })
          }
        } catch (err) {
          // File doesn't exist, continue
        }
      }

      setRunResults(results)
    } catch (err) {
      setError(`Failed to load batch results: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load individual run results
  const loadRunResults = useCallback(async (simulationId: string) => {
    try {
      // Extract seed from simulation ID
      const match = simulationId.match(/run(\d+)/)
      if (!match) return

      const seed = match[1]
      const response = await fetch(`/monteCarloOutputs/run_${seed}_events.json`)
      if (!response.ok) return

      const data: RunEventData = await response.json()
      setRunResults(prev => new Map(prev).set(simulationId, data))
    } catch (err) {
      console.error(`Failed to load run ${simulationId}:`, err)
    }
  }, [])

  // Load aggregate statistics
  const loadAggregateStats = useCallback(async (batchId: string) => {
    if (!managerRef.current) return

    try {
      const stats = await managerRef.current.getAggregateStats(batchId)
      if (stats) {
        setAggregateStats(stats)
      }
    } catch (err) {
      console.error('Failed to load aggregate stats:', err)
    }
  }, [])

  // Start a new batch
  const startNewBatch = useCallback(async (config: any) => {
    if (!managerRef.current) return

    try {
      const batchId = await managerRef.current.createBatch(config)
      setActiveBatchId(batchId)
      await managerRef.current.startBatch(batchId)
    } catch (err) {
      setError(`Failed to start batch: ${err}`)
    }
  }, [])

  // Calculate derived metrics
  const getOutcomeBreakdown = useCallback(() => {
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

  const getEventTypeStats = useCallback(() => {
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

  return (
    <div className="space-y-6 p-6 bg-black">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-light text-white mb-2">
          Monte Carlo Results Viewer
        </h1>
        <p className="text-white/40 text-sm">
          Real-time visualization of simulation batch results
        </p>
      </div>

      {/* Live Progress (always visible if batch active) */}
      {batchProgress && (
        <LiveProgressPanel
          progress={batchProgress}
          onCancel={() => {
            // TODO: Implement batch cancellation
            console.log('Cancel batch')
          }}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-black border border-white/20 p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Timeline Analysis
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Event Stream
          </TabsTrigger>
          <TabsTrigger
            value="sweeps"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Parameter Sweeps
          </TabsTrigger>
          <TabsTrigger
            value="inspector"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Run Inspector
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {aggregateStats ? (
            <>
              <OutcomeDistributionPanel
                stats={aggregateStats}
                outcomeBreakdown={getOutcomeBreakdown()}
              />
              <EventTypeBreakdownPanel
                eventStats={getEventTypeStats()}
                totalRuns={runResults.size}
              />
            </>
          ) : (
            <Panel title="No Results Available" glow="amber">
              <p className="text-white/60">
                Start a Monte Carlo batch to see results, or load existing results from disk.
              </p>
            </Panel>
          )}
        </TabsContent>

        {/* Timeline Analysis Tab */}
        <TabsContent value="timeline">
          {aggregateStats ? (
            <TimelineAnalysisPanel
              stats={aggregateStats}
              runResults={Array.from(runResults.values())}
            />
          ) : (
            <Panel title="No Timeline Data" glow="amber">
              <p className="text-white/60">
                Timeline analysis requires completed simulation runs.
              </p>
            </Panel>
          )}
        </TabsContent>

        {/* Event Stream Tab */}
        <TabsContent value="events">
          <CriticalEventsStream
            events={criticalEvents}
            isLive={batchProgress?.runningRuns > 0}
          />
        </TabsContent>

        {/* Parameter Sweeps Tab */}
        <TabsContent value="sweeps">
          {batchProgress?.sweepGroups ? (
            <ParameterSweepComparison
              sweepGroups={batchProgress.sweepGroups}
              runResults={runResults}
            />
          ) : (
            <Panel title="No Parameter Sweep Data" glow="amber">
              <p className="text-white/60">
                This tab shows results from parameter sweep batches.
                Create a parameter sweep to see comparative analysis.
              </p>
            </Panel>
          )}
        </TabsContent>

        {/* Run Inspector Tab */}
        <TabsContent value="inspector">
          <RunInspector
            runResults={runResults}
            selectedRunId={selectedRunId}
            onSelectRun={setSelectedRunId}
          />
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {error && (
        <Panel title="Error" glow="red">
          <p className="text-red-400">{error}</p>
        </Panel>
      )}

      {/* Quick Actions */}
      {!activeBatchId && (
        <Panel title="Start New Batch" glow="cyan">
          <div className="flex gap-4">
            <button
              onClick={() => startNewBatch({
                startSeed: 42000,
                numRuns: 10,
                scenario: 'historical',
                maxMonths: 120
              })}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/60 rounded
                         text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300
                         shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              Quick Test (10 runs)
            </button>
            <button
              onClick={() => startNewBatch({
                startSeed: 42000,
                numRuns: 100,
                scenario: 'historical',
                maxMonths: 120
              })}
              className="px-4 py-2 bg-green-500/20 border border-green-400/60 rounded
                         text-green-400 hover:bg-green-500/30 transition-all duration-300
                         shadow-[0_0_15px_rgba(0,255,136,0.3)]"
            >
              Deep Analysis (100 runs)
            </button>
            <button
              onClick={() => startNewBatch({
                startSeed: 42000,
                numRuns: 50,
                scenario: 'unprecedented',
                maxMonths: 360
              })}
              className="px-4 py-2 bg-purple-500/20 border border-purple-400/60 rounded
                         text-purple-400 hover:bg-purple-500/30 transition-all duration-300
                         shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              Extended Timeline (50 runs × 30 years)
            </button>
          </div>
        </Panel>
      )}
    </div>
  )
}