/**
 * Overview Dashboard - Phase 1
 *
 * Mission control screen showing simulation state at a glance.
 * Reference: /designs/01_overview_screen.md
 */

'use client'

import { useState, useEffect } from 'react'
import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { StatusIndicator } from "@/components/core/StatusIndicator"
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"
import { ParadigmDetailPanel } from "@/components/paradigms/ParadigmDetailPanel"
import { HelpButton } from "@/components/docs/HelpButton"
import { validateMetrics, DASHBOARD_EXPECTATIONS } from "@/lib/utils/metricValidation"
import { GovernmentActionsPanel } from "@/components/actions/GovernmentActionsPanel"

type ParadigmType = 'western' | 'development' | 'ecological' | 'indigenous' | null

export function OverviewDashboard() {
  const { lastUpdate, initialized } = useSimulationWorker()
  const [selectedParadigm, setSelectedParadigm] = useState<ParadigmType>(null)

  // Validate metrics whenever lastUpdate changes (BEFORE hasValidData check!)
  useEffect(() => {
    if (initialized && lastUpdate) {
      validateMetrics(lastUpdate, DASHBOARD_EXPECTATIONS.overview, 'OverviewDashboard')
    }
  }, [lastUpdate, initialized])

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

  // Check for valid simulation data (validation already ran above in useEffect)
  const hasValidData = lastUpdate &&
    typeof lastUpdate.population === 'number' && !isNaN(lastUpdate.population) &&
    typeof lastUpdate.qualityOfLife === 'number' && !isNaN(lastUpdate.qualityOfLife) &&
    typeof lastUpdate.avgAICapability === 'number' && !isNaN(lastUpdate.avgAICapability) &&
    typeof lastUpdate.westernLiberalIndex === 'number' && !isNaN(lastUpdate.westernLiberalIndex) &&
    typeof lastUpdate.developmentIndex === 'number' && !isNaN(lastUpdate.developmentIndex) &&
    typeof lastUpdate.ecologicalIndex === 'number' && !isNaN(lastUpdate.ecologicalIndex) &&
    typeof lastUpdate.indigenousIndex === 'number' && !isNaN(lastUpdate.indigenousIndex)

  if (!lastUpdate || !hasValidData) {
    return (
      <div className="p-8">
        <Panel title="Waiting for Data">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="status-indicator status-normal animate-pulse" />
              <span>Waiting for complete simulation state...</span>
            </div>
            {lastUpdate && !hasValidData && (
              <div className="text-sm p-3 rounded border" style={{
                backgroundColor: 'rgba(255, 176, 0, 0.1)',
                borderColor: 'var(--color-amber)',
                color: 'var(--color-amber)'
              }}>
                ⚠️ Received incomplete or invalid data from simulation.
                Check simulation logs for NaN or undefined values.
              </div>
            )}
          </div>
        </Panel>
      </div>
    )
  }

  // Extract key metrics from StateDelta - NO FALLBACKS
  // Non-null assertions are safe here because we validated these exist in hasValidData check above
  // NOTE: Worker sends population in billions (8 = 8 billion people), not individual count
  const population = lastUpdate.population!
  const qol = lastUpdate.qualityOfLife!
  const aiCap = lastUpdate.avgAICapability!

  // Calculate alignment ratio safely
  const alignedCount = lastUpdate.alignedAICount || 0
  const totalAICount = lastUpdate.aiCount || 0
  const alignment = totalAICount > 0 ? alignedCount / totalAICount : 0

  // Multi-paradigm scores - validated above, non-null assertions safe
  const paradigms = {
    western: { value: lastUpdate.westernLiberalIndex! },
    development: { value: lastUpdate.developmentIndex! },
    ecological: { value: lastUpdate.ecologicalIndex! },
    indigenous: { value: lastUpdate.indigenousIndex! }
  }

  // Determine overall status
  const getOverallStatus = () => {
    if (lastUpdate.extinctionProbability && lastUpdate.extinctionProbability > 0.9) return 'extinction'
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
          value={population.toFixed(2)}
          unit="B"
          status={population < 2.0 ? 'critical' : 'normal'}
          trend={population < 7.0 ? 'down' : 'stable'}
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
            <button
              onClick={() => setSelectedParadigm('western')}
              className="text-left p-3 rounded transition-opacity hover:opacity-80 hover:bg-white/5 cursor-pointer"
            >
              <div className="text-xs mb-2" style={{ color: 'var(--color-western-liberal)' }}>
                Western Liberal →
              </div>
              <div className="text-3xl font-light">
                {paradigms.western.value.toFixed(1)}
              </div>
            </button>
            <button
              onClick={() => setSelectedParadigm('development')}
              className="text-left p-3 rounded transition-opacity hover:opacity-80 hover:bg-white/5 cursor-pointer"
            >
              <div className="text-xs mb-2" style={{ color: 'var(--color-development)' }}>
                Development →
              </div>
              <div className="text-3xl font-light">
                {paradigms.development.value.toFixed(1)}
              </div>
            </button>
            <button
              onClick={() => setSelectedParadigm('ecological')}
              className="text-left p-3 rounded transition-opacity hover:opacity-80 hover:bg-white/5 cursor-pointer"
            >
              <div className="text-xs mb-2" style={{ color: 'var(--color-ecological)' }}>
                Ecological →
              </div>
              <div className={`text-3xl font-light ${paradigms.ecological.value < 20 ? 'text-red-500' : ''}`}>
                {paradigms.ecological.value.toFixed(1)}
              </div>
            </button>
            <button
              onClick={() => setSelectedParadigm('indigenous')}
              className="text-left p-3 rounded transition-opacity hover:opacity-80 hover:bg-white/5 cursor-pointer"
            >
              <div className="text-xs mb-2" style={{ color: 'var(--color-indigenous)' }}>
                Indigenous →
              </div>
              <div className="text-3xl font-light">
                {paradigms.indigenous.value.toFixed(1)}
              </div>
            </button>
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
                {lastUpdate.extinctionProbability
                  ? (lastUpdate.extinctionProbability * 100).toFixed(1) + '%'
                  : 'Unknown'}
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
              {typeof lastUpdate.climateChange === 'number'
                ? ((1 - lastUpdate.climateChange) * 100).toFixed(0) + '%'
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
              Biodiversity Index
            </div>
            <div className="text-2xl font-light">
              {typeof lastUpdate.biodiversityLoss === 'number'
                ? ((1 - lastUpdate.biodiversityLoss) * 100).toFixed(0) + '%'
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
              Social Cohesion
            </div>
            <div className="text-2xl font-light">
              {typeof lastUpdate.socialCohesion === 'number'
                ? (lastUpdate.socialCohesion * 100).toFixed(0) + '%'
                : 'N/A'}
            </div>
          </div>
        </div>
      </Panel>

      {/* Government Actions Panel */}
      <GovernmentActionsPanel />

      {/* Paradigm Detail Panel */}
      {selectedParadigm && (
        <ParadigmDetailPanel
          paradigm={selectedParadigm}
          score={paradigms[selectedParadigm].value!}
          isOpen={selectedParadigm !== null}
          onClose={() => setSelectedParadigm(null)}
        />
      )}

      {/* Help Button */}
      <HelpButton
        content={{
          title: 'Overview Dashboard',
          description: 'Mission control for your simulation. Track the most critical metrics at a glance.',
          metrics: [
            {
              name: 'Quality of Life',
              meaning: '17-dimensional measure across 5 tiers (survival → environmental quality)',
              interpretation: 'Higher = better. Below 40% = survival crisis. Above 80% = flourishing.'
            },
            {
              name: 'Population',
              meaning: 'Global human population in billions',
              interpretation: 'Rapid decline indicates crises, famines, or collapse scenarios.'
            },
            {
              name: 'Multi-Paradigm DUI',
              meaning: '4 simultaneous worldviews scoring the same reality',
              interpretation: 'Different paradigms emphasize different values. Low scores indicate systemic issues in that worldview.'
            }
          ],
          docsLink: '/docs/dashboard-guide'
        }}
        position="top-right"
      />
    </div>
  )
}
