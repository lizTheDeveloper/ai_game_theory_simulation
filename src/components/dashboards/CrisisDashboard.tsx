/**
 * Crisis Dashboard - Phase 4
 *
 * Monitors active crises and cascade chains.
 * Reference: /designs/06_crisis_dashboard.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { StatusIndicator } from "@/components/core/StatusIndicator"
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"
import { useMemo } from "react"
import { formatInteger, formatNumber } from "@/lib/utils/formatters"
import { HelpButton } from "@/components/docs/HelpButton"

interface CrisisItem {
  id: string
  name: string
  type: string
  active: boolean
  severity: 'normal' | 'warning' | 'critical' | 'extinction'
  metrics: Record<string, string | number>
}

export function CrisisDashboard() {
  const { lastUpdate, initialized } = useSimulationWorker()

  // Extract crisis data from StateDelta
  const crises = useMemo(() => {
    if (!lastUpdate) return []

    const crisisList: CrisisItem[] = []

    // Use activeCrises array if available
    if (Array.isArray(lastUpdate.activeCrises) && lastUpdate.activeCrises.length > 0) {
      lastUpdate.activeCrises.forEach((crisis, index) => {
        crisisList.push({
          id: `crisis_${index}`,
          name: crisis.type,
          type: 'Active',
          active: true,
          severity: crisis.severity > 0.8 ? 'critical' : crisis.severity > 0.5 ? 'warning' : 'normal',
          metrics: {
            'Severity': `${(crisis.severity * 100).toFixed(0)}%`,
            'Duration': `${crisis.duration} months`,
          }
        })
      })
    }

    // Phosphorus Crisis
    if (typeof lastUpdate.phosphorusDepletion === 'number' && !isNaN(lastUpdate.phosphorusDepletion)) {
      const phosphorus = lastUpdate.phosphorusDepletion
      crisisList.push({
        id: 'phosphorus',
        name: 'Phosphorus Depletion',
        type: 'Resource',
        active: phosphorus > 0.5,
        severity: phosphorus > 0.7 ? 'critical' : phosphorus > 0.5 ? 'warning' : 'normal',
        metrics: {
          'Depletion Level': `${(phosphorus * 100).toFixed(0)}%`,
          'Status': phosphorus > 0.5 ? 'Active Crisis' : 'Monitoring',
        }
      })
    }

    // Freshwater Crisis
    if (typeof lastUpdate.freshwaterStress === 'number' && !isNaN(lastUpdate.freshwaterStress)) {
      const freshwater = lastUpdate.freshwaterStress
      crisisList.push({
        id: 'freshwater',
        name: 'Freshwater Stress',
        type: 'Resource',
        active: freshwater > 0.5,
        severity: freshwater > 0.7 ? 'critical' : freshwater > 0.5 ? 'warning' : 'normal',
        metrics: {
          'Stress Level': `${(freshwater * 100).toFixed(0)}%`,
          'Status': freshwater > 0.5 ? 'Active Crisis' : 'Monitoring',
        }
      })
    }

    // Ocean Acidification
    if (typeof lastUpdate.oceanAcidification === 'number' && !isNaN(lastUpdate.oceanAcidification)) {
      const ocean = lastUpdate.oceanAcidification
      crisisList.push({
        id: 'ocean',
        name: 'Ocean Acidification',
        type: 'Environmental',
        active: ocean > 0.5,
        severity: ocean > 0.7 ? 'critical' : ocean > 0.5 ? 'warning' : 'normal',
        metrics: {
          'Acidification': `${(ocean * 100).toFixed(0)}%`,
          'Status': ocean > 0.5 ? 'Active Crisis' : 'Monitoring',
        }
      })
    }

    // Novel Entities
    if (typeof lastUpdate.novelEntitiesLevel === 'number' && !isNaN(lastUpdate.novelEntitiesLevel)) {
      const novelEntities = lastUpdate.novelEntitiesLevel
      crisisList.push({
        id: 'novel_entities',
        name: 'Chemical Pollution',
        type: 'Environmental',
        active: novelEntities > 0.5,
        severity: novelEntities > 0.7 ? 'critical' : novelEntities > 0.5 ? 'warning' : 'normal',
        metrics: {
          'Pollution Load': `${(novelEntities * 100).toFixed(0)}%`,
          'Status': novelEntities > 0.5 ? 'Active Crisis' : 'Monitoring',
        }
      })
    }

    // Climate Change
    if (typeof lastUpdate.climateChange === 'number' && !isNaN(lastUpdate.climateChange)) {
      const climate = lastUpdate.climateChange
      crisisList.push({
        id: 'climate',
        name: 'Climate Change',
        type: 'Planetary Boundary',
        active: climate > 0.5,
        severity: climate > 0.7 ? 'critical' : climate > 0.5 ? 'warning' : 'normal',
        metrics: {
          'Impact': `${(climate * 100).toFixed(0)}%`,
          'Status': climate > 0.5 ? 'Breached' : 'Safe',
        }
      })
    }

    // Biodiversity Loss
    if (typeof lastUpdate.biodiversityLoss === 'number' && !isNaN(lastUpdate.biodiversityLoss)) {
      const biodiversity = lastUpdate.biodiversityLoss
      crisisList.push({
        id: 'biodiversity',
        name: 'Biodiversity Loss',
        type: 'Planetary Boundary',
        active: biodiversity > 0.5,
        severity: biodiversity > 0.7 ? 'critical' : biodiversity > 0.5 ? 'warning' : 'normal',
        metrics: {
          'Loss Rate': `${(biodiversity * 100).toFixed(0)}%`,
          'Status': biodiversity > 0.5 ? 'Breached' : 'Safe',
        }
      })
    }

    return crisisList
  }, [lastUpdate])

  // Statistics
  const stats = useMemo(() => {
    const activeCrises = crises.filter(c => c.active).length
    const criticalCrises = crises.filter(c => c.severity === 'critical' || c.severity === 'extinction').length
    const warningCrises = crises.filter(c => c.severity === 'warning').length

    return { activeCrises, criticalCrises, warningCrises, totalCrises: crises.length }
  }, [crises])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Crisis Monitor</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Active Crises and Cascade Chains
        </p>
      </div>

      {/* Crisis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Active Crises"
          value={stats.activeCrises}
          status={stats.activeCrises > 5 ? 'critical' : stats.activeCrises > 2 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Critical"
          value={stats.criticalCrises}
          status={stats.criticalCrises > 0 ? 'critical' : 'normal'}
        />
        <MetricCard
          label="Warning"
          value={stats.warningCrises}
          status={stats.warningCrises > 3 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Total Monitored"
          value={stats.totalCrises}
          status="normal"
        />
      </div>

      {/* Active Crisis Alert */}
      {stats.criticalCrises > 0 && (
        <Panel title="🚨 Critical Crises Detected" glow="red">
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            {stats.criticalCrises} critical crisis{stats.criticalCrises > 1 ? 'es' : ''} requiring immediate intervention.
            Multiple active crises can create cascade effects with compounding mortality.
          </p>
        </Panel>
      )}

      {/* Crisis List by Category */}
      {['Resource', 'Environmental', 'Planetary Boundary', 'Tipping Point', 'Geopolitical', 'Health'].map(category => {
        const categoryCrises = crises.filter(c => c.type === category)
        if (categoryCrises.length === 0) return null

        return (
          <Panel key={category} title={`${category} Crises`}>
            <div className="space-y-4">
              {categoryCrises.map(crisis => (
                <div
                  key={crisis.id}
                  className="p-4 rounded"
                  style={{
                    backgroundColor: 'var(--color-near-black)',
                    border: '1px solid var(--white-10)',
                    boxShadow: crisis.active
                      ? crisis.severity === 'extinction' || crisis.severity === 'critical'
                        ? '0 0 10px rgba(255, 0, 64, 0.3)'
                        : crisis.severity === 'warning'
                        ? '0 0 10px rgba(255, 176, 0, 0.2)'
                        : 'none'
                      : 'none'
                  }}
                >
                  {/* Crisis Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">{crisis.name}</h3>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--white-40)' }}>
                        <span>{crisis.type}</span>
                        <span>•</span>
                        <span>{crisis.active ? 'Active' : 'Monitoring'}</span>
                      </div>
                    </div>
                    <StatusIndicator status={crisis.severity as any} />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(crisis.metrics).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>{key}</div>
                        <div className="text-sm font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )
      })}

      {/* Crisis Cascade Warning */}
      {stats.activeCrises >= 3 && (
        <Panel title="Cascade Risk Analysis" glow="amber">
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--white-60)' }}>
              Multiple simultaneous crises detected ({stats.activeCrises} active).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Cascade Multiplier</div>
                <div className="text-2xl font-light">
                  {Math.pow(1.5, stats.activeCrises - 1).toFixed(1)}x
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  Compounding effect (1.5x per crisis)
                </p>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Intervention Priority</div>
                <div className="text-2xl font-light" style={{ color: 'var(--color-red)' }}>
                  Critical
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  Break cascade chain immediately
                </p>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Government Response Status */}
      <Panel title="Emergency Response Capacity">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>AI Regulation</div>
            <div className="text-lg font-semibold">
              {typeof lastUpdate.governmentAIRegulation === 'number' && !isNaN(lastUpdate.governmentAIRegulation)
                ? `${(lastUpdate.governmentAIRegulation * 100).toFixed(0)}%`
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Government Investment</div>
            <div className="text-lg font-semibold">
              {typeof lastUpdate.governmentInvestment === 'number' && !isNaN(lastUpdate.governmentInvestment)
                ? `${(lastUpdate.governmentInvestment * 100).toFixed(0)}%`
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>International Cooperation</div>
            <div className="text-lg font-semibold">
              {typeof lastUpdate.internationalCooperation === 'number' && !isNaN(lastUpdate.internationalCooperation)
                ? `${(lastUpdate.internationalCooperation * 100).toFixed(0)}%`
                : 'N/A'}
            </div>
          </div>
        </div>
      </Panel>

      {/* Help Button */}
      <HelpButton
        content={{
          title: "Crisis Dashboard",
          description: "Monitor active crises, cascade chains, and systemic risks. Track crisis severity, duration, and interconnected effects across multiple domains.",
          metrics: [
            {
              name: "Crisis Severity",
              meaning: "Intensity of crisis impact (0-100% scale)",
              interpretation: "Normal (<30%): Manageable. Warning (30-50%): Needs attention. Critical (50-80%): System stress. Extinction (>80%): Existential threat."
            },
            {
              name: "Nuclear Risk",
              meaning: "Probability and severity of nuclear conflict",
              interpretation: "Tracks escalation ladders, deterrence stability, and nuclear winter risks. Any detonation triggers cascade effects."
            },
            {
              name: "Climate Cascade",
              meaning: "Environmental tipping points and feedback loops",
              interpretation: "Shows climate change → famine → conflict chains. Multiple tipping points can trigger irreversible warming."
            },
            {
              name: "AI Crisis",
              meaning: "AI escape, misalignment, or collective formation",
              interpretation: "Escaped AIs operate without oversight. Collectives multiply effective capability. Misalignment can cascade rapidly."
            },
            {
              name: "Social Collapse",
              meaning: "Trust breakdown, meaning crisis, institutional failure",
              interpretation: "Low trust (<20%) triggers cascades. Meaning crisis affects cooperation. Institutional failure enables other crises."
            },
            {
              name: "Crisis Multipliers",
              meaning: "How crises amplify each other",
              interpretation: "Climate → Famine (2x). Nuclear → Climate (3x). AI escape → All systems (1.5x). Watch for cascade chains."
            }
          ],
          docsLink: "/docs/dashboard-guide#crises"
        }}
        position="top-right"
      />
    </div>
  )
}
