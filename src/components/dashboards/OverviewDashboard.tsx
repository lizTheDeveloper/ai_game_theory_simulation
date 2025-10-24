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
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"

export function OverviewDashboard() {
  const { lastUpdate, initialized } = useSimulationWorker()

  if (!initialized) {
    return (
      <div className="p-8">
        <Panel title="Not Initialized">
          <div className="flex items-center gap-3">
            <div className="status-indicator status-normal animate-pulse" />
            <span>Click "Configure & Start" to initialize the simulation</span>
          </div>
        </Panel>
      </div>
    )
  }

  if (!lastUpdate) {
    return (
      <div className="p-8">
        <Panel title="Loading">
          <div className="flex items-center gap-3">
            <div className="status-indicator status-normal animate-pulse" />
            <span>Waiting for simulation update...</span>
          </div>
        </Panel>
      </div>
    )
  }

  // Extract key metrics from StateDelta
  const population = lastUpdate.population || 8_000_000_000
  const qol = lastUpdate.qualityOfLife || 0
  const aiCap = lastUpdate.avgAICapability || 0
  const alignment = (lastUpdate.alignedAICount || 0) / Math.max(1, lastUpdate.aiCount || 1)

  // Multi-paradigm scores
  const paradigms = {
    western: { value: lastUpdate.westernLiberal ?? 50 },
    development: { value: lastUpdate.development ?? 50 },
    ecological: { value: lastUpdate.ecological ?? 50 },
    indigenous: { value: lastUpdate.indigenous ?? 50 }
  }

  // Determine overall status
  const getOverallStatus = () => {
    if (lastUpdate.extinctionRisk && lastUpdate.extinctionRisk > 0.9) return 'extinction'
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
            Month {lastUpdate.currentMonth || 0} / Seed N/A
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
          value={(qol * 100).toFixed(1)}
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
                {lastUpdate.aiCount || 0} active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Organizations</span>
              <span className="text-sm" style={{ color: 'var(--white-60)' }}>
                {lastUpdate.organizationCount || 0} operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Extinction Risk</span>
              <span className="text-sm" style={{ color: 'var(--white-60)' }}>
                {((lastUpdate.extinctionRisk || 0) * 100).toFixed(1)}%
              </span>
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
              {((1 - (lastUpdate.climateChange || 0)) * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
              Biodiversity Index
            </div>
            <div className="text-2xl font-light">
              {((1 - (lastUpdate.biodiversityLoss || 0)) * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
              Social Cohesion
            </div>
            <div className="text-2xl font-light">
              {((lastUpdate.socialCohesion || 0) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}
