/**
 * Multi-Paradigm DUI Dashboard - Phase 2
 *
 * Visualizes 4 simultaneous paradigm perspectives.
 * Reference: /designs/02_paradigm_view.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { Sparkline } from "@/components/charts/Sparkline"
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"

export function ParadigmDashboard() {
  const { lastUpdate, initialized } = useSimulationWorker()

  if (!initialized) {
    return (
      <div className="p-8">
        <Panel title="Not Initialized">
          Click "Configure & Start" to initialize the simulation
        </Panel>
      </div>
    )
  }

  if (!lastUpdate) {
    return <div className="p-8">Waiting for simulation update...</div>
  }

  // Get scores from StateDelta
  const scores = [
    lastUpdate.westernLiberalIndex ?? 50,
    lastUpdate.developmentIndex ?? 50,
    lastUpdate.ecologicalIndex ?? 50,
    lastUpdate.indigenousIndex ?? 50
  ]

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const divergence = Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length)

  // Detect contested outcome (simultaneous utopia + dystopia)
  const utopiaCount = scores.filter(s => s >= 80).length
  const dystopiaCount = scores.filter(s => s < 30).length
  const isContested = utopiaCount > 0 && dystopiaCount > 0

  // Note: Sparklines removed - trajectory not available in StateDelta
  // Would need to implement history tracking in Web Worker if needed
  const getSparkline = (_paradigm: 'western' | 'development' | 'ecological' | 'indigenous') => {
    return [] // Placeholder - trajectory tracking not yet implemented
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Multi-Paradigm DUI</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Four Simultaneous Perspectives on Human Flourishing
        </p>
      </div>

      {/* Divergence Alert */}
      {isContested && (
        <Panel title="⚠️ Contested Outcome Detected" glow="amber">
          <p>
            Simultaneous <span style={{ color: 'var(--color-green)' }}>utopia</span> and{' '}
            <span style={{ color: 'var(--color-red)' }}>dystopia</span> across paradigms.
            What counts as success depends fundamentally on values.
          </p>
        </Panel>
      )}

      {/* Paradigm Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Average Score"
          value={avgScore.toFixed(1)}
          trend={avgScore > 60 ? 'up' : 'down'}
        />
        <MetricCard
          label="Divergence"
          value={divergence.toFixed(1)}
          status={divergence > 30 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Paradigm Conflicts"
          value={isContested ? 'Yes' : 'No'}
          status={isContested ? 'critical' : 'normal'}
        />
      </div>

      {/* 4 Paradigm Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Western Liberal */}
        <Panel
          title="Western Liberal"
          glow={scores[0] < 30 ? 'red' : 'none'}
        >
          <div className="mb-4">
            <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-western-liberal)' }}>
              {scores[0].toFixed(1)}
            </div>
            <Sparkline data={getSparkline('western')} color="var(--color-western-liberal)" />
          </div>
          <div className="text-sm" style={{ color: 'var(--white-60)' }}>
            Democracy, civil liberties, rule of law, economic freedom
          </div>
        </Panel>

        {/* Development */}
        <Panel
          title="Development"
          glow={scores[1] >= 80 ? 'cyan' : 'none'}
        >
          <div className="mb-4">
            <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-development)' }}>
              {scores[1].toFixed(1)}
            </div>
            <Sparkline data={getSparkline('development')} color="var(--color-development)" />
          </div>
          <div className="text-sm" style={{ color: 'var(--white-60)' }}>
            Quality of life, survival fundamentals, material needs, health
          </div>
        </Panel>

        {/* Ecological */}
        <Panel
          title="Ecological"
          glow={scores[2] < 20 ? 'red' : 'none'}
        >
          <div className="mb-4">
            <div className="text-4xl font-light mb-2" style={{
              color: scores[2] < 20 ? 'var(--color-red)' : 'var(--color-ecological)'
            }}>
              {scores[2].toFixed(1)}
            </div>
            <Sparkline data={getSparkline('ecological')} color="var(--color-ecological)" />
          </div>
          <div className="text-sm" style={{ color: 'var(--white-60)' }}>
            Climate: {((1 - (lastUpdate.climateChange || 0)) * 100).toFixed(0)}%,
            Biodiversity: {((1 - (lastUpdate.biodiversityLoss || 0)) * 100).toFixed(0)}%
          </div>
        </Panel>

        {/* Indigenous */}
        <Panel title="Indigenous">
          <div className="mb-4">
            <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-indigenous)' }}>
              {scores[3].toFixed(1)}
            </div>
            <Sparkline data={getSparkline('indigenous')} color="var(--color-indigenous)" />
          </div>
          <div className="text-sm" style={{ color: 'var(--white-60)' }}>
            Social cohesion: {((lastUpdate.socialCohesion || 0) * 100).toFixed(0)}%,
            Meaning: {((lastUpdate.meaningLevel || 0) * 100).toFixed(0)}%
          </div>
        </Panel>
      </div>

      {/* Pattern Detection */}
      <Panel title="Historical Patterns">
        <div className="space-y-3">
          {/* Singapore Pattern */}
          {scores[1] >= 80 && scores[0] < 50 && (
            <div className="p-3" style={{ backgroundColor: 'var(--color-near-black)', borderLeft: '3px solid var(--color-development)' }}>
              <div className="font-semibold mb-1">Singapore Pattern Detected</div>
              <div className="text-sm" style={{ color: 'var(--white-60)' }}>
                Development utopia + Western hybrid (high GDP, limited democracy)
              </div>
            </div>
          )}

          {/* Norway Pattern */}
          {scores[1] >= 80 && scores[0] >= 70 && scores[2] < 30 && (
            <div className="p-3" style={{ backgroundColor: 'var(--color-near-black)', borderLeft: '3px solid var(--color-development)' }}>
              <div className="font-semibold mb-1">Norway Pattern Detected</div>
              <div className="text-sm" style={{ color: 'var(--white-60)' }}>
                Western/Development utopias + Ecological dystopia (high living standards, high emissions)
              </div>
            </div>
          )}

          {!isContested && (
            <div className="text-sm" style={{ color: 'var(--white-40)' }}>
              No distinctive historical patterns detected
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
