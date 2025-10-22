/**
 * Environmental Systems Dashboard - Phase 5
 *
 * Tracks planetary boundaries and tipping points.
 * Reference: /designs/05_environmental_systems.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { Sparkline } from "@/components/charts/Sparkline"
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect, useMemo } from "react"

export function EnvironmentalDashboard() {
  const { currentState, trajectory, loadCurrent } = useSimulation()

  useEffect(() => {
    loadCurrent()
  }, [])

  // Extract planetary boundaries
  const boundaries = useMemo(() => {
    if (!currentState?.planetaryBoundaries) return []

    const pb = currentState.planetaryBoundaries
    return [
      {
        id: 'climate',
        name: 'Climate Change',
        current: pb.climateChange?.current || 0,
        threshold: pb.climateChange?.threshold || 1,
        safe: pb.climateChange?.safe || 0.8,
        unit: 'ppm CO2',
        breached: (pb.climateChange?.current || 0) > (pb.climateChange?.threshold || 1),
      },
      {
        id: 'biodiversity',
        name: 'Biosphere Integrity',
        current: pb.biosphereIntegrity?.current || 1,
        threshold: pb.biosphereIntegrity?.threshold || 0.9,
        safe: 1,
        unit: 'Integrity',
        breached: (pb.biosphereIntegrity?.current || 1) < (pb.biosphereIntegrity?.threshold || 0.9),
      },
      {
        id: 'land',
        name: 'Land System Change',
        current: pb.landSystemChange?.current || 0,
        threshold: pb.landSystemChange?.threshold || 0.25,
        safe: 0.15,
        unit: '% Converted',
        breached: (pb.landSystemChange?.current || 0) > (pb.landSystemChange?.threshold || 0.25),
      },
      {
        id: 'freshwater',
        name: 'Freshwater Use',
        current: pb.freshwaterUse?.current || 0,
        threshold: pb.freshwaterUse?.threshold || 0.65,
        safe: 0.50,
        unit: '% Consumed',
        breached: (pb.freshwaterUse?.current || 0) > (pb.freshwaterUse?.threshold || 0.65),
      },
      {
        id: 'nitrogen',
        name: 'Nitrogen Cycles',
        current: pb.nitrogenCycles?.current || 0,
        threshold: pb.nitrogenCycles?.threshold || 0.62,
        safe: 0.50,
        unit: 'Tg N/yr',
        breached: (pb.nitrogenCycles?.current || 0) > (pb.nitrogenCycles?.threshold || 0.62),
      },
      {
        id: 'phosphorus',
        name: 'Phosphorus Cycles',
        current: pb.phosphorusCycles?.current || 0,
        threshold: pb.phosphorusCycles?.threshold || 0.11,
        safe: 0.08,
        unit: 'Tg P/yr',
        breached: (pb.phosphorusCycles?.current || 0) > (pb.phosphorusCycles?.threshold || 0.11),
      },
      {
        id: 'ocean',
        name: 'Ocean Acidification',
        current: pb.oceanAcidification?.current || 0,
        threshold: pb.oceanAcidification?.threshold || 2.75,
        safe: 2.50,
        unit: 'Ω aragonite',
        breached: (pb.oceanAcidification?.current || 0) < (pb.oceanAcidification?.threshold || 2.75),
      },
      {
        id: 'aerosol',
        name: 'Atmospheric Aerosols',
        current: pb.atmosphericAerosols?.current || 0,
        threshold: pb.atmosphericAerosols?.threshold || 0.4,
        safe: 0.3,
        unit: 'AOD',
        breached: (pb.atmosphericAerosols?.current || 0) > (pb.atmosphericAerosols?.threshold || 0.4),
      },
      {
        id: 'chemical',
        name: 'Novel Entities',
        current: pb.novelEntities?.current || 0,
        threshold: pb.novelEntities?.threshold || 0.6,
        safe: 0.4,
        unit: 'Pollution Load',
        breached: (pb.novelEntities?.current || 0) > (pb.novelEntities?.threshold || 0.6),
      },
    ]
  }, [currentState])

  // Stats
  const stats = useMemo(() => {
    const breachedCount = boundaries.filter(b => b.breached).length
    const nearThreshold = boundaries.filter(b => !b.breached && Math.abs(b.current - b.threshold) / b.threshold < 0.1).length
    const safe = boundaries.filter(b => !b.breached && Math.abs(b.current - b.threshold) / b.threshold >= 0.1).length

    return { breachedCount, nearThreshold, safe, total: boundaries.length }
  }, [boundaries])

  // Environmental debt
  const environmentalDebt = useMemo(() => {
    if (!currentState) return { resourceDepletion: 0, pollution: 0, climateDebt: 0, biodiversityLoss: 0 }

    return {
      resourceDepletion: (currentState.phosphorusSystem?.reserves ? 1 - currentState.phosphorusSystem.reserves : 0) * 100,
      pollution: (currentState.novelEntitiesSystem?.totalPollutionLoad || 0) * 100,
      climateDebt: (currentState.planetaryBoundaries?.climateChange?.current || 0) * 100,
      biodiversityLoss: (1 - (currentState.planetaryBoundaries?.biosphereIntegrity?.current || 1)) * 100,
    }
  }, [currentState])

  // Get sparklines for key boundaries
  const getSparkline = (boundaryId: string) => {
    if (trajectory.length < 2) return []
    return trajectory.slice(-12).map(state => {
      const pb = state.planetaryBoundaries
      if (!pb) return 0

      switch (boundaryId) {
        case 'climate':
          return (pb.climateChange?.current || 0) * 100
        case 'biodiversity':
          return (pb.biosphereIntegrity?.current || 1) * 100
        case 'ocean':
          return (pb.oceanAcidification?.current || 0)
        default:
          return 0
      }
    })
  }

  if (!currentState) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Environmental Systems</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Planetary Boundaries and Tipping Points
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Breached Boundaries"
          value={stats.breachedCount}
          status={stats.breachedCount > 3 ? 'critical' : stats.breachedCount > 1 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Near Threshold"
          value={stats.nearThreshold}
          status={stats.nearThreshold > 3 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Safe Zone"
          value={stats.safe}
          status="normal"
        />
        <MetricCard
          label="Total Monitored"
          value={stats.total}
          status="normal"
        />
      </div>

      {/* Breach Alert */}
      {stats.breachedCount > 0 && (
        <Panel title="⚠️ Planetary Boundary Breaches Detected" glow={stats.breachedCount > 3 ? 'red' : 'amber'}>
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            {stats.breachedCount} of {stats.total} planetary boundaries have been breached.
            Operating in high-uncertainty zone with increased risk of cascading tipping points.
          </p>
        </Panel>
      )}

      {/* Planetary Boundaries Grid */}
      <Panel title="9 Planetary Boundaries (Stockholm Resilience Centre)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boundaries.map(boundary => {
            const proximityRatio = Math.abs(boundary.current - boundary.threshold) / boundary.threshold

            return (
              <div
                key={boundary.id}
                className="p-4 rounded"
                style={{
                  backgroundColor: 'var(--color-near-black)',
                  border: `1px solid ${boundary.breached ? 'var(--color-red)' : 'var(--white-10)'}`,
                  boxShadow: boundary.breached ? '0 0 10px rgba(255, 0, 64, 0.2)' : 'none'
                }}
              >
                {/* Boundary Name */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold">{boundary.name}</h3>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: boundary.breached
                        ? 'var(--color-red)'
                        : proximityRatio < 0.1
                        ? 'var(--color-amber)'
                        : 'var(--color-green)'
                    }}
                  />
                </div>

                {/* Values */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--white-40)' }}>Current</span>
                    <span className="font-semibold" style={{ color: boundary.breached ? 'var(--color-red)' : 'var(--white-80)' }}>
                      {boundary.current.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--white-40)' }}>Threshold</span>
                    <span className="font-semibold">{boundary.threshold.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--white-40)' }}>Safe Zone</span>
                    <span className="font-semibold" style={{ color: 'var(--color-green)' }}>
                      {boundary.safe.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="mt-3">
                  <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${Math.min(100, (boundary.current / boundary.threshold) * 100)}%`,
                        backgroundColor: boundary.breached ? 'var(--color-red)' : 'var(--color-cyan)'
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                    {boundary.breached ? 'BREACHED' : proximityRatio < 0.1 ? 'Near Threshold' : 'Safe Zone'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* Environmental Debt Accumulation */}
      <Panel title="Environmental Debt Accumulation">
        <p className="text-sm mb-4" style={{ color: 'var(--white-60)' }}>
          Hidden accumulation during prosperity. These debts compound silently and trigger crises when thresholds are crossed.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Resource Depletion</div>
            <div className="text-3xl font-light mb-2" style={{ color: environmentalDebt.resourceDepletion > 70 ? 'var(--color-red)' : 'var(--white-80)' }}>
              {environmentalDebt.resourceDepletion.toFixed(0)}%
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Phosphorus, freshwater</p>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Chemical Pollution</div>
            <div className="text-3xl font-light mb-2" style={{ color: environmentalDebt.pollution > 60 ? 'var(--color-red)' : 'var(--white-80)' }}>
              {environmentalDebt.pollution.toFixed(0)}%
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>PFAS, novel entities</p>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Climate Debt</div>
            <div className="text-3xl font-light mb-2" style={{ color: environmentalDebt.climateDebt > 100 ? 'var(--color-red)' : 'var(--white-80)' }}>
              {environmentalDebt.climateDebt.toFixed(0)}%
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>CO2, methane, tipping points</p>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Biodiversity Loss</div>
            <div className="text-3xl font-light mb-2" style={{ color: environmentalDebt.biodiversityLoss > 50 ? 'var(--color-red)' : 'var(--white-80)' }}>
              {environmentalDebt.biodiversityLoss.toFixed(0)}%
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Species extinction, habitat</p>
          </div>
        </div>
      </Panel>

      {/* Key Boundary Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel title="Climate Change Trend">
          <div className="mb-3">
            <div className="text-3xl font-light" style={{ color: boundaries[0]?.breached ? 'var(--color-red)' : 'var(--color-cyan)' }}>
              {(boundaries[0]?.current || 0).toFixed(2)}
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>ppm CO2 equivalent</p>
          </div>
          {trajectory.length > 1 && (
            <Sparkline data={getSparkline('climate')} color={boundaries[0]?.breached ? 'var(--color-red)' : 'var(--color-cyan)'} />
          )}
        </Panel>

        <Panel title="Biodiversity Integrity">
          <div className="mb-3">
            <div className="text-3xl font-light" style={{ color: boundaries[1]?.breached ? 'var(--color-red)' : 'var(--color-green)' }}>
              {((boundaries[1]?.current || 1) * 100).toFixed(0)}%
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Ecosystem health</p>
          </div>
          {trajectory.length > 1 && (
            <Sparkline data={getSparkline('biodiversity')} color={boundaries[1]?.breached ? 'var(--color-red)' : 'var(--color-green)'} />
          )}
        </Panel>

        <Panel title="Ocean Acidification">
          <div className="mb-3">
            <div className="text-3xl font-light" style={{ color: boundaries[6]?.breached ? 'var(--color-red)' : 'var(--color-cyan)' }}>
              {(boundaries[6]?.current || 0).toFixed(2)}
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Ω aragonite saturation</p>
          </div>
          {trajectory.length > 1 && (
            <Sparkline data={getSparkline('ocean')} color={boundaries[6]?.breached ? 'var(--color-red)' : 'var(--color-cyan)'} />
          )}
        </Panel>
      </div>

      {/* Tipping Points */}
      {currentState.specificTippingPoints && (
        <Panel title="Active Tipping Points" glow="red">
          <div className="space-y-4">
            {currentState.specificTippingPoints.amazon?.triggered && (
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--color-red)' }}>
                <div className="font-semibold mb-1" style={{ color: 'var(--color-red)' }}>Amazon Rainforest Dieback</div>
                <div className="text-xs" style={{ color: 'var(--white-60)' }}>
                  Irreversible transition to savanna. Triggered at month {currentState.specificTippingPoints.amazon.triggeredAt}.
                  Progress: {((currentState.specificTippingPoints.amazon.transitionProgress || 0) * 100).toFixed(0)}%
                </div>
              </div>
            )}

            {currentState.specificTippingPoints.coral?.triggered && (
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--color-red)' }}>
                <div className="font-semibold mb-1" style={{ color: 'var(--color-red)' }}>Coral Reef Collapse</div>
                <div className="text-xs" style={{ color: 'var(--white-60)' }}>
                  Tropical coral reefs dying. Health: {((currentState.specificTippingPoints.coral.healthPercentage || 0) * 100).toFixed(0)}%.
                  Fishery loss: {((currentState.specificTippingPoints.coral.fisheryCollapseLevel || 0) * 100).toFixed(0)}%
                </div>
              </div>
            )}

            {currentState.specificTippingPoints.permafrost?.triggered && (
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--color-red)' }}>
                <div className="font-semibold mb-1" style={{ color: 'var(--color-red)' }}>Permafrost Thaw</div>
                <div className="text-xs" style={{ color: 'var(--white-60)' }}>
                  Arctic permafrost releasing stored carbon.
                  Released: {(currentState.specificTippingPoints.permafrost.carbonReleased || 0).toFixed(1)} Gt C
                </div>
              </div>
            )}

            {currentState.specificTippingPoints.amoc?.triggered && (
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--color-red)' }}>
                <div className="font-semibold mb-1" style={{ color: 'var(--color-red)' }}>AMOC Collapse</div>
                <div className="text-xs" style={{ color: 'var(--white-60)' }}>
                  Atlantic Meridional Overturning Circulation weakening. Regional climate disruption.
                </div>
              </div>
            )}

            {currentState.specificTippingPoints.pollinators?.triggered && (
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--color-amber)' }}>
                <div className="font-semibold mb-1" style={{ color: 'var(--color-amber)' }}>Pollinator Collapse</div>
                <div className="text-xs" style={{ color: 'var(--white-60)' }}>
                  Insect pollinators declining. Reversible with intervention.
                  Food production loss: {((currentState.specificTippingPoints.pollinators.foodProductionLoss || 0) * 100).toFixed(0)}%
                </div>
              </div>
            )}

            {!currentState.specificTippingPoints.amazon?.triggered &&
             !currentState.specificTippingPoints.coral?.triggered &&
             !currentState.specificTippingPoints.permafrost?.triggered &&
             !currentState.specificTippingPoints.amoc?.triggered &&
             !currentState.specificTippingPoints.pollinators?.triggered && (
              <p className="text-sm" style={{ color: 'var(--white-40)' }}>
                No tipping points triggered yet. Continue monitoring thresholds.
              </p>
            )}
          </div>
        </Panel>
      )}
    </div>
  )
}
