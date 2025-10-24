/**
 * Population & Regions Dashboard - Phase 8
 *
 * Global population and QoL metrics with regional breakdowns.
 * Shows regional population, quality of life, healthcare, and climate vulnerability.
 * Reference: /designs/10_regions.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"

export function RegionsDashboard() {
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

  const population = lastUpdate.population || 8_000_000_000
  const qol = lastUpdate.qualityOfLife || 0
  const socialCohesion = lastUpdate.socialCohesion || 0
  const institutionalTrust = lastUpdate.institutionalTrust || 0
  const regions = lastUpdate.regionalPopulations || []
  const hasRegionalData = regions.length > 0

  // Infer status from QoL
  const getStatus = (qolValue: number) => {
    if (qolValue >= 0.7) return { label: 'Thriving', color: 'var(--color-green)' }
    if (qolValue >= 0.5) return { label: 'Stable', color: 'var(--color-cyan)' }
    if (qolValue >= 0.3) return { label: 'Stressed', color: 'var(--color-amber)' }
    return { label: 'Crisis', color: 'var(--color-red)' }
  }

  const status = getStatus(qol)
  const vulnerableRegions = regions.filter(r => r.climateVulnerability > 0.7)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Population & Global Metrics</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Global population, quality of life, and social cohesion
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Global Population"
          value={(population / 1_000_000_000).toFixed(2)}
          unit="B"
          status={population < 2_000_000_000 ? 'critical' : 'normal'}
        />
        <MetricCard
          label="Quality of Life"
          value={(qol * 100).toFixed(0)}
          unit="%"
          status={qol < 0.4 ? 'critical' : qol < 0.6 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Social Cohesion"
          value={(socialCohesion * 100).toFixed(0)}
          unit="%"
          status={socialCohesion < 0.4 ? 'critical' : socialCohesion < 0.6 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Institutional Trust"
          value={(institutionalTrust * 100).toFixed(0)}
          unit="%"
          status={institutionalTrust < 0.4 ? 'critical' : institutionalTrust < 0.6 ? 'warning' : 'normal'}
        />
      </div>

      {/* Global Status */}
      <Panel title="Global Status">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Overall Status</div>
            <div className="text-4xl font-light mb-2" style={{ color: status.color }}>
              {status.label}
            </div>
            <p className="text-sm" style={{ color: 'var(--white-60)' }}>
              Based on quality of life index
            </p>
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Population Trend</div>
            <div className="text-4xl font-light mb-2" style={{ color: population < 7_000_000_000 ? 'var(--color-red)' : 'var(--white-80)' }}>
              {population < 7_000_000_000 ? 'Declining' : 'Stable'}
            </div>
            <p className="text-sm" style={{ color: 'var(--white-60)' }}>
              {(population / 1_000_000_000).toFixed(2)}B people
            </p>
          </div>
        </div>
      </Panel>

      {/* Quality of Life Breakdown */}
      <Panel title="Quality of Life Metrics">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Overall QoL</span>
              <span className="text-sm font-semibold">{(qol * 100).toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.min(100, qol * 100)}%`,
                  backgroundColor: qol >= 0.7 ? 'var(--color-green)' : qol >= 0.5 ? 'var(--color-cyan)' : qol >= 0.3 ? 'var(--color-amber)' : 'var(--color-red)'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Social Cohesion</span>
              <span className="text-sm font-semibold">{(socialCohesion * 100).toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.min(100, socialCohesion * 100)}%`,
                  backgroundColor: 'var(--color-cyan)'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Institutional Trust</span>
              <span className="text-sm font-semibold">{(institutionalTrust * 100).toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.min(100, institutionalTrust * 100)}%`,
                  backgroundColor: 'var(--color-cyan)'
                }}
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* Regional Data */}
      {hasRegionalData ? (
        <Panel title="📍 Regional Breakdown">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map((region, index) => {
              const regionStatus = getStatus(region.qualityOfLife)
              return (
                <div
                  key={index}
                  className="p-4 rounded"
                  style={{
                    backgroundColor: 'var(--color-near-black)',
                    border: '1px solid var(--white-10)'
                  }}
                >
                  {/* Region Header */}
                  <div className="mb-3">
                    <h3 className="text-base font-semibold mb-1">{region.name}</h3>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--white-60)' }}>
                        {region.population.toFixed(0)}M people
                      </span>
                      <span style={{ color: regionStatus.color }}>
                        {regionStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Quality of Life */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-1 text-xs">
                      <span style={{ color: 'var(--white-60)' }}>Quality of Life</span>
                      <span className="font-semibold">{(region.qualityOfLife * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${Math.min(100, region.qualityOfLife * 100)}%`,
                          backgroundColor: regionStatus.color
                        }}
                      />
                    </div>
                  </div>

                  {/* Healthcare Quality */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-1 text-xs">
                      <span style={{ color: 'var(--white-60)' }}>Healthcare Quality</span>
                      <span className="font-semibold">{(region.healthcareQuality * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${Math.min(100, region.healthcareQuality * 100)}%`,
                          backgroundColor: 'var(--color-cyan)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Climate Vulnerability */}
                  <div>
                    <div className="flex justify-between mb-1 text-xs">
                      <span style={{ color: 'var(--white-60)' }}>Climate Vulnerability</span>
                      <span className="font-semibold">{(region.climateVulnerability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${Math.min(100, region.climateVulnerability * 100)}%`,
                          backgroundColor: region.climateVulnerability > 0.7 ? 'var(--color-red)' : region.climateVulnerability > 0.5 ? 'var(--color-amber)' : 'var(--color-green)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      ) : (
        <Panel title="📍 Regional Tracking">
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            Regional population data is initializing. Once available, this panel will show
            population, quality of life, healthcare quality, and climate vulnerability
            breakdowns for each region.
          </p>
        </Panel>
      )}

      {/* High Vulnerability Alert */}
      {vulnerableRegions.length > 0 && (
        <Panel title="⚠️ High Climate Vulnerability Regions" glow="amber">
          <p className="text-sm mb-3" style={{ color: 'var(--white-60)' }}>
            {vulnerableRegions.length} region{vulnerableRegions.length > 1 ? 's' : ''} with climate vulnerability above 70%:
          </p>
          <div className="space-y-2">
            {vulnerableRegions.map((region, index) => (
              <div
                key={index}
                className="p-2 rounded text-sm"
                style={{
                  backgroundColor: 'var(--color-near-black)',
                  border: '1px solid var(--color-amber)'
                }}
              >
                <span className="font-semibold">{region.name}</span>
                <span style={{ color: 'var(--white-60)' }}> — {(region.climateVulnerability * 100).toFixed(0)}% vulnerable</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Crisis Alerts */}
      {population < 2_000_000_000 && (
        <Panel title="⚠️ Population Collapse" glow="red">
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            Global population has fallen below 2 billion ({(population / 1_000_000_000).toFixed(2)}B).
            This represents severe population decline with potential for civilizational collapse.
          </p>
        </Panel>
      )}

      {qol < 0.3 && (
        <Panel title="⚠️ Quality of Life Crisis" glow="red">
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            Global quality of life has fallen below 30% ({(qol * 100).toFixed(0)}%).
            Survival fundamentals are no longer met for large portions of the population.
          </p>
        </Panel>
      )}

      {socialCohesion < 0.3 && (
        <Panel title="⚠️ Social Fragmentation" glow="amber">
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            Social cohesion is critically low ({(socialCohesion * 100).toFixed(0)}%).
            Increased risk of social unrest, institutional breakdown, and meaning crisis.
          </p>
        </Panel>
      )}
    </div>
  )
}
