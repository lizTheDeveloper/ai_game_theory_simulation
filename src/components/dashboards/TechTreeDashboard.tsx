/**
 * Technology Tree Dashboard - Phase 6
 *
 * Displays 71 breakthrough technologies across 5 tiers.
 * Reference: /designs/08_tech_tree.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect, useMemo } from "react"

export function TechTreeDashboard() {
  const { currentState, loadCurrent } = useSimulation()

  useEffect(() => {
    loadCurrent()
  }, [])

  // Tech categories and placeholder data
  const techCategories = useMemo(() => {
    return [
      {
        tier: 0,
        name: 'TIER 0: Deployed 2025',
        description: 'Already deployed technologies',
        count: 11,
        technologies: [
          { id: 'rlhf', name: 'Basic RLHF', status: 'deployed', deployment: 0.95 },
          { id: 'mech_interp', name: 'Mechanistic Interpretability', status: 'deployed', deployment: 0.15 },
          { id: 'adversarial', name: 'Adversarial Evaluation', status: 'deployed', deployment: 0.40 },
          { id: 'compute_gov', name: 'Compute Governance', status: 'deployed', deployment: 0.25 },
          { id: 'dac', name: 'Direct Air Capture', status: 'deployed', deployment: 0.10 },
          { id: 'solar', name: 'Utility-Scale Solar', status: 'deployed', deployment: 0.85 },
          { id: 'wind', name: 'Offshore Wind', status: 'deployed', deployment: 0.65 },
        ]
      },
      {
        tier: 1,
        name: 'TIER 1: Planetary Crisis Tech',
        description: 'Addresses immediate planetary boundary crises',
        count: 18,
        technologies: [
          { id: 'phosphorus_recovery', name: 'Struvite Recovery', status: 'unlockable', deployment: 0 },
          { id: 'desalination', name: 'Advanced Desalination', status: 'unlockable', deployment: 0 },
          { id: 'pfas_remediation', name: 'PFAS Remediation', status: 'unlockable', deployment: 0 },
          { id: 'ocean_recovery', name: 'Ocean Alkalinity Enhancement', status: 'unlockable', deployment: 0 },
        ]
      },
      {
        tier: 2,
        name: 'TIER 2: Major Mitigations',
        description: 'Scalable oversight, economic systems, detection',
        count: 22,
        technologies: [
          { id: 'enhanced_ubi', name: 'Enhanced UBI', status: 'unlockable', deployment: 0 },
          { id: 'scalable_oversight', name: 'Scalable Oversight', status: 'unlockable', deployment: 0 },
          { id: 'grid_batteries', name: 'Grid-Scale Batteries', status: 'unlockable', deployment: 0 },
        ]
      },
      {
        tier: 3,
        name: 'TIER 3: Transformative',
        description: 'Fusion, disease elimination, longevity, AI rights',
        count: 15,
        technologies: [
          { id: 'fusion', name: 'Commercial Fusion', status: 'future', deployment: 0 },
          { id: 'disease_elim', name: 'Disease Elimination', status: 'future', deployment: 0 },
          { id: 'longevity', name: 'Longevity Breakthroughs', status: 'future', deployment: 0 },
          { id: 'ai_rights', name: 'AI Rights Framework', status: 'future', deployment: 0 },
        ]
      },
      {
        tier: 4,
        name: 'TIER 4: Clarketech',
        description: 'Nanotech, space industrialization, brain emulation',
        count: 5,
        technologies: [
          { id: 'nanotech', name: 'Molecular Nanotechnology', status: 'future', deployment: 0 },
          { id: 'space_industry', name: 'Space Industrialization', status: 'future', deployment: 0 },
          { id: 'brain_emulation', name: 'Brain Emulation', status: 'future', deployment: 0 },
        ]
      },
    ]
  }, [])

  const stats = useMemo(() => {
    const totalTech = techCategories.reduce((sum, cat) => sum + cat.count, 0)
    const deployedTier0 = techCategories[0]?.count || 0

    return {
      total: totalTech,
      deployed: deployedTier0,
      unlockable: techCategories[1]?.count + techCategories[2]?.count || 0,
      future: techCategories[3]?.count + techCategories[4]?.count || 0,
    }
  }, [techCategories])

  if (!currentState) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Technology Tree</h1>
        <p style={{ color: 'var(--white-40)' }}>
          71 Breakthrough Technologies Across 5 Tiers
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Technologies"
          value={stats.total}
          status="normal"
        />
        <MetricCard
          label="Deployed (TIER 0)"
          value={stats.deployed}
          status="normal"
        />
        <MetricCard
          label="Unlockable (TIER 1-2)"
          value={stats.unlockable}
          status="normal"
        />
        <MetricCard
          label="Future (TIER 3-4)"
          value={stats.future}
          status="normal"
        />
      </div>

      {/* Technology Tree by Tier */}
      {techCategories.map((category) => (
        <Panel
          key={category.tier}
          title={category.name}
          glow={category.tier === 0 ? 'cyan' : 'none'}
        >
          <p className="text-sm mb-4" style={{ color: 'var(--white-60)' }}>
            {category.description}
          </p>
          <div className="space-y-2">
            {category.technologies.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center justify-between p-3 rounded"
                style={{
                  backgroundColor: 'var(--color-near-black)',
                  border: '1px solid var(--white-10)'
                }}
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold mb-1">{tech.name}</div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--white-40)' }}>
                    <span>{tech.status === 'deployed' ? 'Deployed' : tech.status === 'unlockable' ? 'Unlockable' : 'Future'}</span>
                    {tech.status === 'deployed' && (
                      <>
                        <span>•</span>
                        <span>{(tech.deployment * 100).toFixed(0)}% deployed</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Deployment Bar */}
                {tech.status === 'deployed' && (
                  <div className="w-32">
                    <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${tech.deployment * 100}%`,
                          backgroundColor: 'var(--color-cyan)'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Indicator */}
                {tech.status !== 'deployed' && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: tech.status === 'unlockable'
                        ? 'var(--color-amber)'
                        : 'var(--white-30)'
                    }}
                  />
                )}
              </div>
            ))}

            {/* Show count if more techs exist */}
            {category.technologies.length < category.count && (
              <div className="text-xs text-center py-2" style={{ color: 'var(--white-40)' }}>
                + {category.count - category.technologies.length} more technologies
              </div>
            )}
          </div>
        </Panel>
      ))}

      {/* Research Investment */}
      {currentState.government && (
        <Panel title="Research & Development Investment">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>Alignment Research</div>
              <div className="text-3xl font-light mb-2">
                {currentState.government.alignmentResearchInvestment || 0}/10
              </div>
              <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                <div
                  className="h-full rounded"
                  style={{
                    width: `${((currentState.government.alignmentResearchInvestment || 0) / 10) * 100}%`,
                    backgroundColor: 'var(--color-cyan)'
                  }}
                />
              </div>
            </div>

            <div>
              <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>General R&D</div>
              <div className="text-3xl font-light mb-2">
                N/A
              </div>
              <div className="h-2 rounded" style={{ backgroundColor: 'var(--white-10)' }}>
                <div
                  className="h-full rounded"
                  style={{
                    width: '0%',
                    backgroundColor: 'var(--color-green)'
                  }}
                />
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Tech Tree Explanation */}
      <Panel title="Technology Development Pipeline">
        <div className="space-y-3 text-sm" style={{ color: 'var(--white-60)' }}>
          <p>
            <strong>TIER 0:</strong> Already deployed as of 2025. These technologies are being scaled up globally.
          </p>
          <p>
            <strong>TIER 1-2:</strong> Unlockable with sufficient AI capability and research investment. Required to address planetary boundary crises.
          </p>
          <p>
            <strong>TIER 3-4:</strong> Transformative and Clarketech technologies. Require breakthrough AI capabilities (cognitive, research, self-improvement dimensions).
          </p>
          <p>
            <strong>Deployment Timeline:</strong> Technologies take decades to deploy globally, even after research is complete. Speed depends on manufacturing capacity, infrastructure, and political will.
          </p>
        </div>
      </Panel>
    </div>
  )
}
