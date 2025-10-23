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
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect, useMemo } from "react"

interface CrisisItem {
  id: string
  name: string
  type: string
  active: boolean
  severity: 'normal' | 'warning' | 'critical' | 'extinction'
  metrics: Record<string, string | number>
}

export function CrisisDashboard() {
  const { currentState, loadCurrent } = useSimulation()

  useEffect(() => {
    loadCurrent()
  }, [])

  // Extract crisis systems
  const crises = useMemo(() => {
    if (!currentState) return []

    const crisisList: CrisisItem[] = []

    // Phosphorus Crisis
    if (currentState.phosphorusSystem) {
      const p = currentState.phosphorusSystem
      crisisList.push({
        id: 'phosphorus',
        name: 'Phosphorus Depletion',
        type: 'Resource',
        active: p.criticalDepletionActive || p.supplyShockActive || false,
        severity: p.reserves < 0.3 ? 'critical' : p.reserves < 0.5 ? 'warning' : 'normal',
        metrics: {
          'Reserves': `${((p.reserves || 0) * 100).toFixed(0)}%`,
          'Price Index': (p.priceIndex || 1).toFixed(1) + 'x',
          'Supply Shock': p.supplyShockActive ? 'Active' : 'None',
        }
      })
    }

    // Freshwater Crisis
    if (currentState.freshwaterSystem) {
      const fw = currentState.freshwaterSystem
      const availableWater = (fw.blueWater.surfaceWater + fw.blueWater.groundwater) / 2
      crisisList.push({
        id: 'freshwater',
        name: 'Freshwater Depletion',
        type: 'Resource',
        active: fw.dayZeroDrought.active || fw.criticalScarcityActive || false,
        severity: availableWater < 0.3 ? 'critical' : availableWater < 0.5 ? 'warning' : 'normal',
        metrics: {
          'Available Water': `${((availableWater || 0) * 100).toFixed(0)}%`,
          'Aquifer Health': `${((fw.blueWater.groundwater || 1) * 100).toFixed(0)}%`,
          'Day Zero': fw.dayZeroDrought.active ? 'Active' : 'None',
        }
      })
    }

    // Ocean Acidification
    if (currentState.oceanAcidificationSystem) {
      const oa = currentState.oceanAcidificationSystem
      crisisList.push({
        id: 'ocean',
        name: 'Ocean Acidification',
        type: 'Environmental',
        active: oa.coralExtinctionActive || oa.boundaryBreached || false,
        severity: oa.pHLevel < 0.85 ? 'critical' : oa.pHLevel < 0.92 ? 'warning' : 'normal',
        metrics: {
          'pH Level': `${((oa.pHLevel || 1.0) * 100).toFixed(0)}%`,
          'Coral Health': `${((oa.coralReefHealth || 1) * 100).toFixed(0)}%`,
          'Fishery Impact': `${((oa.fishDependentImpact || 0) * 100).toFixed(0)}%`,
        }
      })
    }

    // Novel Entities (Chemical Pollution)
    if (currentState.novelEntitiesSystem) {
      const ne = currentState.novelEntitiesSystem
      crisisList.push({
        id: 'novel_entities',
        name: 'Novel Entities Crisis',
        type: 'Environmental',
        active: ne.reproductiveCrisisActive || ne.boundaryBreached || false,
        severity: ne.syntheticChemicalLoad > 0.7 ? 'critical' : ne.syntheticChemicalLoad > 0.5 ? 'warning' : 'normal',
        metrics: {
          'Pollution Load': `${((ne.syntheticChemicalLoad || 0) * 100).toFixed(0)}%`,
          'PFAS Prevalence': `${((ne.pfasPrevalence || 0) * 100).toFixed(0)}%`,
          'Chronic Disease': `${((ne.chronicDiseasePrevalence || 0) * 100).toFixed(0)}%`,
        }
      })
    }

    // Planetary Boundaries
    if (currentState.planetaryBoundariesSystem) {
      const pb = currentState.planetaryBoundariesSystem.boundaries

      // Climate
      if (pb.climate_change) {
        const isBreached = pb.climate_change.status === 'beyond_boundary' || pb.climate_change.status === 'high_risk'
        crisisList.push({
          id: 'climate',
          name: 'Climate Change',
          type: 'Planetary Boundary',
          active: isBreached,
          severity: pb.climate_change.status === 'high_risk' ? 'critical' :
                   isBreached ? 'warning' : 'normal',
          metrics: {
            'Current': (pb.climate_change.currentValue * 100).toFixed(0) + '%',
            'Threshold': (pb.climate_change.boundaryThreshold * 100).toFixed(0) + '%',
            'Status': isBreached ? 'Breached' : 'Safe',
          }
        })
      }

      // Biodiversity
      if (pb.biosphere_integrity) {
        const isBreached = pb.biosphere_integrity.status === 'beyond_boundary' || pb.biosphere_integrity.status === 'high_risk'
        crisisList.push({
          id: 'biodiversity',
          name: 'Biodiversity Loss',
          type: 'Planetary Boundary',
          active: isBreached,
          severity: pb.biosphere_integrity.status === 'high_risk' ? 'critical' :
                   isBreached ? 'warning' : 'normal',
          metrics: {
            'Integrity': (pb.biosphere_integrity.currentValue * 100).toFixed(0) + '%',
            'Threshold': (pb.biosphere_integrity.boundaryThreshold * 100).toFixed(0) + '%',
            'Status': isBreached ? 'Breached' : 'Safe',
          }
        })
      }
    }

    // Nuclear Tensions
    if (currentState.madDeterrence && currentState.bilateralTensions) {
      const mad = currentState.madDeterrence
      const activeConflicts = currentState.bilateralTensions.filter(t => t.conventionalConflict || t.nuclearThreats).length
      const maxTension = currentState.bilateralTensions.length > 0
        ? Math.max(...currentState.bilateralTensions.map(t => t.tensionLevel))
        : 0
      const totalStockpile = currentState.nuclearStates?.reduce((sum, state) => sum + state.arsenal, 0) || 0

      crisisList.push({
        id: 'nuclear',
        name: 'Nuclear Tensions',
        type: 'Geopolitical',
        active: activeConflicts > 0 || mad.crisisStability < 0.3,
        severity: activeConflicts > 0 ? 'critical' : maxTension > 0.7 ? 'warning' : 'normal',
        metrics: {
          'Max Tension': `${((maxTension || 0) * 100).toFixed(0)}%`,
          'Active Conflicts': activeConflicts,
          'Global Stockpile': totalStockpile.toLocaleString(),
        }
      })
    }

    // AMR (Antimicrobial Resistance)
    if (currentState.antimicrobialResistanceSystem) {
      const amr = currentState.antimicrobialResistanceSystem
      // Crisis is active when medical effectiveness drops below 85% or deaths exceed 5M/year
      const isCrisis = amr.currentMedicalEffectiveness < 0.85 || amr.annualDeaths > 5000000
      crisisList.push({
        id: 'amr',
        name: 'Antimicrobial Resistance',
        type: 'Health',
        active: isCrisis,
        severity: amr.currentMedicalEffectiveness < 0.75 ? 'critical' : amr.currentMedicalEffectiveness < 0.85 ? 'warning' : 'normal',
        metrics: {
          'Medical Effectiveness': `${((amr.currentMedicalEffectiveness || 1) * 100).toFixed(0)}%`,
          'Annual Deaths': (amr.annualDeaths || 0).toLocaleString(),
          'Death Rate': `${amr.currentDeathRate.toFixed(1)}/100K`,
        }
      })
    }

    // Ecosystem Collapse
    if (currentState.ecosystemCollapse?.triggered) {
      const ec = currentState.ecosystemCollapse
      crisisList.push({
        id: 'ecosystem',
        name: 'Ecosystem Collapse',
        type: 'Environmental',
        active: true,
        severity: ec.phase === 'collapse' ? 'extinction' : ec.phase === 'crisis' ? 'critical' : 'warning',
        metrics: {
          'Phase': ec.phase,
          'Months Since Trigger': ec.monthsSinceTrigger || 0,
          'Triggered At': `Month ${ec.triggeredAt}`,
        }
      })
    }

    // Tipping Points
    if (currentState.specificTippingPoints) {
      const tp = currentState.specificTippingPoints

      if (tp.amazon?.triggered) {
        crisisList.push({
          id: 'amazon',
          name: 'Amazon Rainforest Dieback',
          type: 'Tipping Point',
          active: true,
          severity: 'critical',
          metrics: {
            'Deforestation': `${((tp.amazon.deforestation || 0) * 100).toFixed(0)}%`,
            'Carbon Released': `${(tp.amazon.carbonReleased || 0).toFixed(1)} Gt`,
            'Progress': `${((tp.amazon.transitionProgress || 0) * 100).toFixed(0)}%`,
          }
        })
      }

      if (tp.coral?.triggered) {
        crisisList.push({
          id: 'coral',
          name: 'Coral Reef Collapse',
          type: 'Tipping Point',
          active: true,
          severity: 'critical',
          metrics: {
            'Health': `${((tp.coral.healthPercentage || 0) * 100).toFixed(0)}%`,
            'Collapse Progress': `${((tp.coral.collapseProgress || 0) * 100).toFixed(0)}%`,
            'Fishery Loss': `${((tp.coral.fisheryCollapseLevel || 0) * 100).toFixed(0)}%`,
          }
        })
      }
    }

    return crisisList
  }, [currentState])

  // Statistics
  const stats = useMemo(() => {
    const activeCrises = crises.filter(c => c.active).length
    const criticalCrises = crises.filter(c => c.severity === 'critical' || c.severity === 'extinction').length
    const warningCrises = crises.filter(c => c.severity === 'warning').length

    return { activeCrises, criticalCrises, warningCrises, totalCrises: crises.length }
  }, [crises])

  if (!currentState) {
    return <div className="p-8">Loading...</div>
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
        <Panel title="⚠️ Critical Crises Detected" glow="red">
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
      {currentState.government && (
        <Panel title="Emergency Response Capacity">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Action Frequency</div>
              <div className="text-lg font-semibold">{currentState.government.actionFrequency.toFixed(2) || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Oversight Level</div>
              <div className="text-lg font-semibold">{currentState.government.oversightLevel || 0}/10</div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Alignment Investment</div>
              <div className="text-lg font-semibold">{currentState.government.alignmentResearchInvestment || 0}/10</div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}
