/**
 * Monte Carlo Results Analysis Dashboard
 *
 * Comprehensive visualization of Monte Carlo simulation outcomes.
 * Includes outcome distributions, determinism validation, run comparison,
 * and statistical analysis.
 *
 * Design: Far-future aesthetic with black/white/glowing elements.
 */

'use client'

import { useState, useMemo } from 'react'
import { Panel } from '@/components/core/Panel'
import { MetricCard } from '@/components/core/MetricCard'
import type { AggregatedResults } from '@/app/api/monte-carlo-results/route'
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Activity,
  Clock,
  Shield,
  Zap
} from 'lucide-react'

interface MonteCarloResultsAnalysisDashboardProps {
  data: AggregatedResults | null
  loading: boolean
  error: string | null
  metadata: { filesProcessed?: number; directory?: string }
  onRefresh: () => void
}

// 7-tier outcome classification with colors
const OUTCOME_TIERS = [
  { key: 'utopia', label: 'Utopia', color: '#00FF88', glow: 'rgba(0, 255, 136, 0.6)', description: 'Post-scarcity abundance, flourishing' },
  { key: 'post-scarcity', label: 'Post-Scarcity', color: '#00CCFF', glow: 'rgba(0, 204, 255, 0.6)', description: 'Material abundance achieved' },
  { key: 'sustainable', label: 'Sustainable', color: '#00AAAA', glow: 'rgba(0, 170, 170, 0.6)', description: 'Stable equilibrium' },
  { key: 'bottleneck', label: 'Bottleneck', color: '#FFAA00', glow: 'rgba(255, 170, 0, 0.6)', description: 'Struggling but surviving' },
  { key: 'collapse', label: 'Collapse', color: '#FF6600', glow: 'rgba(255, 102, 0, 0.6)', description: 'Civilization breakdown' },
  { key: 'dystopia', label: 'Dystopia', color: '#FF0040', glow: 'rgba(255, 0, 64, 0.6)', description: 'Oppressive outcome' },
  { key: 'extinction', label: 'Extinction', color: '#AA00FF', glow: 'rgba(170, 0, 255, 0.6)', description: 'Human extinction' },
]

