/**
 * Technology Tree Dashboard - Phase 6
 *
 * Displays 71 breakthrough technologies with prerequisite relationships.
 * Shows actual tree structure, not flat tiers.
 * Reference: /designs/08_tech_tree.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect, useMemo } from "react"
import { getAllTech, type TechDefinition } from "@/simulation/techTree/comprehensiveTechTree"

interface TechNode {
  tech: TechDefinition
  isUnlocked: boolean
  deploymentLevel: number
  children: TechNode[]
}

export function TechTreeDashboard() {
  const { currentState, loadCurrent } = useSimulation()

  useEffect(() => {
    loadCurrent()
  }, [])

  // Load all technologies from the comprehensive tech tree
  const allTech = useMemo(() => getAllTech(), [])

  // Build tree structure from prerequisites
  const techTree = useMemo(() => {
    if (!currentState?.techTreeState) return []

    const unlockedSet = new Set(currentState.techTreeState.unlockedTech)

    // Create a map of tech by ID for quick lookup
    const techById = new Map(allTech.map(t => [t.id, t]))

    // Calculate deployment level for each tech
    const deploymentLevels = new Map<string, number>()

    // TIER 0 technologies have deploymentLevel from definition
    allTech.forEach(tech => {
      if (tech.status === 'deployed_2025') {
        deploymentLevels.set(tech.id, tech.deploymentLevel)
      }
    })

    // For unlocked tech, check regional deployment
    if (currentState.techTreeState.regionalDeployment) {
      Object.values(currentState.techTreeState.regionalDeployment).forEach(regionDeployments => {
        if (Array.isArray(regionDeployments)) {
          regionDeployments.forEach((deployment: any) => {
            if (deployment.techId) {
              const existing = deploymentLevels.get(deployment.techId) || 0
              deploymentLevels.set(deployment.techId, Math.max(existing, deployment.deploymentLevel || 0))
            }
          })
        }
      })
    }

    // Build tree: root nodes are tech with no prerequisites
    const roots: TechNode[] = []
    const techNodeMap = new Map<string, TechNode>()

    // First pass: create all nodes
    allTech.forEach(tech => {
      const techIndex = allTech.findIndex(t => t.id === tech.id)
      const node: TechNode = {
        tech,
        isUnlocked: unlockedSet.has(tech.id) || unlockedSet.has(techIndex.toString()),
        deploymentLevel: deploymentLevels.get(tech.id) || 0,
        children: []
      }
      techNodeMap.set(tech.id, node)
    })

    // Second pass: link children to parents based on prerequisites
    allTech.forEach(tech => {
      const node = techNodeMap.get(tech.id)!

      if (tech.prerequisites.length === 0) {
        // No prerequisites = root node
        roots.push(node)
      } else {
        // Add this tech as a child to each prerequisite
        tech.prerequisites.forEach(prereqId => {
          const parentNode = techNodeMap.get(prereqId)
          if (parentNode) {
            parentNode.children.push(node)
          }
        })
      }
    })

    return roots
  }, [currentState, allTech])

  // Calculate stats
  const stats = useMemo(() => {
    if (!currentState?.techTreeState) {
      return { total: allTech.length, deployed: 0, unlockable: 0, researching: 0 }
    }

    const unlockedCount = currentState.techTreeState.unlockedTech.length
    const deployed = allTech.filter(t => t.status === 'deployed_2025').length
    const researchingCount = Object.keys(currentState.techTreeState.researchProgress || {}).length

    return {
      total: allTech.length,
      deployed,
      unlockable: unlockedCount - deployed,
      researching: researchingCount
    }
  }, [currentState, allTech])

  if (!currentState) {
    return <div className="p-8">Loading...</div>
  }

  // Tech breakthrough rate per turn (per month)
  const generalRD = currentState.globalMetrics?.technologicalBreakthroughRate || 0
  const alignmentRD = currentState.government?.alignmentResearchInvestment || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Technology Tree</h1>
        <p style={{ color: 'var(--white-40)' }}>
          {allTech.length} Breakthrough Technologies with Prerequisites
        </p>
      </div>

      {/* Research Investment - AT TOP per user request */}
      <Panel title="Research & Development" glow="cyan">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Alignment Research</div>
            <div className="text-3xl font-light mb-2">
              {alignmentRD.toFixed(1)}/10
            </div>
            <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${(alignmentRD / 10) * 100}%`,
                  backgroundColor: 'var(--color-cyan)'
                }}
              />
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--white-60)' }}>
              Government investment in AI safety research
            </div>
          </div>

          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>General R&D</div>
            <div className="text-3xl font-light mb-2">
              {(generalRD * 100).toFixed(1)}%
            </div>
            <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${generalRD * 100}%`,
                  backgroundColor: 'var(--color-green)'
                }}
              />
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--white-60)' }}>
              Technological breakthrough rate per turn (month)
            </div>
          </div>
        </div>
      </Panel>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Technologies"
          value={stats.total}
          status="normal"
        />
        <MetricCard
          label="Deployed"
          value={stats.deployed}
          status="normal"
        />
        <MetricCard
          label="Unlocked"
          value={stats.unlockable}
          status={stats.unlockable > 0 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Researching"
          value={stats.researching}
          status={stats.researching > 0 ? 'normal' : 'critical'}
        />
      </div>

      {/* Technology Tree Visualization */}
      <Panel title="Technology Tree (Prerequisite Graph)">
        <p className="text-sm mb-4" style={{ color: 'var(--white-60)' }}>
          Technologies are connected by prerequisite relationships. Root nodes (no prerequisites) are shown first.
        </p>
        <div className="space-y-6">
          {techTree.map(rootNode => (
            <TechTreeNode key={rootNode.tech.id} node={rootNode} level={0} />
          ))}
        </div>
      </Panel>

      {/* Tech Tree Legend */}
      <Panel title="Technology Categories">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold mb-2">Status</div>
            <div className="space-y-1" style={{ color: 'var(--white-60)' }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-cyan)' }} />
                <span>Deployed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-green)' }} />
                <span>Unlocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--white-30)' }} />
                <span>Locked</span>
              </div>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Categories</div>
            <div className="space-y-1" style={{ color: 'var(--white-60)' }}>
              <div>Alignment & Safety</div>
              <div>Energy & Climate</div>
              <div>Agriculture & Water</div>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Tiers</div>
            <div className="space-y-1" style={{ color: 'var(--white-60)' }}>
              <div>TIER 0: Deployed 2025</div>
              <div>TIER 1: Crisis Tech</div>
              <div>TIER 2: Mitigations</div>
              <div>TIER 3: Transformative</div>
              <div>TIER 4: Clarketech</div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}

