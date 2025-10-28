/**
 * Sweep Results Panel
 *
 * Displays comprehensive results from completed Monte Carlo parameter sweeps.
 * Shows outcome distributions, timeline statistics, and parameter sensitivity.
 */

'use client'

import { useMonteCarlo } from '@/lib/contexts/MonteCarloContext'
import { Panel } from '@/components/core/Panel'
import { Download, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import type { MonteCarloAggregateStats } from '@/lib/MonteCarloManager'

export function SweepResultsPanel() {
  const { aggregateStats, currentBatchId, isRunning } = useMonteCarlo()

  if (!aggregateStats || isRunning) {
    return null
  }

  return (
    <Panel
      title="Sweep Results"
      glow="green"
      className="shadow-[0_0_30px_rgba(0,255,136,0.2)]"
    >
      <div className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Runs"
            value={aggregateStats.totalRuns}
            icon={<CheckCircle className="h-4 w-4" />}
            color="cyan"
          />
          <StatCard
            label="Avg Months"
            value={aggregateStats.averageMonthsSurvived
              ? Math.round(aggregateStats.averageMonthsSurvived)
              : aggregateStats.timeline?.avgMonthsToOutcome
                ? Math.round(aggregateStats.timeline.avgMonthsToOutcome)
                : 0
            }
            icon={<TrendingUp className="h-4 w-4" />}
            color="blue"
          />
          <StatCard
            label="Survival Rate"
            value={aggregateStats.survivalRate !== undefined && !isNaN(aggregateStats.survivalRate)
              ? `${(aggregateStats.survivalRate * 100).toFixed(1)}%`
              : 'N/A'
            }
            icon={<AlertCircle className="h-4 w-4" />}
            color={aggregateStats.survivalRate > 0.5 ? "green" : "amber"}
          />
          <StatCard
            label="Utopia Rate"
            value={`${(((aggregateStats.outcomeBreakdown?.utopia || 0) / aggregateStats.totalRuns) * 100).toFixed(1)}%`}
            icon={<CheckCircle className="h-4 w-4" />}
            color="emerald"
          />
        </div>

        {/* Outcome Distribution */}
        {aggregateStats.outcomeBreakdown && (
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3">Outcome Distribution</h3>
            <OutcomeDistributionChart breakdown={aggregateStats.outcomeBreakdown} totalRuns={aggregateStats.totalRuns} />
          </div>
        )}

        {/* Timeline Statistics */}
        {aggregateStats.timeline && aggregateStats.timeline.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3">Timeline Analysis</h3>
            <TimelineChart timeline={aggregateStats.timeline} />
          </div>
        )}

        {/* Parameter Sensitivity (if sweep) */}
        {currentBatchId?.startsWith('sweep-') && aggregateStats.parameterAnalysis && (
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3">Parameter Sensitivity</h3>
            <ParameterSensitivity analysis={aggregateStats.parameterAnalysis} />
          </div>
        )}

        {/* Export Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={() => exportResults(aggregateStats, currentBatchId)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30
                     border border-cyan-500/50 rounded text-cyan-400 transition-all
                     shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            <Download className="h-4 w-4" />
            Export Results
          </button>
        </div>
      </div>
    </Panel>
  )
}

// ============================================================================
// COMPONENTS
// ============================================================================

function StatCard({
  label,
  value,
  icon,
  color
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: 'cyan' | 'blue' | 'green' | 'amber' | 'emerald'
}) {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    green: 'text-green-400 bg-green-500/10 border-green-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  }

  return (
    <div className={`p-3 rounded border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-white/60">{label}</span>
      </div>
      <div className="text-2xl font-light">{value}</div>
    </div>
  )
}

function OutcomeDistributionChart({
  breakdown,
  totalRuns
}: {
  breakdown: MonteCarloAggregateStats['outcomeBreakdown']
  totalRuns: number
}) {
  const outcomes = [
    { key: 'utopia', label: 'Utopia', color: 'bg-emerald-500', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
    { key: 'postScarcity', label: 'Post-Scarcity', color: 'bg-green-500', glow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]' },
    { key: 'sustainable', label: 'Sustainable', color: 'bg-cyan-500', glow: 'shadow-[0_0_10px_rgba(6,182,212,0.5)]' },
    { key: 'struggling', label: 'Struggling', color: 'bg-blue-500', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]' },
    { key: 'collapse', label: 'Collapse', color: 'bg-amber-500', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
    { key: 'extinction', label: 'Extinction', color: 'bg-red-500', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' },
    { key: 'unknown', label: 'Unknown', color: 'bg-gray-500', glow: '' }
  ]

  return (
    <div className="space-y-2">
      {outcomes.map(outcome => {
        const count = breakdown[outcome.key as keyof typeof breakdown] || 0
        const percentage = totalRuns > 0 ? (count / totalRuns) * 100 : 0

        if (count === 0) return null

        return (
          <div key={outcome.key} className="flex items-center gap-3">
            <div className="w-24 text-xs text-white/60">{outcome.label}</div>
            <div className="flex-1 relative h-6 bg-black/40 rounded overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${outcome.color} ${outcome.glow} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
              <div className="absolute inset-0 flex items-center px-2">
                <span className="text-xs text-white/80">{count} ({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TimelineChart({ timeline }: { timeline: MonteCarloAggregateStats['timeline'] }) {
  // For simplicity, show first 10 months
  const months = timeline.slice(0, 10)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-10 gap-1 text-xs text-white/40">
        {months.map((_, i) => (
          <div key={i} className="text-center">M{i + 1}</div>
        ))}
      </div>
      <div className="grid grid-cols-10 gap-1">
        {months.map((month, i) => {
          const survivalPercent = month.totalRuns > 0
            ? (month.survivingRuns / month.totalRuns) * 100
            : 0

          const heightPercent = Math.max(10, survivalPercent)
          const color = survivalPercent > 75 ? 'bg-green-500' :
                        survivalPercent > 50 ? 'bg-cyan-500' :
                        survivalPercent > 25 ? 'bg-amber-500' : 'bg-red-500'

          return (
            <div key={i} className="flex flex-col justify-end h-20">
              <div
                className={`${color} rounded-t transition-all duration-500`}
                style={{ height: `${heightPercent}%` }}
                title={`Month ${i + 1}: ${survivalPercent.toFixed(1)}% survival`}
              />
            </div>
          )
        })}
      </div>
      <div className="text-xs text-white/40 text-center">Survival Rate Over Time</div>
    </div>
  )
}

function ParameterSensitivity({ analysis }: { analysis: any }) {
  // Simplified parameter sensitivity display
  // In a full implementation, this would show detailed sensitivity analysis
  return (
    <div className="p-4 bg-black/20 border border-white/10 rounded">
      <p className="text-sm text-white/60">
        Parameter sensitivity analysis will be displayed here once parameter sweep data structure is finalized.
      </p>
    </div>
  )
}

// ============================================================================
// UTILITIES
// ============================================================================

function exportResults(stats: MonteCarloAggregateStats, batchId: string | null) {
  const exportData = {
    batchId,
    timestamp: new Date().toISOString(),
    stats
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `monte-carlo-results-${batchId || 'unknown'}-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}