export function MonteCarloResultsAnalysisDashboard({
  data,
  loading,
  error,
  metadata,
  onRefresh
}: MonteCarloResultsAnalysisDashboardProps) {
  const [selectedRun, setSelectedRun] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'seed' | 'outcome' | 'duration'>('seed')
  const [filterOutcome, setFilterOutcome] = useState<string>('all')

  // Process outcome distribution data
  const outcomeData = useMemo(() => {
    if (!data?.outcomeDistribution) return []

    const total = Object.values(data.outcomeDistribution).reduce((a, b) => a + b, 0)

    return OUTCOME_TIERS.map(tier => {
      const count = data.outcomeDistribution[tier.key] || 0
      return {
        ...tier,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }
    }).filter(tier => tier.count > 0 || tier.percentage > 0)
  }, [data?.outcomeDistribution])

  // Sorted and filtered runs
  const processedRuns = useMemo(() => {
    if (!data?.runs) return []

    let runs = [...data.runs]

    // Filter
    if (filterOutcome !== 'all') {
      runs = runs.filter(r => r.outcome.toLowerCase() === filterOutcome)
    }

    // Sort
    switch (sortBy) {
      case 'seed':
        runs.sort((a, b) => a.seed - b.seed)
        break
      case 'outcome':
        runs.sort((a, b) => a.outcome.localeCompare(b.outcome))
        break
      case 'duration':
        runs.sort((a, b) => b.totalMonths - a.totalMonths)
        break
    }

    return runs
  }, [data?.runs, sortBy, filterOutcome])

  // Get outcome tier info
  const getOutcomeTier = (outcome: string) => {
    const key = outcome.toLowerCase().replace(/[_\s]/g, '-')
    return OUTCOME_TIERS.find(t => t.key === key) || {
      key: outcome,
      label: outcome,
      color: '#888888',
      glow: 'rgba(136, 136, 136, 0.6)',
      description: 'Unknown outcome'
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Monte Carlo Results Analysis</h1>
          <p className="text-sm text-white/60">Loading simulation results...</p>
        </div>
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-4">
            <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
            <span className="text-white/60">Loading Monte Carlo data from disk...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Monte Carlo Results Analysis</h1>
          <p className="text-sm text-white/60">Analyze simulation outcome distributions and validate determinism</p>
        </div>
        <Panel title="No Results Available" glow="amber">
          <div className="flex flex-col items-center py-12 space-y-6">
            <AlertTriangle className="h-16 w-16 text-amber-400" />
            <div className="text-center">
              <h3 className="text-xl font-light text-amber-400 mb-2">{error}</h3>
              <p className="text-sm text-white/60 max-w-lg">
                Run Monte Carlo simulations to generate results for analysis.
              </p>
            </div>
            <div className="bg-black/50 border border-white/20 rounded p-4 max-w-2xl w-full">
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Run Monte Carlo Simulation</p>
              <pre className="text-sm text-cyan-400 overflow-x-auto">
{`# Quick test (N=10 runs, 120 months)
npx tsx scripts/monteCarloSimulation.ts > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Extended analysis (N=100 runs)
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=240`}
              </pre>
            </div>
            <button
              onClick={onRefresh}
              className="px-6 py-2 bg-cyan-500/20 border border-cyan-400/60 rounded
                         text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300
                         shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Check Again
            </button>
          </div>
        </Panel>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="max-w-[1800px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light text-white mb-2">Monte Carlo Results Analysis</h1>
          <p className="text-sm text-white/60">
            {data.totalRuns} simulation runs analyzed from {Object.keys(data.scenarios).length} scenario type(s)
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-white/5 border border-white/20 rounded
                     text-white/60 hover:bg-white/10 hover:text-white
                     transition-all duration-300 flex items-center gap-2
                     disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          label="Total Runs"
          value={data.totalRuns}
          status="normal"
        />
        <MetricCard
          label="Avg Duration"
          value={`${data.statistics.avgDuration.toFixed(0)} mo`}
          status="normal"
        />
        <MetricCard
          label="Median Duration"
          value={`${data.statistics.medianDuration.toFixed(0)} mo`}
          status="normal"
        />
        <MetricCard
          label="Duration Range"
          value={`${data.statistics.minDuration}-${data.statistics.maxDuration}`}
          status="normal"
        />
        <MetricCard
          label="Avg Events"
          value={data.statistics.avgEvents.toFixed(0)}
          status="normal"
        />
        <MetricCard
          label="Avg Critical Events"
          value={data.statistics.avgCriticalEvents.toFixed(1)}
          status={data.statistics.avgCriticalEvents > 50 ? 'warning' : 'normal'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome Distribution */}
        <Panel title="Outcome Distribution" glow="cyan">
          <div className="space-y-4">
            {/* Distribution Bars */}
            <div className="space-y-3">
              {outcomeData.length > 0 ? (
                outcomeData.map(outcome => (
                  <div key={outcome.key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: outcome.color,
                            boxShadow: `0 0 8px ${outcome.glow}`
                          }}
                        />
                        <span style={{ color: outcome.color }}>{outcome.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white/80 font-light">
                          {outcome.percentage.toFixed(1)}%
                        </span>
                        <span className="text-white/40 text-xs ml-2">
                          ({outcome.count} runs)
                        </span>
                      </div>
                    </div>
                    <div className="h-6 bg-white/5 rounded overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 flex items-center px-2"
                        style={{
                          width: `${Math.max(outcome.percentage, 2)}%`,
                          backgroundColor: `${outcome.color}40`,
                          borderRight: `2px solid ${outcome.color}`,
                          boxShadow: `inset 0 0 20px ${outcome.glow}`
                        }}
                      >
                        {outcome.percentage >= 10 && (
                          <span className="text-xs font-medium" style={{ color: outcome.color }}>
                            {outcome.percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/40">
                  No outcome distribution data available
                </div>
              )}
            </div>

            {/* Positive vs Negative Summary */}
            {outcomeData.length > 0 && (
              <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                  <div className="text-xs text-white/40 mb-1 uppercase tracking-wider">
                    Positive Outcomes
                  </div>
                  <div className="text-2xl font-light text-green-400">
                    {outcomeData
                      .filter(o => ['utopia', 'post-scarcity', 'sustainable'].includes(o.key))
                      .reduce((sum, o) => sum + o.percentage, 0)
                      .toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                  <div className="text-xs text-white/40 mb-1 uppercase tracking-wider">
                    Negative Outcomes
                  </div>
                  <div className="text-2xl font-light text-red-400">
                    {outcomeData
                      .filter(o => ['collapse', 'dystopia', 'extinction'].includes(o.key))
                      .reduce((sum, o) => sum + o.percentage, 0)
                      .toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </Panel>

        {/* Determinism Validation */}
        <Panel
          title="Determinism Validation"
          glow={data.determinismCheck.overallDeterministic ? 'cyan' : 'red'}
        >
          <div className="space-y-4">
            {/* Overall Status */}
            <div className={`p-4 rounded border ${
              data.determinismCheck.overallDeterministic
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-3">
                {data.determinismCheck.overallDeterministic ? (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                    <div>
                      <div className="text-lg font-light text-green-400">
                        Determinism Validated
                      </div>
                      <div className="text-sm text-white/60">
                        Same seeds produce consistent outcomes (CV {'<'} 0.01%)
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-400" />
                    <div>
                      <div className="text-lg font-light text-red-400">
                        Determinism Failures Detected
                      </div>
                      <div className="text-sm text-white/60">
                        {data.determinismCheck.determinismFailures.length} seed(s) show inconsistent results
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Seed Groups */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                Seed Analysis ({Object.keys(data.determinismCheck.seedGroups).length} unique seeds)
              </div>
              {Object.entries(data.determinismCheck.seedGroups).map(([seed, group]) => (
                <div
                  key={seed}
                  className={`p-3 bg-black border rounded transition-all duration-300 ${
                    group.isDeterministic
                      ? 'border-white/10 hover:border-white/20'
                      : 'border-red-500/30 hover:border-red-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-white/80">
                        Seed {seed}
                      </span>
                      {group.count > 1 && (
                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/60">
                          {group.count}x
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {group.outcomes.map((outcome, i) => {
                        const tier = getOutcomeTier(outcome)
                        return (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: `${tier.color}20`,
                              color: tier.color,
                              border: `1px solid ${tier.color}40`
                            }}
                          >
                            {outcome}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  {group.coefficientOfVariation !== undefined && group.coefficientOfVariation > 0 && (
                    <div className="mt-2 text-xs text-white/40">
                      CV: {group.coefficientOfVariation.toFixed(4)}%
                      {group.coefficientOfVariation > 0.01 && (
                        <span className="text-red-400 ml-2">
                          (exceeds 0.01% threshold)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Failures List */}
            {data.determinismCheck.determinismFailures.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <div className="text-xs text-red-400 uppercase tracking-wider mb-2">
                  Failure Details
                </div>
                <div className="space-y-1">
                  {data.determinismCheck.determinismFailures.map((failure, i) => (
                    <div key={i} className="text-sm text-red-300/80">
                      {failure}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Run List */}
      <Panel title="Simulation Runs" glow="cyan">
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/40 uppercase tracking-wider">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-black border border-white/20 rounded px-3 py-1.5 text-sm text-white"
              >
                <option value="seed">Seed</option>
                <option value="outcome">Outcome</option>
                <option value="duration">Duration</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/40 uppercase tracking-wider">
                Filter
              </label>
              <select
                value={filterOutcome}
                onChange={(e) => setFilterOutcome(e.target.value)}
                className="bg-black border border-white/20 rounded px-3 py-1.5 text-sm text-white"
              >
                <option value="all">All Outcomes</option>
                {OUTCOME_TIERS.map(tier => (
                  <option key={tier.key} value={tier.key}>{tier.label}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-white/40">
              Showing {processedRuns.length} of {data.totalRuns} runs
            </div>
          </div>

          {/* Run Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto">
            {processedRuns.map(run => {
              const tier = getOutcomeTier(run.outcome)
              const isSelected = selectedRun === String(run.seed)

              return (
                <button
                  key={`${run.seed}-${run.scenario}`}
                  onClick={() => setSelectedRun(isSelected ? null : String(run.seed))}
                  className={`p-4 bg-black border rounded text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-sm text-white/80">
                      Seed {run.seed}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${tier.color}20`,
                        color: tier.color,
                        border: `1px solid ${tier.color}40`
                      }}
                    >
                      {run.outcome}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-white/40">Duration:</span>
                      <span className="text-white/80 ml-1">{run.totalMonths} mo</span>
                    </div>
                    <div>
                      <span className="text-white/40">Events:</span>
                      <span className="text-white/80 ml-1">{run.totalEvents}</span>
                    </div>
                    <div>
                      <span className="text-white/40">Critical:</span>
                      <span className="text-white/80 ml-1">{run.criticalEventCount}</span>
                    </div>
                    <div>
                      <span className="text-white/40">Scenario:</span>
                      <span className="text-cyan-400 ml-1">{run.scenario.slice(0, 6)}</span>
                    </div>
                    {run.finalPopulation !== undefined && (
                      <div className="col-span-2">
                        <span className="text-white/40">Final Pop:</span>
                        <span className="text-white/80 ml-1">
                          {run.finalPopulation.toFixed(2)}B
                        </span>
                      </div>
                    )}
                    {run.bifurcationsOccurred !== undefined && (
                      <div className="col-span-2">
                        <span className="text-white/40">Bifurcations:</span>
                        <span className="text-amber-400 ml-1">
                          {run.bifurcationsOccurred}
                        </span>
                        {run.regimeShifts !== undefined && (
                          <>
                            <span className="text-white/40 ml-2">Shifts:</span>
                            <span className="text-red-400 ml-1">{run.regimeShifts}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </Panel>

      {/* Event Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Event Type Distribution">
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {Object.entries(data.eventTypeAggregates)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const maxCount = Math.max(...Object.values(data.eventTypeAggregates))
                const percentage = (count / maxCount) * 100

                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-sm text-white/60 w-32 truncate">{type}</span>
                    <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                      <div
                        className="h-full bg-cyan-500/30 border-r border-cyan-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-white/80 w-16 text-right font-mono">
                      {count.toLocaleString()}
                    </span>
                  </div>
                )
              })}
          </div>
        </Panel>

        <Panel title="Top Critical Events">
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {data.criticalEventSummary.map((event, i) => (
              <div
                key={i}
                className="p-3 bg-black/50 border border-white/10 rounded hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm text-white/80 flex-1">{event.title}</span>
                  <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded ml-2">
                    {event.count}x
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-white/40">
                  <span>Avg Month: {event.avgMonth.toFixed(0)}</span>
                  <span>Seeds: {event.seeds.length}</span>
                </div>
              </div>
            ))}
            {data.criticalEventSummary.length === 0 && (
              <div className="text-center py-8 text-white/40">
                No critical events recorded
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Scenario Breakdown */}
      {Object.keys(data.scenarios).length > 1 && (
        <Panel title="Scenario Distribution">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.scenarios).map(([scenario, count]) => (
              <div
                key={scenario}
                className="p-4 bg-black/50 border border-white/20 rounded text-center"
              >
                <div className="text-2xl font-light text-cyan-400 mb-1">{count}</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">{scenario}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Statistical Summary */}
      <Panel title="Statistical Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Duration Statistics</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Mean:</span>
                <span className="text-white/80">{data.statistics.avgDuration.toFixed(1)} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Median:</span>
                <span className="text-white/80">{data.statistics.medianDuration.toFixed(1)} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Std Dev:</span>
                <span className="text-white/80">{data.statistics.stdDevDuration.toFixed(1)} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Range:</span>
                <span className="text-white/80">{data.statistics.minDuration} - {data.statistics.maxDuration} months</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/80">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Event Statistics</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Avg Events/Run:</span>
                <span className="text-white/80">{data.statistics.avgEvents.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Avg Critical Events:</span>
                <span className="text-white/80">{data.statistics.avgCriticalEvents.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Total Event Types:</span>
                <span className="text-white/80">{Object.keys(data.eventTypeAggregates).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Total Events:</span>
                <span className="text-white/80">
                  {Object.values(data.eventTypeAggregates).reduce((a, b) => a + b, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Confidence Metrics</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Sample Size (N):</span>
                <span className="text-white/80">{data.totalRuns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Unique Seeds:</span>
                <span className="text-white/80">{Object.keys(data.determinismCheck.seedGroups).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Deterministic:</span>
                <span className={data.determinismCheck.overallDeterministic ? 'text-green-400' : 'text-red-400'}>
                  {data.determinismCheck.overallDeterministic ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Margin of Error (95% CI):</span>
                <span className="text-white/80">
                  {data.totalRuns > 0 ? `${(1.96 * Math.sqrt(0.5 * 0.5 / data.totalRuns) * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Metadata Footer */}
      <div className="text-xs text-white/30 flex items-center justify-between">
        <div>
          Source: {metadata.directory}
        </div>
        <div>
          Files processed: {metadata.filesProcessed}
        </div>
      </div>
    </div>
  )
}
