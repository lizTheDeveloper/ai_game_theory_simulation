/**
 * Technology Tree Dashboard - Phase 6
 *
 * Displays deployed technologies and active research.
 * Reference: /designs/08_tech_tree.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"

export function TechTreeDashboard() {
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

  const deployedTechCount = lastUpdate.deployedTechCount || 0
  const deployedTechs = lastUpdate.deployedTechs || []
  const activeResearch = lastUpdate.activeResearch || []
  const techRiskLevel = lastUpdate.techRiskLevel || 0

  // Group by tier
  const techByTier = deployedTechs.reduce((acc, tech) => {
    if (!acc[tech.tier]) acc[tech.tier] = []
    acc[tech.tier].push(tech)
    return acc
  }, {} as Record<number, typeof deployedTechs>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Technology Tree</h1>
        <p style={{ color: 'var(--white-40)' }}>
          Deployed Technologies and Active Research
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Deployed Technologies"
          value={deployedTechCount}
          status="normal"
        />
        <MetricCard
          label="Active Research"
          value={activeResearch.length}
          status="normal"
        />
        <MetricCard
          label="Tech Risk Level"
          value={`${(techRiskLevel * 100).toFixed(0)}%`}
          status={techRiskLevel > 0.7 ? 'critical' : techRiskLevel > 0.5 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Highest Tier"
          value={Math.max(0, ...deployedTechs.map(t => t.tier))}
          status="normal"
        />
      </div>

      {/* Active Research */}
      {activeResearch.length > 0 && (
        <Panel title="Active Research Projects">
          <div className="space-y-3">
            {activeResearch.map((research, index) => (
              <div
                key={index}
                className="p-3 rounded"
                style={{
                  backgroundColor: 'var(--color-near-black)',
                  border: '1px solid var(--white-10)'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold">{research.tech}</h3>
                  <span className="text-xs" style={{ color: 'var(--white-60)' }}>
                    {(research.progress * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${Math.min(100, research.progress * 100)}%`,
                      backgroundColor: 'var(--color-cyan)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Deployed Technologies by Tier */}
      {Object.keys(techByTier)
        .map(Number)
        .sort((a, b) => a - b)
        .map(tier => {
          const techs = techByTier[tier]
          if (!techs || techs.length === 0) return null

          const tierName =
            tier === 0 ? 'TIER 0 (2025 Deployed)' :
            tier === 1 ? 'TIER 1 (Crisis Mitigation)' :
            tier === 2 ? 'TIER 2 (Major Solutions)' :
            tier === 3 ? 'TIER 3 (Transformative)' :
            tier === 4 ? 'TIER 4 (Clarketech)' :
            `TIER ${tier}`

          return (
            <Panel key={tier} title={tierName}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {techs.map((tech, index) => (
                  <div
                    key={index}
                    className="p-4 rounded"
                    style={{
                      backgroundColor: 'var(--color-near-black)',
                      border: '1px solid var(--white-10)'
                    }}
                  >
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold mb-1">{tech.name}</h3>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--white-40)' }}>
                        <span>Tier {tech.tier}</span>
                        <span>•</span>
                        <span>{(tech.deployment * 100).toFixed(0)}% deployed</span>
                      </div>
                    </div>

                    {/* Deployment Bar */}
                    <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${Math.min(100, tech.deployment * 100)}%`,
                          backgroundColor: tech.deployment >= 0.7 ? 'var(--color-green)' : 'var(--color-cyan)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )
        })}

      {/* No Tech Deployed */}
      {deployedTechs.length === 0 && (
        <Panel title="No Technologies Deployed">
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            No breakthrough technologies have been deployed yet. Research and development are ongoing.
          </p>
        </Panel>
      )}

      {/* Tech Risk Warning */}
      {techRiskLevel > 0.5 && (
        <Panel title="⚠️ Technology Risk Alert" glow={techRiskLevel > 0.7 ? 'red' : 'amber'}>
          <p className="text-sm" style={{ color: 'var(--white-60)' }}>
            Technology risk level is {(techRiskLevel * 100).toFixed(0)}%.
            {techRiskLevel > 0.7 ? ' CRITICAL: Safety debt accumulating rapidly.' : ' WARNING: Monitor safety protocols.'}
          </p>
        </Panel>
      )}
    </div>
  )
}
