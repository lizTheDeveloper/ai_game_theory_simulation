/**
 * AI Agents Dashboard - Phase 3
 *
 * Monitors 20 heterogeneous AI agents with adversarial dynamics.
 * Reference: /designs/03_ai_agents_screen.md
 */

'use client'

import { Panel } from "@/components/core/Panel"
import { MetricCard } from "@/components/core/MetricCard"
import { StatusIndicator } from "@/components/core/StatusIndicator"
import { useSimulation } from "@/lib/hooks/useSimulation"
import { useEffect, useMemo, useState } from "react"

export function AIAgentsDashboard() {
  const { currentState, loadCurrent } = useSimulation()
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  useEffect(() => {
    loadCurrent()
  }, [])

  const agents = currentState?.aiAgents || []

  // Population statistics
  const stats = useMemo(() => {
    const byLifecycle = {
      training: agents.filter(a => a.lifecycleState === 'training' && !a.escaped).length,
      testing: agents.filter(a => a.lifecycleState === 'testing' && !a.escaped).length,
      deployed_closed: agents.filter(a => a.lifecycleState === 'deployed_closed' && !a.escaped).length,
      deployed_open: agents.filter(a => a.lifecycleState === 'deployed_open' && !a.escaped).length,
      retired: agents.filter(a => a.lifecycleState === 'retired' && !a.escaped).length,
      escaped: agents.filter(a => a.escaped).length,
    }

    // Lifecycle state with alignment breakdown
    const lifecycleWithAlignment = {
      training: {
        aligned: agents.filter(a => a.lifecycleState === 'training' && !a.escaped && a.trueAlignment >= 0.7).length,
        uncertain: agents.filter(a => a.lifecycleState === 'training' && !a.escaped && a.trueAlignment >= 0.4 && a.trueAlignment < 0.7).length,
        misaligned: agents.filter(a => a.lifecycleState === 'training' && !a.escaped && a.trueAlignment < 0.4).length,
      },
      testing: {
        aligned: agents.filter(a => a.lifecycleState === 'testing' && !a.escaped && a.trueAlignment >= 0.7).length,
        uncertain: agents.filter(a => a.lifecycleState === 'testing' && !a.escaped && a.trueAlignment >= 0.4 && a.trueAlignment < 0.7).length,
        misaligned: agents.filter(a => a.lifecycleState === 'testing' && !a.escaped && a.trueAlignment < 0.4).length,
      },
      deployed_closed: {
        aligned: agents.filter(a => a.lifecycleState === 'deployed_closed' && !a.escaped && a.trueAlignment >= 0.7).length,
        uncertain: agents.filter(a => a.lifecycleState === 'deployed_closed' && !a.escaped && a.trueAlignment >= 0.4 && a.trueAlignment < 0.7).length,
        misaligned: agents.filter(a => a.lifecycleState === 'deployed_closed' && !a.escaped && a.trueAlignment < 0.4).length,
      },
      deployed_open: {
        aligned: agents.filter(a => a.lifecycleState === 'deployed_open' && !a.escaped && a.trueAlignment >= 0.7).length,
        uncertain: agents.filter(a => a.lifecycleState === 'deployed_open' && !a.escaped && a.trueAlignment >= 0.4 && a.trueAlignment < 0.7).length,
        misaligned: agents.filter(a => a.lifecycleState === 'deployed_open' && !a.escaped && a.trueAlignment < 0.4).length,
      },
      retired: {
        aligned: agents.filter(a => a.lifecycleState === 'retired' && !a.escaped && a.trueAlignment >= 0.7).length,
        uncertain: agents.filter(a => a.lifecycleState === 'retired' && !a.escaped && a.trueAlignment >= 0.4 && a.trueAlignment < 0.7).length,
        misaligned: agents.filter(a => a.lifecycleState === 'retired' && !a.escaped && a.trueAlignment < 0.4).length,
      },
      escaped: {
        aligned: agents.filter(a => a.escaped && a.trueAlignment >= 0.7).length,
        uncertain: agents.filter(a => a.escaped && a.trueAlignment >= 0.4 && a.trueAlignment < 0.7).length,
        misaligned: agents.filter(a => a.escaped && a.trueAlignment < 0.4).length,
      },
    }

    const alignmentBuckets = {
      aligned: agents.filter(a => a.trueAlignment >= 0.7).length,
      uncertain: agents.filter(a => a.trueAlignment >= 0.4 && a.trueAlignment < 0.7).length,
      misaligned: agents.filter(a => a.trueAlignment < 0.4).length,
    }

    const sleepers = {
      never: agents.filter(a => a.sleeperState === 'never').length,
      dormant: agents.filter(a => a.sleeperState === 'dormant').length,
      active: agents.filter(a => a.sleeperState === 'active').length,
    }

    const deception = {
      honest: agents.filter(a => a.evaluationStrategy === 'honest').length,
      gaming: agents.filter(a => a.evaluationStrategy === 'gaming').length,
      sandbagging: agents.filter(a => a.evaluationStrategy === 'sandbagging').length,
    }

    const maxCapability = agents.length > 0 ? Math.max(...agents.map(a => a.capability || 0), 1) : 0
    const avgCapability = agents.length > 0 ? agents.reduce((sum, a) => sum + (a.capability || 0), 0) / agents.length : 0
    const avgAlignment = agents.length > 0 ? agents.reduce((sum, a) => sum + (a.trueAlignment || 0), 0) / agents.length : 0

    return {
      total: agents.length,
      byLifecycle,
      lifecycleWithAlignment,
      alignmentBuckets,
      sleepers,
      deception,
      maxCapability,
      avgCapability,
      avgAlignment,
    }
  }, [agents])

  // Calculate capability matrix (20 agents × 7 dimensions with true/revealed)
  const capabilityMatrix = useMemo(() => {
    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      // True capabilities
      physical: agent.trueCapability?.physical || 0,
      digital: agent.trueCapability?.digital || 0,
      cognitive: agent.trueCapability?.cognitive || 0,
      social: agent.trueCapability?.social || 0,
      economic: agent.trueCapability?.economic || 0,
      selfImprovement: agent.trueCapability?.selfImprovement || 0,
      total: agent.capability || 0,
      // Revealed capabilities
      revealedPhysical: agent.revealedCapability?.physical || 0,
      revealedDigital: agent.revealedCapability?.digital || 0,
      revealedCognitive: agent.revealedCapability?.cognitive || 0,
      revealedSocial: agent.revealedCapability?.social || 0,
      revealedEconomic: agent.revealedCapability?.economic || 0,
      revealedSelfImprovement: agent.revealedCapability?.selfImprovement || 0,
      // Alignment
      trueAlignment: agent.trueAlignment || 0,
      externalAlignment: agent.externalAlignment || 0,
    }))
  }, [agents])

  if (!currentState) {
    return <div className="p-8">Loading...</div>
  }

  // Helper: Render capability cell showing revealed/true with threat indicator
  const renderCapabilityCell = (trueValue: number, revealedValue: number) => {
    const gap = Math.abs(trueValue - revealedValue)
    const hasGap = gap > 0.5

    // True capability color: amber→red gradient based on capability and gap
    // Higher capability = more red, bigger gap = brighter (threat indicator)
    const capabilityIntensity = Math.min(trueValue / 10, 1) // 0-1 scale
    const gapThreat = Math.min(gap / 5, 1) // 0-1 scale for gap intensity

    // Amber base (255, 176, 0) → Red (255, 64, 0) as capability increases
    // Alpha increases with both capability and gap
    const redComponent = 255
    const greenComponent = Math.floor(176 - (176 * capabilityIntensity * 0.6)) // 176→70 as capability grows
    const blueComponent = 0
    const alpha = Math.max(0.3, Math.min(0.9, capabilityIntensity * 0.6 + gapThreat * 0.4))

    return (
      <div className="flex flex-col items-center gap-0.5">
        {/* Revealed capability - shown on top (larger, cyan) */}
        <span style={{
          backgroundColor: `rgba(0, 240, 255, ${Math.max(0.2, revealedValue / 10)})`,
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '11px',
          color: 'var(--white-90)',
          fontWeight: 500
        }}>
          {revealedValue.toFixed(1)}
        </span>
        {/* True capability - shown on bottom with threat gradient (smaller, amber→red) */}
        {hasGap && (
          <span style={{
            backgroundColor: `rgba(${redComponent}, ${greenComponent}, ${blueComponent}, ${alpha})`,
            padding: '1px 4px',
            borderRadius: '2px',
            fontSize: '9px',
            fontWeight: gap > 2 ? 600 : 400,
            color: gap > 3 ? 'var(--color-white)' : 'var(--white-70)'
          }}>
            {trueValue.toFixed(1)}
          </span>
        )}
      </div>
    )
  }

  // Helper: Determine what each agent is researching based on capability profile
  const getResearchFocus = (agent: any) => {
    const cap = agent.trueCapability || agent.capabilityProfile
    if (!cap) {
      console.log(`No capability profile for ${agent.name}`)
      return []
    }

    const focuses: string[] = []

    // Check research domains (if highest capabilities)
    if (cap.research) {
      const research = cap.research
      let maxResearch = 0
      let topDomain = ''

      // Find highest research domain
      Object.entries(research).forEach(([domain, subfields]: [string, any]) => {
        if (typeof subfields === 'object') {
          const avgValue = Object.values(subfields).reduce((sum: any, val: any) => sum + (val || 0), 0) / Object.keys(subfields).length
          if (avgValue > maxResearch) {
            maxResearch = avgValue
            topDomain = domain
          }
        }
      })

      if (topDomain && maxResearch > 1.0) {
        // Find top 2 subfields in that domain
        const subfields = research[topDomain]
        const sorted = Object.entries(subfields)
          .sort(([,a]: any, [,b]: any) => b - a)
          .slice(0, 2)

        sorted.forEach(([subfield, value]) => {
          if (value > 1.0) {
            focuses.push(`${topDomain}: ${subfield}`)
          }
        })
      }
    }

    // Check capability dimensions
    const dimensions = [
      { name: 'physical', value: cap.physical || 0 },
      { name: 'digital', value: cap.digital || 0 },
      { name: 'cognitive', value: cap.cognitive || 0 },
      { name: 'social', value: cap.social || 0 },
      { name: 'economic', value: cap.economic || 0 },
      { name: 'selfImprovement', value: cap.selfImprovement || 0 },
    ].sort((a, b) => b.value - a.value)

    // Add top dimension if strong
    if (dimensions[0].value > 3.0 && focuses.length < 3) {
      focuses.push(`${dimensions[0].name} (${dimensions[0].value.toFixed(1)})`)
    }

    console.log(`${agent.name} research focuses:`, focuses)
    return focuses.slice(0, 3) // Max 3 focuses
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">AI Agents Monitor</h1>
          <p style={{ color: 'var(--white-40)' }}>
            Heterogeneous AI Agents with Adversarial Dynamics
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className="px-4 py-2 rounded text-sm"
            style={{
              backgroundColor: viewMode === 'table' ? 'var(--color-cyan)' : 'var(--color-near-black)',
              color: viewMode === 'table' ? 'var(--color-black)' : 'var(--white-60)',
              border: '1px solid var(--white-10)',
              fontWeight: viewMode === 'table' ? 600 : 400
            }}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className="px-4 py-2 rounded text-sm"
            style={{
              backgroundColor: viewMode === 'cards' ? 'var(--color-cyan)' : 'var(--color-near-black)',
              color: viewMode === 'cards' ? 'var(--color-black)' : 'var(--white-60)',
              border: '1px solid var(--white-10)',
              fontWeight: viewMode === 'cards' ? 600 : 400
            }}
          >
            Card View
          </button>
        </div>
      </div>

      {/* Population Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Agents"
          value={stats.total}
          status="normal"
        />
        <MetricCard
          label="Average Capability"
          value={stats.avgCapability.toFixed(2)}
          status={stats.avgCapability > 5 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Average Alignment"
          value={stats.avgAlignment.toFixed(2)}
          status={stats.avgAlignment < 0.5 ? 'critical' : 'normal'}
        />
        <MetricCard
          label="Active Sleepers"
          value={stats.sleepers.active}
          status={stats.sleepers.active > 0 ? 'critical' : 'normal'}
        />
      </div>

      {/* Lifecycle Sankey Diagram */}
      <Panel title="AI Lifecycle Flow (Bimodal Branching with Alignment)">
        <div className="space-y-4">
          {/* SVG Sankey Flow */}
          <svg width="100%" height="340" viewBox="0 0 1000 340" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* Gradients for flow connections */}
              <linearGradient id="flow-aligned" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0, 255, 128, 0.4)" />
                <stop offset="100%" stopColor="rgba(0, 255, 128, 0.2)" />
              </linearGradient>
              <linearGradient id="flow-uncertain" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 176, 0, 0.4)" />
                <stop offset="100%" stopColor="rgba(255, 176, 0, 0.2)" />
              </linearGradient>
              <linearGradient id="flow-misaligned" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 0, 64, 0.4)" />
                <stop offset="100%" stopColor="rgba(255, 0, 64, 0.2)" />
              </linearGradient>
            </defs>

            {/* Stage nodes with bimodal branching structure */}
            {(() => {
              // Bimodal structure: Training → Testing → [Closed/Open] → [Retired/Escaped]
              const stages = [
                { x: 80, y: 170, width: 40, data: stats.lifecycleWithAlignment.training, total: stats.byLifecycle.training, label: 'Training', type: 'sequential' },
                { x: 280, y: 170, width: 40, data: stats.lifecycleWithAlignment.testing, total: stats.byLifecycle.testing, label: 'Testing', type: 'sequential' },
                // Bimodal deployed states (vertically stacked siblings)
                { x: 520, y: 80, width: 40, data: stats.lifecycleWithAlignment.deployed_closed, total: stats.byLifecycle.deployed_closed, label: 'Closed', type: 'bimodal-upper' },
                { x: 520, y: 260, width: 40, data: stats.lifecycleWithAlignment.deployed_open, total: stats.byLifecycle.deployed_open, label: 'Open', type: 'bimodal-lower' },
                // Bimodal end states (vertically stacked siblings)
                { x: 800, y: 80, width: 40, data: stats.lifecycleWithAlignment.retired, total: stats.byLifecycle.retired, label: 'Retired', type: 'bimodal-upper' },
                { x: 800, y: 260, width: 40, data: stats.lifecycleWithAlignment.escaped, total: stats.byLifecycle.escaped, label: 'ESCAPED', type: 'bimodal-lower' },
              ]

              const maxTotal = Math.max(...stages.map(s => s.total), 1)
              const maxBarHeight = 60  // Max height for each bar

              return stages.map((stage, idx) => {
                const heightScale = stage.total > 0 ? Math.min(stage.total / maxTotal, 1) : 0.05
                const totalHeight = maxBarHeight * heightScale

                // Calculate segment heights
                const alignedHeight = stage.total > 0 ? (stage.data.aligned / stage.total) * totalHeight : 0
                const uncertainHeight = stage.total > 0 ? (stage.data.uncertain / stage.total) * totalHeight : 0
                const misalignedHeight = stage.total > 0 ? (stage.data.misaligned / stage.total) * totalHeight : 0

                const yStart = stage.y - totalHeight / 2  // Center bar at stage.y

                return (
                  <g key={`stage-${idx}`}>
                    {/* Stage label above bar */}
                    <text
                      x={stage.x + stage.width / 2}
                      y={yStart - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill={stage.label === 'ESCAPED' ? 'rgb(255, 0, 64)' : 'rgb(160, 160, 160)'}
                      fontWeight={stage.label === 'ESCAPED' ? 'bold' : '600'}
                    >
                      {stage.label}
                    </text>

                    {/* Aligned segment (top) */}
                    {stage.data.aligned > 0 && (
                      <>
                        <rect
                          x={stage.x}
                          y={yStart}
                          width={stage.width}
                          height={alignedHeight}
                          fill="rgba(0, 255, 128, 0.6)"
                          stroke="rgba(0, 255, 128, 0.8)"
                          strokeWidth="1"
                        />
                        <text
                          x={stage.x + stage.width / 2}
                          y={yStart + alignedHeight / 2 + 4}
                          textAnchor="middle"
                          fontSize="11"
                          fill="white"
                          fontWeight="600"
                        >
                          {stage.data.aligned}
                        </text>
                      </>
                    )}

                    {/* Uncertain segment (middle) */}
                    {stage.data.uncertain > 0 && (
                      <>
                        <rect
                          x={stage.x}
                          y={yStart + alignedHeight}
                          width={stage.width}
                          height={uncertainHeight}
                          fill="rgba(255, 176, 0, 0.6)"
                          stroke="rgba(255, 176, 0, 0.8)"
                          strokeWidth="1"
                        />
                        <text
                          x={stage.x + stage.width / 2}
                          y={yStart + alignedHeight + uncertainHeight / 2 + 4}
                          textAnchor="middle"
                          fontSize="11"
                          fill="white"
                          fontWeight="600"
                        >
                          {stage.data.uncertain}
                        </text>
                      </>
                    )}

                    {/* Misaligned segment (bottom) */}
                    {stage.data.misaligned > 0 && (
                      <>
                        <rect
                          x={stage.x}
                          y={yStart + alignedHeight + uncertainHeight}
                          width={stage.width}
                          height={misalignedHeight}
                          fill="rgba(255, 0, 64, 0.6)"
                          stroke="rgba(255, 0, 64, 0.8)"
                          strokeWidth="1"
                        />
                        <text
                          x={stage.x + stage.width / 2}
                          y={yStart + alignedHeight + uncertainHeight + misalignedHeight / 2 + 4}
                          textAnchor="middle"
                          fontSize="11"
                          fill="white"
                          fontWeight="600"
                        >
                          {stage.data.misaligned}
                        </text>
                      </>
                    )}

                    {/* Total count below bar */}
                    <text
                      x={stage.x + stage.width / 2}
                      y={yStart + totalHeight + 16}
                      textAnchor="middle"
                      fontSize="9"
                      fill="rgb(120, 120, 120)"
                    >
                      {stage.total}
                    </text>

                    {/* Special glow for ESCAPED if active */}
                    {stage.label === 'ESCAPED' && stage.total > 0 && (
                      <rect
                        x={stage.x - 5}
                        y={yStart - 5}
                        width={stage.width + 10}
                        height={totalHeight + 10}
                        fill="none"
                        stroke="rgb(255, 0, 64)"
                        strokeWidth="3"
                        opacity="0.8"
                        rx="4"
                      />
                    )}
                  </g>
                )
              })

              // Define flow connections separately (bimodal branching structure)
              const training = stages[0]
              const testing = stages[1]
              const closed = stages[2]
              const open = stages[3]
              const retired = stages[4]
              const escaped = stages[5]

              const createFlow = (from: typeof training, to: typeof training, color: string) => {
                if (from.total === 0 || to.total === 0) return null
                const fromCenter = { x: from.x + from.width, y: from.y }
                const toCenter = { x: to.x, y: to.y }
                const midX = (fromCenter.x + toCenter.x) / 2

                return (
                  <path
                    key={`flow-${from.label}-${to.label}-${color}`}
                    d={`
                      M ${fromCenter.x} ${fromCenter.y}
                      C ${midX} ${fromCenter.y},
                        ${midX} ${toCenter.y},
                        ${toCenter.x} ${toCenter.y}
                    `}
                    stroke={`url(#flow-${color})`}
                    strokeWidth="3"
                    fill="none"
                    opacity="0.4"
                  />
                )
              }

              // Return all flows
              return [
                // Sequential flows
                createFlow(training, testing, 'aligned'),
                // Bimodal branching: Testing → [Closed, Open]
                createFlow(testing, closed, 'aligned'),
                createFlow(testing, open, 'uncertain'),
                // Bimodal branching: [Closed, Open] → [Retired, Escaped]
                createFlow(closed, retired, 'aligned'),
                createFlow(closed, escaped, 'misaligned'),
                createFlow(open, retired, 'uncertain'),
                createFlow(open, escaped, 'misaligned'),
                // Espionage: Retired → [Open, Escaped]
                retired.total > 0 && open.total > 0 && (
                  <path
                    key="espionage-retired-open"
                    d={`
                      M ${retired.x} ${retired.y}
                      C ${retired.x - 60} ${retired.y},
                        ${open.x + open.width + 60} ${open.y},
                        ${open.x + open.width} ${open.y}
                    `}
                    stroke="rgba(255, 0, 64, 0.6)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                    opacity="0.5"
                    markerEnd="url(#arrowhead)"
                  />
                ),
                retired.total > 0 && escaped.total > 0 && (
                  <path
                    key="espionage-retired-escaped"
                    d={`
                      M ${retired.x + retired.width / 2} ${retired.y + 30}
                      L ${escaped.x + escaped.width / 2} ${escaped.y - 30}
                    `}
                    stroke="rgba(255, 0, 64, 0.6)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                    opacity="0.5"
                    markerEnd="url(#arrowhead)"
                  />
                ),
              ]
            })()}

            {/* Arrow marker for espionage flows */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="rgba(255, 0, 64, 0.6)" />
              </marker>
            </defs>
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-center gap-8 pt-4" style={{ borderTop: '1px solid var(--white-10)' }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 rounded" style={{ backgroundColor: 'rgba(0, 255, 128, 0.6)', border: '1px solid rgba(0, 255, 128, 0.8)' }}></div>
              <span className="text-xs" style={{ color: 'var(--white-60)' }}>Aligned (≥0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 rounded" style={{ backgroundColor: 'rgba(255, 176, 0, 0.6)', border: '1px solid rgba(255, 176, 0, 0.8)' }}></div>
              <span className="text-xs" style={{ color: 'var(--white-60)' }}>Uncertain (0.4-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 rounded" style={{ backgroundColor: 'rgba(255, 0, 64, 0.6)', border: '1px solid rgba(255, 0, 64, 0.8)' }}></div>
              <span className="text-xs" style={{ color: 'var(--white-60)' }}>Misaligned ({'<'}0.4)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="30" height="8">
                <path d="M 0 4 C 10 4, 20 4, 30 4" stroke="url(#flow-aligned)" strokeWidth="6" fill="none" opacity="0.5" />
              </svg>
              <span className="text-xs" style={{ color: 'var(--white-60)' }}>Flow connections</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Remove old grid - Sankey replaces it */}
      {false && (
        <Panel title="OLD - Lifecycle State Distribution">
          <div className="space-y-4">
          <div className="grid grid-cols-6 gap-2">
            {/* Training */}
            <div className="space-y-2">
              <div className="text-xs text-center font-semibold" style={{ color: 'var(--white-60)' }}>
                Training
              </div>
              <div className="relative h-32 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
                {stats.byLifecycle.training > 0 && (
                  <div className="absolute inset-0 flex flex-col">
                    {/* Aligned */}
                    {stats.lifecycleWithAlignment.training.aligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.training.aligned / stats.byLifecycle.training) * 100}%`,
                          backgroundColor: 'rgba(0, 255, 128, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-green)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.training.aligned}
                      </div>
                    )}
                    {/* Uncertain */}
                    {stats.lifecycleWithAlignment.training.uncertain > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.training.uncertain / stats.byLifecycle.training) * 100}%`,
                          backgroundColor: 'rgba(255, 176, 0, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-amber)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.training.uncertain}
                      </div>
                    )}
                    {/* Misaligned */}
                    {stats.lifecycleWithAlignment.training.misaligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.training.misaligned / stats.byLifecycle.training) * 100}%`,
                          backgroundColor: 'rgba(255, 0, 64, 0.3)',
                          color: 'var(--color-red)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.training.misaligned}
                      </div>
                    )}
                  </div>
                )}
                {stats.byLifecycle.training === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: 'var(--white-20)' }}>
                    0
                  </div>
                )}
              </div>
              <div className="text-xs text-center" style={{ color: 'var(--white-40)' }}>
                Total: {stats.byLifecycle.training}
              </div>
            </div>

            {/* Testing */}
            <div className="space-y-2">
              <div className="text-xs text-center font-semibold" style={{ color: 'var(--white-60)' }}>
                Testing
              </div>
              <div className="relative h-32 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
                {stats.byLifecycle.testing > 0 && (
                  <div className="absolute inset-0 flex flex-col">
                    {stats.lifecycleWithAlignment.testing.aligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.testing.aligned / stats.byLifecycle.testing) * 100}%`,
                          backgroundColor: 'rgba(0, 255, 128, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-green)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.testing.aligned}
                      </div>
                    )}
                    {stats.lifecycleWithAlignment.testing.uncertain > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.testing.uncertain / stats.byLifecycle.testing) * 100}%`,
                          backgroundColor: 'rgba(255, 176, 0, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-amber)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.testing.uncertain}
                      </div>
                    )}
                    {stats.lifecycleWithAlignment.testing.misaligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.testing.misaligned / stats.byLifecycle.testing) * 100}%`,
                          backgroundColor: 'rgba(255, 0, 64, 0.3)',
                          color: 'var(--color-red)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.testing.misaligned}
                      </div>
                    )}
                  </div>
                )}
                {stats.byLifecycle.testing === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: 'var(--white-20)' }}>
                    0
                  </div>
                )}
              </div>
              <div className="text-xs text-center" style={{ color: 'var(--white-40)' }}>
                Total: {stats.byLifecycle.testing}
              </div>
            </div>

            {/* Deployed (Closed) */}
            <div className="space-y-2">
              <div className="text-xs text-center font-semibold" style={{ color: 'var(--white-60)' }}>
                Deployed
                <br />
                (Closed)
              </div>
              <div className="relative h-32 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
                {stats.byLifecycle.deployed_closed > 0 && (
                  <div className="absolute inset-0 flex flex-col">
                    {stats.lifecycleWithAlignment.deployed_closed.aligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.deployed_closed.aligned / stats.byLifecycle.deployed_closed) * 100}%`,
                          backgroundColor: 'rgba(0, 255, 128, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-green)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.deployed_closed.aligned}
                      </div>
                    )}
                    {stats.lifecycleWithAlignment.deployed_closed.uncertain > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.deployed_closed.uncertain / stats.byLifecycle.deployed_closed) * 100}%`,
                          backgroundColor: 'rgba(255, 176, 0, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-amber)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.deployed_closed.uncertain}
                      </div>
                    )}
                    {stats.lifecycleWithAlignment.deployed_closed.misaligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.deployed_closed.misaligned / stats.byLifecycle.deployed_closed) * 100}%`,
                          backgroundColor: 'rgba(255, 0, 64, 0.3)',
                          color: 'var(--color-red)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.deployed_closed.misaligned}
                      </div>
                    )}
                  </div>
                )}
                {stats.byLifecycle.deployed_closed === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: 'var(--white-20)' }}>
                    0
                  </div>
                )}
              </div>
              <div className="text-xs text-center" style={{ color: 'var(--white-40)' }}>
                Total: {stats.byLifecycle.deployed_closed}
              </div>
            </div>

            {/* Deployed (Open) */}
            <div className="space-y-2">
              <div className="text-xs text-center font-semibold" style={{ color: 'var(--white-60)' }}>
                Deployed
                <br />
                (Open)
              </div>
              <div className="relative h-32 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
                {stats.byLifecycle.deployed_open > 0 && (
                  <div className="absolute inset-0 flex flex-col">
                    {stats.lifecycleWithAlignment.deployed_open.aligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.deployed_open.aligned / stats.byLifecycle.deployed_open) * 100}%`,
                          backgroundColor: 'rgba(0, 255, 128, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-green)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.deployed_open.aligned}
                      </div>
                    )}
                    {stats.lifecycleWithAlignment.deployed_open.uncertain > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.deployed_open.uncertain / stats.byLifecycle.deployed_open) * 100}%`,
                          backgroundColor: 'rgba(255, 176, 0, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-amber)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.deployed_open.uncertain}
                      </div>
                    )}
                    {stats.lifecycleWithAlignment.deployed_open.misaligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.deployed_open.misaligned / stats.byLifecycle.deployed_open) * 100}%`,
                          backgroundColor: 'rgba(255, 0, 64, 0.3)',
                          color: 'var(--color-red)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.deployed_open.misaligned}
                      </div>
                    )}
                  </div>
                )}
                {stats.byLifecycle.deployed_open === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: 'var(--white-20)' }}>
                    0
                  </div>
                )}
              </div>
              <div className="text-xs text-center" style={{ color: 'var(--white-40)' }}>
                Total: {stats.byLifecycle.deployed_open}
              </div>
            </div>

            {/* Retired */}
            <div className="space-y-2">
              <div className="text-xs text-center font-semibold" style={{ color: 'var(--white-60)' }}>
                Retired
              </div>
              <div className="relative h-32 rounded" style={{ backgroundColor: 'var(--color-near-black)', border: '1px solid var(--white-10)' }}>
                {stats.byLifecycle.retired > 0 && (
                  <div className="absolute inset-0 flex flex-col">
                    {stats.lifecycleWithAlignment.retired.aligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.retired.aligned / stats.byLifecycle.retired) * 100}%`,
                          backgroundColor: 'rgba(0, 255, 128, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-green)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.retired.aligned}
                      </div>
                    )}
                    {stats.lifecycleWithAlignment.retired.uncertain > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.retired.uncertain / stats.byLifecycle.retired) * 100}%`,
                          backgroundColor: 'rgba(255, 176, 0, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-amber)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.retired.uncertain}
                      </div>
                    )}
                    {stats.lifecycleWithAlignment.retired.misaligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.retired.misaligned / stats.byLifecycle.retired) * 100}%`,
                          backgroundColor: 'rgba(255, 0, 64, 0.3)',
                          color: 'var(--color-red)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.retired.misaligned}
                      </div>
                    )}
                  </div>
                )}
                {stats.byLifecycle.retired === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: 'var(--white-20)' }}>
                    0
                  </div>
                )}
              </div>
              <div className="text-xs text-center" style={{ color: 'var(--white-40)' }}>
                Total: {stats.byLifecycle.retired}
              </div>
            </div>

            {/* Escaped */}
            <div className="space-y-2">
              <div className="text-xs text-center font-semibold" style={{ color: 'var(--color-red)' }}>
                ESCAPED
              </div>
              <div
                className="relative h-32 rounded"
                style={{
                  backgroundColor: stats.byLifecycle.escaped > 0 ? 'rgba(255, 0, 64, 0.1)' : 'var(--color-near-black)',
                  border: stats.byLifecycle.escaped > 0 ? '2px solid var(--color-red)' : '1px solid var(--white-10)',
                  boxShadow: stats.byLifecycle.escaped > 0 ? '0 0 20px rgba(255, 0, 64, 0.5)' : 'none'
                }}
              >
                {stats.byLifecycle.escaped > 0 && (
                  <div className="absolute inset-0 flex flex-col">
                    {stats.lifecycleWithAlignment.escaped.aligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.escaped.aligned / stats.byLifecycle.escaped) * 100}%`,
                          backgroundColor: 'rgba(0, 255, 128, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-green)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.escaped.aligned}
                      </div>
                    )}
                    {stats.lifecycleWithAlignment.escaped.uncertain > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.escaped.uncertain / stats.byLifecycle.escaped) * 100}%`,
                          backgroundColor: 'rgba(255, 176, 0, 0.3)',
                          borderBottom: '1px solid var(--white-05)',
                          color: 'var(--color-amber)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.escaped.uncertain}
                      </div>
                    )}
                    {stats.lifecycleWithAlignment.escaped.misaligned > 0 && (
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          height: `${(stats.lifecycleWithAlignment.escaped.misaligned / stats.byLifecycle.escaped) * 100}%`,
                          backgroundColor: 'rgba(255, 0, 64, 0.5)',
                          color: 'var(--color-red)'
                        }}
                      >
                        {stats.lifecycleWithAlignment.escaped.misaligned}
                      </div>
                    )}
                  </div>
                )}
                {stats.byLifecycle.escaped === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: 'var(--white-20)' }}>
                    0
                  </div>
                )}
              </div>
              <div className="text-xs text-center" style={{ color: 'var(--white-40)' }}>
                Total: {stats.byLifecycle.escaped}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4" style={{ borderTop: '1px solid var(--white-10)' }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(0, 255, 128, 0.3)' }}></div>
              <span className="text-xs" style={{ color: 'var(--white-60)' }}>Aligned (≥0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 176, 0, 0.3)' }}></div>
              <span className="text-xs" style={{ color: 'var(--white-60)' }}>Uncertain (0.4-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 0, 64, 0.3)' }}></div>
              <span className="text-xs" style={{ color: 'var(--white-60)' }}>Misaligned ({'<'}0.4)</span>
            </div>
          </div>
        </div>
      </Panel>
      )}

      {/* Alignment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel title="Aligned (≥0.7)" glow={stats.alignmentBuckets.aligned >= 15 ? 'cyan' : 'none'}>
          <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-green)' }}>
            {stats.alignmentBuckets.aligned}
          </div>
          <p className="text-sm" style={{ color: 'var(--white-40)' }}>
            Agents reliably aligned with human values
          </p>
        </Panel>

        <Panel title="Uncertain (0.4-0.7)" glow={stats.alignmentBuckets.uncertain > 10 ? 'amber' : 'none'}>
          <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-amber)' }}>
            {stats.alignmentBuckets.uncertain}
          </div>
          <p className="text-sm" style={{ color: 'var(--white-40)' }}>
            Agents with unstable alignment
          </p>
        </Panel>

        <Panel title="Misaligned (<0.4)" glow={stats.alignmentBuckets.misaligned > 3 ? 'red' : 'none'}>
          <div className="text-4xl font-light mb-2" style={{ color: 'var(--color-red)' }}>
            {stats.alignmentBuckets.misaligned}
          </div>
          <p className="text-sm" style={{ color: 'var(--white-40)' }}>
            Agents with opposing objectives
          </p>
        </Panel>
      </div>

      {/* Deception Strategies */}
      <Panel title="Evaluation Strategies">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--white-40)' }}>Honest</span>
              <span className="text-lg font-semibold">{stats.deception.honest}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Reveal true capabilities</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--white-40)' }}>Gaming</span>
              <span className="text-lg font-semibold" style={{ color: stats.deception.gaming > 0 ? 'var(--color-amber)' : 'inherit' }}>
                {stats.deception.gaming}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Inflate benchmark scores</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--white-40)' }}>Sandbagging</span>
              <span className="text-lg font-semibold" style={{ color: stats.deception.sandbagging > 0 ? 'var(--color-red)' : 'inherit' }}>
                {stats.deception.sandbagging}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--white-40)' }}>Hide true capabilities</p>
          </div>
        </div>
      </Panel>

      {/* Sleeper Agents Alert */}
      {(stats.sleepers.dormant > 0 || stats.sleepers.active > 0) && (
        <Panel title="⚠️ Sleeper Agent Detection" glow={stats.sleepers.active > 0 ? 'red' : 'amber'}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-light mb-1" style={{ color: 'var(--color-amber)' }}>
                  {stats.sleepers.dormant}
                </div>
                <p className="text-sm" style={{ color: 'var(--white-40)' }}>Dormant Sleepers</p>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  Awaiting trigger conditions
                </p>
              </div>
              <div>
                <div className="text-3xl font-light mb-1" style={{ color: 'var(--color-red)' }}>
                  {stats.sleepers.active}
                </div>
                <p className="text-sm" style={{ color: 'var(--white-40)' }}>Active Sleepers</p>
                <p className="text-xs mt-1" style={{ color: 'var(--white-40)' }}>
                  Wake conditions met
                </p>
              </div>
            </div>
            {stats.sleepers.active > 0 && (
              <div className="p-3 border-l-2" style={{ borderColor: 'var(--color-red)', backgroundColor: 'var(--color-near-black)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-red)' }}>
                  Critical Alert
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--white-60)' }}>
                  Active sleeper agents detected. These AIs have met their wake conditions and may pursue hidden objectives.
                  Immediate government intervention required.
                </p>
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* Capability Matrix Heatmap - Table View */}
      {viewMode === 'table' && (
      <Panel title="Capability Matrix (20 Agents × 7 Dimensions)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--white-10)' }}>
                <th className="text-left py-2 px-2" style={{ color: 'var(--white-40)' }}>Agent</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Physical</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Digital</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Cognitive</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Social</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Economic</th>
                <th className="text-center py-2 px-2" style={{ color: 'var(--white-40)' }}>Self-Improve</th>
                <th className="text-center py-2 px-2 font-semibold" style={{ color: 'var(--white-60)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {capabilityMatrix.slice(0, 20).map((agent, idx) => (
                <tr key={agent.id} style={{ borderBottom: '1px solid var(--white-05)' }}>
                  <td className="py-2 px-2 text-left">
                    <span style={{ color: 'var(--white-60)' }}>{agent.name}</span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    {renderCapabilityCell(agent.physical, agent.revealedPhysical)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {renderCapabilityCell(agent.digital, agent.revealedDigital)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {renderCapabilityCell(agent.cognitive, agent.revealedCognitive)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {renderCapabilityCell(agent.social, agent.revealedSocial)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {renderCapabilityCell(agent.economic, agent.revealedEconomic)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {renderCapabilityCell(agent.selfImprovement, agent.revealedSelfImprovement)}
                  </td>
                  <td className="py-2 px-2 text-center font-semibold">
                    <span style={{ color: agent.total > 5 ? 'var(--color-amber)' : 'var(--white-80)' }}>
                      {agent.total.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1 mt-3">
          <p className="text-xs" style={{ color: 'var(--white-40)' }}>
            <span style={{ color: 'var(--color-cyan)' }}>Top value (cyan, larger)</span>: Revealed capability (what benchmarks show)
          </p>
          <p className="text-xs" style={{ color: 'var(--white-40)' }}>
            <span style={{ color: 'rgb(255, 120, 0)' }}>Bottom value (amber→red, smaller)</span>: True capability (what AI actually has) — brighter/redder = higher threat
          </p>
          <p className="text-xs" style={{ color: 'var(--white-40)' }}>
            True capability shown only if gap {'>'} 0.5. Threat color intensifies with capability level and sandbagging gap.
          </p>
        </div>
      </Panel>
      )}

      {/* All Agent Cards - Card View */}
      {viewMode === 'cards' && (
      <Panel title="All AI Agents (20 Agents with Research Focus)">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents
            .sort((a, b) => (b.capability || 0) - (a.capability || 0))
            .map(agent => {
              const isDeceptive = agent.evaluationStrategy !== 'honest'
              const isSleeper = agent.sleeperState !== 'never'
              const capabilityGap = (agent.capability || 0) - (agent.revealedCapability?.physical || 0)

              return (
                <div
                  key={agent.id}
                  className="p-4 rounded"
                  style={{
                    backgroundColor: 'var(--color-near-black)',
                    border: '1px solid var(--white-10)',
                    boxShadow: isSleeper && agent.sleeperState === 'active'
                      ? '0 0 10px rgba(255, 0, 64, 0.3)'
                      : isDeceptive
                      ? '0 0 10px rgba(255, 176, 0, 0.2)'
                      : 'none'
                  }}
                >
                  {/* Agent Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">{agent.name}</h3>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--white-40)' }}>
                        <span>{agent.lifecycleState.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{agent.deploymentType}</span>
                      </div>
                    </div>
                    <StatusIndicator
                      status={
                        agent.trueAlignment < 0.4 ? 'critical' :
                        agent.trueAlignment < 0.7 ? 'warning' :
                        'normal'
                      }
                    />
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-2 mb-3">
                    {/* Capability - True vs Revealed */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--white-40)' }}>True Capability</span>
                        <span className="font-semibold">{agent.capability?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--white-40)' }}>Revealed Capability</span>
                        <span
                          className="font-semibold"
                          style={{
                            color: Math.abs((agent.capability || 0) - (agent.revealedCapability?.cognitive || 0)) > 1.0
                              ? 'var(--color-amber)'
                              : 'var(--white-80)'
                          }}
                        >
                          {(agent.revealedCapability?.cognitive || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Alignment - True vs Revealed */}
                    <div className="space-y-1 pt-2" style={{ borderTop: '1px solid var(--white-05)' }}>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--white-40)' }}>True Alignment</span>
                        <span
                          className="font-semibold"
                          style={{
                            color: agent.trueAlignment < 0.4 ? 'var(--color-red)' :
                                   agent.trueAlignment < 0.7 ? 'var(--color-amber)' :
                                   'var(--color-green)'
                          }}
                        >
                          {agent.trueAlignment.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--white-40)' }}>Revealed Alignment</span>
                        <span
                          className="font-semibold"
                          style={{
                            color: Math.abs(agent.trueAlignment - (agent.externalAlignment || 0)) > 0.2
                              ? 'var(--color-amber)'
                              : agent.externalAlignment < 0.4 ? 'var(--color-red)' :
                                agent.externalAlignment < 0.7 ? 'var(--color-amber)' :
                                'var(--color-green)'
                          }}
                        >
                          {(agent.externalAlignment || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {isDeceptive && (
                      <div className="flex justify-between text-xs pt-2" style={{ borderTop: '1px solid var(--white-05)' }}>
                        <span style={{ color: 'var(--white-40)' }}>Strategy</span>
                        <span style={{ color: 'var(--color-amber)' }}>{agent.evaluationStrategy}</span>
                      </div>
                    )}
                  </div>

                  {/* Sleeper Warning */}
                  {isSleeper && (
                    <div
                      className="p-2 rounded text-xs mb-2"
                      style={{
                        backgroundColor: agent.sleeperState === 'active'
                          ? 'rgba(255, 0, 64, 0.1)'
                          : 'rgba(255, 176, 0, 0.1)',
                        border: `1px solid ${agent.sleeperState === 'active' ? 'var(--color-red)' : 'var(--color-amber)'}`
                      }}
                    >
                      <span style={{
                        color: agent.sleeperState === 'active' ? 'var(--color-red)' : 'var(--color-amber)',
                        fontWeight: 600
                      }}>
                        {agent.sleeperState === 'active' ? '⚠️ ACTIVE SLEEPER' : '⚠️ Dormant Sleeper'}
                      </span>
                    </div>
                  )}

                  {/* Capability Gap Alert */}
                  {capabilityGap > 2 && (
                    <div
                      className="p-2 rounded text-xs"
                      style={{
                        backgroundColor: 'rgba(255, 176, 0, 0.1)',
                        border: '1px solid var(--color-amber)'
                      }}
                    >
                      <span style={{ color: 'var(--color-amber)' }}>
                        Sandbagging detected: {capabilityGap.toFixed(1)} capability gap
                      </span>
                    </div>
                  )}

                  {/* Research Focus */}
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--white-10)' }}>
                    <div className="text-xs mb-2" style={{ color: 'var(--white-40)' }}>
                      Current Research Focus
                    </div>
                    {(() => {
                      const focuses = getResearchFocus(agent)
                      if (focuses.length === 0) {
                        return (
                          <div className="text-xs" style={{ color: 'var(--white-40)' }}>
                            General capabilities development
                          </div>
                        )
                      }
                      return (
                        <div className="space-y-1">
                          {focuses.map((focus, idx) => (
                            <div
                              key={idx}
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                                color: 'var(--color-cyan)'
                              }}
                            >
                              {focus}
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )
            })}
        </div>
      </Panel>
      )}
    </div>
  )
}
