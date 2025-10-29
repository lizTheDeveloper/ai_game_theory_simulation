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

  // Validate data integrity
  const deployedTechCount = typeof lastUpdate.deployedTechCount === 'number' && !isNaN(lastUpdate.deployedTechCount)
    ? lastUpdate.deployedTechCount
    : 0

  const deployedTechs = Array.isArray(lastUpdate.deployedTechs)
    ? lastUpdate.deployedTechs
    : []

  const activeResearch = Array.isArray(lastUpdate.activeResearch)
    ? lastUpdate.activeResearch
    : []

  const techRiskLevel = typeof lastUpdate.techRiskLevel === 'number' && !isNaN(lastUpdate.techRiskLevel)
    ? lastUpdate.techRiskLevel
    : 0

  // Build tree structure: find root nodes and their children
  const rootTechs = deployedTechs.filter(tech => tech.prerequisites.length === 0)

  // Function to find children of a tech
  const findChildren = (parentId: string) => {
    return deployedTechs.filter(tech =>
      tech.prerequisites.includes(parentId)
    )
  }

  // Recursive component to render a tech and its children
  const TechNode = ({ tech, depth = 0 }: { tech: typeof deployedTechs[0], depth?: number }) => {
    const children = findChildren(tech.id)
    const hasChildren = children.length > 0

    return (
      <div className="tech-node">
        {/* Current tech */}
        <div
          className="flex items-start gap-3 mb-2"
          style={{
            marginLeft: `${depth * 32}px`
          }}
        >
          {/* Tree connector */}
          {depth > 0 && (
            <div
              className="mt-3"
              style={{
                width: '24px',
                height: '2px',
                backgroundColor: 'var(--white-20)',
                flexShrink: 0
              }}
            />
          )}

          {/* Tech card */}
          <div
            className="flex-1 p-3 rounded"
            style={{
              backgroundColor: 'var(--color-near-black)',
              border: '1px solid var(--white-10)'
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">{tech.name}</h3>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--white-40)' }}>
                  <span>Tier {tech.tier}</span>
                  {tech.prerequisites.length > 0 && (
                    <>
                      <span>•</span>
                      <span>Requires {tech.prerequisites.length} tech{tech.prerequisites.length > 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold">{(tech.deployment * 100).toFixed(0)}%</span>
                <div className="text-xs" style={{ color: 'var(--white-40)' }}>deployed</div>
              </div>
            </div>

            {/* Deployment bar */}
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
        </div>

        {/* Children */}
        {hasChildren && (
          <div>
            {children.map((child, i) => (
              <TechNode key={child.id} tech={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Group root nodes by tier for organized display
  const rootsByTier = rootTechs.reduce((acc, tech) => {
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

      {/* Technology Tree - Organized by Tier */}
      {Object.keys(rootsByTier)
        .map(Number)
        .sort((a, b) => a - b)
        .map(tier => {
          const techs = rootsByTier[tier]
          if (!Array.isArray(techs) || techs.length === 0) return null

          const tierName =
            tier === 0 ? 'TIER 0 - Root Technologies (2025 Deployed)' :
            tier === 1 ? 'TIER 1 - Crisis Mitigation Trees' :
            tier === 2 ? 'TIER 2 - Major Solutions Trees' :
            tier === 3 ? 'TIER 3 - Transformative Trees' :
            tier === 4 ? 'TIER 4 - Clarketech Trees' :
            `TIER ${tier} - Technology Trees`

          const tierDescription =
            tier === 0 ? 'Foundation technologies with no prerequisites. These unlock higher-tier techs.' :
            tier === 1 ? 'Root technologies addressing planetary boundary crises.' :
            tier === 2 ? 'Advanced technologies building on previous tiers.' :
            tier === 3 ? 'Transformative technologies requiring complex prerequisites.' :
            tier === 4 ? 'Clarketech capabilities at the frontier of possibility.' :
            ''

          return (
            <Panel key={tier} title={tierName}>
              <p className="text-sm mb-4" style={{ color: 'var(--white-60)' }}>
                {tierDescription}
              </p>
              <div className="space-y-1">
                {techs.map(tech => (
                  <TechNode key={tech.id} tech={tech} depth={0} />
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
