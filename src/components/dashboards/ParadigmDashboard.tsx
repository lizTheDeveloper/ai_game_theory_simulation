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
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect } from "react"

export function ParadigmDashboard() {
  const { currentState, trajectory, loadCurrent } = useSimulation()

  useEffect(() => {
    loadCurrent()
  }, [])

  if (!currentState) {
    return <div className="p-8">Loading...</div>
  }

  const paradigms = currentState.multiParadigmDUI || {
    westernLiberal: { score: 50, components: {} },
    development: { score: 50, components: {} },
    ecological: { score: 50, components: {} },
    indigenous: { score: 50, components: {} }
  }

  // Calculate divergence
  const scores = [
    (paradigms.westernLiberal as any).score,
    (paradigms.development as any).score,
    (paradigms.ecological as any).score,
    (paradigms.indigenous as any).score
  ]
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const divergence = Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length)

  // Detect contested outcome (simultaneous utopia + dystopia)
  const utopiaCount = scores.filter(s => s >= 80).length
  const dystopiaCount = scores.filter(s => s < 30).length
  const isContested = utopiaCount > 0 && dystopiaCount > 0

  // Get sparklines from trajectory
  const getSparkline = (paradigm: string) => {
    if (trajectory.length < 2) return []
    return trajectory.slice(-12).map(state => {
      const p = (state.multiParadigmDUI as any)?.[paradigm]
      return p?.score || 50
    })
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
          glow={(paradigms.westernLiberal as any).score < 30 ? 'red' : 'none'}
        >
          <div className="mb-4">
            <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-western-liberal)' }}>
              {((paradigms.westernLiberal as any).score || 0).toFixed(1)}
            </div>
            {trajectory.length > 1 && (
              <Sparkline data={getSparkline('westernLiberal')} color="var(--color-western-liberal)" />
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--white-40)' }}>Democracy</span>
              <span>{((paradigms.westernLiberal as any).components?.electoralDemocracy || 0).toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--white-40)' }}>Civil Liberties</span>
              <span>{((paradigms.westernLiberal as any).components?.civilLiberties || 0).toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--white-40)' }}>Rule of Law</span>
              <span>{((paradigms.westernLiberal as any).components?.ruleOfLaw || 0).toFixed(1)}</span>
            </div>
          </div>
        </Panel>

        {/* Development */}
        <Panel
          title="Development"
          glow={(paradigms.development as any).score >= 80 ? 'cyan' : 'none'}
        >
          <div className="mb-4">
            <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-development)' }}>
              {((paradigms.development as any).score || 0).toFixed(1)}
            </div>
            {trajectory.length > 1 && (
              <Sparkline data={getSparkline('development')} color="var(--color-development)" />
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--white-40)' }}>Quality of Life</span>
              <span>{(currentState.globalMetrics?.qualityOfLife || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--white-40)' }}>Survival Tier</span>
              <span>{(currentState.globalMetrics?.survival?.tier || 0).toFixed(1)}</span>
            </div>
          </div>
        </Panel>

        {/* Ecological */}
        <Panel
          title="Ecological"
          glow={(paradigms.ecological as any).score < 20 ? 'red' : 'none'}
        >
          <div className="mb-4">
            <div className="text-4xl font-light mb-2" style={{
              color: (paradigms.ecological as any).score < 20 ? 'var(--color-red)' : 'var(--color-ecological)'
            }}>
              {((paradigms.ecological as any).score || 0).toFixed(1)}
            </div>
            {trajectory.length > 1 && (
              <Sparkline data={getSparkline('ecological')} color="var(--color-ecological)" />
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--white-40)' }}>Climate</span>
              <span>{((currentState.planetaryBoundaries?.climateChange?.current || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--white-40)' }}>Biodiversity</span>
              <span>{((currentState.planetaryBoundaries?.biosphereIntegrity?.current || 0) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </Panel>

        {/* Indigenous */}
        <Panel title="Indigenous">
          <div className="mb-4">
            <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-indigenous)' }}>
              {((paradigms.indigenous as any).score || 0).toFixed(1)}
            </div>
            {trajectory.length > 1 && (
              <Sparkline data={getSparkline('indigenous')} color="var(--color-indigenous)" />
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--white-40)' }}>Social Trust</span>
              <span>{(currentState.socialCohesion?.trust || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--white-40)' }}>Meaning</span>
              <span>{(currentState.meaningRenaissance?.meaning || 0).toFixed(2)}</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Pattern Detection */}
      <Panel title="Historical Patterns">
        <div className="space-y-3">
          {/* Singapore Pattern */}
          {(paradigms.development as any).score >= 80 && (paradigms.westernLiberal as any).score < 50 && (
            <div className="p-3" style={{ backgroundColor: 'var(--color-near-black)', borderLeft: '3px solid var(--color-development)' }}>
              <div className="font-semibold mb-1">Singapore Pattern Detected</div>
              <div className="text-sm" style={{ color: 'var(--white-60)' }}>
                Development utopia + Western hybrid (high GDP, limited democracy)
              </div>
            </div>
          )}

          {/* Norway Pattern */}
          {(paradigms.development as any).score >= 80 && (paradigms.westernLiberal as any).score >= 70 && (paradigms.ecological as any).score < 30 && (
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