/**
 * Recursive component to render a tech node and its children
 */
function TechTreeNode({ node, level }: { node: TechNode; level: number }) {
  const indentClass = level > 0 ? 'ml-8 border-l-2 border-white/10 pl-4' : ''

  return (
    <div className={indentClass}>
      {/* Tech Card */}
      <div
        className="flex items-center justify-between p-3 rounded mb-2"
        style={{
          backgroundColor: 'var(--color-near-black)',
          border: `1px solid ${node.isUnlocked ? 'var(--color-green)' : 'var(--white-10)'}`
        }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            {/* Status Indicator */}
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  node.deploymentLevel > 0 ? 'var(--color-cyan)' :
                  node.isUnlocked ? 'var(--color-green)' :
                  'var(--white-30)'
              }}
            />

            {/* Tech Name */}
            <div className="text-sm font-semibold">{node.tech.name}</div>
          </div>

          {/* Tech Description */}
          <div className="text-xs ml-6" style={{ color: 'var(--white-40)' }}>
            {node.tech.description}
          </div>

          {/* Prerequisites */}
          {node.tech.prerequisites.length > 0 && (
            <div className="text-xs mt-1 ml-6" style={{ color: 'var(--white-30)' }}>
              Prerequisites: {node.tech.prerequisites.join(', ')}
            </div>
          )}
        </div>

        {/* Deployment Progress */}
        {node.deploymentLevel > 0 && (
          <div className="w-32 ml-4">
            <div className="text-xs text-right mb-1" style={{ color: 'var(--white-60)' }}>
              {(node.deploymentLevel * 100).toFixed(0)}% deployed
            </div>
            <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${node.deploymentLevel * 100}%`,
                  backgroundColor: 'var(--color-cyan)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Render Children (technologies that depend on this one) */}
      {node.children.length > 0 && (
        <div className="mt-2">
          {node.children.map(child => (
            <TechTreeNode key={child.tech.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
