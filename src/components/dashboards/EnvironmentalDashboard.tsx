/**
 * Environmental Systems Dashboard - Phase 5
 *
 * Tracks planetary boundaries and tipping points.
 * Reference: /designs/05_environmental_systems.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"
import { HelpButton } from "@/components/docs/HelpButton"

export function EnvironmentalDashboard() {
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

  // Check for valid environmental data
  const hasValidData = lastUpdate &&
    typeof lastUpdate.climateChange === 'number' && !isNaN(lastUpdate.climateChange) &&
    typeof lastUpdate.biodiversityLoss === 'number' && !isNaN(lastUpdate.biodiversityLoss) &&
    typeof lastUpdate.planetaryBoundariesCrossed === 'number' && !isNaN(lastUpdate.planetaryBoundariesCrossed) &&
    typeof lastUpdate.environmentalDebtLevel === 'number' && !isNaN(lastUpdate.environmentalDebtLevel)

  if (!lastUpdate || !hasValidData) {
    return (
      <div className="p-8">
        <Panel title="Waiting for Environmental Data">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="status-indicator status-normal animate-pulse" />
              <span>Loading environmental system metrics...</span>
            </div>
            {lastUpdate && !hasValidData && (
              <div className="text-sm p-3 rounded border" style={{
                backgroundColor: 'rgba(255, 0, 64, 0.1)',
                borderColor: 'var(--color-red)',
                color: 'var(--color-red)'
              }}>
                ❌ Environmental data contains NaN or undefined values.
                This indicates a critical simulation error. Check logs immediately.
              </div>
            )}
          </div>
        </Panel>
      </div>
    )
  }

  // Environmental metrics from StateDelta - NO FALLBACKS
  const climate = lastUpdate.climateChange
  const biodiversity = lastUpdate.biodiversityLoss
  const boundariesCrossed = lastUpdate.planetaryBoundariesCrossed
  const environmentalDebt = lastUpdate.environmentalDebtLevel

  // Optional metrics - show N/A if missing
  const resourceDepletion = lastUpdate.resourceDepletion
  const pollution = lastUpdate.pollutionLevel
  const phosphorus = lastUpdate.phosphorusDepletion
  const freshwater = lastUpdate.freshwaterStress
  const ocean = lastUpdate.oceanAcidification
  const novelEntities = lastUpdate.novelEntitiesLevel

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Environmental Systems</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Planetary Boundaries and Environmental Debt
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Boundaries Crossed"
          value={boundariesCrossed ?? 0}
          status={(boundariesCrossed ?? 0) > 3 ? 'critical' : (boundariesCrossed ?? 0) > 1 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Environmental Debt"
          value={`${((environmentalDebt ?? 0) * 100).toFixed(0)}%`}
          status={(environmentalDebt ?? 0) > 0.7 ? 'critical' : (environmentalDebt ?? 0) > 0.5 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Climate Impact"
          value={`${((climate ?? 0) * 100).toFixed(0)}%`}
          status={(climate ?? 0) > 0.7 ? 'critical' : (climate ?? 0) > 0.5 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Biodiversity Loss"
          value={`${((biodiversity ?? 0) * 100).toFixed(0)}%`}
          status={(biodiversity ?? 0) > 0.7 ? 'critical' : (biodiversity ?? 0) > 0.5 ? 'warning' : 'normal'}
        />
      </div>

      {/* Breach Alert */}
      {(boundariesCrossed ?? 0) > 0 && (
        <Panel title="⚠️ Planetary Boundary Breaches Detected" glow={(boundariesCrossed ?? 0) > 3 ? 'red' : 'amber'}>
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            {boundariesCrossed ?? 0} planetary boundaries have been breached.
            Operating in high-uncertainty zone with increased risk of cascading tipping points.
          </p>
        </Panel>
      )}

      {/* Core Environmental Metrics */}
      <Panel title="Core Environmental Indicators">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Climate Change</div>
            <div className="text-3xl font-light mb-2" style={{ color: (climate ?? 0) > 0.7 ? 'var(--color-red)' : (climate ?? 0) > 0.5 ? 'var(--color-amber)' : 'var(--color-green)' }}>
              {((climate ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="h-2 rounded mb-2" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.min(100, (climate ?? 0) * 100)}%`,
                  backgroundColor: (climate ?? 0) > 0.7 ? 'var(--color-red)' : (climate ?? 0) > 0.5 ? 'var(--color-amber)' : 'var(--color-green)'
                }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>
              {(climate ?? 0) > 0.7 ? 'CRITICAL' : (climate ?? 0) > 0.5 ? 'Warning' : 'Safe'}
            </p>
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Biodiversity Loss</div>
            <div className="text-3xl font-light mb-2" style={{ color: (biodiversity ?? 0) > 0.7 ? 'var(--color-red)' : (biodiversity ?? 0) > 0.5 ? 'var(--color-amber)' : 'var(--color-green)' }}>
              {((biodiversity ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="h-2 rounded mb-2" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.min(100, (biodiversity ?? 0) * 100)}%`,
                  backgroundColor: (biodiversity ?? 0) > 0.7 ? 'var(--color-red)' : (biodiversity ?? 0) > 0.5 ? 'var(--color-amber)' : 'var(--color-green)'
                }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>
              {(biodiversity ?? 0) > 0.7 ? 'CRITICAL' : (biodiversity ?? 0) > 0.5 ? 'Warning' : 'Safe'}
            </p>
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Resource Depletion</div>
            {typeof resourceDepletion === 'number' ? (
              <>
                <div className="text-3xl font-light mb-2" style={{ color: resourceDepletion > 0.7 ? 'var(--color-red)' : resourceDepletion > 0.5 ? 'var(--color-amber)' : 'var(--color-green)' }}>
                  {(resourceDepletion * 100).toFixed(0)}%
                </div>
                <div className="h-2 rounded mb-2" style={{ backgroundColor: 'var(--white-10)' }}>
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${Math.min(100, resourceDepletion * 100)}%`,
                      backgroundColor: resourceDepletion > 0.7 ? 'var(--color-red)' : resourceDepletion > 0.5 ? 'var(--color-amber)' : 'var(--color-green)'
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--white-40)' }}>
                  {resourceDepletion > 0.7 ? 'CRITICAL' : resourceDepletion > 0.5 ? 'Warning' : 'Safe'}
                </p>
              </>
            ) : (
              <div className="text-xl font-light" style={{ color: 'var(--white-40)' }}>No data</div>
            )}
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Chemical Pollution</div>
            {typeof pollution === 'number' ? (
              <>
                <div className="text-3xl font-light mb-2" style={{ color: pollution > 0.7 ? 'var(--color-red)' : pollution > 0.5 ? 'var(--color-amber)' : 'var(--color-green)' }}>
                  {(pollution * 100).toFixed(0)}%
                </div>
                <div className="h-2 rounded mb-2" style={{ backgroundColor: 'var(--white-10)' }}>
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${Math.min(100, pollution * 100)}%`,
                      backgroundColor: pollution > 0.7 ? 'var(--color-red)' : pollution > 0.5 ? 'var(--color-amber)' : 'var(--color-green)'
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--white-40)' }}>
                  {pollution > 0.7 ? 'CRITICAL' : pollution > 0.5 ? 'Warning' : 'Safe'}
                </p>
              </>
            ) : (
              <div className="text-xl font-light" style={{ color: 'var(--white-40)' }}>No data</div>
            )}
          </div>
        </div>
      </Panel>

      {/* Specific Crisis Systems */}
      <Panel title="Resource Crisis Indicators">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Phosphorus Depletion</div>
            {typeof phosphorus === 'number' ? (
              <>
                <div className="text-2xl font-light" style={{ color: phosphorus > 0.7 ? 'var(--color-red)' : 'var(--white-80)' }}>
                  {(phosphorus * 100).toFixed(0)}%
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  {phosphorus > 0.5 ? 'Active Crisis' : 'Monitoring'}
                </p>
              </>
            ) : (
              <div className="text-xl font-light" style={{ color: 'var(--white-40)' }}>N/A</div>
            )}
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Freshwater Stress</div>
            {typeof freshwater === 'number' ? (
              <>
                <div className="text-2xl font-light" style={{ color: freshwater > 0.7 ? 'var(--color-red)' : 'var(--white-80)' }}>
                  {(freshwater * 100).toFixed(0)}%
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  {freshwater > 0.5 ? 'Active Crisis' : 'Monitoring'}
                </p>
              </>
            ) : (
              <div className="text-xl font-light" style={{ color: 'var(--white-40)' }}>N/A</div>
            )}
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Ocean Acidification</div>
            {typeof ocean === 'number' ? (
              <>
                <div className="text-2xl font-light" style={{ color: ocean > 0.7 ? 'var(--color-red)' : 'var(--white-80)' }}>
                  {(ocean * 100).toFixed(0)}%
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  {ocean > 0.5 ? 'Active Crisis' : 'Monitoring'}
                </p>
              </>
            ) : (
              <div className="text-xl font-light" style={{ color: 'var(--white-40)' }}>N/A</div>
            )}
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Novel Entities</div>
            {typeof novelEntities === 'number' ? (
              <>
                <div className="text-2xl font-light" style={{ color: novelEntities > 0.7 ? 'var(--color-red)' : 'var(--white-80)' }}>
                  {(novelEntities * 100).toFixed(0)}%
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  {novelEntities > 0.5 ? 'Active Crisis' : 'Monitoring'}
                </p>
              </>
            ) : (
              <div className="text-xl font-light" style={{ color: 'var(--white-40)' }}>N/A</div>
            )}
          </div>
        </div>
      </Panel>

      {/* Environmental Debt Accumulation */}
      <Panel title="Environmental Debt Accumulation">
        <p className="text-sm mb-4" style={{ color: 'var(--white-60)' }}>
          Hidden accumulation during prosperity. These debts compound silently and trigger crises when thresholds are crossed.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Total Debt Level</div>
            <div className="text-4xl font-light mb-2" style={{ color: (environmentalDebt ?? 0) > 0.7 ? 'var(--color-red)' : (environmentalDebt ?? 0) > 0.5 ? 'var(--color-amber)' : 'var(--white-80)' }}>
              {((environmentalDebt ?? 0) * 100).toFixed(0)}%
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Combined environmental stress</p>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Resource Depletion</div>
            <div className="text-3xl font-light mb-2" style={{ color: (resourceDepletion ?? 0) > 0.7 ? 'var(--color-red)' : 'var(--white-80)' }}>
              {((resourceDepletion ?? 0) * 100).toFixed(0)}%
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Phosphorus, freshwater</p>
          </div>
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Pollution Load</div>
            <div className="text-3xl font-light mb-2" style={{ color: (pollution ?? 0) > 0.6 ? 'var(--color-red)' : 'var(--white-80)' }}>
              {((pollution ?? 0) * 100).toFixed(0)}%
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>PFAS, novel entities</p>
          </div>
        </div>
      </Panel>

      {/* Crisis Cascade Warning */}
      {(boundariesCrossed ?? 0) >= 3 && (
        <Panel title="Cascade Risk Analysis" glow="amber">
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--white-60)' }}>
              Multiple planetary boundaries breached ({boundariesCrossed ?? 0} active).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--white-40)' }}>Cascade Multiplier</div>
                <div className="text-2xl font-light">
                  {Math.pow(1.5, (boundariesCrossed ?? 0) - 1).toFixed(1)}x
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  Compounding effect (1.5x per boundary)
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

      {/* Help Button */}
      <HelpButton
        content={{
          title: "Environmental Systems",
          description: "Monitor Earth's 9 planetary boundaries and environmental tipping points. Track climate, biodiversity, ocean health, and other critical Earth systems.",
          metrics: [
            {
              name: "Planetary Boundaries",
              meaning: "9 Earth system processes with safe operating spaces for humanity",
              interpretation: "Green (>70%): Safe zone. Yellow (40-70%): Uncertainty zone. Red (<40%): High risk zone. Multiple boundaries crossed = cascading effects."
            },
            {
              name: "Climate Stability",
              meaning: "Temperature rise, CO₂ levels, and climate tipping points",
              interpretation: "Below 1.5°C = manageable. 1.5-2°C = dangerous. >2°C = catastrophic. Tipping points trigger irreversible changes."
            },
            {
              name: "Biodiversity Index",
              meaning: "Species extinction rate vs natural background rate",
              interpretation: "100% = natural rate. <70% = mass extinction underway. <40% = ecosystem collapse risk."
            },
            {
              name: "Ocean Acidification",
              meaning: "pH levels and aragonite saturation state",
              interpretation: "pH >8.0 = healthy. pH 7.8-8.0 = stressed. pH <7.8 = coral reef collapse, marine food web disruption."
            },
            {
              name: "Tipping Cascades",
              meaning: "How crossing one boundary triggers others",
              interpretation: "Climate → Ocean → Biodiversity chains. Each boundary crossed increases risk 1.5x. 3+ boundaries = systemic collapse risk."
            },
            {
              name: "Safe Operating Space",
              meaning: "Remaining buffer before critical thresholds",
              interpretation: "Visual radar chart shows which boundaries are most stressed. Stay within green zone for all 9 boundaries."
            }
          ],
          docsLink: "/docs/dashboard-guide#environment"
        }}
        position="top-right"
      />
    </div>
  )
}
