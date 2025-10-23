/**
 * Overview Dashboard - Phase 1
 *
 * Mission control screen showing simulation state at a glance.
 * Reference: /designs/01_overview_screen.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { StatusIndicator } from "@/components/core/StatusIndicator"
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect } from "react"

export function OverviewDashboard() {
  const { currentState, loadCurrent, error } = useSimulation()

  useEffect(() => {
    loadCurrent()
  }, [])

  if (error) {
    return (
      <div className="p-8">
        <Panel title="Error" glow="red">
          <p>{error}</p>
          <p className="mt-4 text-sm" style={{ color: 'var(--white-40)' }}>
            Make sure simulation outputs exist in monteCarloOutputs/
          </p>
        </Panel>
      </div>
    )
  }

  if (!currentState) {
    return (
      <div className="p-8">
        <Panel title="Loading">
          <div className="flex items-center gap-3">
            <div className="status-indicator status-normal animate-pulse" />
            <span>Loading simulation state...</span>
          </div>
        </Panel>
      </div>
    )
  }

  // Extract key metrics
  const population = currentState.globalMetrics?.population || 8_000_000_000
  const qol = currentState.globalMetrics?.qualityOfLife || 0
  const aiCap = currentState.aiAgents?.[0]?.capability || 0
  const alignment = currentState.aiAgents?.[0]?.trueAlignment || 0

  // Multi-paradigm scores
  const paradigms = {
    western: { score: currentState.multiParadigmDUI?.paradigmScores?.western?.value ?? 50 },
    development: { score: currentState.multiParadigmDUI?.paradigmScores?.development?.value ?? 50 },
    ecological: { score: currentState.multiParadigmDUI?.paradigmScores?.ecological?.value ?? 50 },
    indigenous: { score: currentState.multiParadigmDUI?.diagnosticLenses?.indigenous?.value ?? 50 }
  }

  // Determine overall status
  const getOverallStatus = () => {
    if (currentState.extinctionState?.active) return 'extinction'
    if (paradigms.ecological.value < 20) return 'critical'
    if (paradigms.western.value < 30) return 'warning'
    return 'normal'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Simulation Overview</h1>
        <div className="flex items-center gap-4">
          <StatusIndicator status={getOverallStatus()} label="System Status" />
          <span style={{ color: 'var(--white-40)' }}>
            Month {currentState.currentMonth} / Seed {currentState.seed || 'N/A'}
          </span>
        </div>
      </div>

      {/* Critical Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Global Population"
          value={(population / 1_000_000_000).toFixed(2)}
          unit="B"
          status={population < 2_000_000_000 ? 'critical' : 'normal'}
          trend={population < 7_000_000_000 ? 'down' : 'stable'}
        />
        <MetricCard
          label="Quality of Life"
          value={qol.toFixed(2)}
          status={qol < 0.4 ? 'critical' : qol < 0.6 ? 'warning' : 'normal'}
          trend={qol < 0.5 ? 'down' : 'stable'}
        />
        <MetricCard
          label="AI Capability"
          value={aiCap.toFixed(2)}
          status={aiCap > 4.5 ? 'critical' : aiCap > 4.0 ? 'warning' : 'normal'}
          trend={aiCap > 4.0 ? 'up' : 'stable'}
        />
        <MetricCard
          label="Alignment Score"
          value={alignment.toFixed(2)}
          status={alignment < 0.3 ? 'critical' : alignment < 0.5 ? 'warning' : 'normal'}
          trend={alignment < 0.5 ? 'down' : 'stable'}
        />
      </div>

      {/* Panels Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Paradigm Status */}
        <Panel
          title="Multi-Paradigm DUI"
          glow={(paradigms.ecological as any).value < 20 ? 'red' : 'cyan'}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--color-western-liberal)' }}>
                Western Liberal
              </div>
              <div className="text-3xl font-light">
                {(paradigms.western.value || 0).toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--color-development)' }}>
                Development
              </div>
              <div className="text-3xl font-light">
                {(paradigms.development.value || 0).toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--color-ecological)' }}>
                Ecological
              </div>
              <div className={`text-3xl font-light ${paradigms.ecological.value < 20 ? 'text-red-500' : ''}`}>
                {(paradigms.ecological.value || 0).toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--color-indigenous)' }}>
                Indigenous
              </div>
              <div className="text-3xl font-light">
                {(paradigms.indigenous.value || 0).toFixed(1)}
              </div>
            </div>
          </div>
        </Panel>

        {/* Active Crises */}
        <Panel title="System Health" glow={getOverallStatus() === 'critical' ? 'amber' : 'none'}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>AI Agents</span>
              <span className="text-sm" style={{ color: 'var(--white-60)' }}>
                {currentState.aiAgents?.length || 0} active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Organizations</span>
              <span className="text-sm" style={{ color: 'var(--white-60)' }}>
                {currentState.organizations?.filter(o => o.capitalPerMonth > 0).length || 0} operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Extinction Risk</span>
              <StatusIndicator
                status={currentState.extinctionState?.active ? 'extinction' : 'normal'}
              />
            </div>
          </div>
        </Panel>
      </div>

      {/* Full-width Status Panel */}
      <Panel title="Environmental Systems">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
              Climate Stability
            </div>
            <div className="text-2xl font-light">
              {((currentState.environmentalAccumulation?.climateStability || 0) * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
              Biodiversity Index
            </div>
            <div className="text-2xl font-light">
              {((currentState.environmentalAccumulation?.biodiversityIndex || 0) * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
              Social Cohesion
            </div>
            <div className="text-2xl font-light">
              {((currentState.socialAccumulation?.socialCohesion || 0) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}
